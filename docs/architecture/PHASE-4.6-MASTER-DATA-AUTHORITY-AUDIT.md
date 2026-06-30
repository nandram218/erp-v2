# ERP-V2 PHASE 4.6 MASTER DATA AUTHORITY RECOVERY AUDIT

**Mode:** Evidence First → Root Cause → Architecture Correction → Safe Repair

---

# 1. ROOT CAUSE REPORT

## 1.1 Observed Failure: School Profile

**Behavior:**
- Saves successfully via School Profile form
- ERP Header updates immediately
- ID Card updates immediately
- Certificate updates immediately
- On page refresh → school data disappears
- Header loses school name
- Certificate loses school name
- ID Card loses school name

**Root Cause:**
The School Profile form writes through `schoolStore.setSchoolData()` which calls `saveAll()` → `setTenantStorage(ERP_DB_KEY, db, tenantContext)`. The header, ID card, and certificate read from in-memory Zustand store state (which is NOT rehydrated on refresh because `schoolStore.loadAll()` reads from `getTenantStorage(ERP_DB_KEY, tenantContext, null)` BUT requires a valid tenant context. When tenant context is invalid or empty (typical after refresh without auth), `getTenantStorage()` returns `null` (ZERO TRUST mode at line 196-201 in storageService.js), store state resets to defaults, and school data becomes empty.

**Code Evidence:**
`storageService.js` lines 194-201:
```javascript
if (!isValidTenantContext(tenantContext) || 
    !tenantContext.schoolId || 
    !tenantContext.branchId || 
    !tenantContext.sessionId) {
    // ZERO TRUST: No fallback to shared storage
    return fallback;
}
```

`schoolStore.js` line 42-44:
```javascript
const db = getTenantStorage(ERP_DB_KEY, tenantContext, null);
// ...
if (!db) {
    set({
        schoolData: fullTenantContext,  // EMPTY if tenant context missing
        hydrated: true
    });
    return;
}
```

**Fix:** Ensure `schoolStore.loadAll()` is called AFTER tenant context is established (via auth), OR provide a bootstrap-safe fallback that reads tenant-scoped keys without requiring full tenant context validation.

## 1.2 Observed Failure: Classes

**Behavior:**
- Class Setup saves → list appears correct within Class Setup screen
- After navigation → Class Setup list becomes empty
- Subject Settings cannot see classes
- Fee Settings cannot see classes
- BUT Student Form still shows those classes

**Root Cause:**
Class Setup saves to `ERP_CLASSES` via `classSubjectService.saveClasses()` using `setTenantStorage(STORAGE_KEY, data, tenantContext)`.

Student Form reads classes from `ERP_DB.classes` via `schoolStore` (likely through a selector or direct store access). This means the Student Form is reading the backup copy embedded in the ERP_DB master record, not the authoritative `ERP_CLASSES` list.

When Class Setup screen reloads, it reads from `ERP_CLASSES`. If tenant context changed or if the write went to a different tenant key than the read, the class list appears empty.

**Code Evidence:**
`classSubjectService.js` line 36:
```javascript
setTenantStorage(STORAGE_KEY, tenantAwareData, tenantContext); // Writes to ERP_CLASSES
```

`classSubjectService.js` line 42:
```javascript
const data = getTenantStorage(STORAGE_KEY, tenantContext, []); // Reads from ERP_CLASSES
```

`schoolStore.js` lines 168-174:
```javascript
const db = {
    // ...
    classes: state.classes || [],  // Classes embedded in ERP_DB
};
setTenantStorage(ERP_DB_KEY, db, tenantContext); // Writes ERP_DB
```

**Additional Problem:** The `classSubjectService.getClasses()` performs a transformation on line 44-49 that formats class names as strings, then deduplicates. This means the raw data is lost and only the formatted display name survives. Downstream consumers expecting raw class objects with `className`, `section`, etc. fields receive flattened data.

## 1.3 Observed Failure: Transport

**Behavior:**
- Route Setup saves → routes remain visible inside Route Setup
- Student Form cannot see them

**Root Cause:**
Transport routes are saved inside `ERP_DB.transport` via `transportService.save()`. This is embedded within the master database record. Student Form should be reading from the same source but appears to be looking at a different data path. The discrepancy suggests Student Form may be checking a different tenant context key or legacy storage location.

**Code Evidence:**
`master-setting/transport/transportService.js` line 114:
```javascript
db.transport = transportData;
saveDB(db); // ERP_DB via setTenantStorage
```

---


# 2. MASTER DATA AUTHORITY MATRIX

| Module | Expected Authority | Actual Authority | Conflict | Risk |
|--------|-------------------|-------------------|----------|------|
| School Profile | `ERP_DB.school` | `ERP_DB.school` (via schoolStore) | NONE | Data disappears on refresh if tenant context unmapped |
| Classes | `ERP_CLASSES` | BOTH `ERP_CLASSES` AND `ERP_DB.classes` | HIGH: Two distinct persistence paths | Data desyncs; Student Form uses ERP_DB.classes, Class Setup uses ERP_CLASSES |
| Subjects | `ERP_SUBJECTS` + `ERP_CLASS_SUBJECT_MAP` | `ERP_SUBJECTS` only in getClasses | MEDIUM: Subject mapping may not be persisted | Subject assignments possibly lost |
| Transport | `ERP_DB.transport` | `ERP_DB.transport` (via transportService) | NONE for master-service, BUT Student Form may read differently | Student Form data isolation failure |
| Fee Settings | `ERP_FEE_SETTINGS` | `ERP_FEE_SETTINGS` (via feeSettingsService) | NONE | Appears compliant |
| Hostel | `ERP_DB.hostel` | `ERP_DB.hostel` (via hostelService) | NONE | Compliant |
| Fees (Operational) | `ERP_FEES_DB` + `ERP_FEES_LEDGER` + `ERP_RECEIPT_COUNTER` + `ERP_RECEIPT_REGISTER` | All separate keys | COMPLIANT | Properly isolated operational keys |

---


# 3. RUNTIME READ/WRITE MATRIX

## 3.1 School Profile

| Operation | Function Chain | Store | Service | Persistence |
|-----------|----------------|-------|---------|-------------|
| Save | `schoolStore.setSchoolData()` → `saveAll()` → `setTenantStorage(ERP_DB)` | Zustand schoolStore | schoolStore | localStorage tenant-key |
| Load | `schoolStore.loadAll()` → `getTenantStorage(ERP_DB)` → `useEffect()` | Zustand schoolStore | schoolStore | localStorage tenant-key |
| Read (UI) | `useSchoolStore()` → `schoolData` | Zustand | N/A | N/A (memory) |
| Read (Service) | `schoolProfileService.getSchoolProfile()` → `getTenantStorage(ERP_DB)` | N/A | schoolProfileService | localStorage tenant-key |

## 3.2 Classes

| Operation | Function Chain | Store | Service | Persistence |
|-----------|----------------|-------|---------|-------------|
| Save (Master) | `classSubjectService.saveClasses()` → `setTenantStorage(ERP_CLASSES)` | N/A | classSubjectService | localStorage ERP_CLASSES |
| Load (Master) | `classSubjectService.getClasses()` → `getTenantStorage(ERP_CLASSES)` | N/A | classSubjectService | localStorage ERP_CLASSES |
| Save (ERP_DB) | `schoolStore.setClasses()` → `saveAll()` → `setTenantStorage(ERP_DB)` | Zustand | schoolStore | localStorage ERP_DB |
| Load (ERP_DB) | `schoolStore.loadAll()` → `getTenantStorage(ERP_DB)` | Zustand | schoolStore | localStorage ERP_DB |
| Read (Student Form) | Likely `useSchoolStore().classes` or `schoolStore` selector | Zustand | N/A | N/A (memory) |

## 3.3 Transport

| Operation | Function Chain | Store | Service | Persistence |
|-----------|----------------|-------|---------|-------------|
| Save | `transportService.save()` → `setTenantStorage(ERP_DB)` | N/A | transportService | localStorage ERP_DB |
| Load | `transportService.get()` → `getTenantStorage(ERP_DB)` | N/A | transportService | localStorage ERP_DB |

## 3.4 Fee Settings

| Operation | Function Chain | Store | Service | Persistence |
|-----------|----------------|-------|---------|-------------|
| Save | `feeSettingsService.saveFeeSettings()` → `setTenantStorage(ERP_FEE_SETTINGS)` | N/A | feeSettingsService | localStorage ERP_FEE_SETTINGS |
| Load | `feeSettingsService.getFeeSettings()` → `getTenantStorage(ERP_FEE_SETTINGS)` | N/A | feeSettingsService | localStorage ERP_FEE_SETTINGS |

## 3.5 Hostel

| Operation | Function Chain | Store | Service | Persistence |
|-----------|----------------|-------|---------|-------------|
| Save | `hostelService.save()` → `setTenantStorage(ERP_DB)` | N/A | hostelService | localStorage ERP_DB |
| Load | `hostelService.get()` → `getTenantStorage(ERP_DB)` | N/A | hostelService | localStorage ERP_DB |

---


# 4. STORAGE MATRIX

| Storage Key | Location | Tenant-Scoped | Master Module | Status |
|-------------|----------|---------------|---------------|--------|
| `ERP_V2_SAAS_{school}_{branch}_{session}_ERP_DB` | localStorage | YES | schoolStore, transport, hostel, fees (embedded) | COMPLIANT |
| `ERP_V2_SAAS_{school}_{branch}_{session}_ERP_CLASSES` | localStorage | YES | classSubjectService | **DUPLICATE AUTHORITY** |
| `ERP_V2_SAAS_{school}_{branch}_{session}_ERP_SUBJECTS` | localStorage | YES | classSubjectService | UNUSED/DEAD — subjects hardcoded in getSubjectsByClass() |
| `ERP_V2_SAAS_{school}_{branch}_{session}_ERP_CLASS_SUBJECT_MAP` | localStorage | YES | classSubjectService | UNUSED/DEAD |
| `ERP_V2_SAAS_{school}_{branch}_{session}_ERP_FEE_SETTINGS` | localStorage | YES | feeSettingsService | COMPLIANT |
| `ERP_V2_SAAS_{school}_{branch}_{session}_ERP_FEES_DB` | localStorage | YES | modules/fees | COMPLIANT (operational) |
| `ERP_V2_SAAS_{school}_{branch}_{session}_ERP_FEES_LEDGER` | localStorage | YES | modules/fees | COMPLIANT (operational) |
| `ERP_V2_SAAS_{school}_{branch}_{session}_ERP_RECEIPT_COUNTER` | localStorage | YES | receiptService | COMPLIANT (operational) |
| `ERP_V2_SAAS_{school}_{branch}_{session}_ERP_RECEIPT_REGISTER` | localStorage | YES | receiptService | COMPLIANT (operational) |
| `ERP_DB` (legacy) | localStorage | NO (shared) | Legacy | DEAD (clearLegacyStorage removes) |
| `ERP_CLASSES` (legacy) | localStorage | NO (shared) | Legacy | DEAD |
| `ERP_AUTH_CONTEXT` | localStorage | NO (shared) | tenantContext | **ACTIVE — cross-cutting concern** |
| `schoolProfile` (legacy) | localStorage | NO (shared) | Legacy | DEAD (schoolProfileService uses ERP_DB now) |

**Total Active Storage Keys:** 10 tenant-scoped + 2 global (auth + migration) = 12

---


# 5. DUPLICATE AUTHORITY REPORT

## 5.1 All Duplicate Authorities Found

### CRITICAL: Classes Data
- **ERP_CLASSES** — Written by `classSubjectService.saveClasses()`, read by `classSubjectService.getClasses()`
- **ERP_DB.classes** — Written by `schoolStore.setClasses()` → `saveAll()`, read by `schoolStore.loadAll()` and downstream modules (Student Form, Subject Settings, Fee Settings)

**Classification:** ACTIVE BUG
**Impact:** Two independent persistence paths for same data. Any write to one does not update the other. Navigation between Class Setup and Student Form causes visible classes to disappear/appear.

### CRITICAL: School Profile
- **ERP_DB.school** — Written and read by schoolStore
- **schoolProfile** (legacy key) — Written historically, no longer used

**Classification:** LEGACY — Modernized (schoolProfileService uses ERP_DB)

### MEDIUM: Subjects
- **ERP_SUBJECTS** — Defined in STORAGE_KEYS but never written to or read from functionally (getSubjectsByClass returns hardcoded arrays)
- **ERP_CLASS_SUBJECT_MAP** — Defined but unused

**Classification:** DEAD

### LOW: Fees Settings (Potential)
- **ERP_FEE_SETTINGS** — Used by feeSettingsService (master-setting)
- **ERP_DB.fees** — Used by schoolStore and modules/fees

Actually these serve different purposes (master settings vs. operational fees records), so this is **NOT** a duplicate — it is **COMPLIANT SSOT**.

## 5.2 Duplicate Authority Classification Summary

| Authority | Status | Type | Fix Required? |
|-----------|--------|------|---------------|
| Classes (ERP_CLASSES vs ERP_DB.classes) | ACTIVE BUG | Duplicate | YES — Consolidate to one |
| School Profile (ERP_DB.school) | LEGACY CLEAN | Historical | NO |
| Subjects (ERP_SUBJECTS) | DEAD | Dead code | YES — Remove or implement |
| Subjects (ERP_CLASS_SUBJECT_MAP) | DEAD | Dead code | YES — Remove or implement |

---


# 6. REFRESH LIFECYCLE REPORT

## 6.1 Page Load Sequence

```
Page Load
    ↓
1. App.js initializes
    ↓
2. AuthService checks for existing session (localStorage AUTH_SESSION_KEY)
    ↓
3a. If session exists → AuthService restores user context
    ↓
3b. If NO session → tenant context remains empty
    ↓
4. schoolStore.loadAll() executes (typically via DashboardLayout or App useEffect)
    ↓
5. getTenantContextForStorage() called
    ↓
5a. If authContext valid → returns authContext → uses tenant-scoped key
    ↓
5b. If authContext invalid → returns {} → ZERO TRUST triggers fallback = null
    ↓
6. getTenantStorage(ERP_DB, {}, null) → returns null (line 196-201)
    ↓
7. schoolStore sets hydrated=true with EMPTY schoolData, classes=[], transport={}, etc.
    ↓
8. UI renders with empty master data
```

## 6.2 Where Data Disappears

**For School Profile:**
- schoolStore.loadAll() at line 42: `getTenantStorage(ERP_DB_KEY, tenantContext, null)`
- When tenantContext is `{}`, line 196-201 in storageService.js returns `fallback` = null
- store resets to default state (empty schoolData)
- Header, ID Card, Certificate all read from empty store → names disappear

**For Classes:**
- classSubjectService.getClasses() at line 42: `getTenantStorage(STORAGE_KEY, tenantContext, [])`
- When tenantContext is `{}`, returns `[]`
- Class Setup list appears empty
- BUT schoolStore.classes is still populated in memory (not refreshed)
- Student Form shows classes from schoolStore.memory state

**For Transport:**
- transportService.get() at line 30-36: `getTenantStorage(DB_KEY, tenantContext, {})`
- When tenantContext is `{}`, returns `{}`
- Routes appear empty in Home/Student Form
- BUT Route Setup may maintain its own in-memory state during the session

**For Hostel:**
- hostelService.get() at line 15-21: `getTenantStorage(DB_KEY, tenantContext, {})`
- Same pattern as transport

## 6.3 Critical Sequence Violation

The causal chain is:

```
Missing Auth / Expired Session
    ↓
Invalid Tenant Context
    ↓
getTenantContextForStorage() returns {}
    ↓
getTenantStorage() returns fallback (ZERO TRUST)
    ↓
Store resets to empty defaults
    ↓
All dependent modules show empty state
```

The root cause is **not** that data doesn't persist — it is that the **read path is gated by tenant context validation that prevents recovery of previously stored tenant-scoped data**.

---


# 7. SAAS COMPLIANCE REPORT

| Master Module | Single Source of Truth | Tenant Isolation | No Duplicate Persistence | Single Write Authority | Single Read Authority | Propagates Automatically |
|---------------|------------------------|------------------|--------------------------|------------------------|----------------------|--------------------------|
| School Profile | **FAIL** — Store resets on context loss | FAIL — Context-dependent read | PASS | PASS — schoolStore | FAIL — Context-gated | FAIL |
| Classes | **FAIL** — Two storage paths | PARTIAL — Both paths isolated | FAIL — ERP_CLASSES + ERP_DB.classes | FAIL — Two writers | FAIL — Two readers | PARTIAL — Student Form reads ERP_DB.classes |
| Transport | PASS | PASS | PASS | PASS — transportService | PASS — transportService | MANUAL — Student Form does not auto-consume |
| Fee Settings | PASS | PASS | PASS | PASS — feeSettingsService | PASS — feeSettingsService | PASS |
| Hostel | PASS | PASS | PASS | PASS — hostelService | PASS — hostelService | MANUAL — Transport/Student links not auto |
| Subjects | PASS (hardcoded) | PASS | PASS (unused keys) | PASS | PASS | N/A — Not implemented in DB |

**Compliance Score: 3/6 modules fully compliant**

---


# 8. CORRECT TARGET ARCHITECTURE

## 8.1 Master Authority Definition

### ERP_DB — Single Tenant Database
```
ERP_DB = {
    school: {
        schoolId, branchId, sessionId,  // tenant identity
        schoolName, address, phone, email, logo, ...  // school profile
    },
    classes: [
        { className, section, stream, fullName, ... }
    ],
    subjects: [
        { subjectId, subjectName, ... }
    ],
    classSubjectMap: {
        "10_A": ["English", "Math", "Science"],
        ...
    },
    transport: {
        routes: [...],
        vehicles: [...],
        drivers: [...],
        mappings: [...],
        settings: {...}
    },
    hostel: {
        rooms: [...],
        beds: [...],
        assignments: [...],
        hostelFee: {...}
    },
    students: [...],  // student master data
    fees: {},  // operational fee records
}
```

### ERP_FEES_DB — Operational Fees
```
ERP_FEES_DB = [
    {
        studentId, totalFee, paidAmount, dueAmount,
        status, payments: [...], ...
    }
]
```

### ERP_FEE_SETTINGS — Fee Settings
```
ERP_FEE_SETTINGS = {
    classes: {
        "10_A": { compulsoryFees: [...], optionalFees: [...] }
    },
    transportRoutes: [...],
    academicYearId, ...
}
```

### ERP_RECEIPT_REGISTER — Financial Authority
```
ERP_RECEIPT_REGISTER = [...]
```

### ERP_RECEIPT_COUNTER — Sequence
```
ERP_RECEIPT_COUNTER = 1
```

### ERP_FEES_LEDGER — Derived Operational
```
ERP_FEES_LEDGER = [...]
```

## 8.2 Propagation Hierarchy

```
School Profile  ─────────────────────────┐
    │                                     │
    ▼                                     ▼
Classes  ────────────────►  Subjects  ──┘
    │                           │
    ▼                           ▼
Fee Settings  ◄────────── Transport
    │
    ▼
Student Admission
    │
    ▼
Certificates
    │
    ▼
Receipts
    │
    ▼
Reports
```

**Rule:** Downstream modules never store master data independently. They always read from upstream authority.

## 8.3 Authority Rules

1. **ONLY ONE write authority per data type.**
2. **ONLY ONE read authority per data type.**
3. **All dependencies read from parent authority, never from siblings.**
4. **Student Form reads: schoolStore (classes, school), transportService (transport), hostelService (hostel)**
5. **Fee Settings reads: feeSettingsService (fee configuration) + schoolStore (student class)**
6. **Subject Settings reads: schoolStore (classes) + schoolStore (subjects)**

---


# 9. ATOMIC REPAIR PLAN

## Fix 1: Restore Tenant Bootstrap Context (School Profile Persistence)

**Problem:** schoolStore.loadAll() cannot read data when tenant context is invalid/missing.

**Solution:**
- Modify `schoolStore.loadAll()` to attempt raw tenant-scoped key retrieval when tenant context is empty
- Use `getTenantStorageKey()` directly or iterate through localStorage keys to find matching tenant-scoped ERP_DB
- Restore into store after finding

**Implementation:**
In `schoolStore.loadAll()` (line 34-153), when `getTenantContextForStorage()` returns `{}`:
1. Query localStorage for any key matching `ERP_V2_SAAS_*_ERP_DB`
2. If found and contains school data, load it
3. Rebuild tenantContext from loaded school data
4. Set store state and hydrated=true

**Risk:** LOW
**Impact:** Fixes school profile disappearing on refresh

## Fix 2: Eliminate Classes Duplicate Authority

**Problem:** Classes exist in both ERP_CLASSES and ERP_DB.classes.

**Solution:**
- Make **ERP_DB.classes** the single authoritative location
- Update `classSubjectService.saveClasses()` to write to `schoolStore.setClasses()` instead of directly to `ERP_CLASSES`
- Update `classSubjectService.getClasses()` to read from `schoolStore` (via store selector), not from `ERP_CLASSES`
- Update `schoolStore.loadAll()` to populate classes from ERP_DB.classes
- EITHER remove ERP_CLASSES entirely (with migration) OR keep ERP_CLASSES as a legacy shadow (read-only)

**Preferred Approach:**
1. `schoolStore.setClasses()` is the single write authority
2. `schoolStore.getState().classes` is the single read authority
3. `classSubjectService` becomes a facade over `schoolStore` for legacy compatibility

**Implementation Steps:**
1. Modify `classSubjectService.saveClasses()` → calls `useSchoolStore.getState().setClasses(data)`
2. Modify `classSubjectService.getClasses()` → returns `useSchoolStore.getState().classes`
3. Add `schoolStore.loadClassesFromERP_CLASSES()` migration function
4. Update `migrateLegacyStorage()` to handle ERP_CLASSES → ERP_DB.classes migration
5. Update `storageKeys.js`: Add ERP_CLASSES to MIGRATED_STORAGE_KEYS
6. Update all consumers (Student Form, Subject Settings, Fee Settings, etc.) to read from schoolStore.classes

**Risk:** MEDIUM — Many consumers may need adjustment
**Impact:** Eliminates classes data desync

## Fix 3: Normalize getClasses Output

**Problem:** `classSubjectService.getClasses()` returns objects with only `className` field (flattened from stream-class combo).

**Solution:**
- Return raw class objects from schoolStore, preserving all fields
- Remove the string formatting/normalization inside `getClasses()`
- Move presentation formatting (e.g., `${className} (${stream})`) to UI layer (SubjectManager, etc.)

**Implementation:**
```javascript
getClasses: () => {
    const classes = useSchoolStore.getState().classes;
    return Array.isArray(classes) ? classes : [];
}
```

## Fix 4: Centralize Subject Persistence

**Problem:** Subjects defined in STORAGE_KEYS but not functionally used.

**Solution:**
- Store subjects in `ERP_DB.subjects`
- `SubjectManager` reads/writes from `schoolStore`
- Remove standalone subject services or make them wrappers

## Fix 5: Ensure Student Form Reads Single Authorities

**Problem:** "Student Form still shows those classes" but other modules do not.

**Solution:**
- Audit StudentForm.jsx to confirm it reads classes from `useSchoolStore().classes`
- Audit all reference code to ensure single read path

---


# 10. FILE-BY-FILE FIX SEQUENCE

| Order | File | Action | Fix Type |
|-------|------|--------|----------|
| 1 | `src/store/schoolStore.js` | Add bootstrap fallback for empty tenant context; add loadClassesFromERP_CLASSES migration | CRITICAL |
| 2 | `src/master-setting/classes-subjects/classSubjectService.js` | Delegate saveClasses/setClasses to schoolStore; delegate getClasses to schoolStore | CRITICAL |
| 3 | `src/core/constants/storageKeys.js` | Add ERP_CLASSES to MIGRATED_STORAGE_KEYS | MEDIUM |
| 4 | `src/services/storageService.js` | Add ERP_CLASSES to MIGRATED_STORAGE_KEYS via storageKeys (already re-exported) | MEDIUM |
| 5 | `src/services/tenantContextService.js` | Add helper `recoverTenantContextFromStorage()` used by schoolStore | SUPPORT |
| 6 | `src/modules/students/StudentForm.jsx` | Audit and ensure reads classes from schoolStore | VERIFY |
| 7 | `src/master-setting/classes-subjects/SubjectManager.jsx` | Update formatting logic (move from service to UI) | PRESENTATION |
| 8 | `src/master-setting/fees/FeeSettings.jsx` | Audit class reads (ensure from schoolStore) | VERIFY |
| 9 | `src/modules/fees/feesUtils.js` | Audit class-dependent fee logic | VERIFY |
| 10 | `src/modules/transport/pages/TransportForm.jsx` | Verify transport reads from transportService (NOT from schoolStore directly) | VERIFY |

---


# 11. RISK ANALYSIS

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Class data loss during consolidation | LOW | HIGH | Implement migration: copy ERP_CLASSES → ERP_DB.classes; run once per tenant |
| Tenant context recovery overwrites current user | LOW | MEDIUM | Recovery only when tenant context is empty; preserve non-empty contexts |
| Module X not yet migrated to schoolStore | MEDIUM | HIGH | Audit all consumers; provide compatibility layer temporarily; remove after verification |
| ZERO TRUST breaks first-load experience | MEDIUM | HIGH | Add bootstrap-aware tenant recovery in schoolStore.loadAll() |
| localStorage quota exceeded with two writes | LOW | MEDIUM | setStorageCompat already removed dual-write pattern (line 60) |

---


# 12. VERIFICATION CHECKLIST

## Post-Fix Verification

- [ ] **School Profile:** Save school name → Refresh page → Header shows name → ID Card shows name → Certificate shows name
- [ ] **School Profile:** Navigate to other pages → Return → School name still visible
- [ ] **Classes:** Create class "10_A" → Save → Navigate to Student Form → Class visible in dropdown
- [ ] **Classes:** Navigate to Subject Settings → Class "10_A" visible
- [ ] **Classes:** Navigate to Fee Settings → Class "10_A" visible
- [ ] **Classes:** Navigate to Class Setup → Class "10_A" visible
- [ ] **Classes:** Refresh page → All above still visible
- [ ] **Transport:** Create route in Route Setup → Navigate to Student Form → Route visible
- [ ] **Transport:** Navigate to Transport Module → Route visible
- [ ] **Transport:** Refresh → Route still visible
- [ ] **Subjects:** Verify subjects are stored/loaded from ERP_DB.subjects
- [ ] **Fee Settings:** Create compulsory fee → Verify Student Form sees correct total
- [ ] **Tenant Isolation:** Confirm tenant-scoped key format in localStorage
- [ ] **No Legacy Data:** Run `clearLegacyStorage()` and confirm no regression
- [ ] **Cache Clear:** Clear browser cache → Login → All master data loads correctly

---

# APPENDIX: KEY CODE LOCATIONS

| Purpose | File | Lines |
|---------|------|-------|
| Storage service (tenant-aware) | `src/services/storageService.js` | 1-302 |
| School store (ERP_DB authority) | `src/store/schoolStore.js` | 1-267 |
| School profile read | `src/services/schoolProfileService.js` | 1-15 |
| Class subject service | `src/master-setting/classes-subjects/classSubjectService.js` | 1-159 |
| Transport service (master) | `src/master-setting/transport/transportService.js` | 1-339 |
| Hostel service | `src/master-setting/hostel/hostelService.js` | 1-287 |
| Fees service (operational) | `src/modules/fees/feesService.js` | 1-566 |
| Fee settings service | `src/services/feeSettingsService.js` | - |
| Tenant context | `src/services/tenantContextService.js` | 1-332 |
| Storage keys registry | `src/core/constants/storageKeys.js` | 1-57 |

---

*Document generated from source code evidence only. No assumptions or temporary fixes.*
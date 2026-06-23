# ERP_DB SINGLE AUTHORITY PLAN

**Phase:** PHASE-3D PACKAGE-04 STEP-4D  
**Date:** 2026-06-23  
**Branch:** saas-mainline  
**Tag:** phase-3.2e-pre-db-consolidation  
**Commit:** c509863  
**Status:** MIGRATION BLUEPRINT COMPLETE

---

## OBJECTIVE

Create a comprehensive migration blueprint to establish single authority for ERP_DB by removing bypassing writers, moving writes to schoolStore, implementing tenant-scoped persistence, deleting deprecated services, and enforcing authority.

---

## CURRENT STATE

### Authority Status

**Intended Authority:** schoolStore (Zustand store)  
**Actual Authority:** FRAGMENTED (5 writers, 4 bypassing)  
**Risk Level:** CRITICAL  
**Production Ready:** NO

### Writers to ERP_DB

| # | File | Function | Line | Tenant Aware | Authority Bypass | Status |
|---|------|----------|------|--------------|------------------|--------|
| 1 | schoolStore.js | saveAll() | 124 | YES | NO | ✅ INTENDED |
| 2 | schoolProfileService.js | saveSchoolProfile() | 18 | NO | YES | ❌ BYPASSING |
| 3 | master-setting/transport/transportService.js | saveDB() | 43 | NO | YES | ❌ BYPASSING |
| 4 | master-setting/hostel/hostelService.js | saveDB() | 23 | NO | YES | ❌ BYPASSING |
| 5 | modules/transport/services/transportService.js | saveDB() | 32 | YES | YES | ⚠️ BYPASSING |
| 6 | master-setting/fees/feesService.js | saveDB() | 40 | NO | YES | ❌ DEPRECATED |

### Critical Issues

1. **Multiple Bypassing Writers** - 4 services bypass schoolStore
2. **Duplicate Transport Services** - Two services writing to same section
3. **No Tenant Isolation** - All tenants share same storage keys
4. **Deprecated Service Active** - master-setting/fees still writing
5. **Data Consistency Risk** - Race conditions from multiple writers

---

## MIGRATION BLUEPRINT

### PHASE-1: Remove Bypass Writers

**Objective:** Eliminate all direct ERP_DB writes bypassing schoolStore

#### Phase-1A: Remove Deprecated Fees Service

**File:** `src/master-setting/fees/feesService.js`  
**Action:** DELETE ENTIRE FILE  
**Reason:** Deprecated, still bypassing authority

**Steps:**
1. Search for all imports of master-setting/fees/feesService.js
2. Replace with modules/fees/feesService.js imports
3. Update function calls to match new API
4. Delete master-setting/fees/feesService.js
5. Remove from serviceRegistry

**Evidence:**
```javascript
// File: src/master-setting/fees/feesService.js
// Line 22-40
const DB_KEY = STORAGE_KEYS.ERP_DB;

/**
 * @deprecated Use src/modules/fees/feesService.js instead
 */
saveDB: (db) => {
    setStorageCompat(DB_KEY, db);
},
```

**Risk:** LOW - Service already deprecated

**Testing:** Verify all fees operations use modules/fees/feesService.js

---

#### Phase-1B: Deprecate master-setting/transport

**File:** `src/master-setting/transport/transportService.js`  
**Action:** MARK AS DEPRECATED  
**Reason:** Duplicate of modules/transport, no tenant context

**Steps:**
1. Add deprecation warning to service
2. Mark as deprecated in serviceRegistry
3. Document migration path
4. Update callers to use modules/transport (Phase-2)

**Code Changes:**
```javascript
// src/master-setting/transport/transportService.js
// Add at top of file
/**
 * @deprecated Use src/modules/transport/services/transportService.js instead
 * This service will be removed in Phase-1D
 */
```

**Service Registry Update:**
```javascript
// src/core/serviceRegistry.js
// Line 196-199
registerService("masterTransport", masterTransportService.transportService, { 
    description: "Master transport service",
    deprecated: true,
    replacement: "transport"
});
```

**Risk:** MEDIUM - Callers need migration

**Testing:** Verify deprecation warning appears

---

#### Phase-1C: Add Deprecation Warning to master-setting/hostel

**File:** `src/master-setting/hostel/hostelService.js`  
**Action:** ADD DEPRECATION WARNING  
**Reason:** Bypassing authority, will be migrated to schoolStore

**Code Changes:**
```javascript
// src/master-setting/hostel/hostelService.js
// Add at top of file
/**
 * @deprecated This service bypasses schoolStore authority
 * Will be migrated to schoolStore in Phase-2B
 */
```

**Risk:** LOW - Warning only, no functional change

**Testing:** Verify deprecation warning appears

---

#### Phase-1D: Delete master-setting/transport

**File:** `src/master-setting/transport/transportService.js`  
**Action:** DELETE ENTIRE FILE  
**Prerequisite:** Phase-1B complete, callers migrated (Phase-2A)

**Steps:**
1. Verify all callers migrated to modules/transport
2. Remove from serviceRegistry
3. Delete master-setting/transport/transportService.js
4. Delete master-setting/transport UI components (or update)

**Risk:** MEDIUM - Dependent on Phase-2A completion

**Testing:** Verify no imports of deleted service

---

### PHASE-2: Move Writes to schoolStore

**Objective:** Route all ERP_DB writes through schoolStore authority

#### Phase-2A: Migrate Transport Callers

**Files:**
- `src/master-setting/transport/TransportSettings.jsx`
- `src/master-setting/transport/TransportRoutes.jsx`

**Action:** Update to use modules/transport service

**Steps:**
1. Change service from `masterTransport` to `transport`
2. Update API calls to match modules/transport API
3. Test transport functionality
4. Verify data integrity

**Code Changes:**
```javascript
// master-setting/transport/TransportSettings.jsx
// Line 5
// FROM:
const transportService = getService("masterTransport");
// TO:
const transportService = getService("transport");

// Update all API calls to match modules/transport API
// Example: transportService.get() → transportService.getTransportRoutes()
```

**Risk:** MEDIUM - API changes required

**Testing:** Verify all transport operations work

---

#### Phase-2B: Migrate schoolProfileService to schoolStore

**File:** `src/services/schoolProfileService.js`  
**Action:** Update to use schoolStore instead of direct ERP_DB write

**Current Code:**
```javascript
// src/services/schoolProfileService.js
// Lines 15-19
export const saveSchoolProfile = (payload) => {
    const db = getStorageCompat(KEY, {});
    db.school = payload;
    setStorageCompat(KEY, db);
    return payload;
};
```

**New Code:**
```javascript
// src/services/schoolProfileService.js
import { useSchoolStore } from "../store/schoolStore";

export const saveSchoolProfile = (payload) => {
    const { setSchoolData } = useSchoolStore.getState();
    setSchoolData(payload);
    return payload;
};
```

**Risk:** LOW - Simple API change

**Testing:** Verify school profile saves correctly

---

#### Phase-2C: Migrate master-setting/hostel to schoolStore

**File:** `src/master-setting/hostel/hostelService.js`  
**Action:** Update to use schoolStore instead of direct ERP_DB write

**Current Code:**
```javascript
// src/master-setting/hostel/hostelService.js
// Lines 22-24
const saveDB = (db) => {
    setStorageCompat(DB_KEY, db);
};
```

**New Code:**
```javascript
// src/master-setting/hostel/hostelService.js
import { useSchoolStore } from "../../store/schoolStore";

const saveHostel = (hostelData) => {
    const { setHostel } = useSchoolStore.getState();
    setHostel(hostelData);
};
```

**Update all callers:**
- `save()` → `saveHostel()`
- `reset()` → use schoolStore reset
- All CRUD operations → use schoolStore

**Risk:** MEDIUM - Multiple function changes

**Testing:** Verify all hostel operations work

---

#### Phase-2D: Migrate modules/transport to schoolStore

**File:** `src/modules/transport/services/transportService.js`  
**Action:** Update to use schoolStore instead of direct ERP_DB write

**Current Code:**
```javascript
// src/modules/transport/services/transportService.js
// Lines 31-33
const saveDB = (db) => {
    setStorageCompat(DB_KEY, db);
};
```

**New Code:**
```javascript
// src/modules/transport/services/transportService.js
import { useSchoolStore } from "../../../store/schoolStore";

const saveTransportDB = (transport) => {
    const { setTransport } = useSchoolStore.getState();
    setTransport(transport);
};
```

**Update all callers:**
- `saveTransportDB()` → `setTransport()`
- Remove `saveDB()` function
- Remove `getDB()` function

**Risk:** MEDIUM - Core transport service changes

**Testing:** Verify all transport operations work

---

### PHASE-3: Tenant-Scoped Persistence

**Objective:** Implement tenant-level storage isolation

#### Phase-3A: Update storageService for Tenant-Scoped Keys

**File:** `src/services/storageService.js`  
**Action:** Implement tenant-scoped storage keys

**Current Code:**
```javascript
// src/services/storageService.js
// Line 15
const getPrefixedKey = (key) => `${STORAGE_PREFIX}_${key}`;
```

**New Code:**
```javascript
// src/services/storageService.js
import { getTenantKeySuffix, isTenantContextValid } from "./tenantContextService";

const getPrefixedKey = (key) => {
    const tenantSuffix = getTenantKeySuffix();
    if (!tenantSuffix) {
        throw new Error("[TENANT BLOCK] Invalid tenant context for storage operation");
    }
    return `${STORAGE_PREFIX}_${tenantSuffix}_${key}`;
};
```

**Risk:** CRITICAL - Core storage change

**Testing:** Verify all storage operations work with tenant context

---

#### Phase-3B: Isolate Auth Context

**File:** `src/services/tenantContextService.js`  
**Action:** Make auth context tenant-scoped

**Current Code:**
```javascript
// src/services/tenantContextService.js
// Line 10
const AUTH_CONTEXT_KEY = "ERP_AUTH_CONTEXT";
```

**New Code:**
```javascript
// src/services/tenantContextService.js
const getAuthContextKey = () => {
    const tenantSuffix = getTenantKeySuffix();
    if (!tenantSuffix) {
        throw new Error("[TENANT BLOCK] Invalid tenant context for auth context");
    }
    return `ERP_AUTH_CONTEXT_${tenantSuffix}`;
};

// Update all AUTH_CONTEXT_KEY usage to use getAuthContextKey()
```

**Update functions:**
- `setAuthContext()` → use `getAuthContextKey()`
- `getAuthContext()` → use `getAuthContextKey()`
- `clearAuthContext()` → use `getAuthContextKey()`

**Risk:** CRITICAL - Auth context change

**Testing:** Verify auth context isolation

---

#### Phase-3C: Add Write-Time Tenant Validation

**File:** `src/services/storageService.js`  
**Action:** Validate tenant context on all writes

**New Code:**
```javascript
// src/services/storageService.js
export const setStorage = (key, value) => {
    if (!isTenantContextValid()) {
        throw new Error("[TENANT BLOCK] Invalid tenant context for write operation");
    }
    try {
        localStorage.setItem(
            getPrefixedKey(key),
            JSON.stringify(value)
        );
    } catch (error) {
        console.error("Storage Set Error:", key, error);
    }
};
```

**Risk:** HIGH - Write validation change

**Testing:** Verify writes blocked without tenant context

---

#### Phase-3D: Migrate Existing Data to Tenant-Scoped Keys

**File:** `src/services/storageService.js`  
**Action:** Create migration utility

**New Code:**
```javascript
// src/services/storageService.js
export const migrateToTenantScopedStorage = () => {
    const tenantSuffix = getTenantKeySuffix();
    if (!tenantSuffix) {
        throw new Error("[TENANT BLOCK] Invalid tenant context for migration");
    }

    // Get all existing keys
    const allKeys = Object.keys(localStorage);
    const legacyKeys = allKeys.filter(key => 
        key.startsWith(STORAGE_PREFIX) && 
        !key.includes(tenantSuffix)
    );

    // Migrate each key
    legacyKeys.forEach(legacyKey => {
        const baseKey = legacyKey.replace(`${STORAGE_PREFIX}_`, "");
        const newKey = getPrefixedKey(baseKey);
        
        const data = localStorage.getItem(legacyKey);
        if (data) {
            localStorage.setItem(newKey, data);
            localStorage.removeItem(legacyKey);
        }
    });

    console.log(`[StorageService] Migrated ${legacyKeys.length} keys to tenant-scoped storage`);
};
```

**Risk:** CRITICAL - Data migration

**Testing:** Verify data integrity after migration

---

### PHASE-4: Delete Deprecated Services

**Objective:** Remove all deprecated services

#### Phase-4A: Delete master-setting/fees

**File:** `src/master-setting/fees/feesService.js`  
**Action:** DELETE ENTIRE FILE  
**Prerequisite:** Phase-1A complete

**Steps:**
1. Verify no imports
2. Remove from serviceRegistry
3. Delete file

**Risk:** LOW - Already deprecated

**Testing:** Verify no broken imports

---

#### Phase-4B: Delete master-setting/transport

**File:** `src/master-setting/transport/transportService.js`  
**Action:** DELETE ENTIRE FILE  
**Prerequisite:** Phase-1D complete, Phase-2A complete

**Steps:**
1. Verify no imports
2. Remove from serviceRegistry
3. Delete file
4. Delete UI components (or update to use modules/transport)

**Risk:** MEDIUM - Dependent on caller migration

**Testing:** Verify no broken imports

---

#### Phase-4C: Delete master-setting/hostel

**File:** `src/master-setting/hostel/hostelService.js`  
**Action:** DELETE ENTIRE FILE  
**Prerequisite:** Phase-2C complete

**Steps:**
1. Verify no imports
2. Remove from serviceRegistry
3. Delete file
4. Update UI to use schoolStore directly

**Risk:** MEDIUM - Dependent on caller migration

**Testing:** Verify no broken imports

---

### PHASE-5: Authority Enforcement

**Objective:** Enforce schoolStore as single authority

#### Phase-5A: Add Write Validation in schoolStore

**File:** `src/store/schoolStore.js`  
**Action:** Add validation to detect bypassing writes

**New Code:**
```javascript
// src/store/schoolStore.js
const validateSingleAuthority = () => {
    const db = getStorageCompat(ERP_DB_KEY, null);
    const state = get();
    
    // Check if ERP_DB was modified outside schoolStore
    if (db && db.students !== state.students) {
        console.warn("[schoolStore] ERP_DB.students modified outside schoolStore");
    }
    if (db && db.transport !== state.transport) {
        console.warn("[schoolStore] ERP_DB.transport modified outside schoolStore");
    }
    if (db && db.hostel !== state.hostel) {
        console.warn("[schoolStore] ERP_DB.hostel modified outside schoolStore");
    }
};

// Add to loadAll()
loadAll: () => {
    migrateLegacyStorage();
    validateSingleAuthority();
    // ... rest of loadAll
}
```

**Risk:** LOW - Validation only

**Testing:** Verify bypassing writes detected

---

#### Phase-5B: Add Authority Enforcement in serviceRegistry

**File:** `src/core/serviceRegistry.js`  
**Action:** Block direct ERP_DB access

**New Code:**
```javascript
// src/core/serviceRegistry.js
const FORBIDDEN_KEYS = ["ERP_DB", "ERP_DB_KEY"];

export const validateStorageAccess = (key) => {
    if (FORBIDDEN_KEYS.includes(key)) {
        throw new Error("[AUTHORITY BLOCK] Direct ERP_DB access forbidden. Use schoolStore instead.");
    }
};

// Wrap setStorageCompat to validate
const originalSetStorageCompat = setStorageCompat;
export const setStorageCompat = (key, value) => {
    validateStorageAccess(key);
    return originalSetStorageCompat(key, value);
};
```

**Risk:** HIGH - Enforcement change

**Testing:** Verify direct ERP_DB access blocked

---

#### Phase-5C: Add Audit Logging

**File:** `src/store/schoolStore.js`  
**Action:** Log all ERP_DB writes

**New Code:**
```javascript
// src/store/schoolStore.js
saveAll: () => {
    const state = get();
    
    console.log("[schoolStore] ERP_DB write initiated", {
        timestamp: new Date().toISOString(),
        writer: "schoolStore",
        sections: Object.keys(state)
    });
    
    // ... rest of saveAll
    
    setStorageCompat(ERP_DB_KEY, db);
    
    console.log("[schoolStore] ERP_DB write completed");
}
```

**Risk:** LOW - Logging only

**Testing:** Verify audit logging works

---

## MIGRATION SEQUENCE

### Recommended Order

1. **Phase-1A** - Remove deprecated fees service (LOW risk)
2. **Phase-1B** - Deprecate master-setting/transport (MEDIUM risk)
3. **Phase-2A** - Migrate transport callers (MEDIUM risk)
4. **Phase-1D** - Delete master-setting/transport (MEDIUM risk)
5. **Phase-2B** - Migrate schoolProfileService (LOW risk)
6. **Phase-2C** - Migrate master-setting/hostel (MEDIUM risk)
7. **Phase-2D** - Migrate modules/transport (MEDIUM risk)
8. **Phase-4C** - Delete master-setting/hostel (MEDIUM risk)
9. **Phase-3A** - Update storageService for tenant-scoped keys (CRITICAL risk)
10. **Phase-3B** - Isolate auth context (CRITICAL risk)
11. **Phase-3C** - Add write-time tenant validation (HIGH risk)
12. **Phase-3D** - Migrate existing data (CRITICAL risk)
13. **Phase-5A** - Add write validation (LOW risk)
14. **Phase-5B** - Add authority enforcement (HIGH risk)
15. **Phase-5C** - Add audit logging (LOW risk)

### Rollback Plan

**If Phase-3 fails:**
1. Revert storageService changes
2. Revert tenantContextService changes
3. Restore from backup before Phase-3

**If Phase-2 fails:**
1. Revert service changes
2. Restore bypassing writers
3. Continue with Phase-3 (tenant isolation still needed)

---

## TESTING PLAN

### Unit Tests

1. **schoolStore Authority Test**
   - Verify all writes go through schoolStore
   - Verify bypassing writes detected

2. **Tenant Isolation Test**
   - Verify tenant-scoped keys
   - Verify no cross-tenant data access

3. **Service Migration Test**
   - Verify migrated services work correctly
   - Verify no broken imports

### Integration Tests

1. **Multi-Tenant Test**
   - Create two tenants
   - Verify data isolation
   - Verify no data leakage

2. **Data Migration Test**
   - Migrate existing data
   - Verify data integrity
   - Verify no data loss

### Security Tests

1. **Data Leakage Test**
   - Verify Tenant A cannot read Tenant B data
   - Verify Tenant A cannot write to Tenant B data

2. **Auth Context Test**
   - Verify auth context isolation
   - Verify no context poisoning

---

## RISK MITIGATION

### Pre-Migration

1. **Backup Data**
   - Export all ERP_DB data
   - Create localStorage backup
   - Document current state

2. **Create Rollback Branch**
   - Create git branch before migration
   - Tag rollback point
   - Document rollback procedure

### During Migration

1. **Phase-by-Phase Testing**
   - Test each phase before proceeding
   - Verify no regressions
   - Document issues

2. **Monitoring**
   - Monitor for errors
   - Monitor for data loss
   - Monitor for performance issues

### Post-Migration

1. **Validation**
   - Verify all functionality works
   - Verify data integrity
   - Verify tenant isolation

2. **Performance Testing**
   - Verify no performance degradation
   - Verify storage operations efficient

---

## SUCCESS CRITERIA

### Authority Criteria

- ✅ Single authority (schoolStore) for ERP_DB
- ✅ No bypassing writers
- ✅ All writes go through schoolStore
- ✅ Authority validation enforced

### Tenant Isolation Criteria

- ✅ Tenant-scoped storage keys
- ✅ Tenant-scoped auth context
- ✅ No cross-tenant data access
- ✅ No data leakage

### Service Criteria

- ✅ No deprecated services
- ✅ No duplicate services
- ✅ All services tenant-aware
- ✅ All services use schoolStore

### Data Criteria

- ✅ No data loss
- ✅ No data corruption
- ✅ Data integrity verified
- ✅ Migration successful

---

## ESTIMATED EFFORT

### Phase-1: Remove Bypass Writers
- **Effort:** 2-3 days
- **Risk:** LOW-MEDIUM
- **Dependencies:** None

### Phase-2: Move Writes to schoolStore
- **Effort:** 3-4 days
- **Risk:** MEDIUM
- **Dependencies:** Phase-1

### Phase-3: Tenant-Scoped Persistence
- **Effort:** 4-5 days
- **Risk:** CRITICAL
- **Dependencies:** Phase-2

### Phase-4: Delete Deprecated Services
- **Effort:** 1-2 days
- **Risk:** LOW-MEDIUM
- **Dependencies:** Phase-2

### Phase-5: Authority Enforcement
- **Effort:** 2-3 days
- **Risk:** HIGH
- **Dependencies:** Phase-3

**Total Estimated Effort:** 12-17 days

---

## DELIVERABLES

### Documentation

1. ✅ ERP_DB_WRITER_MAP.md
2. ✅ TRANSPORT_CONSOLIDATION_MAP.md
3. ✅ TENANT_ISOLATION_AUDIT.md
4. ✅ ERP_DB_SINGLE_AUTHORITY_PLAN.md (this document)

### Code Changes

1. Phase-1: Remove bypass writers
2. Phase-2: Move writes to schoolStore
3. Phase-3: Tenant-scoped persistence
4. Phase-4: Delete deprecated services
5. Phase-5: Authority enforcement

### Tests

1. Unit tests for authority
2. Unit tests for tenant isolation
3. Integration tests for multi-tenant
4. Security tests for data leakage

---

## CONCLUSION

### Current State

**Authority:** FRAGMENTED (5 writers, 4 bypassing)  
**Tenant Isolation:** NONE (CRITICAL)  
**Production Ready:** NO  

### Target State

**Authority:** SINGLE (schoolStore only)  
**Tenant Isolation:** FULL (tenant-scoped keys)  
**Production Ready:** YES  

### Recommendation

**DO NOT PROCEED TO PRODUCTION** until migration complete

**Required Actions:**
1. Execute Phase-1 (Remove bypass writers)
2. Execute Phase-2 (Move writes to schoolStore)
3. Execute Phase-3 (Tenant-scoped persistence)
4. Execute Phase-4 (Delete deprecated services)
5. Execute Phase-5 (Authority enforcement)
6. Complete all testing
7. Verify success criteria met

### Next Steps

1. **Review** this migration blueprint
2. **Approve** migration plan
3. **Create** rollback branch
4. **Backup** all data
5. **Execute** Phase-1
6. **Test** Phase-1
7. **Proceed** to Phase-2
8. **Continue** through all phases
9. **Validate** final state
10. **Deploy** to production

---

**STEP-4D COMPLETE**

**Status:** Migration blueprint complete  
**Phases Defined:** 5  
**Estimated Effort:** 12-17 days  
**Risk Level:** CRITICAL (Phase-3)  
**Recommendation:** Execute migration before production

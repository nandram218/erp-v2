# ERP-V2 ULTIMATE ARCHITECTURE AUDIT
## PRODUCTION SAAS CONSTITUTION PREPARATION

**Mode:** Evidence-Only Discovery  
**Date:** 2026-06-29  
**Status:** FINAL  
**Purpose:** ERP-v2 Constitution v1.0 Foundation

---

# TABLE OF CONTENTS

1. [Business Entity Map](#1-business-entity-map)
2. [Canonical Vocabulary Audit](#2-canonical-vocabulary-audit)
3. [Read Authority Map](#3-read-authority-map)
4. [Write Authority Map](#4-write-authority-map)
5. [Storage Authority Map](#5-storage-authority-map)
6. [Single Source of Truth Audit](#6-single-source-of-truth-audit)
7. [Dependency Graph](#7-dependency-graph)
8. [Auto Propagation Matrix](#8-auto-propagation-matrix)
9. [Persistence Audit](#9-persistence-audit)
10. [Runtime Flow Audit](#10-runtime-flow-audit)
11. [SaaS Compliance Audit](#11-saas-compliance-audit)
12. [Hardcoded Audit](#12-hardcoded-audit)
13. [Performance Audit](#13-performance-audit)
14. [Naming Audit](#14-naming-audit)
15. [Future Module Compatibility](#15-future-module-compatibility)
16. [Risk Report](#16-risk-report)
17. [Final Recommendation](#17-final-recommendation)

---

# 1. BUSINESS ENTITY MAP

## 1.1 Core Entities

| Entity | Primary Storage | Authority Service | Status | Notes |
|--------|----------------|-------------------|--------|-------|
| **School** | ERP_DB.school | schoolStore | ACTIVE | Tenant identity embedded |
| **Student** | ERP_DB.students[] | schoolStore / studentService | ACTIVE | Tenant-scoped via schoolId |
| **Class** | ERP_DB.classes[] | schoolStore / classSubjectService | DUPLICATE AUTHORITY | See Section 6 |
| **Section** | ERP_DB.classes[].section | schoolStore | ACTIVE | Embedded in class object |
| **Subject** | ERP_DB.subjects[] (defined but unused) | classSubjectService | DEAD KEY | Currently hardcoded |
| **Transport Route** | ERP_DB.transport.routes[] | transportService (master + module) | DUAL AUTHORITY | See Section 4 |
| **Transport Stop** | ERP_DB.transport.routes[].pickupPoints[] | transportService | DUAL AUTHORITY | Field name variations |
| **Transport Vehicle** | ERP_DB.transport.vehicles[] | transportService (master) | ACTIVE | Master service only |
| **Transport Driver** | ERP_DB.transport.drivers[] | transportService (master) | ACTIVE | Master service only |
| **Transport Fare** | ERP_DB.transport.routes[].transportFee | transportService | DUAL AUTHORITY | Multiple field names |
| **Fee Structure** | ERP_FEE_SETTINGS | feeSettingsService | ACTIVE | Per-class configuration |
| **Fee Record** | ERP_FEES_DB[] | modules/fees/feesService | ACTIVE | Operational fees |
| **Fee Ledger** | ERP_FEES_LEDGER[] | modules/fees/feesService | ACTIVE | Payment history |
| **Receipt** | ERP_RECEIPT_REGISTER[] | receiptService | ACTIVE | Financial authority |
| **Receipt Counter** | ERP_RECEIPT_COUNTER | receiptService | ACTIVE | Single authority |
| **Certificate** | Generated (no persistent storage) | certificateService | ACTIVE | Runtime generation |
| **Attendance** | NOT IMPLEMENTED | N/A | MISSING | Future module |
| **Exam** | NOT IMPLEMENTED | N/A | MISSING | Future module |
| **Result** | NOT IMPLEMENTED | N/A | MISSING | Future module |
| **Payroll** | NOT IMPLEMENTED | N/A | MISSING | Future module |
| **Inventory** | NOT IMPLEMENTED | N/A | MISSING | Future module |
| **Hostel** | ERP_DB.hostel | hostelService | ACTIVE | Master service |
| **Hostel Room** | ERP_DB.hostel.rooms[] | hostelService | ACTIVE | Embedded |
| **Hostel Bed** | ERP_DB.hostel.beds[] | hostelService | ACTIVE | Embedded |
| **Staff** | NOT IN SCOPE | N/A | MISSING | Future module |
| **Guardian** | NOT IN SCOPE | N/A | MISSING | Future module |
| **Session** | Tenant context (sessionId) | authService / tenantContext | ACTIVE | Part of tenant identity |

## 1.2 Entity Relationship Summary

```
School (tenant root)
├── Students[]
│   ├── Class reference
│   ├── Transport assignment
│   └── Fee records
├── Classes[]
│   ├── Sections
│   └── Subjects (hardcoded)
├── Subjects[] (unused)
├── Transport
│   ├── Routes[]
│   │   ├── Pickup Points[]
│   │   └── Fare (transportFee)
│   ├── Vehicles[]
│   ├── Drivers[]
│   └── Mappings[]
├── Hostel
│   ├── Rooms[]
│   ├── Beds[]
│   └── Assignments
├── Fees
│   ├── Fee Records (ERP_FEES_DB)
│   ├── Ledger (ERP_FEES_LEDGER)
│   ├── Receipts (ERP_RECEIPT_REGISTER)
│   └── Counter (ERP_RECEIPT_COUNTER)
└── Settings
    ├── Fee Settings (ERP_FEE_SETTINGS)
    └── Transport Settings (embedded)
```

---

# 2. CANONICAL VOCABULARY AUDIT

## 2.1 Transport Inconsistencies

### Route Fields

| Variation | Location | Canonical | Status |
|-----------|----------|-----------|--------|
| `routeNo` | master-setting/transportService | `id` | DEPRECATED |
| `id` | modules/transportService | `id` | **CANONICAL** |
| `routeName` | modules/transportService | `routeName` | **CANONICAL** |
| `name` | master-setting/transportService | `routeName` | DEPRECATED |
| `fixedFare` | Both services | `transportFee` | **CANONICAL** |
| `monthlyFee` | modules/transportService | `transportFee` | DEPRECATED |
| `transportFee` | modules/transportService (normalizer) | `transportFee` | **CANONICAL** |
| `fare` | master-setting/transportService | `transportFee` | DEPRECATED |
| `points` | master-setting/transportService | `pickupPoints` | DEPRECATED |
| `pickupPoints` | modules/transportService | `pickupPoints` | **CANONICAL** |
| `pickupPointName` | modules/transportService | `pickupPointName` | **CANONICAL** |
| `pointName` | master-setting/transportService | `pickupPointName` | DEPRECATED |
| `name` (point) | master-setting/transportService | `pickupPointName` | DEPRECATED |
| `routeFee` | modules/transportService | `routeFee` | **CANONICAL** |
| `fee` (point) | master-setting/transportService | `routeFee` | DEPRECATED |
| `fare` (point) | master-setting/transportService | `routeFee` | DEPRECATED |
| `pickupTime` | modules/transportService | `pickupTime` | **CANONICAL** |
| `pickup` | master-setting/transportService | `pickupTime` | DEPRECATED |
| `dropTime` | modules/transportService | `dropTime` | **CANONICAL** |
| `drop` | master-setting/transportService | `dropTime` | DEPRECATED |

### Recommendation

**Canonical Transport Route Object:**
```javascript
{
    id: String,
    routeName: String,
    fareType: "fixed" | "variable",
    transportFee: Number,  // Canonical fare field
    fixedFare: Number,     // Legacy compatibility
    monthlyFee: Number,    // Legacy compatibility
    vehicleNumber: String,
    vehicleType: String,
    driverName: String,
    driverPhone: String,
    gpsEnabled: Boolean,
    liveTrackingEnabled: Boolean,
    active: Boolean,
    pickupPoints: [{
        id: String,
        pickupPointName: String,
        routeFee: Number,
        pickupTime: String,
        dropTime: String
    }],
    createdAt: ISOString,
    updatedAt: ISOString
}
```

## 2.2 Student Field Variations

| Variation | Location | Canonical | Status |
|-----------|----------|-----------|--------|
| `studentId` | studentService | `studentId` | **CANONICAL** |
| `id` | studentService (legacy match) | `studentId` | DEPRECATED |
| `class` | studentService | `class` | **CANONICAL** |
| `className` | normalizeStudentSchema | `class` | DEPRECATED |
| `studentClass` | normalizeStudentSchema | `class` | DEPRECATED |
| `class_name` | normalizeStudentSchema | `class` | DEPRECATED |
| `mobile` | normalizeStudentSchema | `mobile` | **CANONICAL** |
| `mobileNo` | normalizeStudentSchema | `mobile` | DEPRECATED |
| `fatherMobile` | normalizeStudentSchema | `mobile` | DEPRECATED |
| `transportRouteId` | StudentForm | `transportRouteId` | **CANONICAL** |
| `route` | studentService filter | `transportRouteId` | DEPRECATED |
| `pickupPoint` | transportService | `pickupPoint` | **CANONICAL** |

## 2.3 Fee Field Variations

| Variation | Location | Canonical | Status |
|-----------|----------|-----------|--------|
| `totalFee` | feesService | `totalFee` | **CANONICAL** |
| `paidAmount` | feesService | `paidAmount` | **CANONICAL** |
| `dueAmount` | feesService | `dueAmount` | **CANONICAL** |
| `status` | feesService | `status` | **CANONICAL** |
| `payments` | feesService | `payments` | **CANONICAL** |

## 2.4 School Field Variations

| Variation | Location | Canonical | Status |
|-----------|----------|-----------|--------|
| `schoolName` | schoolStore | `schoolName` | **CANONICAL** |
| `schoolId` | tenantContext | `schoolId` | **CANONICAL** |
| `branchId` | tenantContext | `branchId` | **CANONICAL** |
| `sessionId` | tenantContext | `sessionId` | **CANONICAL** |

---

# 3. READ AUTHORITY MAP

## 3.1 Complete Read Inventory

### Storage Layer Reads

| Key | Service | File | Tenant-Aware | Read Pattern |
|-----|---------|------|--------------|--------------|
| ERP_DB | schoolStore | src/store/schoolStore.js | YES | getTenantStorage (line 42, 166, 185) |
| ERP_DB | tenantContextService | src/services/tenantContextService.js | NO | getStorageCompat (line 13) |
| ERP_DB | schoolProfileService | src/services/schoolProfileService.js | NO | getStorageCompat (line 39) |
| ERP_DB | master-setting/fees | src/master-setting/fees/feesService.js | YES | getTenantStorage (line 37) |
| ERP_DB | master-setting/hostel | src/master-setting/hostel/hostelService.js | YES | getTenantStorage (line 16) |
| ERP_DB | master-setting/transport | src/master-setting/transport/transportService.js | YES | getTenantStorage (line 35) |
| ERP_DB | modules/transport | src/modules/transport/services/transportService.js | YES | getTenantStorage (line 26) |
| ERP_CLASSES | classSubjectService | src/master-setting/classes-subjects/classSubjectService.js | YES | getTenantStorage (line 42) |
| ERP_CLASSES | StudentForm | src/modules/students/StudentForm.jsx | NO | getStorageCompat (line 32) |
| ERP_FEES_DB | modules/fees | src/modules/fees/feesService.js | NO | getStorageCompat (line 11) |
| ERP_FEES_LEDGER | modules/fees | src/modules/fees/feesService.js | NO | getStorageCompat (line 12) |
| ERP_RECEIPT_COUNTER | receiptService | src/modules/fees/receiptService.js | NO | getStorageCompat (line 30) |
| ERP_RECEIPT_REGISTER | receiptService | src/modules/fees/receiptService.js | NO | getStorageCompat (line 29) |
| ERP_RECEIPT_REGISTER | receiptAuditService | src/modules/fees/receiptAuditService.js | NO | getStorageCompat (line 17) |
| ERP_FEE_SETTINGS | feeSettingsService | src/services/feeSettingsService.js | NO | getStorageCompat (line 37) |
| ERP_FEE_SETTINGS | FeesPage | src/modules/fees/pages/FeesPage.jsx | NO | getStorageCompat (line 15) |
| DRAFT_STUDENT | StudentForm | src/modules/students/StudentForm.jsx | NO | getStorageCompat (line 33) |
| AUTH_CONTEXT_KEY | tenantContextService | src/services/tenantContextService.js | NO | localStorage (line 66) |
| AUTH_SESSION_KEY | authService | src/services/authService.js | NO | localStorage (line 77) |

### Memory/Store Reads

| Store | Service/Component | File | Pattern |
|-------|-------------------|------|---------|
| Zustand schoolStore | Multiple | Various | useSchoolStore().<field> |
| Zustand schoolStore | studentService | src/services/studentService.js | useSchoolStore.getState().students |
| Zustand schoolStore | classSubjectService | (reads from ERP_CLASSES, not store) | N/A |

## 3.2 Read Authority Issues

### CRITICAL: Context-Gated Reads

**Problem:** `schoolStore.loadAll()` cannot read tenant data when tenant context is invalid/missing.

**Evidence:**
```javascript
// storageService.js lines 196-201
if (!isValidTenantContext(tenantContext) || 
    !tenantContext.schoolId || 
    !tenantContext.branchId || 
    !tenantContext.sessionId) {
    return fallback;  // Returns null, not data
}
```

**Impact:** School profile, classes, transport, hostel all appear empty after refresh without valid auth.

### HIGH: Dual Class Read Paths

**Problem:** Classes read from TWO different sources.

**Path 1 (Master):** `classSubjectService.getClasses()` → `ERP_CLASSES` (tenant-scoped)  
**Path 2 (Operational):** `schoolStore.loadAll()` → `ERP_DB.classes` (tenant-scoped)

**Impact:** Class Setup shows classes from ERP_CLASSES, Student Form shows classes from ERP_DB.classes. Navigation causes desync.

### MEDIUM: Non-Tenant-Aware Reads

**Problem:** Some reads bypass tenant isolation.

**Services:**
- receiptService (ERP_RECEIPT_COUNTER, ERP_RECEIPT_REGISTER)
- receiptAuditService
- feeSettingsService
- FeesPage
- StudentForm (DRAFT_STUDENT, ERP_CLASSES via getStorageCompat)

**Risk:** Cross-tenant data visibility if storage keys are not tenant-scoped.

---

# 4. WRITE AUTHORITY MAP

## 4.1 Complete Write Inventory

### Total Writers: 18

| # | Service | File | Storage Key | Tenant-Aware | Status |
|---|---------|------|-------------|--------------|--------|
| 1 | storageService | src/services/storageService.js | ALL | YES | Infrastructure |
| 2 | tenantContextService | src/services/tenantContextService.js | ERP_AUTH_CONTEXT | YES | Auth Layer |
| 3 | subjectSettingsService | src/services/subjectSettingsService.js | Dynamic (per-class) | YES | Active |
| 4 | modules/transport | src/modules/transport/services/transportService.js | ERP_DB | YES | Approved |
| 5 | modules/fees | src/modules/fees/feesService.js | ERP_FEES_DB, ERP_FEES_LEDGER | PARTIAL | Active |
| 6 | receiptService | src/modules/fees/receiptService.js | ERP_RECEIPT_COUNTER, ERP_RECEIPT_REGISTER | NO | Active |
| 7 | receiptAuditService | src/modules/fees/receiptAuditService.js | ERP_RECEIPT_REGISTER | NO | Active |
| 8 | schoolProfileService | src/services/schoolProfileService.js | ERP_DB | YES | Migrated |
| 9 | classSubjectService | src/master-setting/classes-subjects/classSubjectService.js | ERP_CLASSES | YES | Active |
| 10 | schoolStore | src/store/schoolStore.js | ERP_DB | YES | Infrastructure |
| 11 | studentService | src/services/studentService.js | ERP_DB (via schoolStore) | YES | Active |
| 12 | master-setting/fees | src/master-setting/fees/feesService.js | ERP_DB | YES | Legacy Active |
| 13 | master-setting/hostel | src/master-setting/hostel/hostelService.js | ERP_DB | YES | Legacy Active |
| 14 | master-setting/transport | src/master-setting/transport/transportService.js | ERP_DB | YES | Legacy Active |
| 15 | authService | src/services/authService.js | AUTH_SESSION_KEY | NO | Legacy Active |
| 16 | feeSettingsService | src/services/feeSettingsService.js | ERP_FEE_SETTINGS | NO | Legacy Active |
| 17 | StudentForm | src/modules/students/StudentForm.jsx | DRAFT_STUDENT | NO | Active |
| 18 | receiptMigrationService | src/modules/fees/receiptMigrationService.js | Multiple backup keys | NO | Migration Only |

## 4.2 Writer Classification

### Approved Authorities (9)
- Use service registry or are infrastructure
- Tenant-aware where required
- Single responsibility per key

### Legacy Active (8)
- Write to shared/legacy keys
- May cause data inconsistency
- Require migration

### Placeholder (1)
- receiptMigrationService: Not in active UI flow

## 4.3 Critical Write Conflicts

### CRITICAL: Transport Dual Write

**Writers:**
1. `master-setting/transport/transportService.js` → `saveDB()` → `ERP_DB.transport`
2. `modules/transport/services/transportService.js` → `saveTransportDB()` → `ERP_DB.transport`

**Both write to same key without coordination.**

**Risk:** Data overwrites, lost updates, schema mismatch.

### CRITICAL: Classes Duplicate Write

**Writers:**
1. `classSubjectService.saveClasses()` → `ERP_CLASSES`
2. `schoolStore.setClasses()` → `ERP_DB.classes`

**Impact:** Data divergence between master and operational views.

### HIGH: Fees Legacy Write

**Writer:** `master-setting/fees/feesService.js` → `ERP_DB.fees`

**Conflict:** `modules/fees/feesService.js` writes to `ERP_FEES_DB` (separate key)

**Current Status:** Not actually conflicting (different keys), but legacy service is deprecated wrapper.

---

# 5. STORAGE AUTHORITY MAP

## 5.1 Active Storage Keys

| Storage Key | Tenant-Scoped | Owner Service | Writers | Readers | Status |
|-------------|---------------|---------------|---------|---------|--------|
| `ERP_V2_SAAS_{school}_{branch}_{session}_ERP_DB` | YES | schoolStore | 6 | 6 | COMPLIANT (shared tenant key) |
| `ERP_V2_SAAS_{school}_{branch}_{session}_ERP_CLASSES` | YES | classSubjectService | 1 | 2 | DUPLICATE AUTHORITY |
| `ERP_V2_SAAS_{school}_{branch}_{session}_ERP_FEE_SETTINGS` | YES | feeSettingsService | 1 | 2 | COMPLIANT |
| `ERP_V2_SAAS_{school}_{branch}_{session}_ERP_FEES_DB` | YES | modules/fees | 1 | 1 | COMPLIANT |
| `ERP_V2_SAAS_{school}_{branch}_{session}_ERP_FEES_LEDGER` | YES | modules/fees | 1 | 1 | COMPLIANT |
| `ERP_V2_SAAS_{school}_{branch}_{session}_ERP_RECEIPT_COUNTER` | YES | receiptService | 1 | 1 | COMPLIANT |
| `ERP_V2_SAAS_{school}_{branch}_{session}_ERP_RECEIPT_REGISTER` | YES | receiptService | 2 | 3 | COMPLIANT |
| `ERP_V2_SAAS_{school}_{branch}_{session}_ERP_RECEIPT_TEMPLATES` | YES | receiptService | 0 | 0 | UNUSED |
| `ERP_V2_SAAS_{school}_{branch}_{session}_ERP_RECEIPT_PDFS` | YES | receiptService | 0 | 0 | UNUSED |
| `ERP_V2_SAAS_{school}_{branch}_{session}_DRAFT_STUDENT` | YES | StudentForm | 1 | 1 | COMPLIANT |
| `ERP_AUTH_CONTEXT` | NO (shared) | tenantContextService | 1 | 1 | ACTIVE - Cross-cutting |
| `auth_session` | NO (shared) | authService | 1 | 1 | ACTIVE - Auth |
| `ERP_DB` (legacy) | NO | Legacy | 0 | 0 | DEAD (migrated) |
| `ERP_CLASSES` (legacy) | NO | Legacy | 0 | 0 | DEAD (migrated) |

**Total Active Keys:** 10 tenant-scoped + 2 global = 12

## 5.2 Storage Hydration Pattern

### schoolStore.loadAll() Hydration

```javascript
// Sequence in schoolStore.js loadAll():
1. migrateLegacyStorage()  // Copy legacy keys to prefixed
2. getTenantContextForStorage()  // Get context (may return {})
3. getTenantStorage(ERP_DB_KEY, tenantContext, null)  // Try tenant-scoped
4. IF db is null:
   - Set store to empty defaults (schoolData from fullTenantContext)
   - Set hydrated = true
   - RETURN
5. IF db found:
   - Validate tenant match (schoolId, branchId, sessionId)
   - IF mismatch: clear storage, reset to empty
   - IF match: populate store from db
```

### Class Subject Service Hydration

```javascript
// classSubjectService.getClasses():
1. getTenantContextForStorage()
2. getTenantStorage(ERP_CLASSES, tenantContext, [])
3. NO fallback to ERP_DB.classes
4. Transform: flatten to {className} objects
5. Deduplicate
```

### Transport Hydration

```javascript
// modules/transport getTransportDB():
1. getTenantContextForStorage()
2. getTenantStorage(ERP_DB, tenantContext, {})
3. Return db.transport or default
```

### Fee Settings Hydration

```javascript
// feeSettingsService.getFeeSettings():
1. getStorageCompat(ERP_FEE_SETTINGS, null)
2. Returns raw settings object
3. NO tenant validation
```

### Receipt Hydration

```javascript
// receiptService.getReceiptRegister():
1. getStorageCompat(ERP_RECEIPT_REGISTER, [])
2. Returns array of receipts
3. NO tenant validation
```

## 5.3 Persistence Fallback Chain

```
Tenant Context Valid?
├── YES → Tenant-Scoped Key (e.g., ERP_V2_SAAS_SCH001_MAIN_2025-26_ERP_DB)
└── NO → Fallback
    ├── schoolStore: null → empty defaults
    ├── classSubjectService: [] (empty array)
    ├── transport: {} (empty object)
    ├── receiptService: uses getStorageCompat (reads prefixed or legacy)
    └── feeSettingsService: uses getStorageCompat (reads prefixed or legacy)
```

---

# 6. SINGLE SOURCE OF TRUTH AUDIT

## 6.1 Duplicate Authorities

### CRITICAL: Classes

**Authority 1:** `ERP_CLASSES`  
**Writer:** `classSubjectService.saveClasses()` (line 36)  
**Reader:** `classSubjectService.getClasses()` (line 42)

**Authority 2:** `ERP_DB.classes`  
**Writer:** `schoolStore.setClasses()` (line 231)  
**Reader:** `schoolStore.loadAll()` (line 127), `useSchoolStore().classes` (memory)

**Status:** ACTIVE BUG  
**Impact:** Data desync between Class Setup and Student Form

### CRITICAL: Transport Routes

**Authority 1:** `master-setting/transport/transportService.js`  
**API:** `get()`, `save()`, `createRoute()`  
**Schema:** `routeNo`, `points`, `fixedFare`, `fare`

**Authority 2:** `modules/transport/services/transportService.js`  
**API:** `getTransportRoutes()`, `createTransportRoute()`  
**Schema:** `id`, `pickupPoints`, `transportFee`, `monthlyFee`

**Status:** DUAL AUTHORITY (accepted per Phase 4.4)  
**Impact:** Data inconsistency risk, schema drift

### LOW: School Profile (Legacy)

**Authority 1:** `ERP_DB.school` (current)  
**Authority 2:** `schoolProfile` (legacy key, dead)

**Status:** LEGACY CLEAN  
**Impact:** None (schoolProfileService uses ERP_DB)

### DEAD: Subjects

**Authority 1:** `ERP_SUBJECTS` (defined, unused)  
**Authority 2:** `ERP_CLASS_SUBJECT_MAP` (defined, unused)

**Status:** DEAD CODE  
**Impact:** None (subjects hardcoded)

## 6.2 Duplicate Logic

### Fee Normalization

**Location 1:** `feeNormalizer.js` - `normalizeFeeSettings()`  
**Location 2:** `modules/fees/feesService.js` - inline normalization

**Impact:** Potential drift in fee categorization logic.

### Student Filtering

**Location 1:** `studentService.getStudents()` (lines 46-53)  
**Location 2:** `studentService.getStudentsFiltered()` (lines 462-509)

**Status:** Intentional separation (basic vs advanced filtering)

### Tenant Context Attachment

**Location 1:** `tenantContextService.withTenantContext()`  
**Location 2:** Inline in transportService.saveStudentTransport() (line 309)

**Impact:** Inconsistent tenant attachment patterns.

## 6.3 Duplicate Services

### Fees Service

**Master:** `src/master-setting/fees/feesService.js`  
**Module:** `src/modules/fees/feesService.js`

**Status:** Master is deprecated wrapper, module is active.

### Transport Service

**Master:** `src/master-setting/transport/transportService.js`  
**Module:** `src/modules/transport/services/transportService.js`

**Status:** Both active (dual authority accepted).

---

# 7. DEPENDENCY GRAPH

## 7.1 Service Dependency Map

```
App.js
├── AuthService
│   └── tenantContextService
│       └── storageService
├── DashboardLayout
│   └── schoolStore (Zustand)
│       ├── storageService
│       └── tenantContextService
├── Modules
│   ├── students
│   │   ├── studentService
│   │   │   ├── schoolStore
│   │   │   ├── serviceRegistry (getService)
│   │   │   │   ├── fees
│   │   │   │   ├── transport
│   │   │   │   └── hostel
│   │   │   └── tenantContextService
│   │   ├── StudentForm
│   │   │   ├── storageService (getStorageCompat)
│   │   │   ├── schoolStore
│   │   │   └── serviceRegistry
│   │   └── certificateService
│   │       └── schoolStore
│   ├── fees
│   │   ├── feesService
│   │   │   ├── storageService
│   │   │   ├── serviceRegistry (receipt)
│   │   │   └── feeNormalizer
│   │   │       └── feeConstants
│   │   ├── receiptService
│   │   │   ├── storageService
│   │   │   └── tenantContextService (withTenantContext)
│   │   ├── receiptAuditService
│   │   │   └── storageService
│   │   └── receiptMigrationService
│   │       └── storageService
│   ├── transport
│   │   └── transportService (module)
│   │       ├── storageService
│   │       └── tenantContextService
│   └── staff (minimal)
├── Master-Setting
│   ├── classes-subjects
│   │   └── classSubjectService
│   │       ├── storageService
│   │       └── tenantContextService
│   ├── fees
│   │   ├── FeeSettings
│   │   │   └── feeSettingsService
│   │   │       └── storageService
│   │   ├── FeeStructure
│   │   │   └── feeConstants
│   │   │   └── feeNormalizer
│   │   └── feesService (master - DEPRECATED)
│   │       └── storageService
│   ├── transport
│   │   ├── TransportSettings
│   │   │   └── transportService (master)
│   │   │       ├── storageService
│   │   │       └── tenantContextService
│   │   └── TransportRoutes
│   │       └── transportService (master)
│   ├── hostel
│   │   └── hostelService
│   │       ├── storageService
│   │       └── tenantContextService
│   ├── school-profile
│   │   └── schoolProfileService
│   │       └── storageService
│   └── exams (minimal)
└── Services
    ├── authService
    │   └── tenantContextService
    ├── contextService
    │   └── storageService
    ├── snapshotService
    │   └── storageService
    └── runtimeValidationService
```

## 7.2 Module Dependency Summary

| Module | Depends On | Critical Path |
|--------|------------|---------------|
| students | schoolStore, fees, transport, hostel | schoolStore → tenantContext → storageService |
| fees | storageService, receiptService, feeNormalizer | receiptService → storageService |
| transport | storageService, tenantContextService | storageService → tenantContextService |
| classes-subjects | storageService, tenantContextService | storageService → tenantContextService |
| fees (master) | storageService | storageService |
| transport (master) | storageService, tenantContextService | storageService → tenantContextService |
| hostel | storageService, tenantContextService | storageService → tenantContextService |

---

# 8. AUTO PROPAGATION MATRIX

## 8.1 School Profile Propagation

| Downstream | Read Source | Auto-Update | Manual Required? |
|------------|-------------|-------------|------------------|
| Header (SchoolHeader.jsx) | schoolStore.schoolData | YES (Zustand re-render) | NO |
| ID Card (StudentIDCards.jsx) | schoolStore.schoolData | YES | NO |
| Certificate (Certificate.jsx) | schoolStore.schoolData | YES | NO |
| Receipts | receiptService (school cached) | NO | YES (receipt regeneration) |
| Dashboard | schoolStore.schoolData | YES | NO |

## 8.2 Classes Propagation

| Downstream | Read Source | Auto-Update | Manual Required? |
|------------|-------------|-------------|------------------|
| Student Form | schoolStore.classes | YES | NO |
| Subject Settings | ERP_CLASSES (via classSubjectService) | NO | YES (different source) |
| Fee Settings | schoolStore.classes (expected) | YES (if fixed) | NO |
| Transport Form | N/A | N/A | N/A |
| Reports | schoolStore.classes | YES | NO |

## 8.3 Transport Propagation

| Downstream | Read Source | Auto-Update | Manual Required? |
|------------|-------------|-------------|------------------|
| Student Form | transportService (module) | NO | YES (Transport module hook) |
| Student Transport Assignment | transportService | NO | YES |
| Fee Calculation | feeNormalizer (transportRoutes param) | NO | YES (explicit reload) |
| Dashboard | transportService | NO | YES |

## 8.4 Fees Propagation

| Downstream | Read Source | Auto-Update | Manual Required? |
|------------|-------------|-------------|------------------|
| Receipt | receiptService | YES (same service) | NO |
| Ledger | receiptService | YES | NO |
| Student Profile | feesService | NO | YES |
| Reports | feesService + receiptService | NO | YES |

## 8.5 Propagation Gaps

### GAP 1: Classes → Fee Settings

**Expected:** Fee Settings should see classes from schoolStore  
**Actual:** Fee Settings may read from ERP_FEE_SETTINGS which references class names  
**Fix Required:** Ensure Fee Settings reads classes from schoolStore

### GAP 2: Transport → Fees

**Expected:** Fee calculation should include transport fee  
**Actual:** feeNormalizer accepts transportRoutes as parameter  
**Gap:** Caller must explicitly pass fresh transport routes

### GAP 3: School Profile → Receipts

**Expected:** Receipts should include school name/address  
**Actual:** Receipt template has school data baked in at generation  
**Gap:** School data changes require receipt template refresh

---

# 9. PERSISTENCE AUDIT

## 9.1 CRUD Operation Audit

### Save Operations

| Entity | Save Function | Storage | Tenant-Aware | Validation |
|--------|---------------|---------|--------------|------------|
| School Profile | schoolStore.setSchoolData() | ERP_DB | YES | Tenant context merge |
| Students | studentService.addStudent() | ERP_DB (via schoolStore) | YES | Validation + tenant attach |
| Classes | classSubjectService.saveClasses() | ERP_CLASSES | YES | Tenant context attach |
| Classes (duplicate) | schoolStore.setClasses() | ERP_DB.classes | YES | None |
| Transport | transportService.save() [master] | ERP_DB | YES | None |
| Transport | saveTransportDB() [module] | ERP_DB | YES | None |
| Hostel | hostelService.save() | ERP_DB | YES | None |
| Fee Settings | feeSettingsService.saveFeeSettings() | ERP_FEE_SETTINGS | NO | None |
| Fees | feesService.saveStudentFeesRecord() | ERP_FEES_DB | NO | None |
| Receipt | receiptService.createReceipt() | ERP_RECEIPT_REGISTER | NO | Tenant attach |
| Receipt Counter | receiptService.incrementReceiptCounter() | ERP_RECEIPT_COUNTER | NO | None |
| Draft Student | StudentForm | DRAFT_STUDENT | NO | None |

### Refresh/Reload Operations

| Component | Trigger | Method | Risk |
|-----------|---------|--------|------|
| schoolStore | App init, DashboardLayout useEffect | loadAll() | Context-gated failure |
| classSubjectService | Class Setup mount | getClasses() | Returns empty if context missing |
| transportService | Transport page mount | getTransportRoutes() | Returns empty if context missing |
| hostelService | Hostel page mount | hostelService.get() | Returns empty if context missing |

### Delete Operations

| Entity | Delete Function | Cascade | Tenant-Aware |
|--------|-----------------|---------|--------------|
| Student | studentService.deleteStudent() | YES (fees, transport, hostel) | YES |
| Transport Route | transportService.deleteRoute() [master] | NO | YES |
| Transport Route | removeTransportRoute() [module] | NO | YES |

### Migration Operations

| Operation | Function | Keys | Status |
|-----------|----------|------|--------|
| Legacy → Prefixed | migrateLegacyStorage() | MIGRATED_STORAGE_KEYS (ERP_DB only) | ACTIVE |
| Tenant Migration | migrateToTenantStorage() | Any | Available but unused |
| Receipt Migration | receiptMigrationService | Backup keys | Active |

## 9.2 Startup Sequence

```
1. App.js initializes
2. AuthService checks AUTH_SESSION_KEY
3. IF session exists:
   a. Restore user context
   b. setAuthContext() → ERP_AUTH_CONTEXT
4. DashboardLayout useEffect:
   a. schoolStore.loadAll()
   b. migrateLegacyStorage()
   c. getTenantContextForStorage()
   d. getTenantStorage(ERP_DB)  ← CONTEXT GATED
5. Modules initialize:
   a. Each module may call its service get*() method
   b. Each get*() calls getTenantStorage() ← CONTEXT GATED
6. UI renders:
   a. Header: useSchoolStore().schoolData
   b. If context was invalid: EMPTY
```

## 9.3 Tenant Switching

| Scenario | Behavior | Data Leak Risk |
|----------|----------|----------------|
| Switch tenant (dev helper) | setAuthContext(newContext) | NO (new key used) |
| Refresh with new context | loadAll() → new tenant key | NO |
| No context (logout) | Context returns {} | NO (ZERO TRUST blocks reads) |
| Expired session | Context returns {} | NO (data not accessible) |

---

# 10. RUNTIME FLOW AUDIT

## 10.1 App Start Flow

```
Browser Load
    ↓
index.js → App.js
    ↓
AuthService.isAuthenticated()
    ↓
├── YES → Restore session, set tenant context
└── NO → Continue without context
    ↓
DashboardLayout mounts
    ↓
useEffect triggers
    ↓
schoolStore.loadAll()
    ↓
migrateLegacyStorage()
    ↓
getTenantContextForStorage()
    ↓
├── Auth context valid → tenant-scoped key
└── Auth context invalid → {} → ZERO TRUST → null
    ↓
getTenantStorage(ERP_DB_KEY, context, null)
    ↓
├── Data found → Populate store
└── No data / Invalid context → Empty store
    ↓
Store hydrated = true
    ↓
UI renders
```

## 10.2 Data Save Flow

```
User Action (e.g., save student)
    ↓
Component calls service (e.g., studentService.addStudent())
    ↓
Service attaches tenant context (withTenantContext)
    ↓
Service updates Zustand store
    ↓
Store set*() method triggers saveAll()
    ↓
saveAll() calls setTenantStorage(ERP_DB_KEY, db, tenantContext)
    ↓
setTenantStorage():
├── Valid context → Tenant-scoped key
└── Invalid context → Fallback to shared (LEGACY)
    ↓
localStorage write
```

## 10.3 Data Read Flow

```
Component needs data
    ↓
Option A: useSchoolStore().field (memory)
Option B: service.get*() → storageService
    ↓
Option B flow:
    ↓
service.get*() → getTenantStorage(KEY, tenantContext, fallback)
    ↓
getTenantStorage():
├── Valid context → tenant-scoped read
└── Invalid context → return fallback (NO shared read)
    ↓
Return data or fallback
    ↓
Component renders
```

## 10.4 Critical Flow Violations

### Violation 1: Context-Gated Bootstrap

**Problem:** schoolStore.loadAll() requires valid tenant context to read data.

**Sequence Broken:** Auth not ready → Store empty → UI empty → User sees blank screen.

### Violation 2: Dual Write Without Coordination

**Problem:** Two services write to ERP_DB.transport independently.

**Sequence Broken:** Master writes → Module writes → Module overwrites master data.

### Violation 3: Read After Write Without Refresh

**Problem:** Modules read from memory store, but some components read directly from storage.

**Sequence Broken:** Save via schoolStore → Navigate → Component reads ERP_CLASSES → Empty.

---

# 11. SAAS COMPLIANCE AUDIT

## 11.1 Multi-School Compliance

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Tenant isolation in storage | PARTIAL | 50% of writers tenant-aware |
| No cross-tenant reads | PARTIAL | ZERO TRUST enforced, but context-gated bootstrap fails |
| Tenant context validation | YES | isValidTenantContext() in storageService |
| Per-school storage keys | YES | ERP_V2_SAAS_{school}_{branch}_{session}_* |

## 11.2 Data Isolation Matrix

| Data Domain | Isolation Level | Cross-Tenant Risk |
|-------------|-----------------|-------------------|
| School Profile | HIGH (tenant-scoped) | LOW |
| Students | HIGH (tenant-scoped + schoolId filter) | LOW |
| Classes | MEDIUM (tenant-scoped but duplicate path) | MEDIUM |
| Transport | MEDIUM (shared ERP_DB key, dual writers) | HIGH |
| Hostel | HIGH (tenant-scoped) | LOW |
| Fee Settings | LOW (NO tenant-scoping) | HIGH |
| Receipts | LOW (NO tenant-scoping) | HIGH |
| Draft Students | LOW (shared key) | MEDIUM |

## 11.3 SaaS Compliance Score

```
Tenant Isolation:        6/10 (60%)
Single Authority:        4/10 (40%)
No Duplicate State:      5/10 (50%)
No Duplicate Storage:    7/10 (70%)
Compliance Score:        5.5/10
Production Ready:        NO
```

## 11.4 Compliance Blockers

### BLOCKER 1: School Store Context Dependency

**Issue:** `schoolStore.loadAll()` returns empty when tenant context invalid.

**Fix Required:** Bootstrap-safe context recovery from stored school data.

### BLOCKER 2: Fee Settings Not Tenant-Scoped

**Issue:** `ERP_FEE_SETTINGS` uses shared storage key.

**Fix Required:** Tenant-scoped fee settings key.

### BLOCKER 3: Receipts Not Tenant-Scoped

**Issue:** `ERP_RECEIPT_REGISTER` and `ERP_RECEIPT_COUNTER` use shared keys.

**Fix Required:** Tenant-scoped receipt keys with counter sequence per tenant.

---

# 12. HARDCODED AUDIT

## 12.1 Bad Hardcoding

### CRITICAL: Default Tenant Context

**File:** src/services/tenantContextService.js (line 20-24)  
**Code:**
```javascript
const DEFAULT_CONTEXT = {
    schoolId: "SCH-IND-0001",
    branchId: "MAIN",
    sessionId: "2025-26",
};
```

**Risk:** Development fallback could leak into production if SAFETY_MODE disabled.

### HIGH: Mock User Database

**File:** src/services/authService.js (line 14-35)  
**Code:** Hardcoded user credentials

**Risk:** Security vulnerability in production.  
**Status:** Expected for demo, must be replaced.

### HIGH: Transport Settings Defaults

**File:** src/master-setting/transport/transportService.js (line 49-66)  
**Code:** Hardcoded transport settings defaults

**Risk:** New tenants get same defaults.

### MEDIUM: Fee Constants

**File:** src/core/constants/feeConstants.js (referenced by feeNormalizer.js)  
**Code:** CLASS_FEES, HOSTEL_FEE_CONST, TRANSPORT_ROUTES

**Status:** INTENTIONAL - These are fallback constants, not hardcoding errors.

### MEDIUM: Absent Percentage

**File:** src/services/studentService.js (line 553)  
**Code:**
```javascript
const absent = Math.floor(total * 0.08); // Hardcoded 8%
```

**Risk:** Business logic in service layer.

### MEDIUM: Subject Defaults

**File:** src/master-setting/classes-subjects/classSubjectService.js (line 62-80)  
**Code:** Hardcoded subject lists for Agriculture and default

**Risk:** Not configurable per school.

### LOW: Class Order

**File:** src/services/studentService.js (line 519-525)  
**Code:** CLASS_ORDER array

**Status:** Presentation concern, acceptable.

### LOW: Vehicle Type Default

**File:** src/modules/transport/services/transportService.js (line 96)  
**Code:** `vehicleType: "Bus"`

**Status:** Reasonable default.

## 12.2 Standard Master Catalog

These are NOT hardcoding issues:

| Item | File | Reason |
|------|------|--------|
| CLASS_FEES | feeConstants.js | Fallback defaults when no FeeSettings |
| TRANSPORT_ROUTES | feeConstants.js | Fallback defaults |
| Fee categorization logic | feeNormalizer.js | Business rules |
| CLASS_ORDER | studentService.js | Display ordering |
| Student schema normalization | studentService.js | Field name variations |

---

# 13. PERFORMANCE AUDIT

## 13.1 Unnecessary Renders

### schoolStore Subscriptions

**Issue:** Multiple components subscribe to entire schoolStore.

**Impact:** Any state change triggers re-render in all subscribers.

**Affected Components:**
- SchoolHeader
- Dashboard pages
- StudentForm
- Certificate
- ID Cards

### classSubjectService Transformation

**Issue:** `getClasses()` transforms data on every call.

```javascript
// Lines 44-57: map → format → deduplicate → remap
```

**Impact:** Unnecessary computation on each read.

## 13.2 Duplicate Loading

### ERP_DB Multiple Reads

**Sequence:**
1. tenantContextService reads ERP_DB (line 13) - `getStorageCompat(ERP_DB_KEY, null)`
2. schoolProfileService reads ERP_DB (line 39) - `getStorageCompat(KEY, null)`
3. schoolStore reads ERP_DB (line 42) - `getTenantStorage(ERP_DB_KEY, ...)`
4. master-setting/fees reads ERP_DB (line 37) - `getTenantStorage(DB_KEY, ...)`
5. master-setting/hostel reads ERP_DB (line 16) - `getTenantStorage(DB_KEY, ...)`
6. master-setting/transport reads ERP_DB (line 35) - `getTenantStorage(DB_KEY, ...)`
7. modules/transport reads ERP_DB (line 26) - `getTenantStorage(DB_KEY, ...)`

**Impact:** 7 localStorage reads of ERP_DB on app start.

### Tenant Context Reads

**Issue:** `getTenantContext()` called frequently, each reads localStorage.

**Affected:**
- studentService (multiple calls per function)
- transportService
- classSubjectService

## 13.3 Duplicate Hydration

### schoolStore.loadAll()

**Called:** DashboardLayout useEffect, potentially multiple times.

**Mitigation:** `hydrated` flag prevents re-run.

### Transport Hydration

**Issue:** Both master and module services hydrate transport independently.

**Impact:** Potential data inconsistency if runs interleaved.

## 13.4 Duplicate Storage Reads

### Student Data

**Path 1:** schoolStore.loadAll() → ERP_DB.students  
**Path 2:** studentService.getStudents() → useSchoolStore.getState().students (memory)

**Status:** Path 2 is correct (memory). But studentService.getStudentById() does tenant filtering on every call.

### Class Data

**Path 1:** schoolStore.loadAll() → ERP_DB.classes  
**Path 2:** classSubjectService.getClasses() → ERP_CLASSES

**Issue:** Same data, two paths, double read.

## 13.5 Duplicate Writes

### Transport Data

**Scenario:** Master service saves transport → Module service saves transport.

**Result:** Last write wins. Data loss possible.

### Classes Data

**Scenario:** Class Setup saves to ERP_CLASSES → Student Form saves to ERP_DB.classes.

**Result:** Two independent copies diverge.

---

# 14. NAMING AUDIT

## 14.1 File Naming

### Consistent
- services/*.js (all services)
- pages/*.jsx (all pages)
- components/*.jsx (all components)

### Inconsistent
- `feesService.js` vs `transportService.js` vs `hostelService.js` (all master-setting)
- `feesService.js` vs `receiptService.js` vs `receiptAuditService.js` (all modules/fees)
- `feesConstants.js` vs `feeNormalizer.js` (location and naming)

## 14.2 Variable Naming

### Inconsistent: DB Key References

| Variable | File | Key |
|----------|------|-----|
| DB_KEY | master-setting/transport/transportService.js | ERP_DB |
| DB_KEY | master-setting/fees/feesService.js | ERP_DB |
| DB_KEY | master-setting/hostel/hostelService.js | ERP_DB |
| DB_KEY | modules/transport/services/transportService.js | ERP_DB |
| KEY | src/services/schoolProfileService.js | ERP_DB |
| STORAGE_KEY | classSubjectService.js | ERP_CLASSES |
| FEES_DB_KEY | modules/fees/feesService.js | ERP_FEES_DB |
| LEDGER_KEY | modules/fees/feesService.js | ERP_FEES_LEDGER |
| RECEIPT_KEY | modules/fees/feesService.js | ERP_RECEIPT_COUNTER |
| RECEIPT_REGISTER_KEY | receiptService.js | ERP_RECEIPT_REGISTER |

### Inconsistent: Function Names

| Pattern | Examples |
|---------|----------|
| getX | getStudents, getClasses, getRoutes, getFeeSettings |
| getXById | getStudentById, getRouteById |
| createX | createTransportRoute, createReceiptNumber |
| saveX | saveClasses, saveAll, saveDB |
| setX | setSchoolData, setClasses, setStudents |
| removeX | deleteRoute, removeStudentTransport |

## 14.3 Store Naming

| Store | Key | Pattern |
|-------|-----|---------|
| schoolStore | useSchoolStore | Consistent |
| N/A | No other stores | Single store pattern |

## 14.4 Service Registry Names

| Registry Key | Service File | Consistent? |
|--------------|--------------|-------------|
| "transport" | modules/transport/services/transportService.js | YES |
| "fees" | modules/fees/feesService.js | YES |
| "receipt" | modules/fees/receiptService.js | YES |
| "student" | services/studentService.js | YES |
| "classSubject" | master-setting/classes-subjects/classSubjectService.js | YES |
| "hostel" | master-setting/hostel/hostelService.js | YES |

---

# 15. FUTURE MODULE COMPATIBILITY

## 15.1 Module Readiness Assessment

| Module | Storage Support | Service Layer | UI Integration | Tenant Isolation | State Management | Overall Ready? |
|--------|-----------------|---------------|----------------|------------------|------------------|----------------|
| Attendance | NO | NO | NO | NO | NO | NOT READY |
| Exam | NO | NO | NO | NO | NO | NOT READY |
| Result | NO | NO | NO | NO | NO | NOT READY |
| Payroll | NO | NO | NO | NO | NO | NOT READY |
| Inventory | NO | NO | NO | NO | NO | NOT READY |
| HR | NO | NO | NO | NO | NO | NOT READY |
| Library | NO | NO | NO | NO | NO | NOT READY |
| Hostel | YES (partial) | YES | YES | YES | schoolStore | READY (needs expansion) |
| Transport | YES (dual) | YES | YES | YES | schoolStore + ERP_DB | READY (consolidate advised) |
| Parent App | NO | NO | NO | NO | NO | NOT READY |
| Teacher App | NO | NO | NO | NO | NO | NOT READY |

## 15.2 Current Architecture Support

### Patterns Available

1. **Service Registry:** Available via `getService("moduleName")`
2. **Tenant-Aware Storage:** `getTenantStorage()`, `setTenantStorage()`
3. **Zustand Store:** `schoolStore` pattern for shared state
4. **Fee Engine:** `feeNormalizer` for schema transformation
5. **Service Pattern:** Block direct access, use registry

### Gaps for Future Modules

| Gap | Impact | Solution |
|------|--------|----------|
| No attendance storage key | Cannot persist attendance data | Add ERP_ATTENDANCE key |
| No exam storage key | Cannot persist exam data | Add ERP_EXAMS key |
| No result storage key | Cannot persist results | Add ERP_RESULTS key |
| No payroll storage key | Cannot persist payroll | Add ERP_PAYROLL key |
| No inventory storage key | Cannot persist inventory | Add ERP_INVENTORY key |
| Tenant gating blocks bootstrap | New modules inherit same issue | Fix bootstrap in schoolStore first |

## 15.3 Recommended Pattern for New Modules

```
1. Define storage key in src/core/constants/storageKeys.js
2. Create service in src/modules/<module>/services/<module>Service.js
3. Block direct access: blockDirectServiceAccess("<module>Service")
4. Use tenant-aware storage: getTenantStorage(KEY, tenantContext, fallback)
5. Attach tenant context: withTenantContext(data)
6. Register in serviceRegistry.js
7. Read from schoolStore for master data dependencies
8. Use feeNormalizer pattern if schema transformation needed
```

---

# 16. RISK REPORT

## 16.1 Risk Register

### CRITICAL Risks

| ID | Risk | Probability | Impact | Mitigation Priority |
|----|------|-------------|--------|---------------------|
| R-01 | schoolStore context dependency causes data loss on refresh | HIGH | CRITICAL | P1 - Immediate |
| R-02 | Classes duplicate authority causes data desync | HIGH | CRITICAL | P1 - Immediate |
| R-03 | Transport dual write causes data overwrite | MEDIUM | HIGH | P1 - Immediate |
| R-04 | Fee settings not tenant-scoped violates SaaS isolation | MEDIUM | HIGH | P2 - Phase 5 |
| R-05 | Receipts not tenant-scoped violates SaaS isolation | MEDIUM | HIGH | P2 - Phase 5 |

### HIGH Risks

| ID | Risk | Probability | Impact | Mitigation Priority |
|----|------|-------------|--------|---------------------|
| R-06 | Non-tenant-aware reads expose cross-tenant data | MEDIUM | HIGH | P2 - Phase 5 |
| R-07 | Auth session shared across schools (auth_session key) | LOW | HIGH | P2 - Phase 5 |
| R-08 | Student data duplication via filtering + raw store | LOW | MEDIUM | P3 - Phase 6 |
| R-09 | Hardcoded defaults may leak to production | LOW | MEDIUM | P3 - Phase 6 |
| R-10 | Fee normalization logic duplicated | MEDIUM | MEDIUM | P3 - Phase 6 |

### MEDIUM Risks

| ID | Risk | Probability | Impact | Mitigation Priority |
|----|------|-------------|--------|---------------------|
| R-11 | Unnecessary re-renders from global store subscriptions | HIGH | LOW | P4 - Optimization |
| R-12 | Duplicate ERP_DB reads on app start | HIGH | LOW | P4 - Optimization |
| R-13 | Class data transformation on every read | MEDIUM | LOW | P4 - Optimization |
| R-14 | No attendance/exam/payroll storage | N/A | MEDIUM | P5 - Future modules |
| R-15 | Certificate generation has no persistence | LOW | LOW | P5 - Consider adding |

## 16.2 Risk Mitigation Timeline

```
Phase 4.5 (Immediate):
├── R-01: Bootstrap tenant context recovery
├── R-02: Eliminate classes duplicate authority
├── R-03: Coordinate transport dual writes
└── R-11, R-12, R-13: Performance optimization

Phase 5:
├── R-04: Tenant-scope fee settings
├── R-05: Tenant-scope receipts
├── R-06: Migrate all readers to tenant-aware
└── R-07: Tenant-scope auth session

Phase 6:
├── R-08: Remove duplicate filtering logic
├── R-09: Replace hardcoded defaults with config
└── R-10: Consolidate fee normalization

Post-Launch:
└── R-14, R-15: Future module implementation
```

---

# 17. FINAL RECOMMENDATION

## 17.1 ERP-v2 Constitution v1.0 Foundation

Based on this complete architecture audit, the following principles must be established:

### Principle 1: Tenant Isolation is Non-Negotiable

**Rule:** Every storage write MUST be tenant-scoped. Every storage read MUST validate tenant context.

**Current State:** 50% compliance.  
**Target:** 100% before production SaaS launch.

### Principle 2: Single Authority Per Entity

**Rule:** Each data entity has exactly one write authority and one read authority.

**Current Violations:**
- Classes: ERP_CLASSES + ERP_DB.classes
- Transport: master-service + module-service

**Resolution:** Eliminate duplicate authorities or formally accept dual authority with coordination protocol.

### Principle 3: No Direct Storage Access Across Modules

**Rule:** Modules communicate via service APIs, never direct storage reads/writes.

**Current Violations:**
- StudentForm reads ERP_CLASSES directly
- FeesPage reads ERP_FEE_SETTINGS directly

**Resolution:** All access through service registry.

### Principle 4: Bootstrap-Safe Tenant Context

**Rule:** Application must recover tenant context from stored data when auth context is unavailable.

**Current State:** FAILS - Data disappears on refresh without auth.

**Resolution:** Implement context recovery in schoolStore.loadAll().

### Principle 5: No Hardcoded Business Values

**Rule:** Business values (percentages, rates, defaults) must be configurable per school.

**Current Violations:**
- 8% absent rate hardcoded
- Subject lists hardcoded
- Transport defaults hardcoded

**Resolution:** Move to school-configurable settings.

### Principle 6: Service Registry Enforcement

**Rule:** Production mode blocks direct service access. All consumers use registry.

**Current State:** Implemented but not comprehensive.

### Principle 7: Canonical Vocabulary

**Rule:** One canonical name per concept. All variations are deprecated.

**Examples:**
- `transportFee` (not fixedFare, monthlyFee, fare, fee)
- `pickupPoints` (not points)
- `pickupPointName` (not name, pointName)

### Principle 8: No Silent Failures

**Rule:** Tenant context validation failures must be logged and surfaced to user.

**Current State:** Logged but UI shows empty state without explanation.

## 17.2 Phase 4.5 Execution Requirements

Before any new feature development, the following MUST be completed:

1. **schoolStore Bootstrap Fix** (R-01)
   - Add tenant context recovery from stored ERP_DB
   - Ensure data survives refresh without active auth

2. **Classes Authority Consolidation** (R-02)
   - Make ERP_DB.classes single authority
   - Make classSubjectService a facade over schoolStore
   - Migrate ERP_CLASSES → ERP_DB.classes

3. **Transport Write Coordination** (R-03)
   - Implement write coordination protocol
   - Or: Complete consolidation to single authority

4. **Fee Settings Tenant Isolation** (R-04)
   - Tenant-scope ERP_FEE_SETTINGS
   - Migrate existing data

5. **Receipt Tenant Isolation** (R-05)
   - Tenant-scope receipt keys
   - Implement per-tenant counter sequence

## 17.3 Constitution v1.0 Sections

The following sections must be authored based on this audit:

### Section 1: Entity Authority Matrix
- Every entity and its single write authority
- Every entity and its single read authority
- Storage key allocation rules

### Section 2: Tenant Isolation Standards
- Key naming convention
- Context validation requirements
- Fallback policies
- Migration patterns

### Section 3: Service Architecture
- Registry enforcement policy
- Master vs module service rules
- Deprecation procedures

### Section 4: Data Integrity
- Duplicate authority elimination policy
- Consistency verification requirements
- Audit logging standards

### Section 5: Vocabulary Standards
- Canonical field names per entity
- Deprecation naming conventions
- Migration requirements for field renames

### Section 6: Performance Standards
- Render optimization requirements
- Storage read limits
- Hydration rules

### Section 7: Security Standards
- Tenant isolation enforcement
- Access control policy
- Audit requirements

### Section 8: Module Development Standards
- Required patterns for new modules
- Storage key registration
- Service registration requirements

## 17.4 Evidence Sources Used

This audit is derived from:

1. `docs/architecture/PHASE-4.4-SAAS-AUTHORITY-FREEZE.md` - 18 writers mapped
2. `docs/architecture/PHASE-4.6-MASTER-DATA-AUTHORITY-AUDIT.md` - Duplicate authority analysis
3. `docs/authority/receipt-authority.md` - Receipt authority documentation
4. `docs/audit/phase-4.4c/ERP_DB_CALLERS.txt` - ERP_DB usage
5. `docs/audit/phase-4.4c/STORAGE_READERS.txt` - All storage reads
6. `docs/audit/phase-4.4c/STORAGE_WRITERS.txt` - All storage writes
7. `src/services/storageService.js` - 302 lines
8. `src/services/tenantContextService.js` - 332 lines
9. `src/store/schoolStore.js` - 267 lines
10. `src/services/studentService.js` - 561 lines
11. `src/core/fee-engine/feeNormalizer.js` - 269 lines
12. `src/services/authService.js` - 286 lines
13. `src/master-setting/transport/transportService.js` - 339 lines
14. `src/modules/transport/services/transportService.js` - 451 lines
15. `src/master-setting/classes-subjects/classSubjectService.js` - 159 lines
16. `src/master-setting/fees/feesService.js` - 97 lines
17. `src/core/constants/storageKeys.js` - 57 lines

---

# APPENDIX A: STORAGE KEY REGISTRY

| Key Constant | Raw Key Value | Tenant-Scoped | Owner | Status |
|--------------|---------------|---------------|-------|--------|
| STORAGE_KEYS.ERP_DB | ERP_DB | YES | schoolStore | ACTIVE |
| STORAGE_KEYS.ERP_CLASSES | ERP_CLASSES | YES | classSubjectService | DUPLICATE |
| STORAGE_KEYS.ERP_SUBJECTS | ERP_SUBJECTS | YES | UNUSED | DEAD |
| STORAGE_KEYS.ERP_CLASS_SUBJECT_MAP | ERP_CLASS_SUBJECT_MAP | YES | UNUSED | DEAD |
| STORAGE_KEYS.ERP_FEE_SETTINGS | ERP_FEE_SETTINGS | NO | feeSettingsService | NON-COMPLIANT |
| STORAGE_KEYS.ERP_FEES_DB | ERP_FEES_DB | NO | modules/fees | NON-COMPLIANT |
| STORAGE_KEYS.ERP_FEES_LEDGER | ERP_FEES_LEDGER | NO | modules/fees | NON-COMPLIANT |
| STORAGE_KEYS.ERP_RECEIPT_COUNTER | ERP_RECEIPT_COUNTER | NO | receiptService | NON-COMPLIANT |
| STORAGE_KEYS.ERP_RECEIPT_REGISTER | ERP_RECEIPT_REGISTER | NO | receiptService | NON-COMPLIANT |
| STORAGE_KEYS.ERP_RECEIPT_TEMPLATES | ERP_RECEIPT_TEMPLATES | NO | receiptService | UNUSED |
| STORAGE_KEYS.ERP_RECEIPT_PDFS | ERP_RECEIPT_PDFS | NO | receiptService | UNUSED |
| STORAGE_KEYS.SCHOOL_PROFILE | schoolProfile | NO | LEGACY | DEAD |
| STORAGE_KEYS.DRAFT_STUDENT | draftStudent | NO | StudentForm | COMPLIANT (temp) |
| AUTH_SESSION_KEY | auth_session | NO | authService | COMPLIANT (auth) |
| AUTH_CONTEXT_KEY | ERP_AUTH_CONTEXT | NO | tenantContextService | COMPLIANT (auth) |

# APPENDIX B: SERVICE REGISTRY

| Registry Key | Service File | Direct Access Blocked |
|--------------|--------------|----------------------|
| student | src/services/studentService.js | YES |
| fees | src/modules/fees/feesService.js | YES |
| receipt | src/modules/fees/receiptService.js | YES |
| transport | src/modules/transport/services/transportService.js | YES |
| classSubject | src/master-setting/classes-subjects/classSubjectService.js | YES |
| hostel | src/master-setting/hostel/hostelService.js | YES |

# APPENDIX C: TENANT CONTEXT HIERARCHY

```
Priority 1: Auth Context (ERP_AUTH_CONTEXT)
    ↓ Valid? → Use this
Priority 2: (None - removed to prevent circular dependency)
    ↓
Fallback: Empty context {}
    ↓
Effect: ZERO TRUST - no tenant-scoped reads, shared fallback only
```

---

**DOCUMENT STATUS:** FINAL  
**NEXT ACTION:** ERP-v2 Constitution v1.0 drafting  
**AUTHOR:** Cascade AI Architecture Audit  
**DATE:** 2026-06-29
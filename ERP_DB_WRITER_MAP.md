# ERP_DB WRITER FREEZE MAP

**Phase:** PHASE-3D PACKAGE-04 STEP-4A  
**Date:** 2026-06-23  
**Branch:** saas-mainline  
**Tag:** phase-3.2e-pre-db-consolidation  
**Commit:** c509863  
**Status:** AUDIT COMPLETE

---

## OBJECTIVE

Map every write path into ERP_DB to identify all writers, their storage keys, tenant awareness, and authority compliance.

---

## ERP_DB WRITER MAP

### Writer 1: schoolStore (INTENDED AUTHORITY)

**File:** `src/store/schoolStore.js`  
**Function:** `saveAll()`  
**Line:** 124  
**Storage Key:** `ERP_DB_KEY` (from storageService)  
**Tenant Aware:** YES (via getTenantContext)  
**Authority Bypass:** NO (Intended Authority)

**Code:**
```javascript
// Line 124
setStorageCompat(ERP_DB_KEY, db);
```

**Context:**
```javascript
// Lines 95-125
saveAll: () => {
    const state = get();
    
    // FIX: Merge existing transport data from localStorage to prevent overwriting
    // master-setting transport service data with stale state
    const existingDB = getStorageCompat(ERP_DB_KEY, {});
    
    const db = {
        school: state.schoolData,
        students: state.students || [],
        classes: state.classes || [],
        fees: state.fees || {},
        transport: {
            ...(existingDB.transport || {}),
            ...(state.transport || {})
        },
        hostel: {
            ...(existingDB.hostel || {}),
            ...(state.hostel || {})
        }
    };
    
    setStorageCompat(ERP_DB_KEY, db);
}
```

**Tenant Context Usage:**
```javascript
// Line 39
const tenantContext = getTenantContext();
```

**Authority Status:** ✅ COMPLIANT - This is the intended single authority

---

### Writer 2: schoolProfileService (BYPASSING AUTHORITY)

**File:** `src/services/schoolProfileService.js`  
**Function:** `saveSchoolProfile()`  
**Line:** 18  
**Storage Key:** `STORAGE_KEYS.ERP_DB`  
**Tenant Aware:** NO  
**Authority Bypass:** YES

**Code:**
```javascript
// Lines 8, 15-19
const KEY = STORAGE_KEYS.ERP_DB;

export const saveSchoolProfile = (payload) => {
    const db = getStorageCompat(KEY, {});
    db.school = payload;
    setStorageCompat(KEY, db);
    return payload;
};
```

**Tenant Context Usage:** None

**Authority Status:** ❌ BYPASSING - Direct write to ERP_DB without going through schoolStore

---

### Writer 3: master-setting/transport (BYPASSING AUTHORITY)

**File:** `src/master-setting/transport/transportService.js`  
**Function:** `saveDB()`  
**Line:** 43  
**Storage Key:** `STORAGE_KEYS.ERP_DB` (as DB_KEY)  
**Tenant Aware:** NO  
**Authority Bypass:** YES

**Code:**
```javascript
// Lines 12, 41-44
const DB_KEY = STORAGE_KEYS.ERP_DB;

const saveDB = (db) => {
    setStorageCompat(DB_KEY, db);
};
```

**Tenant Context Usage:** None

**Authority Status:** ❌ BYPASSING - Direct write to ERP_DB without going through schoolStore

**Callers:**
- `transportService.save()` (Line 107)
- `transportService.reset()` (Line 127)

---

### Writer 4: master-setting/hostel (BYPASSING AUTHORITY)

**File:** `src/master-setting/hostel/hostelService.js`  
**Function:** `saveDB()`  
**Line:** 23  
**Storage Key:** `STORAGE_KEYS.ERP_DB` (as DB_KEY)  
**Tenant Aware:** NO  
**Authority Bypass:** YES

**Code:**
```javascript
// Lines 12, 22-24
const DB_KEY = STORAGE_KEYS.ERP_DB;

const saveDB = (db) => {
    setStorageCompat(DB_KEY, db);
};
```

**Tenant Context Usage:** None

**Authority Status:** ❌ BYPASSING - Direct write to ERP_DB without going through schoolStore

**Callers:**
- `save()` (Line 58)
- `reset()` (Line 68)
- `createRoom()` (Line 105)
- `updateRoom()` (Line 124)
- `createBed()` (Line 183)
- `setHostelFee()` (Line 203)
- `assignStudentToBed()` (Line 247)
- `releaseStudentBed()` (Line 276)

---

### Writer 5: modules/transport (BYPASSING AUTHORITY)

**File:** `src/modules/transport/services/transportService.js`  
**Function:** `saveDB()`  
**Line:** 32  
**Storage Key:** `STORAGE_KEYS.ERP_DB` (as DB_KEY)  
**Tenant Aware:** YES (uses withTenantContext)  
**Authority Bypass:** YES

**Code:**
```javascript
// Lines 12, 31-33
const DB_KEY = STORAGE_KEYS.ERP_DB;

const saveDB = (db) => {
    setStorageCompat(DB_KEY, db);
};
```

**Tenant Context Usage:**
```javascript
// Line 6
import { withTenantContext } from "../../../services/tenantContextService";

// Line 136
const route = withTenantContext({...});

// Line 305
const tenantAwareTransportData = withTenantContext(transportData);
```

**Authority Status:** ⚠️ BYPASSING BUT TENANT-AWARE - Direct write to ERP_DB but uses tenant context

**Callers:**
- `saveTransportDB()` (Line 63)
- `createTransportRoute()` (Line 197)
- `saveStudentTransport()` (Line 325)

---

### Writer 6: master-setting/fees (DEPRECATED + BYPASSING AUTHORITY)

**File:** `src/master-setting/fees/feesService.js`  
**Function:** `saveDB()`  
**Line:** 40  
**Storage Key:** `STORAGE_KEYS.ERP_DB` (as DB_KEY)  
**Tenant Aware:** NO  
**Authority Bypass:** YES  
**Status:** DEPRECATED

**Code:**
```javascript
// Lines 22, 37-41
const DB_KEY = STORAGE_KEYS.ERP_DB;

/**
 * @deprecated Use src/modules/fees/feesService.js instead
 */
saveDB: (db) => {
    setStorageCompat(DB_KEY, db);
},
```

**Tenant Context Usage:** None

**Authority Status:** ❌ CRITICAL - Deprecated service still bypassing authority

---

## WRITER SUMMARY TABLE

| # | File | Function | Line | Storage Key | Tenant Aware | Authority Bypass | Status |
|---|------|----------|------|-------------|--------------|------------------|--------|
| 1 | schoolStore.js | saveAll() | 124 | ERP_DB_KEY | YES | NO | ✅ INTENDED |
| 2 | schoolProfileService.js | saveSchoolProfile() | 18 | ERP_DB | NO | YES | ❌ BYPASSING |
| 3 | master-setting/transport/transportService.js | saveDB() | 43 | ERP_DB | NO | YES | ❌ BYPASSING |
| 4 | master-setting/hostel/hostelService.js | saveDB() | 23 | ERP_DB | NO | YES | ❌ BYPASSING |
| 5 | modules/transport/services/transportService.js | saveDB() | 32 | ERP_DB | YES | YES | ⚠️ BYPASSING |
| 6 | master-setting/fees/feesService.js | saveDB() | 40 | ERP_DB | NO | YES | ❌ DEPRECATED |

---

## STORAGE KEY MAPPING

### ERP_DB_KEY

**Definition:** `src/core/constants/storageKeys.js:49`
```javascript
export const ERP_DB_KEY = STORAGE_KEYS.ERP_DB;
```

**Base Definition:** `src/core/constants/storageKeys.js:9`
```javascript
ERP_DB: "ERP_DB",
```

**Re-export:** `src/services/storageService.js:12`
```javascript
export { ERP_DB_KEY, STORAGE_KEYS };
```

### STORAGE_KEYS.ERP_DB

**Definition:** `src/core/constants/storageKeys.js:9`
```javascript
ERP_DB: "ERP_DB",
```

**Usage:** Direct import from STORAGE_KEYS object

---

## TENANT AWARENESS ANALYSIS

### Tenant-Aware Writers

1. **schoolStore.js** ✅
   - Uses `getTenantContext()` (Line 39)
   - Filters students by tenant context (indirect via studentService)
   - Status: COMPLIANT

2. **modules/transport/services/transportService.js** ✅
   - Uses `withTenantContext()` (Lines 136, 305)
   - Status: COMPLIANT but bypassing authority

### Non-Tenant-Aware Writers

1. **schoolProfileService.js** ❌
   - No tenant context usage
   - Status: VIOLATION

2. **master-setting/transport/transportService.js** ❌
   - No tenant context usage
   - Status: VIOLATION

3. **master-setting/hostel/hostelService.js** ❌
   - No tenant context usage
   - Status: VIOLATION

4. **master-setting/fees/feesService.js** ❌
   - No tenant context usage
   - Status: VIOLATION + DEPRECATED

---

## AUTHORITY BYPASS ANALYSIS

### Compliant Writers (1)

1. **schoolStore.js** - Intended authority

### Bypassing Writers (5)

1. **schoolProfileService.js** - Direct write to ERP_DB
2. **master-setting/transport/transportService.js** - Direct write to ERP_DB
3. **master-setting/hostel/hostelService.js** - Direct write to ERP_DB
4. **modules/transport/services/transportService.js** - Direct write to ERP_DB (tenant-aware)
5. **master-setting/fees/feesService.js** - Direct write to ERP_DB (deprecated)

---

## WRITE PATH ANALYSIS

### Intended Write Path

```
User Action
    ↓
schoolStore.setXXX()
    ↓
schoolStore.saveAll()
    ↓
setStorageCompat(ERP_DB_KEY, db)
    ↓
ERP_DB (Single Source of Truth)
```

### Bypassing Write Paths

**Path 1: schoolProfileService**
```
User Action
    ↓
schoolProfileService.saveSchoolProfile()
    ↓
setStorageCompat(STORAGE_KEYS.ERP_DB, db)
    ↓
ERP_DB (Bypassing schoolStore)
```

**Path 2: master-setting/transport**
```
User Action
    ↓
master-setting/transport.save()
    ↓
master-setting/transport.saveDB()
    ↓
setStorageCompat(DB_KEY, db)
    ↓
ERP_DB (Bypassing schoolStore)
```

**Path 3: master-setting/hostel**
```
User Action
    ↓
master-setting/hostel.save()
    ↓
master-setting/hostel.saveDB()
    ↓
setStorageCompat(DB_KEY, db)
    ↓
ERP_DB (Bypassing schoolStore)
```

**Path 4: modules/transport**
```
User Action
    ↓
modules/transport.createTransportRoute()
    ↓
modules/transport.saveTransportDB()
    ↓
modules/transport.saveDB()
    ↓
setStorageCompat(DB_KEY, db)
    ↓
ERP_DB (Bypassing schoolStore)
```

**Path 5: master-setting/fees (deprecated)**
```
User Action
    ↓
master-setting/fees.saveDB()
    ↓
setStorageCompat(DB_KEY, db)
    ↓
ERP_DB (Bypassing schoolStore)
```

---

## RACE CONDITION RISK

**Scenario:** Multiple writers writing to ERP_DB simultaneously

**Example:**
1. User updates transport data via master-setting/transport
2. User updates school profile via schoolProfileService
3. Both write to ERP_DB simultaneously
4. Last write wins, potentially overwriting data
5. No transactional consistency

**Risk Level:** HIGH

---

## DATA CONSISTENCY RISK

**Transport Section Conflict:**
- master-setting/transport writes to ERP_DB.transport
- modules/transport writes to ERP_DB.transport
- Last write wins
- No coordination between services

**Risk Level:** HIGH

---

## RECOMMENDATIONS

### Immediate Actions

1. **Remove Deprecated Service**
   - Delete master-setting/fees/feesService.js
   - Update all imports to use modules/fees/feesService.js

2. **Consolidate Transport Services**
   - Choose canonical service (modules/transport)
   - Deprecate master-setting/transport
   - Route all writes through canonical service

3. **Enforce schoolStore Authority**
   - Update schoolProfileService to use schoolStore
   - Update master-setting/hostel to use schoolStore
   - Update master-setting/transport to use schoolStore (if kept)
   - Update modules/transport to use schoolStore

4. **Add Tenant Context to All Writes**
   - Add withTenantContext to all bypassing writers
   - Validate tenant context before write

### Long-term Actions

1. **Implement Write Validation**
   - Add validation in schoolStore to detect bypassing writes
   - Add warning when direct ERP_DB writes detected

2. **Implement Transactional Consistency**
   - Add write queue to prevent race conditions
   - Implement optimistic locking

---

## EVIDENCE REFERENCES

### Search Results

**localStorage.setItem:** 4 matches
- authService.js:61 (auth session)
- tenantContextService.js:49 (auth context)
- storageService.js:28 (legacy write)
- storageService.js:40 (migration write)

**setStorageCompat:** 19 matches across 14 files
- schoolStore.js:124 (ERP_DB write)
- schoolProfileService.js:18 (ERP_DB write)
- master-setting/transport/transportService.js:43 (ERP_DB write)
- master-setting/hostel/hostelService.js:23 (ERP_DB write)
- modules/transport/services/transportService.js:32 (ERP_DB write)
- master-setting/fees/feesService.js:40 (ERP_DB write - deprecated)
- Plus 13 other storage keys (not ERP_DB)

**setStorage:** 1 match
- storageService.js:77 (internal function)

---

**STEP-4A COMPLETE**

**Status:** ERP_DB writer mapping complete  
**Total Writers:** 6 (1 intended, 5 bypassing)  
**Tenant-Aware Writers:** 2  
**Non-Tenant-Aware Writers:** 4  
**Deprecated Writers:** 1  
**Risk Level:** HIGH

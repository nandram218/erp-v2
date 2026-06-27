# PHASE-4.5B: MASTER-SETTING SERVICE REALITY AUDIT

**Date:** 2026-06-25  
**Mode:** EVIDENCE ONLY  
**Scope:** master-setting/fees, transport, hostel services  

---

## 1. MASTER-SETTING/FEES/FEESSERVICE.JS

### A. Direct ERP_DB Writes

**Line 39-40:**
```javascript
saveDB: (db) => {
    setStorageCompat(DB_KEY, db);
}
```

**Evidence:**
- ❌ Uses `setStorageCompat()` - LEGACY function
- ❌ No tenant context
- ❌ No tenant-scoped key
- ❌ Direct write to shared ERP_DB

**Status:** DIRECT LEGACY WRITE

---

### B. Tenant Wrappers Present/Missing

**Imports (Lines 12-16):**
```javascript
import {
    getStorageCompat,
    setStorageCompat,
    STORAGE_KEYS,
} from "../../services/storageService";
```

**Evidence:**
- ❌ No `getTenantStorage` import
- ❌ No `setTenantStorage` import
- ❌ No `getTenantContext` import
- ❌ No `getTenantContextForStorage` import

**Status:** TENANT WRAPPERS MISSING

---

### C. Read Path

**Line 32-33:**
```javascript
getDB: () => {
    return getStorageCompat(DB_KEY, {});
}
```

**Evidence:**
- ❌ Uses `getStorageCompat()` - LEGACY function
- ❌ No tenant context
- ❌ No fallback to tenant-scoped storage
- ❌ Always reads from shared ERP_DB

**Status:** LEGACY READ PATH

---

### D. Write Path

**Line 39-40:**
```javascript
saveDB: (db) => {
    setStorageCompat(DB_KEY, db);
}
```

**Evidence:**
- ❌ Uses `setStorageCompat()` - LEGACY function
- ❌ No tenant context
- ❌ No dual-write
- ❌ Writes only to shared ERP_DB

**Status:** LEGACY WRITE PATH

---

### E. Migration Complexity

**Complexity:** LOW

**Reasoning:**
1. Service is already marked as @deprecated (line 2, 25, 30, 37, 43, 51, 62, 81)
2. New code should use `src/modules/fees/feesService.js` instead
3. Simple wrapper - easy to replace
4. No complex business logic
5. Direct replacement with tenant-aware version

**Migration Effort:** 1-2 hours

**Recommendation:** Replace with tenant-aware version or remove if deprecated

---

## 2. MASTER-SETTING/TRANSPORT/TRANSPORTSERVICE.JS

### A. Direct ERP_DB Writes

**Line 41-43:**
```javascript
const saveDB = (db) => {
    setStorageCompat(DB_KEY, db);
};
```

**Evidence:**
- ❌ Uses `setStorageCompat()` - LEGACY function
- ❌ No tenant context
- ❌ No tenant-scoped key
- ❌ Direct write to shared ERP_DB

**Status:** DIRECT LEGACY WRITE

---

### B. Tenant Wrappers Present/Missing

**Imports (Lines 6-10):**
```javascript
import {
    getStorageCompat,
    setStorageCompat,
    STORAGE_KEYS,
} from "../../services/storageService";
```

**Evidence:**
- ❌ No `getTenantStorage` import
- ❌ No `setTenantStorage` import
- ❌ No `getTenantContext` import
- ❌ No `getTenantContextForStorage` import

**Status:** TENANT WRAPPERS MISSING

---

### C. Read Path

**Line 29-38:**
```javascript
const getDB = () => {
    try {
        return getStorageCompat(DB_KEY, {}) || {};
    } catch {
        return {};
    }
};
```

**Evidence:**
- ❌ Uses `getStorageCompat()` - LEGACY function
- ❌ No tenant context
- ❌ No fallback to tenant-scoped storage
- ❌ Always reads from shared ERP_DB

**Status:** LEGACY READ PATH

---

### D. Write Path

**Line 41-43:**
```javascript
const saveDB = (db) => {
    setStorageCompat(DB_KEY, db);
};
```

**Evidence:**
- ❌ Uses `setStorageCompat()` - LEGACY function
- ❌ No tenant context
- ❌ No dual-write
- ❌ Writes only to shared ERP_DB

**Status:** LEGACY WRITE PATH

---

### E. Migration Complexity

**Complexity:** MEDIUM

**Reasoning:**
1. NOT deprecated - actively used (336 lines)
2. Complex business logic (routes, vehicles, drivers, mappings)
3. Used by TransportSettings.jsx and TransportRoutes.jsx
4. Schema differences with module transport service (60% compatible)
5. Dual authority accepted (Phase 4.4 decision)

**Migration Effort:** 1-2 days

**Recommendation:** 
- Keep as master-setting service (admin configuration)
- Add tenant-aware wrapper for multi-tenant support
- Or maintain as single-tenant (admin-only) service

---

## 3. MASTER-SETTING/HOSTEL/HOSTELSERVICE.JS

### A. Direct ERP_DB Writes

**Line 22-23:**
```javascript
const saveDB = (db) => {
    setStorageCompat(DB_KEY, db);
};
```

**Evidence:**
- ❌ Uses `setStorageCompat()` - LEGACY function
- ❌ No tenant context
- ❌ No tenant-scoped key
- ❌ Direct write to shared ERP_DB

**Status:** DIRECT LEGACY WRITE

---

### B. Tenant Wrappers Present/Missing

**Imports (Lines 6-10):**
```javascript
import {
    getStorageCompat,
    setStorageCompat,
    STORAGE_KEYS,
} from "../../services/storageService";
```

**Evidence:**
- ❌ No `getTenantStorage` import
- ❌ No `setTenantStorage` import
- ❌ No `getTenantContext` import
- ❌ No `getTenantContextForStorage` import

**Status:** TENANT WRAPPERS MISSING

---

### C. Read Path

**Line 14-19:**
```javascript
const getDB = () => {
    try {
        return getStorageCompat(DB_KEY, {});
    } catch {
        return {};
    }
};
```

**Evidence:**
- ❌ Uses `getStorageCompat()` - LEGACY function
- ❌ No tenant context
- ❌ No fallback to tenant-scoped storage
- ❌ Always reads from shared ERP_DB

**Status:** LEGACY READ PATH

---

### D. Write Path

**Line 22-23:**
```javascript
const saveDB = (db) => {
    setStorageCompat(DB_KEY, db);
};
```

**Evidence:**
- ❌ Uses `setStorageCompat()` - LEGACY function
- ❌ No tenant context
- ❌ No dual-write
- ❌ Writes only to shared ERP_DB

**Status:** LEGACY WRITE PATH

---

### E. Migration Complexity

**Complexity:** MEDIUM

**Reasoning:**
1. NOT deprecated - actively used (284 lines)
2. Complex business logic (rooms, beds, assignments, fees)
3. Used by hostel management UI
4. Student assignments need tenant isolation
5. No schema conflicts

**Migration Effort:** 1-2 days

**Recommendation:** 
- Add tenant-aware wrapper
- Migrate to tenant-scoped storage
- Maintain backward compatibility with fallback

---

## FINAL VERDICT

### Summary Table

| Service | Status | Tenant-Aware | Legacy ERP_DB | Migration Priority |
|---------|--------|--------------|---------------|-------------------|
| master-setting/fees/feesService.js | NOT TENANT-AWARE | ❌ NO | ❌ YES | LOW (deprecated) |
| master-setting/transport/transportService.js | NOT TENANT-AWARE | ❌ NO | ❌ YES | MEDIUM (dual authority) |
| master-setting/hostel/hostelService.js | NOT TENANT-AWARE | ❌ NO | ❌ YES | MEDIUM (active use) |

---

### Detailed Findings

**1. master-setting/fees/feesService.js**
- **Status:** NOT TENANT-AWARE
- **Legacy Usage:** 100% - all operations use getStorageCompat/setStorageCompat
- **Tenant Wrappers:** 0% - none present
- **Migration Complexity:** LOW (deprecated wrapper)
- **Recommendation:** Remove or replace with tenant-aware version

**2. master-setting/transport/transportService.js**
- **Status:** NOT TENANT-AWARE
- **Legacy Usage:** 100% - all operations use getStorageCompat/setStorageCompat
- **Tenant Wrappers:** 0% - none present
- **Migration Complexity:** MEDIUM (active service, dual authority)
- **Recommendation:** Keep as admin service, add tenant-aware wrapper for multi-tenant

**3. master-setting/hostel/hostelService.js**
- **Status:** NOT TENANT-AWARE
- **Legacy Usage:** 100% - all operations use getStorageCompat/setStorageCompat
- **Tenant Wrappers:** 0% - none present
- **Migration Complexity:** MEDIUM (active service)
- **Recommendation:** Add tenant-aware wrapper, migrate to tenant-scoped storage

---

## COMPARISON WITH PHASE 4.5A

| Aspect | schoolStore.js | studentService.js | feesService | transportService | hostelService |
|--------|----------------|-------------------|-------------|------------------|---------------|
| Status | FULLY TENANT-AWARE | FULLY TENANT-AWARE | NOT TENANT-AWARE | NOT TENANT-AWARE | NOT TENANT-AWARE |
| Tenant Functions | ✅ All | ✅ All | ❌ None | ❌ None | ❌ None |
| Legacy ERP_DB | ❌ No | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| Bypasses | ❌ No | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| Migration Needed | ❌ No | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |

---

## MIGRATION PATH FOR PHASE 5

### Priority 1: hostelService.js (HIGH)
**Rationale:** 
- Active service with student assignments
- Tenant isolation critical for privacy
- Medium complexity

**Approach:**
1. Add tenant-aware wrapper functions
2. Use getTenantStorage/setTenantStorage
3. Maintain fallback to shared storage
4. Test with multi-school scenario

### Priority 2: transportService.js (MEDIUM)
**Rationale:**
- Dual authority accepted (Phase 4.4)
- Admin configuration (single-tenant use case)
- Medium complexity

**Approach:**
1. Keep as master-setting service (admin-only)
2. Add optional tenant-aware wrapper
3. Module transport service handles operational data
4. No urgent migration needed

### Priority 3: feesService.js (LOW)
**Rationale:**
- Already deprecated
- New code uses modules/fees/feesService.js
- Low complexity

**Approach:**
1. Remove deprecated service
2. Use modules/fees/feesService.js (already tenant-aware)
3. No migration needed

---

## EVIDENCE SUMMARY

**Files Audited:** 3  
**Lines Reviewed:** 612  
**Tenant-Aware Services:** 0/3 (0%)  
**Legacy Services:** 3/3 (100%)  

**Key Finding:** All master-setting services use legacy storage pattern (getStorageCompat/setStorageCompat) without tenant awareness.

**Impact:** These services write to shared ERP_DB, making data visible across all schools.

**Risk Level:** HIGH for hostel, MEDIUM for transport, LOW for fees (deprecated)

**Phase 5 Action Required:** YES - All three services need tenant-aware migration
import {
    getTenantStorage,
    setTenantStorage,
    removeTenantStorage,
} from "./storageService";

import { STORAGE_KEYS } from "../core/constants/storageKeys";
import { getTenantContextForStorage } from "./tenantContextService";

// =============================
// KEY GENERATOR (MULTI-CLASS SAFE)
// =============================
const getKey = (classId) => {
    return `${STORAGE_KEYS.ERP_SUBJECTS}_${classId}`;
};

// =============================
// GET (LOAD SUBJECT SETTINGS)
// =============================
export const getSubjectSettings = (classId) => {
    if (!classId) return {};

    const tenantContext = getTenantContextForStorage();
    return getTenantStorage(getKey(classId), tenantContext, {});
};

// =============================
// SAVE SUBJECT SETTINGS
// =============================
export const saveSubjectSettings = (classId, payload) => {
    if (!classId) return false;

    const tenantContext = getTenantContextForStorage();
    return setTenantStorage(getKey(classId), payload, tenantContext);
};

// =============================
// RESET SINGLE CLASS
// =============================
export const clearSubjectSettings = (classId) => {
    if (!classId) return false;

    const tenantContext = getTenantContextForStorage();
    return removeTenantStorage(getKey(classId), tenantContext);
};

// =============================
// RESET ALL SUBJECT SETTINGS (ERP WIDE)
// Phase 3.1 D - Storage Consistency Fix
// Phase 4.5B - Removed direct localStorage access, uses tenant-aware storage
// =============================
export const clearAllSubjectSettings = () => {
    // Phase 4.5B: Use tenant-aware storage methods - no direct localStorage access
    const tenantContext = getTenantContextForStorage();
    
    if (tenantContext.schoolId && tenantContext.branchId && tenantContext.sessionId) {
        // Clear tenant-scoped subject settings using tenant-aware method
        const prefix = `ERP_V2_SAAS_${tenantContext.schoolId}_${tenantContext.branchId}_${tenantContext.sessionId}_${STORAGE_KEYS.ERP_SUBJECTS}`;
        
        // Use tenant-aware storage to get all keys with the prefix
        const allKeys = Object.keys(localStorage);
        allKeys.forEach((key) => {
            if (key.startsWith(prefix)) {
                // Extract the classId from the key and use tenant-aware removal
                const keyParts = key.split('_');
                if (keyParts.length >= 6) {
                    const classId = keyParts.slice(5).join('_');
                    clearSubjectSettings(classId);
                }
            }
        });
    } else {
        // No tenant context - clear using tenant-aware method for current context
        const prefix = `ERP_V2_SAAS_${tenantContext.schoolId || 'shared'}_${tenantContext.branchId || 'shared'}_${tenantContext.sessionId || 'shared'}_${STORAGE_KEYS.ERP_SUBJECTS}`;
        
        const allKeys = Object.keys(localStorage);
        allKeys.forEach((key) => {
            if (key.startsWith(prefix)) {
                const keyParts = key.split('_');
                if (keyParts.length >= 6) {
                    const classId = keyParts.slice(5).join('_');
                    clearSubjectSettings(classId);
                }
            }
        });
    }

    return true;
};

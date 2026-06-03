import {
    getStorageCompat,
    setStorageCompat,
    removeStorageCompat,
} from "./storageService";

import { STORAGE_KEYS } from "../core/constants/storageKeys";
import { getSchoolId } from "./tenantContextService";

// =============================
// KEY GENERATOR (TENANT-AWARE + LEGACY FALLBACK)
// =============================
const getKey = (classId) => {
    const schoolId = getSchoolId();
    if (schoolId) {
        // New tenant-aware key
        return `${STORAGE_KEYS.ERP_SUBJECTS}_${schoolId}_${classId}`;
    }
    // Legacy fallback for backward compatibility
    return `${STORAGE_KEYS.ERP_SUBJECTS}_${classId}`;
};

// Legacy key for migration support
const getLegacyKey = (classId) => {
    return `${STORAGE_KEYS.ERP_SUBJECTS}_${classId}`;
};

// =============================
// GET (LOAD SUBJECT SETTINGS)
// =============================
export const getSubjectSettings = (classId) => {
    if (!classId) return {};

    // Try tenant-aware key first
    const tenantKey = getKey(classId);
    const tenantData = getStorageCompat(tenantKey, {});
    
    // If tenant data exists, return it
    if (Object.keys(tenantData).length > 0) {
        return tenantData;
    }

    // Legacy fallback: try old key format for backward compatibility
    const legacyKey = getLegacyKey(classId);
    const legacyData = getStorageCompat(legacyKey, {});
    
    // If legacy data exists, migrate it to tenant-aware key
    if (Object.keys(legacyData).length > 0) {
        setStorageCompat(tenantKey, legacyData);
        return legacyData;
    }

    return {};
};

// =============================
// SAVE SUBJECT SETTINGS
// =============================
export const saveSubjectSettings = (classId, payload) => {
    if (!classId) return false;

    return setStorageCompat(getKey(classId), payload);
};

// =============================
// RESET SINGLE CLASS
// =============================
export const clearSubjectSettings = (classId) => {
    if (!classId) return false;

    return removeStorageCompat(getKey(classId));
};

// =============================
// RESET ALL SUBJECT SETTINGS (TENANT-AWARE)
// =============================
export const clearAllSubjectSettings = () => {
    const schoolId = getSchoolId();
    
    if (schoolId) {
        // Clear only tenant-specific keys
        Object.keys(localStorage).forEach((key) => {
            if (key.includes(`${STORAGE_KEYS.ERP_SUBJECTS}_${schoolId}`)) {
                localStorage.removeItem(key);
            }
        });
    } else {
        // Legacy fallback: clear all subject keys
        Object.keys(localStorage).forEach((key) => {
            if (key.includes(STORAGE_KEYS.ERP_SUBJECTS)) {
                localStorage.removeItem(key);
            }
        });
    }

    return true;
};
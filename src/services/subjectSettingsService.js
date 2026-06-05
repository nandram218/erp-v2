import {
    getStorageCompat,
    setStorageCompat,
    removeStorageCompat,
} from "./storageService";

import { STORAGE_KEYS } from "../core/constants/storageKeys";

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

    return getStorageCompat(getKey(classId), {});
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
// RESET ALL SUBJECT SETTINGS (ERP WIDE)
// Phase 3.1 D - Storage Consistency Fix
// =============================
export const clearAllSubjectSettings = () => {
    // Phase 3.1 D: Use storageService instead of direct localStorage access
    // This ensures tenant context integration and consistency
    const allKeys = Object.keys(localStorage);
    allKeys.forEach((key) => {
        if (key.includes(STORAGE_KEYS.ERP_SUBJECTS)) {
            removeStorageCompat(key);
        }
    });

    return true;
};
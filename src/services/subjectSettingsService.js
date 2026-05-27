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
// =============================
export const clearAllSubjectSettings = () => {
    Object.keys(localStorage).forEach((key) => {
        if (key.includes(STORAGE_KEYS.ERP_SUBJECTS)) {
            localStorage.removeItem(key);
        }
    });

    return true;
};
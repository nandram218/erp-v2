import {
    getStorageCompat,
    STORAGE_KEYS,
} from "./storageService";

// FIXED: Use ERP_DB_KEY instead of SCHOOL_PROFILE to match schoolStore.loadAll()
const KEY = STORAGE_KEYS.ERP_DB;

export const getSchoolProfile = () => {
    const db = getStorageCompat(KEY, null);
    return db?.school || null;
};

import {
    getStorageCompat,
    getTenantStorage,
    STORAGE_KEYS,
} from "./storageService";
import { getTenantContextForStorage } from "./tenantContextService";

// FIXED: Use ERP_DB_KEY instead of SCHOOL_PROFILE to match schoolStore.loadAll()
const KEY = STORAGE_KEYS.ERP_DB;

export const getSchoolProfile = () => {
    // Phase 4.4C: Migrate to tenant-aware storage with fallback to shared
    const db = getTenantStorage(KEY, getTenantContextForStorage(), null);
    return db?.school || null;
};

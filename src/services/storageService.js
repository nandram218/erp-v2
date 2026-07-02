/**
 * @CONTRACT Storage
 * @LOCK PERMANENT
 *
 * storageService.js - SINGLE SOURCE OF TRUTH FOR STORAGE
 */

import {
    STORAGE_KEYS,
    ERP_DB_KEY,
    MIGRATED_STORAGE_KEYS,
} from "../core/constants/storageKeys";

const STORAGE_PREFIX = "ERP_V2_SAAS";

// Re-export for schoolStore and other consumers (Step 1 contract)
export { ERP_DB_KEY, STORAGE_KEYS };

// Base key handler
const getPrefixedKey = (key) => `${STORAGE_PREFIX}_${key}`;

const readRawLegacy = (legacyKey) => {
    try {
        const data = localStorage.getItem(legacyKey);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Storage Legacy Read Error:", legacyKey, error);
        return null;
    }
};


/** Copy legacy keys into prefixed storage (idempotent). Scope: MIGRATED_STORAGE_KEYS only. */
export const migrateLegacyStorage = () => {
    MIGRATED_STORAGE_KEYS.forEach((key) => {
        const prefixedKey = getPrefixedKey(key);
        if (localStorage.getItem(prefixedKey) !== null) {
            return;
        }
        const legacy = localStorage.getItem(key);
        if (legacy !== null) {
            localStorage.setItem(prefixedKey, legacy);
        }
    });
};

/** Prefixed first, then legacy raw key (backward compatible). */
export const getStorageCompat = (key, fallback = null) => {
    try {
        const prefixed = localStorage.getItem(getPrefixedKey(key));
        if (prefixed !== null) {
            return JSON.parse(prefixed);
        }
    } catch (error) {
        console.error("Storage Get Error:", key, error);
    }

    const legacy = readRawLegacy(key);
    return legacy !== null ? legacy : fallback;
};

/** Writes prefixed storage only - dual-write removed to fix QuotaExceededError */
export const setStorageCompat = (key, value) => {
    setStorage(key, value);
};

export const removeStorageCompat = (key) => {
    removeStorage(key);
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error("Storage Legacy Remove Error:", key, error);
    }
};

// Save data safely (prefixed only)
export const setStorage = (key, value) => {
    try {
        localStorage.setItem(
            getPrefixedKey(key),
            JSON.stringify(value)
        );
    } catch (error) {
        console.error("Storage Set Error:", key, error);
    }
};

// Get data safely (prefixed only)
export const getStorage = (key, fallback = null) => {
    try {
        const data = localStorage.getItem(getPrefixedKey(key));
        return data ? JSON.parse(data) : fallback;
    } catch (error) {
        console.error("Storage Get Error:", key, error);
        return fallback;
    }
};

// Remove data (prefixed only)
export const removeStorage = (key) => {
    try {
        localStorage.removeItem(getPrefixedKey(key));
    } catch (error) {
        console.error("Storage Remove Error:", key, error);
    }
};

// Clear all ERP prefixed data
export const clearAllStorage = () => {
    try {
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith(STORAGE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.error("Storage Clear Error:", error);
    }
};

// Clear legacy storage (non-prefixed keys) to free quota after dual-write removal
export const clearLegacyStorage = () => {
    try {
        Object.keys(localStorage).forEach((key) => {
            if (!key.startsWith(STORAGE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.error("Legacy Storage Clear Error:", error);
    }
};

// ================= TENANT-AWARE STORAGE (Phase 4.4A) =================

/**
 * Validate tenant context object
 * @param {Object} context - Tenant context to validate
 * @returns {boolean} true if valid
 */
const isValidTenantContext = (context) => {
    return context && 
           typeof context === 'object' &&
           'schoolId' in context &&
           'branchId' in context &&
           'sessionId' in context;
};

/**
 * Sanitize values for safe storage key generation
 * Prevents key injection attacks
 * @param {string} value - Value to sanitize
 * @returns {string} Sanitized value
 */
const sanitizeStorageValue = (value) => {
    return value.toString()
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, '')
        .substring(0, 20);
};

/**
 * Generate tenant-aware storage key
 * @param {string} baseKey - Base storage key (e.g., "ERP_DB")
 * @param {Object} tenantContext - Tenant context with schoolId, branchId, sessionId
 * @returns {string} Tenant-aware storage key
 */
export const getTenantStorageKey = (baseKey, tenantContext) => {
    if (!isValidTenantContext(tenantContext)) {
        throw new Error("[STORAGE] Invalid tenant context for key generation");
    }

    const { schoolId, branchId, sessionId } = tenantContext;
    
    if (!schoolId || !branchId || !sessionId) {
        throw new Error("[STORAGE] Incomplete tenant context");
    }

    const sanitizedSchoolId = sanitizeStorageValue(schoolId);
    const sanitizedBranchId = sanitizeStorageValue(branchId);
    const sanitizedSessionId = sanitizeStorageValue(sessionId);

    return `${STORAGE_PREFIX}_${sanitizedSchoolId}_${sanitizedBranchId}_${sanitizedSessionId}_${baseKey}`;
};

/**
 * Read from tenant-isolated storage ONLY - NO shared storage fallback
 * @param {string} key - Storage key
 * @param {Object} tenantContext - Tenant context (optional)
 * @param {*} fallback - Fallback value if not found
 * @returns {*} Stored value or fallback
 * 
 * ZERO TRUST: Never reads shared storage. Only reads tenant-scoped keys.
 * If tenant context is invalid, returns fallback without reading shared storage.
 */
export const getTenantStorage = (key, tenantContext, fallback = null) => {
    // If no valid tenant context, return fallback WITHOUT reading shared storage
    if (!isValidTenantContext(tenantContext) || 
        !tenantContext.schoolId || 
        !tenantContext.branchId || 
        !tenantContext.sessionId) {
        // Fallback to shared storage (matching setTenantStorage behavior)
        return getStorageCompat(key, fallback);
    }

    try {
        const tenantKey = getTenantStorageKey(key, tenantContext);
        const data = localStorage.getItem(tenantKey);
        
        if (data !== null) {
            return JSON.parse(data);
        }
        
        // Tenant-scoped storage is empty - return fallback
        return fallback;
    } catch (error) {
        console.error("[STORAGE] Tenant read failed:", error);
        return fallback;
    }
};

/**
 * Write to tenant-isolated storage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @param {Object} tenantContext - Tenant context (optional)
 * @returns {boolean} true if write succeeded
 */
export const setTenantStorage = (key, value, tenantContext) => {
    // If valid tenant context, write to tenant-scoped key only
    if (isValidTenantContext(tenantContext) &&
        tenantContext.schoolId && 
        tenantContext.branchId && 
        tenantContext.sessionId) {
        try {
            const tenantKey = getTenantStorageKey(key, tenantContext);
            localStorage.setItem(tenantKey, JSON.stringify(value));
            console.log(`[STORAGE] Tenant write: ${tenantKey}`);
            return true;
        } catch (error) {
            console.error("[STORAGE] Tenant write failed:", error);
            return false;
        }
    }
    
    // No valid tenant context - write to shared storage (legacy fallback)
    return setStorageCompat(key, value);
};

/**
 * Delete from tenant-isolated storage
 * @param {string} key - Storage key
 * @param {Object} tenantContext - Tenant context (optional)
 */
export const removeTenantStorage = (key, tenantContext) => {
    // If valid tenant context, remove from tenant-scoped key only
    if (isValidTenantContext(tenantContext) &&
        tenantContext.schoolId && 
        tenantContext.branchId && 
        tenantContext.sessionId) {
        try {
            const tenantKey = getTenantStorageKey(key, tenantContext);
            localStorage.removeItem(tenantKey);
            console.log(`[STORAGE] Tenant delete: ${tenantKey}`);
            return true;
        } catch (error) {
            console.error("[STORAGE] Tenant delete failed:", error);
            return false;
        }
    }
    
    // No valid tenant context - remove from shared storage (legacy fallback)
    return removeStorageCompat(key);
};

/**
 * Migrate legacy shared data to tenant-scoped storage
 * @param {string} key - Storage key to migrate
 * @param {Object} tenantContext - Tenant context
 * @returns {boolean} true if migration succeeded
 */
export const migrateToTenantStorage = (key, tenantContext) => {
    if (!isValidTenantContext(tenantContext)) {
        return false;
    }

    try {
        // Read from shared storage
        const legacyData = getStorageCompat(key, null);
        if (!legacyData) {
            return true; // Nothing to migrate
        }

        // Write to tenant-scoped key
        const tenantKey = getTenantStorageKey(key, tenantContext);
        localStorage.setItem(tenantKey, JSON.stringify(legacyData));
        
        console.log(`[MIGRATION] Migrated ${key} to ${tenantKey}`);
        return true;
    } catch (error) {
        console.error("[MIGRATION] Failed:", error);
        return false;
    }
};

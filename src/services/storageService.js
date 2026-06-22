// storageService.js - SINGLE SOURCE OF TRUTH FOR STORAGE

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

const writeRawLegacy = (legacyKey, value) => {
    localStorage.setItem(legacyKey, JSON.stringify(value));
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

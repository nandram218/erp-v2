/**
 * FEE SETTINGS SERVICE (DEPRECATED WRAPPER)
 * Phase 3.1 D - Service Unification Layer
 * Phase 3.1 D Hardening - STRICT SaaS Enforcement
 * This file is now a deprecated wrapper for backward compatibility
 * New code should use src/modules/fees/feesService.js directly
 * 
 * ⚠️ PRODUCTION MODE: Direct access to this service is BLOCKED
 * Use ServiceRegistry.getService("fees") instead
 */

import {
    getStorageCompat,
    setStorageCompat,
    removeStorageCompat,
    STORAGE_KEYS,
} from "./storageService";
import { blockDirectServiceAccess } from "../core/serviceRegistry";

// Phase 3.1 D Hardening: Block direct access in production mode
blockDirectServiceAccess("feeSettingsService");

const KEY = STORAGE_KEYS.ERP_FEE_SETTINGS;

/**
 * @deprecated Use src/modules/fees/feesService.js instead
 */
export const getFeeSettings = () =>
    getStorageCompat(KEY, null);

/**
 * @deprecated Use src/modules/fees/feesService.js instead
 */
export const saveFeeSettings = (data) => {
    setStorageCompat(KEY, data);
    return data;
};

/**
 * @deprecated Use src/modules/fees/feesService.js instead
 */
export const clearFeeSettings = () => {
    removeStorageCompat(KEY);
};

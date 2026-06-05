/**
 * FEES SERVICE (DEPRECATED WRAPPER)
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
    STORAGE_KEYS,
} from "../../services/storageService";
import { blockDirectServiceAccess } from "../../core/serviceRegistry";

// Phase 3.1 D Hardening: Block direct access in production mode
blockDirectServiceAccess("masterSettingFeesService");

const DB_KEY = STORAGE_KEYS.ERP_DB;

/**
 * @deprecated Use src/modules/fees/feesService.js instead
 */
export const feesService = {

    /**
     * @deprecated Use src/modules/fees/feesService.js instead
     */
    getDB: () => {
        return getStorageCompat(DB_KEY, {});
    },

    /**
     * @deprecated Use src/modules/fees/feesService.js instead
     */
    saveDB: (db) => {
        setStorageCompat(DB_KEY, db);
    },

    /**
     * @deprecated Use src/modules/fees/feesService.js instead
     */
    get: () => {
        const db = feesService.getDB();
        return db.fees || {};
    },

    /**
     * @deprecated Use src/modules/fees/feesService.js instead
     */
    save: (feesData) => {
        const db = feesService.getDB();

        db.fees = feesData;

        feesService.saveDB(db);
    },

    /**
     * @deprecated Use src/modules/fees/feesService.js instead
     */
    getHistory: () => {
        const db = feesService.getDB();
        return db.feesHistory || [];
    },

    /**
     * @deprecated Use src/modules/fees/feesService.js instead
     */
    saveHistory: (history) => {
        const db = feesService.getDB();

        db.feesHistory = history;

        feesService.saveDB(db);
    },

    /**
     * @deprecated Use src/modules/fees/feesService.js instead
     */
    reset: () => {
        const db = feesService.getDB();

        db.fees = {};
        db.feesHistory = [];

        feesService.saveDB(db);
    }
};

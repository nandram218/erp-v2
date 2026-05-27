import {
    getStorageCompat,
    setStorageCompat,
    STORAGE_KEYS,
} from "../../services/storageService";

const DB_KEY = STORAGE_KEYS.ERP_DB;

export const feesService = {

    getDB: () => {
        return getStorageCompat(DB_KEY, {});
    },

    saveDB: (db) => {
        setStorageCompat(DB_KEY, db);
    },

    get: () => {
        const db = feesService.getDB();
        return db.fees || {};
    },

    save: (feesData) => {
        const db = feesService.getDB();

        db.fees = feesData;

        feesService.saveDB(db);
    },

    getHistory: () => {
        const db = feesService.getDB();
        return db.feesHistory || [];
    },

    saveHistory: (history) => {
        const db = feesService.getDB();

        db.feesHistory = history;

        feesService.saveDB(db);
    },

    reset: () => {
        const db = feesService.getDB();

        db.fees = {};
        db.feesHistory = [];

        feesService.saveDB(db);
    }
};

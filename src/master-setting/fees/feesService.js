const DB_KEY = "ERP_DB";

export const feesService = {

    getDB: () => {
        return JSON.parse(localStorage.getItem(DB_KEY) || "{}");
    },

    saveDB: (db) => {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
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
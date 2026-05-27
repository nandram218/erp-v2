import {
    getStorageCompat,
    setStorageCompat,
    removeStorageCompat,
    STORAGE_KEYS,
} from "./storageService";

const KEY = STORAGE_KEYS.ERP_FEE_SETTINGS;

export const getFeeSettings = () =>
    getStorageCompat(KEY, null);

export const saveFeeSettings = (data) => {
    setStorageCompat(KEY, data);
    return data;
};

export const clearFeeSettings = () => {
    removeStorageCompat(KEY);
};

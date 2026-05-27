import {
    getStorageCompat,
    setStorageCompat,
    STORAGE_KEYS,
} from "./storageService";

const KEY = STORAGE_KEYS.SCHOOL_PROFILE;

export const getSchoolProfile = () =>
    getStorageCompat(KEY, null);

export const saveSchoolProfile = (payload) => {
    setStorageCompat(KEY, payload);
    return payload;
};

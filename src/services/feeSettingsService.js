/**
 * Fee Settings Service
 * Single authority for ERP_FEE_SETTINGS storage operations
 * 
 * Phase 3.2C Safe Mode - STRICT SaaS Enforcement
 * ⚠️ PRODUCTION MODE: Direct access to this service is BLOCKED
 * Use ServiceRegistry.getService("feeSettings") instead
 */

import {
    getTenantStorage,
    setTenantStorage,
    STORAGE_KEYS,
} from "./storageService";
import { getTenantContextForStorage } from "./tenantContextService";

const FEE_SETTINGS_KEY = STORAGE_KEYS.ERP_FEE_SETTINGS;

/* =========================
   GET FEE SETTINGS
========================= */

export const getFeeSettings = () => {
    const tenantContext = getTenantContextForStorage();
    return getTenantStorage(FEE_SETTINGS_KEY, tenantContext, null);
};

/* =========================
   SAVE FEE SETTINGS
========================= */

export const saveFeeSettings = (data) => {
    const tenantContext = getTenantContextForStorage();
    setTenantStorage(FEE_SETTINGS_KEY, data, tenantContext);
};

/* =========================
   CLEAR FEE SETTINGS
========================= */

export const clearFeeSettings = () => {
    const tenantContext = getTenantContextForStorage();
    setTenantStorage(FEE_SETTINGS_KEY, {}, tenantContext);
};

/* =========================
   VALIDATE FEE SETTINGS
========================= */

export const validateFeeSettings = (data = {}) => {
    const errors = [];
    const warnings = [];

    // Required fields
    if (!data.schoolId || typeof data.schoolId !== 'string') {
        errors.push('schoolId is required and must be a string');
    }

    if (!data.academicYear || typeof data.academicYear !== 'string') {
        errors.push('academicYear is required and must be a string');
    }

    if (!data.classes || typeof data.classes !== 'object') {
        errors.push('classes is required and must be an object');
    }

    // Validate classes structure
    if (data.classes) {
        Object.entries(data.classes).forEach(([className, classData]) => {
            if (!classData.compulsoryFees || !Array.isArray(classData.compulsoryFees)) {
                warnings.push(`Class ${className}: compulsoryFees should be an array`);
            }

            if (!classData.optionalFees || !Array.isArray(classData.optionalFees)) {
                warnings.push(`Class ${className}: optionalFees should be an array`);
            }

            // Validate fee items
            if (classData.compulsoryFees) {
                classData.compulsoryFees.forEach((fee, index) => {
                    if (!fee.id || typeof fee.id !== 'string') {
                        errors.push(`Class ${className}: compulsory fee at index ${index} missing valid id`);
                    }
                    if (!fee.name || typeof fee.name !== 'string') {
                        errors.push(`Class ${className}: compulsory fee at index ${index} missing valid name`);
                    }
                    if (typeof fee.amount !== 'number' || fee.amount < 0) {
                        errors.push(`Class ${className}: compulsory fee at index ${index} has invalid amount`);
                    }
                });
            }

            if (classData.optionalFees) {
                classData.optionalFees.forEach((fee, index) => {
                    if (!fee.id || typeof fee.id !== 'string') {
                        errors.push(`Class ${className}: optional fee at index ${index} missing valid id`);
                    }
                    if (!fee.name || typeof fee.name !== 'string') {
                        errors.push(`Class ${className}: optional fee at index ${index} missing valid name`);
                    }
                    if (typeof fee.amount !== 'number' || fee.amount < 0) {
                        errors.push(`Class ${className}: optional fee at index ${index} has invalid amount`);
                    }
                });
            }
        });
    }

    // Validate hostel fee
    if (data.hostelFee) {
        if (typeof data.hostelFee.enabled !== 'boolean') {
            errors.push('hostelFee.enabled must be a boolean');
        }
        if (data.hostelFee.enabled && (typeof data.hostelFee.amount !== 'number' || data.hostelFee.amount < 0)) {
            errors.push('hostelFee.amount must be a non-negative number when enabled');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/* =========================
   GET DEFAULT FEE SETTINGS
========================= */

export const getDefaultFeeSettings = () => {
    return {
        schoolId: "",
        academicYear: "2024-25",
        classes: {},
        transportRoutes: [],
        hostelFee: { enabled: false, amount: 0 }
    };
};

/* =========================
   EXPORT
========================= */

export default {
    getFeeSettings,
    saveFeeSettings,
    clearFeeSettings,
    validateFeeSettings,
    getDefaultFeeSettings,
};

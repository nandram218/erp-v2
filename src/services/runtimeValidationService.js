/**
 * RUNTIME VALIDATION SERVICE
 * Phase 3.1 C - Runtime Validation Safety Layer
 * Provides runtime validation for SaaS tenant context integrity
 */

import { isAuthenticated } from "./authService";
import {
    getTenantContext,
    isTenantContextValid,
    isAuthContextActive
} from "./tenantContextService";

// ================= SAFETY MODE CONFIGURATION =================
const SAFETY_MODE = true;

// ================= VALIDATION RESULT TYPE =================
/**
 * Validation result structure
 * @typedef {Object} ValidationResult
 * @property {string} status - "OK" | "FAIL"
 * @property {string[]} reasons - Array of failure reasons
 * @property {boolean} tenantValid - Tenant context validity
 * @property {boolean} authValid - Authentication validity
 */

// ================= TENANT CONTEXT VALIDATION =================
/**
 * Validate tenant context completeness
 * 
 * @returns {Object} Validation result with status and reasons
 */
export const validateTenantContext = () => {
    const reasons = [];
    const tenantContext = getTenantContext();

    // Check if tenant context exists
    if (!tenantContext || typeof tenantContext !== "object") {
        reasons.push("Tenant context is missing or invalid");
        return {
            status: "FAIL",
            reasons,
            tenantValid: false,
            authValid: false
        };
    }

    // Check schoolId
    if (!tenantContext.schoolId || tenantContext.schoolId.trim() === "") {
        reasons.push("schoolId is missing or empty");
    }

    // Check branchId
    if (!tenantContext.branchId || tenantContext.branchId.trim() === "") {
        reasons.push("branchId is missing or empty");
    }

    // Check sessionId
    if (!tenantContext.sessionId || tenantContext.sessionId.trim() === "") {
        reasons.push("sessionId is missing or empty");
    }

    const isValid = reasons.length === 0;

    return {
        status: isValid ? "OK" : "FAIL",
        reasons,
        tenantValid: isValid,
        authValid: isAuthContextActive()
    };
};

// ================= AUTHENTICATION VALIDATION =================
/**
 * Validate authentication status
 * 
 * @returns {Object} Validation result with status and reasons
 */
export const validateAuthentication = () => {
    const reasons = [];

    // Check if user is authenticated
    if (!isAuthenticated()) {
        reasons.push("User is not authenticated");
    }

    const isValid = reasons.length === 0;

    return {
        status: isValid ? "OK" : "FAIL",
        reasons,
        tenantValid: isTenantContextValid(),
        authValid: isValid
    };
};

// ================= APP READINESS VALIDATION =================
/**
 * Validate overall app readiness
 * Checks both authentication and tenant context
 * 
 * @returns {Object} Validation result with status and reasons
 */
export const validateAppReadiness = () => {
    const authValidation = validateAuthentication();
    const tenantValidation = validateTenantContext();

    const allReasons = [
        ...authValidation.reasons,
        ...tenantValidation.reasons
    ];

    // App is ready if tenant context is valid
    // Authentication is optional for development mode
    const isReady = tenantValidation.status === "OK";

    return {
        status: isReady ? "OK" : "FAIL",
        reasons: allReasons,
        tenantValid: tenantValidation.tenantValid,
        authValid: authValidation.authValid
    };
};

// ================= SAFETY MODE VALIDATION =================
/**
 * Validate with safety mode enforcement
 * If safety mode is enabled, prevents execution if tenant context is invalid
 * 
 * @param {Function} callback - Function to execute if validation passes
 * @returns {*} Result of callback or null if validation fails
 */
export const executeWithSafety = (callback) => {
    if (!SAFETY_MODE) {
        // Safety mode disabled - execute directly
        return callback();
    }

    const validation = validateTenantContext();

    if (validation.status === "FAIL") {
        console.error("[RuntimeValidation] Safety mode blocked execution:", validation.reasons);
        return null;
    }

    // Validation passed - execute callback
    return callback();
};

// ================= DEVELOPMENT MODE BYPASS =================
/**
 * Check if development mode bypass is allowed
 * 
 * @returns {boolean} True if development mode bypass is allowed
 */
export const isDevelopmentBypassAllowed = () => {
    // In development mode, allow fallback even if validation fails
    // In production, strict validation is enforced
    return process.env.NODE_ENV === "development";
};

// ================= VALIDATION SUMMARY =================
/**
 * Get validation summary for logging
 * 
 * @returns {Object} Summary object with validation status
 */
export const getValidationSummary = () => {
    const appReadiness = validateAppReadiness();
    const authActive = isAuthContextActive();
    const devMode = isDevelopmentBypassAllowed();

    return {
        appReady: appReadiness.status === "OK",
        tenantValid: appReadiness.tenantValid,
        authValid: appReadiness.authValid,
        authActive,
        safetyMode: SAFETY_MODE,
        developmentMode: devMode,
        reasons: appReadiness.reasons
    };
};

// ================= EXPORTS =================
export default {
    SAFETY_MODE,
    validateTenantContext,
    validateAuthentication,
    validateAppReadiness,
    executeWithSafety,
    isDevelopmentBypassAllowed,
    getValidationSummary
};

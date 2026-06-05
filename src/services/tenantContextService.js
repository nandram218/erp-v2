/**
 * TENANT CONTEXT SERVICE
 * Single source of truth for tenant isolation
 * Provides tenant context from multiple sources with fallback hierarchy
 */

import { getStorageCompat, STORAGE_KEYS } from "./storageService";

// ================= AUTH CONTEXT STORAGE KEY =================
const AUTH_CONTEXT_KEY = "ERP_AUTH_CONTEXT";

// ================= DEFAULT FALLBACK CONTEXT =================
// Used only when no other source is available (development mode)
const DEFAULT_CONTEXT = {
    schoolId: "SCH-IND-0001",
    branchId: "MAIN",
    sessionId: "2025-26",
};

// ================= AUTH CONTEXT PROVIDER =================
/**
 * Set tenant context from authentication
 * This should be called after successful login
 * 
 * @param {Object} authContext - Tenant context from authentication
 * @param {string} authContext.schoolId - School ID from auth
 * @param {string} authContext.branchId - Branch ID from auth
 * @param {string} authContext.sessionId - Session ID from auth
 */
export const setAuthContext = (authContext) => {
    if (!authContext || typeof authContext !== "object") {
        console.error("[TenantContextService] Invalid auth context provided");
        return false;
    }

    const context = {
        schoolId: authContext.schoolId || "",
        branchId: authContext.branchId || "",
        sessionId: authContext.sessionId || "",
    };

    try {
        localStorage.setItem(AUTH_CONTEXT_KEY, JSON.stringify(context));
        console.log("[TenantContextService] Auth context set:", context);
        return true;
    } catch (error) {
        console.error("[TenantContextService] Failed to set auth context:", error);
        return false;
    }
};

// ================= AUTH CONTEXT RETRIEVAL =================
/**
 * Get tenant context from authentication
 * 
 * @returns {Object} Tenant context from auth or empty object
 */
export const getAuthContext = () => {
    try {
        const stored = localStorage.getItem(AUTH_CONTEXT_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error("[TenantContextService] Failed to get auth context:", error);
    }
    return {};
};

// ================= CLEAR AUTH CONTEXT =================
/**
 * Clear tenant context from authentication
 * This should be called on logout
 */
export const clearAuthContext = () => {
    try {
        localStorage.removeItem(AUTH_CONTEXT_KEY);
        console.log("[TenantContextService] Auth context cleared");
        return true;
    } catch (error) {
        console.error("[TenantContextService] Failed to clear auth context:", error);
        return false;
    }
};

// ================= TENANT CONTEXT RESOLVER =================
/**
 * Get tenant context with fallback hierarchy:
 * 1. Authentication context (if available)
 * 2. School store context (if available)
 * 3. Storage fallback (if available)
 * 4. Default context (development mode only)
 * 
 * @returns {Object} Tenant context with schoolId, branchId, sessionId
 */
export const getTenantContext = () => {
    // Priority 1: Authentication context
    const authContext = getAuthContext();
    if (authContext.schoolId && authContext.branchId && authContext.sessionId) {
        return authContext;
    }

    // Priority 2: Storage fallback (for backward compatibility)
    try {
        const db = getStorageCompat(STORAGE_KEYS.ERP_DB_KEY, null);
        if (db && db.school) {
            const schoolContext = {
                schoolId: db.school.schoolId || "",
                branchId: db.school.branchId || "",
                sessionId: db.school.sessionId || "",
            };
            if (schoolContext.schoolId && schoolContext.branchId && schoolContext.sessionId) {
                console.log("[TenantContextService] Using storage fallback context");
                return schoolContext;
            }
        }
    } catch (error) {
        console.error("[TenantContextService] Failed to get storage fallback:", error);
    }

    // Priority 3: Default context (development mode only)
    console.warn("[TenantContextService] Using default fallback context (development mode)");
    return { ...DEFAULT_CONTEXT };
};

// ================= INDIVIDUAL GETTERS =================
/**
 * Get current schoolId from tenant context
 * 
 * @returns {string} schoolId
 */
export const getSchoolId = () => {
    return getTenantContext().schoolId || "";
};

/**
 * Get current branchId from tenant context
 * 
 * @returns {string} branchId
 */
export const getBranchId = () => {
    return getTenantContext().branchId || "";
};

/**
 * Get current sessionId from tenant context
 * 
 * @returns {string} sessionId
 */
export const getSessionId = () => {
    return getTenantContext().sessionId || "";
};

// ================= VALIDATION =================
/**
 * Check if tenant context is properly initialized
 * 
 * @returns {boolean} true if all tenant fields are present
 */
export const isTenantContextValid = () => {
    const context = getTenantContext();
    return !!(context.schoolId && context.branchId && context.sessionId);
};

/**
 * Check if tenant context is from authentication
 * 
 * @returns {boolean} true if context is from auth
 */
export const isAuthContextActive = () => {
    const authContext = getAuthContext();
    return !!(authContext.schoolId && authContext.branchId && authContext.sessionId);
};

// ================= TENANT-AWARE KEY SUFFIX =================
/**
 * Get tenant-aware storage key suffix
 * 
 * @returns {string} Key suffix for tenant isolation
 */
export const getTenantKeySuffix = () => {
    const context = getTenantContext();
    if (!isTenantContextValid()) {
        return "";
    }
    return `${context.schoolId}_${context.branchId}_${context.sessionId}`;
};

// ================= AUTO ATTACH =================
/**
 * Auto-attach tenant context to data object
 * 
 * @param {Object} data - Data object to enhance
 * @returns {Object} Data object with tenant context attached
 */
export const withTenantContext = (data = {}) => {
    return {
        ...data,
        ...getTenantContext(),
    };
};

// ================= EXPORTS =================
export default {
    setAuthContext,
    getAuthContext,
    clearAuthContext,
    getTenantContext,
    getSchoolId,
    getBranchId,
    getSessionId,
    isTenantContextValid,
    isAuthContextActive,
    getTenantKeySuffix,
    withTenantContext,
};

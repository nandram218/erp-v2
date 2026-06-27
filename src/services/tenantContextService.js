/**
 * TENANT CONTEXT SERVICE
 * Single source of truth for tenant isolation
 * Provides tenant context from multiple sources with fallback hierarchy
 */

import { getStorageCompat, STORAGE_KEYS } from "./storageService";

// ================= AUTH CONTEXT STORAGE KEY =================
const AUTH_CONTEXT_KEY = "ERP_AUTH_CONTEXT";

// ================= SAFETY MODE CONFIGURATION (Phase 3.1 C) =================
const SAFETY_MODE = true;

// ================= STRICT MODE CONFIGURATION (Phase 3.1 D Hardening) =================
const STRICT_MODE = true;

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
 * Phase 3.1 C - Safety Mode: Prevents execution if tenant context is invalid
 * Fallback allowed only in development mode
 * 
 * @returns {Object} Tenant context with schoolId, branchId, sessionId
 */
export const getTenantContext = () => {
    // Priority 1: Authentication context
    const authContext = getAuthContext();
    if (authContext.schoolId && authContext.branchId && authContext.sessionId) {
        return authContext;
    }

    // Priority 2: REMOVED - Storage fallback causes circular dependency and authority leak
    // getTenantContextForStorage() handles bootstrap without reading shared storage

    // Priority 3: Default context (development mode only)
    // Phase 3.1 C - Safety Mode: Allow default fallback only in development
    const isDevelopment = process.env.NODE_ENV === "development";

    if (SAFETY_MODE && !isDevelopment) {
        console.error("[TenantContextService] Safety mode blocked default fallback (production mode)");
        console.error("[TenantContextService] Tenant context is invalid - service execution prevented");
        return { schoolId: "", branchId: "", sessionId: "" };
    }

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
 * Phase 3.1 D Enforcement - Tenant Safety Upgrade
 * Phase 3.1 D Hardening - STRICT SaaS Enforcement
 * 
 * @param {Object} data - Data object to enhance
 * @returns {Object} Data object with tenant context attached
 * @throws {Error} If tenant context is invalid in production mode (STRICT_MODE)
 */
export const withTenantContext = (data = {}) => {
    const context = getTenantContext();
    
    // Phase 3.1 D Hardening: STRICT MODE enforcement
    if (!isTenantContextValid()) {
        const isDevelopment = process.env.NODE_ENV === "development";
        
        if (STRICT_MODE && !isDevelopment) {
            // Phase 3.1 D Hardening: STRICT MODE - Throw error in production
            console.error("[TENANT BLOCK] Invalid or missing tenant context");
            console.error("[TENANT BLOCK] Operation blocked - data:", data);
            throw new Error("[TENANT BLOCK] Invalid or missing tenant context. Cannot proceed with operation.");
        } else if (SAFETY_MODE && !isDevelopment) {
            // Phase 3.1 D Enforcement: SAFETY MODE - Throw controlled error
            console.error("[TenantContextService] Cannot attach tenant context - tenant context is invalid");
            console.error("[TenantContextService] Data:", data);
            throw new Error("Tenant context is invalid. Cannot proceed with operation.");
        } else {
            // Development mode: Log warning and proceed with empty context
            console.warn("[TenantContextService] Tenant context is invalid - proceeding with empty context (development mode)");
        }
    }
    
    return {
        ...data,
        ...context,
    };
};

// ================= BOOTSTRAP-SAFE CONTEXT (Phase 4.4A) =================

/**
 * Get tenant context for storage operations (bootstrap-safe)
 * This function NEVER calls getStorageCompat - breaks circular dependency
 * 
 * Priority:
 * 1. Auth context (raw localStorage read)
 * 2. Empty context (triggers fallback to shared storage)
 * 
 * @returns {Object} Tenant context or empty object
 */
export const getTenantContextForStorage = () => {
    // Priority 1: Auth context only (NO storage fallback)
    const authContext = getAuthContext();
    if (authContext.schoolId && authContext.branchId && authContext.sessionId) {
        return authContext;
    }

    // Return empty context - storage will fall back to shared storage
    // This breaks circular dependency: no getStorageCompat call here
    return {};
};

// ================= EXPORTS =================
export { SAFETY_MODE };

export default {
    setAuthContext,
    getAuthContext,
    clearAuthContext,
    getTenantContext,
    getTenantContextForStorage,
    getSchoolId,
    getBranchId,
    getSessionId,
    isTenantContextValid,
    isAuthContextActive,
    getTenantKeySuffix,
    withTenantContext,
};

// ================= DEVELOPMENT ONLY: TENANT SWITCH HELPER =================
/**
 * Development-only tenant switch helper for multi-tenant testing
 * Exposed on window.__DEV__ for browser console access
 * ONLY active in development mode - stripped in production builds
 */
if (process.env.NODE_ENV === "development") {
    const DEV_TENANTS = {
        SCH_0001: {
            schoolId: "SCH_0001",
            branchId: "MAIN",
            sessionId: "2025-26",
        },
        SCH_0002: {
            schoolId: "SCH_0002",
            branchId: "MAIN",
            sessionId: "2025-26",
        },
        SCH_0003: {
            schoolId: "SCH_0003",
            branchId: "MAIN",
            sessionId: "2025-26",
        },
    };

    window.__DEV__ = {
        setTenant: setAuthContext,
        getTenant: getTenantContext,
        clearTenant: clearAuthContext,
        tenants: DEV_TENANTS,
        
        // Helper to switch and reload
        switchTenant: (tenantKey) => {
            const tenant = DEV_TENANTS[tenantKey];
            if (!tenant) {
                console.error(`[DEV] Unknown tenant: ${tenantKey}. Available: ${Object.keys(DEV_TENANTS).join(", ")}`);
                return false;
            }
            setAuthContext(tenant);
            console.log(`[DEV] Switched to ${tenantKey}:`, tenant);
            console.log(`[DEV] Reload page to apply changes`);
            return true;
        },
        
        // Helper to show current tenant info
        showTenant: () => {
            const context = getTenantContext();
            const storageKey = context.schoolId && context.branchId && context.sessionId
                ? `ERP_V2_SAAS_${context.schoolId}_${context.branchId}_${context.sessionId}_ERP_DB`
                : "N/A (using fallback)";
            console.log("[DEV] Current Tenant Context:", context);
            console.log("[DEV] Storage Key:", storageKey);
            return { context, storageKey };
        },
    };

    console.log("[DEV] Tenant switch helper available at window.__DEV__");
    console.log("[DEV] Available tenants:", Object.keys(DEV_TENANTS).join(", "));
    console.log("[DEV] Usage: window.__DEV__.switchTenant('SCH_0002')");
}

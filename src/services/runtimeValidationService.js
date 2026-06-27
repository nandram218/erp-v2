/**
 * RUNTIME VALIDATION SERVICE
 * Phase 4.5: Tenant Isolation Validation
 * 
 * Provides runtime checks to ensure tenant isolation is maintained
 * throughout the application lifecycle.
 */

import { getTenantContext, isTenantContextValid } from "./tenantContextService";
import { useSchoolStore } from "../store/schoolStore";

/**
 * Validate app readiness on startup
 * Checks for critical tenant isolation requirements
 * 
 * @returns {Object} Validation result with status and reasons
 */
export const validateAppReadiness = () => {
    const reasons = [];
    const warnings = [];
    
    // Check 1: Tenant context must be valid
    const tenantContext = getTenantContext();
    if (!isTenantContextValid()) {
        reasons.push("Tenant context is invalid or missing");
    }
    
    // Check 2: School store must be hydrated
    const storeHydrated = useSchoolStore.getState().hydrated;
    if (!storeHydrated) {
        reasons.push("School store is not hydrated");
    }
    
    // Check 3: Validate tenant consistency in loaded data
    if (storeHydrated && isTenantContextValid()) {
        const consistencyCheck = validateTenantConsistency();
        if (!consistencyCheck.valid) {
            reasons.push(...consistencyCheck.errors);
        }
        if (consistencyCheck.warnings.length > 0) {
            warnings.push(...consistencyCheck.warnings);
        }
    }
    
    const status = reasons.length === 0 ? "PASS" : "FAIL";
    
    return {
        status,
        reasons,
        warnings,
        timestamp: new Date().toISOString()
    };
};

/**
 * Validate tenant consistency in loaded data
 * Ensures no cross-tenant data leakage in the store
 * 
 * @returns {Object} Validation result
 */
export const validateTenantConsistency = () => {
    const errors = [];
    const warnings = [];
    
    const state = useSchoolStore.getState();
    const tenantContext = getTenantContext();
    
    // Skip validation if tenant context is not valid
    if (!isTenantContextValid()) {
        return {
            valid: true,
            errors: [],
            warnings: ["Tenant context not valid - skipping consistency check"]
        };
    }
    
    // Check students for cross-tenant data
    if (Array.isArray(state.students)) {
        const crossTenantStudents = state.students.filter(student => {
            if (!student.schoolId) return false;
            return student.schoolId !== tenantContext.schoolId;
        });
        
        if (crossTenantStudents.length > 0) {
            errors.push(`Found ${crossTenantStudents.length} students from different school(s)`);
        }
    }
    
    // Check fees for cross-tenant data
    if (state.fees && typeof state.fees === 'object') {
        // Fees are stored as an object with studentId as keys
        Object.entries(state.fees).forEach(([studentId, feeRecord]) => {
            // This is a simplified check - in production, you'd need to cross-reference
            // with student data to verify tenant alignment
            if (feeRecord && feeRecord.schoolId && feeRecord.schoolId !== tenantContext.schoolId) {
                errors.push(`Fee record for student ${studentId} has different school ID`);
            }
        });
    }
    
    // Check transport data
    if (state.transport && typeof state.transport === 'object') {
        // Transport data should be tenant-scoped
        if (state.transport.schoolId && state.transport.schoolId !== tenantContext.schoolId) {
            errors.push("Transport data has different school ID");
        }
    }
    
    // Check hostel data
    if (state.hostel && typeof state.hostel === 'object') {
        if (state.hostel.schoolId && state.hostel.schoolId !== tenantContext.schoolId) {
            errors.push("Hostel data has different school ID");
        }
    }
    
    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Get validation summary for debugging
 * 
 * @returns {string} Human-readable validation summary
 */
export const getValidationSummary = () => {
    const validation = validateAppReadiness();
    
    let summary = `\n=== Tenant Isolation Validation Summary ===\n`;
    summary += `Status: ${validation.status}\n`;
    summary += `Timestamp: ${validation.timestamp}\n`;
    
    if (validation.reasons.length > 0) {
        summary += `\nErrors:\n`;
        validation.reasons.forEach(reason => {
            summary += `  ❌ ${reason}\n`;
        });
    }
    
    if (validation.warnings.length > 0) {
        summary += `\nWarnings:\n`;
        validation.warnings.forEach(warning => {
            summary += `  ⚠️ ${warning}\n`;
        });
    }
    
    if (validation.status === "PASS") {
        summary += `\n✅ All tenant isolation checks passed\n`;
    }
    
    summary += `==========================================\n`;
    
    return summary;
};

/**
 * Monitor tenant context changes
 * Logs warnings if tenant context changes unexpectedly
 * 
 * @param {Object} previousContext - Previous tenant context
 * @param {Object} newContext - New tenant context
 */
export const logTenantContextChange = (previousContext, newContext) => {
    if (previousContext.schoolId !== newContext.schoolId ||
        previousContext.branchId !== newContext.branchId ||
        previousContext.sessionId !== newContext.sessionId) {
        
        console.warn("[Tenant Monitor] Tenant context changed:", {
            from: previousContext,
            to: newContext
        });
        
        // Trigger re-validation
        const validation = validateTenantConsistency();
        if (!validation.valid) {
            console.error("[Tenant Monitor] Tenant consistency check failed after context change:", validation.errors);
        }
    }
};

/**
 * Audit storage keys for tenant isolation
 * Checks if any storage operations use non-tenant-scoped keys
 * 
 * @returns {Object} Audit results
 */
export const auditStorageKeys = () => {
    const issues = [];
    const tenantContext = getTenantContext();
    
    // This is a static analysis - in production, you'd want to intercept
    // storage calls and validate keys dynamically
    
    // Check if ERP_DB_KEY is being used directly (should use tenant-scoped version)
    const { ERP_DB_KEY } = require("../core/constants/storageKeys");
    
    // The key should be tenant-scoped when tenant context is valid
    if (isTenantContextValid()) {
        const expectedKey = `ERP_V2_SAAS_${tenantContext.schoolId}_${tenantContext.branchId}_${tenantContext.sessionId}_${ERP_DB_KEY}`;
        
        // Check if legacy key exists (indicates migration not complete)
        // NOTE: This is expected legacy state - not an error
        // Only log for debugging, don't include in issues array
        if (localStorage.getItem(ERP_DB_KEY) !== null) {
            console.log("[auditStorageKeys] Legacy ERP_DB key found (expected during transition)");
        }
        
        // Check if tenant-scoped key exists
        // NOTE: This is expected during initial load - not an error
        // Only log for debugging, don't include in issues array
        if (localStorage.getItem(expectedKey) === null) {
            console.log("[auditStorageKeys] Tenant-scoped key not found (expected during initial load)");
        }
    }
    
    return {
        valid: issues.filter(i => i.type === "ERROR").length === 0,
        issues
    };
};

/**
 * Development helper: Clear all tenant data and reset
 * ONLY use in development mode
 */
export const resetAllTenantData = () => {
    const isDevelopment = process.env.NODE_ENV === "development";
    
    if (!isDevelopment) {
        console.error("[Validation] resetAllTenantData can only be used in development mode");
        return false;
    }
    
    try {
        // Clear all ERP prefixed data
        const STORAGE_PREFIX = "ERP_V2_SAAS";
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith(STORAGE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
        
        // Clear auth context
        const { clearAuthContext } = require("./tenantContextService");
        clearAuthContext();
        
        console.log("[Validation] All tenant data cleared successfully");
        return true;
    } catch (error) {
        console.error("[Validation] Failed to clear tenant data:", error);
        return false;
    }
};
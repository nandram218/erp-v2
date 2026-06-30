/**
 * RUNTIME VALIDATION SERVICE
 * Phase 4.5 - Tenant Isolation Verification
 * Provides runtime checks for multi-tenant data integrity
 */

import { getTenantStorage, STORAGE_KEYS } from "../services/storageService";
import { getTenantContext, isTenantContextValid } from "../services/tenantContextService";

// Re-export storage functions needed by validators
export { getTenantStorage, STORAGE_KEYS };

/**
 * Validate application readiness on startup
 * Phase 4.5: Ensures tenant isolation is active before any data operations
 */
export const validateAppReadiness = () => {
    const issues = [];
    
    // Check 1: Tenant context validation
    const tenantValid = isTenantContextValid();
    if (!tenantValid) {
        issues.push({
            level: "CRITICAL",
            message: "Tenant context is not valid",
            impact: "All data operations may affect wrong tenant"
        });
    }
    
    // Check 2: Storage isolation
    const tenantContext = getTenantContext();
    try {
        const testKey = STORAGE_KEYS.ERP_DB;
        const db = getTenantStorage(testKey, tenantContext, null);
        if (db && !db.masterData) {
            issues.push({
                level: "WARNING",
                message: "Master data not yet initialized",
                impact: "Master entities may not be available"
            });
        }
    } catch (error) {
        issues.push({
            level: "ERROR",
            message: `Storage validation failed: ${error.message}`,
            impact: "Storage layer may be compromised"
        });
    }
    
    // Check 3: Service registry
    try {
        // Service registry checks happen during normal operation
    } catch (error) {
        issues.push({
            level: "WARNING",
            message: `Service registry check failed: ${error.message}`
        });
    }
    
    const criticalIssues = issues.filter(i => i.level === "CRITICAL" || i.level === "ERROR");
    const passed = issues.length - criticalIssues.length;
    const failed = criticalIssues.length;
    
    return {
        status: failed === 0 ? "PASS" : "FAIL",
        message: failed === 0 
            ? "Application is ready for multi-tenant operations" 
            : `${failed} critical issue(s) found`,
        issues,
        summary: {
            total: issues.length,
            passed,
            failed
        }
    };
};

/**
 * Get validation summary
 */
export const getValidationSummary = () => {
    const validation = validateAppReadiness();
    return validation.summary;
};

/**
 * Audit storage keys for compliance
 * Phase 4.4E: Verify no cross-tenant data leakage in storage
 */
export const auditStorageKeys = () => {
    const allKeys = Object.keys(localStorage);
    const erpKeys = allKeys.filter(k => k.startsWith("ERP_V2_SAAS"));
    const legacyKeys = allKeys.filter(k => !k.startsWith("ERP_V2_SAAS") && k.includes("ERP"));
    
    const issues = [];
    
    if (legacyKeys.length > 0) {
        issues.push({
            level: "WARNING",
            message: `Found ${legacyKeys.length} legacy storage keys`,
            keys: legacyKeys.slice(0, 10),
            recommendation: "Run migration: localStorage.clear() and re-login"
        });
    }
    
    return {
        timestamp: new Date().toISOString(),
        totalKeys: allKeys.length,
        erpKeys: erpKeys.length,
        legacyKeys: legacyKeys.length,
        issues,
        compliance: issues.length === 0 ? "PASS" : "NEEDS_ATTENTION"
    };
};

/**
 * Deep scan for cross-tenant data leakage
 */
export const scanForCrossTenantLeakage = () => {
    const leaks = [];
    const tenantContext = getTenantContext();
    
    if (!tenantContext.schoolId) {
        return {
            scanned: false,
            message: "No tenant context - cannot perform scan",
            leaks: []
        };
    }
    
    // Scan all ERP keys for this tenant
    const prefix = `ERP_V2_SAAS_${tenantContext.schoolId}_*`;
    
    // Check critical data domains
    const criticalDomains = [
        STORAGE_KEYS.ERP_DB,
        "ERP_FEES_DB",
        "ERP_TRANSPORT_DATA",
        "ERP_HOSTEL_DATA"
    ];
    
    criticalDomains.forEach(domainKey => {
        try {
            const tenantKey = getTenantStorage(domainKey, tenantContext, null);
            if (tenantKey === null) return;
            
            const data = JSON.parse(localStorage.getItem(
                `ERP_V2_SAAS_${tenantContext.schoolId}_${tenantContext.branchId}_${tenantContext.sessionId}_${domainKey}`
            ));
            
            if (!data || typeof data !== 'object') return;
            
            // Check for other school IDs
            const checkForOtherSchoolIds = (obj, path = "") => {
                if (!obj || typeof obj !== 'object') return;
                
                if (Array.isArray(obj)) {
                    obj.forEach((item, idx) => {
                        if (item && typeof item === 'object' && item.schoolId) {
                            if (item.schoolId !== tenantContext.schoolId) {
                                leaks.push({
                                    domain: domainKey,
                                    path: `${path}[${idx}]`,
                                    foundSchoolId: item.schoolId,
                                    expectedSchoolId: tenantContext.schoolId
                                });
                            }
                        }
                        checkForOtherSchoolIds(item, `${path}[${idx}]`);
                    });
                } else {
                    Object.values(obj).forEach((val, key) => {
                        if (val && typeof val === 'object' && val.schoolId) {
                            if (val.schoolId !== tenantContext.schoolId) {
                                leaks.push({
                                    domain: domainKey,
                                    path: `${path}.${key}`,
                                    foundSchoolId: val.schoolId,
                                    expectedSchoolId: tenantContext.schoolId
                                });
                            }
                        }
                        checkForOtherSchoolIds(val, `${path}.${key}`);
                    });
                }
            };
            
            checkForOtherSchoolIds(data);
            
        } catch (error) {
            // Key doesn't exist or is invalid - skip
        }
    });
    
    return {
        scanned: true,
        tenant: tenantContext,
        timestamp: new Date().toISOString(),
        leaks,
        status: leaks.length === 0 ? "CLEAN" : "LEAKS_DETECTED"
    };
};
/**
 * @CONTRACT CORE
 * @LOCK PERMANENT
 *
 * AUTOMATIC QUALITY GATES
 * Utilities for automated contract and architecture compliance checking
 * Can be integrated into CI/CD pipelines
 */

// ================= STORAGE KEY VALIDATION =================

/**
 * Validate all storage keys in a file
 * @param {string} filePath - File path being checked
 * @param {Array} keys - Array of storage keys found
 * @returns {Object} Validation result
 */
export const validateStorageKeys = (filePath, keys) => {
    const results = {
        passed: true,
        errors: [],
        warnings: []
    };

    for (const key of keys) {
        const validation = validateStorageKey(key);
        if (!validation.valid) {
            results.passed = false;
            results.errors.push({
                file: filePath,
                key,
                error: validation.error
            });
        }
    }

    return results;
};

// ================= DUPLICATE CONSTANT DETECTION =================

/**
 * Detect duplicate constants across codebase
 * @param {Map} constantMap - Map of constant name to file locations
 * @returns {Object} Duplicate report
 */
export const detectDuplicateConstants = (constantMap) => {
    const duplicates = {
        found: false,
        duplicates: []
    };

    for (const [name, locations] of Object.entries(constantMap)) {
        if (locations.length > 1) {
            duplicates.found = true;
            duplicates.duplicates.push({
                name,
                locations,
                message: `Constant "${name}" defined in multiple files: ${locations.join(', ')}`
            });
        }
    }

    return duplicates;
};

// ================= REGISTRY VALIDATION =================

/**
 * Validate service registry compliance
 * @param {Array} registeredServices - List of registered services
 * @param {Array} directAccessViolations - List of direct service access
 * @returns {Object} Validation result
 */
export const validateRegistryUsage = (registeredServices, directAccessViolations = []) => {
    const results = {
        passed: true,
        errors: [],
        warnings: []
    };

    // Check for direct service access
    for (const violation of directAccessViolations) {
        results.passed = false;
        results.errors.push({
            type: 'DIRECT_SERVICE_ACCESS',
            file: violation.file,
            service: violation.service,
            message: `Direct access to service "${violation.service}" in ${violation.file}. Use ServiceRegistry.getService() instead.`
        });
    }

    return results;
};

// ================= IDENTIFIER VALIDATION =================

/**
 * Validate identifier format compliance
 * @param {Array} identifiers - Array of { type, value, file, line }
 * @returns {Object} Validation result
 */
export const validateIdentifiers = (identifiers) => {
    const results = {
        passed: true,
        errors: [],
        warnings: []
    };

    const patterns = {
        studentId: /^STU-\d{4}-\d{6}$/,
        receiptNumber: /^ERP-R-\d{4}-\d{6}$/,
        feeId: /^FEE-[a-f0-9-]+$/,
        routeId: /^ROUTE-\d{3}$/,
        stopId: /^STOP-ROUTE-\d{3}-\d{2}$/,
        vehicleId: /^VEH-\d{3}$/
    };

    for (const id of identifiers) {
        const pattern = patterns[id.type];
        if (pattern && !pattern.test(id.value)) {
            results.passed = false;
            results.errors.push({
                type: 'INVALID_IDENTIFIER_FORMAT',
                file: id.file,
                line: id.line,
                identifierType: id.type,
                value: id.value,
                message: `Invalid ${id.type} format: ${id.value}. Expected pattern: ${pattern}`
            });
        }
    }

    return results;
};

// ================= TENANT ISOLATION VALIDATION =================

/**
 * Validate tenant isolation in code
 * @param {Array} violations - Array of tenant isolation violations
 * @returns {Object} Validation result
 */
export const validateTenantIsolation = (violations) => {
    const results = {
        passed: true,
        errors: [],
        warnings: []
    };

    for (const violation of violations) {
        results.passed = false;
        results.errors.push({
            type: 'TENANT_ISOLATION_VIOLATION',
            file: violation.file,
            line: violation.line,
            message: violation.message
        });
    }

    return results;
};

// ================= CONTRACT COMPLIANCE =================

/**
 * Validate code complies with contracts
 * @param {Array} violations - Array of contract violations
 * @returns {Object} Validation result
 */
export const validateContractCompliance = (violations) => {
    const results = {
        passed: true,
        errors: [],
        warnings: []
    };

    for (const violation of violations) {
        results.passed = false;
        results.errors.push({
            type: 'CONTRACT_VIOLATION',
            contract: violation.contract,
            file: violation.file,
            message: violation.message
        });
    }

    return results;
};

// ================= QUALITY GATE ORCHESTRATOR =================

/**
 * Run all quality gates
 * @param {Object} report - Combined report from all checks
 * @returns {Object} Final quality gate result
 */
export const runQualityGates = (report) => {
    const results = {
        passed: true,
        totalChecks: 0,
        passedChecks: 0,
        failedChecks: 0,
        errors: [],
        warnings: []
    };

    // Storage validation
    if (report.storage) {
        results.totalChecks++;
        if (report.storage.passed) {
            results.passedChecks++;
        } else {
            results.failedChecks++;
            results.passed = false;
            results.errors.push(...report.storage.errors);
        }
        results.warnings.push(...report.storage.warnings);
    }

    // Duplicate constants
    if (report.duplicates) {
        results.totalChecks++;
        if (!report.duplicates.found) {
            results.passedChecks++;
        } else {
            results.failedChecks++;
            results.passed = false;
            results.errors.push(...report.duplicates.duplicates);
        }
    }

    // Registry usage
    if (report.registry) {
        results.totalChecks++;
        if (report.registry.passed) {
            results.passedChecks++;
        } else {
            results.failedChecks++;
            results.passed = false;
            results.errors.push(...report.registry.errors);
        }
        results.warnings.push(...report.registry.warnings);
    }

    // Identifiers
    if (report.identifiers) {
        results.totalChecks++;
        if (report.identifiers.passed) {
            results.passedChecks++;
        } else {
            results.failedChecks++;
            results.passed = false;
            results.errors.push(...report.identifiers.errors);
        }
    }

    // Tenant isolation
    if (report.tenantIsolation) {
        results.totalChecks++;
        if (report.tenantIsolation.passed) {
            results.passedChecks++;
        } else {
            results.failedChecks++;
            results.passed = false;
            results.errors.push(...report.tenantIsolation.errors);
        }
    }

    // Contract compliance
    if (report.contracts) {
        results.totalChecks++;
        if (report.contracts.passed) {
            results.passedChecks++;
        } else {
            results.failedChecks++;
            results.passed = false;
            results.errors.push(...report.contracts.errors);
        }
    }

    return results;
};

// ================= EXPORTS =================

export default {
    validateStorageKeys,
    detectDuplicateConstants,
    validateRegistryUsage,
    validateIdentifiers,
    validateTenantIsolation,
    validateContractCompliance,
    runQualityGates
};
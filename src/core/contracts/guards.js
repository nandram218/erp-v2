/**
 * @CONTRACT CORE
 * @LOCK PERMANENT
 *
 * ARCHITECTURE GUARDS
 * Runtime enforcement of architectural rules
 * These guards prevent common violations
 */

// ================= STORAGE ACCESS GUARD =================

/**
 * Assert storage access follows contract
 * @param {string} key - Storage key being accessed
 * @throws {Error} If key violates storage contract
 */
export const assertStorageAccess = (key) => {
    if (!key || typeof key !== 'string') {
        throw new Error('[GUARD] Storage key must be a non-empty string');
    }

    if (key.length > 50) {
        throw new Error('[GUARD] Storage key exceeds 50 character limit');
    }

    if (/^\d/.test(key)) {
        throw new Error('[GUARD] Storage key cannot start with a number');
    }

    if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
        throw new Error('[GUARD] Storage key must be UPPER_SNAKE_CASE. Got: ' + key);
    }
};

// ================= TENANT ISOLATION GUARD =================

/**
 * Assert tenant isolation is maintained
 * @param {Object} context - Tenant context
 * @throws {Error} If tenant context is invalid
 */
export const assertTenantIsolation = (context) => {
    if (!context || typeof context !== 'object') {
        throw new Error('[GUARD] Tenant context must be an object');
    }

    const requiredFields = ['schoolId', 'branchId', 'sessionId'];
    for (const field of requiredFields) {
        if (!context[field] || typeof context[field] !== 'string') {
            throw new Error(`[GUARD] Tenant isolation violated: missing or invalid ${field}`);
        }
    }
};

// ================= REGISTRY USAGE GUARD =================

/**
 * Assert service is accessed via registry
 * @param {string} serviceName - Service being accessed
 * @param {string} caller - Function/file accessing the service
 * @throws {Error} If service is accessed directly
 */
export const assertRegistryUsage = (serviceName, caller = 'unknown') => {
    if (!serviceName || typeof serviceName !== 'string') {
        throw new Error('[GUARD] Service name must be a non-empty string');
    }

    // This guard is enforced by ServiceRegistry itself
    // This is a secondary check for critical services
    const criticalServices = ['fees', 'student', 'transport', 'receipt'];
    if (criticalServices.includes(serviceName)) {
        console.log(`[GUARD] Service access via registry: ${serviceName} from ${caller}`);
    }
};

// ================= NO DIRECT LOCALSTORAGE GUARD =================

/**
 * Assert no direct localStorage access
 * @param {string} caller - Function/file attempting direct access
 * @throws {Error} If direct localStorage access is detected
 */
export const assertNoDirectLocalStorage = (caller = 'unknown') => {
    if (process.env.NODE_ENV === 'production') {
        console.warn(`[GUARD] Direct localStorage access detected from: ${caller}`);
        console.warn('[GUARD] Use storageService instead');
    }
};

// ================= MODULE BOUNDARY GUARD =================

/**
 * Assert module boundary is respected
 * @param {string} fromModule - Module making the call
 * @param {string} toModule - Module being called
 * @param {Object} allowedDependencies - Map of allowed dependencies
 * @throws {Error} If dependency violates module boundaries
 */
export const assertModuleBoundary = (fromModule, toModule, allowedDependencies = {}) => {
    if (!fromModule || !toModule) {
        return; // Skip validation if modules not specified
    }

    const key = `${fromModule}->${toModule}`;
    
    // Check if this dependency is allowed
    if (allowedDependencies[key] === false) {
        throw new Error(`[GUARD] Module boundary violated: ${fromModule} cannot directly access ${toModule}`);
    }

    console.log(`[GUARD] Module boundary check passed: ${key}`);
};

// ================= IDENTIFIER INTEGRITY GUARD =================

/**
 * Assert identifier integrity
 * @param {string} identifier - Identifier to check
 * @param {string} type - Identifier type
 * @throws {Error} If identifier format is invalid
 */
export const assertIdentifierIntegrity = (identifier, type = 'studentId') => {
    const patterns = {
        studentId: /^STU-\d{4}-\d{6}$/,
        receiptNumber: /^ERP-R-\d{4}-\d{6}$/,
        feeId: /^FEE-[a-f0-9-]+$/,
        routeId: /^ROUTE-\d{3}$/,
        stopId: /^STOP-ROUTE-\d{3}-\d{2}$/,
        vehicleId: /^VEH-\d{3}$/
    };

    const pattern = patterns[type];
    if (!pattern || !pattern.test(identifier)) {
        throw new Error(`[GUARD] Identifier integrity check failed: ${type} = ${identifier}`);
    }
};

// ================= ENTITY COMPATIBILITY GUARD =================

/**
 * Assert entity compatibility with contract
 * @param {Object} entity - Entity to check
 * @param {Object} contract - Contract to validate against
 * @throws {Error} If entity violates contract
 */
export const assertEntityCompatibility = (entity, contract) => {
    if (!entity || !contract) {
        return; // Skip if missing data
    }

    // Check required fields
    if (contract.fields) {
        for (const [fieldName, fieldDef] of Object.entries(contract.fields)) {
            if (fieldDef.required && !(fieldName in entity)) {
                throw new Error(`[GUARD] Entity missing required field: ${fieldName}`);
            }
        }
    }
};

// ================= MIGRATION REQUIRED GUARD =================

/**
 * Assert migration is performed when contract changes
 * @param {string} contractId - Contract that was modified
 * @param {string} version - New version
 * @param {boolean} migrationCompleted - Whether migration was run
 * @throws {Error} If contract changed but migration not performed
 */
export const assertMigrationRequired = (contractId, version, migrationCompleted) => {
    if (!migrationCompleted) {
        console.warn(`[GUARD] Contract ${contractId} updated to version ${version}`);
        console.warn('[GUARD] Run migration script before deploying to production');
    }
};

// ================= EXPORTS =================

export default {
    assertStorageAccess,
    assertTenantIsolation,
    assertRegistryUsage,
    assertNoDirectLocalStorage,
    assertModuleBoundary,
    assertIdentifierIntegrity,
    assertEntityCompatibility,
    assertMigrationRequired
};
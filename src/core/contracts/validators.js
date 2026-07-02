/**
 * @CONTRACT CORE
 * @LOCK PERMANENT
 *
 * VALIDATION LAYER
 * Reusable validators for contract enforcement
 * No business logic - validation only
 */

// ================= STORAGE VALIDATION =================

/**
 * Validate storage key format
 * @param {string} key - Storage key to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateStorageKey = (key) => {
    if (!key || typeof key !== 'string') {
        return { valid: false, error: 'Storage key must be a non-empty string' };
    }

    if (key.length > 50) {
        return { valid: false, error: 'Storage key exceeds maximum length of 50 characters' };
    }

    if (/^\d/.test(key)) {
        return { valid: false, error: 'Storage key cannot start with a number' };
    }

    if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
        return { valid: false, error: 'Storage key must be UPPER_SNAKE_CASE' };
    }

    return { valid: true, error: null };
};

/**
 * Validate tenant context object
 * @param {Object} context - Tenant context to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateTenantContext = (context) => {
    if (!context || typeof context !== 'object') {
        return { valid: false, error: 'Tenant context must be an object' };
    }

    const requiredFields = ['schoolId', 'branchId', 'sessionId'];
    for (const field of requiredFields) {
        if (!context[field] || typeof context[field] !== 'string') {
            return { valid: false, error: `Tenant context missing required field: ${field}` };
        }
    }

    return { valid: true, error: null };
};

// ================= IDENTIFIER VALIDATION =================

/**
 * Validate identifier format
 * @param {string} identifier - Identifier to validate
 * @param {string} type - Identifier type (studentId, receiptNumber, etc.)
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateIdentifier = (identifier, type = 'studentId') => {
    if (!identifier || typeof identifier !== 'string') {
        return { valid: false, error: `${type} must be a non-empty string` };
    }

    const patterns = {
        studentId: /^STU-\d{4}-\d{6}$/,
        receiptNumber: /^ERP-R-\d{4}-\d{6}$/,
        feeId: /^FEE-[a-f0-9-]+$/,
        routeId: /^ROUTE-\d{3}$/,
        stopId: /^STOP-ROUTE-\d{3}-\d{2}$/,
        vehicleId: /^VEH-\d{3}$/
    };

    const pattern = patterns[type];
    if (pattern && !pattern.test(identifier)) {
        const examples = {
            studentId: 'STU-2024-000001',
            receiptNumber: 'ERP-R-2024-000001',
            feeId: 'FEE-a1b2c3d4',
            routeId: 'ROUTE-001',
            stopId: 'STOP-ROUTE-001-01',
            vehicleId: 'VEH-001'
        };
        return { valid: false, error: `${type} format invalid. Expected: ${examples[type]}` };
    }

    return { valid: true, error: null };
};

// ================= RECEIPT VALIDATION =================

/**
 * Validate receipt number
 * @param {string} receiptNumber - Receipt number to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateReceiptNumber = (receiptNumber) => {
    const result = validateIdentifier(receiptNumber, 'receiptNumber');
    return result;
};

/**
 * Validate receipt data
 * @param {Object} receipt - Receipt object to validate
 * @returns {Object} { valid: boolean, error: string, errors: Array }
 */
export const validateReceipt = (receipt) => {
    const errors = [];

    if (!receipt || typeof receipt !== 'object') {
        return { valid: false, error: 'Receipt must be an object', errors: ['Receipt must be an object'] };
    }

    // Required fields
    const requiredFields = ['receiptNumber', 'studentId', 'studentName', 'classId', 'feeType', 'amount', 'paymentMode', 'paymentDate', 'collectedBy'];
    for (const field of requiredFields) {
        if (!receipt[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    // Validate receipt number format
    const receiptNumberResult = validateReceiptNumber(receipt.receiptNumber);
    if (!receiptNumberResult.valid) {
        errors.push(receiptNumberResult.error);
    }

    // Validate amount
    if (typeof receipt.amount !== 'number' || receipt.amount < 0) {
        errors.push('Amount must be a non-negative number');
    }

    // Validate payment mode
    const validPaymentModes = ['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Card'];
    if (!validPaymentModes.includes(receipt.paymentMode)) {
        errors.push(`Invalid payment mode: ${receipt.paymentMode}. Must be one of: ${validPaymentModes.join(', ')}`);
    }

    // Validate status
    const validStatuses = ['Issued', 'Cancelled', 'Void'];
    if (receipt.status && !validStatuses.includes(receipt.status)) {
        errors.push(`Invalid status: ${receipt.status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    return {
        valid: errors.length === 0,
        error: errors.length > 0 ? errors[0] : null,
        errors
    };
};

// ================= STUDENT VALIDATION =================

/**
 * Validate student data
 * @param {Object} student - Student object to validate
 * @returns {Object} { valid: boolean, error: string, errors: Array }
 */
export const validateStudent = (student) => {
    const errors = [];

    if (!student || typeof student !== 'object') {
        return { valid: false, error: 'Student must be an object', errors: ['Student must be an object'] };
    }

    // Required fields
    const requiredFields = ['studentId', 'firstName', 'lastName'];
    for (const field of requiredFields) {
        if (!student[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    // Validate student ID format
    const studentIdResult = validateIdentifier(student.studentId, 'studentId');
    if (!studentIdResult.valid) {
        errors.push(studentIdResult.error);
    }

    // Validate status if provided
    const validStatuses = ['Active', 'Inactive', 'Graduated', 'Transferred'];
    if (student.status && !validStatuses.includes(student.status)) {
        errors.push(`Invalid status: ${student.status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate gender if provided
    const validGenders = ['Male', 'Female', 'Other'];
    if (student.gender && !validGenders.includes(student.gender)) {
        errors.push(`Invalid gender: ${student.gender}. Must be one of: ${validGenders.join(', ')}`);
    }

    return {
        valid: errors.length === 0,
        error: errors.length > 0 ? errors[0] : null,
        errors
    };
};

/**
 * Validate student ID
 * @param {string} studentId - Student ID to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateStudentId = (studentId) => {
    const result = validateIdentifier(studentId, 'studentId');
    return result;
};

// ================= FEE CONTRACT VALIDATION =================

/**
 * Validate fee contract
 * @param {Object} fee - Fee object to validate
 * @returns {Object} { valid: boolean, error: string, errors: Array }
 */
export const validateFeeContract = (fee) => {
    const errors = [];

    if (!fee || typeof fee !== 'object') {
        return { valid: false, error: 'Fee must be an object', errors: ['Fee must be an object'] };
    }

    // Required fields
    const requiredFields = ['feeId', 'feeName', 'feeType', 'amount', 'academicYear', 'classId'];
    for (const field of requiredFields) {
        if (!fee[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    // Validate fee ID format
    const feeIdResult = validateIdentifier(fee.feeId, 'feeId');
    if (!feeIdResult.valid) {
        errors.push(feeIdResult.error);
    }

    // Validate amount
    if (typeof fee.amount !== 'number' || fee.amount < 0) {
        errors.push('Amount must be a non-negative number');
    }

    // Validate fee type
    const validFeeTypes = ['MANDATORY', 'OPTIONAL', 'ONE_TIME', 'RECURRING'];
    if (fee.feeType && !validFeeTypes.includes(fee.feeType)) {
        errors.push(`Invalid fee type: ${fee.feeType}. Must be one of: ${validFeeTypes.join(', ')}`);
    }

    // Validate academic year format
    if (fee.academicYear && !/^\d{4}-\d{4}$/.test(fee.academicYear)) {
        errors.push('Academic year must be in format YYYY-YYYY');
    }

    return {
        valid: errors.length === 0,
        error: errors.length > 0 ? errors[0] : null,
        errors
    };
};

// ================= ENTITY SHAPE VALIDATION =================

/**
 * Validate entity shape against contract
 * @param {Object} entity - Entity to validate
 * @param {Object} contract - Contract definition
 * @returns {Object} { valid: boolean, error: string, errors: Array }
 */
export const validateEntityShape = (entity, contract) => {
    const errors = [];

    if (!entity || typeof entity !== 'object') {
        return { valid: false, error: 'Entity must be an object', errors: ['Entity must be an object'] };
    }

    if (!contract || typeof contract !== 'object') {
        return { valid: false, error: 'Contract must be an object', errors: ['Contract must be an object'] };
    }

    // Check required fields
    if (contract.fields) {
        for (const [fieldName, fieldDef] of Object.entries(contract.fields)) {
            if (fieldDef.required && !(fieldName in entity)) {
                errors.push(`Missing required field: ${fieldName}`);
            }
        }
    }

    return {
        valid: errors.length === 0,
        error: errors.length > 0 ? errors[0] : null,
        errors
    };
};

// ================= SERVICE REGISTRATION VALIDATION =================

/**
 * Validate service registration
 * @param {string} name - Service name
 * @param {Object} service - Service object
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateServiceRegistration = (name, service) => {
    if (!name || typeof name !== 'string') {
        return { valid: false, error: 'Service name must be a non-empty string' };
    }

    if (!service || typeof service !== 'object') {
        return { valid: false, error: 'Service must be an object' };
    }

    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(name)) {
        return { valid: false, error: 'Service name must start with a letter and contain only alphanumeric characters' };
    }

    return { valid: true, error: null };
};

// ================= EXPORTS =================

export default {
    validateStorageKey,
    validateTenantContext,
    validateIdentifier,
    validateReceiptNumber,
    validateReceipt,
    validateStudent,
    validateStudentId,
    validateFeeContract,
    validateEntityShape,
    validateServiceRegistration
};
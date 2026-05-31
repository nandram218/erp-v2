// =====================================================
// FEE ENGINE CORE BRIDGE (PHASE 3B - STEP 2)
// =====================================================
// Safe JavaScript bridge for FeeEngineCore.ts
// Handles TypeScript/JS compatibility with graceful fallback
// =====================================================

let FeeEngineCore = null;

// Try to import FeeEngineCore (may fail if build doesn't support TS→JS)
try {
    // This import will only work if build system compiles .ts to .js
    // If it fails, we fall back to legacy path
    const FeeEngineCoreModule = require("./FeeEngineCore.ts");
    FeeEngineCore = FeeEngineCoreModule.FeeEngineCore;
} catch (error) {
    // Import failed - TypeScript not compiled or build config issue
    console.warn("[FeeEngineBridge] FeeEngineCore.ts import failed:", error.message);
    console.warn("[FeeEngineBridge] Falling back to legacy fee calculation");
}

/**
 * Safe bridge wrapper for FeeEngineCore.calculate
 * 
 * @param {Object} params - Calculation parameters
 * @param {Object} params.student - Student object (FeeEngine format)
 * @param {Object} params.feeConfig - Fee configuration (FeeEngine format)
 * @returns {Object|null} Fee result or null if bridge unavailable
 */
export const calculateFee = (params) => {
    if (!FeeEngineCore) {
        console.warn("[FeeEngineBridge] FeeEngineCore not available, use legacy path");
        return null;
    }

    try {
        return FeeEngineCore.calculate(params);
    } catch (error) {
        console.error("[FeeEngineBridge] Calculation error:", error);
        return null;
    }
};

/**
 * Safe bridge wrapper for FeeEngineCore.validateConfig
 * 
 * @param {Object} config - Fee configuration
 * @returns {Object} Validation result
 */
export const validateFeeConfig = (config) => {
    if (!FeeEngineCore) {
        return { valid: false, errors: ["FeeEngineCore not available"], warnings: [] };
    }

    try {
        return FeeEngineCore.validateConfig(config);
    } catch (error) {
        console.error("[FeeEngineBridge] Validation error:", error);
        return { valid: false, errors: [error.message], warnings: [] };
    }
};

/**
 * Safe bridge wrapper for FeeEngineCore.validate
 * 
 * @param {Object} params - Validation parameters
 * @returns {Object} Validation result
 */
export const validateFeeParams = (params) => {
    if (!FeeEngineCore) {
        return { valid: false, errors: ["FeeEngineCore not available"], warnings: [] };
    }

    try {
        return FeeEngineCore.validate(params);
    } catch (error) {
        console.error("[FeeEngineBridge] Validation error:", error);
        return { valid: false, errors: [error.message], warnings: [] };
    }
};

/**
 * Check if FeeEngineCore is available
 * 
 * @returns {boolean} True if bridge is functional
 */
export const isFeeEngineAvailable = () => {
    return FeeEngineCore !== null;
};

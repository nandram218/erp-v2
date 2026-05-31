// =====================================================
// FEE ENGINE CONFIGURATION
// =====================================================
// Feature flags for FeeEngineCore integration
// =====================================================

export const FEE_ENGINE_CONFIG = {
    // Master switch to enable/disable FeeEngineCore
    USE_FEE_ENGINE: false,

    // Production safety: strict mode prevents accidental activation
    STRICT_MODE: true,

    // Production safety: log mode for debugging
    LOG_MODE: true,

    // Validation mode: run both engines and compare results
    VALIDATION_MODE: false,

    // Log mismatches between engines
    LOG_MISMATCHES: true,

    // Allowable difference threshold (1%)
    MISMATCH_THRESHOLD: 0.01,
};

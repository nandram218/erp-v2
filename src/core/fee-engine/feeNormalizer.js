/**
 * FeeNormalizer - Schema Transformation Layer
 * Phase 4.2.1 Stabilization: Converts FeeSettings nested structure to flat SaaS fee model
 * 
 * Purpose:
 * - Transform FeeSettings nested schema → flat SaaS-compatible structure
 * - Categorize fees into Academic, Supporting Academic, Activities, Facilities
 * - Support multi-school (schoolId) and academic year context
 * - Provide fallback to constants if FeeSettings empty
 * 
 * Architecture:
 * - PURE FUNCTION (no side effects)
 * - No localStorage access (handled by caller)
 * - No UI dependencies
 * - Service layer only
 */

const { CLASS_FEES, HOSTEL_FEE_CONST, TRANSPORT_ROUTES } = require("../constants/feeConstants");

/**
 * Categorize fee head based on name and category from FeeSettings
 * Phase 4.2.1 Critical Alignment: Respects category from FeeSettings
 * @param {string} feeName - Name of the fee
 * @param {string} category - Category from FeeSettings: 'compulsory' | 'optional'
 * @returns {string} - Category: 'academic' | 'supportingAcademicCompulsory' | 'supportingAcademicOptional' | 'activities' | 'facilities'
 */
const categorizeFee = (feeName, category = "compulsory") => {
    const name = feeName.toLowerCase();

    // Academic (always compulsory)
    if (name.includes("admission") || name.includes("tuition") || name.includes("exam") ||
        name.includes("annual") || name.includes("development") || name.includes("registration")) {
        return "academic";
    }

    // Supporting Academic - split based on category from FeeSettings
    if (name.includes("lab") || name.includes("library") || name.includes("smart class") ||
        name.includes("id card") || name.includes("computer") || name.includes("e-learning") ||
        name.includes("extra class")) {
        return category === "optional" ? "supportingAcademicOptional" : "supportingAcademicCompulsory";
    }

    // Activities (always optional)
    if (name.includes("sports") || name.includes("cultural") || name.includes("tour") ||
        name.includes("event") || name.includes("activity")) {
        return "activities";
    }

    // Facilities (conditional)
    if (name.includes("transport") || name.includes("hostel") || name.includes("mess")) {
        return "facilities";
    }

    // Default to academic for unknown fees
    return "academic";
};

/**
 * Normalize FeeSettings to SaaS-compatible fee model
 * @param {Object} feeSettings - Raw FeeSettings from storage
 * @param {Object} transportRoutes - Transport routes from transportService
 * @param {Object} context - Context: { schoolId, academicYear }
 * @returns {Object} - Normalized fee structure
 */
export const normalizeFeeSettings = (feeSettings, transportRoutes = [], context = {}) => {
    const { schoolId = "default", academicYear = "2024-25" } = context;

    // If FeeSettings is empty, return null (caller should use fallback)
    if (!feeSettings || !feeSettings.classes || Object.keys(feeSettings.classes).length === 0) {
        return null;
    }
    
    const classFees = {};
    
    // Process each class
    Object.entries(feeSettings.classes || {}).forEach(([className, classData]) => {
        const feeTypes = classData.feeTypes || {};
        
        // Initialize categories
        const academic = [];
        const supportingAcademicCompulsory = [];
        const supportingAcademicOptional = [];
        const activities = [];
        const facilities = [];
        
        // Categorize each fee
        Object.entries(feeTypes).forEach(([feeName, feeData]) => {
            const category = categorizeFee(feeName, feeData.category);
            const feeItem = {
                name: feeName,
                amount: feeData.amount || 0,
                category: feeData.category || "compulsory"
            };
            
            switch (category) {
                case "academic":
                    academic.push(feeItem);
                    break;
                case "supportingAcademicCompulsory":
                    supportingAcademicCompulsory.push(feeItem);
                    break;
                case "supportingAcademicOptional":
                    supportingAcademicOptional.push(feeItem);
                    break;
                case "activities":
                    activities.push(feeItem);
                    break;
                case "facilities":
                    facilities.push(feeItem);
                    break;
            }
        });
        
        // Calculate totals
        const academicTotal = academic.reduce((sum, fee) => sum + fee.amount, 0);
        const supportingAcademicCompulsoryTotal = supportingAcademicCompulsory.reduce((sum, fee) => sum + fee.amount, 0);
        const supportingAcademicOptionalTotal = supportingAcademicOptional.reduce((sum, fee) => sum + fee.amount, 0);
        const supportingAcademicTotal = supportingAcademicCompulsoryTotal + supportingAcademicOptionalTotal;
        
        // Store normalized class data
        classFees[className] = {
            academic: {
                total: academicTotal,
                items: academic,
                compulsory: true
            },
            supportingAcademic: {
                total: supportingAcademicTotal,
                compulsory: {
                    total: supportingAcademicCompulsoryTotal,
                    items: supportingAcademicCompulsory
                },
                optional: {
                    total: supportingAcademicOptionalTotal,
                    items: supportingAcademicOptional
                }
            },
            activities: {
                items: activities,
                optional: true
            },
            facilities: {
                items: facilities,
                conditional: true
            }
        };
    });
    
    // Get hostel fee from settings (Phase 4.2.1 End-to-End Integration: Remove hardcoded fallback)
    // Hostel fee should come from FeeSettings only, no hardcoded fallback
    const hostelFee = feeSettings.classes?.Hostel?.feeTypes?.["Hostel Fee"]?.amount || 0;
    
    // Normalize transport routes
    const normalizedRoutes = transportRoutes.map(r => ({
        id: r.id,
        name: r.routeName,
        fee: r.monthlyFee,
        pickupPoints: r.pickupPoints || [],
        active: r.active !== false
    }));
    
    const result = {
        schoolId,
        academicYear,
        classFees,
        transportRoutes: normalizedRoutes,
        hostelFee,
        settings: feeSettings.settings || {},
        source: "FeeSettings"
    };


    return result;
};

/**
 * Get fallback fee structure from constants
 * @param {Object} context - Context: { schoolId, academicYear }
 * @returns {Object} - Fallback fee structure
 */
export const getFallbackFeeStructure = (context = {}) => {
    const { schoolId = "default", academicYear = "2024-25" } = context;
    
    const classFees = {};
    
    Object.entries(CLASS_FEES).forEach(([className, amount]) => {
        classFees[className] = {
            academic: {
                total: amount,
                items: [{ name: "Tuition Fee", amount, category: "compulsory" }],
                compulsory: true
            },
            supportingAcademic: {
                total: 0,
                compulsory: { total: 0, items: [] },
                optional: { total: 0, items: [] }
            },
            activities: {
                items: [],
                optional: true
            },
            facilities: {
                items: [],
                conditional: true
            }
        };
    });
    
    const normalizedRoutes = TRANSPORT_ROUTES.map((r, i) => ({
        id: String(i + 1),
        name: r.name,
        fee: r.fee,
        pickupPoints: [],
        active: true
    }));
    
    return {
        schoolId,
        academicYear,
        classFees,
        transportRoutes: normalizedRoutes,
        hostelFee: 0,
        settings: {},
        source: "Constants"
    };
};

/**
 * Validate fee structure integrity
 * @param {Object} feeStructure - Normalized fee structure
 * @returns {Object} - Validation result: { valid, errors, warnings }
 */
export const validateFeeStructure = (feeStructure) => {
    const errors = [];
    const warnings = [];
    
    if (!feeStructure) {
        errors.push("Fee structure is null or undefined");
        return { valid: false, errors, warnings };
    }
    
    if (!feeStructure.classFees || Object.keys(feeStructure.classFees).length === 0) {
        warnings.push("No class fees configured");
    }
    
    if (!feeStructure.transportRoutes || feeStructure.transportRoutes.length === 0) {
        warnings.push("No transport routes configured");
    }
    
    if (feeStructure.hostelFee <= 0) {
        warnings.push("Hostel fee is zero or negative");
    }
    
    // Check for negative amounts
    Object.entries(feeStructure.classFees || {}).forEach(([className, classData]) => {
        if (classData.academic.total < 0) {
            errors.push(`Academic fee for ${className} is negative`);
        }
        if (classData.supportingAcademic.total < 0) {
            errors.push(`Supporting academic fee for ${className} is negative`);
        }
    });
    
    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
};

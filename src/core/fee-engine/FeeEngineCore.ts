// =====================================================
// SaaS ERP-v2 - Fee Engine Core (PHASE 2 - STEP 1C)
// =====================================================
// RULE: This is the SINGLE SOURCE OF TRUTH for fee calculation
// No UI, no hardcoded logic outside this file
// Preserves 100% of existing ERP fee functionality
// =====================================================

// -----------------------------
// FEE CATEGORY ENUM
// -----------------------------

export enum FeeCategory {
    ACADEMIC = "academic",
    SUPPORTING_ACADEMIC = "supportingAcademic",
    FACILITIES = "facilities",
    ACTIVITIES = "activities",
    DISCOUNTS = "discounts"
}

// -----------------------------
// STUDENT TYPE (Enhanced)
// -----------------------------

export type Student = {
    // Core identifiers
    id: string;
    name: string;
    classId: string;
    schoolId: string;
    
    // Conditional flags
    isHostel?: boolean;
    transportOpted?: boolean;
    
    // Legacy compatibility (for ERP integration)
    class?: string;
    transport?: boolean;
    hostel?: boolean;
    route?: string;
    
    // Existing fee fields (for backward compatibility)
    transportFee?: number;
    hostelFee?: number;
    siblingDiscount?: number;
    
    // Additional student context
    section?: string;
    rollNumber?: string;
    siblingGroup?: string;
};

// -----------------------------
// FEE ITEM TYPE
// -----------------------------

export type FeeItem = {
    label: string;
    amount: number;
    category: FeeCategory;
    frequency: "monthly" | "quarterly" | "yearly" | "one-time";
    mandatory: boolean;
    taxable: boolean;
    description?: string;
    enabled: boolean;
};

// -----------------------------
// DISCOUNT TYPE
// -----------------------------

export type Discount = {
    type: "sibling" | "scholarship" | "earlyBird" | "custom";
    value: number;
    valueType: "flat" | "percentage";
    applicable: boolean;
    description?: string;
};

// -----------------------------
// FEE CONFIG TYPE (Enhanced)
// -----------------------------

export type FeeConfig = {
    // ================= ACADEMIC FEES =================
    admissionFee: FeeItem;
    tuitionFee: FeeItem;
    examFee: FeeItem;
    annualFee: FeeItem;
    
    // ================= SUPPORTING ACADEMIC FEES =================
    computerFee: FeeItem;
    libraryFee: FeeItem;
    labFee?: FeeItem;
    smartClassFee?: FeeItem;
    eLearningFee?: FeeItem;
    
    // ================= ACTIVITY FEES =================
    sportsFee: FeeItem;
    activityFee?: FeeItem;
    culturalFee?: FeeItem;
    eventFee?: FeeItem;
    tourFee?: FeeItem;
    
    // ================= FACILITY FEES (Conditional) =================
    transportFee: FeeItem;
    hostelFee: FeeItem;
    messFee?: FeeItem;
    
    // ================= DISCOUNTS =================
    discounts: Discount[];
    
    // ================= SCHOOL CONFIGURATION =================
    schoolId: string;
    classId: string;
    academicYear: string;
    
    // ================= CALCULATION SETTINGS =================
    calculatorMode: "simple" | "advanced";
    regularFrequency: "monthly" | "quarterly" | "yearly";
    specialFrequency: "monthly" | "quarterly" | "yearly";
    regularMonths: string[];
    specialMonths: string[];
    
    // ================= VERSION CONTROL =================
    version: string;
    effectiveFrom: string;
    effectiveTo?: string;
};

// -----------------------------
// FEE BREAKDOWN ITEM TYPE (Enhanced)
// -----------------------------

export type FeeBreakdownItem = {
    label: string;
    amount: number;
    category: FeeCategory;
    frequency: "monthly" | "quarterly" | "yearly" | "one-time";
    mandatory: boolean;
    taxable: boolean;
    description?: string;
};

// -----------------------------
// FEE RESULT TYPE (Enhanced)
// -----------------------------

export type FeeResult = {
    studentId: string;
    schoolId: string;
    classId: string;
    totalFee: number;
    breakdown: FeeBreakdownItem[];
    discounts: {
        type: string;
        amount: number;
        valueType: "flat" | "percentage";
    }[];
    
    // ================= LEGACY COMPATIBILITY =================
    // Flat structure for backward compatibility with existing ERP records
    admissionFee: number;
    tuitionFee: number;
    examFee: number;
    sportsFee: number;
    annualFee: number;
    computerFee: number;
    libraryFee: number;
    transportFee: number;
    hostelFee: number;
    siblingDiscount: number;
    
    // ================= METADATA =================
    meta: {
        currency: "INR";
        generatedAt: string;
        configVersion: string;
        academicYear: string;
        calculationMode: "simple" | "advanced";
    };
};

// -----------------------------
// VALIDATION RESULT TYPE
// -----------------------------

export type ValidationResult = {
    valid: boolean;
    errors: string[];
    warnings: string[];
};

// -----------------------------
// ERP INTEGRATION TYPES (For future mapping)
// -----------------------------

export type ERPStudent = {
    id: string;
    name: string;
    class: string;
    schoolId: string;
    transport: boolean;
    hostel: boolean;
    route: string;
    transportFee: number;
    hostelFee: number;
    siblingDiscount: number;
    section?: string;
    rollNumber?: string;
};

export type ERPFeeSettings = {
    admissionFee: number;
    tuitionFee: number;
    examFee: number;
    sportsFee: number;
    annualFee: number;
    computerFee: number;
    libraryFee: number;
};

export type ERPFeeResult = {
    studentId: string;
    totalFee: number;
    admissionFee: number;
    tuitionFee: number;
    examFee: number;
    sportsFee: number;
    annualFee: number;
    computerFee: number;
    libraryFee: number;
    transportFee: number;
    hostelFee: number;
    siblingDiscount: number;
    paidAmount: number;
    dueAmount: number;
};

// -----------------------------
// CORE ENGINE
// -----------------------------

export class FeeEngineCore {
    /**
     * MAIN ENTRY POINT
     * Calculates fees for a student based on fee configuration
     */
    static calculate(params: {
        student: Student;
        feeConfig: FeeConfig;
    }): FeeResult {
        const { student, feeConfig } = params;

        let breakdown: FeeBreakdownItem[] = [];
        let total = 0;
        let discountBreakdown: {
            type: string;
            amount: number;
            valueType: "flat" | "percentage";
        }[] = [];

        // Helper to add fee to breakdown
        const addFee = (
            item: FeeItem | undefined,
            condition: boolean = true
        ) => {
            if (!item || !condition || !item.enabled) return 0;
            const amount = item.amount || 0;
            breakdown.push({
                label: item.label,
                amount,
                category: item.category,
                frequency: item.frequency,
                mandatory: item.mandatory,
                taxable: item.taxable,
                description: item.description,
            });
            return amount;
        };

        // ================= ACADEMIC FEES =================
        const admissionFee = addFee(feeConfig.admissionFee);
        const tuitionFee = addFee(feeConfig.tuitionFee);
        const examFee = addFee(feeConfig.examFee);
        const annualFee = addFee(feeConfig.annualFee);

        // ================= SUPPORTING ACADEMIC FEES =================
        const computerFee = addFee(feeConfig.computerFee);
        const libraryFee = addFee(feeConfig.libraryFee);
        const labFee = addFee(feeConfig.labFee);
        const smartClassFee = addFee(feeConfig.smartClassFee);
        const eLearningFee = addFee(feeConfig.eLearningFee);

        // ================= ACTIVITY FEES =================
        const sportsFee = addFee(feeConfig.sportsFee);
        const activityFee = addFee(feeConfig.activityFee);
        const culturalFee = addFee(feeConfig.culturalFee);
        const eventFee = addFee(feeConfig.eventFee);
        const tourFee = addFee(feeConfig.tourFee);

        // ================= FACILITY FEES (Conditional) =================
        const transportOpted = student.transportOpted || student.transport || false;
        const isHostel = student.isHostel || student.hostel || false;

        const transportFee = addFee(feeConfig.transportFee, transportOpted);
        const hostelFee = addFee(feeConfig.hostelFee, isHostel);
        const messFee = addFee(feeConfig.messFee, isHostel);

        // Calculate subtotal before discounts
        let subtotal = 
            admissionFee + tuitionFee + examFee + annualFee +
            computerFee + libraryFee + labFee + smartClassFee + eLearningFee +
            sportsFee + activityFee + culturalFee + eventFee + tourFee +
            transportFee + hostelFee + messFee;

        // ================= DISCOUNTS =================
        let totalDiscount = 0;
        if (feeConfig.discounts && feeConfig.discounts.length > 0) {
            for (const discount of feeConfig.discounts) {
                if (!discount.applicable) continue;

                let discountAmount = 0;
                if (discount.valueType === "percentage") {
                    discountAmount = (subtotal * discount.value) / 100;
                } else {
                    discountAmount = discount.value;
                }

                discountBreakdown.push({
                    type: discount.type,
                    amount: discountAmount,
                    valueType: discount.valueType,
                });

                totalDiscount += discountAmount;
            }
        }

        // Calculate final total
        const totalFee = Math.max(0, Math.round(subtotal - totalDiscount));

        // Add discounts to breakdown (as negative amounts)
        for (const discount of discountBreakdown) {
            breakdown.push({
                label: `Discount (${discount.type})`,
                amount: -discount.amount,
                category: FeeCategory.DISCOUNTS,
                frequency: "one-time",
                mandatory: false,
                taxable: false,
            });
        }

        return {
            studentId: student.id,
            schoolId: student.schoolId,
            classId: student.classId,
            totalFee,
            breakdown,
            discounts: discountBreakdown,
            
            // Legacy compatibility fields
            admissionFee: feeConfig.admissionFee.amount || 0,
            tuitionFee: feeConfig.tuitionFee.amount || 0,
            examFee: feeConfig.examFee.amount || 0,
            sportsFee: feeConfig.sportsFee.amount || 0,
            annualFee: feeConfig.annualFee.amount || 0,
            computerFee: feeConfig.computerFee.amount || 0,
            libraryFee: feeConfig.libraryFee.amount || 0,
            transportFee: transportOpted ? (feeConfig.transportFee.amount || 0) : 0,
            hostelFee: isHostel ? (feeConfig.hostelFee.amount || 0) : 0,
            siblingDiscount: totalDiscount,
            
            meta: {
                currency: "INR",
                generatedAt: new Date().toISOString(),
                configVersion: feeConfig.version,
                academicYear: feeConfig.academicYear,
                calculationMode: feeConfig.calculatorMode,
            },
        };
    }

    /**
     * SAFE VALIDATION LAYER
     */
    static validateConfig(config: FeeConfig): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!config) {
            errors.push("FeeConfig is required");
            return { valid: false, errors, warnings };
        }

        // Required fields
        if (!config.schoolId) errors.push("schoolId is required");
        if (!config.classId) errors.push("classId is required");
        if (!config.academicYear) errors.push("academicYear is required");
        if (!config.version) errors.push("version is required");
        if (!config.effectiveFrom) errors.push("effectiveFrom is required");

        // Required fee items
        if (!config.admissionFee) errors.push("admissionFee is required");
        if (!config.tuitionFee) errors.push("tuitionFee is required");
        if (!config.examFee) errors.push("examFee is required");
        if (!config.annualFee) errors.push("annualFee is required");
        if (!config.computerFee) errors.push("computerFee is required");
        if (!config.libraryFee) errors.push("libraryFee is required");
        if (!config.sportsFee) errors.push("sportsFee is required");
        if (!config.transportFee) errors.push("transportFee is required");
        if (!config.hostelFee) errors.push("hostelFee is required");

        // Warnings
        if (!config.discounts || config.discounts.length === 0) {
            warnings.push("No discounts configured");
        }

        if (config.labFee && !config.labFee.enabled) {
            warnings.push("labFee is configured but disabled");
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }

    /**
     * DEBUG HELPER (safe for dev only)
     */
    static debug(params: {
        student: Student;
        feeConfig: FeeConfig;
    }) {
        const result = this.calculate(params);
        console.log("[FEE ENGINE DEBUG]", result);
        return result;
    }

    /**
     * VALIDATION HELPER
     */
    static validate(params: {
        student: Student;
        feeConfig: FeeConfig;
    }): ValidationResult {
        const configValidation = this.validateConfig(params.feeConfig);
        
        if (!configValidation.valid) {
            return configValidation;
        }

        const warnings = [...configValidation.warnings];

        // Student validation
        if (!params.student.id) {
            return { valid: false, errors: ["Student ID is required"], warnings };
        }

        if (!params.student.classId && !params.student.class) {
            warnings.push("Student classId is missing");
        }

        return { valid: true, errors: [], warnings };
    }
}

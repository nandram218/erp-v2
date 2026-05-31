// =====================================================
// FEE ENGINE MAPPER
// =====================================================
// Mapping layer between ERP data structures and FeeEngineCore
// =====================================================

/* =========================
   ERP STUDENT → FEE ENGINE STUDENT
========================= */

/**
 * Maps ERP Student structure to FeeEngine Student structure
 * 
 * @param {Object} erpStudent - ERP student object from StudentForm
 * @returns {Object} FeeEngineCore compatible student object
 * @throws {Error} If required fields (id, name, class) are missing
 */
export const mapERPStudentToFeeEngineStudent = (erpStudent = {}) => {
    // =========================
    // VALIDATION
    // =========================

    if (!erpStudent.id && !erpStudent.studentId) {
        throw new Error("Student ID is required for fee calculation");
    }

    if (!erpStudent.name) {
        throw new Error("Student name is required for fee calculation");
    }

    if (!erpStudent.class) {
        throw new Error("Student class is required for fee calculation");
    }

    if (!erpStudent.schoolId) {
        console.warn("[FeeEngineMapper] schoolId is missing, using empty string");
    }

    // =========================
    // FIELD MAPPING
    // =========================

    const feeEngineStudent = {
        // Core identifiers
        id: erpStudent.id || erpStudent.studentId,
        name: erpStudent.name,
        classId: erpStudent.class, // class → classId transformation
        schoolId: erpStudent.schoolId || "",

        // Conditional flags (transformed from ERP fields)
        isHostel: erpStudent.hostel || false, // hostel → isHostel transformation
        transportOpted: erpStudent.transport || false, // transport → transportOpted transformation

        // Legacy compatibility (preserve original ERP fields)
        class: erpStudent.class,
        transport: erpStudent.transport,
        hostel: erpStudent.hostel,
        route: erpStudent.route || "",

        // Existing fee fields (with default to 0 for safety)
        transportFee: Number(erpStudent.transportFee) || 0,
        hostelFee: Number(erpStudent.hostelFee) || 0,
        siblingDiscount: Number(erpStudent.siblingDiscount) || 0,

        // Additional student context
        section: erpStudent.section || "",
        rollNumber: erpStudent.rollNumber || "",
        siblingGroup: erpStudent.siblingGroup || "", // default empty string

        // Additional ERP fields (preserved for backward compatibility)
        fatherName: erpStudent.fatherName || "",
        mobile: erpStudent.mobile || "",
        fatherMobile: erpStudent.fatherMobile || "",
        motherName: erpStudent.motherName || "",
        motherMobile: erpStudent.motherMobile || "",
        dob: erpStudent.dob || "",
        gender: erpStudent.gender || "",
        bloodGroup: erpStudent.bloodGroup || "",
        category: erpStudent.category || "",
        religion: erpStudent.religion || "",
        nationality: erpStudent.nationality || "",
        aadhar: erpStudent.aadhar || "",
        janAadhar: erpStudent.janAadhar || "",
        aparId: erpStudent.aparId || "",
        RTE: erpStudent.RTE || false,
        stream: erpStudent.stream || "",
        previousSchool: erpStudent.previousSchool || "",
        tcNo: erpStudent.tcNo || "",
        lastClass: erpStudent.lastClass || "",
    };

    return feeEngineStudent;
};

/* =========================
   ERP FEE SETTINGS → FEE ENGINE CONFIG
========================= */

/**
 * Maps ERP Fee Settings to FeeEngine FeeConfig structure
 * 
 * RULES:
 * - All fee amounts are YEARLY amounts only
 * - No installment logic in mapper (belongs to Installment Engine)
 * - Route fee comes from Route Setup, not Fee Setup
 * - Categories: Academic, Supporting Academic, Facility, SpecialOccasional
 * - Supports Simple and Advanced Collection Mode (metadata only, no execution)
 * 
 * @param {Object} erpSettings - ERP fee settings object (flat structure, yearly amounts)
 * @param {Object} context - Additional context (schoolId, classId, academicYear)
 * @returns {Object} FeeEngineCore compatible FeeConfig object
 * @throws {Error} If required context fields are missing
 */
export const mapERPFeeSettingsToFeeConfig = (erpSettings = {}, context = {}) => {
    // =========================
    // VALIDATION
    // =========================

    if (!context.schoolId) {
        throw new Error("schoolId is required in context for fee config mapping");
    }

    if (!context.classId) {
        throw new Error("classId is required in context for fee config mapping");
    }

    if (!context.academicYear) {
        console.warn("[FeeEngineMapper] academicYear missing, using current year");
    }

    // =========================
    // SAFE NUMBER HELPER
    // =========================

    const safeNum = (val) => Number(val) || 0;
    const safeBool = (val) => Boolean(val);

    // =========================
    // FEE ITEM HELPER
    // =========================

    const createFeeItem = (
        label,
        amount,
        category,
        mandatory = true,
        taxable = true,
        enabled = true,
        description = ""
    ) => ({
        label,
        amount: safeNum(amount),
        category,
        frequency: "yearly", // ALL fees are yearly amounts
        mandatory,
        taxable,
        enabled,
        description,
    });

    // =========================
    // CATEGORY MAPPING
    // =========================

    const academicYear = context.academicYear || new Date().getFullYear().toString();
    const currentVersion = "1.0.0";
    const effectiveFrom = new Date().toISOString();

    // =========================
    // BUILD FEE CONFIG
    // =========================

    const feeConfig = {
        // ================= ACADEMIC FEES (Mandatory) =================
        admissionFee: createFeeItem(
            "Admission Fee",
            erpSettings.admissionFee,
            "academic",
            true,
            true,
            safeBool(erpSettings.admissionFeeEnabled !== false),
            "One-time admission fee (yearly amount)"
        ),
        tuitionFee: createFeeItem(
            "Tuition Fee",
            erpSettings.tuitionFee,
            "academic",
            true,
            true,
            true,
            "Annual tuition fee (yearly amount)"
        ),
        examFee: createFeeItem(
            "Exam Fee",
            erpSettings.examFee,
            "academic",
            true,
            true,
            true,
            "Annual examination fee (yearly amount)"
        ),
        annualFee: createFeeItem(
            "Annual Fee",
            erpSettings.annualFee,
            "academic",
            true,
            true,
            true,
            "Annual school fee (yearly amount)"
        ),

        // ================= SUPPORTING ACADEMIC FEES (Mandatory) =================
        computerFee: createFeeItem(
            "Computer Fee",
            erpSettings.computerFee,
            "supportingAcademic",
            true,
            true,
            true,
            "Computer lab and IT infrastructure fee (yearly amount)"
        ),
        libraryFee: createFeeItem(
            "Library Fee",
            erpSettings.libraryFee,
            "supportingAcademic",
            true,
            true,
            true,
            "Library and reading resources fee (yearly amount)"
        ),
        labFee: erpSettings.labFee ? createFeeItem(
            "Lab Fee",
            erpSettings.labFee,
            "supportingAcademic",
            true,
            true,
            safeBool(erpSettings.labFeeEnabled !== false),
            "Science laboratory fee (yearly amount)"
        ) : undefined,
        smartClassFee: erpSettings.smartClassFee ? createFeeItem(
            "Smart Class Fee",
            erpSettings.smartClassFee,
            "supportingAcademic",
            false,
            true,
            safeBool(erpSettings.smartClassFeeEnabled !== false),
            "Digital classroom fee (yearly amount)"
        ) : undefined,
        eLearningFee: erpSettings.eLearningFee ? createFeeItem(
            "E-Learning Fee",
            erpSettings.eLearningFee,
            "supportingAcademic",
            false,
            true,
            safeBool(erpSettings.eLearningFeeEnabled !== false),
            "Online learning platform fee (yearly amount)"
        ) : undefined,

        // ================= FACILITY FEES (Optional) =================
        // NOTE: Transport fee comes from Route Setup, not Fee Setup
        // This is a placeholder for yearly facility fee if applicable
        hostelFee: erpSettings.hostelFee ? createFeeItem(
            "Hostel Fee",
            erpSettings.hostelFee,
            "facilities",
            false,
            true,
            safeBool(erpSettings.hostelFeeEnabled !== false),
            "Hostel accommodation fee (yearly amount)"
        ) : undefined,
        messFee: erpSettings.messFee ? createFeeItem(
            "Mess Fee",
            erpSettings.messFee,
            "facilities",
            false,
            true,
            safeBool(erpSettings.messFeeEnabled !== false),
            "Hostel mess/food fee (yearly amount)"
        ) : undefined,

        // ================= SPECIAL / OCCASIONAL FEES (Optional) =================
        sportsFee: createFeeItem(
            "Sports Fee",
            erpSettings.sportsFee,
            "specialOccasional",
            false,
            true,
            safeBool(erpSettings.sportsFeeEnabled !== false),
            "Sports and physical education fee (yearly amount)"
        ),
        activityFee: erpSettings.activityFee ? createFeeItem(
            "Activity Fee",
            erpSettings.activityFee,
            "specialOccasional",
            false,
            true,
            safeBool(erpSettings.activityFeeEnabled !== false),
            "Co-curricular activities fee (yearly amount)"
        ) : undefined,
        culturalFee: erpSettings.culturalFee ? createFeeItem(
            "Cultural Fee",
            erpSettings.culturalFee,
            "specialOccasional",
            false,
            true,
            safeBool(erpSettings.culturalFeeEnabled !== false),
            "Cultural events fee (yearly amount)"
        ) : undefined,
        eventFee: erpSettings.eventFee ? createFeeItem(
            "Event Fee",
            erpSettings.eventFee,
            "specialOccasional",
            false,
            true,
            safeBool(erpSettings.eventFeeEnabled !== false),
            "Annual events fee (yearly amount)"
        ) : undefined,
        tourFee: erpSettings.tourFee ? createFeeItem(
            "Tour Fee",
            erpSettings.tourFee,
            "specialOccasional",
            false,
            true,
            safeBool(erpSettings.tourFeeEnabled !== false),
            "Educational tour fee (yearly amount)"
        ) : undefined,

        // ================= DISCOUNTS =================
        discounts: [
            {
                type: "sibling",
                value: safeNum(erpSettings.siblingDiscountRate || 0),
                valueType: "percentage",
                applicable: safeBool(erpSettings.siblingDiscountEnabled !== false),
                description: "Sibling discount",
            },
        ],

        // ================= SCHOOL CONFIGURATION =================
        schoolId: context.schoolId,
        classId: context.classId,
        academicYear,

        // ================= COLLECTION MODE (Metadata Only - No Execution) =================
        // Simple Mode: Total fee / frequency
        // Advanced Mode: Event-based installment mapping
        calculatorMode: erpSettings.calculatorMode || "simple",
        collectionMode: erpSettings.collectionMode || "simple", // simple | advanced

        // ================= VERSION CONTROL =================
        version: currentVersion,
        effectiveFrom,
        effectiveTo: erpSettings.effectiveTo || undefined,
    };

    return feeConfig;
};

/* =========================
   FEE ENGINE RESULT → ERP FEE RESULT
========================= */

/**
 * Maps FeeEngineCore FeeResult to ERP-compatible fee record
 * 
 * RULES:
 * - No installment logic (belongs to Installment Engine)
 * - Returns yearly total only
 * - Installments generated by separate Installment Engine
 * 
 * @param {Object} feeResult - FeeEngineCore calculation result
 * @param {Object} student - Original ERP student object
 * @param {number} paidAmount - Amount already paid (default: 0)
 * @returns {Object} ERP-compatible fee record
 */
export const mapFeeEngineResultToERPFeeResult = (feeResult = {}, student = {}, paidAmount = 0) => {
    // =========================
    // VALIDATION
    // =========================

    if (!feeResult.studentId) {
        console.warn("[FeeEngineMapper] feeResult missing studentId");
    }

    // =========================
    // SAFE NUMBER HELPER
    // =========================

    const safeNum = (val) => Number(val) || 0;

    // =========================
    // CALCULATE DUE AMOUNT
    // =========================

    const totalFee = safeNum(feeResult.totalFee);
    const paid = safeNum(paidAmount);
    const dueAmount = Math.max(0, totalFee - paid);

    // =========================
    // DETERMINE STATUS
    // =========================

    const status = dueAmount <= 0 ? "paid" : "due";

    // =========================
    // BUILD ERP FEE RECORD
    // =========================

    const erpFeeRecord = {
        // ================= BASIC INFO =================
        studentId: feeResult.studentId || student.id || student.studentId || "",
        studentName: student.name || student.studentName || "",
        className: student.class || student.className || student.classId || "",
        section: student.section || "",
        rollNumber: student.rollNumber || "",

        // ================= FEE BREAKDOWN (Flat for ERP compatibility) =================
        admissionFee: safeNum(feeResult.admissionFee),
        tuitionFee: safeNum(feeResult.tuitionFee),
        examFee: safeNum(feeResult.examFee),
        sportsFee: safeNum(feeResult.sportsFee),
        annualFee: safeNum(feeResult.annualFee),
        computerFee: safeNum(feeResult.computerFee),
        libraryFee: safeNum(feeResult.libraryFee),
        transportFee: safeNum(feeResult.transportFee),
        hostelFee: safeNum(feeResult.hostelFee),
        siblingDiscount: safeNum(feeResult.siblingDiscount),

        // ================= TOTALS (Yearly Total Only) =================
        totalFee, // Yearly total
        paidAmount: paid,
        dueAmount,

        // ================= STATUS =================
        status,

        // ================= TRACKING =================
        dueDate: feeResult.meta?.generatedAt || new Date().toISOString(),
        nextDueDate: dueAmount > 0 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        submittedTill: null,
        lastPaymentDate: paid > 0 ? new Date().toISOString() : null,
        lastPaymentAmount: paid,
        overdueAmount: 0,
        penaltyAmount: 0,
        discountAmount: safeNum(feeResult.siblingDiscount),

        // ================= SIBLING INFO =================
        siblingGroup: student.siblingGroup || "",
        siblingAccounts: student.siblings || [],

        // ================= STRUCTURED BREAKDOWN (New for SaaS) =================
        breakdown: feeResult.breakdown || [],
        discounts: feeResult.discounts || [],

        // ================= METADATA =================
        currency: feeResult.meta?.currency || "INR",
        generatedAt: feeResult.meta?.generatedAt || new Date().toISOString(),
        configVersion: feeResult.meta?.configVersion || "1.0.0",
        academicYear: feeResult.meta?.academicYear || "",
        calculationMode: feeResult.meta?.calculationMode || "simple",

        // ================= PAYMENT HISTORY =================
        payments: [],

        // ================= ERP TIMESTAMPS =================
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    return erpFeeRecord;
};

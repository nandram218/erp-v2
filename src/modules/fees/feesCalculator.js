/* =========================================================
   SAFE NUMBER
========================================================= */

const num = (v) => Number(v || 0);

/* =========================================================
   FEE ENGINE IMPORTS (PHASE 3B - STEP 3)
========================================================= */

import { FEE_ENGINE_CONFIG } from "../../core/fee-engine/feeEngineConfig.js";
import { mapERPStudentToFeeEngineStudent } from "../../core/fee-engine/feeEngineMapper.js";
import { mapERPFeeSettingsToFeeConfig } from "../../core/fee-engine/feeEngineMapper.js";
import { mapFeeEngineResultToERPFeeResult } from "../../core/fee-engine/feeEngineMapper.js";
import { calculateFee, isFeeEngineAvailable } from "../../core/fee-engine/feeEngineCoreBridge.js";

/* =========================================================
   FEE ENGINE WRAPPER LAYER (PHASE 3B - STEP 3)
=========================================================
   Safe wrapper for future FeeEngineCore integration
   Currently USE_FEE_ENGINE = false, so legacy path active
========================================================= */

/**
 * Unified Fee Calculation Entry Point
 * 
 * This function provides a safe wrapper for future FeeEngineCore integration.
 * Currently routes to legacy buildStudentFeesRecord.
 * 
 * FUTURE FLOW (when USE_FEE_ENGINE = true):
 * ERP Student
 *   → mapERPStudentToFeeEngineStudent
 *   → mapERPFeeSettingsToFeeConfig
 *   → FeeEngineCore.calculate
 *   → mapFeeEngineResultToERPFeeResult
 *   → ERP Fee Record
 * 
 * @param {Object} params - Calculation parameters
 * @param {Object} params.student - ERP student object
 * @param {Object} params.feeSettings - ERP fee settings object
 * @param {Object} params.context - Additional context (schoolId, classId, academicYear)
 * @returns {Object} Fee record (current: legacy, future: FeeEngineCore result)
 */
export const calculateStudentFees = ({
    student = {},
    feeSettings = {},
    context = {}
}) => {
    
    // =========================
    // FEATURE FLAG CHECK
    // =========================
    
    const { USE_FEE_ENGINE } = FEE_ENGINE_CONFIG;
    
    // =========================
    // LEGACY PATH (Current)
    // =========================
    
    if (USE_FEE_ENGINE === false) {
        return buildStudentFeesRecord({
            student,
            feeSettings
        });
    }
    
    // =========================
    // FEE ENGINE PATH (Future - Bridge Integration)
    // =========================

    if (USE_FEE_ENGINE === true) {
        // Check if bridge is available
        if (!isFeeEngineAvailable()) {
            console.warn("[FeesCalculator] FeeEngineCore bridge not available, falling back to legacy");
            return buildStudentFeesRecord({
                student,
                feeSettings
            });
        }

        try {
            // Step 1: Map ERP Student to FeeEngine format
            const feeEngineStudent = mapERPStudentToFeeEngineStudent(student);

            // Step 2: Map ERP Fee Settings to FeeConfig
            const feeConfig = mapERPFeeSettingsToFeeConfig(feeSettings, context);

            // Step 3: Execute FeeEngineCore calculation via bridge
            const feeResult = calculateFee({
                student: feeEngineStudent,
                feeConfig
            });

            // Step 4: Map FeeEngine result back to ERP format
            const erpFeeRecord = mapFeeEngineResultToERPFeeResult(
                feeResult,
                student,
                0 // paidAmount
            );

            // Step 5: Return ERP-compatible record
            return erpFeeRecord;
        } catch (error) {
            console.error("[FeesCalculator] FeeEngine calculation error:", error);
            // Fallback to legacy on error
            return buildStudentFeesRecord({
                student,
                feeSettings
            });
        }
    }
    
    // Fallback to legacy
    return buildStudentFeesRecord({
        student,
        feeSettings
    });
};

/* =========================================================
   DATE HELPERS
========================================================= */

const getNextDueDate = () => {

    const d = new Date();

    d.setMonth(d.getMonth() + 1);

    return d.toISOString();
};

/* =========================================================
   BUILD PROFESSIONAL STUDENT FEES RECORD
========================================================= */

export const buildStudentFeesRecord = ({
    student = {},
    feeSettings = {},
}) => {

    /* =========================================
       MASTER STUDENT INFO
    ========================================= */

    const studentId =
        student?.id ||
        Date.now();

    const studentName =
        student?.name ||
        student?.studentName ||
        "";

    const fatherName =
        student?.fatherName ||
        student?.father ||
        "";

    const mobile =
        student?.mobile ||
        student?.phone ||
        "";

    const className =
        student?.className ||
        student?.class ||
        student?.studentClass ||
        "";

    const section =
        student?.section || "";

    const rollNumber =
        student?.rollNumber || "";

    /* =========================================
       OPTIONAL FACILITIES
    ========================================= */

    const transportFee =
        num(student?.transportFee);

    const hostelFee =
        num(student?.hostelFee);

    const siblingDiscount =
        num(student?.siblingDiscount);

    /* =========================================
       MASTER FEES
    ========================================= */

    const admissionFee =
        num(feeSettings?.admissionFee);

    const tuitionFee =
        num(feeSettings?.tuitionFee);

    const examFee =
        num(feeSettings?.examFee);

    const sportsFee =
        num(feeSettings?.sportsFee);

    const annualFee =
        num(feeSettings?.annualFee);

    const computerFee =
        num(feeSettings?.computerFee);

    const libraryFee =
        num(feeSettings?.libraryFee);

    /* =========================================
       TOTAL FEES
    ========================================= */

    const totalFee =

        admissionFee +
        tuitionFee +
        examFee +
        sportsFee +
        annualFee +
        computerFee +
        libraryFee +
        transportFee +
        hostelFee -
        siblingDiscount;

    /* =========================================
       INITIAL PAYMENT
    ========================================= */

    const paidAmount = 0;

    const dueAmount =
        totalFee;

    /* =========================================
       STATUS
    ========================================= */

    const status =
        dueAmount <= 0
            ? "paid"
            : "due";

    /* =========================================
       FINAL OBJECT
    ========================================= */

    return {

        /* BASIC */
        studentId,
        studentName,
        fatherName,
        mobile,
        className,
        section,
        rollNumber,

        /* FEES BREAKDOWN */
        admissionFee,
        tuitionFee,
        examFee,
        sportsFee,
        annualFee,
        computerFee,
        libraryFee,
        transportFee,
        hostelFee,
        siblingDiscount,

        /* TOTALS */
        totalFee,
        paidAmount,
        dueAmount,

        /* TRACKING */
        status,
        dueDate:
            getNextDueDate(),

        nextDueDate:
            getNextDueDate(),

        submittedTill:
            null,

        lastPaymentDate:
            null,

        lastPaymentAmount:
            0,

        overdueAmount:
            0,

        penaltyAmount:
            0,

        discountAmount:
            0,

        /* SIBLING */
        siblingGroup:
            student?.siblingGroup ||
            "",

        siblingAccounts:
            student?.siblings || [],

        /* HISTORY */
        payments: [],

        /* ERP */
        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString(),
    };
};

/* =========================================================
   APPLY PAYMENT
========================================================= */

export const applyPaymentToStudent = ({
    studentRecord = {},
    paymentData = {},
}) => {

    const oldPaid =
        num(
            studentRecord?.paidAmount
        );

    const oldDue =
        num(
            studentRecord?.dueAmount
        );

    const payment =
        num(paymentData?.amount);

    const discount =
        num(paymentData?.discount);

    const penalty =
        num(paymentData?.penalty);

    const finalPaid =
        payment + discount;

    const updatedPaid =
        oldPaid + finalPaid;

    const updatedDue =
        oldDue -
        finalPaid +
        penalty;

    const finalDue =
        updatedDue < 0
            ? 0
            : updatedDue;

    /* =====================================
       STATUS
    ===================================== */

    let status = "due";

    if (finalDue <= 0) {
        status = "paid";
    }

    /* =====================================
       PAYMENT ENTRY
    ===================================== */

    const paymentEntry = {

        ...paymentData,

        discount,
        penalty,

        previousDue:
            oldDue,

        remainingDue:
            finalDue,

        paymentDate:
            paymentData?.paymentDate ||
            new Date().toISOString(),
    };

    /* =====================================
       FINAL RECORD
    ===================================== */

    return {

        ...studentRecord,

        paidAmount:
            updatedPaid,

        dueAmount:
            finalDue,

        penaltyAmount:
            num(
                studentRecord?.penaltyAmount
            ) + penalty,

        discountAmount:
            num(
                studentRecord?.discountAmount
            ) + discount,

        lastPaymentAmount:
            payment,

        lastPaymentDate:
            new Date().toISOString(),

        submittedTill:
            new Date().toLocaleDateString(),

        nextDueDate:
            finalDue > 0
                ? getNextDueDate()
                : null,

        status,

        payments: [
            paymentEntry,
            ...(
                studentRecord?.payments ||
                []
            ),
        ],

        updatedAt:
            new Date().toISOString(),
    };
};
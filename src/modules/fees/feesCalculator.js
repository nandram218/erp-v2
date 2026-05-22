/* =========================================================
   SAFE NUMBER
========================================================= */

const num = (v) => Number(v || 0);

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
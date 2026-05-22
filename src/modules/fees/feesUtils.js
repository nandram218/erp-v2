// src/modules/fees/feesUtils.js

import {
    PAYMENT_STATUS,
    RECEIPT_PREFIX,
    RECEIPT_PADDING,
} from "./feesConstants";

/* =========================================================
   SAFE NUMBER
========================================================= */

export const toNumber = (value) => {
    const num = Number(value);
    return Number.isNaN(num) ? 0 : num;
};

/* =========================================================
   CURRENCY FORMAT
========================================================= */

export const formatCurrency = (amount = 0) => {
    return `₹${toNumber(amount).toLocaleString("en-IN")}`;
};

/* =========================================================
   DATE FORMAT
========================================================= */

export const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    try {
        const date = new Date(dateValue);

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch (error) {
        return "-";
    }
};

/* =========================================================
   TIME FORMAT
========================================================= */

export const formatTime = (dateValue) => {
    if (!dateValue) return "-";

    try {
        const date = new Date(dateValue);

        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch (error) {
        return "-";
    }
};

/* =========================================================
   FULL DATE TIME
========================================================= */

export const formatDateTime = (dateValue) => {
    if (!dateValue) return "-";

    try {
        const date = new Date(dateValue);

        return `${formatDate(date)} • ${formatTime(date)}`;
    } catch (error) {
        return "-";
    }
};

/* =========================================================
   STATUS CALCULATOR
========================================================= */

export const getPaymentStatus = ({
    totalFee = 0,
    paidAmount = 0,
}) => {
    const total = toNumber(totalFee);
    const paid = toNumber(paidAmount);

    if (paid <= 0) {
        return PAYMENT_STATUS.UNPAID;
    }

    if (paid >= total) {
        return PAYMENT_STATUS.PAID;
    }

    return PAYMENT_STATUS.PARTIAL;
};

/* =========================================================
   DUE AMOUNT
========================================================= */

export const calculateDueAmount = ({
    totalFee = 0,
    paidAmount = 0,
}) => {
    const due = toNumber(totalFee) - toNumber(paidAmount);

    return due > 0 ? due : 0;
};

/* =========================================================
   RECEIPT NUMBER GENERATOR
========================================================= */

export const generateReceiptNumber = (counter = 1) => {
    return `${RECEIPT_PREFIX}${String(counter).padStart(
        RECEIPT_PADDING,
        "0"
    )}`;
};

/* =========================================================
   UNIQUE PAYMENT ID
========================================================= */

export const generatePaymentId = () => {
    return `PAY_${Date.now()}_${Math.floor(
        Math.random() * 100000
    )}`;
};

/* =========================================================
   SAFE ARRAY
========================================================= */

export const safeArray = (data) => {
    return Array.isArray(data) ? data : [];
};

/* =========================================================
   SAFE OBJECT
========================================================= */

export const safeObject = (data) => {
    return data && typeof data === "object" ? data : {};
};

/* =========================================================
   SEARCH FILTER
========================================================= */

export const matchesSearch = (student, search = "") => {
    if (!search?.trim()) return true;

    const query = search.toLowerCase();

    return (
        student?.studentName?.toLowerCase()?.includes(query) ||
        student?.className?.toLowerCase()?.includes(query) ||
        student?.section?.toLowerCase()?.includes(query) ||
        String(student?.rollNumber || "")
            .toLowerCase()
            .includes(query) ||
        String(student?.admissionNumber || "")
            .toLowerCase()
            .includes(query)
    );
};

/* =========================================================
   CLASS FILTER
========================================================= */

export const matchesClass = (
    student,
    className = "All"
) => {
    if (className === "All") return true;

    return student?.className === className;
};

/* =========================================================
   SECTION FILTER
========================================================= */

export const matchesSection = (
    student,
    section = "All"
) => {
    if (section === "All") return true;

    return student?.section === section;
};

/* =========================================================
   STATUS FILTER
========================================================= */

export const matchesStatus = (
    student,
    status = "All"
) => {
    if (status === "All") return true;

    return student?.status === status;
};

/* =========================================================
   PROFESSIONAL FILTER ENGINE
========================================================= */

export const filterFeesData = ({
    data = [],
    filters = {},
}) => {
    return safeArray(data).filter((student) => {
        return (
            matchesSearch(student, filters.search) &&
            matchesClass(student, filters.className) &&
            matchesSection(student, filters.section) &&
            matchesStatus(student, filters.status)
        );
    });
};

/* =========================================================
   SORT BY CLASS + ROLL
========================================================= */

export const sortFeesData = (data = []) => {
    return [...safeArray(data)].sort((a, b) => {
        const classCompare = String(a.className).localeCompare(
            String(b.className),
            undefined,
            { numeric: true }
        );

        if (classCompare !== 0) {
            return classCompare;
        }

        return toNumber(a.rollNumber) - toNumber(b.rollNumber);
    });
};

/* =========================================================
   SUMMARY CALCULATOR
========================================================= */

export const calculateSummary = (data = []) => {
    const fees = safeArray(data);

    return fees.reduce(
        (acc, item) => {
            const total = toNumber(item.totalFee);
            const paid = toNumber(item.paidAmount);
            const due = toNumber(item.dueAmount);

            acc.totalCollection += paid;
            acc.totalDue += due;
            acc.totalFees += total;

            if (item.status === PAYMENT_STATUS.PAID) {
                acc.paidStudents += 1;
            }

            if (
                item.status === PAYMENT_STATUS.PARTIAL ||
                item.status === PAYMENT_STATUS.UNPAID ||
                item.status === PAYMENT_STATUS.OVERDUE
            ) {
                acc.dueStudents += 1;
            }

            return acc;
        },
        {
            totalCollection: 0,
            totalDue: 0,
            totalFees: 0,
            paidStudents: 0,
            dueStudents: 0,
        }
    );
};

/* =========================================================
   PAYMENT HISTORY FLATTENER
========================================================= */

export const flattenPaymentHistory = (
    feesData = []
) => {
    const history = [];

    safeArray(feesData).forEach((student) => {
        safeArray(student.payments).forEach((payment) => {
            history.push({
                ...payment,

                studentId: student.studentId,
                studentName: student.studentName,
                className: student.className,
                section: student.section,
                rollNumber: student.rollNumber,

                totalFee: student.totalFee,
                paidAmount: student.paidAmount,
                dueAmount: student.dueAmount,
            });
        });
    });

    return history.sort(
        (a, b) =>
            new Date(b.paymentDate) -
            new Date(a.paymentDate)
    );
};

/* =========================================================
   EXPORTABLE RECEIPT DATA
========================================================= */

export const buildReceiptData = ({
    school = {},
    student = {},
    payment = {},
}) => {
    return {
        schoolName: school?.schoolName || "",
        schoolAddress: school?.address || "",
        schoolPhone: school?.phone || "",

        receiptNo: payment?.receiptNo || "",
        paymentDate: payment?.paymentDate || "",

        studentName: student?.studentName || "",
        className: student?.className || "",
        section: student?.section || "",
        rollNumber: student?.rollNumber || "",

        totalFee: student?.totalFee || 0,
        paidAmount: student?.paidAmount || 0,
        dueAmount: student?.dueAmount || 0,

        amount: payment?.amount || 0,
        paymentMode: payment?.paymentMode || "Cash",

        remarks: payment?.remarks || "",
        collectedBy: payment?.collectedBy || "",
    };
};

/* =========================================================
   PROFESSIONAL STATUS COLOR
========================================================= */

export const getStatusColor = (status) => {
    switch (status) {
        case PAYMENT_STATUS.PAID:
            return "#16a34a";

        case PAYMENT_STATUS.PARTIAL:
            return "#f59e0b";

        case PAYMENT_STATUS.UNPAID:
            return "#dc2626";

        case PAYMENT_STATUS.OVERDUE:
            return "#991b1b";

        default:
            return "#64748b";
    }
};

/* =========================================================
   PROFESSIONAL STATUS LABEL
========================================================= */

export const getStatusLabel = (status) => {
    switch (status) {
        case PAYMENT_STATUS.PAID:
            return "Paid";

        case PAYMENT_STATUS.PARTIAL:
            return "Partial";

        case PAYMENT_STATUS.UNPAID:
            return "Unpaid";

        case PAYMENT_STATUS.OVERDUE:
            return "Overdue";

        default:
            return "Unknown";
    }
};
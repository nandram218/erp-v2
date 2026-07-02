/**
 * @CONTRACT Financial
 * @LOCK STABLE
 *
 * src/modules/fees/feesConstants.js
 */

/* =========================
   CENTRAL STORAGE KEYS
========================= */

export const FEES_DB_KEY = "ERP_FEES_DB";

/* =========================
   PAYMENT STATUS
========================= */

export const PAYMENT_STATUS = {
    PAID: "paid",
    PARTIAL: "partial",
    UNPAID: "unpaid",
    OVERDUE: "overdue",
};

/* =========================
   PAYMENT MODES
========================= */

export const PAYMENT_MODES = [
    "Cash",
    "Online",
    "UPI",
    "Bank Transfer",
    "Cheque",
    "Card",
];

/* =========================
   FEE TYPES
========================= */

export const FEE_TYPES = [
    "Tuition Fee",
    "Admission Fee",
    "Exam Fee",
    "Transport Fee",
    "Hostel Fee",
    "Library Fee",
    "Sports Fee",
    "Annual Fee",
    "Computer Fee",
    "Activity Fee",
    "Other Fee",
];

/* =========================
   INSTALLMENT MODES
========================= */

export const INSTALLMENT_MODES = [
    "Monthly",
    "Quarterly",
    "Half-Yearly",
    "Yearly",
    "Custom",
];

/* =========================
   RECEIPT SETTINGS
========================= */

export const RECEIPT_PREFIX = "RCPT";
export const RECEIPT_PADDING = 5;

/* =========================
   DATE FORMATS
========================= */

export const DATE_FORMAT = "dd/MM/yyyy";
export const TIME_FORMAT = "hh:mm a";

/* =========================
   DEFAULT FILTERS
========================= */

export const DEFAULT_FEES_FILTERS = {
    search: "",
    className: "All",
    section: "All",
    status: "All",
};

/* =========================
   SUMMARY CARD COLORS
========================= */

export const SUMMARY_COLORS = {
    total: "#2563eb",
    paid: "#16a34a",
    due: "#dc2626",
    students: "#7c3aed",
};

/* =========================
   TABLE PAGINATION
========================= */

export const FEES_TABLE_PAGE_SIZE = 10;

/* =========================
   PRINT SETTINGS
========================= */

export const PRINT_PAGE_TITLE = "Fee Receipt";

/* =========================
   DEFAULT FEE RECORD
========================= */

export const DEFAULT_FEE_RECORD = {
    studentId: "",
    studentName: "",
    className: "",
    section: "",
    rollNumber: "",

    totalFee: 0,
    paidAmount: 0,
    dueAmount: 0,

    status: PAYMENT_STATUS.UNPAID,

    payments: [],
    createdAt: "",
    updatedAt: "",
};

/* =========================
   DEFAULT PAYMENT ENTRY
========================= */

export const DEFAULT_PAYMENT_ENTRY = {
    receiptNo: "",
    paymentDate: "",

    amount: 0,
    lateFee: 0,
    discount: 0,

    paymentMode: "Cash",

    collectedBy: "",
    remarks: "",
};

/* =========================
   MONTHS
========================= */

export const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

/* =========================
   ACADEMIC MONTH ORDER
========================= */

export const ACADEMIC_MONTHS = [
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
];

/* =========================
   PROFESSIONAL ERP LABELS
========================= */

export const FEES_LABELS = {
    totalCollection: "Total Collection",
    totalDue: "Total Due",
    paidStudents: "Paid Students",
    overdueStudents: "Overdue Students",
    collectFees: "Collect Fees",
    printReceipt: "Print Receipt",
    paymentHistory: "Payment History",
};

/* =========================
   RECEIPT FOOTER
========================= */

export const RECEIPT_FOOTER = `
This is a computer-generated fee receipt.
No signature required.
`;

/* =========================
   VALIDATION LIMITS
========================= */

export const FEES_VALIDATION = {
    MAX_REMARKS: 250,
    MAX_AMOUNT: 9999999,
    MIN_AMOUNT: 0,
};
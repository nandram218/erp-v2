/* =========================================================
   ERP FEES SERVICE - CLEAN PRODUCTION VERSION
   Phase 3.1 D - Service Unification Layer (Tenant Context Integration)
   Phase 3.1 D Safe Mode - STRICT SaaS Enforcement
   ⚠️ PRODUCTION MODE: Direct access to this service is BLOCKED
   Use ServiceRegistry.getService("fees") instead
========================================================= */

import {
    getStorageCompat,
    setStorageCompat,
    removeStorageCompat,
    STORAGE_KEYS,
} from "../../services/storageService";
import { withTenantContext } from "../../services/tenantContextService";
import { blockDirectServiceAccess } from "../../core/serviceRegistry";
import { getService } from "../../core/serviceRegistry";

const getFeeSettings = () => {
    return getStorageCompat(STORAGE_KEYS.ERP_FEE_SETTINGS, null);
};
// Phase 3.1 D Safe Mode: Block direct access in production mode
blockDirectServiceAccess("feesService");

/* =========================
   STORAGE KEYS
   (operational: ERP_RECEIPT_COUNTER — not feesConstants ERP_FEES_RECEIPT_COUNTER)
========================= */

const FEES_DB_KEY = STORAGE_KEYS.ERP_FEES_DB;
const RECEIPT_KEY = STORAGE_KEYS.ERP_RECEIPT_COUNTER;
const LEDGER_KEY = STORAGE_KEYS.ERP_FEES_LEDGER;

/* =========================
   LOCAL DB HELPERS
========================= */

export const getFeesDB = () => {
    try {
        return getStorageCompat(FEES_DB_KEY, []);
    } catch {
        return [];
    }
};

export const saveFeesDB = (data) => {
    setStorageCompat(FEES_DB_KEY, data);
};

/* =========================
   LEDGER STORAGE
========================= */

const getLedger = () => {
    return getStorageCompat(LEDGER_KEY, []);
};

const saveLedger = (data) => {
    setStorageCompat(LEDGER_KEY, data);
};

/* =========================
   MIGRATION HELPERS
========================= */

const migratePaymentEntry = (payment) => {
    return {
        ...payment,
        section: payment.section || "",
        rollNumber: payment.rollNumber || "",
        academicSession: payment.academicSession || "",
        discountType: payment.discountType || "",
        discountReason: payment.discountReason || "",
        lateFeeReason: payment.lateFeeReason || "",
        referenceNumber: payment.referenceNumber || "",
    };
};

const migrateFeesDB = () => {
    const db = getFeesDB();
    let migrated = false;
    
    const migratedDB = db.map(student => {
        const migratedPayments = student.payments?.map(payment => {
            if (!payment.section || !payment.rollNumber || !payment.academicSession || 
                !payment.discountType || !payment.discountReason || !payment.lateFeeReason || !payment.referenceNumber) {
                migrated = true;
                return migratePaymentEntry(payment);
            }
            return payment;
        }) || [];
        
        if (migrated) {
            return {
                ...student,
                payments: migratedPayments,
            };
        }
        
        return student;
    });
    
    if (migrated) {
        saveFeesDB(migratedDB);
    }
    
    return migrated;
};

export const runMigrations = () => {
    migrateFeesDB();
};

/* =========================
   RECEIPT SYSTEM
========================= */

export const getReceiptCounter = () =>
    Number(getStorageCompat(RECEIPT_KEY, 1) ?? 1);

export const createReceiptNumber = () => {
    const next = getReceiptCounter();
    setStorageCompat(RECEIPT_KEY, next + 1);
    return `RCPT-${String(next).padStart(5, "0")}`;
};

/* =========================
   GET ALL RECORDS
========================= */

export const getAllFeesRecords = () => {
    const db = getFeesDB();
    return db.sort((a, b) =>
        (a.studentName || "").localeCompare(b.studentName || "")
    );
};

/* =========================
   GET SINGLE STUDENT
========================= */

export const getStudentFeesRecord = (studentId) => {
    return getFeesDB().find(
        (s) => String(s.studentId) === String(studentId)
    );
};

/* =========================
   CREATE RECORD
========================= */

export const createStudentFeesRecord = ({ student = {} }) => {
    const db = getFeesDB();
    const feeData = getFeeSettings();

    const exists = db.find(
        (s) => String(s.studentId) === String(student.studentId)
    );

    if (exists) return exists;

    const totalFee = calculateTotalFee(student, feeData);

    const newRecord = withTenantContext({
        studentId: student.studentId,

        studentName:
            student.name || "",

        className:
            student.className ||
            student.class ||
            "",

        fatherName:
            student.fatherName || "",

        mobile:
            student.mobile || "",

        totalFee,

        paidAmount: 0,

        dueAmount: totalFee,

        status:
            totalFee <= 0
                ? "paid"
                : "unpaid",

        payments: [],

        createdAt:
            new Date().toISOString(),
    });

    db.push(newRecord);
    saveFeesDB(db);

    return newRecord;
};
/* =========================
   CENTRAL FEE CALCULATION ENGINE
========================= */

export const calculateTransportFee = (student = {}) => {
    return student.transport?.enabled ? (student.transport.routeFee || 0) : 0;
};

export const calculateHostelFee = (student = {}) => {
    return student.hostel?.enabled ? (student.hostel.fee || 0) : 0;
};

export const calculateTotalFee = (student = {}, feeSettings = {}) => {
    let totalFee = 0;
    
    if (student.class && feeSettings?.classes?.[student.class]) {
        const classData = feeSettings.classes[student.class];
        
        const compulsoryTotal = classData.compulsoryFees?.reduce((sum, fee) => sum + fee.amount, 0) || 0;
        
        const optionalTotal = classData.optionalFees
            ?.filter(fee => student.selectedOptionalFees?.includes(fee.id))
            .reduce((sum, fee) => sum + fee.amount, 0) || 0;
        
        const transportFee = calculateTransportFee(student);
        const hostelFee = calculateHostelFee(student);
        
        totalFee = compulsoryTotal + optionalTotal + transportFee + hostelFee;
    }
    
    return totalFee;
};

/* =========================
   SYNC STUDENTS - Canonical Structure
========================= */

export const syncStudentsToFeesDB = ({
    students = [],
}) => {

    const db = getFeesDB();
    const feeData = getFeeSettings();

    const updated = [...db];

    students.forEach((student) => {

        const id = student.studentId;

        /* =========================
           FIND EXISTING
        ========================= */

        const existing = updated.find(
            (s) =>
                String(s.studentId) ===
                String(id)
        );

        /* =========================
           NORMALIZE STUDENT - Canonical Structure
        ========================= */

        const totalFee = calculateTotalFee(student, feeData);

        const normalized = {

            studentId: id,

            studentName:
                student.name || "",

            className:
                student.className ||
                student.class ||
                "",

            fatherName:
                student.fatherName || "",

            mobile:
                student.mobile || "",

            totalFee,

            paidAmount: existing ? existing.paidAmount : 0,

            dueAmount: totalFee - (existing ? existing.paidAmount : 0),

            status: totalFee - (existing ? existing.paidAmount : 0) <= 0 ? "paid" : "unpaid",

            payments: existing ? existing.payments : [],

            createdAt: existing ? existing.createdAt : new Date().toISOString(),

            updatedAt: new Date().toISOString(),
        };

        if (existing) {
            Object.assign(existing, normalized);
        } else {
            updated.push(withTenantContext(normalized));
        }
    });

    saveFeesDB(updated);
};

/* =========================
   GET STUDENT FEE BREAKDOWN - Canonical Structure
========================= */

export const getStudentFeeBreakdown = (student) => {
    const feeData = getFeeSettings();

    if (!feeData || !student.class) {
        return null;
    }

    const classData = feeData.classes?.[student.class];
    if (!classData) {
        return null;
    }

    // Get compulsory fees
    const compulsoryFees = classData.compulsoryFees || [];

    // Get selected optional fees
    const selectedOptionalFees = classData.optionalFees?.filter(fee =>
        student.selectedOptionalFees?.includes(fee.id)
    ) || [];

    // Get transport details
    const transportRoute = feeData.transportRoutes?.find(r => r.id === student.transport?.routeId);

    return {
        compulsoryFees,
        selectedOptionalFees,
        transport: student.transport?.enabled ? {
            routeId: student.transport.routeId,
            routeName: transportRoute?.routeName || transportRoute?.name,
            pickupPoint: student.transport.pickupPoint,
            routeFee: student.transport.routeFee || student.transport.fee || student.transport.monthlyFee || 0
        } : null,
        hostel: student.hostel?.enabled ? {
            enabled: true,
            fee: student.hostel.fee
        } : null,
        calculatedTotals: student.calculatedTotals
    };
};

/* =========================
   PAYMENT FUNCTIONS
========================= */

export const collectFeesPayment = ({ studentId, paymentData = {} }) => {
    const db = getFeesDB();

    const index = db.findIndex(
        (s) => String(s.studentId) === String(studentId)
    );

    if (index === -1) return null;

    const student = db[index];

    const amount = Number(paymentData.amount || 0);
    const discount = Number(paymentData.discount || 0);
    const lateFee = Number(paymentData.lateFee || 0);

    const finalAmount = amount + lateFee - discount;

    const newPaid = (student.paidAmount || 0) + amount;

    const updatedStudent = {
        ...student,
        paidAmount: newPaid,

        dueAmount: Math.max(
            (student.totalFee || 0) - newPaid,
            0
        )
    };
    updatedStudent.status =
        updatedStudent.dueAmount <= 0
            ? "paid"
            : updatedStudent.paidAmount > 0
                ? "partial"
                : "unpaid";
    const receiptNumber = createReceiptNumber();

    const paymentEntry = withTenantContext({
        id: Date.now(),
        receiptNumber,
        studentId,
        studentName: student.studentName,
        className: student.className,
        amount,
        discount,
        lateFee,
        finalAmount,
        paymentMode: paymentData.paymentMode || "Cash",
        remarks: paymentData.remarks || "",
        paymentDate: new Date().toISOString(),
        section: student.section || "",
        rollNumber: student.rollNumber || "",
        academicSession: paymentData.academicSession || "",
        discountType: paymentData.discountType || "",
        discountReason: paymentData.discountReason || "",
        lateFeeReason: paymentData.lateFeeReason || "",
        referenceNumber: paymentData.referenceNumber || "",
    });

    db[index] = updatedStudent;
    saveFeesDB(db);

    /* ledger - Payment History (includes transaction fields) */
    const ledger = getLedger();
    ledger.push({
        ...paymentEntry,
        studentName: student.studentName,
        className: student.className,
        fatherName: student.fatherName,
    });
    saveLedger(ledger);

    // Reverse sync: update student payment status
    const studentService = getService("student");
    studentService.updateStudent(studentId, {
        paymentStatus: updatedStudent.status,
        lastPaymentDate: paymentEntry.paymentDate
    });

    return {
        success: true,
        student: updatedStudent,
        payment: paymentEntry,
    };
};

/* =========================
   HISTORY
========================= */

export const getAllPaymentsHistory = () => {
    return getLedger().sort(
        (a, b) =>
            new Date(b.paymentDate) - new Date(a.paymentDate)
    );
};

export const getPaymentById = (id) => {
    return getAllPaymentsHistory().find((p) => p.id === id);
};

export const getPaymentByReceipt = (receipt) => {
    return getAllPaymentsHistory().find(
        (p) => p.receiptNumber === receipt
    );
};

export const getStudentPaymentHistory = (studentId) => {
    return getAllPaymentsHistory().filter(
        (p) => String(p.studentId) === String(studentId)
    );
};

export const getPaymentByStudentId = (studentId) => {
    return getStudentPaymentHistory(studentId);
};

/* =========================
   TOTALS
========================= */

export const getTotalCollection = () =>
    getFeesDB().reduce((a, s) => a + (s.paidAmount || 0), 0);

export const getTotalDue = () =>
    getFeesDB().reduce((a, s) => a + (s.dueAmount || 0), 0);

export const getPaidStudentsCount = () =>
    getFeesDB().filter((s) => (s.dueAmount || 0) <= 0).length;

export const getDueStudentsCount = () =>
    getFeesDB().filter((s) => (s.dueAmount || 0) > 0).length;

export const getTodayCollection = () => {
    const today = new Date().toDateString();

    return getAllPaymentsHistory()
        .filter((p) => new Date(p.paymentDate).toDateString() === today)
        .reduce((a, b) => a + (b.amount || 0), 0);
};

/* =========================
   EXPORT
========================= */

export const exportFeesData = () => {
    return {
        students: getFeesDB(),
        history: getAllPaymentsHistory(),
        totals: {
            collection: getTotalCollection(),
            due: getTotalDue(),
            paidStudents: getPaidStudentsCount(),
            dueStudents: getDueStudentsCount(),
        },
    };
};

/* =========================
   RESET
========================= */

export const resetFeesModule = () => {
    removeStorageCompat(FEES_DB_KEY);
    removeStorageCompat(RECEIPT_KEY);
    removeStorageCompat(LEDGER_KEY);
};
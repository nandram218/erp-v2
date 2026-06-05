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

    const exists = db.find(
        (s) => String(s.studentId) === String(student.studentId)
    );

    if (exists) return exists;

    const totalFee =
        Number(student.totalFee || 0);

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
   SYNC STUDENTS
========================= */

export const syncStudentsToFeesDB = ({
    students = [],
}) => {

    const db = getFeesDB();

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
           NORMALIZE STUDENT
        ========================= */

        const totalFee =
            Number(
                student.totalFee || 0
            );

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
        };

        /* =========================
           CREATE NEW RECORD
        ========================= */

        if (!existing) {

            updated.push({

                ...normalized,

                paidAmount: 0,

                dueAmount: totalFee,

                status:
                    totalFee <= 0
                        ? "paid"
                        : "unpaid",

                payments: [],

                createdAt:
                    new Date().toISOString(),

                updatedAt:
                    new Date().toISOString(),
            });

            return;
        }

        /* =========================
           UPDATE EXISTING
        ========================= */

        existing.studentName =
            normalized.studentName;

        existing.className =
            normalized.className;

        existing.fatherName =
            normalized.fatherName;

        existing.mobile =
            normalized.mobile;

        existing.totalFee =
            totalFee;

        /* =========================
           SAFE PAYMENT VALUES
        ========================= */

        existing.paidAmount =
            Number(
                existing.paidAmount || 0
            );

        existing.dueAmount =
            Math.max(
                totalFee -
                existing.paidAmount,
                0
            );

        /* =========================
           STATUS ENGINE
        ========================= */

        existing.status =
            existing.dueAmount <= 0
                ? "paid"
                : existing.paidAmount > 0
                    ? "partial"
                    : "unpaid";

        /* =========================
           SAFETY DEFAULTS
        ========================= */

        if (
            !Array.isArray(
                existing.payments
            )
        ) {
            existing.payments = [];
        }

        existing.updatedAt =
            new Date().toISOString();
    });

    /* =========================
       SAVE DATABASE
    ========================= */

    saveFeesDB(updated);

    return updated;
};

/* =========================
   PAYMENT ENGINE (MAIN)
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
        amount,
        discount,
        lateFee,
        finalAmount,
        paymentMode: paymentData.paymentMode || "Cash",
        remarks: paymentData.remarks || "",
        paymentDate: new Date().toISOString(),
    });

    updatedStudent.payments = [
        ...(student.payments || []),
        paymentEntry,
    ];

    db[index] = updatedStudent;
    saveFeesDB(db);

    /* ledger */
    const ledger = getLedger();
    ledger.push({
        ...paymentEntry,
        studentName: student.studentName,
        className: student.className,
        fatherName: student.fatherName,
    });
    saveLedger(ledger);

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
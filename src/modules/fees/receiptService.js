/**
 * Receipt Service - Phase-3D Receipt Authority Layer
 * 
 * PRIMARY FINANCIAL AUTHORITY
 * ERP_RECEIPT_REGISTER is the single source of truth for all financial transactions.
 * 
 * Phase 3.2C Safe Mode - STRICT SaaS Enforcement
 * ⚠️ PRODUCTION MODE: Direct access to this service is BLOCKED
 * Use ServiceRegistry.getService("receipt") instead
 */

import {
    getTenantStorage,
    setTenantStorage,
    STORAGE_KEYS,
} from "../../services/storageService";
import { withTenantContext, getTenantContextForStorage } from "../../services/tenantContextService";
import { blockDirectServiceAccess } from "../../core/serviceRegistry";
import { getService } from "../../core/serviceRegistry";
import {
    RECEIPT_STATUS,
    DISCOUNT_SOURCE,
    PAYMENT_MODE,
} from "./receiptConstants";

// Phase 3.2C Safe Mode: Block direct access in production mode
blockDirectServiceAccess("receiptService");

/* =========================
   STORAGE KEYS
========================= */

const RECEIPT_REGISTER_KEY = STORAGE_KEYS.ERP_RECEIPT_REGISTER;
const RECEIPT_COUNTER_KEY = STORAGE_KEYS.ERP_RECEIPT_COUNTER;

/* =========================
   LOCAL DB HELPERS
========================= */

const getReceiptRegister = () => {
    try {
        const tenantContext = getTenantContextForStorage();
        return getTenantStorage(RECEIPT_REGISTER_KEY, tenantContext, []) || [];
    } catch {
        return [];
    }
};

const saveReceiptRegister = (data) => {
    const tenantContext = getTenantContextForStorage();
    setTenantStorage(RECEIPT_REGISTER_KEY, data, tenantContext);
};

const getReceiptCounter = () => {
    const tenantContext = getTenantContextForStorage();
    return Number(getTenantStorage(RECEIPT_COUNTER_KEY, tenantContext, 1) ?? 1);
};

const incrementReceiptCounter = () => {
    const current = getReceiptCounter();
    const tenantContext = getTenantContextForStorage();
    setTenantStorage(RECEIPT_COUNTER_KEY, current + 1, tenantContext);
    return current;
};

/* =========================
   RECEIPT NUMBER GENERATION
========================= */

export const createReceiptNumber = () => {
    const next = incrementReceiptCounter();
    return `RCPT-${String(next).padStart(5, "0")}`;
};

/* =========================
   CREATE RECEIPT
   Primary financial authority write operation
========================= */

export const createReceipt = ({ receiptData = {} }) => {
    const register = getReceiptRegister();

    const receiptId = crypto.randomUUID();
    const paymentId = crypto.randomUUID();
    const ledgerEntryId = crypto.randomUUID();
    const receiptNumber = createReceiptNumber();

    const receipt = withTenantContext({
        // =========================
        // IDENTITY
        // =========================
        receiptId,
        receiptNumber,
        paymentId,
        ledgerEntryId,

        // =========================
        // STUDENT
        // =========================
        studentId: receiptData.studentId,
        admissionNo: receiptData.admissionNo,
        studentName: receiptData.studentName,
        className: receiptData.className,
        section: receiptData.section || "",
        rollNumber: receiptData.rollNumber || "",
        fatherName: receiptData.fatherName || "",

        // =========================
        // FINANCIAL
        // =========================
        amount: Number(receiptData.amount || 0),
        discount: Number(receiptData.discount || 0),
        lateFee: Number(receiptData.lateFee || 0),
        finalAmount: Number(receiptData.finalAmount || 0),

        // =========================
        // LINE ITEMS
        // =========================
        lineItems: receiptData.lineItems || [],

        // =========================
        // INSTALLMENT COMPATIBILITY
        // =========================
        installmentId: receiptData.installmentId || null,
        installmentName: receiptData.installmentName || null,
        installmentSequence: receiptData.installmentSequence || null,
        totalInstallments: receiptData.totalInstallments || null,
        dueDate: receiptData.dueDate || null,

        // =========================
        // DISCOUNT COMPATIBILITY
        // =========================
        discountType: receiptData.discountType || null,
        discountSource: receiptData.discountSource || DISCOUNT_SOURCE.NORMAL,
        discountReason: receiptData.discountReason || null,
        discountReferenceId: receiptData.discountReferenceId || null,

        // =========================
        // PAYMENT DETAILS
        // =========================
        paymentMode: receiptData.paymentMode || PAYMENT_MODE.CASH,
        referenceNumber: receiptData.referenceNumber || null,
        bankName: receiptData.bankName || null,
        chequeNumber: receiptData.chequeNumber || null,
        transactionId: receiptData.transactionId || null,

        // =========================
        // FEE SNAPSHOT
        // =========================
        feeSnapshot: receiptData.feeSnapshot || {
            totalFee: 0,
            compulsoryFees: 0,
            optionalFees: 0,
            transportFee: 0,
            hostelFee: 0,
            academicYear: "",
            feeStructureVersion: "1.0",
        },

        // =========================
        // FUTURE TENANT COMPATIBILITY
        // =========================
        academicYearId: receiptData.academicYearId || "",

        // =========================
        // AUDIT COMPATIBILITY
        // =========================
        printCount: 0,
        lastPrintDate: null,
        reprintHistory: [],
        actionLog: [],

        // =========================
        // STATUS COMPATIBILITY
        // =========================
        status: RECEIPT_STATUS.ACTIVE,

        // =========================
        // CANCELLATION TRACKING
        // =========================
        cancelledAt: null,
        cancelledBy: null,
        cancelReason: null,
        cancelApprovedBy: null,
        cancelApprovedAt: null,

        // =========================
        // VOID TRACKING
        // =========================
        voidedAt: null,
        voidedBy: null,
        voidReason: null,
        voidApprovedBy: null,
        voidApprovedAt: null,

        // =========================
        // TIMESTAMPS
        // =========================
        paymentDate: receiptData.paymentDate || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    register.push(receipt);
    saveReceiptRegister(register);

    return receipt;
};

/* =========================
   GET RECEIPT BY ID
========================= */

export const getReceiptById = (receiptId) => {
    const register = getReceiptRegister();
    return register.find((r) => r.receiptId === receiptId) || null;
};

/* =========================
   GET RECEIPT BY NUMBER
========================= */

export const getReceiptByNumber = (receiptNumber) => {
    const register = getReceiptRegister();
    return register.find((r) => r.receiptNumber === receiptNumber) || null;
};

/* =========================
   GET RECEIPTS BY STUDENT
========================= */

export const getReceiptsByStudent = (studentId) => {
    const register = getReceiptRegister();
    return register.filter((r) => String(r.studentId) === String(studentId));
};

/* =========================
   GET ALL RECEIPTS
========================= */

export const getAllReceipts = () => {
    const register = getReceiptRegister();
    return register.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
};

/* =========================
   GET ACTIVE RECEIPTS
   Excludes cancelled and voided receipts
========================= */

export const getActiveReceipts = () => {
    const register = getReceiptRegister();
    return register.filter((r) => r.status === RECEIPT_STATUS.ACTIVE);
};

/* =========================
   UPDATE RECEIPT
   For status changes (cancel/void)
========================= */

export const updateReceipt = ({ receiptId, updates = {} }) => {
    const register = getReceiptRegister();
    const index = register.findIndex((r) => r.receiptId === receiptId);

    if (index === -1) return null;

    const updated = {
        ...register[index],
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    register[index] = updated;
    saveReceiptRegister(register);

    return updated;
};

/* =========================
   EXPORT
========================= */

export default {
    createReceipt,
    getReceiptById,
    getReceiptByNumber,
    getReceiptsByStudent,
    getAllReceipts,
    getActiveReceipts,
    updateReceipt,
};

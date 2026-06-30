/**
 * Receipt Search Service - Phase-3D Receipt Authority Layer
 * 
 * Receipt search and filtering operations.
 * All search operations read from ERP_RECEIPT_REGISTER.
 * 
 * Phase 3.2C Safe Mode - STRICT SaaS Enforcement
 * ⚠️ PRODUCTION MODE: Direct access to this service is BLOCKED
 * Use ServiceRegistry.getService("receiptSearch") instead
 */

import { getService } from "../../core/serviceRegistry";

/* =========================
   GET RECEIPT SERVICE
========================= */

const getReceiptService = () => {
    return getService("receipt");
};

/* =========================
   SEARCH BY RECEIPT NUMBER
   Exact match
========================= */

export const searchByReceiptNumber = (receiptNumber) => {
    const receiptService = getReceiptService();
    return receiptService.getReceiptByNumber(receiptNumber);
};

/* =========================
   SEARCH BY STUDENT
   Partial match on student name
========================= */

export const searchByStudent = (studentName) => {
    const receiptService = getReceiptService();
    const allReceipts = receiptService.getAllReceipts();

    if (!studentName) return allReceipts;

    const searchTerm = studentName.toLowerCase();
    return allReceipts.filter((r) =>
        r.studentName.toLowerCase().includes(searchTerm)
    );
};

/* =========================
   SEARCH BY ADMISSION NO
   Exact match
========================= */

export const searchByAdmissionNo = (admissionNo) => {
    const receiptService = getReceiptService();
    const allReceipts = receiptService.getAllReceipts();

    if (!admissionNo) return allReceipts;

    return allReceipts.filter((r) => r.admissionNo === admissionNo);
};

/* =========================
   SEARCH BY CLASS
   Exact match
========================= */

export const searchByClass = (className) => {
    const receiptService = getReceiptService();
    const allReceipts = receiptService.getAllReceipts();

    if (!className) return allReceipts;

    return allReceipts.filter((r) => r.className === className);
};

/* =========================
   SEARCH BY DATE RANGE
   Range query on paymentDate
========================= */

export const searchByDateRange = ({ startDate, endDate }) => {
    const receiptService = getReceiptService();
    const allReceipts = receiptService.getAllReceipts();

    if (!startDate && !endDate) return allReceipts;

    const start = startDate ? new Date(startDate).getTime() : 0;
    const end = endDate ? new Date(endDate).getTime() : Infinity;

    return allReceipts.filter((r) => {
        const paymentDate = new Date(r.paymentDate).getTime();
        return paymentDate >= start && paymentDate <= end;
    });
};

/* =========================
   SEARCH BY PAYMENT MODE
   Exact match
========================= */

export const searchByPaymentMode = (paymentMode) => {
    const receiptService = getReceiptService();
    const allReceipts = receiptService.getAllReceipts();

    if (!paymentMode) return allReceipts;

    return allReceipts.filter((r) => r.paymentMode === paymentMode);
};

/* =========================
   SEARCH BY STATUS
   Exact match
========================= */

export const searchByStatus = (status) => {
    const receiptService = getReceiptService();
    const allReceipts = receiptService.getAllReceipts();

    if (!status) return allReceipts;

    return allReceipts.filter((r) => r.status === status);
};

/* =========================
   ADVANCED SEARCH
   Multiple criteria
========================= */

export const advancedSearch = ({
    receiptNumber,
    studentName,
    admissionNo,
    className,
    startDate,
    endDate,
    paymentMode,
    status,
}) => {
    const receiptService = getReceiptService();
    let results = receiptService.getAllReceipts();

    if (receiptNumber) {
        results = results.filter((r) => r.receiptNumber === receiptNumber);
    }

    if (studentName) {
        const searchTerm = studentName.toLowerCase();
        results = results.filter((r) =>
            r.studentName.toLowerCase().includes(searchTerm)
        );
    }

    if (admissionNo) {
        results = results.filter((r) => r.admissionNo === admissionNo);
    }

    if (className) {
        results = results.filter((r) => r.className === className);
    }

    if (startDate || endDate) {
        const start = startDate ? new Date(startDate).getTime() : 0;
        const end = endDate ? new Date(endDate).getTime() : Infinity;
        results = results.filter((r) => {
            const paymentDate = new Date(r.paymentDate).getTime();
            return paymentDate >= start && paymentDate <= end;
        });
    }

    if (paymentMode) {
        results = results.filter((r) => r.paymentMode === paymentMode);
    }

    if (status) {
        results = results.filter((r) => r.status === status);
    }

    return results;
};

/* =========================
   EXPORT
========================= */

export default {
    searchByReceiptNumber,
    searchByStudent,
    searchByAdmissionNo,
    searchByClass,
    searchByDateRange,
    searchByPaymentMode,
    searchByStatus,
    advancedSearch,
};

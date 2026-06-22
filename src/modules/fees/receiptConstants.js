/**
 * Receipt Constants - Phase-3D Receipt Authority Layer
 * 
 * Central registry of receipt-related constants.
 * All receipt services must use these constants.
 * Do not hardcode string values in receipt services.
 */

/* =========================
   RECEIPT STATUS
========================= */

export const RECEIPT_STATUS = Object.freeze({
    ACTIVE: "active",
    CANCELLED: "cancelled",
    VOIDED: "voided",
});

/* =========================
   DISCOUNT SOURCE
========================= */

export const DISCOUNT_SOURCE = Object.freeze({
    NORMAL: "NORMAL",
    SIBLING: "SIBLING",
    SCHOLARSHIP: "SCHOLARSHIP",
    CUSTOM: "CUSTOM",
});

/* =========================
   PAYMENT MODE
========================= */

export const PAYMENT_MODE = Object.freeze({
    CASH: "Cash",
    CHEQUE: "Cheque",
    BANK_TRANSFER: "Bank Transfer",
    UPI: "UPI",
    CARD: "Card",
});

/* =========================
   RECEIPT ACTION
   For audit trail actionLog
========================= */

export const RECEIPT_ACTION = Object.freeze({
    CREATED: "created",
    PRINTED: "printed",
    REPRINTED: "reprinted",
    CANCELLED: "cancelled",
    VOIDED: "voided",
    MODIFIED: "modified",
});

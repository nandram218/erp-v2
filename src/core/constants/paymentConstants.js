/**
 * @CONTRACT Financial
 * @LOCK STABLE
 *
 * Centralized Payment Constants
 * Single source of truth for payment-related enumerations
 */

export const PAYMENT_MODES = Object.freeze([
    "Cash",
    "Bank Transfer",
    "Cheque",
    "UPI",
    "Card",
]);

export const PAYMENT_STATUS = Object.freeze({
    PAID: "paid",
    PARTIAL: "partial",
    UNPAID: "unpaid",
    OVERDUE: "overdue",
});

export const VALID_PAYMENT_MODES = new Set(PAYMENT_MODES);
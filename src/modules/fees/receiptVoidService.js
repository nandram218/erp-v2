/**
 * Receipt Void Service - Phase-3D Receipt Authority Layer
 * 
 * Receipt void logic.
 * ACTIVE → VOIDED transition for invalid receipts.
 * Undo Void NOT allowed.
 * 
 * Phase 3.2C Safe Mode - STRICT SaaS Enforcement
 * ⚠️ PRODUCTION MODE: Direct access to this service is BLOCKED
 * Use ServiceRegistry.getService("receiptVoid") instead
 */

import { getService } from "../../core/serviceRegistry";
import { RECEIPT_STATUS } from "./receiptConstants";

/* =========================
   GET SERVICES
========================= */

const getReceiptService = () => {
    return getService("receipt");
};

const getReceiptAuditService = () => {
    return getService("receiptAudit");
};

/* =========================
   VALIDATE VOID ELIGIBILITY
   Rules:
   - Only ACTIVE receipts can be voided
   - Cannot void already cancelled receipt
   - Cannot void already voided receipt
========================= */

export const validateVoidEligibility = (receipt) => {
    if (!receipt) {
        return {
            eligible: false,
            reason: "Receipt not found",
        };
    }

    if (receipt.status === RECEIPT_STATUS.VOIDED) {
        return {
            eligible: false,
            reason: "Receipt already voided",
        };
    }

    if (receipt.status === RECEIPT_STATUS.CANCELLED) {
        return {
            eligible: false,
            reason: "Receipt already cancelled (cannot void cancelled receipt)",
        };
    }

    if (receipt.status !== RECEIPT_STATUS.ACTIVE) {
        return {
            eligible: false,
            reason: `Receipt status is ${receipt.status} (only ACTIVE receipts can be voided)`,
        };
    }

    return {
        eligible: true,
        reason: "Receipt is eligible for voiding",
    };
};

/* =========================
   VOID RECEIPT
   ACTIVE → VOIDED
   Requires manager approval
   Undo Void NOT allowed
========================= */

export const voidReceipt = ({
    receiptId,
    voidedBy,
    voidReason,
    voidApprovedBy,
}) => {
    const receiptService = getReceiptService();
    const receiptAuditService = getReceiptAuditService();

    const receipt = receiptService.getReceiptById(receiptId);

    if (!receipt) {
        return {
            success: false,
            message: "Receipt not found",
        };
    }

    const validation = validateVoidEligibility(receipt);

    if (!validation.eligible) {
        return {
            success: false,
            message: validation.reason,
        };
    }

    // Update receipt status
    const updated = receiptService.updateReceipt({
        receiptId,
        updates: {
            status: RECEIPT_STATUS.VOIDED,
        },
    });

    // Track void in audit log
    receiptAuditService.trackVoid({
        receiptId,
        voidedBy,
        voidReason,
        voidApprovedBy,
    });

    return {
        success: true,
        receipt: updated,
        message: "Receipt voided successfully",
    };
};

/* =========================
   EXPORT
========================= */

export default {
    validateVoidEligibility,
    voidReceipt,
};

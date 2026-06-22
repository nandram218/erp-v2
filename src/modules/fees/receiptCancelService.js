/**
 * Receipt Cancel Service - Phase-3D Receipt Authority Layer
 * 
 * Receipt cancellation logic.
 * ACTIVE → CANCELLED transition with approval workflow.
 * 
 * Phase 3.2C Safe Mode - STRICT SaaS Enforcement
 * ⚠️ PRODUCTION MODE: Direct access to this service is BLOCKED
 * Use ServiceRegistry.getService("receiptCancel") instead
 */

import { getService } from "../../core/serviceRegistry";
import { blockDirectServiceAccess } from "../../core/serviceRegistry";
import { RECEIPT_STATUS } from "./receiptConstants";

// Phase 3.2C Safe Mode: Block direct access in production mode
blockDirectServiceAccess("receiptCancelService");

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
   VALIDATE CANCEL ELIGIBILITY
   Rules:
   - Only ACTIVE receipts can be cancelled
   - Cannot cancel already cancelled receipt
   - Cannot cancel already voided receipt
========================= */

export const validateCancelEligibility = (receipt) => {
    if (!receipt) {
        return {
            eligible: false,
            reason: "Receipt not found",
        };
    }

    if (receipt.status === RECEIPT_STATUS.CANCELLED) {
        return {
            eligible: false,
            reason: "Receipt already cancelled",
        };
    }

    if (receipt.status === RECEIPT_STATUS.VOIDED) {
        return {
            eligible: false,
            reason: "Receipt already voided (cannot cancel voided receipt)",
        };
    }

    if (receipt.status !== RECEIPT_STATUS.ACTIVE) {
        return {
            eligible: false,
            reason: `Receipt status is ${receipt.status} (only ACTIVE receipts can be cancelled)`,
        };
    }

    return {
        eligible: true,
        reason: "Receipt is eligible for cancellation",
    };
};

/* =========================
   CANCEL RECEIPT
   ACTIVE → CANCELLED
   Requires supervisor approval
========================= */

export const cancelReceipt = ({
    receiptId,
    cancelledBy,
    cancelReason,
    cancelApprovedBy,
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

    const validation = validateCancelEligibility(receipt);

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
            status: RECEIPT_STATUS.CANCELLED,
        },
    });

    // Track cancellation in audit log
    receiptAuditService.trackCancel({
        receiptId,
        cancelledBy,
        cancelReason,
        cancelApprovedBy,
    });

    return {
        success: true,
        receipt: updated,
        message: "Receipt cancelled successfully",
    };
};

/* =========================
   UNDO CANCEL
   CANCELLED → ACTIVE
   Only allowed when no replacement receipt exists
========================= */

export const undoCancel = ({ receiptId, undoneBy }) => {
    const receiptService = getReceiptService();
    const receiptAuditService = getReceiptAuditService();

    const receipt = receiptService.getReceiptById(receiptId);

    if (!receipt) {
        return {
            success: false,
            message: "Receipt not found",
        };
    }

    if (receipt.status !== RECEIPT_STATUS.CANCELLED) {
        return {
            success: false,
            message: "Only cancelled receipts can be undone",
        };
    }

    // TODO: Check if replacement receipt exists
    // This requires additional logic to track replacement receipts

    // Update receipt status
    const updated = receiptService.updateReceipt({
        receiptId,
        updates: {
            status: RECEIPT_STATUS.ACTIVE,
            cancelledAt: null,
            cancelledBy: null,
            cancelReason: null,
            cancelApprovedBy: null,
            cancelApprovedAt: null,
        },
    });

    // Log undo action
    receiptAuditService.logAction({
        receiptId,
        action: "cancel_undone",
        actionBy: undoneBy,
        reason: "Cancel operation undone",
    });

    return {
        success: true,
        receipt: updated,
        message: "Cancel undone successfully",
    };
};

/* =========================
   EXPORT
========================= */

export default {
    validateCancelEligibility,
    cancelReceipt,
    undoCancel,
};

/**
 * Receipt Audit Service - Phase-3D Receipt Authority Layer
 * 
 * Audit trail tracking for receipt operations.
 * All receipt modifications must be logged.
 * 
 * Phase 3.2C Safe Mode - STRICT SaaS Enforcement
 * ⚠️ PRODUCTION MODE: Direct access to this service is BLOCKED
 * Use ServiceRegistry.getService("receiptAudit") instead
 */

import {
    getStorageCompat,
    setStorageCompat,
    STORAGE_KEYS,
} from "../../services/storageService";
import { withTenantContext } from "../../services/tenantContextService";
import { blockDirectServiceAccess } from "../../core/serviceRegistry";
import { getService } from "../../core/serviceRegistry";
import { RECEIPT_ACTION } from "./receiptConstants";

// Phase 3.2C Safe Mode: Block direct access in production mode
blockDirectServiceAccess("receiptAuditService");

/* =========================
   STORAGE KEYS
========================= */

const RECEIPT_REGISTER_KEY = STORAGE_KEYS.ERP_RECEIPT_REGISTER;

/* =========================
   LOCAL DB HELPERS
========================= */

const getReceiptRegister = () => {
    try {
        return getStorageCompat(RECEIPT_REGISTER_KEY, []);
    } catch {
        return [];
    }
};

const saveReceiptRegister = (data) => {
    setStorageCompat(RECEIPT_REGISTER_KEY, data);
};

/* =========================
   LOG ACTION
   Generic action logging for audit trail
========================= */

export const logAction = ({ receiptId, action, actionBy, reason = null, previousState = null, newState = null }) => {
    const register = getReceiptRegister();
    const index = register.findIndex((r) => r.receiptId === receiptId);

    if (index === -1) return null;

    const actionEntry = withTenantContext({
        actionId: crypto.randomUUID(),
        action,
        actionAt: new Date().toISOString(),
        actionBy,
        previousState,
        newState,
        reason,
        ipAddress: null, // Will be populated by UI layer if needed
    });

    register[index].actionLog.push(actionEntry);
    register[index].updatedAt = new Date().toISOString();

    saveReceiptRegister(register);

    return actionEntry;
};

/* =========================
   TRACK PRINT
========================= */

export const trackPrint = ({ receiptId, printedBy }) => {
    const register = getReceiptRegister();
    const index = register.findIndex((r) => r.receiptId === receiptId);

    if (index === -1) return null;

    // Increment print count
    register[index].printCount = (register[index].printCount || 0) + 1;
    register[index].lastPrintDate = new Date().toISOString();
    register[index].updatedAt = new Date().toISOString();

    // Log action
    logAction({
        receiptId,
        action: RECEIPT_ACTION.PRINTED,
        actionBy: printedBy,
    });

    saveReceiptRegister(register);

    return register[index];
};

/* =========================
   TRACK REPRINT
========================= */

export const trackReprint = ({ receiptId, printedBy, ipAddress = null, userAgent = null }) => {
    const register = getReceiptRegister();
    const index = register.findIndex((r) => r.receiptId === receiptId);

    if (index === -1) return null;

    const reprintEntry = withTenantContext({
        reprintId: crypto.randomUUID(),
        printedAt: new Date().toISOString(),
        printedBy,
        ipAddress,
        userAgent,
        location: null,
    });

    // Add to reprint history
    register[index].reprintHistory.push(reprintEntry);
    register[index].printCount = (register[index].printCount || 0) + 1;
    register[index].lastPrintDate = new Date().toISOString();
    register[index].updatedAt = new Date().toISOString();

    // Log action
    logAction({
        receiptId,
        action: RECEIPT_ACTION.REPRINTED,
        actionBy: printedBy,
    });

    saveReceiptRegister(register);

    return reprintEntry;
};

/* =========================
   TRACK CANCEL
========================= */

export const trackCancel = ({ receiptId, cancelledBy, cancelReason, cancelApprovedBy }) => {
    const register = getReceiptRegister();
    const index = register.findIndex((r) => r.receiptId === receiptId);

    if (index === -1) return null;

    // Update cancellation fields
    register[index].cancelledAt = new Date().toISOString();
    register[index].cancelledBy = cancelledBy;
    register[index].cancelReason = cancelReason;
    register[index].cancelApprovedBy = cancelApprovedBy;
    register[index].cancelApprovedAt = new Date().toISOString();
    register[index].updatedAt = new Date().toISOString();

    // Log action
    logAction({
        receiptId,
        action: RECEIPT_ACTION.CANCELLED,
        actionBy: cancelledBy,
        reason: cancelReason,
    });

    saveReceiptRegister(register);

    return register[index];
};

/* =========================
   TRACK VOID
========================= */

export const trackVoid = ({ receiptId, voidedBy, voidReason, voidApprovedBy }) => {
    const register = getReceiptRegister();
    const index = register.findIndex((r) => r.receiptId === receiptId);

    if (index === -1) return null;

    // Update void fields
    register[index].voidedAt = new Date().toISOString();
    register[index].voidedBy = voidedBy;
    register[index].voidReason = voidReason;
    register[index].voidApprovedBy = voidApprovedBy;
    register[index].voidApprovedAt = new Date().toISOString();
    register[index].updatedAt = new Date().toISOString();

    // Log action
    logAction({
        receiptId,
        action: RECEIPT_ACTION.VOIDED,
        actionBy: voidedBy,
        reason: voidReason,
    });

    saveReceiptRegister(register);

    return register[index];
};

/* =========================
   GET ACTION LOG
========================= */

export const getActionLog = (receiptId) => {
    const register = getReceiptRegister();
    const receipt = register.find((r) => r.receiptId === receiptId);

    if (!receipt) return [];

    return receipt.actionLog || [];
};

/* =========================
   GET REPRINT HISTORY
========================= */

export const getReprintHistory = (receiptId) => {
    const register = getReceiptRegister();
    const receipt = register.find((r) => r.receiptId === receiptId);

    if (!receipt) return [];

    return receipt.reprintHistory || [];
};

/* =========================
   EXPORT
========================= */

export default {
    logAction,
    trackPrint,
    trackReprint,
    trackCancel,
    trackVoid,
    getActionLog,
    getReprintHistory,
};

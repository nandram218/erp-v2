/**
 * Receipt Print Service - Phase-3D Receipt Authority Layer
 * 
 * Receipt print tracking.
 * Tracks print count and reprint history.
 * 
 * Phase 3.2C Safe Mode - STRICT SaaS Enforcement
 * ⚠️ PRODUCTION MODE: Direct access to this service is BLOCKED
 * Use ServiceRegistry.getService("receiptPrint") instead
 */

import { getService } from "../../core/serviceRegistry";
import { blockDirectServiceAccess } from "../../core/serviceRegistry";

// Phase 3.2C Safe Mode: Block direct access in production mode
blockDirectServiceAccess("receiptPrintService");

/* =========================
   GET SERVICES
========================= */

const getReceiptAuditService = () => {
    return getService("receiptAudit");
};

/* =========================
   INCREMENT PRINT COUNT
   Track first print
========================= */

export const incrementPrintCount = ({ receiptId, printedBy }) => {
    const receiptAuditService = getReceiptAuditService();

    return receiptAuditService.trackPrint({
        receiptId,
        printedBy,
    });
};

/* =========================
   LOG REPRINT
   Track reprint with metadata
========================= */

export const logReprint = ({ receiptId, printedBy, ipAddress = null, userAgent = null }) => {
    const receiptAuditService = getReceiptAuditService();

    return receiptAuditService.trackReprint({
        receiptId,
        printedBy,
        ipAddress,
        userAgent,
    });
};

/* =========================
   GET PRINT COUNT
========================= */

export const getPrintCount = (receiptId) => {
    const receiptAuditService = getReceiptAuditService();
    const actionLog = receiptAuditService.getActionLog(receiptId);

    if (!actionLog) return 0;

    const printActions = actionLog.filter((action) =>
        action.action === "printed" || action.action === "reprinted"
    );

    return printActions.length;
};

/* =========================
   GET REPRINT HISTORY
========================= */

export const getReprintHistory = (receiptId) => {
    const receiptAuditService = getReceiptAuditService();

    return receiptAuditService.getReprintHistory(receiptId);
};

/* =========================
   EXPORT
========================= */

export default {
    incrementPrintCount,
    logReprint,
    getPrintCount,
    getReprintHistory,
};

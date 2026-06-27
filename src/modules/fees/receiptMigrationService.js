/**
 * Receipt Migration Service - Phase-3D Receipt Authority Layer
 * 
 * Migration utility for ERP_FEES_LEDGER → ERP_RECEIPT_REGISTER
 * 
 * Migration Contract:
 * 1. Create backups before migration
 * 2. Verify data integrity after migration
 * 3. Rollback if verification fails
 * 
 * Phase 3.2C Safe Mode - STRICT SaaS Enforcement
 */

import {
    getTenantStorage,
    setTenantStorage,
    removeTenantStorage,
    STORAGE_KEYS,
} from "../../services/storageService";
import { withTenantContext, getTenantContextForStorage } from "../../services/tenantContextService";
import { RECEIPT_STATUS, DISCOUNT_SOURCE, PAYMENT_MODE } from "./receiptConstants";

/* =========================
   STORAGE KEYS
========================= */

const LEDGER_KEY = STORAGE_KEYS.ERP_FEES_LEDGER;
const RECEIPT_REGISTER_KEY = STORAGE_KEYS.ERP_RECEIPT_REGISTER;
const FEES_DB_KEY = STORAGE_KEYS.ERP_FEES_DB;

/* =========================
   BACKUP CREATION
   Dynamic backup keys with timestamp
========================= */

export const createBackups = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "").slice(0, -5);
    const ledgerBackupKey = `ERP_FEES_LEDGER_BACKUP_${timestamp}`;
    const feesBackupKey = `ERP_FEES_DB_BACKUP_${timestamp}`;

    const tenantContext = getTenantContextForStorage();
    const ledgerData = getTenantStorage(LEDGER_KEY, tenantContext, []);
    const feesData = getTenantStorage(FEES_DB_KEY, tenantContext, []);

    setTenantStorage(ledgerBackupKey, ledgerData, tenantContext);
    setTenantStorage(feesBackupKey, feesData, tenantContext);

    return {
        success: true,
        ledgerBackupKey,
        feesBackupKey,
        timestamp,
    };
};

/* =========================
   RESTORE BACKUPS
   Rollback to previous state
========================= */

export const restoreBackups = ({ ledgerBackupKey, feesBackupKey }) => {
    const tenantContext = getTenantContextForStorage();
    const ledgerData = getTenantStorage(ledgerBackupKey, tenantContext, []);
    const feesData = getTenantStorage(feesBackupKey, tenantContext, []);

    setTenantStorage(LEDGER_KEY, ledgerData, tenantContext);
    setTenantStorage(FEES_DB_KEY, feesData, tenantContext);

    // Clean up backup keys
    removeTenantStorage(ledgerBackupKey, tenantContext);
    removeTenantStorage(feesBackupKey, tenantContext);

    return {
        success: true,
        message: "Backups restored successfully",
    };
};

/* =========================
   GET MIGRATION STATISTICS
   Before migration verification
========================= */

export const getMigrationStatistics = () => {
    const tenantContext = getTenantContextForStorage();
    const ledger = getTenantStorage(LEDGER_KEY, tenantContext, []);
    const feesDB = getTenantStorage(FEES_DB_KEY, tenantContext, []);

    const ledgerPaymentCount = ledger.length;
    const ledgerTotalAmount = ledger.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const studentCount = feesDB.length;
    const feesTotalAmount = feesDB.reduce((sum, s) => sum + (s.paidAmount || 0), 0);

    return {
        ledgerPaymentCount,
        ledgerTotalAmount,
        studentCount,
        feesTotalAmount,
    };
};

/* =========================
   TRANSFORM LEDGER ENTRY TO RECEIPT
   Convert flat ledger entry to receipt schema
========================= */

const transformLedgerToReceipt = (ledgerEntry) => {
    const receiptId = crypto.randomUUID();
    const paymentId = crypto.randomUUID();
    const ledgerEntryId = ledgerEntry.id || crypto.randomUUID();

    return withTenantContext({
        // =========================
        // IDENTITY
        // =========================
        receiptId,
        receiptNumber: ledgerEntry.receiptNumber || `RCPT-${String(ledgerEntry.id || 0).padStart(5, "0")}`,
        paymentId,
        ledgerEntryId,

        // =========================
        // STUDENT
        // =========================
        studentId: ledgerEntry.studentId,
        admissionNo: ledgerEntry.admissionNo || "",
        studentName: ledgerEntry.studentName || "",
        className: ledgerEntry.className || "",
        section: ledgerEntry.section || "",
        rollNumber: ledgerEntry.rollNumber || "",
        fatherName: ledgerEntry.fatherName || "",

        // =========================
        // FINANCIAL
        // =========================
        amount: Number(ledgerEntry.amount || 0),
        discount: Number(ledgerEntry.discount || 0),
        lateFee: Number(ledgerEntry.lateFee || 0),
        finalAmount: Number(ledgerEntry.finalAmount || 0),

        // =========================
        // LINE ITEMS
        // =========================
        lineItems: [], // Ledger entries don't have line items, will be empty for migrated data

        // =========================
        // INSTALLMENT COMPATIBILITY
        // =========================
        installmentId: null,
        installmentName: null,
        installmentSequence: null,
        totalInstallments: null,
        dueDate: null,

        // =========================
        // DISCOUNT COMPATIBILITY
        // =========================
        discountType: ledgerEntry.discountType || null,
        discountSource: DISCOUNT_SOURCE.NORMAL, // Default to NORMAL for migrated data
        discountReason: ledgerEntry.discountReason || null,
        discountReferenceId: null,

        // =========================
        // PAYMENT DETAILS
        // =========================
        paymentMode: ledgerEntry.paymentMode || PAYMENT_MODE.CASH,
        referenceNumber: ledgerEntry.referenceNumber || null,
        bankName: null,
        chequeNumber: null,
        transactionId: null,

        // =========================
        // FEE SNAPSHOT
        // =========================
        feeSnapshot: {
            totalFee: ledgerEntry.totalFee || 0,
            compulsoryFees: 0,
            optionalFees: 0,
            transportFee: 0,
            hostelFee: 0,
            academicYear: ledgerEntry.academicSession || "",
            feeStructureVersion: "1.0",
        },

        // =========================
        // FUTURE TENANT COMPATIBILITY
        // =========================
        academicYearId: ledgerEntry.academicSession || "",

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
        paymentDate: ledgerEntry.paymentDate || new Date().toISOString(),
        createdAt: ledgerEntry.paymentDate || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });
};

/* =========================
   EXECUTE MIGRATION
   ERP_FEES_LEDGER → ERP_RECEIPT_REGISTER
========================= */

export const executeMigration = () => {
    // Create backups first
    const backupResult = createBackups();
    if (!backupResult.success) {
        return {
            success: false,
            message: "Backup creation failed",
        };
    }

    // Get source data
    const tenantContext = getTenantContextForStorage();
    const ledger = getTenantStorage(LEDGER_KEY, tenantContext, []);

    // Transform ledger entries to receipts
    const receipts = ledger.map(transformLedgerToReceipt);

    // Save to receipt register
    setTenantStorage(RECEIPT_REGISTER_KEY, receipts, tenantContext);

    return {
        success: true,
        message: "Migration completed successfully",
        backupResult,
        migratedCount: receipts.length,
    };
};

/* =========================
   VERIFY MIGRATION
   Verify data integrity after migration
========================= */

export const verifyMigration = () => {
    const tenantContext = getTenantContextForStorage();
    const ledger = getTenantStorage(LEDGER_KEY, tenantContext, []);
    const receiptRegister = getTenantStorage(RECEIPT_REGISTER_KEY, tenantContext, []);

    const ledgerPaymentCount = ledger.length;
    const receiptCount = receiptRegister.length;

    const ledgerTotalAmount = ledger.reduce((sum, p) => sum + (p.amount || 0), 0);
    const receiptTotalAmount = receiptRegister.reduce((sum, r) => sum + (r.amount || 0), 0);

    const countMatch = ledgerPaymentCount === receiptCount;
    const amountMatch = Math.abs(ledgerTotalAmount - receiptTotalAmount) < 0.01;

    return {
        success: countMatch && amountMatch,
        ledgerPaymentCount,
        receiptCount,
        ledgerTotalAmount,
        receiptTotalAmount,
        countMatch,
        amountMatch,
    };
};

/* =========================
   ROLLBACK MIGRATION
   Restore backups and clean up
========================= */

export const rollbackMigration = ({ ledgerBackupKey, feesBackupKey }) => {
    const restoreResult = restoreBackups({ ledgerBackupKey, feesBackupKey });

    // Clean up receipt register
    const tenantContext = getTenantContextForStorage();
    removeTenantStorage(RECEIPT_REGISTER_KEY, tenantContext);

    return {
        success: true,
        message: "Migration rolled back successfully",
        restoreResult,
    };
};

/* =========================
   SAFE MIGRATION EXECUTION
   Backup → Migrate → Verify → Rollback on failure
========================= */

export const executeSafeMigration = () => {
    // Step 1: Create backups
    const backupResult = createBackups();
    if (!backupResult.success) {
        return {
            success: false,
            message: "Backup creation failed",
            stage: "backup",
        };
    }

    // Step 2: Execute migration
    const migrationResult = executeMigration();
    if (!migrationResult.success) {
        return {
            success: false,
            message: "Migration execution failed",
            stage: "migration",
            backupResult,
        };
    }

    // Step 3: Verify migration
    const verificationResult = verifyMigration();
    if (!verificationResult.success) {
        // Step 4: Rollback on verification failure
        const rollbackResult = rollbackMigration({
            ledgerBackupKey: backupResult.ledgerBackupKey,
            feesBackupKey: backupResult.feesBackupKey,
        });
        
        return {
            success: false,
            message: "Migration verification failed - rolled back",
            stage: "verification",
            verificationResult,
            rollbackResult,
        };
    }

    return {
        success: true,
        message: "Migration completed successfully",
        stage: "completed",
        backupResult,
        migrationResult,
        verificationResult,
    };
};

/* =========================
   EXPORT
========================= */

export default {
    createBackups,
    restoreBackups,
    getMigrationStatistics,
    executeMigration,
    verifyMigration,
    rollbackMigration,
    executeSafeMigration,
};

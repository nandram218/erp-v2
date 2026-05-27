/**
 * Central registry of legacy localStorage keys.
 * Use these constants with storageService (getStorageCompat / setStorageCompat).
 * Do not hardcode key strings in modules.
 */

export const STORAGE_KEYS = Object.freeze({
    /** Main tenant DB — schoolStore (Step 1 migrated) */
    ERP_DB: "ERP_DB",

    /** Class list — classSubjectService, StudentForm */
    ERP_CLASSES: "ERP_CLASSES",

    /** Per-class subject setup — SubjectManager */
    ERP_SUBJECTS: "ERP_SUBJECTS",

    /** Class → subject mapping — SubjectManager */
    ERP_CLASS_SUBJECT_MAP: "ERP_CLASS_SUBJECT_MAP",

    /** Master fee settings — FeeSettings, FeeStructure */
    ERP_FEE_SETTINGS: "ERP_FEE_SETTINGS",

    /** Operational fees records — modules/fees/feesService */
    ERP_FEES_DB: "ERP_FEES_DB",

    /** Fees payment ledger — modules/fees/feesService */
    ERP_FEES_LEDGER: "ERP_FEES_LEDGER",

    /** Receipt counter — modules/fees/feesService */
    ERP_RECEIPT_COUNTER: "ERP_RECEIPT_COUNTER",

    /**
     * Alternate receipt key in feesConstants.js (not yet unified).
     * Keep until fees module migration dedupes keys.
     */
    ERP_FEES_RECEIPT_COUNTER: "ERP_FEES_RECEIPT_COUNTER",

    /** School profile (dual medium) — SchoolProfile */
    SCHOOL_PROFILE: "schoolProfile",

    /** Student form draft — StudentForm */
    DRAFT_STUDENT: "draftStudent",
});

/** Step 1 primary key — re-exported via storageService for schoolStore */
export const ERP_DB_KEY = STORAGE_KEYS.ERP_DB;

/**
 * Keys already routed through storageService + schoolStore migration.
 * migrateLegacyStorage() only copies these from legacy → prefixed storage.
 */
export const MIGRATED_STORAGE_KEYS = Object.freeze([
    STORAGE_KEYS.ERP_DB,
]);

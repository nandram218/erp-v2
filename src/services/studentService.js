// src/services/studentService.js
// Student business logic — persistence via schoolStore → storageService (ERP_DB)
// Phase 3.1 D Safe Mode - STRICT SaaS Enforcement
// ⚠️ PRODUCTION MODE: Direct access to this service is BLOCKED
// Use ServiceRegistry.getService("student") instead

import { useSchoolStore } from "../store/schoolStore";
import { getTenantContext } from "./tenantContextService";
import { blockDirectServiceAccess } from "../core/serviceRegistry";

// Phase 3.1 D Safe Mode: Block direct access in production mode
blockDirectServiceAccess("studentService");

/** Match by studentId (canonical) or legacy numeric id */
const matchesStudent = (student, identifier) => {
    if (identifier === undefined || identifier === null || identifier === "") {
        return false;
    }

    const key = String(identifier);

    if (student.studentId != null && String(student.studentId) === key) {
        return true;
    }

    if (student.id != null && String(student.id) === key) {
        return true;
    }

    return false;
};

/* =========================================================
   GLOBAL STUDENT ENGINE
========================================================= */

/* =========================================================
   GET STUDENTS
========================================================= */

export const getStudents = () => {
    const students = useSchoolStore.getState().students || [];
    const tenantContext = getTenantContext();

    // Phase 4.1: Filter students by current tenant context
    return students.filter(student => {
        return (
            (!tenantContext.schoolId || student.schoolId === tenantContext.schoolId) &&
            (!tenantContext.branchId || student.branchId === tenantContext.branchId) &&
            (!tenantContext.sessionId || student.sessionId === tenantContext.sessionId)
        );
    });
};

/* =========================================================
   GENERATE STUDENT ID
========================================================= */

export const generateStudentId = () => {

    const state =
        useSchoolStore.getState();

    // Use tenant context service for consistent tenant context
    const tenantContext = getTenantContext();

    const schoolId =
        tenantContext.schoolId ||
        "SCH-DEMO";

    const sessionId =
        tenantContext.sessionId ||
        "2025-26";

    const students =
        state.students || [];

    const nextNumber =
        String(students.length + 1)
            .padStart(6, "0");

    return `${schoolId}-${sessionId}-STU-${nextNumber}`;
};

/* =========================================================
   ADD STUDENT
========================================================= */

export const addStudent = (
    student = {}
) => {

    const {
        students,
        setStudents
    } = useSchoolStore.getState();

    const studentId =
        generateStudentId();

    // Use tenant context service for consistent tenant context
    const tenantContext = getTenantContext();

    const finalStudent = {

        ...student,

        /* =================
           PRIMARY IDENTITY
        ================= */

        studentId,

        /* =================
           TENANT CONTEXT
        ================= */

        schoolId:
            tenantContext.schoolId || "",

        branchId:
            tenantContext.branchId || "",

        sessionId:
            tenantContext.sessionId || "",

        /* =================
           TIMESTAMPS
        ================= */

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString(),
    };

    const updatedStudents = [
        ...students,
        finalStudent
    ];

    setStudents(updatedStudents);

    return finalStudent;
};

/* =========================================================
   UPDATE STUDENT
========================================================= */

export const updateStudent = (
    identifier,
    updatedData = {}
) => {

    const {
        students,
        setStudents
    } = useSchoolStore.getState();

    const updatedStudents =
        students.map((student) =>

            matchesStudent(student, identifier)

                ? {
                    ...student,
                    ...updatedData,

                    /* =================
                       NEVER OVERRIDE
                    ================= */

                    studentId:
                        student.studentId,

                    schoolId:
                        student.schoolId,

                    branchId:
                        student.branchId,

                    sessionId:
                        student.sessionId,

                    updatedAt:
                        new Date().toISOString(),
                }

                : student
        );

    setStudents(updatedStudents);

    return updatedStudents.find((student) =>
        matchesStudent(student, identifier)
    );
};

/* =========================================================
   DELETE STUDENT
========================================================= */

export const deleteStudent = (
    identifier
) => {

    const {
        students,
        setStudents
    } = useSchoolStore.getState();

    const updatedStudents =
        students.filter(
            (student) => !matchesStudent(student, identifier)
        );

    setStudents(updatedStudents);

    return true;
};

/* =========================================================
   GET SINGLE STUDENT
========================================================= */

export const getStudentById = (
    identifier
) => {

    const students =
        useSchoolStore
            .getState()
            .students || [];

    const tenantContext = getTenantContext();

    // Phase 4.1: Filter students by current tenant context before lookup
    const tenantFilteredStudents = students.filter(student => {
        return (
            (!tenantContext.schoolId || student.schoolId === tenantContext.schoolId) &&
            (!tenantContext.branchId || student.branchId === tenantContext.branchId) &&
            (!tenantContext.sessionId || student.sessionId === tenantContext.sessionId)
        );
    });

    return tenantFilteredStudents.find((student) =>
        matchesStudent(student, identifier)
    );
};

/* =========================================================
   CHECK DUPLICATE STUDENT
========================================================= */

export const studentExists = (
    studentId
) => {

    // Phase 4.1: studentExists already uses getStudentById which now has tenant filtering
    return !!getStudentById(
        studentId
    );
};

/* =========================================================
   PHASE 4.2.1: BACKEND MIGRATION READINESS LAYER
========================================================= */

/* =========================================================
   SCHEMA NORMALIZATION
========================================================= */

/**
 * Normalize student schema to handle field name variations
 * Phase 4.2.1: Schema drift handling - PURE FUNCTION
 */
export const normalizeStudentSchema = (student = {}) => {
    return {
        ...student,
        // Normalize class field variations
        class: student.class || student.className || student.studentClass || student.class_name || "",
        // Normalize mobile field variations
        mobile: student.mobile || student.mobileNo || student.fatherMobile || "",
        // Ensure required fields have defaults
        name: student.name || "",
        studentId: student.studentId || student.id || "",
        schoolId: student.schoolId || "",
        branchId: student.branchId || "",
        sessionId: student.sessionId || "",
    };
};

/* =========================================================
   VALIDATION LAYER
========================================================= */

/**
 * Validate student data structure
 * Phase 4.2.1: Input validation - PURE FUNCTION
 */
export const validateStudent = (student = {}) => {
    const errors = [];

    if (!student.name || typeof student.name !== 'string') {
        errors.push('name is required and must be a string');
    }

    if (!student.class && !student.className) {
        errors.push('class is required');
    }

    if (student.mobile && typeof student.mobile !== 'string') {
        errors.push('mobile must be a string');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/* =========================================================
   ERROR-SAFE WRAPPERS
========================================================= */

/**
 * Safe wrapper for addStudent with validation
 * Phase 4.2.1: Error handling
 */
export const safeAddStudent = (student = {}) => {
    try {
        const validation = validateStudent(student);
        if (!validation.isValid) {
            console.warn('[studentService] Validation failed:', validation.errors);
            return { success: false, errors: validation.errors };
        }

        const normalized = normalizeStudentSchema(student);
        const result = addStudent(normalized);

        return { success: true, data: result };
    } catch (error) {
        console.error('[studentService] addStudent error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Safe wrapper for updateStudent with validation
 * Phase 4.2.1: Error handling
 */
export const safeUpdateStudent = (identifier, updatedData = {}) => {
    try {
        const validation = validateStudent(updatedData);
        if (!validation.isValid) {
            console.warn('[studentService] Validation failed:', validation.errors);
            return { success: false, errors: validation.errors };
        }

        const normalized = normalizeStudentSchema(updatedData);
        const result = updateStudent(identifier, normalized);

        return { success: true, data: result };
    } catch (error) {
        console.error('[studentService] updateStudent error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Safe wrapper for deleteStudent
 * Phase 4.2.1: Error handling
 */
export const safeDeleteStudent = (identifier) => {
    try {
        if (!identifier) {
            return { success: false, error: 'identifier is required' };
        }

        const result = deleteStudent(identifier);
        return { success: true, data: result };
    } catch (error) {
        console.error('[studentService] deleteStudent error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Safe wrapper for getStudentById
 * Phase 4.2.1: Error handling
 */
export const safeGetStudentById = (identifier) => {
    try {
        if (!identifier) {
            return { success: false, error: 'identifier is required', data: null };
        }

        const result = getStudentById(identifier);
        if (!result) {
            return { success: false, error: 'student not found', data: null };
        }

        return { success: true, data: result };
    } catch (error) {
        console.error('[studentService] getStudentById error:', error);
        return { success: false, error: error.message, data: null };
    }
};

/* =========================================================
   FEE CONFIGURATION RESOLVER
========================================================= */

/**
 * Get fee configuration from FeeSettings and Transport
 * Phase 4.2.1 Stabilization: Single source of truth with FeeNormalizer
 *
 * Architecture:
 * - PRIMARY SOURCE: STORAGE_KEYS.ERP_FEE_SETTINGS
 * - SECONDARY SOURCE: transportService.getTransportRoutes()
 * - FALLBACK: CLASS_FEES, HOSTEL_FEE_CONST, TRANSPORT_ROUTES (constants)
 *
 * SaaS Multi-School Support:
 * - schoolId context for tenant isolation
 * - academicYear context for year-specific fees
 */
export const getFeeConfig = (context = {}) => {
    try {
        const { getStorageCompat, STORAGE_KEYS } = require("./storageService");
        const { normalizeFeeSettings, getFallbackFeeStructure, validateFeeStructure } = require("../core/fee-engine/feeNormalizer");

        // Get SaaS context (schoolId, academicYear)
        const { schoolId = "default", academicYear = "2024-25" } = context;

        // Read FeeSettings from storage (PRIMARY SOURCE)
        const feeSettings = getStorageCompat(STORAGE_KEYS.ERP_FEE_SETTINGS, null);

        // Read Transport routes from transportService
        const transportService = require("../modules/transport/services/transportService");
        const transportRoutes = transportService.getTransportRoutes();

        // Normalize FeeSettings using FeeNormalizer
        const normalizedConfig = normalizeFeeSettings(feeSettings, transportRoutes, { schoolId, academicYear });

        if (normalizedConfig) {
            // Validate normalized structure
            const validation = validateFeeStructure(normalizedConfig);

            if (!validation.valid) {
                console.error('[studentService] Fee structure validation failed:', validation.errors);
            }
            if (validation.warnings.length > 0) {
                console.warn('[studentService] Fee structure warnings:', validation.warnings);
            }

            const result = {
                ...normalizedConfig,
                routes: normalizedConfig.transportRoutes
            };


            return result;
        }

        // FeeSettings is empty - show error instead of using fallback
        console.error('[studentService] FeeSettings is empty. Please configure fee settings in FeeSettings module.');
        return {
            schoolId,
            academicYear,
            classFees: {},
            transportRoutes: [],
            hostelFee: 0,
            settings: {},
            source: "error",
            routes: []
        };
    } catch (error) {
        console.error('[studentService] Fee config error:', error);
        // Return empty config instead of fallback
        return {
            schoolId: context.schoolId || "default",
            academicYear: context.academicYear || "2024-25",
            classFees: {},
            transportRoutes: [],
            hostelFee: 0,
            settings: {},
            source: "error",
            routes: []
        };
    }
};

/* =========================================================
   FEE CALCULATION SERVICE
========================================================= */

/**
 * Calculate student fees based on class, transport, hostel, and optional activities
 * Phase 4.2.1 Stabilization: Category-based fee aggregation with mandatory + optional logic
 *
 * Architecture:
 * - PURE FUNCTION (no side effects)
 * - No localStorage access
 * - No UI dependencies
 * - Service layer only
 *
 * Returns:
 * - Category totals (academic, supportingAcademic, activities, facilities)
 * - Grand total
 * - Detailed breakdown for UI display
 */
export const calculateStudentFees = (studentData = {}, feeConfig = {}) => {
    const { class: studentClass, transport, hostel, route, selectedActivities = [], selectedSupportingOptional = [] } = studentData;
    const { classFees = {}, routes = [], hostelFee = 0 } = feeConfig;

    // Get class fee structure from normalized config
    const classFeeStructure = classFees[studentClass] || {
        academic: { total: 0, items: [] },
        supportingAcademic: {
            total: 0,
            compulsory: { total: 0, items: [] },
            optional: { total: 0, items: [] }
        },
        activities: { items: [] },
        facilities: { items: [] }
    };

    // Academic fees (always auto-calculated, single total, no breakdown in UI)
    const academicTotal = classFeeStructure.academic.total || 0;

    // Supporting Academic fees (compulsory auto-included, optional checkbox-driven)
    // Phase 4.2.1 Critical Alignment: Optional supporting academic fees only added if selected
    const supportingAcademicCompulsoryTotal = classFeeStructure.supportingAcademic.compulsory?.total || 0;
    const supportingAcademicOptionalTotal = selectedSupportingOptional.reduce((sum, feeName) => {
        const fee = classFeeStructure.supportingAcademic.optional?.items.find(f => f.name === feeName);
        return sum + (fee ? fee.amount : 0);
    }, 0);
    const supportingAcademicTotal = supportingAcademicCompulsoryTotal + supportingAcademicOptionalTotal;

    // Optional Activity fees (checkbox-driven, fully optional)
    const activitiesTotal = selectedActivities.reduce((sum, activityName) => {
        const activity = classFeeStructure.activities.items.find(a => a.name === activityName);
        return sum + (activity ? activity.amount : 0);
    }, 0);

    // Transport fee (conditional, route-based)
    let transportFee = 0;
    let selectedRoute = null;
    if (transport && route) {
        // First try to read routeFee from student record (canonical)
        if (transport.routeFee !== undefined) {
            transportFee = transport.routeFee;
        } else {
            // Backward compatibility: calculate from route object
            const routeObj = routes.find(r => r.name === route || r.id === route);
            if (routeObj) {
                if (routeObj.fareType === "fixed") {
                    transportFee = routeObj.fixedFare || 0;
                } else if (
                    (routeObj.fareType === "pointWise" ||
                        routeObj.fareType === "point") &&
                    transport.pickupPoint
                ) {
                    const pickupPoint = routeObj.pickupPoints?.find(p => p.pickupPointName === transport.pickupPoint);
                    transportFee = pickupPoint?.routeFee || 0;
                } else {
                    // Backward compatibility
                    transportFee = routeObj.routeFee || routeObj.fee || 0;
                }
                selectedRoute = routeObj;
            }
        }
    }

    // Hostel fee (conditional, toggle-based)
    const hostelFeeAmount = hostel ? hostelFee : 0;

    // Calculate grand total
    const grandTotal = academicTotal + supportingAcademicTotal + activitiesTotal + transportFee + hostelFeeAmount;

    return {
        // Category totals (for UI display)
        academicTotal,
        supportingAcademicTotal,
        activitiesTotal,
        transportFee,
        hostelFee: hostelFeeAmount,
        totalFee: grandTotal,

        // Detailed breakdown for UI (optional display)
        breakdown: {
            academic: {
                total: academicTotal,
                items: classFeeStructure.academic.items,
                compulsory: true
            },
            supportingAcademic: {
                total: supportingAcademicTotal,
                compulsory: classFeeStructure.supportingAcademic.compulsory,
                optional: classFeeStructure.supportingAcademic.optional
            },
            activities: {
                total: activitiesTotal,
                items: classFeeStructure.activities.items,
                selected: selectedActivities
            },
            facilities: {
                transport: selectedRoute,
                hostel: hostel ? { fee: hostelFeeAmount } : null
            }
        },

        // Metadata for debugging
        source: feeConfig.source || "Unknown",
        schoolId: feeConfig.schoolId || "default",
        academicYear: feeConfig.academicYear || "2024-25"
    };
};

/* =========================================================
   FILTERING SERVICE (PURE FUNCTION)
========================================================= */

/**
 * Filter students with multiple criteria
 * Phase 4.2.1: Move filtering logic from UI to service - PURE FUNCTION
 * Signature: getStudentsFiltered(students, filters)
 */
export const getStudentsFiltered = (students = [], filters = {}) => {
    const {
        search = "",
        class: cls = "",
        gender = "",
        category = "",
        hostel = "",
        transport = "",
        route = "",
        rte = ""
    } = filters;

    const query = search.toLowerCase();

    return students.filter(student => {
        return (
            // Search
            (!search ||
                student.name?.toLowerCase().includes(query) ||
                student.mobile?.toLowerCase().includes(query) ||
                student.mobileNo?.toLowerCase().includes(query) ||
                student.admissionNo?.toLowerCase().includes(query)
            )
            // Class
            && (!cls || String(student.class) === String(cls))
            // Gender
            && (!gender || student.gender === gender)
            // Category
            && (!category || student.category === category)
            // Hostel
            && (!hostel ||
                (hostel === "Yes" && student.hostel === true) ||
                (hostel === "No" && student.hostel === false)
            )
            // RTE
            && (!rte || String(student.RTE) === rte)
            // Transport
            && (!transport ||
                (transport === "Yes" && student.transport === true) ||
                (transport === "No" && student.transport === false)
            )
            // Route
            && (!route ||
                (transport === "Yes" && student.route === route)
            )
        );
    });
};

/* =========================================================
   SORTING SERVICE (PURE FUNCTION)
========================================================= */

/**
 * Class order for sorting
 * Phase 4.2.1: Move sorting logic from UI to service
 */
const CLASS_ORDER = [
    "PP3", "PP4", "PP5",
    "Nursery", "LKG", "UKG",
    "1st", "2nd", "3rd", "4th", "5th",
    "6th", "7th", "8th", "9th", "10th",
    "11th", "12th"
];

/**
 * Sort students by class order
 * Phase 4.2.1: Move sorting logic from UI to service - PURE FUNCTION
 * Signature: getStudentsSorted(students)
 */
export const getStudentsSorted = (students = []) => {
    return [...students].sort((a, b) => {
        const aIndex = CLASS_ORDER.indexOf(a.class);
        const bIndex = CLASS_ORDER.indexOf(b.class);
        return aIndex - bIndex;
    });
};

/* =========================================================
   KPI CALCULATION SERVICE (PURE FUNCTION)
========================================================= */

/**
 * Calculate student KPIs
 * Phase 4.2.1: Move KPI calculation from UI to service - PURE FUNCTION
 * Signature: getStudentKPIs(students)
 */
export const getStudentKPIs = (students = []) => {
    const total = students.length;
    const transportCount = students.filter(s => s.transport).length;
    const hostelCount = students.filter(s => s.hostel).length;
    const absent = Math.floor(total * 0.08); // Hardcoded 8% as per current implementation

    return {
        total,
        transportCount,
        hostelCount,
        absent
    };
};

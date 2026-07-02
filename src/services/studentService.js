// src/services/studentService.js
// Student business logic — persistence via schoolStore → storageService (ERP_DB)
// Phase 3.1 D Safe Mode - STRICT SaaS Enforcement
// ⚠️ PRODUCTION MODE: Direct access to this service is BLOCKED
// Use ServiceRegistry.getService("student") instead
import { getService } from "../core/serviceRegistry";
import { useSchoolStore } from "../store/schoolStore";
import { getTenantContext } from "./tenantContextService";

// ============================================================
// PRODUCTION STABILITY: execution lock to prevent duplicate operations
// ============================================================
const executionLocks = new Map();
const LOCK_TIMEOUT = 5000; // 5 seconds max lock duration

const acquireLock = (operation) => {
    const lockKey = `${operation}_${Date.now()}`;
    if (executionLocks.has(operation)) {
        const existingLock = executionLocks.get(operation);
        if (Date.now() - existingLock.timestamp < LOCK_TIMEOUT) {
            throw new Error(`[LOCK] ${operation} already in progress. Please wait.`);
        }
    }
    executionLocks.set(operation, { timestamp: Date.now(), lockKey });
    return lockKey;
};

const releaseLock = (operation) => {
    if (executionLocks.has(operation)) {
        executionLocks.delete(operation);
    }
};

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

    // CRITICAL FIX SECTION A: Use highest existing numeric ID + 1 instead of length
    // This prevents ID reuse after deletions
    const maxNumericId = students.reduce((max, student) => {
        if (student.studentId && typeof student.studentId === 'string') {
            const match = student.studentId.match(/STU-(\d+)/);
            if (match) {
                const num = parseInt(match[1], 10);
                return num > max ? num : max;
            }
        }
        return max;
    }, 0);

    const nextNumber =
        String(maxNumericId + 1)
            .padStart(6, "0");

    return `${schoolId}-${sessionId}-STU-${nextNumber}`;
};

/* =========================================================
    ADD STUDENT
========================================================= */

export const addStudent = (
    student = {}
) => {
    // PRODUCTION STABILITY: Acquire execution lock
    const lockKey = acquireLock('addStudent');

    try {
        const {
            students,
            setStudents
        } = useSchoolStore.getState();

        const studentId =
            generateStudentId();

        // Use tenant context service for consistent tenant context
        const tenantContext = getTenantContext();

        // PHASE 6.0: Duplicate detection before creation
        const exists = students.some(s => 
            s.studentId === studentId || 
            (student.studentId && s.studentId === student.studentId)
        );
        if (exists) {
            throw new Error(`[DUPLICATE] Student already exists: ${studentId || student.studentId}`);
        }

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

        // Stage 2: Atomic transaction - create related records
        // If any step fails, rollback student addition
        const rollback = () => {
            const currentStudents = useSchoolStore.getState().students || [];
            setStudents(currentStudents.filter(s => s.studentId !== studentId));
        };

        try {
            // Create fee record in fees service
            const feesService = getService("fees");
            feesService.createStudentFeesRecord({ student: finalStudent });
        } catch (feeError) {
            console.error('[studentService] Fee record creation failed, rolling back:', feeError);
            rollback();
            throw new Error(`Failed to create student fee record: ${feeError.message}`);
        }

        // Create transport assignment if transport is enabled
        if (finalStudent.transport?.enabled && finalStudent.transport.routeId) {
            const transportService = getService("transport");
            if (transportService && typeof transportService.assignStudentToRoute === 'function') {
                try {
                    transportService.assignStudentToRoute({
                        studentId: finalStudent.studentId,
                        routeId: finalStudent.transport.routeId,
                        pickupPoint: finalStudent.transport.pickupPoint,
                        fee: finalStudent.transport.routeFee
                    });
                } catch (e) {
                    console.warn('[studentService] Transport assignment failed (non-critical):', e.message);
                    // Transport assignment failure is non-critical - student is still created
                }
            }
        }

        // Create hostel assignment if hostel is enabled
        if (finalStudent.hostel?.enabled) {
            const { isServiceRegistered } = require("../core/serviceRegistry");
            if (isServiceRegistered("hostel")) {
                const hostelService = getService("hostel");
                if (hostelService && typeof hostelService.assignStudentToBed === 'function') {
                    try {
                        // Note: Bed assignment requires a bedId, which would come from hostel management
                        // For now, we mark the student as hostel-enabled; actual bed assignment happens in hostel module
                        console.log('[studentService] Student marked for hostel, bed assignment to be handled separately');
                    } catch (e) {
                        console.warn('[studentService] Hostel assignment failed (non-critical):', e.message);
                    }
                }
            }
        }

        return finalStudent;
    } finally {
        // PRODUCTION STABILITY: Always release lock
        releaseLock('addStudent');
    }
};

/* =========================================================
   UPDATE STUDENT
========================================================= */

export const updateStudent = (
    identifier,
    updatedData = {}
) => {
    // PRODUCTION STABILITY: Acquire execution lock
    const lockKey = acquireLock(`updateStudent_${identifier}`);

    try {
        const {
            students,
            setStudents
        } = useSchoolStore.getState();

        // Find current student to verify it exists
        const existingStudent = students.find((student) =>
            matchesStudent(student, identifier)
        );

        if (!existingStudent) {
            throw new Error(`Student not found: ${identifier}`);
        }

        const updatedStudents = students.map((student) =>
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

        const updatedStudent = updatedStudents.find((student) =>
            matchesStudent(student, identifier)
        );

        if (!updatedStudent) {
            throw new Error(`Student not found: ${identifier}`);
        }

        const feesService = getService("fees");

        try {
            feesService.syncStudentsToFeesDB({
                students: [updatedStudent]
            });
        } catch (feeError) {
            console.error('[studentService] Fee sync failed:', feeError);
            throw new Error(`Failed to sync student fees: ${feeError.message}`);
        }

        // Update transport assignment if transport info changed
        const transportService = getService("transport");
        if (transportService) {
            if (updatedStudent.transport?.enabled && updatedStudent.transport.routeId) {
                if (typeof transportService.assignStudentToRoute === 'function') {
                    try {
                        transportService.assignStudentToRoute({
                            studentId: updatedStudent.studentId,
                            routeId: updatedStudent.transport.routeId,
                            pickupPoint: updatedStudent.transport.pickupPoint,
                            fee: updatedStudent.transport.routeFee
                        });
                    } catch (e) {
                        console.warn('[studentService] Transport update failed (non-critical):', e.message);
                    }
                }
            } else if (typeof transportService.removeStudentTransport === 'function') {
                try {
                    transportService.removeStudentTransport(updatedStudent.studentId);
                } catch (e) {
                    console.warn('[studentService] Transport removal failed (non-critical):', e.message);
                }
            }
        }

        return updatedStudent;
    } finally {
        // PRODUCTION STABILITY: Always release lock
        releaseLock(`updateStudent_${identifier}`);
    }
};

/* =========================================================
   DELETE STUDENT
========================================================= */

export const deleteStudent = (
    identifier
) => {
    // PRODUCTION STABILITY: Acquire execution lock
    const lockKey = acquireLock(`deleteStudent_${identifier}`);

    try {
        const {
            students,
            setStudents
        } = useSchoolStore.getState();

        // Find the student being deleted
        const studentToDelete = students.find(
            (student) => matchesStudent(student, identifier)
        );

        if (!studentToDelete) {
            throw new Error(`Student not found: ${identifier}`);
        }

        const studentId = studentToDelete.studentId;

        // Stage 2: Atomic transaction - delete student FIRST, then cleanup related records
        // If cleanup fails, student is already removed (acceptable - orphans will be cleaned by cleanupOrphan functions)
        const updatedStudents =
            students.filter(
                (student) => !matchesStudent(student, identifier)
            );

        setStudents(updatedStudents);

        try {
            // 1. Delete fees record
            const feesService = getService("fees");
            feesService.deleteStudentFeesRecord(studentId);
        } catch (feeError) {
            console.error('[studentService] Fee record cleanup failed:', feeError);
            // Non-critical - orphan cleanup will handle this later
        }

        try {
            // 2. Clean up transport assignment
            const transportService = getService("transport");
            if (studentToDelete.transportRouteId) {
                transportService.removeStudentTransport(studentId);
            }
        } catch (transportError) {
            console.error('[studentService] Transport cleanup failed:', transportError);
            // Non-critical - orphan cleanup will handle this later
        }

        // 3. Clean up hostel assignment (optional service - safe lookup)
        try {
            const { isServiceRegistered } = require("../core/serviceRegistry");
            if (isServiceRegistered("hostel")) {
                const hostelService = getService("hostel");
                hostelService.releaseStudentBed(studentId);
            }
        } catch (hostelError) {
            console.error('[studentService] Hostel cleanup failed:', hostelError);
            // Non-critical - orphan cleanup will handle this later
        }

        return true;
    } finally {
        // PRODUCTION STABILITY: Always release lock
        releaseLock(`deleteStudent_${identifier}`);
    }
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
 * @CONTRACT Student
 * @LOCK STABLE
 *
 * Student Service
 * Handles all student-related operations
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
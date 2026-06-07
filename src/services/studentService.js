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

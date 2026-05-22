// src/services/studentService.js

import { useSchoolStore } from "../store/schoolStore";

const DB_KEY = "ERP_DB";

/* =========================================================
   FEES STORAGE SERVICE
========================================================= */

export const feesService = {

    /* ================= GET FULL DB ================= */

    getDB: () => {
        return JSON.parse(
            localStorage.getItem(DB_KEY) || "{}"
        );
    },

    /* ================= SAVE FULL DB ================= */

    saveDB: (db) => {
        localStorage.setItem(
            DB_KEY,
            JSON.stringify(db)
        );
    },

    /* ================= GET FEES ================= */

    get: () => {
        const db = feesService.getDB();
        return db.fees || {};
    },

    /* ================= SAVE FEES ================= */

    save: (feesData) => {

        const db = feesService.getDB();

        db.fees = feesData;

        feesService.saveDB(db);
    },

    /* ================= HISTORY ================= */

    getHistory: () => {

        const db = feesService.getDB();

        return db.feesHistory || [];
    },

    saveHistory: (history) => {

        const db = feesService.getDB();

        db.feesHistory = history;

        feesService.saveDB(db);
    },

    /* ================= RESET ================= */

    reset: () => {

        const db = feesService.getDB();

        db.fees = {};
        db.feesHistory = [];

        feesService.saveDB(db);
    }
};

/* =========================================================
   GLOBAL STUDENT ENGINE
========================================================= */

/* =========================================================
   GET STUDENTS
========================================================= */

export const getStudents = () => {
    return useSchoolStore.getState().students || [];
};

/* =========================================================
   GENERATE STUDENT ID
========================================================= */

export const generateStudentId = () => {

    const state =
        useSchoolStore.getState();

    const schoolData =
        state.schoolData || {};

    const schoolId =
        schoolData.schoolId ||
        "SCH-DEMO";

    const sessionId =
        schoolData.sessionId ||
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
        setStudents,
        schoolData
    } = useSchoolStore.getState();

    const studentId =
        generateStudentId();

    const finalStudent = {

        ...student,

        /* =================
           PRIMARY IDENTITY
        ================= */

        studentId,

        /* =================
           GLOBAL CONTEXT
        ================= */

        schoolId:
            schoolData.schoolId || "",

        branchId:
            schoolData.branchId || "",

        sessionId:
            schoolData.sessionId || "",

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
    studentId,
    updatedData = {}
) => {

    const {
        students,
        setStudents
    } = useSchoolStore.getState();

    const updatedStudents =
        students.map((student) =>

            String(student.studentId) ===
                String(studentId)

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

    return updatedStudents.find(
        (student) =>
            String(student.studentId) ===
            String(studentId)
    );
};

/* =========================================================
   DELETE STUDENT
========================================================= */

export const deleteStudent = (
    studentId
) => {

    const {
        students,
        setStudents
    } = useSchoolStore.getState();

    const updatedStudents =
        students.filter(
            (student) =>

                String(student.studentId) !==
                String(studentId)
        );

    setStudents(updatedStudents);

    return true;
};

/* =========================================================
   GET SINGLE STUDENT
========================================================= */

export const getStudentById = (
    studentId
) => {

    const students =
        useSchoolStore
            .getState()
            .students || [];

    return students.find(
        (student) =>

            String(student.studentId) ===
            String(studentId)
    );
};

/* =========================================================
   CHECK DUPLICATE STUDENT
========================================================= */

export const studentExists = (
    studentId
) => {

    return !!getStudentById(
        studentId
    );
};
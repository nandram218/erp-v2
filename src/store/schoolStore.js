import { create } from "zustand";
import {
    ERP_DB_KEY,
    getStorageCompat,
    setStorageCompat,
    removeStorageCompat,
    migrateLegacyStorage,
} from "../services/storageService";

// ================= GLOBAL CONTEXT =================

const GLOBAL_CONTEXT = {
    schoolId: "SCH-IND-0001",
    branchId: "MAIN",
    sessionId: "2025-26",
};

export const useSchoolStore = create((set, get) => ({

    // ================= STATE =================

    hydrated: false,

    schoolData: {
        ...GLOBAL_CONTEXT,
    },

    students: [],
    classes: [],
    fees: {},
    transport: {},
    hostel: {},

    // ================= LOAD =================

    loadAll: () => {

        migrateLegacyStorage();

        const db = getStorageCompat(ERP_DB_KEY, null);

        if (!db) {

            set({
                hydrated: true
            });

            return;
        }

        try {

            set({

                schoolData: {
                    ...GLOBAL_CONTEXT,
                    ...(db.school ?? {})
                },

                students: Array.isArray(db.students)
                    ? db.students
                    : [],

                classes: Array.isArray(db.classes)
                    ? db.classes
                    : [],

                fees: db.fees ?? {},

                transport: db.transport ?? {},

                hostel: db.hostel ?? {},

                hydrated: true
            });

        } catch (e) {

            console.error(
                "ERP_DB corrupted, resetting..."
            );

            removeStorageCompat(ERP_DB_KEY);

            set({
                hydrated: true
            });
        }
    },

    // ================= SAVE =================

    saveAll: () => {

        const state = get();

        const db = {

            school: state.schoolData,

            students: state.students || [],

            classes: state.classes || [],

            fees: state.fees || {},

            transport: state.transport || {},

            hostel: state.hostel || {}
        };

        setStorageCompat(ERP_DB_KEY, db);
    },

    // ================= SCHOOL =================

    setSchoolData: (data) => {

        set({

            schoolData: {
                ...get().schoolData,
                ...data,
            }
        });

        get().saveAll();
    },

    // ================= STUDENTS =================

    setStudents: (data) => {

        set({
            students: Array.isArray(data)
                ? data
                : []
        });

        get().saveAll();
    },

    // ================= CLASSES =================

    setClasses: (data) => {

        set({
            classes: Array.isArray(data)
                ? data
                : []
        });

        get().saveAll();
    },

    // ================= FEES =================

    setFees: (data) => {

        set({
            fees: data || {}
        });

        get().saveAll();
    },

    // ================= TRANSPORT =================

    setTransport: (data) => {

        set({
            transport: data || {}
        });

        get().saveAll();
    },

    // ================= HOSTEL =================

    setHostel: (data) => {

        set({
            hostel: data || {}
        });

        get().saveAll();
    }

}));

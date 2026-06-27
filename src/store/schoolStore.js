import { create } from "zustand";
import {
    ERP_DB_KEY,
    getStorageCompat,
    setStorageCompat,
    removeStorageCompat,
    migrateLegacyStorage,
    getTenantStorage,
    setTenantStorage,
} from "../services/storageService";
import { getTenantContext, getTenantContextForStorage } from "../services/tenantContextService";

export const useSchoolStore = create((set, get) => ({

    // ================= STATE =================

    hydrated: false,

    schoolData: {
        // Tenant context will be loaded from storage or auth
        schoolId: "",
        branchId: "",
        sessionId: "",
    },

    students: [],
    classes: [],
    fees: {},
    transport: {},
    hostel: {},

    // ================= LOAD =================

    loadAll: () => {

        migrateLegacyStorage();

        // Get tenant context for storage operations (bootstrap-safe)
        const tenantContext = getTenantContextForStorage();

        // Try tenant-scoped storage first, fallback to shared
        const db = getTenantStorage(ERP_DB_KEY, tenantContext, null);

        // Get full tenant context for data merging
        const fullTenantContext = getTenantContext();

        if (!db) {

            set({
                schoolData: fullTenantContext,
                hydrated: true
            });

            return;
        }

        try {

            // Phase 4.5: Tenant Isolation Validation
            // Validate that loaded data matches current tenant context
            const tenantValidationErrors = [];
            
            if (fullTenantContext.schoolId && db.school?.schoolId && db.school.schoolId !== fullTenantContext.schoolId) {
                tenantValidationErrors.push(`School ID mismatch: stored=${db.school.schoolId}, current=${fullTenantContext.schoolId}`);
            }
            
            if (fullTenantContext.branchId && db.school?.branchId && db.school.branchId !== fullTenantContext.branchId) {
                tenantValidationErrors.push(`Branch ID mismatch: stored=${db.school.branchId}, current=${fullTenantContext.branchId}`);
            }
            
            if (fullTenantContext.sessionId && db.school?.sessionId && db.school.sessionId !== fullTenantContext.sessionId) {
                tenantValidationErrors.push(`Session ID mismatch: stored=${db.school.sessionId}, current=${fullTenantContext.sessionId}`);
            }

            // Phase 4.5: Cross-tenant student detection
            if (Array.isArray(db.students) && fullTenantContext.schoolId) {
                const crossTenantStudents = db.students.filter(student => {
                    return student.schoolId && student.schoolId !== fullTenantContext.schoolId;
                });
                
                if (crossTenantStudents.length > 0) {
                    tenantValidationErrors.push(`Found ${crossTenantStudents.length} students from different school(s)`);
                    console.error("[Tenant Isolation] Cross-tenant student data detected:", {
                        currentTenant: fullTenantContext,
                        crossTenantCount: crossTenantStudents.length,
                        sampleStudents: crossTenantStudents.slice(0, 3).map(s => ({
                            studentId: s.studentId,
                            schoolId: s.schoolId,
                            name: s.name
                        }))
                    });
                }
            }

            if (tenantValidationErrors.length > 0) {
                console.error("[Tenant Isolation] CRITICAL: Tenant validation failed:", tenantValidationErrors);
                console.error("[Tenant Isolation] This indicates cross-tenant data leakage. Clearing data for safety.");
                
                // Clear the corrupted/mixed data
                removeStorageCompat(ERP_DB_KEY);
                
                set({
                    schoolData: fullTenantContext,
                    students: [],
                    classes: [],
                    fees: {},
                    transport: {},
                    hostel: {},
                    hydrated: true
                });
                
                return;
            }

            set({

                schoolData: {
                    // Use tenant context as base, merge with stored school data
                    ...fullTenantContext,
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
                schoolData: fullTenantContext,
                hydrated: true
            });
        }
    },

    // ================= SAVE =================

    saveAll: () => {

        const state = get();

        // Get tenant context for storage operations (bootstrap-safe)
        const tenantContext = getTenantContextForStorage();

        // FIX: Merge existing transport data from localStorage to prevent overwriting
        // master-setting transport service data with stale state
        const existingDB = getTenantStorage(ERP_DB_KEY, tenantContext, {});

        const db = {

            school: state.schoolData,

            students: state.students || [],

            classes: state.classes || [],

            fees: state.fees || {},

            transport: {
                ...(existingDB.transport || {}),
                ...(state.transport || {})
            },

            hostel: {
                ...(existingDB.hostel || {}),
                ...(state.hostel || {})
            }
        };

        // Use tenant-aware write (dual-write)
        setTenantStorage(ERP_DB_KEY, db, tenantContext);
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

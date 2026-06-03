import {
    getStorageCompat,
    setStorageCompat,
    STORAGE_KEYS,
} from "../../../services/storageService";
import { getSchoolId, getBranchId, getSessionId } from "../../../services/tenantContextService";

const DB_KEY = STORAGE_KEYS.ERP_DB;

/* =====================================================
   HELPERS
===================================================== */

const uid = () =>
    Date.now() +
    Math.floor(Math.random() * 1000);

const getDB = () => {
    try {
        return getStorageCompat(DB_KEY, {}) || {};
    } catch {
        return {};
    }
};

const saveDB = (db) => {
    setStorageCompat(DB_KEY, db);
};

const getTransportDB = () => {
    const db = getDB();

    if (!db.transport) {
        // Get tenant context for isolation
        const schoolId = getSchoolId() || "";
        const branchId = getBranchId() || "";
        const sessionId = getSessionId() || "";

        db.transport = {
            routes: [],
            vehicles: [],
            drivers: [],
            mappings: [],
            settings: {
                transportEnabled: true,
                attendanceTracking: false,
                gpsTracking: false,
                smsAlerts: false,
            },
            // Tenant isolation fields
            schoolId,
            branchId,
            sessionId,
        };

        saveDB(db);
    }

    return db.transport;
};

const saveTransportDB = (transport) => {
    const db = getDB();

    db.transport = transport;

    saveDB(db);
};

/* =====================================================
   ROUTES
===================================================== */

export const getTransportRoutes = () => {
    return getTransportDB().routes || [];
};

export const getRouteById = (
    routeId
) => {
    return getTransportRoutes().find(
        (r) =>
            String(r.id) ===
            String(routeId)
    );
};

export const createTransportRoute = (
    payload
) => {
    const transport =
        getTransportDB();

    const routes =
        transport.routes || [];

    const existing =
        routes.find(
            (r) =>
                String(r.id) ===
                String(payload.id)
        );

    // Get tenant context for isolation
    const schoolId = getSchoolId() || payload.schoolId || "";
    const branchId = getBranchId() || payload.branchId || "";
    const sessionId = getSessionId() || payload.sessionId || "";

    const route = {
        id:
            payload.id || uid(),

        routeName:
            payload.routeName || "",

        vehicleNumber:
            payload.vehicleNumber || "",

        vehicleType:
            payload.vehicleType || "Bus",

        driverName:
            payload.driverName || "",

        driverPhone:
            payload.driverPhone || "",

        monthlyFee: Number(
            payload.monthlyFee || 0
        ),

        pickupPoints:
            payload.pickupPoints || [],

        gpsEnabled:
            payload.gpsEnabled || false,

        liveTrackingEnabled:
            payload.liveTrackingEnabled ||
            false,

        active:
            payload.active !== undefined
                ? payload.active
                : true,

        createdAt:
            existing?.createdAt ||
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString(),

        // Tenant isolation fields
        schoolId,
        branchId,
        sessionId,
    };

    if (existing) {
        transport.routes =
            routes.map((r) =>
                String(r.id) ===
                    String(route.id)
                    ? route
                    : r
            );
    } else {
        transport.routes = [
            ...routes,
            route,
        ];
    }

    saveTransportDB(transport);

    return route;
};

export const removeTransportRoute = (
    id
) => {
    const transport =
        getTransportDB();

    transport.routes =
        transport.routes.filter(
            (r) =>
                String(r.id) !==
                String(id)
        );

    saveTransportDB(transport);
};

export const toggleRouteStatus = (
    id
) => {
    const transport =
        getTransportDB();

    transport.routes =
        transport.routes.map((r) => {
            if (
                String(r.id) ===
                String(id)
            ) {
                return {
                    ...r,
                    active: !r.active,
                    updatedAt:
                        new Date().toISOString(),
                };
            }

            return r;
        });

    saveTransportDB(transport);
};

/* =====================================================
   FEES
===================================================== */

export const calculateTransportFee = (
    routeId
) => {
    const route =
        getRouteById(routeId);

    return Number(
        route?.monthlyFee || 0
    );
};

/* =====================================================
   STUDENT TRANSPORT
===================================================== */

export const assignStudentTransport = (
    student
) => {
    if (!student.transportRouteId) {
        return null;
    }

    const route = getRouteById(
        student.transportRouteId
    );

    if (!route) {
        return null;
    }

    // Get tenant context for isolation
    const schoolId = getSchoolId() || student.schoolId || "";
    const branchId = getBranchId() || student.branchId || "";
    const sessionId = getSessionId() || student.sessionId || "";

    return {
        routeId: route.id,

        routeName:
            route.routeName,

        pickupPoint:
            student.pickupPoint || "",

        vehicleNumber:
            route.vehicleNumber,

        monthlyFee:
            route.monthlyFee,

        assignedAt:
            new Date().toISOString(),

        // Tenant isolation fields
        schoolId,
        branchId,
        sessionId,
    };
};

export const saveStudentTransport = (
    studentId,
    transportData
) => {
    const db = getDB();

    // Get tenant context for isolation
    const schoolId = getSchoolId() || "";
    const branchId = getBranchId() || "";
    const sessionId = getSessionId() || "";

    db.students =
        (db.students || []).map(
            (student) => {
                if (
                    String(student.id) ===
                    String(studentId)
                ) {
                    return {
                        ...student,
                        transport: {
                            ...transportData,
                            // Ensure tenant context in transport data
                            schoolId: transportData.schoolId || schoolId,
                            branchId: transportData.branchId || branchId,
                            sessionId: transportData.sessionId || sessionId,
                        },
                    };
                }

                return student;
            }
        );

    saveDB(db);
};

/* =====================================================
   OCCUPANCY
===================================================== */

export const calculateRouteOccupancy =
    (routeId) => {
        const db = getDB();

        return (
            db.students || []
        ).filter(
            (student) =>
                String(
                    student.transport
                        ?.routeId
                ) === String(routeId)
        ).length;
    };

/* =====================================================
   DASHBOARD
===================================================== */

export const getTransportDashboard =
    () => {
        const routes =
            getTransportRoutes();

        const db = getDB();

        const students =
            db.students || [];

        return {
            totalRoutes:
                routes.length,

            activeVehicles:
                routes.filter(
                    (r) => r.active
                ).length,

            totalStudents:
                students.filter(
                    (s) =>
                        s.transport
                ).length,

            monthlyRevenue:
                routes.reduce(
                    (sum, route) =>
                        sum +
                        Number(
                            route.monthlyFee ||
                            0
                        ),
                    0
                ),
        };
    };

/* =====================================================
   SNAPSHOT
===================================================== */

export const generateTransportSnapshot =
    (data) => {
        // Get tenant context for isolation
        const schoolId = getSchoolId() || data.schoolId || "";
        const branchId = getBranchId() || data.branchId || "";
        const sessionId = getSessionId() || data.sessionId || "";

        return {
            snapshotId: `TS-${Date.now()}`,

            routeId:
                data.routeId ||
                data.id,

            routeName:
                data.routeName || "",

            vehicleNumber:
                data.vehicleNumber || "",

            driverName:
                data.driverName || "",

            pickupPoints:
                data.pickupPoints || [],

            monthlyFee: Number(
                data.monthlyFee || 0
            ),

            generatedAt:
                new Date().toISOString(),

            // Tenant isolation fields
            schoolId,
            branchId,
            sessionId,
        };
    };
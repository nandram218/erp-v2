/* =========================================================
   MASTER TRANSPORT CONFIG ENGINE
   SINGLE SOURCE OF TRUTH
========================================================= */

import {
    getTenantStorage,
    setTenantStorage,
    STORAGE_KEYS,
} from "../../services/storageService";
import { getTenantContextForStorage } from "../../services/tenantContextService";

const DB_KEY = STORAGE_KEYS.ERP_DB;

/* =========================================================
   HELPERS
========================================================= */

const uid = () =>
    Date.now() +
    Math.floor(
        Math.random() * 1000
    );

const safeArray = (value) =>
    Array.isArray(value)
        ? value
        : [];

const getDB = () => {

    try {

        const tenantContext = getTenantContextForStorage();
        return getTenantStorage(DB_KEY, tenantContext, {}) || {};

    } catch {

        return {};
    }
};

const saveDB = (db) => {

    const tenantContext = getTenantContextForStorage();
    setTenantStorage(DB_KEY, db, tenantContext);
};

const defaultTransport = {

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
};

/* =========================================================
   MAIN SERVICE
========================================================= */

export const transportService = {

    /* =====================================
       GET FULL TRANSPORT DB
    ===================================== */

    get: () => {

        const db = getDB();

        return {

            ...defaultTransport,

            ...(db.transport || {}),

            routes: safeArray(
                db.transport?.routes
            ),

            vehicles: safeArray(
                db.transport?.vehicles
            ),

            drivers: safeArray(
                db.transport?.drivers
            ),

            mappings: safeArray(
                db.transport?.mappings
            ),
        };
    },

    /* =====================================
       SAVE FULL TRANSPORT DB
    ===================================== */

    save: (transportData) => {

        const db = getDB();

        db.transport = transportData;

        saveDB(db);
    },

    /* =====================================
       RESET
    ===================================== */

    reset: () => {

        const db = getDB();

        db.transport =
            defaultTransport;

        saveDB(db);
    },

    /* =====================================
       ROUTES
    ===================================== */

    getRoutes: () => {

        return transportService
            .get()
            .routes;
    },

    getRouteById: (routeId) => {

        return transportService
            .getRoutes()
            .find(
                (route) =>
                    String(route.id) ===
                    String(routeId)
            );
    },

    createRoute: ({
        routeNo = "",
        routeName = "",
        fareType = "fixed",
        fixedFare = 0,
        vehicleNumber = "",
        vehicleType = "Bus",
        driverName = "",
        driverPhone = "",
        gpsEnabled = false,
        liveTrackingEnabled = false,
        active = true,
        points = [],
    }) => {

        const transport =
            transportService.get();

        const exists =
            transport.routes.find(
                (route) =>
                    String(
                        route.routeNo
                    ) ===
                    String(routeNo)
            );

        if (exists) {

            throw new Error(
                "Duplicate Route Number"
            );
        }

        const route = {

            id: uid(),

            routeNo,

            routeName,

            fareType,

            fixedFare:
                Number(fixedFare),

            vehicleNumber,

            vehicleType,

            driverName,

            driverPhone,

            gpsEnabled,

            liveTrackingEnabled,

            active,

            pickupPoints:
                safeArray(points).map(
                    (point) => ({

                        id: uid(),

                        pickupPointName:
                            point.name ||
                            point.pointName ||
                            point.pickupPointName ||
                            "",

                        routeFee: Number(
                            point.fare ||
                            point.fee ||
                            point.routeFee ||
                            0
                        ),

                        pickupTime:
                            point.pickup ||
                            point.pickupTime ||
                            "",

                        dropTime:
                            point.drop ||
                            point.dropTime ||
                            "",
                    })
                ),

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString(),
        };

        transport.routes.push(route);

        transportService.save(
            transport
        );

        return route;
    },

    updateRoute: (
        routeId,
        updatedData = {}
    ) => {

        const transport =
            transportService.get();

        transport.routes =
            transport.routes.map(
                (route) =>

                    String(route.id) ===
                        String(routeId)

                        ? {

                            ...route,

                            ...updatedData,

                            updatedAt:
                                new Date().toISOString(),
                        }

                        : route
            );

        transportService.save(
            transport
        );
    },

    deleteRoute: (routeId) => {

        const transport =
            transportService.get();

        transport.routes =
            transport.routes.filter(
                (route) =>
                    String(route.id) !==
                    String(routeId)
            );

        transportService.save(
            transport
        );
    },

    /* =====================================
       POINT HELPERS
    ===================================== */

    getPointById: (
        routeId,
        pointId
    ) => {

        const route =
            transportService.getRouteById(
                routeId
            );

        if (!route) {
            return null;
        }

        return (
            route.pickupPoints || route.points || []
        ).find(
            (point) =>
                String(point.id) ===
                String(pointId)
        );
    },
};
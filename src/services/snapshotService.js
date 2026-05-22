// src/modules/students/services/snapshotService.js

const SNAPSHOT_VERSION = 1;

const DEFAULT_CURRENCY_PRECISION = 2;

const safeArray = (value) => (Array.isArray(value) ? value : []);

const safeObject = (value) =>
    value && typeof value === "object" && !Array.isArray(value)
        ? value
        : {};

export const createTimestamp = () => new Date().toISOString();

export const normalizeCurrency = (value = 0) => {
    const parsed = Number(value || 0);

    if (Number.isNaN(parsed)) return 0;

    return Number(parsed.toFixed(DEFAULT_CURRENCY_PRECISION));
};

export const cloneSafe = (data) => {
    try {
        return structuredClone(data);
    } catch (error) {
        return JSON.parse(JSON.stringify(data));
    }
};

export const deepFreezeSnapshot = (object) => {
    if (!object || typeof object !== "object") {
        return object;
    }

    Object.keys(object).forEach((key) => {
        const value = object[key];

        if (
            value &&
            typeof value === "object" &&
            !Object.isFrozen(value)
        ) {
            deepFreezeSnapshot(value);
        }
    });

    return Object.freeze(object);
};

export const sanitizeSnapshotData = (data) => {
    if (Array.isArray(data)) {
        return data.map((item) => sanitizeSnapshotData(item));
    }

    if (data && typeof data === "object") {
        return Object.keys(data).reduce((acc, key) => {
            const value = data[key];

            if (typeof value !== "function" && value !== undefined) {
                acc[key] = sanitizeSnapshotData(value);
            }

            return acc;
        }, {});
    }

    return data;
};

export const generateSnapshotId = (type = "snapshot") => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);

    return `${type}_${timestamp}_${random}`;
};

const buildAuditBlock = (audit = {}) => ({
    createdBy: audit.createdBy || "system",
    updatedBy: audit.updatedBy || "system",
    updatedAt: audit.updatedAt || createTimestamp(),
    source: audit.source || "erp",
    changeReason: audit.changeReason || "record_sync",
    recordVersion: audit.recordVersion || SNAPSHOT_VERSION,
});

const freezeSnapshot = (snapshot) => {
    const sanitized = sanitizeSnapshotData(snapshot);
    const cloned = cloneSafe(sanitized);

    return deepFreezeSnapshot(cloned);
};

export const createFeeSnapshot = ({
    generatedBy = "system",
    classInfo = {},
    feeStructure = {},
    transportFees = {},
    hostelFees = {},
    concessions = [],
    scholarships = [],
    totals = {},
    installments = [],
    dueSchedule = [],
    audit = {},
} = {}) => {
    const snapshot = {
        snapshotId: generateSnapshotId("fee"),
        snapshotType: "fee",
        version: SNAPSHOT_VERSION,
        generatedAt: createTimestamp(),
        generatedBy,

        classId: classInfo.id || null,
        className: classInfo.name || "",

        feeStructure: {
            admissionFee: normalizeCurrency(
                feeStructure.admissionFee
            ),
            annualFee: normalizeCurrency(
                feeStructure.annualFee
            ),
            tuitionFee: normalizeCurrency(
                feeStructure.tuitionFee
            ),
            examFee: normalizeCurrency(
                feeStructure.examFee
            ),
            smartClassFee: normalizeCurrency(
                feeStructure.smartClassFee
            ),
            miscellaneousFee: normalizeCurrency(
                feeStructure.miscellaneousFee
            ),
            monthlyFee: normalizeCurrency(
                feeStructure.monthlyFee
            ),
            feeCategories: safeArray(
                feeStructure.feeCategories
            ),
        },

        transportFees: {
            enabled: !!transportFees.enabled,
            monthlyFee: normalizeCurrency(
                transportFees.monthlyFee
            ),
            yearlyFee: normalizeCurrency(
                transportFees.yearlyFee
            ),
            routeName: transportFees.routeName || "",
            pickupPointName:
                transportFees.pickupPointName || "",
        },

        hostelFees: {
            enabled: !!hostelFees.enabled,
            monthlyFee: normalizeCurrency(
                hostelFees.monthlyFee
            ),
            yearlyFee: normalizeCurrency(
                hostelFees.yearlyFee
            ),
            hostelName: hostelFees.hostelName || "",
            roomNumber: hostelFees.roomNumber || "",
        },

        concessions: safeArray(concessions).map((item) => ({
            ...item,
            amount: normalizeCurrency(item.amount),
        })),

        scholarships: safeArray(scholarships).map((item) => ({
            ...item,
            amount: normalizeCurrency(item.amount),
        })),

        totals: {
            grossAmount: normalizeCurrency(
                totals.grossAmount
            ),
            discountAmount: normalizeCurrency(
                totals.discountAmount
            ),
            concessionAmount: normalizeCurrency(
                totals.concessionAmount
            ),
            scholarshipAmount: normalizeCurrency(
                totals.scholarshipAmount
            ),
            transportAmount: normalizeCurrency(
                totals.transportAmount
            ),
            hostelAmount: normalizeCurrency(
                totals.hostelAmount
            ),
            lateFeeAmount: normalizeCurrency(
                totals.lateFeeAmount
            ),
            payableAmount: normalizeCurrency(
                totals.payableAmount
            ),
        },

        installments: safeArray(installments),

        dueSchedule: safeArray(dueSchedule),

        audit: buildAuditBlock(audit),
    };

    return freezeSnapshot(snapshot);
};

export const createTransportSnapshot = ({
    route = {},
    pickupPoint = {},
    monthlyFee = 0,
    vehicle = {},
    driver = {},
    effectiveFrom = null,
    audit = {},
} = {}) => {
    const snapshot = {
        snapshotId: generateSnapshotId("transport"),
        snapshotType: "transport",
        version: SNAPSHOT_VERSION,
        generatedAt: createTimestamp(),

        routeId: route.id || null,
        routeName: route.name || "",

        pickupPointId: pickupPoint.id || null,
        pickupPointName: pickupPoint.name || "",

        monthlyFee: normalizeCurrency(monthlyFee),

        vehicle: {
            id: vehicle.id || null,
            number: vehicle.number || "",
            type: vehicle.type || "",
        },

        driver: {
            id: driver.id || null,
            name: driver.name || "",
            phone: driver.phone || "",
        },

        effectiveFrom:
            effectiveFrom || createTimestamp(),

        audit: buildAuditBlock(audit),
    };

    return freezeSnapshot(snapshot);
};

export const createHostelSnapshot = ({
    hostel = {},
    room = {},
    bed = {},
    monthlyFee = 0,
    effectiveFrom = null,
    audit = {},
} = {}) => {
    const snapshot = {
        snapshotId: generateSnapshotId("hostel"),
        snapshotType: "hostel",
        version: SNAPSHOT_VERSION,
        generatedAt: createTimestamp(),

        hostelId: hostel.id || null,
        hostelName: hostel.name || "",

        roomId: room.id || null,
        roomNumber: room.number || "",

        bedNumber: bed.number || "",

        monthlyFee: normalizeCurrency(monthlyFee),

        effectiveFrom:
            effectiveFrom || createTimestamp(),

        audit: buildAuditBlock(audit),
    };

    return freezeSnapshot(snapshot);
};

export const createBillingSnapshot = ({
    feeSnapshot = null,
    transportSnapshot = null,
    hostelSnapshot = null,
    finalPayable = 0,
    billingVersion = 1,
} = {}) => {
    const snapshot = {
        snapshotId: generateSnapshotId("billing"),
        snapshotType: "billing",
        generatedAt: createTimestamp(),

        billingVersion,

        feeSnapshot,

        transportSnapshot,

        hostelSnapshot,

        finalPayable: normalizeCurrency(
            finalPayable
        ),
    };

    return freezeSnapshot(snapshot);
};

export const createStudentAuditSnapshot = ({
    createdBy = "system",
    updatedBy = "system",
    source = "erp",
    changeReason = "record_update",
    recordVersion = SNAPSHOT_VERSION,
} = {}) => {
    const snapshot = {
        snapshotId: generateSnapshotId("audit"),
        snapshotType: "audit",
        generatedAt: createTimestamp(),

        createdBy,
        updatedBy,

        updatedAt: createTimestamp(),

        source,
        changeReason,
        recordVersion,
    };

    return freezeSnapshot(snapshot);
};

export const snapshotService = {
    createTimestamp,
    normalizeCurrency,
    cloneSafe,
    deepFreezeSnapshot,
    sanitizeSnapshotData,
    generateSnapshotId,
    createFeeSnapshot,
    createTransportSnapshot,
    createHostelSnapshot,
    createBillingSnapshot,
    createStudentAuditSnapshot,
};

export default snapshotService;
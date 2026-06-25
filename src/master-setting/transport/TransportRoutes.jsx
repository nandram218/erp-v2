import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// FIXED: Import master-setting transport service directly
import { transportService } from "./transportService";

export default function TransportRoutes() {

    const navigate = useNavigate();

    const [store, setStore] =
        useState(transportService.get());

    const emptyPoint = () => ({
        name: "",
        fare: "",
        pickup: "",
        drop: "",
    });

    const emptyPoints = () => [
        emptyPoint(),
        emptyPoint(),
        emptyPoint(),
    ];

    const [selectedRoute, setSelectedRoute] =
        useState("");

    const [routeNo, setRouteNo] =
        useState("");

    const [customRoute, setCustomRoute] =
        useState("");

    const [routeName, setRouteName] =
        useState("");

    const [fareType, setFareType] =
        useState("fixed");

    const [fixedFare, setFixedFare] =
        useState("");

    const [routeStatus, setRouteStatus] =
        useState("active");

    const [routeNote, setRouteNote] =
        useState("");

    const [points, setPoints] =
        useState(emptyPoints());

    /* =========================================
       STATS
    ========================================= */

    const stats = useMemo(() => {

        const routes =
            store.routes || [];

        const totalRoutes =
            routes.length;

        const totalPoints =
            routes.reduce(
                (acc, r) =>
                    acc + (r.pickupPoints?.length || r.points?.length || 0),
                0
            );

        const activeRoutes =
            routes.filter(
                (r) => r.active !== false
            ).length;

        return {
            totalRoutes,
            totalPoints,
            activeRoutes,
        };

    }, [store]);

    /* =========================================
       RESET
    ========================================= */

    const resetForm = () => {

        setSelectedRoute("");

        setRouteNo("");

        setCustomRoute("");

        setRouteName("");

        setFareType("fixed");

        setFixedFare("");

        setRouteStatus("active");

        setRouteNote("");

        setPoints(emptyPoints());
    };

    /* =========================================
       AUTO LOAD
    ========================================= */

    const handleSelectRoute = (val) => {

        setSelectedRoute(val);

        const route =
            store.routes.find(
                (r) => r.routeNo === val
            );

        if (!route) return;

        setRouteNo(
            route.routeNo.replace("R", "")
        );

        setRouteName(route.routeName || "");

        setFareType(
            route.fareType || "fixed"
        );

        setFixedFare(
            route.fixedFare || ""
        );

        setRouteStatus(
            route.active !== false ? "active" : "inactive"
        );

        setFixedFare(
            route.monthlyFee || route.fixedFare || ""
        );

        const mappedPoints =
            route.pickupPoints?.length || route.points?.length
                ? (route.pickupPoints || route.points).map((p) => ({
                    name:
                        p.pickupPointName || p.pointName || p.name || "",
                    fare:
                        p.routeFee || p.fee || "",
                    pickup:
                        p.pickupTime || "",
                    drop:
                        p.dropTime || "",
                }))
                : emptyPoints();

        setPoints(mappedPoints);
    };

    /* =========================================
       SAVE
    ========================================= */

    const saveRoute = () => {

        const finalNo =
            routeNo === "custom"
                ? customRoute
                : routeNo;

        const finalRoute =
            `R${finalNo}`;

        if (!finalNo || !routeName) {
            return alert(
                "⚠ Route No & Route Name required"
            );
        }

        if (
            store.routes.find(
                (r) => r.routeNo === finalRoute
            )
        ) {
            return alert(
                "❌ Duplicate Route"
            );
        }

        try {

            transportService.createRoute({
                routeNo: finalRoute,
                routeName,
                vehicleNumber: "",
                vehicleType: "Bus",
                driverName: "",
                driverPhone: "",
                fixedFare:
                    fareType === "fixed"
                        ? Number(fixedFare)
                        : 0,
                points:
                    points.filter(
                        (p) => p.name
                    ).map((p) => ({
                        name: p.name,
                        fare: Number(p.fare || 0),
                        pickup: p.pickup || "",
                        drop: p.drop || "",
                    })),
                gpsEnabled: false,
                liveTrackingEnabled: false,
                active: routeStatus === "active",
            });

            const fresh =
                transportService.get();

            setStore(fresh);

            alert("✅ Route Saved");

            resetForm();

        } catch (err) {

            alert(err.message);
        }
    };

    /* =========================================
       UPDATE
    ========================================= */

    const updateRoute = () => {

        if (!selectedRoute) {
            return alert(
                "⚠ Select Route"
            );
        }

        if (
            !window.confirm(
                "Update this route?"
            )
        ) {
            return;
        }

        const updatedRoutes =
            store.routes.map((r) => {

                if (
                    r.routeNo !== selectedRoute
                ) {
                    return r;
                }

                return {

                    ...r,

                    routeName,

                    fareType,

                    fixedFare:
                        fareType === "fixed"
                            ? Number(fixedFare)
                            : 0,

                    status: routeStatus,

                    note: routeNote,

                    updatedAt:
                        new Date().toISOString(),

                    pickupPoints:
                        points
                            .filter(
                                (p) => p.name
                            )
                            .map((p, index) => ({

                                id:
                                    r.pickupPoints?.[index]?.id || r.points?.[index]?.id ||
                                    Date.now() + index,

                                pickupPointName:
                                    p.name,

                                routeFee:
                                    Number(
                                        p.fare || 0
                                    ),

                                pickupTime:
                                    p.pickup || "",

                                dropTime:
                                    p.drop || "",
                            })),
                };
            });

        const updatedDB = {

            ...store,

            routes: updatedRoutes,
        };

        transportService.save(updatedDB);

        setStore(updatedDB);

        alert("✏ Route Updated");

        resetForm();
    };

    /* =========================================
       DELETE
    ========================================= */

    const deleteRoute = () => {

        if (!selectedRoute) {
            return alert(
                "⚠ Select Route"
            );
        }

        if (
            !window.confirm(
                "Delete this route?"
            )
        ) {
            return;
        }

        const updatedDB = {

            ...store,

            routes:
                store.routes.filter(
                    (r) =>
                        r.routeNo !==
                        selectedRoute
                ),

            mappings:
                store.mappings.filter(
                    (m) =>
                        m.route !==
                        selectedRoute
                ),
        };

        transportService.save(updatedDB);

        setStore(updatedDB);

        alert("🗑 Route Deleted");

        resetForm();
    };

    /* =========================================
       POINT HANDLER
    ========================================= */

    const handlePoint = (
        index,
        field,
        value
    ) => {

        const updated = [...points];

        updated[index] = {
            ...updated[index],
            [field]: value,
        };

        setPoints(updated);
    };

    const addPoint = () => {

        setPoints([
            ...points,
            emptyPoint(),
        ]);
    };

    const removePoint = (index) => {

        if (points.length <= 1) return;

        const updated =
            points.filter(
                (_, i) => i !== index
            );

        setPoints(updated);
    };

    return (
        <div style={styles.page}>

            {/* TOP BAR */}

            <div style={styles.topBar}>

                <div>
                    <h1 style={styles.title}>
                        🚍 Transport Route Management
                    </h1>

                    <div style={styles.subtitle}>
                        Professional ERP Transport Control
                    </div>
                </div>

                <div style={styles.topActions}>

                    <button
                        style={styles.secondaryBtn}
                        onClick={() =>
                            navigate("/master-setting/transport")
                        }
                    >
                        ⬅ Back
                    </button>

                    <button
                        style={styles.primaryBtn}
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        🏠 Dashboard
                    </button>
                </div>
            </div>

            {/* STATS */}

            <div style={styles.statsGrid}>

                <div style={styles.statCard}>
                    <div style={styles.statValue}>
                        {stats.totalRoutes}
                    </div>

                    <div style={styles.statLabel}>
                        Total Routes
                    </div>
                </div>

                <div style={styles.statCard}>
                    <div style={styles.statValue}>
                        {stats.totalPoints}
                    </div>

                    <div style={styles.statLabel}>
                        Pickup Points
                    </div>
                </div>

                <div style={styles.statCard}>
                    <div style={styles.statValue}>
                        {stats.activeRoutes}
                    </div>

                    <div style={styles.statLabel}>
                        Active Routes
                    </div>
                </div>

            </div>

            {/* FORM */}

            <div style={styles.card}>

                <div style={styles.sectionHeader}>
                    🛣 Route Builder
                </div>

                <div style={styles.grid4}>

                    <div>
                        <label style={styles.label}>
                            Route Number
                        </label>

                        <select
                            style={styles.input}
                            value={routeNo}
                            onChange={(e) =>
                                setRouteNo(
                                    e.target.value
                                )
                            }
                        >
                            <option value="">
                                Select
                            </option>

                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                <option
                                    key={n}
                                    value={n}
                                >
                                    R{n}
                                </option>
                            ))}

                            <option value="custom">
                                Custom
                            </option>
                        </select>
                    </div>

                    <div>
                        <label style={styles.label}>
                            Route Name
                        </label>

                        <input
                            style={styles.input}
                            placeholder="Talwandi Route"
                            value={routeName}
                            onChange={(e) =>
                                setRouteName(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div>
                        <label style={styles.label}>
                            Fare Type
                        </label>

                        <select
                            style={styles.input}
                            value={fareType}
                            onChange={(e) =>
                                setFareType(
                                    e.target.value
                                )
                            }
                        >
                            <option value="fixed">
                                Fixed Fare
                            </option>

                            <option value="point">
                                Point Wise
                            </option>
                        </select>
                    </div>

                    <div>
                        <label style={styles.label}>
                            Route Status
                        </label>

                        <select
                            style={styles.input}
                            value={routeStatus}
                            onChange={(e) =>
                                setRouteStatus(
                                    e.target.value
                                )
                            }
                        >
                            <option value="active">
                                Active
                            </option>

                            <option value="inactive">
                                Inactive
                            </option>
                        </select>
                    </div>
                </div>

                {routeNo === "custom" && (

                    <div style={{ marginTop: 16 }}>
                        <label style={styles.label}>
                            Custom Route No
                        </label>

                        <input
                            style={styles.input}
                            value={customRoute}
                            onChange={(e) =>
                                setCustomRoute(
                                    e.target.value
                                )
                            }
                        />
                    </div>
                )}

                {fareType === "fixed" && (

                    <div style={{ marginTop: 16 }}>
                        <label style={styles.label}>
                            Fixed Fare
                        </label>

                        <input
                            style={styles.input}
                            placeholder="1200"
                            value={fixedFare}
                            onChange={(e) =>
                                setFixedFare(
                                    e.target.value
                                )
                            }
                        />
                    </div>
                )}

                <div style={{ marginTop: 16 }}>
                    <label style={styles.label}>
                        Route Notes
                    </label>

                    <textarea
                        style={styles.textarea}
                        placeholder="Special notes..."
                        value={routeNote}
                        onChange={(e) =>
                            setRouteNote(
                                e.target.value
                            )
                        }
                    />
                </div>

            </div>

            {/* POINT TABLE */}

            <div style={styles.card}>

                <div style={styles.tableHeader}>

                    <div style={styles.sectionHeader}>
                        📍 Pickup Points
                    </div>

                    <button
                        style={styles.primaryBtn}
                        onClick={addPoint}
                    >
                        ➕ Add Point
                    </button>
                </div>

                <div style={styles.tableWrapper}>

                    <table style={styles.table}>

                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Point</th>
                                <th>Fare</th>
                                <th>Pickup</th>
                                <th>Drop</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {points.map((p, index) => (

                                <tr key={index}>

                                    <td>
                                        {index + 1}
                                    </td>

                                    <td>
                                        <input
                                            style={styles.tableInput}
                                            value={p.name}
                                            onChange={(e) =>
                                                handlePoint(
                                                    index,
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </td>

                                    <td>
                                        <input
                                            style={styles.tableInput}
                                            value={p.fare}
                                            disabled={
                                                fareType === "fixed"
                                            }
                                            onChange={(e) =>
                                                handlePoint(
                                                    index,
                                                    "fare",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </td>

                                    <td>
                                        <input
                                            style={styles.tableInput}
                                            value={p.pickup}
                                            onChange={(e) =>
                                                handlePoint(
                                                    index,
                                                    "pickup",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </td>

                                    <td>
                                        <input
                                            style={styles.tableInput}
                                            value={p.drop}
                                            onChange={(e) =>
                                                handlePoint(
                                                    index,
                                                    "drop",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </td>

                                    <td>
                                        <button
                                            style={styles.deleteBtn}
                                            onClick={() =>
                                                removePoint(index)
                                            }
                                        >
                                            ✖
                                        </button>
                                    </td>

                                </tr>
                            ))}

                        </tbody>

                    </table>
                </div>
            </div>

            {/* ACTIONS */}

            <div style={styles.actionBar}>

                <button
                    style={styles.successBtn}
                    onClick={saveRoute}
                >
                    💾 Save Route
                </button>

                <select
                    style={styles.routeSelect}
                    value={selectedRoute}
                    onChange={(e) =>
                        handleSelectRoute(
                            e.target.value
                        )
                    }
                >
                    <option value="">
                        Select Route
                    </option>

                    {store.routes.map((r) => (

                        <option
                            key={r.routeNo}
                            value={r.routeNo}
                        >
                            {r.routeNo} - {r.routeName}
                        </option>
                    ))}
                </select>

                <button
                    style={styles.primaryBtn}
                    onClick={updateRoute}
                >
                    ✏ Update
                </button>

                <button
                    style={styles.dangerBtn}
                    onClick={deleteRoute}
                >
                    🗑 Delete
                </button>

            </div>

            {/* PREVIEW */}

            <div style={styles.previewGrid}>

                {store.routes.map((r) => (

                    <div
                        key={r.routeNo}
                        style={{
                            ...styles.routeCard,

                            border:
                                selectedRoute === r.routeNo
                                    ? "2px solid #3b82f6"
                                    : "1px solid #334155",
                        }}
                    >

                        <div style={styles.routeTop}>

                            <div>

                                <div style={styles.routeNo}>
                                    {r.routeNo}
                                </div>

                                <div style={styles.routeName}>
                                    {r.routeName}
                                </div>

                            </div>

                            <div
                                style={{
                                    ...styles.statusBadge,

                                    background:
                                        r.status === "inactive"
                                            ? "#991b1b"
                                            : "#166534",
                                }}
                            >
                                {r.status || "active"}
                            </div>
                        </div>

                        <div style={styles.routeMeta}>
                            🚏 {r.pickupPoints?.length || r.points?.length || 0} Points
                        </div>

                        {r.fareType === "fixed" && (
                            <div style={styles.routeMeta}>
                                💰 Fixed Fare :
                                ₹ {r.fixedFare}
                            </div>
                        )}

                        <div style={styles.pointList}>

                            {(r.pickupPoints || r.points)?.map((p) => (

                                <div
                                    key={p.id}
                                    style={styles.pointItem}
                                >
                                    <div>
                                        <b>
                                            {p.pickupPointName || p.pointName}
                                        </b>
                                    </div>

                                    <div>
                                        ₹ {p.routeFee || p.fee}
                                    </div>

                                    <div>
                                        {p.pickupTime}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                ))}

            </div>

        </div>
    );
}

const styles = {

    page: {
        background: "#0f172a",
        minHeight: "100vh",
        padding: 24,
        color: "#fff",
    },

    topBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        flexWrap: "wrap",
        gap: 16,
    },

    title: {
        margin: 0,
        fontSize: 30,
        fontWeight: 700,
    },

    subtitle: {
        color: "#94a3b8",
        marginTop: 4,
    },

    topActions: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
    },

    statsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
        gap: 16,
        marginBottom: 24,
    },

    statCard: {
        background: "#1e293b",
        borderRadius: 16,
        padding: 20,
        border: "1px solid #334155",
    },

    statValue: {
        fontSize: 32,
        fontWeight: 700,
    },

    statLabel: {
        color: "#94a3b8",
        marginTop: 6,
    },

    card: {
        background: "#1e293b",
        borderRadius: 18,
        padding: 20,
        marginBottom: 24,
        border: "1px solid #334155",
    },

    sectionHeader: {
        fontSize: 22,
        fontWeight: 700,
        marginBottom: 20,
    },

    grid4: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
        gap: 16,
    },

    label: {
        display: "block",
        marginBottom: 8,
        color: "#cbd5e1",
    },

    input: {
        width: "100%",
        padding: 12,
        borderRadius: 10,
        border: "1px solid #334155",
        background: "#0f172a",
        color: "#fff",
        boxSizing: "border-box",
    },

    textarea: {
        width: "100%",
        minHeight: 100,
        padding: 12,
        borderRadius: 10,
        border: "1px solid #334155",
        background: "#0f172a",
        color: "#fff",
        boxSizing: "border-box",
    },

    tableHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        flexWrap: "wrap",
        gap: 12,
    },

    tableWrapper: {
        overflowX: "auto",
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
    },

    tableInput: {
        width: "100%",
        padding: 10,
        borderRadius: 8,
        border: "1px solid #334155",
        background: "#0f172a",
        color: "#fff",
        boxSizing: "border-box",
    },

    actionBar: {
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 24,
    },

    routeSelect: {
        minWidth: 250,
        padding: 12,
        borderRadius: 10,
        border: "1px solid #334155",
        background: "#1e293b",
        color: "#fff",
    },

    previewGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit,minmax(320px,1fr))",
        gap: 18,
    },

    routeCard: {
        background: "#1e293b",
        borderRadius: 18,
        padding: 18,
    },

    routeTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },

    routeNo: {
        fontSize: 24,
        fontWeight: 700,
    },

    routeName: {
        color: "#cbd5e1",
        marginTop: 4,
    },

    routeMeta: {
        marginTop: 10,
        color: "#94a3b8",
    },

    pointList: {
        marginTop: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
    },

    pointItem: {
        background: "#0f172a",
        padding: 12,
        borderRadius: 12,
        border: "1px solid #334155",
    },

    statusBadge: {
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 12,
        textTransform: "uppercase",
    },

    primaryBtn: {
        background: "#2563eb",
        color: "#fff",
        border: "none",
        padding: "12px 18px",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: 600,
    },

    successBtn: {
        background: "#16a34a",
        color: "#fff",
        border: "none",
        padding: "12px 18px",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: 600,
    },

    dangerBtn: {
        background: "#dc2626",
        color: "#fff",
        border: "none",
        padding: "12px 18px",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: 600,
    },

    secondaryBtn: {
        background: "#475569",
        color: "#fff",
        border: "none",
        padding: "12px 18px",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: 600,
    },

    deleteBtn: {
        background: "#dc2626",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "10px 12px",
        cursor: "pointer",
    },
};
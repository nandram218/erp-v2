import React, { useMemo, useState } from "react";
import { transportService } from "./transportService";
import { useNavigate } from "react-router-dom";

export default function TransportSettings() {

    const navigate = useNavigate();

    const [store, setStore] =
        useState(transportService.get());

    const refreshStore = () => {
        setStore(transportService.get());
    };

    /* =========================================
       VEHICLE
    ========================================= */

    const emptyVehicle = {

        name: "",

        number: "",

        type: "Bus",

        capacity: "",

        owner: "School",

        gps: false,

        attendant: "",

        insuranceExpiry: "",

        pollutionExpiry: "",

        permitExpiry: "",

        status: "active",
    };

    const [vehicle, setVehicle] =
        useState(emptyVehicle);

    const [editVehicleId, setEditVehicleId] =
        useState(null);

    /* =========================================
       DRIVER
    ========================================= */

    const emptyDriver = {

        name: "",

        phone: "",

        alternatePhone: "",

        license: "",

        licenseExpiry: "",

        address: "",

        emergency: "",

        joiningDate: "",

        experience: "",

        bloodGroup: "",

        status: "active",
    };

    const [driver, setDriver] =
        useState(emptyDriver);

    const [editDriverId, setEditDriverId] =
        useState(null);

    /* =========================================
       MAPPING
    ========================================= */

    const [selectedRoute, setSelectedRoute] =
        useState("");

    const [selectedVehicle, setSelectedVehicle] =
        useState("");

    const [selectedDriver, setSelectedDriver] =
        useState("");

    /* =========================================
       STATS
    ========================================= */

    const stats = useMemo(() => {

        return {

            totalVehicles:
                store.vehicles?.length || 0,

            activeVehicles:
                store.vehicles?.filter(
                    (v) => v.status !== "inactive"
                ).length || 0,

            totalDrivers:
                store.drivers?.length || 0,

            activeDrivers:
                store.drivers?.filter(
                    (d) => d.status !== "inactive"
                ).length || 0,

            mappedRoutes:
                store.mappings?.length || 0,
        };

    }, [store]);

    /* =========================================
       SAVE VEHICLE
    ========================================= */

    const saveVehicle = () => {

        if (
            !vehicle.name ||
            !vehicle.number
        ) {
            return alert(
                "⚠ Vehicle Name & Number required"
            );
        }

        let updated;

        if (editVehicleId) {

            updated = {

                ...store,

                vehicles:
                    store.vehicles.map((v) =>

                        v.number === editVehicleId
                            ? {
                                ...vehicle,
                                updatedAt:
                                    new Date().toISOString(),
                            }
                            : v
                    ),
            };

        } else {

            if (
                store.vehicles.find(
                    (v) =>
                        v.number === vehicle.number
                )
            ) {
                return alert(
                    "❌ Duplicate Vehicle"
                );
            }

            updated = {

                ...store,

                vehicles: [

                    ...store.vehicles,

                    {
                        ...vehicle,

                        id: Date.now(),

                        createdAt:
                            new Date().toISOString(),
                    },
                ],
            };
        }

        transportService.save(updated);

        setStore(updated);

        setVehicle(emptyVehicle);

        setEditVehicleId(null);

        alert("✅ Vehicle Saved");
    };

    /* =========================================
       DELETE VEHICLE
    ========================================= */

    const deleteVehicle = (number) => {

        if (
            !window.confirm(
                "Delete vehicle?"
            )
        ) {
            return;
        }

        const updated = {

            ...store,

            vehicles:
                store.vehicles.filter(
                    (v) =>
                        v.number !== number
                ),

            mappings:
                store.mappings.filter(
                    (m) =>
                        m.vehicle !== number
                ),
        };

        transportService.save(updated);

        setStore(updated);
    };

    /* =========================================
       SAVE DRIVER
    ========================================= */

    const saveDriver = () => {

        if (
            !driver.name ||
            !driver.phone
        ) {
            return alert(
                "⚠ Driver Name & Mobile required"
            );
        }

        let updated;

        if (editDriverId) {

            updated = {

                ...store,

                drivers:
                    store.drivers.map((d) =>

                        d.phone === editDriverId
                            ? {
                                ...driver,
                                updatedAt:
                                    new Date().toISOString(),
                            }
                            : d
                    ),
            };

        } else {

            if (
                store.drivers.find(
                    (d) =>
                        d.phone === driver.phone
                )
            ) {
                return alert(
                    "❌ Duplicate Driver"
                );
            }

            updated = {

                ...store,

                drivers: [

                    ...store.drivers,

                    {
                        ...driver,

                        id: Date.now(),

                        createdAt:
                            new Date().toISOString(),
                    },
                ],
            };
        }

        transportService.save(updated);

        setStore(updated);

        setDriver(emptyDriver);

        setEditDriverId(null);

        alert("✅ Driver Saved");
    };

    /* =========================================
       DELETE DRIVER
    ========================================= */

    const deleteDriver = (phone) => {

        if (
            !window.confirm(
                "Delete driver?"
            )
        ) {
            return;
        }

        const updated = {

            ...store,

            drivers:
                store.drivers.filter(
                    (d) =>
                        d.phone !== phone
                ),

            mappings:
                store.mappings.filter(
                    (m) =>
                        m.driver !== phone
                ),
        };

        transportService.save(updated);

        setStore(updated);
    };

    /* =========================================
       SAVE MAPPING
    ========================================= */

    const saveMapping = () => {

        if (
            !selectedRoute ||
            !selectedVehicle ||
            !selectedDriver
        ) {
            return alert(
                "⚠ Select Route, Vehicle & Driver"
            );
        }

        const exists =
            store.mappings.find(
                (m) =>
                    m.route === selectedRoute
            );

        const mapping = {

            route: selectedRoute,

            vehicle: selectedVehicle,

            driver: selectedDriver,

            updatedAt:
                new Date().toISOString(),
        };

        const updated = exists

            ? {

                ...store,

                mappings:
                    store.mappings.map((m) =>

                        m.route === selectedRoute
                            ? mapping
                            : m
                    ),
            }

            : {

                ...store,

                mappings: [

                    ...store.mappings,

                    mapping,
                ],
            };

        transportService.save(updated);

        setStore(updated);

        alert("✅ Route Mapping Saved");
    };

    /* =========================================
       DELETE MAPPING
    ========================================= */

    const deleteMapping = (route) => {

        const updated = {

            ...store,

            mappings:
                store.mappings.filter(
                    (m) =>
                        m.route !== route
                ),
        };

        transportService.save(updated);

        setStore(updated);
    };

    /* =========================================
       HELPERS
    ========================================= */

    const getRoute = (r) =>
        store.routes.find(
            (x) => x.routeNo === r
        );

    const getVehicle = (num) =>
        store.vehicles.find(
            (v) => v.number === num
        );

    const getDriver = (ph) =>
        store.drivers.find(
            (d) => d.phone === ph
        );

    return (
        <div style={styles.page}>

            {/* TOP */}

            <div style={styles.topBar}>

                <div>

                    <h1 style={styles.title}>
                        🚐 Transport Operations Setup
                    </h1>

                    <div style={styles.subtitle}>
                        Vehicle + Driver + Route Mapping ERP
                    </div>

                </div>

                <div style={styles.topActions}>

                    <button
                        style={styles.secondaryBtn}
                        onClick={() =>
                            navigate("/master-setting")
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

                    <button
                        style={styles.primaryBtn}
                        onClick={() =>
                            navigate("/master-setting/transport/routes")
                        }
                    >
                        🛣 Routes
                    </button>

                </div>

            </div>

            {/* STATS */}

            <div style={styles.statsGrid}>

                <div style={styles.statCard}>
                    <div style={styles.statValue}>
                        {stats.totalVehicles}
                    </div>

                    <div style={styles.statLabel}>
                        Vehicles
                    </div>
                </div>

                <div style={styles.statCard}>
                    <div style={styles.statValue}>
                        {stats.totalDrivers}
                    </div>

                    <div style={styles.statLabel}>
                        Drivers
                    </div>
                </div>

                <div style={styles.statCard}>
                    <div style={styles.statValue}>
                        {stats.mappedRoutes}
                    </div>

                    <div style={styles.statLabel}>
                        Route Mappings
                    </div>
                </div>

            </div>

            {/* VEHICLE */}

            <div style={styles.card}>

                <div style={styles.sectionHeader}>
                    🚐 Vehicle Setup
                </div>

                <div style={styles.grid4}>

                    <input
                        style={styles.input}
                        placeholder="Vehicle Name"
                        value={vehicle.name}
                        onChange={(e) =>
                            setVehicle({
                                ...vehicle,
                                name: e.target.value,
                            })
                        }
                    />

                    <input
                        style={styles.input}
                        placeholder="Vehicle Number"
                        value={vehicle.number}
                        onChange={(e) =>
                            setVehicle({
                                ...vehicle,
                                number: e.target.value,
                            })
                        }
                    />

                    <select
                        style={styles.input}
                        value={vehicle.type}
                        onChange={(e) =>
                            setVehicle({
                                ...vehicle,
                                type: e.target.value,
                            })
                        }
                    >
                        <option>Bus</option>
                        <option>Van</option>
                        <option>Mini Bus</option>
                    </select>

                    <input
                        style={styles.input}
                        placeholder="Capacity"
                        value={vehicle.capacity}
                        onChange={(e) =>
                            setVehicle({
                                ...vehicle,
                                capacity: e.target.value,
                            })
                        }
                    />

                    <input
                        style={styles.input}
                        placeholder="Attendant"
                        value={vehicle.attendant}
                        onChange={(e) =>
                            setVehicle({
                                ...vehicle,
                                attendant: e.target.value,
                            })
                        }
                    />

                    <input
                        style={styles.input}
                        type="date"
                        value={vehicle.insuranceExpiry}
                        onChange={(e) =>
                            setVehicle({
                                ...vehicle,
                                insuranceExpiry:
                                    e.target.value,
                            })
                        }
                    />

                    <input
                        style={styles.input}
                        type="date"
                        value={vehicle.pollutionExpiry}
                        onChange={(e) =>
                            setVehicle({
                                ...vehicle,
                                pollutionExpiry:
                                    e.target.value,
                            })
                        }
                    />

                    <select
                        style={styles.input}
                        value={vehicle.status}
                        onChange={(e) =>
                            setVehicle({
                                ...vehicle,
                                status: e.target.value,
                            })
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

                <div style={styles.actionBar}>

                    <button
                        style={styles.successBtn}
                        onClick={saveVehicle}
                    >
                        💾 Save Vehicle
                    </button>

                    <button
                        style={styles.secondaryBtn}
                        onClick={() => {
                            setVehicle(emptyVehicle);
                            setEditVehicleId(null);
                        }}
                    >
                        Reset
                    </button>

                </div>

                <div style={styles.previewGrid}>

                    {store.vehicles.map((v) => (

                        <div
                            key={v.number}
                            style={styles.previewCard}
                        >

                            <div style={styles.previewTop}>

                                <div>

                                    <div style={styles.previewTitle}>
                                        {v.name}
                                    </div>

                                    <div style={styles.previewSub}>
                                        {v.number}
                                    </div>

                                </div>

                                <div
                                    style={{
                                        ...styles.badge,

                                        background:
                                            v.status === "inactive"
                                                ? "#991b1b"
                                                : "#166534",
                                    }}
                                >
                                    {v.status}
                                </div>

                            </div>

                            <div style={styles.meta}>
                                🚐 {v.type}
                            </div>

                            <div style={styles.meta}>
                                👥 Capacity : {v.capacity}
                            </div>

                            <div style={styles.meta}>
                                👨 Attendant : {v.attendant || "-"}
                            </div>

                            <div style={styles.previewActions}>

                                <button
                                    style={styles.primaryBtn}
                                    onClick={() => {

                                        setVehicle(v);

                                        setEditVehicleId(
                                            v.number
                                        );
                                    }}
                                >
                                    Edit
                                </button>

                                <button
                                    style={styles.dangerBtn}
                                    onClick={() =>
                                        deleteVehicle(v.number)
                                    }
                                >
                                    Delete
                                </button>

                            </div>

                        </div>
                    ))}

                </div>

            </div>

            {/* DRIVER */}

            <div style={styles.card}>

                <div style={styles.sectionHeader}>
                    👨‍✈ Driver Setup
                </div>

                <div style={styles.grid4}>

                    <input
                        style={styles.input}
                        placeholder="Driver Name"
                        value={driver.name}
                        onChange={(e) =>
                            setDriver({
                                ...driver,
                                name: e.target.value,
                            })
                        }
                    />

                    <input
                        style={styles.input}
                        placeholder="Mobile"
                        value={driver.phone}
                        onChange={(e) =>
                            setDriver({
                                ...driver,
                                phone: e.target.value,
                            })
                        }
                    />

                    <input
                        style={styles.input}
                        placeholder="Alternate Mobile"
                        value={driver.alternatePhone}
                        onChange={(e) =>
                            setDriver({
                                ...driver,
                                alternatePhone:
                                    e.target.value,
                            })
                        }
                    />

                    <input
                        style={styles.input}
                        placeholder="License Number"
                        value={driver.license}
                        onChange={(e) =>
                            setDriver({
                                ...driver,
                                license: e.target.value,
                            })
                        }
                    />

                    <input
                        style={styles.input}
                        type="date"
                        value={driver.licenseExpiry}
                        onChange={(e) =>
                            setDriver({
                                ...driver,
                                licenseExpiry:
                                    e.target.value,
                            })
                        }
                    />

                    <input
                        style={styles.input}
                        placeholder="Experience"
                        value={driver.experience}
                        onChange={(e) =>
                            setDriver({
                                ...driver,
                                experience:
                                    e.target.value,
                            })
                        }
                    />

                    <input
                        style={styles.input}
                        placeholder="Blood Group"
                        value={driver.bloodGroup}
                        onChange={(e) =>
                            setDriver({
                                ...driver,
                                bloodGroup:
                                    e.target.value,
                            })
                        }
                    />

                    <select
                        style={styles.input}
                        value={driver.status}
                        onChange={(e) =>
                            setDriver({
                                ...driver,
                                status: e.target.value,
                            })
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

                <textarea
                    style={styles.textarea}
                    placeholder="Address"
                    value={driver.address}
                    onChange={(e) =>
                        setDriver({
                            ...driver,
                            address: e.target.value,
                        })
                    }
                />

                <div style={styles.actionBar}>

                    <button
                        style={styles.successBtn}
                        onClick={saveDriver}
                    >
                        💾 Save Driver
                    </button>

                    <button
                        style={styles.secondaryBtn}
                        onClick={() => {

                            setDriver(emptyDriver);

                            setEditDriverId(null);
                        }}
                    >
                        Reset
                    </button>

                </div>

                <div style={styles.previewGrid}>

                    {store.drivers.map((d) => (

                        <div
                            key={d.phone}
                            style={styles.previewCard}
                        >

                            <div style={styles.previewTop}>

                                <div>

                                    <div style={styles.previewTitle}>
                                        {d.name}
                                    </div>

                                    <div style={styles.previewSub}>
                                        {d.phone}
                                    </div>

                                </div>

                                <div
                                    style={{
                                        ...styles.badge,

                                        background:
                                            d.status === "inactive"
                                                ? "#991b1b"
                                                : "#166534",
                                    }}
                                >
                                    {d.status}
                                </div>

                            </div>

                            <div style={styles.meta}>
                                🪪 {d.license}
                            </div>

                            <div style={styles.meta}>
                                🩸 {d.bloodGroup || "-"}
                            </div>

                            <div style={styles.meta}>
                                🚍 {d.experience || "-"}
                            </div>

                            <div style={styles.previewActions}>

                                <button
                                    style={styles.primaryBtn}
                                    onClick={() => {

                                        setDriver(d);

                                        setEditDriverId(
                                            d.phone
                                        );
                                    }}
                                >
                                    Edit
                                </button>

                                <button
                                    style={styles.dangerBtn}
                                    onClick={() =>
                                        deleteDriver(d.phone)
                                    }
                                >
                                    Delete
                                </button>

                            </div>

                        </div>
                    ))}

                </div>

            </div>

            {/* MAPPING */}

            <div style={styles.card}>

                <div style={styles.sectionHeader}>
                    🔗 Route Mapping
                </div>

                <div style={styles.grid3}>

                    <select
                        style={styles.input}
                        value={selectedRoute}
                        onChange={(e) =>
                            setSelectedRoute(
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

                    <select
                        style={styles.input}
                        value={selectedVehicle}
                        onChange={(e) =>
                            setSelectedVehicle(
                                e.target.value
                            )
                        }
                    >
                        <option value="">
                            Select Vehicle
                        </option>

                        {store.vehicles.map((v) => (

                            <option
                                key={v.number}
                                value={v.number}
                            >
                                {v.name}
                            </option>
                        ))}

                    </select>

                    <select
                        style={styles.input}
                        value={selectedDriver}
                        onChange={(e) =>
                            setSelectedDriver(
                                e.target.value
                            )
                        }
                    >
                        <option value="">
                            Select Driver
                        </option>

                        {store.drivers.map((d) => (

                            <option
                                key={d.phone}
                                value={d.phone}
                            >
                                {d.name}
                            </option>
                        ))}

                    </select>

                </div>

                <div style={styles.actionBar}>

                    <button
                        style={styles.successBtn}
                        onClick={saveMapping}
                    >
                        💾 Save Mapping
                    </button>

                </div>

                <div style={styles.previewGrid}>

                    {store.mappings.map((m, i) => {

                        const route =
                            getRoute(m.route);

                        const vehicle =
                            getVehicle(m.vehicle);

                        const driver =
                            getDriver(m.driver);

                        return (

                            <div
                                key={i}
                                style={styles.previewCard}
                            >

                                <div style={styles.previewTitle}>
                                    {route?.routeNo}
                                </div>

                                <div style={styles.meta}>
                                    🛣 {route?.routeName}
                                </div>

                                <div style={styles.meta}>
                                    🚐 {vehicle?.name}
                                </div>

                                <div style={styles.meta}>
                                    👨‍✈ {driver?.name}
                                </div>

                                <div style={styles.previewActions}>

                                    <button
                                        style={styles.dangerBtn}
                                        onClick={() =>
                                            deleteMapping(
                                                m.route
                                            )
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>
                        );
                    })}

                </div>

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
        flexWrap: "wrap",
        gap: 16,
        marginBottom: 24,
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
        borderRadius: 18,
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
        border: "1px solid #334155",
        marginBottom: 24,
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

    grid3: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit,minmax(260px,1fr))",
        gap: 16,
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
        marginTop: 16,
        padding: 12,
        borderRadius: 10,
        border: "1px solid #334155",
        background: "#0f172a",
        color: "#fff",
        boxSizing: "border-box",
    },

    actionBar: {
        display: "flex",
        gap: 12,
        marginTop: 20,
        flexWrap: "wrap",
    },

    previewGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit,minmax(320px,1fr))",
        gap: 18,
        marginTop: 24,
    },

    previewCard: {
        background: "#0f172a",
        borderRadius: 18,
        padding: 18,
        border: "1px solid #334155",
    },

    previewTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },

    previewTitle: {
        fontSize: 22,
        fontWeight: 700,
    },

    previewSub: {
        color: "#94a3b8",
        marginTop: 4,
    },

    meta: {
        marginTop: 10,
        color: "#cbd5e1",
    },

    previewActions: {
        display: "flex",
        gap: 10,
        marginTop: 18,
        flexWrap: "wrap",
    },

    badge: {
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
};
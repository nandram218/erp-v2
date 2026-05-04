import React, { useState } from "react";
import { transportService } from "./transportService";
import { useNavigate } from "react-router-dom";

export default function TransportSettings() {

    const navigate = useNavigate();
    const [store, setStore] = useState(transportService.get());

    const [selectedRoute, setSelectedRoute] = useState("");
    const [selectedVehicle, setSelectedVehicle] = useState("");
    const [selectedDriver, setSelectedDriver] = useState("");

    // ================= VEHICLE =================
    const emptyVehicle = { name: "", number: "", capacity: "", owner: "School", gps: false };
    const [vehicle, setVehicle] = useState(emptyVehicle);
    const [editVehicleId, setEditVehicleId] = useState(null);

    const saveVehicle = () => {
        if (!vehicle.name || !vehicle.number) return alert("Fill required fields");

        let updated;

        if (editVehicleId) {
            updated = {
                ...store,
                vehicles: store.vehicles.map(v =>
                    v.number === editVehicleId ? vehicle : v
                )
            };
        } else {
            if (store.vehicles.find(v => v.number === vehicle.number))
                return alert("Vehicle already exists");

            updated = {
                ...store,
                vehicles: [...store.vehicles, vehicle]
            };
        }

        setStore(updated);
        transportService.save(updated);

        setVehicle(emptyVehicle);
        setEditVehicleId(null);
    };

    const deleteVehicle = (number) => {
        const updated = {
            ...store,
            vehicles: store.vehicles.filter(v => v.number !== number),
            mappings: store.mappings.filter(m => m.vehicle !== number)
        };

        setStore(updated);
        transportService.save(updated);
    };

    // ================= DRIVER =================
    const emptyDriver = { name: "", phone: "", license: "", address: "", emergency: "" };
    const [driver, setDriver] = useState(emptyDriver);
    const [editDriverId, setEditDriverId] = useState(null);

    const saveDriver = () => {
        if (!driver.name || !driver.phone) return alert("Fill required");

        let updated;

        if (editDriverId) {
            updated = {
                ...store,
                drivers: store.drivers.map(d =>
                    d.phone === editDriverId ? driver : d
                )
            };
        } else {
            if (store.drivers.find(d => d.phone === driver.phone))
                return alert("Driver already exists");

            updated = {
                ...store,
                drivers: [...store.drivers, driver]
            };
        }

        setStore(updated);
        transportService.save(updated);

        setDriver(emptyDriver);
        setEditDriverId(null);
    };

    const deleteDriver = (phone) => {
        const updated = {
            ...store,
            drivers: store.drivers.filter(d => d.phone !== phone),
            mappings: store.mappings.filter(m => m.driver !== phone)
        };

        setStore(updated);
        transportService.save(updated);
    };

    // ================= MAPPING =================
    const saveMapping = () => {
        if (!selectedRoute || !selectedVehicle || !selectedDriver)
            return alert("Select all fields");

        const exists = store.mappings.find(m => m.route === selectedRoute);

        const updated = exists
            ? {
                ...store,
                mappings: store.mappings.map(m =>
                    m.route === selectedRoute
                        ? { route: selectedRoute, vehicle: selectedVehicle, driver: selectedDriver }
                        : m
                )
            }
            : {
                ...store,
                mappings: [...store.mappings, {
                    route: selectedRoute,
                    vehicle: selectedVehicle,
                    driver: selectedDriver
                }]
            };

        setStore(updated);
        transportService.save(updated);
    };

    const deleteMapping = (route) => {
        const updated = {
            ...store,
            mappings: store.mappings.filter(m => m.route !== route)
        };

        setStore(updated);
        transportService.save(updated);
    };

    const getRoute = (r) => store.routes.find(x => x.routeNo === r);
    const getVehicle = (num) => store.vehicles.find(v => v.number === num);
    const getDriver = (ph) => store.drivers.find(d => d.phone === ph);

    return (
        <div style={styles.page}>

            <div style={styles.top}>
                <button
                    style={styles.btn}
                    onClick={() => navigate("/master-setting")}
                >
                    ⬅ Back (Master Setting)
                </button>

                <button
                    style={styles.btnBlue}
                    onClick={() => navigate("/dashboard")}
                >
                    🏠 Dashboard
                </button>

                <button
                    style={styles.btnBlue}
                    onClick={() => navigate("/master-setting/transport/routes")}
                >
                    🛣 Route Setup
                </button>
            </div>

            <h2>🚍 Transport Setup </h2>

            {/* VEHICLE */}
            <div style={styles.card}>
                <h3>🚐 Vehicle Setup</h3>

                <input placeholder="Name" value={vehicle.name}
                    onChange={e => setVehicle({ ...vehicle, name: e.target.value })} />

                <input placeholder="Number" value={vehicle.number}
                    onChange={e => setVehicle({ ...vehicle, number: e.target.value })} />

                <input placeholder="Capacity" value={vehicle.capacity}
                    onChange={e => setVehicle({ ...vehicle, capacity: e.target.value })} />

                <button style={styles.btnGreen} onClick={saveVehicle}>Save</button>

                <h4>Saved Vehicles</h4>
                {store.vehicles.map((v, i) => (
                    <div key={i} style={styles.listRow}>
                        <div style={{ flex: 1 }}>
                            {v.name} ({v.number}) - {v.capacity}
                        </div>

                        <div style={styles.actionBox}>
                            <button onClick={() => {
                                setVehicle(v);
                                setEditVehicleId(v.number);
                            }}>Edit</button>

                            <button onClick={() => deleteVehicle(v.number)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* DRIVER */}
            <div style={styles.card}>
                <h3>👨‍✈ Driver Setup</h3>

                <input placeholder="Name" value={driver.name}
                    onChange={e => setDriver({ ...driver, name: e.target.value })} />

                <input placeholder="Mobile" value={driver.phone}
                    onChange={e => setDriver({ ...driver, phone: e.target.value })} />

                <input placeholder="License" value={driver.license}
                    onChange={e => setDriver({ ...driver, license: e.target.value })} />

                <button style={styles.btnGreen} onClick={saveDriver}>Save</button>

                <h4>Saved Drivers</h4>
                {store.drivers.map((d, i) => (
                    <div key={i} style={styles.listRow}>
                        <div style={{ flex: 1 }}>
                            {d.name} ({d.phone})
                        </div>

                        <div style={styles.actionBox}>
                            <button onClick={() => {
                                setDriver(d);
                                setEditDriverId(d.phone);
                            }}>Edit</button>

                            <button onClick={() => deleteDriver(d.phone)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MAPPING */}
            <div style={styles.card}>
                <h3>🔗 Route Mapping</h3>

                <select onChange={e => setSelectedRoute(e.target.value)}>
                    <option>Select Route</option>
                    {store.routes.map(r => (
                        <option key={r.routeNo}>{r.routeNo}</option>
                    ))}
                </select>

                <select onChange={e => setSelectedVehicle(e.target.value)}>
                    <option>Select Vehicle</option>
                    {store.vehicles.map(v => (
                        <option key={v.number} value={v.number}>{v.name}</option>
                    ))}
                </select>

                <select onChange={e => setSelectedDriver(e.target.value)}>
                    <option>Select Driver</option>
                    {store.drivers.map(d => (
                        <option key={d.phone} value={d.phone}>{d.name}</option>
                    ))}
                </select>

                <button style={styles.btnGreen} onClick={saveMapping}>Save </button>

                <h4>Full Details</h4>
                {store.mappings.map((m, i) => {
                    const route = getRoute(m.route);
                    const vehicle = getVehicle(m.vehicle);
                    const driver = getDriver(m.driver);

                    return (
                        <div key={i} style={styles.preview}>
                            <b>{route?.routeNo} - {route?.routeName}</b>

                            {route?.points?.map((p, j) => (
                                <div key={j}>
                                    {p.name} → ₹{p.fare} ({p.pickup}-{p.drop})
                                </div>
                            ))}

                            <div>🚐 {vehicle?.name} ({vehicle?.number}) | Cap: {vehicle?.capacity}</div>
                            <div>👨‍✈ {driver?.name} ({driver?.phone}) | Lic: {driver?.license}</div>

                            <button onClick={() => deleteMapping(m.route)}>Delete</button>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}

const styles = {
    page: { background: "#0f172a", color: "#fff", padding: 20 },
    top: { display: "flex", justifyContent: "space-between" },
    card: { background: "#1e293b", padding: 15, marginTop: 15 },

    listRow: {
        display: "flex",
        alignItems: "center",
        background: "#334155",
        padding: 8,
        marginTop: 5
    },

    actionBox: {
        display: "flex",
        gap: 10
    },

    btn: { background: "#64748b", padding: 10, color: "#fff" },
    btnGreen: { background: "#22c55e", padding: 10, color: "#fff" },
    btnBlue: { background: "#3b82f6", padding: 10, color: "#fff" },

    preview: { background: "#334155", padding: 10, marginTop: 10 }
};
import React, { useState } from "react";
import { transportService } from "./transportService";
import { useNavigate } from "react-router-dom";

export default function TransportRoutes() {

    const navigate = useNavigate();
    const [store, setStore] = useState(transportService.get());

    const emptyPoints = () =>
        Array.from({ length: 5 }, (_, i) => ({
            name: "",
            fare: "",
            pickup: "",
            drop: ""
        }));

    const [selectedRoute, setSelectedRoute] = useState("");

    const [routeNo, setRouteNo] = useState("");
    const [customRoute, setCustomRoute] = useState("");
    const [routeName, setRouteName] = useState("");
    const [fareType, setFareType] = useState("fixed");
    const [fixedFare, setFixedFare] = useState("");
    const [points, setPoints] = useState(emptyPoints());

    // ================= RESET FORM =================
    const resetForm = () => {
        setRouteNo("");
        setCustomRoute("");
        setRouteName("");
        setFareType("fixed");
        setFixedFare("");
        setPoints(emptyPoints());
        setSelectedRoute("");
    };

    // ================= AUTO LOAD ON SELECT =================
    const handleSelectRoute = (val) => {
        setSelectedRoute(val);

        const r = store.routes.find(x => x.routeNo === val);
        if (!r) return;

        setRouteNo(r.routeNo.replace("R", ""));
        setRouteName(r.routeName);
        setFareType(r.fareType);
        setFixedFare(r.fixedFare || "");
        setPoints(r.points.length ? r.points : emptyPoints());
    };

    // ================= SAVE =================
    const saveRoute = () => {

        const finalNo = routeNo === "custom" ? customRoute : routeNo;
        const finalRoute = `R${finalNo}`;

        if (!finalNo || !routeName)
            return alert("⚠ Route No & Name required");

        if (store.routes.find(r => r.routeNo === finalRoute))
            return alert("❌ Duplicate Route Not Allowed");

        const newRoute = {
            routeNo: finalRoute,
            routeName,
            fareType,
            fixedFare: fareType === "fixed" ? Number(fixedFare) : null,
            points: points.filter(p => p.name)
        };

        const updated = {
            ...store,
            routes: [...store.routes, newRoute]
        };

        setStore(updated);
        transportService.save(updated);

        alert("✅ Route Saved");
        resetForm();
    };

    // ================= UPDATE =================
    const updateRoute = () => {

        if (!selectedRoute)
            return alert("⚠ Select Route to Edit");

        if (!window.confirm("Are you sure to update?")) return;

        const updatedRoutes = store.routes.map(r =>
            r.routeNo === selectedRoute
                ? {
                    ...r,
                    routeName,
                    fareType,
                    fixedFare,
                    points
                }
                : r
        );

        const updated = { ...store, routes: updatedRoutes };
        setStore(updated);
        transportService.save(updated);

        alert("✏ Updated");
        resetForm();
    };

    // ================= DELETE =================
    const deleteRoute = () => {

        if (!selectedRoute)
            return alert("⚠ Select Route to Delete");

        if (!window.confirm("Are you sure to delete?")) return;

        const updated = {
            ...store,
            routes: store.routes.filter(r => r.routeNo !== selectedRoute),
            mappings: store.mappings.filter(m => m.route !== selectedRoute)
        };

        setStore(updated);
        transportService.save(updated);

        alert("🗑 Deleted");
        resetForm();
    };

    // ================= POINT =================
    const handlePoint = (i, field, val) => {
        const updated = [...points];
        updated[i] = { ...updated[i], [field]: val };
        setPoints(updated);
    };

    const addPoint = () => {
        setPoints([...points, { name: "", fare: "", pickup: "", drop: "" }]);
    };

    return (
        <div style={styles.page}>

            <button style={styles.btnGrey}
                onClick={() => navigate("/master-setting/transport")}>
                ⬅ Back
            </button>

            <h2>🛣 Route Builder (LOCK)</h2>


            {/* ROUTE NO */}
            <select onChange={e => setRouteNo(e.target.value)} value={routeNo}>
                <option value="">Select Route No</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n}>R{n}</option>
                ))}
                <option value="custom">Custom</option>
            </select>

            {routeNo === "custom" && (
                <input
                    placeholder="Custom Route No"
                    onChange={e => setCustomRoute(e.target.value)}
                />
            )}

            <input
                placeholder="Route Name"
                value={routeName}
                onChange={e => setRouteName(e.target.value)}
            />

            {/* FARE */}
            <select onChange={e => setFareType(e.target.value)} value={fareType}>
                <option value="fixed">Fixed Fare</option>
                <option value="point">Point Wise</option>
            </select>

            {fareType === "fixed" && (
                <input
                    placeholder="Fixed Fare"
                    value={fixedFare}
                    onChange={e => setFixedFare(e.target.value)}
                />
            )}

            {/* POINTS */}
            <h3>Pickup Points</h3>

            {points.map((p, i) => (
                <div key={i} style={styles.row}>
                    <input
                        placeholder={`Point ${i + 1}`}
                        value={p.name}
                        onChange={e => handlePoint(i, "name", e.target.value)}
                    />

                    {fareType === "point" && (
                        <input
                            placeholder="Fare"
                            value={p.fare}
                            onChange={e => handlePoint(i, "fare", e.target.value)}
                        />
                    )}

                    <input
                        placeholder="Pickup Time"
                        value={p.pickup}
                        onChange={e => handlePoint(i, "pickup", e.target.value)}
                    />

                    <input
                        placeholder="Drop Time"
                        value={p.drop}
                        onChange={e => handlePoint(i, "drop", e.target.value)}
                    />
                </div>
            ))}

            <button style={styles.btnBlue} onClick={addPoint}>
                ➕ Add Point
            </button>

            {/* ACTION */}
            <div style={styles.action}>
                <button style={styles.btnGreen} onClick={saveRoute}>💾 Save</button>
                <select
                    value={selectedRoute}
                    onChange={e => handleSelectRoute(e.target.value)}
                    style={{ padding: 10 }}
                >
                    <option value="">Select Route</option>
                    {store.routes.map(r => (
                        <option key={r.routeNo} value={r.routeNo}>
                            {r.routeNo} - {r.routeName}
                        </option>
                    ))}
                </select>

                <button style={styles.btnBlue} onClick={updateRoute}>✏ Edit</button>
                <button style={styles.btnRed} onClick={deleteRoute}>🗑 Delete</button>
            </div>

            {/* PREVIEW */}
            <h3>📊 Full Route Details</h3>

            {store.routes.map(r => (
                <div key={r.routeNo} style={styles.card}>
                    <b>{r.routeNo} - {r.routeName}</b>

                    {r.fareType === "fixed" && (
                        <div>💰 Fixed Fare: ₹ {r.fixedFare}</div>
                    )}

                    {r.points.map((p, i) => (
                        <div key={i}>
                            {p.name} → ₹{p.fare} ({p.pickup} - {p.drop})
                        </div>
                    ))}
                </div>
            ))}

        </div>
    );
}

const styles = {
    page: { background: "#0f172a", color: "#fff", padding: 20 },
    row: { display: "flex", gap: 6, marginTop: 6 },
    action: { marginTop: 10, display: "flex", gap: 10 },

    btnGreen: { background: "#22c55e", padding: 10, color: "#fff" },
    btnBlue: { background: "#3b82f6", padding: 10, color: "#fff" },
    btnRed: { background: "#ef4444", padding: 10, color: "#fff" },
    btnGrey: { background: "#64748b", padding: 10, color: "#fff" },

    card: { background: "#1e293b", marginTop: 10, padding: 10 }
};
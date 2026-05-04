import React, { useEffect, useState } from "react";
import { classSubjectService } from "../classes-subjects/classSubjectService";

const STORAGE_KEY = "ERP_FEE_SETTINGS";

// ✅ TYPES (UNCHANGED)
const defaultTypes = {
    academic: [
        "Admission Fee",
        "Tuition Fee",
        "Exam Fee",
        "Annual Fee",
        "Extra Class Fee",
        "Development Fee",
        "Registration Fee",
    ],

    supportingAcademic: [
        "Computer Fee",
        "Lab Fee",
        "Smart Class Fee",
        "E-Learning Fee",
        "Library Fee",
        "ID Card + Diary Fee"
    ],

    facilities: [
        "Hostel Fee",
        "Mess / Canteen Fee"
    ],

    activities: [
        "Sports Fee",
        "Activity Fee",
        "Cultural Fee",
        "Event Fee",
        "Tour Fee",
    ]
};

export default function FeeSettings() {

    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [data, setData] = useState({});
    const [tempData, setTempData] = useState({});
    const [customType, setCustomType] = useState("");
    const [mode, setMode] = useState("view");
    const [showHelp, setShowHelp] = useState(false);

    // 🔥 CURRENT DATA FIX (CORE)
    const currentData =
        mode === "view"
            ? data[selectedClass] || {}
            : tempData;

    // LOAD CLASSES
    useEffect(() => {
        const raw = classSubjectService.getClasses() || [];
        const unique = [];

        raw.forEach(c => {
            const name = c.stream
                ? `${c.className}-${c.stream}`
                : c.className;

            if (!unique.includes(name)) unique.push(name);
        });

        setClasses(unique);
    }, []);

    // LOAD SAVED
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        setData(saved);
    }, []);

    // INIT TEMP DATA
    useEffect(() => {
        if (!selectedClass) return;

        if (mode === "edit") {
            setTempData(data[selectedClass] || {});
        }

        if (mode === "create") {
            if (data[selectedClass]) {
                alert("⚠ Fees already exist. Use EDIT.");
                setMode("view"); // ✅ FIXED
                return;
            }
            setTempData({});
        }

    }, [selectedClass, mode]);

    // TOGGLE
    const toggleType = (type) => {
        if (mode === "view") return;

        if (!selectedClass || !mode) {
            alert("⚠ Select class & mode first");
            return;
        }

        const cls = { ...tempData };

        if (cls[type]) {
            delete cls[type];
        } else {
            cls[type] = { amount: "", freq: "monthly" };
        }

        setTempData(cls);
    };

    // CHANGE
    const handleChange = (type, field, value) => {
        if (mode === "view") return;

        const cls = { ...tempData };

        cls[type] = {
            ...cls[type],
            [field]: field === "amount" ? Number(value) : value
        };

        setTempData(cls);
    };

    // CUSTOM
    const addCustom = () => {
        if (!customType.trim()) return;

        defaultTypes.activities.push(customType);
        setCustomType("");
    };

    // SAVE
    const handleSave = () => {
        if (!selectedClass) return alert("⚠ Select class first");

        const updated = {
            ...data,
            [selectedClass]: tempData
        };

        setData(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        alert("✅ Fees Saved Successfully");
        setMode("view"); // ✅ FIXED
    };

    // RESET
    const resetClass = () => {
        if (!selectedClass) return;

        if (!window.confirm("Clear class fee?")) return;

        const updated = { ...data };
        delete updated[selectedClass];

        setData(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setTempData({});
    };

    const resetAll = () => {
        if (!window.confirm("Clear ALL?")) return;

        localStorage.removeItem(STORAGE_KEY);
        setData({});
        setTempData({});
    };

    // ONE TIME TOTAL (FIXED)
    const getOneTimeTotal = () => {
        return Object.values(currentData || {})
            .filter(f => f.freq === "one")
            .reduce((a, b) => a + Number(b.amount || 0), 0);
    };

    const getTitle = (key) => ({
        academic: "📘 Academic",
        supportingAcademic: "🧪 Supporting",
        facilities: "🏨 Facilities",
        activities: "🎯 Activities"
    }[key]);

    return (
        <div style={styles.page}>

            {/* TOP */}
            <div style={styles.top}>
                <button style={styles.btn3d} onClick={() => window.history.back()}>
                    ⬅ Back
                </button>

                <button style={styles.btn3d} onClick={() => setShowHelp(!showHelp)}>
                    ❓ Help
                </button>
            </div>

            <h2 style={styles.title}>💰 Fee Setup</h2>
            <h3 style={{ textAlign: "center", marginTop: 5 }}>
                Mode: {mode ? mode.toUpperCase() : "NOT SELECTED"}
            </h3>
            {showHelp && (
                <div style={styles.helpBox}>
                    <ul>
                        <li>Select class → choose mode</li>
                        <li>Set Fees = new</li>
                        <li>Edit Fees = modify</li>
                        <li>Save = final commit</li>
                    </ul>
                </div>
            )}

            {/* CLASS + MODE */}
            <div style={{ display: "flex", gap: 10 }}>

                <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                >
                    <option value="">Select Class</option>
                    {classes.map((c, i) => (
                        <option key={i}>{c}</option>
                    ))}
                </select>

                <button
                    style={{
                        ...styles.btn3d,
                        background: mode === "create" ? "#16a34a" : "#3b82f6"
                    }}
                    onClick={() => setMode("create")}
                >
                    ➕ Set Fees
                </button>

                <button
                    style={{
                        ...styles.btn3d,
                        background: mode === "edit" ? "#f59e0b" : "#3b82f6"
                    }}
                    onClick={() => setMode("edit")}
                >
                    ✏ Edit Fees
                </button>

                <button
                    style={{
                        ...styles.btn3d,
                        background: mode === "view" ? "#0ea5e9" : "#3b82f6"
                    }}
                    onClick={() => setMode("view")}
                >
                    👀 View
                </button>

            </div>

            <div style={styles.flex}>

                {/* FORM */}
                <div style={styles.card}>

                    <h3>
                        Setup Form ({mode || "No Mode Selected"})
                    </h3>
                    <h4>One-Time Total: ₹ {getOneTimeTotal()}</h4>

                    {!selectedClass && <p>⚠ Select class first</p>}

                    {Object.entries(defaultTypes).map(([section, types]) => (
                        <div key={section}>

                            <h4>{getTitle(section)}</h4>

                            {types.map((type, i) => {
                                const active = currentData[type];

                                return (
                                    <div key={i} style={styles.row}>

                                        <input
                                            type="checkbox"
                                            checked={!!active}
                                            disabled={mode === "view"}
                                            onChange={() => toggleType(type)}
                                        />

                                        {type}

                                        {active && (
                                            <>
                                                <select
                                                    disabled={mode === "view"}
                                                    value={active.freq}
                                                    onChange={(e) =>
                                                        handleChange(type, "freq", e.target.value)
                                                    }
                                                >
                                                    <option value="monthly">Monthly</option>
                                                    <option value="quarterly">Quarterly</option>
                                                    <option value="three">3 Times</option>
                                                    <option value="half">Half Yearly</option>
                                                    <option value="yearly">Yearly</option>
                                                    <option value="one">One Time</option>
                                                </select>

                                                <input
                                                    type="number"
                                                    placeholder="Amount"
                                                    disabled={mode === "view"}
                                                    value={active.amount || ""}
                                                    onChange={(e) =>
                                                        handleChange(type, "amount", e.target.value)
                                                    }
                                                />
                                            </>
                                        )}
                                    </div>
                                );
                            })}

                        </div>
                    ))}

                    {/* CUSTOM */}
                    <div>
                        <input
                            value={customType}
                            onChange={(e) => setCustomType(e.target.value)}
                            placeholder="Custom Fee Type"
                        />
                        <button style={styles.btn3d} onClick={addCustom}>Add</button>
                    </div>

                    {/* ACTION */}
                    <div>
                        <button style={styles.save} onClick={handleSave}>💾 Save</button>
                        <button style={styles.btn3d} onClick={resetClass}>Reset Class</button>
                        <button style={styles.btn3d} onClick={resetAll}>Reset All</button>
                    </div>

                </div>

                {/* PREVIEW */}
                <div style={styles.card}>
                    <h3>📊 Preview</h3>

                    {selectedClass && (
                        <>
                            <h4>{selectedClass}</h4>

                            {Object.entries(currentData || {}).map(([k, v], i) => (
                                <div key={i}>
                                    {k} → ₹ {v.amount} ({v.freq})
                                </div>
                            ))}
                        </>
                    )}
                </div>

            </div>

        </div>
    );
}

/* STYLES (UNCHANGED) */
const styles = {
    page: { background: "#0f172a", color: "#fff", padding: 20, minHeight: "100vh" },
    top: { display: "flex", justifyContent: "space-between" },
    title: { textAlign: "center" },
    flex: { display: "flex", gap: 20 },
    card: { background: "#1e293b", padding: 20, borderRadius: 10, flex: 1 },
    row: { display: "flex", gap: 10, marginTop: 8 },
    btn3d: {
        background: "#3b82f6",
        padding: "8px 14px",
        borderRadius: 8,
        border: "none",
        boxShadow: "0 4px 0 #1e40af",
        color: "#fff"
    },
    save: { background: "green", padding: 10, borderRadius: 8 },
    helpBox: { background: "#1e40af", padding: 10, marginTop: 10 }
};
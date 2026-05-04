import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { classSubjectService } from "./classSubjectService";
import { SUBJECT_POOL } from "./subjectPool";


// 🔥 YAHI ADD KARNA HAI
const normalizeClassKey = (className) => {
    if (!className) return "";

    return className
        .replace(" (Science)", "-Science")
        .replace(" (Commerce)", "-Commerce")
        .replace(" (Arts)", "-Arts")
        .replace(" (Agriculture)", "-Agriculture");
};

const STORAGE_KEY = "ERP_SUBJECTS";
const MAP_KEY = "ERP_CLASS_SUBJECT_MAP";

export default function SubjectManager() {

    const navigate = useNavigate();

    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");

    const [pool, setPool] = useState({ scholastic: [], coScholastic: [] });
    const [selected, setSelected] = useState({});

    const [customMain, setCustomMain] = useState("");
    const [customCo, setCustomCo] = useState("");

    const [mode, setMode] = useState("view");

    // LOAD CLASSES

    useEffect(() => {
        const data = classSubjectService.getClasses() || [];

        // 🔥 exact same class list (no distortion)
        const clean = data
            .map(c => ({
                className: c.className?.trim()
            }))
            .filter(c => c.className); // remove empty

        setClasses(clean);
    }, []);

    // LOAD SAVED (SAFE FOR OLD + NEW STRUCTURE)
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

        const formatted = {};

        Object.keys(saved).forEach(cls => {
            if (Array.isArray(saved[cls])) {
                // 🔁 old format → convert
                formatted[cls] = {
                    scholastic: saved[cls],
                    coScholastic: []
                };
            } else {
                formatted[cls] = saved[cls];
            }
        });

        setSelected(formatted);
    }, []);

    // LOAD POOL (FIXED)
    useEffect(() => {
        if (!selectedClass) return;

        const poolData = SUBJECT_POOL();

        const cleanClass = normalizeClassKey(selectedClass);

        setPool(
            poolData[cleanClass] ||
            poolData[selectedClass] || // fallback (safe)
            { scholastic: [], coScholastic: [] }
        );

    }, [selectedClass]);

    // TOGGLE (TYPE BASED)
    const toggle = (sub, type) => {

        const current = selected[selectedClass] || {
            scholastic: [],
            coScholastic: []
        };

        const list = current[type];

        const updatedList = list.includes(sub)
            ? list.filter(s => s !== sub)
            : [...list, sub];

        const updated = {
            ...current,
            [type]: updatedList
        };

        setSelected({
            ...selected,
            [selectedClass]: updated
        });
    };

    // CUSTOM ADD
    const addCustomMain = () => {
        if (!customMain.trim()) return;

        setPool({
            ...pool,
            scholastic: [...pool.scholastic, customMain]
        });

        toggle(customMain, "scholastic");
        setCustomMain("");
    };

    const addCustomCo = () => {
        if (!customCo.trim()) return;

        setPool({
            ...pool,
            coScholastic: [...pool.coScholastic, customCo]
        });

        toggle(customCo, "coScholastic");
        setCustomCo("");
    };

    // SAVE + AUTO MAP
    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));

        // 🔥 AUTO MAPPING
        localStorage.setItem(MAP_KEY, JSON.stringify(selected));

        alert("✅ Subjects & Mapping Saved Successfully");
    };

    // RESET SINGLE
    const resetSingle = () => {
        if (!selectedClass) return alert("⚠ Please select a class first");

        if (!window.confirm("Selected class subjects will be permanently removed.")) return;

        const updated = { ...selected };
        delete updated[selectedClass];

        setSelected(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        localStorage.setItem(MAP_KEY, JSON.stringify(updated));
    };

    // RESET ALL
    const resetAll = () => {
        if (!window.confirm("All subjects for all classes will be removed.")) return;

        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(MAP_KEY);
        setSelected({});
    };

    // TAGLINES
    const getTopMessage = () =>
        "Select a class to manage its subjects. Actions apply only to the selected class.";

    const getModeMessage = () => {
        if (mode === "create")
            return "Add Mode: Select subjects using checkboxes. Use custom fields for additional subjects.";
        if (mode === "edit")
            return "Edit Mode: Modify existing subjects by selecting/deselecting or adding custom subjects.";
        return "View Mode: Viewing saved subjects (editing disabled).";
    };

    return (
        <div style={styles.page}>

            {/* NAV */}
            <div style={styles.top}>
                <button style={styles.btn3d} onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>
                <button style={styles.btn3d} onClick={() => navigate("/master-setting")}>⬅ Master</button>
            </div>

            <h2 style={styles.title}>📚 Subject Manager</h2>

            {/* MODE */}
            <div style={styles.card}>
                {["view", "edit", "create"].map((m) => (
                    <button
                        key={m}
                        style={{
                            ...styles.btn3d,
                            background: mode === m ? "#0b5ed7" : "#2196F3"
                        }}
                        onClick={() => setMode(m)}
                    >
                        {m === "view" ? "👀 View" : m === "edit" ? "✏ Edit" : "➕ Add"}
                    </button>
                ))}
            </div>

            {/* MODE INFO */}
            <div style={styles.infoBox}>
                <b>Current Mode:</b> {mode.toUpperCase()} <br />
                {getModeMessage()}
            </div>

            {/* CLASS SELECT */}
            <div style={styles.card}>
                <p>{getTopMessage()}</p>
                <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                >
                    <option value="">Select Class</option>
                    {classes.map((c, i) => (
                        <option key={i} value={c.className}>
                            {c.className}
                        </option>
                    ))}
                </select>
            </div>

            {/* MAIN AREA */}
            {selectedClass && (
                <div style={styles.flex}>

                    {/* LEFT */}
                    <div style={styles.card}>
                        <h3>Class: {selectedClass}</h3>

                        <h4>📗 Scholastic</h4>
                        {pool.scholastic.map((s, i) => (
                            <label key={i}>
                                <input
                                    type="checkbox"
                                    disabled={mode === "view"}
                                    checked={(selected[selectedClass]?.scholastic || []).includes(s)}
                                    onChange={() => toggle(s, "scholastic")}
                                />
                                {s}
                            </label>
                        ))}

                        <h4>🎨 Co-Scholastic</h4>
                        {pool.coScholastic.map((s, i) => (
                            <label key={i}>
                                <input
                                    type="checkbox"
                                    disabled={mode === "view"}
                                    checked={(selected[selectedClass]?.coScholastic || []).includes(s)}
                                    onChange={() => toggle(s, "coScholastic")}
                                />
                                {s}
                            </label>
                        ))}

                        {mode !== "view" && (
                            <>
                                <input
                                    placeholder="Add Main Subject"
                                    value={customMain}
                                    onChange={(e) => setCustomMain(e.target.value)}
                                />
                                <button style={styles.btn3d} onClick={addCustomMain}>Add</button>

                                <input
                                    placeholder="Add Co-Scholastic"
                                    value={customCo}
                                    onChange={(e) => setCustomCo(e.target.value)}
                                />
                                <button style={styles.btn3d} onClick={addCustomCo}>Add</button>
                            </>
                        )}
                    </div>

                    {/* RIGHT */}
                    <div style={styles.card}>
                        <h3>Selected Subjects</h3>
                        <h4>Class: {selectedClass}</h4>

                        <h4>📗 Scholastic</h4>
                        {(selected[selectedClass]?.scholastic || []).map((s, i) => (
                            <div key={i}>• {s}</div>
                        ))}

                        <h4>🎨 Co-Scholastic</h4>
                        {(selected[selectedClass]?.coScholastic || []).map((s, i) => (
                            <div key={i}>• {s}</div>
                        ))}
                    </div>

                </div>
            )}

            {/* SAVE */}
            <div style={styles.card}>
                <button style={styles.save} onClick={handleSave}>
                    💾 Save
                </button>
            </div>

            {/* RESET */}
            <div style={styles.card}>
                <h3>Reset Options</h3>
                <button style={styles.btn3d} onClick={resetSingle}>
                    Reset Selected Class
                </button>
                <button style={styles.btn3d} onClick={resetAll}>
                    Reset All Classes
                </button>
            </div>

        </div>
    );
}

const styles = {
    page: { padding: 20 },

    top: { display: "flex", justifyContent: "space-between" },

    title: { textAlign: "center" },

    flex: { display: "flex", gap: 20 },

    card: {
        background: "#fff",
        padding: 20,
        marginTop: 20,
        borderRadius: 10,
        flex: 1
    },

    infoBox: {
        background: "#eef5ff",
        padding: 10,
        marginTop: 10,
        borderRadius: 8
    },

    btn3d: {
        padding: "8px 14px",
        margin: "5px",
        background: "#2196F3",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        boxShadow: "0 4px 0 #0b5ed7",
        cursor: "pointer"
    },

    save: {
        background: "green",
        color: "#fff",
        padding: 10,
        borderRadius: 8
    }
};
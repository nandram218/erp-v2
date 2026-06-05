import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getService } from "../../core/serviceRegistry";

const classSubjectService = getService("classSubject");

export default function ClassManager() {
    const navigate = useNavigate();
    const [config, setConfig] = useState({

        useNursery: true,
        usePP: false,
        sectionCount: 1,

        levels: {
            prePrimary: true,
            primary: true,
            upperPrimary: true,
            secondary: true,
            srSecondary: true
        },

        streams: ["Science"]
    });

    const allStreams = ["Science", "Commerce", "Arts", "Agriculture"];

    const [generated, setGenerated] = useState([]);
    const [selected, setSelected] = useState([]);
    const [mode, setMode] = useState("view");
    // view | edit | create
    // LOAD SAVED
    useEffect(() => {
        const saved = classSubjectService.getClasses();
        if (saved.length > 0) {
            setSelected(saved);
            setGenerated(saved);
            setMode("view"); // 👈 important
        } else {
            setMode("create");
        }
    }, []);

    // GENERATE
    const handleGenerate = () => {
        const data = classSubjectService.generateClasses(config);

        const withSectionConfig = data.map(c => ({
            ...c,
            sectionCount: config.sectionCount
        }));

        setGenerated(withSectionConfig);
        setSelected(withSectionConfig);
    };

    // TOGGLE SELECT
    const toggleSelect = (item) => {
        const exists = selected.find(
            c =>
                c.className === item.className &&
                c.section === item.section &&
                c.stream === item.stream
        );

        if (exists) {
            setSelected(selected.filter(c => c !== exists));
        } else {
            setSelected([...selected, item]);
        }
    };

    const selectAll = () => setSelected(generated);
    const clearAll = () => setSelected([]);

    // STREAM SELECT
    const toggleStream = (stream) => {
        if (config.streams.includes(stream)) {
            setConfig({
                ...config,
                streams: config.streams.filter(s => s !== stream)
            });
        } else {
            setConfig({
                ...config,
                streams: [...config.streams, stream]
            });
        }
    };

    // PER CLASS SECTION CHANGE
    const updateSection = (index, count) => {
        const base = generated[index];

        const sections =
            count === 1
                ? [""]
                : Array.from({ length: count }, (_, i) =>
                    String.fromCharCode(65 + i)
                );

        const newRows = sections.map(sec => ({
            ...base,
            section: sec,
            sectionCount: count
        }));

        // 🔥 ORDER FIX
        const before = generated.slice(0, index);
        const after = generated.slice(index + 1);

        const cleanedAfter = after.filter(
            c =>
                !(
                    c.className === base.className &&
                    c.stream === base.stream
                )
        );

        const updated = [...before, ...newRows, ...cleanedAfter];

        setGenerated(updated);
        setSelected(updated);
    };
    const handleSave = () => {
        classSubjectService.saveClasses(selected);
        alert("✅ Classes Saved");
        setMode("view"); // 👈 important
    };

    return (

        <div style={styles.page}>
            <div style={{ marginBottom: 10 }}>
                <button
                    onClick={() => navigate("/master-setting")}
                    style={{
                        padding: "8px 14px",
                        background: "#000",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer"
                    }}
                >
                    ⬅ Back
                </button>
            </div>
            <h2 style={styles.title}>🏫 School Class Setup</h2>
            <div style={{ textAlign: "right", marginBottom: 10 }}>
                <button
                    onClick={() => navigate("/master-setting/classes-subjects/subjects")}
                    style={{
                        padding: "8px 14px",
                        background: "#9C27B0",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer"
                    }}
                >
                    📚 Manage Subjects
                </button>
            </div>
            <div style={{ marginBottom: 15, display: "flex", gap: 10 }}>

                <button onClick={() => setMode("view")}>👀 View</button>

                <button onClick={() => setMode("edit")}>✏ Edit</button>

                <button onClick={() => {
                    if (window.confirm("All classes will be deleted. Continue?")) {
                        classSubjectService.saveClasses([]);
                        setGenerated([]);
                        setSelected([]);
                        setMode("create");
                    }
                }}>
                    🔄 Reset
                </button>

            </div>
            {/* LEVELS */}
            <div style={styles.card}>
                <h3>Academic Levels</h3>

                {Object.keys(config.levels).map((lvl) => (
                    <label key={lvl} style={styles.inline}>
                        <input
                            type="checkbox"
                            checked={config.levels[lvl]}
                            onChange={() =>
                                setConfig({
                                    ...config,
                                    levels: {
                                        ...config.levels,
                                        [lvl]: !config.levels[lvl]
                                    }
                                })
                            }
                        />
                        {lvl}
                    </label>
                ))}

                {/* 🔥 SR SECONDARY + STREAM SAME LINE */}
                {config.levels.srSecondary && (
                    <div style={{ marginTop: 10 }}>
                        <b>Streams:</b>
                        {allStreams.map(stream => (
                            <label key={stream} style={styles.inline}>
                                <input
                                    type="checkbox"
                                    checked={config.streams.includes(stream)}
                                    onChange={() => toggleStream(stream)}
                                />
                                {stream}
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* PRE PRIMARY */}
            <div style={styles.card}>
                <h3>Pre-Primary Mode</h3>

                <label style={styles.inline}>
                    <input
                        type="checkbox"
                        checked={config.useNursery}
                        onChange={() =>
                            setConfig({ ...config, useNursery: !config.useNursery })
                        }
                    />
                    Nursery / LKG / UKG
                </label>

                <span style={{ margin: "0 10px" }}>OR</span>

                <label style={styles.inline}>
                    <input
                        type="checkbox"
                        checked={config.usePP}
                        onChange={() =>
                            setConfig({ ...config, usePP: !config.usePP })
                        }
                    />
                    PP3 / PP4 / PP5
                </label>
            </div>

            {/* STRUCTURE */}
            <div style={styles.card}>
                <h3>Structure</h3>

                <select
                    value={config.sectionCount}
                    onChange={(e) =>
                        setConfig({ ...config, sectionCount: Number(e.target.value) })
                    }
                >
                    <option value={1}>Single Section</option>
                    <option value={2}>2 Sections</option>
                    <option value={3}>3 Sections</option>
                </select>

                {mode !== "view" && (
                    <button style={styles.btn} onClick={handleGenerate}>
                        Generate Classes
                    </button>
                )}
            </div>

            {/* ACTION BUTTONS */}
            <div style={styles.card}>
                <button onClick={selectAll}>Select All</button>
                <button onClick={clearAll}>Clear</button>
            </div>

            {/* CLASS LIST */}
            <div style={styles.card}>
                <h3>Class List</h3>

                {(() => {
                    const displayList = mode === "view" ? selected : generated;

                    return displayList.map((c, i) => {
                        const isSelected = selected.find(
                            s =>
                                s.className === c.className &&
                                s.section === c.section &&
                                s.stream === c.stream
                        );

                        return (
                            <div key={i} style={styles.row}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={!!isSelected}
                                        disabled={mode === "view"}
                                        onChange={() => toggleSelect(c)}
                                    />
                                    {c.className} {c.stream && `(${c.stream})`} {c.section}
                                </label>

                                <select
                                    disabled={mode === "view"}
                                    value={c.sectionCount || 1}
                                    onChange={(e) =>
                                        updateSection(i, Number(e.target.value))
                                    }
                                >
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                </select>
                            </div>
                        );
                    });
                })()}
            </div>

            {/* SAVE */}
            <div style={styles.actions}>
                <button style={styles.save} onClick={handleSave}>
                    Save
                </button>
            </div>

        </div>
    );
}

const styles = {
    page: {
        padding: 20,
        background: "linear-gradient(135deg,#e3f2fd,#fce4ec)",
        minHeight: "100vh"
    },
    title: {
        textAlign: "center",
        fontSize: 26
    },
    card: {
        background: "#fff",
        padding: 20,
        borderRadius: 12,
        marginTop: 20,
        boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
    },
    row: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 8
    },
    inline: {
        marginRight: 10
    },
    btn: {
        marginTop: 10,
        padding: 10,
        background: "#2196F3",
        color: "#fff",
        border: "none",
        borderRadius: 8
    },
    actions: {
        marginTop: 20
    },
    save: {
        background: "green",
        color: "#fff",
        padding: 10,
        borderRadius: 8
    }
};
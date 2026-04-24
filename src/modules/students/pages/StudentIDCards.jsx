import React, { useEffect, useState } from "react";
import Barcode from "react-barcode";
import QRCode from "react-qr-code";

/* ===== SCHOOL CONFIG ===== */
const school = {
    name: "My Public School",
    address: "Bhilwara, Rajasthan",
    phone: "9876543210",
    logo: "https://via.placeholder.com/60",
    sign: "https://via.placeholder.com/80x30?text=Sign",
};

/* ===== TEMPLATES ===== */
const templates = [
    // HORIZONTAL (keep strong ones)
    { name: "Royal Blue", bg: "linear-gradient(135deg,#1e3c72,#2a5298)", accent: "#ffffff", type: "h" },
    { name: "Sunset Gold", bg: "linear-gradient(135deg,#ff8008,#ffc837)", accent: "#000000", type: "h" },
    { name: "Dark Steel", bg: "linear-gradient(135deg,#232526,#414345)", accent: "#ffffff", type: "h" },

    // 🔥 PREMIUM VERTICAL THEMES
    { name: "Purple Royal", bg: "linear-gradient(135deg,#6a11cb,#2575fc)", accent: "#ffffff", type: "v" },

    { name: "Deep Purple", bg: "linear-gradient(135deg,#41295a,#2F0743)", accent: "#e0d4ff", type: "v" },

    { name: "Ocean Blue", bg: "linear-gradient(135deg,#141e30,#243b55)", accent: "#4fc3f7", type: "v" },

    { name: "Cyber Neon", bg: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)", accent: "#00e5ff", type: "v" },

    { name: "Black Gold", bg: "linear-gradient(135deg,#000000,#434343)", accent: "#ffd700", type: "v" },

    { name: "Crimson Red", bg: "linear-gradient(135deg,#8e0e00,#1f1c18)", accent: "#ff5252", type: "v" },

    { name: "Midnight Navy", bg: "linear-gradient(135deg,#000428,#004e92)", accent: "#90caf9", type: "v" },

    { name: "Steel Grey Pro", bg: "linear-gradient(135deg,#485563,#29323c)", accent: "#ffffff", type: "v" },

    { name: "Indigo Glow", bg: "linear-gradient(135deg,#283c86,#45a247)", accent: "#c5cae9", type: "v" },
];
const StudentIDCards = () => {
    const [students, setStudents] = useState([]);
    const [selected, setSelected] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [template, setTemplate] = useState(templates[0]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("students")) || [];
        setStudents(data);
    }, []);

    const toggle = (id) => {
        setSelected(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    /* 🔍 FILTER */
    const filteredStudents = students.filter(s =>
        (s.name || "").toLowerCase().includes(search.toLowerCase()) &&
        (selectedClass ? s.class === selectedClass : true)
    );

    /* ✅ FINAL LIST */
    const list =
        selected.length > 0
            ? students.filter(s => selected.includes(s.id))
            : filteredStudents;

    /* 🔘 ACTIONS */
    const selectAll = () => setSelected(filteredStudents.map(s => s.id));
    const clearAll = () => setSelected([]);

    const handleClassSelect = (cls) => {
        setSelectedClass(cls);
        if (cls === "") return setSelected([]);
        setSelected(students.filter(s => s.class === cls).map(s => s.id));
    };

    const classes = [...new Set(students.map(s => s.class))];

    /* 🔘 3D BUTTON */
    const btn3d = (color) => ({
        background: color,
        color: "#fff",
        border: "none",
        padding: "8px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        boxShadow: "0 4px 0 rgba(0,0,0,0.3)",
    });

    /* ===== CARD ===== */
    const Card = ({ s }) => {
        const isH = template.type === "h";

        return (
            <div
                style={{
                    width: isH ? 360 : 240,
                    height: isH ? 220 : 420, // ✅ vertical fix
                    borderRadius: 14,
                    overflow: "hidden",
                    margin: 10,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
                    background: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    fontSize: 12
                }}
            >
                {/* HEADER */}
                <div style={{
                    background: template.bg,
                    color: template.accent,   // ✅ FINAL FIX
                    padding: "10px 12px",
                    display: "flex",
                    justifyContent: "center",
                    textAlign: "center",
                    alignItems: "center",
                    gap: "6px"
                }}>
                    <div>
                        <div style={{ fontWeight: "bold", fontSize: 13 }}>{school.name}</div>
                        <div style={{ fontSize: 10 }}>{school.address}</div>
                    </div>
                </div>

                {/* BODY */}
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: isH ? "row" : "column",
                    padding: 8,
                    gap: 8
                }}>
                    <div style={{ textAlign: "center" }}>
                        <img
                            src={s.photo || school.logo}
                            style={{
                                width: 90,
                                height: 100,
                                borderRadius: 10,
                                objectFit: "cover"
                            }}
                            alt=""
                        />
                    </div>

                    <div style={{ flex: 1, textAlign: "left", lineHeight: "1.5" }}>
                        <b>{s.name}</b>
                        <div>Class: {s.class} ({s.section})</div>
                        <div>Father: {s.fatherName}</div>
                        <div>Mobile: {s.fatherMobile}</div>
                        <div>Blood: {s.bloodGroup || "-"}</div>
                        <div>ID: {s.id}</div>
                    </div>
                </div>

                {/* FOOTER */}
                <div style={{
                    borderTop: "1px solid #ddd",
                    padding: 8,   // ✅ barcode cut fix
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    minHeight: 70
                }}>
                    <Barcode value={String(s.id)} width={1} height={25} fontSize={10} />
                    <QRCode value={JSON.stringify(s)} size={45} />
                </div>
            </div>
        );
    };

    return (
        <div className="id-page">
            <h2>🎓 Professional ID Card Generator</h2>

            {/* 🔍 TOP BAR */}
            <div className="top-bar" style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "15px"
            }}>
                <input
                    placeholder="🔍 Search student..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select onChange={(e) =>
                    setTemplate(templates.find(t => t.name === e.target.value))
                }>
                    {templates.map(t => <option key={t.name}>{t.name}</option>)}
                </select>

                <select
                    value={selectedClass}
                    onChange={(e) => handleClassSelect(e.target.value)}
                >
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c}>{c}</option>)}
                </select>

                <button onClick={selectAll} style={btn3d("#4CAF50")}>Select All</button>
                <button onClick={clearAll} style={btn3d("#f44336")}>Clear</button>
                <button onClick={() => window.print()} style={btn3d("#2196F3")}>🖨 Print</button>
            </div>

            {/* ✅ SELECTED */}
            <div className="selected-preview">
                {students
                    .filter(s => selected.includes(s.id))
                    .map(s => (
                        <span key={s.id} className="selected-chip">{s.name}</span>
                    ))}
            </div>

            {/* 🆔 PREVIEW */}
            <div className="print-area">
                {list.map(s => (
                    <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

                        {/* ✅ individual select */}
                        <input
                            type="checkbox"
                            checked={selected.includes(s.id)}
                            onChange={() => toggle(s.id)}
                        />

                        <Card s={s} />
                    </div>
                ))}
            </div>

            {/* 📋 LIST */}
            <div className="student-list">
                {filteredStudents.map(s => (
                    <label key={s.id}>
                        <input
                            type="checkbox"
                            checked={selected.includes(s.id)}
                            onChange={() => toggle(s.id)}
                        />
                        {s.name} ({s.class})
                    </label>
                ))}
            </div>

        </div>
    );
};

export default StudentIDCards;
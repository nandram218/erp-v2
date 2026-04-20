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
    { name: "Royal Blue", bg: "linear-gradient(135deg,#1e3c72,#2a5298)", accent: "#0d47a1", type: "h" },
    { name: "Emerald Green", bg: "linear-gradient(135deg,#11998e,#38ef7d)", accent: "#00695c", type: "h" },
    { name: "Sunset Orange", bg: "linear-gradient(135deg,#ff8008,#ffc837)", accent: "#e65100", type: "h" },
    { name: "Dark Pro", bg: "linear-gradient(135deg,#232526,#414345)", accent: "#000", type: "h" },

    { name: "Purple Glow", bg: "linear-gradient(135deg,#6a11cb,#2575fc)", accent: "#4a148c", type: "v" },
    { name: "Red Royal", bg: "linear-gradient(135deg,#c31432,#240b36)", accent: "#880e4f", type: "v" },
    { name: "Sky Light", bg: "linear-gradient(135deg,#56ccf2,#2f80ed)", accent: "#01579b", type: "v" },
    { name: "Clean White", bg: "#ffffff", accent: "#1976d2", type: "v" },
];

const StudentIDCards = () => {
    const [students, setStudents] = useState([]);
    const [selected, setSelected] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [template, setTemplate] = useState(templates[0]);

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

    const list =
        selected.length > 0
            ? students.filter(s => selected.includes(s.id))
            : students;
    // 🔥 ADD FROM HERE

    // Select All
    const selectAll = () => {
        setSelected(students.map(s => s.id));
    };

    // Clear All
    const clearAll = () => {
        setSelected([]);
    };

    // Class wise select
    const handleClassSelect = (cls) => {
        setSelectedClass(cls);

        if (cls === "") {
            setSelected([]);
            return;
        }

        const filtered = students
            .filter(s => s.class === cls)
            .map(s => s.id);

        setSelected(filtered);
    };

    // Unique class list
    const classes = [...new Set(students.map(s => s.class))];


    /* ===== CARD ===== */
    const Card = ({ s }) => {
        const isH = template.type === "h";

        return (
            <div
                className="id-card"
                style={{
                    width: isH ? 360 : 250,
                    height: isH ? 220 : 370,
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
                    color: "#fff",
                    padding: "6px 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                }}>
                    <img src={school.logo} width={35} alt="" />
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

                    {/* PHOTO */}
                    <div style={{ textAlign: "center" }}>
                        <img
                            src={s.photo || "https://via.placeholder.com/100"}
                            style={{
                                width: 90,
                                height: 100,
                                borderRadius: 10,
                                border: `3px solid ${template.accent}`,
                                objectFit: "cover"
                            }}
                            alt=""
                        />
                    </div>

                    {/* DETAILS */}
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontWeight: "bold",
                            fontSize: 14,
                            color: template.accent
                        }}>
                            {s.name}
                        </div>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 4,
                            marginTop: 4
                        }}>
                            <div><b>Class:</b> {s.class}</div>
                            <div><b>Sec:</b> {s.section}</div>
                            <div><b>Father:</b> {s.fatherName}</div>
                            <div><b>Mobile:</b> {s.fatherMobile}</div>
                            <div><b>Blood:</b> {s.bloodGroup || "-"}</div>
                            <div><b>ID:</b> {s.id}</div>
                        </div>

                        <div style={{ marginTop: 4 }}>
                            <b>Address:</b> {s.city || "-"}
                        </div>
                    </div>

                </div>

                {/* FOOTER */}
                <div style={{
                    borderTop: "1px solid #ddd",
                    padding: 6,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>

                    <Barcode
                        value={String(s.id)}
                        width={1}
                        height={25}
                        fontSize={10}
                    />

                    <QRCode value={JSON.stringify(s)} size={45} />

                    <div style={{ textAlign: "center" }}>
                        <img src={school.sign} width={65} alt="" />
                        <div style={{ fontSize: 10 }}>Principal</div>
                        <div style={{ fontSize: 9 }}>{school.phone}</div>
                    </div>

                </div>

            </div>
        );
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>🎓 Professional ID Card Generator</h2>

            {/* TEMPLATE SELECT */}
            <select
                onChange={(e) =>
                    setTemplate(templates.find(t => t.name === e.target.value))
                }
            >
                {templates.map(t => (
                    <option key={t.name}>{t.name}</option>
                ))}
            </select>

            {/* STUDENT SELECT */}
            <div style={{ marginTop: 10 }}>

                {/* ACTION BUTTONS */}
                <div style={{ marginBottom: 10 }}>
                    <button onClick={selectAll}>Select All</button>
                    <button onClick={clearAll} style={{ marginLeft: 5 }}>Clear</button>
                </div>

                {/* CLASS SELECT */}
                <select
                    value={selectedClass}
                    onChange={(e) => handleClassSelect(e.target.value)}
                >
                    <option value="">Select Class</option>
                    {classes.map(c => (
                        <option key={c}>{c}</option>
                    ))}
                </select>

                {/* STUDENT LIST */}
                <div style={{ marginTop: 10, maxHeight: 200, overflow: "auto" }}>
                    {students.map(s => (
                        <label key={s.id} style={{ display: "block" }}>
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

            <button onClick={() => window.print()}>🖨 Print</button>

            {/* CARDS */}
            <div className="print-area">
                {list.map(s => <Card key={s.id} s={s} />)}
            </div>
        </div>
    );
};

export default StudentIDCards;
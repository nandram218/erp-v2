import React, { useEffect, useState } from "react";
import Barcode from "react-barcode";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { useSchoolStore } from "../../../store/schoolStore";
import { getService } from "../../../core/serviceRegistry";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const studentService = getService("student");

/* ===== TEMPLATES ===== */
const templates = [
    { name: "Royal Blue", bg: "linear-gradient(135deg,#1e3c72,#2a5298)", accent: "#ffffff", type: "h" },
    { name: "Sunset Gold", bg: "linear-gradient(135deg,#ff8008,#ffc837)", accent: "#000", type: "h" },
    { name: "Dark Steel", bg: "linear-gradient(135deg,#232526,#414345)", accent: "#fff", type: "h" },

    { name: "Purple Royal", bg: "linear-gradient(135deg,#6a11cb,#2575fc)", accent: "#fff", type: "v" },
    { name: "Deep Purple", bg: "linear-gradient(135deg,#41295a,#2F0743)", accent: "#e0d4ff", type: "v" },
    { name: "Ocean Green", bg: "linear-gradient(135deg,#11998e,#38ef7d)", accent: "#000", type: "v" },
];

const StudentIDCards = () => {

    const { schoolData, loadAll } = useSchoolStore();

    const school =
        schoolData?.schools?.english ||
        schoolData?.schools?.single ||
        schoolData;

    const [students, setStudents] = useState([]);
    const [selected, setSelected] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [template, setTemplate] = useState(templates[0]);
    const [search, setSearch] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        // Removed loadAll() call to fix header state mutation (PRIORITY 2 fix)
        // loadAll() is already called by DashboardLayout and App.js

        try {
            const data = studentService.getStudents();

            if (Array.isArray(data)) {
                setStudents(data);
            } else if (data && typeof data === "object") {
                // 🔥 handle object format
                setStudents(Object.values(data));
            } else {
                setStudents([]);
            }

        } catch (err) {
            console.error("Student Load Error:", err);
            setStudents([]);
        }

    }, []);
    // Phase 4.2.1: Use studentService.normalizeStudentSchema() for schema drift handling
    const getClass = (s) => {
        const normalized = studentService.normalizeStudentSchema(s);
        return normalized.class;
    };
    // Phase 4.2.1: Use studentService.getStudentsFiltered() - PURE FUNCTION
    const filteredStudents = studentService.getStudentsFiltered(students, {
        search,
        class: selectedClass
    });
    const list = Array.isArray(filteredStudents)
    ? filteredStudents.filter(s => s.name)
    : [];
    const toggle = (id) => {
        setSelected(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };
    const selectAll = () => setSelected(filteredStudents.map(s => s.id));
    const clearAll = () => setSelected([]);

    const handleClassSelect = (cls) => {
        setSelectedClass(cls);
        if (cls === "") return setSelected([]);
        // Phase 4.2.1: Use studentService.getStudentsFiltered() - PURE FUNCTION
        const filtered = studentService.getStudentsFiltered(students, { class: cls });
        setSelected(filtered.map(s => s.id));
    };

    const classes = [
        ...new Set(
            students
                .map(getClass)
                .filter(Boolean)
        )
    ];

    const btn3d = (color) => ({
        background: color,
        color: "#fff",
        border: "none",
        padding: "8px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        boxShadow: "0 4px 0 rgba(0,0,0,0.3)",
    });

    /* ===== PRINT ===== */
    const handlePrint = () => window.print();

    /* ===== PDF ===== */
    const handleDownloadPDF = async () => {
        const input = document.getElementById("print-section");
        if (!input) return;

        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save("student-id-cards.pdf");
    };

    /* ===== CARD ===== */
    const Card = ({ s }) => {
        const isH = template.type === "h";

        if (!school?.name) {

            return <div>Loading school...</div>;
        }

        return (

            <div className="id-card" style={{
                width: isH ? 320 : 260,
                height: isH ? 230 : 420,
                borderRadius: 14,
                margin: 10,
                boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                background: "#fff"
            }}>

                {/* HEADER */}
                <div style={{
                    background: template.bg,
                    color: template.accent,
                    padding: "8px",
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: "bold"
                }}>
                    {school?.name}
                    <div style={{ fontSize: 10 }}>{school?.address}</div>
                </div>

                {/* BODY */}
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",   // 🔥 FORCE TOP CENTER LAYOUT
                    alignItems: "center",
                    padding: 8,
                    gap: 4
                }}>

                    {/* PHOTO TOP CENTER */}
                    <img
                        src={s.photo || school?.logo}
                        style={{
                            width: 80,
                            height: 90,
                            borderRadius: 10,
                            objectFit: "cover"
                        }}
                        alt=""
                    />

                    {/* NAME BELOW PHOTO */}
                    <div style={{ fontWeight: "bold", fontSize: 13 }}>
                        {s.name}
                    </div>

                    {/* DETAILS */}
                    <div style={{
                        fontSize: 10,
                        lineHeight: "1.4",
                        textAlign: "left",
                        width: "100%"
                    }}>
                        Father: {s.fatherName}<br />
                        Class: {getClass(s)}<br />
                        Contact: {s.fatherMobile || "N/A"}<br />
                        Blood: {s.bloodGroup || "-"}<br />
                        Address: {s.address || "N/A"}<br />
                        ID: {s.id}
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
                    <Barcode value={String(s.id)} width={1} height={25} />
                    <QRCode value={JSON.stringify(s)} size={40} />
                </div>

                {/* SELECT */}
                <div style={{ textAlign: "center", padding: 5 }}>
                    <input
                        type="checkbox"
                        checked={selected.includes(s.id)}
                        onChange={() => toggle(s.id)}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="id-page">

            <h2 style={{ textAlign: "center" }}>
                🎓 Professional ID Card Generator
            </h2>

            {/* TOP BAR */}

            <div className="top-bar">

                <button style={btn3d("#000")} onClick={() => navigate(-1)}>⬅ Back</button>

                <input placeholder="Search" onChange={(e) => setSearch(e.target.value)} />

                <select onChange={(e) =>
                    setTemplate(templates.find(t => t.name === e.target.value))
                }>
                    {templates.map(t => <option key={t.name}>{t.name}</option>)}
                </select>

                <select onChange={(e) => handleClassSelect(e.target.value)}>
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c}>{c}</option>)}
                </select>

                <button onClick={selectAll} style={btn3d("#4CAF50")}>Select All</button>
                <button onClick={clearAll} style={btn3d("#f44336")}>Clear</button>

                {/* 🔥 NEW BUTTONS */}
                <button onClick={handlePrint} style={btn3d("#2563eb")}>Print</button>
                <button onClick={handleDownloadPDF} style={btn3d("#9333ea")}>PDF</button>

            </div>

            {/* PRINT SECTION */}
            <div id="print-section" className="print-area">

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    justifyItems: "center"
                }}>
                    {list.filter(s => template.type === "h").map(s => (
                        <Card key={s.id} s={s} />
                    ))}
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    justifyItems: "center",
                    marginTop: 20
                }}>
                    {list.filter(s => template.type === "v").map(s => (
                        <Card key={s.id} s={s} />
                    ))}

                </div>

            </div>
        </div>
    );
};

export default StudentIDCards;
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSchoolStore } from "../../../store/schoolStore";
import { getService } from "../../../core/serviceRegistry";

const studentService = getService("student");

const btn3D = (bg, small = false) => ({
    background: bg,
    color: "#fff",
    border: "none",
    padding: small ? "6px 10px" : "12px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: small ? "11px" : "13px",
    boxShadow: "0 5px 0 rgba(0,0,0,0.5)",
    minWidth: small ? "120px" : "180px",
    height: small ? "35px" : "50px"
});

const cardStyle = (color) => ({
    flex: 1,
    background: `linear-gradient(145deg, ${color}, #111)`,
    color: "#fff",
    padding: "14px",
    borderRadius: "12px",
    boxShadow: "0 6px 0 rgba(0,0,0,0.4)",
    fontWeight: "700",
    textAlign: "center",
    minWidth: "180px",
    height: "80px"
});

const StudentPage = () => {
    // Phase 4.2.1: Move useSchoolStore to top level (React Hook rules)
    const students = useSchoolStore(state => state.students) || [];

    const navigate = useNavigate();
   
    const [search, setSearch] = useState("");
    const [cls, setCls] = useState("");
    const [category, setCategory] = useState("");
    const [gender, setGender] = useState("");
    const [transport, setTransport] = useState("");
    const [route, setRoute] = useState("");
    const [hostel, setHostel] = useState("");

    const filtered = useMemo(() => {
        // Phase 4.2.1: Use studentService.getStudentsFiltered() - PURE FUNCTION
        return studentService.getStudentsFiltered(students, {
            search,
            class: cls,
            category,
            gender,
            transport,
            route,
            hostel
        });
    }, [students, search, cls, category, gender, transport, route, hostel]);

    const kpis = useMemo(() => {
        // Phase 4.2.1: Use studentService.getStudentKPIs() - PURE FUNCTION
        return studentService.getStudentKPIs(filtered);
    }, [filtered]);

    const total = kpis.total;
    const transportCount = kpis.transportCount;
    const hostelCount = kpis.hostelCount;
    const absent = kpis.absent;

    const handlePrint = () => window.print();

    return (

        <div style={{
            padding: "12px 18px",
            background: "#f3f6ff",
            minHeight: "100vh"
        }}>

            {/* BACK */}
            <button style={btn3D("#111", true)} onClick={() => navigate(-1)}>
                ⬅ Back to Dashboard
            </button>
            {/* TITLE */}
            <h2 style={{
                textAlign: "center",
                margin: "10px 0 15px 0",
                fontSize: "26px",
                fontWeight: "800"
            }}>
                STUDENTS MODULE
            </h2>

            {/* 🔥 CENTER 4 BIG BUTTONS */}
            <div style={{
                display: "flex",
                justifyContent: "center",
                gap: "15px",
                flexWrap: "wrap",
                marginBottom: "18px"
            }}>

                <button style={btn3D("#4caf50")} onClick={() => navigate("/students/add")}>
                    ➕ Add Student
                </button>

                <button style={btn3D("#2196f3")} onClick={() => navigate("/students/list")}>
                    📋 Student List
                </button>

                <button style={btn3D("#ff9800")} onClick={() => navigate("/students/idcards")}>
                    🪪 ID Cards
                </button>

                <button style={btn3D("#9c27b0")} onClick={() => navigate("/certificate-selector")}>
                    🎖 Certificates
                </button>

            </div>

            {/* KPI */}
            <div style={{
                display: "flex",
                gap: "10px",
                marginBottom: "12px"
            }}>
                <div style={cardStyle("#1e3a8a")}>Total<br />{total}</div>
                <div style={cardStyle("#065f46")}>Transport<br />{transportCount}</div>
                <div style={cardStyle("#991b1b")}>Absent<br />{absent}</div>
                <div style={cardStyle("#6d28d9")}>Hostel<br />{hostelCount}</div>
            </div>

            {/* FILTER */}
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "12px",
                alignItems: "center"
            }}>

                <input placeholder="Search..." value={search}
                    onChange={e => setSearch(e.target.value)} />

                <select onChange={e => setCls(e.target.value)}>
                    <option value="">Class</option>
                    {[...new Set(students.map(s => s.class))].map(c =>
                        <option key={c}>{c}</option>
                    )}
                </select>

                <select onChange={e => setCategory(e.target.value)}>
                    <option value="">Category</option>
                    <option>General</option>
                    <option>OBC</option>
                    <option>SC</option>
                </select>

                <select onChange={e => setGender(e.target.value)}>
                    <option value="">Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                </select>

                <select onChange={e => setTransport(e.target.value)}>
                    <option value="">Transport</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>

                <select onChange={e => setHostel(e.target.value)}>
                    <option value="">Hostel</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>

                <button onClick={() => {
                    setSearch(""); setCls(""); setCategory("");
                    setGender(""); setTransport("");
                    setHostel(""); setRoute("");
                }}>
                    Reset
                </button>

                <button onClick={handlePrint}>
                    🖨 Print Report
                </button>

            </div>

            {/* TABLE */}
            <div style={{ overflowX: "auto" }}>

                <table width="100%" cellPadding="10"
                    style={{
                        borderCollapse: "collapse",
                        border: "2px solid #3b82f6",
                        background: "#fff",
                        borderRadius: "10px",
                        overflow: "hidden"
                    }}>

                    <thead style={{ background: "#e0e7ff" }}>
                        <tr>
                            <th style={{ border: "1px solid #93c5fd" }}>Name</th>
                            <th style={{ border: "1px solid #93c5fd" }}>Class</th>
                            <th style={{ border: "1px solid #93c5fd" }}>Gender</th>
                            <th style={{ border: "1px solid #93c5fd" }}>Category</th>
                            <th style={{ border: "1px solid #93c5fd" }}>Transport</th>
                            <th style={{ border: "1px solid #93c5fd" }}>Hostel</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filtered.map((s, i) => (
                            <tr key={i}>
                                <td style={{ border: "1px solid #c7d2fe" }}>{s.name}</td>
                                <td style={{ border: "1px solid #c7d2fe" }}>{s.class}</td>
                                <td style={{ border: "1px solid #c7d2fe" }}>{s.gender}</td>
                                <td style={{ border: "1px solid #c7d2fe" }}>{s.category}</td>
                                <td style={{ border: "1px solid #c7d2fe" }}>{s.transport ? "Yes" : "No"}</td>
                                <td style={{ border: "1px solid #c7d2fe" }}>{s.hostel ? "Yes" : "No"}</td>
                            </tr>
                        ))}
                    </tbody>

                </table>

            </div>

        </div>
    );
};

export default StudentPage;
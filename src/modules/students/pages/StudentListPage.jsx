import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentTable from "../components/StudentTable";
import { useSchoolStore } from "../../../store/schoolStore";

import { getService } from "../../../core/serviceRegistry";
const studentService = getService("student");
const searchBox3D = {
    width: "240px",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "2px solid #111",
    boxShadow: `
        inset 2px 2px 6px rgba(0,0,0,0.35),
        inset -2px -2px 6px rgba(255,255,255,0.7)
    `,
    background: "#ffffff",
    fontWeight: "600",
    fontSize: "13px",
    color: "#111",
    outline: "none"
};
const btn3D = (bg) => ({
    background: bg,
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
    boxShadow: "0 5px 0 rgba(0,0,0,0.5)",
    transition: "0.2s"
});

const input3D = {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #1a237e",
    outline: "none",
    fontWeight: "600",
    boxShadow: "inset 0 3px 6px rgba(0,0,0,0.3)",
    background: "#f5f7ff",
    fontSize: "13px"
};
const StudentList = () => {

    const navigate = useNavigate();
    const students = useSchoolStore(state => state.students) || [];

    const [selectedIds, setSelectedIds] = useState([]);
    const [search, setSearch] = useState("");

    const [filters, setFilters] = useState({
        class: "",
        gender: "",
        category: "",
        hostel: "",
        transport: "",
        rte: "",
        route: ""
    });

    // ⭐ ROUTES
    const routes = [
        "Route 1", "Route 2", "Route 3", "Route 4", "Route 5",
        "Route 6", "Route 7", "Route 8", "Route 9", "Route 10"
    ];

    // ⭐ SELECT SINGLE
    const handleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    };

    // ⭐ SELECT ALL
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(filteredStudents.map(s => s.id));
        } else {
            setSelectedIds([]);
        }
    };

    // ⭐ FILTER CHANGE
    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    // ⭐ SMART SEARCH + FILTER (FINAL)
    // Phase 4.2.1: Use studentService.getStudentsFiltered() - PURE FUNCTION
    const filteredStudents = studentService.getStudentsFiltered(students, {
        search,
        class: filters.class,
        gender: filters.gender,
        category: filters.category,
        hostel: filters.hostel,
        transport: filters.transport,
        route: filters.route,
        rte: filters.rte
    });

    // ⭐ AUTO CLASS LIST
    const classList = [...new Set(students.map(s => s.class))];

    return (
        <div style={{ padding: "10px" }}>
            <button onClick={() => navigate("/students/idcards")}>
                Generate ID Cards
            </button>
            {/* 🔥 TOOLBAR */}
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                alignItems: "center",
                marginBottom: "10px",

                padding: "10px",
                borderRadius: "12px",

                background: "linear-gradient(145deg, #f1f5f9, #e2e8f0)",
                border: "2px solid #0f2f6b",

                boxShadow: `
        inset 2px 2px 6px rgba(0,0,0,0.55),
        inset -2px -2px 6px rgba(255,255,255,0.04)
    `
            }}>

                {/* BACK */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>

                    <button
                        style={btn3D("#000")}
                        onClick={() => navigate(-1)}
                        onMouseDown={(e) => e.currentTarget.style.transform = "translateY(2px)"}
                        onMouseUp={(e) => e.currentTarget.style.transform = "translateY(0px)"}
                    >
                        ⬅ Back
                    </button>

                    <button
                        style={btn3D("#1b5e20")}
                        onClick={() => window.print()}
                        onMouseDown={(e) => e.currentTarget.style.transform = "translateY(2px)"}
                        onMouseUp={(e) => e.currentTarget.style.transform = "translateY(0px)"}
                    >
                        🖨 Print Report
                    </button>

                </div>
                {/* SEARCH */}
                <input
                    type="text"
                    placeholder="🔍 Search name / mobile / adm no"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={searchBox3D}
                />

                {/* CLASS */}
                <select
                    value={filters.class}
                    onChange={(e) => handleFilterChange("class", e.target.value)}
                >
                    <option value="">All Class</option>
                    {classList.map((c, i) => (
                        <option key={i} value={c}>Class {c}</option>
                    ))}
                </select>

                {/* GENDER */}
                <select onChange={(e) => handleFilterChange("gender", e.target.value)}>
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>

                {/* CATEGORY */}
                <select onChange={(e) => handleFilterChange("category", e.target.value)}>
                    <option value="">Category</option>
                    <option value="GEN">GEN</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                </select>

                {/* HOSTEL */}
                <select
                    value={filters.hostel}
                    onChange={(e) => handleFilterChange("hostel", e.target.value)}
                >
                    <option value="">All Hostel</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>

                {/* TRANSPORT */}
                <select
                    value={filters.transport}
                    onChange={(e) => {
                        handleFilterChange("transport", e.target.value);
                        if (e.target.value !== "Yes") {
                            handleFilterChange("route", "");
                        }
                    }}
                >
                    <option value="">All Transport</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
                {/* ROUTE (CONDITIONAL) */}
                {filters.transport === "Yes" && (
                    <select
                        value={filters.route}
                        onChange={(e) => handleFilterChange("route", e.target.value)}
                    >
                        <option value="">Select Route</option>
                        {routes.map((r, i) => (
                            <option key={i} value={r}>{r}</option>
                        ))}
                    </select>
                )}

                {/* RTE */}
                <select onChange={(e) => handleFilterChange("rte", e.target.value)}>
                    <option value="">RTE</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>

                {/* RESET */}
                <button onClick={() => {
                    setSearch("");
                    setFilters({
                        class: "",
                        gender: "",
                        category: "",
                        hostel: "",
                        transport: "",
                        rte: "",
                        route: ""
                    });
                }}>
                    Reset
                </button>

                <span style={{ marginLeft: "auto", fontWeight: "bold" }}>
                    Total: {filteredStudents.length}
                </span>

            </div>

            {/* TABLE */}
            <StudentTable
                students={filteredStudents}
                selectedIds={selectedIds}
                handleSelect={handleSelect}
                handleSelectAll={handleSelectAll}
            />

        </div>
    );
};

export default StudentList;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentTable from "../components/StudentTable";

const StudentList = () => {

    const navigate = useNavigate();

    const [students] = useState(
        JSON.parse(localStorage.getItem("students")) || []
    );

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
    const query = search.toLowerCase();

    let filteredStudents = students.filter(s => {
        return (
            (!search ||
                s.name?.toLowerCase().includes(query) ||
                s.mobile?.toLowerCase().includes(query) ||
                s.mobileNo?.toLowerCase().includes(query) ||
                s.admissionNo?.toLowerCase().includes(query)
            ) &&
            (!filters.class || String(s.class) === String(filters.class)) &&
            (!filters.gender || s.gender === filters.gender) &&
            (!filters.category || s.category === filters.category) &&
            (!filters.hostel || s.hostel === filters.hostel) &&
            (!filters.transport || s.transport === filters.transport) &&
            (!filters.rte || String(s.RTE) === filters.rte) &&
            (!filters.route || s.route === filters.route)
        );
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
                marginBottom: "10px"
            }}>

                {/* BACK */}
                <button onClick={() => navigate(-1)}>⬅ Back</button>

                {/* SEARCH */}
                <input
                    placeholder="Search name / mobile / adm no"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ padding: "5px" }}
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
                <select onChange={(e) => handleFilterChange("hostel", e.target.value)}>
                    <option value="">Hostel</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>

                {/* TRANSPORT */}
                <select
                    onChange={(e) => {
                        handleFilterChange("transport", e.target.value);
                        if (e.target.value !== "Yes") {
                            handleFilterChange("route", "");
                        }
                    }}
                >
                    <option value="">Transport</option>
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
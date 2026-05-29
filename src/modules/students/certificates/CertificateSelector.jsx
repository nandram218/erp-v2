import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTemplates } from "./certificateTemplates";
import "./CertificateSelector.css";

const CertificateSelector = () => {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedType, setSelectedType] = useState("");
    const [selectedClass, setSelectedClass] = useState("");

    const navigate = useNavigate();

    // ✅ FIXED: ERP_DB SAFE LOAD
    useEffect(() => {
        const db = JSON.parse(localStorage.getItem("ERP_DB") || "{}");
        setStudents(db.students || []);
    }, []);

    const templates = getTemplates();

    // 🔍 FILTER
    const filtered = students.filter((s) => {
        return (
            (s.name || "").toLowerCase().includes(search.toLowerCase()) &&
            (selectedClass ? s.class === selectedClass : true)
        );
    });

    // ☑️ TOGGLE SELECT
    const toggle = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    };

    // 🚀 GENERATE
    const handleGenerate = () => {
        if (selectedIds.length === 0 || !selectedType) {
            alert("Select student & certificate type");
            return;
        }

        const selectedStudents = students.filter((s) =>
            selectedIds.includes(s.id)
        );

        navigate("/certificate", {
            state: {
                students: selectedStudents,
                type: selectedType
            }
        });
    };

    return (
        <div className="cert-page">

            {/* 🎖 CERTIFICATE TYPES */}
            <h3 className="section-title">🎖 Select Certificate Type</h3>

            <div className="cert-grid">
                {Object.keys(templates).map((key) => (
                    <div
                        key={key}
                        className={`cert-btn ${selectedType === key ? "active" : ""}`}
                        onClick={() => setSelectedType(key)}
                    >
                        {templates[key].title}
                    </div>
                ))}
            </div>

            {/* 🔍 SEARCH + FILTER */}
            <div className="top-bar">

                <input
                    className="search-box"
                    placeholder="🔍 Search student..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    className="filter-box"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                >
                    <option value="">All Classes</option>
                    {[...new Set(students.map(s => s.class))].map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>

            </div>

            {/* 🟣 SELECTED STUDENTS */}
            <div className="selected-preview">

                {selectedIds.length > 0 && <h4>Selected Students:</h4>}

                {students
                    .filter((s) => selectedIds.includes(s.id))
                    .map((s) => (
                        <span key={s.id} className="selected-chip">
                            {s.name}
                        </span>
                    ))}

                <div className="top-actions">
                    <button
                        className="action-btn"
                        onClick={() => navigate(-1)}
                    >
                        ⬅ Back
                    </button>
                </div>
            </div>

            {/* 🚀 GENERATE */}
            <div className="generate-wrapper">
                <button className="generate-btn" onClick={handleGenerate}>
                    🚀 Generate Certificate
                </button>
            </div>

            {/* ☑️ SELECT ALL */}
            <div className="select-all">
                <label>
                    <input
                        type="checkbox"
                        checked={
                            filtered.length > 0 &&
                            filtered.every((s) => selectedIds.includes(s.id))
                        }
                        onChange={(e) => {
                            if (e.target.checked) {
                                setSelectedIds(filtered.map((s) => s.id));
                            } else {
                                setSelectedIds([]);
                            }
                        }}
                    />
                    Select All
                </label>
            </div>

            {/* 👨‍🎓 STUDENT LIST */}
            <div className="student-list">
                {filtered.map((s) => (
                    <div key={s.id} className="student-card">

                        <label>
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(s.id)}
                                onChange={() => toggle(s.id)}
                            />
                            <span>{s.name}</span>
                        </label>

                        <small>Class {s.class}</small>

                    </div>
                ))}
            </div>

        </div>
    );
};

export default CertificateSelector;
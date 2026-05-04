import React, { useState } from "react";
import { academicService } from "./academicService";
import { useAcademicStore } from "./academicStore";
import { useNavigate } from "react-router-dom";
export default function AcademicSettings() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        subjectMode: "",
        examPattern: "",
        feeMapping: "",
        attendanceRule: "",
        timetableType: "",
        language: "",
        gradingSystem: "",
        coCurricular: "",
        sessionType: "",
        customNote: ""
    });
    const { setSettings } = useAcademicStore();
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        const res = await academicService.saveSettings(form);

        if (res.success) {
            setSettings(form);   // 🔥 GLOBAL UPDATE
            alert("Saved");
        }
    };

    return (

        <div className="academic-bg">
            <div className="container">
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 15
                }}>

                    {/* ⬅ BACK TO MASTER */}
                    <button
                        onClick={() => navigate("/master-setting")}
                        style={{
                            padding: "10px 16px",
                            borderRadius: "12px",
                            border: "none",
                            color: "#fff",
                            cursor: "pointer",
                            fontWeight: "600",
                            background: "linear-gradient(145deg, #111827, #000000)",
                            boxShadow: "6px 6px 12px rgba(0,0,0,0.7)"
                        }}
                    >
                        ⬅ Master
                    </button>

                    <h2 style={{ color: "#facc15" }}>🎓 Academic Setup</h2>

                    {/* 🏠 DASHBOARD */}
                    <button
                        onClick={() => navigate("/dashboard")}
                        style={{
                            padding: "10px 16px",
                            borderRadius: "12px",
                            border: "none",
                            color: "#fff",
                            cursor: "pointer",
                            fontWeight: "600",
                            background: "linear-gradient(145deg, #a855f7, #6b21a8)",
                            boxShadow: "6px 6px 12px rgba(0,0,0,0.6)"
                        }}
                    >
                        🏠 Dashboard
                    </button>

                </div>
                <h1 className="title">⚙ System Configuration</h1>

                <p className="warning">
                    ⚠ This section defines system rules only. Do NOT enter actual data like subjects, fees or exams.
                </p>

                <div className="grid">

                    {/* SUBJECT MODE */}
                    <div>
                        <label>Subject Structure</label>
                        <select name="subjectMode" onChange={handleChange}>
                            <option value="">Select Mode</option>
                            <option value="central">Central Subject Pool</option>
                            <option value="classwise">Class-wise Subjects</option>
                        </select>
                        <small>Controls how subjects will be assigned in system</small>
                    </div>

                    {/* EXAM PATTERN */}
                    <div>
                        <label>Exam Pattern</label>
                        <select name="examPattern" onChange={handleChange}>
                            <option value="">Select Pattern</option>
                            <option value="term">Term System (Term1 + Term2)</option>
                            <option value="annual">Annual System</option>
                            <option value="continuous">Continuous Assessment</option>
                        </select>
                        <small>Defines exam structure only (not actual exams)</small>
                    </div>

                    {/* FEE MAPPING */}
                    <div>
                        <label>Fee Mapping Type</label>
                        <select name="feeMapping" onChange={handleChange}>
                            <option value="">Select Type</option>
                            <option value="class">Class Wise</option>
                            <option value="student">Student Wise</option>
                            <option value="category">Category Wise</option>
                        </select>
                        <small>Defines how fees will be applied</small>
                    </div>

                    {/* ATTENDANCE */}
                    <div>
                        <label>Minimum Attendance Rule</label>
                        <select name="attendanceRule" onChange={handleChange}>
                            <option value="">Select %</option>
                            <option value="75">75%</option>
                            <option value="80">80%</option>
                            <option value="85">85%</option>
                            <option value="90">90%</option>
                        </select>
                        <small>Used for exam eligibility</small>
                    </div>

                    {/* TIMETABLE */}
                    <div>
                        <label>Timetable Type</label>
                        <select name="timetableType" onChange={handleChange}>
                            <option value="">Select Type</option>
                            <option value="fixed">Fixed</option>
                            <option value="rotational">Rotational</option>
                            <option value="auto">Auto Generated</option>
                        </select>
                        <small>Controls scheduling behavior</small>
                    </div>

                    {/* LANGUAGE */}
                    <div>
                        <label>System Language</label>
                        <select name="language" onChange={handleChange}>
                            <option value="">Select Language</option>
                            <option value="english">English</option>
                            <option value="hindi">Hindi</option>
                            <option value="both">Bilingual</option>
                        </select>
                    </div>

                    {/* GRADING */}
                    <div>
                        <label>Grading System</label>
                        <select name="gradingSystem" onChange={handleChange}>
                            <option value="">Select System</option>
                            <option value="marks">Marks Based</option>
                            <option value="cgpa">CGPA</option>
                            <option value="grade">Grade Only</option>
                        </select>
                    </div>

                    {/* CO-CURRICULAR */}
                    <div>
                        <label>Co-Curricular Activities</label>
                        <select name="coCurricular" onChange={handleChange}>
                            <option value="">Select Option</option>
                            <option value="enabled">Enabled</option>
                            <option value="disabled">Disabled</option>
                        </select>
                    </div>

                    {/* SESSION TYPE */}
                    <div>
                        <label>Academic Session Type</label>
                        <select name="sessionType" onChange={handleChange}>
                            <option value="">Select</option>
                            <option value="yearly">Yearly (2026-27)</option>
                            <option value="semester">Semester Based</option>
                        </select>
                    </div>

                    {/* CUSTOM FIELD (WITH EXAMPLE) */}
                    <div>
                        <label>Custom Rule (Optional)</label>
                        <input
                            name="customNote"
                            placeholder="Example: Practical exams mandatory for science classes"
                            onChange={handleChange}
                        />
                        <small>Optional note for internal rule reference</small>
                    </div>

                </div>

                <div className="btn-area">
                    <button className="btn save" onClick={handleSave}>💾 Save</button>
                    <button className="btn reset" onClick={() => window.location.reload()}>🔄 Reset</button>
                </div>
            </div>

            {/* STYLE */}
            <style>{`
                .academic-bg {
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: linear-gradient(135deg, #1e3c72, #2a5298);
                    padding: 20px;
                }

                .container {
                    width: 100%;
                    max-width: 1100px;
                    background: rgba(255,255,255,0.08);
                    backdrop-filter: blur(15px);
                    border-radius: 20px;
                    padding: 30px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.4);
                }

                .title {
                    text-align: center;
                    color: white;
                    margin-bottom: 10px;
                }

                .warning {
                    text-align: center;
                    color: #ffd54f;
                    margin-bottom: 20px;
                    font-size: 14px;
                }

                .grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 15px;
                }

                label {
                    color: white;
                    font-size: 14px;
                }

                select, input {
                    width: 100%;
                    padding: 10px;
                    border-radius: 8px;
                    border: none;
                    margin-top: 5px;
                }

                small {
                    color: #ccc;
                    font-size: 11px;
                }

                .btn-area {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-top: 25px;
                }

                .btn {
                    padding: 12px 25px;
                    border-radius: 10px;
                    border: none;
                    cursor: pointer;
                    font-weight: bold;
                }

                .save {
                    background: linear-gradient(45deg, #00c853, #64dd17);
                    color: white;
                }

                .reset {
                    background: linear-gradient(45deg, #ff3d00, #ff6d00);
                    color: white;
                }
            `}</style>
        </div>
    );
}
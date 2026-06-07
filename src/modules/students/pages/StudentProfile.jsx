import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSchoolStore } from "../../../store/schoolStore";
import { getService } from "../../../core/serviceRegistry";

const studentService = getService("student");

const StudentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const { schoolData, loadAll } = useSchoolStore();
    useEffect(() => {
        // Phase 4.1: Use studentService instead of direct storage access
        const found = studentService.getStudentById(id);
        setStudent(found);
    }, [id]);
    useEffect(() => {
        loadAll();
    }, []);
    if (!student) return <div style={{ padding: 20 }}>Loading...</div>;

    /* 🎨 DARK POLISHED THEME */
    const section = (borderColor) => ({
        marginBottom: "18px",
        padding: "16px",
        borderRadius: "14px",
        background: "#1f2937",
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
        color: "#e5e7eb"
    });

    const label = {
        fontWeight: "600",
        color: "#93c5fd"
    };

    const btn3d = (bg) => ({
        padding: "8px 16px",
        background: bg,
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        boxShadow: "0 4px 0 rgba(0,0,0,0.5)"
    });
    const school =
        schoolData?.schools?.english ||
        schoolData?.schools?.single ||
        schoolData || {};
    console.log("schoolData 👉", schoolData);
    return (
        <div style={{
            padding: "30px",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f5f7fa, #e4ebf5)"
        }}>

            {/* 🔝 TOP BAR */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px"
            }}>
                <button onClick={() => navigate(-1)} style={btn3d("#2563eb")}>
                    ⬅ Back
                </button>

                <button onClick={() => window.print()} style={btn3d("#16a34a")}>
                    🖨 Print
                </button>
            </div>

            {/* MAIN CARD */}
            <div style={{
                maxWidth: "950px",
                margin: "auto",
                background: "#111827",
                borderRadius: "18px",
                overflow: "hidden",
                boxShadow: "0 15px 40px rgba(0,0,0,0.6)",
                border: "2px solid #374151"
            }}>

                {/* HEADER */}
                <div style={{
                    background: "linear-gradient(90deg,#4f46e5,#3b82f6)",
                    color: "#fff",
                    padding: "22px",
                    textAlign: "center",
                    borderBottom: "2px solid #1e40af"
                }}>
                    <h2 style={{ margin: 0, letterSpacing: "1px" }}>
                        🏫 {school?.name || school?.schoolName || "Your School Name"}
                    </h2>
                    <p style={{ margin: 0, opacity: 0.9 }}>
                        Student Profile
                    </p>
                </div>

                {/* ID STRIP */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 20px",
                    background: "#1e293b",
                    borderBottom: "1px solid #374151",
                    color: "#cbd5f5"
                }}>
                    <div style={{ fontWeight: "600" }}>
                        🆔 Student ID: {student.studentId}
                    </div>

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(student.studentId);
                            alert("ID Copied!");
                        }}
                        style={btn3d("#3b82f6")}
                    >
                        Copy
                    </button>
                </div>

                {/* PROFILE TOP */}
                <div style={{
                    display: "flex",
                    gap: "20px",
                    padding: "20px",
                    alignItems: "center",
                    background: "#111827",
                    borderBottom: "1px solid #374151"
                }}>
                    <img
                        src={student.photoPreview || "https://via.placeholder.com/120"}
                        alt=""
                        style={{
                            width: 120,
                            height: 120,
                            borderRadius: "12px",
                            objectFit: "cover",
                            border: "3px solid #3b82f6",
                            boxShadow: "0 0 12px #3b82f6"
                        }}
                    />

                    <div style={{ flex: 1, color: "#e5e7eb" }}>
                        <h3 style={{ margin: 0, color: "#60a5fa" }}>
                            {student.name}
                        </h3>
                        <p>Admission No: {student.admissionNo}</p>
                        <p>Class: {student.class} - {student.section}</p>
                        <p>Category: {student.category}</p>
                        <p>Mobile: {student.mobile}</p>
                        <p>RTE: {student.RTE ? "Yes" : "No"}</p>
                    </div>
                </div>

                <div style={{ padding: "20px" }}>

                    {/* FAMILY */}
                    <div style={section("#3b82f6")}>
                        <h4>👨‍👩‍👧 Family Details</h4>
                        <p><span style={label}>Father:</span> {student.fatherName}</p>
                        <p><span style={label}>Mother:</span> {student.motherName}</p>
                        <p><b>WhatsApp:</b> {student.whatsapp}</p>
                    </div>

                    {/* ID */}
                    <div style={section("#f59e0b")}>
                        <h4>🆔 Identity</h4>
                        <p><span style={label}>Aadhaar:</span> {student.aadhar}</p>
                        <p><span style={label}>Jan Aadhar:</span> {student.janAadhar}</p>
                        <p><span style={label}>APAR ID:</span> {student.aparId}</p>
                    </div>

                    {/* ACADEMIC */}
                    <div style={section("#8b5cf6")}>
                        <h4>📚 Academic</h4>
                        <p><span style={label}>Previous School:</span> {student.previousSchool}</p>
                        <p><span style={label}>Last Class:</span> {student.lastClass}</p>
                        <p><span style={label}>TC No:</span> {student.tcNo}</p>
                    </div>

                    {/* TRANSPORT */}
                    <div style={section("#22c55e")}>
                        <h4>🚌 Transport / Hostel</h4>
                        <p>Transport: {student.transport ? `Yes (${student.route || "No"})` : "No"}</p>
                        <p>Fee: ₹{student.transportFee}</p>
                        <p>Hostel: {student.hostel ? "Yes" : "No"}</p>
                        <p>Hostel Fee: ₹{student.hostelFee}</p>
                    </div>

                    {/* ADDRESS + FEES */}
                    <div style={section("#ef4444")}>
                        <h4>📍 Address</h4>
                        <p><b>Permanent:</b> {student.permanentAddress}</p>
                        <p><b>Current:</b> {student.currentAddress}</p>

                        <h4 style={{ marginTop: "10px" }}>💰 Fees</h4>
                        <p>Tuition: ₹{student.tuitionFee}</p>
                        <p>Total: ₹{student.totalFee}</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
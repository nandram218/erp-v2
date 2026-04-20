import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const StudentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("students")) || [];
        const found = data.find((s) => s.id === Number(id));
        setStudent(found);
    }, [id]);

    if (!student) return <div style={{ padding: 20 }}>Loading...</div>;

    // 🎨 Colorful sections
    const section = (bg) => ({
        marginBottom: "20px",
        padding: "18px",
        borderRadius: "14px",
        background: bg,
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        color: "#333"
    });

    const label = {
        fontWeight: "600",
        color: "#1a237e"
    };

    return (
        <div style={{
            padding: "30px",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea, #764ba2)"
        }}>

            {/* 🔥 TOP BAR (Back + Print) */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px"
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        padding: "8px 16px",
                        background: "#3f51b5",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                >
                    ⬅ Back
                </button>

                <button
                    onClick={() => window.print()}
                    style={{
                        padding: "8px 16px",
                        background: "#00c853",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer"
                    }}
                >
                    🖨 Print
                </button>
            </div>

            {/* MAIN CARD */}
            <div style={{
                maxWidth: "900px",
                margin: "auto",
                background: "#ffffff",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
            }}>

                {/* HEADER */}
                <div style={{
                    background: "linear-gradient(90deg, #ff6a00, #ee0979)",
                    color: "#fff",
                    padding: "20px",
                    textAlign: "center"
                }}>
                    <h2 style={{ margin: 0 }}>🏫 Your School Name</h2>
                    <p style={{ margin: 0 }}>Student Profile</p>
                </div>

                {/* PROFILE TOP */}
                <div style={{
                    display: "flex",
                    gap: "20px",
                    padding: "20px",
                    alignItems: "center",
                    background: "#f4f7ff"
                }}>
                    <img
                        src={student.photoPreview || "https://via.placeholder.com/120"}
                        alt=""
                        style={{
                            width: 120,
                            height: 120,
                            borderRadius: "15px",
                            objectFit: "cover",
                            border: "3px solid #3f51b5"
                        }}
                    />

                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, color: "#1a237e" }}>{student.name}</h3>
                        <p>Admission No: {student.admissionNo}</p>
                        <p>Class: {student.class} - {student.section}</p>
                        <p>Category: {student.category}</p>
                        <p>Mobile: {student.mobile}</p>
                        <p>RTE: {student.RTE ? "Yes" : "No"}</p>
                    </div>
                </div>

                <div style={{ padding: "20px" }}>

                    {/* FAMILY */}
                    <div style={section("linear-gradient(135deg,#e3f2fd,#bbdefb)")}>
                        <h4>👨‍👩‍👧 Family Details</h4>
                        <p><span style={label}>Father:</span> {student.fatherName}</p>
                        <p><span style={label}>Mother:</span> {student.motherName}</p>
                        <p><b>WhatsApp:</b> {student.whatsapp}</p>
                    </div>

                    {/* ID */}
                    <div style={section("linear-gradient(135deg,#fff3e0,#ffe0b2)")}>
                        <h4>🆔 Identity</h4>
                        <p><span style={label}>Aadhaar:</span> {student.aadhar}</p>
                        <p><span style={label}>Jan Aadhar:</span> {student.janAadhar}</p>
                        <p><span style={label}>APAR ID:</span> {student.aparId}</p>
                    </div>

                    {/* ACADEMIC */}
                    <div style={section("linear-gradient(135deg,#f3e5f5,#e1bee7)")}>
                        <h4>📚 Academic</h4>
                        <p><span style={label}>Previous School:</span> {student.previousSchool}</p>
                        <p><span style={label}>Last Class:</span> {student.lastClass}</p>
                        <p><span style={label}>TC No:</span> {student.tcNo}</p>
                    </div>

                    {/* TRANSPORT */}
                    <div style={section("linear-gradient(135deg,#ede7f6,#d1c4e9)")}>
                        <h4>🚌 Transport / Hostel</h4>
                        <p>Transport: {student.transport ? "Yes" : "No"}</p>
                        <p>Route: {student.route}</p>
                        <p>Fee: ₹{student.transportFee}</p>
                        <p>Hostel: {student.hostel ? "Yes" : "No"}</p>
                        <p>Hostel Fee: ₹{student.hostelFee}</p>
                    </div>

                    {/* ADDRESS + FEES */}
                    <div style={section("linear-gradient(135deg,#e8f5e9,#c8e6c9)")}>
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
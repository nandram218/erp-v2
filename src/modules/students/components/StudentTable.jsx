import React from "react";
import { useNavigate } from "react-router-dom";

const StudentTable = ({
    students = [],
    selectedIds = [],
    handleSelect = () => { },
    handleSelectAll = () => { }
}) => {

    const navigate = useNavigate();

    const row = {
        display: "grid",
        gridTemplateColumns: `
    50px
    50px
    60px
    200px
    130px
    120px
    90px
    70px
    200px
    130px
    90px
    70px
    260px
`,
        alignItems: "center",
        padding: "10px",
        borderBottom: "1px solid #eee",
        fontSize: "14px"
    };

    const cell = {
        overflowX: "auto",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis"
    };

    const btn = (bg) => ({
        background: bg,
        color: "#fff",
        border: "none",
        padding: "5px 10px",
        borderRadius: "6px",
        marginRight: "5px",
        cursor: "pointer",
        fontSize: "12px"
    });

    const handleDelete = (id) => {
        if (!window.confirm("Delete this student?")) return;

        let data = JSON.parse(localStorage.getItem("students")) || [];
        const updated = data.filter((stu) => stu.id !== id);
        localStorage.setItem("students", JSON.stringify(updated));

        window.location.reload();
    };

    // ✅ SAFE CHECK ALL (extra protection)
    const allSelected =
        students.length > 0 &&
        selectedIds.length === students.length;

    return (
        <div style={{
            background: "#fff",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 5px 20px rgba(0,0,0,0.1)"
        }}>

            {/* HEADER */}
            <div style={{
                ...row,
                fontWeight: "bold",
                background: "linear-gradient(90deg,#3f51b5,#5a55ae)",
                color: "#fff",
                fontSize: "13px"
            }}>

                {/* SELECT ALL */}
                <div>
                    <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                </div>

                <div>Sr</div>
                <div>Photo</div>
                <div>Name</div>
                <div>Adm No</div>
                <div>DOB</div>
                <div>Class</div>
                <div>Sec</div>
                <div>Father</div>
                <div>Mobile</div>
                <div>Cat</div>
                <div>RTE</div>
                <div>Action</div>
            </div>

            {/* DATA */}
            {students.length === 0 ? (
                <div style={{ padding: "25px", textAlign: "center" }}>
                    No Students Found
                </div>
            ) : (
                students.map((s, i) => (
                    <div
                        key={s.id}
                        style={row}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f5f7ff"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
                    >

                        {/* CHECKBOX */}
                        <div>
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(s.id)}
                                onChange={() => handleSelect(s.id)}
                            />
                        </div>

                        <div style={cell}>{i + 1}</div>

                        {/* PHOTO */}
                        <div>
                            <img
                                src={s.photoPreview || "https://via.placeholder.com/40"}
                                alt=""
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    cursor: "pointer"
                                }}
                                onClick={() => navigate(`/students/view/${s.id}`)}
                            />
                        </div>

                        <div style={cell}>{s.name}</div>
                        <div style={cell}>{s.admissionNo}</div>
                        <div style={cell}>{s.dob}</div>
                        <div style={cell}>{s.class}</div>
                        <div style={cell}>{s.section}</div>
                        <div style={cell}>{s.fatherName}</div>
                        <div style={cell}>{s.mobile || s.mobileNo}</div>

                        {/* CATEGORY */}
                        <div>
                            <span style={{
                                background: "#e3f2fd",
                                padding: "4px 8px",
                                borderRadius: "12px",
                                fontSize: "12px"
                            }}>
                                {s.category}
                            </span>
                        </div>

                        {/* RTE */}
                        <div>
                            <span style={{
                                background: s.RTE ? "#c8e6c9" : "#ffcdd2",
                                padding: "4px 8px",
                                borderRadius: "12px",
                                fontSize: "12px"
                            }}>
                                {s.RTE ? "Yes" : "No"}
                            </span>
                        </div>

                        {/* ACTION */}
                        <div>
                            <button
                                style={btn("#2196F3")}
                                onClick={() => navigate(`/students/view/${s.id}`)}
                            >
                                View
                            </button>

                            <button
                                style={btn("#4CAF50")}
                                onClick={() => navigate(`/students/edit/${s.id}`)}
                            >
                                Edit
                            </button>

                            <button
                                style={btn("#f44336")}
                                onClick={() => handleDelete(s.id)}
                            >
                                Delete
                            </button>
                        </div>

                    </div>
                ))
            )}

        </div>
    );
};

export default StudentTable;
import React from "react";
import { useNavigate } from "react-router-dom";
import { getStudents } from "../../../services/studentService";
import { deleteStudent } from "../../../services/studentService";
import { StudentPhoto } from "../../../media/MediaRenderer";
const StudentTable = ({
    students = [],
    selectedIds = [],
    handleSelect = () => { },
    handleSelectAll = () => { }
}) => {

    const navigate = useNavigate();

    /* 🔥 CLASS ORDER FIX (LOW → HIGH) */
    const classOrder = [
        "PP3", "PP4", "PP5",
        "Nursery", "LKG", "UKG",
        "1st", "2nd", "3rd", "4th", "5th",
        "6th", "7th", "8th", "9th", "10th",
        "11th", "12th"
    ];

    const sortedStudents = [...students].sort((a, b) => {
        const aIndex = classOrder.indexOf(a.class);
        const bIndex = classOrder.indexOf(b.class);
        return aIndex - bIndex;
    });

    /* 🔵 LEFT GRID (Transport tak) */
    const leftGrid = {
        display: "grid",
        gridTemplateColumns: `
        40px 50px 60px 200px 120px 100px 80px 60px
        160px 120px 80px 70px 80px 100px
        `,
        minWidth: "1360px",
        alignItems: "center",
        padding: "10px",
        fontSize: "13px"
    };

    const cell = {
        padding: "6px 8px",
        borderRight: "1.5px solid #90a4ae",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        textAlign: "left"
    };

    const headerCell = {
        ...cell,
        textAlign: "center",
        fontWeight: "700",
        color: "#fff"
    };

    const yesStyle = { color: "#1b5e20", fontWeight: "700" };
    const noStyle = { color: "#b71c1c", fontWeight: "700" };
    const routeStyle = { color: "#0d47a1", fontWeight: "700" };

    const btn = (bg) => ({
        background: bg,
        color: "#fff",
        border: "none",
        padding: "8px 14px",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "700",
        boxShadow: "0 4px 0 rgba(0,0,0,0.4)"
    });

    const handleDelete = (id) => {
        if (!window.confirm("Delete this student?")) return;

        deleteStudent(id);
    };

    const allSelected =
        students.length > 0 &&
        selectedIds.length === students.length;

    return (
        <div style={{
            background: "#ffffff",
            borderRadius: "10px",
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "80vh",
            position: "relative",
            border: "2px solid #1a237e",
            fontFamily: "Segoe UI, Arial",
            width: "100%"
        }}>

            {/* 🔝 HEADER */}
            <div style={{
                display: "flex",
                position: "sticky",
                top: 0,
                zIndex: 999,
                background: "#1a237e"
            }}>
                <div style={{ ...leftGrid, background: "#1a237e" }}>

                    <div style={headerCell}>
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                    </div>

                    <div style={headerCell}>Sr</div>
                    <div style={headerCell}>Photo</div>
                    <div style={headerCell}>Name</div>
                    <div style={headerCell}>Adm No</div>
                    <div style={headerCell}>DOB</div>
                    <div style={headerCell}>Class</div>
                    <div style={headerCell}>Sec</div>
                    <div style={headerCell}>Father</div>
                    <div style={headerCell}>Mobile</div>
                    <div style={headerCell}>Cat</div>
                    <div style={headerCell}>RTE</div>
                    <div style={headerCell}>Hostel</div>

                    <div style={{
                        ...headerCell,
                        borderRight: "3px solid #000"
                    }}>
                        Transport
                    </div>
                </div>

                <div style={{
                    minWidth: "190px",
                    background: "#1a237e",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700"
                }}>
                    Action
                </div>

            </div>

            {/* DATA */}
            {sortedStudents.length === 0 ? (
                <div style={{ padding: "25px", textAlign: "center" }}>
                    No Students Found
                </div>
            ) : (
                sortedStudents.map((s, i) => {
                    const next = sortedStudents[i + 1];
                    const showBreak = next && next.class !== s.class;

                    return (
                        <React.Fragment key={s.id}>

                            <div style={{ display: "flex" }}>

                                {/* LEFT GRID */}
                                <div style={{
                                    ...leftGrid,
                                    background: i % 2 === 0 ? "#eef3f8" : "#ffffff",
                                    borderBottom: "1px solid #cfd8dc"
                                }}>

                                    <div style={cell}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(s.id)}
                                            onChange={() => handleSelect(s.id)}
                                        />
                                    </div>

                                    <div style={cell}>{i + 1}</div>

                                    <div style={cell}>
                                        <StudentPhoto
                                            studentId={s.studentId || s.id}
                                            fallback={s.photoPreview || "https://via.placeholder.com/40"}
                                            alt=""
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                                cursor: "pointer"
                                            }}
                                            onClick={() => navigate("/students/add", { state: s })}
                                        />
                                    </div>

                                    <div style={cell}>{s.name}</div>
                                    <div style={cell}>{s.admissionNo}</div>
                                    <div style={cell}>{s.dob}</div>
                                    <div style={cell}>{s.class}</div>
                                    <div style={cell}>{s.section}</div>
                                    <div style={cell}>{s.fatherName}</div>
                                    <div style={cell}>{s.mobile || s.mobileNo}</div>
                                    <div style={cell}>{s.category}</div>

                                    <div style={cell}>
                                        <span style={s.RTE ? yesStyle : noStyle}>
                                            {s.RTE ? "Yes" : "No"}
                                        </span>
                                    </div>

                                    <div style={cell}>
                                        <span style={s.hostel ? yesStyle : noStyle}>
                                            {s.hostel ? "Yes" : "No"}
                                        </span>
                                    </div>

                                    {/* TRANSPORT LAST */}
                                    <div style={{
                                        ...cell,
                                        borderRight: "none"
                                    }}>
                                        {s.transport ? (
                                            <>
                                                <span style={yesStyle}>Yes</span>{" "}
                                                <span style={routeStyle}>({s.route || "-"})</span>
                                            </>
                                        ) : (
                                            <span style={noStyle}>No</span>
                                        )}
                                    </div>

                                </div>

                                {/* ACTION */}
                                <div style={{
                                    minWidth: "190px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    borderBottom: "1px solid #cfd8dc"
                                }}>
                                    <button style={btn("#1b5e20")} onClick={() => navigate(`/students/view/${s.id}`)}>
                                        View
                                    </button>

                                    <button
                                        style={btn("#0d47a1")}
                                        onClick={() => navigate("/students/add", { state: s })}
                                    >
                                        Edit
                                    </button>

                                    <button style={btn("#b71c1c")} onClick={() => handleDelete(s.id)}>
                                        Delete
                                    </button>
                                </div>

                            </div>

                            {/* 🔥 CLASS BREAK (PERFECT) */}
                            {showBreak && (
                                <div
                                    style={{
                                        width: "1360px",
                                        height: "0px",
                                        borderTop: "2px solid",
                                        borderImage: "linear-gradient(90deg,#1a237e,#3949ab,#1a237e) 1",
                                        margin: "6px 0"
                                    }}
                                />
                            )}

                        </React.Fragment>
                    );
                })
            )}

        </div>
    );
};

export default StudentTable;
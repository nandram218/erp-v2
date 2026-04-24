import React from "react";
import { useNavigate, Outlet } from "react-router-dom";

const StudentPage = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>

            <h2 style={styles.title}>🎓 Student Module</h2>

            <div style={styles.grid}>

                {/* ADD STUDENT */}
                <button
                    style={{ ...styles.btn, ...styles.green }}
                    onClick={() => navigate("/students/add")}
                    onMouseDown={(e) => e.currentTarget.style.transform = "translateY(4px)"}
                    onMouseUp={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                    ➕ Add Student
                </button>

                {/* VIEW LIST */}
                <button
                    style={{ ...styles.btn, ...styles.blue }}
                    onClick={() => navigate("/students")}
                    onMouseDown={(e) => e.currentTarget.style.transform = "translateY(4px)"}
                    onMouseUp={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                    📋 View Student List
                </button>

                {/* ID CARDS */}
                <button
                    style={{ ...styles.btn, ...styles.orange }}
                    onClick={() => navigate("/students/idcards")}
                    onMouseDown={(e) => e.currentTarget.style.transform = "translateY(4px)"}
                    onMouseUp={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                    🪪 Generate ID Cards
                </button>

                {/* CERTIFICATES */}
                <button
                    style={{ ...styles.btn, ...styles.purple }}
                    onClick={() => navigate("/certificate-selector")}
                    onMouseDown={(e) => e.currentTarget.style.transform = "translateY(4px)"}
                    onMouseUp={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                    🎖 Generate Certificates
                </button>

            </div>

            {/* CHILD ROUTES */}
            <Outlet />

        </div>
    );
};

export default StudentPage;

/* ================= STYLES ================= */

const styles = {
    container: {
        padding: "30px",
        textAlign: "center",
        background: "linear-gradient(135deg, #f5f7fa, #e4e8f0)",
        minHeight: "100vh"
    },

    title: {
        fontSize: "28px",
        marginBottom: "30px",
        fontWeight: "bold",
        color: "#222"
    },

    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px"
    },

    btn: {
        padding: "22px",
        fontSize: "16px",
        border: "none",
        borderRadius: "14px",
        cursor: "pointer",
        color: "#fff",
        fontWeight: "bold",
        boxShadow: "0 6px 0 rgba(0,0,0,0.25)",
        transition: "0.2s",
    },

    green: {
        background: "linear-gradient(45deg, #4caf50, #2e7d32)"
    },

    blue: {
        background: "linear-gradient(45deg, #2196f3, #1565c0)"
    },

    orange: {
        background: "linear-gradient(45deg, #ff9800, #e65100)"
    },

    purple: {
        background: "linear-gradient(45deg, #9c27b0, #6a1b9a)"
    }
};
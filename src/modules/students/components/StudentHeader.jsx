import React from "react";

const StudentHeader = () => {
    return (
        <div style={{
            background: "linear-gradient(135deg,#667eea,#764ba2)",
            color: "#fff",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "15px",
            display: "flex",
            alignItems: "center",
            gap: "15px"
        }}>
            <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#fff"
            }}></div>

            <div>
                <h2 style={{ margin: 0 }}>ABC PUBLIC SCHOOL</h2>
                <p style={{ margin: 0 }}>Student Master List (2025-26)</p>
            </div>
        </div>
    );
};

export default StudentHeader;
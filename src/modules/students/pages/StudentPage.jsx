import React from "react";
import { useNavigate } from "react-router-dom";

const StudentPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: "20px" }}>
            <h2>🎓 Students Module</h2>

            <button
                onClick={() => navigate("/students/add")}
                style={{
                    padding: "10px 20px",
                    fontSize: "16px",
                    marginTop: "20px",
                    cursor: "pointer"
                }}
            >
                ➕ Add Student
            </button>
        </div>
    );
};

export default StudentPage;
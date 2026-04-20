import React from "react";
import { useNavigate, Outlet } from "react-router-dom";

const StudentPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: 20 }}>
            <h2>🎓 Students Module</h2>

            <button onClick={() => navigate("/students/add")}>
                ➕ Add Student
            </button>

            <button onClick={() => navigate("/students")}>
                📋 View Students List
            </button>

            {/* 🔥 THIS IS MANDATORY */}
            <Outlet />
        </div>
    );
};

export default StudentPage;
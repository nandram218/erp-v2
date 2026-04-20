import React from "react";
import { Link, Outlet } from "react-router-dom";

const DashboardLayout = () => {
    const linkStyle = {
        color: "#fff",
        textDecoration: "none",
        display: "block",
        padding: "10px 0",
    };

    return (
        <div
            style={{
                display: "flex",
                background: "#f4f7fb",
                minHeight: "100vh",
            }}
        >
            {/* Sidebar */}
            <div
                style={{
                    width: "220px",
                    background: "#1e293b",
                    color: "#fff",
                    padding: "20px",
                }}
            >
                <h2>ERP</h2>

                <Link to="/" style={linkStyle}>Dashboard</Link>
                <Link to="/students" style={linkStyle}>Students</Link>
                <Link to="/staff" style={linkStyle}>Staff</Link>
                <Link to="/fees" style={linkStyle}>Fees</Link>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1 }}>
                {/* Navbar */}
                <div
                    style={{
                        background: "#f1f5f9",
                        padding: "15px",
                        fontWeight: "bold",
                    }}
                >
                    Navbar
                </div>

                {/* 🔥 IMPORTANT */}
                <div style={{ padding: "20px" }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
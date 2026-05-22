import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SchoolHeader from "../components/SchoolHeader";
import { useEffect } from "react";
import { useSchoolStore } from "../store/schoolStore";

const DashboardLayout = ({ children }) => {

    const location = useLocation();
    const navigate = useNavigate();
    const { loadAll } = useSchoolStore();
    useEffect(() => {
        loadAll();                           // 🔥 HERE
    }, []);
    const userRole = "admin"; // अभी temporary
    const fullScreenRoutes = [
        "/students",
        "/students/list",
        "/students/add",
        "/students/idcards",
        "/students/view",
        "/certificate",
        "/certificate-selector"
    ];

    const isFullScreen = fullScreenRoutes.some(path =>
        location.pathname.startsWith(path)
    );

    const linkStyle = {
        color: "#fff",
        textDecoration: "none",
        display: "block",
        padding: "10px 0",
        fontSize: "14px"
    };

    return (
        <div>

            {/* HEADER (RESTORED FULL SIZE) */}
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999
            }}>
                <SchoolHeader />
            </div>

            {/* BODY */}
            <div style={{
                display: "flex",
                background: "#f4f7fb",
                minHeight: "100vh",
                marginTop: "95px" // 🔥 original safe spacing
            }}>

                {/* SIDEBAR (AUTO HIDE ON MODULE PAGES) */}
                {!isFullScreen && (
                    <div style={{
                        width: "220px",
                        background: "#1e293b",
                        color: "#fff",
                        padding: "20px"
                    }}>
                        <h2>ERP</h2>

                        <Link to="/" style={linkStyle}>Dashboard</Link>
                        <Link to="/students" style={linkStyle}>Students</Link>
                        <Link to="/staff" style={linkStyle}>Staff</Link>
                        <Link to="/fees" style={linkStyle}>Fees</Link>
                        <Link to="/transport" style={linkStyle}>
                            Transport
                        </Link>
                        {userRole === "admin" && (
                            <li
                                className={location.pathname.includes("master-setting") ? "active" : ""}
                                onClick={() => navigate("/master-setting")}
                            >
                                ⚙️ Master Setting
                            </li>
                        )}
                    </div>
                )}

                {/* MAIN CONTENT */}
                <div style={{
                    flex: 1,
                    width: "100%"
                }}>

                    {/* TOP BAR (SAFE STICKY FIX ONLY) */}
                    <div style={{
                        position: "sticky",
                        top: "95px",
                        zIndex: 1000,
                        background: "#f1f5f9",
                        padding: "10px 15px",
                        borderBottom: "2px solid #cbd5e1"
                    }}>
                        <div style={{ fontWeight: "700" }}>
                            ERP Panel
                        </div>
                    </div>

                    {/* PAGE CONTENT */}
                    <div style={{ padding: "20px" }}>
                        {children}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
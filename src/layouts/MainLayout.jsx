import { Link } from "react-router-dom";

const MainLayout = ({ children }) => {
    return (
        <div style={{ display: "flex" }}>

            {/* Sidebar */}
            <div
                style={{
                    width: "220px",
                    height: "100vh",
                    background: "#1e293b",
                    color: "#fff",
                    padding: "20px",
                }}
            >
                <h2>ERP</h2>

                <ul style={{ listStyle: "none", padding: 0 }}>
                    <li><Link to="/" style={linkStyle}>Dashboard</Link></li>
                    <li><Link to="/students" style={linkStyle}>Students</Link></li>
                    <li><Link to="/staff" style={linkStyle}>Staff</Link></li>
                    <li><Link to="/fees" style={linkStyle}>Fees</Link></li>
                </ul>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1 }}>

                {/* Top Navbar */}
                <div
                    style={{
                        background: "#f1f5f9",
                        padding: "15px",
                        fontWeight: "bold",
                    }}
                >
                    Navbar
                </div>

                {/* Page Content */}
                <div style={{ padding: "20px" }}>
                    {children}
                </div>
            </div>

        </div>
    );
};

const linkStyle = {
    color: "#fff",
    textDecoration: "none",
    display: "block",
    padding: "10px 0",
};

export default MainLayout;
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAcademicStore } from "./academic/academicStore";
import { academicService } from "./academic/academicService";

const MasterSettingDashboard = () => {
    const navigate = useNavigate();

    // ✅ GLOBAL STORE
    const { setSettings } = useAcademicStore();

    // ✅ LOAD SETTINGS
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await academicService.getSettings();
                if (res?.success && res.data) {
                    setSettings(res.data);
                    if (process.env.NODE_ENV === "development") {
                        console.log("✅ Academic Settings Loaded:", res.data);
                    }
                } else {
                    if (process.env.NODE_ENV === "development") {
                        console.warn("⚠ No Academic Settings found");
                    }
                }
            } catch (err) {
                if (process.env.NODE_ENV === "development") {
                    console.error("❌ Error loading settings:", err);
                }
            }
        };

        loadSettings();
    }, []);

    const cards = [
        { name: "School Profile", path: "school-profile", color: "#4CAF50" },
        { name: "Academic", path: "academic", color: "#2196F3" },
        { name: "Classes & Subjects", path: "classes-subjects/classes", color: "#9C27B0" },
        { name: "Fees", path: "fees", color: "#FF9800" },
        { name: "Exams", path: "exams", color: "#3F51B5" },
        { name: "Transport", path: "transport", color: "#009688" },
        { name: "Hostel", path: "hostel", color: "#795548" },
        { name: "Role & Access", path: "security", color: "#E91E63" }
    ];

    if (!cards || cards.length === 0) {
        return (
            <div style={styles.page}>
                <div style={{ padding: 40, textAlign: "center" }}>
                    <h2>⚠️ No Settings Available</h2>
                    <p>Master settings configuration is currently unavailable.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>

            {/* 🔝 TOP BAR */}
            <div style={styles.topBar}>
                <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
                    ⬅ Back
                </button>

                <div style={{ textAlign: "center" }}>
                    <h2 style={styles.title}>⚙️ Master Settings</h2>

                    <p style={styles.tagline}>
                        Centralized control panel to configure, manage, and optimize your entire school system —
                        ensuring accuracy, consistency, and efficient operations across all modules.
                    </p>
                </div>

                <div />
            </div>

            {/* 🧩 CARD GRID */}
            <div style={styles.grid}>
                {cards.map((item, i) => (
                    <div
                        key={i}
                        onClick={() => navigate(`/master-setting/${item.path}`)}
                        style={{
                            ...styles.card,
                            background: item.color
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = "translateY(4px)"}
                        onMouseUp={(e) => e.currentTarget.style.transform = "translateY(0px)"}
                    >
                        <div style={styles.cardInner}>
                            {item.name}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default MasterSettingDashboard;



// 🎨 STYLES (⚠️ YE HI MISSING THA)
const styles = {

    page: {
        minHeight: "100vh",
        padding: "25px",
        background: "linear-gradient(135deg,#e3f2fd,#fce4ec)",
    },

    topBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
    },

    title: {
        fontSize: "28px",
        fontWeight: "800",
        color: "#222",
    },

    tagline: {
        fontSize: "14px",
        color: "#555",
        maxWidth: "500px",
        margin: "6px auto 0",
        lineHeight: "1.5"
    },

    backBtn: {
        background: "#000",
        color: "#fff",
        padding: "10px 18px",
        borderRadius: "10px",
        border: "none",
        cursor: "pointer",
        fontWeight: "700",
        boxShadow: "0 6px 0 rgba(0,0,0,0.5)"
    },

    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
        gap: "22px",
    },

    card: {
        height: "150px",
        borderRadius: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "#fff",
        fontWeight: "700",
        boxShadow: `
            0 10px 0 rgba(0,0,0,0.4),
            0 15px 25px rgba(0,0,0,0.2)
        `,
        transition: "0.2s",
    },

    cardInner: {
        fontSize: "16px",
        textAlign: "center",
        letterSpacing: "0.5px"
    }
};
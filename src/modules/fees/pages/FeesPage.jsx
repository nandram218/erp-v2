import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Components
import FeesFilters from "../components/FeesFilters";
import FeesTable from "../components/FeesTable";

// Services (existing)
import { getStudents } from "../../students/services/studentService";
import { feesService } from "../../../master-setting/fees/feesService";

export default function FeesPage() {

    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [filtered, setFiltered] = useState([]);

    const [search, setSearch] = useState("");
    const [classFilter, setClassFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const [summary, setSummary] = useState({
        total: 0,
        paid: 0,
        due: 0,
        overdue: 0
    });

    // ================= LOAD DATA =================
    useEffect(() => {

        const stu = getStudents() || [];
        const feeData = feesService.get() || {};

        // merge student + fee
        const merged = stu.map(s => {
            const f = feeData[s.id] || { paid: 0, total: 0 };

            const due = f.total - f.paid;

            return {
                ...s,
                total: f.total || 0,
                paid: f.paid || 0,
                due: due,
                status:
                    due <= 0
                        ? "paid"
                        : due > 0 && due < f.total
                            ? "partial"
                            : "due"
            };
        });

        setStudents(merged);
        setFiltered(merged);

        // summary
        const total = merged.reduce((a, b) => a + b.total, 0);
        const paid = merged.reduce((a, b) => a + b.paid, 0);
        const due = merged.reduce((a, b) => a + b.due, 0);

        setSummary({
            total,
            paid,
            due,
            overdue: due // (future: date logic)
        });

    }, []);

    // ================= FILTER =================
    useEffect(() => {

        let data = [...students];

        // search
        if (search) {
            const s = search.toLowerCase();
            data = data.filter(x =>
                x.name?.toLowerCase().includes(s) ||
                x.fatherName?.toLowerCase().includes(s) ||
                x.mobile?.includes(s)
            );
        }

        // class filter
        if (classFilter !== "all") {
            data = data.filter(x => x.className === classFilter);
        }

        // status filter
        if (statusFilter !== "all") {
            data = data.filter(x => x.status === statusFilter);
        }

        setFiltered(data);

    }, [search, classFilter, statusFilter, students]);

    return (
        <div style={styles.page}>

            {/* ================= TOP BAR ================= */}
            <div style={styles.topBar}>

                <button style={{ ...styles.bigBtn, ...styles.btnPrint }}>
                    🖨 Print
                </button>

                <h2>💰 Fees Dashboard</h2>

                <button style={styles.btnPurple}
                    onClick={() => navigate("/dashboard")}>
                    🏠 Dashboard
                </button>

            </div>

            {/* ================= SUMMARY ================= */}
            <div style={styles.summary}>

                <div style={{ ...styles.card, borderTop: "5px solid #22c55e" }}>
                    <h4>💰 Total Fees</h4>
                    <p style={styles.amount}>₹{summary.total}</p>
                </div>

                <div style={{ ...styles.card, borderTop: "5px solid #3b82f6" }}>
                    <h4>✅ Collected</h4>
                    <p style={styles.amount}>₹{summary.paid}</p>
                </div>

                <div style={{ ...styles.card, borderTop: "5px solid #f59e0b" }}>
                    <h4>🟡 Due</h4>
                    <p style={styles.amount}>₹{summary.due}</p>
                </div>

                <div style={{ ...styles.card, borderTop: "5px solid #ef4444" }}>
                    <h4>🔴 Overdue</h4>
                    <p style={styles.amount}>₹{summary.overdue}</p>
                </div>

            </div>
            <div style={styles.actionGrid}>

                <button style={{ ...styles.bigBtn, ...styles.btnCollect }}>
                    💰 Collect Fees
                </button>

                <button style={{ ...styles.bigBtn, ...styles.btnHistory }}>
                    📊 History
                </button>

                <button style={{ ...styles.bigBtn, ...styles.btnReceipt }}>
                    🧾 Receipt
                </button>

                <button style={{ ...styles.bigBtn, ...styles.btnReport }}>
                    📈 Report
                </button>

                <button style={{ ...styles.bigBtn, ...styles.btnAlert }}>
                    ⚠ Overdue
                </button>

                <button style={{ ...styles.bigBtn, ...styles.btnNotify }}>
                    📲 Reminder
                </button>

            </div>
            {/* ================= FILTERS ================= */}
            <FeesFilters
                search={search}
                setSearch={setSearch}
                classFilter={classFilter}
                setClassFilter={setClassFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                students={students}
            />

            {/* ================= TABLE ================= */}
            <FeesTable data={filtered} />

        </div>
    );
}


// ================= STYLES =================
const styles = {

    page: {
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        minHeight: "100vh",
        padding: 20,
        color: "#fff"
    },

    topBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
    },

    summary: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 15,
        marginBottom: 20
    },

    card: {
        background: "linear-gradient(145deg, #1e293b, #334155)",
        padding: 18,
        borderRadius: 16,
        textAlign: "center",

        // ✨ golden border glow
        border: "1px solid rgba(255,215,0,0.4)",

        // ✨ glass + depth
        backdropFilter: "blur(10px)",
        boxShadow: `
        0 8px 20px rgba(0,0,0,0.6),
        inset 0 1px 0 rgba(255,255,255,0.1)
    `,

        transition: "0.3s"
    },
    amount: {
        fontSize: 26,
        fontWeight: "bold",
        marginTop: 10,
        letterSpacing: 1,
        color: "#facc15", // golden highlight
        textShadow: "0 0 10px rgba(255,215,0,0.5)"
    },
    btnDark: {
        background: "linear-gradient(145deg,#000,#111)",
        color: "#fff",
        padding: "10px 16px",
        border: "none",
        borderRadius: 10,
        cursor: "pointer"
    },

    btnPurple: {
        background: "linear-gradient(145deg,#a855f7,#6b21a8)",
        color: "#fff",
        padding: "10px 16px",
        border: "none",
        borderRadius: 10,
        cursor: "pointer"
    },
    actionGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))",
        gap: 15,
        marginBottom: 20
    },

    // 🔷 BASE BUTTON (same structure)
    bigBtn: {
        padding: 20,
        borderRadius: 16,
        border: "1px solid rgba(255,215,0,0.6)",
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        cursor: "pointer",
        letterSpacing: 0.5,

        background: "linear-gradient(145deg,#1e293b,#334155)",

        boxShadow: `
        0 6px 0 rgba(0,0,0,0.5),
        0 12px 25px rgba(0,0,0,0.7),
        inset 0 1px 0 rgba(255,255,255,0.1)
    `,

        transition: "0.2s"
    },

    // 🟢 COLLECT (Premium Green Neon)
    btnCollect: {
        background: "linear-gradient(145deg,#22c55e,#4ade80)",
        boxShadow: `
        0 6px 0 #15803d,
        0 10px 25px rgba(34,197,94,0.6)
    `
    },

    // 🔵 HISTORY (Royal Blue)
    btnHistory: {
        background: "linear-gradient(145deg,#3b82f6,#60a5fa)",
        boxShadow: `
        0 6px 0 #1d4ed8,
        0 10px 25px rgba(59,130,246,0.6)
    `
    },

    // 🟣 RECEIPT (Purple Neon)
    btnReceipt: {
        background: "linear-gradient(145deg,#a855f7,#d946ef)",
        boxShadow: `
        0 6px 0 #6b21a8,
        0 10px 25px rgba(168,85,247,0.6)
    `
    },

    // 🟠 REPORT (Orange Gold)
    btnReport: {
        background: "linear-gradient(145deg,#f59e0b,#fbbf24)",
        boxShadow: `
        0 6px 0 #b45309,
        0 10px 25px rgba(245,158,11,0.6)
    `
    },

    // 🔴 ALERT / OVERDUE (Strong Red)
    btnAlert: {
        background: "linear-gradient(145deg,#ef4444,#f87171)",
        boxShadow: `
        0 6px 0 #991b1b,
        0 10px 25px rgba(239,68,68,0.6)
    `
    },

    // 🟡 EXTRA (Fees Reminder / WhatsApp)
    btnNotify: {
        background: "linear-gradient(145deg,#eab308,#fde047)",
        boxShadow: `
        0 6px 0 #a16207,
        0 10px 25px rgba(234,179,8,0.6)
    `
    },

    // 🧊 EXTRA (Print / Export)
    btnPrint: {
        background: "linear-gradient(145deg,#06b6d4,#22d3ee)",
        boxShadow: `
        0 6px 0 #0e7490,
        0 10px 25px rgba(6,182,212,0.6)
    `
    }
}; 
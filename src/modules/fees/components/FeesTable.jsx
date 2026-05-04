import React from "react";

export default function FeesTable({ data = [] }) {

    const getRowStyle = (status) => {
        if (status === "paid") return styles.paidRow;
        if (status === "partial") return styles.dueRow;
        return styles.overdueRow;
    };

    const handleCollect = (student) => {
        // 🔥 future: open modal / redirect
        alert(`Collect fees for ${student.name}`);
    };

    return (
        <div style={styles.wrapper}>

            {/* HEADER */}
            <div style={styles.headerRow}>
                <div>Name</div>
                <div>Father</div>
                <div>Class</div>
                <div>Sec</div>
                <div>Mobile</div>
                <div>Total</div>
                <div>Paid</div>
                <div>Due</div>
                <div>Status</div>
                <div>Action</div>
            </div>

            {/* DATA */}
            {data.length === 0 && (
                <div style={styles.empty}>No Data Found</div>
            )}

            {data.map((s, i) => (
                <div
                    key={i}
                    style={{
                        ...styles.row,
                        ...getRowStyle(s.status)
                    }}
                >
                    <div>{s.name}</div>
                    <div>{s.fatherName}</div>
                    <div>{s.className}</div>
                    <div>{s.section}</div>
                    <div>{s.mobile}</div>

                    <div style={styles.money}>₹{s.total}</div>
                    <div style={styles.moneyGreen}>₹{s.paid}</div>
                    <div style={styles.moneyRed}>₹{s.due}</div>

                    <div style={styles.status}>
                        {s.status === "paid" && "✅ Paid"}
                        {s.status === "partial" && "🟡 Partial"}
                        {s.status === "due" && "🔴 Due"}
                    </div>

                    <div>
                        <button
                            style={styles.btn3D}
                            onMouseDown={e => e.currentTarget.style.transform = "translateY(4px)"}
                            onMouseUp={e => e.currentTarget.style.transform = "translateY(0px)"}
                            onClick={() => handleCollect(s)}
                        >
                            💰 Collect
                        </button>
                    </div>
                </div>
            ))}

        </div>
    );
}


// ================= STYLES =================
const styles = {

    wrapper: { marginTop: 20 },

    headerRow: {
        display: "grid",
        gridTemplateColumns: "repeat(10, 1fr)",
        background: "#334155",
        padding: 10,
        fontWeight: "bold"
    },

    row: {
        display: "grid",
        gridTemplateColumns: "repeat(10, 1fr)",
        padding: 10,
        background: "#1e293b",
        marginTop: 5
    },

    // ✅ status borders
    paidRow: {
        borderLeft: "5px solid #22c55e"
    },

    dueRow: {
        borderLeft: "5px solid #f59e0b"
    },

    overdueRow: {
        borderLeft: "5px solid #ef4444"
    },

    // ✅ money styles
    money: {
        fontWeight: "bold"
    },

    moneyGreen: {
        color: "#22c55e",
        fontWeight: "bold"
    },

    moneyRed: {
        color: "#ef4444",
        fontWeight: "bold"
    },

    status: {
        fontWeight: "bold"
    },

    empty: {
        textAlign: "center",
        marginTop: 20,
        opacity: 0.7
    },

    // ✅ 3D button
    btn3D: {
        padding: "8px 14px",
        borderRadius: 10,
        border: "none",
        color: "#fff",
        cursor: "pointer",
        background: "linear-gradient(145deg,#3b82f6,#1d4ed8)",
        boxShadow: "0 5px 0 #1e40af, 0 8px 15px rgba(0,0,0,0.4)"
    }

};
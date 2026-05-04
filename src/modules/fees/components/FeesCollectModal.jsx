```jsx
import React, { useState, useEffect } from "react";
import { feesService } from "../../../master-setting/fees/feesService";

export default function FeesCollectModal({ student, onClose, onSuccess }) {

    const [amount, setAmount] = useState("");
    const [mode, setMode] = useState("cash");
    const [fees, setFees] = useState({
        total: 0,
        paid: 0,
        due: 0,
        breakdown: {}
    });

    // ================= LOAD FEES =================
    useEffect(() => {
        if (!student) return;

        const store = feesService.get() || {};

        const studentFee = store[student.id] || {
            total: 0,
            paid: 0,
            history: []
        };

        // 🔥 BASE (class fees)
        const classFees = student.total || 0;

        // 🔥 OPTIONAL
        const transportFee = student.facilities?.transport ? 1000 : 0;
        const hostelFee = student.facilities?.hostel ? 2000 : 0;

        const total = classFees + transportFee + hostelFee;
        const paid = studentFee.paid || 0;
        const due = total - paid;

        setFees({
            total,
            paid,
            due,
            breakdown: {
                classFees,
                transportFee,
                hostelFee
            }
        });

    }, [student]);

    if (!student) return null;

    // ================= SAVE PAYMENT =================
    const handleSave = () => {

        if (!amount || Number(amount) <= 0) {
            alert("Enter valid amount");
            return;
        }

        const store = feesService.get() || {};

        const existing = store[student.id] || {
            total: fees.total,
            paid: 0,
            history: []
        };

        const newPaid = existing.paid + Number(amount);

        const updated = {
            ...store,
            [student.id]: {
                ...existing,
                total: fees.total,
                paid: newPaid,
                history: [
                    ...existing.history,
                    {
                        amount: Number(amount),
                        date: new Date().toISOString(),
                        mode
                    }
                ]
            }
        };

        feesService.save(updated);

        alert("✅ Payment Saved");

        onSuccess && onSuccess();
        onClose();
    };

    return (
        <div style={styles.overlay}>

            <div style={styles.modal}>

                <h3>💰 Collect Fees</h3>

                <p><b>{student.name}</b> ({student.className})</p>

                {/* ================= BREAKDOWN ================= */}
                <div style={styles.breakdown}>
                    <div>📘 Class Fees: ₹{fees.breakdown.classFees}</div>
                    <div>🚐 Transport: ₹{fees.breakdown.transportFee}</div>
                    <div>🏠 Hostel: ₹{fees.breakdown.hostelFee}</div>
                </div>

                {/* ================= SUMMARY ================= */}
                <div style={styles.summary}>
                    <div>Total: ₹{fees.total}</div>
                    <div>Paid: ₹{fees.paid}</div>
                    <div style={{ color: "#ef4444" }}>Due: ₹{fees.due}</div>
                </div>

                {/* ================= INPUT ================= */}
                <input
                    type="number"
                    placeholder="Enter Amount"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    style={styles.input}
                />

                <select value={mode} onChange={e => setMode(e.target.value)}>
                    <option value="cash">Cash</option>
                    <option value="online">Online</option>
                    <option value="upi">UPI</option>
                </select>

                {/* ================= BUTTONS ================= */}
                <div style={styles.row}>
                    <button style={styles.btnSave} onClick={handleSave}>
                        💾 Save
                    </button>

                    <button style={styles.btnClose} onClick={onClose}>
                        ❌ Close
                    </button>
                </div>

            </div>
        </div>
    );
}


// ================= STYLES =================
const styles = {

    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999
    },

    modal: {
        background: "#1e293b",
        padding: 20,
        borderRadius: 12,
        width: 350,
        color: "#fff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.6)"
    },

    breakdown: {
        marginTop: 10,
        fontSize: 14,
        opacity: 0.9
    },

    summary: {
        marginTop: 10,
        fontWeight: "bold"
    },

    input: {
        width: "100%",
        padding: 10,
        marginTop: 10
    },

    row: {
        display: "flex",
        gap: 10,
        marginTop: 15
    },

    btnSave: {
        flex: 1,
        background: "linear-gradient(145deg,#22c55e,#15803d)",
        color: "#fff",
        padding: 10,
        border: "none",
        borderRadius: 8,
        cursor: "pointer"
    },

    btnClose: {
        flex: 1,
        background: "#ef4444",
        color: "#fff",
        padding: 10,
        border: "none",
        borderRadius: 8,
        cursor: "pointer"
    }
};
```

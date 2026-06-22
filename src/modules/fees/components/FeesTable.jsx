import React from "react";

const th = {
    padding: "12px 10px",
    border: "1px solid #dbe4ff",
    background: "#1e3a8a",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "700",
    textAlign: "center",
};

const td = {
    padding: "10px 8px",
    border: "1px solid #dbe4ff",
    fontSize: "13px",
    textAlign: "center",
};

const getStatus = (student) => {

    const status =
        student?.status || "unpaid";

    if (status === "paid") {
        return {
            text: "PAID",
            bg: "#16a34a",
        };
    }

    if (status === "partial") {
        return {
            text: "PARTIAL",
            bg: "#2563eb",
        };
    }

    return {
        text: "DUE",
        bg: "#f59e0b",
    };
};
const FeesTable = ({
    data = [],
    selectedIds = [],
    onSelectStudent = () => { },
    onSelectAll = () => { },
    onCollect = () => { },
    onViewAccount = () => { },
}) => {

    const isSelected = (id) => selectedIds.includes(id);

    return (
        <div style={{
            background: "#fff",
            borderRadius: "16px",
            overflow: "hidden",
            border: "2px solid #dbe4ff",
        }}>

            {/* HEADER */}
            <div style={{
                padding: "14px",
                background: "linear-gradient(135deg,#1e3a8a,#2563eb)",
                color: "#fff",
                fontWeight: "800",
                fontSize: "18px",
            }}>
                FEES COLLECTION TABLE
            </div>

            <div style={{ overflowX: "auto" }}>
                <table width="100%" style={{ borderCollapse: "collapse", minWidth: "1400px" }}>

                    <thead>
                        <tr>
                            <th style={th}>
                                <input
                                    type="checkbox"
                                    checked={data.length > 0 && selectedIds.length === data.length}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                />
                            </th>
                            <th style={th}>Student</th>
                            <th style={th}>Class</th>
                            <th style={th}>Total</th>
                            <th style={th}>Paid</th>
                            <th style={th}>Due</th>
                            <th style={th}>Status</th>
                            <th style={th}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((student) => {

                            const checked = isSelected(student.studentId);
                            const status = getStatus(student);

                            return (
                                <tr
                                    key={student.studentId}
                                    style={{
                                        background: checked ? "#eff6ff" : "#fff",
                                    }}
                                >
                                    <td style={td}>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => onSelectStudent(student.studentId)}
                                        />
                                    </td>

                                    <td style={{ ...td, fontWeight: 700 }}>
                                        {student.studentName}
                                    </td>

                                    <td style={td}>{student.className}</td>

                                    <td style={td}>₹{student.totalFee}</td>

                                    <td style={{ ...td, color: "#16a34a", fontWeight: 700 }}>
                                        ₹{student.paidAmount}
                                    </td>

                                    <td style={{ ...td, color: "#dc2626", fontWeight: 700 }}>
                                        ₹{student.dueAmount}
                                    </td>

                                    <td style={td}>
                                        <span style={{
                                            background: status.bg,
                                            color: "#fff",
                                            padding: "5px 10px",
                                            borderRadius: "20px",
                                            fontSize: "11px",
                                            fontWeight: "700",
                                        }}>
                                            {status.text}
                                        </span>
                                    </td>

                                    {/* ACTIONS (STEP 2.1C - Authority Correction) */}
                                    <td style={td}>

                                        {/* Collect button - only for Unpaid or Partial */}
                                        {(student.status === "unpaid" || student.status === "partial") && (
                                            <button
                                                style={{
                                                    background: "#16a34a",
                                                    color: "#fff",
                                                    border: "none",
                                                    padding: "6px 10px",
                                                    margin: "2px",
                                                    borderRadius: "8px",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => onCollect(student)}
                                            >
                                                💰 Collect
                                            </button>
                                        )}

                                        {/* View Account button - for all rows */}
                                        <button
                                            style={{
                                                background: "#2563eb",
                                                color: "#fff",
                                                border: "none",
                                                padding: "6px 10px",
                                                margin: "2px",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => onViewAccount(student)}
                                        >
                                            �️ View Account
                                        </button>

                                    </td>

                                </tr>
                            );
                        })}
                    </tbody>

                </table>
            </div>

        </div>
    );
};

export default FeesTable;
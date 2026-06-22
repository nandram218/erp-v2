import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getService } from "../../../core/serviceRegistry";
import { getStudentLedger } from "../ledgerService";

const feesService = getService("fees");

const StudentFeeAccountPage = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [ledger, setLedger] = useState(null);
    const [feeRecord, setFeeRecord] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);

    useEffect(() => {
        if (studentId) {
            const ledgerData = getStudentLedger(studentId);
            const feeData = feesService.getStudentFeesRecord(studentId);
            const history = feesService.getStudentPaymentHistory(studentId);

            setLedger(ledgerData);
            setFeeRecord(feeData);
            setPaymentHistory(history);
        }
    }, [studentId]);

    if (!ledger || !feeRecord) {
        return (
            <div style={{ padding: 16, textAlign: "center" }}>
                <p>Loading...</p>
            </div>
        );
    }

    const totalDiscount = paymentHistory.reduce((sum, p) => sum + (p.discount || 0), 0);
    const totalPenalty = paymentHistory.reduce((sum, p) => sum + (p.lateFee || 0), 0);
    const totalCollected = paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0);
    const advance = totalCollected - ledger.assignedAmount;

    return (
        <div style={{ padding: 16, background: "#eef2ff", minHeight: "100vh" }}>
            <button
                onClick={() => navigate("/fees")}
                style={{
                    padding: "10px 16px",
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginBottom: 16,
                }}
            >
                ← Back to Fees
            </button>

            <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 24 }}>
                Student Fee Account
            </h2>

            <div style={{
                background: "#fff",
                borderRadius: 12,
                padding: 24,
                marginBottom: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 20 }}>
                    {ledger.studentName}
                </h3>
                <p style={{ margin: "4px 0", color: "#666" }}>
                    Class: {ledger.className}
                </p>
                <p style={{ margin: "4px 0", color: "#666" }}>
                    Student ID: {ledger.studentId}
                </p>
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16,
                marginBottom: 24,
            }}>
                <div style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}>
                    <p style={{ margin: 0, fontSize: 14, color: "#666" }}>Assigned</p>
                    <p style={{ margin: "8px 0 0", fontSize: 24, fontWeight: 800, color: "#1e3a8a" }}>
                        ₹{ledger.assignedAmount}
                    </p>
                </div>

                <div style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}>
                    <p style={{ margin: 0, fontSize: 14, color: "#666" }}>Collected</p>
                    <p style={{ margin: "8px 0 0", fontSize: 24, fontWeight: 800, color: "#16a34a" }}>
                        ₹{ledger.collectedAmount}
                    </p>
                </div>

                <div style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}>
                    <p style={{ margin: 0, fontSize: 14, color: "#666" }}>Due</p>
                    <p style={{ margin: "8px 0 0", fontSize: 24, fontWeight: 800, color: "#dc2626" }}>
                        ₹{ledger.dueAmount}
                    </p>
                </div>

                <div style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}>
                    <p style={{ margin: 0, fontSize: 14, color: "#666" }}>Advance</p>
                    <p style={{ margin: "8px 0 0", fontSize: 24, fontWeight: 800, color: advance > 0 ? "#16a34a" : "#666" }}>
                        ₹{advance > 0 ? advance : 0}
                    </p>
                </div>

                <div style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}>
                    <p style={{ margin: 0, fontSize: 14, color: "#666" }}>Discount</p>
                    <p style={{ margin: "8px 0 0", fontSize: 24, fontWeight: 800, color: "#ea580c" }}>
                        ₹{totalDiscount}
                    </p>
                </div>

                <div style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}>
                    <p style={{ margin: 0, fontSize: 14, color: "#666" }}>Penalty</p>
                    <p style={{ margin: "8px 0 0", fontSize: 24, fontWeight: 800, color: "#dc2626" }}>
                        ₹{totalPenalty}
                    </p>
                </div>
            </div>

            <div style={{
                background: "#fff",
                borderRadius: 12,
                padding: 24,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 20 }}>
                    Payment History
                </h3>

                {paymentHistory.length === 0 ? (
                    <p style={{ color: "#666" }}>No payments recorded</p>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                                <th style={{ padding: 12, textAlign: "left", fontSize: 14 }}>Receipt No</th>
                                <th style={{ padding: 12, textAlign: "left", fontSize: 14 }}>Date</th>
                                <th style={{ padding: 12, textAlign: "right", fontSize: 14 }}>Amount</th>
                                <th style={{ padding: 12, textAlign: "right", fontSize: 14 }}>Discount</th>
                                <th style={{ padding: 12, textAlign: "right", fontSize: 14 }}>Penalty</th>
                                <th style={{ padding: 12, textAlign: "right", fontSize: 14 }}>Total</th>
                                <th style={{ padding: 12, textAlign: "left", fontSize: 14 }}>Mode</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentHistory.map((payment) => (
                                <tr key={payment.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                    <td style={{ padding: 12 }}>{payment.receiptNumber}</td>
                                    <td style={{ padding: 12 }}>
                                        {new Date(payment.paymentDate).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: 12, textAlign: "right" }}>₹{payment.amount}</td>
                                    <td style={{ padding: 12, textAlign: "right" }}>₹{payment.discount || 0}</td>
                                    <td style={{ padding: 12, textAlign: "right" }}>₹{payment.lateFee || 0}</td>
                                    <td style={{ padding: 12, textAlign: "right", fontWeight: 700 }}>
                                        ₹{payment.finalAmount}
                                    </td>
                                    <td style={{ padding: 12 }}>{payment.paymentMode}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default StudentFeeAccountPage;

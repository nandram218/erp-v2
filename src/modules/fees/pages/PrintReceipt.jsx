// src/modules/fees/pages/PrintReceipt.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getService } from "../../../core/serviceRegistry";
const feesService = getService("fees");

const PrintReceipt = () => {
    const { id } = useParams();
    const [receipt, setReceipt] = useState(null);

    useEffect(() => {
        const data =
            feesService.getPaymentById(id);
        setReceipt(data);
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (!receipt) {
        return (
            <div style={{ padding: "20px" }}>
                Loading receipt...
            </div>
        );
    }

    return (
        <div
            style={{
                padding: "20px",
                background: "#f5f6fa",
                minHeight: "100vh",
            }}
        >
            {/* PRINT BUTTON */}
            <button
                onClick={handlePrint}
                style={{
                    marginBottom: "15px",
                    padding: "10px 15px",
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                }}
            >
                Print Receipt
            </button>

            {/* RECEIPT BOX */}
            <div
                style={{
                    width: "800px",
                    margin: "auto",
                    background: "#fff",
                    padding: "30px",
                    borderRadius: "10px",
                    boxShadow:
                        "0 0 10px rgba(0,0,0,0.1)",
                }}
            >
                {/* HEADER */}
                <div
                    style={{
                        textAlign: "center",
                        borderBottom:
                            "2px solid #000",
                        paddingBottom: "10px",
                    }}
                >
                    <h2>School Fees Receipt</h2>
                    <p>
                        Receipt No:{" "}
                        {receipt.receiptNumber}
                    </p>
                </div>

                {/* DETAILS */}
                <div
                    style={{
                        marginTop: "20px",
                    }}
                >
                    <p>
                        <b>Student Name:</b>{" "}
                        {receipt.studentName}
                    </p>
                    <p>
                        <b>Class:</b>{" "}
                        {receipt.className} -{" "}
                        {receipt.section}
                    </p>
                    <p>
                        <b>Roll No:</b>{" "}
                        {receipt.rollNumber}
                    </p>
                    <p>
                        <b>Payment Date:</b>{" "}
                        {new Date(
                            receipt.paymentDate
                        ).toLocaleDateString()}
                    </p>
                    <p>
                        <b>Payment Mode:</b>{" "}
                        {
                            receipt.paymentMode
                        }
                    </p>
                </div>

                {/* AMOUNT BOX */}
                <div
                    style={{
                        marginTop: "20px",
                        padding: "15px",
                        background:
                            "#f0f0f0",
                        borderRadius: "8px",
                    }}
                >
                    <h3>
                        Amount Paid: ₹
                        {receipt.amount}
                    </h3>
                </div>

                {/* FOOTER */}
                <div
                    style={{
                        marginTop: "30px",
                        textAlign: "center",
                        fontSize: "12px",
                        color: "#666",
                    }}
                >
                    This is a system generated
                    receipt.
                </div>
            </div>
        </div>
    );
};

export default PrintReceipt;
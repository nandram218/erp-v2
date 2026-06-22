import React from "react";

const ReceiptModal = ({
    receipt,
    onClose,
}) => {

    if (!receipt) return null;

    // STEP 2.1E: Receipt accepts payment object, not student object
    // Payment object comes from Payment Entry / Payment History
    const payment = receipt.payment || receipt;

    return (

        <div
            style={{
                position: "fixed",
                inset: 0,
                background:
                    "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
            }}
        >

            <div
                style={{
                    width: "650px",
                    background: "#fff",
                    borderRadius: "16px",
                    padding: "24px",
                }}
            >

                <h2
                    style={{
                        textAlign: "center",
                    }}
                >
                    FEES RECEIPT
                </h2>

                <hr />

                <p>
                    <b>Receipt No:</b>
                    {" "}
                    {
                        payment.receiptNumber
                    }
                </p>

                <p>
                    <b>Student:</b>
                    {" "}
                    {
                        payment.studentName
                    }
                </p>

                <p>
                    <b>Class:</b>
                    {" "}
                    {
                        payment.className
                    }
                </p>

                {payment.section && (
                    <p>
                        <b>Section:</b>
                        {" "}
                        {
                            payment.section
                        }
                    </p>
                )}

                {payment.rollNumber && (
                    <p>
                        <b>Roll Number:</b>
                        {" "}
                        {
                            payment.rollNumber
                        }
                    </p>
                )}

                <p>
                    <b>Paid Amount:</b>
                    {" "}
                    ₹{payment.amount}
                </p>

                <p>
                    <b>Discount:</b>
                    {" "}
                    ₹
                    {
                        payment.discount
                    }
                </p>

                <p>
                    <b>Penalty:</b>
                    {" "}
                    ₹
                    {
                        payment.lateFee
                    }
                </p>

                <p>
                    <b>Final Paid:</b>
                    {" "}
                    ₹
                    {
                        payment.finalAmount
                    }
                </p>

                <p>
                    <b>Payment Mode:</b>
                    {" "}
                    {
                        payment.paymentMode
                    }
                </p>

                {payment.referenceNumber && (
                    <p>
                        <b>Reference Number:</b>
                        {" "}
                        {
                            payment.referenceNumber
                        }
                    </p>
                )}

                <p>
                    <b>Remarks:</b>
                    {" "}
                    {
                        payment.remarks
                    }
                </p>

                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        marginTop: "20px",
                    }}
                >

                    <button
                        onClick={onClose}
                    >
                        Close
                    </button>

                    <button
                        onClick={() =>
                            window.print()
                        }
                    >
                        Print
                    </button>

                </div>

            </div>

        </div>
    );
};

export default ReceiptModal;
import React from "react";

const ReceiptModal = ({
    receipt,
    onClose,
}) => {

    if (!receipt) return null;

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
                        receipt.receiptNumber
                    }
                </p>

                <p>
                    <b>Student:</b>
                    {" "}
                    {
                        receipt.studentName
                    }
                </p>

                <p>
                    <b>Father:</b>
                    {" "}
                    {
                        receipt.fatherName
                    }
                </p>

                <p>
                    <b>Class:</b>
                    {" "}
                    {
                        receipt.className
                    }
                </p>

                <p>
                    <b>Paid Amount:</b>
                    {" "}
                    ₹{receipt.amount}
                </p>

                <p>
                    <b>Discount:</b>
                    {" "}
                    ₹
                    {
                        receipt.discount
                    }
                </p>

                <p>
                    <b>Penalty:</b>
                    {" "}
                    ₹
                    {
                        receipt.lateFee
                    }
                </p>

                <p>
                    <b>Final Paid:</b>
                    {" "}
                    ₹
                    {
                        receipt.finalAmount
                    }
                </p>

                <p>
                    <b>Remaining Due:</b>
                    {" "}
                    ₹
                    {
                        receipt.remainingDue
                    }
                </p>

                <p>
                    <b>Payment Mode:</b>
                    {" "}
                    {
                        receipt.paymentMode
                    }
                </p>

                <p>
                    <b>Discount Type:</b>
                    {" "}
                    {
                        receipt.discountType
                    }
                </p>

                <p>
                    <b>Remarks:</b>
                    {" "}
                    {
                        receipt.remarks
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
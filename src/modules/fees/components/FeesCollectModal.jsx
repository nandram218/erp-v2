import React, { useMemo, useState } from "react";
import * as feesService from "../feesService";

const FeesCollectModal = ({ student, onClose, onSuccess }) => {

    const [amount, setAmount] = useState("");
    const [discount, setDiscount] = useState(0);
    const [lateFee, setLateFee] = useState(0);
    const [paymentMode, setPaymentMode] = useState("Cash");

    const dueAmount = Number(student?.dueAmount || 0);

    const finalPayable = useMemo(() => {
        return (
            Number(amount || 0) +
            Number(lateFee || 0) -
            Number(discount || 0)
        );
    }, [amount, lateFee, discount]);

    const remaining = Math.max(dueAmount - finalPayable, 0);

    const handleSubmit = () => {

        const paymentData = {
            amount: Number(amount),
            discount: Number(discount),
            lateFee: Number(lateFee),
            finalAmount: finalPayable,
            remainingDue: remaining,
            paymentMode,
            date: new Date().toISOString(),
        };

        const result = feesService.collectFeesPayment({
            studentId: student.studentId,
            paymentData,
        });

        onSuccess?.(result);
        onClose?.();
    };

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}>

            <div style={{
                background: "#fff",
                padding: 20,
                width: 500,
                borderRadius: 12
            }}>

                <h3>Collect Fees</h3>

                <input
                    placeholder="Amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />

                <input
                    placeholder="Discount"
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                />

                <input
                    placeholder="Late Fee"
                    type="number"
                    value={lateFee}
                    onChange={(e) => setLateFee(e.target.value)}
                />

                <p>Final: ₹{finalPayable}</p>
                <p>Remaining: ₹{remaining}</p>

                <button onClick={handleSubmit}>Collect</button>
                <button onClick={onClose}>Close</button>

            </div>

        </div>
    );
};

export default FeesCollectModal;
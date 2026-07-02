import React, { useMemo, useState } from "react";
import { getService } from "../../../core/serviceRegistry";

const feesService = getService("fees");

const FeesCollectModal = ({ student, onClose, onSuccess }) => {

    const [amount, setAmount] = useState("");
    const [discount, setDiscount] = useState(0);
    const [lateFee, setLateFee] = useState(0);
    const [paymentMode, setPaymentMode] = useState("Cash");
    const [referenceNumber, setReferenceNumber] = useState("");
    const [discountType, setDiscountType] = useState("");
    const [discountReason, setDiscountReason] = useState("");
    const [lateFeeReason, setLateFeeReason] = useState("");
    const [remarks, setRemarks] = useState("");
    const [processing, setProcessing] = useState(false);

    const dueAmount = Number(student?.dueAmount || 0);

    const finalPayable = useMemo(() => {
        return (
            Number(amount || 0) +
            Number(lateFee || 0) -
            Number(discount || 0)
        );
    }, [amount, lateFee, discount]);

    const remaining = Math.max(dueAmount - finalPayable, 0);

    const handleSubmit = async () => {
        if (processing) {
            return; // Prevent double-click
        }

        setProcessing(true);

        try {
            const paymentData = {
                amount: Number(amount),
                discount: Number(discount),
                lateFee: Number(lateFee),
                finalAmount: finalPayable,
                remainingDue: remaining,
                paymentMode,
                referenceNumber,
                discountType,
                discountReason,
                lateFeeReason,
                remarks,
                date: new Date().toISOString(),
            };

            const result = await feesService.collectFeesPayment({
                studentId: student.studentId,
                paymentData,
            });

            onSuccess?.(result);
            onClose?.();
        } catch (error) {
            console.error('Payment collection failed:', error);
            alert(error.message || "Payment failed. Please try again.");
        } finally {
            setProcessing(false);
        }
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
                    style={{ marginBottom: 10, padding: 8, width: '100%' }}
                />

                <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    style={{ marginBottom: 10, padding: 8, width: '100%' }}
                >
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                </select>

                {paymentMode !== "Cash" && (
                    <input
                        placeholder="Reference Number"
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        style={{ marginBottom: 10, padding: 8, width: '100%' }}
                    />
                )}

                <input
                    placeholder="Discount"
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    style={{ marginBottom: 10, padding: 8, width: '100%' }}
                />

                <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    style={{ marginBottom: 10, padding: 8, width: '100%' }}
                >
                    <option value="">Select Discount Type</option>
                    <option value="Scholarship">Scholarship</option>
                    <option value="Concession">Concession</option>
                    <option value="Sibling Discount">Sibling Discount</option>
                    <option value="Other">Other</option>
                </select>

                <input
                    placeholder="Discount Reason"
                    type="text"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    style={{ marginBottom: 10, padding: 8, width: '100%' }}
                />

                <input
                    placeholder="Late Fee"
                    type="number"
                    value={lateFee}
                    onChange={(e) => setLateFee(e.target.value)}
                    style={{ marginBottom: 10, padding: 8, width: '100%' }}
                />

                <input
                    placeholder="Late Fee Reason"
                    type="text"
                    value={lateFeeReason}
                    onChange={(e) => setLateFeeReason(e.target.value)}
                    style={{ marginBottom: 10, padding: 8, width: '100%' }}
                />

                <input
                    placeholder="Remarks"
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    style={{ marginBottom: 10, padding: 8, width: '100%' }}
                />

                <p>Final: ₹{finalPayable}</p>
                <p>Remaining: ₹{remaining}</p>

                <button 
                    onClick={handleSubmit} 
                    disabled={processing}
                    style={{ 
                        padding: 10, 
                        marginRight: 10,
                        opacity: processing ? 0.6 : 1,
                        cursor: processing ? 'not-allowed' : 'pointer'
                    }}
                >
                    {processing ? '⏳ Processing...' : 'Collect'}
                </button>
                <button onClick={onClose} style={{ padding: 10 }} disabled={processing}>Close</button>

            </div>

        </div>
    );
};

export default FeesCollectModal;
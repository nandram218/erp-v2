import React, {
    useEffect,
    useState,
} from "react";

import * as feesService from "../feesService";

const FeesHistoryPage = () => {

    const [history, setHistory] =
        useState([]);

    useEffect(() => {

        setHistory(
            feesService.getAllPaymentsHistory()
        );

    }, []);

    return (

        <div
            style={{
                padding: "20px",
                background: "#f1f5f9",
                minHeight: "100vh",
            }}
        >

            <h2>
                Fees Collection History
            </h2>

            <div
                style={{
                    overflowX: "auto",
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "14px",
                }}
            >

                <table
                    width="100%"
                    style={{
                        borderCollapse:
                            "collapse",
                    }}
                >

                    <thead>

                        <tr
                            style={{
                                background:
                                    "#1e3a8a",
                                color: "#fff",
                            }}
                        >

                            <th>
                                Receipt
                            </th>

                            <th>
                                Student
                            </th>

                            <th>
                                Class
                            </th>

                            <th>
                                Amount
                            </th>

                            <th>
                                Discount
                            </th>

                            <th>
                                Penalty
                            </th>

                            <th>
                                Final
                            </th>

                            <th>
                                Due Left
                            </th>

                            <th>
                                Mode
                            </th>

                            <th>
                                Date
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {history.map(
                            (item, i) => (

                                <tr key={i}>

                                    <td>
                                        {
                                            item.receiptNumber
                                        }
                                    </td>

                                    <td>
                                        {
                                            item.studentName
                                        }
                                    </td>

                                    <td>
                                        {
                                            item.className
                                        }
                                    </td>

                                    <td>
                                        ₹
                                        {
                                            item.amount
                                        }
                                    </td>

                                    <td>
                                        ₹
                                        {
                                            item.discount
                                        }
                                    </td>

                                    <td>
                                        ₹
                                        {
                                            item.lateFee
                                        }
                                    </td>

                                    <td>
                                        ₹
                                        {
                                            item.finalAmount
                                        }
                                    </td>

                                    <td>
                                        ₹
                                        {
                                            item.remainingDue
                                        }
                                    </td>

                                    <td>
                                        {
                                            item.paymentMode
                                        }
                                    </td>

                                    <td>
                                        {new Date(
                                            item.paymentDate
                                        ).toLocaleString()}
                                    </td>

                                </tr>
                            )
                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
};

export default FeesHistoryPage;
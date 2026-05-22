// src/modules/fees/pages/DueReportPage.jsx

import React, { useEffect, useState } from "react";
import * as feesService from "../feesService";

const DueReportPage = () => {
    const [students, setStudents] =
        useState([]);

    const loadData = () => {
        const data =
            feesService.getAllFeesRecords();

        const dueStudents = data.filter(
            (item) =>
                item.dueAmount > 0
        );

        setStudents(dueStudents);
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div
            style={{
                padding: "16px",
                background: "#f5f6fa",
                minHeight: "100vh",
            }}
        >
            <h2>Due Fees Report</h2>

            <div
                style={{
                    background: "#fff",
                    padding: "16px",
                    borderRadius: "10px",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        borderCollapse:
                            "collapse",
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                textAlign:
                                    "left",
                                borderBottom:
                                    "1px solid #ddd",
                            }}
                        >
                            <th>Student</th>
                            <th>Class</th>
                            <th>Total Fee</th>
                            <th>Paid</th>
                            <th>Due</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {students.map(
                            (item, index) => (
                                <tr
                                    key={index}
                                    style={{
                                        borderBottom:
                                            "1px solid #eee",
                                    }}
                                >
                                    <td>
                                        {
                                            item.studentName
                                        }
                                    </td>
                                    <td>
                                        {
                                            item.className
                                        }{" "}
                                        -{" "}
                                        {
                                            item.section
                                        }
                                    </td>
                                    <td>
                                        ₹
                                        {
                                            item.totalFee
                                        }
                                    </td>
                                    <td>
                                        ₹
                                        {
                                            item.paidAmount
                                        }
                                    </td>
                                    <td
                                        style={{
                                            color:
                                                "red",
                                            fontWeight:
                                                "bold",
                                        }}
                                    >
                                        ₹
                                        {
                                            item.dueAmount
                                        }
                                    </td>
                                    <td>
                                        {
                                            item.status
                                        }
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

export default DueReportPage;
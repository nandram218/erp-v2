// src/modules/fees/components/FeesSummaryCards.jsx

import React, { useEffect, useState } from "react";
import * as feesService from "../feesService";

const FeesSummaryCards = () => {
    const [stats, setStats] = useState({
        totalCollection: 0,
        totalDue: 0,
        totalFees: 0,
        paidStudents: 0,
        dueStudents: 0,
    });

    const [todayCollection, setTodayCollection] =
        useState(0);

    /* =========================
       LOAD STATS
    ========================= */

    const loadStats = () => {
        const feesData =
            feesService.getAllFeesRecords();

      setStats({
    totalCollection: feesService.getTotalCollection(),
    totalDue: feesService.getTotalDue(),
    paidStudents: feesService.getPaidStudentsCount(),
    dueStudents: feesService.getDueStudentsCount(),
});

       
        const today =
            feesService.getTodayCollection();

        setTodayCollection(today);
    };

    /* =========================
       INITIAL LOAD
    ========================= */

    useEffect(() => {
        loadStats();
    }, []);

    /* =========================
       CARD UI
    ========================= */

    const Card = ({
        title,
        value,
        color,
        icon,
    }) => (
        <div
            style={{
                flex: 1,
                padding: "16px",
                borderRadius: "12px",
                background: "#fff",
                boxShadow:
                    "0 2px 10px rgba(0,0,0,0.08)",
                borderLeft: `5px solid ${color}`,
                minWidth: "180px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems: "center",
                }}
            >
                <h4
                    style={{
                        margin: 0,
                        fontSize: "14px",
                        color: "#666",
                    }}
                >
                    {title}
                </h4>
                <span>{icon}</span>
            </div>

            <h2
                style={{
                    margin: "10px 0 0",
                    fontSize: "22px",
                    color: color,
                }}
            >
                {value}
            </h2>
        </div>
    );

    /* =========================
       RENDER
    ========================= */

    return (
        <div
            style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "20px",
            }}
        >
            <Card
                title="Total Collection"
                value={`₹${stats.totalCollection}`}
                color="#16a34a"
                icon="💰"
            />

            <Card
                title="Total Due"
                value={`₹${stats.totalDue}`}
                color="#dc2626"
                icon="⚠️"
            />

            <Card
                title="Today Collection"
                value={`₹${todayCollection}`}
                color="#2563eb"
                icon="📅"
            />

            <Card
                title="Paid Students"
                value={stats.paidStudents}
                color="#10b981"
                icon="✅"
            />

            <Card
                title="Due Students"
                value={stats.dueStudents}
                color="#f59e0b"
                icon="⏳"
            />
        </div>
    );
};

export default FeesSummaryCards;
import React from "react";

const SummaryCards = () => {
    const data = [
        { title: "Total Students", value: 3 },
        { title: "Present Today", value: 2 },
        { title: "Fees Collected", value: "₹7000" },
        { title: "Pending Fees", value: "₹3000" },
    ];

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
            }}
        >
            {data.map((item, index) => (
                <div
                    key={index}
                    style={{
                        background:
                            index === 0
                                ? "linear-gradient(135deg, #667eea, #764ba2)"
                                : index === 1
                                    ? "linear-gradient(135deg, #43cea2, #185a9d)"
                                    : index === 2
                                        ? "linear-gradient(135deg, #f7971e, #ffd200)"
                                        : "linear-gradient(135deg, #ff512f, #dd2476)",
                        color: "#fff",
                        padding: "20px",
                        borderRadius: "15px",
                        minWidth: "220px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                >
                    <h4>{item.title}</h4>
                    <h2>{item.value}</h2>
                </div>
            ))}
        </div>
    );
};

export default SummaryCards;
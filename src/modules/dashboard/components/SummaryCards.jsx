const SummaryCards = () => {
    const data = [
        { title: "Total Students", value: 1200 },
        { title: "Present Today", value: 1100 },
        { title: "Fees Collected (Month)", value: "₹5,40,000" },
        { title: "Pending Fees", value: "₹1,20,000" },
    ];

    return (
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {data.map((item, index) => (
                <div
                    key={index}
                    style={{
                        background: "#ffffff",
                        padding: "20px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        minWidth: "200px",
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
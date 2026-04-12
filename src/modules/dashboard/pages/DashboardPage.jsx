import SummaryCards from "../components/SummaryCards";

const DashboardPage = () => {
    return (
        <div style={{ padding: "20px" }}>
            <h1
                style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    marginBottom: "20px",
                }}
            >
                Dashboard 🚀
            </h1>

            <SummaryCards />
        </div>
    );
};

export default DashboardPage;
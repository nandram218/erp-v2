import { useSchoolStore } from "../../../store/schoolStore";
import { getService } from "../../../core/serviceRegistry";

const SummaryCards = () => {
    const students = useSchoolStore((state) => state.students);

    const studentService = getService("student");
    const receiptService = getService("receipt");
    const feesService = getService("fees");

    if (!studentService || !receiptService || !feesService) {
        return null;
    }

    const totalStudents = students.length;
    const receipts = receiptService.getAllReceipts();
    const feesCollected = receipts.reduce((sum, r) => sum + (r.finalAmount || 0), 0);
    const pendingFees = feesService.getTotalDue();

    const formatCurrency = (value) => {
        return `₹${value.toLocaleString("en-IN")}`;
    };

    const data = [
        { title: "Total Students", value: totalStudents },
        { title: "Fees Collected", value: formatCurrency(feesCollected) },
        { title: "Pending Fees", value: formatCurrency(pendingFees) },
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
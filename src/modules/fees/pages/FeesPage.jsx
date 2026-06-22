import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSchoolStore } from "../../../store/schoolStore";
import { getService } from "../../../core/serviceRegistry";
import { getStorageCompat } from "../../../services/storageService";
import { STORAGE_KEYS } from "../../../core/constants/storageKeys";
import FeesTable from "../components/FeesTable";
import FeesCollectModal from "../components/FeesCollectModal";
import ReceiptModal from "../components/ReceiptModal";

const feesService = getService("fees");

const getFeeSettings = () => {
    return getStorageCompat(STORAGE_KEYS.ERP_FEE_SETTINGS, null);
};

const FeesPage = () => {

    const navigate = useNavigate();
    const students = useSchoolStore((s) => s.students) || [];
    const feeData = getFeeSettings();

    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [activeStudent, setActiveStudent] = useState(null);
    const [receiptData, setReceiptData] = useState(null);

    const studentsRef = useMemo(() => students, [students]);

    useEffect(() => {
        if (!studentsRef?.length) return;
        
        if (feeData && Object.keys(feeData).length > 0) {
            feesService.syncStudentsToFeesDB({
                students: studentsRef
            });
        }
    }, [feeData, studentsRef]);

    const feesData = useMemo(() => {
        return feesService.getAllFeesRecords() || [];
    }, [students, feeData]);

    /* FILTER */
    const filtered = useMemo(() => {
        if (!search) return feesData;

        return feesData.filter((s) =>
            s.studentName?.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, feesData]);

    /* SELECT */
    const handleSelectStudent = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(filtered.map((s) => s.studentId));
        } else {
            setSelectedIds([]);
        }
    };

    const handleCollect = (student) => {
        // Get full student data from Zustand store for canonical fee structure
        const fullStudent = students.find(s => s.studentId === student.studentId);
        setActiveStudent(fullStudent || student);
    };

    const handleViewAccount = (student) => {
        navigate(`/fees/account/${student.studentId}`);
    };

    const handlePaymentSuccess = (data) => {
        setReceiptData(data);
        setActiveStudent(null);
        setSelectedIds([]);
    };

    /* SUMMARY */
    const totalDue = filtered.reduce(
        (a, b) => a + Number(b.dueAmount || 0),
        0
    );

    return (
        <div style={{ padding: 16, background: "#eef2ff", minHeight: "100vh" }}>

            {/* TITLE */}
            <h2 style={{ fontSize: 26, fontWeight: 900 }}>
                ERP Fees Management
            </h2>

            {/* SEARCH */}
            <input
                placeholder="Search student..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    padding: 10,
                    width: 300,
                    marginBottom: 12,
                }}
            />

            {/* LIVE CARD (RESTORED ERP FEEL) */}
            <div style={{
                background: "linear-gradient(135deg,#1e3a8a,#2563eb)",
                color: "#fff",
                padding: 16,
                borderRadius: 14,
                marginBottom: 12,
                fontWeight: 800,
            }}>
                Total Due (Filtered): ₹{totalDue}
            </div>
            {/* SELECTED PANEL (STEP 2.1C - Bulk actions removed) */}
            {selectedIds.length > 0 && (

                <div
                    style={{
                        background:
                            "linear-gradient(135deg,#111827,#1e293b)",
                        color: "#fff",
                        borderRadius: "16px",
                        padding: "16px",
                        marginBottom: "16px",
                        boxShadow:
                            "0 5px 0 rgba(0,0,0,0.35)",
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "12px",
                        }}
                    >

                        <div>

                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: "20px",
                                }}
                            >
                                Selected Students :
                                {" "}
                                {selectedIds.length}
                            </h3>

                            <p
                                style={{
                                    margin: "6px 0 0",
                                    opacity: 0.85,
                                }}
                            >
                                Selection ready
                            </p>

                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                flexWrap: "wrap",
                            }}
                        >

                            <button
                                onClick={() =>
                                    setSelectedIds([])
                                }
                                style={{
                                    background: "#dc2626",
                                    color: "#fff",
                                    border: "none",
                                    padding: "10px 14px",
                                    borderRadius: "10px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                }}
                            >
                                ❌ Clear Selection
                            </button>

                        </div>

                    </div>

                </div>
            )}
            {/* TABLE */}
            <FeesTable
                data={filtered}
                selectedIds={selectedIds}
                onSelectStudent={handleSelectStudent}
                onSelectAll={handleSelectAll}
                onCollect={handleCollect}
                onViewAccount={handleViewAccount}
                feeData={feeData}
                students={students}
            />
            
            {/* MODAL */}
            {activeStudent && (
                <FeesCollectModal
                    student={activeStudent}
                    onClose={() => setActiveStudent(null)}
                    onSuccess={handlePaymentSuccess}
                    feeData={feeData}
                />
            )}

            {receiptData && (
                <ReceiptModal
                    receipt={receiptData}
                    onClose={() => setReceiptData(null)}
                />
            )}

        </div>
    );
};

export default FeesPage;
import React, { useRef, useEffect, useState } from "react";
import { useSchoolStore } from "../../../store/schoolStore";
import { useLocation, useNavigate } from "react-router-dom";
import Certificate from "./Certificate";
import { generateCertificate } from "./certificateService";
import { downloadPDF } from "./certificatePdfService";

const CertificatePreview = () => {

    const { state } = useLocation();
    const navigate = useNavigate();
    const printRef = useRef();

    const { schoolData, loadSchoolData } = useSchoolStore();

    const [certificatesData, setCertificatesData] = useState([]);
    const [ready, setReady] = useState(false); // 🔥 NEW

    const students = state?.students || [];
    const type = state?.type;

    // 🔥 LOAD SCHOOL ONLY ONCE
    useEffect(() => {
        loadSchoolData();
    }, []);

    // 🔥 GENERATE ONLY AFTER SCHOOL READY (MAIN FIX)
    useEffect(() => {

        if (!schoolData) return;

        const data = students.map((s) => ({
            id: s.id,
            cert: generateCertificate(s, type),
        }));

        setCertificatesData(data);

        // 🔥 SMALL DELAY (prevents repaint blink)
        setTimeout(() => {
            setReady(true);
        }, 50);

    }, [schoolData]);

    const school =
        schoolData?.schools?.english ||
        schoolData?.schools?.single ||
        schoolData;

    if (!state) return <h2>No Data</h2>;
    if (!schoolData || !ready) return <h2>Loading school...</h2>;

    const handlePrint = () => window.print();
    const handleDownload = () => downloadPDF(printRef.current);

    return (
        <div>

            {/* 🔝 HEADER SAME (UNCHANGED) */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 18px",
                background: "linear-gradient(145deg,#e3f2fd,#bbdefb)",
                borderBottom: "2px solid #90caf9",
                position: "sticky",
                top: 0,
                zIndex: 10
            }}>

                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: "#000",
                        color: "#fff",
                        padding: "10px 18px",
                        borderRadius: "10px",
                        border: "none",
                        fontWeight: "700",
                        cursor: "pointer",
                        boxShadow: "0 5px 0 rgba(0,0,0,0.5)"
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = "translateY(2px)"}
                    onMouseUp={(e) => e.currentTarget.style.transform = "translateY(0px)"}
                >
                    ⬅ Back
                </button>

                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={handlePrint}
                        style={{
                            background: "#1b5e20",
                            color: "#fff",
                            padding: "10px 18px",
                            borderRadius: "10px",
                            border: "none",
                            fontWeight: "700",
                            cursor: "pointer",
                            boxShadow: "0 5px 0 rgba(0,0,0,0.5)"
                        }}
                    >
                        🖨 Print
                    </button>

                    <button
                        onClick={handleDownload}
                        style={{
                            background: "#0d47a1",
                            color: "#fff",
                            padding: "10px 18px",
                            borderRadius: "10px",
                            border: "none",
                            fontWeight: "700",
                            cursor: "pointer",
                            boxShadow: "0 5px 0 rgba(0,0,0,0.5)"
                        }}
                    >
                        📄 PDF
                    </button>
                </div>
            </div>

            {/* ✅ CERTIFICATES */}
            <div ref={printRef}>
                {certificatesData.map((s) => (
                    <div key={s.id} style={{ pageBreakAfter: "always" }}>
                        <Certificate data={s.cert} school={school} />
                    </div>
                ))}
            </div>

        </div>
    );
};

export default CertificatePreview;
import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Certificate from "./Certificate";
import { generateCertificate } from "./certificateService";
import { downloadPDF } from "./certificatePdfService";
import { getStorageCompat } from "../../../../services/storageService";
import { STORAGE_KEYS } from "../../../../core/constants/storageKeys";

const CertificatePreview = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const printRef = useRef();

    // ✅ SAFE DB LOAD - using storageService abstraction
    const db = getStorageCompat(STORAGE_KEYS.ERP_DB, {});

    const schoolData = db.school || {};

    const school =
        schoolData?.schools?.english ||
        schoolData?.schools?.single ||
        schoolData || {};

    const students = state?.students || [];
    const type = state?.type;

    const [certificatesData, setCertificatesData] = useState([]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!students.length) return;

        const data = students.map((s) => ({
            id: s.id,
            cert: generateCertificate(s, type),
        }));

        setCertificatesData(data);

        const t = setTimeout(() => setReady(true), 50);
        return () => clearTimeout(t);

    }, [students, type]);

    if (!state) return <h2>No Data</h2>;
    if (!ready) return <h2>Loading...</h2>;

    return (
        <div>

            {/* HEADER */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 18px",
                background: "#e3f2fd",
                position: "sticky",
                top: 0,
                zIndex: 10
            }}>
                <button onClick={() => navigate(-1)}>⬅ Back</button>

                <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => window.print()}>🖨 Print</button>
                    <button onClick={() => downloadPDF(printRef.current)}>📄 PDF</button>
                </div>
            </div>

            {/* CERTIFICATES */}
            <div ref={printRef}>
                {certificatesData.map((s) => (
                    <div key={s.id} className="cert-page">
                        <Certificate data={s.cert} school={school} />
                    </div>
                ))}
            </div>

        </div>
    );
};

export default CertificatePreview;
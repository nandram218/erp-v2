import React from "react";
import { useParams } from "react-router-dom";
import Barcode from "react-barcode";
import QRCode from "react-qr-code";

const StudentIDCard = () => {
    const { id } = useParams();

    const students = JSON.parse(localStorage.getItem("students")) || [];
    const s = students.find(st => st.id === Number(id));

    if (!s) return <h3>No Student Found</h3>;

    return (
        <div style={{ padding: 20 }}>
            <h2>Single ID Card</h2>

            <div style={{
                width: 320,
                background: "#1976d2",
                color: "#fff",
                padding: 10,
                borderRadius: 10
            }}>
                <h4>My Public School</h4>

                <p><b>Name:</b> {s.name}</p>
                <p><b>Class:</b> {s.class} ({s.section})</p>
                <p><b>ID:</b> {s.id}</p>

                <Barcode value={String(s.id)} width={1} height={40} />
                <QRCode value={JSON.stringify(s)} size={80} />
            </div>

            <button onClick={() => window.print()}>Print</button>
        </div>
    );
};

export default StudentIDCard;
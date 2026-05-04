import React, { useState } from "react";
import "./certificate.css";

const Certificate = ({ data, school }) => {

    // ✅ IMAGE LOAD CONTROL (BLINK STOP)
    const [imgLoaded, setImgLoaded] = useState(false);

    return (
        <div className={`certificate ${data.theme}`}>

            <div className="inner-border">

                <div className="header">
                    <h1>{school?.name || ""}</h1>
                    <p>{school?.address || ""}</p>
                </div>

                <div className="photo-box">
                    <img
                        src={data?.photo || "/default-user.png"}
                        alt="student"
                        style={{
                            opacity: imgLoaded ? 1 : 0,   // 🔥 NO FLASH
                            transition: "opacity 0.3s ease"
                        }}
                        onLoad={() => setImgLoaded(true)}
                        onError={(e) => {
                            e.target.src = "/default-user.png";
                        }}
                    />
                </div>

                <h2 className="title">{data?.title}</h2>
                <h1 className="student-name">{data?.name}</h1>
                <p className="text">{data?.text}</p>

                <div className="details">
                    <span><b>Class:</b> {data?.class}</span>
                    <span><b>Father:</b> {data?.fatherName}</span>
                    <span><b>Date:</b> {data?.date}</span>
                </div>

                <div className="footer">
                    <div>
                        {school?.sign && (
                            <img src={school.sign} alt="sign" style={{ height: "40px" }} />
                        )}
                        <div>Principal</div>
                    </div>
                    <div>Seal</div>
                </div>

            </div>
        </div>
    );
};

export default React.memo(Certificate);
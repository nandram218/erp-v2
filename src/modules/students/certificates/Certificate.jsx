import React from "react";
import "./certificate.css";

const Certificate = ({ data, school }) => {
    return (
        <div className={`certificate ${data.theme}`}>

            <div className="inner-border">

                {/* HEADER - STATIC (NO RE-RENDER TRICK) */}
                <div className="header" style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "15px"
                }}>

                    {/* 🏫 LOGO */}
                    {school?.logo && (
                        <img
                            src={school.logo}
                            alt="logo"
                            style={{ height: "60px" }}
                        />
                    )}

                    <div>
                        <h1>{school?.name || ""}</h1>
                        <p>{school?.address || ""}</p>
                    </div>

                </div>

                {/* PHOTO - NO STATE, NO ONLOAD */}
                <div className="photo-box">
                    <img
                        src={data.photo || "/default-user.png"}
                        alt="student"
                        loading="eager"
                        decoding="sync"
                    />
                </div>

                <h2 className="title">{data.title}</h2>
                <h1 className="student-name">{data.name}</h1>
                <p className="text">{data.text}</p>

                <div className="details">
                    <span><b>Class:</b> {data.class}</span>
                    <span><b>Father:</b> {data.fatherName}</span>
                    <span><b>Date:</b> {data.date}</span>
                </div>

                <div className="footer">
                    <div>
                        {school?.sign && (
                            <img src={school.sign} style={{ height: 40 }} />
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
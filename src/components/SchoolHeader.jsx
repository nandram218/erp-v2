import React from "react";
import { useSchoolStore } from "../store/schoolStore";
import { SchoolLogo } from "../media/MediaRenderer";

const SchoolHeader = () => {

    const { schoolData } = useSchoolStore();

    // 🔥 SAFE SCHOOL PICK (ALL CASE HANDLED)
    const school =
        schoolData?.mediumType === "both"
            ? schoolData?.schools?.english
            : schoolData?.schools?.[schoolData?.mediumType || "english"];

    // 🛑 अगर data नहीं है → blank return (no crash / no blink)
    if (!school) return null;

    return (
        <div style={{

            background: "linear-gradient(135deg, #020617, #0f172a, #1e3a8a)",
            color: "#fff",
            padding: "12px 16px",

            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",

            borderBottom: "2px solid #38bdf8",
            boxShadow: "0 5px 15px rgba(0,0,0,0.7)"
        }}>

            {/* 🔵 LEFT SIDE */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                minWidth: "220px"
            }}>
                <SchoolLogo
                    schoolId="default"
                    fallback={school?.logo || "https://via.placeholder.com/80"}
                    alt="logo"
                    style={{
                        width: "55px",
                        height: "55px",
                        borderRadius: "50%",
                        border: "2px solid gold",
                        objectFit: "cover",
                        boxShadow: "0 0 10px gold"
                    }}
                />

                {/* EST YEAR */}
                <div style={{
                    fontSize: "12px",
                    color: "#facc15",
                    fontWeight: "700"
                }}>
                    {school?.established || school?.est || ""}
                </div>
            </div>

            {/* 🔥 CENTER MAIN */}
            <div style={{
                textAlign: "center",
                flex: 1
            }}>

                {/* SCHOOL NAME (🔥 DYNAMIC FIX) */}
                <svg width="100%" height="60" viewBox="0 0 1200 80">
                    <defs>
                        <linearGradient id="goldReal" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#f9d976" />
                            <stop offset="20%" stopColor="#f39c12" />
                            <stop offset="40%" stopColor="#d4af37" />
                            <stop offset="60%" stopColor="#b8962e" />
                            <stop offset="80%" stopColor="#8c6f1a" />
                            <stop offset="100%" stopColor="#f1c40f" />
                        </linearGradient>

                        <filter id="gold3D" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                            <feSpecularLighting
                                in="blur"
                                surfaceScale="5"
                                specularConstant="1"
                                specularExponent="20"
                                lightingColor="#ffffff"
                                result="specLight">
                                <fePointLight x="-200" y="-100" z="300" />
                            </feSpecularLighting>
                            <feComposite in="specLight" in2="SourceAlpha" operator="in" result="specOut" />
                            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k2="1" k3="1" />
                        </filter>
                    </defs>

                    <text
                        x="50%"
                        y="50%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        fontSize="34"
                        fontWeight="900"
                        fontStyle="italic"
                        fill="url(#goldReal)"
                        filter="url(#gold3D)"
                        stroke="#5c4710"
                        strokeWidth="1.5"
                        style={{ letterSpacing: "2px" }}
                    >
                        {school?.name || "School Name"}
                    </text>
                </svg>

                {/* TAGLINE */}
                <div style={{
                    fontSize: "13px",
                    color: "#e0f2fe",
                    marginTop: "2px",
                    fontStyle: "italic"
                }}>
                    {school?.tagline || ""}
                </div>

                {/* ADDRESS */}
                <div style={{
                    fontSize: "12px",
                    color: "#cbd5f5",
                    marginTop: "1px"
                }}>
                    {school?.address || ""}
                </div>

            </div>

            {/* 🔵 RIGHT SIDE */}
            <div style={{
                minWidth: "220px",
                textAlign: "right"
            }}>

                {/* UDISE */}
                <div style={{
                    fontSize: "12px",
                    color: "#facc15",
                    fontWeight: "700"
                }}>
                    {school?.udise || ""}
                </div>

                {/* ICON */}
                <div style={{
                    fontSize: "22px",
                    marginTop: "3px",
                    textShadow: "0 0 10px #38bdf8"
                }}>
                    🎓
                </div>

            </div>

        </div>
    );
};

export default SchoolHeader;
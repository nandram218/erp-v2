import React from "react";
import { useSchoolStore } from "../store/schoolStore";

const DocumentHeader = () => {

    const { schoolData } = useSchoolStore();
    const school =
        schoolData?.mediumType === "both"
            ? schoolData?.schools?.english
            : schoolData?.schools?.single;

    return (
        <div style={{
            textAlign: "center",
            borderBottom: "2px solid #000",
            paddingBottom: "8px",
            marginBottom: "10px"
        }}>

            <div style={{
                fontSize: "22px",
                fontWeight: "900"
            }}>
                {school?.name}
            </div>

            <div style={{
                fontSize: "13px",
                fontStyle: "italic"
            }}>
                {school?.tagline}
            </div>

            <div style={{
                fontSize: "12px"
            }}>
                {school?.address}
            </div>

            <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                marginTop: "4px"
            }}>
                <span>{school?.est}</span>
                <span>{school?.udise}</span>
            </div>

        </div>
    );
};

export default DocumentHeader;
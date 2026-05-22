import React, { useEffect, useState } from "react";
import { classSubjectService } from "../classes-subjects/classSubjectService";

const STORAGE_KEY = "ERP_FEE_SETTINGS";

export default function FeeStructure() {

    const [classes, setClasses] = useState([]);

    const [db, setDb] = useState({
        settings: {},
        classes: {}
    });

    /* =========================================
       LOAD CLASSES
    ========================================= */

    useEffect(() => {

        const raw =
            classSubjectService.getClasses() || [];

        const unique = [];

        raw.forEach((c) => {

            const name = c.stream
                ? `${c.className}-${c.stream}`
                : c.className;

            if (!unique.includes(name)) {
                unique.push(name);
            }
        });

        setClasses(unique);

    }, []);

    /* =========================================
       LOAD FEES DB
    ========================================= */

    useEffect(() => {

        try {

            const saved =
                JSON.parse(
                    localStorage.getItem(STORAGE_KEY)
                );

            if (saved) {
                setDb(saved);
            }

        } catch (err) {

            console.error(
                "FeeStructure load error",
                err
            );
        }

    }, []);

    /* =========================================
       TOTAL
    ========================================= */

    const getTotal = (feeTypes = {}) => {

        return Object.values(feeTypes)

            .reduce(
                (a, b) =>
                    a + Number(b.amount || 0),
                0
            );
    };

    /* =========================================
       RENDER
    ========================================= */

    return (

        <div style={styles.page}>

            <h2 style={styles.title}>
                💰 Fee Structure
            </h2>

            {classes.map((cls, i) => {

                const classData =
                    db.classes?.[cls];

                const feeTypes =
                    classData?.feeTypes || {};

                return (

                    <div
                        key={i}
                        style={styles.card}
                    >

                        <h3>
                            {cls}
                        </h3>

                        {!Object.keys(feeTypes).length && (

                            <div style={styles.empty}>
                                ⚠ No Fee Setup
                            </div>
                        )}

                        {Object.entries(feeTypes).map(
                            ([name, data], j) => (

                                <div
                                    key={j}
                                    style={styles.row}
                                >

                                    <div>
                                        {name}
                                    </div>

                                    <div>
                                        ₹ {data.amount}
                                    </div>

                                    <div>
                                        {data.category}
                                    </div>

                                </div>
                            )
                        )}

                        <div style={styles.total}>
                            Total : ₹ {getTotal(feeTypes)}
                        </div>

                    </div>
                );
            })}

        </div>
    );
}

/* =============================================
   STYLES
============================================= */

const styles = {

    page: {
        padding: 20,
        background: "#0f172a",
        minHeight: "100vh",
        color: "#fff"
    },

    title: {
        marginBottom: 20
    },

    card: {
        background: "#1e293b",
        padding: 20,
        borderRadius: 16,
        marginBottom: 20
    },

    row: {
        display: "flex",
        justifyContent: "space-between",
        padding: 10,
        background: "#0f172a",
        borderRadius: 10,
        marginTop: 10,
        flexWrap: "wrap",
        gap: 10
    },

    total: {
        marginTop: 20,
        fontWeight: "bold",
        color: "#38bdf8"
    },

    empty: {
        marginTop: 10,
        color: "#f87171"
    }
};
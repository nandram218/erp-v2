import React, { useEffect, useState } from "react";
import { classSubjectService } from "../classes-subjects/classSubjectService";
import { feesService } from "./feesService";

export default function FeeStructure() {

    const [classes, setClasses] = useState([]);
    const [fees, setFees] = useState({});
    const [settings, setSettings] = useState(null);

    // LOAD CLASSES
    useEffect(() => {
        const data = classSubjectService.getClasses() || [];

        const unique = [];
        data.forEach(c => {
            const name = c.stream
                ? `${c.className}-${c.stream}`
                : c.className;

            if (!unique.includes(name)) {
                unique.push(name);
            }
        });

        setClasses(unique);
    }, []);

    // LOAD SETTINGS
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("ERP_FEE_SETTINGS"));
        setSettings(saved);
    }, []);

    // HANDLE CHANGE
    const handleChange = (cls, type, value) => {
        setFees(prev => ({
            ...prev,
            [cls]: {
                ...prev[cls],
                [type]: Number(value)
            }
        }));
    };

    // TOTAL
    const getTotal = (cls) => {
        const data = fees[cls] || {};
        return Object.values(data).reduce((a, b) => a + b, 0);
    };

    // SAVE
    const handleSave = () => {
        feesService.save({ fees, settings });
        alert("✅ Fees Saved");
    };

    if (!settings) return <h3>⚠ Please setup Fee Settings first</h3>;

    return (
        <div style={{ padding: 20 }}>

            <h2>💰 Fee Structure</h2>

            {classes.map((cls, i) => (
                <div key={i} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
                    <h3>{cls}</h3>

                    {/* LOOP THROUGH SETTINGS */}
                    {Object.values(settings.feeTypes).flat().map((type, j) => (
                        <div key={j}>
                            {type}
                            <input
                                type="number"
                                placeholder="₹"
                                onChange={(e) =>
                                    handleChange(cls, type, e.target.value)
                                }
                            />
                        </div>
                    ))}

                    <h4>Total: ₹ {getTotal(cls)}</h4>
                </div>
            ))}

            <button onClick={handleSave}>Save All</button>
        </div>
    );
}
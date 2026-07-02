import React, { useEffect, useMemo, useState } from "react";
import { getService } from "../../core/serviceRegistry";

const classSubjectService = getService("classSubject");
const feeSettingsService = getService("feeSettings");

/* =========================================================
   MIGRATION FUNCTION
   Convert old format to canonical format
========================================================= */

const migrateToCanonical = (oldData) => {
    const canonical = {
        schoolId: oldData.schoolId || "",
        academicYear: oldData.academicYear || "2024-25",
        classes: {},
        transportRoutes: [],
        hostelFee: { enabled: false, amount: 0 }
    };

    // Migrate classes
    Object.entries(oldData.classes || {}).forEach(([className, classData]) => {
        const feeTypes = classData.feeTypes || {};
        const compulsoryFees = [];
        const optionalFees = [];

        Object.entries(feeTypes).forEach(([feeName, feeData]) => {
            const fee = {
                id: `fee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: feeName,
                amount: feeData.amount || 0
            };

            if (feeData.category === "compulsory") {
                compulsoryFees.push(fee);
            } else {
                optionalFees.push(fee);
            }
        });

        canonical.classes[className] = {
            compulsoryFees,
            optionalFees
        };
    });

    return canonical;
};

/* =========================================================
   PREDEFINED FEE TYPE CATALOG
========================================================= */

const feeTypeCatalog = [
    { id: "admission", name: "Admission Fee", defaultCategory: "academicCompulsory" },
    { id: "tuition", name: "Tuition Fee", defaultCategory: "academicCompulsory" },
    { id: "exam", name: "Exam Fee", defaultCategory: "academicCompulsory" },
    { id: "library", name: "Library Fee", defaultCategory: "supportingAcademicOptional" },
    { id: "computer", name: "Computer Fee", defaultCategory: "supportingAcademicOptional" },
    { id: "lab", name: "Lab Fee", defaultCategory: "supportingAcademicOptional" },
    { id: "smartClass", name: "Smart Class Fee", defaultCategory: "supportingAcademicOptional" },
    { id: "eLearning", name: "E-Learning Fee", defaultCategory: "supportingAcademicOptional" },
    { id: "event", name: "Event Fee", defaultCategory: "supportingAcademicOptional" },
    { id: "sports", name: "Sports Fee", defaultCategory: "supportingAcademicOptional" },
    { id: "activity", name: "Activity Fee", defaultCategory: "supportingAcademicOptional" },
    { id: "cultural", name: "Cultural Fee", defaultCategory: "supportingAcademicOptional" },
    { id: "tour", name: "Tour Fee", defaultCategory: "supportingAcademicOptional" },
    { id: "annual", name: "Annual Fee", defaultCategory: "academicCompulsory" },
    { id: "extraClass", name: "Extra Class Fee", defaultCategory: "supportingAcademicOptional" },
    { id: "development", name: "Development Fee", defaultCategory: "academicCompulsory" },
    { id: "registration", name: "Registration Fee", defaultCategory: "academicCompulsory" },
    { id: "idCard", name: "ID Card + Diary Fee", defaultCategory: "supportingAcademicOptional" },
];

/* =========================================================
   MONTHS
========================================================= */

const months = [
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar"
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function FeeSettings() {

    /* =====================================================
       STATES
    ===================================================== */

    const [classes, setClasses] = useState([]);

    const [selectedClass, setSelectedClass] = useState("");

    const [mode, setMode] = useState("view");

    const [showHelp, setShowHelp] = useState(false);

    const [customType, setCustomType] = useState("");
    const [selectedFeeType, setSelectedFeeType] = useState("");
    const [selectedFeeCategory, setSelectedFeeCategory] = useState("academicCompulsory");

    const [db, setDb] = useState({
        schoolId: "",
        academicYear: "2024-25",
        classes: {},
        transportRoutes: [],
        hostelFee: { enabled: false, amount: 0 }
    });

    const [tempClassData, setTempClassData] = useState({
        compulsoryFees: [],
        optionalFees: []
    });

    const [saving, setSaving] = useState(false);

    /* =====================================================
       LOAD CLASSES
    ===================================================== */

    useEffect(() => {

        const raw = classSubjectService.getClasses() || [];

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

    /* =====================================================
       LOAD SAVED
    ===================================================== */

    useEffect(() => {
        const saved = feeSettingsService.getFeeSettings();
        if (saved) {
            // If saved data is in old format, migrate to canonical
            if (saved.settings && saved.classes) {
                // Old format detected - migrate to canonical
                const migrated = migrateToCanonical(saved);
                setDb(migrated);
                feeSettingsService.saveFeeSettings(migrated);
            } else {
                // Already in canonical format
                setDb(saved);
            }
        }
    }, []);

    /* =====================================================
       CURRENT CLASS DATA
    ===================================================== */

    useEffect(() => {

        if (!selectedClass) return;

        const cls =
            db.classes?.[selectedClass];

        if (mode === "edit") {

            setTempClassData(
                cls || { compulsoryFees: [], optionalFees: [] }
            );
        }

        if (mode === "create") {

            if (cls) {

                alert("⚠ Fees already exist. Use EDIT.");

                setMode("view");

                return;
            }

            setTempClassData({
                compulsoryFees: [],
                optionalFees: []
            });
        }

        if (mode === "view") {

            setTempClassData(
                cls || { compulsoryFees: [], optionalFees: [] }
            );
        }

    }, [selectedClass, mode, db]);

    /* =====================================================
       CURRENT
    ===================================================== */

    const compulsoryFees = tempClassData.compulsoryFees || [];
    const optionalFees = tempClassData.optionalFees || [];

    /* =====================================================
       ADD FEE FROM CATALOG
    ===================================================== */

    const addFeeFromCatalog = (feeTypeId, amount) => {
        if (mode === "view") return;
        if (!feeTypeId || !amount) return;

        const feeType = feeTypeCatalog.find(ft => ft.id === feeTypeId);
        if (!feeType) return;

        const fee = {
            id: `fee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: feeType.name,
            amount: Number(amount)
        };

        // Automatically route to correct bucket based on category
        if (selectedFeeCategory === "academicCompulsory") {
            setTempClassData({
                ...tempClassData,
                compulsoryFees: [...compulsoryFees, fee]
            });
        } else {
            setTempClassData({
                ...tempClassData,
                optionalFees: [...optionalFees, fee]
            });
        }

        setSelectedFeeType("");
    };

    /* =====================================================
       REMOVE FEE
    ===================================================== */

    const removeFee = (feeId, type) => {
        if (mode === "view") return;

        if (type === "compulsory") {
            setTempClassData({
                ...tempClassData,
                compulsoryFees: compulsoryFees.filter(f => f.id !== feeId)
            });
        } else {
            setTempClassData({
                ...tempClassData,
                optionalFees: optionalFees.filter(f => f.id !== feeId)
            });
        }
    };

    /* =====================================================
       HANDLE TYPE CHANGE
    ===================================================== */

    const handleTypeChange = (
        feeId,
        field,
        value,
        type
    ) => {

        if (mode === "view") return;

        const fees = type === "compulsory" ? compulsoryFees : optionalFees;
        const updated = fees.map(fee =>
            fee.id === feeId
                ? { ...fee, [field]: field === "amount" ? Number(value) : value }
                : fee
        );

        if (type === "compulsory") {
            setTempClassData({
                ...tempClassData,
                compulsoryFees: updated
            });
        } else {
            setTempClassData({
                ...tempClassData,
                optionalFees: updated
            });
        }
    };

    /* =====================================================
       HANDLE HOSTEL FEE
    ===================================================== */

    const handleHostelFee = (field, value) => {
        setDb(prev => ({
            ...prev,
            hostelFee: {
                ...prev.hostelFee,
                [field]: field === "amount" ? Number(value) : value
            }
        }));
    };



    /* =====================================================
       SAVE
    ===================================================== */

    const handleSave = () => {
        if (!selectedClass) {
            alert("⚠ Select class first");
            return;
        }

        const updated = {
            ...db,
            classes: {
                ...db.classes,
                [selectedClass]: tempClassData
            }
        };

        setDb(updated);
        feeSettingsService.saveFeeSettings(updated);
        alert("✅ Fees Saved Successfully");
        setMode("view");
    };

    /* =====================================================
       RESET CLASS
    ===================================================== */

    const resetClass = () => {

        if (!selectedClass) return;

        if (
            !window.confirm(
                "Clear class fee setup?"
            )
        ) return;

        const updated = {
            ...db
        };

        delete updated.classes[selectedClass];

        setDb(updated);
        feeSettingsService.saveFeeSettings(updated);

        setTempClassData({
            compulsoryFees: [],
            optionalFees: []
        });
    };

    /* =====================================================
       RESET ALL
    ===================================================== */

    const resetAll = () => {
        if (
            !window.confirm(
                "Clear ALL fee setup?"
            )
        ) return;

        feeSettingsService.clearFeeSettings();

        setDb({
            schoolId: "",
            academicYear: "2024-25",
            classes: {},
            transportRoutes: [],
            hostelFee: { enabled: false, amount: 0 }
        });

        setTempClassData({
            compulsoryFees: [],
            optionalFees: []
        });
    };

    /* =====================================================
       TOTALS
    ===================================================== */

    const grandTotal = useMemo(() => {
        const compulsoryTotal = compulsoryFees.reduce((sum, fee) => sum + fee.amount, 0);
        const optionalTotal = optionalFees.reduce((sum, fee) => sum + fee.amount, 0);
        return compulsoryTotal + optionalTotal;
    }, [compulsoryFees, optionalFees]);

    const compulsoryTotal = useMemo(() => {
        return compulsoryFees.reduce((sum, fee) => sum + fee.amount, 0);
    }, [compulsoryFees]);

    const optionalTotal = useMemo(() => {
        return optionalFees.reduce((sum, fee) => sum + fee.amount, 0);
    }, [optionalFees]);

    /* =====================================================
       DIVIDER
    ===================================================== */

    const divideAmount = (
        amount,
        freq
    ) => {

        if (!amount) return 0;

        switch (freq) {

            case "monthly":
                return Math.round(amount / 12);

            case "quarterly":
                return Math.round(amount / 4);

            case "three":
                return Math.round(amount / 3);

            case "half":
                return Math.round(amount / 2);

            case "yearly":
                return amount;

            case "one":
                return amount;

            default:
                return amount;
        }
    };

    /* =====================================================
       LABELS
    ===================================================== */

    const getFreqLabel = (
        amount,
        freq
    ) => {

        const value =
            divideAmount(amount, freq);

        switch (freq) {

            case "monthly":
                return `₹ ${value} / Month`;

            case "quarterly":
                return `₹ ${value} / Every Quarter`;

            case "three":
                return `₹ ${value} / 3 Times In Year`;

            case "half":
                return `₹ ${value} / Every 6 Months`;

            case "yearly":
                return `₹ ${value} / Year`;

            case "one":
                return `₹ ${value} One Time`;

            default:
                return `₹ ${value}`;
        }
    };

    /* =====================================================
       TITLES
    ===================================================== */

    const getTitle = (key) => ({

        academic: "📘 Academic",

        supportingAcademic: "🧪 Supporting Academic",

        facilities: "🚌 Facilities",

        activities: "🎯 Special / Occasional"

    }[key]);

    /* =====================================================
       SETTINGS
    ===================================================== */

    const settings =
        db.settings || {};

    /* =====================================================
       RETURN
    ===================================================== */

    return (

        <div style={styles.page}>

            {/* =================================================
                TOP BAR
            ================================================= */}

            <div style={styles.top}>

                <button
                    style={styles.btn3d}
                    onClick={() => window.history.back()}
                >
                    ⬅ Back
                </button>

                <button
                    style={styles.btn3d}
                    onClick={() =>
                        setShowHelp(!showHelp)
                    }
                >
                    ❓ Help
                </button>

            </div>

            {/* =================================================
                TITLE
            ================================================= */}

            <h2 style={styles.title}>
                💰 Advanced Fee Setup
            </h2>

            <h3 style={styles.modeText}>
                Mode : {mode.toUpperCase()}
            </h3>

            {/* =================================================
                HELP
            ================================================= */}

            {showHelp && (

                <div style={styles.helpBox}>

                    <ul>

                        <li>
                            Simple Plan →
                            Grand Total ÷ Frequency
                        </li>

                        <li>
                            Smart Split →
                            Regular + Special Separate
                        </li>

                        <li>
                            Professional Plan →
                            Special fees auto add
                            in selected month
                        </li>

                    </ul>

                </div>
            )}

            {/* =================================================
                CLASS + MODE
            ================================================= */}

            <div style={styles.topBar}>

                <select
                    value={selectedClass}
                    onChange={(e) =>
                        setSelectedClass(
                            e.target.value
                        )
                    }
                    style={styles.select}
                >

                    <option value="">
                        Select Class
                    </option>

                    {classes.map((c, i) => (

                        <option key={i}>
                            {c}
                        </option>

                    ))}

                </select>

                <button
                    style={{
                        ...styles.btn3d,
                        background:
                            mode === "create"
                                ? "#16a34a"
                                : "#2563eb"
                    }}
                    onClick={() =>
                        setMode("create")
                    }
                >
                    ➕ Set Fees
                </button>

                <button
                    style={{
                        ...styles.btn3d,
                        background:
                            mode === "edit"
                                ? "#f59e0b"
                                : "#2563eb"
                    }}
                    onClick={() =>
                        setMode("edit")
                    }
                >
                    ✏ Edit
                </button>

                <button
                    style={{
                        ...styles.btn3d,
                        background:
                            mode === "view"
                                ? "#0ea5e9"
                                : "#2563eb"
                    }}
                    onClick={() =>
                        setMode("view")
                    }
                >
                    👀 View
                </button>

            </div>

            {/* =================================================
                MAIN
            ================================================= */}

            <div style={styles.flex}>

                {/* =============================================
                    LEFT
                ============================================= */}

                <div style={styles.card}>

                    <h3>
                        ⚙ Fee Structure Setup
                    </h3>

                    {/* =========================================
                        NOTE
                    ========================================= */}

                    <div style={styles.modeBox}>

                        <h3>
                            ℹ️ Information
                        </h3>

                        <p>
                            Configure compulsory and optional fees for each class.
                        </p>

                        <p>
                            Totals are calculated at runtime in StudentForm.
                        </p>

                        <p>
                            Transport routes are configured in Transport Setup module.
                        </p>

                    </div>

                    {/* =========================================
                        TYPES
                    ========================================= */}

                    {/* Academic Compulsory Fees */}
                    <div>
                        <h3 style={styles.sectionTitle}>
                            Academic Compulsory
                        </h3>

                        {compulsoryFees.map((fee) => (
                            <div key={fee.id} style={styles.row}>
                                <input
                                    type="text"
                                    value={fee.name}
                                    disabled={mode === "view"}
                                    onChange={(e) =>
                                        handleTypeChange(
                                            fee.id,
                                            "name",
                                            e.target.value,
                                            "compulsory"
                                        )
                                    }
                                    style={styles.typeName}
                                />

                                <input
                                    type="number"
                                    placeholder="Amount"
                                    value={fee.amount || ""}
                                    disabled={mode === "view"}
                                    onChange={(e) =>
                                        handleTypeChange(
                                            fee.id,
                                            "amount",
                                            e.target.value,
                                            "compulsory"
                                        )
                                    }
                                    style={styles.amountInput}
                                />

                                {mode !== "view" && (
                                    <button
                                        onClick={() => removeFee(fee.id, "compulsory")}
                                        style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}

                        {mode !== "view" && (
                            <div style={styles.row}>
                                <select
                                    value={selectedFeeType}
                                    onChange={(e) => {
                                        setSelectedFeeType(e.target.value);
                                        const feeType = feeTypeCatalog.find(ft => ft.id === e.target.value);
                                        if (feeType) {
                                            setSelectedFeeCategory(feeType.defaultCategory);
                                        }
                                    }}
                                    style={styles.typeName}
                                >
                                    <option value="">Select Fee Type</option>
                                    {feeTypeCatalog.map(ft => (
                                        <option key={ft.id} value={ft.id}>{ft.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    id="newFeeAmount"
                                    style={styles.amountInput}
                                />
                                <button
                                    onClick={() => {
                                        const amount = document.getElementById("newFeeAmount").value;
                                        addFeeFromCatalog(selectedFeeType, amount);
                                        document.getElementById("newFeeAmount").value = "";
                                    }}
                                    style={{ padding: "5px 10px", cursor: "pointer" }}
                                >
                                    Add
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Supporting Academic Optional Fees */}
                    <div>
                        <h3 style={styles.sectionTitle}>
                            Supporting Academic Optional
                        </h3>

                        {optionalFees.map((fee) => (
                            <div key={fee.id} style={styles.row}>
                                <input
                                    type="text"
                                    value={fee.name}
                                    disabled={mode === "view"}
                                    onChange={(e) =>
                                        handleTypeChange(
                                            fee.id,
                                            "name",
                                            e.target.value,
                                            "optional"
                                        )
                                    }
                                    style={styles.typeName}
                                />

                                <input
                                    type="number"
                                    placeholder="Amount"
                                    value={fee.amount || ""}
                                    disabled={mode === "view"}
                                    onChange={(e) =>
                                        handleTypeChange(
                                            fee.id,
                                            "amount",
                                            e.target.value,
                                            "optional"
                                        )
                                    }
                                    style={styles.amountInput}
                                />

                                {mode !== "view" && (
                                    <button
                                        onClick={() => removeFee(fee.id, "optional")}
                                        style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}

                        {mode !== "view" && (
                            <div style={styles.row}>
                                <select
                                    value={selectedFeeType}
                                    onChange={(e) => {
                                        setSelectedFeeType(e.target.value);
                                        const feeType = feeTypeCatalog.find(ft => ft.id === e.target.value);
                                        if (feeType) {
                                            setSelectedFeeCategory(feeType.defaultCategory);
                                        }
                                    }}
                                    style={styles.typeName}
                                >
                                    <option value="">Select Fee Type</option>
                                    {feeTypeCatalog.map(ft => (
                                        <option key={ft.id} value={ft.id}>{ft.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    id="newOptionalFeeAmount"
                                    style={styles.amountInput}
                                />
                                <button
                                    onClick={() => {
                                        const amount = document.getElementById("newOptionalFeeAmount").value;
                                        addFeeFromCatalog(selectedFeeType, amount);
                                        document.getElementById("newOptionalFeeAmount").value = "";
                                    }}
                                    style={{ padding: "5px 10px", cursor: "pointer" }}
                                >
                                    Add
                                </button>
                            </div>
                        )}
                    </div>

                    {/* =========================================
                        HOSTEL FEE
                    ========================================= */}

                    <div style={styles.hostelBox}>
                        <h3>Hostel Fee</h3>
                        <label style={styles.radioRow}>
                            <input
                                type="checkbox"
                                checked={db.hostelFee.enabled}
                                onChange={(e) =>
                                    handleHostelFee("enabled", e.target.checked)
                                }
                            />
                            <b>Enable Hostel Fee</b>
                        </label>

                        {db.hostelFee.enabled && (
                            <div>
                                <input
                                    type="number"
                                    placeholder="Hostel Fee Amount"
                                    value={db.hostelFee.amount}
                                    onChange={(e) =>
                                        handleHostelFee("amount", e.target.value)
                                    }
                                    style={styles.amountInput}
                                />
                            </div>
                        )}
                    </div>

                    {/* =========================================
                        TRANSPORT NOTE
                    ========================================= */}

                    <div style={styles.noteBox}>
                        <h3>Transport Routes</h3>
                        <p>Transport routes are configured in the Transport Setup module.</p>
                        <p>Routes will be automatically available in StudentForm.</p>
                    </div>

                    {/* =========================================
                        ACTIONS
                    ========================================= */}

                    <div style={styles.actionRow}>

                        <button
                            style={styles.saveBtn}
                            onClick={handleSave}
                        >
                            💾 Save
                        </button>

                        <button
                            style={styles.btn3d}
                            onClick={resetClass}
                        >
                            ♻ Reset Class
                        </button>

                        <button
                            style={styles.btn3d}
                            onClick={resetAll}
                        >
                            🗑 Reset All
                        </button>

                    </div>

                </div>

                {/* =============================================
                    RIGHT
                ============================================= */}

                <div style={styles.card}>

                    <h3>
                        📊 Detailed Preview
                    </h3>

                    {selectedClass && (

                        <>

                            <h2>
                                {selectedClass}
                            </h2>

                            {/* TOTALS */}

                            <div style={styles.previewBox}>

                                <div>
                                    💰 Grand Total :
                                    <b>
                                        ₹ {grandTotal}
                                    </b>
                                </div>

                                <div>
                                    🟢 Compulsory Total :
                                    <b>
                                        ₹ {compulsoryTotal}
                                    </b>
                                </div>

                                <div>
                                    🔴 Optional Total :
                                    <b>
                                        ₹ {optionalTotal}
                                    </b>
                                </div>

                                <div>
                                    🏠 Hostel Fee :
                                    <b>
                                        ₹ {db.hostelFee.enabled ? db.hostelFee.amount : 0}
                                    </b>
                                </div>

                            </div>

                            {/* NOTE */}

                            <div style={styles.previewMode}>

                                <h3>
                                    ℹ️ Note
                                </h3>

                                <p>
                                    Totals are calculated at runtime in StudentForm.
                                </p>

                                <p>
                                    Transport fees are added when student selects route.
                                </p>

                            </div>

                            {/* MONTHS */}

                            <div style={styles.previewMode}>

                                <h3>
                                    📅 Due Timing
                                </h3>

                                <div style={styles.previewText}>

                                    <p>
                                        Fee collection timing is managed in Fee Collection module.
                                    </p>

                                </div>

                            </div>

                            {/* BREAKDOWN */}

                            <div style={{ marginTop: 20 }}>

                                <h3>
                                    📑 Fee Breakdown
                                </h3>

                                {compulsoryFees.map((fee, i) => (
                                    <div key={i} style={styles.breakRow}>
                                        <span>🟢 {fee.name}</span>
                                        <span>₹ {fee.amount}</span>
                                        <span>Compulsory</span>
                                    </div>
                                ))}

                                {optionalFees.map((fee, i) => (
                                    <div key={i} style={styles.breakRow}>
                                        <span>🔴 {fee.name}</span>
                                        <span>₹ {fee.amount}</span>
                                        <span>Optional</span>
                                    </div>
                                ))}

                            </div>

                        </>

                    )}

                </div>

            </div>

        </div>
    );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {

    page: {
        background: "#0f172a",
        minHeight: "100vh",
        padding: 20,
        color: "#fff"
    },

    top: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 10
    },

    title: {
        textAlign: "center",
        marginBottom: 5
    },

    modeText: {
        textAlign: "center",
        color: "#38bdf8"
    },

    topBar: {
        display: "flex",
        gap: 10,
        marginTop: 20,
        marginBottom: 20,
        flexWrap: "wrap"
    },

    flex: {
        display: "flex",
        gap: 20,
        flexWrap: "wrap"
    },

    card: {
        flex: 1,
        minWidth: 450,
        background: "#1e293b",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 0 20px rgba(0,0,0,0.4)"
    },

    btn3d: {
        background: "#2563eb",
        border: "none",
        color: "#fff",
        padding: "10px 16px",
        borderRadius: 10,
        cursor: "pointer",
        boxShadow: "0 4px 0 #1d4ed8"
    },

    saveBtn: {
        background: "#16a34a",
        border: "none",
        color: "#fff",
        padding: "10px 18px",
        borderRadius: 10,
        cursor: "pointer",
        boxShadow: "0 4px 0 #166534"
    },

    select: {
        padding: 10,
        borderRadius: 10
    },

    helpBox: {
        background: "#1e40af",
        padding: 15,
        borderRadius: 12,
        marginTop: 10
    },

    modeBox: {
        background: "#0f172a",
        padding: 15,
        borderRadius: 12,
        marginTop: 20,
        marginBottom: 20
    },

    radioRow: {
        display: "flex",
        gap: 10,
        alignItems: "center",
        marginTop: 12,
        flexWrap: "wrap"
    },

    freqBox: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
        gap: 20,
        marginBottom: 20
    },

    freqCard: {
        background: "#0f172a",
        padding: 15,
        borderRadius: 12
    },

    monthGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 8,
        marginTop: 15
    },

    monthBtn: {
        border: "none",
        color: "#fff",
        padding: 8,
        borderRadius: 8,
        cursor: "pointer"
    },

    sectionTitle: {
        marginTop: 25,
        marginBottom: 10,
        color: "#38bdf8"
    },

    row: {
        display: "flex",
        gap: 10,
        alignItems: "center",
        marginBottom: 10,
        flexWrap: "wrap"
    },

    typeName: {
        minWidth: 180
    },

    amountInput: {
        padding: 8,
        borderRadius: 8
    },

    customBox: {
        display: "flex",
        gap: 10,
        marginTop: 20
    },

    customInput: {
        flex: 1,
        padding: 10,
        borderRadius: 10
    },

    actionRow: {
        display: "flex",
        gap: 10,
        marginTop: 25,
        flexWrap: "wrap"
    },

    previewBox: {
        background: "#0f172a",
        padding: 15,
        borderRadius: 12,
        lineHeight: 2
    },

    previewMode: {
        background: "#172554",
        marginTop: 20,
        padding: 15,
        borderRadius: 12
    },

    previewText: {
        marginTop: 10
    },

    breakRow: {
        display: "flex",
        justifyContent: "space-between",
        background: "#0f172a",
        padding: 10,
        borderRadius: 10,
        marginTop: 8,
        flexWrap: "wrap",
        gap: 10
    }
};
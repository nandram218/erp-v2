import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSchoolStore } from "../../store/schoolStore";
import {
    getSchoolProfile,
    saveSchoolProfile,
} from "../../services/schoolProfileService";
import { appStyles as styles } from "../../styles/appStyles";
import { uploadMedia, EntityType, MediaType } from "../../media";
const SchoolProfile = () => {
    const { setSchoolData } = useSchoolStore();
    const navigate = useNavigate();

    const [mediumType, setMediumType] = useState("english");
    const [editMode, setEditMode] = useState(true);

    const defaultSchool = {
        name: "",
        code: "",
        udise: "",
        board: "",
        established: "",
        principal: "",
        phone: "",
        email: "",
        address: "",
        session: "2025-26",
        logo: "",
        sign: ""
    };

    const [schools, setSchools] = useState({
        english: { ...defaultSchool },
        hindi: { ...defaultSchool }
    });

    useEffect(() => {
        const data = getSchoolProfile();
        if (data) {
            setMediumType(data.mediumType || "english");
            setSchools(data.schools || schools);
            setSchoolData(data);
        }
    }, []);

    const handleSave = () => {

        const payload = { mediumType, schools };

        saveSchoolProfile(payload);

        setSchoolData(payload);

        setEditMode(false);

        alert("✅ Saved Successfully");
    };

    const handleReset = () => {
        setSchools({
            english: { ...defaultSchool },
            hindi: { ...defaultSchool }
        });
    };

    const handleChange = (type, field, value) => {
        if (!editMode) return;
        setSchools(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value
            }
        }));
    };

    const handleImage = async (type, field, file) => {
        if (!file) return;
        
        // Read file for local preview
        const reader = new FileReader();
        reader.onload = async () => {
            // Update local state for preview
            handleChange(type, field, reader.result);
            
            // Upload to media service
            try {
                const mediaType = field === "logo" ? MediaType.LOGO : MediaType.SIGNATURE;
                await uploadMedia(EntityType.SCHOOL, "default", mediaType, file);
            } catch (error) {
                if (process.env.NODE_ENV === "development") {
                    console.error("[SchoolProfile] Media upload error:", error);
                }
                // Continue with local preview even if upload fails
            }
        };
        reader.readAsDataURL(file);
    };

    const renderForm = (type, label, color) => {
        const data = schools[type];

        return (

            <div style={{ ...styles.card, borderTop: `6px solid ${color}` }}>

                <h3 style={styles.cardTitle}>🏫 {label} Medium School</h3>

                <div style={styles.grid}>

                    <input disabled={!editMode} placeholder="School Name" value={data.name}
                        onChange={(e) => handleChange(type, "name", e.target.value)} />

                    <input disabled={!editMode} placeholder="School Code / PSP"
                        value={data.code}
                        onChange={(e) => handleChange(type, "code", e.target.value)} />

                    <input disabled={!editMode} placeholder="UDISE Code"
                        value={data.udise}
                        onChange={(e) => handleChange(type, "udise", e.target.value)} />

                    <input disabled={!editMode} placeholder="Board (CBSE/RBSE)"
                        value={data.board}
                        onChange={(e) => handleChange(type, "board", e.target.value)} />

                    <input disabled={!editMode} placeholder="Established Year"
                        value={data.established}
                        onChange={(e) => handleChange(type, "established", e.target.value)} />

                    <input disabled={!editMode} placeholder="Principal Name"
                        value={data.principal}
                        onChange={(e) => handleChange(type, "principal", e.target.value)} />

                    <input disabled={!editMode} placeholder="Phone"
                        value={data.phone}
                        onChange={(e) => handleChange(type, "phone", e.target.value)} />

                    <input disabled={!editMode} placeholder="Email"
                        value={data.email}
                        onChange={(e) => handleChange(type, "email", e.target.value)} />

                    <input disabled={!editMode} placeholder="Session"
                        value={data.session}
                        onChange={(e) => handleChange(type, "session", e.target.value)} />

                    <textarea disabled={!editMode} placeholder="Address"
                        value={data.address}
                        onChange={(e) => handleChange(type, "address", e.target.value)} />

                </div>

                <div style={styles.imageRow}>
                    <div>
                        <label>Logo</label>
                        <input disabled={!editMode} type="file"
                            onChange={(e) => handleImage(type, "logo", e.target.files[0])} />
                        {data.logo && <img src={data.logo} alt="" style={styles.preview} />}
                    </div>

                    <div>
                        <label>Signature</label>
                        <input disabled={!editMode} type="file"
                            onChange={(e) => handleImage(type, "sign", e.target.files[0])} />
                        {data.sign && <img src={data.sign} alt="" style={styles.preview} onError={(e) => { e.target.src = "/default-avatar.png"; }} />}
                    </div>
                </div>

            </div>
        );
    };

    return (
        <div style={styles.page}>

            {/* TOP BAR */}
            <div style={styles.topBar}>

                <button style={styles.backBtn} onClick={() => navigate("/master-setting")}>
                    ⬅ Back
                </button>

                <div style={{ textAlign: "center" }}>
                    <h2 style={styles.title}>⚙️ School Profile Setup</h2>
                    <p style={styles.tagline}>
                        Configure and manage your school system with precision — supporting single or dual medium operations seamlessly.
                    </p>
                </div>

                <button style={styles.dashBtn} onClick={() => navigate("/dashboard")}>
                    🏠 Dashboard
                </button>

            </div>

            {/* MEDIUM SELECTOR */}
            <div style={styles.selectorCard}>
                <label>Select Medium Type:</label>

                <select
                    value={mediumType}
                    onChange={(e) => {
                        setMediumType(e.target.value);
                        setEditMode(true);
                    }}
                    style={styles.select}
                >
                    <option value="english">English Medium</option>
                    <option value="hindi">Hindi Medium</option>
                    <option value="both">Hindi & English Medium</option>
                </select>
            </div>

            {/* FORMS */}
            {mediumType === "english" && renderForm("english", "English", "#2196F3")}
            {mediumType === "hindi" && renderForm("hindi", "Hindi", "#4CAF50")}

            {mediumType === "both" && (
                <>
                    {renderForm("english", "English", "#2196F3")}
                    {renderForm("hindi", "Hindi", "#4CAF50")}
                </>
            )}

            {/* ACTIONS */}
            <div style={styles.actions}>
                <button style={styles.saveBtn} onClick={handleSave}>💾 Save</button>
                <button style={styles.resetBtn} onClick={handleReset}>🔄 Reset</button>
                <button style={styles.editBtn} onClick={() => setEditMode(true)}>✏ Edit</button>
            </div>

        </div>
    );
};

export default SchoolProfile;


import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    addStudent,
    updateStudent,
    generateStudentId
} from "../../services/studentService";

import { useSchoolStore } from "../../store/schoolStore";
import { 
    getStorageCompat, 
    setStorageCompat, 
    removeStorageCompat 
} from "../../services/storageService";
import { STORAGE_KEYS } from "../../core/constants/storageKeys";
import {
    CLASS_FEES,
    HOSTEL_FEE_CONST,
    TRANSPORT_ROUTES
} from "../../core/constants/feeConstants";
import { uploadMedia, EntityType, MediaType } from "../../media";
import { getFeeSettings } from "../../services/feeSettingsService";

const StudentForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { schoolData } =
        useSchoolStore();

    const previewStudentId =
        generateStudentId();
    const wrapper = {
        display: "flex",
        gap: "10px",
        marginBottom: "20px"
    };

    const leftStrip = {
        width: "12px",
        background: "linear-gradient(180deg, #667eea, #764ba2)",
        borderRadius: "20px"
    };

    const card = {
        flex: 1,
        background: "#eef2f7",
        padding: "20px",
        borderRadius: "20px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        borderLeft: "5px solid #3f51b5",
        borderTopLeftRadius: "30px",
        borderBottomLeftRadius: "30px"
    };
    /* ================= DATA ================= */
const classes =
                        getStorageCompat(STORAGE_KEYS.ERP_CLASSES, []);
    const feeSettings = getFeeSettings();
    const effectiveClassFees = feeSettings?.classFees ? feeSettings.classFees : CLASS_FEES;
    const effectiveTransportRoutes = feeSettings?.routes ? feeSettings.routes : TRANSPORT_ROUTES;
    const effectiveHostelFee = feeSettings?.hostelFee ? feeSettings.hostelFee : HOSTEL_FEE_CONST;

    const classFees = effectiveClassFees;

    const streams = ["Science", "Commerce", "Arts"];
    const sections = ["A", "B", "C", "D"];
    const bloodGroups = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"];
    const categories = ["GEN", "OBC", "SC", "ST"];

    const routes = effectiveTransportRoutes;

    const hostelFeeConst = effectiveHostelFee;

    /* ================= STATE ================= */

    const initialState = {
        // ================= GLOBAL IDS =================

        schoolId:
            schoolData?.schoolId || "",

        branchId:
            schoolData?.branchId || "",

        sessionId:
            schoolData?.sessionId || "",

        studentId:
            previewStudentId || "",

        admissionNo: "",
        admissionDate: "",
        name: "",
        dob: "",
        gender: "",
        category: "",

        fatherName: "",
        motherName: "",
        fatherMobile: "",
        mobile: "",
        whatsapp: "",
        sameWhatsapp: false,

        aadhar: "",
        janAadhar: "",
        aparId: "",
        RTE: false,
        class: "",
        stream: "",
        section: "",
        bloodGroup: "",

        previousSchool: "",
        tcNo: "",
        lastClass: "",

    

        transport: false,
        route: "",
        transportFee: 0,

        hostel: false,
        hostelFee: 0,

        tuitionFee: 0,
        totalFee: 0
    };

    const [form, setForm] = useState(initialState);

    const location = useLocation();

    useEffect(() => {

        // ================= GLOBAL IDS =================

        setForm((prev) => ({

            ...prev,

            schoolId:
                schoolData.schoolId,

            branchId:
                schoolData.branchId,

            sessionId:
                schoolData.sessionId,

            studentId:
                prev.studentId ||
                previewStudentId
        }));


        // ✅ 1. EDIT FROM TABLE (STATE)

        if (location.state) {

            setForm({

                ...location.state,

                id:
                    location.state.id,

                schoolId:
                    location.state.schoolId ||
                    schoolData.schoolId,

                branchId:
                    location.state.branchId ||
                    schoolData.branchId,

                sessionId:
                    location.state.sessionId ||
                    schoolData.sessionId,

                studentId:
                    location.state.studentId ||
                    previewStudentId
            });

            return;
        }

        // ✅ 2. EDIT FROM URL (ID)

        if (id) {

            const db = getStorageCompat(STORAGE_KEYS.ERP_DB, {});

            const students =
                db.students || [];

            const existingStudent =
                students.find(
                    (stu) =>
                        stu.id === Number(id)
                );

            if (existingStudent) {

                setForm({

                    ...existingStudent,

                    schoolId:
                        existingStudent.schoolId ||
                        schoolData.schoolId,

                    branchId:
                        existingStudent.branchId ||
                        schoolData.branchId,

                    sessionId:
                        existingStudent.sessionId ||
                        schoolData.sessionId,

                    studentId:
                        existingStudent.studentId ||
                        previewStudentId
                });
            }
        }

        // ✅ 3. ADD MODE (DRAFT)

        else {

            const draft =
                getStorageCompat(STORAGE_KEYS.DRAFT_STUDENT, null);

            if (draft) {

                const parsedDraft = draft;

                setForm({

                    ...parsedDraft,

                    schoolId:
                        parsedDraft.schoolId ||
                        schoolData.schoolId,

                    branchId:
                        parsedDraft.branchId ||
                        schoolData.branchId,

                    sessionId:
                        parsedDraft.sessionId ||
                        schoolData.sessionId,

                    studentId:
                        parsedDraft.studentId ||
                        previewStudentId
                });

            } else {

                setForm((prev) => ({

                    ...prev,

                    schoolId:
                        schoolData.schoolId,

                    branchId:
                        schoolData.branchId,

                    sessionId:
                        schoolData.sessionId,

                    studentId:
                        previewStudentId
                }));
            }
        }

    }, [
        id,
        location.state,
        schoolData,
        previewStudentId
    ]);
    /* ================= HANDLERS ================= */

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let newValue = type === "checkbox" ? checked : value;

        let updated = { ...form, [name]: newValue };

        if (name === "sameWhatsapp" && checked) {
            updated.mobile = form.fatherMobile;
        }
        if (name === "sameAddress" && checked) {
            updated.currentAddress = form.permanentAddress;
        }
        setForm(updated);
    };

    const handleClass = (e) => {
        const cls = e.target.value;
        const fee = classFees[cls] || 0;

        setForm({
            ...form,
            class: cls,
            tuitionFee: fee,
            totalFee: fee + form.transportFee + form.hostelFee
        });
    };

    const handleRoute = (e) => {
        const r = routes.find(x => x.name === e.target.value);
        const fee = r ? r.fee : 0;

        setForm({
            ...form,
            route: e.target.value,
            transportFee: fee,
            totalFee: form.tuitionFee + fee + form.hostelFee
        });
    };

    const handleHostel = (e) => {
        const checked = e.target.checked;
        const fee = checked ? hostelFeeConst : 0;

        setForm({
            ...form,
            hostel: checked,
            hostelFee: fee,
            totalFee: form.tuitionFee + form.transportFee + fee
        });
    };

    const handlePhoto = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Create preview URL for immediate display
        const previewUrl = URL.createObjectURL(file);
        
        // Upload to media service if studentId exists
        const studentId = form.studentId || form.id || id;
        if (studentId) {
            try {
                await uploadMedia(EntityType.STUDENT, studentId, MediaType.PHOTO, file);
            } catch (error) {
                if (process.env.NODE_ENV === "development") {
                    console.error("[StudentForm] Media upload error:", error);
                }
                // Continue with local preview even if upload fails
            }
        }
        
        setForm({
            ...form,
            photo: file,
            photoPreview: previewUrl
        });
    };

    const handleDocs = (e) => {
        setForm({
            ...form,
            documents: Array.from(e.target.files || [])
        });
    };

    const handleSave = () => {

        const finalData = {
            ...form,
            mobile: form.mobile || form.fatherMobile
        };

        if (id || form.id) {
            updateStudent(
                form.studentId || form.id || id,
                finalData
            );
        } else {
            addStudent({
                ...finalData,
                id: Date.now()
            });
        }

        alert("Saved");
    };

    const handleDraft = () => {
        setStorageCompat(STORAGE_KEYS.DRAFT_STUDENT, form);
        alert("Draft Saved");
    };

    const handleReset = () => {
        setForm(initialState);
        removeStorageCompat(STORAGE_KEYS.DRAFT_STUDENT);
    };

    /* ================= UI ================= */

    const row4 = {
        display: "grid",
        gridTemplateColumns: "2fr 1.2fr 1fr 1fr",
        gap: "10px",
        marginBottom: "12px"
    };

    const input = {
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        width: "100%"
    };

    const box = {
        background: "linear-gradient(135deg, #ffffff, #e3f2fd)",
        padding: "20px",
        borderRadius: "14px",
        marginBottom: "20px",
        boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
        borderLeft: "5px solid #3f51b5"
    };

    const btn = (bg) => ({
        padding: "10px 20px",
        margin: "5px",
        background: `linear-gradient(145deg, ${bg}, ${bg}cc)`,
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "600",
        letterSpacing: "0.5px",

        boxShadow: `
        4px 4px 10px rgba(0,0,0,0.3),
        -2px -2px 6px rgba(255,255,255,0.2)
    `,
        transition: "all 0.15s ease"
    });

    return (

        <div style={{

            padding: "0px 20px",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea, #764ba2, #2575fc)"
        }}>

            <div style={{
                background: "#eef2f7",   // 🔥 GAP COLOR FIX
                padding: "10px",
                borderRadius: "12px"
            }}></div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>

                <button onClick={() => navigate(-1)} style={btn("#2196F3")}>
                    ← Back
                </button>

                <button onClick={() => window.print()} style={btn("#673ab7")}>
                    🖨️ Print
                </button>

            </div>



            <h2 style={{
                textAlign: "center",
                marginBottom: "20px"
            }}>
                🎓 Student Admission
            </h2>

            {/* BASIC */}

            <h3>Basic</h3>
            <div style={{ ...box, marginBottom: "5px" }}>

                <div style={leftStrip}></div>

                <div style={card}>

                    <div style={row4}>
                        <input style={input} name="name" value={form.name} placeholder="Student Name" onChange={handleChange} />
                        <input style={input} type="date" name="dob" value={form.dob} onChange={handleChange} />
                        <select style={input} name="gender" value={form.gender} onChange={handleChange}>
                            <option value="">Gender</option>
                            <option>Male</option>
                            <option>Female</option>
                        </select>
                        <select style={input} name="category" value={form.category} onChange={handleChange}>
                            <option value="">Category</option>
                            {(categories || []).map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>


                    <div style={row4}>

                        {/* Father Name */}
                        <input
                            style={input}
                            name="fatherName"
                            placeholder="Father Name"
                            value={form.fatherName}
                            onChange={handleChange}
                        />

                        {/* Mother Name */}
                        <input
                            style={input}
                            name="motherName"
                            placeholder="Mother Name"
                            value={form.motherName}
                            onChange={handleChange}
                        />

                        {/* Mobile No */}
                        <input
                            style={input}
                            name="fatherMobile"   // ✅ correct key
                            placeholder="Father Mobile"
                            value={form.fatherMobile}
                            onChange={handleChange}
                        />

                        {/* WhatsApp + Toggle */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

                            <input
                                style={{ ...input, flex: 1 }}
                                name="whatsapp"
                                placeholder="WhatsApp No"
                                value={form.whatsapp || ""}
                                onChange={handleChange}
                            />

                            <label style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                                <input
                                    type="checkbox"
                                    checked={form.sameWhatsapp}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setForm({
                                            ...form,
                                            sameWhatsapp: checked,
                                            whatsapp: checked ? form.fatherMobile : ""
                                        });
                                    }}
                                />
                                Same
                            </label>

                        </div>

                    </div>

                    <div style={row4}>
                        <input style={input} name="aadhar" value={form.aadhar} placeholder="Aadhaar" onChange={handleChange} />
                        <input style={input} name="janAadhar" value={form.janAadhar} placeholder="Jan Aadhaar" onChange={handleChange} />
                        <input style={input} name="aparId" value={form.aparId} placeholder="APAR ID" onChange={handleChange} />

                        {/* ✅ RTE CHECKBOX */}
                        <label style={{ display: "flex", alignItems: "center", gap: "15px", marginLeft: "40px" }}>
                            RTE:
                            <input
                                type="checkbox"
                                checked={form.RTE}
                                onChange={(e) =>
                                    setForm({ ...form, RTE: e.target.checked })
                                }
                            />
                            <span>{form.RTE ? "Yes" : "No"}</span>
                        </label>
                    </div>
                </div>

            </div>

            <div style={{ height: "20px", background: "#eef2f7" }}></div>
            {/* ACADEMIC */}


            <div style={{ ...box, marginBottom: "5px" }}>
                <h3>Academic</h3>

                {/* ================= GLOBAL ERP IDS ================= */}

                <div style={{
                    background: "#f4f7ff",
                    border: "1px solid #dbe4ff",
                    borderRadius: "12px",
                    padding: "15px",
                    marginBottom: "20px"
                }}>

                    <h4 style={{
                        marginBottom: "12px",
                        color: "#3f51b5"
                    }}>
                        🌐 ERP Global Identity
                    </h4>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(4,1fr)",
                        gap: "10px"
                    }}>

                        <div>
                            <label>School ID</label>

                            <input
                                style={input}
                                value={form.schoolId || ""}
                                readOnly
                            />
                        </div>

                        <div>
                            <label>Branch ID</label>

                            <input
                                style={input}
                                value={form.branchId || ""}
                                readOnly
                            />
                        </div>

                        <div>
                            <label>Session ID</label>

                            <input
                                style={input}
                                value={form.sessionId || ""}
                                readOnly
                            />
                        </div>

                        <div>
                            <label>Student ID</label>

                            <input
                                style={{
                                    ...input,
                                    fontWeight: "bold",
                                    color: "#673ab7"
                                }}
                                value={form.studentId || ""}
                                readOnly
                            />
                        </div>

                    </div>
                </div>

                {/* LEFT STRIP */}

                {/* LEFT STRIP */}
                <div style={leftStrip}></div>

                {/* CARD */}

                <div style={row4}>
                    <input style={input} name="admissionNo" value={form.admissionNo} placeholder="Admission No" onChange={handleChange} />
                    <input style={input} type="date" name="admissionDate" value={form.admissionDate} onChange={handleChange} />
                   

                    <select style={input} value={form.class} onChange={handleClass}>
                        <option value="">Class</option>

                        {classes.map((c, i) => (
                            <option key={i} value={c.className + (c.stream ? "-" + c.stream : "")}>
                                {c.className} {c.stream ? `(${c.stream})` : ""}
                            </option>
                        ))}
                    </select>
                   
                </div>

                {/* PREVIOUS SCHOOL */}
                <div style={box}>
                    <h3>Previous School</h3>
                    <div style={row4}>
                        <input style={input} name="previousSchool" value={form.previousSchool} placeholder="School Name" onChange={handleChange} />
                        <input style={input} name="tcNo" value={form.tcNo} placeholder="TC No" onChange={handleChange} />
                        <input style={input} name="lastClass" value={form.lastClass} placeholder="Last Class" onChange={handleChange} />
                    </div>
                </div>

                {/* PHYSICAL INFO */}
                <div style={box}>
                    <h3>Physical Info</h3>

                    <div style={row4}>
                        <input
                            style={input}
                            name="height"
                            placeholder="Height (cm)"
                            value={form.height || ""}
                            onChange={handleChange}
                        />

                        <input
                            style={input}
                            name="weight"
                            placeholder="Weight (kg)"
                            value={form.weight || ""}
                            onChange={handleChange}
                        />

                        <select
                            style={input}
                            name="bloodGroup"
                            value={form.bloodGroup}
                            onChange={handleChange}
                        >
                            <option>Blood Group</option>
                            {(bloodGroups || []).map(b => (
                                <option key={b}>{b}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* PHOTO */}
                <div style={box}>
                    <h3>Photo</h3>
                    <input type="file" onChange={handlePhoto} />
                    {form.photoPreview && (
                        <img src={form.photoPreview} alt="" style={{ width: 100, marginTop: 10 }} onError={(e) => { e.target.src = "/default-avatar.png"; }} />
                    )}
                </div>

                {/* DOCUMENTS */}
                <div style={box}>
                    <h3>Documents</h3>
                    <input type="file" multiple onChange={handleDocs} />
                    <ul>
                        {(form.documents || []).map((d, i) => (
                            <li key={i}>{d.name}</li>
                        ))}
                    </ul>
                </div>

                {/* SERVICES */}
                <div style={box}>
                    <h3>Services</h3>

                    <label>
                        <input type="checkbox" name="transport" checked={form.transport} onChange={handleChange} /> Transport
                    </label>

                    {form.transport && (
                        <select value={form.route} onChange={handleRoute}>
                            <option value="">Select Route</option>
                            {(routes || []).map(r => (
                                <option key={r.name}>{r.name}</option>
                            ))}
                        </select>
                    )}

                    <br />

                    <label>
                        <input type="checkbox" checked={form.hostel} onChange={handleHostel} /> Hostel
                    </label>
                </div>

                {/* FEES */}
                <div style={box}>
                    <h3>Fees</h3>
                    <p>Tuition: ₹{form.tuitionFee}</p>
                    <p>Transport: ₹{form.transportFee}</p>
                    <p>Hostel: ₹{form.hostelFee}</p>
                    <h4>Total: ₹{form.totalFee}</h4>
                </div>
                <div style={row4}>
                    <input
                        style={input}
                        name="permanentAddress"
                        placeholder="Permanent Address"
                        value={form.permanentAddress}
                        onChange={handleChange}
                    />

                    <input
                        style={input}
                        name="currentAddress"
                        placeholder="Current Address"
                        value={form.currentAddress}
                        onChange={handleChange}
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>
                        <input
                            type="checkbox"
                            name="sameAddress"
                            checked={form.sameAddress}
                            onChange={handleChange}
                        />
                        Same as Permanent Address
                    </label>
                </div>

                <h3>📜 Declaration</h3>

                <p>
                    I/We hereby declare that the details given above are correct and I/we take full responsibility for the same.
                </p>

                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "40px"
                }}>
                    <div>
                        <p>___________________</p>
                        <p>Student Signature</p>
                    </div>

                    <div>
                        <p>___________________</p>
                        <p>Parent Signature</p>
                    </div>
                </div>
                <div style={{ borderTop: "1px solid #ccc", paddingTop: "15px" }}>
                    <p><b>For Office Use</b></p>
                    <input type="date" name="principalDate" value={form.principalDate || ""} onChange={handleChange} style={input} />
                    <input type="text" name="principalSignature" placeholder="Principal Signature" value={form.principalSignature || ""} onChange={handleChange} style={input} />
                </div>

            </div>

            {/* BUTTONS */}
            <div style={{ textAlign: "center" }}>

                <button
                    onClick={handleSave}
                    style={btn("#4CAF50")}
                    onMouseDown={(e) => e.currentTarget.style.transform = "translateY(2px)"}
                    onMouseUp={(e) => e.currentTarget.style.transform = "translateY(0px)"}
                >
                    💾 Save
                </button>

                <button
                    onClick={handleDraft}
                    style={btn("#ff9800")}
                    onMouseDown={(e) => e.currentTarget.style.transform = "translateY(2px)"}
                    onMouseUp={(e) => e.currentTarget.style.transform = "translateY(0px)"}
                >
                    📄 Draft
                </button>

                <button
                    onClick={handleReset}
                    style={btn("#f44336")}
                    onMouseDown={(e) => e.currentTarget.style.transform = "translateY(2px)"}
                    onMouseUp={(e) => e.currentTarget.style.transform = "translateY(0px)"}
                >
                    🔄 Reset
                </button>

            </div>

        </div>

    );
};


export default StudentForm;
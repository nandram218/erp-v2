import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getService } from "../../core/serviceRegistry";
import { useSchoolStore } from "../../store/schoolStore";
import {
    getStorageCompat,
    setStorageCompat,
    removeStorageCompat
} from "../../services/storageService";
import { STORAGE_KEYS } from "../../core/constants/storageKeys";
import { getTransportRoutes } from "../../modules/transport/services/transportService";
import { getHostelFee } from "../../master-setting/hostel/hostelService";

const studentService = getService("student");
const feesService = getService("fees");
const feeSettingsService = getService("feeSettings");


const StudentForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { schoolData } =
        useSchoolStore();

    const previewStudentId =
        studentService.generateStudentId();

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
    // Read fee data from feeSettingsService (single source of truth)
    const feeData = feeSettingsService.getFeeSettings();
    // Read transport routes from transport service (single source of truth)
    const transportRoutes = getTransportRoutes();

    const bloodGroups = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"];
    const categories = ["GEN", "OBC", "SC", "ST"];

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

        photo: null,
        photoPreview: "",
        documents: [],

        // Canonical fee structure
        selectedCompulsoryFees: [],
        selectedOptionalFees: [],
        transport: { enabled: false, routeId: "", pickupPoint: "", routeFee: 0 },
        hostel: { enabled: false, fee: 0 }
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

            // Phase 4.1: Use studentService instead of direct storage access
            const existingStudent = studentService.getStudentById(id);

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

        // Auto-select all compulsory fees for the class
        const compulsoryFeeIds = feeData?.classes?.[cls]?.compulsoryFees?.map(f => f.id) || [];

        setForm({
            ...form,
            class: cls,
            selectedCompulsoryFees: compulsoryFeeIds,
            selectedOptionalFees: [],
            transport: { enabled: false, routeId: "", pickupPoint: "", routeFee: 0 },
            hostel: { enabled: false, fee: 0 }
        });
    };

    const handleRoute = (e) => {
        const routeId = e.target.value;
        const route = transportRoutes?.find(r => String(r.id) === String(routeId));

        // Calculate routeFee based on fareType (canonical structure)
        let routeFee = 0;

        if (route) {
            if (route.fareType === "fixed") {
                routeFee = route.fixedFare;
            } else if (
                route.fareType === "pointWise" ||
                route.fareType === "point"
            ) {
                // For point-based routes, fee comes from pickup point
                routeFee = 0;
            }
        }
        setForm({
            ...form,
            transport: {
                enabled: true,
                routeId,
                pickupPoint: "",
                routeFee
            }
        });
    };

    const handlePickupPoint = (e) => {
        const pickupPointValue = e.target.value;
        const route = transportRoutes?.find(r => String(r.id) === String(form.transport.routeId));

        const pickupPoint =
            route?.pickupPoints?.find(
                p => p.pickupPointName === pickupPointValue
            );

        // Calculate routeFee based on fareType and selected pickup point
        let routeFee = 0;

        if (route) {
            if (route.fareType === "fixed") {
                routeFee = route.fixedFare;
            } else if (
                route.fareType === "pointWise" ||
                route.fareType === "point"
            ) {
                const pickupPoint =
                    route.pickupPoints?.find(
                        p => p.pickupPointName === pickupPointValue
                    );

                routeFee = Number(pickupPoint?.routeFee || 0);
            }
        }

        setForm({
            ...form,
            transport: {
                ...form.transport,
                pickupPoint: pickupPointValue,
                routeFee
            }
        });
    };

    const handleHostel = (e) => {
        const checked = e.target.checked;
        const hostelFeeConfig = getHostelFee();
        
        setForm({
            ...form,
            hostel: {
                enabled: checked,
                fee: checked ? (hostelFeeConfig?.amount || 0) : 0
            }
        });
    };

    const handleOptionalFeeToggle = (feeId) => {
        const currentOptionalFees = form.selectedOptionalFees || [];
        let updatedOptionalFees;

        if (currentOptionalFees.includes(feeId)) {
            updatedOptionalFees = currentOptionalFees.filter(id => id !== feeId);
        } else {
            updatedOptionalFees = [...currentOptionalFees, feeId];
        }

        setForm({
            ...form,
            selectedOptionalFees: updatedOptionalFees
        });
    };

    const handlePhoto = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setForm({
            ...form,
            photo: file,
            photoPreview: URL.createObjectURL(file)
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
            studentService.updateStudent(
                form.studentId || form.id || id,
                finalData
            );
        } else {
            studentService.addStudent({
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
                        <img src={form.photoPreview} alt="" style={{ width: 100, marginTop: 10 }} />
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
                        <input type="checkbox" checked={form.transport?.enabled} onChange={(e) => {
                            if (e.target.checked) {
                                setForm({ ...form, transport: { enabled: true, routeId: "", pickupPoint: "", routeFee: 0 } });
                            } else {
                                setForm({ ...form, transport: { enabled: false, routeId: "", pickupPoint: "", routeFee: 0 } });
                            }
                        }} /> Transport
                    </label>

                    {form.transport?.enabled && (
                        <>
                            <select value={form.transport.routeId} onChange={handleRoute}>
                                <option value="">Select Route</option>
                                {(transportRoutes || []).map(r => (
                                    <option key={r.id} value={r.id}>{r.routeName} (₹{r.fixedFare})</option>
                                ))}
                            </select>

                            {form.transport.routeId && (
                                <select value={form.transport.pickupPoint} onChange={handlePickupPoint}>
                                    <option value="">Select Pickup Point</option>
                                    {(transportRoutes.find(r => String(r.id) === String(form.transport.routeId))?.pickupPoints || []).map((point) => (
                                        <option key={point.id} value={point.pickupPointName}>{point.pickupPointName}</option>
                                    ))}
                                </select>
                            )}
                        </>
                    )}

                    <br />

                    <label>
                        <input type="checkbox" checked={form.hostel?.enabled} onChange={handleHostel} /> Hostel
                    </label>
                </div>

                {/* FEES - Canonical Structure */}
                <div style={box}>
                    <h3>💰 Fee Structure</h3>

                    {/* Compulsory Fees */}
                    <div style={{ marginBottom: "15px", padding: "10px", background: "#f0f8ff", borderRadius: "8px" }}>
                        <h4 style={{ margin: "0 0 5px 0", color: "#1976d2" }}>📘 Compulsory Fees</h4>
                        {feeData?.classes?.[form.class]?.compulsoryFees?.length > 0 ? (
                            <ul style={{ margin: "5px 0 0 0", paddingLeft: "20px" }}>
                                {feeData.classes[form.class].compulsoryFees.map((fee, idx) => (
                                    <li key={idx} style={{ marginBottom: "3px" }}>
                                        {fee.name}: ₹{fee.amount}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "14px" }}>No compulsory fees configured for this class</p>
                        )}
                        <p style={{ margin: "10px 0 0 0", fontSize: "18px", fontWeight: "bold" }}>
                            Compulsory Total: ₹{feeData?.classes?.[form.class]?.compulsoryFees?.reduce((sum, f) => sum + f.amount, 0) || 0}
                        </p>
                    </div>

                    {/* Optional Fees */}
                    <div style={{ marginBottom: "15px", padding: "10px", background: "#fff3e0", borderRadius: "8px" }}>
                        <h4 style={{ margin: "0 0 5px 0", color: "#e65100" }}>🧪 Optional Fees</h4>
                        {feeData?.classes?.[form.class]?.optionalFees?.length > 0 ? (
                            <div style={{ marginTop: "10px" }}>
                                {feeData.classes[form.class].optionalFees.map((fee, idx) => (
                                    <div key={idx} style={{ marginTop: "5px", fontSize: "14px" }}>
                                        <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                            <input
                                                type="checkbox"
                                                checked={form.selectedOptionalFees?.includes(fee.id)}
                                                onChange={() => handleOptionalFeeToggle(fee.id)}
                                                style={{ marginRight: "8px" }}
                                            />
                                            <span style={{ flex: 1 }}>{fee.name}</span>
                                            <span style={{ fontWeight: "bold", color: "#e65100" }}>₹{fee.amount}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "14px" }}>No optional fees configured for this class</p>
                        )}
                        <p style={{ margin: "10px 0 0 0", fontSize: "18px", fontWeight: "bold" }}>
                            Optional Total: ₹{feeData?.classes?.[form.class]?.optionalFees?.filter(f => form.selectedOptionalFees?.includes(f.id))?.reduce((sum, f) => sum + f.amount, 0) || 0}
                        </p>
                    </div>

                    {/* Facility Fees - Transport and Hostel */}
                    <div style={{ marginBottom: "15px", padding: "10px", background: "#e8f5e9", borderRadius: "8px" }}>
                        <h4 style={{ margin: "0 0 10px 0", color: "#388e3c" }}>🚌 Facility Fees</h4>

                        {/* Transport */}
                        {form.transport?.enabled && form.transport.routeId && (
                            <div style={{ marginBottom: "10px" }}>
                                <p style={{ margin: "0 0 5px 0" }}>
                                    <strong>Transport:</strong> {transportRoutes?.find(r => String(r.id) === String(form.transport.routeId))?.routeName}
                                </p>
                                {form.transport.pickupPoint && (
                                    <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#666" }}>
                                        Pickup Point: {form.transport.pickupPoint}
                                    </p>
                                )}
                                <p style={{ margin: "0", fontWeight: "bold", color: "#388e3c" }}>
                                    Transport Fee: ₹{form.transport?.routeFee || 0}
                                </p>
                            </div>
                        )}

                        {/* Hostel */}
                        {form.hostel?.enabled && (
                            <div>
                                <p style={{ margin: "0 0 5px 0" }}>
                                    <strong>Hostel:</strong> Enabled
                                </p>
                                <p style={{ margin: "0", fontWeight: "bold", color: "#388e3c" }}>
                                    Hostel Fee: ₹{form.hostel?.fee || 0}
                                </p>
                            </div>
                        )}

                        {!form.transport?.enabled && !form.hostel?.enabled && (
                            <small style={{ color: "#666" }}>No facility fees selected</small>
                        )}
                    </div>

                    {/* Grand Total */}
                    <div style={{
                        marginTop: "20px",
                        padding: "15px",
                        background: "#4caf50",
                        color: "white",
                        borderRadius: "8px",
                        textAlign: "center"
                    }}>
                        <h3 style={{ margin: "0 0 5px 0" }}>Grand Total</h3>
                        <p style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>
                            ₹{(feeData?.classes?.[form.class]?.compulsoryFees?.reduce((sum, f) => sum + f.amount, 0) || 0) +
                              (feeData?.classes?.[form.class]?.optionalFees?.filter(f => form.selectedOptionalFees?.includes(f.id))?.reduce((sum, f) => sum + f.amount, 0) || 0) +
                              (form.transport?.routeFee || 0) +
                              (form.hostel?.fee || 0)}
                        </p>
                    </div>
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
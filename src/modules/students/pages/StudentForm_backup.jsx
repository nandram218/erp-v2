import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
const StudentForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();

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

    const classFees = {
        PP3: 500, PP4: 500, PP5: 600,
        Nursery: 600, LKG: 700, UKG: 800,
        "1st": 1000, "2nd": 1100, "3rd": 1200,
        "4th": 1300, "5th": 1400, "6th": 1500,
        "7th": 1600, "8th": 1700, "9th": 1800,
        "10th": 2000, "11th": 2500, "12th": 3000
    };

    const streams = ["Science", "Commerce", "Arts"];
    const sections = ["A", "B", "C", "D"];
    const bloodGroups = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"];
    const categories = ["GEN", "OBC", "SC", "ST"];

    const routes = Array.from({ length: 8 }, (_, i) => ({
        name: `Route ${i + 1}`,
        fee: 500 + i * 100
    }));

    const hostelFeeConst = 1500;

    /* ================= STATE ================= */

    const initialState = {
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

        transport: false,
        route: "",
        transportFee: 0,

        hostel: false,
        hostelFee: 0,

        tuitionFee: 0,
        totalFee: 0
    };

    const [form, setForm] = useState(initialState);

    useEffect(() => {
        if (id) {
            const students = JSON.parse(localStorage.getItem("students")) || [];

            const existingStudent = students.find(
                (stu) => stu.id === Number(id)
            );

            if (existingStudent) {
                setForm(existingStudent);
            }
        } else {
            const draft = localStorage.getItem("draftStudent");
            if (draft) setForm(JSON.parse(draft));
        }
    }, [id]);

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
        const oldData = JSON.parse(localStorage.getItem("students")) || [];

        // ✅ FINAL DATA FIX (mobile + address sab safe)
        const finalData = {
            ...form,
            mobile: form.mobile || form.fatherMobile
        };

        if (id) {
            // ✏️ EDIT MODE (replace existing)
            const updatedData = oldData.map((stu) =>
                stu.id === Number(id) ? { ...finalData, id: Number(id) } : stu
            );

            localStorage.setItem("students", JSON.stringify(updatedData));
        } else {
            // ➕ NEW ADD
            const newStudent = {
                ...finalData,
                id: Date.now()
            };

            localStorage.setItem("students", JSON.stringify([...oldData, newStudent]));
        }

        alert("Saved");
    };

    const handleDraft = () => {
        localStorage.setItem("draftStudent", JSON.stringify(form));
        alert("Draft Saved");
    };

    const handleDelete = () => {
        localStorage.removeItem("draftStudent");
        setForm(initialState);
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
        background: bg,
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
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

                {/* LEFT STRIP */}
                <div style={leftStrip}></div>

                {/* CARD */}

                <div style={row4}>
                    <input style={input} name="admissionNo" value={form.admissionNo} placeholder="Admission No" onChange={handleChange} />
                    <input style={input} type="date" name="admissionDate" value={form.admissionDate} onChange={handleChange} />
                    <select style={input} value={form.class} onChange={handleClass}>
                        <option value="">Class</option>
                        {(Object.keys(classFees) || []).map(c => <option key={c}>{c}</option>)}
                    </select>

                    <select style={input} name="section" value={form.section} onChange={handleChange}>
                        <option value="">Section</option>
                        {(sections || []).map(s => <option key={s}>{s}</option>)}
                    </select>

                    {(form.class === "11th" || form.class === "12th") && (
                        <select style={input} name="stream" value={form.stream} onChange={handleChange}>
                            <option value="">Stream</option>
                            {(streams || []).map(s => <option key={s}>{s}</option>)}
                        </select>
                    )}
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
                <button onClick={handleSave} style={btn("#4CAF50")}>Save</button>
                <button onClick={handleDraft} style={btn("#ff9800")}>Draft</button>
                <button onClick={handleDelete} style={btn("#f44336")}>Delete</button>
            </div>

        </div>

    );
};


export default StudentForm;
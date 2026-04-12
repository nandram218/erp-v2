import React, { useState, useEffect } from "react";
const initialForm = {
    srNo: "",
    srMode: "auto",
    admissionNo: "",
    admissionDate: new Date().toISOString().split("T")[0],
    academicYear: "2025-26",

    name: "",
    gender: "",
    dob: "",
    age: "",
    mobile: "",
    whatsappSame: false,
    whatsapp: "",
    altMobile: "",

    class: "",
    stream: "",
    subjectGroup: "",

    transport: false,
    route: "",
    stop: "",
    transportFee: 0,

    hostel: false,
    room: "",
    hostelFee: 0,
};

const classList = [
    "PP3", "PP4", "Nursery", "LKG", "UKG",
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"
];

const streamOptions = ["Science", "Commerce", "Arts", "Agriculture"];

const subjectGroups = {
    Science: ["PCM", "PCB"],
    Commerce: ["Accounts", "Business"],
    Arts: ["History", "Geography", "Political"],
    Agriculture: ["Agri Science"]
};

const StudentForm = () => {
    const [form, setForm] = useState(initialForm);
    const [step, setStep] = useState(1);

    // 🔁 Auto Age
    useEffect(() => {
        if (form.dob) {
            const dob = new Date(form.dob);
            const diff = Date.now() - dob.getTime();
            const age = new Date(diff).getUTCFullYear() - 1970;
            setForm((prev) => ({ ...prev, age }));
        }
    }, [form.dob]);

    // 🔁 WhatsApp same
    useEffect(() => {
        if (form.whatsappSame) {
            setForm((prev) => ({ ...prev, whatsapp: prev.mobile }));
        }
    }, [form.mobile, form.whatsappSame]);

    // 🔁 Class → Stream logic
    useEffect(() => {
        if (form.class !== "11" && form.class !== "12") {
            setForm((prev) => ({ ...prev, stream: "", subjectGroup: "" }));
        }
    }, [form.class]);

    // 🔁 Transport Fee Auto
    useEffect(() => {
        if (form.transport) {
            setForm((prev) => ({ ...prev, transportFee: 1500 }));
        } else {
            setForm((prev) => ({ ...prev, transportFee: 0 }));
        }
    }, [form.transport]);

    // 🔁 Hostel Fee Auto
    useEffect(() => {
        if (form.hostel) {
            setForm((prev) => ({ ...prev, hostelFee: 3000 }));
        } else {
            setForm((prev) => ({ ...prev, hostelFee: 0 }));
        }
    }, [form.hostel]);

    // 🔁 Auto Sr No
    useEffect(() => {
        if (form.srMode === "auto") {
            const count = JSON.parse(localStorage.getItem("students") || "[]").length;
            setForm((prev) => ({ ...prev, srNo: count + 1 }));
        }
    }, [form.srMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const saveData = () => {
        const old = JSON.parse(localStorage.getItem("students") || "[]");
        const updated = [...old, form];
        localStorage.setItem("students", JSON.stringify(updated));
        alert("Student Saved ✅");
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Student Form (Step {step})</h2>

            {/* STEP 1 */}
            {step === 1 && (
                <>
                    <h3>Basic Info</h3>

                    <select name="srMode" onChange={handleChange}>
                        <option value="auto">Auto Sr No</option>
                        <option value="manual">Manual</option>
                    </select>

                    <input name="srNo" value={form.srNo} onChange={handleChange} placeholder="Sr No" />

                    <input name="name" placeholder="Full Name" onChange={handleChange} />

                    <input type="date" name="dob" onChange={handleChange} />
                    <input value={form.age} placeholder="Age" readOnly />

                    <input name="mobile" placeholder="Mobile" onChange={handleChange} />

                    <label>
                        <input type="checkbox" name="whatsappSame" onChange={handleChange} />
                        WhatsApp Same
                    </label>

                    <input name="whatsapp" placeholder="WhatsApp No" value={form.whatsapp} onChange={handleChange} />
                </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
                <>
                    <h3>Academic</h3>

                    <select name="class" onChange={handleChange}>
                        <option>Select Class</option>
                        {classList.map((c) => (
                            <option key={c}>{c}</option>
                        ))}
                    </select>

                    {(form.class === "11" || form.class === "12") && (
                        <>
                            <select name="stream" onChange={handleChange}>
                                <option>Select Stream</option>
                                {streamOptions.map((s) => (
                                    <option key={s}>{s}</option>
                                ))}
                            </select>

                            {form.stream && (
                                <select name="subjectGroup" onChange={handleChange}>
                                    <option>Subject Group</option>
                                    {subjectGroups[form.stream].map((g) => (
                                        <option key={g}>{g}</option>
                                    ))}
                                </select>
                            )}
                        </>
                    )}
                </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
                <>
                    <h3>Transport & Hostel</h3>

                    <label>
                        <input type="checkbox" name="transport" onChange={handleChange} />
                        Transport
                    </label>

                    {form.transport && (
                        <>
                            <input name="route" placeholder="Route" onChange={handleChange} />
                            <input value={form.transportFee} readOnly />
                        </>
                    )}

                    <label>
                        <input type="checkbox" name="hostel" onChange={handleChange} />
                        Hostel
                    </label>

                    {form.hostel && (
                        <>
                            <input name="room" placeholder="Room No" onChange={handleChange} />
                            <input value={form.hostelFee} readOnly />
                        </>
                    )}
                </>
            )}

            {/* NAVIGATION */}
            <div style={{ marginTop: 20 }}>
                {step > 1 && <button onClick={() => setStep(step - 1)}>Back</button>}
                {step < 3 && <button onClick={() => setStep(step + 1)}>Next</button>}
                {step === 3 && <button onClick={saveData}>Submit</button>}
            </div>
        </div>
    );
};

export default StudentForm;
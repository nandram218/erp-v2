import { getTemplates } from "./certificateTemplates";

export const generateCertificate = (student, type) => {
    const templates = getTemplates();

    const base = {
        name: student.name || "",
        fatherName: student.fatherName || "",
        class: student.class || "",
        section: student.section || "",
        photo: student.photo || "",
        date: new Date().toLocaleDateString()
    };

    const selected = templates[type] || templates.study;

    // 🔥 TEXT REPLACE ENGINE
    let finalText = selected.text
        .replaceAll("{name}", base.name)
        .replaceAll("{class}", base.class)
        .replaceAll("${fatherName}", base.fatherName);

    return {
        ...base,
        ...selected,
        text: finalText
    };
};
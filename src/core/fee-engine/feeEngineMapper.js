// =====================================================
// FEE ENGINE MAPPER
// =====================================================
// Mapping layer between ERP data structures and FeeEngineCore
// =====================================================

/* =========================
   ERP STUDENT → FEE ENGINE STUDENT
========================= */

/**
 * Maps ERP Student structure to FeeEngine Student structure
 * 
 * @param {Object} erpStudent - ERP student object from StudentForm
 * @returns {Object} FeeEngineCore compatible student object
 * @throws {Error} If required fields (id, name, class) are missing
 */
export const mapERPStudentToFeeEngineStudent = (erpStudent = {}) => {
    // =========================
    // VALIDATION
    // =========================

    if (!erpStudent.id && !erpStudent.studentId) {
        throw new Error("Student ID is required for fee calculation");
    }

    if (!erpStudent.name) {
        throw new Error("Student name is required for fee calculation");
    }

    if (!erpStudent.class) {
        throw new Error("Student class is required for fee calculation");
    }

    if (!erpStudent.schoolId) {
        console.warn("[FeeEngineMapper] schoolId is missing, using empty string");
    }

    // =========================
    // FIELD MAPPING
    // =========================

    const feeEngineStudent = {
        // Core identifiers
        id: erpStudent.id || erpStudent.studentId,
        name: erpStudent.name,
        classId: erpStudent.class, // class → classId transformation
        schoolId: erpStudent.schoolId || "",

        // Conditional flags (transformed from ERP fields)
        isHostel: erpStudent.hostel || false, // hostel → isHostel transformation
        transportOpted: erpStudent.transport || false, // transport → transportOpted transformation

        // Legacy compatibility (preserve original ERP fields)
        class: erpStudent.class,
        transport: erpStudent.transport,
        hostel: erpStudent.hostel,
        route: erpStudent.route || "",

        // Existing fee fields (with default to 0 for safety)
        transportFee: Number(erpStudent.transportFee) || 0,
        hostelFee: Number(erpStudent.hostelFee) || 0,
        siblingDiscount: Number(erpStudent.siblingDiscount) || 0,

        // Additional student context
        section: erpStudent.section || "",
        rollNumber: erpStudent.rollNumber || "",
        siblingGroup: erpStudent.siblingGroup || "", // default empty string

        // Additional ERP fields (preserved for backward compatibility)
        fatherName: erpStudent.fatherName || "",
        mobile: erpStudent.mobile || "",
        fatherMobile: erpStudent.fatherMobile || "",
        motherName: erpStudent.motherName || "",
        motherMobile: erpStudent.motherMobile || "",
        dob: erpStudent.dob || "",
        gender: erpStudent.gender || "",
        bloodGroup: erpStudent.bloodGroup || "",
        category: erpStudent.category || "",
        religion: erpStudent.religion || "",
        nationality: erpStudent.nationality || "",
        aadhar: erpStudent.aadhar || "",
        janAadhar: erpStudent.janAadhar || "",
        aparId: erpStudent.aparId || "",
        RTE: erpStudent.RTE || false,
        stream: erpStudent.stream || "",
        previousSchool: erpStudent.previousSchool || "",
        tcNo: erpStudent.tcNo || "",
        lastClass: erpStudent.lastClass || "",
    };

    return feeEngineStudent;
};

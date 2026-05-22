import { useSchoolStore } from "../store/schoolStore";

// ================= GLOBAL CONTEXT =================

export const getGlobalContext = () => {

    const state =
        useSchoolStore.getState();

    const school =
        state.schoolData || {};

    return {

        schoolId:
            school.schoolId || "",

        branchId:
            school.branchId || "",

        sessionId:
            school.sessionId || "",
    };
};

// ================= AUTO ATTACH =================

export const withGlobalContext = (
    data = {}
) => {

    return {
        ...data,
        ...getGlobalContext(),
    };
};
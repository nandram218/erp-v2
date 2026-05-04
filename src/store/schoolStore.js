import { create } from "zustand";

export const useSchoolStore = create((set, get) => ({

    schoolData: null,

    // ✅ LOAD ONLY IF DATA REALLY CHANGED
    loadSchoolData: () => {
        const data = JSON.parse(localStorage.getItem("schoolProfile"));
        if (!data) return;

        const current = get().schoolData;

        // 🔥 SAME DATA → NO RE-RENDER
        if (JSON.stringify(current) === JSON.stringify(data)) return;

        set({ schoolData: data });
    },

    // ✅ SAFE SET
    setSchoolData: (data) => {
        const current = get().schoolData;

        if (JSON.stringify(current) === JSON.stringify(data)) return;

        localStorage.setItem("schoolProfile", JSON.stringify(data));
        set({ schoolData: data });
    }

}));
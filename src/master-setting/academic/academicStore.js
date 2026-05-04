import { create } from "zustand";

export const useAcademicStore = create((set) => ({
    settings: null,

    setSettings: (data) => set({ settings: data }),

    clearSettings: () => set({ settings: null })
}));
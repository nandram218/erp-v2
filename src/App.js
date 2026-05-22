import React, { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useSchoolStore } from "./store/schoolStore";

export default function App() {

    const loadAll = useSchoolStore((state) => state.loadAll);
    const hydrated = useSchoolStore((state) => state.hydrated);

    useEffect(() => {
        loadAll();
    }, []);

    // optional loading safety (VERY IMPORTANT)
    if (!hydrated) {
        return <div style={{ padding: 20 }}>Loading ERP...</div>;
    }

    return <AppRoutes />;
}
import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { useSchoolStore } from "./store/schoolStore";

export default function App() {
    const loadAll = useSchoolStore((state) => state.loadAll);
    const hydrated = useSchoolStore((state) => state.hydrated);

    useEffect(() => {
        if (!hydrated) loadAll();
    }, [loadAll, hydrated]);

    if (!hydrated) {
        return <div style={{ padding: 20 }}>Loading ERP...</div>;
    }

    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}
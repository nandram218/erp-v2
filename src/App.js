import React, { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useSchoolStore } from "./store/schoolStore";
import { validateAppReadiness, getValidationSummary } from "./services/runtimeValidationService";

export default function App() {
    const loadAll = useSchoolStore((state) => state.loadAll);
    const hydrated = useSchoolStore((state) => state.hydrated);

    useEffect(() => {
        if (!hydrated) {
            loadAll();
        }

        // Phase 3.1 C - Runtime Validation Safety Layer
        // Validate app readiness on startup
        const validation = validateAppReadiness();

        if (validation.status === "FAIL") {
            console.warn("[App] Runtime validation failed:", validation.reasons);
            console.warn("[App] Validation summary:", getValidationSummary());
        } else {
            console.log("[App] Runtime validation passed");
        }
    }, [loadAll, hydrated]);

    return !hydrated ? (
        <div style={{ padding: 20 }}>Loading ERP...</div>
    ) : (
        <AppRoutes />
    );
}
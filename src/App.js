import React, { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useSchoolStore } from "./store/schoolStore";
import { isTenantContextValid } from "./services/tenantContextService";

export default function App() {
    const loadAll = useSchoolStore((state) => state.loadAll);
    const hydrated = useSchoolStore((state) => state.hydrated);

    useEffect(() => {
        if (!hydrated) {
            loadAll();
        }
    }, [loadAll, hydrated]);

    // Runtime tenant validation (non-blocking)
    useEffect(() => {
        if (hydrated) {
            const isValid = isTenantContextValid();
            if (!isValid) {
                console.warn(
                    "[Tenant Context] Warning: Tenant context is incomplete. " +
                    "Missing schoolId, branchId, or sessionId. " +
                    "App will run in single-tenant mode with default values. " +
                    "This is expected for local development without authentication."
                );
            }
        }
    }, [hydrated]);

    return !hydrated ? (
        <div style={{ padding: 20 }}>Loading ERP...</div>
    ) : (
        <AppRoutes />
    );
}
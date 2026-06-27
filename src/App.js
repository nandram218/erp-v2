import React, { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useSchoolStore } from "./store/schoolStore";
import { validateAppReadiness, getValidationSummary, auditStorageKeys } from "./services/runtimeValidationService";
import { registerDefaultServices } from "./core/serviceRegistry";

export default function App() {
    const loadAll = useSchoolStore((state) => state.loadAll);
    const hydrated = useSchoolStore((state) => state.hydrated);

    useEffect(() => {
        // Phase 3.1 D Safe Mode: Register default services on app initialization
        registerDefaultServices();

        if (!hydrated) {
            loadAll();
        }

        // Phase 4.5: Runtime Validation Safety Layer
        // Validate app readiness on startup
        const validation = validateAppReadiness();

        if (validation.status === "FAIL") {
            console.error("=".repeat(60));
            console.error("[App] CRITICAL: Runtime validation failed");
            console.error("[App] Validation errors:", validation.reasons);
            console.error("[App] Validation summary:", getValidationSummary());
            console.error("=".repeat(60));
            
            // In production, you might want to show an error screen
            if (process.env.NODE_ENV === "production") {
                alert("Application initialization failed. Please contact support.");
            }
        } else {
            console.log("=".repeat(60));
            console.log("[App] ✅ Runtime validation passed");
            console.log("[App] Tenant isolation is active");
            console.log("[App] Validation summary:", getValidationSummary());
            console.log("=".repeat(60));
        }
        
        // Phase 4.5: Audit storage keys in development
        if (process.env.NODE_ENV === "development") {
            const storageAudit = auditStorageKeys();
            if (storageAudit.issues.length > 0) {
                console.log("[App] Storage audit results:", storageAudit);
            }
        }
    }, [loadAll, hydrated]);

    return !hydrated ? (
        <div style={{ padding: 20 }}>Loading ERP...</div>
    ) : (
        <AppRoutes />
    );
}
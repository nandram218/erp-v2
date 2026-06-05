import { getTenantContext, withTenantContext } from "./tenantContextService";

// ================= GLOBAL CONTEXT (LEGACY WRAPPER) =================
// This file now wraps the new tenantContextService for backward compatibility
// New code should use tenantContextService directly

export const getGlobalContext = getTenantContext;

export const withGlobalContext = withTenantContext;
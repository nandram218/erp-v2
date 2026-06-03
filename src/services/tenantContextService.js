/**
 * TENANT CONTEXT SERVICE
 * Single source of truth for tenant isolation
 * Reads from schoolStore - no hardcoded values
 */

import { useSchoolStore } from "../store/schoolStore";

/**
 * Get current schoolId from schoolStore
 * @returns {string} schoolId
 */
export const getSchoolId = () => {
    const state = useSchoolStore.getState();
    return state.schoolData?.schoolId || "";
};

/**
 * Get current branchId from schoolStore
 * @returns {string} branchId
 */
export const getBranchId = () => {
    const state = useSchoolStore.getState();
    return state.schoolData?.branchId || "";
};

/**
 * Get current sessionId from schoolStore
 * @returns {string} sessionId
 */
export const getSessionId = () => {
    const state = useSchoolStore.getState();
    return state.schoolData?.sessionId || "";
};

/**
 * Get complete tenant context object
 * @returns {Object} { schoolId, branchId, sessionId }
 */
export const getTenantContext = () => {
    const state = useSchoolStore.getState();
    const schoolData = state.schoolData || {};
    
    return {
        schoolId: schoolData.schoolId || "",
        branchId: schoolData.branchId || "",
        sessionId: schoolData.sessionId || "",
    };
};

/**
 * Check if tenant context is properly initialized
 * @returns {boolean} true if all tenant fields are present
 */
export const isTenantContextValid = () => {
    const context = getTenantContext();
    return !!(context.schoolId && context.branchId && context.sessionId);
};

/**
 * Get tenant-aware storage key suffix
 * @returns {string} Key suffix for tenant isolation
 */
export const getTenantKeySuffix = () => {
    const context = getTenantContext();
    if (!isTenantContextValid()) {
        return "";
    }
    return `${context.schoolId}_${context.branchId}_${context.sessionId}`;
};

export default {
    getSchoolId,
    getBranchId,
    getSessionId,
    getTenantContext,
    isTenantContextValid,
    getTenantKeySuffix,
};

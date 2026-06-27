/**
 * AUTHENTICATION SERVICE
 * Phase 3.1 B - Auth Context Implementation
 * Provides authentication and tenant binding for SaaS multi-tenancy
 */

import { setAuthContext, clearAuthContext } from "./tenantContextService";

// ================= STORAGE KEY =================
const AUTH_SESSION_KEY = "auth_session";

// ================= MOCK USER DATABASE =================
// In production, this would be replaced with real API calls
const MOCK_USER_DATABASE = [
    {
        userId: "admin-001",
        email: "admin@school.com",
        password: "admin123",
        schoolId: "SCH_0001",
        branchId: "MAIN",
        sessionId: "2025-26",
        role: "admin",
        name: "Administrator"
    },
    {
        userId: "teacher-001",
        email: "teacher@school.com",
        password: "teacher123",
        schoolId: "SCH_0001",
        branchId: "MAIN",
        sessionId: "2025-26",
        role: "teacher",
        name: "Teacher"
    }
];

// ================= AUTH SESSION =================
/**
 * Set authentication session in localStorage
 * 
 * @param {Object} userData - User object with tenant context
 * @param {string} userData.userId - User ID
 * @param {string} userData.schoolId - School ID
 * @param {string} userData.branchId - Branch ID
 * @param {string} userData.sessionId - Session ID
 * @param {string} userData.role - User role
 */
const setAuthSession = (userData) => {
    if (!userData || typeof userData !== "object") {
        console.error("[AuthService] Invalid user data provided");
        return false;
    }

    try {
        const sessionData = {
            user: userData,
            token: generateMockToken(userData.userId),
            loginAt: new Date().toISOString(),
        };

        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionData));
        console.log("[AuthService] Auth session set for user:", userData.userId);
        return true;
    } catch (error) {
        console.error("[AuthService] Failed to set auth session:", error);
        return false;
    }
};

/**
 * Get authentication session from localStorage
 * 
 * @returns {Object|null} Session data or null if not found
 */
const getAuthSession = () => {
    try {
        const stored = localStorage.getItem(AUTH_SESSION_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error("[AuthService] Failed to get auth session:", error);
    }
    return null;
};

/**
 * Clear authentication session from localStorage
 * 
 * @returns {boolean} Success status
 */
const clearAuthSession = () => {
    try {
        localStorage.removeItem(AUTH_SESSION_KEY);
        console.log("[AuthService] Auth session cleared");
        return true;
    } catch (error) {
        console.error("[AuthService] Failed to clear auth session:", error);
        return false;
    }
};

// ================= MOCK TOKEN GENERATION =================
/**
 * Generate mock authentication token
 * In production, this would be a real JWT from backend
 * 
 * @param {string} userId - User ID
 * @returns {string} Mock token
 */
const generateMockToken = (userId) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `mock_${userId}_${timestamp}_${random}`;
};

// ================= AUTHENTICATION METHODS =================
/**
 * Login user with credentials
 * 
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Object} Login result with success status and user data
 */
export const login = (credentials = {}) => {
    const { email, password } = credentials;

    if (!email || !password) {
        return {
            success: false,
            error: "Email and password are required",
            user: null
        };
    }

    // Mock authentication - find user in database
    const user = MOCK_USER_DATABASE.find(
        u => u.email === email && u.password === password
    );

    if (!user) {
        return {
            success: false,
            error: "Invalid email or password",
            user: null
        };
    }

    // Set auth session
    setAuthSession(user);

    // Set tenant context (PRIMARY SOURCE)
    setAuthContext({
        schoolId: user.schoolId,
        branchId: user.branchId,
        sessionId: user.sessionId
    });

    console.log("[AuthService] Login successful for user:", user.userId);
    console.log("[AuthService] Tenant context set:", {
        schoolId: user.schoolId,
        branchId: user.branchId,
        sessionId: user.sessionId
    });

    return {
        success: true,
        error: null,
        user: {
            userId: user.userId,
            email: user.email,
            name: user.name,
            role: user.role,
            schoolId: user.schoolId,
            branchId: user.branchId,
            sessionId: user.sessionId
        }
    };
};

/**
 * Logout current user
 * 
 * @returns {Object} Logout result with success status
 */
export const logout = () => {
    // Clear auth session
    clearAuthSession();

    // Clear tenant context
    clearAuthContext();

    console.log("[AuthService] Logout successful - tenant context cleared");

    return {
        success: true,
        error: null
    };
};

/**
 * Get current authenticated user
 * 
 * @returns {Object|null} Current user data or null if not authenticated
 */
export const getCurrentUser = () => {
    const session = getAuthSession();

    if (!session || !session.user) {
        return null;
    }

    return {
        userId: session.user.userId,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        schoolId: session.user.schoolId,
        branchId: session.user.branchId,
        sessionId: session.user.sessionId,
        loginAt: session.loginAt
    };
};

/**
 * Get authentication token
 * 
 * @returns {string|null} Auth token or null if not authenticated
 */
export const getAuthToken = () => {
    const session = getAuthSession();

    if (!session || !session.token) {
        return null;
    }

    return session.token;
};

/**
 * Check if user is authenticated
 * 
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
    return getCurrentUser() !== null;
};

// ================= BACKWARD COMPATIBILITY =================
/**
 * Set user data directly (for backward compatibility)
 * This allows setting user data without full login flow
 * 
 * @param {Object} userData - User object with tenant context
 * @returns {boolean} Success status
 */
export const setUserData = (userData) => {
    if (!userData || typeof userData !== "object") {
        console.error("[AuthService] Invalid user data provided");
        return false;
    }

    // Set auth session
    setAuthSession(userData);

    // Set tenant context
    setAuthContext({
        schoolId: userData.schoolId,
        branchId: userData.branchId,
        sessionId: userData.sessionId
    });

    console.log("[AuthService] User data set for backward compatibility");
    return true;
};

// ================= EXPORTS =================
export default {
    login,
    logout,
    getCurrentUser,
    getAuthToken,
    isAuthenticated,
    setUserData,
};

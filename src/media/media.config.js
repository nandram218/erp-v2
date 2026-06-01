// =====================================================
// MEDIA CONFIG - Unified Media Intelligence Layer (UMIL)
// =====================================================
// Configuration for media system behavior
// =====================================================

import { MEDIA_CONSTANTS, EntityType, MediaType } from "./media.types";

/**
 * Media Configuration
 */
export const MEDIA_CONFIG = Object.freeze({
    // Storage Configuration
    STORAGE: {
        PREFIX: MEDIA_CONSTANTS.STORAGE_PREFIX,
        USE_LOCAL_STORAGE: true,
        USE_INDEXED_DB: false // Future: enable for large files
    },

    // Fallback Configuration
    FALLBACK: {
        DEFAULT: MEDIA_CONSTANTS.DEFAULT_FALLBACK,
        STUDENT_PHOTO: MEDIA_CONSTANTS.DEFAULT_FALLBACK,
        STAFF_PHOTO: MEDIA_CONSTANTS.DEFAULT_FALLBACK,
        SCHOOL_LOGO: MEDIA_CONSTANTS.DEFAULT_FALLBACK,
        SIGNATURE: MEDIA_CONSTANTS.DEFAULT_FALLBACK
    },

    // Upload Configuration
    UPLOAD: {
        MAX_SIZE: MEDIA_CONSTANTS.MAX_FILE_SIZE,
        ALLOWED_IMAGES: MEDIA_CONSTANTS.ALLOWED_IMAGE_TYPES,
        ALLOWED_DOCUMENTS: MEDIA_CONSTANTS.ALLOWED_DOCUMENT_TYPES,
        AUTO_COMPRESS: true,
        QUALITY: 0.8
    },

    // Cache Configuration
    CACHE: {
        ENABLED: true,
        TTL: 3600000, // 1 hour
        MAX_ITEMS: 100
    },

    // Auto-Update Configuration
    AUTO_UPDATE: {
        ENABLED: true,
        DEBOUNCE_MS: 500
    }
});

/**
 * Entity Type Configuration
 */
export const ENTITY_CONFIG = Object.freeze({
    [EntityType.STUDENT]: {
        allowedMediaTypes: [MediaType.PHOTO, MediaType.AVATAR, MediaType.DOCUMENT],
        defaultFallback: MEDIA_CONFIG.FALLBACK.STUDENT_PHOTO,
        autoUpdateTargets: ["profile", "idcard", "certificate", "admitcard"]
    },
    [EntityType.STAFF]: {
        allowedMediaTypes: [MediaType.PHOTO, MediaType.AVATAR],
        defaultFallback: MEDIA_CONFIG.FALLBACK.STAFF_PHOTO,
        autoUpdateTargets: ["profile", "idcard", "attendance"]
    },
    [EntityType.SCHOOL]: {
        allowedMediaTypes: [MediaType.LOGO, MediaType.SIGNATURE],
        defaultFallback: MEDIA_CONFIG.FALLBACK.SCHOOL_LOGO,
        autoUpdateTargets: ["dashboard", "reports", "certificates", "idcards"]
    },
    [EntityType.DOCUMENT]: {
        allowedMediaTypes: [MediaType.DOCUMENT],
        defaultFallback: null,
        autoUpdateTargets: []
    }
});

/**
 * Media Type Configuration
 */
export const MEDIA_TYPE_CONFIG = Object.freeze({
    [MediaType.PHOTO]: {
        maxSize: 2 * 1024 * 1024, // 2MB
        allowedTypes: MEDIA_CONSTANTS.ALLOWED_IMAGE_TYPES,
        category: "profile"
    },
    [MediaType.AVATAR]: {
        maxSize: 1 * 1024 * 1024, // 1MB
        allowedTypes: MEDIA_CONSTANTS.ALLOWED_IMAGE_TYPES,
        category: "profile"
    },
    [MediaType.LOGO]: {
        maxSize: 2 * 1024 * 1024, // 2MB
        allowedTypes: MEDIA_CONSTANTS.ALLOWED_IMAGE_TYPES,
        category: "branding"
    },
    [MediaType.SIGNATURE]: {
        maxSize: 1 * 1024 * 1024, // 1MB
        allowedTypes: MEDIA_CONSTANTS.ALLOWED_IMAGE_TYPES,
        category: "authority"
    },
    [MediaType.DOCUMENT]: {
        maxSize: MEDIA_CONSTANTS.MAX_FILE_SIZE,
        allowedTypes: MEDIA_CONSTANTS.ALLOWED_DOCUMENT_TYPES,
        category: "file"
    }
});

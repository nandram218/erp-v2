// =====================================================
// MEDIA REGISTRY - Unified Media Intelligence Layer (UMIL)
// =====================================================
// Global mapping system for entity → media dependencies
// Defines auto-update relationships
// =====================================================

import { EntityType, MediaType } from "./media.types";

/**
 * Auto-Update Dependency Registry
 * Defines which modules/components need to update when media changes
 */
export const AUTO_UPDATE_REGISTRY = Object.freeze({
    // Student Photo Changes
    [`${EntityType.STUDENT}_${MediaType.PHOTO}`]: [
        "StudentProfile",
        "StudentIDCards",
        "Certificate",
        "StudentTable",
        "AdmitCard"
    ],

    // Staff Photo Changes
    [`${EntityType.STAFF}_${MediaType.PHOTO}`]: [
        "StaffProfile",
        "StaffIDCards",
        "AttendanceSheet",
        "HRModule"
    ],

    // School Logo Changes
    [`${EntityType.SCHOOL}_${MediaType.LOGO}`]: [
        "Dashboard",
        "SchoolHeader",
        "Certificate",
        "StudentIDCards",
        "Reports",
        "AdmitCard",
        "LoginScreen"
    ],

    // Signature Changes
    [`${EntityType.SCHOOL}_${MediaType.SIGNATURE}`]: [
        "Certificate",
        "ResultSheet",
        "OfficialDocuments",
        "AdmitCard",
        "GeneratedPDFs"
    ]
});

/**
 * Entity to Media Type Mapping
 * Defines which media types each entity can have
 */
export const ENTITY_MEDIA_MAP = Object.freeze({
    [EntityType.STUDENT]: [MediaType.PHOTO, MediaType.AVATAR, MediaType.DOCUMENT],
    [EntityType.STAFF]: [MediaType.PHOTO, MediaType.AVATAR],
    [EntityType.SCHOOL]: [MediaType.LOGO, MediaType.SIGNATURE],
    [EntityType.DOCUMENT]: [MediaType.DOCUMENT],
    [EntityType.SYSTEM]: [MediaType.AVATAR]
});

/**
 * Media Type to Default Fallback Mapping
 */
export const FALLBACK_MAP = Object.freeze({
    [`${EntityType.STUDENT}_${MediaType.PHOTO}`]: "/default-avatar.png",
    [`${EntityType.STAFF}_${MediaType.PHOTO}`]: "/default-avatar.png",
    [`${EntityType.SCHOOL}_${MediaType.LOGO}`]: "/default-avatar.png",
    [`${EntityType.SCHOOL}_${MediaType.SIGNATURE}`]: "/default-avatar.png",
    [`${EntityType.DOCUMENT}_${MediaType.DOCUMENT}`]: null
});

/**
 * Get auto-update targets for a specific entity and media type
 */
export const getAutoUpdateTargets = (entityType, mediaType) => {
    const key = `${entityType}_${mediaType}`;
    return AUTO_UPDATE_REGISTRY[key] || [];
};

/**
 * Check if entity supports specific media type
 */
export const isMediaTypeAllowed = (entityType, mediaType) => {
    const allowedTypes = ENTITY_MEDIA_MAP[entityType] || [];
    return allowedTypes.includes(mediaType);
};

/**
 * Get fallback URL for entity and media type
 */
export const getFallbackUrl = (entityType, mediaType) => {
    const key = `${entityType}_${mediaType}`;
    return FALLBACK_MAP[key] || "/default-avatar.png";
};

/**
 * Get all media types for an entity
 */
export const getMediaTypesForEntity = (entityType) => {
    return ENTITY_MEDIA_MAP[entityType] || [];
};

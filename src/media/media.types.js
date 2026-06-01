// =====================================================
// MEDIA TYPES - Unified Media Intelligence Layer (UMIL)
// =====================================================
// Type safety definitions for media system
// =====================================================

/**
 * Entity Types - What type of entity owns the media
 */
export const EntityType = Object.freeze({
    STUDENT: "student",
    STAFF: "staff",
    SCHOOL: "school",
    DOCUMENT: "document",
    SYSTEM: "system"
});

/**
 * Media Types - What type of media is being stored
 */
export const MediaType = Object.freeze({
    PHOTO: "photo",
    LOGO: "logo",
    SIGNATURE: "signature",
    DOCUMENT: "document",
    AVATAR: "avatar"
});

/**
 * Media Categories - High-level grouping
 */
export const MediaCategory = Object.freeze({
    PROFILE: "profile",
    BRANDING: "branding",
    AUTHORITY: "authority",
    FILE: "file"
});

/**
 * Media Status - Lifecycle states
 */
export const MediaStatus = Object.freeze({
    ACTIVE: "active",
    INACTIVE: "inactive",
    PENDING: "pending",
    DELETED: "deleted"
});

/**
 * System Constants
 */
export const MEDIA_CONSTANTS = Object.freeze({
    DEFAULT_FALLBACK: "/default-avatar.png",
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
    ALLOWED_DOCUMENT_TYPES: ["application/pdf", "image/jpeg", "image/png"],
    STORAGE_PREFIX: "media_"
});

/**
 * Entity to Category Mapping
 */
export const ENTITY_CATEGORY_MAP = Object.freeze({
    [EntityType.STUDENT]: MediaCategory.PROFILE,
    [EntityType.STAFF]: MediaCategory.PROFILE,
    [EntityType.SCHOOL]: MediaCategory.BRANDING,
    [EntityType.DOCUMENT]: MediaCategory.FILE,
    [EntityType.SYSTEM]: MediaCategory.SYSTEM
});

/**
 * Media Type to Category Mapping
 */
export const MEDIA_TYPE_CATEGORY_MAP = Object.freeze({
    [MediaType.PHOTO]: MediaCategory.PROFILE,
    [MediaType.AVATAR]: MediaCategory.PROFILE,
    [MediaType.LOGO]: MediaCategory.BRANDING,
    [MediaType.SIGNATURE]: MediaCategory.AUTHORITY,
    [MediaType.DOCUMENT]: MediaCategory.FILE
});

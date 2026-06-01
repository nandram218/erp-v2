// =====================================================
// MEDIA SYSTEM - Unified Media Intelligence Layer (UMIL)
// =====================================================
// Single export entry point for media system
// =====================================================

// Types
export {
    EntityType,
    MediaType,
    MediaCategory,
    MediaStatus,
    MEDIA_CONSTANTS,
    ENTITY_CATEGORY_MAP,
    MEDIA_TYPE_CATEGORY_MAP
} from "./media.types";

// Config
export {
    MEDIA_CONFIG,
    ENTITY_CONFIG,
    MEDIA_TYPE_CONFIG
} from "./media.config";

// Registry
export {
    AUTO_UPDATE_REGISTRY,
    ENTITY_MEDIA_MAP,
    FALLBACK_MAP,
    getAutoUpdateTargets,
    isMediaTypeAllowed,
    getFallbackUrl,
    getMediaTypesForEntity
} from "./media.registry";

// Service
export {
    uploadMedia,
    getMedia,
    updateMedia,
    deleteMedia,
    resolveMedia,
    fallbackHandler,
    getDefaultMediaFallback,
    mediaExists,
    getAllMediaForEntity
} from "./media.service";

// Hooks
export { useMedia, useMediaObject } from "./useMedia";

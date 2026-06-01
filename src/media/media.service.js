// =====================================================
// MEDIA SERVICE - Unified Media Intelligence Layer (UMIL)
// =====================================================
// Single SaaS media engine for all image handling
// =====================================================

import { setStorage, getStorage, removeStorage } from "../services/storageService";
import { MEDIA_CONFIG } from "./media.config";
import { EntityType, MediaType, MEDIA_CONSTANTS } from "./media.types";
import {
    isMediaTypeAllowed,
    getFallbackUrl,
    getAutoUpdateTargets
} from "./media.registry";

/**
 * Storage key generator
 */
const getStorageKey = (entityType, entityId, mediaType) => {
    return `${MEDIA_CONSTANTS.STORAGE_PREFIX}${entityType}_${entityId}_${mediaType}`;
};

/**
 * Upload media to storage
 */
export const uploadMedia = async (entityType, entityId, mediaType, file) => {
    // Validation
    if (!isMediaTypeAllowed(entityType, mediaType)) {
        throw new Error(`Media type ${mediaType} not allowed for entity ${entityType}`);
    }

    if (!file) {
        throw new Error("No file provided");
    }

    // File size validation
    if (file.size > MEDIA_CONFIG.UPLOAD.MAX_SIZE) {
        throw new Error(`File size exceeds maximum of ${MEDIA_CONFIG.UPLOAD.MAX_SIZE / 1024 / 1024}MB`);
    }

    // File type validation
    const config = MEDIA_CONFIG.UPLOAD;
    const allowedTypes = mediaType === MediaType.DOCUMENT 
        ? config.ALLOWED_DOCUMENTS 
        : config.ALLOWED_IMAGES;
    
    if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} not allowed`);
    }

    // Convert file to base64 for storage
    const reader = new FileReader();
    const promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });
    reader.readAsDataURL(file);
    const base64Data = await promise;

    // Store in centralized storage
    const key = getStorageKey(entityType, entityId, mediaType);
    setStorage(key, base64Data);

    // Trigger auto-update notifications
    const targets = getAutoUpdateTargets(entityType, mediaType);
    if (MEDIA_CONFIG.AUTO_UPDATE.ENABLED && targets.length > 0) {
        triggerAutoUpdate(entityType, entityId, mediaType, targets);
    }

    return {
        success: true,
        url: base64Data,
        entityType,
        entityId,
        mediaType
    };
};

/**
 * Get media from storage
 */
export const getMedia = (entityType, entityId, mediaType) => {
    const key = getStorageKey(entityType, entityId, mediaType);
    const data = getStorage(key);
    
    if (!data) {
        return null;
    }

    return {
        url: data,
        entityType,
        entityId,
        mediaType
    };
};

/**
 * Update existing media
 */
export const updateMedia = async (entityType, entityId, mediaType, file) => {
    return uploadMedia(entityType, entityId, mediaType, file);
};

/**
 * Delete media from storage
 */
export const deleteMedia = (entityType, entityId, mediaType) => {
    const key = getStorageKey(entityType, entityId, mediaType);
    removeStorage(key);
    
    // Trigger auto-update notifications
    const targets = getAutoUpdateTargets(entityType, mediaType);
    if (MEDIA_CONFIG.AUTO_UPDATE.ENABLED && targets.length > 0) {
        triggerAutoUpdate(entityType, entityId, mediaType, targets);
    }

    return { success: true };
};

/**
 * Resolve media URL with fallback
 */
export const resolveMedia = (entityType, entityId, mediaType) => {
    const media = getMedia(entityType, entityId, mediaType);
    
    if (media && media.url) {
        return media.url;
    }

    // Return fallback
    return getFallbackUrl(entityType, mediaType);
};

/**
 * Fallback handler for image errors
 */
export const fallbackHandler = (event, entityType, mediaType) => {
    const fallback = getFallbackUrl(entityType, mediaType);
    if (fallback && event.target) {
        event.target.src = fallback;
    }
};

/**
 * Trigger auto-update notification
 * This emits a custom event that components can listen to
 */
const triggerAutoUpdate = (entityType, entityId, mediaType, targets) => {
    const event = new CustomEvent('mediaUpdate', {
        detail: {
            entityType,
            entityId,
            mediaType,
            targets,
            timestamp: Date.now()
        }
    });
    window.dispatchEvent(event);
};

/**
 * Get default media fallback URL
 */
export const getDefaultMediaFallback = () => {
    return MEDIA_CONFIG.FALLBACK.DEFAULT;
};

/**
 * Check if media exists
 */
export const mediaExists = (entityType, entityId, mediaType) => {
    const key = getStorageKey(entityType, entityId, mediaType);
    const data = getStorage(key);
    return !!data;
};

/**
 * Get all media for an entity
 */
export const getAllMediaForEntity = (entityType, entityId) => {
    const mediaTypes = [MediaType.PHOTO, MediaType.AVATAR, MediaType.LOGO, MediaType.SIGNATURE, MediaType.DOCUMENT];
    const result = {};
    
    mediaTypes.forEach(type => {
        if (isMediaTypeAllowed(entityType, type)) {
            const media = getMedia(entityType, entityId, type);
            if (media) {
                result[type] = media.url;
            }
        }
    });

    return result;
};

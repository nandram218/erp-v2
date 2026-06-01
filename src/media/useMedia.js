// =====================================================
// USE MEDIA HOOK - Unified Media Intelligence Layer (UMIL)
// =====================================================
// React hook for media auto-update listening
// Components can use this to re-render when media changes
// =====================================================

import { useState, useEffect } from "react";
import { getMedia, resolveMedia } from "./media.service";

/**
 * useMedia Hook
 * 
 * Listens to media update events and returns current media URL
 * 
 * @param {string} entityType - Entity type (student, staff, school, etc.)
 * @param {string} entityId - Entity ID
 * @param {string} mediaType - Media type (photo, logo, signature, etc.)
 * @returns {object} - { url, loading, error }
 */
export const useMedia = (entityType, entityId, mediaType) => {
    const [url, setUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load media initially
    useEffect(() => {
        if (!entityType || !entityId || !mediaType) {
            setLoading(false);
            return;
        }

        try {
            const resolvedUrl = resolveMedia(entityType, entityId, mediaType);
            setUrl(resolvedUrl);
            setError(null);
        } catch (err) {
            setError(err);
            if (process.env.NODE_ENV === "development") {
                console.error("[useMedia] Error loading media:", err);
            }
        } finally {
            setLoading(false);
        }
    }, [entityType, entityId, mediaType]);

    // Listen to media update events
    useEffect(() => {
        const handleMediaUpdate = (event) => {
            const { entityType: updatedEntityType, entityId: updatedEntityId, mediaType: updatedMediaType } = event.detail;

            // Check if this update is relevant to this hook
            if (
                updatedEntityType === entityType &&
                updatedEntityId === entityId &&
                updatedMediaType === mediaType
            ) {
                // Reload media
                try {
                    const resolvedUrl = resolveMedia(entityType, entityId, mediaType);
                    setUrl(resolvedUrl);
                    setError(null);
                } catch (err) {
                    setError(err);
                }
            }
        };

        // Add event listener
        window.addEventListener('mediaUpdate', handleMediaUpdate);

        // Cleanup
        return () => {
            window.removeEventListener('mediaUpdate', handleMediaUpdate);
        };
    }, [entityType, entityId, mediaType]);

    return { url, loading, error };
};

/**
 * useMediaObject Hook
 * 
 * Returns full media object with metadata
 * 
 * @param {string} entityType - Entity type
 * @param {string} entityId - Entity ID
 * @param {string} mediaType - Media type
 * @returns {object} - { media, loading, error }
 */
export const useMediaObject = (entityType, entityId, mediaType) => {
    const [media, setMedia] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!entityType || !entityId || !mediaType) {
            setLoading(false);
            return;
        }

        try {
            const mediaData = getMedia(entityType, entityId, mediaType);
            setMedia(mediaData);
            setError(null);
        } catch (err) {
            setError(err);
            if (process.env.NODE_ENV === "development") {
                console.error("[useMediaObject] Error loading media:", err);
            }
        } finally {
            setLoading(false);
        }
    }, [entityType, entityId, mediaType]);

    // Listen to media update events
    useEffect(() => {
        const handleMediaUpdate = (event) => {
            const { entityType: updatedEntityType, entityId: updatedEntityId, mediaType: updatedMediaType } = event.detail;

            if (
                updatedEntityType === entityType &&
                updatedEntityId === entityId &&
                updatedMediaType === mediaType
            ) {
                try {
                    const mediaData = getMedia(entityType, entityId, mediaType);
                    setMedia(mediaData);
                    setError(null);
                } catch (err) {
                    setError(err);
                }
            }
        };

        window.addEventListener('mediaUpdate', handleMediaUpdate);
        return () => {
            window.removeEventListener('mediaUpdate', handleMediaUpdate);
        };
    }, [entityType, entityId, mediaType]);

    return { media, loading, error };
};

export default useMedia;

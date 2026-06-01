// =====================================================
// MEDIA RENDERER - Unified Media Intelligence Layer (UMIL)
// =====================================================
// Universal image rendering component
// Replaces ALL image rendering in system
// =====================================================

import React, { useState, useEffect } from "react";
import { resolveMedia, fallbackHandler, getDefaultMediaFallback } from "./media.service";
import { EntityType, MediaType } from "./media.types";

/**
 * MediaRenderer Component
 * 
 * Props:
 * - entityType: "student" | "staff" | "school" | "document" | "system"
 * - entityId: string (unique identifier for the entity)
 * - mediaType: "photo" | "logo" | "signature" | "document" | "avatar"
 * - fallback: string (optional custom fallback URL)
 * - alt: string (alt text for image)
 * - style: object (inline styles)
 * - className: string (CSS class)
 * - loading: "lazy" | "eager" (image loading strategy)
 * - onError: function (custom error handler)
 */
const MediaRenderer = ({
    entityType,
    entityId,
    mediaType,
    fallback = null,
    alt = "",
    style = {},
    className = "",
    loading = "lazy",
    onError = null,
    ...rest
}) => {
    const [src, setSrc] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!entityType || !entityId || !mediaType) {
            setError(true);
            return;
        }

        try {
            const resolvedUrl = resolveMedia(entityType, entityId, mediaType);
            setSrc(resolvedUrl);
            setError(false);
        } catch (err) {
            if (process.env.NODE_ENV === "development") {
                console.error("[MediaRenderer] Error resolving media:", err);
            }
            setError(true);
        }
    }, [entityType, entityId, mediaType]);

    const handleError = (event) => {
        setError(true);
        
        // Use custom error handler if provided
        if (onError) {
            onError(event);
            return;
        }

        // Use default fallback handler
        fallbackHandler(event, entityType, mediaType);
    };

    // Determine final fallback URL
    const finalFallback = fallback || getDefaultMediaFallback();

    // If error or no src, show fallback
    if (error || !src) {
        return (
            <img
                src={finalFallback}
                alt={alt || "fallback"}
                style={style}
                className={className}
                loading={loading}
                onError={(e) => {
                    // Prevent infinite loop if fallback also fails
                    e.target.style.display = "none";
                }}
                {...rest}
            />
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            style={style}
            className={className}
            loading={loading}
            onError={handleError}
            {...rest}
        />
    );
};

/**
 * Convenience components for common use cases
 */

export const StudentPhoto = ({ studentId, ...props }) => (
    <MediaRenderer
        entityType={EntityType.STUDENT}
        entityId={studentId}
        mediaType={MediaType.PHOTO}
        {...props}
    />
);

export const StaffPhoto = ({ staffId, ...props }) => (
    <MediaRenderer
        entityType={EntityType.STAFF}
        entityId={staffId}
        mediaType={MediaType.PHOTO}
        {...props}
    />
);

export const SchoolLogo = ({ schoolId = "default", ...props }) => (
    <MediaRenderer
        entityType={EntityType.SCHOOL}
        entityId={schoolId}
        mediaType={MediaType.LOGO}
        {...props}
    />
);

export const SchoolSignature = ({ schoolId = "default", ...props }) => (
    <MediaRenderer
        entityType={EntityType.SCHOOL}
        entityId={schoolId}
        mediaType={MediaType.SIGNATURE}
        {...props}
    />
);

export default MediaRenderer;

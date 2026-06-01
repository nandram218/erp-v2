# Unified Media Intelligence Layer (UMIL)

## Overview

ERP-v2's centralized media system that eliminates duplicate image handling across modules. Provides a single source of truth for all media operations.

## Architecture

```
/src/media/
├── media.types.js       # Type definitions (EntityType, MediaType, constants)
├── media.config.js      # Configuration (fallbacks, upload limits, cache settings)
├── media.registry.js    # Auto-update dependency registry
├── media.service.js     # Core media operations (upload, get, update, delete)
├── useMedia.js          # React hooks for auto-update listening
├── MediaRenderer.jsx    # Universal image rendering component
├── index.js             # Single export entry point
└── README.md            # This file
```

## Core Concepts

### Entity Types
- `STUDENT` - Student photos, avatars, documents
- `STAFF` - Staff photos, avatars
- `SCHOOL` - Logo, signatures
- `DOCUMENT` - Uploaded documents
- `SYSTEM` - System-level media

### Media Types
- `PHOTO` - Profile photos
- `LOGO` - School/organization logos
- `SIGNATURE` - Authority signatures
- `DOCUMENT` - File uploads
- `AVATAR` - User avatars

## Usage

### Basic Media Operations

```javascript
import { uploadMedia, getMedia, resolveMedia } from "../media";

// Upload media
const result = await uploadMedia(
    EntityType.STUDENT,
    "student-123",
    MediaType.PHOTO,
    fileObject
);

// Get media
const media = getMedia(EntityType.STUDENT, "student-123", MediaType.PHOTO);

// Resolve with automatic fallback
const url = resolveMedia(EntityType.STUDENT, "student-123", MediaType.PHOTO);
```

### MediaRenderer Component

```jsx
import { MediaRenderer } from "../media";

<MediaRenderer
    entityType="student"
    entityId="student-123"
    mediaType="photo"
    fallback="/default-avatar.png"
    alt="Student photo"
    style={{ width: 100 }}
/>
```

### Convenience Components

```jsx
import { StudentPhoto, SchoolLogo, SchoolSignature } from "../media";

<StudentPhoto studentId="student-123" />
<SchoolLogo schoolId="default" />
<SchoolSignature schoolId="default" />
```

### useMedia Hook (Auto-Update)

```jsx
import { useMedia } from "../media";

const MyComponent = ({ studentId }) => {
    const { url, loading, error } = useMedia(
        EntityType.STUDENT,
        studentId,
        MediaType.PHOTO
    );

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading image</div>;

    return <img src={url} alt="Student" />;
};
```

## Auto-Update System

When media is uploaded/updated, the system automatically notifies dependent components via custom events:

```javascript
// Components automatically re-render when media changes
window.addEventListener('mediaUpdate', (event) => {
    const { entityType, entityId, mediaType, targets } = event.detail;
    // Components listening to this entity/mediaType will update
});
```

### Auto-Update Targets

- **Student Photo**: StudentProfile, StudentIDCards, Certificate, StudentTable
- **School Logo**: Dashboard, SchoolHeader, Certificate, Reports
- **Signature**: Certificate, ResultSheet, OfficialDocuments

## Storage

Media is stored using the centralized `storageService` with prefixed keys:
- Format: `media_{entityType}_{entityId}_{mediaType}`
- Example: `media_student_123_photo`

## Configuration

Edit `media.config.js` to customize:
- File size limits
- Allowed file types
- Fallback URLs
- Cache settings
- Auto-update behavior

## Migration Strategy

### Current State (Backward Compatible)
- Existing components continue to use local state
- Media system available for new features
- Gradual migration path

### Migration Steps
1. **Phase 1**: Use media service for new uploads
2. **Phase 2**: Replace display components with MediaRenderer
3. **Phase 3**: Migrate existing data to centralized storage
4. **Phase 4**: Remove local image state from components

## Safety Rules

- ✅ Zero breaking changes
- ✅ Backward compatible
- ✅ Incremental safe rollout
- ✅ Auto-detects existing usage
- ✅ Future-proof for all new modules

## Files Affected by Current System

Based on audit, these files currently handle images:
- `src/modules/students/StudentForm.jsx` - Photo upload
- `src/modules/students/pages/StudentProfile.jsx` - Photo display
- `src/modules/students/components/StudentTable.jsx` - Photo in table
- `src/modules/students/pages/StudentIDCards.jsx` - Photo on ID card
- `src/modules/students/certificates/Certificate.jsx` - Photo, logo, signature
- `src/master-setting/school-profile/SchoolProfile.jsx` - Logo, signature upload
- `src/components/SchoolHeader.jsx` - Logo display

These will be gradually migrated to use the unified media system.

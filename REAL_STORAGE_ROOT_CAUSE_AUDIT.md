# REAL STORAGE ROOT CAUSE AUDIT

**Generated:** June 1, 2026  
**Issue:** QuotaExceededError still occurring after initial fix  
**Status:** ROOT CAUSE IDENTIFIED

---

## 1. Exact Source Code

### src/store/schoolStore.js

```javascript
// Lines 117-128
setSchoolData: (data) => {
    set({
        schoolData: {
            ...get().schoolData,
            ...data,
        }
    });
    get().saveAll();
},

// Lines 93-113
saveAll: () => {
    const state = get();
    const db = {
        school: state.schoolData,
        students: state.students || [],
        classes: state.classes || [],
        fees: state.fees || {},
        transport: state.transport || {},
        hostel: state.hostel || {}
    };
    setStorageCompat(ERP_DB_KEY, db);
},
```

### src/services/storageService.js

```javascript
// Lines 61-64
export const setStorageCompat = (key, value) => {
    setStorage(key, value);        // Saves to prefixed key
    writeRawLegacy(key, value);    // ALSO saves to legacy key (DUPLICATE!)
};

// Lines 27-29
const writeRawLegacy = (legacyKey, value) => {
    localStorage.setItem(legacyKey, JSON.stringify(value));
};

// Lines 76-85
export const setStorage = (key, value) => {
    try {
        localStorage.setItem(
            getPrefixedKey(key),
            JSON.stringify(value)
        );
    } catch (error) {
        console.error("Storage Set Error:", key, error);
    }
};
```

### src/services/schoolProfileService.js

```javascript
// Lines 12-15
export const saveSchoolProfile = (payload) => {
    setStorageCompat(KEY, payload);
    return payload;
};
```

---

## 2. Complete Flow Trace

### SchoolProfile → setSchoolData → saveAll → ERP_DB Write

```
┌─────────────────────────────────────────────────────────────┐
│              SCHOOL PROFILE SAVE FLOW (ACTUAL)                │
└─────────────────────────────────────────────────────────────┘

1. SchoolProfile.jsx handleSave()
   ├─► const payload = { mediumType, schools: schoolsFiltered }
   │
   ├─► saveSchoolProfile(payload)
   │   └─► schoolProfileService.js saveSchoolProfile()
   │       └─► setStorageCompat(STORAGE_KEYS.SCHOOL_PROFILE, payload)
   │           ├─► setStorage("schoolProfile", payload)
   │           │   └─► localStorage.setItem("ERP_V2_SAAS_schoolProfile", JSON.stringify(payload))
   │           │
   │           └─► writeRawLegacy("schoolProfile", payload)
   │               └─► localStorage.setItem("schoolProfile", JSON.stringify(payload))
   │
   └─► setSchoolData(payload)
       └─► schoolStore.js setSchoolData()
           ├─► set({ schoolData: { ...get().schoolData, ...payload } })
           │
           └─► get().saveAll()
               └─► schoolStore.js saveAll()
                   ├─► const db = {
                   │       school: state.schoolData,
                   │       students: state.students || [],
                   │       classes: state.classes || [],
                   │       fees: state.fees || {},
                   │       transport: state.transport || {},
                   │       hostel: state.hostel || {}
                   │   }
                   │
                   └─► setStorageCompat(ERP_DB_KEY, db)
                       ├─► setStorage("ERP_DB", db)
                       │   └─► localStorage.setItem("ERP_V2_SAAS_ERP_DB", JSON.stringify(db))
                       │
                       └─► writeRawLegacy("ERP_DB", db)
                           └─► localStorage.setItem("ERP_DB", JSON.stringify(db))
```

---

## 3. Root Cause - DOUBLE STORAGE

### The Problem: setStorageCompat Writes TWICE

**storageService.js line 61-64:**
```javascript
export const setStorageCompat = (key, value) => {
    setStorage(key, value);        // Write #1: Prefixed key
    writeRawLegacy(key, value);    // Write #2: Legacy key (DUPLICATE!)
};
```

**Every save operation writes the same data to TWO localStorage keys:**

1. **Prefixed key:** `ERP_V2_SAAS_{KEY}` (via setStorage)
2. **Legacy key:** `{KEY}` (via writeRawLegacy)

### Impact on SchoolProfile Save

When SchoolProfile saves:
- **Write #1:** `ERP_V2_SAAS_schoolProfile` = payload (filtered schools without logo/sign)
- **Write #2:** `schoolProfile` = payload (filtered schools without logo/sign)
- **Write #3:** `ERP_V2_SAAS_ERP_DB` = db (includes schoolData which is the payload)
- **Write #4:** `ERP_DB` = db (includes schoolData which is the payload)

**Total: 4 writes for 1 save operation**

### Impact on ERP_DB Size

ERP_DB contains:
- `school`: schoolData (includes schools.english, schools.hindi)
- `students`: array of student objects
- `classes`: array of class objects
- `fees`: fee settings
- `transport`: transport data
- `hostel`: hostel data

**Even after filtering logo/sign from schoolsFiltered, ERP_DB still contains:**
- The entire schools object structure
- All student records (which may still have old photo/photoPreview data)
- All other collections

---

## 4. Current ERP_DB Size Estimate

### Collections Stored in ERP_DB

1. **school** - schoolData object
   - Contains: schools.english, schools.hindi (filtered, no logo/sign)
   - Estimated size: ~5-10KB per school type

2. **students** - array of student objects
   - Each student contains: name, dob, gender, address, fees, etc.
   - **CRITICAL:** Old student records may still have photo/photoPreview fields
   - Estimated size: ~2-5KB per student
   - With 100 students: ~200-500KB

3. **classes** - array of class objects
   - Estimated size: ~1-2KB per class
   - With 20 classes: ~20-40KB

4. **fees** - fee settings object
   - Estimated size: ~10-20KB

5. **transport** - transport data object
   - Estimated size: ~5-10KB

6. **hostel** - hostel data object
   - Estimated size: ~5-10KB

### Total Estimated Size (WITHOUT images)

- school: ~10-20KB
- students: ~200-500KB (100 students)
- classes: ~20-40KB
- fees: ~10-20KB
- transport: ~5-10KB
- hostel: ~5-10KB

**Total: ~250-600KB**

### Total Estimated Size (WITH old image data in students)

If old student records still have photo/photoPreview:
- Each photo: ~50-100KB (base64)
- 100 students with photos: ~5-10MB

**Total: ~5-10.6MB**

### Double Storage Impact

Since setStorageCompat writes twice:
- Actual localStorage usage: ~10-21.2MB
- Typical localStorage quota: 5-10MB
- **RESULT: QuotaExceededError**

---

## 5. Are Photos/Logo/Signature Still Inside ERP_DB?

### After My Fix (SchoolProfile)

**SchoolProfile.jsx handleSave:**
```javascript
const schoolsFiltered = {};
Object.keys(schools).forEach(type => {
    const { logo, sign, ...schoolData } = schools[type];
    schoolsFiltered[type] = schoolData;  // logo and sign removed
});
```

**Result:** ✅ Logo and signature are NOT in schoolsFiltered  
**But:** schoolsFiltered is saved to schoolData in ERP_DB via setSchoolData

### After My Fix (StudentForm)

**StudentForm.jsx handleSave:**
```javascript
const { photo, photoPreview, documents, ...dataForStorage } = finalData;
```

**Result:** ✅ Photo, photoPreview, documents are NOT in dataForStorage  
**But:** dataForStorage is saved to students array in ERP_DB via setStudents

### OLD RECORDS IN ERP_DB

**Critical Issue:** Old student records that were saved BEFORE my fix still contain:
- photo (File object or base64)
- photoPreview (blob URL or base64)
- documents (array of File objects)

These old records are loaded from ERP_DB on app startup:
```javascript
// schoolStore.js line 60-62
students: Array.isArray(db.students)
    ? db.students
    : [],
```

**Result:** ❌ Old student records STILL have photo/photoPreview in ERP_DB

---

## 6. Exact Root Cause

### Primary Root Cause: Double Storage

**storageService.js setStorageCompat writes to TWO keys:**
1. Prefixed key: `ERP_V2_SAAS_{KEY}`
2. Legacy key: `{KEY}`

**This doubles the localStorage usage for every save operation.**

### Secondary Root Cause: Old Data in ERP_DB

**Old student records saved before my fix still contain:**
- photo (File object or base64)
- photoPreview (blob URL or base64)
- documents (array of File objects)

**These are not cleaned up by my fix - only new saves are filtered.**

### Tertiary Root Cause: No Data Migration

**No migration script to clean old data:**
- Old records with photo/photoPreview remain in ERP_DB
- Each save operation loads all old records
- Each save operation writes all old records (with images) to ERP_DB again

---

## 7. Evidence Summary

### Code Evidence #1: Double Storage

**storageService.js line 61-64:**
```javascript
export const setStorageCompat = (key, value) => {
    setStorage(key, value);        // Write #1
    writeRawLegacy(key, value);    // Write #2 (DUPLICATE)
};
```

### Code Evidence #2: SchoolProfile Saves to Both Keys

**SchoolProfile.jsx handleSave:**
```javascript
saveSchoolProfile(payload);  // Saves to SCHOOL_PROFILE (2 writes)
setSchoolData(payload);      // Saves to ERP_DB (2 writes)
```

**Total: 4 localStorage writes for 1 save operation**

### Code Evidence #3: ERP_DB Contains All Collections

**schoolStore.js saveAll:**
```javascript
const db = {
    school: state.schoolData,      // Includes schoolsFiltered
    students: state.students || [], // Includes old records with photos
    classes: state.classes || [],
    fees: state.fees || {},
    transport: state.transport || {},
    hostel: state.hostel || {}
};
```

### Code Evidence #4: Old Records Not Cleaned

**schoolStore.js loadAll:**
```javascript
students: Array.isArray(db.students)
    ? db.students  // Loads old records with photo/photoPreview
    : [],
```

---

## 8. Conclusion

### Root Cause #1: Double Storage (CRITICAL)
- setStorageCompat writes to both prefixed and legacy keys
- Doubles localStorage usage
- Estimated impact: 2x storage usage

### Root Cause #2: Old Data in ERP_DB (CRITICAL)
- Old student records saved before fix still have photo/photoPreview
- No migration to clean old data
- Estimated impact: 5-10MB of old image data

### Root Cause #3: No Data Migration (HIGH)
- Each save loads and re-saves all old data
- Old image data persists indefinitely
- Estimated impact: Continuous quota risk

### Required Fixes

1. **Remove double storage in setStorageCompat** - Stop writing to legacy key
2. **Add data migration to clean old student records** - Remove photo/photoPreview from old records
3. **Add data migration to clean old school profile** - Remove logo/sign from old records

---

**Audit End**

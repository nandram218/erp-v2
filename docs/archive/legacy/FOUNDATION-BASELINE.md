# ERP-v2 v1.0.0 SaaS Foundation Baseline

> **STATUS: PERMANENT MASTER BASELINE**
> **VERSION: 1.0.0**
> **DATE: 2026-06-25**
> **AUTHORITY: Architecture Governance**
> **SCOPE: Entire ERP-v2 System**

---

## 1. BASELINE DECLARATION

This document establishes **ERP-v2 v1.0.0** as the official master architectural baseline.

**All future development MUST:**
- Build ON TOP of this baseline
- Never rewrite or replace core contracts
- Extend, not modify, frozen patterns
- Maintain backward compatibility
- Follow extension standards defined herein

**This is NOT documentation.**
**This is a CONTRACT STANDARDIZATION governance document.**

---

## 2. CONTRACT CLASSIFICATION MATRIX

Every contract in the system is classified into one of five categories:

| Category | Can Change | Requires Migration | Requires Version Bump | Backward Compat | AI Rule | Developer Rule |
|----------|------------|-------------------|----------------------|-----------------|---------|----------------|
| **PERMANENT** | NO | YES | YES (major) | YES | NEVER modify | CEO + ADR required |
| **STABLE** | NO (without ADR) | YES | YES (minor) | YES | NEVER modify | Lead approval |
| **EXTENDABLE** | YES (additive) | NO | NO | YES | Can extend | Module owner |
| **INTERNAL** | YES | NO | NO | Depends | Can refactor | Code review |
| **EXPERIMENTAL** | YES | NO | NO | NO | Flag clearly | Any dev |

---

## 3. STORAGE CONTRACTS [PERMANENT]

### 3.1 Storage Key Format
```
{prefix}_{schoolId}_{branchId}_{sessionId}_{entity}
```

**Locked Values:**
- Prefix: `ERP_V2_SAAS`
- Tenant pattern: `{schoolId}_{branchId}_{sessionId}`
- Entity names: See storageKeys.js

**Why PERMANENT:** Changing this breaks all existing LocalStorage data.

### 3.2 Storage Keys Registry
**File:** `src/core/constants/storageKeys.js`

| Constant | Value | Classification |
|----------|-------|----------------|
| ERP_DB | `ERP_DB` | PERMANENT |
| ERP_CLASSES | `ERP_CLASSES` | PERMANENT |
| ERP_SUBJECTS | `ERP_SUBJECTS` | PERMANENT |
| ERP_CLASS_SUBJECT_MAP | `ERP_CLASS_SUBJECT_MAP` | PERMANENT |
| ERP_FEE_SETTINGS | `ERP_FEE_SETTINGS` | PERMANENT |
| ERP_FEES_DB | `ERP_FEES_DB` | PERMANENT |
| ERP_FEES_LEDGER | `ERP_FEES_LEDGER` | PERMANENT |
| ERP_RECEIPT_COUNTER | `ERP_RECEIPT_COUNTER` | PERMANENT |
| ERP_RECEIPT_REGISTER | `ERP_RECEIPT_REGISTER` | PERMANENT |
| ERP_RECEIPT_TEMPLATES | `ERP_RECEIPT_TEMPLATES` | PERMANENT |
| ERP_RECEIPT_PDFS | `ERP_RECEIPT_PDFS` | PERMANENT |
| SCHOOL_PROFILE | `schoolProfile` | PERMANENT |
| DRAFT_STUDENT | `draftStudent` | STABLE |

**Why PERMANENT:** These are data contracts. Changing requires migration + version bump.

### 3.3 Storage Access Pattern
**File:** `src/services/storageService.js`

**PERMANENT Rules:**
```javascript
// ALL storage MUST go through storageService
// NEVER direct localStorage access from modules
// Tenant-aware pattern:
const db = getTenantStorage(KEY, getTenantContextForStorage(), fallback);
```

**Why PERMANENT:** This is the SaaS isolation foundation.

---

## 4. TENANT SYSTEM CONTRACTS [PERMANENT]

### 4.1 Tenant Context Fields
```javascript
{
    schoolId: string,  // REQUIRED
    branchId: string,  // REQUIRED
    sessionId: string  // REQUIRED
}
```

**Locked Since:** Phase 3.1 B
**Classification:** PERMANENT

**Why PERMANENT:** Core SaaS contract. Changing breaks multi-tenant isolation.

### 4.2 Tenant Context Source Hierarchy
1. Authentication context (highest priority)
2. Empty context (triggers shared storage fallback)
3. **NO** default context in production (SAFETY_MODE enforced)

**Classification:** PERMANENT

### 4.3 Auth Context Storage Key
`ERP_AUTH_CONTEXT`

**Classification:** PERMANENT

---

## 5. ENTITY CONTRACTS

### 5.1 Student Entity [STABLE]

**Primary ID Field:** `studentId`
**ID Format:** `{schoolId}-{sessionId}-STU-{6-digit}`
**Example:** `SCH-IND-0001-2025-26-STU-000001`

**Required Fields:**
```javascript
{
    studentId: string,      // CANONICAL (format above)
    id: number,             // LEGACY (kept for backward compat)
    schoolId: string,       // TENANT
    branchId: string,       // TENANT
    sessionId: string,      // TENANT
    name: string,           // REQUIRED
    class: string,          // CANONICAL (aliases: className, studentClass)
    mobile: string,         // CANONICAL (aliases: mobileNo, fatherMobile)
    createdAt: ISO8601,
    updatedAt: ISO8601,
    isActive: boolean       // SOFT DELETE
}
```

**Optional Fields:**
- `transport`: object (if enabled)
- `hostel`: boolean
- `admissionNo`: string
- `gender`: string
- `category`: string
- `RTE`: string

**Classification:** STABLE
**Why:** Core entity. Changes require migration.

### 5.2 Receipt Entity [PERMANENT]

**Receipt Number Pattern:** `RCPT-{5-digit-padded}`
**Example:** `RCPT-00001`

**Required Fields:**
```javascript
{
    receiptId: UUID,        // crypto.randomUUID()
    receiptNumber: string,  // RCPT-XXXXX
    paymentId: UUID,
    ledgerEntryId: UUID,
    
    studentId: string,
    admissionNo: string,
    studentName: string,
    className: string,
    section: string,
    rollNumber: string,
    fatherName: string,
    
    amount: number,
    discount: number,
    lateFee: number,
    finalAmount: number,
    
    lineItems: array,
    
    installmentId: string | null,
    installmentName: string | null,
    installmentSequence: number | null,
    totalInstallments: number | null,
    dueDate: string | null,
    
    discountType: string | null,
    discountSource: string,
    discountReason: string | null,
    discountReferenceId: string | null,
    
    paymentMode: string,    // See RECEIPT_STATUS
    referenceNumber: string | null,
    bankName: string | null,
    chequeNumber: string | null,
    transactionId: string | null,
    
    feeSnapshot: object,
    academicYearId: string,
    
    printCount: number,
    lastPrintDate: string | null,
    reprintHistory: array,
    actionLog: array,
    
    status: string,         // ACTIVE, CANCELLED, VOIDED
    
    cancelledAt: string | null,
    cancelledBy: string | null,
    cancelReason: string | null,
    cancelApprovedBy: string | null,
    cancelApprovedAt: string | null,
    
    voidedAt: string | null,
    voidedBy: string | null,
    voidReason: string | null,
    voidApprovedBy: string | null,
    voidApprovedAt: string | null,
    
    paymentDate: ISO8601,
    createdAt: ISO8601,
    updatedAt: ISO8601
}
```

**Classification:** PERMANENT
**Why:** Financial audit trail. Breaking changes violate compliance.

### 5.3 Fee Settings Entity [STABLE]

**Structure:**
```javascript
{
    schoolId: string,
    academicYear: string,
    classes: {
        [className]: {
            feeTypes: {
                [feeName]: {
                    id: string,
                    name: string,
                    amount: number,
                    category: 'compulsory' | 'optional'
                }
            }
        }
    },
    transportRoutes: array,
    hostelFee: {
        enabled: boolean,
        amount: number
    }
}
```

**Classification:** STABLE
**Why:** Core configuration. Schema changes require migration.

### 5.4 Transport Route Entity [STABLE]

**Canonical Fields:**
```javascript
{
    id: string | number,   // CANONICAL (alias: routeNo)
    routeName: string,     // CANONICAL (alias: name)
    fareType: string,      // 'fixed' | 'variable'
    transportFee: number,  // CANONICAL (aliases: fixedFare, monthlyFee, fee, fare)
    fixedFare: number,
    monthlyFee: number,
    vehicleNumber: string,
    vehicleType: string,
    driverName: string,
    driverPhone: string,
    gpsEnabled: boolean,
    liveTrackingEnabled: boolean,
    active: boolean,
    pickupPoints: [
        {
            id: string,
            pickupPointName: string,  // CANONICAL
            routeFee: number,         // CANONICAL
            pickupTime: string,
            dropTime: string
        }
    ],
    createdAt: ISO8601,
    updatedAt: ISO8601
}
```

**Classification:** STABLE
**Why:** Normalized schema established Phase 4.4E. Dual authority accepted.

---

## 6. IDENTIFIER CONTRACTS

### 6.1 Student ID
- **Format:** `{schoolId}-{sessionId}-STU-{6-digit-padded}`
- **Example:** `SCH-IND-0001-2025-26-STU-000042`
- **Generation:** Max existing numeric ID + 1
- **Classification:** PERMANENT

### 6.2 Receipt Number
- **Format:** `RCPT-{5-digit-padded}`
- **Example:** `RCPT-00123`
- **Generation:** Counter stored in `ERP_RECEIPT_COUNTER`
- **Classification:** PERMANENT

### 6.3 Receipt ID
- **Format:** UUID (crypto.randomUUID())
- **Classification:** PERMANENT

### 6.4 Payment ID
- **Format:** UUID (crypto.randomUUID())
- **Classification:** PERMANENT

---

## 7. SERVICE CONTRACTS

### 7.1 Service Registry Pattern [PERMANENT]

**File:** `src/core/serviceRegistry.js`

**Rules:**
```javascript
// Module services MUST use registry
const service = getService("serviceName");

// Master-setting services MAY use direct imports (exempt)
import { service } from "./serviceFile";

// Production enforcement: blockDirectServiceAccess() active for modules
```

**Classification:** PERMANENT
**Why:** Core SaaS enforcement mechanism.

### 7.2 Tenant-Aware Service Pattern [PERMANENT]

**Required Pattern:**
```javascript
const tenantContext = getTenantContextForStorage();
const data = getTenantStorage(KEY, tenantContext, fallback);
```

**Classification:** PERMANENT
**Why:** Multi-tenant isolation foundation.

### 7.3 Service Authority Map

| Service | Storage Keys | Tenant-Aware | Status | Classification |
|---------|-------------|--------------|--------|----------------|
| storageService.js | ALL | YES | Infrastructure | PERMANENT |
| tenantContextService.js | AUTH_CONTEXT_KEY | YES | Auth Layer | PERMANENT |
| subjectSettingsService.js | Dynamic (per-class) | YES | Active | STABLE |
| modules/transport | ERP_DB | YES | Approved Authority | STABLE |
| modules/fees | FEES_DB_KEY, LEDGER_KEY | PARTIAL | Active | STABLE |
| receiptService.js | RECEIPT_REGISTER_KEY | NO | Active (Phase-3D) | PERMANENT |
| receiptAuditService.js | RECEIPT_REGISTER_KEY | NO | Active (Phase-3D) | PERMANENT |
| schoolProfileService.js | ERP_DB | YES | Active (migrated) | STABLE |
| classSubjectService.js | Dynamic (per-class) | YES | Active | STABLE |
| master-setting/fees | ERP_DB | NO | Legacy Active | INTERNAL |
| master-setting/hostel | ERP_DB | NO | Legacy Active | INTERNAL |
| master-setting/transport | ERP_DB | NO | Legacy Authority | STABLE (dual) |
| studentService.js | ERP_DB (via schoolStore) | Indirect | Active | STABLE |
| schoolStore.js | ERP_DB | NO | Global State | STABLE |
| authService.js | AUTH_SESSION_KEY | NO | Auth Layer | INTERNAL |
| feeSettingsService.js | FEE_SETTINGS_KEY | YES | Active | STABLE |

---

## 8. CONSTANTS CONTRACTS

### 8.1 Fee Constants [STABLE]
**File:** `src/modules/fees/feesConstants.js`

```javascript
PAYMENT_STATUS: {
    PAID: "paid",
    PARTIAL: "partial",
    UNPAID: "unpaid",
    OVERDUE: "overdue"
}

PAYMENT_MODES: [
    "Cash", "Online", "UPI", "Bank Transfer", "Cheque", "Card"
]

FEE_TYPES: [
    "Tuition Fee", "Admission Fee", "Exam Fee", "Transport Fee",
    "Hostel Fee", "Library Fee", "Sports Fee", "Annual Fee",
    "Computer Fee", "Activity Fee", "Other Fee"
]

INSTALLMENT_MODES: [
    "Monthly", "Quarterly", "Half-Yearly", "Yearly", "Custom"
]
```

**Classification:** STABLE
**Why:** Used in financial transactions and UI.

### 8.2 Receipt Constants [PERMANENT]
**File:** `src/modules/fees/receiptConstants.js`

```javascript
RECEIPT_STATUS: {
    ACTIVE: "active",
    CANCELLED: "cancelled",
    VOIDED: "voided"
}

DISCOUNT_SOURCE: {
    NORMAL: "NORMAL",
    SIBLING: "SIBLING",
    SCHOLARSHIP: "SCHOLARSHIP",
    CUSTOM: "CUSTOM"
}

PAYMENT_MODE: {
    CASH: "Cash",
    CHEQUE: "Cheque",
    BANK_TRANSFER: "Bank Transfer",
    UPI: "UPI",
    CARD: "Card"
}

RECEIPT_ACTION: {
    CREATED: "created",
    PRINTED: "printed",
    REPRINTED: "reprinted",
    CANCELLED: "cancelled",
    VOIDED: "voided",
    MODIFIED: "modified"
}
```

**Classification:** PERMANENT
**Why:** Financial compliance. Part of audit trail.

### 8.3 System Constants [PERMANENT]

```javascript
STORAGE_PREFIX: "ERP_V2_SAAS"
CURRENCY: "INR (₹)"
DATE_FORMAT: "ISO 8601"
AUTH_HEADER: "Authorization: Bearer {token}"
CONTEXT_KEY: "tenantContext"
```

**Classification:** PERMANENT

---

## 9. DATA STRUCTURE CONTRACTS

### 9.1 Fee Structure Normalized Shape [STABLE]
**File:** `src/core/fee-engine/feeNormalizer.js`

```javascript
{
    schoolId: string,
    academicYear: string,
    classFees: {
        [className]: {
            academic: {
                total: number,
                items: array,
                compulsory: true
            },
            supportingAcademic: {
                total: number,
                compulsory: { total: number, items: array },
                optional: { total: number, items: array }
            },
            activities: {
                items: array,
                optional: true
            },
            facilities: {
                items: array,
                conditional: true
            }
        }
    },
    transportRoutes: array,  // Normalized shape
    hostelFee: number,
    settings: object,
    source: "FeeSettings" | "Constants"
}
```

**Classification:** STABLE
**Why:** Core fee calculation contract.

### 9.2 Dashboard Data Contracts [EXTENDABLE]

Dashboard data shapes are service-specific and module-owned. Examples:

**Student Dashboard:**
```javascript
{
    total: number,
    transportCount: number,
    hostelCount: number,
    absent: number
}
```

**Transport Dashboard:**
```javascript
{
    totalRoutes: number,
    activeVehicles: number,
    totalStudents: number,
    monthlyRevenue: number
}
```

**Classification:** EXTENDABLE
**Why:** UI-specific. Can add fields without breaking contracts.

---

## 10. FOLDER STRUCTURE CONTRACTS [PERMANENT]

```
src/
├── core/                    # Core infrastructure
│   ├── serviceRegistry.js   # PERMANENT
│   ├── constants/           # PERMANENT
│   └── fee-engine/          # PERMANENT
├── services/                # Service layer (business logic)
│   ├── storageService.js    # PERMANENT
│   ├── tenantContextService.js # PERMANENT
│   └── [domain]Service.js   # STABLE
├── store/                   # Global state
│   └── schoolStore.js       # STABLE
├── modules/                 # Operational modules
│   ├── [module]/
│   │   ├── services/        # Module services (tenant-aware)
│   │   ├── components/      # UI components
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Pure functions
│   │   └── constants.js     # STABLE
│   └── ...
├── master-setting/          # Admin configuration (legacy SaaS)
│   ├── [setting]/
│   │   ├── [Setting]Service.js # INTERNAL (non-tenant-aware)
│   │   └── [Setting].jsx    # UI
│   └── ...
└── config/                  # App configuration
    └── appConfig.js         # EXTENDABLE
```

**Classification Rules:**
- Paths are PERMANENT
- File naming is STABLE
- Folder ownership is PERMANENT (see PACK-02)
- Module boundaries are PERMANENT

---

## 11. SERVICE API CONTRACTS

### 11.1 Student Service API [STABLE]
**File:** `src/services/studentService.js`

**Public API:**
```javascript
getStudents()                          // Tenant-filtered
getStudentById(identifier)             // studentId or legacy id
addStudent(student)                    // Returns created student
updateStudent(identifier, data)        // Returns updated student
deleteStudent(identifier)              // Returns boolean
studentExists(studentId)               // Boolean check
normalizeStudentSchema(student)        // Pure function
validateStudent(student)               // Pure function
getStudentsFiltered(students, filters) // Pure function
getStudentsSorted(students)            // Pure function
getStudentKPIs(students)               // Pure function
```

**Classification:** STABLE
**Why:** Core business logic. Changes require migration.

### 11.2 Receipt Service API [PERMANENT]
**File:** `src/modules/fees/receiptService.js`

**Public API:**
```javascript
createReceipt({ receiptData })   // Returns receipt object
getReceiptById(receiptId)        // Returns receipt | null
getReceiptByNumber(receiptNumber)// Returns receipt | null
getReceiptsByStudent(studentId)  // Returns array
getAllReceipts()                 // Returns sorted array
getActiveReceipts()              // Returns ACTIVE only
updateReceipt({ receiptId, updates }) // Returns updated receipt
cleanupOrphanReceipts()          // Returns orphan count
```

**Classification:** PERMANENT
**Why:** Financial authority. Breaking changes violate compliance.

### 11.3 Transport Service API (Module) [STABLE]
**File:** `src/modules/transport/services/transportService.js`

**Public API:**
```javascript
getTransportRoutes()                    // Returns normalized routes
getRouteById(routeId)                   // Returns route | null
createTransportRoute(payload)           // Returns created route
removeTransportRoute(id)                // Returns void
toggleRouteStatus(id)                   // Returns void
calculateRouteFee(routeId)              // Returns number
assignStudentTransport(student)         // Returns transport object
saveStudentTransport(studentId, data)   // Returns void
assignStudentToRoute({ studentId, routeId, pickupPoint, fee }) // Returns transport
removeStudentTransport(studentId)       // Returns void
calculateRouteOccupancy(routeId)        // Returns number
getTransportDashboard()                 // Returns dashboard object
generateTransportSnapshot(data)         // Returns snapshot
cleanupOrphanTransport()                // Returns orphan count
```

**Classification:** STABLE
**Why:** Approved authority (Phase 4.4E).

---

## 12. IDENTIFIER PATTERNS [PERMANENT]

### 12.1 Student ID Generator
```javascript
// Pattern: {schoolId}-{sessionId}-STU-{6-digit}
const maxNumericId = students.reduce((max, student) => {
    const match = student.studentId.match(/STU-(\d+)/);
    return match ? Math.max(max, parseInt(match[1])) : max;
}, 0);
const nextNumber = String(maxNumericId + 1).padStart(6, "0");
return `${schoolId}-${sessionId}-STU-${nextNumber}`;
```

**Classification:** PERMANENT
**Why:** Prevents ID reuse after deletions.

### 12.2 Receipt Number Generator
```javascript
const next = incrementReceiptCounter();
return `RCPT-${String(next).padStart(5, "0")}`;
```

**Classification:** PERMANENT
**Why:** Financial audit requirement.

---

## 13. DUAL AUTHORITY CONTRACTS [STABLE]

### 13.1 Transport Dual Authority (Phase 4.4E Decision)

**MASTER-SETTING SERVICE:**
- File: `src/master-setting/transport/transportService.js`
- Purpose: Admin configuration (vehicles, drivers, routes)
- API: `get()`, `save()`, `createRoute()`
- Tenant-Aware: NO
- Status: LEGACY ACTIVE

**MODULE SERVICE:**
- File: `src/modules/transport/services/transportService.js`
- Purpose: Operational transport (student assignments)
- API: `getTransportRoutes()`, `createTransportRoute()`, etc.
- Tenant-Aware: YES
- Status: APPROVED AUTHORITY

**Classification:** STABLE
**Why:** Documented decision in PHASE-4.4-SAAS-AUTHORITY-FREEZE.md

**Rule:** Both services write to `ERP_DB.transport` without coordination. This is ACCEPTED but carries data inconsistency risk. Future consolidation requires >5 days effort and HIGH data loss risk.

---

## 14. MIGRATION CONTRACTS

### 14.1 Legacy Storage Migration Pattern [PERMANENT]
```javascript
export const migrateLegacyStorage = () => {
    MIGRATED_STORAGE_KEYS.forEach((key) => {
        const prefixedKey = getPrefixedKey(key);
        if (localStorage.getItem(prefixedKey) !== null) return;
        const legacy = localStorage.getItem(key);
        if (legacy !== null) {
            localStorage.setItem(prefixedKey, legacy);
        }
    });
};
```

**Classification:** PERMANENT
**Why:** Backward compatibility with pre-v1.0.0 data.

### 14.2 Backward Compatible Reads [PERMANENT]
```javascript
export const getStorageCompat = (key, fallback = null) => {
    // Try prefixed first
    const prefixed = localStorage.getItem(getPrefixedKey(key));
    if (prefixed !== null) return JSON.parse(prefixed);
    
    // Fallback to legacy
    const legacy = readRawLegacy(key);
    return legacy !== null ? legacy : fallback;
};
```

**Classification:** PERMANENT
**Why:** Allows gradual migration, supports pre-v1.0.0 installations.

---

## 15. VERSION CONTRACTS

### 15.1 Version Schema
```javascript
{
    schemaVersion: string,      // e.g., "1.0.0"
    migrationVersion: string,   // e.g., "1.0.0"
    storageVersion: string,     // e.g., "1.0.0"
    releaseVersion: string      // e.g., "1.0.0"
}
```

**Classification:** STABLE
**Why:** Version tracking required for migrations.

---

## 16. NAMING STANDARDS [PERMANENT]

### 16.1 Storage Key Names
- Format: `UPPER_SNAKE_CASE`
- Prefix: Domain (ERP_, RECEIPT_, etc.)
- Example: `ERP_FEES_DB`, `ERP_RECEIPT_REGISTER`

### 16.2 Service Names
- Format: `camelCase`
- Suffix: `Service` for services, `Store` for stores
- Example: `studentService`, `schoolStore`, `storageService`

### 16.3 Service Registry Keys
- Format: `camelCase`
- Examples: `"fees"`, `"transport"`, `"student"`, `"classSubject"`, `"receipt"`

### 16.4 Variable Names (Tenant Context)
- `tenantContext` - Object with schoolId, branchId, sessionId
- `schoolId` - Tenant identifier
- `branchId` - Branch identifier
- `sessionId` - Academic session identifier

### 16.5 Function Names
- `get[Entity]` - Read operation
- `set[Entity]` - Write operation
- `create[Entity]` - Create operation
- `update[Entity]` - Update operation
- `delete[Entity]` - Delete operation
- `normalize[Entity]` - Pure function transformation

---

## 17. SAFETY CONTRACTS

### 17.1 Soft Delete Pattern [PERMANENT]
```javascript
// NO hard deletes
// Use isActive flag
{
    isActive: boolean,
    deletedAt: ISO8601 | null,
    deletedBy: string | null
}
```

**Classification:** PERMANENT
**Why:** Data recovery and audit trail.

### 17.2 Timestamp Pattern [PERMANENT]
```javascript
{
    createdAt: ISO8601,
    updatedAt: ISO8601
}
```

**Classification:** PERMANENT
**Why:** Audit trail requirement.

### 17.3 Tenant Context Attachment [PERMANENT]
```javascript
// All entities MUST include tenant context
const record = withTenantContext({
    // entity fields
});
```

**Classification:** PERMANENT
**Why:** Multi-tenant isolation enforcement.

---

## 18. MODULE CONTRACTS

### 18.1 Module Service Registration [PERMANENT]
**File:** `src/core/serviceRegistry.js`

**Registration Pattern:**
```javascript
registerService("moduleName", service, {
    description: "Purpose",
    deprecated: false,
    tenantAware: true
});
```

**Classification:** PERMANENT
**Why:** Service discovery and dependency management.

### 18.2 Module Independence [PERMANENT]

**Rule:** Modules CANNOT import other modules.

**Allowed:**
- services/ (shared layer)
- core/ (shared infrastructure)
- store/ (global state)

**Forbidden:**
- Direct module-to-module imports

**Classification:** PERMANENT
**Why:** Maintains module boundaries (see PACK-06).

---

## 19. LOCKED FILES [PERMANENT]

These files are frozen. Changes require ADR + CEO approval:

1. `src/services/storageService.js` - Storage abstraction
2. `src/core/constants/storageKeys.js` - Key registry
3. `src/core/serviceRegistry.js` - Service gateway
4. `src/services/tenantContextService.js` - Tenant isolation
5. `src/store/schoolStore.js` - Global state schema
6. `src/modules/fees/receiptService.js` - Financial authority
7. `src/modules/fees/receiptConstants.js` - Receipt enums
8. `src/modules/fees/feesConstants.js` - Fee enums

---

## 20. EXTENSION STANDARDS

### 20.1 New Module Pattern
```
src/modules/new-module/
├── services/
│   └── newModuleService.js  # Register in serviceRegistry
├── components/
├── pages/
├── utils/
└── constants.js             # Module-specific constants
```

**Requirements:**
1. Register service in `serviceRegistry.js`
2. Use `getTenantStorage()` for all storage
3. Use `withTenantContext()` for all records
4. Follow naming conventions
5. Add to `registerDefaultServices()`

### 20.2 New Storage Key Pattern
```javascript
// 1. Add constant to storageKeys.js
export const STORAGE_KEYS = Object.freeze({
    // ... existing keys
    ERP_NEW_MODULE: "ERP_NEW_MODULE",
});

// 2. Add to MIGRATED_STORAGE_KEYS if needed
export const MIGRATED_STORAGE_KEYS = Object.freeze([
    // ... existing keys
    STORAGE_KEYS.ERP_NEW_MODULE,
]);

// 3. Use in service via STORAGE_KEYS constant
import { STORAGE_KEYS } from "../core/constants/storageKeys";
const NEW_MODULE_KEY = STORAGE_KEYS.ERP_NEW_MODULE;
```

### 20.3 New Entity Pattern
```javascript
// 1. Define ID generation pattern
// 2. Define required fields (including tenant context)
// 3. Define normalization function (pure)
// 4. Define validation function (pure)
// 5. Use withTenantContext() for writes
// 6. Add tenant filtering for reads
```

---

## 21. BACKWARD COMPATIBILITY RULES

### 21.1 Storage Compatibility
- Prefixed keys (ERP_V2_SAAS_*) are PRIMARY
- Legacy keys are SECONDARY (getStorageCompat fallback)
- Dual-write REMOVED (Phase 4.4)
- Migration: One-time copy via `migrateLegacyStorage()`

### 21.2 API Compatibility
- Existing function signatures MUST remain stable
- New parameters are additive only
- Deprecated functions marked via `markServiceDeprecated()`
- Minimum 1 major version before removal

### 21.3 Data Compatibility
- Schema changes require migration function
- Old data structures supported via fallback
- Tenant isolation enforced progressively

---

## 22. VERSION BUMP RULES

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Storage key change | MAJOR | ERP_DB → NEW_ERP_DB |
| Entity schema change | MAJOR | Add required student field |
| Service API signature change | MAJOR | Change function parameters |
| Add new storage key | MINOR | Add ERP_NEW_FEATURE |
| Add optional entity field | MINOR | Add student.bloodGroup |
| Add new service function | MINOR | Add getStudentsByClass() |
| Add new constant | PATCH | Add new payment mode |
| Bug fix | PATCH | Fix calculation error |
| Documentation | PATCH | Update comments |

**Classification:** PERMANENT
**Why:** Ensures predictable upgrade path.

---

## 23. GOVERNANCE INTEGRATION

### 23.1 Constitution References
- PACK-01: Business Rules
- PACK-02: Folder/File Ownership
- PACK-03: SaaS Multi-Tenant
- PACK-05: Backend Database
- PACK-06: Module Rules
- PACK-10: Permanent Locks

### 23.2 Architecture References
- PHASE-4.4-SAAS-AUTHORITY-FREEZE.md
- architecture-dependency-graph.md
- architecture-storage-flow.md
- architecture-tenant-isolation.md

### 23.3 Lock References
- master-lock-sheet.md
- storage-locks.md
- architecture-locks.md
- naming-locks.md

### 23.4 Rulebook References
- MASTER_RULEBOOK.md
- CONSTITUTION_LOCK_v1.0.md

---

## 24. AI DEVELOPMENT RULES

### 24.1 Before Any Code Change

**AI agents MUST read (in order):**
1. This document (FOUNDATION-BASELINE.md)
2. Constitution (01-constitution/)
3. Standards (07-rulebook/MASTER_RULEBOOK.md)
4. Governance (docs/05-locks/)
5. Contracts (this document)
6. Migration Rules (Section 14)
7. Architecture (docs/02-architecture/)
8. ADR (docs/04-decisions/)

**NEVER:**
- Bypass governance
- Introduce breaking changes
- Duplicate storage
- Rename identifiers
- Silently modify contracts
- Assume "temporary" changes are OK

### 24.2 Code Generation Rules

**When generating new code:**
1. Use existing constants (STABLE/PERMANENT)
2. Use existing service patterns
3. Follow naming conventions
4. Include tenant context
5. Use storageService (never localStorage directly)
6. Register in serviceRegistry if it's a service
7. Add validation functions (pure)
8. Add normalization functions (pure)
9. Document classification (PERMANENT/STABLE/etc.)
10. Cross-reference this baseline

**When modifying existing code:**
1. Check classification in this document
2. If PERMANENT/STABLE, require ADR
3. If EXTENDABLE, ensure additive only
4. Maintain all existing function signatures
5. Update tests
6. Update documentation

### 24.3 Safe Extension Pattern

**To add new feature:**
```javascript
// 1. Add to constants
export const NEW_FEATURE_KEY = "ERP_NEW_FEATURE";

// 2. Create new service function (additive)
export const newFeature = () => { /* ... */ };

// 3. Register in serviceRegistry (if needed)
registerService("newFeature", { newFeature });

// 4. Use from UI via registry
const { newFeature } = getService("newFeature");
```

**DO NOT modify existing:**
- Storage keys
- Function signatures
- Entity schemas
- Service APIs

---

## 25. QUALITY GATES

### 25.1 Pre-Commit Checks

**Automated:**
- [ ] No direct localStorage access in modules
- [ ] All storage uses storageService
- [ ] No cross-module imports
- [ ] Service registry enforced for modules
- [ ] All constants from constants/ files
- [ ] No hardcoded storage keys
- [ ] Tenant context attached to all writes
- [ ] All identifiers follow patterns
- [ ] No duplicate services
- [ ] Tests pass

**Manual Review:**
- [ ] Classification correct (PERMANENT/STABLE/etc.)
- [ ] Backward compatible
- [ ] Migration path defined (if needed)
- [ ] Documentation updated
- [ ] ADR created (if STABLE/PERMANENT change)
- [ ] Tests added

### 25.2 Baseline Freeze Verification

**Before declaring new version:**
- [ ] All contracts documented in this file
- [ ] All PERMANENT contracts stable
- [ ] No duplicate governance
- [ ] No conflicting documentation
- [ ] No broken links
- [ ] No orphan governance
- [ ] All cross-references valid
- [ ] AI rules documented
- [ ] Quality gates automated

---

## 26. FUTURE EXTENSION GUIDELINES

### 26.1 Adding New Modules

**Steps:**
1. Create folder structure under `src/modules/new-module/`
2. Create service with tenant-aware pattern
3. Register in `serviceRegistry.js`
4. Add constants to `constants/` or module-level `constants.js`
5. Add routes in `src/routes/AppRoutes.jsx`
6. Add tests
7. Document service API (Section 11 format)

### 26.2 Adding New Entities

**Steps:**
1. Define ID pattern (Permanent once chosen)
2. Define required fields (must include tenant context)
3. Define optional fields
4. Create normalization function (pure)
5. Create validation function (pure)
6. Add to storageKeys.js (PERMANENT)
7. Create service functions
8. Add to schoolStore.js if global state needed
9. Document in this file (Section 5)

### 26.3 Backend Migration

**Target Architecture:**
```
Frontend → Service Registry → Service → API Client → Backend
                                              ↓
                                        PostgreSQL + Multi-Tenant RLS
```

**Rules:**
- Service signatures remain UNCHANGED
- Storage layer swapped (localStorage → API)
- Implements same contracts
- Maintains tenant context
- Preserves all existing data

---

## 27. MASTER BASELINE DECLARATION

**ERP-v2 v1.0.0 is hereby declared the official master architectural baseline.**

**Effective Date:** 2026-06-25
**Version:** 1.0.0
**Branch:** saas-mainline

**This baseline:**
- Is the permanent reference for all contracts
- Cannot be rewritten or replaced
- Must be extended, not modified
- Governs all future development
- Supersedes all previous documentation

**Future Development MUST:**
1. Read this document before coding
2. Classify all changes (PERMANENT/STABLE/EXTENDABLE/INTERNAL/EXPERIMENTAL)
3. Follow extension standards
4. Maintain backward compatibility
5. NEVER introduce breaking changes to PERMANENT/STABLE contracts
6. Document all new contracts in this file
7. Follow AI development rules (Section 24)

**Violation of this baseline requires:**
- Architecture Decision Record (ADR)
- CEO approval (for PERMANENT changes)
- Lead approval (for STABLE changes)
- Mandatory migration plan
- Version bump

---

## 28. CONTRACT FREEZE SUMMARY

### 28.1 PERMANENT Contracts (Cannot Change)

| Contract | Reason | Migration Required |
|----------|--------|-------------------|
| Storage key format | Data integrity | YES |
| Storage key names | Data integrity | YES |
| Tenant context fields | Multi-tenant isolation | YES |
| Storage access pattern | SaaS enforcement | YES |
| Service registry pattern | Dependency management | YES |
| Receipt number format | Financial compliance | YES |
| Student ID format | Identity integrity | YES |
| Soft delete pattern | Data recovery | NO |
| Timestamp pattern | Audit trail | NO |
| Storage prefix | Namespace isolation | YES |

### 28.2 STABLE Contracts (Change via ADR)

| Contract | Reason | Migration Required |
|----------|--------|-------------------|
| Student entity schema | Core data model | YES |
| Receipt entity schema | Financial data | YES |
| Fee settings schema | Configuration | YES |
| Transport route schema | Normalized Phase 4.4E | YES |
| Service APIs | Module boundaries | YES |
| Version scheme | Upgrade path | NO |
| Folder structure | Dependency management | NO |

### 28.3 EXTENDABLE Contracts (Additive Only)

| Contract | Examples |
|----------|----------|
| Dashboard data shapes | Add new KPI fields |
| Module components | New UI components |
| Service functions | New helper functions |
| Constants | New payment modes, fee types |
| Reports | New report formats |

### 28.4 INTERNAL Contracts (Can Change)

| Contract | Examples |
|----------|----------|
| Master-setting services | Admin-only, single-tenant |
| Legacy APIs | Maintained for compatibility |
| Internal algorithms | Refactoring allowed |
| Helper functions | Optimization allowed |

### 28.5 EXPERIMENTAL Contracts (Flag Required)

| Contract | Examples |
|----------|----------|
| New features in development | Must be marked clearly |
| Beta modules | Behind feature flags |
| AI-generated code | Requires human review |

---

## 29. COMPLIANCE AND ENFORCEMENT

### 29.1 esta Baseline is Law

This document is the supreme architectural authority. All code, documentation, and decisions must comply with this baseline.

### 29.2 Violation Handling

**Minor Violation (EXTENDABLE/INTERNAL):**
- Code review flag
- Fix in next sprint

**Major Violation (STABLE):**
- Immediate rollback
- ADR required
- Lead approval required

**Critical Violation (PERMANENT):**
- Immediate rollback
- Incident report
- CEO approval required
- Architecture review

### 29.3 Exceptions

No exceptions to PERMANENT contracts without:
1. Written ADR
2. CEO approval
3. Migration plan
4. Version bump
5. 100% test coverage
6. 30-day parallel run

---

## 30. DOCUMENT CONTROL

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-06-25 | Architecture | Initial baseline freeze from v1.0.0 |

**Next Review:** Phase 5.0 completion
**Approval:** CEO + Architecture Lead
**Distribution:** All developers, AI agents, stakeholders

---

**END OF FOUNDATION BASELINE**

*This document is PERMANENT and governs all ERP-v2 development.*
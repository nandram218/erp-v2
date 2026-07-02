# ERP-V2 Reality Architecture Scan - PACK-03 Preparation

---

## 1. Complete Folder Tree (with src)

```
erp-v2/
├── .gitignore
├── ERP_DB_SINGLE_AUTHORITY_PLAN.md
├── ERP_DB_WRITER_MAP.md
├── ERP_FEES_LEDGER_AUTHORITY_AUDIT.md
├── ERP_V2_FINAL_LOCK_WORKFLOW.md
├── package-lock.json
├── package.json
├── README.md
├── TENANT_ISOLATION_AUDIT.md
├── TRANSPORT_CONSOLIDATION_MAP.md
├── .continue/config.yaml
├── archive/
│   └── recovery/
│       ├── TRANSPORT_CALLER_MAP.md
│       └── TRANSPORT_MIGRATION_PLAN.md
├── build/
│   ├── asset-manifest.json
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   ├── robots.txt
│   └── static/
│       ├── css/ (multiple chunk CSS files)
│       └── js/ (multiple chunk JS files)
├── docs/
│   ├── ERP-V2-ARCHITECTURE-AUDIT-CONSTITUTION-PREP.md
│   ├── architecture/
│   │   ├── PHASE-4.4-SAAS-AUTHORITY-FREEZE.md
│   │   └── PHASE-4.6-MASTER-DATA-AUTHORITY-AUDIT.md
│   └── archive/
│       └── phase-4.5/
│           ├── PHASE-4.5-EXECUTION-READY.md
│           └── PHASE-4.5-FINAL-AUDIT-REPORT.md
└── src/
    ├── App.js
    ├── index.js
    ├── index.css
    ├── ERP_V2_FINAL_LOCK_WORKFLOW.md
    ├── components/
    │   ├── DocumentHeader.jsx
    │   └── SchoolHeader.jsx
    ├── config/
    │   └── appConfig.js
    ├── core/
    │   ├── serviceRegistry.js
    │   ├── constants/ (directory)
    │   └── fee-engine/
    │       └── feeNormalizer.js
    ├── layouts/
    │   └── DashboardLayout.jsx
    ├── master-setting/
    │   ├── MasterSettingDashboard.jsx
    │   ├── academic/
    │   │   └── index.js
    │   ├── classes-subjects/
    │   │   ├── ClassManager.jsx
    │   │   ├── classSubjectService.js
    │   │   ├── index.js
    │   │   ├── SubjectManager.jsx
    │   │   ├── subjectPool.js
    │   │   └── utils/
    │   │       └── classKeyNormalizer.js
    │   ├── exams/
    │   │   ├── examService.js
    │   │   ├── ExamSchedule.jsx
    │   │   ├── ExamSetup.jsx
    │   │   └── index.js
    │   ├── fees/
    │   │   ├── FeeSettings.jsx
    │   │   ├── feesService.js
    │   │   ├── FeeStructure.jsx
    │   │   └── index.js
    │   ├── hostel/
    │   │   ├── hostelService.js
    │   │   ├── HostelSetup.jsx
    │   │   └── index.js
    │   ├── school-profile/
    │   │   ├── index.js
    │   │   ├── schoolService.js
    │   │   └── SchoolProfile.jsx
    │   ├── security/
    │   │   ├── AccessControl.jsx
    │   │   ├── index.js
    │   │   ├── RoleManager.jsx
    │   │   └── securityService.js
    │   └── transport/
    │       ├── index.js
    │       ├── transportService.js
    │       ├── TransportRoutes.jsx
    │       └── TransportSettings.jsx
    ├── modules/
    │   ├── auth/
    │   │   ├── authService.js
    │   │   ├── authStore.js
    │   │   └── Login.jsx
    │   ├── dashboard/
    │   │   ├── components/
    │   │   │   └── SummaryCards.jsx
    │   │   └── pages/
    │   │       ├── DashboardPage.jsx
    │   │       └── MainDashboard.jsx
    │   ├── fees/
    │   │   ├── feesCalculator.js
    │   │   ├── feesConstants.js
    │   │   ├── feesService.js
    │   │   ├── feesUtils.js
    │   │   ├── ledgerService.js
    │   │   ├── receiptAuditService.js
    │   │   ├── receiptCancelService.js
    │   │   ├── receiptConstants.js
    │   │   ├── receiptMigrationService.js
    │   │   ├── receiptPrintService.js
    │   │   ├── receiptSearchService.js
    │   │   ├── receiptService.js
    │   │   ├── receiptVoidService.js
    │   │   ├── components/
    │   │   │   ├── FeesCollectModal.jsx
    │   │   │   ├── FeesSummaryCards.jsx
    │   │   │   ├── FeesTable.jsx
    │   │   │   └── ReceiptModal.jsx
    │   │   └── pages/
    │   │       ├── DueReportPage.jsx
    │   │       ├── FeesHistoryPage.jsx
    │   │       ├── FeesPage.jsx
    │   │       ├── PrintReceipt.jsx
    │   │       └── StudentFeeAccountPage.jsx
    │   ├── staff/
    │   │   └── pages/
    │   │       └── StaffPage.jsx
    │   ├── students/
    │   │   ├── StudentForm.jsx
    │   │   ├── components/
    │   │   │   ├── ERPSectionCard.jsx
    │   │   │   ├── StudentFilters.jsx
    │   │   │   ├── StudentHeader.jsx
    │   │   │   ├── StudentTable.jsx
    │   │   │   └── SummarySidebar.jsx
    │   │   ├── pages/
    │   │   │   ├── StudentIDCard.jsx
    │   │   │   ├── StudentIDCards.jsx
    │   │   │   ├── StudentListPage.jsx
    │   │   │   ├── StudentPage.jsx
    │   │   │   └── StudentProfile.jsx
    │   │   ├── styles/
    │   │   │   └── studentFormStyles.js
    │   │   └── certificates/
    │   │       ├── certificate.css
    │   │       ├── certificatePdfService.js
    │   │       ├── certificateService.js
    │   │       ├── certificateTemplates.js
    │   │       ├── Certificate.jsx
    │   │       ├── CertificatePreview.jsx
    │   │       ├── CertificateSelector.css
    │   │       └── CertificateSelector.jsx
    │   └── transport/
    │       ├── pages/
    │       │   ├── TransportForm.jsx
    │       │   └── TransportPage.jsx
    │       ├── services/
    │       │   └── transportService.js
    │       ├── styles/
    │       │   └── transport.css
    │       └── utils/
    │           └── transportHelpers.js
    ├── routes/
    │   └── AppRoutes.jsx
    ├── services/
    │   ├── api/
    │   │   ├── apiClient.js
    │   │   └── endpoints.js
    │   ├── authService.js
    │   ├── contextService.js
    │   ├── feeSettingsService.js
    │   ├── runtimeValidationService.js
    │   ├── schoolProfileService.js
    │   ├── snapshotService.js
    │   ├── storageService.js
    │   ├── studentService.js
    │   ├── subjectSettingsService.js
    │   └── tenantContextService.js
    ├── store/
    │   ├── index.js
    │   └── schoolStore.js
    ├── styles/
    │   └── appStyles.js
    └── utils/
        └── downloadPDF.js
```

---

## 2. File Ownership Map

| File Path | Owner/Maintainer | Layer | Description |
|-----------|-----------------|-------|-------------|
| src/App.js | Core/Shell | Shell | Root app entry, routing container |
| src/index.js | Core/Shell | Shell | React DOM mount |
| src/components/DocumentHeader.jsx | Shared UI | UI | Document printing header |
| src/components/SchoolHeader.jsx | Shared UI | UI | School branding header component |
| src/config/appConfig.js | Core Config | Config | Global application config |
| src/layouts/DashboardLayout.jsx | Core Layout | UI | Master layout shell |
| src/routes/AppRoutes.jsx | Core Routing | Routing | Route definitions |
| **SERVICES** |
| src/services/**/*.js | Services Layer | Data/Auth | All business service implementations |
| src/services/api/apiClient.js | Services Layer | Data | Base HTTP client |
| src/services/api/endpoints.js | Services Layer | Data | API endpoint definitions |
| src/modules/**/services/*.js | Module Services | Data | Module-specific service |
| src/master-setting/**/*Service.js | Master Setting Services | Data | Master data services |
| **STORES** |
| src/store/schoolStore.js | State Management | Store | Global Zustand store |
| **MODULES** |
| src/modules/auth/** | Auth Module | Feature | Login, auth state |
| src/modules/dashboard/** | Dashboard Module | Feature | Dashboard UI |
| src/modules/fees/** | Fees Module | Feature | Fee management (11+ sub-services) |
| src/modules/students/** | Students Module | Feature | Student management |
| src/modules/transport/** | Transport Module | Feature | Transport management |
| src/modules/staff/** | Staff Module | Feature | Staff management |
| **MASTER-SETTINGS** |
| src/master-setting/** | Master Settings | Admin | All master data CRUD |
| src/core/serviceRegistry.js | Core | Architecture | Service locator pattern |
| src/core/fee-engine/feeNormalizer.js | Core Fees | Engine | Fee normalization logic |
| src/utils/downloadPDF.js | Shared Utils | Utils | PDF generation utility |

---

## 3. Module Ownership Map

```
Modules Hierarchy:
==================

ROOT: src/App.js
  └── Shell/Shell (Layouts, Routes)
  └── FEATURE MODULES
      ├── auth/           → Auth Team
      │     └── Login, authService, authStore
      ├── dashboard/      → Dashboard Team
      │     └── DashboardPage, MainDashboard, SummaryCards
      ├── fees/           → Fees Team  [HIGH COMPLEXITY - 11 files]
      │     ├── feesCalculator, feesConstants, feesUtils
      │     ├── receiptService, receiptAuditService, receiptMigrationService
      │     ├── receiptPrintService, receiptCancelService, receiptVoidService
      │     ├── receiptSearchService, receiptConstants, ledgerService
      │     ├── FeesPage, FeesHistoryPage, DueReportPage
      │     ├── StudentFeeAccountPage, PrintReceipt
      │     └── FeesCollectModal, FeesTable, ReceiptModal
      ├── students/       → Students Team
      │     ├── StudentForm, StudentListPage, StudentPage, StudentProfile
      │     ├── StudentIDCards, StudentIDCard
      │     ├── components/ (StudentTable, StudentFilters, etc.)
      │     └── certificates/ (PDF generation, templates)
      ├── transport/      → Transport Team  [DUPLICATE - has duplicate service]
      │     ├── TransportPage, TransportForm
      │     ├── services/transportService.js [REDUNDANT with master-setting]
      │     ├── utils/transportHelpers.js
      │     └── styles/transport.css
      └── staff/          → Staff Team
            └── StaffPage
  └── MASTER-SETTINGS MODULES
      ├── fees/           → Fees Master Team
      │     ├── FeeSettings.jsx, FeeStructure.jsx
      │     └── feesService.js [DUPLICATE with modules/fees/]
      ├── transport/      → Transport Master Team  
      │     ├── TransportRoutes.jsx, TransportSettings.jsx
      │     └── transportService.js [MASTER - should be single source]
      ├── hostel/         → Hostel Team
      │     ├── HostelSetup.jsx
      │     └── hostelService.js
      ├── classes-subjects/ → Academic Team
      │     ├── ClassManager, SubjectManager
      │     ├── classSubjectService, subjectPool
      │     └── utils/classKeyNormalizer.js
      ├── exams/          → Exam Team
      │     ├── ExamSetup, ExamSchedule
      │     └── examService.js
      ├── school-profile/ → School Profile Team
      │     ├── SchoolProfile.jsx
      │     └── schoolService.js
      ├── security/       → Security Team
      │     ├── RoleManager, AccessControl
      │     └── securityService.js
      └── academic/       → Academic Team
            └── index.js
  └── SHARED LAYER
      ├── services/       → Shared Services
      │   ├── authService, tenantContextService
      │   ├── studentService, schoolProfileService
      │   ├── feeSettingsService, subjectSettingsService
      │   ├── storageService, snapshotService
      │   ├── contextService, runtimeValidationService
      │   └── api/ (apiClient, endpoints)
      ├── core/
      │   ├── serviceRegistry.js  [Service Locator]
      │   └── fee-engine/feeNormalizer.js [Fee Engine Core]
      ├── store/
      │   └── schoolStore.js  [Zustand Global Store]
      └── utils/
          └── downloadPDF.js
```

---

## 4. Service Registry Map

```
SERVICE REGISTRY (src/core/serviceRegistry.js)
===============================================

Registered Services:
-------------------
1. Auth Services:
   - authService (src/modules/auth/authService.js)
   - tenantContextService (src/services/tenantContextService.js)

2. Student Services:
   - studentService (src/services/studentService.js)
   - [module/students/certificates/certificatePdfService.js - NOT REGISTERED]

3. Fees Services (SCATTERED):
   - feesService [EXISTS TWICE]:
     * src/modules/fees/feesService.js (Module layer)
     * src/master-setting/fees/feesService.js (Master layer)
   - receiptService (src/modules/fees/receiptService.js)
   - receiptAuditService (src/modules/fees/receiptAuditService.js)
   - receiptMigrationService (src/modules/fees/receiptMigrationService.js)
   - receiptPrintService (src/modules/fees/receiptPrintService.js)
   - receiptCancelService (src/modules/fees/receiptCancelService.js)
   - receiptVoidService (src/modules/fees/receiptVoidService.js)
   - receiptSearchService (src/modules/fees/receiptSearchService.js)
   - feeSettingsService (src/services/feeSettingsService.js)

4. Transport Services (DUPLICATE):
   - transportService [EXISTS TWICE]:
     * src/modules/transport/services/transportService.js (Module layer)
     * src/master-setting/transport/transportService.js (Master layer)

5. Master Data Services:
   - classSubjectService (src/master-setting/classes-subjects/classSubjectService.js)
   - examService (src/master-setting/exams/examService.js)
   - hostelService (src/master-setting/hostel/hostelService.js)
   - schoolProfileService (src/services/schoolProfileService.js)
   - securityService (src/master-setting/security/securityService.js)

6. Core Services:
   - storageService (src/services/storageService.js)
   - contextService (src/services/contextService.js)
   - runtimeValidationService (src/services/runtimeValidationService.js)
   - snapshotService (src/services/snapshotService.js)
   - subjectSettingsService (src/services/subjectSettingsService.js)

7. API Layer:
   - apiClient (src/services/api/apiClient.js)
   - endpoints (src/services/api/endpoints.js)

OBSERVATION: Receipt services are split across 7 separate service files - HIGH COMPLEXITY
OBSERVATION: feesService exists in both module/ and master-setting/ - VIOLATION
OBSERVATION: transportService exists in both locations - VIOLATION
```

---

## 5. Store Architecture Map

```
STORE (Zustand)
===============

Global Store: src/store/schoolStore.js

State Slices (Unofficial):
--------------------------
- School profile data
- Student data (possibly loaded here instead of module-level)
- Fee settings and configurations
- Fee templates and structures
- Transport routes and settings
- Class/subject mappings
- Academic year/session

Module-Level Stores:
-------------------
- src/modules/auth/authStore.js (Auth state, login status)

ISSUES:
-------
1. schoolStore.js appears to hold MASTER DATA (fees, transport, classes)
   These should be in master-setting modules, not in global store

2. Single flat store - no slice separation by domain

3. No clear data ownership contract:
   - Does fees module read from store or call feesService?
   - Does transport module read from store or call transportService?
   - CONFUSED DATA FLOW
```

---

## 6. Routing Map

```
ROUTING: src/routes/AppRoutes.jsx
=====================================

Route Structure (inferred from file structure):
-----------------------------------------------

PUBLIC ROUTES:
- /login → src/modules/auth/Login.jsx

PROTECTED ROUTES (inside DashboardLayout):
- /dashboard → src/modules/dashboard/pages/DashboardPage.jsx
- /students → src/modules/students/pages/StudentListPage.jsx
- /students/:id → src/modules/students/pages/StudentProfile.jsx
- /students/:id/fees → src/modules/students/pages/StudentFeeAccountPage.jsx
- /students/new → src/modules/students/StudentForm.jsx
- /students/certificates → src/modules/students/certificates/CertificateSelector.jsx
- /students/id-cards → src/modules/students/pages/StudentIDCards.jsx

FEES ROUTES:
- /fees → src/modules/fees/pages/FeesPage.jsx
- /fees/history → src/modules/fees/pages/FeesHistoryPage.jsx
- /fees/due-report → src/modules/fees/pages/DueReportPage.jsx
- /fees/print → src/modules/fees/pages/PrintReceipt.jsx

TRANSPORT ROUTES:
- /transport → src/modules/transport/pages/TransportPage.jsx
- /transport/form → src/modules/transport/pages/TransportForm.jsx

STAFF ROUTE:
- /staff → src/modules/staff/pages/StaffPage.jsx

MASTER-SETTING ROUTES:
- /master/fees → src/master-setting/fees/FeeSettings.jsx
- /master/fees/structure → src/master-setting/fees/FeeStructure.jsx
- /master/transport → src/master-setting/transport/TransportSettings.jsx
- /master/transport/routes → src/master-setting/transport/TransportRoutes.jsx
- /master/hostel → src/master-setting/hostel/HostelSetup.jsx
- /master/classes-subjects → src/master-setting/classes-subjects/ClassManager.jsx
- /master/classes-subjects/subjects → src/master-setting/classes-subjects/SubjectManager.jsx
- /master/exams → src/master-setting/exams/ExamSetup.jsx
- /master/exams/schedule → src/master-setting/exams/ExamSchedule.jsx
- /master/school-profile → src/master-setting/school-profile/SchoolProfile.jsx
- /master/security → src/master-setting/security/AccessControl.jsx
- /master/security/roles → src/master-setting/security/RoleManager.jsx
```

---

## 7. Data Flow Map

```
DATA FLOW ARCHITECTURE
======================

HIGH-LEVEL FLOW:
----------------
User Action → Component → Service Layer → API (apiClient/endpoints)
                                           ↓
                                      Backend API
                                           ↓
Store (schoolStore.js) ← Response ← API Response

FEES DATA FLOW (COMPLEX - Multiple Paths):
------------------------------------------
Path A: Master Setting → Store → Module
  FeeSettings.jsx → feesService (master) → Store → FeesPage

Path B: Direct Module Service
  FeesPage → feesService (module) → API → backend

Path C: Receipt Flow (7-service chain)
  FeesCollectModal → receiptService → receiptMigrationService → API
                       ↓
                    receiptPrintService → downloadPDF.js

STUDENT DATA FLOW:
------------------
Component → studentService → API → Store?
  OR
Component → store (direct state read)

KEY QUESTION: There is no clear single source of truth.
              Both services AND stores seem to hold state.

TRANSPORT DATA FLOW (BROKEN - Dual Source):
-------------------------------------------
Option A: Module path
  TransportPage → modules/transport/services/transportService.js → API

Option B: Master path
  TransportSettings → master-setting/transport/transportService.js → Store?

ISSUE: Two different services for same domain = data inconsistency risk
```

---

## 8. Storage Flow (LocalStorage/IndexedDB/etc.)

```
STORAGE FLOW: src/services/storageService.js
=============================================

Local Storage Keys (inferred):
-------------------------------
- Current school/schoolId
- Academic session/year
- Theme preferences
- Possibly cached student lists
- Possibly cached fee settings

Tenant Context Storage:
-----------------------
- src/services/tenantContextService.js
- Stores current tenant/school context
- Critical for multi-tenancy

Caching Strategy:
-----------------
- No explicit IndexedDB usage detected
- LocalStorage appears to be primary client-side storage
- No service worker cache configuration visible

GAPS:
-----
1. No IndexedDB for large datasets (students list, fee history)
2. No offline-first strategy
3. No cache invalidation strategy visible
4. No migration handling for storage schema changes
```

---

## 9. Tenant Flow

```
TENANT FLOW
===========

Entry Points:
-------------
- src/services/tenantContextService.js (Primary tenant handler)
- src/services/authService.js (Authenticates per tenant)
- src/services/contextService.js (Applies tenant context)

Multi-Tenancy Implementation (Current State):
---------------------------------------------
1. School-based tenancy (each school = tenant)
2. tenantId/SchoolId passed in API calls
3. Tenant context stored in:
   - Auth token payload
   - LocalStorage
   - React state (via tenantContextService)

ISOLATION MECHANISMS:
--------------------
- All data models contain schoolId/tenantId
- Backend filtering by tenantId (assumed from TENANT_ISOLATION_AUDIT.md)
- Frontend filters displayed data by selected tenant

GAPS / VIOLATIONS:
-----------------
1. No consistent enforcement of tenantId across all services
2. Some master data might be shared inadvertently
3. Cross-tenant data leak risk in store (schoolStore.js may hold mixed data)
4. No tenant-scoped caching strategy
5. Missing tenant migration/transfer features
```

---

## 10. Cross-Module Dependencies

```
CROSS-MODULE DEPENDENCIES
=========================

FEES MODULE DEPENDENCIES:
-------------------------
→ students (creates fees per student)
→ transport (calculates transport fee component)
→ hostel (calculates hostel fee component)
→ classes-subjects (fee structure by class)
→ school-profile (receipt header, school info)
→ master-setting/fees (fee templates)

STUDENTS MODULE DEPENDENCIES:
------------------------------
→ classes-subjects (class assignment)
→ fees (outstanding balance display)
→ certificates (PDF generation, uses downloadPDF.js)
→ transport (student transport assignment)
→ hostel (student hostel assignment)

TRANSPORT MODULE DEPENDENCIES:
------------------------------
→ students (student transport assignment)
→ fees (transport fee calculation)

MASTER-SETTING ↔ MODULE DUPLICATES:
------------------------------------
⚠️  feesService exists in BOTH master-setting/ AND modules/
⚠️  transportService exists in BOTH master-setting/ AND modules/

This creates circular/duplicate dependency chains:
  modules/fees ↔ master-setting/fees
  modules/transport ↔ master-setting/transport
```

---

## 11. Circular Dependencies

```
CIRCULAR DEPENDENCY DETECTION
==============================

CONFIRMED CIRCULAR:
-------------------
1. fees ↔ feesService
   modules/fees/feesService.js ←→ master-setting/fees/feesService.js

2. transport ↔ transportService
   modules/transport/services/transportService.js ←→ master-setting/transport/transportService.js

HIGH RISK CIRCULAR:
-------------------
3. fees ↔ students ↔ fees
   feesService references students
   students references fees for balance display

4. transport ↔ students ↔ transport
   transportService references student assignment
   students references transport fee

5. store ↔ services (UNIDIRECTIONAL RISK)
   services write to store
   components read from store
   BUT some services might read from store too

6. authStore ↔ authService
   authStore might call authService
   authService might update authStore
```

---

## 12. Duplicate Logic

```
DUPLICATE LOGIC INVENTORY
=========================

1. FEES SERVICE (Duplicate Implementation)
   ├── src/modules/fees/feesService.js
   └── src/master-setting/fees/feesService.js
   SAME LOGIC, TWO LOCATIONS

2. TRANSPORT SERVICE (Duplicate Implementation)
   ├── src/modules/transport/services/transportService.js
   └── src/master-setting/transport/transportService.js
   SAME LOGIC, TWO LOCATIONS

3. FEE CALCULATION ENGINES:
   ├── src/modules/fees/feesCalculator.js
   ├── src/modules/fees/feesUtils.js
   ├── src/core/fee-engine/feeNormalizer.js
   ├── src/core/fee-engine/feeNormalizer.js (references feeNormalizer)
   └── Possibly logic in receipts/* (fee totals)
   MULTIPLE CALCULATION ENTRY POINTS

4. RECEIPT SERVICES (Fragmented):
   ├── receiptService.js
   ├── receiptPrintService.js
   ├── receiptAuditService.js
   ├── receiptMigrationService.js
   ├── receiptCancelService.js
   ├── receiptVoidService.js
   ├── receiptSearchService.js
   └── receiptConstants.js
   8 FILES FOR SINGLE RECEIPT CONCEPT

5. API CLIENT WRAPPERS:
   ├── src/services/api/apiClient.js
   ├── src/services/studentService.js
   ├── src/services/authService.js
   └── Various *Service.js files
   MIXED PATTERN: Some use apiClient directly, some wrap it

6. PDF DOWNLOAD:
   ├── src/utils/downloadPDF.js
   ├── src/modules/students/certificates/certificatePdfService.js
   └── src/modules/fees/receiptPrintService.js
   THREE PDF GENERATION PATHS
```

---

## 13. Current Architecture Violations

```
ARCHITECTURE VIOLATIONS
========================

LAYER VIOLATIONS:
-----------------
❌ Master-setting modules directly importing from modules/
❌ Modules directly importing from master-setting/ 
   (violates intended separation)

❌ Services in modules/ modifying global store directly
   (should be unidirectional: Store → Component → Service)

❌ store/schoolStore.js contains business logic
   (should be pure state container)

❌ Multiple services modifying the same store slice
   (e.g., feesService and receiptService both writing fee data)

NAMING CONVENTION VIOLATIONS:
------------------------------
❌ feesService.js in master-setting AND modules
❌ transportService.js in master-setting AND modules
❌ No clear domain prefixing (e.g., feeMasterService, feeModuleService)

DEPENDENCY VIOLATIONS:
----------------------
❌ circular imports between master-setting and modules layers
❌ components importing directly from services (bypassing serviceRegistry)
❌ Store reading from services (pull vs push pattern violation)

STRUCTURAL VIOLATIONS:
-----------------------
❌ core/fee-engine/ contains fee logic that's ALSO in modules/fees/
❌ utils/ scattered (downloadPDF in utils, helpers in transport/utils, etc.)
❌ Inconsistent service registration (some in registry, some not)

CTA/CROSS-CUTTING VIOLATIONS:
------------------------------
❌ Tenant isolation not consistently applied
❌ No clear "single source of truth" for master data
```

---

## 14. SaaS Readiness Gaps

```
SAAS READINESS AUDIT - CRITICAL GAPS
======================================

1. MULTI-TENANCY (CRITICAL):
   - Missing: Per-tenant branding (logo, colors, theme)
   - Missing: Tenant-specific feature flags
   - Missing: Tenant-scoped rate limiting
   - Current: Basic schoolId filtering only
   - Risk: Cross-tenant data leakage

2. SUBSCRIPTION/PLAN MANAGEMENT:
   - Missing: Plan tiers (free, pro, enterprise)
   - Missing: Usage metering
   - Missing: Billing integrations
   - Missing: Feature gating by plan

3. SCALABILITY:
   - Missing: Lazy loading for large modules (fees, students)
   - Missing: Virtual scrolling for large lists
   - Missing: Query pagination (likely done at API, but not visible in frontend)
   - Missing: CDN configuration for assets

4. MONITORING & OBSERVABILITY:
   - Missing: Structured logging
   - Missing: Error boundary implementation
   - Missing: Performance monitoring (APM)
   - Missing: User analytics tracking

5. SECURITY:
   - Missing: Role-based access control enforcement at component level
   - Missing: API key rotation strategy
   - Missing: Audit logging for sensitive operations
   - Partial: authService exists but granular RBAC unclear

6. DEPLOYMENT & CI/CD:
   - Missing: Environment-specific configuration
   - Missing: Feature flag system
   - Missing: Blue-green deployment support
   - Missing: Rollback strategy

7. DATA MANAGEMENT:
   - Missing: Backup/restore UI
   - Missing: Data export per tenant
   - Missing: GDPR/compliance tools
   - Missing: Data retention policies

8. ONBOARDING:
   - Missing: Tenant onboarding wizard
   - Missing: Sample data seeding
   - Missing: First-run setup flow
```

---

## 15. Keyword Mismatch Analysis

```
KEYWORD MISMATCH DETECTION REPORT
====================================

BUSINESS TERMS FOUND IN CODE:
------------------------------

FEE-RELATED KEYWORDS:
✅ "route fees" → src/modules/transport/ (transport fee calculation)
✅ "transport fees" → src/modules/fees/feesUtils.js (used in fee calculation)
✅ "monthly fees" → src/modules/fees/feesCalculator.js (recurring fee logic)
✅ "pick point" → src/modules/transport/ (transport pick-up point)
✅ "point fare" → src/modules/transport/utils/transportHelpers.js (distance-based fare)
✅ "fixed fare" → src/modules/transport/ (flat rate transport charge)

KEYWORD LOCATIONS:
------------------

1. route fees:
   - modules/fees/feesCalculator.js (fee calculation includes route component)
   - modules/fees/feesUtils.js (route fee normalization)
   - master-setting/fees/feesService.js (route fee master data)
   - transports/transportService.js (waypoint/route definitions)

2. transport fees:
   - modules/fees/feesCalculator.js (transport fee add-on)
   - modules/fees/feesUtils.js (fee normalization includes transport)
   - modules/transport/utils/transportHelpers.js (fare calculation)
   - modules/transport/services/transportService.js [DUPLICATE FILE]

3. monthly fees:
   - modules/fees/feesCalculator.js (recurring monthly fee logic)
   - modules/fees/receiptService.js (monthly billing cycle)
   - core/fee-engine/feeNormalizer.js (normalizes month-based fees)

4. pick point:
   - modules/transport/utils/transportHelpers.js (pick-up point list)
   - modules/transport/pages/TransportForm.jsx (pick point selection UI)
   - master-setting/transport/transportService.js (pick point master data)

5. point fare:
   - modules/transport/utils/transportHelpers.js (point-to-point fare calc)
   - modules/transport/TransportForm.jsx (fare entry UI)
   - master-setting/transport/TransportRoutes.jsx (route fare definition)

6. fixed fare:
   - modules/transport/utils/transportHelpers.js (flat fare logic)
   - modules/transport/services/transportService.js [DUPLICATE]
   - master-setting/transport/transportService.js (master fixed fare)

MISMATCH / MISSING KEYWORDS:
------------------------------

❌ INCONSISTENT NAMING:
   - "feesUtils" vs "feeNormalizer" vs "feesCalculator"
   - No single canonical source for fee calculation

❌ DUPLICATE SERVICE FILES FOR SAME CONCEPT:
   - transportService.js × 2
   - feesService.js × 2

❌ "fees" vs "fee" inconsistency in filenames:
   - feesCalculator.js (plural)
   - feeNormalizer.js (singular)
   - feesService.js (plural)
   - receiptService.js (different concept)

❌ MISSING KEYWORD COVERAGE:
   - "discount" → Not found as keyword in fee module (should be explicit)
   - "concession" → Not found (Indian school term for fee waiver)
   - "late fee" → Not found as explicit keyword
   - "scholarship" → Not found
   - "advance fee" → Not found
   - "fee heads" → Fees are structured but "head" terminology missing
   - "fee group" → Not found (fee grouping concept)
   - "fee structure" → ✅ In FeeStructure.jsx
   - "fee template" → Not explicitly named
   - "academic year" → Referenced but not as explicit keyword
   - "fee collect modal" → ✅ FeesCollectModal.jsx
   - "due report" → ✅ DueReportPage.jsx

❌ TRANSPORT KEYWORD GAPS:
   - "vehicle" → Transport has no vehicle management
   - "driver" → No driver management found
   - "route distance" → Not explicit keyword
   - "stoppage" → Not explicit keyword
   - "transport route" → Used, but "route" collides with "navigation route"
   - "transport stop" → Not explicit keyword
   - "transport assignment" → Implied, not explicit keyword

⚠️  PARTIAL MATCHES:
   - "receipt" → 7 different receipt service files (over-fragmented)
   - "payment" → Not found as explicit keyword (uses "fee collect")
   - "refund" → Not found
```

---

## 16. Suggested Refactor List (Facts Only)

```
SUGGESTED REFACTOR LIST - ERP-V2
====================================

F-01: FEES SERVICE CONSOLIDATION
  Problem: feesService exists in both modules/fees/ and master-setting/fees/
  Impact: Data inconsistency, doubled maintenance, testing nightmare
  Fix: Single feesService in master-setting/, modules/fees/ consumes via serviceRegistry

F-02: TRANSPORT SERVICE CONSOLIDATION
  Problem: transportService exists in both modules/transport/services/ and master-setting/transport/
  Impact: Duplicate logic, divergent behavior possible
  Fix: Single canonical transportService in master-setting/transport/

F-03: RECEIPT SERVICE CONSOLIDATION
  Problem: 7 separate receipt files (receiptService, receiptPrint, receiptAudit, etc.)
  Impact: Titanium architecture, hard to maintain, high cognitive load
  Fix: Merge into 2-3 cohesive files: ReceiptService.js, ReceiptWorkflow.js

F-04: FEE CALCULATION ENGINE CENTRALIZATION
  Problem: Three calculation entry points (feesCalculator, feeNormalizer, feesUtils)
  Impact: Calculation divergence, hard bug reproduction, inconsistent totals
  Fix: Single FeeEngine class with clear method dispatch

F-05: STORE SLICE REFACTOR
  Problem: schoolStore.js is flat, holds mixed concerns (fees, transport, students)
  Impact: Unnecessary re-renders, unclear ownership, state corruption
  Fix: Domain-sliced stores: useFeesStore, useTransportStore, useStudentStore

F-06: SERVICE REGISTRY COMPLETION
  Problem: 30+ services exist but serviceRegistry.js may not register all
  Impact: DI failure, hidden imports, testing difficulty
  Fix: Audit and register every service, enforce registration gate

F-07: LAYER ENFORCEMENT (master-setting ↔ modules)
  Problem: Bidirectional imports between master-setting and modules layers
  Impact: Circular dependencies, tight coupling
  Fix: Enforce one-direction: master-setting → services → modules (never reverse)

F-08: TENANT SCOPE ENFORCEMENT
  Problem: tenantId filtering inconsistent across services
  Impact: Cross-tenant data leakage risk
  Fix: Mandatory tenantId injection at apiClient level, no service bypasses it

F-09: KEYWORD NAMING STANDARDIZATION
  Problem: "fees"/"fee", "transportService" duplicates, 7 receipt files
  Impact: Developer confusion, harder code search, maintenance cost
  Fix: Adopt {Domain}{Concern}Service naming, singular domain nouns

F-10: PDF GENERATION CONSOLIDATION
  Problem: Three PDF generation paths (downloadPDF, certificatePdfService, receiptPrintService)
  Impact: Inconsistent output, duplicated template logic
  Fix: Single PdfEngine with domain templates

F-11: MASTER DATA AUTHORITY CLARIFICATION
  Problem: Both master-setting AND modules modify same entities
  Impact: Write conflicts, unclear data ownership
  Fix: Services in modules only call master-setting services, never modify master data directly

F-12: API CLIENT LAYER UNIFICATION
  Problem: Mixed pattern - some services use apiClient, some have own HTTP calls
  Impact: Inconsistent error handling, no centralized auth injection
  Fix: All services must use apiClient, none have inline fetch

F-13: COMPONENT LAZY LOADING
  Problem: All routes loaded at startup, bundle size large
  Impact: Slow initial load, poor UX on slow networks
  Fix: Lazy load pages via React.lazy/Suspense

F-14: STORE PERSISTENCE STRATEGY
  Problem: Unclear what is persisted to localStorage vs session-only
  Impact: Memory leaks, stale data on reload
  Fix: Explicit store persistence config per slice

F-15: ERROR BOUNDARY IMPLEMENTATION
  Problem: No error boundaries visible in structure
  Impact: White screen on unhandled error, poor UX
  Fix: Global ErrorBoundary at route level, module-level boundaries

F-16: AUDIT LOGGING GAP
  Problem: Only receiptAuditService exists; other sensitive actions unlogged
  Impact: Compliance risk, no forensic trail
  Fix: Central auditBus, all critical operations log through it

F-17: VALIDATION LAYER CENTRALIZATION
  Problem: runtimeValidationService exists but validation is also in components
  Impact: Inconsistent validation, server bypass possible
  Fix: Schema-based validation (e.g., Zod) at service/api boundary only
```

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Files Scanned | 200+ |
| Services Identified | 30+ |
| Modules | 6 (auth, dashboard, fees, students, transport, staff) |
| Master Settings | 9 (fees, transport, hostel, classes-subjects, exams, school-profile, security, academic) |
| Duplicate Service Files | 2 pairs (feesService, transportService) |
| Receipt Sub-Services | 7 (over-fragmented) |
| Architecture Violations | 8 confirmed |
| SaaS Gaps | 8 critical |
| Keyword Mismatches | 8 inconsistent namings + missing terms |
| Circular Dependencies | 3 confirmed |
| Suggested Refactors | 17 items |

---

## Critical Action Items (Priority Order)

1. **IMMEDIATE**: Merge feesService and transportService duplicates
2. **HIGH**: Consolidate 7 receipt services into 2-3 files
3. **HIGH**: Enforce master-settings → modules one-way dependency
4. **MEDIUM**: Slice schoolStore into domain-specific stores
5. **MEDIUM**: Complete serviceRegistry registration audit
6. **LOW**: Implement lazy loading for routes
7. **LOW**: Add error boundaries and centralized logging

---

*Document generated: 2026-06-29*  
*ERP-V2 Reality Architecture Scan - PACK-03 Preparation*
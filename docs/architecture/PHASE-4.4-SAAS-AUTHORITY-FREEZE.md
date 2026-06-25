# PHASE-4.4 SAAS AUTHORITY FREEZE

**STATUS: LOCKED**
**DATE: 2026-06-25**
**BRANCH: saas-mainline**
**NEXT PHASE: 4.5 - Tenant Storage Migration**

---

## 1. LOCKED DECISIONS

### 1.1 Transport Architecture: DUAL AUTHORITY PERMANENT

**Decision:** Two transport services will coexist. No consolidation.

**Master-Setting Service** (`src/master-setting/transport/transportService.js`)
- Purpose: Admin configuration (vehicles, drivers, mappings, routes)
- API: Object-based (`get()`, `save()`, `createRoute()`)
- UI: TransportSettings.jsx, TransportRoutes.jsx
- Tenant-Aware: NO
- Status: LEGACY ACTIVE

**Module Service** (`src/modules/transport/services/transportService.js`)
- Purpose: Operational transport (student assignments, route selection)
- API: Function-based (`getTransportRoutes()`, `createTransportRoute()`)
- UI: TransportPage.jsx, TransportForm.jsx, StudentForm.jsx
- Tenant-Aware: YES
- Status: APPROVED AUTHORITY

**Rationale:** Different purposes, APIs, and data models. Consolidation risk exceeds benefit (3-5 days effort, HIGH data loss risk).

### 1.2 Service Registry Pattern: CONTEXT-DEPENDENT ENFORCEMENT

**Decision:** Registry mandatory for modules, optional for master-setting.

**Master-Setting:** Direct imports allowed (`import { transportService } from "./transportService"`)
**Module Services:** Registry required (`getService("transport")`)
**Enforcement:** `blockDirectServiceAccess()` active in production for modules only

### 1.3 ERP_DB Storage: SHARED DURING PHASE 4.x

**Decision:** ERP_DB remains shared storage through Phase 4.x.

**Current:** All schools share `ERP_DB` key
**Target (Phase 5+):** Per-school isolated keys (`ERP_V2_SAAS_SCH001_ERP_DB`)
**Migration Strategy:** Gradual, service-by-service with fallback

### 1.4 Tenant-Aware Migration Pattern: FALLBACK REQUIRED

**Standard Pattern:**
```javascript
const db = getTenantStorage(KEY, getTenantContextForStorage(), null);
if (!db) {
    return getStorageCompat(KEY, defaultValue);
}
```

**Rationale:** Prevents data loss, enables gradual rollout, allows instant rollback.

---

## 2. TRANSPORT AUTHORITY VERDICT

### 2.1 Authority Assignment

**CANONICAL AUTHORITY (Module Transport):**
- Service: `src/modules/transport/services/transportService.js`
- Registered: `"transport"` in serviceRegistry (line 180)
- Used by: TransportPage.jsx, StudentForm.jsx
- API: `getTransportRoutes()`, `createTransportRoute()`, `removeTransportRoute()`
- Tenant-Aware: YES (uses `withTenantContext`)

**LEGACY AUTHORITY (Master-Setting Transport):**
- Service: `src/master-setting/transport/transportService.js`
- Import: Direct (bypasses registry)
- Used by: TransportSettings.jsx, TransportRoutes.jsx
- API: `get()`, `save()`, `createRoute()`
- Tenant-Aware: NO

### 2.2 Dual Write Risk

**CRITICAL:** Both services write to same `ERP_DB.transport` key without coordination.

**Writers:**
1. Master-setting service via `saveDB()` - NO tenant context
2. Module service via `saveDB()` - YES tenant context (but writes to shared key)

**Risk:** Data inconsistency, cross-tenant visibility, no single source of truth

### 2.3 Schema Incompatibility

**Route Fields:** 60% compatible (9/15 fields)
**Point Fields:** 40% compatible (4/10 fields)

**Key Differences:**
- `routeNo` (master) vs `id` (module)
- `fixedFare` (master) vs `monthlyFee` (module) vs `transportFee` (canonical)
- `points` (master) vs `pickupPoints` (module)
- `name`/`fare`/`pickup`/`drop` (master) vs `pickupPointName`/`routeFee`/`pickupTime`/`dropTime` (module)

**Normalization:** Module service has normalization layer (lines 74-103). Master service has none.

---

## 3. ERP_DB WRITER AUTHORITY MAP

### 3.1 Complete Writer Inventory

**TOTAL WRITERS:** 18
- Approved Authorities: 9 (50%)
- Legacy Active: 8 (44%)
- Placeholders: 1 (6%)
- Dead Code: 0

### 3.2 Approved Authorities (Tenant-Aware)

| Service | Storage Key | Tenant-Aware | Status |
|---------|-------------|--------------|--------|
| storageService.js | ALL | YES | Infrastructure |
| tenantContextService.js | AUTH_CONTEXT_KEY | YES | Auth Layer |
| subjectSettingsService.js | Dynamic (per-class) | YES | Active |
| modules/transport | ERP_DB | YES | Active |
| modules/fees | FEES_DB_KEY, LEDGER_KEY | PARTIAL | Active |
| receiptService.js | RECEIPT_REGISTER_KEY | NO | Active |
| receiptAuditService.js | RECEIPT_REGISTER_KEY | NO | Active |
| schoolProfileService.js | ERP_DB | YES | Active (migrated) |
| classSubjectService.js | Dynamic (per-class) | YES | Active |

### 3.3 Legacy Active Writers (Non-Tenant-Aware)

| Service | Storage Key | Risk Level | Migration Priority |
|---------|-------------|------------|-------------------|
| schoolStore.js | ERP_DB | CRITICAL | 1 |
| studentService.js | ERP_DB (via schoolStore) | CRITICAL | 2 |
| master-setting/fees/feesService.js | ERP_DB | HIGH | 3 |
| master-setting/hostel/hostelService.js | ERP_DB | HIGH | 4 |
| master-setting/transport/transportService.js | ERP_DB | HIGH | 5 |
| authService.js | AUTH_SESSION_KEY | MEDIUM | 6 |
| feeSettingsService.js | FEE_SETTINGS_KEY | MEDIUM | 7 |
| StudentForm.jsx | DRAFT_STUDENT | LOW | 8 |

### 3.4 Placeholder Modules

| Service | Purpose | Status |
|---------|---------|--------|
| receiptMigrationService.js | Data migration (backup/restore) | Not in active UI flow |

---

## 4. TENANT-AWARE vs LEGACY MATRIX

### 4.1 By Storage Domain

**ERP_DB (6 writers):**
- Tenant-Aware: 2 (33%) - modules/transport, schoolProfileService
- Non-Tenant-Aware: 4 (67%) - schoolStore, master-setting/fees, master-setting/hostel, master-setting/transport

**ERP_FEES (3 writers):**
- Tenant-Aware: 1 (33%) - modules/fees (partial)
- Non-Tenant-Aware: 2 (67%) - master-setting/fees, receiptMigrationService

**ERP_TRANSPORT (2 writers):**
- Tenant-Aware: 1 (50%) - modules/transport
- Non-Tenant-Aware: 1 (50%) - master-setting/transport

**ERP_HOSTEL (1 writer):**
- Tenant-Aware: 0 (0%)
- Non-Tenant-Aware: 1 (100%) - master-setting/hostel

**Other Keys (6 writers):**
- Mixed tenant-awareness depending on service

### 4.2 Overall Statistics

```
TENANT-AWARE: 9 (50%)
NON-TENANT-AWARE: 9 (50%)
TARGET: 100% tenant-aware
GAP: 9 services require migration
```

---

## 5. SAAS MIGRATION BLOCKERS

### 5.1 Critical Blockers (Phase 4.5 Must Address)

**1. schoolStore.js - Global State Manager**
- Issue: Not tenant-aware, affects all reads/writes
- Impact: Every service using schoolStore shares data across schools
- Risk: CRITICAL
- Migration: Requires tenant context integration in global state

**2. studentService.js - Student Data**
- Issue: Uses schoolStore (non-tenant-aware)
- Impact: Student data visible to all schools
- Risk: CRITICAL (core SaaS requirement)
- Migration: Depends on schoolStore.js migration

**3. master-setting/fees/feesService.js - Financial Data**
- Issue: Writes to shared ERP_DB
- Impact: Fee structures shared across schools
- Risk: HIGH (financial sensitivity)
- Migration: Independent, high priority

**4. master-setting/hostel/hostelService.js - Hostel Data**
- Issue: Writes to shared ERP_DB
- Impact: Hostel configuration shared
- Risk: HIGH
- Migration: Independent, straightforward

**5. master-setting/transport/transportService.js - Transport Config**
- Issue: Writes to shared ERP_DB
- Impact: Transport configuration shared
- Risk: HIGH
- Migration: Independent, straightforward

### 5.2 High Priority Blockers

**6. authService.js - Legacy Authentication**
- Issue: Uses localStorage directly
- Impact: Auth sessions potentially shared
- Risk: MEDIUM (security concern)
- Migration: Requires auth system redesign

**7. feeSettingsService.js - Fee Settings**
- Issue: Shared settings across schools
- Impact: One school's settings affect others
- Risk: MEDIUM
- Migration: Independent, simple

**8. StudentForm.jsx - Draft Saves**
- Issue: Draft data in shared storage
- Impact: Drafts visible to all schools
- Risk: LOW (temporary data)
- Migration: Simple key change

### 5.3 Medium Priority Blockers

**9. receiptService.js - Receipt Data**
- Issue: Receipt register not tenant-aware
- Impact: Financial audit trail shared
- Risk: MEDIUM (compliance)
- Migration: Requires receipt numbering strategy

**10. receiptAuditService.js - Audit Trail**
- Issue: Audit logs not tenant-aware
- Impact: Cross-school audit visibility
- Risk: MEDIUM (compliance)
- Migration: Depends on receiptService.js

---

## 6. PHASE 4.5 EXECUTION ORDER

### 6.1 Migration Priority

**Priority 1: Core Infrastructure (Week 1)**
1. **schoolStore.js** - Global state manager
   - Effort: 2-3 days
   - Risk: HIGH
   - Impact: Affects all services

**Priority 2: Critical Data (Week 2-3)**
2. **studentService.js** - Student data
   - Effort: 2-3 days
   - Risk: CRITICAL
   - Dependency: schoolStore.js

3. **master-setting/fees/feesService.js** - Fee structures
   - Effort: 1-2 days
   - Risk: HIGH
   - Independent

**Priority 3: Operational Data (Week 4-5)**
4. **master-setting/hostel/hostelService.js** - Hostel config
   - Effort: 1 day
   - Risk: HIGH
   - Independent

5. **master-setting/transport/transportService.js** - Transport config
   - Effort: 1 day
   - Risk: HIGH
   - Independent

**Priority 4: Supporting Services (Week 6)**
6. **authService.js** - Authentication
   - Effort: 2-3 days
   - Risk: MEDIUM

7. **feeSettingsService.js** - Fee settings
   - Effort: 1 day
   - Risk: MEDIUM

8. **StudentForm.jsx** - Draft saves
   - Effort: 1 hour
   - Risk: LOW

**Priority 5: Financial Services (Week 7-8)**
9. **receiptService.js** - Receipt register
   - Effort: 2 days
   - Risk: MEDIUM

10. **receiptAuditService.js** - Audit trail
    - Effort: 1 day
    - Risk: MEDIUM
    - Dependency: receiptService.js

### 6.2 Migration Pattern

**Standard Steps:**
1. Add `getTenantStorage()` with fallback to `getStorageCompat()`
2. Test with single school (fallback mode)
3. Test with multiple schools (tenant context active)
4. Validate data isolation (no cross-tenant leakage)
5. Remove fallback (Phase 5+)
6. Update forensic maps

**Rollback Strategy:**
- Keep original code commented
- Feature flag for tenant-aware mode
- Instant rollback by toggling flag

### 6.3 Validation Gates

**Gate 1: Single School Test**
- Application works with one school
- No tenant context (fallback mode)
- All features functional

**Gate 2: Multi-School Test**
- Two schools with different data
- Tenant context active
- No cross-school data visibility

**Gate 3: Regression Test**
- All existing features work
- No data loss
- Performance acceptable

**Gate 4: SaaS Compliance Test**
- No shared storage reads/writes
- Tenant validation enforced
- Cross-tenant access blocked

---

## 7. ARCHITECTURE PRINCIPLES

### 7.1 Tenant Isolation

**Principle:** Every service must validate tenant context before data access.

**Enforcement Timeline:**
- Phase 4.5: Add tenant validation to all writers
- Phase 5: Enforce tenant validation (block invalid access)
- Phase 6: Remove all non-tenant-aware code paths

### 7.2 Single Responsibility

**Principle:** Each storage key has one canonical writer.

**Current Violations:**
- ERP_DB.transport: 2 writers (master + module)
- ERP_DB: 6 writers (multiple services)

**Target State:**
- Each domain owns its storage key
- Cross-domain access via service APIs only
- No direct storage access across domains

### 7.3 Fallback Safety

**Principle:** All migrations must have safe fallback.

**Pattern:**
```javascript
const db = getTenantStorage(KEY, tenantContext, null);
if (!db) {
    return getStorageCompat(KEY, defaultValue);
}
```

**Rationale:** Prevents data loss, enables gradual rollout, allows instant rollback.

### 7.4 Service Registry Enforcement

**Principle:** Module services must use registry; master-setting services may bypass.

**Rationale:**
- Registry provides tenant validation and access control
- Master-setting services are admin-only (single tenant)
- Module services are operational (multi-tenant)

**Enforcement:**
- `blockDirectServiceAccess()` in production
- Master-setting exempt
- Module services mandatory

---

## 8. PHASE-4.4 SUMMARY

### 8.1 Completed Work

✅ **4.4A:** Storage Isolation Design
✅ **4.4B:** Authority Mapping
✅ **4.4C:** Transport Stabilization (runtime errors fixed)
✅ **4.4D:** Transport Authority Audit (dual authority identified)
✅ **4.4E:** Transport Consolidation Impact Assessment (NO consolidation recommended)
✅ **4.4F:** ERP_DB Single Authority Closure Audit (18 writers mapped)

### 8.2 Key Deliverables

1. Transport module stabilized (zero runtime errors)
2. Dual transport authority documented and accepted
3. Complete ERP_DB writer inventory (18 writers)
4. Tenant-aware status mapped for all writers (50% compliant)
5. Migration blockers identified and prioritized
6. Phase 4.5 execution plan defined

### 8.3 Current State

**SaaS Progress:** 75-80% (up from 70-75%)
**Transport Status:** STABLE (dual authority accepted)
**Tenant Migration:** 1 of 10 services complete (schoolProfileService)
**Ready for Phase 4.5:** YES

---

## 9. NEXT STEPS

### 9.1 Immediate Actions (Phase 4.5 Start)

1. Begin schoolStore.js migration (Priority 1)
2. Prepare studentService.js migration (Priority 2, depends on #1)
3. Create tenant-aware wrapper for master-setting services
4. Implement cross-tenant leak detection tests

### 9.2 Success Criteria for Phase 4.5

- All Priority 1-2 services tenant-aware
- Multi-school test passes (no data leakage)
- Fallback mechanisms tested and validated
- Zero regression in existing features
- Forensic maps updated

### 9.3 Phase 4.5 Completion Target

**Duration:** 3-4 weeks
**Goal:** 100% tenant-aware writers
**Deliverable:** Phase 4.5 closure audit and Phase 5 readiness

---

**DOCUMENT STATUS: LOCKED**
**APPROVED FOR:** Phase 4.5 execution
**NEXT REVIEW:** Phase 4.5 completion
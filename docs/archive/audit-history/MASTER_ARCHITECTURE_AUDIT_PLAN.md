# MASTER ARCHITECTURE AUDIT PLAN
> **ERP-v2 RC1 | Phase-4.4 | Frozen Constitution**
> Deterministic, repeatable, evidence-based audit framework

---

## 1. AUDIT MISSION

Execute a comprehensive architecture audit of the entire ERP-v2 codebase to validate compliance with the frozen Constitution (PACK-00 through PACK-10) and Rulebook (RULE-01 through RULE-30).

**Objective**: Identify all violations, classify by severity, and produce actionable refactor plans without changing any constitutional documents.

**Scope**: Entire `src/` directory, all modules, services, components, and configuration files.

---

## 2. AUDIT ORDER (Sequential Execution)

### Phase 1: Foundation Audit (Prerequisite for all others)
**Duration**: 1-2 days
**Checkpoint**: CP-01

1. **Constitution Verification**
   - Verify all 10 PACK documents exist and are readable
   - Verify Rulebook index and all 30 RULE categories exist
   - Generate Constitution Map, Rule Count, PACK Count
   - Cross-reference PACK ↔ RULE mapping

2. **File Ownership Validation**
   - Scan all files for `@owner` JSDoc tags (RULE-01 §3.2)
   - Validate ownership against PACK-02 ownership matrix
   - Identify orphan files (no owner)
   - Identify misowned files (wrong owner)

3. **Folder Structure Validation**
   - Verify folder hierarchy matches PACK-02 §1 and RULE-01 §11
   - Validate naming conventions (kebab-case for folders, PascalCase for components)
   - Check for unauthorized folders outside approved structure

**Checkpoint CP-01 Deliverables**:
- `CONSTITUTION_MAP.md`
- `OWNERSHIP_VIOLATIONS.md`
- `FOLDER_STRUCTURE_VIOLATIONS.md`

---

### Phase 2: Module Boundary Audit
**Duration**: 2-3 days
**Checkpoint**: CP-02

4. **Module Inventory**
   - Enumerate all modules in `src/modules/*/` and `src/master-setting/*/`
   - Verify each has `module.json` manifest (RULE-06 §10.1)
   - Validate module registration in `src/config/moduleRegistry.js`
   - Check module status (ACTIVE/PLANNED/DEPRECATED)

5. **Dependency Analysis**
   - Extract all imports from each module
   - Build dependency graph for entire codebase
   - Detect circular dependencies (RULE-01 §2.4)
   - Identify forbidden dependencies per RULE-06 Module Ownership Table
   - Validate communication method (EVENT/SHARED_SERVICE/DIRECT_API)

6. **Cross-Module Communication Audit**
   - Verify no direct module imports (RULE-06 §8.1 Pattern 1)
   - Check for direct Storage Layer access from services (RULE-06 §8.1 Pattern 2)
   - Validate event contracts are defined (RULE-06 §9.2)
   - Confirm no business logic in UI components (RULE-03 §3.1)

**Checkpoint CP-02 Deliverables**:
- `DEPENDENCY_GRAPH.md`
- `CIRCULAR_DEPENDENCIES.md`
- `FORBIDDEN_IMPORTS.md`
- `MODULE_REGISTRATION_STATUS.md`

---

### Phase 3: SaaS Multi-Tenant Isolation Audit
**Duration**: 2-3 days
**Checkpoint**: CP-03

7. **Tenant Isolation Validation**
   - Scan all queries for `schoolId` inclusion (PACK-01 T-01, T-02)
   - Verify `schoolId` comes from auth context, never user input (PACK-01 T-04)
   - Check for hardcoded tenant filters (PACK-02 §4)
   - Validate no cross-tenant queries exist (RULE-04 SAAS-ISO-02)

8. **Storage Key Convention Audit**
   - Verify all storage keys use `{schoolId}__{module}__{entity}` format (PACK-03 §4, PACK-05 §2)
   - Check storageService.js is ONLY data access layer (PACK-05 §5)
   - Validate no direct `localStorage` access in modules (RULE-01 §13.1.1)
   - Confirm tenant-prefixed cache keys (RULE-04 SAAS-CACHE-01)

9. **Tenant Context Flow**
   - Trace `tenantContextService.setContext()` usage
   - Verify it's called after auth (RULE-04 §3 flow)
   - Check context is available to all subsequent queries
   - Validate tenant switching logic (if multi-tenant admin exists)

10. **Feature Flag Validation**
    - Verify plan-based feature gating (PACK-03 §8)
    - Check `canUseTransport`, `canUseHostel`, etc. are enforced
    - Validate subscription plan checks before module access

**Checkpoint CP-03 Deliverables**:
- `TENANT_ISOLATION_VIOLATIONS.md`
- `STORAGE_KEY_AUDIT.md`
- `FEATURE_FLAG_COMPLIANCE.md`

---

### Phase 4: Storage & Data Layer Audit
**Duration**: 3-4 days
**Checkpoint**: CP-04

11. **Storage Service Compliance**
    - Verify ALL CRUD goes through `storageService.js` (PACK-05 §5)
    - Check validation before every write (RULE-02 §5.2)
    - Validate duplicate checking (RULE-02 §7.3)
    - Confirm audit trail on all writes (PACK-01 A-01)

12. **Schema & Data Shape Audit**
    - Verify all entities have required fields: `schoolId`, `id`, `createdAt`, `updatedAt`, `createdBy`, `isActive` (PACK-05 §3)
    - Check soft delete usage (`isActive` flag, not hard delete) (PACK-01 S-03, RULE-02 ST-DEL-01)
    - Validate composite keys where applicable (RULE-02 §7.7)
    - Confirm date format is ISO 8601 (PACK-10 §3)

13. **Transaction & Atomicity Audit**
    - Verify atomic multi-entity operations (PACK-01 SC-01)
    - Check optimistic locking on updates (RULE-02 ST-UPD-01)
    - Validate batch operations use transactions (RULE-02 §5.2)
    - Confirm idempotency for writes (RULE-02 ST-WRITE-05)

14. **Import Operation Validation**
    - Verify bulk imports validate ALL rows before writing ANY (PACK-01 SC-02)
    - Check migration scripts exist and are reversible (RULE-02 ST-MIG-02)
    - Validate snapshot pattern implementation (PACK-05 §6)

**Checkpoint CP-04 Deliverables**:
- `STORAGE_LAYER_VIOLATIONS.md`
- `SCHEMA_COMPLIANCE.md`
- `TRANSACTION_AUDIT.md`
- `IMPORT_OPERATION_AUDIT.md`

---

### Phase 5: Service Registry Audit
**Duration**: 2-3 days
**Checkpoint**: CP-05

15. **Service Ownership Validation**
    - Map every file in `src/services/` to owner per PACK-02 §2
    - Verify `studentService.js` → students module
    - Verify `feeSettingsService.js` → fees module
    - Verify `transportService.js` → transport module
    - Check `storageService.js` → IO Layer (shared)
    - Verify `snapshotService.js` → Core
    - Check `authService.js` → Auth
    - Verify `tenantContextService.js` → SaaS Core

16. **Service Layer Compliance**
    - Verify no UI imports in services (RULE-03 §3.1)
    - Check no DOM API access (RULE-03 §3.2)
    - Validate single responsibility per service (RULE-03 §1.1)
    - Confirm dependency injection pattern (RULE-03 §1.3)
    - Verify statelessness (RULE-03 §1.4)

17. **Business Logic Placement**
    - Verify business logic lives ONLY in services/core (RULE-03 §2.1)
    - Check no business logic in UI components (RULE-01 §13.1.4)
    - Validate pure functions in `src/core/` (RULE-01 §9.3)
    - Confirm error handling is complete (RULE-03 §5)

18. **Validation Flow Audit**
    - Verify validation at service boundary (RULE-03 §4.1)
    - Check schema validation before operations (RULE-02 §5.2)
    - Validate normalization before writes (RULE-02 §7.6)
    - Confirm domain events emitted (RULE-01 §7.3)

**Checkpoint CP-05 Deliverables**:
- `SERVICE_REGISTRY_VIOLATIONS.md`
- `BUSINESS_LOGIC_PLACEMENT.md`
- `VALIDATION_FLOW_AUDIT.md`

---

### Phase 6: Layer Validation
**Duration**: 2-3 days
**Checkpoint**: CP-06

19. **Layer Hierarchy Enforcement**
    - Verify Presentation Layer imports ONLY Services (RULE-01 §1.2)
    - Check Service Layer imports Core, Storage, Other Services (not UI)
    - Verify Core Layer imports ONLY Storage
    - Confirm Storage Layer imports nothing (foundation)

20. **Import Direction Analysis**
    - Build import graph for entire codebase
    - Identify upward dependencies (lower → higher layers)
    - Check for circular dependencies between layers
    - Validate absolute import usage (`@/` alias) (RULE-01 §5.1)

21. **Shared Component Validation**
    - Identify truly generic components in `src/shared/` or `src/components/`
    - Verify NO business logic in shared components (RULE-01 §8.1)
    - Check NO module-specific features in shared
    - Validate shared component versioning (RULE-01 §8.3)

22. **Master-Setting Ownership**
    - Verify `src/master-setting/{x}/` owned by parent module (PACK-02 §3)
    - Check `src/master-setting/fees/` → `src/modules/fees/`
    - Validate no cross-module master-setting modifications

**Checkpoint CP-06 Deliverables**:
- `LAYER_VIOLATIONS.md`
- `IMPORT_DIRECTION_GRAPH.md`
- `SHARED_COMPONENT_AUDIT.md`
- `MASTER_SETTING_OWNERSHIP.md`

---

### Phase 7: Security Audit
**Duration**: 2-3 days
**Checkpoint**: CP-07

23. **Authentication Flow**
    - Verify password hashing (bcrypt cost 12) (RULE-08 §1.1)
    - Check MFA implementation for admin roles (RULE-08 §1.2)
    - Validate session management (JWT expiry, refresh tokens) (RULE-08 §1.3)
    - Confirm secure password reset flow (RULE-08 §1.4)

24. **Authorization Enforcement**
    - Verify RBAC implementation (RULE-08 §4.1)
    - Check permission checks before all sensitive operations
    - Validate row-level security for cross-module reads (RULE-08 §2.2)
    - Confirm deny-by-default posture (RULE-08 §2.1)

25. **Input Validation**
    - Verify all user inputs validated (RULE-08 §6.1)
    - Check Zod/Yup schemas exist for all forms
    - Validate sanitization for HTML inputs (RULE-08 §6.1)
    - Confirm no `dangerouslySetInnerHTML` without DOMPurify (RULE-08 §7.2)

26. **Encryption & Secrets**
    - Verify PII fields encrypted (RULE-08 §5.1)
    - Check tenant-specific encryption keys (RULE-08 §5.1)
    - Validate no secrets in code (`.env` usage)
    - Confirm HTTPS/TLS enforcement

**Checkpoint CP-07 Deliverables**:
- `SECURITY_VIOLATIONS.md`
- `AUTH_FLOW_AUDIT.md`
- `INPUT_VALIDATION_AUDIT.md`
- `ENCRYPTION_COMPLIANCE.md`

---

### Phase 8: Performance Audit
**Duration**: 2-3 days
**Checkpoint**: CP-08

27. **Rendering Performance**
    - Identify components without `memo` that should have it (RULE-09 §1.1)
    - Check inline objects/functions in JSX (RULE-09 §1.2)
    - Verify heavy components are lazy-loaded (RULE-09 §1.3)
    - Validate `useCallback`/`useMemo` usage for expensive ops (RULE-09 §5.1)

28. **Bundle Size Analysis**
    - Run bundle analyzer and check against budgets (RULE-09 §3.1)
    - Verify route-based code splitting (RULE-09 §3.2)
    - Check tree-shakeable imports (RULE-09 §3.3)
    - Validate lazy loading implementation (RULE-09 §6)

29. **Caching Strategy**
    - Verify multi-level caching (RULE-09 §2.1)
    - Check cache invalidation on writes (RULE-09 §2.2)
    - Validate cache key strategy includes tenantId (RULE-04 SAAS-CACHE-01)
    - Confirm no stale data served from cache

30. **Large Dataset Handling**
    - Verify pagination on all list queries (RULE-09 §9.1)
    - Check virtualization for lists >100 items (RULE-09 §4.1)
    - Validate IndexedDB indexes on frequently queried fields (RULE-09 §7.1)
    - Confirm projection to limit fields (RULE-09 §7.2)

**Checkpoint CP-08 Deliverables**:
- `PERFORMANCE_VIOLATIONS.md`
- `BUNDLE_ANALYSIS.md`
- `CACHING_AUDIT.md`
- `DATASET_HANDLING_AUDIT.md`

---

### Phase 9: Route & Navigation Audit
**Duration**: 1 day
**Checkpoint**: CP-09

31. **Route Configuration**
    - Enumerate all routes in application
    - Verify each route maps to a module (no orphan routes)
    - Check lazy loading for all routes (RULE-09 §6.2)
    - Validate route-level permissions (RULE-06 §10.1)

32. **Route Ownership**
    - Map each route to owning module
    - Verify no cross-module route definitions
    - Check route parameters match module expectations

**Checkpoint CP-09 Deliverables**:
- `ROUTE_INVENTORY.md`
- `ROUTE_OWNERSHIP.md`

---

### Phase 10: Business Rules Compliance Audit
**Duration**: 2 days
**Checkpoint**: CP-10

33. **Fee Rules Validation** (PACK-01 §2)
    - Verify fee normalizer runs before storage write (F-04)
    - Check fee amounts never negative (F-01)
    - Validate receipt immutability (F-02)
    - Confirm refund approval workflow (F-03)
    - Check concession approval requires supervisor (F-05)

34. **Student Rules Validation** (PACK-01 §3)
    - Verify student ID format: `{schoolId}-{AY}-{SEQ}` (S-01)
    - Check duplicate prevention on `(schoolId, firstName, lastName, dob)` (S-02)
    - Validate soft delete only (S-03)
    - Confirm transfer certificate destroys fee/attendance history (S-04)

35. **Transport Rules Validation** (PACK-01 §4)
    - Verify vehicle capacity > assigned students (TR-01)
    - Check stop cannot exist without route (TR-02)
    - Validate max 1 transport subscription per term (TR-03)

36. **Audit Trail Validation** (PACK-01 §5, RULE-16)
    - Verify every write creates audit record (A-01)
    - Check audit records are append-only (A-02)
    - Validate audit includes: who, what, when, oldValue, newValue (A-03)

**Checkpoint CP-10 Deliverables**:
- `BUSINESS_RULES_COMPLIANCE.md`
- `FEE_RULES_AUDIT.md`
- `STUDENT_RULES_AUDIT.md`
- `AUDIT_TRAIL_AUDIT.md`

---

## 3. AUDIT CHECKPOINTS SUMMARY

| Checkpoint | Phase | Duration | Gate Criteria |
|-----------|-------|----------|---------------|
| CP-01 | Foundation Audit | 1-2 days | Constitution verified, ownership mapped |
| CP-02 | Module Boundary | 2-3 days | Dependency graph complete, no unknown violations |
| CP-03 | SaaS Isolation | 2-3 days | All tenant violations catalogued |
| CP-04 | Storage Layer | 3-4 days | All storage violations catalogued |
| CP-05 | Service Registry | 2-3 days | Service ownership validated |
| CP-06 | Layer Validation | 2-3 days | Layer hierarchy enforced |
| CP-07 | Security | 2-3 days | Security violations catalogued |
| CP-08 | Performance | 2-3 days | Performance violations catalogued |
| CP-09 | Routes | 1 day | Route map complete |
| CP-10 | Business Rules | 2 days | Business rule compliance verified |

**Total Estimated Duration**: 19-26 days (with parallel execution possible for independent phases)

---

## 4. FILE SCAN STRATEGY

### 4.1 Scan Order (Breadth-First)

**Tier 1: Configuration & Registry** (Day 1)
```
src/config/
  ├── moduleRegistry.js          → Module ownership
  ├── appConfig.js               → Global settings
  └── routes.js                  → Route configuration

docs/
  ├── 01-constitution/PACK-*.md  → Constitution verification
  └── 07-rulebook/categories/    → Rule verification
```

**Tier 2: Service Layer** (Days 2-3)
```
src/services/
  ├── storageService.js          → CRITICAL: All data access
  ├── tenantContextService.js    → CRITICAL: Tenant resolution
  ├── authService.js             → CRITICAL: Authentication
  ├── studentService.js          → Module:students
  ├── feeSettingsService.js      → Module:fees
  ├── transportService.js        → Module:transport
  ├── hostelService.js           → Module:hostel
  ├── classSubjectService.js     → Module:classes-subjects
  ├── snapshotService.js         → Core
  └── runtimeValidationService.js → Core

src/core/
  └── fee-engine/
      └── feeNormalizer.js       → Core business logic
```

**Tier 3: Module Implementations** (Days 4-10)
```
src/modules/*/
  ├── components/                → UI layer audit
  ├── pages/                     → Route audit
  ├── services/                  → Module service audit
  ├── utils/                     → Utility audit
  └── index.js                   → Public API audit

src/master-setting/*/
  └── (same structure as modules) → Ownership audit
```

**Tier 4: UI & Infrastructure** (Days 11-12)
```
src/layouts/
  └── DashboardLayout.jsx        → Layout audit

src/store/
  └── schoolStore.js             → State management audit

src/App.js                       → Root component
src/config/
  └── (additional configs)
```

### 4.2 Scan Methodology

**Static Analysis**:
- Import graph extraction (using `madge` or custom AST parser)
- AST-based pattern matching for forbidden imports
- Regex-based scanning for hardcoded strings (schoolId, localStorage)
- JSDoc/comment parsing for `@owner` tags

**Dynamic Analysis**:
- Runtime validation of tenant context flow
- Integration test execution for service layer
- Performance profiling for rendering issues

**Manual Review**:
- Business logic placement (code smell detection)
- Error handling completeness
- Audit trail coverage

### 4.3 Scan Tools

| Tool | Purpose | Command |
|------|---------|---------|
| `madge` | Circular dependency detection | `npx madge --circular src/` |
| `eslint` | Import rule enforcement | Custom rules for architecture |
| Custom AST parser | Pattern extraction | Node.js script |
| `grep`/`rg` | Hardcoded string detection | `rg "localStorage\." src/` |
| Bundle analyzer | Size validation | `npm run analyze` |

---

## 5. DEPENDENCY ANALYSIS

### 5.1 Extraction Strategy

1. **Parse all `.js`/`.jsx` files** in `src/`
2. **Extract import statements** using regex or AST
3. **Resolve module paths** to module names
4. **Build directed graph**: Nodes = modules/files, Edges = imports
5. **Analyze graph** for:
   - Circular dependencies (cycles)
   - Forbidden edges (per RULE-06)
   - Layer violations (upward dependencies)
   - Missing edges (expected but absent)

### 5.2 Graph Representation

```javascript
// Output format
{
  "nodes": [
    { "id": "students", "type": "module", "path": "src/modules/students" },
    { "id": "fees", "type": "module", "path": "src/modules/fees" }
  ],
  "edges": [
    { "from": "students", "to": "fees", "type": "EVENT", "events": ["Student.Created"] },
    { "from": "fees", "to": "students", "type": "SHARED_SERVICE", "violation": false }
  ],
  "cycles": [],
  "violations": []
}
```

### 5.3 Validation Rules

**Allowed Dependencies**:
- Module → `src/services/*` (via public API or service registry)
- Module → `src/core/*` (pure utilities)
- Service → `storageService.js` (data layer)
- Component → Service (via import)

**Forbidden Dependencies**:
- Module A → Module B (direct import)
- Module → Another module's internal files
- Service → UI Component
- UI → Storage Layer (direct)

---

## 6. LAYER VALIDATION

### 6.1 Layer Classification

| Layer | Location | Allowed Imports | Forbidden Imports |
|-------|----------|-----------------|-------------------|
| **Presentation** | `src/modules/{m}/components/`, `pages/` | Services, Shared Components | Storage, Core, Other Modules |
| **Service** | `src/services/`, `src/modules/{m}/services/` | Core, Storage, Other Services | UI, DOM APIs |
| **Core** | `src/core/**/*.js` | Storage ONLY | Services, UI |
| **Storage** | `src/services/storageService.js` | Nothing (browser APIs) | All other layers |

### 6.2 Validation Checks

For each file:
1. Determine layer based on path
2. Extract all imports
3. Classify import targets by layer
4. Check against allowed/forbidden rules
5. Report violations with severity

**Severity Levels**:
- **CRITICAL**: Service → UI, UI → Storage, direct module imports
- **HIGH**: Core → Services, circular dependencies
- **MEDIUM**: Missing public API (index.js)
- **LOW**: Import order/style issues

---

## 7. MODULE OWNERSHIP VALIDATION

### 7.1 Ownership Verification

**Data Source**: PACK-02 §1 Ownership Matrix

| Module | Folder | Expected Owner | Verification Method |
|--------|--------|---------------|---------------------|
| students | `src/modules/students/` | team-students | Check `@owner` tag in files |
| fees | `src/modules/fees/` | team-accounts | Check service registry |
| transport | `src/modules/transport/` | team-logistics | Check module manifest |
| hostel | `src/modules/hostel/` | team-logistics | Check master-setting linkage |

### 7.2 Master-Setting Linkage

**Rule**: `src/master-setting/{x}/` owned by `src/modules/{x}/` owner (PACK-02 §3)

Verification:
```javascript
const masterSettingFolders = fs.readdirSync('src/master-setting');
for (const folder of masterSettingFolders) {
  const expectedOwner = getModuleOwner(folder); // From PACK-02
  const actualOwner = getActualOwner(`src/master-setting/${folder}`);
  if (expectedOwner !== actualOwner) {
    violations.push({ folder, expectedOwner, actualOwner });
  }
}
```

---

## 8. TENANT ISOLATION VALIDATION

### 8.1 Query Audit

**Pattern**: All data queries MUST include `schoolId` (tenantId)

**Search Patterns**:
```javascript
// Patterns to find
const patterns = [
  /storageService\.find\s*\(\s*\{[^}]*collection/gi,
  /storageService\.findOne\s*\(\s*\{[^}]*collection/gi,
  /storageService\.insert\s*\(\s*\{[^}]*collection/gi,
  /storageService\.update\s*\(\s*\{[^}]*collection/gi
];
```

**Validation**:
For each match:
1. Check if `tenantId` or `schoolId` present in options
2. If missing, flag as violation (CRITICAL)
3. If present, verify value comes from context (not hardcoded)

### 8.2 Storage Key Convention

**Pattern**: `{schoolId}__{module}__{entity}`

**Search Patterns**:
```javascript
// Patterns to find
const badPatterns = [
  /localStorage\.setItem\s*\(/gi,  // Direct localStorage
  /localStorage\.getItem\s*\(/gi,
  /schoolId__/gi,  // Wrong order
  /__students/gi    // Missing schoolId
];
```

**Validation**:
For each storage access:
1. Verify goes through `storageService` (not direct `localStorage`)
2. Verify key format matches `{schoolId}__{module}__{entity}`
3. Verify `schoolId` prefix is dynamic (from context)

---

## 9. SERVICE VALIDATION

### 9.1 Service Registry Mapping

**Source**: PACK-02 §2

```javascript
const SERVICE_REGISTRY = {
  'studentService.js': { owner: 'students', responsibility: 'Student CRUD' },
  'feeSettingsService.js': { owner: 'fees', responsibility: 'Fee configuration' },
  'transportService.js': { owner: 'transport', responsibility: 'Transport settings' },
  'hostelService.js': { owner: 'hostel', responsibility: 'Hostel settings' },
  'classSubjectService.js': { owner: 'classes-subjects', responsibility: 'Class & subject setup' },
  'storageService.js': { owner: 'IO Layer', responsibility: 'LocalStorage / API abstraction', shared: true },
  'snapshotService.js': { owner: 'Core', responsibility: 'Year-end snapshots', shared: true },
  'authService.js': { owner: 'Auth', responsibility: 'Authentication', shared: true },
  'tenantContextService.js': { owner: 'SaaS Core', responsibility: 'Tenant resolution', shared: true },
  'contextService.js': { owner: 'Core', responsibility: 'App context', shared: true }
};
```

### 9.2 Service Audit Checks

For each service file:
1. Verify `@owner` tag matches registry
2. Check no UI imports (`import.*from.*\.jsx`)
3. Verify no DOM API usage (`window.`, `document.`)
4. Check dependency injection (no `new StorageService()`)
5. Validate error handling (try-catch + logging)
6. Confirm audit logging for writes

---

## 10. STORAGE VALIDATION

### 10.1 Storage Service Contract

**Required Methods** (from PACK-05 §5):
- `get(collection, options)` - Read single
- `find(collection, options)` - Read multiple with filters
- `insert(collection, data, options)` - Create
- `update(collection, id, data, options)` - Update
- `delete(collection, id, options)` - Soft delete
- `hardDelete(collection, id, options)` - Hard delete (restricted)
- `createIndex(collection, field, options)` - Index creation

### 10.2 Storage Access Audit

Scan for direct Storage Layer access:
```bash
# Forbidden patterns
grep -r "localStorage\." src/modules/ src/master-setting/
grep -r "IndexedDB" src/modules/ src/master-setting/
grep -r "\.db\." src/modules/ src/master-setting/
```

Allowed only in:
- `src/services/storageService.js`
- `src/services/tenantContextService.js`
- `src/infrastructure/migrations/`

---

## 11. REGISTRY VALIDATION

### 11.1 Module Registry

**File**: `src/config/moduleRegistry.js`

Validation:
1. Every module in `src/modules/*/` has entry
2. Entry includes: `id`, `name`, `owner`, `status`, `dependencies`, `forbiddenDependencies`, `entryPoints`, `collections`, `permissions`
3. No circular dependencies in `dependencies`
4. All `forbiddenDependencies` are enforced in code

### 11.2 Service Registry

**File**: PACK-02 §2 (documented), `src/services/index.js` (implementation)

Validation:
1. Every service in `src/services/*.js` has documented owner
2. Implementation matches documentation
3. All module-specific services are in `src/modules/{m}/services/` (not `src/services/`)

---

## 12. IMPORT VALIDATION

### 12.1 Import Fee Transaction

**Required Order** (RULE-01 §5.2):
1. External packages (`react`, `lodash`)
2. Internal aliases (`@/services/`, `@/core/`)
3. Relative imports (same module only)
4. Styles (CSS modules)

### 12.2 Prohibited Imports

**Search Patterns**:
```javascript
// CRITICAL violations
/from\s+['"]@\/modules\/(?!index\.js)[^'"]+['"]/gi  // Direct module import

// HIGH violations
/from\s+['"]@\/modules\//gi  // Any module import (check if index.js)

// CRITICAL violations
/import\s+.*\s+from\s+['"]\.\..*\.jsx['"]/gi  // UI in service

// CRITICAL violations
/localStorage\./gi  // Direct storage access
```

### 12.3 Absolute Import Enforcement

**Required**: All internal imports use `@/` alias

**Forbidden**: Deep relative imports (`../../../../`)

---

## 13. FOLDER OWNERSHIP VALIDATION

### 13.1 Directory Structure Audit

**Expected Structure**:
```
src/
├── modules/          → Feature modules
│   ├── {module}/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── index.js
├── master-setting/   → Configuration (owned by parent module)
│   ├── {module}/
├── services/         → Shared services (platform-team ownership)
├── core/             → Core engines (platform-team ownership)
├── layouts/          → UI shells (frontend-team ownership)
├── store/            → State (frontend-team ownership)
├── config/           → Configuration (devops + platform)
└── utils/            → Shared utilities (platform-team)
```

### 13.2 Forbidden Folders

**Not Allowed**:
- `src/controllers/` (frontend doesn't use controllers)
- `src/models/` (use services instead)
- `src/helpers/` (use `utils/` or `core/`)
- `src/lib/` (use `utils/` or `core/`)

---

## 14. SHARED COMPONENT VALIDATION

### 14.1 Allowed in Shared

**`src/components/` or `src/shared/`**:
- Generic UI: `Button.jsx`, `Input.jsx`, `Modal.jsx`, `Table.jsx`
- Layout: `DashboardShell.jsx`, `PageHeader.jsx`
- Hooks: `useAuth.js`, `useTheme.js`, `useTenant.js`
- Utilities: `formatDate.js`, `validateEmail.js`

### 14.2 Forbidden in Shared

**Must NOT contain**:
- Business logic (fee calculations, student promotion logic)
- Module-specific features (transport route rendering)
- Domain-specific terminology ("concession", "promotion")
- Hardcoded module references

### 14.3 Validation Method

For each shared component:
1. Check imports (should not import from `src/modules/`)
2. Check terminology (should be generic)
3. Check props (should be generic, not module-specific)
4. Verify documented in shared component registry

---

## 15. PERFORMANCE VALIDATION

### 15.1 Rendering Checks

**Pattern Matching**:
```javascript
// Find components without memo
/function\s+\w+\([^)]*\)\s*\{[^}]*return\s*\(/gi  // Not using memo

// Find inline functions in JSX
/onClick=\{\([^)]*\)\s*=>/gi  // Inline arrow function

// Find inline objects in JSX
/style=\{\{[^}]+\}\}/gi  // Inline style object
```

### 15.2 Bundle Analysis

**Checks**:
1. Run `npm run build && npm run analyze`
2. Compare bundle size against RULE-09 §3.1 budgets
3. Identify large dependencies (>100KB)
4. Check for duplicate packages

### 15.3 Caching Validation

**Checks**:
1. Verify `cacheService` usage for frequently accessed data
2. Check cache invalidation on writes
3. Validate tenant-scoped cache keys
4. Confirm no sensitive data in cache

---

## 16. SECURITY VALIDATION

### 16.1 Authentication

**Checks**:
1. Password hashing algorithm (bcrypt, cost factor)
2. JWT configuration (algorithm, expiry)
3. Session management (concurrent limits)
4. MFA implementation (if required)

### 16.2 Authorization

**Checks**:
1. Permission checks before sensitive operations
2. Row-level security implementation
3. Role validation (RBAC)
4. Tenant isolation enforcement

### 16.3 Input Validation

**Checks**:
1. Zod/Yup schemas for all forms
2. Sanitization for HTML inputs
3. Type checking for all inputs
4. No `dangerouslySetInnerHTML` without sanitization

### 16.4 Sensitive Data

**Checks**:
1. PII fields encrypted (SSN, Aadhaar, PAN, bank account)
2. No secrets in code (`.env` usage)
3. HTTPS enforcement
4. Secure cookie flags (httpOnly, secure, sameSite)

---

## 17. VIOLATION CLASSIFICATION

See `VIOLATION_CLASSIFICATION.md` for detailed taxonomy.

**Summary**:
- **CRITICAL**: Security breaches, data leaks, module boundary violations
- **HIGH**: Architecture violations, missing tests, business rule violations
- **MEDIUM**: Style violations, missing docs, performance issues
- **LOW**: Naming inconsistencies, minor style issues

---

## 18. DELIVERABLES MATRIX

| Document | Owner | Format | Review Required |
|----------|-------|--------|-----------------|
| MASTER_ARCHITECTURE_AUDIT_PLAN.md | Architecture Team | Markdown | Yes (Arch Board) |
| AUDIT_EXECUTION_CHECKLIST.md | Audit Lead | Markdown | Yes (QA Lead) |
| CODEBASE_SCAN_ORDER.md | Platform Team | Markdown | No |
| VIOLATION_CLASSIFICATION.md | Security Team | Markdown | Yes (Security Lead) |
| REFACTOR_EXECUTION_PLAN.md | Architecture Team | Markdown | Yes (Tech Leads) |

---

## 19. SUCCESS CRITERIA

After this audit framework is complete:

✅ **Deterministic**: Same audit run twice produces identical results
✅ **Repeatable**: Can be executed on every major release
✅ **Evidence-based**: Every violation includes file, line, code snippet
✅ **Comprehensive**: Covers all 10 PACK areas and 30 RULE categories
✅ **Actionable**: Each violation includes fix recommendations
✅ **Non-invasive**: Does not modify any code or documents

**Next Phase**: Execute audit → Produce violation reports → Create refactor tickets → Implement fixes → Close audit

---

*End of MASTER_ARCHITECTURE_AUDIT_PLAN.md*
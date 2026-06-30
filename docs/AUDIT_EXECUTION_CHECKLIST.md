# AUDIT EXECUTION CHECKLIST
> **ERP-v2 RC1 | Phase-4.4 | Audit Framework v1.0**
> Step-by-step execution guide for architecture audit

---

## 1. PRE-AUDIT PREPARATION

### 1.1 Environment Setup
- [ ] Clone/update repository to latest RC1 state
- [ ] Install all dependencies: `npm install`
- [ ] Install audit tools: `npm install -g madge eslint`
- [ ] Verify all PACK documents readable in `docs/01-constitution/`
- [ ] Verify all RULE documents readable in `docs/07-rulebook/categories/`
- [ ] Create audit workspace directory: `docs/audit-workspace/`
- [ ] Set up violation tracking spreadsheet/database
- [ ] Assign audit teams to phases (if parallel execution)

### 1.2 Documentation Review
- [ ] Read MASTER_ARCHITECTURE_AUDIT_PLAN.md
- [ ] Read this AUDIT_EXECUTION_CHECKLIST.md
- [ ] Read CODEBASE_SCAN_ORDER.md for scan sequence
- [ ] Read VIOLATION_CLASSIFICATION.md for violation taxonomy
- [ ] Read REFACTOR_EXECUTION_PLAN.md for remediation strategy

---

## 2. CONSTITUTION DISCOVERY (CP-01 Prerequisite)

### 2.1 PACK Document Verification
- [ ] **PACK-00**: Master Foundation - Read and verified
- [ ] **PACK-01**: Business Rules - Read and verified
- [ ] **PACK-02**: Folder & File Ownership - Read and verified
- [ ] **PACK-03**: SaaS Multi-Tenant - Read and verified
- [ ] **PACK-04**: UI/UX Standards - Read and verified
- [ ] **PACK-05**: Backend & Database - Read and verified
- [ ] **PACK-06**: Module Rules - Read and verified
- [ ] **PACK-07**: Development Workflow - Read and verified
- [ ] **PACK-08**: Master Roadmap - Read and verified
- [ ] **PACK-09**: Controlled Refactor - Read and verified
- [ ] **PACK-10**: Permanent Locks - Read and verified

**Verification Method**: Confirm all 10 PACK files exist and are readable. Record file sizes and last modified dates.

**Deliverable**: `CONSTITUTION_MAP.md`
```markdown
# Constitution Map
## PACK Documents: 10
## Total Lines: [count]
## Key Rules Extracted: [list]
## PACK ↔ RULE Cross-Reference: [table]
```

### 2.2 RULE Document Verification
- [ ] **RULE-01**: Architecture Guidelines - Read and verified
- [ ] **RULE-02**: Storage & Data Persistence - Read and verified
- [ ] **RULE-03**: Service Layer - Read and verified
- [ ] **RULE-04**: SaaS Multi-Tenant - Read and verified
- [ ] **RULE-05**: Master Data - Read and verified
- [ ] **RULE-06**: Module Boundaries - Read and verified
- [ ] **RULE-07**: UI Standards - Read and verified
- [ ] **RULE-08**: Security Standards - Read and verified
- [ ] **RULE-09**: Performance Standards - Read and verified
- [ ] **RULE-10**: Testing Standards - Read and verified
- [ ] **RULE-11**: Refactoring Standards - Read and verified
- [ ] **RULE-12**: Git Standards - Read and verified
- [ ] **RULE-13**: Documentation Standards - Read and verified
- [ ] **RULE-14**: Code Quality Standards - Read and verified
- [ ] **RULE-15**: Deployment Standards - Read and verified
- [ ] **RULE-16**: Audit Standards - Read and verified
- [ ] **RULE-17**: AI Agent Standards - Read and verified
- [ ] **RULE-18**: Validation Standards - Read and verified
- [ ] **RULE-19**: Logging Standards - Read and verified
- [ ] **RULE-20**: Backup Standards - Read and verified
- [ ] **RULE-21**: Disaster Recovery Standards - Read and verified
- [ ] **RULE-22**: Monitoring Standards - Read and verified
- [ ] **RULE-23**: Versioning Standards - Read and verified
- [ ] **RULE-24**: Database Standards - Read and verified
- [ ] **RULE-25**: API Standards - Read and verified
- [ ] **RULE-26**: Error Handling Standards - Read and verified
- [ ] **RULE-27**: Migration Standards - Read and verified
- [ ] **RULE-28**: Feature Development Standards - Read and verified
- [ ] **RULE-29**: Bug Fixing Standards - Read and verified
- [ ] **RULE-30**: Code Review Standards - Read and verified

**Verification Method**: Confirm all 30 RULE files exist in `docs/07-rulebook/categories/`.

**Deliverable**: `RULE_COUNT.md`
```markdown
# Rule Count
## Total RULE Documents: 30
## Categories: [list]
## Critical Rules: [count]
## High Priority Rules: [count]
```

---

## 3. FOUNDATION AUDIT (CP-01)

### 3.1 File Ownership Audit
- [ ] **Scan all files** in `src/` for `@owner` JSDoc tag
- [ ] **Execute command**: `rg "@owner" src/ > docs/audit-workspace/owner-tags.txt`
- [ ] **Count owned files**: Files with `@owner` tag
- [ ] **Count orphan files**: Files without `@owner` tag
- [ ] **Validate ownership** against PACK-02 §1 matrix
- [ ] **Identify misowned files**: Wrong `@owner` value
- [ ] **Identify missing ownership**: Orphan files

**Expected Results**:
- Owned: >95% of files
- Orphan: <5% of files
- Misowned: <1% of files

**Deliverable**: `OWNERSHIP_VIOLATIONS.md`
```markdown
# Ownership Violations
## Owned Files: X
## Orphan Files: Y
## Misowned Files: Z
## Violations List: [table with file, expected, actual]
```

### 3.2 Folder Structure Audit
- [ ] **List all folders** in `src/`
- [ ] **Verify structure** matches expected hierarchy (Section 13.1)
- [ ] **Check naming conventions**:
  - [ ] Module folders: kebab-case (`student-management`)
  - [ ] Component files: PascalCase (`StudentTable.jsx`)
  - [ ] Service files: camelCase (`studentService.js`)
  - [ ] Utility files: camelCase (`dateUtils.js`)
- [ ] **Identify forbidden folders** (Section 13.2)
- [ ] **Check for unauthorized folders**

**Validation Rules**:
```
ALLOWED: src/modules/, src/master-setting/, src/services/, 
         src/core/, src/layouts/, src/store/, src/config/, src/utils/

FORBIDDEN: src/controllers/, src/models/, src/helpers/, src/lib/
```

**Deliverable**: `FOLDER_STRUCTURE_VIOLATIONS.md`

### 3.3 JSDoc Tag Audit
- [ ] **Scan for required tags**: `@owner`, `@description`, `@since`
- [ ] **Check tag format**: Correct syntax
- [ ] **Validate @owner values**: Match PACK-02 registry
- [ ] **Check @description**: Present and meaningful
- [ ] **Validate @since**: Date format YYYY-MM-DD

---

## 4. MODULE BOUNDARY AUDIT (CP-02)

### 4.1 Module Inventory
- [ ] **List all modules** in `src/modules/*/`
- [ ] **List all master-setting** in `src/master-setting/*/`
- [ ] **Verify module.json** exists for each module
- [ ] **Validate module.json** structure (RULE-06 §10.1)
- [ ] **Check moduleRegistry.js** includes all modules
- [ ] **Verify module status**: ACTIVE/PLANNED/DEPRECATED

**Deliverable**: `MODULE_INVENTORY.md`

### 4.2 Dependency Analysis
- [ ] **Install madge**: `npm install -g madge`
- [ ] **Run circular dependency check**: `npx madge --circular src/`
- [ ] **Save results**: `> docs/audit-workspace/circular-deps.txt`
- [ ] **Build import graph**: Custom script or madge
- [ ] **Analyze for forbidden dependencies** (RULE-06 Module Ownership Table)
- [ ] **Validate communication methods**: EVENT, SHARED_SERVICE, DIRECT_API

**Expected Results**:
- Circular dependencies: 0
- Forbidden dependencies: 0
- All cross-module communication via approved methods

**Deliverable**: 
- `DEPENDENCY_GRAPH.md`
- `CIRCULAR_DEPENDENCIES.md`
- `FORBIDDEN_IMPORTS.md`

### 4.3 Cross-Module Communication Audit
- [ ] **Search for direct module imports**:
  ```
  rg "from '@/modules/" src/ | grep -v "index.js"
  ```
- [ ] **Search for cross-module storage access**:
  ```
  rg "storageService\.(find|findOne|insert|update)" src/modules/*/
  ```
- [ ] **Check event contracts** in `src/services/eventService.js`
- [ ] **Verify no business logic in UI**:
  - [ ] Search for calculations in `.jsx` files
  - [ ] Search for validation in `.jsx` files
  - [ ] Search for data transformation in `.jsx` files

**Deliverable**: `CROSS_MODULE_COMMUNICATION.md`

---

## 5. SAAS MULTI-TENANT AUDIT (CP-03)

### 5.1 Tenant Isolation Validation
- [ ] **Search for all queries**:
  ```
  rg "storageService\.(find|findOne|insert|update)" src/ > queries.txt
  ```
- [ ] **For each query, verify**:
  - [ ] `tenantId` or `schoolId` present
  - [ ] Value comes from context (not hardcoded)
  - [ ] No cross-tenant access patterns

**Patterns to detect**:
```javascript
// VIOLATION: Missing tenantId
storageService.find({ collection: 'students', filters: {} })

// VIOLATION: Hardcoded tenantId
storageService.find({ collection: 'students', tenantId: 'ABC123' })

// CORRECT: Dynamic tenantId
const tenantId = tenantContextService.getCurrentTenantId();
storageService.find({ collection: 'students', tenantId })
```

**Deliverable**: `TENANT_ISOLATION_VIOLATIONS.md`

### 5.2 Storage Key Convention
- [ ] **Search for direct localStorage access**:
  ```
  rg "localStorage\.(getItem|setItem|removeItem)" src/
  ```
- [ ] **Search for storage key patterns**:
  ```
  rg "schoolId__" src/
  rg "__students" src/
  ```
- [ ] **Verify all storage goes through storageService.js**
- [ ] **Validate key format**: `{schoolId}__{module}__{entity}`

**Deliverable**: `STORAGE_KEY_AUDIT.md`

### 5.3 Tenant Context Flow
- [ ] **Trace auth → tenant context flow**:
  - [ ] `authService.verifyToken()` extracts schoolId
  - [ ] `tenantContextService.setContext(schoolId)` called
  - [ ] All subsequent queries use this context
- [ ] **Verify tenantContextService.js** implementation
- [ ] **Check for direct schoolId manipulation** (should be read-only from auth)

**Deliverable**: `TENANT_CONTEXT_FLOW.md`

### 5.4 Feature Flag Validation
- [ ] **Search for feature flags**:
  ```
  rg "canUseTransport|canUseHostel|canUseAttendance|canUseCustomReports" src/
  ```
- [ ] **Verify enforcement**: Flags checked before module access
- [ ] **Validate plan mapping**: FREE/PRO/ENTERPRISE
- [ ] **Check downgrade handling**: Feature disable at period end

**Deliverable**: `FEATURE_FLAG_COMPLIANCE.md`

---

## 6. STORAGE & DATA LAYER AUDIT (CP-04)

### 6.1 Storage Service Compliance
- [ ] **Verify ALL CRUD operations** go through storageService.js
- [ ] **Search for violations**:
  ```
  # Direct localStorage in modules (FORBIDDEN)
  rg "localStorage\." src/modules/ src/master-setting/
  ```
- [ ] **Check validation before writes**:
  - [ ] Schema validation present
  - [ ] Duplicate checking present
  - [ ] Normalization present
- [ ] **Verify audit trail** on all writes (RULE-02, PACK-01 A-01)

**Deliverable**: `STORAGE_LAYER_VIOLATIONS.md`

### 6.2 Schema & Data Shape Audit
- [ ] **Verify required fields** in all entities (PACK-05 §3):
  - [ ] `schoolId`
  - [ ] `id`
  - [ ] `createdAt`
  - [ ] `updatedAt`
  - [ ] `createdBy`
  - [ ] `isActive`
- [ ] **Check soft delete usage** (not hard delete):
  ```
  # Should see: isActive: false
  # Should NOT see: collection.delete() for master data
  ```
- [ ] **Validate ISO 8601 dates**:
  ```
  rg "new Date\(\)\.toISOString\(\)" src/
  ```
- [ ] **Check INR currency** usage:
  ```
  rg "₹|INR|currency" src/
  ```

**Deliverable**: `SCHEMA_COMPLIANCE.md`

### 6.3 Transaction & Atomicity
- [ ] **Search for transaction usage**:
  ```
  rg "transaction\(|beginTransaction|commit|rollback" src/
  ```
- [ ] **Verify atomic operations** for multi-entity changes
- [ ] **Check optimistic locking** (version field)
- [ ] **Validate idempotency** for writes (RULE-02 ST-WRITE-05)

**Deliverable**: `TRANSACTION_AUDIT.md`

### 6.4 Import Operations
- [ ] **Verify bulk import validation** (PACK-01 SC-02):
  - [ ] All rows validated before ANY writes
  - [ ] Error reporting includes row-level detail
  - [ ] Rollback on validation failure
- [ ] **Check migration scripts** exist for schema changes
- [ ] **Verify snapshot pattern** (PACK-05 §6)

**Deliverable**: `IMPORT_OPERATION_AUDIT.md`

---

## 7. SERVICE REGISTRY AUDIT (CP-05)

### 7.1 Service Ownership Validation
Reference PACK-02 §2 for expected ownership:

| Service | Owner Module | Verification |
|---------|-------------|--------------|
| `studentService.js` | students | Check @owner tag |
| `feeSettingsService.js` | fees | Check @owner tag |
| `transportService.js` | transport | Check @owner tag |
| `hostelService.js` | hostel | Check @owner tag |
| `classSubjectService.js` | classes-subjects | Check @owner tag |
| `storageService.js` | IO Layer (shared) | Check @owner tag |
| `snapshotService.js` | Core | Check @owner tag |
| `authService.js` | Auth | Check @owner tag |
| `tenantContextService.js` | SaaS Core | Check @owner tag |
| `contextService.js` | Core | Check @owner tag |

- [ ] **Verify @owner tags** match expected ownership
- [ ] **Check responsibilities** documented
- [ ] **Validate shared services** are truly shared

**Deliverable**: `SERVICE_REGISTRY_VIOLATIONS.md`

### 7.2 Service Layer Compliance
- [ ] **Check NO UI imports in services**:
  ```
  # Search for .jsx imports in service files
  rg "from.*\.jsx" src/services/ src/modules/*/services/
  ```
- [ ] **Check NO DOM API access**:
  ```
  rg "window\.|document\.|localStorage\." src/services/ src/modules/*/services/
  ```
- [ ] **Verify single responsibility**: Each service has focused purpose
- [ ] **Check dependency injection**: No `new ServiceName()` in constructors
- [ ] **Verify statelessness**: No instance variables for state
- [ ] **Validate error handling**: Try-catch + logging present

**Deliverable**: `SERVICE_LAYER_COMPLIANCE.md`

### 7.3 Business Logic Placement
- [ ] **Verify business logic in services/core ONLY**:
  ```
  # Search for business logic in UI
  rg "(calculate|compute|validate|transform)" src/modules/*/components/*.jsx
  ```
- [ ] **Check pure functions in `src/core/`**: No side effects
- [ ] **Validate error handling**: Complete, not swallowed
- [ ] **Verify audit logging**: On all write operations

**Deliverable**: `BUSINESS_LOGIC_PLACEMENT.md`

---

## 8. LAYER VALIDATION (CP-06)

### 8.1 Layer Hierarchy Enforcement

For each file, verify layer compliance:

| File Path | Layer | Allowed Imports | Forbidden Imports |
|-----------|-------|-----------------|-------------------|
| `src/modules/*/components/*.jsx` | Presentation | Services, Shared | Storage, Core, Modules |
| `src/modules/*/pages/*.jsx` | Presentation | Services, Shared | Storage, Core, Modules |
| `src/services/*.js` | Service | Core, Storage, Services | UI, DOM |
| `src/core/**/*.js` | Core | Storage ONLY | Services, UI |
| `src/services/storageService.js` | Storage | Nothing | All above |

- [ ] **Run import analysis script** (custom or madge)
- [ ] **Classify violations by severity**:
  - CRITICAL: Service→UI, UI→Storage, direct module import
  - HIGH: Core→Services, circular deps
  - MEDIUM: Missing public API
  - LOW: Import style issues
- [ ] **Generate layer violation report**

**Deliverable**: `LAYER_VIOLATIONS.md`

### 8.2 Import Direction Analysis
- [ ] **Build import graph** for entire codebase
- [ ] **Identify upward dependencies** (lower → higher)
- [ ] **Check circular dependencies** between layers
- [ ] **Validate absolute imports** (`@/` alias used)
- [ ] **Check for deep relative imports** (`../../../../`)

**Deliverable**: `IMPORT_DIRECTION_GRAPH.md`

### 8.3 Master-Setting Ownership
- [ ] **List all folders** in `src/master-setting/`
- [ ] **For each folder, identify parent module**:
  - `src/master-setting/fees/` → `src/modules/fees/`
  - `src/master-setting/transport/` → `src/modules/transport/`
  - `src/master-setting/hostel/` → `src/modules/hostel/`
- [ ] **Verify ownership match**: master-setting owned by parent module
- [ ] **Check for cross-module master-setting modifications**

**Deliverable**: `MASTER_SETTING_OWNERSHIP.md`

---

## 9. SECURITY AUDIT (CP-07)

### 9.1 Authentication Flow
- [ ] **Verify password hashing**:
  - [ ] Algorithm: bcrypt
  - [ ] Cost factor: 12
  - [ ] Salt: Per-tenant
- [ ] **Check MFA implementation**:
  - [ ] TOTP available
  - [ ] Required for: SUPER_ADMIN, TENANT_ADMIN
- [ ] **Validate session management**:
  - [ ] JWT expiry: 15m access, 7d refresh
  - [ ] Algorithm: RS256 (asymmetric)
  - [ ] Concurrent session limits
- [ ] **Verify password reset flow**:
  - [ ] Token hashed in storage
  - [ ] 15-minute expiry
  - [ ] Prevents enumeration

**Deliverable**: `AUTH_FLOW_AUDIT.md`

### 9.2 Authorization Enforcement
- [ ] **Verify RBAC implementation**:
  - [ ] Roles defined: SUPER_ADMIN, TENANT_ADMIN, ACCOUNTANT, TEACHER, PARENT, STUDENT
  - [ ] Permission checks before operations
  - [ ] Wildcard support (`*`)
- [ ] **Check row-level security**:
  - [ ] Teachers see only their students
  - [ ] Parents see only their children
  - [ ] Students see own data only
- [ ] **Validate deny-by-default posture**

**Deliverable**: `AUTHORIZATION_AUDIT.md`

### 9.3 Input Validation
- [ ] **Verify Zod/Yup schemas** exist for all forms
- [ ] **Check sanitization** for HTML inputs (DOMPurify)
- [ ] **Validate no dangerouslySetInnerHTML** without sanitization:
  ```
  rg "dangerouslySetInnerHTML" src/
  ```
- [ ] **Check type validation** for all inputs

**Deliverable**: `INPUT_VALIDATION_AUDIT.md`

### 9.4 Encryption & Secrets
- [ ] **Verify PII encryption**:
  - [ ] password (bcrypt)
  - [ ] SSN, Aadhaar, PAN (AES-256)
  - [ ] bankAccount, salary
- [ ] **Check tenant-specific encryption keys**
- [ ] **Validate no secrets in code**:
  - [ ] No hardcoded API keys
  - [ ] No hardcoded passwords
  - [ ] Using `.env` files
- [ ] **Verify HTTPS/TLS enforcement** (future backend)

**Deliverable**: `ENCRYPTION_COMPLIANCE.md`

**Deliverable**: `SECURITY_VIOLATIONS.md` (consolidated)

---

## 10. PERFORMANCE AUDIT (CP-08)

### 10.1 Rendering Performance
- [ ] **Identify components without memo** that should have it
- [ ] **Check inline objects/functions in JSX**:
  ```
  rg "onClick=\{\(" src/
  rg "style=\{\{" src/
  ```
- [ ] **Verify heavy components are lazy-loaded**:
  ```
  rg "lazy\(\(\) => import" src/
  ```
- [ ] **Check useCallback/useMemo usage** for expensive operations

**Deliverable**: `RENDERING_PERFORMANCE.md`

### 10.2 Bundle Size Analysis
- [ ] **Run build**: `npm run build`
- [ ] **Run bundle analyzer**: `npm run analyze`
- [ ] **Compare against budgets** (RULE-09 §3.1):
  - Main bundle: <300KB
  - Vendor bundle: <500KB
  - CSS: <100KB
  - Route chunks: <100KB
- [ ] **Identify large dependencies** (>100KB)
- [ ] **Check for duplicate packages**

**Deliverable**: `BUNDLE_ANALYSIS.md`

### 10.3 Caching Strategy
- [ ] **Verify multi-level caching** implementation
- [ ] **Check cache invalidation** on writes
- [ ] **Validate cache keys include tenantId**:
  ```
  rg "cache.*tenant:" src/
  ```
- [ ] **Confirm no sensitive data in cache**

**Deliverable**: `CACHING_AUDIT.md`

### 10.4 Large Dataset Handling
- [ ] **Verify pagination** on all list queries
- [ ] **Check virtualization** for lists >100 items
- [ ] **Validate IndexedDB indexes** on frequently queried fields
- [ ] **Confirm projection** to limit fields:
  ```
  rg "fields:\s*\[" src/
  ```

**Deliverable**: `DATASET_HANDLING_AUDIT.md`

**Consolidated Deliverable**: `PERFORMANCE_VIOLATIONS.md`

---

## 11. ROUTE AUDIT (CP-09)

### 11.1 Route Configuration
- [ ] **Enumerate all routes** in application
- [ ] **Verify each route maps to a module**
- [ ] **Check lazy loading** for all routes
- [ ] **Validate route-level permissions** (RULE-06 §10.1)

**Deliverable**: `ROUTE_INVENTORY.md`

### 11.2 Route Ownership
- [ ] **Map each route to owning module**
- [ ] **Verify no cross-module route definitions**
- [ ] **Check route parameters** match module expectations

**Deliverable**: `ROUTE_OWNERSHIP.md`

---

## 12. BUSINESS RULES AUDIT (CP-10)

### 12.1 Fee Rules Validation (PACK-01 §2)
- [ ] **F-01**: Fee amount never negative
- [ ] **F-02**: Receipt immutable (only refund, never delete)
- [ ] **F-03**: Refund has approval workflow
- [ ] **F-04**: Fee normalizer runs BEFORE storage write
- [ ] **F-05**: Concession requires supervisor role

**Verification**:
```
rg "feeNormalizer\.normalize" src/  # F-04
rg "receipt.*delete" src/  # Should NOT exist (F-02)
rg "refund.*approval" src/  # F-03
```

**Deliverable**: `FEE_RULES_AUDIT.md`

### 12.2 Student Rules Validation (PACK-01 §3)
- [ ] **S-01**: Student ID format: `{schoolId}-{AY}-{SEQ}`
- [ ] **S-02**: Duplicate prevention on `(schoolId, firstName, lastName, dob)`
- [ ] **S-03**: Soft delete only (never hard delete)
- [ ] **S-04**: Transfer certificate destroys fee/attendance history

**Verification**:
```
rg "schoolId.*admissionNumber" src/  # S-01 format
rg "isActive.*false" src/  # S-03 soft delete
rg "transfer.*certificate" src/  # S-04
```

**Deliverable**: `STUDENT_RULES_AUDIT.md`

### 12.3 Transport Rules Validation (PACK-01 §4)
- [ ] **TR-01**: Vehicle capacity > assigned students
- [ ] **TR-02**: Stop cannot exist without route
- [ ] **TR-03**: Max 1 transport subscription per term

**Deliverable**: `TRANSPORT_RULES_AUDIT.md`

### 12.4 Audit Trail Validation (PACK-01 §5, RULE-16)
- [ ] **A-01**: Every write creates audit record
- [ ] **A-02**: Audit records append-only (no UPDATE/DELETE)
- [ ] **A-03**: Audit includes: who, what, when, oldValue, newValue

**Verification**:
```
rg "auditService\.log" src/
rg "audit.*append" src/
```

**Deliverable**: `AUDIT_TRAIL_AUDIT.md`

**Consolidated Deliverable**: `BUSINESS_RULES_COMPLIANCE.md`

---

## 13. AUDIT EXECUTION SUMMARY

### 13.1 Checkpoint Gates

| Checkpoint | Gate Criteria | Sign-off Required |
|-----------|--------------|-------------------|
| CP-01 | Constitution verified, ownership mapped | Architecture Lead |
| CP-02 | Dependency graph complete, no unknown violations | Architecture Lead |
| CP-03 | All tenant violations catalogued | Security Lead |
| CP-04 | All storage violations catalogued | Platform Lead |
| CP-05 | Service ownership validated | Platform Lead |
| CP-06 | Layer hierarchy enforced | Architecture Lead |
| CP-07 | Security violations catalogued | Security Lead |
| CP-08 | Performance violations catalogued | Performance Lead |
| CP-09 | Route map complete | Tech Lead |
| CP-10 | Business rules compliance verified | Business Analyst |

### 13.2 Violation Tracking

For each violation found, record:
```json
{
  "id": "VIOLATION-001",
  "checkpoint": "CP-02",
  "severity": "CRITICAL",
  "category": "MODULE_BOUNDARY",
  "rule": "RULE-06-04",
  "pack": "PACK-02",
  "file": "src/modules/students/pages/StudentPage.jsx",
  "line": 42,
  "description": "Direct import from fees module",
  "codeSnippet": "import { FeeService } from '@/modules/fees/services/feeService';",
  "recommendation": "Use event bus: EventBus.publish('Student.Created', student)",
  "effort": "LOW",
  "owner": "team-students"
}
```

### 13.3 Daily Standup Checklist
- [ ] Review violations found yesterday
- [ ] Prioritize CRITICAL violations for immediate fix
- [ ] Assign violations to teams
- [ ] Update audit timeline based on findings
- [ ] Escalate blockers

### 13.4 Final Audit Report
- [ ] Compile all violation reports
- [ ] Generate `FINAL_AUDIT_REPORT.md`
- [ ] Create refactor tickets for all violations
- [ ] Schedule refactor execution (per REFACTOR_EXECUTION_PLAN.md)
- [ ] Archive audit workspace
- [ ] Present findings to Architecture Board

---

## 14. CRITICAL SUCCESS FACTORS

✅ **Completeness**: All 10 PACK areas audited
✅ **Coverage**: All 30 RULE categories checked
✅ **Evidence**: Every violation includes file, line, code snippet
✅ **Actionability**: Each violation includes fix recommendation
✅ **Traceability**: Violations linked to specific PACK/RULE references
✅ **Repeatability**: Same audit produces same results

---

*End of AUDIT_EXECUTION_CHECKLIST.md*
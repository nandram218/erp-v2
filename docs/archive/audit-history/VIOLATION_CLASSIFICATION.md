# VIOLATION CLASSIFICATION
> **ERP-v2 RC1 | Phase-4.4 | Audit Framework v1.0**
> Taxonomy for architecture audit violations

---

## 1. VIOLATION TAXONOMY OVERVIEW

This document defines the complete classification system for architecture violations found during the ERP-v2 audit.

**Objective**: Ensure consistent, objective, and actionable violation reporting across all auditors.

**Scope**: All violations found during Phases 1-10 of the architecture audit.

---

## 2. SEVERITY LEVELS

### 2.1 Severity Definitions

#### 🔴 CRITICAL (Severity: 1)

**Definition**: Violations that compromise security, data integrity, or multi-tenant isolation.

**Characteristics**:
- Security breach potential
- Data leak risk (cross-tenant)
- Business rule violation with financial/legal impact
- Complete architecture breakdown

**Response Time**: Immediate (within 24 hours)
**Blocking**: Yes - blocks all feature development
**Escalation**: Architecture Board + Security Lead

**Examples**:
```
- Cross-tenant data access (missing schoolId filter)
- Direct localStorage access in modules
- Business logic in UI components (financial calculations)
- Hardcoded credentials/secrets
- Missing audit trail on financial transactions
- Direct module import (bypassing event bus)
- Password stored without hashing
```

#### 🟠 HIGH (Severity: 2)

**Definition**: Violations that degrade maintainability, violate module boundaries, or create technical debt.

**Characteristics**:
- Architecture violation (layer breach)
- Module boundary violation
- Missing critical tests
- Business logic in wrong layer
- Circular dependencies

**Response Time**: 3-5 days
**Blocking**: Yes - blocks current phase completion
**Escalation**: Tech Lead + Module Owner

**Examples**:
```
- Service layer importing UI components
- Circular dependency between modules
- Missing module.json manifest
- Missing @owner tag on files
- Business logic in utility files (should be in service)
- Missing input validation on forms
- No error handling in service methods
- Direct cross-module storage access
```

#### 🟡 MEDIUM (Severity: 3)

**Definition**: Violations that impact code quality, performance, or developer experience.

**Characteristics**:
- Style violations
- Missing documentation
- Performance issues
- Incomplete tests
- Import order violations

**Response Time**: 1-2 weeks
**Blocking**: No - tracked in backlog
**Escalation**: Module Owner

**Examples**:
```
- Deep relative imports (../../../../)
- Missing JSDoc comments
- Inline functions in JSX (performance)
- Component without memo (should have it)
- Missing index.js public API
- Inconsistent naming conventions
- Large component (>500 lines)
- Missing unit tests
```

#### 🟢 LOW (Severity: 4)

**Definition**: Minor violations, style inconsistencies, or best practice deviations.

**Characteristics**:
- Naming inconsistencies
- Minor style issues
- Documentation improvements
- Code organization suggestions

**Response Time**: Next sprint
**Blocking**: No
**Escalation**: None

**Examples**:
```
- Inconsistent spacing
- Missing trailing commas
- Comment formatting issues
- Non-optimal but working code
- Missing .gitignore entries
- Unused imports (caught by linter)
```

---

## 3. VIOLATION CATEGORIES

### 3.1 Category Matrix

| Category | Code | Description | Typical Severity |
|----------|------|-------------|------------------|
| **Security** | SEC | Authentication, authorization, encryption violations | CRITICAL |
| **Tenant Isolation** | TENANT | Multi-tenant data leak risks | CRITICAL |
| **Module Boundary** | MODULE | Cross-module imports, forbidden dependencies | HIGH |
| **Layer Violation** | LAYER | Presentation→Storage, Service→UI, etc. | HIGH |
| **Storage** | STORAGE | Direct storage access, schema violations | HIGH |
| **Service** | SERVICE | Business logic placement, error handling | HIGH |
| **Business Rule** | BIZ | PACK-01 business rule violations | CRITICAL |
| **Data Shape** | DATA | Missing required fields, wrong formats | HIGH |
| **Performance** | PERF | Rendering, caching, bundle size | MEDIUM |
| **Import** | IMPORT | Import order, forbidden patterns | MEDIUM |
| **Documentation** | DOCS | Missing JSDoc, README, comments | MEDIUM |
| **Testing** | TEST | Missing tests, low coverage | MEDIUM |
| **Naming** | NAME | Naming convention violations | LOW |
| **Style** | STYLE | Code style, formatting | LOW |
| **Ownership** | OWNER | Missing @owner tags | MEDIUM |

### 3.2 Category Definitions

#### SEC - Security Violations

**SEC-01**: Weak password hashing
- **Check**: bcrypt with cost < 10
- **Severity**: CRITICAL
- **Fix**: Upgrade to bcrypt cost 12+

**SEC-02**: Missing MFA for admin roles
- **Check**: SUPER_ADMIN, TENANT_ADMIN without MFA
- **Severity**: HIGH
- **Fix**: Implement TOTP/SMS MFA

**SEC-03**: Unencrypted PII in storage
- **Check**: SSN, Aadhaar, PAN stored without encryption
- **Severity**: CRITICAL
- **Fix**: Implement AES-256 encryption

**SEC-04**: Secrets in code
- **Check**: API keys, passwords hardcoded
- **Severity**: CRITICAL
- **Fix**: Move to .env files

**SEC-05**: No input validation
- **Check**: Forms without Zod/Yup schemas
- **Severity**: HIGH
- **Fix**: Add validation schemas

**SEC-06**: XSS vulnerability
- **Check**: dangerouslySetInnerHTML without DOMPurify
- **Severity**: CRITICAL
- **Fix**: Sanitize HTML or remove

**SEC-07**: CSRF token missing
- **Check**: State-changing operations without CSRF token
- **Severity**: HIGH
- **Fix**: Add CSRF middleware

#### TENANT - Tenant Isolation Violations

**TENANT-01**: Missing schoolId in query
- **Check**: storageService.find without tenantId
- **Severity**: CRITICAL
- **Fix**: Add tenantId from context

**TENANT-02**: Hardcoded tenant ID
- **Check**: tenantId: 'ABC123' in code
- **Severity**: CRITICAL
- **Fix**: Use tenantContextService.get()

**TENANT-03**: Direct localStorage access
- **Check**: localStorage.setItem/getItem in modules
- **Severity**: CRITICAL
- **Fix**: Use storageService.js

**TENANT-04**: Wrong storage key format
- **Check**: Key not matching `{schoolId}__{module}__{entity}`
- **Severity**: HIGH
- **Fix**: Use correct key format

**TENANT-05**: Cross-tenant cache leak
- **Check**: Cache key missing tenantId
- **Severity**: HIGH
- **Fix**: Prefix cache keys with tenantId

#### MODULE - Module Boundary Violations

**MODULE-01**: Direct module import
- **Check**: import from '@/modules/other-module/'
- **Severity**: CRITICAL
- **Fix**: Use event bus or shared service

**MODULE-02**: Forbidden dependency
- **Check**: Import from forbiddenDependencies list
- **Severity**: CRITICAL
- **Fix**: Remove dependency or request exception

**MODULE-03**: Circular dependency
- **Check**: Module A → Module B → Module A
- **Severity**: CRITICAL
- **Fix**: Extract shared code to service/core

**MODULE-04**: Direct storage access from another module
- **Check**: fees module accessing students collection
- **Severity**: CRITICAL
- **Fix**: Use module's public API

**MODULE-05**: Missing module.json manifest
- **Check**: Module without module.json
- **Severity**: HIGH
- **Fix**: Create module manifest

**MODULE-06**: Module not in registry
- **Check**: Module folder exists but not in moduleRegistry.js
- **Severity**: HIGH
- **Fix**: Register module

#### LAYER - Layer Hierarchy Violations

**LAYER-01**: Service → UI import
- **Check**: import { Button } from '@/components/'
- **Severity**: CRITICAL
- **Fix**: Return data, let UI render

**LAYER-02**: UI → Storage import
- **Check**: import { storageService } in .jsx file
- **Severity**: CRITICAL
- **Fix**: Call service instead

**LAYER-03**: Core → Service import
- **Check**: import { someService } from '@/services/'
- **Severity**: HIGH
- **Fix**: Pass service as dependency

**LAYER-04**: UI → Core import (allowed) but with business logic
- **Check**: UI importing pure functions (OK) but using them incorrectly
- **Severity**: MEDIUM
- **Fix**: Move logic to service

**LAYER-05**: Upward dependency
- **Check**: Lower layer importing higher layer
- **Severity**: HIGH
- **Fix**: Reverse dependency direction

#### STORAGE - Storage Layer Violations

**STORAGE-01**: Direct browser storage access
- **Check**: localStorage/IndexedDB in modules
- **Severity**: CRITICAL
- **Fix**: Use storageService.js

**STORAGE-02**: Missing required fields
- **Check**: Entity missing schoolId, id, createdAt, etc.
- **Severity**: HIGH
- **Fix**: Add required fields

**STORAGE-03**: Hard delete on master data
- **Check**: collection.delete() for students, fees
- **Severity**: HIGH
- **Fix**: Use soft delete (isActive: false)

**STORAGE-04**: Missing validation before write
- **Check**: insert/update without schema validation
- **Severity**: HIGH
- **Fix**: Add validation

**STORAGE-05**: Missing duplicate check
- **Check**: insert without checking duplicates
- **Severity**: HIGH
- **Fix**: Add duplicate check

**STORAGE-06**: No audit trail
- **Check**: Write operation without auditService.log()
- **Severity**: HIGH
- **Fix**: Add audit logging

**STORAGE-07**: Non-ISO date format
- **Check**: Date not in ISO 8601 format
- **Severity**: MEDIUM
- **Fix**: Use .toISOString()

**STORAGE-08**: Missing transaction for multi-entity
- **Check**: Updating multiple entities without transaction
- **Severity**: HIGH
- **Fix**: Use storageService.transaction()

#### SERVICE - Service Layer Violations

**SERVICE-01**: Business logic in UI
- **Check**: Calculations in .jsx components
- **Severity**: HIGH
- **Fix**: Move to service

**SERVICE-02**: UI import in service
- **Check**: import { Component } from './Component.jsx'
- **Severity**: CRITICAL
- **Fix**: Return data only

**SERVICE-03**: DOM API access
- **Check**: window., document., localStorage. in service
- **Severity**: CRITICAL
- **Fix**: Remove DOM access

**SERVICE-04**: Missing error handling
- **Check**: async function without try-catch
- **Severity**: HIGH
- **Fix**: Add error handling

**SERVICE-05**: Stateful service
- **Check**: this.currentState in service class
- **Severity**: MEDIUM
- **Fix**: Make stateless

**SERVICE-06**: Missing validation
- **Check**: No schema validation before operations
- **Severity**: HIGH
- **Fix**: Add validation

**SERVICE-07**: Hardcoded dependencies
- **Check**: new AnotherService() in constructor
- **Severity**: MEDIUM
- **Fix**: Use dependency injection

#### BIZ - Business Rule Violations

**BIZ-01**: Negative fee amount
- **Check**: fee.amount < 0
- **Severity**: CRITICAL
- **Fix**: Validate amount > 0

**BIZ-02**: Receipt deletion
- **Check**: receipt.delete() or hard delete
- **Severity**: CRITICAL
- **Fix**: Receipts must be immutable

**BIZ-03**: Missing refund approval
- **Check**: Refund without approval workflow
- **Severity**: CRITICAL
- **Fix**: Add approval step

**BIZ-04**: Fee normalizer skipped
- **Check**: Write without feeNormalizer.normalize()
- **Severity**: CRITICAL
- **Fix**: Run normalizer before write

**BIZ-05**: Duplicate student allowed
- **Check**: No check for (schoolId, firstName, lastName, dob)
- **Severity**: HIGH
- **Fix**: Add duplicate check

**BIZ-06**: Wrong student ID format
- **Check**: Student ID not matching `{schoolId}-{AY}-{SEQ}`
- **Severity**: HIGH
- **Fix**: Use correct format

**BIZ-07**: Hard student delete
- **Check**: Student hard deleted instead of isActive: false
- **Severity**: CRITICAL
- **Fix**: Use soft delete

**BIZ-08**: Vehicle capacity exceeded
- **Check**: assignedStudents > vehicleCapacity
- **Severity**: HIGH
- **Fix**: Validate capacity before assignment

**BIZ-09**: Missing student transport check
- **Check**: Student added to transport without validation
- **Severity**: MEDIUM
- **Fix**: Add validation

#### DATA - Data Shape Violations

**DATA-01**: Missing schoolId field
- **Check**: Entity without schoolId
- **Severity**: CRITICAL
- **Fix**: Add schoolId field

**DATA-02**: Missing id field
- **Check**: Entity without UUID id
- **Severity**: HIGH
- **Fix**: Generate UUID

**DATA-03**: Missing timestamps
- **Check**: No createdAt, updatedAt
- **Severity**: MEDIUM
- **Fix**: Add timestamps

**DATA-04**: Missing createdBy
- **Check**: No createdBy field
- **Severity**: MEDIUM
- **Fix**: Add createdBy

**DATA-05**: Wrong currency
- **Check**: Amount not in INR
- **Severity**: HIGH
- **Fix**: Use INR

**DATA-06**: Non-ISO date
- **Check**: Date not ISO 8601
- **Severity**: MEDIUM
- **Fix**: Use .toISOString()

#### PERF - Performance Violations

**PERF-01**: Component without memo (should have)
- **Check**: Large list component without React.memo
- **Severity**: MEDIUM
- **Fix**: Wrap with memo()

**PERF-02**: Inline function in JSX
- **Check**: onClick={() => {}} in render
- **Severity**: MEDIUM
- **Fix**: Use useCallback

**PERF-03**: Inline object in JSX
- **Check**: style={{}} in render
- **Severity**: LOW
- **Fix**: Extract to variable

**PERF-04**: Missing lazy loading
- **Check**: Heavy component not lazy loaded
- **Severity**: MEDIUM
- **Fix**: Use React.lazy()

**PERF-05**: No pagination
- **Check**: fetch all records without pagination
- **Severity**: HIGH
- **Fix**: Add pagination

**PERF-06**: Missing index
- **Check**: Frequent query without index
- **Severity**: MEDIUM
- **Fix**: Create index

**PERF-07**: Large bundle
- **Check**: Bundle exceeding budget
- **Severity**: MEDIUM
- **Fix**: Code splitting

#### IMPORT - Import Violations

**IMPORT-01**: Direct module import
- **Check**: import from '@/modules/other/'
- **Severity**: CRITICAL
- **Fix**: Use module's index.js or event bus

**IMPORT-02**: Deep relative import
- **Check**: import from '../../../../'
- **Severity**: MEDIUM
- **Fix**: Use absolute import (@/)

**IMPORT-03**: UI in service
- **Check**: Service importing .jsx
- **Severity**: CRITICAL
- **Fix**: Remove UI import

**IMPORT-04**: Wrong import order
- **Check**: Not following Fee Transaction order
- **Severity**: LOW
- **Fix**: Reorder imports

**IMPORT-05**: Missing absolute import
- **Check**: Using ../../ instead of @/
- **Severity**: LOW
- **Fix**: Use absolute imports

#### DOCS - Documentation Violations

**DOCS-01**: Missing @owner tag
- **Check**: File without @owner JSDoc
- **Severity**: MEDIUM
- **Fix**: Add @owner tag

**DOCS-02**: Missing @description
- **Check**: No @description in JSDoc
- **Severity**: LOW
- **Fix**: Add description

**DOCS-03**: Missing README
- **Check**: Module without README.md
- **Severity**: MEDIUM
- **Fix**: Create README

**DOCS-04**: Missing module.json
- **Check**: Module without manifest
- **Severity**: HIGH
- **Fix**: Create module.json

**DOCS-05**: Undocumented function
- **Check**: Public function without JSDoc
- **Severity**: MEDIUM
- **Fix**: Add JSDoc comment

#### TEST - Testing Violations

**TEST-01**: No unit tests
- **Check**: Service/utility without test file
- **Severity**: MEDIUM
- **Fix**: Add unit tests

**TEST-02**: Low coverage
- **Check**: Coverage < 80%
- **Severity**: MEDIUM
- **Fix**: Add more tests

**TEST-03**: No integration tests
- **Check**: Module without integration tests
- **Severity**: MEDIUM
- **Fix**: Add integration tests

**TEST-04**: Test not running
- **Check**: Test file exists but fails
- **Severity**: HIGH
- **Fix**: Fix or remove test

#### NAME - Naming Violations

**NAME-01**: Wrong folder case
- **Check**: Folder not kebab-case
- **Severity**: LOW
- **Fix**: Rename to kebab-case

**NAME-02**: Wrong file case
- **Check**: Component not PascalCase
- **Severity**: LOW
- **Fix**: Rename to PascalCase

**NAME-03**: Abbreviated name
- **Check**: Using svc, util, ctrl
- **Severity**: LOW
- **Fix**: Use full words

**NAME-04**: Magic string/number
- **Check**: Hardcoded 'admin' or 30000
- **Severity**: MEDIUM
- **Fix**: Use constants

#### STYLE - Style Violations

**STYLE-01**: Inconsistent indentation
- **Check**: Mix of tabs/spaces
- **Severity**: LOW
- **Fix**: Use consistent indentation

**STYLE-02**: Missing semicolons
- **Check**: Inconsistent semicolon usage
- **Severity**: LOW
- **Fix**: Follow project style

**STYLE-03**: Long lines
- **Check**: Line > 120 characters
- **Severity**: LOW
- **Fix**: Break into multiple lines

#### OWNER - Ownership Violations

**OWNER-01**: Missing @owner tag
- **Check**: File without @owner
- **Severity**: MEDIUM
- **Fix**: Add @owner tag

**OWNER-02**: Wrong @owner value
- **Check**: @owner doesn't match PACK-02
- **Severity**: MEDIUM
- **Fix**: Correct @owner value

**OWNER-03**: Orphan file
- **Check**: File in wrong module folder
- **Severity**: MEDIUM
- **Fix**: Move to correct location

---

## 4. VIOLATION CODE FORMAT

### 4.1 Violation ID Structure

```
{SEVERITY_PREFIX}-{CATEGORY}-{NUMBER}

Examples:
CRITICAL-TENANT-001   → First critical tenant isolation violation
HIGH-MODULE-042       → 42nd high module boundary violation
MEDIUM-PERF-015       → 15th medium performance violation
LOW-STYLE-007         → 7th low style violation
```

**Severity Prefixes**:
- `CRITICAL` → CRIT
- `HIGH` → HIGH
- `MEDIUM` → MED
- `LOW` → LOW

### 4.2 Violation Record Schema

Every violation must be recorded as:

```json
{
  "id": "CRITICAL-TENANT-001",
  "severity": "CRITICAL",
  "category": "TENANT",
  "code": "TENANT-01",
  "rule": "PACK-01 T-01, PACK-03 §4, RULE-04 SAAS-ISO-02",
  "title": "Missing schoolId in storage query",
  "description": "Query does not include tenantId parameter, risking cross-tenant data access",
  "file": "src/modules/fees/services/feesService.js",
  "line": 45,
  "column": 12,
  "codeSnippet": "const fees = await storageService.find({\n  collection: 'fees',\n  filters: { studentId }\n});",
  "impact": "Potential data leak across tenants - all schools could see each other's fees",
  "recommendation": "Add tenantId: tenantContextService.getCurrentTenantId() to query options",
  "fixedCode": "const tenantId = tenantContextService.getCurrentTenantId();\nconst fees = await storageService.find({\n  collection: 'fees',\n  tenantId,\n  filters: { studentId }\n});",
  "effort": "LOW (5 minutes)",
  "owner": "team-accounts",
  "status": "OPEN",
  "createdAt": "2025-01-15T10:00:00Z",
  "checkpoint": "CP-03"
}
```

### 4.3 Violation Fields Explanation

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique violation ID (CRITICAL-TENANT-001) |
| `severity` | enum | Yes | CRITICAL, HIGH, MEDIUM, LOW |
| `category` | enum | Yes | SEC, TENANT, MODULE, LAYER, STORAGE, SERVICE, BIZ, DATA, PERF, IMPORT, DOCS, TEST, NAME, STYLE, OWNER |
| `code` | string | Yes | Specific violation code (e.g., TENANT-01) |
| `rule` | string | Yes | PACK/RULE reference(s) |
| `title` | string | Yes | Short description (< 80 chars) |
| `description` | string | Yes | Detailed explanation |
| `file` | string | Yes | Absolute file path |
| `line` | integer | Yes | Line number |
| `column` | integer | No | Column number |
| `codeSnippet` | string | Yes | Actual code with violation |
| `impact` | string | Yes | Business/technical impact |
| `recommendation` | string | Yes | How to fix |
| `fixedCode` | string | No | Example of correct code |
| `effort` | enum | Yes | LOW (< 1hr), MEDIUM (1-4hr), HIGH (1-2d), XL (> 2d) |
| `owner` | string | Yes | Team/module responsible |
| `status` | enum | Yes | OPEN, IN_PROGRESS, FIXED, WONT_FIX, DUPLICATE |
| `createdAt` | ISO date | Yes | When violation was found |
| `checkpoint` | string | Yes | CP-01 through CP-10 |

---

## 5. VIOLATION PATTERNS

### 5.1 Pattern Library

Each violation type has a detection pattern:

#### Pattern: Missing tenantId in query

```javascript
// Pattern to detect
/storageService\.(find|findOne|insert|update)\s*\(\s*\{[^}]*collection[^}]*\}/gi

// Expected: {..., tenantId: ..., ...}
// Violation: {..., collection: 'students', filters: {}}

// Auto-detect logic
function detectMissingTenantId(code) {
  const queries = code.match(/storageService\.(find|findOne|insert|update)\([^)]+\)/g);
  
  for (const query of queries) {
    if (!query.match(/tenantId\s*:/)) {
      return {
        violation: 'TENANT-01',
        severity: 'CRITICAL',
        query: query
      };
    }
  }
}
```

#### Pattern: Direct module import

```javascript
// Pattern to detect
/import\s+.*\s+from\s+['"]@\/modules\/(?!index\.js)[^'"]+['"]/gi

// Violation: import { X } from '@/modules/fees/services/feeService'
// Correct: import { X } from '@/modules/fees'

// Auto-detect logic
function detectDirectModuleImport(code) {
  const imports = code.match(/import\s+.*\s+from\s+['"]@\/modules\/[^'"]+['"]/g);
  
  for (const imp of imports) {
    if (!imp.match(/\/modules\/[^/]+\/index\.(js|jsx)/)) {
      return {
        violation: 'MODULE-01',
        severity: 'CRITICAL',
        import: imp
      };
    }
  }
}
```

#### Pattern: Business logic in UI

```javascript
// Pattern to detect (heuristic)
/function\s+\w+.*\s*\{\s*const\s+\w+\s*=.*\.(reduce|map|filter)\(/gi

// In .jsx files, look for calculations
// Violation: const total = fees.reduce((sum, f) => sum + f.amount, 0);
// Correct: const total = await FeesService.calculateTotal(fees);

// Auto-detect logic
function detectBusinessLogicInUI(code, filename) {
  if (!filename.endsWith('.jsx')) return null;
  
  // Look for calculation patterns
  const hasCalculation = code.match(/\.(reduce|map|filter|forEach)\(/);
  const hasImports = code.match(/import\s+.*\s+from\s+['"]\.\.\/services\//);
  
  if (hasCalculation && !hasImports) {
    return {
      violation: 'SERVICE-01',
      severity: 'HIGH',
      pattern: 'Calculation in UI'
    };
  }
}
```

### 5.2 Pattern Categories

**Static Patterns** (regex-based):
- Missing tenantId in queries
- Direct module imports
- Direct localStorage access
- UI imports in services
- Missing @owner tags
- Wrong file/folder naming

**Semantic Patterns** (AST-based):
- Business logic in UI
- Circular dependencies
- Layer violations
- Missing error handling
- Incomplete validation

**Dynamic Patterns** (runtime):
- Actual cross-tenant queries (test execution)
- Cache leaks (test execution)
- Performance bottlenecks (profiling)

---

## 6. VIOLATION AGGREGATION

### 6.1 Aggregation Levels

**File Level**:
```
File: src/modules/fees/pages/FeesPage.jsx
Violations: 3
  - HIGH-IMPORT-001: Direct module import (line 12)
  - MEDIUM-PERF-002: Inline function (line 45)
  - MED-PERF-003: Inline object (line 67)
Score: 7/10 (3 points deducted)
```

**Module Level**:
```
Module: fees
Files: 25
Total Violations: 47
  CRITICAL: 2 (tenant isolation)
  HIGH: 8 (module boundary)
  MEDIUM: 25 (import, perf, docs)
  LOW: 12 (naming, style)
Compliance Score: 72/100
```

**System Level**:
```
System: ERP-v2
Modules: 8
Total Violations: 312
  CRITICAL: 23 (7.4%)
  HIGH: 67 (21.5%)
  MEDIUM: 142 (45.5%)
  LOW: 80 (25.6%)
Overall Compliance: 68/100
```

### 6.2 Scoring System

**Base Score**: 100 points per module

**Deductions**:
```
CRITICAL violation: -10 points each
HIGH violation:     -5 points each
MEDIUM violation:   -2 points each
LOW violation:      -1 point each
```

**Minimum Score**: 0 (no negative scores)

**Passing Score**: ≥ 85 (module ready for production)

**Example**:
```
Module: fees
CRITICAL: 2 × -10 = -20
HIGH: 8 × -5 = -40
MEDIUM: 25 × -2 = -50
LOW: 12 × -1 = -12
Total Deductions: -122
Final Score: 0 (minimum)
Status: NOT READY
```

---

## 7. VIOLATION WORKFLOW

### 7.1 Lifecycle States

```
DISCOVERED → REVIEWED → ASSIGNED → IN_PROGRESS → FIXED → VERIFIED → CLOSED
    ↓           ↓         ↓            ↓           ↓        ↓
  Open      Pending    Team       Work        PR       QA
                        Owner      Started
```

**State Definitions**:

| State | Description | Next State |
|-------|-------------|------------|
| `OPEN` | Violation discovered, awaiting review | `REVIEWED` |
| `REVIEWED` | Reviewed and confirmed as valid violation | `ASSIGNED` |
| `ASSIGNED` | Assigned to team owner | `IN_PROGRESS` |
| `IN_PROGRESS` | Fix being implemented | `FIXED` |
| `FIXED` | Fix committed, awaiting verification | `VERIFIED` |
| `VERIFIED` | Fix verified by QA | `CLOSED` |
| `WONT_FIX` | Will not fix (documented exception) | `CLOSED` |
| `DUPLICATE` | Duplicate of another violation | `CLOSED` |

### 7.2 Exception Process

Some violations may be legitimate exceptions:

**Exception Request**:
```markdown
## Exception Request: CRITICAL-MODULE-003

**Violation**: Direct module import (students → fees)
**Requested By**: team-students
**Reason**: Performance optimization for dashboard (N+1 query avoidance)
**Impact**: Breaks module boundary but improves performance 10x
**Temporary**: Yes, until shared cache implemented
**Duration**: Until 2025-06-01
**Approved By**: Architecture Board (ADR-2025-003)
```

**Exception Criteria**:
1. Documented in ADR (Architecture Decision Record)
2. Time-bounded (has expiration)
3. Has migration plan
4. Approved by Architecture Board (for CRITICAL/HIGH)

---

## 8. VIOLATION REPORTING

### 8.1 Report Structure

**Daily Violation Report**:
```markdown
# Daily Violation Report - 2025-01-15

## Summary
- Total Violations: 47
- New Today: 12
- Fixed Today: 5
- Critical: 23 (unchanged)
- High: 67 (+2)
- Medium: 142 (+8)
- Low: 80 (+2)

## New Violations by Module
- fees: 5
- students: 4
- transport: 3
- hostel: 0

## Critical Violations
1. TENANT-01: Missing schoolId in fees query (team-accounts)
2. MODULE-01: Direct students import in fees (team-accounts)

## Trend
- Day 1: 0 violations
- Day 2: 15 violations
- Day 3: 32 violations
- Day 4: 47 violations (+12 today)
- Estimated total: 312 violations

## Blockers
- NONE

## Next Steps
- Continue CP-03 (SaaS isolation audit)
- Prioritize CRITICAL violations
```

### 8.2 Violation Dashboard

**Metrics to Track**:
```
Daily:
  - New violations found
  - Violations fixed
  - Violations by severity
  - Violations by module

Weekly:
  - Total violations trend
  - Fix velocity (violations/day)
  - Module compliance scores
  - Top violation types

Monthly:
  - Overall system compliance
  - Reduction in violations
  - Zero CRITICAL violations target
```

---

## 9. VIOLATION EXAMPLES BY SEVERITY

### 9.1 CRITICAL Examples

**Example 1: Cross-Tenant Data Leak**
```javascript
// File: src/modules/fees/services/feesService.js
// Line: 45
// Code:
const fees = await storageService.find({
  collection: 'fees',
  filters: { studentId }
  // ❌ MISSING: tenantId
});

// Violation: CRITICAL-TENANT-001
// Rule: PACK-01 T-01, PACK-03 §4, RULE-04 SAAS-ISO-02
// Impact: All tenants can see each other's fee data
// Fix: Add tenantId from context
```

**Example 2: Direct Module Import**
```javascript
// File: src/modules/fees/pages/FeesPage.jsx
// Line: 12
// Code:
import { StudentService } from '@/modules/students/services/studentService';
// ❌ FORBIDDEN: Direct module import

// Violation: CRITICAL-MODULE-001
// Rule: RULE-06 §8.1 Pattern 1, RULE-01 §2.2
// Impact: Tight coupling, breaks module independence
// Fix: Use event bus or shared service
```

### 9.2 HIGH Examples

**Example 3: Business Logic in UI**
```javascript
// File: src/modules/fees/components/FeesTable.jsx
// Line: 78
// Code:
const total = fees.reduce((sum, fee) => {
  if (fee.status === 'PAID' && fee.amount > 1000) {
    return sum + (fee.amount * 0.1); // ❌ Business logic in UI!
  }
  return sum + fee.amount;
}, 0);

// Violation: HIGH-SERVICE-001
// Rule: RULE-03 §2.1, RULE-01 §13.1.4
// Impact: Business rules scattered, hard to maintain
// Fix: Move to feesService.js
```

**Example 4: Circular Dependency**
```javascript
// Module: students imports transport
// Module: transport imports students
// ❌ Circular dependency

// Violation: HIGH-MODULE-002
// Rule: RULE-01 §2.4
// Impact: Unpredictable behavior, build failures
// Fix: Extract shared code to shared service
```

### 9.3 MEDIUM Examples

**Example 5: Deep Relative Import**
```javascript
// File: src/modules/fees/pages/FeesPage.jsx
// Line: 8
// Code:
import { formatCurrency } from '../../../../utils/formatUtils';
// ❌ FORBIDDEN: Deep relative import

// Violation: MEDIUM-IMPORT-001
// Rule: RULE-01 §5.1
// Impact: Brittle refactoring, hard to read
// Fix: Use absolute import: import { formatCurrency } from '@/utils/formatUtils'
```

**Example 6: Missing memo**
```javascript
// File: src/modules/students/components/StudentTable.jsx
// Line: 23
// Code:
function StudentRow({ student, onEdit }) {
  return (
    <tr>
      <td>{student.name}</td>
    </tr>
  );
}
// Should use memo for list items

// Violation: MEDIUM-PERF-001
// Rule: RULE-09 §1.1
// Impact: Unnecessary re-renders
// Fix: Wrap with React.memo
```

### 9.4 LOW Examples

**Example 7: Naming Convention**
```javascript
// File: src/modules/fees/utils/feesHelpers.js
// ❌ WRONG: Should be feesUtils.js (no 's')

// Violation: LOW-NAME-001
// Rule: RULE-01 §11.1
// Impact: Inconsistency
// Fix: Rename to feesUtils.js
```

---

## 10. VIOLATION REMEDIATION

### 10.1 Remediation Strategies

| Severity | Strategy | Timebox | Owner |
|----------|----------|---------|-------|
| CRITICAL | Immediate fix, block deployment | 24 hours | Module Owner + Tech Lead |
| HIGH | Fix in current sprint | 1 week | Module Owner |
| MEDIUM | Fix in next sprint | 2 weeks | Module Team |
| LOW | Fix when convenient | 1 month | Developer |

### 10.2 Fix Priority Matrix

```
Impact
  HIGH │ CRITICAL │ CRITICAL │
       │          │          │
  MED  │ HIGH     │ CRITICAL │
       │          │          │
  LOW  │ MEDIUM   │ HIGH     │
       │          │          │
       └────────────────────
         LOW      MED     HIGH
                 Effort
```

**Quadrant 1 (Top-Left)**: HIGH Impact, LOW Effort
→ Fix immediately (quick wins)

**Quadrant 2 (Top-Right)**: HIGH Impact, HIGH Effort
→ Plan carefully (sprint planning)

**Quadrant 3 (Bottom-Left)**: LOW Impact, LOW Effort
→ Fix opportunistically (spare time)

**Quadrant 4 (Bottom-Right)**: LOW Impact, HIGH Effort
→ Defer or skip (low priority)

### 10.3 Auto-Fix Eligible Violations

Some violations can be auto-fixed:

| Violation | Auto-Fix | Tool |
|-----------|----------|------|
| Deep relative import | Yes | Custom script |
| Missing @owner tag | Yes | Template insertion |
| Import order | Yes | ESLint --fix |
| Circular dependency | Partial | Madge + manual |
| Wrong naming | Partial | Rename tool |

**Manual Fix Required**:
- Security violations (human judgment needed)
- Business logic placement (refactoring needed)
- Architecture changes (design decisions)

---

## 11. VIOLATION TRACKING

### 11.1 Violation Register

Maintain master violation register: `docs/audit-workspace/violations/violation-register.json`

```json
{
  "meta": {
    "generatedAt": "2025-01-15T10:00:00Z",
    "auditPhase": "RC1 Phase-4.4",
    "totalFilesScanned": 1234,
    "totalModules": 8,
    "checkpointsComplete": 4
  },
  "summary": {
    "total": 312,
    "bySeverity": {
      "CRITICAL": 23,
      "HIGH": 67,
      "MEDIUM": 142,
      "LOW": 80
    },
    "byCategory": {
      "SEC": 5,
      "TENANT": 12,
      "MODULE": 34,
      "LAYER": 28,
      "STORAGE": 19,
      "SERVICE": 45,
      "BIZ": 23,
      "DATA": 15,
      "PERF": 67,
      "IMPORT": 34,
      "DOCS": 12,
      "TEST": 8,
      "NAME": 5,
      "STYLE": 3,
      "OWNER": 2
    },
    "byModule": {
      "students": 45,
      "fees": 89,
      "transport": 34,
      "hostel": 28,
      "classes-subjects": 23,
      "master-setting": 45,
      "services": 23,
      "core": 25
    }
  },
  "violations": [
    // Array of violation objects
  ]
}
```

### 11.2 Violation Queries

Common queries for tracking:

```javascript
// Get all CRITICAL violations
violations.filter(v => v.severity === 'CRITICAL')

// Get violations by module
violations.filter(v => v.file.startsWith('src/modules/fees'))

// Get violations by category
violations.filter(v => v.category === 'TENANT')

// Get open violations
violations.filter(v => v.status === 'OPEN')

// Get high/critical violations
violations.filter(v => ['CRITICAL', 'HIGH'].includes(v.severity))

// Count by checkpoint
violations.groupBy(v => v.checkpoint)
```

---

## 12. VIOLATION PREVENTION

### 12.1 Preventive Measures

**CI/CD Gates**:
- Block PRs with CRITICAL violations
- Warn on HIGH violations
- Report MEDIUM/LOW violations

**IDE Integration**:
- ESLint rules for architecture violations
- Real-time feedback in VS Code
- Pre-commit hooks

**Documentation**:
- Clear examples in violation classification
- Team training on architecture rules
- Regular architecture reviews

**Metrics**:
- Track violations over time
- Celebrate zero-CRITICAL milestones
- Gamify violation fixing

### 12.2 Early Detection

**Static Analysis**:
- Run audit scans on every PR
- Automated dependency graph checks
- Import validation in CI

**Code Review**:
- Architecture review checklist
- Peer review for cross-module changes
- Spot audits by tech leads

**Testing**:
- Integration tests for tenant isolation
- Architecture tests (module boundaries)
- Security scans

---

## 13. SUCCESS CRITERIA

✅ **Comprehensive**: All PACK and RULE violations categorized
✅ **Objective**: Clear, measurable criteria for each violation
✅ **Actionable**: Every violation includes fix recommendation
✅ **Consistent**: Same violation categorized same way across auditors
✅ **Trackable**: Violation register enables metrics and trends
✅ **Preventive**: Patterns enable early detection and prevention

---

## 14. APPENDIX

### 14.1 Violation Code Reference

| Code | Violation | Severity | Auto-Fix |
|------|-----------|----------|----------|
| TENANT-01 | Missing tenantId | CRITICAL | No |
| TENANT-02 | Hardcoded tenantId | CRITICAL | No |
| TENANT-03 | Direct localStorage | CRITICAL | No |
| TENANT-04 | Wrong storage key | HIGH | No |
| TENANT-05 | Cache leak | HIGH | No |
| MODULE-01 | Direct module import | CRITICAL | Partial |
| MODULE-02 | Forbidden dependency | CRITICAL | No |
| MODULE-03 | Circular dependency | CRITICAL | Partial |
| MODULE-04 | Cross-module storage | CRITICAL | No |
| MODULE-05 | Missing module.json | HIGH | Yes |
| MODULE-06 | Not in registry | HIGH | Yes |
| LAYER-01 | Service→UI | CRITICAL | No |
| LAYER-02 | UI→Storage | CRITICAL | No |
| LAYER-03 | Core→Service | HIGH | No |
| LAYER-04 | UI with logic | MEDIUM | No |
| LAYER-05 | Upward dep | HIGH | No |
| STORAGE-01 | Direct browser storage | CRITICAL | No |
| STORAGE-02 | Missing fields | HIGH | No |
| STORAGE-03 | Hard delete | HIGH | No |
| STORAGE-04 | Missing validation | HIGH | No |
| STORAGE-05 | Missing duplicate check | HIGH | No |
| STORAGE-06 | No audit log | HIGH | No |
| STORAGE-07 | Wrong date format | MEDIUM | Yes |
| STORAGE-08 | Missing transaction | HIGH | No |
| SERVICE-01 | Business logic in UI | HIGH | No |
| SERVICE-02 | UI import | CRITICAL | No |
| SERVICE-03 | DOM access | CRITICAL | No |
| SERVICE-04 | Missing error handling | HIGH | No |
| SERVICE-05 | Stateful service | MEDIUM | No |
| SERVICE-06 | Missing validation | HIGH | No |
| SERVICE-07 | Hardcoded deps | MEDIUM | No |
| BIZ-01 | Negative fee | CRITICAL | No |
| BIZ-02 | Receipt deletion | CRITICAL | No |
| BIZ-03 | Missing refund approval | CRITICAL | No |
| BIZ-04 | Skipped normalizer | CRITICAL | No |
| BIZ-05 | Duplicate student | HIGH | No |
| BIZ-06 | Wrong student ID | HIGH | No |
| BIZ-07 | Hard student delete | CRITICAL | No |
| BIZ-08 | Capacity exceeded | HIGH | No |
| BIZ-09 | Missing validation | MEDIUM | No |

### 14.2 Severity Quick Reference

| Severity | Response Time | Examples | Action |
|----------|--------------|----------|--------|
| CRITICAL | 24 hours | Tenant leak, missing audit | Stop all work, fix now |
| HIGH | 1 week | Missing validation, circular dep | Fix in current sprint |
| MEDIUM | 2 weeks | Missing memo, deep imports | Fix in next sprint |
| LOW | 1 month | Naming, style | Fix opportunistically |

---

*End of VIOLATION_CLASSIFICATION.md*
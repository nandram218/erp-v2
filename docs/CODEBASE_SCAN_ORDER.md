# CODEBASE SCAN ORDER
> **ERP-v2 RC1 | Phase-4.4 | Audit Framework v1.0**
> Deterministic scan sequence for architecture audit

---

## 1. SCAN PHILOSOPHY

**Principle**: Breadth-first, top-down scanning with dependency-aware ordering.

**Objective**: Ensure no file is missed, and critical dependencies are scanned before their dependents.

**Strategy**:
1. **Configuration First**: Scan registry and config files before implementations
2. **Services Before Modules**: Scan shared services before modules that depend on them
3. **Core Before Feature**: Scan core utilities before business logic
4. **Infrastructure Before Application**: Scan storage/cache before features that use them

---

## 2. SCAN EXECUTION ORDER

### PHASE A: Constitution & Governance (Day 1)

**Purpose**: Verify audit prerequisites

```
scan-A1: docs/01-constitution/
  ├── PACK-00_master-foundation.md
  ├── PACK-01_business-rules.md
  ├── PACK-02_folder-file-ownership.md
  ├── PACK-03_saas-multi-tenant.md
  ├── PACK-04_ui-ux-standards.md
  ├── PACK-05_backend-database.md
  ├── PACK-06_module-rules.md
  ├── PACK-07_development-workflow.md
  ├── PACK-08_master-roadmap.md
  ├── PACK-09_controlled-refactor.md
  └── PACK-10_permanent-locks.md

scan-A2: docs/07-rulebook/
  ├── MASTER_RULEBOOK.md
  ├── RULE_INDEX.md
  └── categories/
      ├── RULE-01-architecture.md
      ├── RULE-02-storage.md
      ├── RULE-03-services.md
      ├── RULE-04-saas.md
      ├── RULE-05-master-data.md
      ├── RULE-06-module-boundaries.md
      ├── RULE-07-ui.md
      ├── RULE-08-security.md
      ├── RULE-09-performance.md
      ├── RULE-10-testing.md
      ├── RULE-11-refactoring.md
      ├── RULE-12-git.md
      ├── RULE-13-documentation.md
      ├── RULE-14-code-quality.md
      ├── RULE-15-deployment.md
      ├── RULE-16-audit.md
      ├── RULE-17-ai-agent.md
      ├── RULE-18-validation.md
      ├── RULE-19-logging.md
      ├── RULE-20-backup.md
      ├── RULE-21-disaster-recovery.md
      ├── RULE-22-monitoring.md
      ├── RULE-23-versioning.md
      ├── RULE-24-database.md
      ├── RULE-25-api.md
      ├── RULE-26-error-handling.md
      ├── RULE-27-migration.md
      ├── RULE-28-feature-development.md
      ├── RULE-29-bug-fixing.md
      └── RULE-30-code-review.md
```

**Validation**:
- [ ] All 10 PACK files exist and are non-empty
- [ ] All 30 RULE files exist and are non-empty
- [ ] Rulebook index references all rules
- [ ] Cross-reference PACK ↔ RULE mapping complete

**Deliverable**: `CONSTITUTION_VERIFICATION.md`

---

### PHASE B: Configuration & Registry (Day 1)

**Purpose**: Understand system configuration before scanning implementations

**Priority**: CRITICAL - Blocking for all other scans

```
scan-B1: src/config/
  ├── moduleRegistry.js          → Module inventory, dependencies, permissions
  ├── appConfig.js               → Global configuration
  └── [other config files]       → Environment-specific settings

scan-B2: docs/architecture/
  ├── architecture-authority-matrix.md
  ├── architecture-current-reality.md
  ├── architecture-data-flow.md
  ├── architecture-dependency-graph.md
  ├── architecture-file-ownership.md
  ├── architecture-folder-map.md
  ├── architecture-service-registry.md
  ├── architecture-storage-flow.md
  ├── architecture-store-runtime.md
  └── architecture-tenant-isolation.md

scan-B3: docs/06-modules/
  ├── module-students.md
  ├── module-fees.md
  ├── module-transport.md
  ├── module-hostel.md
  └── module-attendance.md
```

**Validation Checks**:
- [ ] `moduleRegistry.js` includes all modules in `src/modules/*/`
- [ ] Each module entry has: `id`, `name`, `owner`, `dependencies`, `forbiddenDependencies`
- [ ] No circular dependencies in registry
- [ ] All module documentation exists

**Deliverable**: `CONFIGURATION_AUDIT.md`

---

### PHASE C: Data Layer Foundation (Days 2-3)

**Purpose**: Scan storage abstraction before all modules that use it

**Priority**: CRITICAL - All modules depend on this

```
scan-C1: src/services/storageService.js          → CRITICAL: All data access
scan-C2: src/services/tenantContextService.js    → CRITICAL: Tenant resolution
scan-C3: src/services/authService.js             → CRITICAL: Authentication
scan-C4: src/services/runtimeValidationService.js → Validation engine
scan-C5: src/services/snapshotService.js         → Year-end snapshots
scan-C6: src/core/
  ├── fee-engine/
  │   ├── feeNormalizer.js       → Core business logic
  │   └── [other engines]
  └── [other core utilities]
```

**Validation Checks**:
- [ ] `storageService.js` implements all required CRUD methods
- [ ] `tenantContextService.js` enforces tenant isolation
- [ ] `authService.js` uses bcrypt, JWT, RS256
- [ ] All core utilities are pure functions (no side effects)
- [ ] No UI imports in any of these files

**Deliverable**: `DATA_LAYER_AUDIT.md`

---

### PHASE D: Shared Services (Days 3-4)

**Purpose**: Scan platform services before module-specific services

**Priority**: HIGH - Modules depend on these

```
scan-D1: src/services/
  ├── studentService.js          → Module:students (but in shared services)
  ├── feeSettingsService.js      → Module:fees
  ├── transportService.js        → Module:transport
  ├── hostelService.js           → Module:hostel
  ├── classSubjectService.js     → Module:classes-subjects
  ├── contextService.js          → Core
  └── [other shared services]
```

**Note**: These are module-specific services placed in `src/services/` per current architecture. Verify ownership matches PACK-02 §2.

**Validation Checks**:
- [ ] Each service has `@owner` tag matching PACK-02 §2
- [ ] No UI imports (`*.jsx`)
- [ ] No DOM API access (`window.`, `document.`)
- [ ] Dependency injection used (no `new ServiceName()`)
- [ ] Error handling present (try-catch + logging)
- [ ] Audit logging on writes

**Deliverable**: `SHARED_SERVICES_AUDIT.md`

---

### PHASE E: Master-Setting Modules (Days 4-5)

**Purpose**: Scan configuration modules before feature modules that use them

**Priority**: HIGH - Feature modules depend on these

```
scan-E1: src/master-setting/fees/
  ├── FeeStructure.jsx
  ├── FeeSettings.jsx
  ├── feesService.js
  └── [other fee settings]

scan-E2: src/master-setting/transport/
  ├── TransportRoutes.jsx
  ├── TransportSettings.jsx
  ├── transportService.js
  └── [other transport settings]

scan-E3: src/master-setting/hostel/
  ├── [hostel components]
  ├── hostelService.js
  └── [other hostel settings]

scan-E4: src/master-setting/classes-subjects/
  ├── SubjectManager.jsx
  ├── classSubjectService.js
  ├── classKeyNormalizer.js
  ├── subjectPool.js
  └── [other class/subject settings]
```

**Validation Checks**:
- [ ] Each master-setting folder owned by parent module
- [ ] No cross-module master-setting modifications
- [ ] Services implement business rules correctly
- [ ] UI components call services (not direct storage)

**Deliverable**: `MASTER_SETTING_AUDIT.md`

---

### PHASE F: Feature Modules - Students (Days 5-6)

**Purpose**: Scan students module (foundation for other modules)

**Priority**: HIGH - Most modules depend on students

```
scan-F1: src/modules/students/
  ├── components/
  │   ├── StudentTable.jsx
  │   ├── StudentForm.jsx
  │   ├── SummarySidebar.jsx
  │   ├── ERPSectionCard.jsx
  │   └── [other components]
  ├── pages/
  │   ├── StudentListPage.jsx
  │   ├── StudentPage.jsx
  │   ├── StudentProfile.jsx
  │   ├── StudentIDCards.jsx
  │   └── [other pages]
  ├── services/
  │   ├── certificateService.js
  │   └── [other services]
  ├── utils/
  │   └── [utilities]
  ├── styles/
  │   └── studentFormStyles.js
  └── index.js

scan-F2: src/modules/students/certificates/
  ├── Certificate.jsx
  ├── CertificateSelector.jsx
  ├── CertificatePreview.jsx
  ├── certificateService.js
  ├── certificateTemplates.js
  └── [CSS files]
```

**Validation Checks**:
- [ ] No direct imports from other modules (fees, transport, etc.)
- [ ] All queries include `schoolId`
- [ ] Student ID format: `{schoolId}-{AY}-{SEQ}`
- [ ] Soft delete only (no hard delete)
- [ ] Duplicate prevention on `(schoolId, firstName, lastName, dob)`
- [ ] No business logic in UI components
- [ ] All writes go through service layer
- [ ] Audit trail present

**Deliverable**: `STUDENTS_MODULE_AUDIT.md`

---

### PHASE G: Feature Modules - Fees (Days 6-7)

**Purpose**: Scan fees module (complex business logic)

**Priority**: CRITICAL - Financial module, highest scrutiny

```
scan-G1: src/modules/fees/
  ├── components/
  │   ├── FeesTable.jsx
  │   ├── FeesCollectModal.jsx
  │   ├── ReceiptModal.jsx
  │   └── [other components]
  ├── pages/
  │   ├── FeesPage.jsx
  │   ├── FeesHistoryPage.jsx
  │   ├── DueReportPage.jsx
  │   └── [other pages]
  ├── services/
  │   ├── feesService.js
  │   ├── receiptService.js
  │   └── [other services]
  ├── utils/
  │   ├── feesConstants.js
  │   ├── feesUtils.js
  │   └── feesCalculator.js
  ├── styles/
  │   └── [styles]
  └── index.js

scan-G2: src/modules/fees/[additional files]
  ├── receiptMigrationService.js
  ├── receiptAuditService.js
  └── [other fee-related files]
```

**Validation Checks**:
- [ ] Fee normalizer runs BEFORE storage write (F-04)
- [ ] Fee amounts never negative (F-01)
- [ ] Receipts immutable (F-02)
- [ ] Refund workflow exists (F-03)
- [ ] Concession requires supervisor (F-05)
- [ ] No direct student module imports
- [ ] Uses event bus for student events
- [ ] All transactions use storageService.js

**Deliverable**: `FEES_MODULE_AUDIT.md`

---

### PHASE H: Feature Modules - Transport (Days 7-8)

**Purpose**: Scan transport module

**Priority**: HIGH

```
scan-H1: src/modules/transport/
  ├── components/
  │   └── [transport components]
  ├── pages/
  │   ├── TransportPage.jsx
  │   └── TransportForm.jsx
  ├── services/
  │   ├── transportService.js
  │   └── [other services]
  ├── utils/
  │   ├── transportHelpers.js
  │   └── [other utils]
  └── index.js
```

**Validation Checks**:
- [ ] Vehicle capacity > assigned students (TR-01)
- [ ] Stop cannot exist without route (TR-02)
- [ ] Max 1 transport subscription per term (TR-03)
- [ ] No direct student data modification
- [ ] Uses student lookup service (not direct import)

**Deliverable**: `TRANSPORT_MODULE_AUDIT.md`

---

### PHASE I: Other Feature Modules (Days 8-9)

**Purpose**: Scan remaining feature modules

```
scan-I1: src/modules/[other-modules]/
  ├── components/
  ├── pages/
  ├── services/
  ├── utils/
  └── index.js

# Include any additional modules not explicitly listed
# Examples: attendance, exam, hostel-feature, etc.
```

**Validation Checks**:
- [ ] Module registered in moduleRegistry.js
- [ ] No cross-module direct imports
- [ ] All queries include schoolId
- [ ] Business logic in services (not UI)
- [ ] Audit trail present

**Deliverable**: `OTHER_MODULES_AUDIT.md`

---

### PHASE J: UI Infrastructure (Day 10)

**Purpose**: Scan shared UI and state management

**Priority**: MEDIUM - Infrastructure support

```
scan-J1: src/layouts/
  └── DashboardLayout.jsx

scan-J2: src/store/
  └── schoolStore.js

scan-J3: src/App.js

scan-J4: src/components/ (if exists)
  ├── Button.jsx
  ├── Input.jsx
  ├── Modal.jsx
  └── [other shared components]

scan-J5: src/shared/ (if exists)
  ├── hooks/
  ├── utils/
  └── [other shared code]
```

**Validation Checks**:
- [ ] DashboardLayout does not contain business logic
- [ ] Store management follows state rules (local vs global vs server)
- [ ] No direct storage access in components
- [ ] Shared components are truly generic (no module references)

**Deliverable**: `UI_INFRASTRUCTURE_AUDIT.md`

---

## 3. SCAN EXECUTION STRATEGY

### 3.1 Sequential vs Parallel

**Sequential (Dependent)**:
- Phase A → Phase B (need registry before modules)
- Phase C → Phase D (need storage before services)
- Phase D → Phase E (need services before master-setting)
- Phase E → Phase F (need master-setting before feature modules)

**Parallel (Independent)**:
- Phase F (Students) ↔ Phase G (Fees) - can run in parallel after E
- Phase H (Transport) can run in parallel with F and G
- Security audit (CP-07) can run in parallel with performance (CP-08)

### 3.2 Scan Granularity

**File-Level Scanning**:
Every file classified as:
- ✅ **COMPLIANT**: No violations found
- ⚠️ **WARNING**: Minor issues, not blocking
- ❌ **VIOLATION**: Rule broken, needs fix
- ⏭️ **SKIP**: Not applicable to this file type

**Line-Level Scanning**:
For violations, record:
```
File: src/modules/fees/pages/FeesPage.jsx
Line: 42
Code: import { StudentService } from '@/modules/students/services/studentService';
Violation: Direct module import (RULE-06-04)
Severity: CRITICAL
```

### 3.3 Scan Tools & Commands

| Tool | Command | Purpose | Output |
|------|---------|---------|--------|
| `rg` | `rg "pattern" src/` | Pattern search | `scan-results/pattern-matches.txt` |
| `madge` | `npx madge --circular src/` | Circular deps | `scan-results/circular-deps.json` |
| `madge` | `npx madge --image graph.png src/` | Dependency graph | `scan-results/dependency-graph.png` |
| `node` | `node scripts/audit-scan.js` | Custom AST scan | `scan-results/ast-analysis.json` |
| `eslint` | `eslint src/ --format json` | Lint rules | `scan-results/eslint-report.json` |
| `grep` | `grep -r "localStorage" src/` | Forbidden APIs | `scan-results/localStorage-usage.txt` |

**Custom Scan Script**: `scripts/audit-scan.js`
```javascript
// Walks src/ directory, extracts imports, builds graph
// Outputs: scan-results/
//   - file-inventory.json
//   - import-graph.json
//   - layer-violations.json
//   - module-boundary-violations.json
```

### 3.4 Scan Artifacts

Directory structure:
```
docs/audit-workspace/
├── scan-results/
│   ├── file-inventory.json           → All files in src/
│   ├── import-graph.json             → Complete import graph
│   ├── circular-dependencies.json    → Circular dependency list
│   ├── layer-violations.json         → Layer hierarchy violations
│   ├── module-boundary-violations.json → Forbidden imports
│   ├── tenant-isolation-violations.json → Missing schoolId
│   ├── security-violations.json      → Security issues
│   ├── performance-violations.json   → Performance issues
│   └── business-rules-violations.json → Business rule violations
├── reports/                          → Final audit reports
│   ├── CP-01-foundation.md
│   ├── CP-02-modules.md
│   ├── CP-03-saas.md
│   ├── CP-04-storage.md
│   ├── CP-05-services.md
│   ├── CP-06-layers.md
│   ├── CP-07-security.md
│   ├── CP-08-performance.md
│   ├── CP-09-routes.md
│   └── CP-10-business-rules.md
└── violations/
    ├── violation-register.json       → Master violation list
    ├── critical-violations.json
    ├── high-violations.json
    ├── medium-violations.json
    └── low-violations.json
```

---

## 4. FILE PRIORITY MATRIX

### 4.1 Priority Levels

**P0 - CRITICAL** (Scan First):
- `src/services/storageService.js`
- `src/services/tenantContextService.js`
- `src/services/authService.js`
- `src/config/moduleRegistry.js`
- All files in `src/core/`

**P1 - HIGH** (Scan Early):
- All files in `src/services/`
- All files in `src/master-setting/*/services/`
- All files in `src/modules/*/services/`

**P2 - MEDIUM** (Scan Mid):
- All files in `src/modules/*/pages/`
- All files in `src/modules/*/components/`
- All files in `src/master-setting/*/`

**P3 - LOW** (Scan Late):
- All files in `src/layouts/`
- All files in `src/store/`
- All files in `src/utils/`
- All files in `src/config/` (non-critical)

### 4.2 Scan Order Within Priority

Within each priority level, scan in this order:
1. Services (business logic)
2. Pages (orchestration)
3. Components (UI)
4. Utils (helpers)
5. Styles (CSS)

**Rationale**: Business logic violations are more critical than UI issues.

---

## 5. MODULE SCAN ORDER

### 5.1 Dependency-Based Ordering

Scan modules in order of their dependencies (dependencies first):

```
1. students (no module dependencies)
2. classes-subjects (master-setting)
3. fees (depends on students, classes-subjects)
4. transport (depends on students)
5. hostel (depends on students)
6. attendance (depends on students, teachers)
7. exam (depends on students, subjects)
8. [other modules...]
```

### 5.2 Master-Setting Before Feature

Always scan master-setting before feature module:
```
1. src/master-setting/fees/ (scan)
2. src/modules/fees/ (scan)
3. src/master-setting/transport/ (scan)
4. src/modules/transport/ (scan)
```

---

## 6. SCAN EXECUTION CHECKLIST

### 6.1 Pre-Scan
- [ ] Create `docs/audit-workspace/` directory
- [ ] Create `docs/audit-workspace/scan-results/` directory
- [ ] Create `docs/audit-workspace/reports/` directory
- [ ] Create `docs/audit-workspace/violations/` directory
- [ ] Install scan tools: `madge`, `eslint`, `ripgrep`
- [ ] Clone latest RC1 codebase
- [ ] Verify all PACK/RULE documents accessible

### 6.2 During Scan
- [ ] Execute scans in order defined above
- [ ] Save raw results to `scan-results/`
- [ ] Process results into violation reports
- [ ] Store violations in `violations/` directory
- [ ] Update violation register (master list)
- [ ] Mark scanned files in file inventory

### 6.3 Post-Scan
- [ ] Verify all files scanned (no orphans)
- [ ] Consolidate violation reports per checkpoint
- [ ] Generate checkpoint reports in `reports/`
- [ ] Run validation: Total violations = sum of all categories
- [ ] Review with Architecture Board
- [ ] Archive scan results

---

## 7. SCAN VALIDATION

### 7.1 Completeness Check

**Verify all files scanned**:
```bash
# Count total files in src/
find src/ -type f \( -name "*.js" -o -name "*.jsx" \) | wc -l

# Count scanned files
cat docs/audit-workspace/scan-results/file-inventory.json | jq '.files | length'

# Should match
```

**Verify all modules scanned**:
```bash
# List modules
ls src/modules/

# Check audit reports exist for each
for module in $(ls src/modules/); do
  if [ ! -f "docs/audit-workspace/reports/${module}-module.md" ]; then
    echo "MISSING: ${module} audit"
  fi
done
```

### 7.2 Quality Check

**Verify no false positives**:
- [ ] Sample 10 violations from each severity level
- [ ] Manually verify each is actual violation
- [ ] Update scan patterns if needed
- [ ] Re-run affected scans

**Verify no missed violations**:
- [ ] Cross-check with grep for known patterns
- [ ] Manual review of high-risk files
- [ ] Peer review of scan results

---

## 8. SCAN AUTOMATION

### 8.1 Scan Script

Create `scripts/run-full-audit-scan.js`:
```javascript
#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCAN_PHASES = [
  {
    name: 'Phase A: Constitution',
    scans: ['docs/01-constitution/', 'docs/07-rulebook/']
  },
  {
    name: 'Phase B: Configuration',
    scans: ['src/config/', 'docs/architecture/', 'docs/06-modules/']
  },
  {
    name: 'Phase C: Data Layer',
    scans: ['src/services/storageService.js', 'src/services/tenantContextService.js', ...]
  }
  // ... other phases
];

async function runScan(phase) {
  console.log(`\n=== ${phase.name} ===`);
  
  for (const scanTarget of phase.scans) {
    console.log(`Scanning: ${scanTarget}`);
    
    // Run appropriate scan based on target type
    if (fs.existsSync(scanTarget) && fs.lstatSync(scanTarget).isDirectory()) {
      await scanDirectory(scanTarget);
    } else if (fs.existsSync(scanTarget)) {
      await scanFile(scanTarget);
    }
  }
}

async function main() {
  for (const phase of SCAN_PHASES) {
    await runScan(phase);
  }
  
  console.log('\n=== Scan Complete ===');
  console.log('Results in: docs/audit-workspace/scan-results/');
}

main().catch(console.error);
```

### 8.2 CI Integration

Add to `.github/workflows/architecture-audit.yml`:
```yaml
name: Architecture Audit Scan

on:
  push:
    branches: [main, RC1]
  pull_request:
    branches: [main]

jobs:
  architecture-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Install audit tools
        run: npm install -g madge eslint
        
      - name: Run architecture audit scan
        run: node scripts/run-full-audit-scan.js
        
      - name: Upload scan results
        uses: actions/upload-artifact@v3
        with:
          name: audit-scan-results
          path: docs/audit-workspace/scan-results/
          
      - name: Check for CRITICAL violations
        run: |
          CRITICAL_COUNT=$(jq '.violations | map(select(.severity == "CRITICAL")) | length' docs/audit-workspace/violations/violation-register.json)
          if [ $CRITICAL_COUNT -gt 0 ]; then
            echo "CRITICAL violations found: $CRITICAL_COUNT"
            exit 1
          fi
```

---

## 9. SCAN REPORT TEMPLATE

### 9.1 File Scan Report

For each file scanned:
```markdown
# Scan Report: [file-path]

## Metadata
- **Path**: src/modules/fees/pages/FeesPage.jsx
- **Layer**: Presentation (Page)
- **Module**: fees
- **Owner**: team-accounts
- **Size**: 245 lines
- **Scan Date**: 2025-01-15

## Ownership
- [x] @owner tag present: `@owner module:fees`
- [x] Owner matches PACK-02 registry

## Layer Compliance
- [x] Imports only from Services (not Storage/Core/Modules)
- [x] No business logic in UI
- [x] No direct storage access

## Import Analysis
| Import | Source | Layer | Allowed | Violation |
|--------|--------|-------|---------|-----------|
| React | external | N/A | Yes | No |
| FeesService | @/modules/fees | Module | Yes | No |
| Button | ./components | Internal | Yes | No |

## Patterns Found
- [ ] Direct localStorage access: None
- [ ] Hardcoded schoolId: None
- [ ] Inline functions in JSX: 3 (warning)
- [ ] Business logic in UI: None

## Violations Found
**None**

## Recommendations
- Refactor inline functions to useCallback (PERF improvement)
```

### 9.2 Module Scan Report

For each module:
```markdown
# Module Audit: [module-name]

## Overview
- **Path**: src/modules/{module}/
- **Owner**: team-{module}
- **Status**: ACTIVE
- **Files**: X components, Y pages, Z services

## Compliance Summary
| Check | Status | Violations |
|-------|--------|-----------|
| Ownership | ✅ PASS | 0 |
| No cross-module imports | ✅ PASS | 0 |
| All queries include schoolId | ✅ PASS | 0 |
| No business logic in UI | ✅ PASS | 0 |
| Audit trail present | ✅ PASS | 0 |
| Service layer compliance | ⚠️ WARNING | 1 |

## Violations
### HIGH: Missing @owner tag
- **File**: src/modules/{module}/utils/helper.js
- **Line**: 1
- **Recommendation**: Add @owner tag

## Recommendations
- Add @owner tags to 3 orphan files
- Refactor 2 inline functions to useCallback
```

---

## 10. SCAN COMPLETION CRITERIA

### 10.1 Mandatory Completion

- [ ] All PACK documents scanned and verified (Phase A)
- [ ] All RULE documents scanned and verified (Phase A)
- [ ] All configuration files scanned (Phase B)
- [ ] All data layer files scanned (Phase C)
- [ ] All shared services scanned (Phase D)
- [ ] All master-setting modules scanned (Phase E)
- [ ] All feature modules scanned (Phase F-I)
- [ ] All UI infrastructure scanned (Phase J)

### 10.2 Quality Gates

- [ ] File inventory count matches actual file count
- [ ] No files marked "NOT_SCANNED"
- [ ] All violations have: file, line, code snippet, recommendation
- [ ] All CRITICAL violations reviewed by Architecture Lead
- [ ] Scan results archived in `docs/audit-workspace/`

### 10.3 Handoff to Refactor

- [ ] Scan results packaged for refactor team
- [ ] Violation register exported to JSON
- [ ] Checkpoint reports approved
- [ ] Refactor execution plan updated with actual violations found

---

*End of CODEBASE_SCAN_ORDER.md*
# REFACTOR EXECUTION PLAN
> **ERP-v2 RC1 | Phase-4.4 | Audit Framework v1.0**
> Strategic plan for remediating architecture audit violations

---

## 1. REFACTOR MISSION

**Objective**: Systematically remediate all architecture violations identified during the ERP-v2 RC1 audit while maintaining system stability and zero regression.

**Constraint**: No feature development until all CRITICAL and HIGH violations are resolved.

**Timeline**: 8-12 weeks post-audit completion

---

## 2. REFACTOR PHILOSOPHY

### 2.1 Core Principles

1. **Safety First**: No data loss, no downtime, no breaking changes to public APIs
2. **Incremental Progress**: Small, reviewable changes over big-bang refactors
3. **Test-Guided**: Every refactor backed by tests (unit + integration)
4. **Rollback Ready**: Every change reversible within 1 hour
5. **Constitution-Aligned**: All fixes enforce PACK-00 through PACK-10

### 2.2 Risk Management

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Breaking production | Low | Critical | Feature flags, canary deployments |
| Data corruption | Low | Critical | Backups before every phase |
| Extended timeline | Medium | Medium | Buffer time in schedule |
| Team resistance | Medium | Low | Training, clear rationale |
| Technical debt increase | Low | High | Strict code review |

---

## 3. VIOLATION REMEDIATION PRIORITY

### 3.1 Priority Matrix (Impact vs Effort)

```
HIGH IMPACT
     │
     │  Q1              Q2
     │  │                │
     │  Immediate       Plan
     │  Fix             Carefully
     │  │                │
     │  ├───────────────┤
     │  │                │
     │  Q3              Q4
     │  Opportunistic   Defer/
     │  Fix             Skip
     │  │                │
     └──────────────────┴─────────── HIGH EFFORT
           LOW EFFORT
```

**Q1: HIGH Impact, LOW Effort** → Fix Immediately (Week 1-2)
- Missing schoolId in queries
- Direct localStorage access
- Missing @owner tags
- Deep relative imports

**Q2: HIGH Impact, HIGH Effort** → Plan Carefully (Week 3-8)
- Business logic in UI → Move to services
- Circular dependencies → Extract shared code
- Layer violations → Restructure imports
- Missing validation → Add schemas

**Q3: LOW Impact, LOW Effort** → Opportunistic (Week 9-10)
- Naming inconsistencies
- Style violations
- Missing JSDoc comments

**Q4: LOW Impact, HIGH Effort** → Defer/Skip
- Large refactors with minimal benefit
- Architecture experiments

### 3.2 Remediation Timeline

**Week 1-2: CRITICAL Violations (Stop the Bleeding)**
- Target: All CRITICAL violations fixed
- Focus: Tenant isolation, security, module boundaries
- Blocking: No feature development until complete

**Week 3-4: HIGH Violations - Quick Wins**
- Target: HIGH violations with LOW effort
- Focus: Missing validations, error handling, ownership

**Week 5-8: HIGH Violations - Complex Refactors**
- Target: HIGH violations with HIGH effort
- Focus: Business logic placement, circular deps, layer restructuring

**Week 9-10: MEDIUM Violations**
- Target: All MEDIUM violations
- Focus: Performance, documentation, testing

**Week 11-12: LOW Violations & Polish**
- Target: All LOW violations
- Focus: Naming, style, cleanup

---

## 4. REFACTOR EXECUTION PHASES

### PHASE 0: Preparation (Week 0)

**Duration**: 3 days

**Activities**:
- [ ] Create feature branch: `refactor/RC1-audit-fixes`
- [ ] Set up feature flags for gradual rollout
- [ ] Create rollback scripts for each module
- [ ] Take full system backup
- [ ] Baseline current test coverage
- [ ] Baseline current performance metrics
- [ ] Set up monitoring for refactor impact

**Deliverables**:
- `refactor/rollback-plan.md`
- `refactor/feature-flags.md`
- `refactor/baseline-metrics.json`

**Success Criteria**:
- [ ] All teams trained on refactor process
- [ ] Rollback tested and verified < 1 hour
- [ ] Baseline metrics captured

---

### PHASE 1: Tenant Isolation Hardening (Week 1)

**Duration**: 5 days

**Objective**: Eliminate all cross-tenant data leak risks

**Violations Targeted**:
- CRITICAL-TENANT-001: Missing schoolId in queries
- CRITICAL-TENANT-002: Hardcoded tenant IDs
- CRITICAL-TENANT-003: Direct localStorage access
- CRITICAL-TENANT-004: Wrong storage key format

**Approach**:

**Step 1**: Audit all queries (1 day)
```bash
# Find all storageService calls
rg "storageService\.(find|findOne|insert|update)" src/ > all-queries.txt

# Identify violations
grep -v "tenantId" all-queries.txt > missing-tenantId.txt
```

**Step 2**: Fix missing tenantId (2 days)
- Add tenantId from `tenantContextService.getCurrentTenantId()`
- Verify no hardcoded tenantId values
- Update storageService.js to auto-inject tenantId (defense in depth)

**Step 3**: Eliminate direct localStorage (1 day)
- Search for `localStorage.setItem/getItem`
- Replace with `storageService.js` calls
- Verify storageService auto-prefixes keys

**Step 4**: Validate tenant isolation (1 day)
- Run integration tests for each module
- Verify no cross-tenant queries in test logs
- Manual smoke test with multiple tenants

**Deliverables**:
- `refactor/phase1/tenant-isolation-fixes.md`
- Updated `storageService.js` (with auto-tenantId)
- Integration tests for tenant isolation

**Success Criteria**:
- [ ] 0 violations of TENANT-01, TENANT-02, TENANT-03
- [ ] All queries auto-include tenantId
- [ ] Integration tests pass for all modules

---

### PHASE 2: Module Boundary Enforcement (Week 2)

**Duration**: 5 days

**Objective**: Eliminate all module boundary violations

**Violations Targeted**:
- CRITICAL-MODULE-001: Direct module imports
- CRITICAL-MODULE-002: Forbidden dependencies
- CRITICAL-MODULE-003: Circular dependencies
- CRITICAL-MODULE-004: Cross-module storage access

**Approach**:

**Step 1**: Map all violations (1 day)
```bash
# Find direct module imports
rg "from '@/modules/" src/ | grep -v "index.js" > direct-imports.txt

# Find circular dependencies
npx madge --circular src/ > circular-deps.txt
```

**Step 2**: Replace direct imports with events (2 days)
- Identify direct imports: `import { X } from '@/modules/other/'`
- Replace with event bus: `EventBus.publish('Event.Name', data)`
- Update subscribers to listen for events

**Step 3**: Break circular dependencies (2 days)
- Extract shared code to `src/services/shared/` or `src/core/`
- Update both modules to use shared service
- Verify no cycles remain

**Deliverables**:
- `refactor/phase2/module-boundary-fixes.md`
- Updated event contracts
- Shared services for common functionality

**Success Criteria**:
- [ ] 0 violations of MODULE-01, MODULE-02, MODULE-03
- [ ] All cross-module communication via events or shared services
- [ ] Dependency graph acyclic

---

### PHASE 3: Layer Hierarchy Restoration (Week 3)

**Duration**: 5 days

**Objective**: Enforce strict layer separation

**Violations Targeted**:
- CRITICAL-LAYER-001: Service → UI imports
- CRITICAL-LAYER-002: UI → Storage imports
- HIGH-LAYER-003: Core → Service imports

**Approach**:

**Step 1**: Identify layer violations (1 day)
- Service files importing `.jsx` files
- UI files importing services directly (bypassing business logic)
- Core files importing services

**Step 2**: Fix Service → UI (1 day)
- Services return data objects
- UI components render data
- Remove JSX from service layer

**Step 3**: Fix UI → Storage (2 days)
- UI components call service methods
- Services handle storage operations
- No direct storageService calls in UI

**Step 4**: Fix Core → Service (1 day)
- Core utilities accept dependencies as parameters
- Services inject core utilities
- No direct imports from core to services

**Deliverables**:
- `refactor/phase3/layer-hierarchy-fixes.md`
- Updated import structure
- Layer enforcement in CI/CD

**Success Criteria**:
- [ ] 0 violations of LAYER-01, LAYER-02, LAYER-03
- [ ] All imports follow layer hierarchy
- [ ] CI blocks layer violations

---

### PHASE 4: Business Logic Centralization (Week 4-5)

**Duration**: 10 days

**Objective**: Move all business logic from UI to services/core

**Violations Targeted**:
- HIGH-SERVICE-001: Business logic in UI
- HIGH-SERVICE-002: Missing validation in services
- HIGH-SERVICE-003: Missing error handling
- BIZ-*: Business rule violations

**Approach**:

**Step 1**: Identify business logic in UI (2 days)
```bash
# Find calculations in .jsx files
rg "(calculate|compute|validate|transform)" src/modules/*/components/*.jsx
```

**Step 2**: Extract to services (5 days)
- For each calculation in UI:
  1. Create service method: `FeesService.calculateTotal(fees)`
  2. Move logic from UI to service
  3. Update UI to call service
  4. Add unit test for service method

**Step 3**: Add missing validation (2 days)
- Audit all service methods
- Add Zod/Yup schemas for inputs
- Add normalization before writes

**Step 4**: Add error handling (1 day)
- Wrap all async service methods in try-catch
- Add structured error types
- Add audit logging for errors

**Deliverables**:
- `refactor/phase4/business-logic-centralization.md`
- Service methods for all business logic
- Comprehensive unit tests

**Success Criteria**:
- [ ] 0 violations of SERVICE-01 (business logic in UI)
- [ ] All service methods have validation
- [ ] All service methods have error handling
- [ ] Business rule violations (BIZ-*) resolved

---

### PHASE 5: Storage Layer Compliance (Week 6)

**Duration**: 5 days

**Objective**: Ensure all data operations follow storage rules

**Violations Targeted**:
- HIGH-STORAGE-001: Missing required fields
- HIGH-STORAGE-002: Hard delete on master data
- HIGH-STORAGE-003: Missing validation before write
- HIGH-STORAGE-004: Missing duplicate checks
- HIGH-STORAGE-005: Missing audit trail

**Approach**:

**Step 1**: Schema audit (1 day)
- List all collections in use
- Verify required fields present
- Add missing fields via migration

**Step 2**: Replace hard deletes (2 days)
- Find all `collection.delete()` calls
- Replace with `storageService.delete()` (soft delete)
- Add `isActive: false` flag

**Step 3**: Add validation & deduplication (1 day)
- Add schema validation to all write operations
- Add duplicate checks before inserts
- Add unique indexes

**Step 4**: Add audit logging (1 day)
- Wrap all write operations with audit logging
- Log: who, what, when, oldValue, newValue
- Verify audit records are append-only

**Deliverables**:
- `refactor/phase5/storage-compliance.md`
- Schema migrations for missing fields
- Audit logging wrapper

**Success Criteria**:
- [ ] 0 violations of STORAGE-02, STORAGE-03, STORAGE-04, STORAGE-05, STORAGE-06
- [ ] All entities have required fields
- [ ] All writes audited

---

### PHASE 6: Security Hardening (Week 7)

**Duration**: 5 days

**Objective**: Implement all security requirements from RULE-08

**Violations Targeted**:
- CRITICAL-SEC-001: Weak password hashing
- CRITICAL-SEC-002: Unencrypted PII
- CRITICAL-SEC-003: Secrets in code
- HIGH-SEC-004: Missing input validation
- HIGH-SEC-005: XSS vulnerabilities

**Approach**:

**Step 1**: Password security (1 day)
- Upgrade bcrypt cost to 12
- Verify password policy enforcement
- Add password history check

**Step 2**: PII encryption (2 days)
- Identify PII fields: SSN, Aadhaar, PAN, bankAccount
- Implement AES-256 encryption
- Add tenant-specific encryption keys

**Step 3**: Secrets management (1 day)
- Search for hardcoded secrets
- Move to `.env` files
- Verify `.env` in `.gitignore`

**Step 4**: Input validation (1 day)
- Verify Zod schemas for all forms
- Add sanitization for HTML inputs
- Remove `dangerouslySetInnerHTML` or sanitize

**Deliverables**:
- `refactor/phase6/security-hardening.md`
- Encryption utilities
- Input validation schemas

**Success Criteria**:
- [ ] 0 violations of SEC-01, SEC-02, SEC-03, SEC-04, SEC-06
- [ ] All passwords hashed with bcrypt cost 12
- [ ] All PII encrypted
- [ ] No secrets in code

---

### PHASE 7: Performance Optimization (Week 8)

**Duration**: 5 days

**Objective**: Meet performance budgets from RULE-09

**Violations Targeted**:
- MEDIUM-PERF-001: Components without memo
- MEDIUM-PERF-002: Inline functions in JSX
- MEDIUM-PERF-003: Missing lazy loading
- HIGH-PERF-004: No pagination
- MEDIUM-PERF-005: Missing indexes

**Approach**:

**Step 1**: Memoization (1 day)
- Identify list components without `memo`
- Wrap with `React.memo()`
- Add `useCallback` for event handlers

**Step 2**: Code splitting (1 day)
- Identify heavy components
- Add `React.lazy()` for route-based splitting
- Add `Suspense` boundaries

**Step 3**: Pagination & virtualization (2 days)
- Add pagination to all list queries
- Add virtualization for lists >100 items
- Add indexes to frequently queried fields

**Step 4**: Bundle optimization (1 day)
- Run bundle analyzer
- Identify large dependencies
- Replace with lighter alternatives

**Deliverables**:
- `refactor/phase7/performance-optimization.md`
- Bundle analysis report
- Performance test results

**Success Criteria**:
- [ ] All list components have pagination
- [ ] Bundle size within budgets (RULE-09 §3.1)
- [ ] LCP < 2.5s, FID < 100ms

---

### PHASE 8: Testing & Documentation (Week 9)

**Duration**: 5 days

**Objective**: Achieve 80% test coverage and complete documentation

**Violations Targeted**:
- MEDIUM-TEST-001: No unit tests
- MEDIUM-DOCS-001: Missing @owner tags
- MEDIUM-DOCS-002: Missing README
- MEDIUM-DOCS-003: Missing JSDoc

**Approach**:

**Step 1**: Unit tests (2 days)
- Write tests for all service methods
- Write tests for core utilities
- Target: 80% coverage

**Step 2**: Integration tests (2 days)
- Write tests for critical flows
- Test tenant isolation
- Test business rules

**Step 3**: Documentation (1 day)
- Add @owner tags to all files
- Create README for each module
- Add JSDoc to public APIs

**Deliverables**:
- `refactor/phase8/testing-documentation.md`
- Test coverage report
- Updated documentation

**Success Criteria**:
- [ ] Test coverage ≥ 80%
- [ ] All public APIs documented
- [ ] All files have @owner tags

---

### PHASE 9: Cleanup & Validation (Week 10)

**Duration**: 5 days

**Objective**: Final polish and validation

**Activities**:
- [ ] Fix all MEDIUM violations
- [ ] Fix all LOW violations
- [ ] Run full architecture audit (regression)
- [ ] Verify 0 CRITICAL, 0 HIGH violations
- [ ] Performance regression testing
- [ ] Security penetration testing
- [ ] User acceptance testing

**Deliverables**:
- `refactor/phase9/final-validation.md`
- Final architecture audit report
- Sign-off from Architecture Board

**Success Criteria**:
- [ ] 0 CRITICAL violations
- [ ] 0 HIGH violations
- [ ] Architecture compliance score ≥ 85/100
- [ ] All tests passing
- [ ] No performance regression

---

## 5. REFACTOR PATTERNS

### 5.1 Common Refactor Patterns

#### Pattern 1: Move Business Logic from UI to Service

**Before**:
```javascript
// src/modules/fees/components/FeesTable.jsx
function FeesTable({ fees }) {
  const total = fees.reduce((sum, fee) => {
    if (fee.status === 'PAID') {
      return sum + (fee.amount * 0.9); // Discount logic
    }
    return sum + fee.amount;
  }, 0);
  
  return <div>Total: {total}</div>;
}
```

**After**:
```javascript
// src/modules/fees/services/feesService.js
export class FeesService {
  async calculateTotal(fees) {
    return fees.reduce((sum, fee) => {
      if (fee.status === 'PAID') {
        return sum + (fee.amount * 0.9);
      }
      return sum + fee.amount;
    }, 0);
  }
}

// src/modules/fees/components/FeesTable.jsx
function FeesTable({ fees }) {
  const [total, setTotal] = useState(0);
  
  useEffect(() => {
    FeesService.calculateTotal(fees).then(setTotal);
  }, [fees]);
  
  return <div>Total: {total}</div>;
}
```

**Steps**:
1. Create service method
2. Move logic to service
3. Add unit test for service
4. Update UI to call service
5. Verify UI behavior unchanged

#### Pattern 2: Replace Direct Module Import with Events

**Before**:
```javascript
// src/modules/fees/pages/FeesPage.jsx
import { StudentService } from '@/modules/students/services/studentService';

function FeesPage() {
  useEffect(() => {
    StudentService.getById(studentId).then(setStudent);
  }, [studentId]);
}
```

**After**:
```javascript
// src/modules/fees/pages/FeesPage.jsx
import { EventBus } from '@/services/eventService';

function FeesPage() {
  const [student, setStudent] = useState(null);
  
  useEffect(() => {
    // Request student data via event
    EventBus.publish('Student.Get', { studentId });
    
    // Listen for response
    const handler = (data) => {
      if (data.studentId === studentId) {
        setStudent(data.student);
      }
    };
    EventBus.on('Student.Updated', handler);
    
    return () => EventBus.off('Student.Updated', handler);
  }, [studentId]);
}
```

**Steps**:
1. Define event contract
2. Replace direct call with event publish
3. Subscribe to response event
4. Clean up listener on unmount

#### Pattern 3: Add TenantId to Query

**Before**:
```javascript
const fees = await storageService.find({
  collection: 'fees',
  filters: { studentId }
});
```

**After**:
```javascript
const tenantId = tenantContextService.getCurrentTenantId();
const fees = await storageService.find({
  collection: 'fees',
  tenantId,
  filters: { studentId }
});
```

**Steps**:
1. Get tenantId from context
2. Add to query options
3. Verify query includes tenant filter
4. Test with multiple tenants

#### Pattern 4: Extract Shared Code from Circular Dependency

**Before**:
```javascript
// src/modules/students/utils/helpers.js
export function formatStudentName(student) {
  return `${student.firstName} ${student.lastName}`;
}

// src/modules/transport/utils/helpers.js
export function formatStudentName(student) {  // Duplicate!
  return `${student.firstName} ${student.lastName}`;
}
```

**After**:
```javascript
// src/core/student/studentFormatters.js
export function formatStudentName(student) {
  return `${student.firstName} ${student.lastName}`;
}

// src/modules/students/utils/helpers.js
export { formatStudentName } from '@/core/student/studentFormatters';

// src/modules/transport/utils/helpers.js
export { formatStudentName } from '@/core/student/studentFormatters';
```

**Steps**:
1. Identify duplicate/shared code
2. Extract to `src/core/` or shared service
3. Update imports in both modules
4. Verify no circular dependency

---

## 6. MODULE-SPECIFIC REFACTOR PLANS

### 6.1 Students Module

**Current State**:
- Files: 35
- Violations: 45 (CRITICAL: 0, HIGH: 5, MEDIUM: 30, LOW: 10)
- Compliance Score: 78/100

**Refactor Plan**:
1. Add @owner tags to 3 orphan files (1 day)
2. Fix 5 deep relative imports (1 day)
3. Add memo to 4 list components (1 day)
4. Add unit tests for certificateService (2 days)
5. Fix inline functions in JSX (2 days)

**Owner**: team-students
**Timeline**: Week 9

### 6.2 Fees Module

**Current State**:
- Files: 50
- Violations: 89 (CRITICAL: 8, HIGH: 20, MEDIUM: 40, LOW: 21)
- Compliance Score: 52/100

**Refactor Plan**:
1. **CRITICAL**:
   - Fix 3 missing tenantId queries (1 day)
   - Replace 2 direct student imports with events (2 days)
   - Fix receipt immutability violation (1 day)

2. **HIGH**:
   - Extract business logic from 5 UI components (3 days)
   - Add validation to 10 service methods (2 days)
   - Add error handling to 8 methods (1 day)
   - Add audit logging to all writes (1 day)

3. **MEDIUM**:
   - Add memo to 6 components (1 day)
   - Fix 15 deep imports (1 day)
   - Add lazy loading to 3 pages (1 day)

**Owner**: team-accounts
**Timeline**: Weeks 1-5

### 6.3 Transport Module

**Current State**:
- Files: 25
- Violations: 34 (CRITICAL: 2, HIGH: 8, MEDIUM: 20, LOW: 4)
- Compliance Score: 65/100

**Refactor Plan**:
1. Fix 2 missing tenantId queries (1 day)
2. Add capacity validation (TR-01) (1 day)
3. Add route-stop validation (TR-02) (1 day)
4. Extract business logic from UI (2 days)
5. Add unit tests (2 days)

**Owner**: team-logistics
**Timeline**: Weeks 2-4

### 6.4 Other Modules

**Hostel, Attendance, Exam, etc.**:
- Similar refactor patterns
- Focus on tenant isolation and module boundaries
- Timeline: Weeks 5-8

---

## 7. REFACTOR EXECUTION STRATEGY

### 7.1 Execution Model

**Trunk-Based Development**:
- Main branch always deployable
- Short-lived feature branches (< 3 days)
- Merge via PR with mandatory review

**Code Review Requirements**:
- CRITICAL violations: 2 reviewers + Architecture Lead
- HIGH violations: 2 reviewers
- MEDIUM/LOW: 1 reviewer

**Testing Strategy**:
- Every refactor must have test coverage
- Integration tests for cross-module changes
- Performance tests for UI changes

### 7.2 Rollout Strategy

**Feature Flags**:
```javascript
const REFACTOR_FLAGS = {
  NEW_FEES_CALCULATION: false,  // Week 3
  NEW_TENANT_ISOLATION: false,   // Week 1
  NEW_STUDENT_VALIDATION: false  // Week 4
};
```

**Canary Deployment**:
- Deploy to 1 tenant first
- Monitor for 24 hours
- Roll out to all tenants if stable

**Rollback Trigger**:
- Error rate > 1%
- Performance degradation > 20%
- Any data integrity issue

### 7.3 Communication Plan

**Daily Standup**:
- Refactor progress update
- Blockers discussion
- Plan for next 24 hours

**Weekly Review**:
- Demo completed refactors
- Review metrics (violations fixed, test coverage)
- Adjust timeline if needed

**Architecture Board**:
- Weekly status report
- Escalation for blockers
- Final sign-off

---

## 8. RISK MITIGATION

### 8.1 Identify Risks

| Risk | Probability | Impact | Mitigation |
|------|-----------|--------|------------|
| Data loss during refactor | Low | Critical | Backup before every phase, rollback tested |
| Extended timeline | Medium | Medium | Buffer time, parallel work streams |
| Team burnout | Medium | Low | Rotate refactor tasks, celebrate wins |
| Breaking changes | Low | High | Feature flags, canary deployment |
| Incomplete testing | Low | High | Mandatory code review, CI gates |

### 8.2 Contingency Plans

**Plan A**: Everything goes well
- Timeline: 10 weeks
- Result: All violations fixed, 0 regressions

**Plan B**: Major blocker discovered
- Timeline: +2 weeks
- Action: Escalate to Architecture Board, adjust scope

**Plan C**: Timeline at risk
- Action: Defer MEDIUM/LOW violations, focus on CRITICAL/HIGH

---

## 9. METRICS & TRACKING

### 9.1 Progress Metrics

**Weekly Targets**:
```
Week 1: -5 CRITICAL violations (target: 18 remaining)
Week 2: -10 HIGH violations (target: 57 remaining)
Week 3: -15 HIGH violations (target: 42 remaining)
Week 4: -20 HIGH violations (target: 22 remaining)
Week 5: -22 HIGH violations (target: 0 remaining)
Week 6: -50 MEDIUM violations (target: 92 remaining)
Week 7: -70 MEDIUM violations (target: 22 remaining)
Week 8: -22 MEDIUM violations (target: 0 remaining)
Week 9: -80 LOW violations (target: 0 remaining)
Week 10: Final cleanup, documentation
```

**Success Criteria by Week**:
- [ ] Week 2: 0 CRITICAL violations
- [ ] Week 5: 0 HIGH violations
- [ ] Week 8: 0 MEDIUM violations
- [ ] Week 10: 0 violations (all fixed)

### 9.2 Quality Metrics

**Test Coverage**:
- Current: 45%
- Target: 80%
- Measurement: `npm run test:coverage`

**Performance**:
- Current LCP: 3.2s
- Target LCP: 2.5s
- Measurement: Lighthouse CI

**Architecture Compliance**:
- Current Score: 68/100
- Target Score: 85/100
- Measurement: Audit tool

### 9.3 Tracking Dashboard

Display in shared dashboard:
```
REFACTOR PROGRESS
==================
Overall Compliance: ████████░░ 68% → 85%

CRITICAL:   ████████████ 23 → 0 ✅
HIGH:       ██████████░░ 67 → 0 🔄
MEDIUM:     ████████░░░░ 142 → 0 🔄
LOW:        ██████░░░░░░ 80 → 0 🔄

Module Compliance:
  students: ████████░░ 78% → 95%
  fees:     ██████░░░░ 52% → 90%
  transport:███████░░░ 65% → 90%
  hostel:   ████████░░ 72% → 90%

This Week: 47 violations fixed
Next Week: Target 60 violations
```

---

## 10. REFACTOR COMPLETION CRITERIA

### 10.1 Mandatory Completion

- [ ] All CRITICAL violations fixed (0 remaining)
- [ ] All HIGH violations fixed (0 remaining)
- [ ] All MEDIUM violations fixed (0 remaining) OR deferred with approval
- [ ] All LOW violations fixed OR deferred
- [ ] Test coverage ≥ 80%
- [ ] Performance meets RULE-09 budgets
- [ ] Security audit passes
- [ ] Architecture Board sign-off

### 10.2 Quality Gates

**Gate 1: CRITICAL Violations Cleared (Week 2)**
- [ ] 0 CRITICAL violations
- [ ] All tenant isolation violations fixed
- [ ] All security violations fixed
- [ ] Integration tests pass

**Gate 2: HIGH Violations Cleared (Week 5)**
- [ ] 0 HIGH violations
- [ ] All business logic in services
- [ ] All module boundaries enforced
- [ ] All layer hierarchy enforced

**Gate 3: System Compliance (Week 10)**
- [ ] Overall compliance score ≥ 85/100
- [ ] All tests passing
- [ ] No performance regression
- [ ] Documentation complete

### 10.3 Sign-Off Checklist

**Architecture Board**:
- [ ] Reviewed final audit report
- [ ] Verified all violations addressed
- [ ] Approved architecture compliance

**Security Team**:
- [ ] Security audit passed
- [ ] Penetration testing passed
- [ ] No new vulnerabilities introduced

**QA Team**:
- [ ] All tests passing
- [ ] Regression testing passed
- [ ] User acceptance testing passed

**Tech Leads**:
- [ ] All modules refactored per plan
- [ ] Team trained on new patterns
- [ ] Code review standards enforced

---

## 11. POST-REFACTOR MAINTENANCE

### 11.1 Preventive Measures

**CI/CD Gates**:
```yaml
# Block PRs with CRITICAL violations
- name: Check for CRITICAL violations
  run: |
    CRITICAL=$(jq '.violations | map(select(.severity == "CRITICAL")) | length' violation-register.json)
    if [ $CRITICAL -gt 0 ]; then
      echo "CRITICAL violations found"
      exit 1
    fi

# Warn on HIGH violations
- name: Check for HIGH violations
  run: |
    HIGH=$(jq '.violations | map(select(.severity == "HIGH")) | length' violation-register.json)
    if [ $HIGH -gt 0 ]; then
      echo "WARNING: HIGH violations found: $HIGH"
    fi
```

**Pre-Commit Hooks**:
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check for direct module imports
if git diff --cached --name-only | grep "\.jsx$" | xargs grep -l "from '@/modules/"; then
  echo "ERROR: Direct module import detected"
  exit 1
fi

# Check for missing tenantId
if git diff --cached --name-only | grep "\.js$" | xargs grep -l "storageService.find"; then
  if ! grep -q "tenantId" $(git diff --cached --name-only); then
    echo "ERROR: Missing tenantId in storage query"
    exit 1
  fi
fi
```

### 11.2 Continuous Auditing

**Monthly Architecture Audit**:
- Run full audit scan
- Generate violation report
- Review with Architecture Board
- Plan remediation for new violations

**Quarterly Deep Dive**:
- Review architecture decisions
- Update PACK/RULE documents if needed
- Plan next quarter's improvements

### 11.3 Training & Culture

**New Developer Onboarding**:
- Architecture 101 training (PACK-00 to PACK-10)
- Refactor patterns workshop
- Code review expectations
- Violation classification quiz

**Continuous Learning**:
- Monthly architecture review meetings
- Refactor success stories
- Lessons learned from violations

---

## 12. APPENDIX

### 12.1 Refactor Checklist Template

For each violation:
```markdown
## Refactor: [VIOLATION-ID]

**File**: [file-path]
**Line**: [line-number]
**Severity**: [CRITICAL/HIGH/MEDIUM/LOW]

### Current Code
\```javascript
[code snippet with violation]
\```

### Issue
[Description of problem]

### Fix Plan
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Implementation
\```javascript
[fixed code]
\```

### Testing
- [ ] Unit test added
- [ ] Integration test added
- [ ] Manual testing complete

### Review
- [ ] Code reviewed by [reviewer]
- [ ] Tests passing
- [ ] Deployed to staging
- [ ] Verified in staging

### Sign-Off
- [ ] Tech Lead approval
- [ ] QA approval
```

### 12.2 Rollback Procedure

**Immediate Rollback (< 5 minutes)**:
```bash
# Revert commit
git revert HEAD

# Deploy previous version
./deploy.sh --rollback

# Verify rollback
./health-check.sh
```

**Partial Rollback** (specific module):
```bash
# Revert specific module
git revert [commit-hash] -- src/modules/fees/

# Deploy
./deploy.sh --module fees

# Verify
./health-check.sh --module fees
```

### 12.3 Emergency Contacts

| Role | Contact | Escalation |
|------|---------|-----------|
| Architecture Lead | [name] | Immediate |
| Security Lead | [name] | Immediate |
| Tech Lead (Students) | [name] | < 1 hour |
| Tech Lead (Fees) | [name] | < 1 hour |
| Tech Lead (Transport) | [name] | < 1 hour |
| DevOps | [name] | < 30 minutes |

---

## 13. SUCCESS CRITERIA

✅ **Zero CRITICAL Violations**: No security, tenant isolation, or data integrity issues
✅ **Zero HIGH Violations**: All architecture and business rule violations resolved
✅ **Test Coverage ≥ 80%**: Comprehensive test suite
✅ **Performance Maintained**: No regression from baseline metrics
✅ **Documentation Complete**: All modules documented
✅ **Team Trained**: All developers understand architecture rules
✅ **Automated Enforcement**: CI/CD gates prevent violations
✅ **Architecture Board Sign-Off**: Formal approval of compliance

---

*End of REFACTOR_EXECUTION_PLAN.md*
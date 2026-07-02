# RULE-11: Refactoring & Code Evolution

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Architecture Team  
**Severity:** MEDIUM  
**Category:** Maintenance  
**Applies To:** Code changes, restructuring, technical debt, backward compatibility  
**Detection Method:** Code Review, Architecture Tests, Regression Tests  
**Auto-Fix Available:** No  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Safe Refactoring](#safe-refactoring)
5. [Migration](#migration)
6. [Backward Compatibility](#backward-compatibility)
7. [Breaking Changes](#breaking-changes)
8. [Risk Analysis](#risk-analysis)
9. [Rollback](#rollback)

---

## WHY

### Business Rationale
- **Maintainability**: Clean code reduces development time by 40%.
- **Developer Productivity**: Well-structured code is easier to understand and modify.
- **Bug Reduction**: Refactoring reduces hidden bugs and edge cases.
- **Feature Velocity**: Clean codebase enables faster feature development.

### Technical Rationale
- **Technical Debt Management**: Regular refactoring prevents debt accumulation.
- **Code Quality**: Improves readability, testability, and extensibility.
- **Performance**: Refactoring often reveals optimization opportunities.
- **Team Onboarding**: New developers understand clean code faster.

---

## WHEN

### Applies To
- **Code Smells**: Long methods, large classes, duplicate code, dead code.
- **Performance Issues**: Slow queries, unnecessary re-renders, memory leaks.
- **Architecture Drift**: Code that violates architectural principles.
- **Before Feature Addition**: Refactor before adding new features.
- **After Bug Fixes**: Refactor to prevent similar bugs.

### Does NOT Apply To
- Working production code (only refactor when necessary)
- Third-party libraries (not our code)
- One-off scripts (not maintained)

---

## WHERE

### Scope
- **All Source Code**: `src/` directory
- **All Modules**: Feature modules, master settings, services
- **All Tests**: Test code also needs refactoring
- **Documentation**: Must be updated with code changes

---

## Safe Refactoring

### 1.1 Refactoring Principles

**RULE REF-01**: Refactor in small steps.

```
REFACTORING DISCIPLINE:

1. Make ONE change at a time
2. Run tests after EVERY change
3. Commit after EVERY passing test
4. Never mix refactoring with feature development
5. Keep refactoring PRs small (< 400 lines)

FORBIDDEN:
- Refactoring + new feature in same PR
- Large refactoring (> 1000 lines) without incremental commits
- Refactoring without tests
```

**RULE REF-02**: Tests first, refactor second.

```javascript
// Step 1: Write failing test for desired behavior
describe('StudentService.create', () => {
  it('should validate admission number format', async () => {
    const result = await StudentService.create({
      admissionNumber: 'INVALID@123',
      // ... other fields
    });
    
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Invalid admission number format');
  });
});

// Step 2: Make test pass (implement feature)
// Step 3: Refactor
// Step 4: Verify tests still pass
```

### 1.2 Refactoring Catalog

| Refactoring Type | When to Use | Risk Level | Example |
|------------------|-------------|------------|---------|
| Extract Method | Method > 20 lines | LOW | Break large method into smaller ones |
| Rename | Unclear names | LOW | `process()` → `validateAdmissionNumber()` |
| Move Method | Wrong location | MEDIUM | Move from UI to service |
| Inline Method | Unnecessary indirection | LOW | Inline trivial wrapper |
| Extract Class | Class > 500 lines | MEDIUM | Split `StudentService` into `StudentCRUD`, `StudentValidator` |
| Introduce Parameter Object | > 5 parameters | LOW | `createStudent(a,b,c,d,e,f)` → `createStudent(studentData)` |
| Remove Duplication | Copy-paste code | MEDIUM | Extract to shared function |
| Replace Conditional with Polymorphism | Complex if-else | HIGH | Strategy pattern |
| Introduce Strategy | Algorithm variations | MEDIUM | Fee calculation variants |
| Introduce Factory | Complex object creation | LOW | Factory for different fee types |

### 1.3 Refactoring Checklist

```javascript
const RefactoringChecklist = {
  before: [
    'Write failing tests covering existing behavior',
    'Get code review approval for refactoring plan',
    'Create feature branch from main',
    'Ensure CI passes on current code'
  ],
  
  during: [
    'Make ONE small change',
    'Run tests',
    'Commit with message: "refactor: [description]"',
    'Repeat until refactoring complete'
  ],
  
  after: [
    'Run full test suite',
    'Run architecture validation',
    'Run performance benchmarks',
    'Update documentation',
    'Create PR with "Refactor" label',
    'Get at least 1 reviewer approval'
  ]
};
```

---

## Migration

### 2.1 Data Migration

**RULE REF-MIG-01**: Migrations are reversible.

```javascript
// migrations/005-normalize-admission-numbers.js

export const up = async (storage) => {
  const students = await storage.find({
    collection: 'students',
    filters: { admissionNumber: { $exists: false } }
  });
  
  for (const student of students) {
    await storage.update({
      collection: 'students',
      id: student.id,
      data: {
        admissionNumber: generateAdmissionNumber(student)
      }
    });
  }
  
  // Add index after backfill
  await storage.createIndex({
    collection: 'students',
    field: 'admissionNumber',
    unique: true
  });
};

export const down = async (storage) => {
  // Remove index
  await storage.dropIndex({
    collection: 'students',
    field: 'admissionNumber'
  });
  
  // Remove field (data loss accepted)
  await storage.updateMany({
    collection: 'students',
    filters: {},
    data: { $unset: { admissionNumber: '' } }
  });
};
```

### 2.2 API Migration

**RULE REF-MIG-02**: API versioning for breaking changes.

```javascript
// Old API (v1) - still supported
app.post('/api/v1/students', async (req, res) => {
  const student = await StudentService.createV1(req.body);
  res.json(student);
});

// New API (v2) - with improvements
app.post('/api/v2/students', async (req, res) => {
  const student = await StudentService.createV2(req.body);
  res.json(student);
});

// Gradually shift traffic
// - Month 1: v1 active, v2 available
// - Month 2: 50% traffic to v2
// - Month 3: 100% traffic to v2
// - Month 4: Deprecate v1
```

### 2.3 Storage Layer Schema Migration

```javascript
// Schema migration strategy
const SchemaMigration = {
  additive: {
    description: 'Add new field (backward compatible)',
    risk: 'LOW',
    rollback: 'Remove field',
    example: 'Add middleName field to students'
  },
  
  nullable: {
    description: 'Make field nullable',
    risk: 'MEDIUM',
    rollback: 'Make field required again',
    example: 'Make phone field optional'
  },
  
  transformation: {
    description: 'Transform existing data',
    risk: 'HIGH',
    rollback: 'Restore from backup',
    example: 'Normalize phone numbers to E.164 format'
  },
  
  destructive: {
    description: 'Remove field or table',
    risk: 'CRITICAL',
    rollback: 'Restore from backup',
    example: 'Remove deprecated status field'
  }
};

// Migration phases
const MigrationPhases = {
  PHASE_1: 'Add new structure (parallel)',
  PHASE_2: 'Dual-write (old + new)',
  PHASE_3: 'Backfill existing data',
  PHASE_4: 'Switch reads to new structure',
  PHASE_5: 'Switch writes to new structure',
  PHASE_6: 'Remove old structure',
  PHASE_7: 'Cleanup'
};
```

---

## Backward Compatibility

### 3.1 Compatibility Rules

**RULE REF-COMP-01**: Public APIs remain backward compatible.

```javascript
// Versioned public API
export const StudentAPI = {
  // v1 - stable, backward compatible
  v1: {
    create: (data) => createStudentV1(data),
    get: (id) => getStudentV1(id),
    update: (id, data) => updateStudentV1(id, data)
  },
  
  // v2 - new features, not backward compatible
  v2: {
    create: (data) => createStudentV2(data),
    get: (id, options) => getStudentV2(id, options), // Added options
    update: (id, data, options) => updateStudentV2(id, data, options)
  }
};

// Backward compatibility layer
function createStudent(data) {
  // Support both v1 and v2 formats
  if (data.version === '2.0') {
    return StudentAPI.v2.create(data);
  }
  
  // Default to v1 for backward compatibility
  return StudentAPI.v1.create(data);
}
```

### 3.2 Deprecation Policy

```javascript
// Deprecation warning
function oldMethod() {
  console.warn(
    'DEPRECATION WARNING: oldMethod() is deprecated. ' +
    'Use newMethod() instead. ' +
    'Will be removed in version 3.0.0 (2025-06-01).'
  );
  
  // Still works, but logs warning
  return newMethod(...arguments);
}

// Deprecation lifecycle
const DeprecationLifecycle = {
  announce: 'Announce deprecation in release notes',
  warn: 'Add console.warn() for 6 months',
  document: 'Update docs with migration guide',
  support: 'Maintain for 12 months minimum',
  remove: 'Remove in next major version'
};

// Deprecation tracking
const DeprecatedFeatures = {
  'StudentService.createV1': {
    deprecatedIn: '2.0.0',
    removalIn: '3.0.0',
    replacement: 'StudentService.createV2',
    migrationGuide: 'docs/migration/v1-to-v2.md'
  }
};
```

---

## Breaking Changes

### 4.1 Breaking Change Process

**RULE REF-BREAK-01**: Breaking changes require RFC.

```
BREAKING CHANGE WORKFLOW:

1. Identify Breaking Change
   - Changing public API signature
   - Removing functionality
   - Changing behavior
   - Renaming exports

2. Create RFC (docs/04-decisions/)
   - Describe current behavior
   - Describe new behavior
   - Explain why change is necessary
   - Provide migration guide
   - Assess impact (who's affected)

3. Community Review (minimum 14 days)
   - Gather feedback
   - Address concerns
   - Update RFC

4. Architecture Board Approval (required for CRITICAL/HIGH rules)

5. Implementation
   - Add deprecation warnings
   - Implement new behavior
   - Update documentation
   - Create migration script

6. Communication
   - Release notes with migration guide
   - Email to affected teams
   - Slack announcement

7. Sunset Period (minimum 6 months)
   - v2.x: Add warnings
   - v3.x: Remove old code
```

### 4.2 Breaking Change Categories

| Category | Severity | Process | Example |
|----------|----------|---------|---------|
| API Signature Change | HIGH | RFC + Deprecation | Change function parameters |
| Behavior Change | HIGH | RFC + Deprecation | Change validation rules |
| Removed Export | MEDIUM | RFC + Deprecation | Remove exported function |
| Renamed Export | MEDIUM | RFC + Deprecation | Rename `getStudent` → `fetchStudent` |
| Config Format Change | HIGH | Migration script | Change config file format |
| Storage Layer Schema Change | CRITICAL | Migration + Rollback | Remove Storage Layer column |

### 4.3 Breaking Change Example

```javascript
// BEFORE: v1 API
export class StudentService {
  async getStudent(id) {
    return this.storage.findOne({
      collection: 'students',
      id
    });
  }
}

// AFTER: v2 API (breaking change)
export class StudentService {
  async getStudent(id, options = {}) {
    // New parameter: options
    const { includeDeleted = false, fields = null } = options;
    
    return this.storage.findOne({
      collection: 'students',
      id,
      filters: {
        isDeleted: includeDeleted ? undefined : false
      },
      fields
    });
  }
}

// Migration guide for users:
/**
 * @deprecated Use getStudent(id, options) instead
 * 
 * Before:
 *   const student = await StudentService.getStudent(id);
 * 
 * After:
 *   const student = await StudentService.getStudent(id, {
 *     includeDeleted: false,
 *     fields: ['id', 'firstName', 'lastName']
 *   });
 */
```

---

## Risk Analysis

### 5.1 Risk Assessment Framework

**RULE REF-RISK-01**: Assess risk before refactoring.

```javascript
// Risk assessment matrix
const RiskAssessment = {
  // Factors
  factors: {
    codebaseSize: 'Lines of code affected',
    testCoverage: '% of code covered by tests',
    usage: 'How many modules use this code',
    complexity: 'Cyclomatic complexity',
    dataDependencies: 'How much data depends on this',
    downtime: 'Can this be done without downtime'
  },
  
  // Risk levels
  levels: {
    LOW: {
      criteria: 'Tests pass, < 10 modules affected, reversible',
      process: 'Standard code review',
      approval: 'Tech Lead'
    },
    
    MEDIUM: {
      criteria: 'Tests >80%, < 50 modules affected, rollback possible',
      process: 'Architecture review + code review',
      approval: 'Architecture Board'
    },
    
    HIGH: {
      criteria: 'Core module, > 50 modules affected, requires migration',
      process: 'RFC + Architecture review + Testing plan',
      approval: 'CTO + Architecture Board'
    },
    
    CRITICAL: {
      criteria: 'Data layer, security, multi-tenant isolation',
      process: 'RFC + Full testing + Staged rollout + Rollback plan',
      approval: 'CTO + Security Team + Architecture Board'
    }
  }
};

// Risk assessment example
function assessRefactoringRisk(change) {
  const score = {
    codebaseSize: change.linesOfCode > 1000 ? 3 : change.linesOfCode > 100 ? 2 : 1,
    testCoverage: change.testCoverage < 70 ? 3 : change.testCoverage < 90 ? 2 : 1,
    usage: change.affectedModules > 50 ? 3 : change.affectedModules > 10 ? 2 : 1,
    complexity: change.complexity > 10 ? 3 : change.complexity > 5 ? 2 : 1,
    dataDependencies: change.hasDataMigration ? 3 : 1,
    downtime: change.requiresDowntime ? 3 : 1
  };
  
  const totalScore = Object.values(score).reduce((sum, s) => sum + s, 0);
  
  if (totalScore >= 15) return 'CRITICAL';
  if (totalScore >= 12) return 'HIGH';
  if (totalScore >= 7) return 'MEDIUM';
  return 'LOW';
}
```

### 5.2 Rollback Planning

**RULE REF-ROLL-01**: Every refactoring has rollback plan.

```javascript
// Rollback plan template
const RollbackPlan = {
  // Automated rollback
  automated: {
    git: 'git revert --no-commit HEAD',
    Storage Layer: 'await migration.rollback()',
    cache: 'await cache.invalidatePattern("*")'
  },
  
  // Manual rollback steps
  manual: [
    '1. Deploy previous version',
    '2. Run Storage Layer rollback migration',
    '3. Clear application cache',
    '4. Verify data integrity',
    '5. Notify users of temporary issue'
  ],
  
  // Rollback triggers
  triggers: [
    'Test failures > 10%',
    'Performance degradation > 20%',
    'Error rate > 1%',
    'Data corruption detected',
    'Security vulnerability introduced'
  ],
  
  // Rollback timeline
  timeline: {
    detection: '< 5 minutes',
    decision: '< 10 minutes',
    execution: '< 15 minutes',
    verification: '< 30 minutes'
  }
};
```

---

## Refactoring Anti-Patterns

### 6.1 Prohibited Refactoring Patterns

```javascript
// ❌ FORBIDDEN: Refactoring + Feature in same PR
// commit: "Refactor StudentService and add attendance integration"
// Problem: Can't tell what broke what

// ✅ CORRECT: Separate PRs
// PR 1: "Refactor StudentService - extract validation"
// PR 2: "Feature: Add attendance integration"

// ❌ FORBIDDEN: Big Bang refactoring
// Rewrite entire StudentService in one 5000-line PR
// Problem: High risk, hard to review, hard to rollback

// ✅ CORRECT: Incremental refactoring
// Week 1: Extract validation (500 lines)
// Week 2: Extract fee calculation (300 lines)
// Week 3: Extract reporting (400 lines)

// ❌ FORBIDDEN: Refactoring without tests
// "I'll refactor and then add tests"
// Problem: Can't verify behavior preserved

// ✅ CORRECT: Tests first
// 1. Characterization tests (capture current behavior)
// 2. Refactor
// 3. Verify tests still pass
```

---

## Refactoring Documentation

### 7.1 Documentation Requirements

```javascript
// ADR for significant refactoring
// docs/04-decisions/ADR-006-refactor-student-service.md

# ADR-006: Refactor StudentService

## Status
ACCEPTED

## Context
StudentService has grown to 3000 lines with 15 responsibilities:
- Student CRUD
- Admission number generation
- Fee calculation
- Certificate generation
- Attendance tracking
- Report generation
- ...

This makes it:
- Hard to test (low coverage)
- Hard to maintain (frequent merge conflicts)
- Hard to extend (new features require modifying existing code)
- Hard to understand (new developers overwhelmed)

## Decision
Extract StudentService into focused modules:

```
src/modules/students/
├── services/
│   ├── studentCRUD.js         // CRUD operations
│   ├── studentValidator.js    // Validation logic
│   ├── admissionService.js    // Admission workflow
│   ├── certificateService.js  // Certificate generation
│   └── studentReports.js      // Report generation
```

### Migration Plan

**Phase 1** (Week 1-2): Extract without changing API
- Create new services
- StudentService delegates to new services
- All tests pass

**Phase 2** (Week 3-4): Update internal usage
- Update internal modules to use new services
- Deprecate old StudentService methods

**Phase 3** (Week 5-6): Update external usage
- Update other modules importing StudentService
- Add deprecation warnings

**Phase 4** (Week 7-8): Remove deprecated code
- Remove old StudentService methods
- Update documentation

### Rollback Plan
- Each phase is independently reversible
- Git tags at each phase completion
- Storage Layer changes are additive (no data loss)
- Feature flags to switch between old/new implementations

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Breaking API | MEDIUM | HIGH | Version API, maintain v1 |
| Performance degradation | LOW | MEDIUM | Benchmark at each phase |
| Merge conflicts | MEDIUM | LOW | Small PRs, frequent merges |
| Data inconsistency | LOW | HIGH | Comprehensive testing |

## Consequences
- **Positive**: Easier to maintain, test, extend
- **Positive**: Better separation of concerns
- **Positive**: Reduced merge conflicts
- **Negative**: Temporary API complexity (v1 + v2)
- **Negative**: 2 months of engineering time
```

---

## Continuous Refactoring

### 8.1 Refactoring Culture

**RULE REF-CULT-01**: Boy Scout Rule - leave code better than you found it.

```
BOY SCOUT RULE:

"Always leave the campsite cleaner than you found it."

In practice:
- Fix small issues as you encounter them
- Rename unclear variables
- Extract long methods
- Remove dead code
- Add missing tests

Example:
- You fix a bug in a 100-line method
- While fixing, you notice the method is confusing
- You extract a helper method (20 lines)
- You rename a confusing variable
- You add a test for the edge case
- Net result: Code is slightly better

Over time:
- Small improvements compound
- Code gradually improves
- No massive refactoring needed
```

### 8.2 Refactoring Time Allocation


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

| Activity | Time Allocation |
|----------|----------------|
| New Features | 60% |
| Bug Fixes | 20% |
| Refactoring | 15% |
| Tech Debt | 5% |

**Rule**: Every feature PR should include some refactoring.

---

*End of RULE-11: Refactoring & Code Evolution*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

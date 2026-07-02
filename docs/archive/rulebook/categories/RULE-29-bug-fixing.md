# RULE-29: Bug Fixing Standards

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Development Team  
**Severity:** HIGH  
**Category:** Quality Assurance  
**Applies To:** Bug investigation, fixing, testing, deployment  
**Detection Method:** Bug Reports, Error Tracking, QA Testing  
**Auto-Fix Available:** No  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Bug Lifecycle](#bug-lifecycle)
5. [Bug Triage](#bug-triage)
6. [Investigation](#investigation)
7. [Fix Implementation](#fix-implementation)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Prevention](#prevention)

---

## WHY

### Business Rationale
- **Student/Parent Satisfaction**: Fixing bugs quickly maintains Student/Parent trust.
- **Data Integrity**: Bugs can cause data corruption; quick fixes prevent damage.
- **Cost Efficiency**: Early bug detection reduces fix cost by 10x.
- **Reputation**: High-quality software builds brand reputation.

### Technical Rationale
- **Root Cause Analysis**: Understanding bugs prevents recurrence.
- **Regression Prevention**: Testing ensures fixes don't break other features.
- **Knowledge Sharing**: Documenting bugs helps entire team learn.
- **Continuous Improvement**: Bug trends identify systemic issues.

---

## WHEN

### Applies To
- **Production Bugs**: Issues affecting live users.
- **Critical Bugs**: Data loss, security vulnerabilities, crashes.
- **Performance Bugs**: Slow queries, memory leaks, timeouts.
- **UI Bugs**: Layout issues, broken interactions, accessibility.
- **Integration Bugs**: Third-party service failures.

### Does NOT Apply To
- Feature requests (new functionality)
- Enhancement requests (improvements)
- Documentation bugs (typos, unclear docs)

---

## WHERE

### Scope
- **Bug Tracker**: GitHub Issues, Jira, Linear
- **Bug Reports**: `docs/bugs/[bug-id].md`
- **Fix Implementation**: Code changes in feature branches
- **Regression Tests**: `tests/regression/`
- **Post-Mortems**: `docs/post-mortems/[date]-[bug].md`

---

## Bug Lifecycle

### 1.1 Bug Stages

**RULE BUG-01**: Follow structured bug lifecycle.

```javascript
const BugLifecycle = {
  stages: {
    // Stage 1: Report
    reported: {
      name: 'Reported',
      sources: [
        'Student/Parent feedback',
        'Error tracking (Sentry)',
        'Monitoring alerts',
        'QA testing',
        'Code review'
      ],
      actions: [
        'Create bug ticket',
        'Assign ID (BUG-1234)',
        'Set severity',
        'Assign to team'
      ]
    },
    
    // Stage 2: Triage
    triage: {
      name: 'Triage',
      owner: 'Tech Lead or QA Lead',
      duration: '1-4 hours',
      actions: [
        'Verify bug reproducibility',
        'Assign severity',
        'Assign priority',
        'Assign to developer',
        'Set target fix version'
      ]
    },
    
    // Stage 3: Investigation
    investigation: {
      name: 'Investigation',
      owner: 'Assigned developer',
      duration: '1-8 hours',
      actions: [
        'Reproduce bug',
        'Identify root cause',
        'Assess fix complexity',
        'Document findings',
        'Propose fix approach'
      ]
    },
    
    // Stage 4: Fix
    fix: {
      name: 'Fix',
      owner: 'Assigned developer',
      duration: '1-8 hours',
      actions: [
        'Implement fix',
        'Add regression test',
        'Update documentation',
        'Submit for review'
      ]
    },
    
    // Stage 5: Review
    review: {
      name: 'Code Review',
      owner: 'Peer developer',
      duration: '1-4 hours',
      actions: [
        'Review fix',
        'Suggest improvements',
        'Approve or request changes',
        'Merge to main'
      ]
    },
    
    // Stage 6: Testing
    testing: {
      name: 'Testing',
      owner: 'QA Team',
      duration: '1-2 days',
      actions: [
        'Verify bug is fixed',
        'Regression test',
        'Test edge cases',
        'Security test (if applicable)',
        'Performance test (if applicable)'
      ]
    },
    
    // Stage 7: Deployment
    deployment: {
      name: 'Deployment',
      owner: 'DevOps',
      duration: '1-2 hours',
      actions: [
        'Deploy to staging',
        'Verify fix',
        'Deploy to production',
        'Monitor for issues',
        'Notify stakeholders'
      ]
    },
    
    // Stage 8: Verification
    verification: {
      name: 'Verification',
      owner: 'QA + Inventory Item',
      duration: '1-7 days',
      actions: [
        'Monitor production',
        'Verify with Student/Parent (if reported)',
        'Check metrics',
        'Close bug or reopen'
      ]
    }
  }
};
```

### 1.2 Bug Report Template

```javascript
// Bug report template
const BugReport = {
  id: 'BUG-1234',
  
  // Basic info
  title: 'Student import fails for files with special characters',
  description: 'When importing CSV with special characters in names, import fails with validation error',
  
  // Severity
  severity: 'HIGH', // CRITICAL, HIGH, MEDIUM, LOW
  priority: 'P1',   // P0, P1, P2, P3
  
  // Reporter
  reportedBy: 'John Student/Parent (john@example.com)',
  reportedAt: '2025-01-15T10:30:00Z',
  
  // Environment
  environment: {
    platform: 'web',
    browser: 'Chrome 120',
    os: 'Windows 11',
    appVersion: '2.5.3',
    tenantId: 'tenant-abc'
  },
  
  // Steps to reproduce
  stepsToReproduce: [
    '1. Login as admin',
    '2. Go to Students > Import',
    '3. Upload CSV with name "José García"',
    '4. Click Import',
    '5. Error occurs'
  ],
  
  // Expected vs actual
  expected: 'Student imported successfully with name "José García"',
  actual: 'Error: "Invalid character in name field"',
  
  // Evidence
  evidence: {
    screenshots: ['https://screenshot-bucket/...'],
    logs: ['[Log entry timestamp]'],
    errorMessage: 'Invalid character in name field',
    consoleErrors: ['Uncaught error: ...']
  },
  
  // Impact
  impact: {
    usersAffected: 'All users importing students with non-ASCII names',
    businessImpact: 'Cannot import international students',
    dataLoss: false,
    securityRisk: false
  },
  
  // Investigation
  investigation: {
    rootCause: 'Name validation regex only allows ASCII characters',
    affectedCode: 'src/modules/students/validation.js:45',
    fix: 'Update regex to allow Unicode letters',
    complexity: 'LOW',
    estimatedFixTime: '2 hours'
  },
  
  // Status
  status: 'IN_PROGRESS',
  assignee: 'Jane Developer',
  fixVersion: '2.6.0',
  
  // Related
  relatedBugs: ['BUG-1233'],
  duplicateOf: null,
  
  // Tags
  tags: ['import', 'validation', 'unicode', 'students']
};
```

---

## Bug Triage

### 2.1 Severity Classification

**RULE BUG-SEVERITY-01**: Classify bugs by severity.

```javascript
const BugSeverity = {
  // Critical: System down, data loss, security breach
  CRITICAL: {
    level: 1,
    description: 'System unusable or data loss occurring',
    examples: [
      'Storage Layer down',
      'Authentication broken',
      'Data corruption',
      'Security vulnerability',
      'Payment processing failure'
    ],
    responseTime: '1 hour',
    fixTime: '24 hours',
    escalateTo: 'VP Engineering',
    workaround: 'Attempt emergency fix or rollback'
  },
  
  // High: Major feature broken, many users affected
  HIGH: {
    level: 2,
    description: 'Major feature broken for many users',
    examples: [
      'Cannot create students',
      'Fee calculation wrong',
      'Report generation fails',
      'Search not working'
    ],
    responseTime: '4 hours',
    fixTime: '3 days',
    escalateTo: 'Engineering Manager',
    workaround: 'Manual process or temporary solution'
  },
  
  // Medium: Feature broken, workaround available
  MEDIUM: {
    level: 3,
    description: 'Feature broken but workaround exists',
    examples: [
      'UI layout issue on specific browser',
      'Export missing one column',
      'Slow performance on large datasets',
      'Confusing error message'
    ],
    responseTime: '1 day',
    fixTime: '2 weeks',
    escalateTo: 'Tech Lead',
    workaround: 'Document workaround for users'
  },
  
  // Low: Minor issue, cosmetic
  LOW: {
    level: 4,
    description: 'Minor issue, cosmetic or edge case',
    examples: [
      'Typo in UI',
      'Minor alignment issue',
      'Unused button visible',
      'Documentation error'
    ],
    responseTime: '1 week',
    fixTime: 'Next release',
    escalateTo: 'None',
    workaround: 'None needed'
  }
};

// Priority levels
const BugPriority = {
  P0: {
    description: 'Drop everything, fix now',
    severity: 'CRITICAL',
    action: 'Hotfix immediately'
  },
  
  P1: {
    description: 'Fix in current sprint',
    severity: 'HIGH',
    action: 'Schedule immediately'
  },
  
  P2: {
    description: 'Fix in next sprint',
    severity: 'MEDIUM',
    action: 'Schedule for next release'
  },
  
  P3: {
    description: 'Fix when time permits',
    severity: 'LOW',
    action: 'Backlog'
  }
};
```

### 2.2 Triage Process

```javascript
// Bug triage workflow
class BugTriage {
  async triage(bugReport) {
    // 1. Verify reproducibility
    const reproducible = await this.verifyReproduction(bugReport);
    
    if (!reproducible) {
      return {
        status: 'NEEDS_INFO',
        message: 'Need more information to reproduce',
        questions: [
          'What browser are you using?',
          'Can you provide a screen recording?'
        ]
      };
    }
    
    // 2. Assess severity
    const severity = this.assessSeverity(bugReport);
    bugReport.severity = severity;
    
    // 3. Assess priority
    const priority = this.assessPriority(bugReport);
    bugReport.priority = priority;
    
    // 4. Check for duplicates
    const duplicate = await this.findDuplicate(bugReport);
    if (duplicate) {
      return {
        status: 'DUPLICATE',
        duplicateOf: duplicate.id,
        message: `Duplicate of ${duplicate.id}`
      };
    }
    
    // 5. Assign
    const assignee = await this.assignBug(bugReport);
    bugReport.assignee = assignee;
    
    // 6. Set target version
    const fixVersion = this.determineFixVersion(bugReport);
    bugReport.fixVersion = fixVersion;
    
    return {
      status: 'TRIAGED',
      severity,
      priority,
      assignee,
      fixVersion
    };
  }
  
  assessSeverity(bug) {
    // Critical indicators
    if (bug.impact.dataLoss || bug.impact.securityRisk) {
      return 'CRITICAL';
    }
    
    // High indicators
    if (bug.impact.usersAffected === 'ALL' || 
        bug.severity === 'CRITICAL') {
      return 'HIGH';
    }
    
    if (bug.impact.usersAffected === 'MANY') {
      return 'HIGH';
    }
    
    // Medium indicators
    if (bug.impact.usersAffected === 'SOME' && bug.workaround) {
      return 'MEDIUM';
    }
    
    // Low
    return 'LOW';
  }
}
```

---

## Investigation

### 3.1 Root Cause Analysis

**RULE BUG-INVEST-01**: Systematic investigation.

```javascript
// Bug investigation process
class BugInvestigation {
  async investigate(bugId) {
    // 1. Gather information
    const info = await this.gatherInformation(bugId);
    
    // 2. Reproduce bug
    const reproduced = await this.reproduceBug(info);
    
    if (!reproduced) {
      throw new Error('Cannot reproduce bug - needs more info');
    }
    
    // 3. Isolate cause
    const cause = await this.isolateCause(reproduced);
    
    // 4. Identify root cause
    const rootCause = await this.identifyRootCause(cause);
    
    // 5. Document findings
    await this.documentFindings(bugId, {
      rootCause,
      cause,
      reproduction,
      fix
    });
    
    return {
      bugId,
      reproduced: true,
      rootCause,
      fix: this.proposeFix(rootCause),
      complexity: this.assessComplexity(rootCause),
      estimatedFixTime: this.estimateFixTime(rootCause)
    };
  }
  
  // 5 Whys technique
  async fiveWhys(problem) {
    const whys = [];
    let current = problem;
    
    // Why #1
    whys.push({
      why: 'Why did this happen?',
      answer: current.description
    });
    
    // Why #2
    current = await this.askWhy(current);
    whys.push({
      why: 'Why did that happen?',
      answer: current.description
    });
    
    // Why #3
    current = await this.askWhy(current);
    whys.push({
      why: 'Why did that happen?',
      answer: current.description
    });
    
    // Why #4
    current = await this.askWhy(current);
    whys.push({
      why: 'Why did that happen?',
      answer: current.description
    });
    
    // Why #5
    current = await this.askWhy(current);
    whys.push({
      why: 'Why did that happen?',
      answer: current.description,
      rootCause: true
    });
    
    return whys;
  }
  
  // Example: Student import bug
  // Problem: Import fails on special characters
  // Why #1: Validation rejects special characters
  // Why #2: Regex pattern only allows ASCII
  // Why #3: Regex was written quickly without considering international users
  // Why #4: No requirement for international names in original spec
  // Why #5: Requirements didn't consider global audience
  // Root Cause: Requirements gap + insufficient validation testing
}
```

### 3.2 Debugging Tools

```javascript
// Debugging techniques
const DebuggingTechniques = {
  // 1. Logging
  logging: {
    description: 'Add strategic logging',
    usage: 'Add logs before/after suspected code',
    example: `
      logger.debug('Validating student name', { name });
      const valid = validateName(name);
      logger.debug('Validation result', { valid });
    `
  },
  
  // 2. Breakpoints
  breakpoints: {
    description: 'Use debugger breakpoints',
    usage: 'Pause execution, inspect state',
    IDE: 'VS Code, Chrome DevTools'
  },
  
  // 3. Binary search
  binarySearch: {
    description: 'Comment out code to isolate issue',
    usage: 'Remove half the code, see if bug persists',
    example: `
      // Try without this block
      // if (condition) {
      //   doSomething();
      // }
    `
  },
  
  // 4. Diff debugging
  diffDebugging: {
    description: 'Compare working vs broken version',
    usage: 'Git diff to find what changed',
    command: 'git diff v2.5.0..v2.5.3 -- src/modules/students/'
  },
  
  // 5. Rubber duck
  rubberDuck: {
    description: 'Explain code line-by-line to rubber duck',
    usage: 'Often reveals the bug',
    benefit: 'Forces thorough analysis'
  },
  
  // 6. Stack trace analysis
  stackTrace: {
    description: 'Analyze error stack trace',
    usage: 'Find exact line where error occurred',
    example: `
      Error: Invalid character in name
          at validateName (validation.js:45)
          at StudentService.create (studentService.js:123)
          at async createStudent (route.js:67)
    `
  }
};
```

---

## Fix Implementation

### 4.1 Fix Standards

**RULE BUG-FIX-01**: Follow fix implementation standards.

```javascript
// Bug fix checklist
const BugFixChecklist = {
  before: [
    'Bug reproduced locally',
    'Root cause identified',
    'Fix approach decided',
    'Regression test written (test that fails before fix)',
    'Fix impact assessed'
  ],
  
  during: [
    'Minimal code changes (only fix the bug)',
    'No refactoring in same commit',
    'Add comments explaining fix',
    'Update relevant tests',
    'Follow coding standards',
    'No console.log (use logger)'
  ],
  
  after: [
    'Fix verified (bug no longer occurs)',
    'Regression test passes',
    'All tests passing',
    'Code reviewed',
    'Documentation updated',
    'Stakeholders notified'
  ]
};

// Bug fix example
class BugFixExample {
  // Bug: Import fails on special characters
  
  // Before fix (broken)
  validateName(name) {
    // Only allows ASCII letters
    const regex = /^[a-zA-Z\s]+$/;
    return regex.test(name);
  }
  
  // After fix (correct)
  validateName(name) {
    // Allow Unicode letters (accented, non-Latin scripts, etc.)
    // \p{L} matches any Unicode letter
    const regex = /^[\p{L}\s'-]+$/u;
    
    if (!regex.test(name)) {
      throw new ValidationError(
        'Name contains invalid characters',
        { field: 'name', value: name }
      );
    }
    
    return true;
  }
  
  // Regression test
  test('should accept Unicode characters in names', () => {
    expect(() => validateName('José García')).not.toThrow();
    expect(() => validateName('李明')).not.toThrow(); // Chinese
    expect(() => validateName('Владимир')).not.toThrow(); // Russian
    expect(() => validateName("O'Brien")).not.toThrow();
    
    // Should still reject invalid characters
    expect(() => validateName('John@123')).toThrow();
    expect(() => validateName('Jane!')).toThrow();
  });
}
```

### 4.2 Common Bug Patterns

```javascript
// Common bug patterns and fixes

// Pattern 1: Off-by-one error
// Bug: for (let i = 0; i <= array.length; i++)
// Fix: for (let i = 0; i < array.length; i++)

// Pattern 2: Null/undefined handling
// Bug: const name = Student/Parent.name.toUpperCase();
// Fix: const name = (Student/Parent.name || '').toUpperCase();

// Pattern 3: Async/await
// Bug: const result = fetchData(); return result.data;
// Fix: const result = await fetchData(); return result.data;

// Pattern 4: Mutable default parameters
// Bug: function foo(items = []) { items.push(1); }
// Fix: function foo(items = []) { return [...items, 1]; }

// Pattern 5: Equality
// Bug: if (obj === { a: 1 })
// Fix: if (JSON.stringify(obj) === JSON.stringify({ a: 1 }))

// Pattern 6: Closure in loop
// Bug: for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 100); }
// Fix: for (let i = 0; i < 3; i++) { setTimeout(() => console.log(i), 100); }

// Pattern 7: Floating point
// Bug: if (0.1 + 0.2 === 0.3)
// Fix: if (Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON)

// Pattern 8: Timezone
// Bug: new Date('2025-01-15')
// Fix: new Date('2025-01-15T00:00:00Z')
```

---

## Testing

### 5.1 Regression Testing

**RULE BUG-TEST-01**: Comprehensive bug fix testing.

```javascript
// Bug fix test plan
const BugFixTestPlan = {
  // Test the fix
  fixVerification: {
    description: 'Verify bug is fixed',
    steps: [
      'Reproduce original bug scenario',
      'Verify fix resolves issue',
      'Test edge cases',
      'Test boundary conditions'
    ]
  },
  
  // Regression tests
  regression: {
    description: 'Ensure fix didn\'t break anything',
    tests: [
      'Run all unit tests',
      'Run all integration tests',
      'Run affected feature tests',
      'Manual testing of related features'
    ]
  },
  
  // Performance tests
  performance: {
    description: 'Ensure no performance regression',
    tests: [
      'Measure before/after performance',
      'Check for memory leaks',
      'Verify no N+1 queries introduced',
      'Check for unnecessary re-renders'
    ]
  },
  
  // Security tests
  security: {
    description: 'Ensure no security vulnerabilities',
    tests: [
      'Input validation still works',
      'No SQL injection introduced',
      'No XSS vulnerabilities',
      'No information disclosure'
    ]
  }
};

// Regression test example
describe('Bug #1234: Import fails on special characters', () => {
  let service;
  
  beforeEach(() => {
    service = new StudentImportService();
  });
  
  // Original bug reproduction
  it('should accept Unicode characters in names', () => {
    const csvData = `
      firstName,lastName,email
      José,García,jose@example.com
      李明,Wang,li ming@example.com
      Владимир,Putin,vladimir@example.com
    `;
    
    const result = service.parseCSV(csvData);
    
    expect(result).toHaveLength(3);
    expect(result[0].firstName).toBe('José');
    expect(result[1].firstName).toBe('李明');
  });
  
  // Regression test: ensure ASCII still works
  it('should still accept ASCII names', () => {
    const csvData = `
      firstName,lastName,email
      John,Doe,john@example.com
    `;
    
    const result = service.parseCSV(csvData);
    
    expect(result).toHaveLength(1);
    expect(result[0].firstName).toBe('John');
  });
  
  // Regression test: ensure invalid chars still rejected
  it('should reject invalid characters', () => {
    const csvData = `
      firstName,lastName,email
      John@123,Smith,john@example.com
    `;
    
    expect(() => service.parseCSV(csvData)).toThrow();
  });
});
```

---

## Deployment

### 6.1 Hotfix Process

**RULE BUG-DEPLOY-01**: Fast-track critical bug fixes.

```javascript
// Hotfix workflow
const HotfixProcess = {
  // When to use hotfix
  criteria: {
    severity: ['CRITICAL', 'HIGH'],
    scenarios: [
      'Data loss occurring',
      'Security vulnerability',
      'System down for all users',
      'Payment processing broken'
    ]
  },
  
  // Hotfix workflow
  workflow: {
    steps: [
      '1. Create hotfix branch from main: git checkout -b hotfix/BUG-1234 main',
      '2. Implement minimal fix (only the bug fix)',
      '3. Add regression test',
      '4. Fast-track code review (1 hour SLA)',
      '5. Merge to main',
      '6. Deploy immediately',
      '7. Monitor closely (1 hour)',
      '8. Backport to previous release if needed',
      '9. Notify stakeholders',
      '10. Schedule post-mortem if needed'
    ]
  },
  
  // Hotfix branch naming
  branchNaming: {
    format: 'hotfix/BUG-{id}-{short-description}',
    example: 'hotfix/BUG-1234-unicode-import'
  }
};

// Critical bug fix
async function deployHotfix(bugId, fix) {
  console.log(`Deploying hotfix for ${bugId}...`);
  
  // 1. Create hotfix branch
  await exec('git checkout -b hotfix/BUG-1234 main');
  
  // 2. Apply fix
  await applyFix(fix);
  
  // 3. Add regression test
  await addRegressionTest(bugId);
  
  // 4. Run tests
  const testsPassed = await runTests();
  
  if (!testsPassed) {
    throw new Error('Tests failed - hotfix blocked');
  }
  
  // 5. Fast-track review
  const review = await requestUrgentReview({
    branch: 'hotfix/BUG-1234',
    reviewers: ['tech-lead'],
    sla: '1 hour'
  });
  
  if (!review.approved) {
    throw new Error('Hotfix review rejected');
  }
  
  // 6. Merge
  await mergeToMain('hotfix/BUG-1234');
  
  // 7. Deploy
  await deployToProduction();
  
  // 8. Monitor
  await monitorFor(60); // 60 minutes
  
  console.log('Hotfix deployed successfully');
}
```

---

## Prevention

### 7.1 Bug Prevention

**RULE BUG-PREVENT-01**: Prevent bugs proactively.

```javascript
const BugPrevention = {
  // Prevention strategies
  strategies: {
    codeReview: {
      description: 'Peer review all changes',
      effectiveness: 'Prevents 60% of bugs',
      checklist: [
        'Logic errors checked',
        'Edge cases considered',
        'Error handling present',
        'Tests included',
        'Security reviewed'
      ]
    },
    
    testing: {
      description: 'Comprehensive test coverage',
      effectiveness: 'Prevents 50% of bugs',
      coverage: {
        unit: '90%',
        integration: '80%',
        e2e: 'Critical paths'
      }
    },
    
    staticAnalysis: {
      description: 'Use linting and type checking',
      effectiveness: 'Prevents 30% of bugs',
      tools: ['ESLint', 'TypeScript', 'SonarQube']
    },
    
    automatedTesting: {
      description: 'CI/CD runs all tests',
      effectiveness: 'Catches 70% of regressions',
      triggers: ['Every PR', 'Every commit to main']
    },
    
    monitoring: {
      description: 'Monitor production for errors',
      effectiveness: 'Catches 90% of remaining bugs',
      tools: ['Sentry', 'Datadog', 'CloudWatch']
    }
  },
  
  // Common causes and prevention
  commonCauses: {
    nullReference: {
      cause: 'Accessing property of null/undefined',
      prevention: [
        'Use optional chaining (Student/Parent?.name)',
        'Add null checks',
        'Use TypeScript',
        'Enable strict mode'
      ]
    },
    
    asyncErrors: {
      cause: 'Not awaiting promises',
      prevention: [
        'Always use async/await',
        'Enable no-floating-promises lint rule',
        'Review all async code'
      ]
    },
    
    sqlInjection: {
      cause: 'String concatenation in queries',
      prevention: [
        'Use parameterized queries',
        'Use ORM',
        'Code review',
        'Security testing'
      ]
    },
    
    raceConditions: {
      cause: 'Concurrent access to shared state',
      prevention: [
        'Use transactions',
        'Implement locking',
        'Avoid shared mutable state',
        'Use immutable data structures'
      ]
    }
  }
};
```

### 7.2 Post-Mortem

```javascript
// Post-mortem for critical bugs
class PostMortem {
  async create(bugId) {
    const bug = await this.getBug(bugId);
    
    return {
      title: `Post-Mortem: ${bug.title}`,
      date: new Date().toISOString(),
      
      // Timeline
      timeline: [
        { time: '10:00', event: 'Bug introduced in commit abc123' },
        { time: '14:30', event: 'Bug detected by monitoring' },
        { time: '14:35', event: 'Engineer notified' },
        { time: '14:45', event: 'Investigation started' },
        { time: '15:30', event: 'Root cause identified' },
        { time: '16:00', event: 'Fix deployed' },
        { time: '17:00', event: 'Verified resolved' }
      ],
      
      // Impact
      impact: {
        duration: '3 hours',
        usersAffected: 500,
        dataLoss: false,
        financialImpact: '$5000',
        reputationImpact: 'Medium'
      },
      
      // Root cause
      rootCause: {
        immediate: 'Missing null check in Student/Parent authentication',
        underlying: 'Insufficient testing of edge case',
        contributing: [
          'Complex authentication flow',
          'Multiple code paths',
          'No unit test for null Student/Parent'
        ]
      },
      
      // Resolution
      resolution: {
        fix: 'Added null check and default handling',
        timeToFix: '1.5 hours',
        deployed: '2025-01-15T16:00:00Z'
      },
      
      // Lessons learned
      lessons: {
        whatWentWell: [
          'Monitoring detected issue quickly',
          'Team responded promptly',
          'Root cause identified quickly'
        ],
        whatWentWrong: [
          'Bug not caught in testing',
          'Insufficient edge case coverage',
          'No alert for this scenario'
        ],
        improvements: [
          'Add unit test for null Student/Parent',
          'Add monitoring alert',
          'Review similar code paths',
          'Update testing guidelines'
        ]
      },
      
      // Action items
      actionItems: [
        {
          action: 'Add unit test for null Student/Parent',
          owner: 'Jane Developer',
          dueDate: '2025-01-22',
          status: 'TODO'
        },
        {
          action: 'Add monitoring alert',
          owner: 'DevOps Team',
          dueDate: '2025-01-22',
          status: 'TODO'
        },
        {
          action: 'Review all authentication code',
          owner: 'Security Team',
          dueDate: '2025-01-29',
          status: 'TODO'
        }
      ]
    };
  }
}
```

---

## Bug Metrics

### 8.1 Bug Tracking Metrics


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

```javascript
// Bug metrics
const BugMetrics = {
  // Key metrics
  metrics: {
    // Bug discovery rate
    discoveryRate: {
      description: 'Bugs found per week',
      calculation: 'COUNT(bugs) / time_period',
      target: '< 5 per week for mature features'
    },
    
    // Bug severity distribution
    severityDistribution: {
      description: 'Percentage by severity',
      target: {
        critical: '< 5%',
        high: '< 20%',
        medium: '< 50%',
        low: '< 25%'
      }
    },
    
    // Time to fix
    timeToFix: {
      description: 'Average time from report to fix',
      calculation: 'AVG(fixedAt - reportedAt)',
      target: {
        critical: '< 24 hours',
        high: '< 3 days',
        medium: '< 2 weeks',
        low: '< 1 month'
      }
    },
    
    // Bug reopening rate
    reopenRate: {
      description: 'Percentage of bugs that get reopened',
      calculation: 'COUNT(reopened) / COUNT(fixed)',
      target: '< 10%'
    },
    
    // Bug escape rate
    escapeRate: {
      description: 'Bugs found in production',
      calculation: 'COUNT(production_bugs) / COUNT(total_bugs)',
      target: '< 5%'
    }
  },
  
  // Dashboard
  dashboard: {
    widgets: [
      {
        title: 'Open Bugs by Severity',
        type: 'bar_chart',
        data: 'GROUP BY severity, COUNT'
      },
      {
        title: 'Bugs Over Time',
        type: 'line_chart',
        data: 'DATE(reportedAt), COUNT'
      },
      {
        title: 'Average Time to Fix',
        type: 'gauge',
        data: 'AVG(fixedAt - reportedAt)',
        target: '< 3 days'
      },
      {
        title: 'Top Buggy Components',
        type: 'table',
        data: 'GROUP BY component, COUNT',
        sort: 'DESC'
      }
    ]
  }
};
```

---

*End of RULE-29: Bug Fixing Standards*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

# RULE-12: Git Standards

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team DevOps Team  
**Severity:** MEDIUM  
**Category:** Process  
**Applies To:** Version control, branching, commits, releases, collaboration  
**Detection Method:** Git Hooks, CI/CD Pipeline, Code Review  
**Auto-Fix Available:** Yes  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Commit Standards](#commit-standards)
5. [Branch Rules](#branch-rules)
6. [Release Rules](#release-rules)
7. [Hotfix Rules](#hotfix-rules)
8. [Rollback](#rollback)
9. [Tagging](#tagging)

---

## WHY

### Business Rationale
- **Traceability**: Every change is tracked and auditable for compliance.
- **Collaboration**: Clear git workflow enables team collaboration.
- **Deployment Safety**: Proper branching prevents production issues.
- **Incident Response**: Fast rollback capability minimizes downtime.

### Technical Rationale
- **Code History**: Git history documents why changes were made.
- **Parallel Development**: Branches enable feature isolation.
- **Release Management**: Tags mark production releases.
- **Code Review**: Pull requests enable quality gates.

---

## WHEN

### Applies To
- **All Code Changes**: Every change must be committed.
- **All Features**: Developed in feature branches.
- **All Bug Fixes**: Documented in commits.
- **All Releases**: Tagged and documented.
- **All Deployments**: Tracked via git.

### Does NOT Apply To
- Temporary experiments (different workflow)
- One-off scripts (no version control needed)
- Generated files (don't commit)

---

## WHERE

### Scope
- **Repository**: `https://github.com/nandram218/erp-v2.git`
- **Main Branch**: `main` (production-ready code)
- **Develop Branch**: `develop` (integration branch)
- **Feature Branches**: `feature/*`
- **Hotfix Branches**: `hotfix/*`
- **Release Branches**: `release/*`

---

## Commit Standards

### 1.1 Commit Message Format

**RULE GIT-COMMIT-01**: Conventional commits specification.

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc. (no code change)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes to build system or dependencies
- `ci`: Changes to CI configuration files
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

### 1.2 Commit Examples

```bash
# Feature commit
git commit -m "feat(students): add student promotion workflow

- Add promoteStudent method to StudentService
- Emit Student.Promoted event
- Update fees on promotion
- Add tests for promotion logic

Closes #123"

# Bug fix commit
git commit -m "fix(fees): prevent duplicate fee calculation

- Add idempotency check before fee calculation
- Cache calculated fees per student per academic year
- Fixes issue where recalculating fees created duplicates

Fixes #456"

# Refactor commit
git commit -m "refactor(storage): extract tenant isolation logic

- Move tenant isolation from StorageService to TenantAwareMixin
- Simplify StorageService constructor
- No functional changes

BREAKING CHANGE: None (internal refactoring)"

# Documentation commit
git commit -m "docs(README): update installation instructions

- Add Windows-specific steps
- Clarify Node.js version requirement"

# Hotfix commit
git commit -m "hotfix(auth): fix login token expiration

- Change access token expiry from 1h to 15m
- Fixes issue where expired tokens accepted
- Security patch for CVE-2025-1234

Fixes #789"
```

### 1.3 Commit Guidelines

```bash
# CORRECT: Clear, descriptive commit message
git commit -m "feat(students): add bulk import functionality"

# CORRECT: Commit with body explaining why
git commit -m "fix(attendance): handle timezone edge case

Attendance marks from different time zones were off by 1 day.
This fix normalizes all timestamps to IST before saving."

# CORRECT: Reference issue
git commit -m "feat(exam): implement grade calculator

Closes #234
Implements requirement from RFC-012"

# FORBIDDEN: Vague message
git commit -m "fix bug"
git commit -m "update"
git commit -m "WIP"

# FORBIDDEN: Too long
git commit -m "Add validation to student form and fix the date picker issue that was causing problems with older browsers and also update the CSS for better mobile responsiveness"

# FORBIDDEN: Multiple concerns
git commit -m "feat: add students and fix fees bug and update docs"
```

### 1.4 Commit Content Rules

**RULE GIT-COMMIT-02**: Atomic commits.

```bash
# CORRECT: One logical change per commit
git add src/modules/students/studentService.js
git commit -m "feat(students): add student validation"

git add src/modules/students/__tests__/studentService.test.js
git commit -m "test(students): add validation tests"

# FORBIDDEN: Mix concerns in one commit
git add src/modules/students/studentService.js
git add src/modules/fees/feeService.js
git add README.md
git commit -m "various updates"
```

---

## Branch Rules

### 2.1 Branch Naming Convention

**RULE GIT-BRANCH-01**: Structured branch names.

```
Branch naming patterns:

feature/{module}-{short-description}
  Examples:
  - feature/students-bulk-import
  - feature/fees-discount-engine
  - feature/attendance-biometric

fix/{issue-number}-{short-description}
  Examples:
  - fix/456-duplicate-fee-calculation
  - fix/789-login-token-expiry

hotfix/{issue-number}-{short-description}
  Examples:
  - hotfix/999-security-vulnerability

release/{version}
  Examples:
  - release/2.1.0

chore/{description}
  Examples:
  - chore/upgrade-dependencies
  - chore/update-ci-config
```

### 2.2 Branch Hierarchy

```
main (production-ready)
  ├── develop (integration branch)
  │   ├── feature/students-bulk-import
  │   ├── feature/fees-discount
  │   └── feature/attendance-report
  │
  ├── release/2.1.0
  │   └── (cherry-picked from develop)
  │
  └── hotfix/999-critical-security-fix
      └── (branched from main)
```

### 2.3 Branch Lifecycle

```bash
# Feature branch workflow
git checkout develop
git pull origin develop
git checkout -b feature/students-bulk-import

# Work on feature
git add .
git commit -m "feat(students): add CSV parser"

# Keep feature branch updated
git fetch origin
git rebase origin/develop

# Push to remote
git push origin feature/students-bulk-import

# Create PR to develop
# After approval and merge:
git checkout develop
git pull origin develop
git branch -d feature/students-bulk-import
```

**RULE GIT-BRANCH-02**: Keep branches short-lived.

```javascript
const BranchHealthMetrics = {
  maxAge: 7, // Days before branch is stale
  maxCommitsBehind: 20, // Max commits behind develop
  maxFilesChanged: 500, // Max changed files
  
  actions: {
    stale: 'Notify author to merge or rebase',
    tooOld: 'Require rebase or create new branch',
    tooLarge: 'Require splitting into smaller PRs'
  }
};
```

---

## Release Rules

### 3.1 Release Process

**RULE GIT-REL-01**: Semantic versioning.

```javascript
// Semantic versioning: MAJOR.MINOR.PATCH
const Versioning = {
  // MAJOR: Breaking changes
  bump: 'Increment when API changes or behavior changes',
  example: '1.5.2 → 2.0.0',
  
  // MINOR: New features (backward compatible)
  bump: 'Increment when adding features',
  example: '1.5.2 → 1.6.0',
  
  // PATCH: Bug fixes (backward compatible)
  bump: 'Increment for bug fixes only',
  example: '1.5.2 → 1.5.3'
};

// Version examples:
// 1.0.0 → 1.0.1: Bug fix
// 1.0.0 → 1.1.0: New feature (backward compatible)
// 1.0.0 → 2.0.0: Breaking change
```

### 3.2 Release Branch Workflow

```bash
# Step 1: Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/2.1.0

# Step 2: Bump version
npm version minor --no-git-tag-version
# Updates package.json to 2.1.0

git add package.json
git commit -m "chore(release): bump version to 2.1.0"

# Step 3: Update changelog
# (Manual step)
git add CHANGELOG.md
git commit -m "docs(release): update changelog for 2.1.0"

# Step 4: Final testing on release branch
# Run full test suite, QA testing

# Step 5: Merge to main
git checkout main
git merge release/2.1.0 --no-ff
git tag -a v2.1.0 -m "Release version 2.1.0"
git push origin main --tags

# Step 6: Merge back to develop
git checkout develop
git merge release/2.1.0 --no-ff
git push origin develop
```

### 3.3 Release Checklist

```javascript
const ReleaseChecklist = {
  code: [
    'All tests passing',
    'No lint errors',
    'No security vulnerabilities',
    'Bundle size within budget',
    'Performance benchmarks pass'
  ],
  
  documentation: [
    'CHANGELOG.md updated',
    'README.md updated',
    'API documentation updated',
    'Migration guide (if needed)',
    'Release notes published'
  ],
  
  quality: [
    'Code reviewed',
    'QA tested',
    'Smoke tested in staging',
    'Storage Layer migrations tested',
    'Rollback plan documented'
  ],
  
  deployment: [
    'Docker image built',
    'Deployed to staging',
    'Staging smoke tests pass',
    'Deployed to production',
    'Production smoke tests pass',
    'Monitoring dashboards verified'
  ]
};
```

---

## Hotfix Rules

### 4.1 Hotfix Workflow

**RULE GIT-HOTFIX-01**: Fast-track critical bug fixes.

```bash
# Step 1: Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/999-security-vulnerability

# Step 2: Implement fix
# (Make minimal changes to fix the issue)
git add .
git commit -m "hotfix(auth): fix token validation vulnerability

CVE-2025-XXXX: Tokens not properly validated
- Add signature verification
- Add expiration check
- Add issuer validation

Fixes #999"

# Step 3: Test the fix
npm test
npm run test:integration

# Step 4: Merge to main
git checkout main
git merge hotfix/999-security-vulnerability --no-ff
git tag -a v1.5.3 -m "Hotfix: Security vulnerability CVE-2025-XXXX"
git push origin main --tags

# Step 5: Merge to develop
git checkout develop
git merge hotfix/999-security-vulnerability --no-ff
git push origin develop
```

### 4.2 Hotfix Criteria

```javascript
const HotfixCriteria = {
  mustHave: [
    'Production issue affecting users',
    'Data corruption or loss risk',
    'Security vulnerability',
    'Cannot wait for next release cycle'
  ],
  
  process: [
    'Create hotfix branch from main',
    'Minimal change to fix issue only',
    'Fast-track code review (4 hours)',
    'Deploy immediately after approval',
    'Merge back to develop'
  ],
  
  examples: [
    'Payment processing failure',
    'Login system down',
    'Data export corruption',
    'Security breach',
    'Critical bug blocking all users'
  ],
  
  counterExamples: [
    'Minor UI bug',
    'Feature enhancement',
    'Nice-to-have improvement',
    'Non-critical performance issue'
  ]
};
```

---

## Rollback

### 5.1 Rollback Procedures

**RULE GIT-ROLL-01**: Quick rollback capability.

```bash
# Method 1: Git revert (safest)
git checkout main
git log --oneline -10
# Find commit to revert: abc1234

git revert abc1234 --no-edit
git push origin main

# Creates new commit that undoes changes

# Method 2: Git reset (dangerous - rewrites history)
git reset --hard HEAD~1
git push origin main --force

# ⚠️ DANGER: Only use if not yet pushed to others
# ⚠️ DANGER: Requires force push (disrupts team)

# Method 3: Rollback to tagged release
git checkout main
git pull origin main
git reset --hard v1.5.2
git push origin main --force

# ⚠️ DANGER: Loses all commits after tag
```

### 5.2 Rollback Decision Tree

```javascript
const RollbackDecision = {
  // When to rollback
  immediate: [
    'Production data corruption',
    'Security breach',
    'Service completely down',
    'Payment system failure'
  ],
  
  // When to investigate first
  investigate: [
    'Performance degradation',
    'Intermittent errors',
    'UI glitches',
    'Non-critical feature broken'
  ],
  
  // Rollback process
  process: [
    '1. Assess impact and scope',
    '2. Determine rollback method',
    '3. Communicate to team',
    '4. Execute rollback',
    '5. Verify rollback successful',
    '6. Investigate root cause',
    '7. Create fix in hotfix branch',
    '8. Deploy fix'
  ]
};
```

---

## Tagging

### 6.1 Tag Conventions

**RULE GIT-TAG-01**: Semantic versioning tags.

```bash
# Release tags
git tag -a v1.0.0 -m "Release: Version 1.0.0"
git tag -a v1.1.0 -m "Release: Student module"
git tag -a v2.0.0 -m "Release: Multi-tenant support"

# Hotfix tags
git tag -a v1.0.1 -m "Hotfix: Fix login bug"
git tag -a v1.0.2-hotfix -m "Hotfix: Security patch"

# Alpha/Beta tags (for testing)
git tag -a v2.1.0-alpha.1 -m "Alpha: New fee engine"
git tag -a v2.1.0-beta.1 -m "Beta: Testing release"

# List tags
git tag -l

# Push tags to remote
git push origin --tags

# Checkout specific tag
git checkout v1.0.0
```

### 6.2 Tag Naming Rules

```javascript
const TagNaming = {
  format: 'v{major}.{minor}.{patch}',
  
  examples: {
    release: 'v1.5.0',
    hotfix: 'v1.5.1',
    alpha: 'v2.0.0-alpha.1',
    beta: 'v2.0.0-beta.1',
    rc: 'v2.0.0-rc.1' // Release candidate
  },
  
  rules: [
    'Always prefix with "v"',
    'Use semantic versioning',
    'Tag only on main branch',
    'Sign tags for releases (optional but recommended)',
    'Never delete published tags',
    'Tag message must describe what changed'
  ]
};
```

---

## Git Hooks

### 7.1 Automated Checks

**RULE GIT-HOOK-01**: Enforce standards via hooks.

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Run linting
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Linting failed. Please fix errors before committing."
  exit 1
fi

# Run tests
npm run test:affected
if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Please fix before committing."
  exit 1
fi

# Check commit message format
COMMIT_MSG=$(git diff --cached --name-only | grep -E '\.(js|jsx)$')
if [ -n "$COMMIT_MSG" ]; then
  # Ensure tests were updated
  if ! git diff --cached --name-only | grep -q "\.test\.(js|jsx)$"; then
    echo "⚠️  Warning: No tests updated for code changes"
  fi
fi

echo "✅ Pre-commit checks passed"
exit 0
```

### 7.2 Commit Message Hook

```bash
# .git/hooks/commit-msg
#!/bin/bash

COMMIT_MSG=$(cat $1)
PATTERN="^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)\([a-z-]+\)\: .{10,}"

if ! echo "$COMMIT_MSG" | grep -qE "$PATTERN"; then
  echo "❌ Invalid commit message format!"
  echo ""
  echo "Format: <type>(<scope>): <description>"
  echo ""
  echo "Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert"
  echo "Scope: students, fees, attendance, etc."
  echo "Description: Minimum 10 characters"
  echo ""
  echo "Example: feat(students): add bulk import functionality"
  exit 1
fi

exit 0
```

---

## Collaboration

### 8.1 Pull Request Process

**RULE GIT-PR-01**: PR requirements.

```javascript
const PullRequestRequirements = {
  size: {
    maxLines: 400,
    maxFiles: 20,
    recommendation: 'Split into multiple PRs if larger'
  },
  
  content: {
    description: 'Must describe what and why',
    tests: 'Must include tests',
    documentation: 'Must update docs if needed',
    migration: 'Must include migration guide if breaking change'
  },
  
  review: {
    approvals: 2, // Minimum 2 approvals
    ciChecks: 'All must pass',
    securityReview: 'Required for auth/payment changes',
    architectureReview: 'Required for cross-module changes'
  },
  
  checklist: [
    'Code follows style guidelines',
    'Self-review completed',
    'Tests added/updated',
    'Documentation updated',
    'No merge conflicts',
    'All CI checks pass',
    'At least 2 approvals received'
  ]
};
```

### 8.2 Code Review Guidelines

```markdown
# Pull Request Template

## Description
[Describe what this PR does and why]

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issues
- Closes #123
- Relates to #456

## Changes Made
- Added student bulk import functionality
- Added CSV parser for student data
- Added validation for imported data
- Added tests (coverage: 95%)

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Deployment Notes
[Any special deployment steps or considerations]
```

---

## Commitizen Integration

### 9.1 Standardized Commits


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

```bash
# Using commitizen (recommended)
npm install -D commitizen

# Use instead of git commit
npx cz

# Interactive prompt:
# ? Select the type of change: feat
# ? What is the scope?: students
# ? Write a short description: add bulk import
# ? Write a longer description (optional):
# ? Are there any breaking changes?: No
# ? Does this change affect any open issues?: Yes, #123

# Automatically formats commit message
```

---

*End of RULE-12: Git Standards*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

# RULE-30: Code Review Standards

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** Development Team Lead  
**Authority:** Architecture Team  
**Severity:** HIGH  
**Category:** Quality Assurance  
**Applies To:** All pull requests, code changes, configuration changes  
**Detection Method:** Pull Request Reviews, Quality Gates  
**Auto-Fix Available:** No  
**Breaking Change Process:** Requires Architecture Team approval  
**Who May Modify:** Senior Developers, Tech Leads  
**Who Cannot Modify:** Junior Developers (may propose, cannot approve changes)

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Review Process](#review-process)
5. [Review Criteria](#review-criteria)
6. [Review Etiquette](#review-etiquette)
7. [Review Checklist](#review-checklist)
8. [Review Tools](#review-tools)
9. [Validation](#validation)
10. [Common Violations](#common-violations)
11. [Manual Fix](#manual-fix)
12. [Related Rules](#related-rules)
13. [Related Decisions](#related-decisions)

---

## WHY

### Business Rationale
- **Quality**: Code review catches 60% of bugs before production, reducing defect resolution cost by 5-10x.
- **Knowledge Sharing**: Team learns from each other's implementations and patterns.
- **Consistency**: Maintains code quality standards across all ERP-v2 modules (Students, Fees, Transport, Hostel, Library, Attendance).
- **Mentorship**: Junior developers learn from senior code patterns.

### Technical Rationale
- **Early Detection**: Cheaper to fix bugs in review than in production.
- **Architecture Compliance**: Ensures code follows ERP-v2 layered architecture (RULE-01).
- **Security**: Multiple eyes catch security issues in student data, fee transactions, authentication.
- **Maintainability**: Readable code is easier to maintain across multiple developers.

---

## WHEN

### Applies To
- **All Pull Requests**: Every code change must be reviewed before merge.
- **All Branches**: Feature branches, bugfix branches, hotfixes.
- **All Changes**: Code, configuration, Storage Layer migrations, documentation.
- **All Authors**: Junior and senior developers alike.

### Does NOT Apply To
- Emergency hotfixes (review required within 24 hours)
- Documentation-only changes (optional review)
- Typos in comments (auto-fix via prettier)

---

## WHERE

### Scope
- **Pull Requests**: GitHub PRs in erp-v2 repository
- **Review Checklists**: Referenced in code review process
- **Review Guidelines**: Part of this rule
- **Review Tools**: GitHub, GitLab, VS Code extensions

---

## Review Process

### 1.1 Review Workflow

```
RULE CR-01: Follow structured review process.
```

**Step 1: Author Preparation**
- Write clear PR description following template
- Keep PR size manageable (< 400 lines)
- Self-review code first
- Run tests locally
- Ensure CI passes
- Request appropriate reviewers

**Step 2: Reviewer Review**
- Review within 24 hours (4 hours for hotfix)
- Check code correctness
- Check adherence to standards
- Check test coverage
- Leave constructive feedback
- Approve or request changes

**Step 3: Author Addresses Feedback**
- Respond to all comments
- Make requested changes
- Push updates
- Request re-review if significant changes

**Step 4: Final Approval**
- Verify all concerns addressed
- Approve PR
- Merge when ready

### 1.2 PR Size Limits

| Size | Lines | Description | Action |
|------|-------|-------------|--------|
| Optimal | < 200 | Easy to review, 15-30 minutes | Merge after approval |
| Acceptable | 200-400 | Reviewable, 30-60 minutes | Merge after approval |
| Large | 400-800 | Requires careful review, 1-2 hours | Consider splitting PR |
| Too Large | > 800 | Too large to review effectively | Must split into smaller PRs |

### 1.3 Reviewer Assignment

```
RULE CR-02: Follow reviewer assignment rules.
```

- **Minimum Reviewers**: 2 for most changes
- **Senior Required**: At least 1 senior developer for all PRs
- **Domain Expert Review**:
  - Students module → team-students
  - Fees module → team-fees, tech-lead-fees (financial logic)
  - Security → security-team
  - Storage Layer → dba-team
- **Cross-Team Review**: Shared code reviewed by platform-team

---

## Review Criteria

### 2.1 What to Review

```
RULE CR-03: Review code against comprehensive criteria.
```

#### Category 1: Functionality
- Logic is correct
- Edge cases handled
- Error handling present
- No infinite loops
- No race conditions
- Business rules implemented correctly (per ERP-v2 domain rules)

#### Category 2: Architecture (RULE-01)
- Follows layer rules (Presentation → Service → Storage)
- Service layer used correctly
- No UI in services
- Proper separation of concerns
- No circular dependencies

#### Category 3: Security (RULE-08)
- Input validated (RULE-18)
- No SQL injection
- No XSS vulnerabilities
- Authentication/authorization correct
- Sensitive data (student PII, fee transactions) not logged
- Encryption used where needed

#### Category 4: Performance (RULE-09)
- No N+1 queries
- No unnecessary re-renders
- Proper indexing for queries
- Efficient data structures
- No memory leaks
- Pagination implemented for large datasets

#### Category 5: Testing (RULE-10)
- Unit tests written
- Test coverage adequate (> 80%)
- Edge cases tested
- Error cases tested
- Tests actually pass

#### Category 6: Maintainability (RULE-14)
- Clear variable/function names
- Functions are small (< 50 lines)
- No duplicated code
- Comments explain why, not what
- Complex logic documented
- Follows coding standards

#### Category 7: Error Handling (RULE-26)
- Errors caught and handled
- Meaningful error messages
- Proper logging (RULE-19)
- Student/Parent-friendly messages
- No console.log statements

### 2.2 Severity Levels

| Severity | Description | Examples | Action |
|----------|-------------|----------|--------|
| BLOCKER | Critical issue, must fix | SQL injection, authentication bypass, data corruption | Block merge |
| MAJOR | Significant issue, should fix | Missing validation, N+1 query, no tests, architecture violation | Request changes |
| MINOR | Minor improvement | Better variable name, simpler approach, missing comment | Comment only |
| INFO | Suggestion or question | Alternative approach, FYI on similar code | Comment only |

---

## Review Etiquette

### 3.1 Author Guidelines

```
RULE CR-04: Professional review etiquette from author perspective.
```

**Before PR:**
- Self-review code first
- Ensure CI passes (tests, lint)
- Write clear PR description
- Link to related issues/tickets
- Keep PR focused (one feature/fix)
- Keep PR size manageable

**During Review:**
- Respond to all comments
- Be receptive to feedback
- Don't take criticism personally
- Ask clarifying questions
- Acknowledge good suggestions

**After Approval:**
- Address all comments before re-requesting
- Thank reviewers
- Learn from feedback
- Apply learnings to future code

### 3.2 Reviewer Guidelines

**Before Review:**
- Understand the change (read PR description)
- Check CI status
- Review with fresh eyes
- Allocate sufficient time
- Be respectful and constructive

**During Review:**
- Review logic first (functionality)
- Check security (RULE-08)
- Check performance (RULE-09)
- Check tests (RULE-10)
- Run code locally if needed
- Comment inline for specific issues
- Summarize overall feedback
- Approve or request changes clearly

**After Review:**
- Follow up on re-requests
- Verify fixes are correct
- Approve when satisfied

### 3.3 Review Comment Guidelines

**Good Review Comments:**
- Ask questions: "Should we handle the case where the file is empty?"
- Suggest improvements: "Consider using optional chaining here: Student/Parent?.name?.toUpperCase()"
- Explain concerns: "This could cause N+1 queries. Consider fetching all related data in one query."
- Highlight issues: "This regex allows XSS. Use a library instead."
- Praise good code: "Great error handling here!"
- Link to standards: "Per RULE-24, we should use a composite index here."

**Forbidden Review Comments:**
1. Vague/unhelpful: "This is wrong" → "This logic will fail when Student/Parent is null. Add null check: Student/Parent?.name"
2. Nitpicking style: "Missing semicolon here" → "ESLint should catch this"
3. Personal preference: "I prefer const over let" → "Consider using const since this is never reassigned"
4. Approval without review: "Looks good to me! (after 30 seconds)" → "Reviewed thoroughly - looks good!"
5. Blocking on minor issues: "Blocking because variable name could be better" → "Minor: rename to 'studentCount' for clarity (not blocking)"
6. No explanation: "Change this" → "Change this to prevent XSS vulnerability (CWE-79)"
7. Authoritative without reason: "Do it this way" → "Consider this approach because [reasoning]"

---

## Review Checklist

### 4.1 Standard Checklist

```
RULE CR-05: Use this checklist for every review.
```

#### Functionality
- [ ] Logic is correct for all inputs
- [ ] Edge cases handled (null, empty, extreme values)
- [ ] Error handling present for all failure modes
- [ ] No infinite loops or race conditions
- [ ] Business rules implemented correctly per module specification

#### Architecture
- [ ] Follows layer rules (RULE-01)
- [ ] Service layer used correctly
- [ ] No UI code in services
- [ ] Proper separation of concerns
- [ ] No circular dependencies

#### Security
- [ ] Input validated (RULE-18)
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Authentication/authorization correct
- [ ] Sensitive data not logged (student PII, fee transactions)
- [ ] Encryption used where needed

#### Performance
- [ ] No N+1 queries
- [ ] No unnecessary re-renders
- [ ] Proper indexing for Storage Layer queries
- [ ] Efficient data structures used
- [ ] No memory leaks
- [ ] Pagination implemented for large datasets (> 100 items)

#### Testing
- [ ] Unit tests written for new code
- [ ] Test coverage > 80% for new code
- [ ] Edge cases tested
- [ ] Error cases tested
- [ ] Tests actually pass

#### Maintainability
- [ ] Clear variable/function names
- [ ] Functions are small (< 50 lines)
- [ ] No duplicated code (DRY principle)
- [ ] Comments explain why, not what
- [ ] Complex logic documented
- [ ] Follows coding standards (RULE-14)

#### Error Handling
- [ ] Errors caught and handled
- [ ] Meaningful error messages
- [ ] Proper logging (RULE-19)
- [ ] Student/Parent-friendly error messages
- [ ] No console.log statements

---

## Review Tools

### 5.1 Required Tools

- **GitHub/GitLab PR Reviews**: Primary review platform
- **ESLint**: Code style enforcement
- **Prettier**: Code formatting
- **Jest/Vitest**: Test runner
- **Coverage Tools**: Istanbul for coverage reports

### 5.2 Review Automation

```
RULE CR-06: Enforce review automation where possible.
```

**Automatic Checks:**
- Linting (ESLint) on PR creation
- Test execution on PR creation
- Coverage check (> 80% required)
- Dependency scanning (npm audit)
- Secret scanning (no credentials in code)

**Manual Checks:**
- Business logic correctness
- Architecture compliance
- Security review for sensitive features
- Performance implications
- Maintainability assessment

---

## Validation

### How to Validate Compliance

1. **Automated Checks**: CI/CD pipeline runs lint, tests, coverage
2. **Code Review Metrics**: Track review time, approval rate, comment density
3. **Post-Merge Review**: Random 10% of merged PRs audited for quality
4. **Architecture Validation**: Dependency graph checked against RULE-01

---

## Common Violations

### High Frequency Violations

1. **PR Too Large**: PRs > 400 lines require split before approval
   - **Impact**: Reduced review quality, bugs introduced
   - **Fix**: Split PR into smaller logical units

2. **No Tests for New Code**: New features without tests
   - **Impact**: Regressions in future changes
   - **Fix**: Add unit and integration tests before approval

3. **Missing Reviews**: Code merged without review
   - **Impact**: Architecture violations, security issues
   - **Fix**: Revert merge, require proper review

4. **Vague Review Comments**: "This is wrong" without explanation
   - **Impact**: Author doesn't understand issue
   - **Fix**: Follow comment guidelines (Section 3.3)

5. **Architecture Violations**: Code ignoring layer rules
   - **Impact**: Technical debt, maintenance issues
   - **Fix**: Refactor to follow RULE-01 before approval

---

## Auto Fix

### Automatic Fixes Available

1. **Formatting Issues**: Prettier auto-formats on commit
2. **Linting Errors**: ESLint auto-fixes simple issues (imports, spacing)
3. **Type Errors**: TypeScript compiler errors shown in IDE

### Manual Fixes Required

1. **Architecture Violations**: Require code refactoring
2. **Logic Errors**: Require code changes by author
3. **Security Issues**: Require security team review
4. **Performance Issues**: Require performance analysis and optimization

---

## Related Rules

- **RULE-01**: Architecture Guidelines (layer rules, dependencies)
- **RULE-03**: Services (service layer patterns)
- **RULE-08**: Security (security review requirements)
- **RULE-09**: Performance (performance review criteria)
- **RULE-10**: Testing (test requirements)
- **RULE-14**: Code Quality (coding standards)
- **RULE-18**: Validation (input validation requirements)
- **RULE-19**: Logging (logging standards for error review)
- **RULE-26**: Error Handling (error handling patterns)

---

## Related Decisions

- **ADR-0001**: Service Registry Pattern (review implications)
- **ADR-0002**: Storage Owner Pattern (storage code review requirements)

---

## Exception Process


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

```
Exception Request Required For:
1. Emergency hotfixes bypassing normal review time
2. Prototype code (must be refactored before production)
3. Third-party library integrations (requires security review)
```

**Exception Authority**: Tech Lead + Security Team (for security-related exceptions)
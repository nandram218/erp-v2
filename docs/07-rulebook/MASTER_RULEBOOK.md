# ERP-v2 Master Rulebook

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025  
**Maintained By:** Engineering Team  
**Enforcement Level:** MANDATORY  

---

## Table of Contents

1. [Purpose & Scope](#purpose--scope)
2. [Audience & Usage](#audience--usage)
3. [Rule Format Standard](#rule-format-standard)
4. [Severity Classification](#severity-classification)
5. [Enforcement & Validation](#enforcement--validation)
6. [Auto-Fix Policy](#auto-fix-policy)
7. [Audit & Compliance](#audit--compliance)
8. [AI Agent Integration](#ai-agent-integration)
9. [Governance & Change Management](#governance--change-management)
10. [Rule Index](#rule-index)

---

## Purpose & Scope

This Master Rulebook is the **PRIMARY SOURCE OF TRUTH** for all engineering, architectural, and operational decisions within the ERP-v2 project. It is a comprehensive, enforceable standard designed for:

- **Large-Scale ERP Systems** handling millions of transactions
- **SaaS Multi-Tenant Architectures** with strict isolation requirements
- **Future Backend Integration** ensuring forward compatibility
- **Zero Duplication** and **Zero Data Corruption** as non-negotiable invariants
- **Zero Cross-Module Leakage** enforcing strict boundary enforcement
- **AI Agent Friendly** development with machine-readable rules and deterministic validation
- **Future Audit Friendly** with immutable audit trails and compliance-ready documentation

### Core Objectives

1. **Detectability**: Every rule must be automatically detectable via static analysis, runtime checks, or audit logs.
2. **Verifiability**: Every rule must have clear pass/fail criteria.
3. **Enforceability**: Every rule must be enforceable through tooling, CI/CD gates, and code review checklists.
4. **Fixability**: Every violation must have a defined auto-fix path or manual remediation steps.
5. **Auditability**: Every rule must produce traceable evidence of compliance or violation.

### Out of Scope

This rulebook does NOT cover:
- Business logic specific to a single school's unique workflow (handled via configuration)
- End-user documentation (handled by UX team)
- Third-party library selection (governed by `RULE-14-code-quality.md`)

---

## Audience & Usage

### Primary Audience
- **Software Engineers**: Writing, modifying, or refactoring code
- **Architects**: Designing modules, services, and data models
- **Tech Leads**: Reviewing code and ensuring compliance
- **DevOps Engineers**: Managing infrastructure and deployments
- **QA Engineers**: Writing tests and validation suites
- **Security Team**: Auditing and penetration testing
- **AI Agents**: Automated code generation, review, and refactoring tools

### How to Use This Rulebook

#### For Humans
1. **Before starting any task**, read all rules in the relevant category.
2. **During implementation**, keep the rulebook open in a secondary monitor or IDE plugin.
3. **During code review**, use the rulebook as the definitive checklist. Every PR must reference the rules it affects.
4. **When in doubt**, apply the strictest interpretation of the rule.

#### For AI Agents
1. **Load the full rulebook** into context at the start of any task.
2. **Validate every generated line** against applicable rules before presenting to the user.
3. **Report violations explicitly** with rule reference, severity, and remediation steps.
4. **Do not bypass** any rule without explicit user override and rationale.

---

## Rule Format Standard

Every rule in this rulebook follows this exact structure:

```
## RULE-XXX.YY: [Rule Title]

**Severity:** CRITICAL | HIGH | MEDIUM | LOW  
**Category:** [Category Name]  
**Applies To:** [Code, Config, Data, UI, Infrastructure, etc.]  
**Detection Method:** [Static Analysis | Runtime Check | Audit Log | Manual Review]  
**Auto-Fix Available:** Yes | No  
**Last Updated:** YYYY-MM-DD  

### WHY
[Business and technical rationale for this rule]

### WHEN
[Conditions under which this rule applies]

### WHERE
[Scope: files, directories, modules, layers]

### HOW
[Detailed implementation requirements]

### VALIDATION
[Exact pass/fail criteria, test cases, commands]

### COMMON VIOLATION
[Typical mistakes developers make]

### AUTO FIX
[Exact steps or script to auto-remediate]

### MANUAL FIX
[Step-by-step manual remediation if auto-fix fails]

### EXCEPTIONS
[Explicitly allowed deviations with approval process]

### REFERENCES
[Links to related rules, ADRs, external standards]
```

**Mandatory Fields:**
- **Severity**: Defined below
- **Category**: Must match one of the defined categories
- **Detection Method**: Must be one of the defined methods
- **Auto-Fix Available**: Binary yes/no

---

## Severity Classification

| Severity | Definition | Enforcement | Time to Fix | Example Violation |
|----------|-----------|-------------|-------------|-------------------|
| **CRITICAL** | Threatens data integrity, security, or multi-tenant isolation | CI/CD blocks merge; immediate hotfix required | < 24 hours | Cross-tenant data leakage, unencrypted PII |
| **HIGH** | Violates core architecture; causes data corruption risk | CI/CD blocks merge; must fix before release | < 1 sprint | Direct database access bypassing service layer, circular dependencies |
| **MEDIUM** | Degrades maintainability or violates best practices | Warning in CI; must be addressed in next sprint | < 2 sprints | File size exceeds limit, missing error handling |
| **LOW** | Style or minor convention violations | Informational only | Best effort | Non-standard naming in test files |

**Severity Escalation:** Any violation discovered in production automatically escalates one severity level.

---

## Enforcement & Validation

### Enforcement Layers

1. **Pre-Commit Hooks**: Linting, formatting, import sorting (RULE-14)
2. **CI/CD Pipeline**:
   - Static Analysis (SonarQube, ESLint, custom scripts)
   - Unit/Integration Test Suite (RULE-10)
   - Architecture Tests (dependency-validation, module-boundary checks)
   - Storage Validation (RULE-02)
3. **Runtime Guards**:
   - Tenant isolation middleware (RULE-04)
   - Feature flags (disabled by default for HIGH/CRITICAL violations)
4. **Code Review (RULE-30)**:
   - Mandatory use of rulebook checklist
   - At least one reviewer must confirm compliance
5. **Production Monitoring (RULE-22)**:
   - Real-time violation detection
   - Automated alerting on CRITICAL violations

### Validation Sources

| Source | Tool/Method | Frequency |
|--------|------------|-----------|
| Static Analysis | ESLint, TSLint, custom AST scripts | Every commit |
| Dependency Graph | Madge, custom dependency validator | Every PR |
| Architecture Tests | Jest + custom assertions | Every PR |
| Storage Tests | Custom test suite against IndexedDB/LocalStorage | Every PR |
| Security Scan | OWASP ZAP, npm audit | Daily + on deploy |
| Performance | Lighthouse, custom benchmarks | Weekly |
| Manual Audit | Quarterly architecture review | Quarterly |

---

## Auto-Fix Policy

### Principles
- **Safety First**: Auto-fix must never corrupt data or break functionality.
- **Idempotency**: Running auto-fix multiple times must yield the same result.
- **Transparency**: Every auto-fix action must be logged with before/after state.
- **Opt-Out**: Developers may disable auto-fix for a specific violation with documented rationale.

### Auto-Fix Categories
1. **Formatting**: Indentation, imports, trailing commas
2. **Imports**: Removing unused imports, fixing import paths
3. **Naming**: Renaming variables/functions to match conventions (with IDE support)
4. **File Structure**: Moving files to correct directories
5. **Boilerplate**: Adding missing `key` props, default parameters

### Non-Auto-Fixable (Manual Required)
- Architectural restructuring
- Data migrations
- Security vulnerabilities requiring human judgment
- Performance optimizations requiring profiling
- Changes to public APIs

---

## Audit & Compliance

### Audit Requirements
- **Every CRITICAL and HIGH rule** must emit audit log entries on every check.
- **Audit logs** must be immutable, tamper-evident, and stored in the tenant's own storage.
- **Audit Retention**: Minimum 7 years (or as required by local regulations).
- **Audit Access**: Read-only for compliance officers; write-only for system.

### Audit Events
```json
{
  "eventId": "uuid",
  "timestamp": "ISO8601",
  "ruleId": "RULE-XX-YY",
  "severity": "CRITICAL",
  "tenantId": "tenant_xxx",
  "userId": "user_yyy or system",
  "resource": "src/modules/fees/feesService.js",
  "violation": "Direct localStorage access detected",
  "action": "BLOCKED | WARNED | AUTO_FIXED | MANUAL_FIXED",
  "metadata": {},
  "hash": "sha256:..."
}
```

### Compliance Reporting
- **Daily**: CRITICAL violations summary to Engineering Lead
- **Weekly**: Full compliance report to CTO
- **Monthly**: Trend analysis to Engineering All-Hands

---

## AI Agent Integration

### Agent Responsibilities
1. **Rule Loading**: Agents MUST load the full rulebook before any task.
2. **Compliance Checking**: Agents MUST validate generated code against all applicable rules.
3. **Violation Reporting**: Agents MUST report violations in this exact format:
   ```
   VIOLATION: RULE-XX-YY
   Severity: HIGH
   File: src/path/to/file.js
   Line: 42
   Issue: [Description]
   Fix: [Specific action required]
   ```
4. **No Bypass**: Agents MUST NOT suggest bypassing a rule without:
   - Explicit user approval
   - Documented rationale
   - Proposed mitigation

### Agent Training Data
- All rules must be provided in machine-readable format (JSON/YAML) in `docs/07-rulebook/rules.json`.
- Agents must use the structured format for compliance checks.

---













## Governance & Change Management

### Proposing Changes
1. **Create an RFC** in `docs/04-decisions/` using the ADR template.
2. **Impact Assessment**: Analyze impact on all existing rules and modules.
3. **Community Review**: Minimum 2 business days for community feedback.
4. **Architecture Board Approval**: Required for CRITICAL and HIGH severity changes.
5. **Implementation**: Update rule files, migration guides, and tooling.

### Emergency Changes
- **Hotfix Process**: Bypass normal review for CRITICAL production issues.
- **Retrospective**: Within 48 hours, create ADR documenting the violation and long-term fix.

### Versioning
- Rulebook follows semantic versioning independent of the codebase.
- Breaking changes increment MAJOR version.
- New rules increment MINOR version.
- Corrections increment PATCH version.

---

## Rule Index

| # | Rule Name | File | Category | Severity | Auto-Fix | Last Updated |
|---|-----------|------|----------|----------|----------|--------------|
| 01 | Architecture | [RULE-01-architecture.md](categories/RULE-01-architecture.md) | Core | CRITICAL | Partial | 2025-01-15 |
| 02 | Storage & Data Persistence | [RULE-02-storage.md](categories/RULE-02-storage.md) | Core | CRITICAL | Partial | 2025-01-15 |
| 03 | Service Layer | [RULE-03-services.md](categories/RULE-03-services.md) | Core | HIGH | No | 2025-01-15 |
| 04 | SaaS / Multi-tenant | [RULE-04-saas.md](categories/RULE-04-saas.md) | Core | CRITICAL | No | 2025-01-15 |
| 05 | Master Data Management | [RULE-05-master-data.md](categories/RULE-05-master-data.md) | Data | HIGH | No | 2025-01-15 |
| 06 | Module Boundaries | [RULE-06-module-boundaries.md](categories/RULE-06-module-boundaries.md) | Architecture | HIGH | Partial | 2025-01-15 |
| 07 | UI & Component Standards | [RULE-07-ui.md](categories/RULE-07-ui.md) | Frontend | MEDIUM | Yes | 2025-01-15 |
| 08 | Security | [RULE-08-security.md](categories/RULE-08-security.md) | Security | CRITICAL | Partial | 2025-01-15 |
| 09 | Performance | [RULE-09-performance.md](categories/RULE-09-performance.md) | Performance | HIGH | No | 2025-01-15 |
| 10 | Testing Strategy | [RULE-10-testing.md](categories/RULE-10-testing.md) | Testing | HIGH | No | 2025-01-15 |
| 11 | Refactoring & Code Evolution | [RULE-11-refactoring.md](categories/RULE-11-refactoring.md) | Maintenance | MEDIUM | No | 2025-01-15 |
| 12 | Git & Branching | [RULE-12-git.md](categories/RULE-12-git.md) | DevEx | MEDIUM | Yes | 2025-01-15 |
| 13 | Documentation | [RULE-13-documentation.md](categories/RULE-13-documentation.md) | DevEx | LOW | No | 2025-01-15 |
| 14 | Code Quality | [RULE-14-code-quality.md](categories/RULE-14-code-quality.md) | Maintainability | MEDIUM | Yes | 2025-01-15 |
| 15 | Deployment & CI/CD | [RULE-15-deployment.md](categories/RULE-15-deployment.md) | DevOps | HIGH | No | 2025-01-15 |
| 16 | Audit & Compliance | [RULE-16-audit.md](categories/RULE-16-audit.md) | Compliance | CRITICAL | No | 2025-01-15 |
| 17 | AI Agent Interaction | [RULE-17-ai-agent.md](categories/RULE-17-ai-agent.md) | AI/ML | MEDIUM | N/A | 2025-01-15 |
| 18 | Validation Standards | [RULE-18-validation.md](categories/RULE-18-validation.md) | Data | HIGH | Yes | 2025-01-15 |
| 19 | Logging & Observability | [RULE-19-logging.md](categories/RULE-19-logging.md) | Observability | HIGH | No | 2025-01-15 |
| 20 | Backup & Recovery | [RULE-20-backup.md](categories/RULE-20-backup.md) | Operations | CRITICAL | No | 2025-01-15 |
| 21 | Disaster Recovery | [RULE-21-disaster-recovery.md](categories/RULE-21-disaster-recovery.md) | Operations | CRITICAL | No | 2025-01-15 |
| 22 | Monitoring & Alerting | [RULE-22-monitoring.md](categories/RULE-22-monitoring.md) | Operations | HIGH | No | 2025-01-15 |
| 23 | Versioning & Compatibility | [RULE-23-versioning.md](categories/RULE-23-versioning.md) | DevOps | HIGH | No | 2025-01-15 |
| 24 | Database Design | [RULE-24-database.md](categories/RULE-24-database.md) | Data | CRITICAL | No | 2025-01-15 |
| 25 | API Design | [RULE-25-api.md](categories/RULE-25-api.md) | Backend | HIGH | No | 2025-01-15 |
| 26 | Error Handling | [RULE-26-error-handling.md](categories/RULE-26-error-handling.md) | Reliability | HIGH | No | 2025-01-15 |
| 27 | Migration Strategy | [RULE-27-migration.md](categories/RULE-27-migration.md) | DevOps | HIGH | No | 2025-01-15 |
| 28 | Feature Development | [RULE-28-feature-development.md](categories/RULE-28-feature-development.md) | Process | MEDIUM | No | 2025-01-15 |
| 29 | Bug Fixing | [RULE-29-bug-fixing.md](categories/RULE-29-bug-fixing.md) | Process | MEDIUM | No | 2025-01-15 |
| 30 | Code Review | [RULE-30-code-review.md](categories/RULE-30-code-review.md) | Process | HIGH | No | 2025-01-15 |

---

## Enforcement Quick Reference

### Critical Enforcement Points
- **No direct storage access** outside `src/services/storageService.js` (RULE-02)
- **No cross-module imports** (RULE-06)
- **All data mutations through services** (RULE-03)
- **All tenant isolation enforced at data layer** (RULE-04)
- **All CRUD operations audited** (RULE-16)

### CI/CD Gates
```
PRE-COMMIT: Lint, Format, Unit Tests
PUSH: Architecture Tests, Security Scan
PR: All of above + Integration Tests + Performance benchmarks
MERGE: Full regression suite
DEPLOY: Canary + Smoke tests
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2025-01-15 | Engineering Team | Complete rewrite for ERP SaaS standard; expanded to 30 rules |
| 1.0 | 2024-01-01 | Engineering Team | Initial release |

### Approval
- [ ] CTO
- [ ] Head of Engineering
- [ ] Security Architect
- [ ] Lead Backend Engineer
- [ ] Lead Frontend Engineer
- [ ] DevOps Lead

---

*End of Master Rulebook*

© ERP-v2 Engineering Team. All rights reserved. Confidential and proprietary.
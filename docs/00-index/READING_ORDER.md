# RECOMMENDED READING ORDER
> **ERP-v2 Knowledge Base v1.1 (Permanent)**
> Canonical reading paths — नया AI/Developer क्या पहले पढ़े

---
## 1. New AI / New Developer

| Step | Priority | File | Why |
|------|----------|------|-----|
| 1 | ⭐⭐⭐ | `01-constitution/PACK-00_master-foundation.md` | Project का मतलब समझो |
| 2 | ⭐⭐⭐ | `00-index/CURRENT_STATE.md` | अभी क्या है |
| 3 | ⭐⭐⭐ | `01-constitution/PACK-02_folder-file-ownership.md` | File कहाँ है |
| 4 | ⭐⭐⭐ | `01-constitution/PACK-07_development-workflow.md` | गलती कैसे avoid करो |
| 5 | ⭐⭐ | `00-index/KNOWLEDGE_GRAPH.md` | Relationship समझो |
| 6 | ⭐⭐ | `01-constitution/PACK-06_module-rules.md` | Module banana/badlena |
| 7 | ⭐ | `02-architecture/` (all) | Deep dive on your area |
| 8 | ⭐ | `06-modules/` (relevant) | Module-specific docs |
| 9 | ⭐ | `05-locks/` (all) | जो change नहीं कर सकते |

---
## 2. Architecture Review

| Step | Priority | File | Why |
|------|----------|------|-----|
| 1 | ⭐⭐⭐ | `02-architecture/architecture-current-reality.md` | Current state |
| 2 | ⭐⭐⭐ | `02-architecture/architecture-dependency-graph.md` | Dependencies |
| 3 | ⭐⭐ | `02-architecture/architecture-service-registry.md` | Service ownership |
| 4 | ⭐⭐ | `02-architecture/architecture-tenant-isolation.md` | Multi-tenancy |
| 5 | ⭐⭐ | `03-audits/audit-saas-isolation.md` | SaaS audit findings |
| 6 | ⭐ | `03-audits/audit-module-boundaries.md` | Boundary audit |

---
## 3. Constitution Writing

| Step | Priority | File | Why |
|------|----------|------|-----|
| 1 | ⭐⭐⭐ | `01-constitution/PACK-00_master-foundation.md` | Foundation |
| 2 | ⭐⭐⭐ | `01-constitution/PACK-01_business-rules.md` | Rules |
| 3 | ⭐⭐ | `01-constitution/PACK-05_backend-database.md` | Data |
| 4 | ⭐⭐ | `01-constitution/PACK-06_module-rules.md` | Modules |
| 5 | ⭐ | `01-constitution/PACK-10_permanent-locks.md` | Constraints |

---
## 4. Code Refactoring

| Step | Priority | File | Why |
|------|----------|------|-----|
| 1 | ⭐⭐⭐ | `01-constitution/PACK-09_controlled-refactor.md` | Rules |
| 2 | ⭐⭐ | `01-constitution/PACK-08_master-roadmap.md` | Context |
| 3 | ⭐⭐ | `03-audits/audit-{entity}.md` — relevant entity | Root cause |
| 4 | ⭐ | `05-locks/master-lock-sheet.md` | Hard constraints |

---
## 5. Feature Development

| Step | Priority | File | Why |
|------|----------|------|-----|
| 1 | ⭐⭐⭐ | `01-constitution/PACK-06_module-rules.md` | Module boundaries |
| 2 | ⭐⭐⭐ | `01-constitution/PACK-02_folder-file-ownership.md` | File placement |
| 3 | ⭐⭐ | `06-modules/module-{X}.md` | Module docs |
| 4 | ⭐⭐ | Relevant `02-architecture/` document | Architecture context |
| 5 | ⭐ | `01-constitution/PACK-04_ui-ux-standards.md` | UI rules |

---
## 6. Bug Fix / Maintenance

| Step | Priority | File | Why |
|------|----------|------|-----|
| 1 | ⭐⭐⭐ | `01-constitution/PACK-09_controlled-refactor.md` | Refactor rules |
| 2 | ⭐⭐ | `03-audits/audit-{entity}.md` — Root cause | Root cause |
| 3 | ⭐⭐ | `01-constitution/PACK-07_development-workflow.md` — Workflow | Workflow |
| 4 | ⭐ | Relevant `02-architecture/` doc | Architecture context |

---
## 7. Architecture Decision

| Step | Priority | File | Why |
|------|----------|------|-----|
| 1 | ⭐⭐⭐ | `04-decisions/ADRs` — Past decisions | Past decisions |
| 2 | ⭐⭐ | `02-architecture/` — Current state | Current state |
| 3 | ⭐ | `01-constitution/PACK-10_permanent-locks.md` — Hard constraints | Hard constraints |
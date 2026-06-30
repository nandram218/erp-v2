# MASTER INDEX
> **ERP-v2 Knowledge Base v1.1 (Permanent)**
> Navigation hub — every document indexed with full metadata

---
## Navigation Flow

```
MASTER_INDEX.md  ← YOU ARE HERE
├── MASTER_CONTEXT.md  ← Start here for project overview
├── 01-constitution/     → Foundation & rules (PACK-00..10)
├── 00-index/            → KB navigation & indices
├── 02-architecture/     → Technical architecture (11 files)
├── 03-audits/            → Audit reports (8+ files)
├── 04-decisions/         → ADRs (Architecture Decision Records)
├── 05-locks/             → Permanently locked decisions
├── 06-modules/           → Module-specific documentation
└── 99-archive/           → Old/superseded docs
```

---
## Document Registry

| Title | Category | Status | Version | Tags | Depends-On | Used-By | Priority | Path |
|-------|----------|--------|---------|------|------------|---------|----------|------|
| MASTER CONTEXT | Index | Stable | v1.1 | `[index]` `[master]` | PACK-00 | ALL agents | ⭐⭐⭐ | `00-index/MASTER_CONTEXT.md` |
| PACK-00: Master Foundation | Constitution | Stable | v1.0 | `[foundation]` `[core]` | — | PACK-01..10 | ⭐⭐⭐ | `01-constitution/PACK-00_master-foundation.md` |
| PACK-01: Business Rules | Constitution | Stable | v1.0 | `[business-rules]` `[core]` | PACK-00 | PACK-06 | ⭐⭐⭐ | `01-constitution/PACK-01_business-rules.md` |
| PACK-02: Folder & File Ownership | Constitution | Stable | v1.0 | `[file-ownership]` `[core]` | PACK-00 | PACK-05, PACK-07 | ⭐⭐⭐ | `01-constitution/PACK-02_folder-file-ownership.md` |
| PACK-03: SaaS Multi-Tenant | Constitution | Stable | v1.0 | `[saas-multi-tenant]` `[core]` | PACK-00 | Architecture | ⭐⭐⭐ | `01-constitution/PACK-03_saas-multi-tenant.md` |
| PACK-04: UI/UX Standards | Constitution | Stable | v1.0 | `[ui-ux]` `[standards]` | PACK-00 | Module development | ⭐⭐ | `01-constitution/PACK-04_ui-ux-standards.md` |
| PACK-05: Backend & Database | Constitution | Stable | v1.0 | `[backend]` `[database]` `[core]` | PACK-00, PACK-02 | Service registry | ⭐⭐⭐ | `01-constitution/PACK-05_backend-database.md` |
| PACK-06: Module Rules | Constitution | Stable | v1.0 | `[module-rules]` `[core]` | PACK-00, PACK-01, PACK-05 | PACK-07, Architecture | ⭐⭐⭐ | `01-constitution/PACK-06_module-rules.md` |
| PACK-07: Development Workflow | Constitution | Stable | v1.0 | `[development-workflow]` `[core]` | PACK-02, PACK-06 | New developers | ⭐⭐⭐ | `01-constitution/PACK-07_development-workflow.md` |
| PACK-08: Master Roadmap | Constitution | Stable | v1.0 | `[roadmap]` `[phases]` | PACK-00, PACK-06 | Planning | ⭐⭐ | `01-constitution/PACK-08_master-roadmap.md` |
| PACK-09: Controlled Refactor | Constitution | Stable | v1.0 | `[refactor]` `[safety]` | PACK-07, PACK-08 | Code changes | ⭐⭐ | `01-constitution/PACK-09_controlled-refactor.md` |
| PACK-10: Permanent Locks | Constitution | Stable | v1.0 | `[locks]` `[permanent]` `[core]` | ALL PACKs | ALL agents | ⭐⭐⭐ | `01-constitution/PACK-10_permanent-locks.md` |
| CURRENT STATE | Index | Stable | v1.0 | `[index]` `[status]` | PACK-00 | New AI/Dev | ⭐⭐⭐ | `00-index/CURRENT_STATE.md` |
| KNOWLEDGE GRAPH | Index | Stable | v1.0 | `[index]` `[relationships]` | PACK-00..10 | Architecture review | ⭐⭐ | `00-index/KNOWLEDGE_GRAPH.md` |
| TAG INDEX | Index | Stable | v1.0 | `[index]` `[tags]` | ALL docs | Search/Discovery | ⭐⭐ | `00-index/TAG_INDEX.md` |
| READING ORDER | Index | Stable | v1.0 | `[index]` `[onboarding]` | PACK-00..10 | New AI/Dev | ⭐⭐ | `00-index/READING_ORDER.md` |
| CHANGELOG | Index | Stable | v1.0 | `[index]` `[history]` | PACK-00 | All agents | ⭐ | `00-index/CHANGELOG.md` |
| Architecture: Authority Matrix | Architecture | Stable | v1.0 | `[architecture]` `[authority]` | PACK-03, PACK-06 | Module owners | ⭐⭐ | `02-architecture/architecture-authority-matrix.md` |
| Architecture: Current Reality | Architecture | Stable | v1.0 | `[architecture]` `[current-state]` | PACK-03, PACK-06 | Architecture review | ⭐⭐ | `02-architecture/architecture-current-reality.md` |
| Architecture: Data Flow | Architecture | Stable | v1.0 | `[architecture]` `[data-flow]` | PACK-03, PACK-05 | Debugging | ⭐⭐ | `02-architecture/architecture-data-flow.md` |
| Architecture: Dependency Graph | Architecture | Stable | v1.0 | `[architecture]` `[dependencies]` | PACK-06 | Refactoring | ⭐⭐ | `02-architecture/architecture-dependency-graph.md` |
| Architecture: File Ownership | Architecture | Stable | v1.0 | `[architecture]` `[file-ownership]` | PACK-02 | Module owners | ⭐⭐ | `02-architecture/architecture-file-ownership.md` |
| Architecture: Folder Map | Architecture | Stable | v1.0 | `[architecture]` `[folder-map]` | PACK-02 | Navigation | ⭐⭐ | `02-architecture/architecture-folder-map.md` |
| Architecture: Service Registry | Architecture | Stable | v1.0 | `[architecture]` `[service-registry]` | PACK-05 | Service authors | ⭐⭐⭐ | `02-architecture/architecture-service-registry.md` |
| Architecture: Storage Flow | Architecture | Stable | v1.0 | `[architecture]` `[storage]` | PACK-03, PACK-05 | Data layer | ⭐⭐ | `02-architecture/architecture-storage-flow.md` |
| Architecture: Store Runtime | Architecture | Stable | v1.0 | `[architecture]` `[store]` | PACK-05 | State debugging | ⭐⭐ | `02-architecture/architecture-store-runtime.md` |
| Architecture: Tenant Isolation | Architecture | Stable | v1.0 | `[architecture]` `[saas]` | PACK-03 | Multi-tenancy | ⭐⭐⭐ | `02-architecture/architecture-tenant-isolation.md` |
| Audit: Fee Engine | Audit | In Progress | v1.0 | `[audit]` `[fees]` `[saas-multi-tenant]` | Architecture | PACK-11 | ⭐⭐ | `03-audits/audit-fee-engine.md` |
| Audit: Module Boundaries | Audit | In Progress | v1.0 | `[audit]` `[module-boundaries]` | PACK-06 | PACK-11 | ⭐⭐ | `03-audits/audit-module-boundaries.md` |
| Audit: Runtime Lifecycle | Audit | In Progress | v1.0 | `[audit]` `[runtime]` | Architecture | PACK-11 | ⭐⭐ | `03-audits/audit-runtime-lifecycle.md` |
| Audit: SaaS Isolation | Audit | In Progress | v1.0 | `[audit]` `[saas-multi-tenant]` | PACK-03 | PACK-11 | ⭐⭐ | `03-audits/audit-saas-isolation.md` |
| Audit: Service Registry | Audit | In Progress | v1.0 | `[audit]` `[service-registry]` | PACK-05 | PACK-11 | ⭐⭐ | `03-audits/audit-service-registry.md` |
| Audit: Storage Authority | Audit | In Progress | v1.0 | `[audit]` `[storage-authority]` | PACK-02 | PACK-11 | ⭐⭐ | `03-audits/audit-storage-authority.md` |
| Audit: Student Module | Audit | In Progress | v1.0 | `[audit]` `[students]` | Architecture | PACK-11 | ⭐⭐ | `03-audits/audit-student-module.md` |
| ADR-0001: Service Registry | Decision | Stable | v1.0 | `[adr]` `[service-registry]` | Architecture | All dev | ⭐⭐ | `04-decisions/ADR-0001-service-registry.md` |
| ADR-0002: Storage Owner | Decision | Stable | v1.0 | `[adr]` `[storage-authority]` | Architecture | All dev | ⭐⭐ | `04-decisions/ADR-0002-storage-owner.md` |
| Architecture Locks | Lock | Locked | v1.0 | `[locks]` `[architecture]` | PACK-10 | All agents | ⭐⭐⭐ | `05-locks/architecture-locks.md` |
| Authority Locks | Lock | Locked | v1.0 | `[locks]` `[authority]` | PACK-10 | All agents | ⭐⭐⭐ | `05-locks/authority-locks.md` |
| Folder Locks | Lock | Locked | v1.0 | `[locks]` `[folder-ownership]` | PACK-10 | All agents | ⭐⭐⭐ | `05-locks/folder-locks.md` |
| Master Lock Sheet | Lock | Locked | v1.0 | `[locks]` `[master]` `[permanent]` | PACK-10 | All agents | ⭐⭐⭐ | `05-locks/master-lock-sheet.md` |
| Naming Locks | Lock | Locked | v1.0 | `[locks]` `[naming]` | PACK-10 | All agents | ⭐⭐⭐ | `05-locks/naming-locks.md` |
| Storage Locks | Lock | Locked | v1.0 | `[locks]` `[storage]` | PACK-10 | All agents | ⭐⭐⭐ | `05-locks/storage-locks.md` |
| Module: Attendance | Module | In Progress | v1.0 | `[module]` `[attendance]` | PACK-06 | Teachers | ⭐ | `06-modules/module-attendance.md` |
| Module: Fees | Module | In Progress | v1.0 | `[module]` `[fees]` | PACK-06 | Accountants | ⭐⭐ | `06-modules/module-fees.md` |
| Module: Hostel | Module | In Progress | v1.0 | `[module]` `[hostel]` | PACK-06 | Wardens | ⭐ | `06-modules/module-hostel.md` |
| Module: Students | Module | In Progress | v1.0 | `[module]` `[students]` | PACK-06 | School Admin | ⭐⭐ | `06-modules/module-students.md` |
| Module: Transport | Module | In Progress | v1.0 | `[module]` `[transport]` | PACK-06 | Transport Manager | ⭐ | `06-modules/module-transport.md` |
| Audit: Index | Audit | Stable | v1.0 | `[audit]` `[index]` | — | Navigation | ⭐ | `03-audits/INDEX.md` |
| ERP-V2 Architecture Audit | Architecture | Draft | v1.0 | `[architecture]` `[audit]` | PACK-00 | Constitution | ⭐ | `ERP-V2-ARCHITECTURE-AUDIT-CONSTITUTION-PREP.md` |
| PACK-03 Reality Scan | Architecture | Stable | v1.0 | `[architecture]` `[reality]` | PACK-03 | Architecture | ⭐ | `architecture/PACK-03-ERP-V2-REALITY-ARCHITECTURE-SCAN.md` |
| PHASE-4.4 SaaS Freeze | Architecture | Locked | v1.0 | `[architecture]` `[saas]` `[phase-4.4]` | PACK-03 | All agents | ⭐⭐⭐ | `architecture/PHASE-4.4-SAAS-AUTHORITY-FREEZE.md` |
| PHASE-4.6 Master Data | Architecture | Locked | v1.0 | `[architecture]` `[master-data]` | PHASE-4.4 | All agents | ⭐⭐ | `architecture/PHASE-4.6-MASTER-DATA-AUTHORITY-AUDIT.md` |

---
## Document Importance Labels

| Label | Meaning |
|-------|---------|
| ⭐⭐⭐ | Core / Essential — every AI agent must read these first |
| ⭐⭐ | Important — read when entering relevant domain |
| ⭐ | Reference — use as-needed |

---
## Quick Reference

| Category | Count | Path |
|----------|-------|------|
| Constitution PACKs | 12 | `01-constitution/PACK-00..10` + master |
| Architecture docs | 11 | `02-architecture/` + top-level |
| Audit reports | 8 | `03-audits/` |
| ADR decisions | 2 | `04-decisions/` |
| Lock sheets | 6 | `05-locks/` |
| Module docs | 5 | `06-modules/` |
| Index documents | 5 | `00-index/` |
| **Total** | **49** | |

---
## Maintenance

- Maintainers: Project Lead
- Last Updated: 2026-06-29
- Update Frequency: On every KB change
- Verification: Cross-check all paths monthly
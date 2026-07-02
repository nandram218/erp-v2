# MASTER INDEX
> **ERP-v2 Knowledge Base v2.0 (Frozen)**
> **Status: PERMANENT — Last Updated: 2026-07-02**
> Navigation hub — every governance document categorized and locked

---

## Repository Governance Tree

```
docs/
├── 00-index/          ← Navigation, context, reading order (5 canonical files)
├── 01-constitution/   ← PACK-00..10 — THE AUTHORITY (freeze-protected)
├── 02-architecture/   ← Technical architecture (10 active files)
├── 03-audits/         ← Current audit reports (8 files)
├── 04-decisions/      ← ADRs (2 active)
├── 05-locks/          ← Lock sheets (6 permanent files)
├── 06-modules/        ← Module docs (5 active)
├── 07-rulebook/       ← EMPTY — rulebook converted to historical knowledge
├── 99-archive/        ← Historical/legacy/superseded docs (organized below)
├── architecture/      ← EMPTY — files moved to archive/phase-4.4
├── audit/             ← EMPTY — files moved to archive/audit-history
├── authority/         ← EMPTY — files moved to archive/historical/authority
├── contracts/         ← EMPTY — files moved to archive/legacy/contracts
├── checklists/        ← EMPTY — files moved to archive/checklists
├── redirects/         ← Redirect files for moved documents
└── governance-engine/ ← Machine-readable JSON graphs (AI entry point)
```

---

## Document Registry — Canonical Only

| Title | Category | Status | Path |
|-------|----------|--------|------|
| MASTER INDEX | Index | Frozen | `00-index/MASTER_INDEX.md` |
| MASTER CONTEXT | Index | Frozen | `00-index/MASTER_CONTEXT.md` |
| CURRENT STATE | Index | Frozen | `00-index/CURRENT_STATE.md` |
| READING ORDER | Index | Frozen | `00-index/READING_ORDER.md` |
| CHANGELOG | Index | Frozen | `00-index/CHANGELOG.md` |
| KNOWLEDGE GRAPH | Index | Frozen | `00-index/KNOWLEDGE_GRAPH.md` |
| TAG INDEX | Index | Frozen | `00-index/TAG_INDEX.md` |
| PACK-00: Master Foundation | Constitution | Permanent | `01-constitution/PACK-00_master-foundation.md` |
| PACK-01: Business Rules | Constitution | Permanent | `01-constitution/PACK-01_business-rules.md` |
| PACK-02: Folder & File Ownership | Constitution | Permanent | `01-constitution/PACK-02_folder-file-ownership.md` |
| PACK-03: SaaS Multi-Tenant | Constitution | Permanent | `01-constitution/PACK-03_saas-multi-tenant.md` |
| PACK-04: UI/UX Standards | Constitution | Permanent | `01-constitution/PACK-04_ui-ux-standards.md` |
| PACK-05: Backend & Database | Constitution | Permanent | `01-constitution/PACK-05_backend-database.md` |
| PACK-06: Module Rules | Constitution | Permanent | `01-constitution/PACK-06_module-rules.md` |
| PACK-07: Development Workflow | Constitution | Permanent | `01-constitution/PACK-07_development-workflow.md` |
| PACK-08: Master Roadmap | Constitution | Permanent | `01-constitution/PACK-08_master-roadmap.md` |
| PACK-09: Controlled Refactor | Constitution | Permanent | `01-constitution/PACK-09_controlled-refactor.md` |
| PACK-10: Permanent Locks | Constitution | Permanent | `01-constitution/PACK-10_permanent-locks.md` |
| Architecture: Authority Matrix | Architecture | Active | `02-architecture/architecture-authority-matrix.md` |
| Architecture: Current Reality | Architecture | Active | `02-architecture/architecture-current-reality.md` |
| Architecture: Data Flow | Architecture | Active | `02-architecture/architecture-data-flow.md` |
| Architecture: Dependency Graph | Architecture | Active | `02-architecture/architecture-dependency-graph.md` |
| Architecture: File Ownership | Architecture | Active | `02-architecture/architecture-file-ownership.md` |
| Architecture: Folder Map | Architecture | Active | `02-architecture/architecture-folder-map.md` |
| Architecture: Service Registry | Architecture | Active | `02-architecture/architecture-service-registry.md` |
| Architecture: Storage Flow | Architecture | Active | `02-architecture/architecture-storage-flow.md` |
| Architecture: Store Runtime | Architecture | Active | `02-architecture/architecture-store-runtime.md` |
| Architecture: Tenant Isolation | Architecture | Active | `02-architecture/architecture-tenant-isolation.md` |
| Phase-4.4 SaaS Freeze | Architecture | Locked | `archive/phase-4.4/PHASE-4.4-SAAS-AUTHORITY-FREEZE.md` |
| Audit: Fee Engine | Audit | Active | `03-audits/audit-fee-engine.md` |
| Audit: Module Boundaries | Audit | Active | `03-audits/audit-module-boundaries.md` |
| Audit: Runtime Lifecycle | Audit | Active | `03-audits/audit-runtime-lifecycle.md` |
| Audit: SaaS Isolation | Audit | Active | `03-audits/audit-saas-isolation.md` |
| Audit: Service Registry | Audit | Active | `03-audits/audit-service-registry.md` |
| Audit: Storage Authority | Audit | Active | `03-audits/audit-storage-authority.md` |
| Audit: Student Module | Audit | Active | `03-audits/audit-student-module.md` |
| Audit: Index | Audit | Active | `03-audits/INDEX.md` |
| ADR-0001: Service Registry | Decision | Stable | `04-decisions/ADR-0001-service-registry.md` |
| ADR-0002: Storage Owner | Decision | Stable | `04-decisions/ADR-0002-storage-owner.md` |
| Architecture Locks | Lock | Frozen | `05-locks/architecture-locks.md` |
| Authority Locks | Lock | Frozen | `05-locks/authority-locks.md` |
| Folder Locks | Lock | Frozen | `05-locks/folder-locks.md` |
| Master Lock Sheet | Lock | Frozen | `05-locks/master-lock-sheet.md` |
| Naming Locks | Lock | Frozen | `05-locks/naming-locks.md` |
| Storage Locks | Lock | Frozen | `05-locks/storage-locks.md` |
| Module: Attendance | Module | Active | `06-modules/module-attendance.md` |
| Module: Fees | Module | Active | `06-modules/module-fees.md` |
| Module: Hostel | Module | Active | `06-modules/module-hostel.md` |
| Module: Students | Module | Active | `06-modules/module-students.md` |
| Module: Transport | Module | Active | `06-modules/module-transport.md` |

---

## Archive Registry

### audit-history/
| Document | Superseded By | Category |
|----------|--------------|----------|
| AUDIT_REPORT_v1.md | FINAL_AUDIT_REPORT.md | Historical |
| REPAIR_REPORT_v1.md | PACK constitution | Historical |
| FINAL_AUDIT_REPORT.md | PACK constitution | Historical |
| MASTER_ARCHITECTURE_AUDIT_PLAN.md | — | Audit Plan |
| MASTER_GOVERNANCE_AUDIT.md | governance-engine/ | Audit |
| VIOLATION_CLASSIFICATION.md | — | Audit |
| ERP-V2-ARCHITECTURE-AUDIT-CONSTITUTION-PREP.md | PACK constitution | Historical |

### legacy/
| Document | Superseded By | Category |
|----------|--------------|----------|
| FOUNDATION-BASELINE.md | PACK-00 + PACK-10 | Legacy Baseline |
| CONSTITUTION_LOCK_v1.0.md | FOUNDATION-BASELINE.md + PACK-10 | Legacy Lock |
| FINAL_CONSTITUTION_CERTIFICATION.md | PACK constitution | Historical |
| CONSTITUTION_CHANGELOG_v1.md | 00-index/CHANGELOG.md | Historical |
| contracts/ | PACK constitution | Legacy |

### implementation-history/
| Document | Phase | Category |
|----------|-------|----------|
| GOVERNANCE-PHASE-2-FINAL-REPORT.md | Phase 2 | Report |
| GOVERNANCE_CLEANUP_EXECUTION_PLAN_v1.md | Phase 4.4 | Plan |
| IMPLEMENTATION_READINESS.md | Phase 4.4 | Assessment |
| PHASE-4.4E-IMPLEMENTATION-SUMMARY.md | Phase 4.4E | Summary |
| REFACTOR_EXECUTION_PLAN.md | Phase 4.4 | Plan |

### rulebook/
| Document | Superseded By | Category |
|----------|--------------|----------|
| MASTER_RULEBOOK.md | PACK-00..10 constitution | Historical Rules |
| RULE_INDEX.md | MASTER_INDEX.md | Historical Index |
| categories/ (30 rule files) | PACK-00..10 constitution | Historical Rules |

### checklists/
| Document | Status |
|----------|--------|
| AUDIT_EXECUTION_CHECKLIST.md | Historical |
| backend-migration-checklist.md | Historical |
| breaking-change-checklist.md | Historical |
| feature-checklist.md | Historical |
| migration-checklist.md | Historical |
| release-checklist.md | Historical |
| storage-checklist.md | Historical |

### historical/
| Document | Category |
|----------|----------|
| EXTENSION-SAFETY-VERIFICATION.md | Historical Reference |
| CODEBASE_SCAN_ORDER.md | Historical Reference |
| HARDENING_ANALYSIS.md | Historical Reference |
| KNOWLEDGE_BASE_VALIDATION.md | Historical Reference |
| CROSS_REFERENCE_VERIFICATION.md | Historical Reference |
| METADATA_VERIFICATION.md | Historical Reference |
| authority/receipt-authority.md | Historical Authority |

### phase-4.4/
| Document | Status |
|----------|--------|
| PACK-03-ERP-V2-REALITY-ARCHITECTURE-SCAN.md | Phase Archive |
| PHASE-4.4-SAAS-AUTHORITY-FREEZE.md | Locked Reference |
| PHASE-4.6-MASTER-DATA-AUTHORITY-AUDIT.md | Phase Archive |

### phase-4.5/
| Documents (14 files) | Phase Archive |

### migration/
(Pending — for future migration documents)

---

## AI Entry Point

**Every AI agent entering the repository MUST:**

1. Read `docs/governance-engine/ai-routing-index.json` → determine what to read
2. Read `docs/governance-engine/conflict-graph.json` → be aware of contradictions
3. Read `docs/governance-engine/authority-graph.json` → understand hierarchy
4. Read `docs/governance-engine/future-upgrade-queue.json` → check pending upgrades
5. Proceed to documents marked `MUST_READ` or `READ_IF_RELEVANT`
6. **NEVER** read documents marked `IGNORE` or `SAFE_TO_ARCHIVE`

---

## Category Count

| Category | Active | Archive | Total |
|----------|--------|---------|-------|
| Constitution (PACK) | 11 | 0 | 11 |
| Architecture | 10 | 4 | 14 |
| Audit | 8 | 10 | 18 |
| Decision (ADR) | 2 | 0 | 2 |
| Lock | 6 | 0 | 6 |
| Module | 5 | 0 | 5 |
| Index | 7 | 6 | 13 |
| Rulebook | 0 | 32 | 32 |
| Checklists | 0 | 7 | 7 |
| Legacy/Historical | 0 | 12 | 12 |
| Implementation History | 0 | 5 | 5 |
| Phase Archives | 0 | 16 | 16 |
| **Grand Total** | **49** | **92** | **141** |

---

## Maintenance

- **Status:** FROZEN — Last Updated: 2026-07-02
- **Maintainer:** Project Lead
- **Update Protocol:** ADR required for any index change
- **Verification:** Cross-reference with governance-engine/knowledge-graph.json
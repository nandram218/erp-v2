# GOVERNANCE CLEANUP EXECUTION PLAN v1

> **Status:** Planning Only — Zero Implementation  
> **Purpose:** Final cleanup plan for `docs/` after Phase-4.5 audit  
> **Date:** 2026-07-02  
> **Mode:** EXECUTION PLANNING ONLY

---

## TABLE OF CONTENTS

1. [Complete Document Classification Registry](#1-complete-document-classification-registry)
2. [Identified Patterns & Issues](#2-identified-patterns--issues)
3. [Final Repository Structure](#3-final-repository-structure)
4. [Answers to 10 Key Questions](#4-answers-to-10-key-questions)
5. [Step-by-Step Execution Plan](#5-step-by-step-execution-plan)

---

## 1. COMPLETE DOCUMENT CLASSIFICATION REGISTRY

Every governance document in `docs/` is classified below with rationale.

### 1.1 SOURCE OF TRUTH — Must remain, authoritative, AI always reads, humans rarely edit

| # | Document | Path | Rationale |
|---|----------|------|-----------|
| SoT-01 | FOUNDATION-BASELINE.md | `/docs/FOUNDATION-BASELINE.md` | Supreme architectural authority. Contract classifications, naming standards, safety contracts, locked files, extension standards, backward compatibility. AI MUST READ. Humans rarely edit (CEO+ADR). |
| SoT-02 | PACK-00 Master Foundation | `/docs/01-constitution/PACK-00_master-foundation.md` | Core principles, purpose, glossary. Foundation of all PACK documents. AI MUST READ. Humans rarely edit (lead approval). |
| SoT-03 | PACK-01 Business Rules | `/docs/01-constitution/PACK-01_business-rules.md` | Core business invariants (fees, students, transport, audit trail). AI READ_IF_RELEVANT. Humans rarely edit. |
| SoT-04 | PACK-02 Folder & File Ownership | `/docs/01-constitution/PACK-02_folder-file-ownership.md` | Ownership matrix, service registry, master-setting ownership, prohibited actions. AI MUST READ. Humans rarely edit. |
| SoT-05 | PACK-03 SaaS Multi-Tenant | `/docs/01-constitution/PACK-03_saas-multi-tenant.md` | Multi-tenancy rules, tenant model, data isolation, storage key convention. AI MUST READ. Humans rarely edit. |
| SoT-06 | PACK-04 UI/UX Standards | `/docs/01-constitution/PACK-04_ui-ux-standards.md` | Frontend consistency rules. AI READ_IF_RELEVANT. Humans rarely edit. |
| SoT-07 | PACK-05 Backend & Database | `/docs/01-constitution/PACK-05_backend-database.md` | Database approach, storage key convention, data shape standards, schema evolution. AI READ_IF_RELEVANT. Humans rarely edit. |
| SoT-08 | PACK-06 Module Rules | `/docs/01-constitution/PACK-06_module-rules.md` | Module structure, responsibilities, cross-module communication rules. AI MUST READ. Humans rarely edit. |
| SoT-09 | PACK-07 Development Workflow | `/docs/01-constitution/PACK-07_development-workflow.md` | Before writing any code, file creation rules, code review checklist, testing requirements, commit convention. Replaces all checklists. AI MUST READ. Humans rarely edit. |
| SoT-10 | PACK-08 Master Roadmap | `/docs/01-constitution/PACK-08_master-roadmap.md` | Phase structure, current phase objectives, delivery rules, change freeze periods. AI READ_IF_RELEVANT. Humans rarely edit. |
| SoT-11 | PACK-09 Controlled Refactor | `/docs/01-constitution/PACK-09_controlled-refactor.md` | When to refactor, refactor process, what cannot change without ADR, safe refactor zones. AI READ_IF_RELEVANT. Humans rarely edit. |
| SoT-12 | PACK-10 Permanent Locks | `/docs/01-constitution/PACK-10_permanent-locks.md` | Lock types, permanent locks (storage, auth, data, module), phase locks, unlock process. AI MUST READ. Humans rarely edit. |
| SoT-13 | PHASE-4.4-SAAS-AUTHORITY-FREEZE.md | `/docs/architecture/PHASE-4.4-SAAS-AUTHORITY-FREEZE.md` | Locked decisions for Phase 4.4. Transport dual authority, service registry pattern, ERP_DB storage, tenant-aware migration pattern. Locked authority. AI MUST READ. Humans never edit. |
| SoT-14 | PHASE-4.6-MASTER-DATA-AUTHORITY-AUDIT.md | `/docs/architecture/PHASE-4.6-MASTER-DATA-AUTHORITY-AUDIT.md` | Master data authority audit. Active reference for master-setting rules. AI READ_IF_RELEVANT. |
| SoT-15 | receipt-authority.md | `/docs/authority/receipt-authority.md` | Receipt authority ownership. Active governance. AI READ_IF_RELEVANT. Humans rarely edit. |

### 1.2 KEEP — Active, needed, but not source-of-truth level

| # | Document | Path | Rationale |
|---|----------|------|-----------|
| K-01 | MASTER_CONTEXT.md | `/docs/00-index/MASTER_CONTEXT.md` | First-document for AI onboarding. Project identity, current phase, current locks. AI MUST READ first. Human-editable periodically. |
| K-02 | MASTER_INDEX.md | `/docs/00-index/MASTER_INDEX.md` | Navigation hub. Useful for human browsing. AI may skip if using governance engine. Keep as human-oriented index. |
| K-03 | CURRENT_STATE.md | `/docs/00-index/CURRENT_STATE.md` | Project current reality snapshot. Useful for context. AI OPTIONAL. Keep. |
| K-04 | READING_ORDER.md | `/docs/00-index/READING_ORDER.md` | Canonical reading paths. Supplementary to governance engine. Keep. |
| K-05 | TAG_INDEX.md | `/docs/00-index/TAG_INDEX.md` | Tag-based document discovery. Useful for search. Keep. |
| K-06 | CHANGELOG.md | `/docs/00-index/CHANGELOG.md` | History of changes. Keep for historical reference. AI OPTIONAL. |
| K-07 | INDEX.md (audits) | `/docs/03-audits/INDEX.md` | Audit navigation index. Keep. |
| K-08 | ADR-0001 Service Registry | `/docs/04-decisions/ADR-0001-service-registry.md` | Active ADR. AI READ_IF_RELEVANT. Keep. |
| K-09 | ADR-0002 Storage Owner | `/docs/04-decisions/ADR-0002-storage-owner.md` | Active ADR. AI READ_IF_RELEVANT. Keep. |
| K-10 | architecture-locks.md | `/docs/05-locks/architecture-locks.md` | Architecture lock constraints. AI READ_IF_RELEVANT. Keep. |
| K-11 | authority-locks.md | `/docs/05-locks/authority-locks.md` | Authority lock constraints. AI READ_IF_RELEVANT. Keep. |
| K-12 | folder-locks.md | `/docs/05-locks/folder-locks.md` | Folder lock constraints. AI READ_IF_RELEVANT. Keep. |
| K-13 | master-lock-sheet.md | `/docs/05-locks/master-lock-sheet.md` | Master lock sheet. AI READ_IF_RELEVANT. Keep. |
| K-14 | naming-locks.md | `/docs/05-locks/naming-locks.md` | Naming lock constraints. AI READ_IF_RELEVANT. Keep. |
| K-15 | storage-locks.md | `/docs/05-locks/storage-locks.md` | Storage lock constraints. AI READ_IF_RELEVANT. Keep. |
| K-16 | module-fees.md | `/docs/06-modules/module-fees.md` | Module documentation. AI READ_IF_RELEVANT. Keep. |
| K-17 | module-students.md | `/docs/06-modules/module-students.md` | Module documentation. AI READ_IF_RELEVANT. Keep. |
| K-18 | module-transport.md | `/docs/06-modules/module-transport.md` | Module documentation. AI READ_IF_RELEVANT. Keep. |
| K-19 | module-hostel.md | `/docs/06-modules/module-hostel.md` | Module documentation. AI READ_IF_RELEVANT. Keep. |
| K-20 | module-attendance.md | `/docs/06-modules/module-attendance.md` | Module documentation. AI READ_IF_RELEVANT. Keep. |
| K-21 | RULE_INDEX.md | `/docs/07-rulebook/RULE_INDEX.md` | Rule index. Useful for cross-ref. Keep. |
| K-22 | MASTER_RULEBOOK.md | `/docs/07-rulebook/MASTER_RULEBOOK.md` | **KEEP BUT FLAG AS SUPERSEDED.** Currently marked MUST_IGNORE. Move to archive. |
| K-23 | Architecture docs (10 files) | `/docs/02-architecture/*.md` | All 10 architecture files: authority-matrix, current-reality, data-flow, dependency-graph, file-ownership, folder-map, service-registry, storage-flow, store-runtime, tenant-isolation. AI READ_IF_RELEVANT. Keep in place. |
| K-24 | Audit reports (7 files) | `/docs/03-audits/audit-*.md` | Active audit reports: fee-engine, module-boundaries, runtime-lifecycle, saas-isolation, service-registry, storage-authority, student-module. AI READ_IF_RELEVANT. Keep. |
| K-25 | All contract JSON files (9 files) | `/docs/contracts/*.contract.json` | Machine-readable contract definitions: dashboard, fee, identifier, receipt, service, storage, student, tenant, transport. AI READ_IF_RELEVANT. Machine-owned. Keep. |

### 1.3 ARCHIVE — Move to /docs/99-archive/ (safe to move, no current authority)

| # | Document | Path | Rationale |
|---|----------|------|-----------|
| A-01 | AUDIT_EXECUTION_CHECKLIST.md | `/docs/AUDIT_EXECUTION_CHECKLIST.md` | Historical checklist. No current value. Pre-PACK-07. Archive. |
| A-02 | CODEBASE_SCAN_ORDER.md | `/docs/CODEBASE_SCAN_ORDER.md` | Temporary audit artifact. Archive. |
| A-03 | ERP-V2-ARCHITECTURE-AUDIT-CONSTITUTION-PREP.md | `/docs/ERP-V2-ARCHITECTURE-AUDIT-CONSTITUTION-PREP.md` | Draft preparatory doc. Superseded by final constitution. Archive. |
| A-04 | EXTENSION-SAFETY-VERIFICATION.md | `/docs/EXTENSION-SAFETY-VERIFICATION.md` | Audit-phase verification doc. No ongoing role. Archive. |
| A-05 | FINAL_CONSTITUTION_CERTIFICATION.md | `/docs/FINAL_CONSTITUTION_CERTIFICATION.md` | Completion report for constitution phase. Historical. Archive. |
| A-06 | GOVERNANCE-PHASE-2-FINAL-REPORT.md | `/docs/GOVERNANCE-PHASE-2-FINAL-REPORT.md` | Phase-2 completion report. Historical. Archive. |
| A-07 | HARDENING_ANALYSIS.md | `/docs/HARDENING_ANALYSIS.md` | Pre-constitution hardening analysis. Archive. |
| A-08 | IMPLEMENTATION_READINESS.md | `/docs/IMPLEMENTATION_READINESS.md` | Readiness assessment. Historical. Archive. |
| A-09 | MASTER_ARCHITECTURE_AUDIT_PLAN.md | `/docs/MASTER_ARCHITECTURE_AUDIT_PLAN.md` | Planning document for architecture audit. Archive. |
| A-10 | MASTER_GOVERNANCE_AUDIT.md | `/docs/MASTER_GOVERNANCE_AUDIT.md` | Master governance audit report. Historical. Archive. |
| A-11 | PHASE-4.4E-IMPLEMENTATION-SUMMARY.md | `/docs/PHASE-4.4E-IMPLEMENTATION-SUMMARY.md` | Phase-4.4E summary. Historical. Archive. |
| A-12 | REFACTOR_EXECUTION_PLAN.md | `/docs/REFACTOR_EXECUTION_PLAN.md` | Refactor plan. No longer actively referenced. Archive. |
| A-13 | VIOLATION_CLASSIFICATION.md | `/docs/VIOLATION_CLASSIFICATION.md` | Violation audit artifact. Archive. |
| A-14 | CONSTITUTION_CHANGELOG_v1.md | `/docs/CONSTITUTION_CHANGELOG_v1.md` | Constitution change log (superseded by 00-index/CHANGELOG.md). Archive. |
| A-15 | PACK-03-Reality-Scan | `/docs/architecture/PACK-03-ERP-V2-REALITY-ARCHITECTURE-SCAN.md` | Reality scan superseded by PACK-03 and PHASE-4.4 freeze. Archive. |
| A-16 | ALL checklist files (6 files) | `/docs/checklists/*.md` | All checklists: backend-migration, breaking-change, feature, migration, release, storage. Superseded by PACK-07. Archive. |
| A-17 | RULE-01..30 files | `/docs/07-rulebook/categories/RULE-*.md` | All 30 rule category files. Superseded by PACK constitution. Archive. |
| A-18 | REPAIR_REPORT_v1.md | `/docs/07-rulebook/REPAIR_REPORT_v1.md` | Repair report. Historical. Archive. |
| A-19 | FINAL_AUDIT_REPORT.md | `/docs/07-rulebook/FINAL_AUDIT_REPORT.md` | Final audit report. Historical. Archive. |
| A-20 | AUDIT_REPORT_v1.md | `/docs/07-rulebook/AUDIT_REPORT_v1.md` | Audit report v1. Historical. Archive. |
| A-21 | CONSTITUTION_LOCK_v1.0.md | `/docs/07-rulebook/CONSTITUTION_LOCK_v1.0.md` | Superseded by FOUNDATION-BASELINE.md + PACK-10. Archive. |
| A-22 | KEEP/ARCHIVE/MERGE/DELETE/REGENERATE/SUPERSEDED/GENERATED FILE/SOURCE OF TRUTH — K-22 (MASTER_RULEBOOK — move to archive) | See K-22 above — it belongs in archive. |

### 1.4 DELETE — Safe to remove entirely (one-time scripts, empty dirs, temp artifacts)

| # | Document | Path | Rationale |
|---|----------|------|-----------|
| D-01 | audit-report-generator.js | `/docs/07-rulebook/audit-report-generator.js` | One-time script. No longer used. DELETE. (Or archive if git history retention is desired.) |
| D-02 | constitution-repair-script.js | `/docs/07-rulebook/constitution-repair-script.js` | One-time script. Repairs complete. DELETE. |
| D-03 | ERP_DB_CALLERS.txt | `/docs/audit/phase-4.4c/ERP_DB_CALLERS.txt` | Temporary audit artifact. DELETE. |
| D-04 | STORAGE_READERS.txt | `/docs/audit/phase-4.4c/STORAGE_READERS.txt` | Temporary audit artifact. DELETE. |
| D-05 | STORAGE_WRITERS.txt | `/docs/audit/phase-4.4c/STORAGE_WRITERS.txt` | Temporary audit artifact. DELETE. |
| D-06 | Empty subdirs in 03-audits/archive | `/docs/03-audits/archive/` | Empty directory. DELETE. |
| D-07 | Empty subdirs in 99-archive/ | `/docs/99-archive/history/`, `/docs/99-archive/legacy-audits/`, `/docs/99-archive/superseded/` | Empty directories. DELETE (contents never materialized). |

### 1.5 GENERATED FILES — Machine-generated, AI-owned, should never be manually edited

| # | Document | Path | Rationale |
|---|----------|------|-----------|
| G-01 | knowledge-graph.json | `/docs/governance-engine/knowledge-graph.json` | Machine-generated document relationship graph. Never human-edit. |
| G-02 | authority-graph.json | `/docs/governance-engine/authority-graph.json` | Machine-generated governance hierarchy. Never human-edit. |
| G-03 | lifecycle-graph.json | `/docs/governance-engine/lifecycle-graph.json` | Machine-generated lifecycle states. Never human-edit. |
| G-04 | dependency-graph.json | `/docs/governance-engine/dependency-graph.json` | Machine-generated dependency graph. Never human-edit. |
| G-05 | conflict-graph.json | `/docs/governance-engine/conflict-graph.json` | Machine-generated contradiction map. Never human-edit. |
| G-06 | ai-routing-index.json | `/docs/governance-engine/ai-routing-index.json` | Machine-generated AI routing index. Never human-edit. |
| G-07 | future-upgrade-queue.json | `/docs/governance-engine/future-upgrade-queue.json` | Machine-generated upgrade queue. Never human-edit. |

### 1.6 REGENERATE — Should be rebuilt from authoritative sources

| # | Document | Path | Rationale |
|---|----------|------|-----------|
| R-01 | governance-engine/README.md | `/docs/governance-engine/README.md` | Should be regenerated to reflect final cleanup state. Update version, doc paths, and removed references to archived docs. |

### 1.7 SUPERSEDED — Exists but must be clearly marked

| # | Document | Path | Superseded-By | Action |
|---|----------|------|---------------|--------|
| S-01 | MASTER_RULEBOOK.md | `/docs/07-rulebook/MASTER_RULEBOOK.md` | PACK-00..10 constitution | Move to 99-archive. |
| S-02 | CONSTITUTION_LOCK_v1.0.md | `/docs/07-rulebook/CONSTITUTION_LOCK_v1.0.md` | FOUNDATION-BASELINE.md + PACK-10 | Move to 99-archive. |
| S-03 | All 07-rulebook/categories/RULE-*.md (30 files) | `/docs/07-rulebook/categories/` | PACK constitution | Move to 99-archive. |
| S-04 | PACK-03 Reality Scan | `/docs/architecture/PACK-03-ERP-V2-REALITY-ARCHITECTURE-SCAN.md` | PACK-03 + PHASE-4.4 freeze | Move to 99-archive. |
| S-05 | All checklists (6 files) | `/docs/checklists/*.md` | PACK-07 | Move to 99-archive. |

### 1.8 MERGE — Combine into single authoritative document

| # | Documents | Target | Rationale |
|---|-----------|--------|-----------|
| M-01 | 00-index/CROSS_REFERENCE_VERIFICATION.md → merge into MASTER_INDEX.md | MASTER_INDEX.md | Cross-reference verification is index metadata. Consolidate into master index. |
| M-02 | 00-index/KNOWLEDGE_BASE_VALIDATION.md → merge into MASTER_CONTEXT.md | MASTER_CONTEXT.md | KB validation status belongs in context document. |
| M-03 | 00-index/METADATA_VERIFICATION.md → merge into MASTER_INDEX.md | MASTER_INDEX.md | Metadata verification is index metadata. Consolidate. |
| M-04 | KNOWLEDGE_GRAPH.md (index) → superseded by governance-engine/knowledge-graph.json | Archive the .md, keep .json | Human-readable graph doc superseded by machine-generated JSON. Archive the markdown. |

---

## 2. IDENTIFIED PATTERNS & ISSUES

### 2.1 Duplicate Documentation
- **CONSTITUTION_CHANGELOG_v1.md** duplicates 00-index/CHANGELOG.md → Archive CONSTITUTION_CHANGELOG_v1.md.
- **KNOWLEDGE_GRAPH.md** (00-index) is duplicated by governance-engine/knowledge-graph.json → Archive the .md.
- **07-rulebook/MASTER_RULEBOOK.md** is a pre-constitution document duplicated by PACK-00..10 → Archive.
- **Rule categories (RULE-01..30)** are rule-level breakdowns duplicated by PACK constitution → Archive.

### 2.2 Temporary Audit Reports
- All `/docs/audit/phase-4.4c/*.txt` files are raw scanner output → DELETE.
- All top-level governance phase reports (GOVERNANCE-PHASE-2-FINAL-REPORT, FINAL_CONSTITUTION_CERTIFICATION, MASTER_GOVERNANCE_AUDIT, MASTER_ARCHITECTURE_AUDIT_PLAN, etc.) are phase-completion artifacts → ARCHIVE.

### 2.3 Orphaned Empty Directories
- `/docs/03-audits/archive/` → empty → DELETE.
- `/docs/99-archive/history/` → empty → DELETE.
- `/docs/99-archive/legacy-audits/` → empty → DELETE.
- `/docs/99-archive/superseded/` → empty → DELETE.

### 2.4 Situational Conflict: governance-engine/README.md
- Currently references ai-routing-index.json with MUST_READ for all governance-engine files.
- After cleanup, must update README to remove references to archived/superseded docs.
- Mark for REGENERATION.

### 2.5 Top-Level Clutter
- 14 standalone .md files at `/docs/` root. All are temporary/phase artifacts except FOUNDATION-BASELINE.md.
- After cleanup, only FOUNDATION-BASELINE.md should remain at root level.

### 2.6 Dual Governance Engine vs Static Index Overlap
- 00-index/MASTER_INDEX.md, READING_ORDER.md, TAG_INDEX.md partially duplicate governance-engine routing index.
- Resolution: Keep both. MASTER_INDEX.md is human-oriented; governance-engine is AI-oriented.

---

## 3. FINAL REPOSITORY STRUCTURE

```
docs/
├── FOUNDATION-BASELINE.md              ← SOURCE OF TRUTH (permanent master baseline)
│
├── 00-index/                           ← Human-oriented indices
│   ├── MASTER_INDEX.md                 ← KEEP (merged with CROSS_REF + METADATA)
│   ├── MASTER_CONTEXT.md               ← KEEP (merged with KB_VALIDATION)
│   ├── CURRENT_STATE.md                ← KEEP
│   ├── READING_ORDER.md                ← KEEP
│   ├── TAG_INDEX.md                    ← KEEP
│   └── CHANGELOG.md                    ← KEEP
│
├── 01-constitution/                    ← SOURCE OF TRUTH (permanent, AI always reads subset)
│   ├── PACK-00_master-foundation.md
│   ├── PACK-01_business-rules.md
│   ├── PACK-02_folder-file-ownership.md
│   ├── PACK-03_saas-multi-tenant.md
│   ├── PACK-04_ui-ux-standards.md
│   ├── PACK-05_backend-database.md
│   ├── PACK-06_module-rules.md
│   ├── PACK-07_development-workflow.md
│   ├── PACK-08_master-roadmap.md
│   ├── PACK-09_controlled-refactor.md
│   └── PACK-10_permanent-locks.md
│
├── 02-architecture/                    ← KEEP (AI READ_IF_RELEVANT)
│   ├── architecture-authority-matrix.md
│   ├── architecture-current-reality.md
│   ├── architecture-data-flow.md
│   ├── architecture-dependency-graph.md
│   ├── architecture-file-ownership.md
│   ├── architecture-folder-map.md
│   ├── architecture-service-registry.md
│   ├── architecture-storage-flow.md
│   ├── architecture-store-runtime.md
│   └── architecture-tenant-isolation.md
│
├── 03-audits/                          ← KEEP (AI READ_IF_RELEVANT)
│   ├── INDEX.md
│   ├── audit-fee-engine.md
│   ├── audit-module-boundaries.md
│   ├── audit-runtime-lifecycle.md
│   ├── audit-saas-isolation.md
│   ├── audit-service-registry.md
│   ├── audit-storage-authority.md
│   └── audit-student-module.md
│
├── 04-decisions/                       ← KEEP (AI READ_IF_RELEVANT)
│   ├── ADR-0001-service-registry.md
│   └── ADR-0002-storage-owner.md
│
├── 05-locks/                           ← KEEP (AI READ_IF_RELEVANT)
│   ├── architecture-locks.md
│   ├── authority-locks.md
│   ├── folder-locks.md
│   ├── master-lock-sheet.md
│   ├── naming-locks.md
│   └── storage-locks.md
│
├── 06-modules/                         ← KEEP (AI READ_IF_RELEVANT)
│   ├── module-attendance.md
│   ├── module-fees.md
│   ├── module-hostel.md
│   ├── module-students.md
│   └── module-transport.md
│
├── governance-engine/                  ← KEEP (AI first entry point)
│   ├── README.md                       ← REGENERATE
│   ├── knowledge-graph.json            ← GENERATED (machine-owned)
│   ├── authority-graph.json            ← GENERATED (machine-owned)
│   ├── lifecycle-graph.json            ← GENERATED (machine-owned)
│   ├── dependency-graph.json           ← GENERATED (machine-owned)
│   ├── conflict-graph.json             ← GENERATED (machine-owned)
│   ├── ai-routing-index.json           ← GENERATED (machine-owned)
│   └── future-upgrade-queue.json       ← GENERATED (machine-owned)
│
├── contracts/                          ← KEEP (GENERATED/machine-readable)
│   ├── dashboard.contract.json
│   ├── fee.contract.json
│   ├── identifier.contract.json
│   ├── receipt.contract.json
│   ├── service.contract.json
│   ├── storage.contract.json
│   ├── student.contract.json
│   ├── tenant.contract.json
│   └── transport.contract.json
│
├── authority/                          ← KEEP
│   └── receipt-authority.md
│
├── 99-archive/                         ← Consolidated archive target
│   └── README.md                       ← UPDATE to reflect new contents
│   (All archived documents moved here from top-level + 07-rulebook + checklists + architecture)
│
└── (All other directories removed)
```

### Folders That Disappear Completely

| Folder | Reason |
|--------|--------|
| `/docs/audit/` | Temporary audit artifacts. Contents deleted or archived. |
| `/docs/archive/` | Superseded by `/docs/99-archive/`. Move phase-4.5 docs into 99-archive. |
| `/docs/07-rulebook/` | Entire directory archived (all content moved to 99-archive). |
| `/docs/checklists/` | Entire directory archived. Superseded by PACK-07. |
| `/docs/architecture/` | Contents: PHASE-4.4 freeze (SoT-13) moves to 02-architecture/, PACK-03 Reality Scan archived, PHASE-4.6 audit (SoT-14) moves to 02-architecture/. Then delete this flat directory. |

### Phase-4.5 Archive Documents (move from /docs/archive/phase-4.5/ to /docs/99-archive/)

All 14 documents currently in `/docs/archive/phase-4.5/` should move to `/docs/99-archive/`. These are historical execution records: PHASE-4.5A through PHASE-4.5E, validation reports, tenant test reports, etc.

---

## 4. ANSWERS TO 10 KEY QUESTIONS

### Q1: What remains after cleanup?

**70 files** in the final structure (down from ~108):
- 1 SOURCE OF TRUTH root document (FOUNDATION-BASELINE.md)
- 11 constitution PACKs (01-constitution/)
- 10 architecture documents (02-architecture/)
- 8 audit documents (03-audits/)
- 2 ADR documents (04-decisions/)
- 6 lock documents (05-locks/)
- 5 module documents (06-modules/)
- 6 index documents (00-index/)
- 7 governance-engine files (1 README + 6 JSON)
- 9 contract JSON files (contracts/)
- 1 authority document (authority/)
- 1 archive README (99-archive/)
- ~5 archived documents moved into 99-archive/

### Q2: What moves into archive?

**~45 documents** move to `/docs/99-archive/`:
- 14 top-level governance phase reports
- 30 RULE category files from 07-rulebook
- 6 checklist files from checklists/
- MASTER_RULEBOOK.md, CONSTITUTION_LOCK_v1.0.md, REPAIR_REPORT_v1.md, AUDIT_REPORT_v1.md, FINAL_AUDIT_REPORT.md
- PACK-03 Reality Scan
- 14 phase-4.5 execution docs from /docs/archive/phase-4.5/

### Q3: What becomes generated?

**7 files** remain generated/machine-owned:
- governance-engine/knowledge-graph.json
- governance-engine/authority-graph.json
- governance-engine/lifecycle-graph.json
- governance-engine/dependency-graph.json
- governance-engine/conflict-graph.json
- governance-engine/ai-routing-index.json
- governance-engine/future-upgrade-queue.json

### Q4: Which indexes remain?

| Index | Status |
|-------|--------|
| 00-index/MASTER_INDEX.md | KEEP (merge CROSS_REF + METADATA into it) |
| 00-index/MASTER_CONTEXT.md | KEEP (merge KB_VALIDATION into it) |
| 00-index/READING_ORDER.md | KEEP |
| 00-index/TAG_INDEX.md | KEEP |
| 00-index/CHANGELOG.md | KEEP |
| 00-index/CURRENT_STATE.md | KEEP |
| 03-audits/INDEX.md | KEEP |
| governance-engine/ai-routing-index.json | KEEP (generated) |
| 07-rulebook/RULE_INDEX.md | Archive (superseded by governance engine) |

### Q5: Which documents become authoritative?

**15 SOURCE OF TRUTH documents:**
- FOUNDATION-BASELINE.md (supreme)
- PACK-00 through PACK-10 (11 documents)
- PHASE-4.4-SAAS-AUTHORITY-FREEZE.md (locked phase authority)
- PHASE-4.6-MASTER-DATA-AUTHORITY-AUDIT.md (active master-data authority)
- receipt-authority.md (active authority)

### Q6: Which documents should AI always read?

**Mandatory reading for every AI agent (in priority order):**
1. governance-engine/ai-routing-index.json (first)
2. governance-engine/conflict-graph.json
3. governance-engine/future-upgrade-queue.json
4. governance-engine/authority-graph.json
5. FOUNDATION-BASELINE.md
6. MASTER_CONTEXT.md (00-index/)
7. PACK-00 Master Foundation (01-constitution/)
8. PACK-02 Folder & File Ownership (01-constitution/)
9. PACK-03 SaaS Multi-Tenant (01-constitution/)
10. PACK-06 Module Rules (01-constitution/)
11. PACK-07 Development Workflow (01-constitution/)
12. PACK-10 Permanent Locks (01-constitution/)
13. PHASE-4.4-SAAS-AUTHORITY-FREEZE.md (02-architecture/)

### Q7: Which documents should AI never read?

**All archived documents** — moved to 99-archive/. AI should be instructed via ai-routing-index.json to skip these. Specifically:
- All 07-rulebook/ files (after archival)
- All checklists/ files
- All top-level governance phase reports
- All temporary audit artifacts

### Q8: Which documents should humans rarely edit?

**All SOURCE OF TRUTH documents** (15 documents):
- FOUNDATION-BASELINE.md — CEO + ADR required
- PACK-00..10 — Lead approval required
- PHASE-4.4 freeze, PHASE-4.6 audit — Locked documents
- receipt-authority.md — Authority holder only

### Q9: Which documents become machine-owned?

**16 files** become machine-owned:
- 7 governance-engine JSON files (generated, never human-edit)
- 9 contract JSON files (machine-readable, human-edit only via tooling)

### Q10: Which folders can disappear completely?

| Folder | Disposition |
|--------|-------------|
| `/docs/audit/` | DELETE entirely (contents: 3 txt files + empty phase-4.4c dir) |
| `/docs/archive/` | DELETE entirely (contents moved to 99-archive/) |
| `/docs/07-rulebook/` | DELETE entirely (all contents archived) |
| `/docs/checklists/` | DELETE entirely (all contents archived) |
| `/docs/architecture/` | DELETE (non-standard flat dir — its contents moved to 02-architecture/ or 99-archive/) |
| `/docs/03-audits/archive/` | DELETE (empty) |
| `/docs/99-archive/history/` | DELETE (empty) |
| `/docs/99-archive/legacy-audits/` | DELETE (empty) |
| `/docs/99-archive/superseded/` | DELETE (empty) |

---

## 5. STEP-BY-STEP EXECUTION PLAN

### Phase 1: Consolidate 00-index/ Documents (3 steps)

```
Step 1.1 — Merge CROSS_REFERENCE_VERIFICATION.md → append content to MASTER_INDEX.md
Step 1.2 — Merge METADATA_VERIFICATION.md → append content to MASTER_INDEX.md
Step 1.3 — Merge KNOWLEDGE_BASE_VALIDATION.md → append content to MASTER_CONTEXT.md
```

### Phase 2: Move 07-rulebook/ to Archive (2 steps)

```
Step 2.1 — Create /docs/99-archive/rulebook/ directory
Step 2.2 — Move ALL files from /docs/07-rulebook/ to /docs/99-archive/rulebook/
   - MASTER_RULEBOOK.md
   - RULE_INDEX.md
   - CONSTITUTION_LOCK_v1.0.md
   - FINAL_AUDIT_REPORT.md
   - AUDIT_REPORT_v1.md
   - REPAIR_REPORT_v1.md
   - categories/RULE-01.md through RULE-30.md
   - audit-report-generator.js (or DELETE)
   - constitution-repair-script.js (or DELETE)
```

### Phase 3: Move All Checklists to Archive (1 step)

```
Step 3.1 — Move /docs/checklists/ → /docs/99-archive/checklists/
   - backend-migration-checklist.md
   - breaking-change-checklist.md
   - feature-checklist.md
   - migration-checklist.md
   - release-checklist.md
   - storage-checklist.md
```

### Phase 4: Move Top-Level Governance Reports to Archive (14 steps)

```
Move each of these 14 files from /docs/ → /docs/99-archive/governance-reports/:

Step 4.01 — CODEBASE_SCAN_ORDER.md
Step 4.02 — CONSTITUTION_CHANGELOG_v1.md
Step 4.03 — ERP-V2-ARCHITECTURE-AUDIT-CONSTITUTION-PREP.md
Step 4.04 — EXTENSION-SAFETY-VERIFICATION.md
Step 4.05 — FINAL_CONSTITUTION_CERTIFICATION.md
Step 4.06 — GOVERNANCE-PHASE-2-FINAL-REPORT.md
Step 4.07 — HARDENING_ANALYSIS.md
Step 4.08 — IMPLEMENTATION_READINESS.md
Step 4.09 — MASTER_ARCHITECTURE_AUDIT_PLAN.md
Step 4.10 — MASTER_GOVERNANCE_AUDIT.md
Step 4.11 — PHASE-4.4E-IMPLEMENTATION-SUMMARY.md
Step 4.12 — REFACTOR_EXECUTION_PLAN.md
Step 4.13 — VIOLATION_CLASSIFICATION.md
Step 4.14 — AUDIT_EXECUTION_CHECKLIST.md
```

### Phase 5: Move Phase-4.5 Execution Docs to Archive (2 steps)

```
Step 5.1 — Move /docs/archive/phase-4.5/ → /docs/99-archive/phase-4.5/
   (14 documents: EXECUTION_PLAN, FINAL_REPORT, TENANT_TEST, VALIDATION, 5A REALIGN, etc.)
Step 5.2 — DELETE /docs/archive/ (empty now)
```

### Phase 6: Clean Up /docs/architecture/ (3 steps)

```
Step 6.1 — Move PHASE-4.4-SAAS-AUTHORITY-FREEZE.md to /docs/02-architecture/ (if not already there)
Step 6.2 — Move PHASE-4.6-MASTER-DATA-AUTHORITY-AUDIT.md to /docs/02-architecture/
Step 6.3 — Archive PACK-03-ERP-V2-REALITY-ARCHITECTURE-SCAN.md to /docs/99-archive/
```

### Phase 7: Delete Temporary Artifacts (2 steps)

```
Step 7.1 — DELETE /docs/audit/phase-4.4c/ERP_DB_CALLERS.txt
Step 7.2 — DELETE /docs/audit/phase-4.4c/STORAGE_READERS.txt
Step 7.3 — DELETE /docs/audit/phase-4.4c/STORAGE_WRITERS.txt
Step 7.4 — DELETE /docs/audit/ directory (empty after removal)
```

### Phase 8: Delete Empty Directories (4 steps)

```
Step 8.1 — DELETE /docs/03-audits/archive/ (empty)
Step 8.2 — DELETE /docs/99-archive/history/ (empty)
Step 8.3 — DELETE /docs/99-archive/legacy-audits/ (empty)
Step 8.4 — DELETE /docs/99-archive/superseded/ (empty)
```

### Phase 9: Update 00-index/ Documents (2 steps)

```
Step 9.1 — DELETE 00-index/CROSS_REFERENCE_VERIFICATION.md (merged into MASTER_INDEX.md)
Step 9.2 — DELETE 00-index/METADATA_VERIFICATION.md (merged into MASTER_INDEX.md)
Step 9.3 — DELETE 00-index/KNOWLEDGE_BASE_VALIDATION.md (merged into MASTER_CONTEXT.md)
Step 9.4 — Archive 00-index/KNOWLEDGE_GRAPH.md to 99-archive/ (superseded by governance-engine JSON)
```

### Phase 10: Regenerate governance-engine/README.md (1 step)

```
Step 10.1 — Update governance-engine/README.md to:
   - Remove references to archived documents
   - Update file counts
   - Reflect final structure paths
```

### Phase 11: Update 99-archive/README.md (1 step)

```
Step 11.1 — Update /docs/99-archive/README.md to document new archive structure with all categories:
   - governance-reports/
   - rulebook/
   - checklists/
   - phase-4.5/
   - legacy-architecture-scans/
```

### Phase 12: Verify Final Structure (1 step)

```
Step 12.1 — Run final file listing to confirm:
   - Only intended directories remain
   - No orphaned files
   - Archive README is accurate
   - governance-engine routing index is consistent with new structure
```

---

## EXECUTION SUMMARY

| Phase | Description | Operations | File Moves |
|-------|-------------|------------|------------|
| 1 | Consolidate 00-index/ | 3 merges | 0 moves |
| 2 | Archive 07-rulebook/ | 2 moves | ~33 files |
| 3 | Archive checklists/ | 1 move | 6 files |
| 4 | Archive top-level reports | 14 moves | 14 files |
| 5 | Archive phase-4.5 | 2 moves | 14 files |
| 6 | Clean /docs/architecture/ | 3 moves | 3 files |
| 7 | Delete temp artifacts | 4 deletes | 4 files |
| 8 | Delete empty dirs | 4 deletes | 0 files |
| 9 | Update 00-index/ | 4 deletes | 4 files |
| 10 | Regenerate README | 1 edit | 0 files |
| 11 | Update archive README | 1 edit | 0 files |
| 12 | Verify | 1 command | 0 files |
| **Total** | | **~36 operations** | **~78 file moves** |

**Final document count after cleanup: ~70 files** (down from ~108)

**Folders remaining:** `00-index/`, `01-constitution/`, `02-architecture/`, `03-audits/`, `04-decisions/`, `05-locks/`, `06-modules/`, `contracts/`, `governance-engine/`, `authority/`, `99-archive/`

**Folders eliminated:** `audit/`, `archive/`, `07-rulebook/`, `checklists/`, `architecture/` (flat), `03-audits/archive/`, `99-archive/history/`, `99-archive/legacy-audits/`, `99-archive/superseded/`
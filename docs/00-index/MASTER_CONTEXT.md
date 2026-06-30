# MASTER CONTEXT
> **ERP-v2 Knowledge Base v1.1 (Permanent)**
> First document for every AI agent and developer

---
## Project Identity
| Field | Value |
|-------|-------|
| Project Name | ERP-v2 |
| Domain | Multi-tenant school management ERP for Indian school chains |
| Primary Language | JavaScript (React) |
| Repository | https://github.com/nandram218/erp-v2.git |

---
## Current Phase
**Phase-4.4** (SAAS Authority Freeze)
- Multi-tenancy implemented and active
- Authority rules frozen for Phase-4
- 5 active modules: students, fees, transport, hostel, attendance

---
## Current Branch
- Primary: `main`
- Documentation-only work branches from `main`

---
## Current Architecture Version
v4.4 — SaaS-isolated, service-registry-based, module-boundary-enforced

---
## Knowledge Base Version
**v1.1** (Pre-Constitution Lock)
- Predecessor: v1.0
- Purpose: Finalize documentation as single source of truth for PACK-03 through PACK-11

---
## Constitution Progress
| PACK | Topic | Status |
|------|-------|--------|
| PACK-00 | Master Foundation | ✅ Stable |
| PACK-01 | Business Rules | ✅ Stable |
| PACK-02 | Folder & File Ownership | ✅ Stable |
| PACK-03 | SaaS Multi-Tenant | ✅ Stable |
| PACK-04 | UI/UX Standards | ✅ Stable |
| PACK-05 | Backend & Database | ✅ Stable |
| PACK-06 | Module Rules | ✅ Stable |
| PACK-07 | Development Workflow | ✅ Stable |
| PACK-08 | Master Roadmap | ✅ Stable |
| PACK-09 | Controlled Refactor | ✅ Stable |
| PACK-10 | Permanent Locks | ✅ Stable |
| PACK-11 | *Pending* | Draft pending |

---
## Current SaaS Status
- Multi-tenancy: ✅ Implemented (tenant isolation active)
- Tenant ID field: `schoolId`
- Storage key format: `{schoolId}__{module}__{entity}`
- Auth header: `Authorization: Bearer {token}`

---
## Current Locks
**Permanent Locks (L-01 through L-09):**
- Key format, Tenant ID, Primary key, Soft delete, Auth header, Context key, Currency (INR), Date format (ISO 8601), Lock protocol

**Phase Locks (PL-01 through PL-04):**
- Service registry, Module boundaries, Authority matrix, Audit requirements — locked until end of PHASE-4

See `docs/05-locks/master-lock-sheet.md` for complete inventory.

---
## Current Pending Work
1. PACK-11 drafting (pending)
2. Formal ADR extraction from git history
3. Audit report generation
4. Module boundary fine-tuning

---
## Current Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Documentation drift | High | Lock PACK-03 through PACK-10; only ADR unlocks |
| Module boundary violations | Medium | Service registry audits; runtime validation |
| Incomplete ADR history | Medium | Extract from git history |

---
## Current Next Step
1. Finalize MASTER_CONTEXT.md (this file)
2. Upgrade MASTER_INDEX.md to navigation hub
3. Normalize TAG_INDEX.md
4. Run metadata and cross-reference verification
5. Publish canonical reading orders
6. Validate Knowledge Base completeness for PACK-11

---
## Required Reading Order
### New AI / New Developer
1. `01-constitution/PACK-00_master-foundation.md`
2. `00-index/CURRENT_STATE.md`
3. `01-constitution/PACK-02_folder-file-ownership.md`
4. `01-constitution/PACK-07_development-workflow.md`
5. `00-index/KNOWLEDGE_GRAPH.md`
6. `01-constitution/PACK-06_module-rules.md`
7. `02-architecture/` (all)
8. `06-modules/` (relevant)
9. `05-locks/` (all)

### Architecture Review
1. `02-architecture/architecture-current-reality.md`
2. `02-architecture/architecture-dependency-graph.md`
3. `02-architecture/architecture-service-registry.md`
4. `02-architecture/architecture-tenant-isolation.md`
5. `03-audits/audit-saas-isolation.md`
6. `03-audits/audit-module-boundaries.md`

### Constitution Writing
1. `01-constitution/PACK-00_master-foundation.md`
2. `01-constitution/PACK-01_business-rules.md`
3. `01-constitution/PACK-05_backend-database.md`
4. `01-constitution/PACK-06_module-rules.md`
5. `01-constitution/PACK-10_permanent-locks.md`

### Code Refactoring
1. `01-constitution/PACK-09_controlled-refactor.md`
2. `01-constitution/PACK-08_master-roadmap.md`
3. `03-audits/audit-{entity}.md` (relevant entity)
4. `05-locks/master-lock-sheet.md`

---
## Important Documents
| Document | Purpose |
|----------|---------|
| `01-constitution/PACK-00_master-foundation.md` | Core principles, purpose, glossary |
| `01-constitution/PACK-10_permanent-locks.md` | Lock protocol |
| `01-constitution/PACK-02_folder-file-ownership.md` | File placement rules |
| `02-architecture/architecture-service-registry.md` | Service ownership |
| `05-locks/master-lock-sheet.md` | Lock inventory |

---
## Last Verified Date
2026-06-29
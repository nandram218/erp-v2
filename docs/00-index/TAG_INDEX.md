# TAG INDEX
> **ERP-v2 Knowledge Base v1.1 (Permanent)**
> Standardized tag reference — search करने के लिए use करें

---

## Tag Categories

### Modules 🏗️
| Tag | Meaning | Documents |
|-----|---------|-----------|
| `[students]` | Student Management Module | `06-modules/module-students.md`, `03-audits/audit-student-module.md` |
| `[fees]` | Fee Engine / Collection | `06-modules/module-fees.md`, `03-audits/audit-fee-engine.md` |
| `[transport]` | Transport Module | `06-modules/module-transport.md` |
| `[hostel]` | Hostel Module | `06-modules/module-hostel.md` |
| `[attendance]` | Attendance Module | `06-modules/module-attendance.md` |

### Architecture 🏛️
| Tag | Meaning | Documents |
|-----|---------|-----------|
| `[saas-multi-tenant]` | Multi-tenancy, isolation | `01-constitution/PACK-03_saas-multi-tenant.md`, `02-architecture/architecture-tenant-isolation.md`, `03-audits/audit-saas-isolation.md` |
| `[service-registry]` | Service layer ownership | `01-constitution/PACK-05_backend-database.md`, `02-architecture/architecture-service-registry.md` |
| `[storage-authority]` | Who owns what data | `01-constitution/PACK-02_folder-file-ownership.md`, `02-architecture/architecture-storage-flow.md` |
| `[module-boundaries]` | Module separation rules | `01-constitution/PACK-06_module-rules.md`, `03-audits/audit-module-boundaries.md` |

### Locks 🔒
| Tag | Meaning | Documents |
|-----|---------|-----------|
| `[locked]` | Permanent lock — cannot be changed | `05-locks/master-lock-sheet.md` |
| `[frozen]` | Phase-locked until review | All `05-locks/*.md` |

### Workflow 🔧
| Tag | Meaning | Documents |
|-----|---------|-----------|
| `[development-workflow]` | How to write code | `01-constitution/PACK-07_development-workflow.md` |
| `[refactor]` | Controlled refactor rules | `01-constitution/PACK-09_controlled-refactor.md` |
| `[roadmap]` | Phases & timelines | `01-constitution/PACK-08_master-roadmap.md` |

---

## Cross-Reference Index

### By Concern
- **"Mujhe module banana hai"** → `01-constitution/PACK-06_module-rules.md`
- **"Mujhe file kaha likhni hai"** → `01-constitution/PACK-02_folder-file-ownership.md`
- **"Mujhe database design chahiye"** → `01-constitution/PACK-05_backend-database.md`
- **"Mujhe UI/UX rules chahiye"** → `01-constitution/PACK-04_ui-ux-standards.md`
- **"Mujhe test karna hai"** → `01-constitution/PACK-07_development-workflow.md`

### By Phase
- **PHASE-4** (current) → `architecture/PHASE-4.4-SAAS-AUTHORITY-FREEZE.md`
- **Pre-PHASE-4** → `01-constitution/`, `05-locks/`
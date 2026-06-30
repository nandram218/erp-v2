# KNOWLEDGE GRAPH
> **ERP-v2 Knowledge Base v1.0 (Permanent)**
> कौन किससे जुड़ा है — relationship map

---

## Dependency Map

```
01-constitution/
│   └── PACK-00 (Foundation)
│       ├──→ PACK-01 (Business Rules)          [depends: PACK-00]
│       ├──→ PACK-02 (Folder Ownership)        [depends: PACK-00]
│       ├──→ PACK-03 (SaaS Multi-Tenant)       [depends: PACK-00]
│       ├──→ PACK-04 (UI/UX Standards)         [depends: PACK-00]
│       ├──→ PACK-05 (Backend/Database)        [depends: PACK-00, PACK-02]
│       ├──→ PACK-06 (Module Rules)            [depends: PACK-00, PACK-01, PACK-05]
│       ├──→ PACK-07 (Dev Workflow)            [depends: PACK-02, PACK-06]
│       ├──→ PACK-08 (Roadmap)                 [depends: PACK-00, PACK-06]
│       ├──→ PACK-09 (Controlled Refactor)     [depends: PACK-07, PACK-08]
│       └──→ PACK-10 (Permanent Locks)         [depends: ALL ABOVE]

02-architecture/
│   ├── architecture-{entity}.md   → ALL depend on PACK-03, PACK-06
│   └── architecture-tenant-isolation.md → depends on PACK-04

03-audits/
│   └── audit-{entity}.md           → depends on 01-constitution + 02-architecture

04-decisions/
│   └── ADR-NNNN-*.md               → depends on 02-architecture

05-locks/
│   └── *-locks.md                  → depends on PACK-10 (FINAL, frozen)

06-modules/
│   └── module-{name}.md            → depends on PACK-07, 02-architecture
```

---

## Entity → Doc Mapping

### src/ vs docs/ Mapping

| Code Entity | Documentation |
|-------------|---------------|
| `src/modules/fees/` | `06-modules/module-fees.md` + `03-audits/audit-fee-engine.md` |
| `src/modules/students/` | `06-modules/module-students.md` + `03-audits/audit-student-module.md` |
| `src/modules/transport/` | `06-modules/module-transport.md` |
| `src/modules/hostel/` | `06-modules/module-hostel.md` |
| `src/modules/attendance/` | `06-modules/module-attendance.md` |
| `src/master-setting/fees/` | Owned by `src/modules/fees/feesService.js` |
| `src/master-setting/transport/` | Owned by `src/modules/transport/services/transportService.js` |
| `src/master-setting/hostel/` | Owned by `src/modules/hostel/` |
| `src/services/` | `02-architecture/architecture-service-registry.md` |
| `src/store/` | `02-architecture/architecture-store-runtime.md` |
| `src/core/` | `02-architecture/architecture-data-flow.md` |

---

## Ownership Graph

```
Module Owner [Module Folder]
    ├── Can modify: MODULE_FOLDER + owned files in master-setting/
    ├── Cannot modify: OTHER_MODULE_FOLDER + shared services
    └── Must coordinate: src/services/, src/store/

Service Owner [Service Registry]
    ├── Can modify: Own service file
    └── Cannot modify: Any module folder

Storage Owner [Storage Authority]
    └── Controls: Data access patterns per entity type
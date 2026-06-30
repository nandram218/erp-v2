# architecture-folder-map
> **ERP-v2 Knowledge Base v1.0 (Permanent)**
> Project folder tree with purpose for each directory

---

## src/ Tree

```
src/
├── modules/               # Business modules (feature code)
│   ├── students/          # Student management
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── services/
│   ├── fees/              # Fees engine & collection
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── services/
│   ├── transport/         # Transport module
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   ├── hostel/            # Hostel module
│   └── attendance/        # Attendance module
│
├── master-setting/        # Configuration/masters (owned by parent module)
│   ├── fees/
│   ├── transport/
│   ├── hostel/
│   └── classes-subjects/
│
├── services/              # Service Registry — shared logic
│   ├── storageService.js  # IO layer
│   ├── authService.js     # Authentication
│   ├── tenantContextService.js  # SaaS tenant
│   ├── studentService.js  # Student CRUD
│   ├── feeSettingsService.js   # Fee config
│   ├── transportService.js     # Transport config
│   ├── hostelService.js        # Hostel config
│   ├── snapshotService.js      # Year-end snapshots
│   ├── runtimeValidationService.js
│   └── contextService.js
│
├── store/                 # Zustand global state
│   └── schoolStore.js
│
├── core/                  # Core utilities
│   └── fee-engine/
│       └── feeNormalizer.js
│
├── layouts/               # Shared layout components
│   └── DashboardLayout.jsx
│
├── config/                # App configuration
│   └── appConfig.js
│
├── App.js                 # Root component
└── index.js               # Entry point
```

---

## docs/ Tree

```
docs/
├── 00-index/              # Navigation hub
├── 01-constitution/       # PACK-00..11 foundational rules
├── 02-architecture/       # Technical design documents
├── 03-audits/             # Compliance & audit reports
├── 04-decisions/          # ADRs
├── 05-locks/              # Lock sheets
├── 06-modules/            # Module-specific documentation
└── 99-archive/            # Historical/obsolete docs
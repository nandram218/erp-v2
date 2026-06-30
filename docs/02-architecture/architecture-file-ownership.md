# architecture-file-ownership
> Who owns what in the codebase

---

## Module Owner Matrix

| Module Folder | Owner | master-setting Owner |
|---------------|-------|---------------------|
| `src/modules/students/` | Student Module | Owns `src/master-setting/classes-subjects/` |
| `src/modules/fees/` | Fees Module | Owns `src/master-setting/fees/` |
| `src/modules/transport/` | Transport Module | Owns `src/master-setting/transport/` |
| `src/modules/hostel/` | Hostel Module | Owns `src/master-setting/hostel/` |
| `src/modules/attendance/` | Attendance Module | Owns own master-setting (if created) |

## Shared Owners

| Folder/File | Owner | Notes |
|-------------|-------|-------|
| `src/services/` | Service Registry | Each file has owner in PACK-02 |
| `src/store/` | State Owner | Zustand slices |
| `src/core/` | Core Owner | fee-engine, etc. |
| `src/layouts/` | UI Owner | DashboardLayout |
| `src/config/` | Config Owner | appConfig |

## Ownership Verification

```bash
# Find all module owners
grep -r "Module Owner" docs/01-constitution/
grep -r "ownership" docs/02-architecture/
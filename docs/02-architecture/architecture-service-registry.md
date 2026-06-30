# architecture-service-registry
> Service layer ownership and responsibilities (single source of truth)

---

## Service Registry

### Data Services
- `studentService.js` — Student CRUD, search, import
- `feeSettingsService.js` — Fee heads, tax, concession rules
- `transportService.js` — Routes, vehicles, stops
- `hostelService.js` — Rooms, allocations
- `classSubjectService.js` — Classes, subjects, teacher mapping

### Infrastructure Services
- `storageService.js` — IO layer (localStorage/API). ALL data access must route through this.
- `authService.js` — Login, logout, token management
- `tenantContextService.js` — Resolve and inject current schoolId
- `snapshotService.js` — Year-end archive & restore
- `runtimeValidationService.js` — Enforce tenant & module rules at runtime
- `contextService.js` — App-level context (language, theme, etc.)

### Invariants
- No module may call another module's services directly
- Services are singletons
- Service methods must accept explicit `schoolId` where tenant isolation matters
- Service must emit audit events for all writes
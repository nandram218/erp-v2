# architecture-dependency-graph
> Module and file dependency graph

---

## Layer Dependencies

```
UI Layer (components/pages)
  ↓ imports only
Service Layer (services/)
  ↓ imports only
Storage Layer (storageService.js)
  ↓ uses
localStorage / API
```

## Module Cross-Dependencies

```
students ──┐
           ├→ storageService.js (only)
fees ──────┤
           ├→ tenantContextService.js (read-only)
transport ─┤
           ├→ snapshotService.js (year-end)
hostel ────┘
```

## Prohibited Edges

- Module → Another Module
- Service ← Module internal
- Component → storageService (must route via service)
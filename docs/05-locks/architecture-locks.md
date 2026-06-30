# architecture-locks
> Layer and dependency locks (see also PACK-06 and architecture-dependency-graph.md)

## Locked
- UI → Service → Storage layer order
- Modules cannot import other modules
- Component cannot talk to storageService directly
- Service layer is singleton per domain
- Store slices are module-prefixed

## Enforceable rules
- CI check: no cross-module imports
- Runtime: every storage call requires schoolId
- Build: tree-shake modules independently
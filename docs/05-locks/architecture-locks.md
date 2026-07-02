# architecture-locks
> Layer and dependency locks (see also PACK-06 and architecture-dependency-graph.md)

**PRIMARY SOURCE:** [FOUNDATION-BASELINE.md](../FOUNDATION-BASELINE.md)
**Status:** Redirected to baseline

All architecture contracts are now classified and documented in FOUNDATION-BASELINE.md.

**Quick Reference:**
- Layer dependencies: Section 10 (PERMANENT)
- Module boundaries: Section 18.2 (PERMANENT)
- Service registry: Section 7.1 (PERMANENT)
- Folder structure: Section 10 (PERMANENT)

---

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

# storage-locks
> Data format locks (see also PACK-05 and PACK-11)

**PRIMARY SOURCE:** [FOUNDATION-BASELINE.md](../FOUNDATION-BASELINE.md)
**Status:** Redirected to baseline

All storage contracts are now classified and documented in FOUNDATION-BASELINE.md.

**Quick Reference:**
- Storage key format: Section 3.1 (PERMANENT)
- Storage keys registry: Section 3.2 (PERMANENT)
- Storage access pattern: Section 3.3 (PERMANENT)
- Entity shape: Section 5 (various classifications)
- Tenant isolation: Section 4 (PERMANENT)
- Migration patterns: Section 14 (PERMANENT)

---

## Locked
- Key pattern: `{schoolId}__{module}__{entity}`
- Entity shape: `schoolId`, `id`, `createdAt`, `updatedAt`, `createdBy`, `isActive`
- Writes must go through `storageService.js`
- Reads must be auto-filtered by schoolId

## Forbidden
- Direct `localStorage` usage from modules
- Cross-tenant reads
- Hard-delete (must set isActive = false)

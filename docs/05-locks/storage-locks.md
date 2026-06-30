# storage-locks
> Data format locks (see also PACK-05 and PACK-11)

## Locked
- Key pattern: `{schoolId}__{module}__{entity}`
- Entity shape: `schoolId`, `id`, `createdAt`, `updatedAt`, `createdBy`, `isActive`
- Writes must go through `storageService.js`
- Reads must be auto-filtered by schoolId

## Forbidden
- Direct `localStorage` usage from modules
- Cross-tenant reads
- Hard-delete (must set isActive = false)
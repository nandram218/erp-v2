# architecture-tenant-isolation
> Multi-tenant isolation enforcement at the architecture level (see also PACK-03)

- Every read and write is scoped to `schoolId`.
- Isolation is enforced in `storageService.js` and `tenantContextService.js`.
- Cross-tenant reads are blocked before any query runs.
- Tenant data is keyed as `{schoolId}__...` and never shared across tenants.
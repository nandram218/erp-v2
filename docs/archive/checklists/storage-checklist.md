# Storage Checklist
## Mandatory steps for ANY storage operation

### Key Definition
- [ ] Key defined in `docs/contracts/storage.contract.json`
- [ ] Key follows `ERP_` or `SCHOOL_` prefix
- [ ] Key is UPPER_SNAKE_CASE
- [ ] Key length ≤ 50 characters
- [ ] Key doesn't start with a number
- [ ] Key validated via `validateStorageKey()`

### Key Usage
- [ ] Constant from `src/core/constants/storageKeys.js` used
- [ ] No hardcoded string keys
- [ ] No inline localStorage calls
- [ ] Uses `storageService.js` methods only
- [ ] Tenant prefix applied (if tenant-aware)

### Tenant Isolation
- [ ] Tenant context obtained via `getTenantContext()`
- [ ] Tenant prefix applied to key via `getTenantStorageKey()`
- [ ] Uses `getTenantStorage()` / `setTenantStorage()`
- [ ] No cross-tenant data leakage possible
- [ ] Tenant validation via `assertTenantIsolation()`

### Data Operations
- [ ] Read: `getStorage()` or `getTenantStorage()`
- [ ] Write: `setStorage()` or `setTenantStorage()`
- [ ] Delete: `removeStorage()` or `removeTenantStorage()`
- [ ] Fallback values provided
- [ ] Error handling in place

### Migration
- [ ] Legacy migration via `migrateLegacyStorage()`
- [ ] Tenant migration via `migrateToTenantStorage()`
- [ ] Migration idempotent (safe to run multiple times)
- [ ] Migration path documented

### Guards
- [ ] `assertStorageAccess()` called
- [ ] `assertNoDirectLocalStorage()` not triggered
- [ ] Guard violations logged and reported

---

**Sign-off**: Storage operation complete only when ALL checkboxes checked.
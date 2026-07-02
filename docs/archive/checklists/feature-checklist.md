# Feature Checklist
## Mandatory steps for adding ANY new feature

### Pre-Development
- [ ] Read `START-HERE.md`
- [ ] Read relevant contract files from `docs/contracts/`
- [ ] Check if existing contract covers the feature
- [ ] If no contract exists, create new contract file first
- [ ] Verify feature doesn't violate frozen contracts

### Storage
- [ ] All storage keys defined in `docs/contracts/storage.contract.json`
- [ ] Keys use constants from `src/core/constants/storageKeys.js`
- [ ] Keys follow `ERP_` prefix convention
- [ ] Keys are UPPER_SNAKE_CASE
- [ ] No hardcoded string keys in code
- [ ] Tenant prefix applied to all keys
- [ ] Validated via `validateStorageKey()`

### Services
- [ ] Service registered in `src/core/serviceRegistry.js`
- [ ] Service is tenant-aware
- [ ] Service accessed via `ServiceRegistry.getService()`
- [ ] No direct service instantiation
- [ ] Service validated via `validateServiceRegistration()`

### Data Validation
- [ ] Input validated via `validate*()` functions
- [ ] Tenant context validated via `validateTenantContext()`
- [ ] Identifiers validated via `validateIdentifier()`
- [ ] Entity shape validated via `validateEntityShape()`
- [ ] Business rules enforced before persistence

### Architecture Guards
- [ ] Storage access via `assertStorageAccess()`
- [ ] Tenant isolation via `assertTenantIsolation()`
- [ ] Registry usage via `assertRegistryUsage()`
- [ ] No direct localStorage via `assertNoDirectLocalStorage()`
- [ ] Module boundaries via `assertModuleBoundary()`
- [ ] Identifier integrity via `assertIdentifierIntegrity()`

### Testing
- [ ] Unit tests for validators
- [ ] Unit tests for guards
- [ ] Integration tests for service
- [ ] Tenant isolation tests
- [ ] Multi-tenant data separation verified

### Documentation
- [ ] Contract file created/updated in `docs/contracts/`
- [ ] Related files listed in contract
- [ ] Dependencies documented
- [ ] Breaking changes documented (if any)
- [ ] Migration path documented (if needed)

### Code Review
- [ ] No hardcoded constants
- [ ] No duplicate magic strings
- [ ] No direct localStorage access
- [ ] No service bypass
- [ ] No tenant context leakage
- [ ] All guards in place
- [ ] All validations in place

---

**Sign-off**: Feature complete only when ALL checkboxes checked.
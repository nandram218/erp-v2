# Migration Checklist
## Mandatory steps for ANY contract or data migration

### Pre-Migration
- [ ] Backup existing data before any migration
- [ ] Document current state via snapshot
- [ ] Verify rollback plan exists
- [ ] Test migration on sample data first
- [ ] Verify no active users during migration
- [ ] Lock writes during migration (if production)

### Contract Changes
- [ ] Update contract file in `docs/contracts/`
- [ ] Increment version in contract
- [ ] Document breaking changes
- [ ] Document allowed changes
- [ ] Update `relatedFiles` in contract
- [ ] Update `dependencies` in contract if needed

### Storage Migration
- [ ] Add migration script in `src/SERVICES/storageService.js`
- [ ] Use `migrateLegacyStorage()` for key migrations
- [ ] Use `migrateToTenantStorage()` for tenant migrations
- [ ] Make migration idempotent (safe to run multiple times)
- [ ] Handle missing/corrupted data gracefully
- [ ] Log migration results
- [ ] Verify data integrity after migration
- [ ] Validate no data loss occurred

### Validation
- [ ] Update `src/core/contracts/validators.js` if needed
- [ ] Update `src/core/contracts/guards.js` if needed
- [ ] Add new validation rules for new fields
- [ ] Test validators pass for new format
- [ ] Test validators fail for old format (if breaking)

### Testing
- [ ] Unit tests for migration script
- [ ] Integration test: old format → new format
- [ ] Verify no data loss
- [ ] Verify data integrity
- [ ] Rollback test successful
- [ ] Multi-tenant migration test passed

### Deployment
- [ ] Deploy code with migration support
- [ ] Run migration on staging first
- [ ] Verify staging data integrity
- [ ] Schedule production migration (low traffic)
- [ ] Run migration in production
- [ ] Monitor migration logs
- [ ] Verify production data integrity
- [ ] Clean up old format (if specified in contract)

### Documentation
- [ ] Migration steps documented in contract
- [ ] Breaking changes documented in CHANGELOG
- [ ] Rollback procedure documented
- [ ] Team notified of migration

---

**Sign-off**: Migration complete only when ALL checkboxes checked.
# Backend Migration Checklist
## Mandatory steps for migrating backend services or APIs

### Pre-Migration
- [ ] Current API documented
- [ ] All consumers identified
- [ ] Backward compatibility planned
- [ ] Feature flags configured
- [ ] Rollback strategy defined

### Service Changes
- [ ] New service registered in ServiceRegistry
- [ ] Old service marked deprecated via `markServiceDeprecated()`
- [ ] Both services running in parallel
- [ ] Migration period defined (minimum 2 releases)
- [ ] Monitoring in place for both services

### API Changes
- [ ] New API endpoints created
- [ ] Old API endpoints maintained
- [ ] Deprecation warnings added to old APIs
- [ ] Response format validated for both
- [ ] Error handling consistent

### Data Migration
- [ ] Data schema documented
- [ ] Migration script written
- [ ] Data validation for new schema
- [ ] Rollback script ready
- [ ] Zero data loss verified

### Testing
- [ ] Old API still functional
- [ ] New API functional
- [ ] Migration produces correct results
- [ ] Rollback tested
- [ ] Load testing completed
- [ ] Multi-tenant testing passed

### Deployment
- [ ] Both services deployed
- [ ] Traffic split configured (if using gradual rollout)
- [ ] Monitoring active
- [ ] Rollback plan ready
- [ ] Team on standby

### Post-Migration
- [ ] Monitor error rates
- [ ] Monitor performance
- [ ] Verify data consistency
- [ ] Collect feedback
- [ ] Remove old service after deprecation period

---

**Sign-off**: Backend migration complete only when ALL checkboxes checked.
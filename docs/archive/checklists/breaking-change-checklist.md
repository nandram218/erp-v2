# Breaking Change Checklist
## Mandatory steps BEFORE implementing ANY breaking change

### Authorization
- [ ] Breaking change approved by architecture team
- [ ] Impact analysis completed
- [ ] All stakeholders notified
- [ ] Rollback plan documented
- [ ] Migration window scheduled

### Contract Updates
- [ ] Breaking changes listed in contract file under `breakingChanges`
- [ ] Version bumped in affected contracts
- [ ] `allowedChanges` updated if needed
- [ ] Deprecation notices added to old APIs
- [ ] Replacement APIs documented

### Migration Path
- [ ] Forward migration script written
- [ ] Backward compatibility maintained (if possible)
- [ ] Dual-write period planned (if applicable)
- [ ] Feature flags configured (if applicable)
- [ ] Rollback script written

### Code Changes
- [ ] Deprecated APIs marked with `@deprecated` JSDoc
- [ ] Warnings added to deprecated APIs
- [ ] New APIs implemented
- [ ] Old APIs still functional (during transition)
- [ ] All imports updated to use new APIs
- [ ] Tests updated for new behavior

### Storage Changes
- [ ] Key migration path defined
- [ ] Dual-write enabled temporarily
- [ ] Data validation for both formats
- [ ] Cleanup script for old format
- [ ] Storage key contracts updated

### Identifier Changes
- [ ] Identifier format migration planned
- [ ] Sequence preservation verified
- [ ] No identifier reuse
- [ ] Backward compatibility for lookups
- [ ] Audit trail maintained

### Testing
- [ ] Old format still works (during transition)
- [ ] New format works correctly
- [ ] Migration produces correct results
- [ ] Rollback tested
- [ ] Multi-tenant migration tested
- [ ] Edge cases covered

### Deployment
- [ ] Deploy with both old and new code
- [ ] Run migration on staging
- [ ] Monitor for errors
- [ ] Deploy to production
- [ ] Monitor production metrics
- [ ] Keep old code for deprecation period
- [ ] Remove old code AFTER deprecation period

### Documentation
- [ ] Breaking changes documented in CHANGELOG
- [ ] Migration guide written
- [ ] API changes documented
- [ ] Examples updated
- [ ] Team trained on new patterns

---

**WARNING**: Breaking changes require TWO deployments minimum:
1. First: Deploy with both old + new
2. Second (after deprecation period): Remove old

**Sign-off**: Breaking change approved only when ALL checkboxes checked AND two-person sign-off obtained.
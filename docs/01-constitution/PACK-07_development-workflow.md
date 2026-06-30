# PACK-07: Development Workflow
> **ERP-v2 Knowledge Base v1.0 (Permanent)**
> गलती कैसे avoid करो — step-by-step process

---

## 1. Before Writing Any Code

1. **Read** relevant PACK docs (especially PACK-02, PACK-03, PACK-06)
2. **Check** TAG_INDEX for related docs
3. **Confirm** your module's ownership in PACK-02
4. **Verify** no one else is modifying the same file (git status)

## 2. File Creation Rules

| Scenario | Action |
|----------|--------|
| New component in module | `src/modules/{module}/components/` |
| New service | `src/services/{name}Service.js` → register in PACK-02 |
| New page | `src/modules/{module}/pages/` |
| New module | Follow PACK-06 new module checklist |

## 3. Code Review Checklist

- [ ] schoolId is included in all queries
- [ ] No cross-module imports
- [ ] No direct localStorage access (use storageService)
- [ ] All user input is validated
- [ ] Error handling is complete
- [ ] Hindi labels are present (for user-facing text)
- [ ] Audit trail is written for all writes

## 4. Testing Requirements

| Test Type | Scope |
|-----------|-------|
| Unit | Pure functions, utilities |
| Integration | Service calls with storageService mock |
| E2E | User flow per module |

## 5. Commit Convention

```
type(scope): description

Types:
- feat: new feature
- fix: bug fix
- refactor: code change (no behavior change)
- docs: documentation only
- audit: audit/compliance change
- lock: lock file change (needs ADR)

Examples:
feat(fees): add concession approval workflow
fix(students): resolve duplicate check edge case
refactor(transport): extract route validation
```

## 6. Forbidden Shortcuts

| Shortcut | Why Forbidden | Correct Way |
|----------|--------------|-------------|
| `localStorage.setItem()` | Bypasses tenant prefix | `storageService.set(key, value, { schoolId })` |
| `import { x } from '../../otherModule'` | Cross-module coupling | Use service registry |
| Hardcoded `schoolId` in dev | Risk of commit | Use tenantContextService.get() |
| Skipping tests | Phase-4 freeze | All changes must be tested |
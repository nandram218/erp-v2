# PACK-09: Controlled Refactor
> **ERP-v2 Knowledge Base v1.0 (Permanent)**
> Refactoring rules — code quality without breaking production

---

## 1. When to Refactor

| Condition | Action |
|-----------|--------|
| Bug in existing code | Fix directly, no refactor unless necessary |
| Adding new feature in same file | Small refactor if touching area |
| Module boundary violation detected | Full refactor via ADR |
| Technical debt > 2 weeks | Schedule refactor sprint |

## 2. Refactor Process

```
1. Create ADR in 04-decisions/
2. Describe: current state → proposed state → risk assessment
3. Get approval (1 reviewer minimum)
4. Implement in feature branch
5. Full regression test
6. Merge via PR
```

## 3. What Cannot Change Without ADR

| Item | Lock Level |
|------|-----------|
| Storage key format | 🔒 Permanent (see 05-locks/) |
| schoolId field name | 🔒 Permanent |
| Module boundaries | 🔒 Phase-locked |
| Service registry locations | 🔒 Phase-locked |
| Data shape (core fields) | 🔒 Permanent |

## 4. Safe Refactor Zones

| Zone | Rules |
|------|-------|
| Internal function names | ✅ Refactor freely |
| Component JSX structure | ✅ Refactor freely |
| CSS class names | ✅ Refactor freely |
| Utility function logic | ✅ Refactor freely |

## 5. Risk Levels

| Level | Examples | Approval |
|-------|----------|----------|
| Low | Rename function, extract constant | Self |
| Medium | Change component props, move file | 1 reviewer |
| High | Change data shape, cross-module | ADR + 2 reviewers + QA |
| Critical | Storage format, auth flow | ADR + Lead approval |
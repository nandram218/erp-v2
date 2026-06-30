# PACK-10: Permanent Locks
> **ERP-v2 Knowledge Base v1.0 (Permanent)**
> ABSOLUTELY UNCHANGEABLE — these rules have zero exceptions

---

## 1. Lock Types

| Lock | Meaning | Unlock Process |
|------|---------|----------------|
| 🔒 PERMANENT | Never changeable | ADR + Lead + CEO approval + data migration |
| 🔒 PHASE-LOCKED | Cannot change during current phase | Unlock via phase gate review |
| 🔒 Frozen | Temporarily locked | Unlock after specific date/condition |

## 2. Permanent Locks

### Storage
| Item | Locked Value |
|------|-------------|
| Storage key prefix format | `{schoolId}__{module}__{entity}` |
| schoolId field name | `schoolId` |
| Primary key field | `id` |
| Soft delete field | `isActive` |

### Auth
| Item | Locked Value |
|------|-------------|
| Token header | `Authorization: Bearer {token}` |
| Context key | `tenantContext` |
| Role system | `admin`, `accountant`, `teacher`, `warden`, `driver`, `parent` |

### Data
| Item | Locked Value |
|------|-------------|
| Date format | ISO 8601 |
| Currency | INR (₹) |
| Academic year format | `{startYear}-{endYear}` |

### Module
| Item | Locked Value |
|------|-------------|
| Module folder location | `src/modules/{name}/` |
| Master-setting rule | Module owns its master-setting folder |
| Service access | All shared logic via `src/services/` |

## 3. Phase Locks (PHASE-4)

| Item | Locked Until |
|------|--------------|
| Service registry | End of PHASE-4 |
| Module boundaries | End of PHASE-4 |
| Authority matrix | End of PHASE-4 |

## 4. How to Request Unlock

1. Create ADR in `04-decisions/ADR-XXXX-unlock-{item}.md`
2. Document: Why change is needed, migration plan, rollback plan
3. Get Lead approval
4. For permanent locks: Get CEO approval
5. Execute migration during maintenance window
6. Update all dependent documentation
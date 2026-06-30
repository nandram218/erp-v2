# PACK-03: SaaS Multi-Tenant
> **ERP-v2 Knowledge Base v1.0 (Permanent)**
> Multi-tenancy rules — every line of code must respect this

---

## 1. Tenant Model

```
School (tenant)
├── schoolId (UUID, primary key)
├── schoolName
├── subscriptionPlan (FREE / PRO / ENTERPRISE)
├── isActive
├── createdAt
└── settings (JSON blob)
```

## 2. Data Isolation Rules

| Rule | Implementation |
|------|----------------|
| All tables must have `schoolId` | Database schema enforce |
| Every query auto-filters `schoolId` | Middleware/Interceptor |
| API responses never include cross-tenant data | Service layer |
| Storage keys are tenant-prefixed | `{schoolId}__{entity}` |

## 3. Tenant Resolution Flow

```
Request
  → authService.verifyToken()
  → { schoolId, userId, role }
  → tenantContextService.setContext(schoolId)
  → Every subsequent query uses this context
```

## 4. Storage Key Convention

```
localStorage format:   {schoolId}__{module}__{entity}
Example:               "abc123__fees__receipts"

CRITICAL: Never concatenate without schoolId prefix.
```

## 5. Subscription Plans

| Plan | Max Students | Max Staff | Features |
|------|--------------|-----------|----------|
| FREE | 100 | 10 | Basic |
| PRO | 1000 | 50 | +Transport, Hostel |
| ENTERPRISE | Unlimited | Unlimited | +Custom reports |

## 6. Tenant Lifecycle

| Event | Action |
|-------|--------|
| School signs up | Create tenant record, initialize defaults |
| School upgrades | Enable features immediately |
| School downgrades | Disable features at period end |
| School deletes | 90-day soft delete, then hard purge |

## 7. Cross-Tenant Forbidden Patterns

```javascript
// ❌ FORBIDDEN
const allStudents = db.students.find({});

// ✅ CORRECT
const schoolId = getCurrentSchoolId();
const students = db.students.find({ schoolId });

// ❌ FORBIDDEN
const otherSchoolData = await api.get(`/schools/${otherId}/data`);

// ✅ CORRECT
if (requestSchoolId !== mySchoolId) throw Forbidden();
```

## 8. Feature Flags per Plan

Features must be gated by `subscriptionPlan`:

- `canUseTransport` — PRO+
- `canUseHostel` — PRO+
- `canUseAttendance` — ALL
- `canUseCustomReports` — ENTERPRISE
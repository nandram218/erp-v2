# master-lock-sheet
> **ERP-v2 Knowledge Base v1.0 (Permanent)**
> Complete inventory of locked items

---

## Permanent Locks

| # | Locked Item | Value | Unlock Requires |
|---|-------------|-------|-----------------|
| L-01 | Storage key format | `{schoolId}__{module}__{entity}` | ADR + CEO + migration |
| L-02 | Tenant ID field | `schoolId` | ADR + CEO |
| L-03 | Primary key | `id` | ADR + CEO |
| L-04 | Soft delete | `isActive` | ADR + CEO |
| L-05 | Auth header | `Authorization: Bearer {token}` | ADR + CEO |
| L-06 | Context key | `tenantContext` | ADR + CEO |
| L-07 | Currency | INR (₹) | ADR + CEO |
| L-08 | Date format | ISO 8601 | ADR + Lead |
| L-09 | Lock protocol | See PACK-10 | N/A (self-referential) |

## Phase Locks (PHASE-4)

| # | Locked Item | Locked Until | Owner |
|---|-------------|--------------|-------|
| PL-01 | Service registry | End of PHASE-4 | Lead |
| PL-02 | Module boundaries | End of PHASE-4 | Lead |
| PL-03 | Authority matrix | End of PHASE-4 | Lead |
| PL-04 | Audit requirements | End of PHASE-4 | Lead
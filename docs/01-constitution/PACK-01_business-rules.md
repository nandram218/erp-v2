# PACK-01: Business Rules
> **ERP-v2 Knowledge Base v1.0 (Permanent)**
> Core business invariants — these MUST NOT be violated

---

## 1. Tenant Isolation Rules

| Rule | Description |
|------|-------------|
| T-01 | Every data entity must have `schoolId` field |
| T-02 | Every query MUST filter by `schoolId` of current user |
| T-03 | Cross-tenant read/write is FORBIDDEN |
| T-04 | `schoolId` must come from auth context, never from user input |

## 2. Fee Rules

| Rule | Description |
|------|-------------|
| F-01 | Fee amount can NEVER be negative |
| F-02 | Receipt once generated CANNOT be deleted (only refunded) |
| F-03 | Refund must have approval workflow |
| F-04 | Fee normalizer runs BEFORE any storage write |
| F-05 | Concession approval requires supervisor role |

## 3. Student Rules

| Rule | Description |
|------|-------------|
| S-01 | Student ID format: `{schoolId}-{AY}-{SEQ}` |
| S-02 | Duplicate `(schoolId, firstName, lastName, dob)` is FORBIDDEN |
| S-03 | Student record CANNOT be hard-deleted, only marked inactive |
| S-04 | Transfer certificate destroys all fee & attendance history |

## 4. Transport Rules

| Rule | Description |
|------|-------------|
| TR-01 | Vehicle capacity > assigned students always |
| TR-02 | Stop cannot exist without route |
| TR-03 | Student can have MAX 1 transport subscription per term |

## 5. Audit Trail

| Rule | Description |
|------|-------------|
| A-01 | Every write operation MUST create audit record |
| A-02 | Audit record is append-only — no UPDATE/DELETE |
| A-03 | Audit includes: who, what, when, oldValue, newValue |

## 6. Special Cases

| Rule | Description |
|------|-------------|
| SC-01 | Bulk operations must be atomic (all or nothing) |
| SC-02 | Import operations must validate ALL rows before writing ANY |
| SC-03 | Year-end process: create snapshot, then lock prior year |
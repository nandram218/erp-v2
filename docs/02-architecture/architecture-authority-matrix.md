# architecture-authority-matrix
> Who can modify what (runtime enforcement complement to PACK-02)

---

## Authority Model

- **Owner**: Module/service that owns the data or file
- **Reader**: Any module (read-only)
- **Writer**: Only the owner (and service layer)
- **Approver**: Lead + (permanent: CEO)

## Entity Authority

| Entity | Owner | Approval |
|--------|-------|---------|
| Student | students | Module owner |
| Receipt | fees | Module owner |
| Transport Route | transport | Module owner |
| Hostel Room | hostel | Module owner |
| Attendance | attendance | Module owner |
| School/Tenant | SaaS Core | Lead |
| Snapshot | Core (snapshotService) | Lead |

## Enforcement Points

1. Service layer rejects writes with mismatched `schoolId`
2. UI hides unauthorized operations via permissions
3. Code review checks PACK-02 ownership before merge
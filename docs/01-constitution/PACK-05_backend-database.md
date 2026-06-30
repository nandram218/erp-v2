# PACK-05: Backend & Database
> **ERP-v2 Knowledge Base v1.0 (Permanent)**
> Data layer rules

---

## 1. Database Approach

ERP-v2 uses **localStorage** as the source of truth (with future API sync).

```
Application
  → storageService.js (abstraction layer)
  → localStorage [current]
  → REST API [future, transparent swap]
```

## 2. Storage Key Convention

```
Format: {schoolId}__{module}__{entity}
Examples:
  - "SCH001__fees__receipts"
  - "SCH001__students__list"
  - "SCH001__transport__vehicles"
```

## 3. Data Shape Standards

All entities MUST have:

```javascript
{
  schoolId: string,      // tenant isolation
  id: string,            // UUID
  createdAt: ISO string,
  updatedAt: ISO string,
  createdBy: string,     // userId
  isActive: boolean      // soft delete flag
}
```

## 4. Schema Evolution

- New fields: default to `null`
- Deprecated fields: keep for 2 versions, then remove
- Breaking changes: migration function in `receiptMigrationService.js`

## 5. Storage Service Rules

`storageService.js` is the ONLY allowed data access layer:

- [ ] Never import localStorage directly in modules
- [ ] Always go through storageService
- [ ] All reads/writes must include schoolId
- [ ] Batch operations use transactions (optimistic locking)

## 6. Snapshot Pattern

Year-end process:
1. `snapshotService.createSnapshot(schoolId, academicYear)`
2. Archive all data for that year
3. Lock prior year (cannot modify)
4. Start fresh for new academic year
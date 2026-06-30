# architecture-storage-flow
> Data flow through the storage layer and key conventions

---

## Storage Key Convention

```
Format: {schoolId}__{module}__{entity}

Examples:
  students: {schoolId}__students__list
  fees:     {schoolId}__fees__receipts
  transport: {schoolId}__transport__vehicles
  hostel:   {schoolId}__hostel__rooms
```

## Data Flow

```
UI Component
  → Service method (explicit schoolId)
    → storageService.{get/set/remove}
      → key = `storageService.prefix(schoolId) + module + entity`
        → localStorage (current) / REST API (future)
```

## Entity Schema

All entities share:

```ts
interface BaseEntity {
  schoolId: string;
  id: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string; // userId
  isActive: boolean;
}
```

## Snapshot

- Year-end snapshots create an immutable archive
- Old years are read-only
# RULE-02: Storage & Data Persistence

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Data Architecture Team  
**Severity:** CRITICAL  
**Category:** Core  
**Applies To:** Storage layer, data models, Storage Layer schemas, cache, offline storage  
**Detection Method:** Storage Tests, Runtime Validation, Audit Log, Static Analysis  
**Auto-Fix Available:** Partial  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Storage Hierarchy](#storage-hierarchy)
5. [Ownership](#ownership)
6. [CRUD Rules](#crud-rules)
7. [Read Rules](#read-rules)
8. [Write Rules](#write-rules)
9. [Delete Rules](#delete-rules)
10. [Update Rules](#update-rules)
11. [Restore Rules](#restore-rules)
12. [Backup Rules](#backup-rules)
13. [Snapshot Rules](#snapshot-rules)
14. [Migration Rules](#migration-rules)
15. [Transaction Rules](#transaction-rules)
16. [Atomic Update Rules](#atomic-update-rules)
17. [Conflict Rules](#conflict-rules)
18. [Duplicate Rules](#duplicate-rules)
19. [Composite Key Rules](#composite-key-rules)
20. [Cache Rules](#cache-rules)
21. [Version Rules](#version-rules)
22. [IndexedDB Rules](#indexeddb-rules)
23. [LocalStorage Rules](#localstorage-rules)
24. [Future Storage Layer Rules](#future-Storage Layer-rules)
25. [Future API Rules](#future-api-rules)
26. [Offline Rules](#offline-rules)
27. [Validation Rules](#validation-rules)
28. [Storage Anti Patterns](#storage-anti-patterns)
29. [Storage Auto Fix](#storage-auto-fix)

---

## WHY

### Business Rationale
- **Data Integrity**: Zero data corruption is non-negotiable for ERP systems handling academic records, financial transactions, and legal compliance data.
- **Multi-Tenant Isolation**: Each school (tenant) must have complete data isolation - a data leak in a multi-tenant educational system is a catastrophic security failure.
- **Audit Compliance**: Schools are legally required to maintain data trails for years. Every create, update, delete operation must be auditable.
- **Disaster Recovery**: Loss of student records, financial data, or academic history is unacceptable.
- **Performance**: Large datasets (10k+ students, 100k+ transactions) must remain performant.

### Technical Rationale
- **Separation of Concerns**: Storage layer abstracts IndexedDB/localStorage/future Storage Layer.
- **Testability**: Abstractions enable testing with mock storage.
- **Consistency**: Uniform data access patterns reduce bugs.
- **Migration Path**: Clean abstraction enables future Storage Layer migration without touching business logic.
- **Offline-First**: Storage layer supports full offline capability with sync.

---

## WHEN

### Applies To
- **All Data Access**: Every read/write/delete operation through storageService.js
- **Storage Layer Schema Design**: New tables/collections
- **Migration Scripts**: Schema changes, data migrations
- **Cache Implementation**: In-memory and persistent caching
- **Offline Data**: IndexedDB/localStorage usage
- **Backup/Restore**: All backup and restore operations
- **Sync Operations**: Offline-to-online synchronization
- **Session Management**: Tenant context and Student/Parent sessions

### Does NOT Apply To
- Third-party storage integrations (use adapter pattern)
- Temporary in-memory state (component-level)
- Service layer caching (handled by RULE-03)

---

## WHERE

### Scope
- **Storage Service**: `src/services/storageService.js`
- **Tenant Context**: `src/services/tenantContextService.js`
- **Migration Scripts**: `src/infrastructure/migrations/`
- **Seed Data**: `src/infrastructure/seed-data/`
- **Snapshot Service**: `src/services/snapshotService.js`
- **Audit Service**: `src/services/auditService.js`
- **Cache Service**: `src/services/cacheService.js`

---

## Storage Hierarchy

### 3.1 Storage Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│              (Services, Components, Hooks)                   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   STORAGE SERVICE LAYER                      │
│            (storageService.js, cacheService.js)              │
│  - Tenant isolation                                         │
│  - Validation                                               │
│  - Auditing                                                 │
│  - Transaction management                                   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     CACHE LAYER                              │
│              (In-memory + localStorage)                      │
│  - Hot data caching                                         │
│  - Session state                                            │
│  - Offline queue                                            │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   PERSISTENCE LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   IndexedDB   │  │  localStorage│  │ Future API   │     │
│  │  (Primary)    │  │  (Fallback)  │  │  (v2.0+)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKUP LAYER                              │
│              (File system, Cloud storage)                    │
│  - Point-in-time snapshots                                  │
│  - Incremental backups                                      │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Storage Tiers Explained

| Tier | Technology | Use Case | Size Limit | Performance |
|------|-----------|----------|------------|-------------|
| Hot Cache | In-memory (Map) | Frequently accessed data (< 24h) | 50MB | O(1) |
| Warm Cache | localStorage | Session data, preferences | 5MB | O(1) |
| Cold Storage | IndexedDB | Primary persistence | 50MB+ | O(log n) |
| Archive | Future backend API | Historical records | Unlimited | Network |

**Rules**:
- Hot cache MUST NOT store PII unencrypted
- Warm cache MUST be tenant-scoped
- Cold storage MUST enforce tenant isolation
- Data migration between tiers MUST maintain audit trail

### 3.3 Storage Selection Matrix

| Data Type | Primary Storage | Cache | Backup | TTL |
|-----------|----------------|-------|--------|-----|
| Student Master | IndexedDB | Yes (24h) | Daily | 7 years |
| Fee Transactions | IndexedDB | Yes (1h) | Real-time | 10 years |
| Student/Parent Preferences | localStorage | N/A | N/A | Session |
| Audit Logs | IndexedDB | No | Weekly | 7 years |
| Settings | IndexedDB | Yes (7d) | Weekly | Indefinite |
| Temporary Sync Queue | IndexedDB | No | N/A | Clean on sync |

---

## Ownership

### 4.1 Storage Ownership

```
OWNERSHIP MODEL:

StorageService.js:
- Owner: platform-team:storage
- Responsibility: All storage abstractions, tenant isolation, transactions
- Can modify: platform-team:storage only
- Can review: All senior engineers

Data Schemas:
- Owner: respective module teams
- Responsibility: Data structure, validation, indexes
- Can modify: module owner + platform approval
- Can review: platform-team:data

Migrations:
- Owner: platform-team:data
- Responsibility: Schema changes, data migrations
- Can modify: platform-team:data only
- Can review: architecture board

Backup/Restore:
- Owner: platform-team:devops
- Responsibility: Infrastructure, schedules, retention
- Can modify: platform-team:devops only
```

### 4.2 Data Ownership Rules

1. **Module-Owned Data**: Module owns data created by its operations.
2. **Shared Data**: Owned by platform, access controlled by RBAC.
3. **Tenant Data**: Owned by tenant (school), platform is custodian only.
4. **Audit Data**: Owned by compliance, immutable once written.

```javascript
// Data ownership metadata
const dataOwnership = {
  collection: 'students',
  owner: 'module:students',
  tenantScoped: true,
  auditable: true,
  retentionPeriod: '7y',
  piiFields: ['name', 'email', 'phone', 'address']
};
```

### 4.3 Storage Access Control

```
Storage Access Matrix:

┌──────────────────┬────────────┬───────────┬───────────┬───────────┐
│      Entity      │   Create   │    Read   │   Update   │  Delete   │
├──────────────────┼────────────┼───────────┼───────────┼───────────┤
│ Module Service   │   YES      │    YES    │    YES     │   SOFT*   │
│ Core Engine      │   NO       │    YES    │    NO      │   NO      │
│ UI Component     │   NO       │    NO     │    NO      │   NO      │
│ Audit Service    │   NO       │    YES    │    NO      │   NO      │
│ Backup Service   │   NO       │    YES    │    NO      │   NO      │
│ Admin Console    │   YES**    │    YES**  │    YES**   │   YES**  │
└──────────────────┴────────────┴───────────┴───────────┴───────────┘

* Modules can soft-delete only
** Requires elevated RBAC permissions
```

---


## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

## CRUD Rules

### 5.1 Universal CRUD Principles

```
ALL CRUD operations MUST follow this pattern:

1. Tenant Isolation: Every operation includes tenantId
2. Validation: Schema validation before any operation
3. Audit Trail: Every operation logged with before/after state
4. Error Handling: Structured errors, never raw Storage Layer errors
5. Atomicity: Multi-step operations must be atomic transactions
6. Idempotency: Repeating same operation yields same result
7. Caching: Cache invalidation on writes
```

### 5.2 CRUD Enforcement Rules

| Operation | Authorization | Validation | Audit Log | Cache | Transaction |
|-----------|--------------|------------|-----------|-------|-------------|
| CREATE | Required | Mandatory | Always | Invalidate | Optional |
| READ | Required | Input only | Sensitive only | Hit | N/A |
| UPDATE | Required | Mandatory | Always | Invalidate | Required for multi-entity |
| DELETE | Elevated | Mandatory | Always | Invalidate | Required |

---

## Read Rules

### 6.1 Read Operation Requirements

**RULE ST-READ-01**: Every read operation MUST include tenantId for multi-tenant isolation.

```javascript
// CORRECT
const students = await storageService.find({
  collection: 'students',
  tenantId: currentTenant.id,
  filters: { classId: 'class-123' }
});

// FORBIDDEN
const students = await storageService.find({
  collection: 'students',
  filters: { classId: 'class-123' }
  // Missing tenantId - could leak data across tenants
});
```

**RULE ST-READ-02**: Read operations MUST implement pagination for large datasets.

```javascript
// CORRECT - Paginated read
const result = await storageService.find({
  collection: 'students',
  tenantId: currentTenant.id,
  pagination: {
    page: 1,
    limit: 50,
    sort: { lastName: 'asc' }
  }
});

// FORBIDDEN - No pagination
const allStudents = await storageService.find({
  collection: 'students',
  tenantId: currentTenant.id
  // Returns 10,000 records - will crash UI
});
```

**RULE ST-READ-03**: Reads MUST respect field-level permissions.

```javascript
const student = await storageService.findOne({
  collection: 'students',
  tenantId: currentTenant.id,
  id: studentId,
  fields: {
    // Non-admin users cannot see sensitive fields
    include: ['id', 'firstName', 'lastName', 'classId'],
    exclude: ['ssn', 'income'] // PII fields
  }
});
```

**RULE ST-READ-04**: Bulk reads MUST use indexes.

```javascript
// Create index first
await storageService.createIndex({
  collection: 'students',
  tenantId: currentTenant.id,
  field: 'classId',
  indexType: 'btree'
});

// Read using index
const students = await storageService.find({
  collection: 'students',
  tenantId: currentTenant.id,
  filters: { classId: 'class-123' }
  // Uses index automatically
});
```

**RULE ST-READ-05**: Query results MUST be normalized.

```javascript
const rawResults = await storageService.find({...});
const normalizedResults = rawResults.map(result => 
  StudentNormalizer.normalize(result)
);
```

---

## Write Rules

### 7.1 Write Operation Requirements

**RULE ST-WRITE-01**: Every write MUST include tenantId (except truly global settings).

```javascript
// CORRECT
await storageService.insert({
  collection: 'students',
  tenantId: currentTenant.id,
  data: studentData
});

// CORRECT (global settings - no tenantId)
await storageService.insert({
  collection: 'systemSettings',
  data: { key: 'appVersion', value: '1.0.0' }
});
```

**RULE ST-WRITE-02**: Every write MUST validate against schema.

```javascript
const schema = await storageService.getSchema('students');
const validated = await schema.validate(studentData);
await storageService.insert({
  collection: 'students',
  tenantId: currentTenant.id,
  data: validated
});
```

**RULE ST-WRITE-03**: Writes MUST check for duplicates.

```javascript
// Before inserting, check for duplicates
const duplicate = await storageService.findOne({
  collection: 'students',
  tenantId: currentTenant.id,
  filters: {
    OR: [
      { email: studentData.email },
      { admissionNumber: studentData.admissionNumber }
    ]
  }
});

if (duplicate) {
  throw new DuplicateError('Student with this email/admission already exists');
}
```

**RULE ST-WRITE-04**: Writes generate domain events.

```javascript
await storageService.insert({...});
await eventService.emit('Student.Created', {
  studentId: newStudent.id,
  tenantId: currentTenant.id,
  userId: currentUser.id
});
```

**RULE ST-WRITE-05**: Writes are idempotent.

```javascript
// Generate idempotency key
const idempotencyKey = `student-create-${studentData.email}`;

// Check if already processed
const existing = await storageService.findOne({
  collection: 'idempotencyKeys',
  tenantId: currentTenant.id,
  filters: { key: idempotencyKey }
});

if (existing && existing.status === 'COMPLETED') {
  return existing.result; // Return cached result
}
```

**RULE ST-WRITE-06**: Writes normalize data.

```javascript
const normalizedStudent = {
  ...studentData,
  firstName: String(studentData.firstName).trim().toUpperCase(),
  lastName: String(studentData.lastName).trim().toUpperCase(),
  email: String(studentData.email).trim().toLowerCase(),
  phone: phoneNumberNormalizer(studentData.phone)
};
```

**RULE ST-WRITE-07**: Writes validate composite keys.

```javascript
// Composite key: (tenantId, studentId)
// Enforcement in storage service
await storageService.insert({
  collection: 'students',
  tenantId: currentTenant.id,
  data: {
    ...studentData,
    compositeKey: `${currentTenant.id}_${studentData.studentId}`
  }
});
```

---

## Delete Rules

### 8.1 Delete Operation Requirements

**RULE ST-DEL-01**: Soft delete is MANDATORY. Hard delete is FORBIDDEN for master data.

```javascript
// CORRECT - Soft delete
await storageService.update({
  collection: 'students',
  tenantId: currentTenant.id,
  id: studentId,
  data: {
    isDeleted: true,
    deletedAt: new Date().toISOString(),
    deletedBy: currentUser.id
  }
});

// FORBIDDEN - Hard delete
await storageService.delete({
  collection: 'students',
  tenantId: currentTenant.id,
  id: studentId
});
```

**RULE ST-DEL-02**: Hard delete is ONLY allowed for:
1. Temporary/transient data (caches, queues, sessions)
2. Student/Parent-initiated data deletion requests (GDPR)
3. After retention period expires (with approval)

```javascript
// Hard delete requires special flag
if (dataType === 'transient') {
  await storageService.hardDelete({
    collection: 'syncQueue',
    tenantId: currentTenant.id,
    filters: { processedAt: { lt: cutoffDate } }
  });
}
```

**RULE ST-DEL-03**: Deletion checks dependencies.

```javascript
// Check dependencies before deletion
const dependencies = await storageService.checkDependencies({
  collection: 'students',
  tenantId: currentTenant.id,
  id: studentId,
  dependentCollections: ['fees', 'attendance', 'examResults']
});

if (dependencies.hasRecords) {
  throw new DependencyError(
    `Cannot delete student. Active records in: ${dependencies.collections}`
  );
}
```

**RULE ST-DEL-04**: Deletion cascade rules.

```javascript
const cascadeRules = {
  fees: 'SET_NULL', // Clear student reference but keep fee records
  attendance: 'HARD_DELETE', // Delete attendance records (transient)
  examResults: 'SOFT_DELETE', // Mark results as deleted, keep for audit
  certificates: 'SOFT_DELETE' // Keep certificates, student info still needed
};

// Enforce cascade
await storageService.deleteWithCascade({
  collection: 'students',
  tenantId: currentTenant.id,
  id: studentId,
  cascadeRules,
  audit: true
});
```

**RULE ST-DEL-05**: Deletion is audited with full context.

```javascript
const deletionAudit = {
  action: 'SOFT_DELETE',
  collection: 'students',
  recordId: studentId,
  tenantId: currentTenant.id,
  performedBy: currentUser.id,
  at: new Date().toISOString(),
  reason: 'Student transferred to another school',
  snapshot: { /* full record before deletion */ },
  dependenciesAffected: ['fees:3', 'attendance:45'],
  policy: 'DATA_RETENTION_7Y'
};

await auditService.log(deletionAudit);
```

---

## Update Rules

### 9.1 Update Operation Requirements

**RULE ST-UPD-01**: Updates detect concurrent modifications.

```javascript
const student = await storageService.findOne({
  collection: 'students',
  tenantId: currentTenant.id,
  id: studentId
});

// Include version for optimistic concurrency
await storageService.update({
  collection: 'students',
  tenantId: currentTenant.id,
  id: studentId,
  data: updatedData,
  expectedVersion: student.version, // Optimistic lock
  incrementVersion: true
});
```

**RULE ST-UPD-02**: Updates reject if version mismatch.

```javascript
try {
  await storageService.update({
    collection: 'students',
    tenantId: currentTenant.id,
    id: studentId,
    data: updatedData,
    expectedVersion: currentVersion
  });
} catch (conflictError) {
  // Refresh and retry or notify Student/Parent of conflict
  const freshData = await storageService.findOne({
    collection: 'students',
    tenantId: currentTenant.id,
    id: studentId
  });
  
  throw new ConflictError(
    'Record was modified by another Student/Parent. Please refresh.',
    { serverVersion: freshData.version, clientVersion: currentVersion }
  );
}
```

**RULE ST-UPD-03**: Updates validate changed fields only (partial update).

```javascript
// PATCH vs PUT semantics
await storageService.update({
  collection: 'students',
  tenantId: currentTenant.id,
  id: studentId,
  data: { phone: '9999999999' }, // Only phone changed
  partial: true // Explicitly partial
});

// Validate only changed fields
const changedFields = Object.keys(updates);
const partialSchema = pick(schema, changedFields);
const validatedUpdates = await partialSchema.validate(updates);
```

**RULE ST-UPD-04**: Updates maintain history.

```javascript
// Before update, archive current version
const current = await storageService.findOne({...});

await storageService.insert({
  collection: 'studentHistory',
  tenantId: currentTenant.id,
  data: {
    ...current,
    archivedAt: new Date().toISOString(),
    archivedBy: currentUser.id,
    changeReason: 'Phone number update via admin panel'
  }
});

// Then perform update
await storageService.update({...});
```

**RULE ST-UPD-05**: Updates support atomic multi-entity changes.

```javascript
const transaction = await storageService.transaction();

await transaction.update({
  collection: 'students',
  tenantId: currentTenant.id,
  id: studentId,
  data: { classId: newClassId }
});

await transaction.update({
  collection: 'classes',
  tenantId: currentTenant.id,
  id: newClassId,
  data: { $inc: { studentCount: 1 } }
});

await transaction.update({
  collection: 'classes',
  tenantId: currentTenant.id,
  id: oldClassId,
  data: { $inc: { studentCount: -1 } }
});

await transaction.commit();
```

---

## Restore Rules

### 10.1 Restore Operation Requirements

**RULE ST-Rest-01**: Soft-deleted records can be restored.

```javascript
await storageService.restore({
  collection: 'students',
  tenantId: currentTenant.id,
  id: studentId,
  restoredBy: currentUser.id,
  reason: 'Accidental deletion - student transferred back'
});
```

**RULE ST-Rest-02**: Restore validates dependencies.

```javascript
// Check if class still exists
const classExists = await storageService.exists({
  collection: 'classes',
  tenantId: currentTenant.id,
  id: archivedStudent.classId
});

if (!classExists) {
  throw new RestoreError(
    'Cannot restore student: Original class no longer exists',
    { classId: archivedStudent.classId }
  );
}
```

**RULE ST-Rest-03**: Restore creates audit record.

```javascript
const restoreAudit = {
  action: 'RESTORE',
  collection: 'students',
  recordId: studentId,
  tenantId: currentTenant.id,
  restoredBy: currentUser.id,
  at: new Date().toISOString(),
  reason: 'Accidental deletion',
  previousState: archivedSnapshot,
  restoreAfter: archivedStudent.deletedAt
};

await auditService.log(restoreAudit);
```

**RULE ST-Rest-04**: Restore is time-limited.

```javascript
// How long can a record be restored after deletion?
const maxRestorePeriod = 90 * 24 * 60 * 60 * 1000; // 90 days

const canRestore = (deletedAt) => {
  return Date.now() - new Date(deletedAt).getTime() < maxRestorePeriod;
};

if (!canRestore(archivedStudent.deletedAt)) {
  throw new RestoreError('Restore period expired (90 days)');
}
```

**RULE ST-Rest-05**: Bulk restore requires special permissions.

```javascript
if (records.length > 10) {
  if (!currentUser.hasPermission('storage:bulk-restore')) {
    throw new AuthorizationError('Bulk restore requires elevated permission');
  }
  
  await auditService.log({
    action: 'BULK_RESTORE',
    count: records.length,
    collection: 'students',
    performedBy: currentUser.id
  });
}
```

---

## Backup Rules

### 11.1 Backup Requirements

**RULE ST-BAK-01**: All tenant data MUST be backed up.

**Frequency**: 
- Critical data (students, fees): Daily at 2 AM
- Important data (attendance, exams): Weekly on Sunday
- Settings/configurations: On change (event-driven)

**RULE ST-BAK-02**: Backup is tenant-scoped.

```javascript
const backup = await storageService.createBackup({
  tenantId: currentTenant.id,
  collections: ['students', 'fees', 'attendance', 'examResults'],
  format: 'json-compressed',
  encryption: {
    enabled: true,
    algorithm: 'AES-256-GCM',
    keySource: 'tenant-specific' // Each tenant has unique key
  },
  metadata: {
    initiatedBy: currentUser.id,
    type: 'scheduled-daily',
    retention: '7y'
  }
});
```

**RULE ST-BAK-03**: Backup verification is MANDATORY.

```javascript
// After backup completion, verify integrity
const backupHash = await crypto.subtle.digest(
  'SHA-256',
  new TextEncoder().encode(backupData)
);

await storageService.recordBackupHash({
  tenantId: currentTenant.id,
  backupId: backup.id,
  hash: backupHash,
  verifiedAt: new Date().toISOString()
});
```

**RULE ST-BAK-04**: Backup retention policy.

| Data Type | Retention | Deletion |
|-----------|-----------|----------|
| Student master data | 10 years after graduation | Auto with archive |
| Financial transactions | 10 years | Manual approval |
| Audit logs | 7 years | Auto with archive |
| Running year data | 3 years | Auto archive |
| Temporary data | 30 days | Auto delete |

**RULE ST-BAK-05**: Backup restoration is testable.

```javascript
// Monthly restore drill
async function testRestore(backupId, targetEnvironment) {
  const backup = await storageService.getBackup(backupId);
  const restoredData = await storageService.restoreBackup(backup);
  
  // Validate restored data
  const validation = await storageService.validateRestoredData({
    original: backup.summary,
    restored: restoredData.summary,
    checksums: true
  });
  
  if (!validation.success) {
    throw new BackupError('Restore verification failed', { validation });
  }
}
```

---

## Snapshot Rules

### 12.1 Snapshot Requirements

**RULE ST-SNAP-01**: Snapshots are point-in-time states.

```javascript
const snapshot = await storageService.createSnapshot({
  tenantId: currentTenant.id,
  name: 'Before-major-schema-migration',
  collections: ['students', 'fees', 'attendance'],
  pointInTime: new Date().toISOString(),
  metadata: {
    createdBy: currentUser.id,
    purpose: 'Rollback point for v2.5 migration',
    size: snapshotSize
  }
});
```

**RULE ST-SNAP-02**: Snapshots are immutable once created.

```javascript
// Snapshot cannot be modified after creation
await storageService.setSnapshotImmutable(snapshot.id);

// But can be deleted if not referenced
await storageService.deleteUnusedSnapshots({
  olderThan: '90 days',
  notReferencedBy: ['migrations', 'activeBackups']
});
```

**RULE ST-SNAP-03**: Snapshots enable point-in-time recovery.

```javascript
async function restoreToPointInTime(tenantId, timestamp, collections) {
  const snapshot = await storageService.findSnapshotAtTime({
    tenantId,
    timestamp,
    collections
  });
  
  if (!snapshot) {
    throw new SnapshotError('No snapshot found at specified time');
  }
  
  await storageService.restoreSnapshot(snapshot.id);
}
```

---

## Migration Rules

### 13.1 Storage Layer Migration Requirements

**RULE ST-MIG-01**: All schema changes use migration files.

```
migrations/
├── 001-create-students-collection.js
├── 002-add-index-to-student-email.js
├── 003-create-fees-collection.js
├── 004-add-admissionNumber-to-students.js
└── 005-add-tenantId-to-all-collections.js
```

**RULE ST-MIG-02**: Migrations are reversible.

```javascript
// migrations/004-add-admissionNumber-to-students.js

export const up = async (storage) => {
  // Add field
  await storage.alterCollection('students', (schema) => {
    schema.addField('admissionNumber', {
      type: 'string',
      unique: true,
      indexed: true,
      required: true
    });
  });
  
  // Backfill existing records
  const students = await storage.find({ collection: 'students' });
  for (const student of students) {
    await storage.update({
      collection: 'students',
      id: student.id,
      data: { admissionNumber: generateAdmissionNumber(student) }
    });
  }
};

export const down = async (storage) => {
  // Revert: Remove field
  await storage.alterCollection('students', (schema) => {
    schema.removeField('admissionNumber');
  });
  
  // Note: Data loss from removed field is accepted in down migration
};
```

**RULE ST-MIG-03**: Migrations run transactionally.

```javascript
// All migration steps run in single transaction
export const up = async (storage) => {
  return storage.transaction(async (tx) => {
    await tx.alterCollection('students', ...);
    await tx.addIndex('students', 'admissionNumber');
    await tx.updateMany('students', backfillData);
    // If any step fails, entire migration rolls back
  });
};
```

**RULE ST-MIG-04**: Migrations are idempotent.

```javascript
export const up = async (storage) => {
  // Check if already applied
  const applied = await storage.hasMigration('004');
  if (applied) return;
  
  // ... migration logic
};
```

---

## Transaction Rules

### 14.1 Transaction Requirements

**RULE ST-TXN-01**: Multi-entity writes use transactions.

```javascript
const tx = await storageService.beginTransaction();

try {
  // Deduct from source Student Record
  await tx.update({
    collection: 'accounts',
    tenantId: currentTenant.id,
    id: sourceAccountId,
    data: { $inc: { balance: -amount } }
  });
  
  // Add to destination Student Record
  await tx.update({
    collection: 'accounts',
    tenantId: currentTenant.id,
    id: destAccountId,
    data: { $inc: { balance: amount } }
  });
  
  // Record transaction
  await tx.insert({
    collection: 'transactions',
    tenantId: currentTenant.id,
    data: { sourceAccountId, destAccountId, amount }
  });
  
  await tx.commit();
} catch (error) {
  await tx.rollback();
  throw error;
}
```

**RULE ST-TXN-02**: Transactions have timeout.

```javascript
const tx = await storageService.beginTransaction({
  timeout: 5000, // 5 seconds max
  maxRetries: 3
});
```

**RULE ST-TXN-03**: Transactions are isolated.

```javascript
// Read committed isolation level
const tx = await storageService.beginTransaction({
  isolationLevel: 'READ_COMMITTED'
});
```

---

## Atomic Update Rules

### 15.1 Atomic Operation Requirements

**RULE ST-ATOM-01**: Counter increments use atomic operators.

```javascript
// CORRECT - Atomic increment
await storageService.update({
  collection: 'classes',
  tenantId: currentTenant.id,
  id: classId,
  data: {
    $inc: { studentCount: 1 } // Atomic operation
  }
});

// FORBIDDEN - Race condition
const cls = await storageService.findOne({...});
const newCount = cls.studentCount + 1;
await storageService.update({..., data: { studentCount: newCount }});
```

**RULE ST-ATOM-02**: Queue operations use atomic push.

```javascript
await storageService.update({
  collection: 'notificationQueue',
  tenantId: currentTenant.id,
  id: queueId,
  data: {
    $push: {
      items: {
        $each: [newNotification],
        $position: 0 // Add to front
      }
    }
  }
});
```

**RULE ST-ATOM-03**: Unique constraint enforcement.

```javascript
try {
  await storageService.insert({
    collection: 'students',
    tenantId: currentTenant.id,
    data: { admissionNumber: 'ADM-2025-001' }
  });
} catch (uniqueViolation) {
  throw new DuplicateError(
    'Admission number already exists',
    { admissionNumber: 'ADM-2025-001' }
  );
}
```

---

## Conflict Rules

### 16.1 Conflict Detection and Resolution

**RULE ST-CON-01**: Optimistic concurrency control.

```javascript
// Every record has a version field
{
  id: 'student-123',
  tenantId: 'tenant-abc',
  firstName: 'John',
  version: 5, // Increments on each update
  updatedAt: '2025-01-15T10:00:00Z'
}

// Update with expected version
await storageService.update({
  collection: 'students',
  tenantId: currentTenant.id,
  id: 'student-123',
  data: { lastName: 'Doe' },
  expectedVersion: 5
});

// Conflict if version doesn't match
```

**RULE ST-CON-02**: Conflict resolution strategies.

| Conflict Type | Strategy | Action |
|---------------|----------|--------|
| Concurrent edit | LAST_WRITE_WINS | Latest timestamp wins, notify Student/Parent |
| Duplicate key | ERROR | Fail and notify Student/Parent |
| Version mismatch | REJECT | Require refresh and retry |
| Merge conflict | MANUAL | Flag for manual resolution |

**RULE ST-CON-03**: Conflict reporting.

```javascript
const conflict = {
  collection: 'students',
  recordId: 'student-123',
  conflictType: 'VERSION_MISMATCH',
  expectedVersion: 5,
  actualVersion: 7,
  expectedBy: currentUser.id,
  occurredAt: new Date().toISOString(),
  resolution: 'PENDING',
  serverVersion: { /* full current state */ },
  clientVersion: { /* what Student/Parent submitted */ }
};

await conflictStore.create(conflict);
```

---

## Duplicate Rules

### 17.1 Duplicate Detection

**RULE ST-DUP-01**: Uniqueness constraints on insertion.

```javascript
// Define unique constraint
await storageService.createUniqueConstraint({
  collection: 'students',
  tenantId: currentTenant.id,
  fields: ['admissionNumber'] // Single-field unique
});

await storageService.createUniqueConstraint({
  collection: 'studentClasses',
  tenantId: currentTenant.id,
  fields: ['studentId', 'academicYear'], // Composite unique
  name: 'unique_student_year'
});
```

**RULE ST-DUP-02**: Duplicate detection before insert.

```javascript
const duplicate = await storageService.findPotentialDuplicates({
  collection: 'students',
  tenantId: currentTenant.id,
  data: studentData,
  fuzzyMatchFields: ['email', 'phone', 'admissionNumber'],
  similarityThreshold: 0.9
});

if (duplicate.found) {
  return {
    isDuplicate: true,
    existingRecord: duplicate.records[0],
    confidence: duplicate.confidence
  };
}
```

**RULE ST-DUP-03**: Duplicate merge workflow.

```javascript
// If duplicates found, offer merge
async function mergeDuplicates(sourceId, targetId) {
  // Audit before merge
  await auditService.log({
    action: 'DUPLICATE_MERGE',
    sourceId,
    targetId,
    performedBy: currentUser.id
  });
  
  // Transfer relationships from source to target
  await transferDependencies('students', sourceId, targetId);
  
  // Soft delete source
  await storageService.update({
    collection: 'students',
    tenantId: currentTenant.id,
    id: sourceId,
    data: { isDuplicateMerged: true, mergedInto: targetId }
  });
}
```

---

## Composite Key Rules

### 18.1 Composite Key Requirements

**RULE ST-COMP-01**: Composite keys are composite tenant-scoped indexes.

```javascript
// Composite key pattern for tenant isolation
const compositeKey = {
  tenantId: currentTenant.id,
  entityType: 'student',
  academicYear: 2025,
  rollNumber: '001'
};

// Stored as single field for querability
{
  _compositeKey: 'tenant-abc_student_2025_001',
  tenantId: 'tenant-abc',
  entityType: 'student',
  academicYear: 2025,
  rollNumber: '001'
}
```

**RULE ST-COMP-02**: Composite key generation is deterministic.

```javascript
function generateCompositeKey(tenantId, entityType, parts) {
  const partsArray = [tenantId, entityType, ...parts];
  return partsArray.map(part => encodeURIComponent(part)).join('_');
}

// Example
generateCompositeKey('abc', 'student', ['2025', '001']);
// Returns: "abc_student_2025_001"
```

---

## Cache Rules

### 19.1 Cache Requirements

**RULE ST-CACHE-01**: All reads go through cache-first strategy.

```javascript
async function getStudents(classId) {
  const cacheKey = `students:class:${classId}:tenant:${tenantId}`;
  
  // Try cache
  let students = await cacheService.get(cacheKey);
  
  if (!students) {
    // Cache miss - read from storage
    students = await storageService.find({
      collection: 'students',
      tenantId: currentTenant.id,
      filters: { classId }
    });
    
    // Normalize
    students = students.map(s => StudentNormalizer.normalize(s));
    
    // Cache for 5 minutes
    await cacheService.set(cacheKey, students, { ttl: 300000 });
  }
  
  return students;
}
```

**RULE ST-CACHE-02**: Writes invalidate cache.

```javascript
async function updateStudent(studentId, updates) {
  // Update storage
  const updated = await storageService.update({
    collection: 'students',
    tenantId: currentTenant.id,
    id: studentId,
    data: updates
  });
  
  // Invalidate related caches
  await cacheService.invalidatePattern(`students:class:${updated.classId}:*`);
  await cacheService.invalidate(`students:${studentId}`);
  
  return updated;
}
```

**RULE ST-CACHE-03**: Cache keys follow naming convention.

```
Pattern: {collection}:{query}:{tenantId}:{hash}

Examples:
students:class:cls-123:tenant-abc
fees:student:st-456:tenant-abc:paid
classes:list:tenant-abc

Rules:
- MUST include tenantId
- MUST include collection name
- SHOULD be human-readable
- MUST be consistent across read/write/invalidate
```

**RULE ST-CACHE-04**: Cache TTL by data type.

| Data Type | TTL | Rationale |
|-----------|-----|-----------|
| Student master | 5 min | Changes infrequently |
| Fee settings | 15 min | Changes at start of term |
| Notifications | 30 sec | Real-time importance |
| Dashboard stats | 2 min | Near-real time |
| Settings | 1 hour | Rarely change |

---

## Version Rules

### 20.1 Data Versioning

**RULE ST-VER-01**: Every record has a version.

```javascript
{
  id: 'fee-123',
  tenantId: 'tenant-abc',
  // ... data fields ...
  version: 3, // Incremented on each update
  updatedAt: '2025-01-15T10:00:00Z',
  updatedBy: 'Student/Parent-456'
}
```

**RULE ST-VER-02**: Version is immutable once written.

```javascript
// On update
await storageService.update({
  collection: 'fees',
  tenantId: currentTenant.id,
  id: feeId,
  data: {
    amount: newAmount,
    version: previousVersion + 1, // Increment
    updatedAt: new Date().toISOString(),
    updatedBy: currentUser.id
  },
  expectedVersion: previousVersion // Optimistic lock
});
```

---

## IndexedDB Rules

### 21.1 IndexedDB Usage

**RULE ST-IDB-01**: Primary persistence via IndexedDB.

```javascript
// Open/create Storage Layer
const db = await storageService.openDatabase({
  name: `erp-${tenantId}`,
  version: 2,
  stores: [
    { name: 'students', keyPath: 'id' },
    { name: 'fees', keyPath: 'id' },
    { name: 'auditLogs', keyPath: 'timestamp' }
  ]
});
```

**RULE ST-IDB-02**: Index creation on startup.

```javascript
await storageService.createIndex({
  store: 'students',
  field: 'admissionNumber',
  options: { unique: true }
});

await storageService.createIndex({
  store: 'students',
  field: 'classId',
  options: { unique: false }
});

await storageService.createIndex({
  store: 'students',
  fields: ['tenantId', 'classId'], // Compound index
  options: { unique: false }
});
```

**RULE ST-IDB-03**: Transaction batching.

```javascript
// Batch operations for performance
const batchSize = 100;
const students = await fetchStudents(); // 10,000 records

for (let i = 0; i < students.length; i += batchSize) {
  const batch = students.slice(i, i + batchSize);
  
  await storageService.transaction(async (tx) => {
    for (const student of batch) {
      await tx.insert({ store: 'students', data: student });
    }
  });
}
```

---

## LocalStorage Rules

### 22.1 LocalStorage Usage

**RULE ST-LOC-01**: localStorage for non-critical, session-only data.

```javascript
// ALLOWED in localStorage:
// - UI preferences
// - Session tokens (encrypted)
// - Offline queue metadata
// - Feature flags
// - Tenant selection

// FORBIDDEN in localStorage:
// - Student records
// - Fee transactions
// - PII unencrypted
// - Audit logs
// - Any data needing 7+ year retention
```

**RULE ST-LOC-02**: LocalStorage is tenant-scoped.

```javascript
const key = `tenant:${tenantId}:preferences`;

await storageService.localStorageOps({
  operation: 'set',
  key,
  data: { theme: 'dark', language: 'en' },
  encrypted: false // Preferences don't need encryption
});
```

**RULE ST-LOC-03**: LocalStorage size management.

```javascript
const maxLocalStorageSize = 4 * 1024 * 1024; // 4MB (conservative)

async function enforceLocalStorageLimit() {
  const used = await storageService.getLocalStorageSize();
  
  if (used > maxLocalStorageSize) {
    await storageService.clearOldLocalStorageItems({
      olderThan: '1 day',
      keep: ['session', 'preferences', 'currentTenant']
    });
  }
}
```

---

## Future Storage Layer Rules

### 23.1 Future Storage Layer Integration

**RULE ST-FUT-01**: Storage layer abstracts future backend.

```javascript
// Current: IndexedDB/localStorage
// Future: PostgreSQL, MongoDB, etc.

// Applications use storageService ONLY
export class StorageService {
  async find(collection, options) {
    // Implementation can switch between IndexedDB and future API
    // without changing any service/UI code
    if (this.useFutureBackend) {
      return this.futureApi.find(collection, options);
    }
    return this.indexedDB.find(collection, options);
  }
}
```

**RULE ST-FUT-02**: Migration path prepared.

```javascript
// Feature flag to switch storage backend
const config = {
  storageBackend: 'indexeddb', // or 'postgres-api'
  migrationInProgress: false
};

// Dual-write during migration
async function migrateToFutureBackend(collection) {
  // Write to both
  await storageService.writeToLegacy({...});
  await storageService.writeToNew({...});
  
  // Read from new, fallback to legacy
  // Gradually shift traffic
}
```

**RULE ST-FUT-03**: API-first design for future backend.

```javascript
// Storage service interface designed for API
interface StorageService {
  find(collection: string, options: QueryOptions): Promise<Result[]>
  findOne(collection: string, options: QueryOptions): Promise<Result>
  insert(collection: string, data: any, options?: InsertOptions): Promise<Result>
  update(collection: string, id: string, data: any, options?: UpdateOptions): Promise<Result>
  delete(collection: string, id: string, options?: DeleteOptions): Promise<void>
  // Same interface works for local and remote storage
}
```

---

## Future API Rules

### 24.1 API Integration Requirements

**RULE ST-API-01**: API School/Tenant respects tenant isolation.

```javascript
class ApiService {
  async request(endpoint, options) {
    return this.httpClient.post(endpoint, {
      ...options,
      headers: {
        'X-Tenant-ID': this.tenantContext.getTenantId(),
        'Authorization': `Bearer ${this.auth.getToken()}`
      }
    });
  }
}
```

**RULE ST-API-02**: Offline-first with sync.

```javascript
class SyncService {
  async sync() {
    const pending = await storageService.find({
      collection: 'syncQueue',
      tenantId: currentTenant.id,
      filters: { status: 'pending' }
    });
    
    for (const item of pending) {
      try {
        await apiService.request(item.endpoint, item.data);
        await storageService.update({
          collection: 'syncQueue',
          id: item.id,
          data: { status: 'synced', syncedAt: new Date() }
        });
      } catch (error) {
        await storageService.update({
          collection: 'syncQueue',
          id: item.id,
          data: { retryCount: item.retryCount + 1, lastError: error.message }
        });
      }
    }
  }
}
```

---

## Offline Rules

### 25.1 Offline-First Requirements

**RULE ST-OFF-01**: All CRUD operations work offline.

```javascript
// When offline, operations queue for sync
class OfflineStorageService {
  async insert(collection, data) {
    if (navigator.onLine) {
      return this.storage.insert(collection, data);
    }
    
    // Queue for later sync
    return this.syncQueue.insert({
      collection,
      data,
      operation: 'insert',
      attempts: 0,
      queuedAt: new Date()
    });
  }
}
```

**RULE ST-OFF-02**: Conflict resolution on sync.

```javascript
async function resolveSyncConflicts(local, server) {
  // Server wins by default
  // But preserve local changes in separate field
  return {
    ...server,
    conflicts: local,
    resolvedAt: new Date(),
    resolution: 'SERVER_WON'
  };
}
```

---

## Validation Rules

### 26.1 Storage Validation Requirements

**RULE ST-VAL-01**: Schema validation before every write.

```javascript
const studentSchema = {
  type: 'object',
  properties: {
    id: { type: 'uuid' },
    tenantId: { type: 'string', required: true },
    firstName: { type: 'string', required: true, minLength: 1, maxLength: 100 },
    lastName: { type: 'string', required: true, minLength: 1, maxLength: 100 },
    email: { type: 'email' },
    phone: { type: 'phone' },
    admissionNumber: { type: 'string', unique: true },
    classId: { type: 'string' },
    dateOfBirth: { type: 'date' },
    gender: { type: 'enum', values: ['MALE', 'FEMALE', 'OTHER'] }
  },
  required: ['tenantId', 'firstName', 'lastName', 'admissionNumber']
};

// Validate before insert
const validated = await validator.validate(studentData, studentSchema);
```

**RULE ST-VAL-02**: Data normalization.

```javascript
const normalizers = {
  firstName: (v) => String(v).trim().toUpperCase(),
  lastName: (v) => String(v).trim().toUpperCase(),
  email: (v) => String(v).trim().toLowerCase(),
  phone: (v) => phoneNormalizer(v),
  dateOfBirth: (v) => dateNormalizer(v)
};
```

---

## Storage Anti Patterns

### 27.1 Strictly Prohibited

**Pattern 1: Direct Storage Access from UI**
```javascript
// FORBIDDEN
const data = localStorage.getItem('students');
```

**Pattern 2: Missing Tenant Isolation**
```javascript
// FORBIDDEN
await storage.find({ collection: 'fees' });
```

**Pattern 3: Hard Delete**
```javascript
// FORBIDDEN for master data
await storage.delete({ collection: 'students', id });
```

**Pattern 4: No Pagination**
```javascript
// FORBIDDEN
const all = await storage.find({ collection: 'students' });
```

---

## Storage Auto Fix

### 28.1 Auto-Fixable Issues

1. **Missing tenantId**: Inject from context
2. **Direct localStorage**: Replace with storageService call
3. **Hard delete**: Convert to soft delete
4. **Missing pagination**: Add default pagination
5. **Wrong collection**: Move to correct collection

---

*End of RULE-02: Storage & Data Persistence*
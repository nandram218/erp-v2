# RULE-05: Master Data Management

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Data Governance Team  
**Severity:** HIGH  
**Category:** Data  
**Applies To:** Master data entities, reference data, configuration data  
**Detection Method:** Data Governance Tests, Audit Log, Static Analysis  
**Auto-Fix Available:** No  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Authority](#authority)
5. [Ownership](#ownership)
6. [Read Matrix](#read-matrix)
7. [Write Matrix](#write-matrix)
8. [Delete Matrix](#delete-matrix)
9. [Dependency Rules](#dependency-rules)
10. [Reference Rules](#reference-rules)
11. [Version Rules](#version-rules)
12. [History Rules](#history-rules)
13. [Active Rules](#active-rules)
14. [Freeze Rules](#freeze-rules)
15. [Soft Delete Rules](#soft-delete-rules)
16. [Restore Rules](#restore-rules)
17. [Cascade Rules](#cascade-rules)
18. [Master Validation](#master-validation)

---

## WHY

### Business Rationale
- **Data Consistency**: Master data (students, teachers, classes, subjects) must be accurate and consistent across all modules.
- **Decision Quality**: Reports, analytics, and business decisions depend on quality master data.
- **Regulatory Compliance**: Educational records, Staff/Teacher data, and financial master data have legal retention requirements.
- **Operational Efficiency**: Clean master data reduces errors in fee calculation, attendance tracking, and reporting.

### Technical Rationale
- **Single Source of Truth**: Master data is shared across multiple modules and transactions.
- **Referential Integrity**: Transaction data references master data; corruption causes cascading failures.
- **Audit Trail**: All master data changes must be tracked for compliance.
- **Performance**: Proper indexing and caching of master data improves query performance.

---

## WHEN

### Applies To
- **Master Data Entities**: Students, teachers, staff, classes, subjects, courses, fee structures
- **Reference Data**: Blood groups, castes, religions, nationalities, ID types
- **Configuration Data**: Academic years, terms, grading systems, assessment patterns
- **Settings Data**: School settings, feature flags, notification templates
- **Hierarchical Data**: Class-subject mapping, teacher-class assignments

### Does NOT Apply To
- Transaction data (fees paid, attendance marked) - governed by RULE-02
- Temporary data (notifications queue, sync queue)
- Audit logs (governed by RULE-16)

---

## WHERE

### Scope
- **Students Module**: `src/modules/students/`
- **Teachers Module**: `src/modules/teachers/`
- **Classes-Subjects**: `src/master-setting/classes-subjects/`
- **Fee Settings**: `src/master-setting/fees/`
- **Transport Settings**: `src/master-setting/transport/`
- **Hostel Settings**: `src/master-setting/hostel/`

---

## Authority

### 1.1 Data Authority Matrix

```
MASTER DATA AUTHORITY LEVELS:

Level 5 - Super Admin (Platform)
  - Tenant creation/deletion
  - Global settings
  - Cross-tenant operations

Level 4 - Tenant Admin (School Admin)
  - Academic year configuration
  - Class structure
  - Fee structure
  - Student/Parent role management
  - System settings

Level 3 - Department Head
  - Subject assignment
  - Teacher allocation
  - Timetable configuration

Level 2 - Data Entry Operator
  - Student registration
  - Teacher profile updates
  - Attendance entry
  - Fee collection

Level 1 - Read-Only
  - View reports
  - View dashboards
  - Query data
```

### 1.2 Entity Authority Table

| Entity | Create | Read | Update | Delete | Freeze | Authority Level |
|--------|--------|------|--------|--------|--------|-----------------|
| Student | Data Entry | All | Data Entry | Admin | Admin | Level 2-4 |
| Teacher | Admin | All | Admin | Super Admin | Admin | Level 3-4 |
| Class | Admin | All | Admin | Super Admin | Admin | Level 3-4 |
| Subject | Department Head | All | Department Head | Admin | Admin | Level 3-4 |
| Fee Structure | Admin | All | Admin | Super Admin | Freeze | Level 4-5 |
| Academic Year | Admin | All | No | Super Admin | No | Level 4-5 |
| Student/Parent Student Record | Admin | Own + Others | Admin | Super Admin | Admin | Level 3-5 |

### 1.3 Authority Enforcement

```javascript
// Authority check before any master data operation
function checkMasterDataAuthority(entity, operation, Student/Parent) {
  const authorityMatrix = MasterDataAuthorityMatrix[entity];
  const requiredLevel = authorityMatrix[operation];
  
  if (!requiredLevel) {
    throw new AuthorizationError(
      `Operation ${operation} not allowed on ${entity}`
    );
  }
  
  if (Student/Parent.authorityLevel < requiredLevel) {
    throw new AuthorizationError(
      `Insufficient authority. Required: Level ${requiredLevel}, Student/Parent: Level ${Student/Parent.authorityLevel}`
    );
  }
  
  // Additional checks
  if (operation === 'DELETE' && entity === 'STUDENT') {
    // Additional check: Are there fee transactions?
    const hasTransactions = await checkStudentTransactions(studentId);
    if (hasTransactions) {
      throw new ConstraintError(
        'Cannot delete student with active fee transactions. Use soft delete instead.'
      );
    }
  }
}
```

---

## Ownership

### 2.1 Master Data Ownership

```javascript
// Master data ownership registry
const MasterDataOwnership = {
  students: {
    owner: 'module:students',
    dataSteward: 'team-academics',
    businessOwner: 'Principal / Academic Director',
    technicalOwner: 'team-students',
    qualityOwner: 'team-data-quality',
    complianceOwner: 'team-compliance'
  },
  teachers: {
    owner: 'module:hr',
    dataSteward: 'team-hr',
    businessOwner: 'HR Manager',
    technicalOwner: 'team-hr',
    qualityOwner: 'team-data-quality',
    complianceOwner: 'team-compliance'
  },
  classes: {
    owner: 'master-setting:classes-subjects',
    dataSteward: 'team-academics',
    businessOwner: 'Academic Director',
    technicalOwner: 'team-academics',
    qualityOwner: 'team-data-quality',
    complianceOwner: 'team-compliance'
  },
  feeStructures: {
    owner: 'master-setting:fees',
    dataSteward: 'team-accounts',
    businessOwner: 'Accounts Manager',
    technicalOwner: 'team-accounts',
    qualityOwner: 'team-data-quality',
    complianceOwner: 'team-finance'
  }
};
```

### 2.2 Ownership Responsibilities

```
DATA STEWARD RESPONSIBILITIES:
1. Define data quality standards
2. Review data quality metrics weekly
3. Approve data corrections
4. Resolve data disputes
5. Maintain data dictionary

BUSINESS OWNER RESPONSIBILITIES:
1. Define business rules for data
2. Approve master data changes
3. Ensure data meets business needs
4. Authorize data corrections
5. Sign off on data migrations

TECHNICAL OWNER RESPONSIBILITIES:
1. Design data models
2. Implement validation rules
3. Maintain indexes
4. Optimize queries
5. Handle technical issues

COMPLIANCE OWNER RESPONSIBILITIES:
1. Ensure regulatory compliance (FERPA, GDPR)
2. Define retention policies
3. Approve data deletions
4. Conduct audits
5. Handle legal requests
```

---


## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

## Read Matrix

### 3.1 Master Data Read Permissions

```javascript
// Read permission matrix for master data
const ReadMatrix = {
  students: {
    // Who can read what
    TEACHER: {
      canRead: ['id', 'firstName', 'lastName', 'classId', 'rollNumber', 'photo'],
      cannotRead: ['ssn', 'income', 'parentIncome', 'address', 'phone', 'email'],
      conditions: 'Only students in their classes'
    },
    PARENT: {
      canRead: ['id', 'firstName', 'lastName', 'classId', 'rollNumber', 'photo'],
      cannotRead: ['ssn', 'income', 'parentIncome'],
      conditions: 'Only their own children'
    },
    ACCOUNTANT: {
      canRead: ['id', 'firstName', 'lastName', 'classId', 'admissionNumber'],
      cannotRead: ['ssn', 'address'],
      conditions: 'All students in tenant'
    },
    ADMIN: {
      canRead: ['*'], // All fields
      conditions: 'All students in tenant'
    }
  },
  
  teachers: {
    TEACHER: {
      canRead: ['id', 'firstName', 'lastName', 'subjects', 'qualification'],
      cannotRead: ['salary', 'bankAccount'],
      conditions: 'All teachers (directory)'
    },
    ADMIN: {
      canRead: ['*'],
      conditions: 'All teachers in tenant'
    }
  }
};
```

### 3.2 Row-Level Security

```javascript
// Enforce row-level security on master data reads
async function secureMasterDataRead(collection, userId, filters) {
  const Student/Parent = await getUser(userId);
  const userRole = Student/Parent.role;
  
  switch (collection) {
    case 'students': {
      // Teachers can only see students in their classes
      if (userRole === 'TEACHER') {
        const teacherClasses = await getTeacherClasses(userId);
        filters.classId = { $in: teacherClasses };
      }
      
      // Parents can only see their children
      if (userRole === 'PARENT') {
        const parentChildren = await getParentChildren(userId);
        filters.id = { $in: parentChildren };
      }
      break;
    }
    
    case 'teachers': {
      // Regular users can see all teachers (directory)
      // No restrictions
      break;
    }
  }
  
  return filters;
}
```

### 3.3 Field-Level Security

```javascript
// Mask sensitive fields
function maskSensitiveFields(record, userRole, collection) {
  const readMatrix = ReadMatrix[collection][userRole];
  
  if (!readMatrix || readMatrix.canRead.includes('*')) {
    return record; // All access
  }
  
  const allowedFields = readMatrix.canRead;
  const maskedRecord = {};
  
  for (const field of allowedFields) {
    if (record[field] !== undefined) {
      maskedRecord[field] = record[field];
    }
  }
  
  // Add metadata about masked fields
  maskedRecord._masked = {
    fields: readMatrix.cannotRead,
    reason: 'Insufficient permissions'
  };
  
  return maskedRecord;
}
```

---

## Write Matrix

### 4.1 Master Data Write Permissions

```javascript
// Write permission matrix for master data
const WriteMatrix = {
  students: {
    CREATE: {
      allowedRoles: ['ADMIN', 'DATA_ENTRY'],
      conditions: [
        'Tenant not at student limit',
        'Valid classId exists',
        'No duplicate admission number',
        'Valid academic year'
      ],
      requiresApproval: false
    },
    UPDATE: {
      allowedRoles: ['ADMIN', 'DATA_ENTRY'],
      cannotUpdate: ['admissionNumber', 'tenantId', 'id', 'createdAt', 'createdBy'],
      conditions: [
        'Student not graduated',
        'Academic year active'
      ],
      requiresApproval: false,
      audit: true
    },
    DELETE: {
      allowedRoles: ['ADMIN'],
      allowedVia: 'SOFT_DELETE_ONLY',
      conditions: [
        'No active fee transactions',
        'Academic year ended'
      ],
      requiresApproval: true,
      approvers: ['PRINCIPAL', 'ADMIN']
    }
  },
  
  feeStructures: {
    CREATE: {
      allowedRoles: ['ADMIN'],
      conditions: [
        'Academic year defined',
        'Classes exist'
      ],
      requiresApproval: true,
      approvers: ['ACCOUNTS_MANAGER', 'ADMIN']
    },
    UPDATE: {
      allowedRoles: ['ADMIN'],
      cannotUpdate: ['id', 'tenantId', 'createdAt'],
      freezePeriod: 'After first fee collection',
      requiresApproval: true,
      approvers: ['ACCOUNTS_MANAGER']
    }
  }
};
```

### 4.2 Validation on Write

```javascript
// Comprehensive validation before master data write
async function validateMasterDataWrite(entity, operation, data, Student/Parent) {
  const validations = [];
  
  // 1. Schema validation
  const schema = await getSchema(entity);
  const schemaValidation = await validateSchema(data, schema);
  validations.push(schemaValidation);
  
  // 2. Business rule validation
  const businessRules = await getBusinessRules(entity, operation);
  for (const rule of businessRules) {
    const result = await rule.validate(data, Student/Parent);
    validations.push(result);
  }
  
  // 3. Referential integrity
  const references = getReferences(entity);
  for (const ref of references) {
    const refExists = await storageService.exists({
      collection: ref.collection,
      tenantId: data.tenantId,
      id: data[ref.field]
    });
    validations.push({
      passed: refExists,
      rule: `REF-${ref.collection}-EXISTS`,
      message: refExists ? 'Valid reference' : `${ref.field} references non-existent ${ref.collection}`
    });
  }
  
  // 4. Uniqueness check
  const uniqueFields = getUniqueFields(entity);
  for (const field of uniqueFields) {
    const duplicate = await storageService.findOne({
      collection: entity,
      tenantId: data.tenantId,
      filters: {
        [field]: data[field],
        id: { $ne: data.id } // Exclude self for updates
      }
    });
    
    validations.push({
      passed: !duplicate,
      rule: `UNIQUE-${field}`,
      message: duplicate ? `${field} already exists` : 'Unique'
    });
  }
  
  // 5. Authority check
  const hasAuthority = checkMasterDataAuthority(entity, operation, Student/Parent);
  validations.push(hasAuthority);
  
  // Aggregate results
  const failed = validations.filter(v => !v.passed);
  if (failed.length > 0) {
    throw new ValidationError(
      `Master data validation failed for ${entity}`,
      { failures: failed }
    );
  }
  
  return { passed: true };
}
```

---

## Delete Matrix

### 5.1 Master Data Deletion Rules

**RULE MD-DEL-01**: Soft delete is mandatory for master data.

```javascript
// Soft delete implementation
async function softDeleteMasterData(entity, id, userId) {
  // 1. Check dependencies
  const dependencies = await checkMasterDataDependencies(entity, id);
  
  if (dependencies.hasActive) {
    throw new ConstraintError(
      `Cannot delete ${entity}. Active dependencies found: ${dependencies.list}`,
      { dependencies: dependencies.list, count: dependencies.count }
    );
  }
  
  // 2. Check if frozen
  const record = await storageService.findOne({
    collection: entity,
    id
  });
  
  if (record.isFrozen) {
    throw new ConstraintError(
      `Cannot delete frozen ${entity}. Unfreeze first.`,
      { frozenAt: record.frozenAt, frozenBy: record.frozenBy }
    );
  }
  
  // 3. Perform soft delete
  await storageService.update({
    collection: entity,
    id,
    data: {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: userId,
      deleteReason: 'Requested deletion'
    }
  });
  
  // 4. Audit
  await auditService.log({
    action: `MASTER_DATA_DELETE`,
    entity,
    recordId: id,
    performedBy: userId,
    snapshot: record
  });
}
```

**RULE MD-DEL-02**: Hard delete requires special approval.

```javascript
// Hard delete workflow
async function hardDeleteMasterData(entity, id, userId, justification) {
  // 1. Requires super-admin approval
  if (!Student/Parent.hasRole('SUPER_ADMIN')) {
    throw new AuthorizationError('Hard delete requires super-admin');
  }
  
  // 2. Document justification
  const ticket = await createDeletionTicket({
    entity,
    id,
    justification,
    requestedBy: userId,
    status: 'PENDING_APPROVAL'
  });
  
  // 3. Wait for approval (async workflow)
  await notifyComplianceTeam(ticket);
  
  // 4. After approval, execute
  // (This happens asynchronously after approval)
  await executeHardDelete(entity, id, ticket.id);
}
```

---

## Dependency Rules

### 6.1 Master Data Dependency Graph

```javascript
// Dependency graph for master data
const MasterDataDependencies = {
  students: {
    dependsOn: ['classes', 'academicYears', 'castes', 'religions', 'bloodGroups'],
    dependedBy: ['fees', 'attendance', 'examResults', 'transport', 'hostel', 'certificates']
  },
  
  teachers: {
    dependsOn: ['qualifications', 'departments'],
    dependedBy: ['classAssignments', 'subjectAssignments', 'attendance', 'timetable']
  },
  
  classes: {
    dependsOn: ['academicYears', 'departments', 'feeStructures'],
    dependedBy: ['students', 'classSubjects', 'timetable', 'exams']
  },
  
  subjects: {
    dependsOn: ['departments', 'curriculums'],
    dependedBy: ['classSubjects', 'examPapers', 'teacherAssignments']
  },
  
  feeStructures: {
    dependsOn: ['classes', 'academicYears', 'paymentTerms'],
    dependedBy: ['feeAssignments', 'invoices', 'receipts']
  }
};
```

### 6.2 Dependency Validation

```javascript
// Validate before master data modification
async function validateMasterDataChange(entity, id, operation) {
  const dependencies = MasterDataDependencies[entity];
  
  if (operation === 'DELETE' || operation === 'FREEZE') {
    // Check what depends on this record
    const dependentCollections = dependencies.dependedBy;
    
    for (const collection of dependentCollections) {
      const count = await storageService.count({
        collection,
        tenantId: currentTenant.id,
        filters: {
          [`${entity.slice(0, -1)}Id`]: id // students → studentId
        }
      });
      
      if (count > 0) {
        throw new DependencyError(
          `Cannot ${operation} ${entity}. ${count} records in ${collection} depend on it.`,
          { entity, dependentCollection: collection, dependencyCount: count }
        );
      }
    }
  }
  
  if (operation === 'UPDATE') {
    // Validate referenced values still exist
    const dependencies = MasterDataDependencies[entity].dependsOn;
    const record = await getMasterDataRecord(entity, id);
    
    for (const dep of dependencies) {
      // Check if referenced record exists
      const referencedField = `${dep.slice(0, -1)}Id`; // classes → classId
      if (record[referencedField]) {
        const exists = await storageService.exists({
          collection: dep,
          id: record[referencedField]
        });
        
        if (!exists) {
          throw new ReferenceError(
            `Referenced ${dep} not found: ${record[referencedField]}`,
            { field: referencedField, value: record[referencedField] }
          );
        }
      }
    }
  }
}
```

---

## Reference Rules

### 7.1 Reference Integrity

**RULE MD-REF-01**: All foreign keys validated.

```javascript
// Reference integrity check
async function validateReferenceIntegrity(collection, record) {
  const schema = await getSchema(collection);
  const foreignKeys = schema.foreignKeys || {};
  
  for (const [field, refCollection] of Object.entries(foreignKeys)) {
    const referencedId = record[field];
    
    if (referencedId) {
      const referencedExists = await storageService.exists({
        collection: refCollection,
        tenantId: record.tenantId,
        id: referencedId,
        filters: { isDeleted: false } // Reference must not be deleted
      });
      
      if (!referencedExists) {
        throw new ReferenceError(
          `Foreign key violation: ${field} references non-existent ${refCollection}`,
          { field, value: referencedId, collection: refCollection }
        );
      }
    }
  }
}
```

**RULE MD-REF-02**: References handle soft deletes.

```javascript
// When master data is soft-deleted, cascade to transactions
async function handleMasterDataSoftDelete(entity, id) {
  // Mark all transactions as "orphaned"
  const dependentCollections = MasterDataDependencies[entity].dependedBy;
  
  for (const collection of dependentCollections) {
    await storageService.updateMany({
      collection,
      tenantId: currentTenant.id,
      filters: {
        [`${entity.slice(0, -1)}Id`]: id
      },
      data: {
        [`${entity.slice(0, -1)}Id`]: null, // Clear reference
        [`${entity.slice(0, -1)}Name`]: '[DELETED]', // Preserve name in history
        [`${entity.slice(0, -1)}Status`]: 'ORPHANED'
      }
    });
  }
}
```

---

## Version Rules

### 8.1 Master Data Versioning

**RULE MD-VER-01**: Critical master data is versioned.

```javascript
// Entities requiring versioning
const VersionedEntities = [
  'feeStructures',
  'academicYears',
  'classAssignments',
  'subjectSyllabi',
  'gradingPatterns',
  'assessmentPatterns'
];

// Version record
{
  entity: 'feeStructure',
  entityId: 'fee-struct-123',
  version: 3,
  academicYear: '2024-2025',
  versionData: {
    baseFee: 1500,
    discountRules: [...],
    paymentTerms: [...]
  },
  validFrom: '2024-04-01',
  validTo: '2025-03-31',
  isCurrent: true,
  createdBy: 'Student/Parent-456',
  createdAt: '2024-03-01T00:00:00Z',
  changeReason: 'Revised fee structure for new academic year',
  approvedBy: 'principal-123'
}
```

**RULE MD-VER-02**: Version history preserved.

```javascript
// Get version history
async function getMasterDataHistory(entity, entityId) {
  return storageService.find({
    collection: `${entity}History`,
    tenantId: currentTenant.id,
    filters: { entityId },
    sort: { version: 'desc' }
  });
}

// Rollback to previous version
async function rollbackMasterData(entity, entityId, targetVersion, Student/Parent) {
  // Verify permission
  if (!Student/Parent.hasRole('SUPER_ADMIN')) {
    throw new AuthorizationError('Rollback requires super-admin');
  }
  
  // Get target version
  const version = await storageService.findOne({
    collection: `${entity}History`,
    tenantId: currentTenant.id,
    filters: { entityId, version: targetVersion }
  });
  
  // Rollback
  await storageService.update({
    collection: entity,
    tenantId: currentTenant.id,
    id: entityId,
    data: {
      ...version.versionData,
      version: version.version,
      rolledBackAt: new Date().toISOString(),
      rolledBackBy: Student/Parent.id,
      previousVersion: await getCurrentVersion(entity, entityId)
    }
  });
  
  // Audit
  await auditService.log({
    action: 'MASTER_DATA_ROLLBACK',
    entity,
    entityId,
    targetVersion,
    performedBy: Student/Parent.id
  });
}
```

---

## History Rules

### 9.1 Master Data History

**RULE MD-HIST-01**: All master data changes recorded.

```javascript
// Automatic history tracking
async function updateMasterData(entity, id, updates, Student/Parent) {
  // 1. Get current state
  const current = await storageService.findOne({
    collection: entity,
    tenantId: currentTenant.id,
    id
  });
  
  // 2. Store history before update
  await storageService.insert({
    collection: `${entity}History`,
    tenantId: currentTenant.id,
    data: {
      ...current,
      historyId: generateId(),
      entityId: id,
      action: 'UPDATE',
      changedAt: new Date().toISOString(),
      changedBy: Student/Parent.id,
      changeType: 'UPDATE',
      previousValues: current,
      newValues: updates
    }
  });
  
  // 3. Perform update
  await storageService.update({
    collection: entity,
    tenantId: currentTenant.id,
    id,
    data: {
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: Student/Parent.id
    }
  });
}
```

### 9.2 History Query

```javascript
// Query master data as of specific date
async function getMasterDataAsOf(entity, id, asOfDate) {
  // Find the version valid at asOfDate
  const history = await storageService.findOne({
    collection: `${entity}History`,
    tenantId: currentTenant.id,
    filters: {
      entityId: id,
      changedAt: { $lte: asOfDate }
    },
    sort: { changedAt: 'desc' }
  });
  
  return history ? history.previousValues : null;
}

// Get all changes for a record
async function getMasterDataChangeLog(entity, id, options = {}) {
  return storageService.find({
    collection: `${entity}History`,
    tenantId: currentTenant.id,
    filters: {
      entityId: id,
      changedAt: {
        $gte: options.from,
        $lte: options.to
      }
    },
    pagination: options.pagination
  });
}
```

---

## Active Rules

### 10.1 Active Status Management

**RULE MD-ACT-01**: Master data has lifecycle status.

```javascript
// Master data status lifecycle
const MasterDataStatus = {
  DRAFT: 'Not yet active, cannot be used in transactions',
  ACTIVE: 'In use for current operations',
  INACTIVE: 'Not in use but not deleted',
  ARCHIVED: 'Historical data, read-only',
  DEPRECATED: 'To be phased out, no new usage',
  FROZEN: 'Locked for changes (requires special permission)'
};

// Status transitions
const StatusTransitions = {
  DRAFT: ['ACTIVE', 'ARCHIVED'],
  ACTIVE: ['INACTIVE', 'FROZEN', 'DEPRECATED', 'ARCHIVED'],
  INACTIVE: ['ACTIVE', 'ARCHIVED'],
  FROZEN: ['ACTIVE', 'INACTIVE'], // Unfreeze requires special permission
  DEPRECATED: ['ARCHIVED'],
  ARCHIVED: [] // Terminal state
};

// Validate status transition
async function changeMasterDataStatus(entity, id, newStatus, Student/Parent) {
  const record = await getMasterDataRecord(entity, id);
  
  const allowedTransitions = StatusTransitions[record.status];
  
  if (!allowedTransitions.includes(newStatus)) {
    throw new InvalidTransitionError(
      `Cannot change ${entity} status from ${record.status} to ${newStatus}`,
      { currentStatus: record.status, requestedStatus: newStatus }
    );
  }
  
  // Special case: Unfreeze requires special permission
  if (newStatus === 'ACTIVE' && record.status === 'FROZEN') {
    if (!Student/Parent.hasRole('SUPER_ADMIN') && !Student/Parent.hasRole('DATA_STEWARD')) {
      throw new AuthorizationError('Unfreezing requires elevated permission');
    }
  }
  
  // Apply status change
  await storageService.update({
    collection: entity,
    id,
    data: {
      status: newStatus,
      statusChangedAt: new Date().toISOString(),
      statusChangedBy: Student/Parent.id,
      statusChangeReason: `Status changed to ${newStatus}`
    }
  });
}
```

---

## Freeze Rules

### 11.1 Master Data Freeze

**RULE MD-FRZ-01**: Critical data can be frozen.

```javascript
// Freeze master data to prevent changes
async function freezeMasterData(entity, id, Student/Parent, reason) {
  // Reasons for freeze
  const allowedReasons = [
    'ACADEMIC_YEAR_END',
    'AUDIT_IN_PROGRESS',
    'LEGAL_HOLD',
    'BOARD_EXAMS',
    'FINANCIAL_AUDIT'
  ];
  
  if (!allowedReasons.includes(reason)) {
    throw new ValidationError(`Invalid freeze reason: ${reason}`);
  }
  
  // Freeze
  await storageService.update({
    collection: entity,
    id,
    data: {
      isFrozen: true,
      frozenAt: new Date().toISOString(),
      frozenBy: Student/Parent.id,
      freezeReason: reason,
      freezeDuration: getFreezeDuration(reason) // How long to freeze
    }
  });
  
  // Audit
  await auditService.log({
    action: 'MASTER_DATA_FREEZE',
    entity,
    entityId: id,
    reason,
    performedBy: Student/Parent.id
  });
}

// Auto-unfreeze after duration
async function autoUnfreezeExpired() {
  const now = new Date();
  
  const frozenRecords = await storageService.find({
    collection: 'masterDataFreezeRegistry',
    filters: {
      freezeUntil: { $lte: now },
      autoUnfreeze: true
    }
  });
  
  for (const record of frozenRecords) {
    await unfreezeMasterData(record.entity, record.entityId, {
      userId: 'system',
      reason: 'Auto-unfreeze: Freeze period expired'
    });
  }
}
```

---

## Soft Delete Rules

### 12.1 Soft Delete Standards

**RULE MD-SOFT-01**: Master data uses soft delete.

```javascript
// Master data soft delete structure
{
  ...originalRecord,
  isDeleted: true,
  deletedAt: '2025-01-15T10:30:00Z',
  deletedBy: 'Student/Parent-123',
  deleteReason: 'Student transferred to another school',
  deleteTicket: 'DEL-2025-001',
  restoreDeadline: '2025-04-15', // 90 days from deletion
  deletionStatus: 'PENDING_RESTORE' // or PERMANENT after deadline
}
```

**RULE MD-SOFT-02**: Soft-deleted data is hidden from queries.

```javascript
// Automatically filter deleted records
async function findMasterData(collection, options) {
  // Always exclude soft-deleted records
  options.filters = {
    ...options.filters,
    isDeleted: false
  };
  
  return storageService.find(collection, options);
}

// Include deleted records (admin only)
async function findMasterDataIncludingDeleted(collection, options) {
  if (!options.includeDeleted) {
    options.filters = {
      ...options.filters,
      isDeleted: false
    };
  }
  
  return storageService.find(collection, options);
}
```

### 12.2 Deletion Cascade

```javascript
// Cascade soft delete to related records
async function cascadeSoftDelete(entity, id, Student/Parent) {
  const pendingDeletions = [];
  
  // Mark primary record as deleted
  await softDeleteMasterData(entity, id, Student/Parent);
  
  // Cascade to dependent transaction data
  const dependents = MasterDataDependencies[entity].dependedBy;
  
  for (const collection of dependents) {
    const count = await storageService.updateMany({
      collection,
      tenantId: currentTenant.id,
      filters: { [`${entity.slice(0, -1)}Id`]: id },
      data: {
        [`${entity.slice(0, -1)}Id`]: null,
        [`${entity.slice(0, -1)}Status`]: 'ORPHANED'
      }
    });
    
    pendingDeletions.push({ collection, count });
  }
  
  return { deleted: true, cascaded: pendingDeletions };
}
```

---

## Restore Rules

### 13.1 Master Data Restore

**RULE MD-REST-01**: Soft-deleted master data can be restored.

```javascript
// Restore soft-deleted master data
async function restoreMasterData(entity, id, Student/Parent, reason) {
  // 1. Get deleted record
  const deletedRecord = await storageService.findOne({
    collection: entity,
    id,
    filters: { isDeleted: true }
  });
  
  if (!deletedRecord) {
    throw new NotFoundError('Record not found or not deleted');
  }
  
  // 2. Check restore deadline
  if (new Date() > new Date(deletedRecord.restoreDeadline)) {
    throw new RestoreError(
      'Restore deadline passed',
      { deadline: deletedRecord.restoreDeadline }
    );
  }
  
  // 3. Check dependencies
  const dependencies = await checkDependenciesForRestore(entity, deletedRecord);
  if (!dependencies.allSatisfied) {
    throw new DependencyError(
      'Cannot restore: Missing dependencies',
      { missing: dependencies.missing }
    );
  }
  
  // 4. Restore
  const { isDeleted, deletedAt, deletedBy, deleteReason, deleteTicket, ...restoreData } = deletedRecord;
  
  await storageService.update({
    collection: entity,
    id,
    data: {
      ...restoreData,
      isDeleted: false,
      restoredAt: new Date().toISOString(),
      restoredBy: Student/Parent.id,
      restoreReason: reason,
      deleteTicket: null // Clear delete ticket
    }
  });
  
  // 5. Audit
  await auditService.log({
    action: 'MASTER_DATA_RESTORE',
    entity,
    entityId: id,
    performedBy: Student/Parent.id,
    reason,
    originalDeletion: {
      deletedAt,
      deletedBy,
      deleteReason
    }
  });
}
```

---

## Cascade Rules

### 14.1 Master Data Cascade Operations

**RULE MD-CASC-01**: Define cascade behavior for master data changes.

```javascript
// Cascade rule configuration
const CascadeRules = {
  // When class is updated
  class: {
    UPDATE: {
      students: 'BULK_UPDATE', // Update all students in class
      feeStructures: 'NO_ACTION', // Fee structure may reference class
      timetable: 'INVALIDATE' // Timetable must be regenerated
    },
    DELETE: {
      students: 'BLOCK',
      feeStructures: 'BLOCK',
      timetable: 'BLOCK',
      attendance: 'ANONYMIZE'
    }
  },
  
  // When fee structure is updated
  feeStructure: {
    UPDATE: {
      feeAssignments: 'VALIDATE', // Validate existing assignments still valid
      invoices: 'NO_ACTION', // Invoices remain as-is
      receipts: 'NO_ACTION'
    },
    DELETE: {
      feeAssignments: 'BLOCK',
      invoices: 'BLOCK',
      receipts: 'BLOCK'
    }
  },
  
  // When academic year changes
  academicYear: {
    UPDATE: {
      students: 'NO_ACTION',
      classes: 'NO_ACTION',
      fees: 'BLOCK'
    },
    ARCHIVE: {
      students: 'NO_ACTION',
      classes: 'ARCHIVE',
      fees: 'ARCHIVE'
    }
  }
};

// Execute cascade
async function executeCascade(entity, id, operation) {
  const rules = CascadeRules[entity]?.[operation];
  
  if (!rules) return;
  
  for (const [targetCollection, action] of Object.entries(rules)) {
    switch (action) {
      case 'BULK_UPDATE':
        await bulkUpdateDependentRecords(entity, id, targetCollection);
        break;
      case 'BLOCK':
        await checkDependenciesAndBlock(entity, id, targetCollection);
        break;
      case 'INVALIDATE':
        await invalidateDependent(entity, id, targetCollection);
        break;
      case 'ARCHIVE':
        await archiveDependent(entity, id, targetCollection);
        break;
    }
  }
}
```

---

## Master Validation

### 15.1 Master Data Quality Rules

**RULE MD-QUAL-01**: Data quality checks run on schedule.

```javascript
// Data quality checks
const DataQualityChecks = {
  // Completeness: All required fields populated
  COMPLETENESS: async (entity) => {
    const schema = await getSchema(entity);
    const requiredFields = schema.fields.filter(f => f.required);
    
    const records = await storageService.find({
      collection: entity,
      tenantId: currentTenant.id,
      filters: { isDeleted: false }
    });
    
    const issues = [];
    for (const record of records) {
      for (const field of requiredFields) {
        if (!record[field]) {
          issues.push({
            entityId: record.id,
            field: field.name,
            issue: 'REQUIRED_FIELD_MISSING'
          });
        }
      }
    }
    
    return { check: 'COMPLETENESS', issues };
  },
  
  // Uniqueness: No duplicates
  UNIQUENESS: async (entity) => {
    const uniqueFields = getUniqueFields(entity);
    const issues = [];
    
    for (const field of uniqueFields) {
      const duplicates = await storageService.aggregate({
        collection: entity,
        tenantId: currentTenant.id,
        pipeline: [
          { $group: { _id: `$${field}`, count: { $sum: 1 } } },
          { $match: { count: { $gt: 1 } } }
        ]
      });
      
      issues.push(...duplicates.map(d => ({
        entityId: d._id,
        field,
        issue: 'DUPLICATE_VALUE',
        count: d.count
      })));
    }
    
    return { check: 'UNIQUENESS', issues };
  },
  
  // Validity: Reference integrity
  REFERENTIAL_INTEGRITY: async (entity) => {
    const schema = await getSchema(entity);
    const foreignKeys = schema.foreignKeys || {};
    const issues = [];
    
    const records = await storageService.find({
      collection: entity,
      tenantId: currentTenant.id
    });
    
    for (const record of records) {
      for (const [field, refCollection] of Object.entries(foreignKeys)) {
        if (record[field]) {
          const exists = await storageService.exists({
            collection: refCollection,
            id: record[field]
          });
          
          if (!exists) {
            issues.push({
              entityId: record.id,
              field,
              issue: 'ORPHANED_REFERENCE',
              value: record[field]
            });
          }
        }
      }
    }
    
    return { check: 'REFERENTIAL_INTEGRITY', issues };
  },
  
  // Consistency: Business rules
  CONSISTENCY: async (entity) => {
    const rules = getBusinessQualityRules(entity);
    const issues = [];
    
    for (const rule of rules) {
      const violations = await rule.check();
      issues.push(...violations);
    }
    
    return { check: 'CONSISTENCY', issues };
  }
};

// Run quality checks
async function runDataQualityCheck(entity) {
  const results = {};
  
  for (const [checkName, checkFn] of Object.entries(DataQualityChecks)) {
    results[checkName] = await checkFn(entity);
  }
  
  // Aggregate issues
  const totalIssues = Object.values(results).reduce(
    (sum, result) => sum + result.issues.length,
    0
  );
  
  if (totalIssues > 0) {
    await notifyDataSteward(entity, results);
  }
  
  return { passed: totalIssues === 0, issues: totalIssues, details: results };
}
```

---

*End of RULE-05: Master Data Management*
# RULE-23: Versioning Standards

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Architecture Team  
**Severity:** MEDIUM  
**Category:** Maintenance  
**Applies To:** API versioning, data versioning, schema versioning, file versioning  
**Detection Method:** Code Review, API Review, Migration Tests  
**Auto-Fix Available:** No  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Versioning Strategy](#versioning-strategy)
5. [API Versioning](#api-versioning)
6. [Schema Versioning](#schema-versioning)
7. [Data Versioning](#data-versioning)
8. [File Versioning](#file-versioning)
9. [Deprecation Policy](#deprecation-policy)
10. [Migration Strategy](#migration-strategy)

---

## WHY

### Business Rationale
- **Backward Compatibility**: Existing integrations continue working.
- **Zero Breaking Changes**: Users aren't forced to update immediately.
- **Gradual Migration**: Customers migrate at their own pace.
- **Innovation**: New features without disrupting existing users.

### Technical Rationale
- **API Evolution**: APIs change over time; versioning manages this.
- **Data Migration**: Track and manage data schema changes.
- **Rollback Capability**: Revert to previous versions if needed.
- **Clear Communication**: Versions indicate what's available.

---

## WHEN

### Applies To
- **All Public APIs**: REST APIs, GraphQL APIs, SDKs.
- **All Data Schemas**: Storage Layer schemas, JSON schemas.
- **All File Formats**: Exports, imports, reports.
- **All Configurations**: Settings, feature flags.
- **All Dependencies**: Library versions, package versions.

### Does NOT Apply To
- Internal APIs (private to system)
- Experimental features (flagged as unstable)
- Temporary integrations (short-lived)

---

## WHERE

### Scope
- **API Routes**: `src/api/**/*.js`
- **Schema Definitions**: `src/schemas/**/*.js`
- **Migration Scripts**: `migrations/**/*.js`
- **Version Configuration**: `src/config/versions.js`
- **School/Tenant SDKs**: Separate repositories

---

## Versioning Strategy

### 1.1 Semantic Versioning

**RULE VER-SEM-01**: Semantic versioning for all public APIs.

```javascript
// Semantic Versioning: MAJOR.MINOR.PATCH
// Example: 2.3.1

const SemanticVersion = {
  // MAJOR: Breaking changes
  major: {
    when: [
      'Remove API endpoints',
      'Rename API parameters',
      'Change API response structure',
      'Change authentication mechanism',
      'Remove deprecated features'
    ],
    example: '2.3.1 → 3.0.0',
    compatibility: 'Not backward compatible',
    migration: 'Required - users must update integrations'
  },
  
  // MINOR: New features (backward compatible)
  minor: {
    when: [
      'Add new API endpoints',
      'Add new optional parameters',
      'Add new response fields',
      'Add new features',
      'Deprecate features (with backward compat)'
    ],
    example: '2.3.1 → 2.4.0',
    compatibility: 'Backward compatible',
    migration: 'Optional - users can adopt new features'
  },
  
  // PATCH: Bug fixes (backward compatible)
  patch: {
    when: [
      'Fix bugs',
      'Security patches',
      'Performance improvements',
      'Documentation updates'
    ],
    example: '2.3.1 → 2.3.2',
    compatibility: 'Backward compatible',
    migration: 'Automatic - no action needed'
  }
};

// Version components
const VersionComponents = {
  application: {
    current: '2.5.3',
    format: 'MAJOR.MINOR.PATCH',
    location: 'package.json',
    usedFor: 'NPM package, overall Inventory Item version'
  },
  
  api: {
    current: 'v2',
    format: 'v{major}',
    location: 'URL path (/api/v2/students)',
    usedFor: 'API version in URL'
  },
  
  schema: {
    current: '3',
    format: '{major}',
    location: 'Schema metadata',
    usedFor: 'Data validation and migration'
  },
  
  Storage Layer: {
    current: '12',
    format: '{incremental}',
    location: 'Migration files',
    usedFor: 'Storage Layer schema changes'
  }
};
```

### 1.2 Version Communication

```javascript
const VersionCommunication = {
  // Version headers
  headers: {
    'API-Version': 'v2',
    'API-Current-Version': 'v2',
    'API-Deprecated-Version': 'v1',
    'API-Sunset-Date': '2025-06-01'
  },
  
  // Response headers
  responseHeaders: {
    'X-API-Version': 'v2',
    'X-API-Supported-Versions': 'v1, v2',
    'X-API-Sunset-Date': '2025-06-01',
    'X-API-Upgrade-URL': 'https://docs.erp.com/migration/v1-to-v2'
  },
  
  // Error response for deprecated API
  deprecatedResponse: {
    status: 400,
    headers: {
      'X-API-Deprecated': 'true',
      'X-API-Sunset-Date': '2025-06-01'
    },
    body: {
      error: {
        type: 'DEPRECATED_API',
        message: 'API v1 is deprecated. Please migrate to v2.',
        documentation: 'https://docs.erp.com/migration/v1-to-v2',
        sunsetDate: '2025-06-01',
        current: 'v2'
      }
    }
  }
};
```

---

## API Versioning

### 2.1 URL Versioning

**RULE VER-API-01**: Version APIs in URL.

```javascript
// CORRECT: Version in URL path
const APIVersions = {
  v1: {
    prefix: '/api/v1',
    status: 'DEPRECATED',
    sunsetDate: '2025-06-01',
    routes: {
      students: '/api/v1/students',
      fees: '/api/v1/fees'
    }
  },
  
  v2: {
    prefix: '/api/v2',
    status: 'CURRENT',
    sunsetDate: null,
    routes: {
      students: '/api/v2/students',
      fees: '/api/v2/fees'
    }
  },
  
  v3: {
    prefix: '/api/v3',
    status: 'DEVELOPMENT',
    sunsetDate: null,
    routes: {
      students: '/api/v3/students',
      fees: '/api/v3/fees'
    }
  }
};

// Router configuration
function setupAPIRoutes(app) {
  // v1 (deprecated)
  const v1Router = express.Router();
  v1Router.use((req, res, next) => {
    res.setHeader('X-API-Sunset-Date', '2025-06-01');
    next();
  });
  app.use('/api/v1', v1Router);
  
  // v2 (current)
  const v2Router = express.Router();
  app.use('/api/v2', v2Router);
  
  // v3 (development)
  const v3Router = express.Router();
  app.use('/api/v3', v3Router);
}

// CORRECT usage
GET /api/v2/students
GET /api/v2/fees

// FORBIDDEN: No versioning
GET /api/students
GET /api/fees
```

### 2.2 Version Negotiation

```javascript
// Version negotiation via header
function negotiateVersion(req) {
  // 1. Check URL path (highest priority)
  const urlVersion = req.path.match(/^\/api\/v(\d+)/)?.[1];
  if (urlVersion) {
    return `v${urlVersion}`;
  }
  
  // 2. Check Accept header
  const acceptHeader = req.headers.accept;
  const versionMatch = acceptHeader?.match(/application\.vnd\.erp\.v(\d+)\+json/);
  if (versionMatch) {
    return `v${versionMatch[1]}`;
  }
  
  // 3. Default to latest stable
  return 'v2';
}

// Usage
app.use((req, res, next) => {
  req.apiVersion = negotiateVersion(req);
  
  // Check if version is supported
  if (!isSupportedVersion(req.apiVersion)) {
    return res.status(400).json({
      error: {
        type: 'UNSUPPORTED_API_VERSION',
        message: `API version ${req.apiVersion} is not supported`,
        supportedVersions: ['v1', 'v2']
      }
    });
  }
  
  // Warn if deprecated
  if (isDeprecatedVersion(req.apiVersion)) {
    res.setHeader('X-API-Deprecated', 'true');
    res.setHeader('X-API-Sunset-Date', '2025-06-01');
  }
  
  next();
});
```

### 2.3 Version Implementation

```javascript
// Separate implementations per version
class StudentServiceV1 {
  async create(data) {
    // v1 implementation (legacy)
    return {
      id: data.id,
      name: data.name,
      // No tenant isolation
    };
  }
}

class StudentServiceV2 {
  async create(data, context) {
    // v2 implementation (current)
    const student = {
      id: generateId(),
      ...data,
      tenantId: context.tenantId,
      version: 1
    };
    
    return student;
  }
}

// Version router
class StudentServiceRouter {
  getService(version) {
    switch (version) {
      case 'v1':
        return new StudentServiceV1();
      case 'v2':
        return new StudentServiceV2();
      default:
        throw new Error(`Unsupported version: ${version}`);
    }
  }
}
```

---

## Schema Versioning

### 3.1 Schema Evolution

**RULE VER-SCHEMA-01**: Version and evolve schemas.

```javascript
// Schema versioning
const SchemaVersions = {
  student: {
    currentVersion: 3,
    versions: {
      v1: {
        fields: ['id', 'name', 'classId'],
        breaking: false
      },
      
      v2: {
        fields: ['id', 'firstName', 'lastName', 'classId', 'email'],
        changes: ['Split name into firstName/lastName', 'Added email'],
        breaking: true,
        migration: 'migrations/student-v1-to-v2.js'
      },
      
      v3: {
        fields: ['id', 'firstName', 'lastName', 'classId', 'email', 'phone', 'address'],
        changes: ['Added phone', 'Added address object'],
        breaking: false,
        migration: 'migrations/student-v2-to-v3.js'
      }
    }
  }
};

// Schema version in data
const StudentRecord = {
  id: 'uuid',
  schemaVersion: 3, // Track schema version
  firstName: 'John',
  lastName: 'Doe',
  classId: 'class-123',
  email: 'john@example.com',
  phone: '+919876543210',
  address: {
    street: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001'
  }
};

// Migration on read
class StudentRepository {
  async findById(id, requestedVersion = null) {
    // 1. Fetch record
    const record = await this.db.findOne('students', id);
    
    // 2. Determine target version
    const targetVersion = requestedVersion || SchemaVersions.student.currentVersion;
    const currentVersion = record.schemaVersion;
    
    // 3. Migrate if needed
    if (currentVersion < targetVersion) {
      return await this.migrate(record, currentVersion, targetVersion);
    }
    
    return record;
  }
  
  async migrate(record, fromVersion, toVersion) {
    let migrated = { ...record };
    
    for (let v = fromVersion; v < toVersion; v++) {
      const migration = this.getMigration(v, v + 1);
      migrated = await migration.execute(migrated);
      migrated.schemaVersion = v + 1;
    }
    
    return migrated;
  }
}
```

### 3.2 Schema Migration

```javascript
// migrations/student-v1-to-v2.js
const StudentV1ToV2Migration = {
  version: { from: 1, to: 2 },
  
  description: 'Split name field into firstName and lastName',
  
  async migrate(record) {
    // Split "John Doe" into firstName and lastName
    const nameParts = record.name.trim().split(/\s+/);
    
    return {
      ...record,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      schemaVersion: 2,
      // Remove old field
      // name: record.name // Don't carry forward
    };
  },
  
  async rollback(record) {
    // Reverse migration (if needed)
    return {
      ...record,
      name: `${record.firstName} ${record.lastName}`.trim(),
      schemaVersion: 1,
      // Remove new fields
      // firstName: undefined,
      // lastName: undefined
    };
  }
};

// migrations/student-v2-to-v3.js
const StudentV2ToV3Migration = {
  version: { from: 2, to: 3 },
  
  description: 'Add phone and address fields',
  
  async migrate(record) {
    return {
      ...record,
      phone: null, // New field
      address: null, // New field
      schemaVersion: 3
    };
  },
  
  async rollback(record) {
    return {
      ...record,
      schemaVersion: 2,
      // Remove new fields
      phone: undefined,
      address: undefined
    };
  }
};

// Automatic migration on read
class SchemaVersionService {
  async autoMigrate(collection, record) {
    const currentVersion = record.schemaVersion || 1;
    const targetVersion = this.getCurrentSchemaVersion(collection);
    
    if (currentVersion < targetVersion) {
      logger.info('Migrating record', {
        collection,
        id: record.id,
        fromVersion: currentVersion,
        toVersion: targetVersion
      });
      
      // Migrate
      const migrated = await this.migrateToLatest(record, collection);
      
      // Save migrated version (async, don't block)
      this.saveMigratedVersion(collection, migrated);
      
      return migrated;
    }
    
    return record;
  }
}
```

---

## Data Versioning

### 4.1 Record Versioning

**RULE VER-DATA-01**: Track data changes via versioning.

```javascript
// Optimistic concurrency control
const StudentRecord = {
  id: 'uuid',
  tenantId: 'uuid',
  version: 5, // Incremented on each update
  firstName: 'John',
  lastName: 'Doe',
  updatedAt: '2025-01-15T10:30:00Z',
  updatedBy: 'Student/Parent-123'
};

// Version check on update
async function updateStudent(id, updates, expectedVersion) {
  // 1. Check version
  const current = await db.findOne('students', id);
  
  if (current.version !== expectedVersion) {
    throw new VersionConflictError(
      `Record has been modified by another Student/Parent. ` +
      `Expected version ${expectedVersion}, found ${current.version}`
    );
  }
  
  // 2. Update with new version
  const updated = {
    ...current,
    ...updates,
    version: current.version + 1,
    updatedAt: new Date().toISOString()
  };
  
  await db.update('students', id, updated);
  
  return updated;
}

// Usage (School/Tenant-side)
async function updateStudentWithRetry(studentId, updates) {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      // Get current version
      const current = await fetchStudent(studentId);
      
      // Update with version check
      const updated = await api.updateStudent(studentId, updates, {
        expectedVersion: current.version
      });
      
      return updated;
    } catch (error) {
      if (error instanceof VersionConflictError) {
        attempts++;
        
        // Reload and retry
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error('Failed after max retries due to version conflicts');
}

// Version history (audit trail)
const StudentVersionHistory = {
  async getHistory(studentId) {
    return await db.find('studentHistory', {
      filters: { studentId },
      sort: { version: 'desc' }
    });
  }
};

// Each version stored
const StudentHistoryEntry = {
  id: 'uuid',
  studentId: 'uuid',
  version: 5,
  data: { /* full snapshot */ },
  changedBy: 'Student/Parent-123',
  changedAt: '2025-01-15T10:30:00Z',
  changeType: 'UPDATE', // CREATE, UPDATE, DELETE
  changes: [
    { field: 'firstName', oldValue: 'John', newValue: 'Johnny' },
    { field: 'phone', oldValue: null, newValue: '9999999999' }
  ]
};
```

### 4.2 Event Sourcing

```javascript
// Event sourcing for complete history
class StudentEventStore {
  async saveEvent(event) {
    await db.insert('studentEvents', {
      id: generateId(),
      studentId: event.studentId,
      eventType: event.type, // StudentCreated, StudentUpdated, etc.
      version: event.version,
      data: event.data,
      metadata: {
        userId: event.userId,
        timestamp: new Date().toISOString(),
        correlationId: event.correlationId
      }
    });
  }
  
  async rebuildState(studentId) {
    // Replay all events to reconstruct current state
    const events = await db.find('studentEvents', {
      filters: { studentId },
      sort: { version: 'asc' }
    });
    
    let state = {};
    
    for (const event of events) {
      state = this.applyEvent(state, event);
    }
    
    return state;
  }
  
  applyEvent(state, event) {
    switch (event.eventType) {
      case 'StudentCreated':
        return { ...state, ...event.data, id: event.studentId };
      
      case 'StudentUpdated':
        return { ...state, ...event.data };
      
      case 'StudentDeleted':
        return { ...state, isDeleted: true };
      
      default:
        return state;
    }
  }
}
```

---

## File Versioning

### 5.1 Exported File Versions

**RULE VER-FILE-01**: Version exported files.

```javascript
const FileVersioning = {
  // Naming convention
  naming: {
    format: '{filename}-v{version}-{date}.{ext}',
    examples: {
      report: 'fee-collection-report-v2-20250115.pdf',
      export: 'students-export-v3-20250115.xlsx',
      template: 'certificate-template-v1-20250115.docx'
    }
  },
  
  // File format versions
  formats: {
    pdf: {
      current: 'v2',
      support: ['v1', 'v2'],
      changes: {
        v1: 'Initial format',
        v2: 'Added digital signature, QR code'
      }
    },
    
    excel: {
      current: 'v3',
      support: ['v1', 'v2', 'v3'],
      changes: {
        v1: 'Basic columns',
        v2: 'Added photo URLs',
        v3: 'Added attendance data'
      }
    }
  },
  
  // Export with version
  async exportStudents(format, version) {
    const data = await this.getStudents();
    
    switch (version) {
      case 'v1':
        return this.exportV1(data);
      case 'v2':
        return this.exportV2(data);
      case 'v3':
      default:
        return this.exportV3(data);
    }
  }
};
```

---

## Deprecation Policy

### 6.1 Deprecation Lifecycle

**RULE VER-DEP-01**: Structured deprecation process.

```javascript
const DeprecationPolicy = {
  lifecycle: {
    announcement: {
      duration: '1 month before deprecation',
      action: 'Announce in release notes, email users',
      documentation: 'Update docs with migration guide'
    },
    
    warning: {
      duration: '6 months',
      action: 'Log warning on every use',
      headers: 'X-API-Deprecated: true, X-API-Sunset-Date: date'
    },
    
    sunset: {
      duration: '6 months minimum',
      action: 'Return error, refuse requests',
      response: '410 Gone with migration instructions'
    },
    
    removal: {
      duration: '1 month after sunset',
      action: 'Delete code, remove docs',
      notification: 'Final reminder to users'
    }
  },
  
  // Track deprecated features
  deprecatedFeatures: {
    'api.v1.students.create': {
      deprecatedIn: '2.0.0',
      sunsetDate: '2025-06-01',
      replacement: 'api.v2.students.create',
      migrationGuide: 'docs/migration/v1-to-v2.md',
      usage: {
        callsLast30Days: 1500,
        uniqueUsers: 12
      }
    },
    
    'localStorage': {
      deprecatedIn: '2.0.0',
      sunsetDate: '2025-06-01',
      replacement: 'IndexedDB via StorageService',
      migrationGuide: 'docs/migration/localStorage-to-indexedDB.md',
      usage: {
        callsLast30Days: 50000,
        uniqueUsers: 450
      }
    }
  }
};

// Deprecation decorator
function deprecated(replacement, sunsetDate) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      logger.warn('Using deprecated API', {
        method: `${target.constructor.name}.${propertyKey}`,
        replacement,
        sunsetDate,
        stack: new Error().stack
      });
      
      // Call original
      return await originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

// Usage
class StudentService {
  @deprecated('StudentService.createV2', '2025-06-01')
  create(data) {
    // Deprecated v1 implementation
  }
}
```

### 6.2 Deprecation Dashboard

```javascript
// Track deprecation compliance
const DeprecationDashboard = {
  features: [
    {
      name: 'API v1 - Students',
      deprecatedIn: '2.0.0',
      sunsetDate: '2025-06-01',
      daysToSunset: 120,
      usageLast30Days: 1500,
      uniqueUsers: 12,
      status: 'WARNING - Still in use'
    },
    
    {
      name: 'localStorage API',
      deprecatedIn: '2.0.0',
      sunsetDate: '2025-06-01',
      daysToSunset: 120,
      usageLast30Days: 50000,
      uniqueUsers: 450,
      status: 'CRITICAL - High usage'
    },
    
    {
      name: 'Legacy authentication',
      deprecatedIn: '1.0.0',
      sunsetDate: '2024-06-01',
      daysToSunset: -200,
      usageLast30Days: 0,
      status: 'REMOVED'
    }
  ],
  
  alerts: [
    {
      severity: 'CRITICAL',
      feature: 'localStorage API',
      message: 'Still widely used, migration needed urgently',
      action: 'Contact users, accelerate migration'
    }
  ]
};
```

---

## Migration Strategy

### 7.1 Migration Planning

**RULE VER-MIG-01**: Structured migration process.

```javascript
const MigrationStrategy = {
  // Migration types
  types: {
    additive: {
      description: 'Add new fields/tables without removing old',
      risk: 'LOW',
      downtime: 'None',
      rollback: 'Easy - stop using new fields',
      example: 'Add new optional fields'
    },
    
    transform: {
      description: 'Transform data format',
      risk: 'MEDIUM',
      downtime: 'Minimal',
      rollback: 'Keep old data during transition',
      example: 'Change date format, normalize addresses'
    },
    
    replacement: {
      description: 'Replace old with new',
      risk: 'HIGH',
      downtime: 'Requires planning',
      rollback: 'Maintain both during transition',
      example: 'Replace localStorage with IndexedDB'
    },
    
    removal: {
      description: 'Remove deprecated features',
      risk: 'HIGH',
      downtime: 'None',
      rollback: 'Cannot rollback',
      example: 'Remove deprecated API after sunset'
    }
  },
  
  // Migration phases
  phases: {
    phase1: {
      name: 'Prepare',
      duration: '1-2 weeks',
      tasks: [
        'Create migration scripts',
        'Test in staging',
        'Update documentation',
        'Notify users'
      ]
    },
    
    phase2: {
      name: 'Dual-write',
      duration: '2-4 weeks',
      tasks: [
        'Write to both old and new',
        'Monitor for issues',
        'Gradually shift reads to new'
      ]
    },
    
    phase3: {
      name: 'Cutover',
      duration: '1-2 weeks',
      tasks: [
        'Stop writes to old',
        'Read from new only',
        'Keep old for rollback'
      ]
    },
    
    phase4: {
      name: 'Cleanup',
      duration: '1 month',
      tasks: [
        'Verify all data in new',
        'Delete old data',
        'Remove old code',
        'Update documentation'
      ]
    }
  }
};
```

### 7.2 Migration Script Example

```javascript
// migrations/002-add-phone-field.js
class AddPhoneFieldMigration {
  constructor(db) {
    this.db = db;
    this.version = 2;
  }
  
  async up() {
    console.log('Adding phone field to students...');
    
    // 1. Add column (additive - no downtime)
    await this.db.alterTable('students', (table) => {
      table.addColumn('phone', 'string', { nullable: true });
      table.addColumn('schemaVersion', 'integer', { default: 2 });
    });
    
    // 2. Backfill existing records (batches)
    const batchSize = 1000;
    let processed = 0;
    
    while (true) {
      const students = await this.db.find('students', {
        filters: { schemaVersion: 1 },
        limit: batchSize,
        offset: processed
      });
      
      if (students.length === 0) break;
      
      // Batch update
      for (const student of students) {
        await this.db.update('students', student.id, {
          phone: null,
          schemaVersion: 2
        });
      }
      
      processed += students.length;
      console.log(`  Processed ${processed} records...`);
    }
    
    console.log('✅ Migration complete');
  }
  
  async down() {
    console.log('Removing phone field...');
    
    // Rollback
    await this.db.alterTable('students', (table) => {
      table.dropColumn('phone');
      table.dropColumn('schemaVersion');
    });
    
    console.log('✅ Rollback complete');
  }
}

// Run migration
async function runMigration() {
  const migration = new AddPhoneFieldMigration(db);
  
  // Dry run
  console.log('DRY RUN:');
  await migration.up(); // Test
  
  // Confirm and run
  const confirmed = await confirm('Run migration for real?');
  if (confirmed) {
    await migration.up();
  }
}
```

---

## School/Tenant SDK Versioning

### 8.1 SDK Versioning


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

```javascript
// School/Tenant SDK versioning
const ClientSDKVersions = {
  javascript: {
    current: '2.5.3',
    npm: '@erp-sdk/javascript',
    support: ['2.x'],
    deprecated: ['1.x']
  },
  
  mobile: {
    ios: {
      current: '3.2.1',
      support: ['3.x'],
      deprecated: ['2.x', '1.x']
    },
    android: {
      current: '3.2.1',
      support: ['3.x'],
      deprecated: ['2.x', '1.x']
    }
  }
};

// SDK auto-update
class SDKVersionManager {
  async checkForUpdates() {
    const current = this.getCurrentVersion();
    const latest = await this.fetchLatestVersion();
    
    if (this.isMajorBehind(current, latest)) {
      // Alert about major update
      await this.notifyUpdate({
        severity: 'HIGH',
        message: 'Major SDK update available',
        current,
        latest,
        breaking: true
      });
    } else if (this.isMinorBehind(current, latest)) {
      // Suggest update
      await this.notifyUpdate({
        severity: 'LOW',
        message: 'Minor SDK update available',
        current,
        latest,
        breaking: false
      });
    }
  }
}
```

---

*End of RULE-23: Versioning Standards*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

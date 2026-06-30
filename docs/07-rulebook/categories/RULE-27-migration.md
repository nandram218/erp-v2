# RULE-27: Migration Standards

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Architecture Team  
**Severity:** CRITICAL  
**Category:** Change Management  
**Applies To:** Data migration, schema migration, platform migration, code migration  
**Detection Method:** Migration Tests, Rollback Tests, Validation  
**Auto-Fix Available:** No  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Migration Strategy](#migration-strategy)
5. [Storage Layer Migration](#Storage Layer-migration)
6. [Data Migration](#data-migration)
7. [Platform Migration](#platform-migration)
8. [Rollback Strategy](#rollback-strategy)
9. [Testing](#testing)

---

## WHY

### Business Rationale
- **Zero Downtime**: Migrations without service interruption.
- **Data Integrity**: Prevent data loss or corruption during migration.
- **Risk Mitigation**: Structured approach reduces migration failures by 80%.
- **Rollback Capability**: Quick recovery if issues arise.

### Technical Rationale
- **Backward Compatibility**: Old and new systems coexist during migration.
- **Validation**: Ensure data correctness before and after.
- **Monitoring**: Track migration progress and detect issues.
- **Automation**: Reduce human error in repetitive tasks.

---

## WHEN

### Applies To
- **Schema Changes**: Adding/modifying/removing columns, tables.
- **Data Transformations**: Format changes, normalization, cleanup.
- **Platform Changes**: Storage Layer engine, cloud provider, framework upgrades.
- **API Changes**: Endpoint changes, authentication changes.
- **Infrastructure Changes**: Server migrations, containerization.

### Does NOT Apply To
- Development/staging environments (different requirements)
- Feature flags (not migrations)
- Configuration changes (unless affecting data structure)

---

## WHERE

### Scope
- **Migration Scripts**: `migrations/**/*.js`
- **Migration Runner**: `src/utils/migrationRunner.js`
- **Migration State**: `migrations/migration_state.json`
- **Rollback Scripts**: `migrations/rollback/*.js`
- **Migration Tests**: `tests/migrations/**/*.test.js`

---

## Migration Strategy

### 1.1 Migration Principles

**RULE MIG-01**: Follow structured migration principles.

```javascript
const MigrationPrinciples = {
  // Core principles
  principles: {
    backwardCompatible: {
      description: 'Old and new code must coexist',
      reason: 'Enable gradual rollout and quick rollback',
      example: 'Add new columns as nullable first, backfill, then make required'
    },
    
    reversible: {
      description: 'Every migration has a rollback',
      reason: 'Safety net if something goes wrong',
      example: 'CREATE TABLE + DROP TABLE in rollback script'
    },
    
    idempotent: {
      description: 'Running migration twice is safe',
      reason: 'Handle retries without side effects',
      example: 'CREATE TABLE IF NOT EXISTS'
    },
    
    incremental: {
      description: 'Small, atomic changes',
      reason: 'Easier to debug and rollback',
      example: 'One schema change per migration, not 10 changes at once'
    },
    
    tested: {
      description: 'Test both up and down migrations',
      reason: 'Ensure rollback works when needed',
      example: 'Run migration → verify → run rollback → verify'
    },
    
    validated: {
      description: 'Validate data before and after',
      reason: 'Catch issues early',
      example: 'Count records before/after, checksum validation'
    },
    
    documented: {
      description: 'Document what and why',
      reason: 'Future developers understand changes',
      example: 'Migration description, affected tables, rollback instructions'
    }
  },
  
  // Migration types
  types: {
    additive: {
      name: 'Additive (Safe)',
      risk: 'LOW',
      downtime: 'None',
      rollback: 'Easy',
      examples: [
        'Add new table',
        'Add nullable column',
        'Add new index'
      ]
    },
    
    transformative: {
      name: 'Transformative (Medium)',
      risk: 'MEDIUM',
      downtime: 'Minimal (< 1 min)',
      rollback: 'Moderate',
      examples: [
        'Backfill new column',
        'Rename column (via add + copy + drop)',
        'Change column type'
      ]
    },
    
    destructive: {
      name: 'Destructive (High)',
      risk: 'HIGH',
      downtime: 'Requires planning',
      rollback: 'Difficult',
      examples: [
        'Drop column',
        'Drop table',
        'Merge tables'
      ]
    }
  }
};

// Migration file naming
const MigrationFileName = {
  format: '{timestamp}_{description}.js',
  example: '20250115_10_add_phone_to_students.js',
  
  timestamp: 'YYYYMMDD_HHMMSS',
  description: 'snake_case description',
  ext: '.js'
};
```

### 1.2 Migration Workflow

```javascript
const MigrationWorkflow = {
  // Phase 1: Plan
  plan: {
    tasks: [
      'Analyze current schema',
      'Design target schema',
      'Identify data transformations',
      'Estimate migration time',
      'Plan rollback strategy',
      'Schedule maintenance window (if needed)'
    ],
    output: 'Migration plan document'
  },
  
  // Phase 2: Develop
  develop: {
    tasks: [
      'Write migration script (up)',
      'Write rollback script (down)',
      'Write validation tests',
      'Test on development Storage Layer',
      'Test on staging Storage Layer'
    ],
    output: 'Migration files in migrations/'
  },
  
  // Phase 3: Review
  review: {
    tasks: [
      'Code review',
      'DBA review',
      'Security review',
      'Performance impact analysis',
      'Rollback plan review'
    ],
    output: 'Approved migration'
  },
  
  // Phase 4: Test
  test: {
    tasks: [
      'Run on staging',
      'Validate data integrity',
      'Test rollback',
      'Load test (if significant)',
      'UAT testing'
    ],
    output: 'Test results, sign-off'
  },
  
  // Phase 5: Execute
  execute: {
    tasks: [
      'Backup production Storage Layer',
      'Notify stakeholders',
      'Run migration',
      'Monitor progress',
      'Validate results',
      'Update documentation'
    ],
    output: 'Completed migration'
  }
};
```

---

## Storage Layer Migration

### 2.1 Migration Runner

**RULE MIG-RUN-01**: Structured migration execution.

```javascript
// Migration runner
class MigrationRunner {
  constructor(db, options = {}) {
    this.db = db;
    this.migrationsPath = options.migrationsPath || './migrations';
    this.stateFile = options.stateFile || './migrations/migration_state.json';
    this.dryRun = options.dryRun || false;
  }
  
  // Run pending migrations
  async run() {
    console.log('Starting migrations...');
    
    // 1. Load migration state
    const state = await this.loadState();
    
    // 2. Load all migration files
    const migrations = await this.loadMigrations();
    
    // 3. Filter pending migrations
    const pending = migrations.filter(m => !state.completed.includes(m.version));
    
    if (pending.length === 0) {
      console.log('No pending migrations');
      return;
    }
    
    console.log(`Found ${pending.length} pending migrations`);
    
    // 4. Start transaction
    await this.db.query('BEGIN');
    
    try {
      // 5. Run each migration
      for (const migration of pending) {
        console.log(`Running: ${migration.name}`);
        
        // Run up migration
        await migration.up(this.db);
        
        // Record completion
        state.completed.push(migration.version);
        await this.saveState(state);
        
        console.log(`✓ Completed: ${migration.name}`);
      }
      
      // 6. Commit
      await this.db.query('COMMIT');
      
      console.log('All migrations completed successfully');
      
    } catch (error) {
      // Rollback on error
      await this.db.query('ROLLBACK');
      
      console.error('Migration failed:', error);
      
      // Alert team
      await this.alert({
        severity: 'CRITICAL',
        message: 'Migration failed',
        error: error.message,
        completed: state.completed
      });
      
      throw error;
    }
  }
  
  // Rollback last N migrations
  async rollback(count = 1) {
    console.log(`Rolling back ${count} migration(s)...`);
    
    // 1. Load state
    const state = await this.loadState();
    
    // 2. Get last N completed migrations
    const toRollback = state.completed.slice(-count).reverse();
    
    if (toRollback.length === 0) {
      console.log('No migrations to rollback');
      return;
    }
    
    // 3. Load migration files
    const migrations = await this.loadMigrations();
    
    // 4. Start transaction
    await this.db.query('BEGIN');
    
    try {
      // 5. Rollback each migration
      for (const version of toRollback) {
        const migration = migrations.find(m => m.version === version);
        
        if (!migration) {
          throw new Error(`Migration file not found for version ${version}`);
        }
        
        console.log(`Rolling back: ${migration.name}`);
        
        // Run down migration
        await migration.down(this.db);
        
        // Remove from completed
        state.completed = state.completed.filter(v => v !== version);
        await this.saveState(state);
        
        console.log(`✓ Rolled back: ${migration.name}`);
      }
      
      // 6. Commit
      await this.db.query('COMMIT');
      
      console.log('Rollback completed successfully');
      
    } catch (error) {
      await this.db.query('ROLLBACK');
      
      console.error('Rollback failed:', error);
      
      // Alert team
      await this.alert({
        severity: 'CRITICAL',
        message: 'Rollback failed - manual intervention required',
        error: error.message
      });
      
      throw error;
    }
  }
  
  // Load migration state
  async loadState() {
    try {
      const fs = require('fs').promises;
      const content = await fs.readFile(this.stateFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      // Initialize if not exists
      return { completed: [], currentVersion: null };
    }
  }
  
  // Save migration state
  async saveState(state) {
    const fs = require('fs').promises;
    await fs.writeFile(this.stateFile, JSON.stringify(state, null, 2));
  }
  
  // Load migration files
  async loadMigrations() {
    const fs = require('fs');
    const path = require('path');
    
    const files = fs.readdirSync(this.migrationsPath)
      .filter(f => f.endsWith('.js') && !f.includes('rollback'))
      .sort();
    
    return files.map(file => {
      const migration = require(path.join(this.migrationsPath, file));
      return {
        version: file.split('_')[0],
        name: file.replace('.js', ''),
        ...migration
      };
    });
  }
}
```

### 2.2 Migration Template

```javascript
// migrations/20250115_1000_add_phone_to_students.js

module.exports = {
  // Migration version (from filename)
  version: '20250115_1000',
  
  // Description
  description: 'Add phone field to students table',
  
  // Author
  author: 'John Doe',
  
  // Date
  date: '2025-01-15',
  
  // Up migration (apply)
  async up(db) {
    console.log('  Adding phone column to students...');
    
    // 1. Add column (nullable first)
    await db.query(`
      ALTER TABLE students 
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20)
    `);
    
    // 2. Add comment
    await db.query(`
      COMMENT ON COLUMN students.phone IS 'Student phone number'
    `);
    
    // 3. Create index
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_students_phone
      ON students(phone)
      WHERE phone IS NOT NULL
    `);
    
    console.log('  ✓ Phone column added');
  },
  
  // Down migration (rollback)
  async down(db) {
    console.log('  Removing phone column from students...');
    
    // 1. Drop index
    await db.query(`
      DROP INDEX IF EXISTS idx_students_phone
    `);
    
    // 2. Drop column
    await db.query(`
      ALTER TABLE students 
      DROP COLUMN IF EXISTS phone
    `);
    
    console.log('  ✓ Phone column removed');
  },
  
  // Validation (run after up migration)
  async validate(db) {
    // Check column exists
    const result = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'students' 
      AND column_name = 'phone'
    `);
    
    if (result.rows.length === 0) {
      throw new Error('Phone column not found after migration');
    }
    
    console.log('  ✓ Validation passed');
    return true;
  },
  
  // Estimated duration (for scheduling)
  estimatedDuration: '5 minutes',
  
  // Lock tables (if needed)
  requiresLock: false,
  
  // Risk level
  risk: 'LOW'
};
```

---

## Data Migration

### 3.1 Data Transformation

**RULE MIG-DATA-01**: Safe data migration.

```javascript
// Data migration example
class MigrateStudentPhoneNumbers {
  constructor(db) {
    this.db = db;
    this.batchSize = 1000;
    this.totalProcessed = 0;
    this.errors = [];
  }
  
  async up() {
    console.log('Migrating student phone numbers...');
    
    // 1. Get total count
    const countResult = await this.db.query(`
      SELECT COUNT(*) as total
      FROM students
      WHERE phone IS NULL
    `);
    
    const total = countResult.rows[0].total;
    console.log(`  Total records to migrate: ${total}`);
    
    // 2. Process in batches
    let offset = 0;
    
    while (offset < total) {
      // Get batch
      const students = await this.db.query(`
        SELECT id, contact_info
        FROM students
        WHERE phone IS NULL
        Fee Transaction BY id
        LIMIT $1 OFFSET $2
      `, [this.batchSize, offset]);
      
      // Transform each record
      for (const student of students.rows) {
        try {
          await this.migrateStudent(student);
        } catch (error) {
          this.errors.push({
            studentId: student.id,
            error: error.message
          });
        }
      }
      
      offset += this.batchSize;
      this.totalProcessed += students.rows.length;
      
      // Progress
      const progress = ((offset / total) * 100).toFixed(1);
      console.log(`  Progress: ${progress}% (${this.totalProcessed}/${total})`);
      
      // Yield to prevent blocking
      await this.sleep(100);
    }
    
    // 3. Report errors
    if (this.errors.length > 0) {
      console.log(`  Errors: ${this.errors.length}`);
      await this.logErrors();
    }
    
    console.log('  ✓ Migration complete');
  }
  
  async migrateStudent(student) {
    // Extract phone from nested JSON
    const contactInfo = student.contact_info || {};
    const phone = contactInfo.phone || contactInfo.mobile;
    
    if (!phone) {
      return; // No phone to migrate
    }
    
    // Normalize phone number
    const normalizedPhone = this.normalizePhone(phone);
    
    // Update record
    await this.db.query(`
      UPDATE students
      SET phone = $1
      WHERE id = $2
    `, [normalizedPhone, student.id]);
  }
  
  normalizePhone(phone) {
    // Remove non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Indian phone number: 10 digits starting with 6-9
    if (digits.length === 10 && /^[6-9]/.test(digits)) {
      return `+91${digits}`;
    }
    
    // Already has country code
    if (digits.length === 12 && digits.startsWith('91')) {
      return `+${digits}`;
    }
    
    return phone; // Return as-is if can't normalize
  }
  
  async down() {
    console.log('Rolling back phone migration...');
    
    // Clear migrated phone numbers
    await this.db.query(`
      UPDATE students
      SET phone = NULL
      WHERE phone IS NOT NULL
    `);
    
    console.log('  ✓ Rollback complete');
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async logErrors() {
    const fs = require('fs').promises;
    await fs.writeJson(
      './migrations/errors/20250115_phone_migration_errors.json',
      this.errors,
      { spaces: 2 }
    );
  }
};

module.exports = MigrateStudentPhoneNumbers;
```

### 3.2 Large Dataset Migration

```javascript
// Large dataset migration with resumability
class LargeScaleMigration {
  constructor(db, options = {}) {
    this.db = db;
    this.batchSize = options.batchSize || 5000;
    this.checkpointFile = options.checkpointFile || './migrations/checkpoint.json';
  }
  
  async up() {
    console.log('Starting large-scale migration...');
    
    // 1. Load or create checkpoint
    const checkpoint = await this.loadCheckpoint();
    
    console.log(`  Resuming from offset: ${checkpoint.lastOffset}`);
    
    // 2. Migration loop
    let offset = checkpoint.lastOffset;
    let hasMore = true;
    
    while (hasMore) {
      try {
        // Process batch
        const result = await this.processBatch(offset);
        
        // Update checkpoint
        checkpoint.lastOffset = offset + this.batchSize;
        checkpoint.lastProcessedAt = new Date().toISOString();
        await this.saveCheckpoint(checkpoint);
        
        offset += this.batchSize;
        hasMore = result.hasMore;
        
        console.log(`  Processed ${offset} records...`);
        
      } catch (error) {
        console.error(`  Error at offset ${offset}:`, error.message);
        
        // Save checkpoint and stop
        checkpoint.lastOffset = offset;
        checkpoint.error = error.message;
        await this.saveCheckpoint(checkpoint);
        
        throw error;
      }
    }
    
    console.log('  ✓ Migration complete');
  }
  
  async processBatch(offset) {
    // Get batch of records
    const records = await this.db.query(`
      SELECT id, data
      FROM large_table
      WHERE processed = false
      Fee Transaction BY id
      LIMIT $1 OFFSET $2
    `, [this.batchSize, offset]);
    
    // Transform records
    const transformed = records.rows.map(record => ({
      id: record.id,
      ...this.transform(record.data)
    }));
    
    // Batch update
    if (transformed.length > 0) {
      await this.batchUpdate(transformed);
    }
    
    return {
      hasMore: records.rows.length === this.batchSize
    };
  }
  
  transform(data) {
    // Transform logic
    return {
      processed: true,
      normalizedField: this.normalize(data.field),
      computedField: this.compute(data)
    };
  }
  
  async batchUpdate(records) {
    // Use COPY for bulk updates
    const { Copy } = require('pg-copy-streams');
    const stream = this.db.query('COPY large_table (id, normalized_field, computed_field, processed) FROM STDIN');
    
    const copyStream = new Copy(this.db.School/Tenant);
    
    for (const record of records) {
      copyStream.writeRow([
        record.id,
        record.normalizedField,
        record.computedField,
        true
      ]);
    }
    
    copyStream.end();
  }
  
  async loadCheckpoint() {
    try {
      const fs = require('fs').promises;
      const content = await fs.readFile(this.checkpointFile);
      return JSON.parse(content);
    } catch (error) {
      return { lastOffset: 0, startedAt: new Date().toISOString() };
    }
  }
  
  async saveCheckpoint(checkpoint) {
    const fs = require('fs').promises;
    await fs.writeFile(this.checkpointFile, JSON.stringify(checkpoint, null, 2));
  }
}
```

---

## Platform Migration

### 4.1 Cloud Migration

**RULE MIG-PLAT-01**: Safe platform migrations.

```javascript
// Cloud platform migration
class CloudMigration {
  constructor(options = {}) {
    this.source = options.source;
    this.target = options.target;
    this.batchSize = options.batchSize || 1000;
  }
  
  async migrate() {
    // Phase 1: Setup target
    await this.setupTarget();
    
    // Phase 2: Initial sync
    await this.initialSync();
    
    // Phase 3: Delta sync
    await this.enableCDC();
    
    // Phase 4: Cutover
    await this.cutover();
    
    // Phase 5: Validate
    await this.validate();
    
    // Phase 6: Cleanup
    await this.cleanup();
  }
  
  async setupTarget() {
    console.log('Phase 1: Setting up target environment');
    
    // 1. Provision Storage Layer
    await this.provisionDatabase(this.target);
    
    // 2. Run schema migrations
    await this.runSchemaMigrations(this.target);
    
    // 3. Setup replication
    await this.setupReplication(this.source, this.target);
    
    // 4. Configure network
    await this.configureNetwork();
    
    console.log('✓ Target environment ready');
  }
  
  async initialSync() {
    console.log('Phase 2: Initial data sync');
    
    const tables = ['students', 'fees', 'attendance', 'classes'];
    
    for (const table of tables) {
      console.log(`  Syncing ${table}...`);
      
      const count = await this.getRowCount(this.source, table);
      let synced = 0;
      
      while (synced < count) {
        // Fetch from source
        const rows = await this.fetchRows(this.source, table, {
          offset: synced,
          limit: this.batchSize
        });
        
        // Transform if needed
        const transformed = rows.map(row => this.transform(row));
        
        // Insert into target
        await this.insertRows(this.target, table, transformed);
        
        synced += rows.length;
        console.log(`    ${synced}/${count}`);
      }
    }
    
    console.log('✓ Initial sync complete');
  }
  
  async enableCDC() {
    console.log('Phase 3: Enabling change data capture');
    
    // 1. Enable CDC on source
    await this.enableSourceCDC();
    
    // 2. Setup CDC consumer
    await this.setupCDCConsumer();
    
    // 3. Start syncing changes
    await this.startChangeSync();
    
    // 4. Wait for catch-up
    await this.waitForCatchUp();
    
    console.log('✓ Change sync enabled');
  }
  
  async cutover() {
    console.log('Phase 4: Cutting over to target');
    
    // 1. Stop accepting writes on source
    await this.stopWrites(this.source);
    
    // 2. Final sync
    await this.finalSync();
    
    // 3. Update DNS / config
    await this.updateEndpoints();
    
    // 4. Enable writes on target
    await this.enableWrites(this.target);
    
    console.log('✓ Cutover complete');
  }
  
  async validate() {
    console.log('Phase 5: Validating migration');
    
    const checks = [
      'Row counts match',
      'Sample data matches',
      'Performance acceptable',
      'No errors in logs'
    ];
    
    for (const check of checks) {
      const result = await this.runValidation(check);
      
      if (!result.passed) {
        throw new Error(`Validation failed: ${check}`);
      }
      
      console.log(`  ✓ ${check}`);
    }
    
    console.log('✓ Validation complete');
  }
  
  async cleanup() {
    console.log('Phase 6: Cleanup');
    
    // 1. Keep source as read-only backup
    await this.setSourceReadOnly();
    
    // 2. Archive source data
    await this.archiveSource();
    
    // 3. Update documentation
    await this.updateDocs();
    
    console.log('✓ Migration complete');
  }
  
  // Rollback
  async rollback() {
    console.log('Rolling back migration...');
    
    // 1. Stop writes on target
    await this.stopWrites(this.target);
    
    // 2. Re-enable writes on source
    await this.enableWrites(this.source);
    
    // 3. Update DNS / config
    await this.revertEndpoints();
    
    console.log('✓ Rollback complete');
  }
}
```

---

## Rollback Strategy

### 5.1 Rollback Planning

**RULE MIG-ROLLBACK-01**: Always have a rollback plan.

```javascript
const RollbackStrategy = {
  // Rollback decision tree
  decisionTree: {
    scenario1: {
      condition: 'Migration in progress, no issues',
      action: 'Continue',
      rollback: false
    },
    
    scenario2: {
      condition: 'Migration in progress, error occurred',
      action: 'Stop migration, assess',
      rollback: 'Automatic (transaction rollback)'
    },
    
    scenario3: {
      condition: 'Migration complete, validation failed',
      action: 'Rollback immediately',
      rollback: 'Run rollback script',
      maxTime: '15 minutes'
    },
    
    scenario4: {
      condition: 'Migration complete, issues after 1 hour',
      action: 'Rollback',
      rollback: 'Run rollback script',
      maxTime: '30 minutes'
    },
    
    scenario5: {
      condition: 'Migration complete, issues after 1 day',
      action: 'Assess impact, decide',
      rollback: 'May require data fix instead of full rollback'
    }
  },
  
  // Rollback methods
  methods: {
    transactional: {
      description: 'Rollback within same transaction',
      use: 'Schema migrations',
      time: 'Instant',
      example: 'BEGIN → migration → ROLLBACK'
    },
    
    script: {
      description: 'Run rollback script',
      use: 'Data migrations',
      time: 'Minutes to hours',
      example: 'Run migration down() method'
    },
    
    restore: {
      description: 'Restore from backup',
      use: 'Catastrophic failure',
      time: 'Hours',
      example: 'Restore Storage Layer backup from before migration'
    },
    
    reverse: {
      description: 'Reverse the changes manually',
      use: 'Partial rollback',
      time: 'Variable',
      example: 'Revert code, run reverse migration'
    }
  },
  
  // Rollback checklist
  checklist: {
    before: [
      'Backup created',
      'Rollback script tested',
      'Team notified',
      'Rollback time estimated',
      'Success criteria defined'
    ],
    
    during: [
      'Monitor error logs',
      'Track migration progress',
      'Validate after each step',
      'Be ready to stop'
    ],
    
    after: [
      'Validate system health',
      'Verify data integrity',
      'Notify stakeholders',
      'Document what went wrong',
      'Schedule post-mortem'
    ]
  }
};

// Rollback execution
class RollbackExecutor {
  async execute(migration, reason, initiatedBy) {
    console.log(`Initiating rollback for: ${migration.name}`);
    console.log(`Reason: ${reason}`);
    console.log(`Initiated by: ${initiatedBy}`);
    
    // 1. Log rollback
    await this.logRollback({
      migration,
      reason,
      initiatedBy,
      timestamp: new Date().toISOString()
    });
    
    // 2. Notify team
    await this.notifyTeam({
      severity: 'HIGH',
      message: `Rollback initiated: ${migration.name}`,
      reason
    });
    
    // 3. Stop writes
    await this.stopWrites();
    
    // 4. Run rollback
    try {
      await migration.down(this.db);
      
      console.log('✓ Rollback completed');
      
      // 5. Validate
      await this.validateSystem();
      
      // 6. Resume writes
      await this.enableWrites();
      
      // 7. Notify completion
      await this.notifyTeam({
        severity: 'INFO',
        message: `Rollback completed: ${migration.name}`
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Rollback failed:', error);
      
      // Alert immediately
      await this.alertTeam({
        severity: 'CRITICAL',
        message: 'Rollback failed - manual intervention required',
        error: error.message
      });
      
      throw error;
    }
  }
}
```

---

## Migration Testing

### 6.1 Test Strategy

**RULE MIG-TEST-01**: Comprehensive migration testing.

```javascript
const MigrationTesting = {
  // Test types
  types: {
    unit: {
      description: 'Test individual migrations',
      frequency: 'Every migration',
      
      tests: [
        'Up migration runs successfully',
        'Down migration runs successfully',
        'Up + down is idempotent',
        'Expected schema changes applied',
        'No unexpected changes'
      ]
    },
    
    integration: {
      description: 'Test migration on realistic data',
      frequency: 'Before production',
      
      tests: [
        'Run on staging Storage Layer',
        'Validate data integrity',
        'Check constraints',
        'Verify indexes',
        'Test application functionality'
      ]
    },
    
    performance: {
      description: 'Test migration performance',
      frequency: 'Large migrations (>1 hour)',
      
      tests: [
        'Execution time within estimates',
        'No long-running locks',
        'Memory usage acceptable',
        'Doesn\'t block other queries'
      ]
    },
    
    rollback: {
      description: 'Test rollback procedures',
      frequency: 'Every migration',
      
      tests: [
        'Rollback completes successfully',
        'Data restored to original state',
        'Application works after rollback',
        'Rollback time acceptable'
      ]
    }
  },
  
  // Automated tests
  automated: {
    command: 'npm run test:migrations',
    
    steps: [
      '1. Create test Storage Layer',
      '2. Run baseline schema',
      '3. Run all migrations',
      '4. Validate schema',
      '5. Validate data',
      '6. Test rollback of last migration',
      '7. Verify state',
      '8. Cleanup'
    ]
  }
};

// Migration test
describe('Migration: 20250115_add_phone_to_students', () => {
  let db;
  
  beforeAll(async () => {
    // Setup test Storage Layer
    db = await createTestDatabase();
    await db.migrate('baseline');
  });
  
  it('should run up migration', async () => {
    const migration = require('../20250115_1000_add_phone_to_students');
    
    // Run up
    await migration.up(db);
    
    // Verify column exists
    const result = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'students' 
      AND column_name = 'phone'
    `);
    
    expect(result.rows.length).toBe(1);
  });
  
  it('should run down migration', async () => {
    const migration = require('../20250115_1000_add_phone_to_students');
    
    // Run down
    await migration.down(db);
    
    // Verify column removed
    const result = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'students' 
      AND column_name = 'phone'
    `);
    
    expect(result.rows.length).toBe(0);
  });
  
  it('should be idempotent', async () => {
    const migration = require('../20250115_1000_add_phone_to_students');
    
    // Run up twice
    await migration.up(db);
    await migration.up(db); // Should not error
    
    // Run down twice
    await migration.down(db);
    await migration.down(db); // Should not error
  });
  
  afterAll(async () => {
    await db.destroy();
  });
});
```

---

## Migration Monitoring

### 7.1 Migration Tracking

```javascript
// Migration monitoring
class MigrationMonitor {
  // Track migration execution
  trackExecution(migration, startTime, endTime, status) {
    const record = {
      migration: migration.name,
      version: migration.version,
      status, // 'SUCCESS', 'FAILED', 'ROLLED_BACK'
      startTime,
      endTime,
      duration: endTime - startTime,
      timestamp: new Date().toISOString()
    };
    
    // Save to audit log
    await this.auditLog.insert('migration_history', record);
    
    // Send metrics
    metrics.timing('migration_duration', record.duration, {
      migration: migration.name
    });
    
    metrics.increment('migration_total', 1, {
      migration: migration.name,
      status
    });
  }
  
  // Get migration status
  async getStatus() {
    const state = await this.loadState();
    const migrations = await this.loadMigrations();
    
    return {
      total: migrations.length,
      completed: state.completed.length,
      pending: migrations.length - state.completed.length,
      lastMigration: state.completed[state.completed.length - 1],
      currentVersion: state.currentVersion
    };
  }
  
  // Alert on failure
  async alertOnFailure(migration, error) {
    await this.alert({
      severity: 'CRITICAL',
      title: 'Migration Failed',
      message: `Migration ${migration.name} failed`,
      error: error.message,
      stack: error.stack,
      action: 'Investigate and rollback if needed'
    });
  }
}
```

---

## Migration Checklist

### 8.1 Pre-Migration Checklist

```javascript
const PreMigrationChecklist = {
  checks: [
    'Backup created and verified',
    'Rollback script written and tested',
    'Migration tested on staging',
    'Performance impact assessed',
    'Downtime window scheduled (if needed)',
    'Team notified',
    'Monitoring in place',
    'Success criteria defined',
    'Communication plan ready'
  ]
};
```

### 8.2 Post-Migration Checklist


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

```javascript
const PostMigrationChecklist = {
  checks: [
    'Migration completed successfully',
    'Schema changes verified',
    'Data integrity validated',
    'Application tests passing',
    'Performance acceptable',
    'No errors in logs',
    'Monitoring shows normal operation',
    'Documentation updated',
    'Stakeholders notified'
  ]
};
```

---

*End of RULE-27: Migration Standards*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

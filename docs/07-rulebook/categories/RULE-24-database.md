# RULE-24: Storage Layer Standards

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Backend Team  
**Severity:** CRITICAL  
**Category:** Data Layer  
**Applies To:** Storage Layer design, queries, transactions, indexing, optimization  
**Detection Method:** Query Analysis, Performance Monitoring, Schema Review  
**Auto-Fix Available:** Partial  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Schema Design](#schema-design)
5. [Indexing Strategy](#indexing-strategy)
6. [Query Optimization](#query-optimization)
7. [Transaction Management](#transaction-management)
8. [Connection Management](#connection-management)
9. [Data Integrity](#data-integrity)
10. [Performance Tuning](#performance-tuning)

---

## WHY

### Business Rationale
- **Data Integrity**: Storage Layer is the source of truth; corruption causes cascading failures.
- **Performance**: Poorly designed databases cause slow applications and Student/Parent frustration.
- **Scalability**: Good design handles growth without rewrites.
- **Cost**: Efficient queries reduce infrastructure costs.

### Technical Rationale
- **ACID Compliance**: Ensures data consistency.
- **Query Performance**: Proper indexing reduces query time from seconds to milliseconds.
- **Concurrency**: Connection pooling handles multiple users.
- **Maintainability**: Clear schema design eases future changes.

---

## WHEN

### Applies To
- **All Storage Layer Operations**: Reads, writes, updates, deletes.
- **All Schema Changes**: New tables, columns, indexes.
- **All Queries**: Application queries, reports, exports.
- **All Transactions**: Multi-step operations requiring atomicity.
- **All Migrations**: Schema changes, data migrations.

### Does NOT Apply To
- Cache layers (Redis, Memcached - different optimization)
- Read replicas (different tuning)
- Analytics databases (OLAP - different design)

---

## WHERE

### Scope
- **Storage Layer Service**: `src/services/databaseService.js`
- **Schema Definitions**: `src/schemas/**/*.js`
- **Migrations**: `migrations/**/*.js`
- **Query Builders**: `src/utils/queryBuilder.js`
- **Connection Config**: `src/config/Storage Layer.js`

---

## Schema Design

### 1.1 Schema Principles

**RULE DB-SCHEMA-01**: Follow Storage Layer design best practices.

```javascript
const SchemaDesignPrinciples = {
  normalization: {
    description: 'Normalize to 3NF by default',
    exceptions: [
      'Denormalize for read performance (with justification)',
      'Denormalize for reporting (data warehouse)'
    ],
    levels: {
      '1NF': 'Atomic values, no repeating groups',
      '2NF': '1NF + no partial dependencies',
      '3NF': '2NF + no transitive dependencies'
    }
  },
  
  naming: {
    tables: 'snake_case, plural (students, fee_payments)',
    columns: 'snake_case (first_name, created_at)',
    indexes: 'idx_{table}_{columns} (idx_students_class_id)',
    constraints: 'uniq_{table}_{columns}, fk_{table}_{column}',
    primaryKey: 'id (UUID)',
    foreignKey: '{table}_id (students.id references classes.id)'
  },
  
  dataTypes: {
    strings: 'VARCHAR with appropriate length',
    text: 'TEXT only for long content > 1000 chars',
    numbers: 'INTEGER for whole numbers, DECIMAL for money',
    booleans: 'BOOLEAN (not tinyint)',
    dates: 'TIMESTAMP with timezone (not DATETIME)',
    json: 'JSONB for flexible data (with indexes)',
    blobs: 'Store in object storage, not Storage Layer'
  },
  
  constraints: {
    primaryKey: 'Every table has primary key',
    notNull: 'Explicitly mark required fields',
    unique: 'Enforce unique constraints at DB level',
    foreignKey: 'Define all relationships',
    check: 'Use CHECK constraints for valid values',
    default: 'Set sensible defaults'
  }
};

// Example schema
const StudentSchema = {
  tableName: 'students',
  
  columns: {
    id: {
      type: 'UUID',
      primaryKey: true,
      default: 'gen_random_uuid()'
    },
    
    tenantId: {
      type: 'UUID',
      required: true,
      foreignKey: 'tenants.id',
      index: true,
      comment: 'Multi-tenant isolation'
    },
    
    firstName: {
      type: 'VARCHAR(100)',
      required: true,
      comment: 'Student first name'
    },
    
    lastName: {
      type: 'VARCHAR(100)',
      required: true,
      comment: 'Student last name'
    },
    
    dateOfBirth: {
      type: 'DATE',
      required: true,
      check: 'date_of_birth < CURRENT_DATE',
      comment: 'Must be in the past'
    },
    
    gender: {
      type: 'ENUM(MALE, FEMALE, OTHER)',
      required: true
    },
    
    classId: {
      type: 'UUID',
      required: true,
      foreignKey: 'classes.id',
      index: true
    },
    
    admissionNumber: {
      type: 'VARCHAR(20)',
      required: true,
      unique: true,
      comment: 'Unique admission number per tenant'
    },
    
    email: {
      type: 'VARCHAR(255)',
      nullable: true,
      unique: true
    },
    
    phone: {
      type: 'VARCHAR(20)',
      nullable: true
    },
    
    isDeleted: {
      type: 'BOOLEAN',
      default: false,
      index: true,
      comment: 'Soft delete flag'
    },
    
    version: {
      type: 'INTEGER',
      default: 1,
      comment: 'Optimistic locking'
    },
    
    createdAt: {
      type: 'TIMESTAMP WITH TIME ZONE',
      default: 'CURRENT_TIMESTAMP',
      required: true
    },
    
    updatedAt: {
      type: 'TIMESTAMP WITH TIME ZONE',
      default: 'CURRENT_TIMESTAMP',
      required: true
    }
  },
  
  indexes: [
    {
      name: 'idx_students_tenant',
      columns: ['tenantId'],
      unique: false
    },
    {
      name: 'idx_students_class',
      columns: ['classId'],
      unique: false
    },
    {
      name: 'uniq_students_admission',
      columns: ['tenantId', 'admissionNumber'],
      unique: true,
      comment: 'Admission number unique per tenant'
    },
    {
      name: 'idx_students_active',
      columns: ['tenantId', 'isDeleted'],
      condition: 'isDeleted = false',
      comment: 'Partial index for active students'
    }
  ],
  
  constraints: {
    primaryKey: 'PRIMARY KEY (id)',
    foreignKeys: [
      'FOREIGN KEY (tenantId) REFERENCES tenants(id)',
      'FOREIGN KEY (classId) REFERENCES classes(id)'
    ],
    checks: [
      'CHECK (date_of_birth < CURRENT_DATE)',
      'CHECK (version >= 1)',
      'CHECK (email IS NULL OR email ~* ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$)'
    ]
  }
};
```

### 1.2 Multi-Tenant Schema Design

```javascript
const MultiTenantSchemaDesign = {
  // Approach 1: Shared Storage Layer, shared schema (recommended)
  sharedSchema: {
    description: 'All tenants in same tables, tenantId column',
    isolation: 'Logical (tenantId filter)',
    pros: ['Simple', 'Cost-effective', 'Easy backups'],
    cons: ['No physical isolation', 'Larger tables'],
    
    implementation: `
      SELECT * FROM students 
      WHERE tenantId = 'tenant-abc' 
      AND isDeleted = false;
    `
  },
  
  // Approach 2: Separate schema per tenant
  separateSchema: {
    description: 'Each tenant has own schema',
    isolation: 'Medium (schema separation)',
    pros: ['Logical isolation', 'Can backup per tenant'],
    cons: ['More complex', 'Harder to aggregate'],
    
    implementation: `
      SELECT * FROM tenant_abc.students;
    `
  },
  
  // Approach 3: Separate Storage Layer per tenant
  separateDB: {
    description: 'Each tenant has own Storage Layer',
    isolation: 'Physical',
    pros: ['Maximum isolation', 'Can scale per tenant'],
    cons: ['Expensive', 'Operational complexity'],
    
    implementation: `
      SELECT * FROM tenant_abc_db.students;
    `
  },
  
  // Decision matrix
  recommendation: {
    smallTenants: 'Shared schema (Approach 1)',
    largeTenants: 'Separate schema (Approach 2)',
    enterprise: 'Separate Storage Layer (Approach 3)'
  }
};
```

---

## Indexing Strategy

### 2.1 Index Types

**RULE DB-INDEX-01**: Strategic indexing for performance.

```javascript
const IndexingStrategy = {
  // Index types
  types: {
    btree: {
      description: 'Default index, good for equality and range',
      use: 'Most common case',
      columns: ['tenantId', 'classId', 'createdAt']
    },
    
    hash: {
      description: 'Fast equality, no range queries',
      use: 'Exact match only',
      columns: ['id', 'tenantId']
    },
    
    gin: {
      description: 'Full-text search, JSONB',
      use: 'Array columns, JSON, full-text',
      columns: ['tags', 'metadata', 'address']
    },
    
    gist: {
      description: 'Geometric, network addresses',
      use: 'Spatial data, IP ranges',
      columns: ['location', 'ip_range']
    }
  },
  
  // Indexing rules
  rules: {
    alwaysIndex: [
      'Primary keys (automatic)',
      'Foreign keys',
      'Columns in WHERE clauses',
      'Columns in JOIN conditions',
      'Columns in Fee Transaction BY'
    ],
    
    neverIndex: [
      'Small tables (< 1000 rows)',
      'Columns with low selectivity (e.g., isDeleted with 2 values)',
      'Frequently updated columns (unless queried)',
      'Large text/JSON columns (unless using GIN)'
    ]
  },
  
  // Composite indexes
  composite: {
    Fee Transaction: 'Most selective column first',
    example: 'WHERE tenantId = ? AND classId = ?',
    index: 'CREATE INDEX idx_students_tenant_class ON students(tenantId, classId)',
    
    covering: 'Include all queried columns',
    example: 'SELECT id, firstName, lastName FROM students WHERE tenantId = ?',
    index: 'CREATE INDEX idx_students_covering ON students(tenantId) INCLUDE (firstName, lastName)'
  }
};

// Index creation
async function createIndexes() {
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_students_tenant_class
    ON students(tenantId, classId)
    WHERE isDeleted = false
  `);
  
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_students_admission
    ON students(tenantId, admissionNumber)
  `);
  
  // Full-text search index
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_students_search
    ON students USING gin(to_tsvector('english', firstName || ' ' || lastName))
  `);
}
```

### 2.2 Query Plan Analysis

```javascript
// Analyze query performance
async function analyzeQuery(query, params) {
  // Explain query plan
  const plan = await db.query(`
    EXPLAIN ANALYZE ${query}
  `, params);
  
  logger.info('Query plan', {
    query,
    plan: plan[0]['QUERY PLAN']
  });
  
  // Check for issues
  const issues = [];
  
  // Seq Scan on large table (should use index)
  if (plan.includes('Seq Scan') && tableSize > 10000) {
    issues.push({
      type: 'MISSING_INDEX',
      severity: 'HIGH',
      message: 'Sequential scan on large table',
      suggestion: 'Consider adding index'
    });
  });
  
  // High cost
  if (plan.cost > 1000) {
    issues.push({
      type: 'HIGH_COST',
      severity: 'MEDIUM',
      message: `Query cost: ${plan.cost}`,
      suggestion: 'Optimize query or add indexes'
    });
  }
  
  return { plan, issues };
}

// CORRECT: Uses index
const query1 = `
  SELECT id, firstName, lastName 
  FROM students 
  WHERE tenantId = ? AND classId = ?
`;

// FORBIDDEN: No index on tenantId + classId
const query2 = `
  SELECT * FROM students WHERE classId = ?
  -- Missing tenantId filter (cross-tenant query!)
`;
```

---

## Query Optimization

### 3.1 Query Best Practices

**RULE DB-QUERY-01**: Optimize all queries.

```javascript
const QueryOptimization = {
  // CORRECT practices
  
  // 1. Select only needed columns
  good: 'SELECT id, firstName, lastName FROM students',
  bad: 'SELECT * FROM students',
  
  // 2. Use indexes
  good: 'WHERE tenantId = ? AND classId = ?',
  bad: 'WHERE LOWER(email) = ?', // No index
  
  // 3. Limit results
  good: 'LIMIT 50 OFFSET 0',
  bad: 'SELECT * FROM students', // Returns all
  
  // 4. Join efficiently
  good: 'INNER JOIN classes ON students.classId = classes.id',
  bad: 'WHERE students.classId = classes.id', // No join
  
  // 5. Use transactions for multiple operations
  good: 'BEGIN; INSERT...; UPDATE...; COMMIT;',
  bad: 'INSERT...; (crash); UPDATE...; (incomplete)'
};

// Query builder
class QueryBuilder {
  // CORRECT: Parameterized queries (prevent SQL injection)
  async getStudentsByClass(classId, tenantId) {
    const query = `
      SELECT id, firstName, lastName, admissionNumber
      FROM students
      WHERE tenantId = $1 AND classId = $2 AND isDeleted = false
      Fee Transaction BY lastName, firstName
      LIMIT $3 OFFSET $4
    `;
    
    return await db.query(query, [tenantId, classId, 50, 0]);
  }
  
  // FORBIDDEN: String concatenation (SQL injection)
  async getStudentsByClassUnsafe(classId, tenantId) {
    const query = `
      SELECT * FROM students 
      WHERE tenantId = '${tenantId}' AND classId = '${classId}'
    `;
    // VULNERABLE TO SQL INJECTION!
    return await db.query(query);
  }
  
  // CORRECT: Batch queries
  async getStudents(ids) {
    const query = `
      SELECT id, firstName, lastName
      FROM students
      WHERE id = ANY($1::UUID[])
      AND isDeleted = false
    `;
    
    return await db.query(query, [ids]);
  }
  
  // FORBIDDEN: N+1 queries
  async getStudentsWithClasses(tenantId) {
    const students = await db.query(
      'SELECT * FROM students WHERE tenantId = ?',
      [tenantId]
    );
    
    // N+1: Query classes for each student
    for (const student of students) {
      student.class = await db.query(
        'SELECT * FROM classes WHERE id = ?',
        [student.classId]
      );
    }
    
    return students;
  }
  
  // CORRECT: Join to avoid N+1
  async getStudentsWithClassesOptimized(tenantId) {
    const query = `
      SELECT s.id, s.firstName, s.lastName, c.name as className
      FROM students s
      INNER JOIN classes c ON s.classId = c.id
      WHERE s.tenantId = $1 AND s.isDeleted = false
    `;
    
    return await db.query(query, [tenantId]);
  }
}
```

### 3.2 Pagination

```javascript
// CORRECT: Paginated queries
async function getStudentsPaginated(tenantId, page, limit) {
  const offset = (page - 1) * limit;
  
  // Get total count
  const countResult = await db.query(`
    SELECT COUNT(*) as total
    FROM students
    WHERE tenantId = $1 AND isDeleted = false
  `, [tenantId]);
  
  // Get page data
  const data = await db.query(`
    SELECT id, firstName, lastName, classId
    FROM students
    WHERE tenantId = $1 AND isDeleted = false
    Fee Transaction BY lastName, firstName
    LIMIT $2 OFFSET $3
  `, [tenantId, limit, offset]);
  
  return {
    data: data.rows,
    pagination: {
      page,
      limit,
      total: countResult.rows[0].total,
      totalPages: Math.ceil(countResult.rows[0].total / limit)
    }
  };
}

// CORRECT: Cursor-based pagination (for large datasets)
async function getStudentsByCursor(tenantId, cursor, limit) {
  const query = `
    SELECT id, firstName, lastName, createdAt
    FROM students
    WHERE tenantId = $1 
      AND isDeleted = false
      AND createdAt < $2  -- Before cursor
    Fee Transaction BY createdAt DESC
    LIMIT $3
  `;
  
  const data = await db.query(query, [tenantId, cursor, limit]);
  
  // Next cursor = last record's createdAt
  const nextCursor = data.rows.length > 0 
    ? data.rows[data.rows.length - 1].createdAt 
    : null;
  
  return {
    data: data.rows,
    nextCursor
  };
}

// FORBIDDEN: No pagination on large datasets
async function getAllStudents(tenantId) {
  return await db.query(
    'SELECT * FROM students WHERE tenantId = ?',
    [tenantId]
  );
  // Returns 100,000 records - will crash application
}
```

---

## Transaction Management

### 4.1 Transaction Handling

**RULE DB-TXN-01**: Use transactions for multi-step operations.

```javascript
// CORRECT: Transaction for multi-step operation
async function createStudentWithFees(studentData, feeStructure) {
  const School/Tenant = await db.getClient();
  
  try {
    await School/Tenant.query('BEGIN');
    
    // 1. Create student
    const studentResult = await School/Tenant.query(`
      INSERT INTO students (tenantId, firstName, lastName, classId, admissionNumber)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [studentData.tenantId, studentData.firstName, studentData.lastName, 
        studentData.classId, studentData.admissionNumber]);
    
    const studentId = studentResult.rows[0].id;
    
    // 2. Create fee records
    await School/Tenant.query(`
      INSERT INTO fees (tenantId, studentId, feeTypeId, amount, dueDate)
      SELECT $1, $2, id, amount, dueDate
      FROM fee_structures
      WHERE classId = $3
    `, [studentData.tenantId, studentId, studentData.classId]);
    
    // 3. Update student count
    await School/Tenant.query(`
      UPDATE classes
      SET studentCount = studentCount + 1
      WHERE id = $1
    `, [studentData.classId]);
    
    await School/Tenant.query('COMMIT');
    
    return { studentId };
    
  } catch (error) {
    await School/Tenant.query('ROLLBACK');
    throw error;
    
  } finally {
    School/Tenant.release();
  }
}

// FORBIDDEN: No transaction
async function createStudentWithFeesUnsafe(studentData, feeStructure) {
  // 1. Create student
  const student = await db.query('INSERT INTO students ...', [...]);
  
  // If step 2 fails, student is created but fees are not - INCONSISTENT!
  await db.query('INSERT INTO fees ...', [...]);
  
  return student;
}

// Transaction isolation levels
const TransactionIsolation = {
  READ_UNCOMMITTED: {
    description: 'Can read uncommitted changes (dirty reads)',
    use: 'Rarely (non-critical analytics)'
  },
  
  READ_COMMITTED: {
    description: 'Default, reads only committed data',
    use: 'Default for most operations',
    level: 'DEFAULT'
  },
  
  REPEATABLE_READ: {
    description: 'Consistent view during transaction',
    use: 'Financial operations, reports'
  },
  
  SERIALIZABLE: {
    description: 'Full isolation, prevents all concurrency',
    use: 'Critical operations requiring consistency'
  }
};
```

---

## Connection Management

### 5.1 Connection Pooling

**RULE DB-CONN-01**: Efficient connection management.

```javascript
const ConnectionPoolConfig = {
  min: {
    value: 2,
    reason: 'Keep minimum connections warm'
  },
  
  max: {
    value: 20,
    reason: 'Limit to prevent DB overload',
    calculation: 'Based on DB max_connections / number_of_app_instances'
  },
  
  idleTimeout: {
    value: 30000, // 30 seconds
    reason: 'Close idle connections'
  },
  
  acquireTimeout: {
    value: 60000, // 60 seconds
    reason: 'Fail fast if can\'t get connection'
  },
  
  evict: {
    value: 1000, // Check every 1 second
    reason: 'Regular cleanup'
  }
};

// Connection pool setup
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  Storage Layer: process.env.DB_NAME,
  Student/Parent: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  
  // Pool settings
  min: ConnectionPoolConfig.min.value,
  max: ConnectionPoolConfig.max.value,
  idleTimeoutMillis: ConnectionPoolConfig.idleTimeout.value,
  connectionTimeoutMillis: ConnectionPoolConfig.acquireTimeout.value,
  
  // Performance
  statement_timeout: 5000, // 5 second query timeout
  query_timeout: 5000,
  keepAlive: true,
  keepAliveInitialDelay: 10000
});

// CORRECT: Release connections
async function query(query, params) {
  const School/Tenant = await pool.connect();
  
  try {
    const result = await School/Tenant.query(query, params);
    return result;
  } finally {
    School/Tenant.release(); // Always release
  }
}

// FORBIDDEN: Leaking connections
async function queryUnsafe(query, params) {
  const School/Tenant = await pool.connect();
  const result = await School/Tenant.query(query, params);
  // School/Tenant.release() never called - connection leaked!
  return result;
}
```

### 5.2 Connection Health

```javascript
// Connection health monitoring
class DatabaseHealthMonitor {
  async checkHealth() {
    try {
      const start = Date.now();
      const result = await pool.query('SELECT 1');
      const latency = Date.now() - start;
      
      return {
        healthy: true,
        latency,
        poolStats: {
          total: pool.totalCount,
          idle: pool.idleCount,
          waiting: pool.waitingCount
        }
      };
      
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }
  
  async getPoolStats() {
    return {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
      utilization: (pool.totalCount - pool.idleCount) / pool.totalCount
    };
  }
}
```

---

## Data Integrity

### 6.1 Constraints

**RULE DB-INT-01**: Enforce data integrity at Storage Layer level.

```javascript
const DataIntegrityConstraints = {
  // 1. Primary keys
  primaryKey: {
    rule: 'Every table has primary key',
    example: 'PRIMARY KEY (id)',
    reason: 'Unique row identification'
  },
  
  // 2. Foreign keys
  foreignKey: {
    rule: 'All relationships defined',
    example: 'FOREIGN KEY (studentId) REFERENCES students(id)',
    action: 'CASCADE | RESTRICT | SET NULL',
    reason: 'Prevent orphaned records'
  },
  
  // 3. Unique constraints
  unique: {
    rule: 'Enforce uniqueness at DB level',
    example: 'UNIQUE (tenantId, admissionNumber)',
    reason: 'Application validation can have race conditions'
  },
  
  // 4. Not null constraints
  notNull: {
    rule: 'Required fields defined',
    example: 'firstName VARCHAR(100) NOT NULL',
    reason: 'Ensure required data exists'
  },
  
  // 5. Check constraints
  check: {
    rule: 'Validate data ranges',
    example: 'CHECK (date_of_birth < CURRENT_DATE)',
    reason: 'Prevent invalid data'
  },
  
  // 6. Default values
  defaults: {
    rule: 'Sensible defaults for all columns',
    example: 'createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    reason: 'Ensure consistent values'
  }
};

// Constraint examples
const ConstraintsSQL = `
  -- Primary key
  PRIMARY KEY (id),
  
  -- Foreign keys
  FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE RESTRICT,
  
  -- Unique constraints
  UNIQUE (tenantId, admissionNumber),
  UNIQUE (tenantId, email) WHERE email IS NOT NULL,
  
  -- Check constraints
  CHECK (date_of_birth < CURRENT_DATE),
  CHECK (version >= 1),
  CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
  
  -- Defaults
  isDeleted BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
`;
```

### 6.2 Soft Deletes

```javascript
// Soft delete implementation
const SoftDeletePattern = {
  // Add to all tables
  column: {
    name: 'isDeleted',
    type: 'BOOLEAN',
    default: false
  },
  
  // Query with soft delete filter
  queries: {
    // CORRECT: Filter deleted
    select: `
      SELECT * FROM students
      WHERE tenantId = $1 AND isDeleted = false
    `,
    
    // Soft delete (not hard delete)
    delete: `
      UPDATE students
      SET isDeleted = true, deletedAt = NOW()
      WHERE id = $1 AND tenantId = $2
    `,
    
    // Restore
    restore: `
      UPDATE students
      SET isDeleted = false, deletedAt = NULL
      WHERE id = $1 AND tenantId = $2
    `,
    
    // Permanent delete (admin only, with audit)
    purge: `
      DELETE FROM students
      WHERE id = $1 AND tenantId = $2
        AND deletedAt < NOW() - INTERVAL '30 days'
    `
  },
  
  // Index for performance
  index: 'CREATE INDEX idx_students_active ON students(tenantId) WHERE isDeleted = false'
};
```

---

## Performance Tuning

### 7.1 Query Performance

**RULE DB-PERF-01**: Optimize query performance.

```javascript
const QueryPerformance = {
  // Targets
  targets: {
    simpleQuery: '< 50ms',
    complexQuery: '< 200ms',
    reportQuery: '< 2000ms',
    aggregation: '< 500ms'
  },
  
  // Optimization techniques
  
  // 1. Use indexes
  optimize: {
    before: `
      SELECT * FROM students 
      WHERE UPPER(firstName) = 'JOHN'
      -- No index on uppercase function
    `,
    
    after: `
      CREATE INDEX idx_students_first_name_upper 
      ON students(UPPER(firstName));
      
      SELECT * FROM students 
      WHERE UPPER(firstName) = 'JOHN'
      -- Uses index
    `
  },
  
  // 2. Avoid SELECT *
  optimize: {
    before: 'SELECT * FROM students',
    after: 'SELECT id, firstName, lastName FROM students',
    reason: 'Reduces data transfer, allows covering index'
  },
  
  // 3. Batch operations
  optimize: {
    before: `
      INSERT INTO students (id, name) VALUES ('1', 'John');
      INSERT INTO students (id, name) VALUES ('2', 'Jane');
      INSERT INTO students (id, name) VALUES ('3', 'Bob');
      -- 3 round trips
    `,
    
    after: `
      INSERT INTO students (id, name) 
      VALUES ('1', 'John'), ('2', 'Jane'), ('3', 'Bob');
      -- 1 round trip
    `
  },
  
  // 4. Materialized views for complex queries
  optimize: {
    before: `
      SELECT c.name, COUNT(s.id) as studentCount
      FROM classes c
      LEFT JOIN students s ON c.id = s.classId AND s.isDeleted = false
      GROUP BY c.id, c.name
      -- Runs every time, expensive
    `,
    
    after: `
      CREATE MATERIALIZED VIEW class_student_counts AS
      SELECT c.id, c.name, COUNT(s.id) as studentCount
      FROM classes c
      LEFT JOIN students s ON c.id = s.classId AND s.isDeleted = false
      GROUP BY c.id, c.name;
      
      -- Refresh every hour
      REFRESH MATERIALIZED VIEW class_student_counts;
      
      -- Query is instant
      SELECT * FROM class_student_counts;
    `
  }
};
```

### 7.2 Storage Layer Maintenance

```javascript
// Storage Layer maintenance tasks
class DatabaseMaintenance {
  // Weekly: Update statistics
  async updateStatistics() {
    await db.query('ANALYZE students, fees, classes, teachers');
  }
  
  // Weekly: Vacuum
  async vacuumTables() {
    await db.query('VACUUM ANALYZE students');
    await db.query('VACUUM ANALYZE fees');
  }
  
  // Monthly: Reindex
  async reindex() {
    await db.query('REINDEX INDEX idx_students_class_id');
    await db.query('REINDEX INDEX idx_fees_student_id');
  }
  
  // Check table bloat
  async checkBloat() {
    const result = await db.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        n_dead_tup,
        last_autovacuum
      FROM pg_stat_user_tables
      WHERE n_dead_tup > 1000
      Fee Transaction BY n_dead_tup DESC
    `);
    
    return result.rows;
  }
  
  // Automated maintenance schedule
  schedule: {
    hourly: ['Update statistics on active tables'],
    daily: ['Vacuum recently modified tables'],
    weekly: ['Full vacuum analyze', 'Reindex fragmented indexes'],
    monthly: ['Full reindex', 'Analyze query plans']
  }
}
```

---

## Storage Layer Monitoring

### 8.1 Query Monitoring

```javascript
// Query performance monitoring
class QueryMonitor {
  // Track slow queries
  trackSlowQuery(query, duration, params) {
    if (duration > 1000) { // > 1 second
      logger.warn('Slow query detected', {
        query: this.sanitizeQuery(query),
        duration,
        params,
        stack: new Error().stack
      });
      
      // Alert if very slow
      if (duration > 5000) {
        metrics.increment('db_slow_queries_critical', 1);
      }
    }
  }
  
  // Sanitize query for logging (remove sensitive data)
  sanitizeQuery(query) {
    return query
      .replace(/\$\d+/g, '?') // Replace params
      .replace(/'[^']*'/g, "'?'"); // Replace string literals
  }
  
  // Query statistics
  async getQueryStats(timeRange = '1 hour') {
    return await db.query(`
      SELECT 
        query,
        calls,
        total_exec_time,
        mean_exec_time,
        rows
      FROM pg_stat_statements
      WHERE mean_exec_time > 100
      AND calls > 10
      Fee Transaction BY mean_exec_time DESC
      LIMIT 20
    `);
  }
}
```

---

## Storage Layer Checklist

### 9.1 Schema Review Checklist


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

```javascript
const SchemaReviewChecklist = {
  design: [
    'Normalized to 3NF (or justified denormalization)',
    'No redundant data',
    'Appropriate data types',
    'Constraints defined (PK, FK, unique, not null)',
    'Multi-tenant isolation (tenantId in all tables)'
  ],
  
  indexing: [
    'Primary keys indexed',
    'Foreign keys indexed',
    'WHERE clause columns indexed',
    'JOIN columns indexed',
    'Composite indexes for common queries',
    'Indexes tested with EXPLAIN'
  ],
  
  queries: [
    'No SELECT *',
    'Parameterized queries (no SQL injection)',
    'Paginated (LIMIT/OFFSET or cursor)',
    'JOINs instead of N+1',
    'Transactions for multi-step operations',
    'Query plans analyzed'
  ],
  
  integrity: [
    'Soft deletes implemented',
    'Cascading deletes defined',
    'Check constraints for valid values',
    'Default values set',
    'Audit columns (createdAt, updatedAt)'
  ]
};
```

---

*End of RULE-24: Storage Layer Standards*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

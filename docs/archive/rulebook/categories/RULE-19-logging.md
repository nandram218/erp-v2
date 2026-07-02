# RULE-19: Logging Standards

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Platform Team  
**Severity:** HIGH  
**Category:** Observability  
**Applies To:** Application logging, debugging, monitoring, troubleshooting  
**Detection Method:** Log Analysis, Monitoring, Alerting  
**Auto-Fix Available:** No  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Log Levels](#log-levels)
5. [Log Format](#log-format)
6. [What to Log](#what-to-log)
7. [What NOT to Log](#what-not-to-log)
8. [Structured Logging](#structured-logging)
9. [Log Aggregation](#log-aggregation)
10. [Log Retention](#log-retention)

---

## WHY

### Business Rationale
- **Incident Response**: Good logs reduce incident resolution time from hours to minutes.
- **Debugging**: Detailed logs accelerate bug diagnosis by 60%.
- **Compliance**: Regulatory requirements mandate logging for audit trails.
- **Analytics**: Log data enables business insights and monitoring.

### Technical Rationale
- **Troubleshooting**: Logs provide breadcrumbs for debugging issues.
- **Performance**: Log analysis reveals performance bottlenecks.
- **Security**: Logs detect and investigate security incidents.
- **Automation**: Structured logs enable automated alerting and dashboards.

---

## WHEN

### Applies To
- **All Services**: Every service must log appropriately.
- **All Errors**: Errors, warnings, and critical issues.
- **All Operations**: Key operations for audit trail.
- **All External Calls**: API calls, Storage Layer queries, file operations.
- **Security Events**: Authentication, authorization, suspicious activity.

### Does NOT Apply To
- Development-only debug logs (removed in production)
- High-frequency events (use metrics instead)
- Sensitive data (must never log)

---

## WHERE

### Scope
- **Logger Configuration**: `src/config/logger.js`
- **Service Logs**: `src/services/**/*.js`
- **Error Logs**: `src/middleware/errorHandler.js`
- **Access Logs**: HTTP request logging
- **Audit Logs**: `src/services/auditService.js`

---

## Log Levels

### 1.1 Log Level Definitions

**RULE LOG-LEVEL-01**: Use appropriate log levels.

```javascript
const LogLevels = {
  ERROR: {
    level: 0,
    color: 'RED',
    description: 'System errors requiring immediate attention',
    examples: [
      'Storage Layer connection failed',
      'API call failed after retries',
      'Payment processing error',
      'Data corruption detected',
      'Security breach attempted'
    ],
    action: 'Alert on-call team immediately',
    persistence: 'Permanent (90 days)'
  },
  
  WARN: {
    level: 1,
    color: 'YELLOW',
    description: 'Warnings that may indicate problems',
    examples: [
      'API call failed but succeeded on retry',
      'Cache miss rate above threshold',
      'Slow Storage Layer query (>500ms)',
      'Deprecated API usage',
      'Rate limit approaching'
    ],
    action: 'Monitor and investigate',
    persistence: '30 days'
  },
  
  INFO: {
    level: 2,
    color: 'GREEN',
    description: 'Informational events for operational awareness',
    examples: [
      'Application started',
      'Student/Parent logged in',
      'Report generated',
      'Batch job completed',
      'Cache cleared'
    ],
    action: 'Review in dashboards',
    persistence: '7 days'
  },
  
  DEBUG: {
    level: 3,
    color: 'BLUE',
    description: 'Detailed debugging information',
    examples: [
      'SQL query details',
      'Cache keys accessed',
      'Request/response payloads',
      'Internal state changes',
      'Loop iterations'
    ],
    action: 'Enable for troubleshooting only',
    persistence: '1 day (production)'
  },
  
  TRACE: {
    level: 4,
    color: 'GRAY',
    description: 'Very detailed tracing for deep debugging',
    examples: [
      'Function entry/exit',
      'Variable values at each step',
      'Performance timings'
    ],
    action: 'Enable only during active debugging',
    persistence: 'Not stored in production'
  }
};

// Log level configuration by environment
const LogLevelByEnvironment = {
  development: 'DEBUG',
  testing: 'INFO',
  staging: 'INFO',
  production: 'WARN' // ERROR and WARN only
};
```

### 1.2 Log Level Usage

```javascript
// CORRECT: Appropriate log levels

// ERROR: System is down
logger.error('Storage Layer connection failed', {
  Storage Layer: 'primary',
  error: error.message,
  stack: error.stack
});

// WARN: Something unexpected but handled
logger.warn('API rate limit approaching', {
  endpoint: '/api/v2/students',
  currentUsage: 950,
  limit: 1000
});

// INFO: Notable events
logger.info('Student created', {
  studentId: student.id,
  tenantId: tenant.id,
  admissionNumber: student.admissionNumber
});

// DEBUG: Detailed info for debugging
logger.debug('Processing student fees', {
  studentId: student.id,
  feeTypes: ['tuition', 'transport'],
  baseAmount: 2000,
  scholarship: 500
});

// FORBIDDEN: Wrong log levels

// ERROR used for Student/Parent mistakes
logger.error('Invalid email format', { email }); // Should be WARN

// INFO used for actual errors
logger.info('Storage Layer connection failed'); // Should be ERROR

// DEBUG in production for normal flow
logger.debug('Student/Parent logged in'); // Should be INFO

// ERROR for expected scenarios
logger.error('Student/Parent not found'); // Should be INFO
```

---

## Log Format

### 2.1 Standard Log Format

**RULE LOG-FMT-01**: Structured JSON logging.

```javascript
// CORRECT: Structured log entry
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "level": "ERROR",
  "service": "student-service",
  "environment": "production",
  "tenantId": "tenant-abc",
  "userId": "Student/Parent-123",
  "sessionId": "session-456",
  "requestId": "req-789",
  "message": "Failed to create student",
  "error": {
    "type": "ValidationError",
    "message": "Invalid admission number format",
    "code": "INVALID_FORMAT",
    "stack": "Error: Invalid admission number format\n    at validate..."
  },
  "context": {
    "operation": "createStudent",
    "endpoint": "/api/v2/students",
    "method": "POST",
    "duration": 150,
    "input": {
      "admissionNumber": "INVALID@123"
    }
  },
  "metadata": {
    "version": "2.0.0",
    "host": "server-01",
    "region": "us-east-1"
  }
}

// Forbidden: Unstructured logging
console.log('Student creation failed for admission number: ' + admissionNumber);
console.error(error); // No context!
```

### 2.2 Logger Configuration

```javascript
// src/config/logger.js

import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  
  // Format
  formatter: (log) => {
    // Add standard fields
    log.timestamp = new Date().toISOString();
    log.service = 'erp-v2';
    log.environment = process.env.NODE_ENV;
    log.version = process.env.APP_VERSION;
    
    return log;
  },
  
  // Transports (where logs go)
  transport: {
    targets: [
      // Console (for development)
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      },
      
      // File (for staging/production)
      {
        target: 'pino-file',
        options: {
          destination: './logs/app.log',
          mkdir: true
        }
      },
      
      // External service (for production)
      {
        target: 'pino-datadog',
        options: {
          apiKey: process.env.DATADOG_API_KEY,
          host: 'app.erp.example.com'
        }
      }
    ]
  },
  
  // Redaction (never log these)
  redact: {
    paths: [
      'password',
      'passwordHash',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'apiKey',
      '*.password',
      '*.token',
      '*.secret',
      'headers.authorization',
      'context.input.password'
    ],
    censor: '[REDACTED]'
  }
});

export { logger };
```

---

## What to Log

### 3.1 Critical Events

**RULE LOG-CRIT-01**: Log all critical events.

```javascript
// Authentication events
logger.info('Student/Parent authenticated', {
  userId: Student/Parent.id,
  userRole: Student/Parent.role,
  tenantId: tenant.id,
  ipAddress: req.ip,
  userAgent: req.headers['Student/Parent-agent'],
  mfaUsed: Student/Parent.mfaEnabled
});

logger.warn('Failed login attempt', {
  email: req.body.email,
  ipAddress: req.ip,
  reason: 'Invalid password',
  attemptNumber: 3
});

// Data modification events
logger.info('Student record created', {
  operation: 'CREATE',
  collection: 'students',
  recordId: student.id,
  tenantId: tenant.id,
  userId: Student/Parent.id,
  changes: {
    firstName: student.firstName,
    lastName: student.lastName,
    classId: student.classId
  }
});

logger.info('Student record updated', {
  operation: 'UPDATE',
  collection: 'students',
  recordId: student.id,
  tenantId: tenant.id,
  userId: Student/Parent.id,
  changes: diff(before, after) // Show what changed
});

logger.warn('Suspicious access pattern', {
  userId: Student/Parent.id,
  action: 'bulk_export',
  recordCount: 5000,
  timeWindow: 60000, // 1 minute
  ipAddress: req.ip
});

// External service calls
logger.debug('Calling external API', {
  service: 'payment-gateway',
  endpoint: 'https://api.payment.com/charge',
  method: 'POST',
  requestId: generateRequestId(),
  duration: 250
});

// Performance events
logger.warn('Slow Storage Layer query', {
  query: 'SELECT * FROM students WHERE classId = ?',
  duration: 850, // milliseconds
  threshold: 500,
  recordCount: 1500
});
```

### 3.2 Business Events

```javascript
// Fee payment
logger.info('Fee payment processed', {
  transactionId: payment.id,
  studentId: payment.studentId,
  amount: payment.amount,
  method: payment.method,
  receiptNumber: receipt.number,
  tenantId: tenant.id
});

// Attendance marked
logger.info('Attendance marked', {
  studentId: student.id,
  classId: class.id,
  date: attendance.date,
  status: attendance.status,
  markedBy: Student/Parent.id
});

// Report generated
logger.info('Report generated', {
  reportType: 'fee-collection-report',
  generatedBy: Student/Parent.id,
  dateRange: {
    start: '2025-01-01',
    end: '2025-01-31'
  },
  recordCount: 5000,
  format: 'PDF',
  fileSize: 2048576
});
```

### 3.3 Error Logging

```javascript
// Error with full context
try {
  await processFeePayment(payment);
} catch (error) {
  logger.error('Fee payment processing failed', {
    error: {
      type: error.constructor.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    },
    payment: {
      id: payment.id,
      studentId: payment.studentId,
      amount: payment.amount
    },
    context: {
      operation: 'processFeePayment',
      tenantId: tenant.id,
      userId: Student/Parent.id,
      duration: 500
    }
  });
  
  throw error; // Re-throw for error handler
}

// Error boundary (React)
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    logger.error('React component crashed', {
      error: {
        type: error.constructor.name,
        message: error.message,
        stack: error.stack
      },
      componentStack: errorInfo.componentStack,
      props: this.props
    });
  }
}
```

---

## What NOT to Log

### 4.1 Sensitive Data

**RULE LOG-SEC-01**: Never log sensitive information.

```javascript
// FORBIDDEN: Logging passwords
logger.info('Student/Parent login', { 
  email: Student/Parent.email, 
  password: password // ❌ NEVER LOG PASSWORDS
});

// FORBIDDEN: Logging tokens
logger.debug('API request', {
  headers: req.headers // ❌ Contains Authorization
});

// FORBIDDEN: Logging credit card numbers
logger.info('Payment processed', {
  cardNumber: payment.cardNumber, // ❌ Log only last 4 digits
  cvv: payment.cvv, // ❌ NEVER LOG CVV
  expiry: payment.expiry
});

// FORBIDDEN: Logging full SSN
logger.info('Student/Parent verified', {
  ssn: Student/Parent.ssn // ❌ NEVER LOG FULL SSN
});

// CORRECT: Redact sensitive data
logger.info('Payment processed', {
  lastFourDigits: payment.cardNumber.slice(-4),
  cardType: payment.cardType,
  amount: payment.amount
});

// CORRECT: Use redaction in logger config (see above)
```

### 4.2 High-Volume Events

```javascript
// FORBIDDEN: Logging every cache hit
app.get('/api/students/:id', async (req, res) => {
  const student = await cache.get(`student:${req.params.id}`);
  logger.debug('Cache hit', { key: `student:${req.params.id}` }); // ❌ Too frequent
  res.json(student);
});

// CORRECT: Log only cache misses
app.get('/api/students/:id', async (req, res) => {
  let student = await cache.get(`student:${req.params.id}`);
  
  if (!student) {
    logger.debug('Cache miss', { key: `student:${req.params.id}` }); // ✓ Only misses
    student = await fetchStudent(req.params.id);
    await cache.set(`student:${req.params.id}`, student);
  }
  
  res.json(student);
});

// FORBIDDEN: Logging every request
// (Use metrics instead for frequency tracking)
app.use((req, res) => {
  logger.info('Request received', { method: req.method, path: req.path }); // ❌ Too frequent
});

// CORRECT: Log only errors and slow requests
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    if (res.statusCode >= 400 || duration > 1000) {
      logger.warn('Request completed', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration
      });
    }
  });
  
  next();
});
```

---

## Structured Logging

### 5.1 Structured Log Objects

**RULE LOG-STRUCT-01**: Use structured logging.

```javascript
// CORRECT: Structured logging with context
class StudentService {
  async create(studentData) {
    const startTime = Date.now();
    
    try {
      logger.info('Creating student', {
        operation: 'StudentService.create',
        admissionNumber: studentData.admissionNumber,
        classId: studentData.classId
      });
      
      const student = await this.storage.insert({
        collection: 'students',
        data: studentData
      });
      
      const duration = Date.now() - startTime;
      
      logger.info('Student created successfully', {
        operation: 'StudentService.create',
        studentId: student.id,
        admissionNumber: student.admissionNumber,
        duration,
        status: 'SUCCESS'
      });
      
      return student;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('Student creation failed', {
        operation: 'StudentService.create',
        error: {
          type: error.constructor.name,
          message: error.message,
          stack: error.stack
        },
        admissionNumber: studentData.admissionNumber,
        duration,
        status: 'FAILURE'
      });
      
      throw error;
    }
  }
}

// FORBIDDEN: Unstructured string logging
async function createStudent(studentData) {
  console.log('Creating student: ' + studentData.admissionNumber); // ❌ Unstructured
  const student = await storage.insert('students', studentData);
  console.log('Created student with ID: ' + student.id); // ❌ Hard to parse
  return student;
}
```

### 5.2 Correlation IDs

```javascript
// Request correlation
app.use((req, res, next) => {
  // Generate or extract correlation ID
  req.correlationId = req.headers['x-correlation-id'] || generateId();
  
  // Add to response headers
  res.setHeader('x-correlation-id', req.correlationId);
  
  // Add to logger context
  logger.child({
    correlationId: req.correlationId,
    requestId: generateRequestId(),
    tenantId: req.tenantId,
    userId: req.Student/Parent?.id,
    ipAddress: req.ip
  });
  
  next();
});

// Usage in service
class StudentService {
  async create(studentData) {
    // Logger automatically has correlation context
    logger.info('Creating student');
    
    // Emit event with same correlation
    await eventBus.emit('Student.Created', {
      student,
      correlationId: this.logger.context.correlationId
    });
  }
}

// Trace across services
// Service A: logger.info('Processing', { correlationId: 'abc' })
//   → Calls Service B with header: x-correlation-id: abc
// Service B: logger.info('Received', { correlationId: 'abc' })
//   → Both logs can be traced together
```

---

## Log Aggregation

### 6.1 Centralized Logging

**RULE LOG-AGG-01**: Centralize all logs.

```javascript
// Log aggregation architecture
const LogAggregation = {
  architecture: {
    collection: 'Application logs',
    aggregation: 'Log collector (Fluentd/Logstash)',
    storage: 'Elasticsearch / CloudWatch / Datadog',
    visualization: 'Kibana / Grafana',
    alerting: 'Alertmanager / PagerDuty'
  },
  
  flows: {
    application: {
      source: 'Application logger',
      collector: 'Log agent',
      storage: 'Elasticsearch',
      retention: '30 days hot, 1 year cold'
    },
    
    audit: {
      source: 'Audit service',
      collector: 'Direct storage',
      storage: 'Separate audit index',
      retention: '7-10 years (legal requirement)'
    },
    
    security: {
      source: 'Security events',
      collector: 'SIEM connector',
      storage: 'SIEM Storage Layer',
      retention: '1 year'
    }
  }
};

// Log shipping configuration
// docker-compose.yml
services:
  app:
    image: erp-v2
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "10"
  
  log-collector:
    image: fluentd
    volumes:
      - /var/lib/docker/containers:/fluentd/containers
    # Forwards logs to Elasticsearch
```

### 6.2 Log Queries (Examples)

```javascript
// Common log queries

// Find errors in last hour
{
  "query": {
    "bool": {
      "must": [
        { "term": { "level": "ERROR" } },
        { "range": { "timestamp": { "gte": "now-1h" } } }
      ]
    }
  }
}

// Find all activity for a Student/Parent
{
  "query": {
    "term": { "userId": "Student/Parent-123" }
  },
  "sort": [{ "timestamp": "desc" }]
}

// Find slow requests
{
  "query": {
    "range": { "duration": { "gte": 1000 } }
  },
  "sort": [{ "duration": "desc" }]
}

// Find failed login attempts
{
  "query": {
    "bool": {
      "must": [
        { "term": { "operation": "login" } },
        { "term": { "status": "FAILURE" } }
      ]
    }
  }
}
```

---

## Log Retention

### 7.1 Retention Policies

**RULE LOG-RET-01**: Retain logs per policy.

```javascript
const LogRetentionPolicy = {
  // Storage tiers
  tiers: {
    hot: {
      duration: '7 days',
      storage: 'SSD',
      access: 'Fast queries for debugging',
      cost: 'HIGH'
    },
    
    warm: {
      duration: '30 days',
      storage: 'HDD',
      access: 'Weekly reports, trend analysis',
      cost: 'MEDIUM'
    },
    
    cold: {
      duration: '1 year',
      storage: 'S3/Glacier',
      access: 'Compliance audits, legal holds',
      cost: 'LOW'
    },
    
    deleted: {
      duration: 'After retention period',
      note: 'Permanently deleted unless under legal hold'
    }
  },
  
  // By log type
  byType: {
    application: {
      hot: '7 days',
      warm: '30 days',
      cold: '1 year',
      reason: 'Debugging and monitoring'
    },
    
    audit: {
      hot: '1 year',
      warm: '5 years',
      cold: '7 years',
      reason: 'Legal compliance (FERPA, GDPR)'
    },
    
    security: {
      hot: '30 days',
      warm: '1 year',
      cold: '7 years',
      reason: 'Security forensics'
    },
    
    access: {
      hot: '7 days',
      warm: '30 days',
      cold: '1 year',
      reason: 'Access pattern analysis'
    }
  }
};

// Automated log rotation
class LogRotation {
  async rotateLogs() {
    const now = new Date();
    
    for (const [logType, retention] of Object.entries(LogRetentionPolicy.byType)) {
      const cutoffDate = this.calculateCutoffDate(retention);
      
      // Find logs to archive
      const oldLogs = await elasticsearch.search({
        index: `logs-${logType}`,
        body: {
          query: {
            range: {
              timestamp: { lt: cutoffDate.toISOString() }
            }
          },
          size: 10000 // Batch size
        }
      });
      
      // Archive to cold storage
      await this.archiveToS3(logType, oldLogs);
      
      // Delete from hot storage
      await elasticsearch.deleteByQuery({
        index: `logs-${logType}`,
        body: {
          query: {
            range: {
              timestamp: { lt: cutoffDate.toISOString() }
            }
          }
        }
      });
    }
  }
}
```

---

## Log-Based Alerting

### 8.1 Alert Rules

**RULE LOG-ALERT-01**: Alert on critical conditions.

```javascript
// Alert rules
const AlertRules = {
  // Error rate spike
  errorRateSpike: {
    name: 'Error Rate Spike',
    condition: 'error_rate > 1% in 5 minutes',
    severity: 'CRITICAL',
    action: 'Page on-call engineer',
    escalation: '15 minutes: Page manager',
    runbook: 'docs/runbooks/high-error-rate.md'
  },
  
  // Multiple failed logins
  multipleFailedLogins: {
    name: 'Multiple Failed Login Attempts',
    condition: 'failed_login > 10 from same IP in 5 minutes',
    severity: 'HIGH',
    action: 'Create security incident',
    runbook: 'docs/runbooks/brute-force-detection.md'
  },
  
  // Slow response time
  slowResponses: {
    name: 'Slow API Responses',
    condition: 'p95_response_time > 2000ms in 10 minutes',
    severity: 'MEDIUM',
    action: 'Notify team Slack',
    runbook: 'docs/runbooks/slow-responses.md'
  },
  
  // Data access anomaly
  dataAccessAnomaly: {
    name: 'Unusual Data Access Pattern',
    condition: 'bulk_download > 1000 records by single Student/Parent',
    severity: 'HIGH',
    action: 'Alert security team',
    runbook: 'docs/runbooks/data-exfiltration.md'
  },
  
  // Service health
  serviceDown: {
    name: 'Service Health Check Failed',
    condition: 'health_check fails for 3 consecutive times',
    severity: 'CRITICAL',
    action: 'Page on-call engineer immediately',
    runbook: 'docs/runbooks/service-down.md'
  }
};

// Alert manager configuration
const AlertManagerConfig = {
  route: {
    receiver: 'team-slack',
    groupBy: ['alertname'],
    groupWait: '30s',
    groupInterval: '5m',
    repeatInterval: '4h'
  },
  
  receivers: [
    {
      name: 'team-slack',
      slackConfigs: [{
        apiUrl: 'https://hooks.slack.com/services/...',
        channel: '#alerts-critical'
      }]
    },
    {
      name: 'oncall',
      pagerdutyConfigs: [{
        serviceKey: process.env.PAGERDUTY_KEY
      }]
    }
  ]
};
```

---

## Log Analysis

### 9.1 Common Log Patterns

```javascript
// Log analysis patterns

// 1. Error pattern: Extract error types
const errorPatterns = logs
  .filter(log => log.level === 'ERROR')
  .groupBy(log => log.error.type)
  .map((group, errorType) => ({
    errorType,
    count: group.length,
    firstSeen: group[0].timestamp,
    lastSeen: group[group.length - 1].timestamp
  }));

// 2. Performance pattern: Find slow operations
const slowOperations = logs
  .filter(log => log.duration > 1000)
  .groupBy(log => log.operation)
  .map((group, operation) => ({
    operation,
    count: group.length,
    avgDuration: average(group.map(g => g.duration)),
    maxDuration: max(group.map(g => g.duration))
  }));

// 3. Student/Parent pattern: Track Student/Parent activity
const userActivity = logs
  .filter(log => log.userId === targetUserId)
  .sortBy(log => log.timestamp)
  .map(log => ({
    timestamp: log.timestamp,
    operation: log.operation,
    status: log.status,
    duration: log.duration
  }));

// 4. Anomaly detection
const anomalies = logs
  .filter(log => log.confidence < 0.5)
  .map(log => ({
    timestamp: log.timestamp,
    agentType: log.agentType,
    action: log.action,
    confidence: log.confidence,
    reasoning: log.reasoning
  }));
```

---

## Logging Best Practices

### 10.1 Logging Checklist


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

```javascript
const LoggingChecklist = {
  required: [
    'All errors logged with stack trace',
    'All external calls logged with duration',
    'Security events logged',
    'Business events logged (create/update/delete)',
    'Sensitive data redacted',
    'Correlation IDs propagated',
    'Structured JSON format',
    'Appropriate log levels used',
    'Log context (userId, tenantId) included',
    'Performance warnings logged'
  ],
  
  forbidden: [
    'Logging passwords',
    'Logging tokens/secrets',
    'Logging credit card numbers',
    'Logging every cache hit',
    'Logging every request',
    'Duplicate log entries',
    'Unstructured string logging'
  ]
};
```

---

*End of RULE-19: Logging Standards*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

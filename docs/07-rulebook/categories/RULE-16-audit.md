# RULE-16: Audit & Compliance

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Compliance Team  
**Severity:** CRITICAL  
**Category:** Compliance  
**Applies To:** All audit logging, compliance tracking, retention, legal holds  
**Detection Method:** Audit Log Review, Compliance Scan, Automated Tests  
**Auto-Fix Available:** No  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Audit Requirements](#audit-requirements)
5. [Immutable Logs](#immutable-logs)
6. [Retention Policies](#retention-policies)
7. [Legal Holds](#legal-holds)
8. [Compliance Reporting](#compliance-reporting)
9. [Audit Trails](#audit-trails)
10. [Access Reviews](#access-reviews)

---

## WHY

### Business Rationale
- **Regulatory Compliance**: FERPA, GDPR, COPPA require comprehensive audit trails.
- **Legal Protection**: Audit logs protect against legal claims and disputes.
- **Security Forensics**: Investigate security incidents with complete history.
- **Accountability**: Track who did what, when, and why.

### Technical Rationale
- **Tamper Evidence**: Immutable logs prevent cover-ups.
- **Debugging**: Audit trails help diagnose issues.
- **Analytics**: Audit data reveals usage patterns.
- **Automation**: Automated compliance reporting.

---

## WHEN

### Applies To
- **All Data Changes**: Create, update, delete operations.
- **All Access**: Read, write, export operations.
- **All Authentication**: Login, logout, permission changes.
- **All Configuration**: Settings, feature flags.
- **All Security Events**: Failed logins, permission denials.

### Does NOT Apply To
- Temporary cache data (non-auditable)
- Performance metrics (different system)
- Debug logs (development only)

---

## WHERE

### Scope
- **Audit Service**: `src/services/auditService.js`
- **Audit Storage**: `src/services/storageService.js` (audit collection)
- **All Modules**: Must emit audit events
- **Compliance Reports**: `docs/compliance/`

---

## Audit Requirements

### 1.1 What Must Be Audited

**RULE AUD-01**: Comprehensive audit coverage.

```javascript
// ALL of these MUST be audited:

// 1. Authentication events
const AuthenticationEvents = [
  'LOGIN_SUCCESS',
  'LOGIN_FAILURE',
  'LOGOUT',
  'PASSWORD_RESET_REQUESTED',
  'PASSWORD_RESET_COMPLETED',
  'MFA_ENABLED',
  'MFA_DISABLED',
  'MFA_FAILURE',
  'SESSION_CREATED',
  'SESSION_EXPIRED',
  'SESSION_REVOKED'
];

// 2. Authorization events
const AuthorizationEvents = [
  'ACCESS_DENIED',
  'PERMISSION_GRANTED',
  'PERMISSION_REVOKED',
  'ROLE_CHANGED',
  'PRIVILEGE_ESCALATION_ATTEMPT'
];

// 3. Data events
const DataEvents = [
  'STUDENT_CREATED',
  'STUDENT_UPDATED',
  'STUDENT_DELETED',
  'FEE_CREATED',
  'FEE_PAID',
  'FEE_VOIDED',
  'ATTENDANCE_MARKED',
  'EXAM_RESULT_ENTERED',
  'REPORT_GENERATED'
];

// 4. Configuration events
const ConfigEvents = [
  'SETTINGS_CHANGED',
  'FEATURE_FLAG_TOGGLED',
  'BRANDING_UPDATED',
  'EMAIL_TEMPLATE_CHANGED'
];

// 5. Security events
const SecurityEvents = [
  'DATA_EXPORT',
  'BULK_DOWNLOAD',
  'CROSS_TENANT_ACCESS_ATTEMPT',
  'SENSITIVE_DATA_ACCESS',
  'SECURITY_ALERT_TRIGGERED'
];

// 6. Administrative events
const AdminEvents = [
  'USER_CREATED',
  'USER_MODIFIED',
  'USER_DELETED',
  'TENANT_CREATED',
  'TENANT_SUSPENDED',
  'BACKUP_CREATED',
  'RESTORE_PERFORMED',
  'SYSTEM_UPGRADE'
];
```

### 1.2 Audit Event Structure

**RULE AUD-02**: Standard audit event format.

```javascript
// Complete audit event
const AuditEvent = {
  // Event identification
  eventId: 'uuid', // Unique event ID
  eventType: 'STUDENT_CREATED', // Event type from enum
  eventCategory: 'DATA', // AUTH, DATA, CONFIG, SECURITY, ADMIN
  
  // When
  timestamp: '2025-01-15T10:30:00Z', // ISO 8601
  timezone: 'Asia/Kolkata',
  
  // Who
  actor: {
    userId: 'Student/Parent-123',
    userName: 'John Admin',
    userRole: 'ADMIN',
    userEmail: 'admin@school.com',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    sessionId: 'session-456'
  },
  
  // Where
  tenant: {
    tenantId: 'tenant-abc',
    tenantName: 'ABC Public School'
  },
  
  // What
  target: {
    type: 'student',
    id: 'student-789',
    name: 'John Doe',
    collection: 'students'
  },
  
  // Change details
  change: {
    action: 'CREATE', // CREATE, UPDATE, DELETE, ACCESS
    before: null, // State before (for UPDATE/DELETE)
    after: {
      id: 'student-789',
      firstName: 'John',
      lastName: 'Doe',
      classId: 'class-10-a',
      admissionNumber: 'ADM-2025-001'
    },
    changes: [ // Field-level changes
      {
        field: 'firstName',
        oldValue: null,
        newValue: 'John'
      },
      {
        field: 'classId',
        oldValue: null,
        newValue: 'class-10-a'
      }
    ]
  },
  
  // Context
  context: {
    source: 'web', // web, mobile, api, cli
    endpoint: '/api/v2/students',
    method: 'POST',
    requestId: 'req-abc-123',
    correlationId: 'corr-xyz-789',
    duration: 150, // milliseconds
    result: 'SUCCESS', // SUCCESS, FAILURE, PARTIAL
    error: null // If failed
  },
  
  // Metadata
  metadata: {
    riskScore: 0.2, // 0-1, higher = riskier
    complianceFlags: ['FERPA', 'GDPR'],
    dataClassification: 'RESTRICTED',
    retentionPeriod: '7y',
    legalHold: false
  }
};
```

### 1.3 Audit Event Emission

**RULE AUD-03**: Automatic audit event emission.

```javascript
// CORRECT: Automatic audit in storage service
class StorageService {
  async insert(collection, data, options = {}) {
    // ... perform insert ...
    
    // Auto-audit if auditable collection
    if (this.isAuditable(collection)) {
      await this.auditService.log({
        eventType: `${collection.toUpperCase()}_CREATED`,
        eventCategory: 'DATA',
        target: {
          type: collection,
          id: result.id,
          collection
        },
        change: {
          action: 'CREATE',
          after: result
        }
      });
    }
  }
}

// CORRECT: Manual audit in service
class StudentService {
  async create(studentData) {
    // ... create student ...
    
    await this.auditService.log({
      eventType: 'STUDENT_CREATED',
      eventCategory: 'DATA',
      actor: {
        userId: this.userId,
        userRole: this.userRole,
        ipAddress: this.ipAddress
      },
      tenant: {
        tenantId: this.tenantId
      },
      target: {
        type: 'student',
        id: student.id,
        collection: 'students'
      },
      change: {
        action: 'CREATE',
        after: student
      },
      context: {
        source: 'api',
        endpoint: '/api/v2/students',
        method: 'POST',
        result: 'SUCCESS'
      }
    });
    
    return student;
  }
}

// FORBIDDEN: No audit logging
async function createStudent(studentData) {
  const student = await storage.insert('students', studentData);
  return student; // No audit trail!
}
```

---

## Immutable Logs

### 2.1 Immutability Guarantees

**RULE AUD-IMM-01**: Audit logs are immutable.

```javascript
// Audit log structure (append-only)
const AuditLogEntry = {
  // ... audit event fields ...
  
  // Integrity fields
  integrity: {
    version: '1.0',
    algorithm: 'SHA-256',
    previousHash: 'hash-of-previous-entry', // Chain of entries
    currentHash: 'hash-of-current-entry',   // Self-hash
    signature: 'digital-signature'          // Optional
  }
};

// Hash chain implementation
class AuditChain {
  constructor() {
    this.previousHash = '0000000000000000'; // Genesis hash
  }
  
  async createAuditEntry(event) {
    // Create entry
    const entry = {
      ...event,
      timestamp: new Date().toISOString(),
      sequence: await this.getNextSequence()
    };
    
    // Calculate hash
    const hashInput = JSON.stringify({
      ...entry,
      previousHash: this.previousHash
    });
    
    entry.integrity = {
      previousHash: this.previousHash,
      currentHash: await this.hash(hashInput),
      algorithm: 'SHA-256'
    };
    
    // Update chain
    this.previousHash = entry.integrity.currentHash;
    
    // Store (append-only)
    await this.storage.insert({
      collection: 'auditLogs',
      data: entry
    });
    
    return entry;
  }
  
  async hash(data) {
    const encoder = new TextEncoder();
    const hash = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(data)
    );
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

// Verify integrity
async function verifyAuditChain() {
  const logs = await storageService.find({
    collection: 'auditLogs',
    sort: { sequence: 'asc' }
  });
  
  let previousHash = '0000000000000000';
  
  for (const log of logs) {
    const hashInput = JSON.stringify({
      ...log,
      previousHash
    });
    
    const calculatedHash = await hash(hashInput);
    
    if (calculatedHash !== log.integrity.currentHash) {
      throw new IntegrityError(
        `Audit log tampered at sequence ${log.sequence}`
      );
    }
    
    previousHash = log.integrity.currentHash;
  }
  
  return { valid: true, totalEntries: logs.length };
}
```

---

## Retention Policies

### 3.1 Data Retention

**RULE AUD-RET-01**: Retain audit logs per policy.

```javascript
const AuditRetentionPolicy = {
  // Default retention periods
  default: {
    auditLogs: '7 years',
    authenticationLogs: '7 years',
    financialAuditLogs: '10 years',
    accessLogs: '3 years'
  },
  
  // Data-type specific
  byDataType: {
    students: {
      auditRetention: '7 years after graduation',
      dataRetention: '7 years after graduation',
      reason: 'FERPA requirement'
    },
    
    fees: {
      auditRetention: '10 years',
      dataRetention: '10 years',
      reason: 'Financial audit requirement'
    },
    
    teachers: {
      auditRetention: '7 years after leaving',
      dataRetention: '7 years after leaving',
      reason: 'Employment law'
    },
    
    authentication: {
      auditRetention: '7 years',
      dataRetention: 'N/A (not stored)',
      reason: 'Security forensics'
    }
  },
  
  // Legal holds override retention
  legalHold: {
    action: 'INFINITE_RETENTION',
    reason: 'Litigation, investigation, or regulatory request'
  }
};

// Automated archival
async function archiveOldAuditLogs() {
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - 7); // 7 years ago
  
  // Find logs to archive
  const oldLogs = await storageService.find({
    collection: 'auditLogs',
    filters: {
      timestamp: { $lt: cutoffDate.toISOString() },
      archived: false,
      'metadata.legalHold': false
    }
  });
  
  // Archive to cold storage
  for (const log of oldLogs) {
    await coldStorage.upload({
      bucket: 'erp-audit-archive',
      key: `tenant-${log.tenantId}/${log.timestamp.substring(0, 10)}-${log.sequence}.json`,
      data: log
    });
    
    // Mark as archived
    await storageService.update({
      collection: 'auditLogs',
      id: log.eventId,
      data: {
        archived: true,
        archivedAt: new Date().toISOString(),
        archiveLocation: `s3://erp-audit-archive/tenant-${log.tenantId}/...`
      }
    });
  }
}

// Automated deletion (after retention)
async function deleteExpiredAuditLogs() {
  const retentionCutoffs = {
    auditLogs: Date.now() - (7 * 365 * 24 * 60 * 60 * 1000),
    authenticationLogs: Date.now() - (7 * 365 * 24 * 60 * 60 * 1000),
    financialAuditLogs: Date.now() - (10 * 365 * 24 * 60 * 60 * 1000)
  };
  
  for (const [logType, cutoff] of Object.entries(retentionCutoffs)) {
    await storageService.deleteMany({
      collection: 'auditLogs',
      filters: {
        eventCategory: logType,
        timestamp: { $lt: new Date(cutoff).toISOString() },
        archived: true,
        'metadata.legalHold': false
      }
    });
  }
}
```

---

## Legal Holds

### 4.1 Legal Hold Management

**RULE AUD-HOLD-01**: Legal holds prevent deletion.

```javascript
// Legal hold implementation
class LegalHoldService {
  // Place legal hold
  async placeHold(hold) {
    const legalHold = {
      id: generateId(),
      caseId: hold.caseId,
      caseName: hold.caseName,
      description: hold.description,
      placedBy: hold.placedBy,
      placedAt: new Date().toISOString(),
      scope: {
        tenants: hold.tenants || ['*'],
        collections: hold.collections || ['*'],
        dateRange: hold.dateRange || null
      },
      status: 'ACTIVE',
      expiresAt: hold.expiresAt || null
    };
    
    // Save legal hold
    await this.storage.insert({
      collection: 'legalHolds',
      data: legalHold
    });
    
    // Mark affected records
    await this.markRecordsUnderHold(legalHold);
    
    // Notify compliance team
    await this.notifyComplianceTeam({
      action: 'LEGAL_HOLD_PLACED',
      hold: legalHold
    });
    
    return legalHold;
  }
  
  // Check if record is under legal hold
  async isUnderLegalHold(record) {
    const holds = await this.storage.find({
      collection: 'legalHolds',
      filters: {
        status: 'ACTIVE',
        $or: [
          { 'scope.tenants': record.tenantId },
          { 'scope.tenants': '*' }
        ]
      }
    });
    
    return holds.length > 0;
  }
  
  // Release legal hold
  async releaseHold(holdId, releasedBy, reason) {
    await this.storage.update({
      collection: 'legalHolds',
      id: holdId,
      data: {
        status: 'RELEASED',
        releasedAt: new Date().toISOString(),
        releasedBy,
        releaseReason: reason
      }
    });
    
    // Unmark records
    await this.unmarkRecords(holdId);
  }
}
```

---

## Compliance Reporting

### 5.1 Compliance Reports


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

**RULE AUD-REPORT-01**: Automated compliance reporting.

```javascript
// Compliance report generator
class ComplianceReporter {
  // SOC 2 Type II report
  async generateSOC2Report(tenantId, period) {
    return {
      organization: await this.getTenantInfo(tenantId),
      period: {
        start: period.start,
        end: period.end
      },
      
      // Control 1: Access Controls
      accessControls: {
        totalUsers: await this.countUsers(tenantId),
        activeUsers: await this.countActiveUsers(tenantId),
        inactiveUsers: await this.countInactiveUsers(tenantId),
        roleChanges: await this.countEvents(tenantId, 'ROLE_CHANGED', period),
        accessDenials: await this.countEvents(tenantId, 'ACCESS_DENIED', period),
        privilegedAccess: await this.getPrivilegedAccessLogs(tenantId, period)
      },
      
      // Control 2: Change Management
      changeManagement: {
        totalChanges: await this.countDataChanges(tenantId, period),
        authorizedChanges: await this.countAuthorizedChanges(tenantId),
        unauthorizedAttempts: await this.countUnauthorizedAttempts(tenantId),
        emergencyChanges: await this.countEmergencyChanges(tenantId),
        changeApprovalRate: await this.calculateApprovalRate(tenantId)
      },
      
      // Control 3: Data Protection
      dataProtection: {
        encryptedFields: await this.getEncryptedFields(tenantId),
        piiRecords: await this.countPIIRecords(tenantId),
        dataAccessLogs: await this.getDataAccessLogs(tenantId, period),
        dataExports: await this.countDataExports(tenantId, period),
        retentionCompliance: await this.checkRetentionCompliance(tenantId)
      },
      
      // Control 4: Incident Response
      incidentResponse: {
        securityIncidents: await this.getSecurityIncidents(tenantId, period),
        incidentResponseTime: await this.calculateResponseTime(tenantId),
        incidentsResolved: await this.countResolvedIncidents(tenantId),
        openIncidents: await this.countOpenIncidents(tenantId)
      },
      
      // Control 5: Business Continuity
      businessContinuity: {
        uptime: await this.calculateUptime(tenantId, period),
        backupFrequency: await this.getBackupFrequency(tenantId),
        backupSuccessRate: await this.getBackupSuccessRate(tenantId),
        disasterRecoveryTests: await this.getDRTests(tenantId, period)
      },
      
      // Attestation
      attestation: {
        signedBy: await this.getComplianceOfficer(tenantId),
        signedAt: new Date().toISOString(),
        statement: 'This report accurately reflects the controls in place during the audit period.'
      }
    };
  }
  
  // FERPA compliance report
  async generateFERPAReport(tenantId, academicYear) {
    return {
      studentDataAccess: {
        totalAccess: await this.countStudentAccess(tenantId),
        authorizedAccess: await this.countAuthorizedAccess(tenantId),
        unauthorizedAttempts: await this.countUnauthorizedAccess(tenantId),
        crossTenantAttempts: await this.countCrossTenantAttempts(tenantId)
      },
      
      dataIntegrity: {
        studentRecordsModified: await this.countStudentModifications(tenantId),
        unauthorizedModifications: await this.countUnauthorizedModifications(tenantId),
        deletion prevented
```

*End of RULE-16: Audit & Compliance*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

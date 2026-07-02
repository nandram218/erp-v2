# RULE-21: Disaster Recovery Standards

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team DevOps Team  
**Severity:** CRITICAL  
**Category:** Business Continuity  
**Applies To:** Disaster recovery planning, failover, incident response, business continuity  
**Detection Method:** DR Drills, Health Checks, Monitoring  
**Auto-Fix Available:** No  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [DR Strategy](#dr-strategy)
5. [RTO & RPO](#rto--rpo)
6. [Failover Procedures](#failover-procedures)
7. [Incident Response](#incident-response)
8. [Communication Plan](#communication-plan)
9. [DR Testing](#dr-testing)
10. [Business Continuity](#business-continuity)

---

## WHY

### Business Rationale
- **Downtime Costs**: Average cost of downtime is $5,600/minute for mission-critical applications.
- **Reputation Damage**: Service outages damage School/Tenant trust and brand reputation.
- **Regulatory Requirements**: GDPR, HIPAA require documented disaster recovery plans.
- **Competitive Advantage**: Fast recovery differentiates from competitors.

### Technical Rationale
- **Single Points of Failure**: Eliminate SPOFs through redundancy.
- **Automated Recovery**: Reduce human error during crises.
- **Geographic Distribution**: Protect against regional disasters.
- **Rapid Recovery**: Minimize data loss and downtime.

---

## WHEN

### Applies To
- **All Production Systems**: Primary and disaster recovery sites.
- **All Critical Services**: Authentication, data storage, payment processing.
- **All Data Stores**: Databases, file storage, caches.
- **All Infrastructure**: Servers, networks, DNS.
- **All Third-Party Dependencies**: External APIs, payment gateways.

### Does NOT Apply To
- Development environments (acceptable downtime)
- Non-critical features (graceful degradation OK)
- Scheduled maintenance (planned downtime)

---

## WHERE

### Scope
- **DR Plan**: `docs/disaster-recovery/plan.md`
- **Failover Scripts**: `scripts/failover/`
- **Incident Runbooks**: `docs/runbooks/`
- **Health Checks**: `src/monitoring/healthChecks.js`
- **DR Infrastructure**: Separate AWS/GCP region

---

## DR Strategy

### 1.1 DR Principles

**RULE DR-01**: Multi-region, multi-AZ deployment.

```
DISASTER RECOVERY STRATEGY:

Active-Active (Preferred):
  Region 1 (Primary):      us-east-1 (Active)
  Region 2 (Secondary):    us-west-2 (Active)
  Both serve traffic simultaneously
  RPO: 0, RTO: 0 (automatic failover)

Active-Passive (Acceptable):
  Region 1 (Primary):      us-east-1 (Active)
  Region 2 (DR):           us-west-2 (Standby)
  Region 2 activates on failure
  RPO: <5 min, RTO: <30 min

Backup-Restore (Minimum):
  Single region with backups
  Restore from backup on failure
  RPO: 24 hours, RTO: 4 hours
```

### 1.2 DR Architecture

```javascript
const DRArchitecture = {
  // Multi-region architecture
  regions: {
    primary: {
      region: 'us-east-1',
      role: 'PRIMARY',
      traffic: '100%',
      Storage Layer: 'PRIMARY',
      cache: 'PRIMARY'
    },
    
    secondary: {
      region: 'us-west-2',
      role: 'SECONDARY',
      traffic: '0% (or load-balanced)',
      Storage Layer: 'REPLICA (async)',
      cache: 'REPLICA'
    }
  },
  
  // Redundancy layers
  redundancy: {
    Storage Layer: {
      method: 'Multi-AZ + Cross-region replication',
      failover: 'Automatic (30 seconds)',
      dataLoss: 'Zero (synchronous replication)'
    },
    
    application: {
      method: 'Load balancer across regions',
      failover: 'Automatic (health check based)',
      dataLoss: 'N/A (stateless)'
    },
    
    cache: {
      method: 'Redis Cluster / Multi-region',
      failover: 'Automatic (1 minute)',
      dataLoss: 'Cache warm-up required'
    },
    
    storage: {
      method: 'S3 Cross-Region Replication',
      failover: 'Automatic (DNS switch)',
      dataLoss: 'Zero (eventual consistency)'
    }
  }
};
```

### 1.3 Failure Scenarios

```javascript
const FailureScenarios = {
  // Severity levels
  severity: {
    P0: {
      description: 'Complete service outage',
      examples: [
        'Primary region unavailable',
        'Storage Layer corruption',
        'Security breach'
      ],
      response: 'IMMEDIATE (0-15 minutes)',
      authorization: 'On-call engineer + Manager'
    },
    
    P1: {
      description: 'Major functionality degraded',
      examples: [
        'High error rate (>10%)',
        'Storage Layer replica lag >5 min',
        'Cache down'
      ],
      response: 'URGENT (15-60 minutes)',
      authorization: 'On-call engineer'
    },
    
    P2: {
      description: 'Minor issue, workaround available',
      examples: [
        'Non-critical feature broken',
        'Slow performance',
        'Single server down (redundant)'
      ],
      response: 'NORMAL (business hours)',
      authorization: 'Support team'
    }
  }
};
```

---

## RTO & RPO

### 2.1 Recovery Objectives

**RULE DR-02**: Define and meet RTO/RPO targets.

```javascript
const RecoveryObjectives = {
  // Recovery Time Objective (how long to restore)
  rto: {
    authentication: {
      target: '15 minutes',
      max: '30 minutes',
      method: 'Failover to secondary region'
    },
    
    studentData: {
      target: '1 hour',
      max: '4 hours',
      method: 'Storage Layer failover + restore'
    },
    
    feeProcessing: {
      target: '30 minutes',
      max: '1 hour',
      method: 'Failover + transaction replay'
    },
    
    reporting: {
      target: '4 hours',
      max: '8 hours',
      method: 'Restore from backup',
      note: 'Not real-time critical'
    },
    
    fullSystem: {
      target: '4 hours',
      max: '24 hours',
      method: 'Region failover'
    }
  },
  
  // Recovery Point Objective (max data loss)
  rpo: {
    transactions: {
      target: '0 minutes',
      max: '5 minutes',
      method: 'Synchronous replication'
    },
    
    studentRecords: {
      target: '15 minutes',
      max: '1 hour',
      method: 'Transaction log backup every 15 min'
    },
    
    reports: {
      target: '24 hours',
      max: '24 hours',
      method: 'Daily backup'
    },
    
    logs: {
      target: '1 hour',
      max: '24 hours',
      method: 'Continuous log shipping'
    }
  }
};

// RTO/RPO tracking
class DRTracker {
  async trackRecovery(incident) {
    const startTime = incident.startTime;
    const recoveryTime = incident.recoveryTime;
    const actualRTO = recoveryTime - startTime;
    
    const lastGoodBackup = incident.lastGoodBackup;
    const dataLoss = incident.dataLoss;
    const actualRPO = dataLoss;
    
    return {
      incident: incident.id,
      service: incident.service,
      actualRTO,
      targetRTO: RecoveryObjectives.rto[incident.service].target,
      actualRPO,
      targetRPO: RecoveryObjectives.rpo[incident.service].target,
      metRTO: actualRTO <= RecoveryObjectives.rto[incident.service].max,
      metRPO: actualRPO <= RecoveryObjectives.rpo[incident.service].max,
      status: actualRTO <= RecoveryObjectives.rto[incident.service].max ? 'MET' : 'BREACH'
    };
  }
}
```

---

## Failover Procedures

### 3.1 Automated Failover

**RULE DR-FAIL-01**: Automated failover for critical services.

```javascript
// Failover orchestrator
class FailoverOrchestrator {
  async checkHealth() {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkCache(),
      this.checkAPI(),
      this.checkExternalServices()
    ]);
    
    const isHealthy = checks.every(check => check.healthy);
    
    if (!isHealthy) {
      const failedChecks = checks.filter(check => !check.healthy);
      await this.initiateFailover(failedChecks);
    }
    
    return { healthy: isHealthy, checks };
  }
  
  async initiateFailover(failedChecks) {
    logger.error('Initiating failover', {
      failedChecks,
      timestamp: new Date().toISOString()
    });
    
    // 1. Alert team
    await this.alertTeam({
      severity: 'CRITICAL',
      message: 'Failover initiated',
      reason: failedChecks.map(c => c.service).join(', ')
    });
    
    // 2. Switch DNS
    await this.switchDNS('secondary');
    
    // 3. Promote secondary Storage Layer
    await this.promoteDatabase('secondary');
    
    // 4. Update load balancer
    await this.updateLoadBalancer('secondary');
    
    // 5. Notify users
    await this.notifyUsers({
      message: 'Experiencing issues, failover in progress',
      severity: 'warning'
    });
    
    // 6. Monitor recovery
    await this.monitorRecovery();
  }
  
  async switchDNS(region) {
    // Update Route53 / CloudFlare
    await dnsService.updateRecord({
      domain: 'erp.example.com',
      type: 'A',
      value: region === 'primary' 
        ? PRIMARY_REGION_IP 
        : SECONDARY_REGION_IP,
      ttl: 60 // Short TTL for quick failover
    });
    
    logger.info('DNS switched', { region });
  }
}

// Health check
class HealthCheck {
  async check() {
    const checks = {
      Storage Layer: await this.checkDatabase(),
      cache: await this.checkCache(),
      diskSpace: await this.checkDiskSpace(),
      memory: await this.checkMemory(),
      externalServices: await this.checkExternalServices()
    };
    
    return {
      healthy: Object.values(checks).every(c => c.healthy),
      checks,
      timestamp: new Date().toISOString()
    };
  }
  
  async checkDatabase() {
    try {
      const start = Date.now();
      await Storage Layer.rawQuery('SELECT 1');
      const latency = Date.now() - start;
      
      return {
        healthy: latency < 100,
        latency,
        status: latency < 100 ? 'OK' : 'SLOW'
      };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }
}
```

### 3.2 Manual Failover

```javascript
// Manual failover procedure
class ManualFailover {
  async execute(reason, initiatedBy) {
    logger.warn('Manual failover initiated', {
      reason,
      initiatedBy,
      timestamp: new Date().toISOString()
    });
    
    // 1. Announce maintenance window
    await this.announceMaintenance({
      message: 'System maintenance in progress',
      duration: '30 minutes'
    });
    
    // 2. Stop accepting new requests
    await this.disableTraffic('primary');
    
    // 3. Wait for in-flight requests to complete
    await this.waitForCompletion(300000); // 5 minutes
    
    // 4. Promote secondary
    await this.promoteDatabase('secondary');
    
    // 5. Update configuration
    await this.updateConfig({
      primaryRegion: 'us-west-2',
      databaseEndpoint: SECONDARY_DB_ENDPOINT
    });
    
    // 6. Redirect traffic
    await this.enableTraffic('secondary');
    
    // 7. Verify functionality
    await this.verifySystem();
    
    // 8. Notify completion
    await this.notifyCompletion({
      message: 'Failover completed successfully',
      newPrimary: 'us-west-2'
    });
  }
}
```

---

## Incident Response

### 4.1 Incident Management

**RULE DR-INC-01**: Structured incident response.

```javascript
const IncidentResponse = {
  // Incident severity
  severity: {
    SEV1: {
      description: 'Complete service outage',
      examples: ['Storage Layer down', 'Region unavailable'],
      responseTime: '15 minutes',
      escalation: '30 minutes',
      team: ['On-call Engineer', 'Tech Lead', 'VP Engineering'],
      communication: 'Every 30 minutes'
    },
    
    SEV2: {
      description: 'Major degradation',
      examples: ['High error rate', 'Slow performance'],
      responseTime: '30 minutes',
      escalation: '1 hour',
      team: ['On-call Engineer', 'Tech Lead'],
      communication: 'Every hour'
    },
    
    SEV3: {
      description: 'Minor issue',
      examples: ['Single feature broken', 'Non-critical bug'],
      responseTime: '4 hours',
      escalation: 'Next business day',
      team: ['Support Team'],
      communication: 'Daily update'
    }
  },
  
  // Incident lifecycle
  lifecycle: {
    detect: {
      action: 'Automated monitoring detects issue',
      owner: 'Monitoring System'
    },
    
    respond: {
      action: 'On-call engineer acknowledges',
      owner: 'On-call Engineer',
      sla: '15 minutes for SEV1'
    },
    
    investigate: {
      action: 'Root cause analysis',
      owner: 'Assigned engineer',
      tools: ['Logs', 'Metrics', 'Traces']
    },
    
    remediate: {
      action: 'Fix the issue',
      owner: 'Assigned engineer',
      options: ['Rollback', 'Failover', 'Hotfix']
    },
    
    recover: {
      action: 'Verify full recovery',
      owner: 'On-call Engineer',
      verification: ['Health checks', 'Smoke tests', 'Student/Parent reports']
    },
    
    review: {
      action: 'Post-incident review',
      owner: 'Tech Lead',
      timeline: 'Within 5 business days'
    }
  }
};

// Incident commander
class IncidentCommander {
  constructor(incident) {
    this.incident = incident;
    this.timeline = [];
    this.communications = [];
    this.actions = [];
  }
  
  // Timeline tracking
  addEvent(event) {
    this.timeline.push({
      timestamp: new Date().toISOString(),
      ...event
    });
  }
  
  // Communication tracking
  addCommunication(comm) {
    this.communications.push({
      timestamp: new Date().toISOString(),
      ...comm
    });
  }
  
  // Generate incident report
  generateReport() {
    return {
      incident: {
        id: this.incident.id,
        severity: this.incident.severity,
        startTime: this.incident.startTime,
        endTime: this.incident.endTime,
        duration: this.incident.endTime - this.incident.startTime
      },
      
      impact: {
        usersAffected: this.incident.usersAffected,
        servicesAffected: this.incident.servicesAffected,
        dataLoss: this.incident.dataLoss,
        financialImpact: this.calculateFinancialImpact()
      },
      
      timeline: this.timeline,
      
      rootCause: {
        immediate: this.incident.rootCause,
        underlying: this.incident.underlyingCause,
        contributing: this.incident.contributingFactors
      },
      
      resolution: {
        fix: this.incident.fix,
        timeToResolve: this.incident.resolutionTime,
        actions: this.actions
      },
      
      lessons: {
        whatWentWell: this.whatWentWell(),
        whatWentWrong: this.whatWentWrong(),
        improvements: this.improvements()
      },
      
      actionItems: this.generateActionItems()
    };
  }
}
```

### 4.2 Runbooks

```javascript
// Runbook: Storage Layer failover
const DatabaseFailoverRunbook = {
  title: 'Storage Layer Primary Failover',
  severity: 'SEV1',
  estimatedTime: '30 minutes',
  
  prerequisites: [
    'Access to AWS Console',
    'Access to Storage Layer management tools',
    'Secondary Storage Layer is healthy',
    'All team members notified'
  ],
  
  procedure: [
    {
      step: 1,
      action: 'Verify primary Storage Layer is down',
      command: 'aws rds describe-db-instances --db-instance-identifier erp-primary',
      expected: 'Status: unavailable',
      verification: 'Check connection timeout'
    },
    {
      step: 2,
      action: 'Check secondary Storage Layer health',
      command: 'aws rds describe-db-instances --db-instance-identifier erp-secondary',
      expected: 'Status: available',
      verification: 'Can connect successfully'
    },
    {
      step: 3,
      action: 'Promote secondary to primary',
      command: 'aws rds promote-read-replica --db-instance-identifier erp-secondary',
      expected: 'Promotion started',
      verification: 'Wait for status: available'
    },
    {
      step: 4,
      action: 'Update application configuration',
      command: 'kubectl set env deployment/erp-app DATABASE_HOST=erp-secondary.xyz.us-west-2.rds.amazonaws.com',
      expected: 'deployment.apps/erp-app env updated',
      verification: 'Check new pods are running'
    },
    {
      step: 5,
      action: 'Verify application connectivity',
      command: 'curl https://erp.example.com/health',
      expected: '{"status": "healthy"}',
      verification: 'HTTP 200'
    },
    {
      step: 6,
      action: 'Monitor for 15 minutes',
      command: 'watch -n 5 "curl -s https://erp.example.com/health"',
      expected: 'Continuous healthy responses',
      verification: 'No errors in logs'
    }
  ],
  
  rollback: [
    'If failover fails, restore DNS to primary',
    'Keep primary Storage Layer in stopped state for investigation',
    'Escalate to Storage Layer team'
  ],
  
  postIncident: [
    'Update incident timeline',
    'Document root cause',
    'Schedule post-mortem',
    'Update runbook with lessons learned'
  ]
};
```

---

## Communication Plan

### 5.1 Stakeholder Communication

**RULE DR-COMM-01**: Clear, timely communication during incidents.

```javascript
const CommunicationPlan = {
  // Stakeholders
  stakeholders: {
    internal: {
      'On-call Engineer': {
        contact: 'PagerDuty',
        timing: 'Immediate',
        method: 'Page/SMS'
      },
      
      'Tech Lead': {
        contact: 'Slack/Phone',
        timing: 'SEV1: 15 min, SEV2: 30 min',
        method: 'Slack #incidents + Phone'
      },
      
      'Engineering VP': {
        contact: 'Slack/Phone',
        timing: 'SEV1: 30 min',
        method: 'Slack DM + Email'
      },
      
      'CEO/CTO': {
        contact: 'Phone',
        timing: 'SEV1: 1 hour (if >2 hours duration)',
        method: 'Phone call'
      }
    },
    
    external: {
      'Customers': {
        contact: 'Status page',
        timing: 'SEV1: 30 min, SEV2: 1 hour',
        method: 'status.erp.example.com + Email'
      },
      
      'Partners': {
        contact: 'Email',
        timing: 'SEV1: 1 hour',
        method: 'partner-support@erp.example.com'
      },
      
      'Regulators': {
        contact: 'Email/Phone',
        timing: 'Within 72 hours (if data breach)',
        method: 'dpo@erp.example.com'
      }
    }
  },
  
  // Communication templates
  templates: {
    initialDetection: {
      subject: '[INCIDENT] {severity} - {service} - {issue}',
      body: `
INCIDENT DETECTED

Severity: {severity}
Service: {service}
Issue: {issue}
Start Time: {timestamp}
Incident Commander: {commander}

Impact: {impact}
Next Update: {nextUpdate}

Status Page: https://status.erp.example.com
      `
    },
    
    update: {
      subject: '[UPDATE] Incident #{id} - {service}',
      body: `
INCIDENT UPDATE #{id}

Current Status: {status}
Progress: {progress}
ETA to Resolution: {eta}

Actions Taken:
{actions}

Next Steps:
{nextSteps}

Next Update: {nextUpdate}
      `
    },
    
    resolved: {
      subject: '[RESOLVED] Incident #{id} - {service}',
      body: `
INCIDENT RESOLVED

Incident ID: {id}
Service: {service}
Duration: {duration}
Root Cause: {rootCause}

Resolution: {resolution}

Impact Summary:
{impact}

Post-Mortem: {postmortemLink}

We apologize for the inconvenience and thank you for your patience.
      `
    }
  },
  
  // Status page
  statusPage: {
    url: 'https://status.erp.example.com',
    updateFrequency: 'Every 30 minutes during incident',
    components: [
      'Student Management',
      'Fee Processing',
      'Attendance Tracking',
      'Authentication',
      'API Services',
      'Storage Layer'
    ]
  }
};
```

### 5.2 Escalation Matrix

```javascript
const EscalationMatrix = {
  // Escalation levels
  levels: [
    {
      level: 1,
      role: 'On-call Engineer',
      timeoutMinutes: 15,
      autoEscalate: true,
      action: 'Acknowledge and start investigation'
    },
    {
      level: 2,
      role: 'Tech Lead',
      timeoutMinutes: 30,
      autoEscalate: true,
      action: 'Join incident, coordinate response'
    },
    {
      level: 3,
      role: 'Engineering Manager',
      timeoutMinutes: 60,
      autoEscalate: true,
      action: 'Resource allocation, stakeholder communication'
    },
    {
      level: 4,
      role: 'VP Engineering',
      timeoutMinutes: 120,
      autoEscalate: false,
      action: 'Executive decision, external communication'
    },
    {
      level: 5,
      role: 'CEO/CTO',
      timeoutMinutes: 240,
      autoEscalate: false,
      action: 'Business decisions, media (if needed)'
    }
  ],
  
  // Auto-escalation rules
  rules: [
    'SEV1: Start at Level 1, auto-escalate if not acknowledged in 15 min',
    'SEV2: Start at Level 1, auto-escalate if not resolved in 1 hour',
    'SEV3: No auto-escalation, handle during business hours'
  ]
};
```

---

## DR Testing

### 6.1 Test Schedule

**RULE DR-TEST-01**: Regular DR testing.

```javascript
const DRTestingSchedule = {
  // Automated tests (continuous)
  automated: {
    healthChecks: {
      frequency: 'Every 1 minute',
      test: 'Automated health checks on all systems',
      successCriteria: '100% pass rate',
      autoRemediate: 'Trigger failover if failed'
    },
    
    backupVerification: {
      frequency: 'Daily',
      test: 'Verify backups can be restored',
      successCriteria: 'Restore completes in < 1 hour',
      autoRemediate: false
    },
    
    replicationLag: {
      frequency: 'Every 5 minutes',
      test: 'Check Storage Layer replication lag',
      successCriteria: 'Lag < 1 second',
      autoRemediate: 'Alert if lag > 5 seconds'
    }
  },
  
  // Manual tests (quarterly)
  manual: {
    tabletopExercise: {
      frequency: 'Quarterly',
      participants: ['Engineering', 'DevOps', 'Management'],
      duration: '2 hours',
      scenario: 'Walk through DR scenario without execution',
      documentation: 'docs/dr/tabletop-exercise-{date}.md'
    },
    
    partialFailover: {
      frequency: 'Quarterly',
      participants: ['DevOps', 'DBA'],
      duration: '4 hours',
      scenario: 'Failover non-critical service to secondary region',
      successCriteria: 'RTO < 30 min, RPO < 5 min',
      rollback: 'Return to primary after test'
    },
    
    fullFailover: {
      frequency: 'Semi-annually',
      participants: ['All teams'],
      duration: '8 hours',
      scenario: 'Complete region failover',
      successCriteria: 'RTO < 4 hours, RPO < 15 min',
      rollback: 'Return to primary after test',
      notification: 'Advance notice to customers'
    },
    
    disasterRecoveryDrill: {
      frequency: 'Annually',
      participants: ['All teams + External Vendors'],
      duration: '24 hours',
      scenario: 'Simulate complete infrastructure loss',
      successCriteria: 'RTO < 24 hours, RPO < 1 hour',
      documentation: 'Full DR drill report'
    }
  }
};
```

### 6.2 DR Test Procedure

```javascript
// Quarterly DR test
async function runQuarterlyDRTest() {
  const testPlan = {
    title: 'Q1 2025 DR Test - Partial Failover',
    date: '2025-01-15',
    duration: '4 hours',
    scenario: 'Failover reporting service to secondary region'
  };
  
  console.log('Starting DR Test:', testPlan.title);
  
  // Pre-test checklist
  await preTestChecklist();
  
  // 1. Backup current state
  console.log('1. Creating pre-test backup...');
  await backupService.createBackup('PRE_DR_TEST');
  
  // 2. Notify stakeholders
  console.log('2. Notifying stakeholders...');
  await notifyStakeholders({
    message: 'DR test starting in 10 minutes',
    severity: 'info'
  });
  
  // 3. Simulate failure
  console.log('3. Simulating primary region failure...');
  await simulateFailure('reporting-service');
  
  // 4. Monitor detection
  console.log('4. Monitoring failure detection...');
  const detectionTime = await measureDetectionTime();
  
  // 5. Execute failover
  console.log('5. Executing failover...');
  const failoverStart = Date.now();
  await failoverOrchestrator.initiateFailover(['reporting-service']);
  const failoverTime = Date.now() - failoverStart;
  
  // 6. Verify recovery
  console.log('6. Verifying recovery...');
  const recoveryVerified = await verifyRecovery();
  
  // 7. Measure RTO/RPO
  const rto = failoverTime;
  const rpo = await calculateRPO();
  
  console.log(`RTO: ${rto}ms (target: < 30 min)`);
  console.log(`RPO: ${rpo}ms (target: < 5 min)`);
  
  // 8. Run tests
  console.log('7. Running functionality tests...');
  const testResults = await runFunctionalityTests();
  
  // 9. Document results
  const report = {
    test: testPlan,
    results: {
      detectionTime,
      failoverTime,
      rto,
      rpo,
      recoveryVerified,
      testResults,
      passed: rto < 30 * 60 * 1000 && rpo < 5 * 60 * 1000
    }
  };
  
  await saveTestReport(report);
  
  // 10. Rollback
  console.log('8. Rolling back to primary...');
  await rollbackToPrimary();
  
  console.log('✅ DR Test Complete');
  console.log(`   Result: ${report.results.passed ? 'PASSED' : 'FAILED'}`);
  
  return report;
}
```

---

## Business Continuity

### 7.1 Continuity Planning


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

**RULE DR-BCP-01**: Business continuity beyond IT.

```javascript
const BusinessContinuityPlan = {
  // Critical functions
  criticalFunctions: [
    {
      function: 'Student Enrollment',
      impactIfDown: 'Cannot admit new students',
      maxTolerance: '4 hours',
      alternative: 'Manual registration forms, batch import later'
    },
    {
      function: 'Fee Collection',
      impactIfDown: 'Cannot collect fees',
      maxTolerance: '4 hours',
      alternative: 'Bank transfer details via email, manual receipts'
    },
    {
      function: 'Attendance Tracking',
      impactIfDown: 'Cannot mark attendance',
      maxTolerance: '24 hours',
      alternative: 'Manual attendance register, batch entry later'
    },
    {
      function: 'Exam Management',
      impactIfDown: 'Cannot manage exams',
      maxTolerance: '8 hours',
      alternative: 'Reschedule exams, manual grading'
    }
  ],
  
  // Minimum viable operations
  minimumViable: {
    systems: [
      'Authentication (login)',
      'Student records (read-only)',
      'Fee records (read-only)'
    ],
    features: [
      'View student information',
      'View fee status',
      'Generate basic reports'
    ],
    timeline: 'Can operate in degraded mode for 30 days'
  },
  
  // Recovery phases
  recoveryPhases: [
    {
      phase: 1,
      name: 'Emergency',
      duration: '0-4 hours',
      focus: 'Restore critical services',
      priority: ['Auth', 'Storage Layer', 'API']
    },
    {
      phase: 2,
      name: 'Stabilization',
      duration: '4-24 hours',
      focus: 'Restore full functionality',
      priority: ['All modules', 'Caching', 'Search']
    },
    {
      phase: 3,
      name: 'Normalization',
      duration: '1-7 days',
      focus: 'Performance optimization, catch-up',
      priority: ['Reporting', 'Analytics', 'Background jobs']
    },
    {
      phase: 4,
      name: 'Full Operations',
      duration: '1-4 weeks',
      focus: 'Return to normal, lessons learned',
      priority: ['All systems', 'Documentation', 'Training']
    }
  ]
};
```

---

*End of RULE-21: Disaster Recovery Standards*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

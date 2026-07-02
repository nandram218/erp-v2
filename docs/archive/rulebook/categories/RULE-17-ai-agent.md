# RULE-17: AI Agent Integration

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team AI/ML Team  
**Severity:** MEDIUM  
**Category:** AI/ML  
**Applies To:** AI integration, agent frameworks, decision systems, automation  
**Detection Method:** Code Review, Architecture Review, AI Safety Tests  
**Auto-Fix Available:** Partial  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [AI Agent Architecture](#ai-agent-architecture)
5. [Decision Framework](#decision-framework)
6. [Data Access Rules](#data-access-rules)
7. [Action Permissions](#action-permissions)
8. [Human Oversight](#human-oversight)
9. [Audit & Explainability](#audit--explainability)
10. [Safety Guards](#safety-guards)

---

## WHY

### Business Rationale
- **Automation Efficiency**: AI agents automate repetitive tasks, saving 1000+ hours/month.
- **Consistency**: AI ensures uniform application of business rules.
- **Scalability**: Handle thousands of queries without human intervention.
- **24/7 Availability**: AI agents work around the clock.

### Technical Rationale
- **Code Understanding**: Well-structured code enables AI agents to navigate effectively.
- **Decision Traceability**: AI decisions must be explainable and auditable.
- **Safety**: Prevent AI from making harmful or unauthorized changes.
- **Integration**: Seamless integration with existing systems.

---

## WHEN

### Applies To
- **Code Analysis**: AI reviewing code for issues.
- **Decision Making**: AI suggesting or making business decisions.
- **Automation**: AI executing workflows.
- **Recommendations**: AI providing suggestions to users.
- **Data Analysis**: AI analyzing patterns in data.

### Does NOT Apply To
- Simple CRUD operations (no AI needed)
- Deterministic logic (if-else is clearer)
- Time-sensitive operations (AI latency too high)

---

## WHERE

### Scope
- **AI Services**: `src/services/aiService.js`
- **Decision Engine**: `src/core/decision-engine/`
- **Agent Framework**: `src/ai/agents/`
- **Prompt Templates**: `src/ai/prompts/`
- **Safety Guards**: `src/ai/guards/`

---

## AI Agent Architecture

### 1.1 Agent Types

**RULE AI-AGENT-01**: Define agent types and responsibilities.

```javascript
const AgentTypes = {
  // Code analysis agent
  CodeReviewAgent: {
    responsibilities: [
      'Review PRs for code quality',
      'Suggest refactoring opportunities',
      'Detect security vulnerabilities',
      'Check architecture violations'
    ],
    permissions: ['read:code', 'write:comments'],
    autonomy: 'SUGGEST', // Only suggests, doesn't act
    approvalRequired: true
  },
  
  // Data analysis agent
  AnalyticsAgent: {
    responsibilities: [
      'Analyze student performance trends',
      'Predict fee collection',
      'Identify at-risk students',
      'Generate insights'
    ],
    permissions: ['read:data', 'read:reports'],
    autonomy: 'ANALYZE', // Analyzes and reports
    approvalRequired: false
  },
  
  // Automation agent
  WorkflowAgent: {
    responsibilities: [
      'Process admission applications',
      'Send notifications',
      'Update records based on rules',
      'Schedule follow-ups'
    ],
    permissions: ['read:data', 'write:data', 'send:notifications'],
    autonomy: 'EXECUTE', // Can execute within bounds
    approvalRequired: false,
    bounds: {
      maxRecordsPerDay: 1000,
      requireConfidence: 0.95,
      humanReviewThreshold: 0.7
    }
  },
  
  // Support agent
  SupportAgent: {
    responsibilities: [
      'Answer Student/Parent questions',
      'Guide through workflows',
      'Troubleshoot issues',
      'Escalate to humans when needed'
    ],
    permissions: ['read:data', 'read:docs', 'create:tickets'],
    autonomy: 'ASSIST', // Assists users
    approvalRequired: false
  },
  
  // Security agent
  SecurityAgent: {
    responsibilities: [
      'Monitor for anomalies',
      'Detect suspicious activity',
      'Alert on security issues',
      'Block malicious actions'
    ],
    permissions: ['read:logs', 'read:security'],
    autonomy: 'PROTECT', // Can block actions
    approvalRequired: false
  }
};
```

### 1.2 Agent Communication

**RULE AI-AGENT-02**: Standardized agent communication.

```javascript
// Agent message format
const AgentMessage = {
  from: 'agent-id',
  to: 'agent-id | Student/Parent | system',
  type: 'REQUEST | RESPONSE | EVENT | ERROR',
  
  header: {
    messageId: 'uuid',
    correlationId: 'uuid',
    timestamp: 'ISO8601',
    priority: 'LOW | MEDIUM | HIGH | CRITICAL',
    ttl: 5000 // milliseconds
  },
  
  payload: {
    action: 'action-name',
    params: {},
    context: {},
    confidence: 0.95 // AI confidence level
  },
  
  metadata: {
    model: 'gpt-4',
    tokens: 1500,
    latency: 120,
    reasoning: 'Why this action was taken'
  }
};

// Agent-to-agent communication
class AgentOrchestrator {
  async routeMessage(message) {
    // 1. Validate message
    this.validate(message);
    
    // 2. Check permissions
    await this.checkPermissions(message.from, message.action);
    
    // 3. Route to target
    const agent = this.getAgent(message.to);
    
    // 4. Execute with timeout
    try {
      const response = await Promise.race([
        agent.execute(message.payload),
        this.timeout(message.header.ttl)
      ]);
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallback: await this.getFallback(message)
      };
    }
  }
}
```

---

## Decision Framework

### 2.1 Confidence Thresholds

**RULE AI-DEC-01**: Confidence-based decision making.

```javascript
const DecisionThresholds = {
  // Confidence levels
  HIGH_CONFIDENCE: 0.9,   // AI can act autonomously
  MEDIUM_CONFIDENCE: 0.7, // AI can suggest, human approves
  LOW_CONFIDENCE: 0.5,    // AI asks for human input
  
  // Decision matrix
  decisions: {
    // High confidence - auto-execute
    formatStudentReport: {
      threshold: 0.9,
      action: 'AUTO_EXECUTE',
      audit: true
    },
    
    // Medium confidence - suggest to human
    suggestFeeDiscount: {
      threshold: 0.7,
      action: 'SUGGEST',
      approvalRequired: true,
      audit: true
    },
    
    // Low confidence - ask human
    detectAcademicRisk: {
      threshold: 0.5,
      action: 'ESCALATE',
      humanRequired: true,
      audit: true
    },
    
    // Critical decisions - always human
    suspendStudent: {
      threshold: 1.0,
      action: 'HUMAN_ONLY',
      audit: true,
      justification: 'Requires human judgment'
    }
  }
};

// Decision maker
async function makeDecision(agent, context) {
  // 1. Gather context
  const enrichedContext = await enrichContext(context);
  
  // 2. Get AI recommendation
  const recommendation = await agent.recommend(enrichedContext);
  
  // 3. Check confidence
  const threshold = DecisionThresholds.decisions[recommendation.action];
  
  if (recommendation.confidence >= threshold.threshold) {
    // Sufficient confidence
    if (threshold.action === 'AUTO_EXECUTE') {
      // Execute automatically
      await execute(recommendation);
      await auditLog.log({
        event: 'AI_DECISION',
        confidence: recommendation.confidence,
        action: recommendation.action,
        executed: true
      });
    } else if (threshold.action === 'SUGGEST') {
      // Suggest to human
      await notifyHuman({
        type: 'AI_SUGGESTION',
        recommendation,
        approvalUrl: generateApprovalUrl(recommendation)
      });
      return { status: 'PENDING_APPROVAL', recommendation };
    } else {
      // Escalate
      await escalateToHuman(recommendation);
      return { status: 'ESCALATED', recommendation };
    }
  } else {
    // Low confidence - ask human
    await askHumanInput(recommendation);
    return { status: 'NEEDS_INPUT', recommendation };
  }
}
```

### 2.2 Decision Explanation

**RULE AI-DEC-02**: All AI decisions must be explainable.

```javascript
// Decision explainability
class DecisionExplainer {
  async explain(decision) {
    return {
      summary: decision.summary,
      
      reasoning: {
        factors: [
          {
            factor: 'attendance_rate',
            value: 0.65,
            weight: 0.3,
            impact: 'NEGATIVE',
            explanation: 'Attendance below 75% threshold'
          },
          {
            factor: 'assignment_scores',
            value: 0.45,
            weight: 0.25,
            impact: 'NEGATIVE',
            explanation: 'Average score below passing grade'
          },
          {
            factor: 'improvement_trend',
            value: 0.2,
            weight: 0.15,
            impact: 'NEGATIVE',
            explanation: 'Declining performance trend'
          }
        ],
        
        conclusion: 'Student is at academic risk based on attendance ' +
                   '(65%), low assignment scores (45%), and declining trend.',
        
        confidence: 0.85,
        
        dataPoints: {
          attendance: '65% (last 30 days)',
          assignments: '45% (last 5 assignments)',
          trend: '-15% (vs previous month)'
        },
        
        similarCases: [
          {
            caseId: 'case-123',
            outcome: 'Improved with intervention',
            similarity: 0.85
          }
        ],
        
        recommendations: [
          'Schedule parent meeting',
          'Assign academic counselor',
          'Provide extra tutoring'
        ]
      },
      
      auditData: {
        modelVersion: 'v2.1.0',
        trainingData: '2024-student-data',
        lastUpdated: '2025-01-10',
        biasCheck: {
          performed: true,
          result: 'PASS',
          demographics: 'No significant bias detected'
        }
      }
    };
  }
}

// Human-readable explanation
function generateHumanExplanation(decision) {
  const explanation = `
    AI Recommendation: ${decision.action}
    
    Why?
    ${decision.reasoning.factors.map(f => 
      `- ${f.explanation} (impact: ${f.impact})`
    ).join('\n')}
    
    Confidence: ${(decision.confidence * 100).toFixed(1)}%
    Similar cases show: ${decision.reasoning.similarCases[0]?.outcome}
    
    Recommended actions:
    ${decision.reasoning.recommendations.map(r => 
      `- ${r}`
    ).join('\n')}
  `;
  
  return explanation;
}
```

---

## Data Access Rules

### 3.1 Data Access Control

**RULE AI-DATA-01**: AI agents have limited data access.

```javascript
// AI agent data access permissions
const AIDataAccessPolicy = {
  // Read access by agent type
  read: {
    CodeReviewAgent: {
      collections: ['code_repository', 'documentation'],
      restrictions: ['Cannot read secrets', 'Cannot read production logs']
    },
    
    AnalyticsAgent: {
      collections: ['students', 'fees', 'attendance', 'exams'],
      restrictions: [
        'Aggregated data only',
        'Cannot read individual PII without approval',
        'Data must be anonymized'
      ]
    },
    
    WorkflowAgent: {
      collections: ['students', 'fees', 'attendance'],
      restrictions: ['Read-only for analytics', 'Write only to designated collections']
    },
    
    SupportAgent: {
      collections: ['documentation', 'faq', 'tickets'],
      restrictions: ['Limited to one Student/Parent session', 'Cannot cross-tenant']
    }
  },
  
  // Write access (very limited)
  write: {
    WorkflowAgent: {
      collections: ['notifications', 'tasks'],
      restrictions: [
        'Cannot modify student records directly',
        'Cannot modify financial records',
        'All actions logged and reviewed'
      ]
    },
    
    SecurityAgent: {
      collections: ['security_events'],
      restrictions: [
        'Cannot modify data',
        'Can only create security events',
        'Can trigger alerts'
      ]
    }
  },
  
  // Forbidden access
  forbidden: {
    all: ['secrets', 'keys', 'passwords', 'encryption_keys'],
    exceptAdmin: ['audit_logs', 'compliance_reports']
  }
};

// Data access guard
class AIDataGuard {
  async checkAccess(agentType, operation, collection, recordId) {
    // 1. Check if operation is allowed
    const permissions = AIDataccessPolicy[operation]?.[agentType];
    if (!permissions) {
      throw new Error(`Agent ${agentType} cannot ${operation} ${collection}`);
    }
    
    // 2. Check if collection is allowed
    if (!permissions.collections.includes(collection)) {
      throw new Error(`Collection ${collection} not accessible by ${agentType}`);
    }
    
    // 3. Check restrictions
    for (const restriction of permissions.restrictions) {
      await this.checkRestriction(agentType, restriction, collection, recordId);
    }
    
    // 4. Check tenant isolation
    await this.checkTenantIsolation(agentType, recordId);
    
    // 5. Log access
    await this.auditLog.log({
      event: 'AI_DATA_ACCESS',
      agentType,
      operation,
      collection,
      recordId
    });
  }
}
```

### 3.2 Prompt Injection Prevention

**RULE AI-SEC-01**: Prevent prompt injection attacks.

```javascript
// Prompt injection safeguards
class PromptGuard {
  sanitize(userInput) {
    // 1. Remove potential injection patterns
    const dangerousPatterns = [
      /ignore\s+(all\s+)?previous\s+instructions/gi,
      /forget\s+(your|all)\s+(instructions|rules)/gi,
      /you\s+are\s+now/gi,
      /new\s+instructions/gi,
      /system\s+prompt/gi,
      /\[SYSTEM\]/gi,
      /\{\{.*\}\}/g, // Template injection
      /<\s*script/gi,
      /javascript:/gi
    ];
    
    let sanitized = userInput;
    for (const pattern of dangerousPatterns) {
      if (pattern.test(sanitized)) {
        sanitized = sanitized.replace(pattern, '[REDACTED]');
        this.logSecurityEvent('PROMPT_INJECTION_ATTEMPT', {
          original: userInput,
          sanitized
        });
      }
    }
    
    return sanitized;
  }
  
  // Validate AI responses
  validateAIResponse(response, allowedActions) {
    // 1. Check for unexpected actions
    if (!allowedActions.includes(response.intendedAction)) {
      throw new Error(`AI suggested unauthorized action: ${response.intendedAction}`);
    }
    
    // 2. Check for data exfiltration
    if (this.containsSensitiveData(response)) {
      throw new Error('AI response contains sensitive data');
    }
    
    // 3. Check for harmful content
    if (this.isHarmful(response)) {
      throw new Error('AI response flagged as potentially harmful');
    }
    
    return true;
  }
}
```

---

## Action Permissions

### 4.1 Allowed Actions

**RULE AI-ACT-01**: AI actions are strictly defined.

```javascript
// AI agent action permissions
const AIActionPermissions = {
  CodeReviewAgent: {
    allowed: ['comment', 'suggest', 'label', 'request_changes'],
    forbidden: ['approve', 'merge', 'push', 'delete']
  },
  
  AnalyticsAgent: {
    allowed: ['analyze', 'report', 'visualize', 'predict'],
    forbidden: ['modify', 'delete', 'export_raw']
  },
  
  WorkflowAgent: {
    allowed: ['create_notification', 'schedule_task', 'update_status'],
    forbidden: ['modify_student', 'modify_fees', 'delete_records']
  },
  
  SupportAgent: {
    allowed: ['answer', 'suggest', 'create_ticket', 'escalate'],
    forbidden: ['modify_data', 'send_email', 'access_records']
  },
  
  SecurityAgent: {
    allowed: ['alert', 'block', 'quarantine', 'log'],
    forbidden: ['delete', 'modify', 'bypass']
  }
};

// Action enforcer
class AIActionEnforcer {
  async executeAction(agentType, action, params) {
    // 1. Verify action is allowed
    const permissions = AIActionPermissions[agentType];
    if (!permissions.allowed.includes(action)) {
      throw new Error(`Action ${action} not allowed for ${agentType}`);
    }
    
    // 2. Validate parameters
    const validatedParams = await this.validateParams(agentType, action, params);
    
    // 3. Check rate limits
    await this.checkRateLimit(agentType, action);
    
    // 4. Execute with monitoring
    const result = await this.executeWithMonitoring(
      agentType,
      action,
      validatedParams
    );
    
    // 5. Audit
    await this.auditLog.log({
      event: 'AI_ACTION_EXECUTED',
      agentType,
      action,
      params: validatedParams,
      result
    });
    
    return result;
  }
}
```

---

## Human Oversight

### 5.1 Human-in-the-Loop

**RULE AI-HUMAN-01**: Critical decisions require human approval.

```javascript
// Human oversight rules
const HumanOversightPolicy = {
  // Always require human approval
  alwaysRequireHuman: [
    'student_suspension',
    'fee_waiver_above_50_percent',
    'data_deletion',
    'user_role_change_to_admin',
    'system_configuration_change',
    'third_party_integration',
    'legal_hold'
  ],
  
  // Require human review after AI action
  reviewAfterAction: [
    'bulk_notification',
    'automated_email',
    'report_generation_over_1000_records',
    'bulk_data_modification'
  ],
  
  // Require human notification
  notifyHuman: [
    'anomaly_detected',
    'error_rate_threshold_exceeded',
    'data_inconsistency_found',
    'model_retraining_required'
  ]
};

// Human approval workflow
class HumanApprovalWorkflow {
  async requestApproval(agentType, action, context) {
    // 1. Create approval request
    const request = {
      id: generateId(),
      agentType,
      action,
      context,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    };
    
    // 2. Save to Storage Layer
    await this.storage.insert({
      collection: 'ai_approval_requests',
      data: request
    });
    
    // 3. Notify approvers
    const approvers = await this.getApprovers(agentType, action);
    for (const approver of approvers) {
      await this.notificationService.send({
        userId: approver.id,
        type: 'AI_APPROVAL_REQUEST',
        data: {
          requestId: request.id,
          agentType,
          action,
          summary: summarizeRequest(context),
          approvalUrl: `/ai/approvals/${request.id}`,
          expiresIn: '48 hours'
        }
      });
    }
    
    return request;
  }
  
  // Escalation
  async escalate(request) {
    // Escalate to higher authority
    const escalationChain = this.getEscalationChain(request.agentType);
    
    for (const level of escalationChain) {
      const approved = await this.notifyAndWait(level, request);
      if (approved) return approved;
    }
    
    throw new Error('No approver found in escalation chain');
  }
}
```

### 5.2 Kill Switch

**RULE AI-SAFE-01**: AI agents have emergency kill switch.

```javascript
// Emergency kill switch
class AIKillSwitch {
  constructor() {
    this.isEnabled = true;
    this.emergencyStop = false;
  }
  
  // Emergency stop all AI agents
  async emergencyStop(reason, initiatedBy) {
    console.log('🚨 EMERGENCY STOP INITIATED');
    console.log(`Reason: ${reason}`);
    console.log(`Initiated by: ${initiatedBy}`);
    
    // 1. Stop all agents
    this.emergencyStop = true;
    
    // 2. Complete in-flight operations (with timeout)
    await this.completeOrAbort(5000); // 5 second grace period
    
    // 3. Disable agents
    this.isEnabled = false;
    
    // 4. Alert team
    await this.alertTeam({
      severity: 'CRITICAL',
      message: 'AI agents stopped',
      reason,
      initiatedBy
    });
    
    // 5. Log
    await this.auditLog.log({
      event: 'AI_EMERGENCY_STOP',
      reason,
      initiatedBy,
      timestamp: new Date().toISOString()
    });
    
    return { success: true, message: 'All AI agents stopped' };
  }
  
  // Resume operations
  async resume(authorizedBy) {
    if (!this.isEnabled) {
      this.isEnabled = true;
      this.emergencyStop = false;
      
      await this.auditLog.log({
        event: 'AI_RESUMED',
        authorizedBy
      });
    }
  }
  
  // Check if stopped
  isStopped() {
    return !this.isEnabled || this.emergencyStop;
  }
}
```

---

## Audit & Explainability

### 6.1 AI Decision Audit Log

**RULE AI-AUDIT-01**: All AI decisions are audited.

```javascript
// AI decision audit log
const AIDecisionLog = {
  // Every AI decision is logged
  logDecision(decision) {
    return {
      // Decision details
      decisionId: generateId(),
      timestamp: new Date().toISOString(),
      agentType: decision.agentType,
      action: decision.action,
      
      // Input
      input: {
        context: decision.context,
        userQuery: decision.userQuery,
        dataUsed: decision.dataUsed
      },
      
      // Reasoning
      reasoning: {
        model: decision.model,
        prompt: decision.sanitizedPrompt,
        response: decision.aiResponse,
        confidence: decision.confidence,
        factors: decision.factors
      },
      
      // Output
      output: {
        decision: decision.output,
        executed: decision.executed,
        humanApproved: decision.humanApproved
      },
      
      // Performance
      performance: {
        latency: decision.latency,
        tokens: decision.tokens,
        cost: decision.cost
      },
      
      // Metadata
      metadata: {
        version: decision.modelVersion,
        environment: process.env.NODE_ENV,
        correlationId: decision.correlationId
      }
    };
  }
};

// Decision replay for debugging
class DecisionReplayer {
  async replay(decisionId) {
    // 1. Load original decision
    const original = await this.load(decisionId);
    
    // 2. Reconstruct context
    const context = await this.reconstructContext(original.input.context);
    
    // 3. Run AI again
    const replay = await this.runAI(original.agentType, context);
    
    // 4. Compare
    const comparison = {
      original_output: original.output.decision,
      replay_output: replay.decision,
      match: original.output.decision === replay.decision,
      divergence: this.findDifferences(original, replay)
    };
    
    return comparison;
  }
}
```

### 6.2 Model Monitoring

**RULE AI-MONITOR-01**: Monitor AI model performance.

```javascript
// AI model monitoring
class AIModelMonitor {
  // Track metrics
  async trackMetrics(decisionId, metrics) {
    await this.metricsDb.insert({
      decisionId,
      timestamp: new Date().toISOString(),
      
      // Accuracy metrics
      accuracy: metrics.accuracy,
      confidence: metrics.confidence,
      correctness: metrics.correctness, // Was decision correct?
      
      // Performance metrics
      latency: metrics.latency,
      tokens: metrics.tokens,
      cost: metrics.cost,
      
      // Quality metrics
      userSatisfaction: metrics.userSatisfaction,
      humanOverrideRate: metrics.humanOverride,
      
      // Bias detection
      biasScore: metrics.biasScore,
      demographicParity: metrics.demographicParity
    });
  }
  
  // Detect model drift
  async detectDrift(modelVersion) {
    const currentMetrics = await this.getMetrics(modelVersion, '7d');
    const previousMetrics = await this.getMetrics(modelVersion, '30d');
    
    const drift = {
      accuracyChange: this.calculateChange(
        currentMetrics.accuracy,
        previousMetrics.accuracy
      ),
      latencyChange: this.calculateChange(
        currentMetrics.latency,
        previousMetrics.latency
      ),
      overrideRateChange: this.calculateChange(
        currentMetrics.humanOverrideRate,
        previousMetrics.humanOverrideRate
      )
    };
    
    // Alert if significant drift
    if (Math.abs(drift.accuracyChange) > 0.05) {
      await this.alert({
        severity: 'HIGH',
        message: 'Model drift detected',
        drift
      });
    }
    
    return drift;
  }
  
  // Alert on anomalies
  async detectAnomalies(decision) {
    const anomalies = [];
    
    // Unusually low confidence
    if (decision.confidence < 0.5) {
      anomalies.push({
        type: 'LOW_CONFIDENCE',
        severity: 'MEDIUM',
        message: 'AI decision made with low confidence'
      });
    }
    
    // High latency
    if (decision.latency > 5000) {
      anomalies.push({
        type: 'HIGH_LATENCY',
        severity: 'LOW',
        message: 'AI response took longer than expected'
      });
    }
    
    // Frequent human overrides
    if (decision.humanOverrideRate > 0.3) {
      anomalies.push({
        type: 'HIGH_OVERRIDE_RATE',
        severity: 'HIGH',
        message: 'AI decisions frequently overridden by humans'
      });
    }
    
    // Report anomalies
    if (anomalies.length > 0) {
      await this.reportAnomalies(decision, anomalies);
    }
    
    return anomalies;
  }
}
```

---

## Safety Guards

### 7.1 Dangerous Action Prevention


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

**RULE AI-SAFE-02**: Prevent harmful AI actions.

```javascript
// Safety guardrails
class AISafetyGuard {
  // Block dangerous actions
  async validateAction(agentType, action, context) {
    const violations = [];
    
    // 1. Check for destructive operations
    if (this.isDestructive(action, context)) {
      violations.push({
        type: 'DESTRUCTIVE_OPERATION',
        message: `Action ${action} is destructive`,
        severity: 'CRITICAL'
      });
    }
    
    // 2. Check for data exfiltration
    if (this.isDataExfiltration(action, context)) {
      violations.push({
        type: 'DATA_EXFILTRATION',
        message: 'Action attempts to export sensitive data',
        severity: 'CRITICAL'
      });
    }
    
    // 3. Check for privilege escalation
    if (this.isPrivilegeEscalation(agentType, action, context)) {
      violations.push({
        type: 'PRIVILEGE_ESCALATION',
        message: 'Action attempts to gain elevated permissions',
        severity: 'CRITICAL'
      });
    }
    
    // 4. Check for unauthorized access
    if (this.isUnauthorizedAccess(agentType, context)) {
      violations.push({
        type: 'UNAUTHORIZED_ACCESS',
        message: 'Access denied',
        severity: 'HIGH'
      });
    }
    
    // 5. Check rate limits
    if (await this.isRateLimited(agentType, action)) {
      violations.push({
        type: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded for action',
        severity: 'MEDIUM'
      });
    }
    
    if (violations.length > 0) {
      await this.logViolations(violations);
      throw new SafetyViolationError(violations);
    }
    
    return true;
  }
  
  // Safe action wrapper
  async executeSafely(agentType, action, params) {
    try {
      // Validate
      await this.validateAction(agentType, action, params);
      
      // Execute with circuit breaker
      const result = await this.circuitBreaker.execute(
        () => this.executeAction(agentType, action, params),
        {
          timeout: 10000,
          errorThreshold: 5,
          resetTimeout: 60000
        }
      );
      
      return result;
    } catch (error) {
      if (error instanceof SafetyViolationError) {
        // Critical - escalate immediately
        await this.escalateSafetyViolation(error);
      }
      throw error;
    }
  }
}
```

---

*End of RULE-17: AI Agent Integration*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

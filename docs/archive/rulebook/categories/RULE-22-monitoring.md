# RULE-22: Monitoring & Observability Standards

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Platform Team  
**Severity:** HIGH  
**Category:** Observability  
**Applies To:** Application monitoring, metrics, dashboards, alerting, incident detection  
**Detection Method:** Monitoring Tools, Alert Manager, Health Checks  
**Auto-Fix Available:** Partial  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Monitoring Strategy](#monitoring-strategy)
5. [Metrics](#metrics)
6. [Dashboards](#dashboards)
7. [Alerting](#alerting)
8. [Health Checks](#health-checks)
9. [Incident Detection](#incident-detection)
10. [SLOs & SLIs](#slos--slis)

---

## WHY

### Business Rationale
- **Proactive Issue Detection**: Catch problems before users report them.
- **Reduced Downtime**: Faster detection means faster resolution.
- **Performance Optimization**: Data-driven insights improve system performance.
- **Capacity Planning**: Usage trends inform infrastructure scaling decisions.

### Technical Rationale
- **System Visibility**: Understand system health in real-time.
- **Root Cause Analysis**: Quickly identify why issues occur.
- **Trend Analysis**: Detect degradation before it becomes critical.
- **Automated Response**: Enable auto-remediation for known issues.

---

## WHEN

### Applies To
- **All Production Systems**: Every service, Storage Layer, cache.
- **All Infrastructure**: Servers, networks, load balancers.
- **All Applications**: ERP modules, APIs, background jobs.
- **All Dependencies**: Third-party APIs, external services.
- **All Business Metrics**: Student/Parent activity, transaction volume, errors.

### Does NOT Apply To
- Local development (different tooling)
- One-off scripts (temporary)
- Non-production environments (optional)

---

## WHERE

### Scope
- **Monitoring Stack**: Prometheus, Grafana, Datadog, CloudWatch
- **Metrics Collection**: Application metrics, infrastructure metrics
- **Log Aggregation**: ELK Stack, Splunk, Datadog
- **Alert Manager**: PagerDuty, Opsgenie, Slack
- **Health Checks**: `src/monitoring/healthChecks.js`

---

## Monitoring Strategy

### 1.1 Monitoring Pillars

**RULE MON-01**: Comprehensive monitoring coverage.

```
MONITORING PILLARS:

1. RED Method (Google):
   - Rate: Requests per second
   - Errors: Failed requests
   - Duration: Response time

2. USE Method (Brendan Gregg):
   - Utilization: % time resource is busy
   - Saturation: Queue depth/backlog
   - Errors: Error count

3. Business Metrics:
   - Transactions processed
   - Users active
   - Revenue impact
   - Feature adoption

4. Infrastructure Metrics:
   - CPU, Memory, Disk, Network
   - Storage Layer connections, query time
   - Cache hit rate, memory usage
   - Queue length, processing time
```

### 1.2 Monitoring Layers

```javascript
const MonitoringLayers = {
  // Layer 1: Infrastructure
  infrastructure: {
    metrics: [
      'CPU utilization',
      'Memory usage',
      'Disk usage',
      'Network I/O',
      'Load average'
    ],
    tools: ['Prometheus Node Exporter', 'CloudWatch'],
    retention: '90 days',
    alerting: 'PagerDuty'
  },
  
  // Layer 2: Platform
  platform: {
    metrics: [
      'Storage Layer: connections, query time, replication lag',
      'Cache: hit rate, memory, evictions',
      'Queue: length, processing time, error rate',
      'Load balancer: request rate, upstream health'
    ],
    tools: ['Prometheus', 'Redis Exporter', 'RabbitMQ Exporter'],
    retention: '90 days',
    alerting: 'PagerDuty'
  },
  
  // Layer 3: Application
  application: {
    metrics: [
      'Request rate',
      'Error rate',
      'Response time (p50, p95, p99)',
      'Active users',
      'Business transactions'
    ],
    tools: ['Prometheus', 'Datadog APM', 'New Relic'],
    retention: '30 days',
    alerting: 'Slack + PagerDuty'
  },
  
  // Layer 4: Business
  business: {
    metrics: [
      'Student registrations per day',
      'Fee collection amount',
      'Report generation count',
      'Student/Parent login frequency',
      'Feature usage'
    ],
    tools: ['Datadog', 'Custom analytics'],
    retention: '1 year',
    alerting: 'Email'
  }
};
```

---

## Metrics

### 2.1 Key Metrics

**RULE MON-METRICS-01**: Instrument all critical paths.

```javascript
// RED metrics (Request, Error, Duration)
class RequestMetrics {
  // Record request
  recordRequest(endpoint, method, status, duration) {
    // Rate
    metrics.increment('http_requests_total', 1, {
      endpoint,
      method,
      status
    });
    
    // Errors
    if (status >= 400) {
      metrics.increment('http_errors_total', 1, {
        endpoint,
        method,
        status,
        error_type: this.classifyError(status)
      });
    }
    
    // Duration (histogram)
    metrics.histogram('http_request_duration_seconds', duration, {
      endpoint,
      method
    });
    
    // Percentiles
    metrics.histogram('http_request_duration_seconds', duration, {
      endpoint,
      method,
      le: this.getPercentile(duration)
    });
  }
  
  classifyError(status) {
    if (status < 500) return 'client_error';
    if (status < 502) return 'server_error';
    return 'infrastructure_error';
  }
}

// Storage Layer metrics
class DatabaseMetrics {
  async query(query, duration) {
    metrics.histogram('db_query_duration_seconds', duration, {
      query_type: this.classifyQuery(query),
      table: this.extractTable(query)
    });
    
    if (duration > 1000) {
      metrics.increment('db_slow_queries_total', 1, {
        query_type: this.classifyQuery(query),
        duration_bucket: this.getBucket(duration)
      });
    }
  }
  
  classifyQuery(query) {
    if (query.startsWith('SELECT')) return 'read';
    if (query.startsWith('INSERT')) return 'write';
    if (query.startsWith('UPDATE')) return 'update';
    if (query.startsWith('DELETE')) return 'delete';
    return 'other';
  }
}

// Business metrics
class BusinessMetrics {
  studentCreated(student) {
    metrics.increment('students_created_total', 1, {
      class_id: student.classId,
      academic_year: student.academicYear,
      tenant_id: student.tenantId
    });
    
    metrics.gauge('students_total', this.countStudents(student.tenantId), {
      tenant_id: student.tenantId
    });
  }
  
  feePayment(payment) {
    metrics.increment('fee_payments_total', 1, {
      method: payment.method,
      status: payment.status
    });
    
    metrics.counter('fee_revenue_total', payment.amount, {
      tenant_id: payment.tenantId,
      currency: 'INR'
    });
  }
}
```

### 2.2 Custom Metrics

```javascript
// Feature flags
metrics.gauge('feature_flags_active', activeFlags.length, {
  tenant_id: tenant.id
});

// Cache performance
metrics.gauge('cache_hit_rate', hitRate, {
  cache_type: 'students',
  tenant_id: tenant.id
});

// Queue depth
metrics.gauge('queue_length', queue.length, {
  queue_name: 'email_notifications'
});

// Active users
metrics.gauge('users_active', activeUserCount, {
  tenant_id: tenant.id,
  time_window: '5m'
});
```

---

## Dashboards

### 3.1 Dashboard Design

**RULE MON-DASH-01**: Role-based dashboards.

```javascript
const Dashboards = {
  // Executive dashboard
  executive: {
    name: 'Executive Overview',
    audience: ['CEO', 'CTO', 'VP Engineering'],
    refreshInterval: '5 minutes',
    panels: [
      {
        title: 'System Health',
        type: 'status',
        metrics: ['overall_health', 'uptime'],
        visualization: 'SingleStat'
      },
      {
        title: 'Active Users',
        type: 'metric',
        metrics: ['users_active'],
        visualization: 'Graph (last 24h)'
      },
      {
        title: 'Revenue Today',
        type: 'metric',
        metrics: ['fee_revenue_total'],
        visualization: 'SingleStat'
      },
      {
        title: 'Service Availability',
        type: 'slo',
        metrics: ['availability'],
        target: '99.9%',
        visualization: 'Gauge'
      }
    ]
  },
  
  // Operations dashboard
  operations: {
    name: 'Operations',
    audience: ['On-call Engineers', 'DevOps'],
    refreshInterval: '30 seconds',
    panels: [
      {
        title: 'Request Rate',
        metrics: ['http_requests_total'],
        visualization: 'Graph (last 1h)'
      },
      {
        title: 'Error Rate',
        metrics: ['http_errors_total'],
        visualization: 'Graph (last 1h)'
      },
      {
        title: 'Response Time (p95)',
        metrics: ['http_request_duration_seconds'],
        visualization: 'Heatmap'
      },
      {
        title: 'Storage Layer Connections',
        metrics: ['db_connections_active'],
        visualization: 'Gauge'
      },
      {
        title: 'Cache Hit Rate',
        metrics: ['cache_hit_rate'],
        visualization: 'Graph (last 24h)'
      }
    ]
  },
  
  // Service-specific dashboard
  studentsService: {
    name: 'Students Service',
    audience: ['Team-Students', 'Platform Team'],
    refreshInterval: '1 minute',
    panels: [
      {
        title: 'Students Created (Today)',
        metrics: ['students_created_total'],
        visualization: 'Stat'
      },
      {
        title: 'API Latency',
        metrics: ['http_request_duration_seconds'],
        filters: { endpoint: '/api/v2/students/*' },
        visualization: 'Heatmap'
      },
      {
        title: 'Validation Errors',
        metrics: ['validation_errors_total'],
        visualization: 'Graph (last 1h)'
      }
    ]
  },
  
  // Infrastructure dashboard
  infrastructure: {
    name: 'Infrastructure',
    audience: ['DevOps', 'Platform Team'],
    refreshInterval: '30 seconds',
    panels: [
      {
        title: 'CPU Usage',
        metrics: ['cpu_usage_percent'],
        by: ['instance'],
        visualization: 'Graph'
      },
      {
        title: 'Memory Usage',
        metrics: ['memory_usage_percent'],
        by: ['instance'],
        visualization: 'Graph'
      },
      {
        title: 'Disk Usage',
        metrics: ['disk_usage_percent'],
        by: ['instance'],
        visualization: 'Gauge'
      },
      {
        title: 'Network I/O',
        metrics: ['network_bytes_sent', 'network_bytes_received'],
        visualization: 'Graph'
      }
    ]
  }
};
```

### 3.2 Dashboard Implementation

```javascript
// Grafana dashboard JSON
const StudentServiceDashboard = {
  title: 'Students Service',
  refresh: '1m',
  tags: ['students', 'service'],
  
  panels: [
    {
      title: 'Request Rate',
      type: 'graph',
      targets: [{
        expr: 'rate(http_requests_total{endpoint="/api/v2/students"}[5m])',
        legendFormat: '{{method}} {{status}}'
      }],
      yAxes: [{
        format: 'reqps',
        label: 'Requests/sec'
      }]
    },
    
    {
      title: 'Error Rate',
      type: 'graph',
      targets: [{
        expr: 'rate(http_errors_total{endpoint="/api/v2/students"}[5m])',
        legendFormat: '{{status}}'
      }],
      alert: {
        conditions: [{
          evaluator: { type: 'gt', params: [0.05] }, // >5% error rate
          query: { params: ['A', '5m', 'now'] }
        }],
        frequency: '1m',
        notifications: ['pagerduty']
      }
    },
    
    {
      title: 'Response Time (p95)',
      type: 'graph',
      targets: [{
        expr: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{endpoint="/api/v2/students"}[5m]))',
        legendFormat: 'p95'
      }],
      yAxes: [{
        format: 's',
        label: 'Seconds'
      }]
    }
  ]
};
```

---

## Alerting

### 4.1 Alert Strategy

**RULE MON-ALERT-01**: Actionable, non-noisy alerts.

```javascript
const AlertingStrategy = {
  // Alert types
  types: {
    immediate: {
      description: 'Requires immediate action',
      examples: ['Service down', 'Storage Layer unreachable'],
      notification: 'Page (PagerDuty)',
      responseTime: '< 5 minutes'
    },
    
    urgent: {
      description: 'Requires action today',
      examples: ['Error rate >10%', 'Disk >90%'],
      notification: 'Slack + Email',
      responseTime: '< 1 hour'
    },
    
    informational: {
      description: 'FYI, no action needed',
      examples: ['Deployment completed', 'Backup successful'],
      notification: 'Slack #ops',
      responseTime: 'Review within 24h'
    }
  },
  
  // Alert rules
  rules: [
    {
      name: 'ServiceDown',
      condition: 'up == 0',
      duration: '1 minute',
      severity: 'CRITICAL',
      description: 'Service is down',
      runbook: 'docs/runbooks/service-down.md'
    },
    
    {
      name: 'HighErrorRate',
      condition: 'error_rate > 0.1', // >10%
      duration: '5 minutes',
      severity: 'CRITICAL',
      description: 'Error rate exceeds 10%',
      runbook: 'docs/runbooks/high-error-rate.md'
    },
    
    {
      name: 'SlowResponseTime',
      condition: 'p95_response_time > 2s',
      duration: '10 minutes',
      severity: 'WARNING',
      description: 'Response time p95 > 2s',
      runbook: 'docs/runbooks/slow-responses.md'
    },
    
    {
      name: 'DatabaseConnectionsHigh',
      condition: 'db_connections_active > 80',
      duration: '5 minutes',
      severity: 'WARNING',
      description: 'Storage Layer connection pool >80%',
      runbook: 'docs/runbooks/db-connections.md'
    },
    
    {
      name: 'DiskSpaceLow',
      condition: 'disk_usage_percent > 85',
      duration: '10 minutes',
      severity: 'WARNING',
      description: 'Disk usage >85%',
      runbook: 'docs/runbooks/disk-space.md'
    },
    
    {
      name: 'CacheHitRateLow',
      condition: 'cache_hit_rate < 0.7', // <70%
      duration: '15 minutes',
      severity: 'INFO',
      description: 'Cache hit rate below 70%',
      runbook: null // No runbook, just informational
    }
  ]
};
```

### 4.2 Alert Configuration

```yaml
# Prometheus AlertManager configuration
global:
  resolve_timeout: 5m
  
route:
  receiver: 'default'
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  
  routes:
    # Critical alerts - page immediately
    - match:
        severity: critical
      receiver: 'pagerduty'
      continue: true
    
    # Warning alerts - Slack
    - match:
        severity: warning
      receiver: 'slack-warnings'
      
    # Info alerts - Slack #ops
    - match:
        severity: info
      receiver: 'slack-ops'

receivers:
  # PagerDuty (critical)
  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: ${PAGERDUTY_SERVICE_KEY}
        severity: critical
        
  # Slack warnings
  - name: 'slack-warnings'
    slack_configs:
      - api_url: ${SLACK_WEBHOOK_URL}
        channel: '#alerts-warning'
        title: 'Warning: {{ .GroupLabels.alertname }}'
        text: '{{ .CommonAnnotations.summary }}'
        
  # Slack ops
  - name: 'slack-ops'
    slack_configs:
      - api_url: ${SLACK_WEBHOOK_URL}
        channel: '#ops'
        title: 'Info: {{ .GroupLabels.alertname }}'
        
inhibit_rules:
  # Suppress warning if critical is firing for same service
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['service']
```

---

## Health Checks

### 5.1 Health Check Implementation

**RULE MON-HEALTH-01**: Comprehensive health checks.

```javascript
// Health check endpoints
class HealthCheckService {
  async check() {
    const checks = {
      Storage Layer: await this.checkDatabase(),
      cache: await this.checkCache(),
      storage: await this.checkStorage(),
      externalServices: await this.checkExternalServices(),
      diskSpace: await this.checkDiskSpace(),
      memory: await this.checkMemory()
    };
    
    const overall = Object.values(checks).every(c => c.healthy);
    
    return {
      status: overall ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
      version: process.env.APP_VERSION
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
        details: {
          connections: await this.getConnectionCount(),
          maxConnections: await this.getMaxConnections()
        }
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }
  
  async checkCache() {
    try {
      const start = Date.now();
      await cache.set('health-check', 'ok', 10);
      const value = await cache.get('health-check');
      const latency = Date.now() - start;
      
      return {
        healthy: value === 'ok' && latency < 50,
        latency
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }
}

// Express route
app.get('/health', async (req, res) => {
  const health = await healthCheckService.check();
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Readiness check (for Kubernetes)
app.get('/ready', async (req, res) => {
  const ready = await readinessCheck();
  res.status(ready ? 200 : 503).json({ ready });
});

// Liveness check (for Kubernetes)
app.get('/live', (req, res) => {
  res.status(200).json({ alive: true });
});
```

### 5.2 Readiness Checks

```javascript
// Readiness check (can serve traffic?)
async function readinessCheck() {
  const checks = {
    Storage Layer: await checkDatabaseConnection(),
    cache: await checkCacheConnection(),
    dependencies: await checkDependencies()
  };
  
  return Object.values(checks).every(c => c.healthy);
}

// Liveness check (is process alive?)
function livenessCheck() {
  return {
    alive: true,
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    uptime: process.uptime()
  };
}
```

---

## Incident Detection

### 6.1 Automated Detection

**RULE MON-DETECT-01**: Automatic incident detection.

```javascript
// Anomaly detection
class AnomalyDetector {
  // Detect unusual traffic patterns
  detectTrafficAnomaly(metrics) {
    const current = metrics.current;
    const baseline = metrics.baseline; // Last 7 days same time
    
    const deviation = Math.abs(current - baseline) / baseline;
    
    if (deviation > 0.5) { // 50% change
      return {
        detected: true,
        severity: deviation > 1.0 ? 'HIGH' : 'MEDIUM',
        message: `Traffic ${deviation > 1.0 ? 'spike' : 'drop'} detected`,
        deviation: `${(deviation * 100).toFixed(1)}%`,
        action: deviation > 1.0 ? 'investigate' : 'monitor'
      };
    }
    
    return { detected: false };
  }
  
  // Detect error rate spikes
  detectErrorSpike(metrics) {
    const current = metrics.errorRate; // Last 5 minutes
    const threshold = 0.05; // 5%
    
    if (current > threshold) {
      return {
        detected: true,
        severity: current > 0.2 ? 'CRITICAL' : 'HIGH',
        message: `Error rate: ${(current * 100).toFixed(1)}%`,
        threshold,
        action: 'immediate'
      };
    }
    
    return { detected: false };
  }
  
  // Detect performance degradation
  detectPerformanceDegradation(metrics) {
    const current = metrics.p95Latency;
    const baseline = metrics.baselineLatency;
    const increase = (current - baseline) / baseline;
    
    if (increase > 0.5) { // 50% slower
      return {
        detected: true,
        severity: increase > 1.0 ? 'HIGH' : 'MEDIUM',
        message: `Latency increased by ${(increase * 100).toFixed(1)}%`,
        baseline: `${baseline}ms`,
        current: `${current}ms`,
        action: 'investigate'
      };
    }
    
    return { detected: false };
  }
}

// Incident auto-creation
class IncidentAutoCreator {
  async checkAndCreate() {
    const anomalies = await this.detector.detectAll();
    
    for (const anomaly of anomalies) {
      if (anomaly.severity === 'CRITICAL') {
        // Auto-create incident
        const incident = await this.createIncident({
          severity: 'SEV1',
          service: anomaly.service,
          description: anomaly.message,
          autoDetected: true,
          source: 'monitoring'
        });
        
        // Page on-call
        await this.pageOnCall(incident);
      }
    }
  }
}
```

---

## SLOs & SLIs

### 7.1 Service Level Objectives

**RULE MON-SLO-01**: Define and track SLOs.

```javascript
const ServiceLevelObjectives = {
  // Service Level Indicators (measurements)
  slis: {
    availability: {
      description: 'Percentage of successful requests',
      calculation: 'successful_requests / total_requests',
      target: 0.999 // 99.9%
    },
    
    latency: {
      description: 'Request response time',
      calculation: 'p95_response_time',
      target: 500 // milliseconds
    },
    
    throughput: {
      description: 'Requests per second',
      calculation: 'requests_per_second',
      target: 1000
    },
    
    errorRate: {
      description: 'Percentage of failed requests',
      calculation: 'failed_requests / total_requests',
      target: 0.001 // 0.1%
    }
  },
  
  // Service Level Objectives (targets)
  slos: {
    studentsAPI: {
      availability: {
        target: 99.9,
        window: '30d',
        sli: 'availability'
      },
      latency: {
        target: 500,
        percentile: 'p95',
        window: '30d',
        sli: 'latency'
      }
    },
    
    feeProcessing: {
      availability: {
        target: 99.95,
        window: '30d',
        sli: 'availability'
      },
      latency: {
        target: 1000,
        percentile: 'p95',
        window: '30d',
        sli: 'latency'
      }
    }
  },
  
  // Error budget
  errorBudget: {
    studentsAPI: {
      availability: {
        target: 99.9,
        budget: 0.1, // 0.1% downtime allowed
        monthlyBudget: 43.2, // minutes
        used: 12.5, // minutes
        remaining: 30.7, // minutes
        percentage: 29 // %
      }
    }
  }
};

// SLO tracking
class SLOTracker {
  async calculateSLI(sloName, timeWindow) {
    const metrics = await this.getMetrics(sloName, timeWindow);
    
    switch (sloName) {
      case 'availability':
        return metrics.successful / metrics.total;
        
      case 'latency':
        return metrics.p95;
        
      case 'errorRate':
        return metrics.failed / metrics.total;
    }
  }
  
  async checkErrorBudget(service) {
    const slo = ServiceLevelObjectives.slos[service];
    const errorBudget = ServiceLevelObjectives.errorBudget[service];
    
    const sliValue = await this.calculateSLI(slo.availability.sli, slo.availability.window);
    const errorRate = 1 - sliValue;
    const budgetUsed = errorRate / errorBudget.availability.budget;
    
    return {
      service,
      sli: sliValue,
      target: slo.availability.target,
      budgetUsed: `${(budgetUsed * 100).toFixed(1)}%`,
      remaining: `${((1 - budgetUsed) * 100).toFixed(1)}%`,
      status: budgetUsed > 0.8 ? 'CRITICAL' : budgetUsed > 0.5 ? 'WARNING' : 'OK'
    };
  }
}
```

### 7.2 SLO Dashboard


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

```javascript
const SLODashboard = {
  panels: [
    {
      title: 'Students API - Availability',
      target: '99.9%',
      current: '99.95%',
      errorBudget: {
        total: '43.2 min/month',
        used: '21.6 min',
        remaining: '21.6 min'
      },
      status: 'OK'
    },
    
    {
      title: 'Students API - Latency (p95)',
      target: '< 500ms',
      current: '320ms',
      status: 'OK'
    },
    
    {
      title: 'Fee Processing - Availability',
      target: '99.95%',
      current: '99.98%',
      errorBudget: {
        total: '21.6 min/month',
        used: '8.6 min',
        remaining: '13.0 min'
      },
      status: 'OK'
    }
  ]
};
```

---

*End of RULE-22: Monitoring & Observability Standards*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

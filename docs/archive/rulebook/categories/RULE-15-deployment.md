# RULE-15: Deployment Standards

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team DevOps Team  
**Severity:** CRITICAL  
**Category:** DevOps  
**Applies To:** Deployment pipelines, environments, releases, rollback, monitoring  
**Detection Method:** CI/CD Pipeline, Deployment Tests, Monitoring  
**Auto-Fix Available:** No  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Development](#development)
5. [Testing](#testing)
6. [Staging](#staging)
7. [Production](#production)
8. [Environment Rules](#environment-rules)
9. [CI](#ci)
10. [CD](#cd)
11. [Rollback](#rollback)
12. [Monitoring](#monitoring)

---

## WHY

### Business Rationale
- **Reliability**: Professional deployment processes ensure 99.9% uptime.
- **Speed**: Automated deployments reduce deployment time from hours to minutes.
- **Safety**: Proper staging and testing prevents production incidents.
- **Compliance**: Deployment audit trails are required for SOC 2, ISO 27001.

### Technical Rationale
- **Consistency**: Same process across all environments.
- **Automation**: Reduces human error in deployments.
- **Traceability**: Every deployment is tracked and auditable.
- **Recovery**: Fast rollback minimizes downtime.

---

## WHEN

### Applies To
- **All Deployments**: Development, testing, staging, production.
- **All Environment Changes**: Configuration, secrets, infrastructure.
- **All Releases**: Major, minor, patch, hotfix.
- **All Rollbacks**: Emergency and planned.

### Does NOT Apply To
- Local development (developer machines)
- One-off experiments
- Temporary test environments

---

## WHERE

### Scope
- **CI/CD Pipeline**: `.github/workflows/`, `.gitlab-ci.yml`
- **Infrastructure**: Terraform, Ansible, Docker
- **Deployment Scripts**: `scripts/deploy/`
- **Environment Config**: `.env.*`, `config/`
- **Monitoring**: `monitoring/`, dashboards

---

## Development

### 1.1 Development Environment

**RULE DEP-DEV-01**: Local development consistency.

```javascript
// package.json scripts
{
  "scripts": {
    "dev": "vite", // Start dev server
    "dev:debug": "vite --debug", // Debug mode
    "dev:https": "vite --https", // HTTPS for testing
    "dev:mock": "vite --mode mock", // Mock API mode
    "dev:prod": "vite build --mode production", // Production build locally
    "setup": "npm install && npm run setup:db", // Fresh setup
    "setup:db": "node scripts/setup-dev-db.js" // Initialize dev Storage Layer
  }
}

// Development setup checklist
const DevSetupChecklist = {
  required: [
    'Node.js 18+ installed',
    'npm install completed',
    'Environment file created (.env.local)',
    'Storage Layer initialized',
    'Seed data loaded',
    'Application starts without errors',
    'All tests pass'
  ],
  
  tools: [
    'VS Code with recommended extensions',
    'ESLint and Prettier configured',
    'Git hooks installed (Husky)',
    'Docker installed (for Storage Layer)'
  ]
};
```

### 1.2 Development Storage Layer

```javascript
// scripts/setup-dev-db.js

async function setupDevDatabase() {
  console.log('Setting up development Storage Layer...');
  
  // Use IndexedDB for development (same as production)
  const db = await openDatabase({
    name: 'erp-dev',
    version: 1,
    stores: [
      { name: 'students', keyPath: 'id' },
      { name: 'fees', keyPath: 'id' },
      { name: 'attendance', keyPath: 'id' }
    ]
  });
  
  // Seed with test data
  await seedTestData(db);
  
  console.log('✅ Development Storage Layer ready');
  console.log('   Storage Layer: erp-dev');
  console.log('   Collections: students, fees, attendance');
  console.log('   Test data loaded');
}

async function seedTestData(db) {
  // Seed classes
  await db.insert('classes', {
    id: 'class-10-a',
    name: '10-A',
    academicYear: '2024-2025'
  });
  
  // Seed fee structures
  await db.insert('feeStructures', {
    id: 'fee-struct-10',
    classId: 'class-10-a',
    baseFee: 2000
  });
  
  // Seed admin Student/Parent
  await db.insert('users', {
    id: 'admin-123',
    email: 'admin@test.com',
    role: 'ADMIN',
    tenantId: 'tenant-abc'
  });
}
```

---

## Testing

### 2.1 Test Environment

**RULE DEP-TEST-01**: Automated test execution.

```yaml
# .github/workflows/tests.yml
name: Test Suite

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci # Clean install
      
      - name: Run linter
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run coverage
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: true
  
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

---

## Staging

### 3.1 Staging Environment

**RULE DEP-STAGE-01**: Production-like staging.

```javascript
// Staging environment requirements:
const StagingEnvironment = {
  purpose: 'Final testing before production',
  
  requirements: {
    data: 'Production data replica (anonymized)',
    infrastructure: 'Same as production (size 1/10)',
    configuration: 'Production configs',
    monitoring: 'Same monitoring as production',
    access: 'Internal team only'
  },
  
  differences: {
    branding: 'Staging watermark',
    externalServices: 'Test accounts (not real payments)',
    notifications: 'Suppressed (or test inbox)',
    caching: 'Disabled for faster testing'
  },
  
  deployment: {
    trigger: 'Automatic from develop branch',
    frequency: 'On every merge to develop',
    smokeTests: 'Automatic after deployment'
  }
};

// Staging deployment script
// scripts/deploy/staging.sh

#!/bin/bash
set -e # Exit on error

echo "🚀 Deploying to staging..."

# 1. Run tests
npm run test:ci
if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Aborting deployment."
  exit 1
fi

# 2. Build application
npm run build:staging

# 3. Run security scan
npm run security:scan

# 4. Deploy to staging
npm run deploy:staging

# 5. Run smoke tests
npm run test:smoke:staging

# 6. Notify team
curl -X POST $SLACK_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{"text":"✅ Staging deployment successful"}'

echo "✅ Staging deployment complete"
```

---

## Production

### 4.1 Production Deployment

**RULE DEP-PROD-01**: Safe production deployment.

```yaml
# .github/workflows/deploy-production.yml
name: Production Deployment

on:
  push:
    tags:
      - 'v*' # Trigger on version tags

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production # Requires approval
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Security scan
        run: npm run security:scan
      
      - name: Build application
        run: npm run build:production
      
      - name: Build Docker image
        run: |
          docker build -t erp-v2:${{ github.ref_name }} .
          docker tag erp-v2:${{ github.ref_name }} erp-v2:latest
      
      - name: Push Docker image
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push erp-v2:${{ github.ref_name }}
          docker push erp-v2:latest
      
      - name: Deploy to production
        run: npm run deploy:production
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
      
      - name: Health check
        run: |
          sleep 30 # Wait for deployment
          curl -f https://erp.example.com/health || exit 1
      
      - name: Notify team
        run: |
          curl -X POST $SLACK_WEBHOOK \
            -H 'Content-Type: application/json' \
            -d "{\"text\":\"✅ Production deployed: ${{ github.ref_name }}\"}"
```

---

## Environment Rules

### 5.1 Environment Configuration

**RULE DEP-ENV-01**: Environment-specific configuration.

```javascript
// .env.development
NODE_ENV=development
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true

// .env.staging
NODE_ENV=staging
VITE_API_URL=https://staging-api.erp.example.com
VITE_DEBUG=true

// .env.production
NODE_ENV=production
VITE_API_URL=https://api.erp.example.com
VITE_DEBUG=false

// Environment validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  VITE_API_URL: z.string().url(),
  VITE_DEBUG: z.boolean().optional()
});

// Validate on startup
const env = envSchema.parse(process.env);
```

### 5.2 Secrets Management

```javascript
// CORRECT: Secrets from environment
const API_KEY = process.env.ERP_API_KEY;
const DB_PASSWORD = process.env.DB_PASSWORD;

// CORRECT: Secrets from secret manager (production)
import { SecretManager } from '@google-cloud/secret-manager';

async function getSecret(secretName) {
  const [version] = await SecretManager.accessSecretVersion({
    name: `projects/${projectId}/secrets/${secretName}/versions/latest`
  });
  return version.payload.data.toString();
}

// FORBIDDEN: Hardcoded secrets
const API_KEY = 'sk_live_abc123'; // ❌ CRITICAL VIOLATION

// Secrets rotation schedule
const SecretsRotationSchedule = {
  Storage Layer: '90 days',
  apiKeys: '180 days',
  jwtSigning: '30 days',
  encryptionKeys: '90 days'
};
```

---

## CI

### 6.1 Continuous Integration

**RULE DEP-CI-01**: Automated CI checks.

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check (if TypeScript)
        run: npm run typecheck
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Coverage check
        run: npm run test:coverage
      
      - name: Bundle size check
        run: npm run size-limit
      
      - name: Security scan
        run: npm run security:audit
      
      - name: Dependency check
        run: npm run audit:licenses
```

---

## CD

### 7.1 Continuous Deployment

**RULE DEP-CD-01**: Automated deployment pipeline.

```javascript
// Deployment pipeline stages
const DeploymentPipeline = {
  stages: [
    {
      name: 'Build',
      steps: ['install', 'lint', 'test', 'build'],
      duration: '5 minutes',
      failure: 'Stop pipeline, notify team'
    },
    {
      name: 'Security Scan',
      steps: ['vulnerability-scan', 'license-check', 'secrets-scan'],
      duration: '3 minutes',
      failure: 'Stop pipeline, security review required'
    },
    {
      name: 'Staging Deploy',
      steps: ['deploy-staging', 'smoke-tests', 'integration-tests'],
      duration: '10 minutes',
      failure: 'Stop pipeline, investigate'
    },
    {
      name: 'Production Deploy',
      steps: ['approval', 'deploy-production', 'health-check', 'smoke-tests'],
      duration: '15 minutes',
      failure: 'Auto-rollback, notify team'
    }
  ],
  
  gates: {
    build: 'All tests pass',
    security: 'No critical vulnerabilities',
    staging: 'All smoke tests pass',
    production: 'Manual approval required'
  }
};
```

---

## Rollback

### 8.1 Rollback Procedures

**RULE DEP-ROLL-01**: Automated rollback capability.

```javascript
// Rollback triggers
const RollbackTriggers = {
  errorRate: '> 1% errors in 5 minutes',
  responseTime: '> 2s average response time',
  availability: '< 99.9% uptime',
  resourceUsage: '> 80% CPU/memory'
};

// Rollback procedure
async function rollbackDeployment(environment, targetVersion) {
  console.log(`🔄 Rolling back ${environment} to ${targetVersion}...`);
  
  // 1. Notify team
  await notifyTeam(`Rollback initiated: ${environment} → ${targetVersion}`);
  
  // 2. Switch traffic to previous version
  await loadBalancer.setTrafficSplit({
    current: 0, // 0% traffic to broken version
    previous: 100 // 100% to previous version
  });
  
  // 3. Verify rollback
  await sleep(30000); // Wait 30 seconds
  const health = await healthCheck();
  
  if (!health.healthy) {
    throw new Error('Rollback failed - system still unhealthy');
  }
  
  // 4. Notify success
  await notifyTeam(`✅ Rollback complete: ${environment} running ${targetVersion}`);
  
  // 5. Create incident report
  await createIncidentReport({
    trigger: 'automatic',
    reason: 'Error rate threshold exceeded',
    duration: '5 minutes',
    impact: 'Users experienced errors during deployment'
  });
}

// Manual rollback
async function manualRollback(environment) {
  // List available versions
  const versions = await getDeploymentHistory(environment);
  
  console.log('Available versions:');
  versions.forEach((v, i) => {
    console.log(`${i + 1}. ${v.version} - ${v.timestamp}`);
  });
  
  // Prompt for version
  const selectedVersion = await prompt('Select version to rollback to:');
  
  await rollbackDeployment(environment, selectedVersion);
}
```

---

## Monitoring

### 9.1 Post-Deployment Monitoring

**RULE DEP-MON-01**: Monitor after every deployment.

```javascript
// Deployment monitoring checklist
const PostDeploymentMonitoring = {
  immediate: [
    'Health check passes',
    'No errors in logs',
    'Response time < 500ms',
    'CPU usage < 60%',
    'Memory usage < 70%',
    'No failed requests'
  ],
  
  shortTerm: [
    'Error rate < 0.1%',
    'Response time stable',
    'Storage Layer queries < 100ms',
    'Cache hit rate > 80%',
    'No School/Tenant complaints'
  ],
  
  longTerm: [
    'Stable for 24 hours',
    'No memory leaks',
    'No performance degradation',
    'Student/Parent satisfaction normal'
  ]
};

// Monitoring dashboard
const DeploymentDashboard = {
  metrics: [
    'Request rate',
    'Error rate',
    'Response time (p50, p95, p99)',
    'CPU utilization',
    'Memory utilization',
    'Storage Layer connections',
    'Cache hit rate',
    'Queue length'
  ],
  
  alerts: [
    'Error rate > 1%',
    'Response time > 2s',
    'CPU > 80% for 5 minutes',
    'Memory > 85%',
    'Health check failing'
  ]
};
```

---

## Deployment Checklist

### 10.1 Pre-Deployment Checklist

```javascript
const PreDeploymentChecklist = {
  code: [
    'All tests passing',
    'No lint errors',
    'No security vulnerabilities',
    'Bundle size within budget',
    'Performance benchmarks pass'
  ],
  
  documentation: [
    'CHANGELOG updated',
    'Release notes prepared',
    'API docs updated (if needed)',
    'Migration guide (if breaking changes)'
  ],
  
  configuration: [
    'Environment variables set',
    'Secrets rotated (if needed)',
    'Feature flags configured',
    'Storage Layer migrations ready'
  ],
  
  approvals: [
    'Code reviewed (2 approvals)',
    'QA tested and approved',
    'Security reviewed (if needed)',
    'Architecture approved (if needed)'
  ]
};
```

### 10.2 Post-Deployment Checklist


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

```javascript
const PostDeploymentChecklist = {
  immediate: [
    'Health check passes',
    'Smoke tests pass',
    'No errors in logs',
    'Monitoring dashboards healthy',
    'Team notified'
  ],
  
  verification: [
    'Key Student/Parent flows tested',
    'Data integrity verified',
    'Performance acceptable',
    'No School/Tenant complaints'
  ]
};
```

---

*End of RULE-15: Deployment Standards*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

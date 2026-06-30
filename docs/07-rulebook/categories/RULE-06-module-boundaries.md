# RULE-06: Module Boundaries

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Architecture Team  
**Severity:** HIGH  
**Category:** Architecture  
**Applies To:** All ERP modules, inter-module communication, module registration  
**Detection Method:** Dependency Graph Analysis, Architecture Tests, Code Review  
**Auto-Fix Available:** Partial  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Module Ownership Table](#module-ownership-table)
5. [Read Access](#read-access)
6. [Write Access](#write-access)
7. [Dependencies](#dependencies)
8. [Forbidden Access](#forbidden-access)
9. [Communication Protocols](#communication-protocols)
10. [Module Registration](#module-registration)
11. [Boundary Enforcement](#boundary-enforcement)
12. [Violation Detection](#violation-detection)
13. [Auto Fix Procedures](#auto-fix-procedures)

---

## WHY

### Business Rationale
- **Team Autonomy**: Clear boundaries allow teams to work independently without stepping on each other.
- **Change Impact**: Knowing boundaries helps assess impact of changes.
- **Responsibility**: Clear ownership ensures accountability.
- **Scalability**: As the system grows to 30+ modules, boundaries prevent chaos.

### Technical Rationale
- **Loose Coupling**: Modules interact via well-defined APIs, not internal details.
- **Replaceability**: Modules can be rewritten or replaced without affecting others.
- **Testability**: Isolated modules are easier to test.
- **Deployment**: Modules can be deployed independently in future.

---

## WHEN

### Applies To
- **New Module Creation**: Must define boundaries before implementation.
- **Cross-Module Features**: Must use approved communication channels.
- **Module Refactoring**: Must not violate boundaries.
- **Code Review**: Every cross-module interaction must be reviewed.
- **Dependency Addition**: New dependencies between modules require approval.

### Does NOT Apply To
- Intra-module communication (within same module)
- Shared service usage (approved cross-cutting concerns)
- Platform-level utilities (src/utils, src/core)

---

## WHERE

### Scope
- **All Feature Modules**: `src/modules/{module}/`
- **All Master Setting Modules**: `src/master-setting/{setting}/`
- **Module Registry**: `src/config/moduleRegistry.js`
- **Communication Layer**: `src/services/eventService.js`

---

## Module Ownership Table

### 4.1 Complete Module Inventory

| Module | Owner | Read Access | Write Access | Dependencies | Forbidden Access | Status |
|--------|-------|-------------|--------------|--------------|------------------|--------|
| **Students** | team-students | All (with RLS) | Create, Update, Soft Delete | fees, attendance, exam, transport, hostel, certificates | payroll, hr, accounts | ACTIVE |
| **Teachers** | team-hr | All (with RLS) | Create, Update, Soft Delete | attendance, timetable, classAssignments | fees, transport, accounts | ACTIVE |
| **Fees** | team-accounts | All (with RLS) | Create, Update, Void | students, feeStructures, receipts | transport, hostel, library | ACTIVE |
| **Attendance** | team-academics | All (with RLS) | Create, Update | students, teachers, classes | fees, accounts | ACTIVE |
| **Exam** | team-academics | All (with RLS) | Create, Update, Grade | students, teachers, subjects, classes | fees, accounts | ACTIVE |
| **Transport** | team-logistics | All (with RLS) | Create, Update, Soft Delete | students, routes, vehicles | fees, accounts, payroll | ACTIVE |
| **Hostel** | team-logistics | All (with RLS) | Create, Update, Soft Delete | students, rooms | fees, accounts | ACTIVE |
| **Library** | team-library | All (with RLS) | Create, Update, Issue/Return | students, books | fees, accounts | ACTIVE |
| **Inventory** | team-inventory | All (with RLS) | Create, Update, Issue | items, categories | fees, accounts | ACTIVE |
| **Payroll** | team-hr | All (with RLS) | Create, Update | teachers, staff, attendance | students, fees, transport | ACTIVE |
| **HR** | team-hr | All (with RLS) | Create, Update | teachers, staff | students, fees | ACTIVE |
| **Accounts** | team-accounts | All (with RLS) | Create, Update, Audit | fees, transactions, invoices | students (read-only), transport | ACTIVE |
| **Admission** | team-admission | All (with RLS) | Create, Update, Approve | students, classes, fees | payroll, accounts | ACTIVE |
| **SMS** | platform-team | All | Send | notifications, users | students (PII - minimal), fees | ACTIVE |
| **Notification** | platform-team | All | Create, Send | users, events | students (PII - minimal) | ACTIVE |
| **Dashboard** | platform-team | Aggregated Read Only | None | All modules (read-only) | Write access to any module | ACTIVE |
| **Reports** | platform-team | Aggregated Read Only | None | All modules (read-only) | Write access to any module | ACTIVE |
| **Analytics** | platform-team | Aggregated Read Only | None | All modules (read-only) | Write access to any module | ACTIVE |
| **Settings** | platform-team | All (with RLS) | Create, Update | None | Bypass other module settings | ACTIVE |
| **RBAC** | platform-team | All (with RLS) | Create, Update, Assign | users, roles, permissions | Bypass tenant isolation | ACTIVE |
| **Search** | platform-team | All (indexed) | Index | All modules | Delete from other modules | ACTIVE |
| **Audit** | platform-team | All (read-only) | None | All modules (read-only) | Modify or delete audit logs | ACTIVE |
| **Backup** | platform-team | All (export) | Backup, Restore | All modules | Delete data without backup | ACTIVE |
| **Workflow** | platform-team | All (with RLS) | Create, Configure | All modules | Override module-specific workflows | ACTIVE |
| **AI** | platform-team | All (with RLS) | Predict, Recommend | All modules (read-heavy) | Modify data without audit | ACTIVE |
| **Scheduler** | platform-team | All | Schedule, Execute | All modules | Skip mandatory validation | ACTIVE |
| **API** | platform-team | All | Expose | All modules | Break contracts without versioning | ACTIVE |

---

## Read Access

### 5.1 Read Permission Matrix

```javascript
// Granular read access per module
const ModuleReadAccess = {
  students: {
    teachers: {
      allowed: ['id', 'firstName', 'lastName', 'classId', 'rollNumber', 'photo'],
      denied: ['ssn', 'income', 'parentIncome', 'address', 'phone', 'email'],
      condition: 'only for students in teacher\'s classes'
    },
    parents: {
      allowed: ['id', 'firstName', 'lastName', 'classId', 'rollNumber', 'photo'],
      denied: ['ssn', 'income', 'parentIncome'],
      condition: 'only their own children'
    },
    accounts: {
      allowed: ['id', 'firstName', 'lastName', 'classId', 'admissionNumber'],
      denied: ['ssn', 'address'],
      condition: 'all students in tenant'
    },
    admin: {
      allowed: ['*'],
      denied: [],
      condition: 'all students in tenant'
    }
  },
  
  fees: {
    students: {
      allowed: ['id', 'studentId', 'amount', 'status', 'dueDate'],
      denied: ['paymentMethod', 'transactionId'],
      condition: 'only their own fees'
    },
    accounts: {
      allowed: ['*'],
      denied: [],
      condition: 'all fees in tenant'
    }
  }
};
```

### 5.2 Row-Level Security

```javascript
// Enforce row-level security on cross-module reads
async function enforceModuleReadAccess(module, collection, userId, query) {
  const Student/Parent = await getUser(userId);
  const userModules = getUserModules(userId); // Which modules Student/Parent has access to
  
  // If Student/Parent doesn't have access to this module, deny
  if (!userModules.includes(module)) {
    throw new AuthorizationError(`Access denied to ${module} module`);
  }
  
  // Apply row-level filters based on role
  const roleFilters = getRoleFilters(module, collection, Student/Parent.role);
  query.filters = { ...query.filters, ...roleFilters };
  
  return query;
}
```

---

## Write Access

### 6.1 Write Permission Matrix

```javascript
// Write access per module
const ModuleWriteAccess = {
  students: {
    CREATE: ['ADMIN', 'DATA_ENTRY'],
    UPDATE: ['ADMIN', 'DATA_ENTRY'],
    DELETE: ['ADMIN'], // Soft delete only
    FREEZE: ['ADMIN'],
    EXPORT: ['ADMIN', 'DATA_ENTRY']
  },
  
  fees: {
    CREATE: ['ADMIN', 'ACCOUNTANT'],
    UPDATE: ['ADMIN', 'ACCOUNTANT'],
    DELETE: ['ADMIN'], // Void only, no hard delete
    VOID: ['ADMIN', 'MANAGER'],
    REFUND: ['ADMIN', 'MANAGER']
  },
  
  teachers: {
    CREATE: ['ADMIN', 'HR'],
    UPDATE: ['ADMIN', 'HR'],
    DELETE: ['SUPER_ADMIN'], // Rare
    ASSIGN: ['ADMIN', 'HR', 'DEPARTMENT_HEAD']
  }
};
```

### 6.2 Write Validation

```javascript
// Validate write access before any operation
async function validateModuleWriteAccess(module, operation, userId, data) {
  const allowedRoles = ModuleWriteAccess[module]?.[operation];
  
  if (!allowedRoles) {
    throw new AuthorizationError(
      `Operation ${operation} not allowed on ${module}`
    );
  }
  
  const Student/Parent = await getUser(userId);
  const hasRole = allowedRoles.some(role => Student/Parent.hasRole(role));
  
  if (!hasRole) {
    throw new AuthorizationError(
      `Insufficient role. Allowed: ${allowedRoles.join(', ')}, Student/Parent: ${Student/Parent.role}`
    );
  }
  
  return true;
}
```

---

## Dependencies

### 7.1 Inter-Module Dependency Graph

```javascript
// Module dependency registry
const ModuleDependencies = {
  students: {
    dependsOn: [
      'master-setting:classes',
      'master-setting:subjects'
    ],
    dependedBy: [
      'fees',
      'attendance',
      'exam',
      'transport',
      'hostel',
      'certificates'
    ],
    communication: [
      { to: 'fees', method: 'EVENT', events: ['Student.Created', 'Student.Updated', 'Student.Promoted'] },
      { to: 'attendance', method: 'EVENT', events: ['Student.Created'] },
      { to: 'transport', method: 'SHARED_SERVICE', service: 'StudentLookupService' }
    ]
  },
  
  fees: {
    dependsOn: [
      'students',
      'master-setting:classes',
      'master-setting:feeStructures'
    ],
    dependedBy: [
      'accounts',
      'receipts'
    ],
    communication: [
      { to: 'students', method: 'EVENT', events: ['Fee.Created', 'Fee.Paid'] },
      { to: 'accounts', method: 'SHARED_SERVICE', service: 'TransactionService' }
    ]
  },
  
  dashboard: {
    dependsOn: [
      'students',
      'fees',
      'attendance',
      'exam',
      'transport',
      'hostel'
    ],
    dependedBy: [],
    communication: [
      { to: 'all', method: 'SHARED_SERVICE', service: 'StatsAggregatorService' }
    ]
  }
};
```

### 7.2 Dependency Rules

```
DEPENDENCY RULES:

1. Modules can depend on:
   - Master-setting modules (configuration)
   - Shared services (platform services)
   - Core utilities

2. Modules CANNOT depend on:
   - Other module's internal implementation
   - Other module's components
   - Other module's services directly

3. Communication methods (in Fee Transaction of preference):
   a. DOM Events (UI components)
   b. Event Bus (domain events)
   c. Shared Service (read-only shared data)
   d. Direct API (future backend)

4. Forbidden patterns:
   - Direct import of another module
   - Modifying another module's data
   - Direct Storage Layer access from another module
```

### 7.3 Dependency Validation

```javascript
// Validate module dependencies
class ModuleDependencyValidator {
  validateImports(moduleName, filePath) {
    const violations = [];
    const imports = extractImports(filePath);
    
    for (const importStatement of imports) {
      const importedModule = this.resolveModule(importStatement.source);
      
      // If importing from another module
      if (importedModule && importedModule !== moduleName) {
        // Check if it's in forbidden dependencies
        const moduleConfig = ModuleRegistry[moduleName];
        
        if (moduleConfig.forbiddenDependencies.includes(importedModule)) {
          violations.push({
            rule: 'MODULE-BOUNDARY-01',
            severity: 'CRITICAL',
            message: `Module ${moduleName} cannot depend on ${importedModule}`,
            file: filePath,
            import: importStatement.source
          });
        }
        
        // Check if it's direct import (not through index.js)
        if (this.isDirectModuleImport(importStatement.source)) {
          violations.push({
            rule: 'MODULE-BOUNDARY-02',
            severity: 'HIGH',
            message: `Direct import from ${importedModule}. Use module's index.js`,
            file: filePath,
            import: importStatement.source
          });
        }
      }
    }
    
    return violations;
  }
  
  isDirectModuleImport(importPath) {
    // Importing from inside a module directory (not from module's index.js)
    return importPath.includes('/modules/') && 
           !importPath.match(/\/modules\/[^/]+\/index\.(js|jsx)$/);
  }
}
```

---

## Forbidden Access

### 8.1 Strictly Forbidden Patterns

```javascript
// PATTERN 1: Direct module import
// ❌ CRITICAL VIOLATION
import { TransportService } from '@/modules/transport/services/transportService';

// ✅ CORRECT: Use event bus
import { EventBus } from '@/services/eventService';
EventBus.publish('Student.Updated', studentData);

// ✅ CORRECT: Use shared service if available
import { StudentLookupService } from '@/services/studentLookupService';
const student = await StudentLookupService.get(studentId);


// PATTERN 2: Direct Storage Layer access
// ❌ CRITICAL VIOLATION
await storageService.find({
  collection: 'fees',
  tenantId: currentTenant.id,
  filters: { studentId }
});

// ✅ CORRECT: Use fees module's public API
import { FeesService } from '@/modules/fees';
const fees = await FeesService.getByStudent(studentId);


// PATTERN 3: Modifying another module's data
// ❌ CRITICAL VIOLATION
await storageService.update({
  collection: 'fees',
  id: feeId,
  data: { status: 'PAID' }
});

// ✅ CORRECT: Use fee module's service
import { FeesService } from '@/modules/fees';
await FeesService.markAsPaid(feeId, paymentDetails);


// PATTERN 4: Reading another module's internals
// ❌ HIGH VIOLATION
import { calculateDiscount } from '@/modules/fees/utils/calculator';

// ✅ CORRECT: Use module's public API
import { FeesService } from '@/modules/fees';
const fee = await FeesService.calculate(studentId);
```

### 8.2 Exception Handling

```javascript
// When direct access is unavoidable, use explicit exception

/**
 * @exception MODULE-BOUNDARY-03
 * @reason Dashboard module needs direct access to student count
 *        for performance (avoiding N+1 queries through events)
 * @approvedBy: arch-board-2025-003
 * @expires: 2025-06-01
 * @migrationPlan: Implement read-optimized shared read model
 */
import { StudentService } from '@/modules/students/services/studentService';
const count = await StudentService.getCountForDashboard(tenantId);
```

---

## Communication Protocols

### 9.1 Module Communication Standards

**Method 1: Event-Based Communication (Preferred)**

```javascript
// Publisher (Students module)
import { EventBus } from '@/services/eventService';

async function promoteStudent(studentId, newClass) {
  // Update student
  const student = await updateStudent(studentId, { classId: newClass.id });
  
  // Emit event
  await EventBus.emit('Student.Promoted', {
    studentId,
    newClassId: newClass.id,
    academicYear: currentAcademicYear,
    timestamp: new Date().toISOString()
  });
  
  return student;
}

// Subscriber (Fees module)
import { EventBus } from '@/services/eventService';

class FeesModule {
  constructor() {
    // Subscribe to student events
    EventBus.on('Student.Promoted', this.handleStudentPromoted.bind(this));
  }
  
  async handleStudentPromoted(event) {
    // Recalculate fees for new class
    await this.recalculateFees(event.studentId, event.newClassId);
    
    // Generate new fee structure
    await this.assignNewFeeStructure(event.studentId, event.academicYear);
  }
}


// Method 2: Shared Service (Read-Model Pattern)
import { SharedStudentCache } from '@/services/sharedStudentCache';

class DashboardModule {
  async getStudentCount() {
    // Read from shared cache (populated by Students module)
    return await SharedStudentCache.getCount(tenantId);
  }
}


// Method 3: Direct API (Future Backend)
class APIClient {
  async getStudent(studentId) {
    return this.http.get(`/api/v1/tenants/${tenantId}/students/${studentId}`);
  }
}
```

### 9.2 Event Contract Standards

```javascript
// Event contracts must be defined and versioned
const EventContracts = {
  'Student.Created': {
    version: '1.0.0',
    payload: {
      studentId: 'string (uuid)',
      tenantId: 'string',
      classId: 'string',
      admissionNumber: 'string',
      createdAt: 'ISODateString'
    },
    subscribers: ['fees', 'attendance', 'dashboard']
  },
  
  'Student.Promoted': {
    version: '1.0.0',
    payload: {
      studentId: 'string (uuid)',
      oldClassId: 'string',
      newClassId: 'string',
      academicYear: 'string',
      promotedAt: 'ISODateString'
    },
    subscribers: ['fees', 'exam']
  },
  
  'Fee.Paid': {
    version: '1.0.0',
    payload: {
      feeId: 'string (uuid)',
      studentId: 'string (uuid)',
      amount: 'number',
      paymentMethod: 'string',
      paidAt: 'ISODateString'
    },
    subscribers: ['dashboard', 'accounts']
  }
};

// Events must be backward compatible
// To change event: version it
// Student.Promoted.v2 (with new fields)
// Student.Promoted.v1 (still supported)
```

---

## Module Registration

### 10.1 Module Manifest

**RULE MB-REG-01**: Every module MUST have a manifest.

```javascript
// src/config/moduleRegistry.js

export const MODULE_REGISTRY = {
  students: {
    id: 'students',
    name: 'Student Management',
    version: '2.0.0',
    description: 'Complete student lifecycle management',
    owner: {
      team: 'team-students',
      techLead: 'Student/Parent-123',
      contact: '#team-students'
    },
    status: 'ACTIVE',
    
    // Dependencies
    dependencies: [
      { module: 'master-setting:classes', version: '^1.0.0' },
      { module: 'master-setting:subjects', version: '^1.0.0' }
    ],
    forbiddenDependencies: [
      'payroll',
      'hr',
      'accounts'
    ],
    
    // Public API
    entryPoints: [
      'pages/StudentListPage',
      'pages/StudentProfile',
      'pages/StudentForm',
      'components/StudentTable',
      'components/StudentForm'
    ],
    services: ['StudentService'],
    events: ['Student.Created', 'Student.Updated', 'Student.Deleted', 'Student.Promoted'],
    
    // Resources
    routes: [
      { path: '/students', component: 'StudentListPage', permission: 'students:read' },
      { path: '/students/new', component: 'StudentForm', permission: 'students:write' },
      { path: '/students/:id', component: 'StudentProfile', permission: 'students:read' }
    ],
    collections: ['students', 'studentHistory', 'studentCertificates'],
    
    // Permissions
    permissions: [
      'students:read',
      'students:write',
      'students:delete',
      'students:export',
      'students:promote'
    ],
    
    // Metadata
    documentation: 'docs/06-modules/students/README.md',
    architecture: 'docs/06-modules/students/ARCHITECTURE.md',
    apiSpec: 'docs/25-api/students.yaml',
    lastReviewed: '2025-01-01',
    nextReview: '2025-07-01'
  },
  
  fees: { /* similar structure */ },
  attendance: { /* similar structure */ }
  // ... all other modules
};
```

### 10.2 Module Registration Checklist

```javascript
// When creating a new module, complete this checklist:
const NewModuleChecklist = {
  required: [
    'Create module directory in src/modules/{module-name}/',
    'Create module.json manifest',
    'Define all required subdirectories',
    'Register in moduleRegistry.js',
    'Define public API in index.js',
    'Document module purpose and boundaries',
    'Define permissions',
    'List dependencies',
    'List forbidden dependencies',
    'Create architecture documentation',
    'Add module to CI/CD pipeline',
    'Create initial tests',
    'Conduct architecture review'
  ],
  
  recommended: [
    'Create module README.md',
    'Add module to dashboard',
    'Define domain events',
    'Create data quality checks',
    'Add monitoring/alerting',
    'Create runbook for common operations'
  ]
};
```

---

## Boundary Enforcement

### 11.1 Automated Boundary Checks

```javascript
// CI/CD validation script
class BoundaryValidator {
  validateModule(moduleName, moduleConfig) {
    const violations = [];
    
    // Check 1: Verify module is registered
    if (!MODULE_REGISTRY[moduleName]) {
      violations.push({
        rule: 'MODULE-BOUNDARY-03',
        severity: 'HIGH',
        message: `Module ${moduleName} not registered`
      });
    }
    
    // Check 2: Verify dependencies
    const imports = this.getAllImports(moduleName);
    for (const importPath of imports) {
      const importedModule = this.resolveModule(importPath);
      
      if (importedModule && importedModule !== moduleName) {
        // Check if forbidden
        if (moduleConfig.forbiddenDependencies.includes(importedModule)) {
          violations.push({
            rule: 'MODULE-BOUNDARY-04',
            severity: 'CRITICAL',
            message: `Forbidden dependency: ${moduleName} → ${importedModule}`,
            import: importPath
          });
        }
        
        // Check if direct import (not through index.js)
        if (this.isDirectImport(importPath, importedModule)) {
          violations.push({
            rule: 'MODULE-BOUNDARY-05',
            severity: 'HIGH',
            message: `Direct import from ${importedModule}. Use module's public API`,
            import: importPath
          });
        }
      }
    }
    
    // Check 3: Cylc dependencies
    const cycles = this.detectCycles(moduleName);
    if (cycles.length > 0) {
      violations.push({
        rule: 'MODULE-BOUNDARY-06',
        severity: 'CRITICAL',
        message: `Circular dependency detected: ${cycles.join(' → ')}`
      });
    }
    
    return violations;
  }
}
```

### 11.2 Runtime Boundary Enforcement

```javascript
// Runtime interceptor to enforce boundaries
class ModuleBoundaryEnforcer {
  constructor() {
    this.moduleRegistry = MODULE_REGISTRY;
    this.currentModule = null; // Set during module initialization
  }
  
  // Intercept cross-module calls
  async call(targetModule, method, ...args) {
    // Check if calling module exists
    if (!this.moduleRegistry[targetModule]) {
      throw new ModuleNotFoundError(targetModule);
    }
    
    // Check if current module is allowed to call target module
    const currentModuleConfig = this.moduleRegistry[this.currentModule];
    if (currentModuleConfig.forbiddenDependencies.includes(targetModule)) {
      throw new ModuleBoundaryViolationError(
        `Module ${this.currentModule} cannot access ${targetModule}`,
        {
          caller: this.currentModule,
          target: targetModule,
          method
        }
      );
    }
    
    // Log cross-module call
    await this.logCrossModuleCall(this.currentModule, targetModule, method);
    
    // Execute call through module's public API
    const targetModuleAPI = await loadModuleAPI(targetModule);
    return targetModuleAPI[method](...args);
  }
}
```

---

## Violation Detection

### 12.1 Violation Types

| Violation | Severity | Auto-Fix | Detection Method |
|-----------|----------|----------|------------------|
| Forbidden dependency | CRITICAL | No | Static analysis |
| Circular dependency | CRITICAL | Yes | Dependency graph |
| Direct module import | HIGH | Yes | Static analysis |
| Unregistered module | HIGH | No | Manual review |
| Missing public API | MEDIUM | Yes | Static analysis |
| Undocumented boundary | MEDIUM | No | Manual review |
| Violation of event contract | HIGH | No | Runtime check |
| Missing permission definition | MEDIUM | Yes | Static analysis |

### 12.2 Detection Commands

```bash
# Check for circular dependencies between modules
npx madge --circular --extensions js,jsx src/modules/

# Check for forbidden imports
npx eslint src/modules/ --rule 'no-restricted-imports': [
  'students': ['@/modules/payroll/**', '@/modules/accounts/**'],
  'fees': ['@/modules/transport/**', '@/modules/hostel/**']
]

# Validate module registry
node scripts/validate-module-registry.js

# Check for direct module imports
grep -r "from '@/modules/" src/modules/*/ | grep -v "index.js"
```

---

## Auto Fix Procedures

### 13.1 Auto-Fixable Issues

**Issue 1: Direct Module Import**

```javascript
// BEFORE (violation)
import { TransportService } from '@/modules/transport/services/transportService';

// AFTER (auto-fixed)
import { EventBus } from '@/services/eventService';

// Auto-fix script
function fixDirectModuleImport(content, fromModule, toModule) {
  // Replace direct import with event bus
  return content.replace(
    new RegExp(`import.*from '@/modules/${toModule}/`, 'g'),
    `import { EventBus } from '@/services/eventService';`
  );
}
```

**Issue 2: Missing Module Registration**

```javascript
// Auto-generate module.json template
function generateModuleManifest(modulePath) {
  const moduleName = path.basename(modulePath);
  
  return {
    name: moduleName,
    displayName: toTitleCase(moduleName),
    version: '1.0.0',
    description: 'TODO: Add description',
    owner: `team-${moduleName}`,
    status: 'ACTIVE',
    dependencies: [],
    forbiddenDependencies: [],
    entryPoints: [],
    permissions: [],
    routes: [],
    collections: []
  };
}
```

**Issue 3: Missing Public API (index.js)**

```javascript
// Auto-generate index.js with exports
function generateModuleIndex(modulePath) {
  const files = glob.sync('**/*.js', { cwd: modulePath });
  
  const exports = files.map(file => {
    const name = path.basename(file, path.extname(file));
    const exportName = toPascalCase(name);
    return `export { ${exportName} } from './${file.replace(/\.js$/, '')}';`;
  });
  
  return exports.join('\n');
}
```

---

## Troubleshooting

### 14.1 Common Issues

**Issue: Circular dependency between modules A and B**

**Diagnosis**:
```bash
npx madge --circular src/modules/a/ src/modules/b/
```

**Resolution Options**:
1. Extract shared code to `src/services/` or `src/core/`
2. Use event-based communication instead of direct calls
3. Create shared service that both modules can depend on

**Issue: Module can't import from another module**

**Cause**: Module not registered OR forbidden dependency

**Resolution**:
1. Check if module is in `moduleRegistry.js`
2. Check if it's in `forbiddenDependencies`
3. If absolutely necessary, request exception through RFC process

**Issue: Performance degradation due to event overhead**

**Solution**: Use shared read-model pattern for read-heavy operations
```javascript
// Instead of publishing event and waiting for update
const data = await SharedCache.get(tenantId);

// Shared cache is updated asynchronously by subscriber
EventBus.on('Data.Updated', async (event) => {
  await SharedCache.update(event.tenantId, event.data);
});
```

---

## References


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

- **RULE-01**: Architecture Guidelines (layer rules, dependency rules)
- **RULE-02**: Storage & Data Persistence (data access rules)
- **RULE-03**: Service Layer (service boundaries)

---

*End of RULE-06: Module Boundaries*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

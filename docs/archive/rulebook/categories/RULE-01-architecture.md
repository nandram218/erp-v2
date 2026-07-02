# RULE-01: Architecture Guidelines

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Architecture Team  
**Severity:** CRITICAL  
**Category:** Core  
**Applies To:** All source code, configurations, and directory structures  
**Detection Method:** Static Analysis, Dependency Graph Validation, Manual Review  
**Auto-Fix Available:** Partial  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Layer Rules](#layer-rules)
5. [Dependency Rules](#dependency-rules)
6. [Folder Ownership](#folder-ownership)
7. [Module Ownership](#module-ownership)
8. [Import Restrictions](#import-restrictions)
9. [Feature Boundaries](#feature-boundaries)
10. [Domain Driven Rules](#domain-driven-rules)
11. [Shared Components](#shared-components)
12. [Core Services](#core-services)
13. [React Architecture](#react-architecture)
14. [Folder Naming](#folder-naming)
15. [Module Registration](#module-registration)
16. [Anti Patterns](#anti-patterns)
17. [Architecture Violations](#architecture-violations)
18. [Architecture Auto Fix](#architecture-auto-fix)

---

## WHY

### Business Rationale
- **Maintainability**: Clear architecture reduces cognitive load and onboarding time.
- **Scalability**: Proper layering ensures the system can grow to 100+ modules.
- **Parallel Development**: Module boundaries enable teams to work independently.
- **Future Backend**: Layered architecture ensures frontend can migrate to services.

### Technical Rationale
- **Separation of Concerns**: Each layer has a single, well-defined responsibility.
- **Testability**: Isolated layers enable unit testing and mocking.
- **Performance**: Clear data flow enables optimization at each layer.
- **Security**: Boundary enforcement prevents unauthorized access patterns.

---

## WHEN

### Applies To
- New Project Initialization: Must follow architecture from day one.
- New Module Creation: Must register and follow module conventions.
- Refactoring: Must maintain or improve architecture compliance.
- Code Review: Every PR must pass architecture validation.
- Dependency Addition: New npm packages must be approved and placed correctly.
- File Creation: Every new file must be placed in the correct directory.

### Does NOT Apply To
- Temporary prototype code (must be refactored before production)
- Third-party library code (governed by wrapper patterns)
- Generated code (must be wrapped before use)

---

## WHERE

### Scope
- Entire Codebase: `src/` directory
- All Modules: `src/modules/`, `src/master-setting/`
- All Services: `src/services/`, `src/core/`
- All Components: `src/layouts/`, `src/components/` (if created)
- Configurations: `src/config/`, `.env*`, `*.config.js`
- Tests: `__tests__/`, `*.test.js`, `*.spec.js`

---

## Layer Rules

### 1.1 Layered Architecture Mandate

```
┌───────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                        │
│  Responsibility: UI rendering, Student/Parent interaction, form inputs  │
│  Location:     src/modules/{module}/components/*.jsx         │
│                src/modules/{module}/pages/*.jsx              │
│                src/layouts/*.jsx                             │
│  Dependencies: Service Layer ONLY                            │
│  Forbidden:    Direct storage access, business logic         │
└───────────────────────────────────────────────────────────────┘
                            ▼ imports
┌───────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                            │
│  Responsibility: Business logic, validation, orchestration   │
│  Location:     src/services/*.js                             │
│                src/modules/{module}/services/*.js            │
│  Dependencies: Data Layer, Core Layer, Other Services        │
│  Forbidden:    UI components, direct DOM manipulation        │
└───────────────────────────────────────────────────────────────┘
                            ▼ imports
┌───────────────────────────────────────────────────────────────┐
│                        CORE LAYER                             │
│  Responsibility: Pure business logic, algorithms, engines    │
│  Location:     src/core/**/*.js                              │
│  Dependencies: Data Layer ONLY                               │
│  Forbidden:    UI, Services, Storage APIs                    │
└───────────────────────────────────────────────────────────────┘
                            ▼ imports
┌───────────────────────────────────────────────────────────────┐
│                        DATA LAYER                             │
│  Responsibility: Storage abstraction, data access, caching   │
│  Location:     src/services/storageService.js                │
│                src/services/tenantContextService.js          │
│  Dependencies: None (depends on browser APIs)                │
│  Forbidden:    Business logic, UI components                 │
└───────────────────────────────────────────────────────────────┘
```

### 1.2 Layer Communication Rules

| From Layer | Can Import | Cannot Import | Rationale |
|------------|-----------|---------------|-----------|
| Presentation | Services | Storage, Core, Other Modules | UI should be dumb |
| Service | Core, Storage, Other Services | Presentation, UI Components | Logic must be testable |
| Core | Storage | Services, Presentation, UI | Pure functions |
| Storage | Nothing | All other layers | Foundation layer |

**MANDATORY**: Every import must respect this hierarchy. Violations are CRITICAL severity.

### 1.3 Layer Responsibilities

#### Presentation Layer
- Render UI components
- Handle Student/Parent events (clicks, inputs)
- Call service methods
- Display loading/error states
- Manage local UI state (form inputs, modal visibility)
- **FORBIDDEN**: Business logic, storage access, data transformation

#### Service Layer
- Implement business rules
- Validate inputs
- Orchestrate data operations
- Handle errors and retries
- Log business events
- Cache frequently accessed data
- **FORBIDDEN**: Rendering logic, direct DOM manipulation

#### Core Layer
- Pure functions and algorithms
- Data transformations
- Calculation engines (e.g., fee calculator)
- Validation logic (reusable)
- Constants and enums
- **FORBIDDEN**: Side effects, storage calls, UI references

#### Data Layer
- Abstract storage APIs (IndexedDB, localStorage, future API)
- Tenant isolation enforcement
- Transaction management
- Query building
- Connection pooling (future)
- **FORBIDDEN**: Business logic, UI references

---

## Dependency Rules

### 2.1 Dependency Direction

```
Rule: Dependencies must flow downward only
Allowed:     Higher → Lower
Forbidden:   Lower → Higher
Example:    Pages → Services → Core → Storage
```

**RULE**: Upward dependencies create circular dependencies and tight coupling.

### 2.2 Inter-Module Dependencies

```
FORBIDDEN:
  Module A → Module B (direct import)
  Module A → Module B's internal files
  Module A → Module B's components

ALLOWED:
  Module A → Shared Service
  Module A → Core Utility
  Module A → Data Layer
```

**Exception**: Modules may import from `src/shared/` or `src/utils/` only.

### 2.3 Service Dependencies

```
ALLOWED:
  Service A → Service B (if A depends on B's functionality)
  Service → Core
  Service → Data Layer

FORBIDDEN:
  Service → UI Component
  Service → Module-specific code
```

### 2.4 Circular Dependency Detection

**RULE**: Circular dependencies are FORBIDDEN at all levels.

**Detection Method**:
```bash
# Use Madge or custom script
npx madge --circular src/
```

**Allowed Exceptions** (with documented approval in code comment):
- Mutual recursion in pure functions (must be documented in code)
- Test files mocking dependencies (test-only)

---

## Folder Ownership

### 3.1 Directory Ownership Matrix

| Directory | Owner | Can Modify | Can Read | Forbidden |
|-----------|-------|------------|----------|-----------|
| `src/modules/{module}/` | Module Team | Module Team | All Devs | Other modules |
| `src/master-setting/{setting}/` | Platform Team | Platform Team | All Devs | Direct modification by module teams |
| `src/services/` | Platform Team | Platform Team | All Devs | Business logic |
| `src/core/` | Platform Team | Platform Team | All Devs | Side effects |
| `src/layouts/` | Frontend Team | Frontend Team | All Devs | Business logic |
| `src/store/` | Frontend Team | Frontend Team | All Devs | Direct state mutation outside actions |
| `src/config/` | DevOps + Platform | DevOps + Platform | Read-only for all | Hardcoded values in code |
| `src/utils/` | Platform Team | All Devs (with review) | All Devs | Module-specific code |

### 3.2 File Ownership Rules

- Every file MUST have an `@owner` tag in the header comment.
- Ownership changes require approval from current owner and new owner.
- Files without owner tag are considered `platform-team` owned.

**Example**:
```javascript
/**
 * @owner module:fees
 * @description Fee calculation engine
 * @since 2025-01-15
 */
```

---

## Module Ownership

### 4.1 Module Registration

Every module MUST be registered in `src/config/moduleRegistry.js`:

```javascript
export const MODULE_REGISTRY = {
  students: {
    name: 'Student Management',
    owner: 'team-students',
    path: 'src/modules/students',
    dependencies: ['fees', 'attendance'],
    forbiddenDependencies: ['payroll', 'hr'],
    entryPoints: ['StudentListPage', 'StudentForm'],
    status: 'ACTIVE',
    version: '1.0.0'
  },
  fees: {
    name: 'Fee Management',
    owner: 'team-fees',
    path: 'src/modules/fees',
    dependencies: ['students', 'master-setting:classes'],
    forbiddenDependencies: ['transport', 'hostel'],
    entryPoints: ['FeesPage', 'FeesCollectModal'],
    status: 'ACTIVE',
    version: '1.0.0'
  }
  // ... other modules
};
```

### 4.2 Module Ownership Rules

- **Single Owner**: Each module has exactly one owning team.
- **Owner Responsibility**: Module owner is responsible for all code within the module.
- **Cross-Module Changes**: Requires approval from both module owners.
- **Deprecation**: Modules must follow deprecation process (6-month notice minimum).

### 4.3 Module Lifecycle

```
PLANNING → DESIGN REVIEW → DEVELOPMENT → CODE REVIEW → TESTING → DEPLOYMENT → MAINTENANCE → DEPRECATION
   ↑           ↑             ↑             ↑            ↑           ↑             ↑
   │           │             │             │            │           │             │
   │           │             │             │            │           │             └─> Arch Board Approval
   │           │             │             │            │           └─> QA + Automated Tests
   │           │             │             │            └─> Architecture Review
   │           │             │             └─> Peer Review (2 reviewers)
   │           │             └─> Implementation
   │           └─> Tech Spec + Approval
   └─> RFC in docs/04-decisions/
```

---

## Import Restrictions

### 5.1 Absolute Import Rules

**MANDATORY**: Use absolute imports from `src/` root:

```javascript
// CORRECT
import { StudentService } from '@/services/studentService';
import { calculateAge } from '@/utils/dateUtils';

// FORBIDDEN
import { StudentService } from '../../services/studentService';
import { calculateAge } from '../../../utils/dateUtils';
```

**Enforcement**: ESLint rule `@nx/absolute-imports` or custom rule.

### 5.2 Import Fee Transaction (Mandatory)

```javascript
// 1. External packages (node_modules)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal aliases (@/)
import { StudentService } from '@/services/studentService';
import { useAuth } from '@/hooks/useAuth';

// 3. Relative imports (only within same module)
import { StudentTable } from './components/StudentTable';
import { studentSchema } from './validation/studentSchema';

// 4. Styles (CSS modules, styled-components)
import styles from './StudentForm.module.css';
```

**Enforcement**: ESLint `sort-imports` with custom Fee Transaction.

### 5.3 Prohibited Imports

```javascript
// FORBIDDEN: UI components in services
// File: src/services/feesService.js
import { FeesTable } from '@/modules/fees/components/FeesTable'; // ❌ CRITICAL

// FORBIDDEN: Business logic in UI components
// File: src/modules/fees/components/FeesTable.jsx
import { calculateCompoundInterest } from '@/core/finance/compoundInterest'; // ❌ HIGH

// FORBIDDEN: Cross-module imports
// File: src/modules/students/pages/StudentPage.jsx
import { TransportService } from '@/modules/transport/services/transportService'; // ❌ CRITICAL
```

### 5.4 Barrel File (Index File) Rules

- **ALLOWED**: Public API exports for a module
- **FORBIDDEN**: Re-exporting everything (`export * from './module'`)
- **REQUIRED**: Explicit exports only

```javascript
// CORRECT: src/modules/students/index.js
export { StudentForm } from './components/StudentForm';
export { StudentTable } from './components/StudentTable';
export { StudentService } from './services/studentService';
export { STUDENT_SCHEMA } from './validation/studentSchema';

// FORBIDDEN: src/modules/students/index.js
export * from './components'; // ❌ MEDIUM - implicit exports
```

---

## Feature Boundaries

### 6.1 Feature Module Structure

Every feature module MUST follow this standardized structure:

```
src/modules/{module-name}/
├── components/          # Reusable UI components for this module
│   ├── {Module}Table.jsx
│   ├── {Module}Form.jsx
│   └── {Module}Card.jsx
├── pages/              # Route-level pages
│   ├── {Module}ListPage.jsx
│   ├── {Module}DetailPage.jsx
│   └── {Module}CreatePage.jsx
├── services/           # Module-specific services
│   └── {module}Service.js
├── hooks/              # Custom React hooks (if needed)
│   └── use{Module}Data.js
├── validation/         # Zod/Yup schemas
│   └── {module}Schema.js
├── utils/              # Module-specific utilities
│   └── {module}Helpers.js
├── styles/             # Module-specific styles
│   └── {module}Styles.js
├── __tests__/          # Module tests
│   ├── components/
│   ├── services/
│   └── integration/
├── index.js            # Public API exports
└── README.md           # Module documentation
```

### 6.2 Public API Surface

Each module MUST define its public API in `index.js`:

```javascript
// src/modules/fees/index.js

/**
 * PUBLIC API - Do not import from internal paths
 * To consume this module, import from '@/modules/fees'
 */

// Components
export { FeesPage } from './pages/FeesPage';
export { FeesTable } from './components/FeesTable';
export { FeesCollectModal } from './components/FeesCollectModal';

// Services
export { FeesService } from './services/feesService';
export { ReceiptService } from './services/receiptService';

// Validation
export { FEES_SCHEMA, RECEIPT_SCHEMA } from './validation/feesSchema';

// Types
export type { Fee, Receipt, FeeStatus } from './types';

// Hooks
export { useFees, useReceipt } from './hooks/useFees';
```

### 6.3 Internal vs Public

- **Public**: Exported via `index.js` - stable API, backward compatible
- **Internal**: Not exported - can change without notice
- **Rule**: External modules may ONLY import from `index.js` public API

---

## Domain Driven Rules

### 7.1 Bounded Contexts

```
ERP-v2 Bounded Contexts:

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Student Lifecycle │     │  Financial Mgmt  │     │  Logistics Mgmt  │
│  Context          │     │  Context         │     │  Context         │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ - Students       │     │ - Fees           │     │ - Transport      │
│ - Admission      │     │ - Receipts       │     │ - Routes         │
│ - Promotion      │     │ - Accounts       │     │ - Vehicles       │
│ - Certificates   │     │ - Refunds        │     │ - Hostel         │
└─────────────────┘     └─────────────────┘     └─────────────────┘

Rules:
1. Contexts must NOT share Storage Layer tables directly
2. Contexts communicate via well-defined service APIs
3. Each context has its own aggregate roots
4. Context boundaries are enforced at storage layer
```

### 7.2 Aggregate Roots

Every module MUST define its aggregate roots:

```javascript
// src/modules/students/aggregates/Student.js

class Student {
  // Aggregate root - only entry point for student data
  constructor(id, data) {
    this.id = id;
    this.data = data;
  }
  
  // Business methods
  promoteToNextClass() {
    // Enforce business rules
    if (!this.isEligibleForPromotion()) {
      throw new Error('Student not eligible for promotion');
    }
    // ...
  }
  
  // FORBIDDEN: External modification of internal state
  // All modifications must go through aggregate methods
}
```

**Rules**:
1. Only aggregate roots can be directly loaded from storage.
2. All modifications to aggregates must go through aggregate methods.
3. No external code may directly modify aggregate internal state.
4. Aggregates must enforce invariants.

### 7.3 Domain Events

```
All significant domain actions must emit domain events:

Event Structure:
{
  eventId: string (UUID),
  eventType: string (e.g., 'Student.Promoted', 'Fee.Paid'),
  aggregateId: string,
  aggregateType: string,
  occurredAt: ISODateString,
  payload: object,
  metadata: {
    tenantId: string,
    userId: string,
    correlationId: string
  }
}

Benefits:
- Audit trail (RULE-16)
- Decoupled integration between contexts
- Event sourcing capability (future)
- Debugging and monitoring
```

---

## Shared Components

### 8.1 Shared Component Rules

```
ALLOWED in src/shared/ or src/components/:
- Truly generic UI components (Button, Input, Modal, Table)
- Reusable layout components (DashboardShell, PageHeader)
- Common hooks (useAuth, useTheme, useTenant)
- Common utilities (formatDate, validateEmail)

FORBIDDEN in shared:
- Business logic components
- Module-specific features
- Domain-specific terminology
- Hardcoded module references
```

### 8.2 Component Ownership

- **Shared Components**: Owned by Frontend Team, maintained via RFC for changes.
- **Module Components**: Owned by respective module team.
- **Shared Hook Changes**: Require notification to all consuming modules.

### 8.3 Component Versioning

```javascript
// Shared components must be semantically versioned

// v1 (stable, backward compatible)
export const DEFAULT_BUTTON_PROPS = {
  variant: 'primary',
  size: 'medium',
  disabled: false
};

// v2 (breaking change - requires major version bump)
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DANGER: 'danger'
};
```

---

## Core Services

### 9.1 Core Service Definition

Core services are platform-level services used across multiple modules:

```
src/services/
├── storageService.js          # Storage abstraction layer
├── tenantContextService.js    # Multi-tenant context
├── authService.js             # Authentication
├── runtimeValidationService.js # Runtime validation
├── snapshotService.js         # Data snapshots
├── auditService.js            # Audit logging
├── eventService.js            # Domain events
├── cacheService.js            # Caching abstraction
├── notificationService.js     # Notification dispatch
└── apiService.js              # Future backend API School/Tenant

src/core/
├── fee-engine/
│   ├── feeNormalizer.js       # Fee calculation engine
│   └── feeValidator.js
├── validation/
│   ├── validators.js          # Reusable validators
│   └── schemas.js
├── finance/
│   └── compoundInterest.js    # Financial calculations
└── date/
    └── dateUtils.js           # Date manipulation
```

### 9.2 Core Service Rules

1. **No UI Dependencies**: Core services must never import UI components.
2. **Pure Functions Preferred**: Core logic should be pure and testable.
3. **Singleton Pattern**: Core services use singleton pattern with dependency injection.
4. **Interface Contracts**: Every core service must define a JSDoc interface.

```javascript
/**
 * @interface StorageService
 * @description Abstracts storage operations for multi-tenant support
 * 
 * @method getItem(key, tenantId) - Get item for tenant
 * @method setItem(key, value, tenantId) - Set item for tenant
 * @method removeItem(key, tenantId) - Remove item for tenant
 * @method clear(tenantId) - Clear all data for tenant
 * @method getAllKeys(tenantId) - Get all keys for tenant
 */
class StorageService {
  // Implementation
}
```

### 9.3 Service Registration

```javascript
// src/services/index.js

export { StorageService } from './storageService';
export { TenantContextService } from './tenantContextService';
export { AuthService } from './authService';

// Service container for dependency injection
export const ServiceContainer = {
  storage: StorageService.getInstance(),
  tenantContext: TenantContextService.getInstance(),
  auth: AuthService.getInstance()
};
```

---

## React Architecture

### 10.1 Component Hierarchy

```
App
├── AuthProvider (context)
│   └── TenantProvider (context)
│       └── Router
│           ├── DashboardLayout
│           │   ├── Sidebar
│           │   ├── Header
│           │   └── {children}
│           │       ├── StudentListPage (module page)
│           │       │   ├── StudentTable (module component)
│           │       │   ├── StudentFilter (module component)
│           │       │   └── StudentForm (module component)
│           │       │       ├── Input (shared component)
│           │       │       ├── Select (shared component)
│           │       │       └── Button (shared component)
│           │       └── FeesPage (module page)
```

### 10.2 Component Types

| Type | Location | Responsibility | Example |
|------|----------|----------------|---------|
| Page | `src/modules/{module}/pages/` | Route-level container | `StudentListPage.jsx` |
| Component | `src/modules/{module}/components/` | Reusable UI piece | `StudentTable.jsx` |
| Layout | `src/layouts/` | Shell/wrapper | `DashboardLayout.jsx` |
| Shared Component | `src/components/` or `src/shared/` | Generic UI | `Button.jsx`, `Modal.jsx` |
| Hook | `src/hooks/` or `src/modules/{module}/hooks/` | Reusable logic | `useAuth.js`, `useFees.js` |
| Container | `src/containers/` | Connect Redux/store | `StudentListContainer.jsx` |

### 10.3 Component Rules

- **Page Components**: Handle routing, data fetching, orchestration.
- **Presentational Components**: Receive data via props, emit events via callbacks.
- **Container Components**: Connect to store, pass data to presentational components.
- **Smart vs Dumb**: Maximize "dumb" components, minimize "smart" components.

```javascript
// CORRECT: Dumb component
function StudentTable({ students, onEdit, onDelete }) {
  return (
    <table>
      {students.map(student => (
        <tr key={student.id}>
          <td>{student.name}</td>
          <td>
            <Button onClick={() => onEdit(student.id)}>Edit</Button>
          </td>
        </tr>
      ))}
    </table>
  );
}

// CORRECT: Smart component (container)
function StudentListContainer() {
  const [students, setStudents] = useState([]);
  
  useEffect(() => {
    StudentService.getAll().then(setStudents);
  }, []);
  
  return <StudentTable students={students} onEdit={handleEdit} />;
}
```

### 10.4 State Management Rules

```
State Ownership:

1. Local State (useState)
   - Form inputs
   - UI toggles (modals, dropdowns)
   - Component-specific data

2. Context State (useContext)
   - Auth state (current Student/Parent)
   - Tenant state (current school)
   - Theme state

3. Global State (Redux/Zustand)
   - Cross-module shared state
   - Cached data (students list)
   - UI state (sidebar collapsed)

4. Server State (React Query / SWR)
   - Data from services
   - Auto-refetching
   - Caching and revalidation

Rules:
- NEVER duplicate state across layers
- Single source of truth for each piece of data
- Lift state up only when necessary
- Prefer server state over global state
```

---

## Folder Naming

### 11.1 Naming Conventions

| Entity | Convention | Example |
|--------|------------|---------|
| Module | kebab-case | `student-management` or `students` |
| Folder | kebab-case | `student-records` |
| File (component) | PascalCase | `StudentListPage.jsx` |
| File (service) | camelCase | `studentService.js` |
| File (utility) | camelCase | `dateUtils.js` |
| File (test) | `.test.js` or `.spec.js` | `studentService.test.js` |
| File (CSS module) | PascalCase + module | `StudentForm.module.css` |

### 11.2 Abbreviation Rules

**FORBIDDEN Abbreviations**:
- `svc` → Use `service`
- `ctrl` → Use `controller` (not used in frontend, but for future)
- `util` → Use `utils` (plural)
- `str` → Use `struct` or full word
- `ctx` → Use `context`

**ALLOWED Abbreviations** (widely understood):
- `db` → Storage Layer
- `api` → Application Programming Interface
- `ui` → Student/Parent Interface
- `url` → Uniform Resource Locator
- `id` → Identifier
- `i18n` → Internationalization

### 11.3 Index File Naming

- **ALLOWED**: `index.js`, `index.jsx`, `index.ts`, `index.tsx`
- **PREFERRED**: `index.js` for JavaScript projects

---

## Module Registration

### 12.1 Module Manifest

Every module MUST have a `module.json` manifest:

```json
{
  "name": "students",
  "displayName": "Student Management",
  "version": "1.2.0",
  "description": "Complete student lifecycle management",
  "owner": "team-students",
  "status": "ACTIVE",
  "dependencies": [
    "fees",
    "attendance"
  ],
  "forbiddenDependencies": [
    "payroll",
    "hr"
  ],
  "permissions": [
    "students:read",
    "students:write",
    "students:delete"
  ],
  "entryPoints": [
    "pages/StudentListPage",
    "pages/StudentProfile",
    "components/StudentTable"
  ],
  "routes": [
    {
      "path": "/students",
      "component": "StudentListPage",
      "permission": "students:read"
    },
    {
      "path": "/students/:id",
      "component": "StudentProfile",
      "permission": "students:read"
    },
    {
      "path": "/students/new",
      "component": "StudentForm",
      "permission": "students:write"
    }
  ],
  "apiEndpoints": [
    "/api/v1/tenants/{tenantId}/students",
    "/api/v1/tenants/{tenantId}/students/{studentId}"
  ],
  "storageCollections": [
    "students",
    "studentHistory"
  ],
  "events": [
    "Student.Created",
    "Student.Updated",
    "Student.Deleted",
    "Student.Promoted"
  ]
}
```

### 12.2 Module Registration Enforcement

**Detection Method**:
- CI checks for `module.json` existence
- Validates JSON schema
- Checks for circular dependencies in dependency graph
- Validates route uniqueness across modules

**Violation Severity**: HIGH (blocks merge)

---

## Anti Patterns

### 13.1 Strictly Prohibited Patterns

#### 13.1.1 Direct Storage Access from UI
```javascript
// ❌ CRITICAL VIOLATION
function StudentPage() {
  useEffect(() => {
    const students = localStorage.getItem('students'); // Direct access
    setStudents(JSON.parse(students));
  }, []);
}
```

**Why**: Bypasses service layer, breaks tenant isolation, no caching, no validation.

#### 13.1.2 Cross-Module Imports
```javascript
// ❌ CRITICAL VIOLATION
import { TransportService } from '@/modules/transport/services/transportService';

// ✅ CORRECT: Use shared service or event-based communication
import { EventBus } from '@/services/eventService';
EventBus.publish('Student.Updated', studentData);
```

#### 13.1.3 God Components
```javascript
// ❌ HIGH VIOLATION
// 500+ lines handling: data fetching, sorting, filtering,
// validation, error handling, printing, export, analytics...
// Single Responsibility Principle violation
```

**Fix**: Split into smaller components and hooks.

#### 13.1.4 Business Logic in UI
```javascript
// ❌ HIGH VIOLATION
function FeesTable({ fees }) {
  const total = fees.reduce((sum, fee) => {
    if (fee.status === 'PAID' && fee.amount > 1000) {
      return sum + (fee.amount * 0.1); // Business logic!
    }
    return sum + fee.amount;
  }, 0);
}
```

**Fix**: Move calculation to fee engine service.

#### 13.1.5 Mixing Transaction and Master Data
```javascript
// ❌ HIGH VIOLATION
// Using classes table to store fee transactions
db.collection('classes').add({ feeAmount: 500, studentId: '123' });
```

**Fix**: Use separate collections (tables) for transactions.

#### 13.1.6 Magic Strings and Numbers
```javascript
// ❌ MEDIUM VIOLATION
if (Student/Parent.role === 'admin') { } // 'admin' is magic string
setTimeout(callback, 30000); // 30000 is magic number

// ✅ CORRECT
if (Student/Parent.role === USER_ROLES.ADMIN) { }
setTimeout(callback, DEFAULT_TIMEOUT_MS);
```

#### 13.1.7 Duplicate Code (Copy-Paste)
```javascript
// ❌ MEDIUM VIOLATION
// File A: calculateStudentFee(studentId) { ... }
// File B: computeStudentFee(studentId) { ... } // Duplicate!
```

**Fix**: Extract to shared service.

#### 13.1.8 Deep Import Paths
```javascript
// ❌ HIGH VIOLATION
import { normalizeClassKey } from '@/modules/classes-subjects/utils/classKeyNormalizer';

// ✅ CORRECT
import { normalizeClassKey } from '@/modules/classes-subjects';
```

#### 13.1.9 Inconsistent File Extensions
```javascript
// ❌ MEDIUM VIOLATION
Component.jsx  // Some components .js, some .jsx
utils.js       // Inconsistent

// ✅ CORRECT
Component.jsx  // All components .jsx
utils.js       // Consistent
```

#### 13.1.10 Tight Coupling via Global State
```javascript
// ❌ HIGH VIOLATION
store.dispatch({ type: 'STUDENT_SET', payload: student });
// Component is tightly coupled to global state shape

// ✅ CORRECT
const { updateStudent } = useStudentContext();
updateStudent(student);
```

#### 13.1.11 Default Exports
```javascript
// ❌ MEDIUM VIOLATION
export default function StudentPage() { }

// ✅ CORRECT
export function StudentPage() { }
```

**Why**: Default exports hinder tree-shaking, reduce refactoring safety, and cause inconsistent import styles.

#### 13.1.12 Barrel File Abuse
```javascript
// ❌ HIGH VIOLATION
// src/modules/students/index.js
export * from './components'; // Re-exports everything implicitly
export * from './pages';
export * from './services';

// ✅ CORRECT: Explicit exports only
export { StudentPage } from './pages/StudentPage';
export { StudentService } from './services/studentService';
```

**Why**: Implicit exports expose internal implementation details and make refactoring dangerous.

### 13.2 Prohibited Directory Structures

```
FORBIDDEN:
src/
├── components/          # Generic - PROHIBITED
├── helpers/             # Use utils/ instead
├── libs/                # Use core/ or services/ instead
├── src/                 # Nested src - PROHIBITED
├── pages/               # Should be inside modules/
├── services/            # Should be inside modules/ or src/services/ (flat)
├── utils/               # Use src/utils/ instead
└── common/              # Use src/shared/ instead
```

### 13.3 Prohibited Naming Patterns

```
FORBIDDEN:
- Default export (use named exports)
- Index file with different name (e.g., main.js)
- Leading underscores (e.g., _helper.js)
- Trailing spaces in file names
- Special characters (!@#$%^&*())
- Test files outside __tests__/ or *.test.js pattern
- Abbreviated names (svc, util, ctrl, str, ctx)
```

---

## Architecture Violations

### 14.1 Violation Detection

#### Automated Detection

```bash
# Check for circular dependencies
npx madge --circular src/

# Check import paths
npx eslint src/ --rule 'import/no-relative-packages: error'

# Check layer violations
npx eslint src/ --rule 'no-restricted-imports': [
  {
    "paths": ["../../services/*"],
    "message": "UI must not import services via relative paths"
  }
]

# Check file locations
npx eslint src/ --rule 'no-restricted-syntax': [
  {
    "selector": "ImportDeclaration[source.value='/services/']",
    "message": "Use @/services/ instead of relative path"
  }
]
```

#### Manual Detection

- Architecture review checklist
- Dependency graph analysis
- Code review

### 14.2 Violation Severity Matrix

| Violation | Severity | Auto-Fix | Manual Fix Required |
|-----------|----------|----------|---------------------|
| Circular dependency | CRITICAL | No | Yes - refactor |
| Cross-module import | CRITICAL | Yes | No |
| Direct storage access in UI | CRITICAL | Yes | No |
| Business logic in UI | HIGH | No | Yes - extract to service |
| God component (>500 lines) | HIGH | No | Yes - split |
| Wrong folder placement | MEDIUM | Yes | No |
| Missing module.json | MEDIUM | No | Yes - create |
| Inconsistent naming | MEDIUM | Yes | No |
| Missing owner tag | LOW | Yes | No |
| Default export | MEDIUM | Yes | No |
| Barrel file abuse | HIGH | No | Yes - fix exports |

### 14.3 Violation Reporting

Every violation MUST generate an architecture audit entry:

```json
{
  "violationId": "ARCH-2025-001",
  "ruleId": "RULE-01-arch",
  "severity": "CRITICAL",
  "type": "CIRCULAR_DEPENDENCY",
  "file1": "src/modules/students/services/studentService.js",
  "file2": "src/modules/fees/services/feesService.js",
  "description": "Circular dependency detected",
  "detectedAt": "2025-01-15T10:30:00Z",
  "detectedBy": "CI/CD Pipeline",
  "status": "OPEN"
}
```

---

## Architecture Auto Fix

### 15.1 Auto-Fixable Violations

1. **Cross-module imports** → Replace with event bus communication
2. **Wrong folder** → Move file and update imports
3. **Missing owner tag** → Add `@owner` tag
4. **Inconsistent naming** → Rename following conventions
5. **Default exports** → Convert to named exports
6. **Import Fee Transaction** → Fix using prettier
7. **Missing module.json** → Create template

### 15.2 Auto-Fix Implementation

```javascript
// scripts/architecture-fixes.js

export const ArchitectureFixes = {
  // Fix 1: Convert cross-module imports to event-based
  fixCrossModuleImport(fileContent, fromModule, toModule) {
    // Replace direct import with event bus
    return fileContent.replace(
      new RegExp(`import.*from '@/modules/${toModule}/`, 'g'),
      `import { EventBus } from '@/services/eventService';\n// TODO: Replace direct import with event communication`
    );
  },
  
  // Fix 2: Move file to correct directory
  moveFileToCorrectDirectory(filePath, correctDirectory) {
    // Implement file move with import path updates
  },
  
  // Fix 3: Add missing owner tag
  addOwnerTag(fileContent, owner) {
    if (!fileContent.includes('@owner')) {
      return `/**\n * @owner ${owner}\n */\n` + fileContent;
    }
    return fileContent;
  },
  
  // Fix 4: Fix import Fee Transaction
  fixImportOrder(fileContent) {
    // Use prettier or custom parser
  },
  
  // Fix 5: Convert default export to named export
  convertDefaultToNamed(fileContent, identifier) {
    return fileContent
      .replace(/export default /g, `export const ${identifier} = `)
      .replace(/export { default as /g, `export { ${identifier} as `);
  }
};
```

### 15.3 Manual Fix Procedures

#### Circular Dependencies

**Step 1: Identify the cycle**
```bash
npx madge --circular src/modules/students/ src/modules/fees/
```

**Step 2: Choose a strategy**:
- **Extract shared code**: Move common code to `src/services/` or `src/core/`
- **Invert dependency**: Use dependency injection or events
- **Merge modules**: If tightly coupled, consider merging (rare)

**Step 3: Refactor**
```javascript
// Before: studentsService.js imports feesService.js
import { FeesService } from '../fees/feesService';

// After: Extract shared logic to service
import { StudentFeesCalculator } from '@/core/fee-engine/studentFeesCalculator';
```

**Step 4: Verify**
```bash
npx madge --circular src/modules/students/ src/modules/fees/
# Should output: No circular dependencies detected
```

#### God Component Refactoring

**Step 1: Analyze the component**
```bash
# Count lines
wc -l src/modules/students/components/StudentPage.jsx
```

**Step 2: Identify responsibilities**
- Data fetching → Move to custom hook
- Validation → Move to validation schema
- Event handlers → Extract to handlers object or separate functions
- Business logic → Move to service

**Step 3: Extract to hooks**
```javascript
// Before: Everything in component
function StudentPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({});
  
  useEffect(() => {
    loadStudents(filters, sortConfig);
  }, [filters, sortConfig]);
}

// After: Extract to hooks
function StudentPage() {
  const { students, loading, refetch } = useStudents();
  const { filters, sortConfig, updateSort } = useStudentSorting();
  
  return <StudentTable students={students} onSort={updateSort} />;
}
```

---

## Validation & Enforcement

### 16.1 Automated Validation

```javascript
// scripts/validate-architecture.js

import { MODULE_REGISTRY } from '../src/config/moduleRegistry';

export function validateArchitecture() {
  const violations = [];
  
  // Rule AR-01: No circular dependencies
  const circularDeps = detectCircularDependencies();
  if (circularDeps.length > 0) {
    violations.push({
      rule: 'RULE-01-AR-01',
      severity: 'CRITICAL',
      message: `Circular dependencies detected: ${circularDeps.join(', ')}`
    });
  }
  
  // Rule AR-02: All modules registered
  const unregisteredModules = detectUnregisteredModules();
  if (unregisteredModules.length > 0) {
    violations.push({
      rule: 'RULE-01-AR-02',
      severity: 'HIGH',
      message: `Unregistered modules: ${unregisteredModules.join(', ')}`
    });
  }
  
  // Rule AR-03: No cross-module imports
  const crossModuleImports = detectCrossModuleImports();
  if (crossModuleImports.length > 0) {
    violations.push({
      rule: 'RULE-01-AR-03',
      severity: 'CRITICAL',
      message: `Cross-module imports detected: ${crossModuleImports.join(', ')}`
    });
  }
  
  // Rule AR-04: All files have owner tag
  const missingOwners = detectMissingOwnerTags();
  if (missingOwners.length > 0) {
    violations.push({
      rule: 'RULE-01-AR-04',
      severity: 'LOW',
      message: `${missingOwners.length} files missing @owner tag`
    });
  }
  
  return violations;
}

// Exit with error if CRITICAL violations exist
const violations = validateArchitecture();
const criticalViolations = violations.filter(v => v.severity === 'CRITICAL');
if (criticalViolations.length > 0) {
  console.error('CRITICAL Architecture Violations Found:');
  criticalViolations.forEach(v => console.error(`  - ${v.rule}: ${v.message}`));
  process.exit(1);
}
```

### 16.2 CI/CD Integration

```yaml
# .github/workflows/architecture-validation.yml
name: Architecture Validation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: '18' }
      - run: npm install
      - run: npm run validate:architecture
      - name: Check for circular dependencies
        run: npx madge --circular src/
      - name: Generate architecture report
        run: npm run architecture:report
      - name: Upload report
        uses: actions/upload-artifact@v3
        with: { name: architecture-report, path: architecture-report.json }
```

### 16.3 Pre-Commit Hook

```javascript
// .husky/pre-commit

#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "Running architecture validation..."

# Run fast validation (skip tests)
npm run validate:architecture:fast

if [ $? -ne 0 ]; then
  echo "Architecture validation failed. Commit blocked."
  exit 1
fi

echo "Architecture validation passed."
```

### 16.4 Monitoring in Production

```javascript
// Runtime checks (future backend)
function validateArchitectureAtRuntime() {
  // Ensure no cross-module calls at runtime
  // Use proxy or interceptor to detect violations
}
```

---

## Exceptions Process

### 16.5 Exception Management

1. **Temporary Bypass**:
   - Developer files exception ticket with rationale
   - Tech Lead approves for 30 days max
   - Auto-fix is blocked for that specific violation

2. **Permanent Exception**:
   - Requires RFC in `docs/04-decisions/`
   - Architecture Board approval (CRITICAL rules)
   - Must include migration plan

3. **Exception Documentation**:
```javascript
// src/modules/students/services/studentService.js

/**
 * @exception RULE-01-AR-03
 * @reason Performance optimization - direct access to Transport module
 *        required for real-time route calculation during admission.
 * @approvedBy: arch-board-2025-001
 * @expires: 2025-06-01
 * @migrationPlan: Implement caching layer to eliminate cross-module call
 */
import { TransportService } from '@/modules/transport/services/transportService';
```

---

## Troubleshooting

### 16.6 Common Issues and Solutions

#### Issue: Circular dependency detected between module A and B

**Symptoms**:
- CI fails with circular dependency error
- Application crashes with "Cannot access before initialization"

**Diagnosis**:
```bash
# Identify the cycle
npx madge --circular --extensions js,jsx src/modules/a/ src/modules/b/
# Output shows the file paths involved in cycle
```

**Resolution**:
1. **Identify common code**: What do both modules import from each other?
2. **Extract to shared**: Move common interfaces/types to `src/types/` or `src/interfaces/`
3. **Use events**: Replace direct calls with `EventBus.emit/on`

#### Issue: Cross-module import not detected by linter

**Symptoms**: Import succeeds in development but fails in CI

**Resolution**:
1. Check linter configuration in `.eslintrc.js`
2. Ensure `no-restricted-imports` rule includes the target module
3. Add custom script for additional validation

#### Issue: Module not found in registry

**Symptoms**: Module cannot access tenant-specific features

**Resolution**:
1. Create `module.json` in module root
2. Register in `src/config/moduleRegistry.js`
3. Run `npm run validate:module-registry`

---

## References

### Internal References
- **RULE-02**: Storage & Data Persistence (CRITICAL dependency)
- **RULE-03**: Service Layer (complementary)
- **RULE-04**: SaaS / Multi-tenant (complementary)
- **RULE-06**: Module Boundaries (related)
- **RULE-14**: Code Quality (imports, naming)
- **RULE-24**: Storage Layer Design (storage layer)

### External References
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [React Architecture Best Practices](https://react.dev/learn/thinking-in-react)
- [Layered Architecture Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/layered-architecture)

### ADRs (Architecture Decision Records)
- ADR-001: Layered Architecture Adoption (2024-01-01)
- ADR-002: Module Boundary Enforcement Strategy (2024-02-15)

---

## Appendix

### A. Module Registration Checklist

When creating a new module:

- [ ] Create module directory following naming conventions
- [ ] Create `module.json` manifest with all required fields
- [ ] Register in `src/config/moduleRegistry.js`
- [ ] Create all required subdirectories (components, pages, services, etc.)
- [ ] Add `@owner` tag to all files
- [ ] Define public API in `index.js`
- [ ] Write README.md with module overview
- [ ] Add architecture tests to `__tests__/architecture/`
- [ ] Update CI/CD pipeline if needed
- [ ] Create initial PR with architecture review

### B. Dependency Management Checklist

When adding a new dependency:

- [ ] Check if existing shared service can be used
- [ ] Verify no circular dependencies will be created
- [ ] Confirm package is actively maintained (no abandoned packages)
- [ ] Check bundle size impact
- [ ] Run security audit (`npm audit`)
- [ ] Add to `.github/dependabot.yml` for automatic updates
- [ ] Document why this dependency is needed in PR

### C. Refactoring Checklist


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

When refactoring existing code:

- [ ] Run architecture validation before changes
- [ ] Make small, incremental changes
- [ ] Run tests after each change
- [ ] Update `module.json` if module structure changes
- [ ] Update this rulebook if new patterns emerge
- [ ] Get peer review before merge

---

*End of RULE-01: Architecture Guidelines*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

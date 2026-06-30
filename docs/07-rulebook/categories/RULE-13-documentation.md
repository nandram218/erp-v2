# RULE-13: Documentation Standards

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Documentation Team  
**Severity:** MEDIUM  
**Category:** Documentation  
**Applies To:** Code comments, README files, architecture docs, API docs, decision logs  
**Detection Method:** Documentation Lint, Code Review  
**Auto-Fix Available:** Yes  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Documentation Standards](#documentation-standards)
5. [Architecture Docs](#architecture-docs)
6. [Module Docs](#module-docs)
7. [Service Docs](#service-docs)
8. [Decision Logs](#decision-logs)
9. [Change Logs](#change-logs)

---

## WHY

### Business Rationale
- **Developer Onboarding**: New developers become productive 50% faster with good documentation.
- **Knowledge Preservation**: Documentation prevents knowledge loss when developers leave.
- **Support Reduction**: Self-service documentation reduces support tickets by 30%.
- **Compliance**: Documentation is required for regulatory audits.

### Technical Rationale
- **Maintainability**: Documented code is easier to maintain and refactor.
- **API Consumption**: Well-documented APIs reduce integration errors.
- **Decision Tracking**: Architecture decisions are preserved and justified.
- **AI Agent Navigation**: Well-structured docs enable AI agents to understand codebase.

---

## WHEN

### Applies To
- **All Code**: Every file, function, class, module.
- **All Public APIs**: Services, components, utilities.
- **All Architecture Decisions**: ADRs, RFCs.
- **All Changes**: Release notes, changelogs.

### Does NOT Apply To
- One-off scripts (minimal documentation)
- Auto-generated code (document generators instead)
- Temporary prototypes (throwaway)

---

## WHERE

### Scope
- **Code Comments**: `src/**/*.js`, `src/**/*.jsx`
- **README Files**: Root README, module-level READMEs
- **Architecture Docs**: `docs/architecture/`
- **API Documentation**: `docs/api/`
- **Decision Logs**: `docs/decisions/`
- **Change Logs**: `CHANGELOG.md`

---

## Documentation Standards

### 1.1 Code Comment Standards

**RULE DOC-CODE-01**: Document all public APIs.

```javascript
// CORRECT: Comprehensive JSDoc
/**
 * Creates a new student record with validation and audit logging.
 * 
 * @param {Object} studentData - Student information
 * @param {string} studentData.firstName - Student's first name (1-100 chars)
 * @param {string} studentData.lastName - Student's last name (1-100 chars)
 * @param {string} studentData.classId - ID of the class to enroll in
 * @param {string} [studentData.email] - Optional email address
 * @param {string} [studentData.phone] - Optional phone number
 * @param {Date} studentData.dateOfBirth - Date of birth (must be in past)
 * @param {string} [studentData.gender] - MALE, FEMALE, or OTHER
 * @param {string} studentData.admissionNumber - Unique admission number
 * 
 * @returns {Promise<Student>} Created student object with generated fields
 * @throws {ValidationError} If input data fails validation
 * @throws {DuplicateError} If admission number already exists
 * @throws {AuthorizationError} If Student/Parent lacks permission
 * 
 * @example
 * const student = await studentService.create({
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   classId: 'class-10-a',
 *   dateOfBirth: '2010-05-15',
 *   admissionNumber: 'ADM-2025-001'
 * });
 * 
 * @see {@link StudentService.update} for updating existing students
 * @see {@link StudentService.delete} for soft-deleting students
 * @since 1.0.0
 * @author Team-Students
 */
async function createStudent(studentData) {
  // Implementation
}

// FORBIDDEN: No documentation for public API
async function createStudent(studentData) {
  // What does this do? What are the parameters?
}
```

### 1.2 Inline Comments

**RULE DOC-CODE-02**: Comment why, not what.

```javascript
// CORRECT: Explain business logic
// Business Rule BR-012: Sibling discount applies only if sibling
// is currently enrolled (not graduated or transferred)
const hasSibling = await checkCurrentEnrollment(student.siblingIds);

// FORBIDDEN: State the obvious
// Set firstName to uppercase
student.firstName = student.firstName.toUpperCase();

// FORBIDDEN: Commented-out code
// const oldValue = calculateOldWay();
// console.log(oldValue);
```

### 1.3 File-Level Documentation

```javascript
// CORRECT: File header
/**
 * @file Student CRUD operations service
 * @module StudentService
 * @description 
 * Handles all student lifecycle operations including creation,
 * updates, deletion, promotion, and certificate generation.
 * 
 * Dependencies:
 * - StorageService: Data persistence
 * - ValidationService: Input validation
 * - EventBus: Domain event emission
 * - AuditService: Audit logging
 * 
 * @author Team-Students
 * @since 1.0.0
 * @version 2.0.0
 * 
 * @example
 * import { StudentService } from './studentService';
 * const student = await StudentService.create(data);
 */

// FORBIDDEN: No file documentation
import { storage } from '../services/storageService';
// ... code ...
```

---

## Architecture Docs

### 2.1 Architecture Decision Records (ADR)

**RULE DOC-ARCH-01**: Every significant decision documented.

```markdown
# docs/decisions/ADR-007-use-event-driven-architecture.md

# ADR-007: Adopt Event-Driven Architecture for Module Communication

## Status
ACCEPTED - Implemented

## Date
2025-01-10

## Authors
- Architecture Team
- Team-Students
- Team-Fees

## Context
Currently, modules communicate through direct service calls.
This creates tight coupling:
- StudentService directly calls FeeService
- Changes to FeeService break StudentService
- Testing requires mocking multiple services
- Cannot evolve modules independently

### Current Problems
1. **Tight Coupling**: Circular dependencies between modules
2. **Testing Complexity**: Need to mock entire dependency graph
3. **Deployment Coupling**: Cannot deploy modules independently
4. **Performance**: Synchronous calls block operations

### Options Considered
1. **Keep Direct Calls**
   - Pros: Simple, fast
   - Cons: Tight coupling, testing difficulty
   
2. **Event-Driven Architecture**
   - Pros: Loose coupling, scalable, async
   - Cons: Eventual consistency, complexity
   
3. **Shared Service Layer**
   - Pros: Centralized logic
   - Cons: Becomes monolith, bottleneck

## Decision
Adopt Event-Driven Architecture using EventBus.

### Event Flow Example
```
Student.Promoted (Event)
  ↓
FeesModule (Subscriber)
  ↓
Recalculate fee structure
  ↓
FeeStructureUpdated (Event)
  ↓
DashboardModule (Subscriber)
  ↓
Update dashboard stats
```

### Implementation
- Use EventBus for all cross-module communication
- Define event contracts (versioned)
- Event handlers are idempotent
- Dead-letter queue for failed events

## Consequences

### Positive
- **Loose Coupling**: Modules don't know about each other
- **Independent Deployment**: Can deploy modules separately
- **Scalability**: Easy to add new subscribers
- **Testability**: Mock events instead of services
- **Resilience**: Failed events don't block operations

### Negative
- **Eventual Consistency**: Data not immediately synced
- **Debugging Difficulty**: Need to trace event chains
- **Event Schema Evolution**: Need versioning strategy
- **Learning Curve**: Team needs training

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Event ordering issues | MEDIUM | HIGH | Use sequential processing for critical events |
| Event duplication | MEDIUM | MEDIUM | Idempotent handlers |
| Lost events | LOW | HIGH | Persistence layer + retry |
| Performance overhead | LOW | LOW | Async processing |

## Implementation Plan

### Phase 1: Infrastructure (Week 1-2)
- Implement EventBus
- Create event schema registry
- Set up event persistence

### Phase 2: Migration (Week 3-4)
- Migrate Student.Created event
- Migrate Student.Updated event
- Test thoroughly

### Phase 3: Rollout (Week 5-6)
- Migrate all modules
- Monitor event flow
- Optimize performance

## References
- [Event-Driven Architecture Pattern](https://docs.erp.com/patterns/event-driven)
- [EventBus API](https://docs.erp.com/api/eventbus)
- [Event Contract Specification](https://docs.erp.com/specs/events)

## Related Decisions
- ADR-003: Module Boundary Definition
- ADR-005: Service Layer Architecture
```

---

## Module Docs

### 3.1 Module README Template

**RULE DOC-MOD-01**: Every module has README.

```markdown
# Students Module

## Overview
Complete student lifecycle management from admission to graduation.

## Owner
- **Team**: Team-Students
- **Tech Lead**: @username
- **Contact**: #team-students

## Features
- Student registration and admission
- Student profile management
- Class promotion workflow
- Certificate generation
- Student ID cards

## Directory Structure
```
src/modules/students/
├── components/          # Reusable UI components
│   ├── StudentTable.jsx
│   ├── StudentForm.jsx
│   └── StudentProfile.jsx
├── pages/              # Route pages
│   ├── StudentListPage.jsx
│   ├── StudentFormPage.jsx
│   └── StudentProfile.jsx
├── services/           # Business logic
│   ├── studentService.js
│   └── certificateService.js
├── hooks/              # Custom React hooks
│   └── useStudentSearch.js
├── utils/              # Utilities
│   └── studentHelpers.js
├── validation/         # Zod schemas
│   └── studentSchema.js
├── __tests__/          # Tests
└── index.js            # Public API
```

## Public API

### Services
```javascript
import { StudentService } from '@/modules/students';

// Create student
const student = await StudentService.create(data);

// Get student
const student = await StudentService.getById(id);

// Update student
const updated = await StudentService.update(id, data);

// Delete student (soft delete)
await StudentService.delete(id);

// Promote student
await StudentService.promote(id, { newClassId: 'class-11-a' });
```

### Events
```javascript
import { EventBus } from '@/services/eventService';

// Subscribe to events
EventBus.on('Student.Created', (event) => {
  console.log('New student:', event.studentId);
});

EventBus.on('Student.Promoted', (event) => {
  console.log('Student promoted:', event.studentId);
});
```

### Components
```javascript
import { 
  StudentTable,
  StudentForm,
  StudentProfile 
} from '@/modules/students';

<StudentTable 
  students={students}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## Dependencies
- **Internal**: 
  - master-setting:classes (class management)
  - master-setting:subjects (subject assignment)
- **External**: None

## Data Model
```javascript
{
  id: 'uuid',
  tenantId: 'uuid',
  firstName: 'string',
  lastName: 'string',
  dateOfBirth: 'date',
  gender: 'MALE|FEMALE|OTHER',
  classId: 'uuid',
  admissionNumber: 'string (unique)',
  rollNumber: 'string',
  email: 'string (optional)',
  phone: 'string (optional)',
  address: {
    street: 'string',
    city: 'string',
    state: 'string',
    pincode: 'string'
  },
  isDeleted: 'boolean',
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
}
```

## Testing
```bash
# Run unit tests
npm test src/modules/students

# Run with coverage
npm test src/modules/students --coverage
```

## Performance
- Average query time: < 50ms
- Table virtualization: > 1000 students
- Cache hit rate: > 80%

## Known Limitations
- Bulk operations limited to 1000 records
- Photo upload max 5MB
- Search limited to current academic year

## Migration Guides
- [v1 to v2 Migration](MIGRATION-v1-to-v2.md)

## Related Documentation
- [Feature Specification](SPEC.md)
- [API Documentation](../api/students.md)
- [Architecture Decision](ADR-007.md)
```

---

## Service Docs

### 4.1 Service Documentation

**RULE DOC-SVC-01**: Document all service methods.

```javascript
/**
 * Student Service
 * @module StudentService
 * @description manages student lifecycle operations
 */
class StudentService {
  /**
   * Creates a new student record.
   * 
   * @param {StudentInput} studentData - Student data matching StudentInput schema
   * @param {Object} [options] - Optional parameters
   * @param {boolean} [options.sendNotification=true] - Send welcome notification
   * @param {boolean} [options.generateIdCard=true] - Generate ID card
   * 
   * @returns {Promise<Student>} Created student with all fields populated
   * 
   * @throws {ValidationError} When input fails validation
   * @throws {DuplicateError} When admission number exists
   * @throws {AuthorizationError} When Student/Parent lacks permission
   * 
   * @example
   * const student = await studentService.create({
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   classId: 'class-10-a',
   *   dateOfBirth: '2010-05-15',
   *   admissionNumber: 'ADM-2025-001'
   * });
   * console.log('Created student:', student.id);
   * 
   * @see {@link StudentValidationSchema} for input validation rules
   * @see {@link StudentService.update} for updating student
   * 
   * @since 1.0.0
   * @version 2.0.0
   */
  async create(studentData, options = {}) {
    // Implementation
  }
  
  /**
   * Bulk import students from CSV data.
   * 
   * @param {Array<StudentInput>} students - Array of student data
   * @param {Object} [options] - Import options
   * @param {boolean} [options.skipDuplicates=true] - Skip duplicates instead of failing
   * @param {boolean} [options.validateOnly=false] - Validate without importing
   * 
   * @returns {Promise<ImportResult>} Import results with success/failure counts
   * @returns {Promise<ImportResult.successCount>} Number of successful imports
   * @returns {Promise<ImportResult.failureCount>} Number of failed imports
   * @returns {Promise<ImportResult.errors>} Array of errors with row numbers
   * 
   * @example
   * const result = await studentService.bulkImport(csvData, {
   *   skipDuplicates: true,
   *   validateOnly: false
   * });
   * console.log(`Imported ${result.successCount} students`);
   * console.log(`Failed: ${result.failureCount}`);
   * 
   * @throws {ValidationError} When CSV format is invalid
   * @throws {QuotaExceededError} When tenant limit reached
   * 
   * @since 2.1.0
   */
  async bulkImport(students, options = {}) {
    // Implementation
  }
}
```

---

## Decision Logs

### 5.1 Decision Log Format

**RULE DOC-DEC-01**: All architecture decisions logged.

```markdown
# Decision Log Template

## Decision Title
Brief description of the decision

**Date**: YYYY-MM-DD  
**Status**: PROPOSED | ACCEPTED | REJECTED | DEPRECATED  
**Decision Makers**: Team/Person  
**Related Issues**: #123, #456  

## Context
What is the issue we're trying to solve?
What constraints do we have?
What are the requirements?

## Options Considered

### Option 1: [Name]
**Description**: What is this option?
**Pros**: Benefits
**Cons**: Drawbacks
**Effort**: High/Medium/Low
**Risk**: High/Medium/Low

### Option 2: [Name]
...

## Decision
What did we decide?
Why did we choose this over others?

## Implementation
How will this be implemented?
What are the steps?

## Consequences
### Positive
- Benefit 1
- Benefit 2

### Negative
- Drawback 1
- Drawback 2

### Risks
| Risk | Mitigation |

## References
- [Link to relevant docs]
- [Related ADRs]
- [External resources]
```

---

## Change Logs

### 6.1 CHANGELOG Format

**RULE DOC-CHANGE-01**: Follow Keep a Changelog format.

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Student bulk import from CSV (Team-Students)
- Fee receipt watermarking (Team-Accounts)

### Changed
- Improved search performance by 10x (Platform Team)

### Fixed
- Student deletion now preserves fee records (Team-Students)

### Security
- Fixed token validation vulnerability (CVE-2025-1234)

## [2.0.0] - 2025-01-15

### Added
- Multi-tenant architecture (Platform Team)
- Tenant isolation and data segregation
- Per-tenant branding and customization
- Role-based access control (RBAC)

### Changed
- **BREAKING**: All APIs require tenantId parameter
- **BREAKING**: Storage layer rewritten for multi-tenancy
- Migrated from localStorage to IndexedDB

### Deprecated
- `StudentService.createV1()` - use `createV2()`
- `localStorage` API - use `StorageService`

### Removed
- Legacy admin panel (replaced by new admin console)
- Old authentication system

### Fixed
- Date calculation errors in fee engine
- Attendance report timezone issues

## [1.5.0] - 2024-12-01

### Added
- Fee payment receipt generation
- SMS notification system
- Student attendance tracking

[Unreleased]: https://github.com/nandram218/erp-v2/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/nandram218/erp-v2/compare/v1.5.0...v2.0.0
[1.5.0]: https://github.com/nandram218/erp-v2/compare/v1.0.0...v1.5.0
```

---

## API Documentation

### 7.1 API Documentation Standards

**RULE DOC-API-01**: Document all endpoints.

```yaml
# docs/api/students.yaml
openapi: 3.0.0
info:
  title: ERP-v2 Students API
  version: 2.0.0
  description: Student management API
  
paths:
  /api/v2/students:
    post:
      summary: Create a new student
      tags: [Students]
      security:
        - Bearer: []
      
      parameters:
        - name: X-Tenant-ID
          in: header
          required: true
          schema:
            type: string
          description: Tenant identifier
      
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/StudentInput'
      
      responses:
        '201':
          description: Student created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Student'
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '409':
          $ref: '#/components/responses/DuplicateError'
      
      callbacks:
        studentCreated:
          '{$request.body#/studentId}':
            post:
              operationId: onStudentCreated
              requestBody:
                content:
                  application/json:
                    schema:
                      $ref: '#/components/schemas/StudentCreatedEvent'

components:
  schemas:
    StudentInput:
      type: object
      required:
        - firstName
        - lastName
        - classId
        - dateOfBirth
        - admissionNumber
      properties:
        firstName:
          type: string
          minLength: 1
          maxLength: 100
        lastName:
          type: string
          minLength: 1
          maxLength: 100
        classId:
          type: string
          format: uuid
        dateOfBirth:
          type: string
          format: date
        admissionNumber:
          type: string
          minLength: 1
          maxLength: 20
          pattern: '^[A-Z0-9-]+$'
    
    Student:
      allOf:
        - $ref: '#/components/schemas/StudentInput'
        - type: object
          properties:
            id:
              type: string
              format: uuid
            tenantId:
              type: string
            version:
              type: integer
            createdAt:
              type: string
              format: date-time
            updatedAt:
              type: string
              format: date-time
```

---

## Documentation Automation

### 8.1 Automated Documentation Generation

```javascript
// Auto-generate documentation from code

// 1. JSDoc to Markdown
// package.json
{
  "scripts": {
    "docs": "jsdoc2md src/**/*.js > docs/api/reference.md"
  }
}

// 2. TypeDoc for TypeScript
{
  "scripts": {
    "docs:types": "typedoc --out docs/api/types src/"
  }
}

// 3. API docs from OpenAPI
{
  "scripts": {
    "docs:api": "swagger-jsdoc -o docs/api/swagger.json",
    "docs:redoc": "redoc-cli build docs/api/swagger.json -o docs/api/index.html"
  }
}

// 4. Architecture diagrams
// Use Mermaid or PlantUML embedded in markdown
```

### 8.2 Documentation Linting

```javascript
// .markdownlint.json
{
  "rules": {
    "MD001": true, // Heading levels increment by 1
    "MD002": true, // First heading should be h1
    "MD009": true, // Trailing spaces
    "MD010": true, // Hard tabs
    "MD013": false, // Line length (disabled for code blocks)
    "MD018": true, // No space after hash on atx style
    "MD019": true, // Multiple spaces after hash on atx style
    "MD022": true, // Headings should be surrounded by blank lines
    "MD025": true, // Multiple top-level headings
    "MD032": true, // Lists should be surrounded by blank lines
    "MD040": true, // Fenced code blocks should have language
    "MD041": true, // First line in file should be top-level heading
    "MD047": true, // Files should end with a single newline
    "MD058": true // Empty list items
  }
}

// .jsdoc.json
{
  "source": {
    "include": ["src/"],
    "includePattern": ".+\\.js(doc|x)?$"
  },
  "opts": {
    "destination": "docs/api/",
    "recurse": true
  },
  "templates": {
    "cleverLinks": true,
    "monospaceLinks": true
  }
}
```

---

## Documentation Review

### 9.1 Documentation as Code


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

**RULE DOC-REVIEW-01**: Documentation undergoes code review.

```javascript
const DocumentationReviewChecklist = {
  content: [
    'Accurate and up-to-date',
    'Clear and concise',
    'Free of typos and grammar errors',
    'Examples work (tested)',
    'Links are valid'
  ],
  
  completeness: [
    'All public APIs documented',
    'All parameters described',
    'Return values documented',
    'Exceptions documented',
    'Examples provided'
  ],
  
  accessibility: [
    'Written for target audience',
    'Technical terms explained',
    'Diagrams where helpful',
    'Multiple examples for complex topics'
  ]
};
```

---

*End of RULE-13: Documentation Standards*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

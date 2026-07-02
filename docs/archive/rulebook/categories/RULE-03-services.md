# RULE-03: Service Layer

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Architecture Team  
**Severity:** HIGH  
**Category:** Core  
**Applies To:** All services in `src/services/` and `src/modules/{module}/services/`  
**Detection Method:** Static Analysis, Unit Tests, Architecture Tests  
**Auto-Fix Available:** No  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Service Layer Rules](#service-layer-rules)
5. [Business Logic Rules](#business-logic-rules)
6. [No UI Rules](#no-ui-rules)
7. [Validation Flow](#validation-flow)
8. [Error Rules](#error-rules)
9. [Logging Rules](#logging-rules)
10. [Dependency Rules](#dependency-rules)
11. [Retry Rules](#retry-rules)
12. [Future API Rules](#future-api-rules)
13. [Caching Rules](#caching-rules)
14. [Testing Rules](#testing-rules)

---

## WHY

### Business Rationale
- **Single Source of Truth**: All business logic in services ensures consistent behavior across UI and future backends.
- **Reusability**: Services serve both current frontend and future REST/GraphQL APIs.
- **Testability**: Service layer is easily unit-tested without UI dependencies.
- **Maintainability**: Changes to business rules happen in one place.

### Technical Rationale
- **Separation of Concerns**: Services handle logic; UI handles presentation.
- **Future-Proof**: Service layer can be extracted to backend without rewriting logic.
- **Error Handling**: Centralized error handling and retry logic.
- **Performance**: Services can implement caching, batching, and optimization.

---

## WHEN

### Applies To
- **Business Logic Implementation**: All calculations, validations, orchestration
- **Data Operations**: All CRUD through storageService
- **Cross-Module Communication**: Via events, not direct imports
- **External API Calls**: Future backend integration
- **Data Transformation**: Normalization, aggregation, enrichment

### Does NOT Apply To
- Pure utility functions (use `src/core/` or `src/utils/`)
- UI event handlers (belongs in components)
- Configuration constants (belongs in `src/config/`)

---

## WHERE

### Scope
- **Shared Services**: `src/services/*.js`
- **Module Services**: `src/modules/{module}/services/*.js`
- **Service Tests**: `src/services/__tests__/` or `__tests__/services/`

---

## Service Layer Rules

### 1.1 Service Definition

**RULE SV-DEF-01**: Every service MUST have a clear, single responsibility.

```javascript
// CORRECT: Single responsibility
export class StudentService {
  async getAll(options) { /* Get students */ }
  async getById(id) { /* Get single student */ }
  async create(data) { /* Create student */ }
  async update(id, data) { /* Update student */ }
  async delete(id) { /* Soft delete */ }
}

// FORBIDDEN: Mixed responsibilities
export class StudentService {
  async getAll(options) { /* Get students */ }
  async printReport(studentId) { /* UI concern - FORBIDDEN */ }
  async sendEmail(studentId) { /* Notification concern - FORBIDDEN */ }
}
```

**RULE SV-DEF-02**: Service interface is stable and versioned.

```javascript
/**
 * Service Interface Contract
 * @version 1.0.0
 * @description Student management operations
 * 
 * @method getAll(options) → Promise<Student[]>
 * @method getById(id) → Promise<Student>
 * @method create(data) → Promise<Student>
 * @method update(id, data) → Promise<Student>
 * @method delete(id) → Promise<void>
 */
export class StudentService {
  // Implementation
}
```

**RULE SV-DEF-03**: Services use dependency injection.

```javascript
// CORRECT: Dependencies injected
export class StudentService {
  constructor(dependencies) {
    this.storage = dependencies.storage; // StorageService
    this.validator = dependencies.validator; // RuntimeValidationService
    this.audit = dependencies.audit; // AuditService
    this.eventBus = dependencies.eventBus; // EventService
  }
}

// Usage
const studentService = new StudentService({
  storage: StorageService.getInstance(),
  validator: RuntimeValidationService.getInstance(),
  audit: AuditService.getInstance(),
  eventBus: EventService.getInstance()
});

// FORBIDDEN: Hard dependencies
export class StudentService {
  constructor() {
    this.storage = new StorageService(); // Tight coupling
  }
}
```

**RULE SV-DEF-04**: Services are stateless.

```javascript
// CORRECT: Stateless - all state passed as parameters
export class StudentService {
  async getStudents(classId, filters) {
    return this.storage.find({
      collection: 'students',
      filters: { classId, ...filters }
    });
  }
}

// FORBIDDEN: Stateful - stores state internally
export class StudentService {
  constructor() {
    this.currentClassId = null; // State - FORBIDDEN
  }
  
  setClassId(classId) {
    this.currentClassId = classId; // FORBIDDEN
  }
}
```

---

## Business Logic Rules

### 2.1 Business Logic Placement

**RULE SV-BL-01**: Business logic lives ONLY in services or core engines.

```
ALLOWED LOCATIONS:
- src/services/{domain}Service.js
- src/core/{engine}/{engine}.js
- src/modules/{module}/services/{module}Service.js

FORBIDDEN LOCATIONS:
- UI components (jsx files)
- Utility files (utils/*.js)
- Test files

Example business logic:
- Fee calculation logic → src/core/fee-engine/
- Promotion logic → src/services/studentService.js
- Discount calculation → src/core/discount-engine/
```

**RULE SV-BL-02**: Business rules are explicit and documented.

```javascript
// CORRECT: Business rules documented
async function calculateFee(studentId, academicYear) {
  const student = await this.getStudent(studentId);
  const classInfo = await this.getClassInfo(student.classId);
  
  // Business Rule BR-001: Base fee depends on class
  // - Pre-Nursery: $500
  // - Nursery: $750
  // - KG: $1000
  // - 1-5: $1500
  // - 6-10: $2000
  // - 11-12: $2500
  const baseFees = {
    'PRE-NURSERY': 500,
    'NURSERY': 750,
    'KG': 1000,
    '1': 1500,
    '2': 1500,
    // ...
  };
  
  // Business Rule BR-002: Sibling discount (15%)
  const hasSibling = await this.hasSibling(studentId);
  let discount = hasSibling ? 0.15 : 0;
  
  // Business Rule BR-003: Early payment discount (5%)
  const paysEarly = await this.paysBeforeDeadline(studentId, academicYear);
  discount += paysEarly ? 0.05 : 0;
  
  // Business Rule BR-004: Max discount cap (20%)
  discount = Math.min(discount, 0.20);
  
  // Calculate final fee
  const baseFee = baseFees[classInfo.level] || 0;
  const finalFee = baseFee * (1 - discount);
  
  return {
    baseFee,
    discount,
    finalFee,
    appliedRules: ['BR-001', 'BR-002', 'BR-003', 'BR-004']
  };
}
```

**RULE SV-BL-03**: Business rules are testable and deterministic.

```javascript
// CORRECT: Pure function for business rule
export function calculateSiblingDiscount(student) {
  if (!student.siblingIds || student.siblingIds.length === 0) {
    return { discount: 0, reason: 'NO_SIBLINGS' };
  }
  
  return { discount: 0.15, reason: 'SIBLING_DISCOUNT_15_PERCENT' };
}

// CORRECT: Side effects separated
async function applySiblingDiscount(student) {
  const { discount } = calculateSiblingDiscount(student);
  
  // Side effect: Update Storage Layer
  await this.storage.update({
    collection: 'fees',
    tenantId: this.tenantId,
    filters: { studentId: student.id },
    data: { siblingDiscount: discount }
  });
  
  return discount;
}
```

---

## No UI Rules

### 3.1 Strict Separation of UI and Business Logic

**RULE SV-UI-01**: Services MUST NOT import or reference UI components.

```javascript
// FORBIDDEN: Service importing UI component
export class StudentService {
  constructor() {
    // ❌ CRITICAL VIOLATION
    this.receiptTemplate = require('../receipts/ReceiptTemplate.jsx');
  }
}

// FORBIDDEN: Service returning JSX
export class StudentService {
  async getStudentReport(studentId) {
    const student = await this.storage.findOne({...});
    
    // ❌ CRITICAL VIOLATION - returning JSX
    return <StudentCard student={student} />;
  }
}

// CORRECT: Return data only
export class StudentService {
  async getStudentReport(studentId) {
    const student = await this.storage.findOne({...});
    const fees = await this.getFees(studentId);
    
    return {
      student,
      fees,
      summary: {
        totalFees: fees.reduce((sum, f) => sum + f.amount, 0),
        paidAmount: fees.filter(f => f.status === 'PAID').reduce((sum, f) => sum + f.paidAmount, 0)
      }
      // Data only - no JSX, no UI logic
    };
  }
}
```

**RULE SV-UI-02**: Services MUST NOT reference DOM APIs.

```javascript
// FORBIDDEN
export class PrintService {
  printReceipt(receiptId) {
    const receipt = this.getReceipt(receiptId);
    
    // ❌ CRITICAL VIOLATION
    window.print(); // UI/DOM concern
    document.getElementById('receipt').print(); // Forbidden
  }
}

// CORRECT: Return data for UI to handle
export class PrintService {
  async generateReceipt(receiptId) {
    const receipt = await this.getReceipt(receiptId);
    const school = await this.getSchoolConfig();
    
    return {
      htmlContent: this.buildReceiptHTML(receipt, school),
      data: { receipt, school },
      printOptions: {
        format: 'A4',
       orientation: 'portrait'
      }
      // UI layer will call window.print()
    };
  }
}
```

---

## Validation Flow

### 4.1 Validation Architecture

```
INPUT → VALIDATION → TRANSFORMATION → BUSINESS LOGIC → OUTPUT
          ↓              ↓              ↓             ↓
      Schema Check   Normalization   Execution    Audit
      Type Check     Formatting      Calculations  Log
      Required Check Sanitization    Rules        Metrics
```

**RULE SV-VAL-01**: Validation occurs at service layer boundary.

```javascript
export class StudentService {
  async createStudent(rawData) {
    // Step 1: Input validation
    const validationResult = await this.validator.validate(
      rawData,
      StudentValidationSchema
    );
    
    if (!validationResult.success) {
      throw new ValidationError(
        'Invalid student data',
        validationResult.errors
      );
    }
    
    const validatedData = validationResult.data;
    
    // Step 2: Data normalization
    const normalizedData = {
      firstName: normalizedData.firstName.trim().toUpperCase(),
      lastName: normalizedData.lastName.trim().toUpperCase(),
      email: normalizedData.email.trim().toLowerCase(),
      phone: phoneNormalizer(normalizedData.phone),
      admissionNumber: validatedData.admissionNumber.trim().toUpperCase()
    };
    
    // Step 3: Uniqueness check
    const duplicate = await this.checkDuplicate({
      email: normalizedData.email,
      admissionNumber: normalizedData.admissionNumber
    });
    
    if (duplicate) {
      throw new DuplicateError(
        'Student with this email or admission number already exists',
        { duplicate }
      );
    }
    
    // Step 4: Business rules
    const admissionNumber = await this.generateAdmissionNumber(
      normalizedData.classId
    );
    
    // Step 5: Create record
    const student = await this.storage.insert({
      collection: 'students',
      tenantId: this.tenantId,
      data: {
        ...normalizedData,
        admissionNumber,
        createdAt: new Date().toISOString(),
        createdBy: this.userId
      }
    });
    
    // Step 6: Emit event
    await this.eventBus.emit('Student.Created', {
      studentId: student.id,
      tenantId: this.tenantId,
      userId: this.userId
    });
    
    // Step 7: Audit
    await this.audit.log({
      action: 'STUDENT_CREATE',
      recordId: student.id,
      tenantId: this.tenantId,
      userId: this.userId,
      before: null,
      after: student
    });
    
    return student;
  }
}
```

**RULE SV-VAL-02**: Validation uses shared schemas.

```javascript
// src/modules/students/validation/studentSchema.js
import { z } from 'zod';

export const StudentValidationSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  classId: z.string().uuid(),
  admissionNumber: z.string().min(1).max(20),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional()
  }).optional()
});

export type StudentInput = z.infer<typeof StudentValidationSchema>;
```

---

## Error Rules

### 5.1 Error Handling Standards

**RULE SV-ERR-01**: Structured error types.

```javascript
// src/core/errors/index.js

export class ERPError extends Error {
  constructor(type, message, details = {}) {
    super(message);
    this.type = type; // 'VALIDATION', 'NOT_FOUND', 'DUPLICATE', 'AUTHORIZATION', etc.
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.tenantId = details.tenantId;
  }
}

export class ValidationError extends ERPError {
  constructor(message, validationErrors) {
    super('VALIDATION', message, { validationErrors });
    this.validationErrors = validationErrors;
  }
}

export class NotFoundError extends ERPError {
  constructor(resource, id) {
    super('NOT_FOUND', `${resource} with id ${id} not found`, {
      resource,
      id
    });
  }
}

export class DuplicateError extends ERPError {
  constructor(message, duplicateData) {
    super('DUPLICATE', message, { duplicateData });
  }
}

export class AuthorizationError extends ERPError {
  constructor(action, resource) {
    super('AUTHORIZATION', `Not authorized to ${action} ${resource}`, {
      action,
      resource
    });
  }
}

export class ConflictError extends ERPError {
  constructor(message, conflictData) {
    super('CONFLICT', message, { conflictData });
  }
}
```

**RULE SV-ERR-02**: Error responses include all context.

```javascript
{
  "error": {
    "type": "VALIDATION",
    "code": "STUDENT_VALIDATION_FAILED",
    "message": "Invalid student data provided",
    "timestamp": "2025-01-15T10:30:00Z",
    "traceId": "abc-123",
    "details": {
      "fields": [
        {
          "field": "email",
          "message": "Invalid email format",
          "value": "invalid-email"
        },
        {
          "field": "phone",
          "message": "Phone number is required",
          "value": null
        }
      ]
    },
    "recovery": {
      "suggestedAction": "Please correct the highlighted fields",
      "documentationUrl": "https://docs.erp.com/errors/student-validation"
    }
  }
}
```

**RULE SV-ERR-03**: Errors are never swallowed.

```javascript
// CORRECT: Errors propagate with context
async function createStudent(data) {
  try {
    return await this.doCreateStudent(data);
  } catch (error) {
    // Add context before re-throwing
    throw new ERPError(
      error.type || 'UNKNOWN',
      `Failed to create student: ${error.message}`,
      {
        ...error.details,
        attemptedData: data,
        tenantId: this.tenantId,
        userId: this.userId,
        originalError: error.name
      }
    );
  }
}

// FORBIDDEN: Silent failure
async function createStudent(data) {
  try {
    await this.doCreateStudent(data);
  } catch (error) {
    console.error(error); // Swallowed - Student/Parent never knows
    return null; // FORBIDDEN
  }
}
```

**RULE SV-ERR-04**: Error logging is comprehensive.

```javascript
this.logger.error('Student creation failed', {
  error: {
    type: error.type,
    message: error.message,
    stack: error.stack
  },
  context: {
    operation: 'createStudent',
    input: sanitizedInput,
    tenantId: this.tenantId,
    userId: this.userId,
    correlationId: this.correlationId,
    duration: Date.now() - startTime
  },
  metadata: {
    userAgent: this.userAgent,
    endpoint: '/api/students'
  }
});
```

---

## Logging Rules

### 6.1 Service Logging Standards

**RULE SV-LOG-01**: Structured logging with context.

```javascript
export class StudentService {
  constructor(logger) {
    this.logger = logger.child({
      service: 'StudentService',
      module: 'students'
    });
  }
  
  async createStudent(data) {
    const startTime = Date.now();
    const correlationId = generateCorrelationId();
    
    this.logger.info('Creating student', {
      correlationId,
      input: { ...
      }
    });
    
    try {
      const student = await this.doCreate(data);
      
      this.logger.info('Student created successfully', {
        correlationId,
        studentId: student.id,
        duration: Date.now() - startTime
      });
      
      return student;
    } catch (error) {
      this.logger.error('Student creation failed', {
        correlationId,
        error: error.message,
        duration: Date.now() - startTime
      });
      
      throw error;
    }
  }
}
```

**RULE SV-LOG-02**: Log levels used correctly.

```javascript
// ERROR: Failures that affect functionality
this.logger.error('Storage Layer connection failed', { error });

// WARN: Unexpected but handled situations
this.logger.warn('Cache miss for frequently accessed student', { studentId });

// INFO: Significant business events
this.logger.info('Student promoted to next class', { studentId, newClassId });

// DEBUG: Detailed diagnostic information
this.logger.debug('Query executed', { query, duration, rows: 45 });

// TRACE: Very detailed debugging (dev only)
this.logger.trace('Cache lookup result', { key, hit: true });
```

---

## Retry Rules

### 7.1 Retry Logic

**RULE SV-RET-01**: Automatic retry with backoff.

```javascript
async function withRetry(operation, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryableErrors = ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMIT']
  } = options;
  
  let lastError;
  let delay = initialDelay;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry non-retryable errors
      if (!retryableErrors.includes(error.type)) {
        throw error;
      }
      
      // Last attempt - throw
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait with exponential backoff + jitter
      const jitter = Math.random() * 0.1 * delay;
      const sleepTime = delay + jitter;
      
      this.logger.warn(`Operation failed, retrying in ${sleepTime}ms`, {
        attempt: attempt + 1,
        maxRetries,
        error: error.message
      });
      
      await sleep(sleepTime);
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }
  
  throw lastError; // Should not reach here
}

// Usage
const students = await withRetry(
  () => this.storage.find({ collection: 'students', ... }),
  { maxRetries: 3, initialDelay: 1000 }
);
```

---

## Future API Rules

### 8.1 Service-to-API Transition

**RULE SV-API-01**: Services are API-ready.

```javascript
export class StudentService {
  constructor(dependencies) {
    this.storage = dependencies.storage;
    // Future: Switch to API School/Tenant
    // this.api = dependencies.api; // apiService
  }
  
  async getStudent(studentId) {
    // Implementation doesn't care if storage is:
    // - IndexedDB (current)
    // - REST API (future)
    // - GraphQL (future)
    return this.storage.findOne({
      collection: 'students',
      id: studentId,
      tenantId: this.tenantId
    });
  }
}
```

---

## Caching Rules

### 9.1 Service-Level Caching

**RULE SV-CACHE-01**: Services implement caching strategy.

```javascript
export class StudentService {
  constructor(dependencies) {
    this.storage = dependencies.storage;
    this.cache = dependencies.cache; // CacheService
  }
  
  async getStudent(studentId) {
    const cacheKey = `student:${studentId}:tenant:${this.tenantId}`;
    
    // Check cache
    let student = await this.cache.get(cacheKey);
    
    if (!student) {
      // Cache miss - fetch from storage
      student = await this.storage.findOne({
        collection: 'students',
        tenantId: this.tenantId,
        id: studentId
      });
      
      // Cache for 5 minutes
      await this.cache.set(cacheKey, student, { ttl: 300000 });
    }
    
    return student;
  }
  
  async updateStudent(studentId, updates) {
    // Update storage
    const updated = await this.storage.update({
      collection: 'students',
      tenantId: this.tenantId,
      id: studentId,
      data: updates
    });
    
    // Invalidate cache
    await this.cache.invalidate(`student:${studentId}:tenant:${this.tenantId}`);
    
    return updated;
  }
}
```

---

## Testing Rules

### 10.1 Service Testing Requirements

**RULE SV-TEST-01**: Every service method has unit test.

```javascript
// src/services/__tests__/studentService.test.js

describe('StudentService', () => {
  let studentService;
  let mockStorage;
  let mockValidator;
  let mockAudit;
  
  beforeEach(() => {
    // Mock dependencies
    mockStorage = {
      findOne: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      find: jest.fn()
    };
    
    mockValidator = {
      validate: jest.fn()
    };
    
    mockAudit = {
      log: jest.fn()
    };
    
    // Create service instance with mocks
    studentService = new StudentService({
      storage: mockStorage,
      validator: mockValidator,
      audit: mockAudit
    });
  });
  
  describe('createStudent', () => {
    it('creates student with valid data', async () => {
      // Arrange
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        classId: 'class-123'
      };
      
      mockValidator.validate.mockResolvedValue({
        success: true,
        data: validData
      });
      
      mockStorage.insert.mockResolvedValue({
        id: 'student-123',
        ...validData
      });
      
      // Act
      const result = await studentService.createStudent(validData);
      
      // Assert
      expect(result.id).toBe('student-123');
      expect(mockStorage.insert).toHaveBeenCalledWith({
        collection: 'students',
        tenantId: 'tenant-abc',
        data: expect.objectContaining({
          firstName: 'JOHN',
          lastName: 'DOE'
        })
      });
      expect(mockAudit.log).toHaveBeenCalled();
    });
    
    it('throws ValidationError for invalid data', async () => {
      // Arrange
      const invalidData = { firstName: '' };
      
      mockValidator.validate.mockResolvedValue({
        success: false,
        errors: [{ field: 'firstName', message: 'Required' }]
      });
      
      // Act & Assert
      await expect(studentService.createStudent(invalidData))
        .rejects
        .toThrow(ValidationError);
    });
  });
  
  describe('updateStudent', () => {
    it('updates student and invalidates cache', async () => {
      // Arrange
      const updates = { phone: '9999999999' };
      
      mockStorage.findOne.mockResolvedValue({
        id: 'student-123',
        version: 5,
        ...updates
      });
      
      mockStorage.update.mockResolvedValue({
        id: 'student-123',
        version: 6,
        ...updates
      });
      
      // Act
      const result = await studentService.updateStudent('student-123', updates);
      
      // Assert
      expect(result.version).toBe(6);
      expect(mockCache.invalidate).toHaveBeenCalled();
    });
  });
});
```

---

## Service Violations

### 11.1 Common Violations

| Violation | Severity | Auto-Fix | Detection |
|-----------|----------|----------|-----------|
| UI component import | CRITICAL | No | Static analysis |
| Direct DOM access | CRITICAL | No | Static analysis |
| Business logic in UI | HIGH | No | Code review |
| Missing validation | HIGH | No | Test coverage |
| Tight coupling | HIGH | No | Architecture review |
| Stateful service | MEDIUM | No | Static analysis |
| Missing error handling | MEDIUM | No | Test coverage |
| Missing audit log | MEDIUM | No | Test coverage |

---

## Service Auto Fix

### 12.1 Auto-Fixable Issues


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

1. **Missing validation**: Add schema validation boilerplate
2. **Missing error handling**: Wrap in try-catch with logging
3. **Missing audit log**: Add audit.log() call after operations
4. **Hardcoded dependencies**: Inject via constructor
5. **Missing type hints**: Add JSDoc

---

*End of RULE-03: Service Layer*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

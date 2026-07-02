# RULE-10: Testing Strategy

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team QA Team  
**Severity:** HIGH  
**Category:** Testing  
**Applies To:** All tests, test infrastructure, coverage requirements  
**Detection Method:** Test Runner, Coverage Reports, CI/CD Pipeline  
**Auto-Fix Available:** Partial  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Unit Testing](#unit-testing)
5. [Integration Testing](#integration-testing)
6. [Service Tests](#service-tests)
7. [Storage Tests](#storage-tests)
8. [Validation Tests](#validation-tests)
9. [Regression Testing](#regression-testing)
10. [Future E2E Testing](#future-e2e-testing)
11. [Coverage Rules](#coverage-rules)

---

## WHY

### Business Rationale
- **Quality Assurance**: Testing prevents regressions that could corrupt student/fee data.
- **Regulatory Compliance**: Tested code is auditable and traceable for regulatory requirements.
- **Developer Confidence**: Well-tested code enables fearless refactoring.
- **Reduced Support Cost**: Catching bugs in development reduces production support.

### Technical Rationale
- **Automated Safety Net**: Tests catch issues before they reach production.
- **Documentation**: Tests serve as executable documentation of expected behavior.
- **Design Validation**: Testable code is better designed (SOLID principles).
- **Continuous Integration**: Automated tests enable safe continuous deployment.

---

## WHEN

### Applies To
- **All New Features**: Must include tests before merge.
- **All Bug Fixes**: Must include regression test.
- **All Refactoring**: Must not reduce test coverage.
- **All Critical Flows**: Authentication, payment, data integrity.
- **All Public APIs**: Service methods, component props.

### Does NOT Apply To
- Prototype code (throwaway, not production)
- Third-party libraries (use their tests)
- Generated code (test generators, not output)

---

## WHERE

### Scope
- **Unit Tests**: `src/**/*.test.js`, `src/**/*.spec.js`
- **Integration Tests**: `src/__tests__/integration/*.test.js`
- **Service Tests**: `src/services/__tests__/*.test.js`
- **Storage Tests**: `src/services/__tests__/storage/*.test.js`
- **Component Tests**: `src/modules/*/__tests__/*.test.js`

---

## Unit Testing

### 1.1 Unit Test Requirements

**RULE TEST-UNIT-01**: Every function must have unit tests.

```javascript
// Example: Unit test for fee calculation engine
// src/core/fee-engine/__tests__/feeNormalizer.test.js

import { feeNormalizer } from '../feeNormalizer';

describe('feeNormalizer', () => {
  describe('normalizeStudentFee', () => {
    it('should normalize fee for Pre-Nursery student', () => {
      const input = {
        studentId: 'student-123',
        classId: 'pre-nursery',
        academicYear: '2024-2025',
        baseFee: 500
      };
      
      const result = feeNormalizer.normalizeStudentFee(input);
      
      expect(result).toMatchObject({
        studentId: 'student-123',
        normalizedFee: 500,
        currency: 'INR',
        academicYear: '2024-2025'
      });
      expect(result.normalizedFee).toBeGreaterThan(0);
    });
    
    it('should throw error for invalid class', () => {
      const input = {
        studentId: 'student-123',
        classId: 'invalid-class',
        academicYear: '2024-2025'
      };
      
      expect(() => feeNormalizer.normalizeStudentFee(input))
        .toThrow('Invalid class ID');
    });
    
    it('should handle null input gracefully', () => {
      expect(() => feeNormalizer.normalizeStudentFee(null))
        .toThrow('Input required');
    });
  });
});
```

### 1.2 Unit Test Structure

```
Unit Test Template:

describe('Component/Service/Function Name', () => {
  // Setup before each test
  beforeEach(() => {
    // Initialize mocks
    // Reset state
  });
  
  // Cleanup after each test
  afterEach(() => {
    // Clear mocks
    // Restore state
  });
  
  describe('method/function name', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange
      // Act
      // Assert
    });
    
    it('should throw [error] when [invalid condition]', () => {
      // Arrange
      // Act & Assert throws
    });
    
    it('should handle edge case', () => {
      // Test boundary conditions
    });
  });
});
```

### 1.3 Mocking Strategy

```javascript
// CORRECT: Mock external dependencies
jest.mock('@/services/storageService');
jest.mock('@/services/eventService');

import { StudentService } from '../studentService';
import { StorageService } from '@/services/storageService';
import { EventService } from '@/services/eventService';

describe('StudentService', () => {
  let studentService;
  let mockStorage;
  let mockEventBus;
  
  beforeEach(() => {
    // Create mock implementations
    mockStorage = {
      findOne: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      find: jest.fn()
    };
    
    mockEventBus = {
      emit: jest.fn()
    };
    
    // Mock return values
    StorageService.getInstance.mockReturnValue(mockStorage);
    EventService.getInstance.mockReturnValue(mockEventBus);
    
    // Create service with mocks
    studentService = new StudentService({
      storage: mockStorage,
      eventBus: mockEventBus
    });
  });
  
  it('should create student and emit event', async () => {
    // Arrange
    const studentData = {
      firstName: 'John',
      lastName: 'Doe',
      classId: 'class-123'
    };
    
    mockStorage.insert.mockResolvedValue({
      id: 'student-123',
      ...studentData
    });
    
    // Act
    const result = await studentService.create(studentData);
    
    // Assert
    expect(result.id).toBe('student-123');
    expect(mockStorage.insert).toHaveBeenCalledWith({
      collection: 'students',
      data: expect.objectContaining({
        firstName: 'JOHN',
        lastName: 'DOE'
      }),
      tenantId: 'tenant-abc'
    });
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'Student.Created',
      expect.objectContaining({
        studentId: 'student-123'
      })
    );
  });
});
```

---

## Integration Testing

### 2.1 Integration Test Scope

**RULE TEST-INT-01**: Test module interactions.

```javascript
// src/__tests__/integration/students-fees-integration.test.js

describe('Students-Fees Integration', () => {
  let tenantId;
  let studentId;
  
  beforeAll(async () => {
    // Setup test tenant
    tenantId = await createTestTenant();
    await initializeTestData(tenantId);
  });
  
  afterAll(async () => {
    // Cleanup test tenant
    await deleteTestTenant(tenantId);
  });
  
  beforeEach(async () => {
    // Clean data between tests
    await cleanTestData(tenantId);
  });
  
  it('should create student and assign fee structure', async () => {
    // 1. Create student
    const student = await StudentService.create({
      firstName: 'John',
      lastName: 'Doe',
      classId: 'class-10-a'
    });
    studentId = student.id;
    
    // 2. Verify student created
    expect(student.id).toBeDefined();
    expect(student.admissionNumber).toBeDefined();
    
    // 3. Assign fee structure (triggered by event)
    await EventBus.publish('Student.Created', {
      studentId: student.id,
      classId: 'class-10-a'
    });
    
    // 4. Verify fee assigned
    const fees = await FeeService.getByStudent(studentId);
    expect(fees.length).toBeGreaterThan(0);
    expect(fees[0].studentId).toBe(studentId);
  });
  
  it('should update fees when student promoted', async () => {
    // 1. Create student in class 10
    const student = await StudentService.create({
      firstName: 'Jane',
      lastName: 'Doe',
      classId: 'class-10-a'
    });
    
    const feesBefore = await FeeService.getByStudent(student.id);
    const oldFeeAmount = feesBefore[0].amount;
    
    // 2. Promote student to class 11
    await StudentService.promote(student.id, {
      newClassId: 'class-11-a',
      academicYear: '2025-2026'
    });
    
    // 3. Verify fees updated
    const feesAfter = await FeeService.getByStudent(student.id);
    expect(feesAfter[0].amount).not.toBe(oldFeeAmount);
    expect(feesAfter[0].amount).toBe(2500); // Class 11 fee
  });
});
```

### 2.2 Test Storage Layer

```javascript
// Test Storage Layer setup
class TestDatabase {
  async setup() {
    // Create in-memory IndexedDB
    this.db = await createTestDatabase();
    
    // Seed minimal data
    await this.seed();
  }
  
  async teardown() {
    await this.db.delete();
  }
  
  async seed() {
    await this.db.insert('classes', {
      id: 'class-10-a',
      name: '10-A',
      academicYear: '2024-2025'
    });
    
    await this.db.insert('feeStructures', {
      id: 'fee-struct-10',
      classId: 'class-10-a',
      baseFee: 2000
    });
  }
  
  async clean() {
    await this.db.clear('students');
    await this.db.clear('fees');
    await this.db.clear('attendance');
  }
}
```

---

## Service Tests

### 3.1 Service Test Requirements

**RULE TEST-SVC-01**: Every service method tested.

```javascript
// src/services/__tests__/studentService.test.js

describe('StudentService', () => {
  let studentService;
  let mockStorage;
  let mockValidator;
  let mockAudit;
  let mockEventBus;
  
  beforeEach(() => {
    mockStorage = createMockStorage();
    mockValidator = createMockValidator();
    mockAudit = createMockAudit();
    mockEventBus = createMockEventBus();
    
    studentService = new StudentService({
      storage: mockStorage,
      validator: mockValidator,
      audit: mockAudit,
      eventBus: mockEventBus,
      tenantId: 'tenant-abc',
      userId: 'Student/Parent-123'
    });
  });
  
  describe('createStudent', () => {
    const validStudentData = {
      firstName: 'John',
      lastName: 'Doe',
      classId: 'class-123',
      dateOfBirth: '2010-05-15',
      gender: 'MALE',
      admissionNumber: 'ADM-2025-001'
    };
    
    it('should create student with valid data', async () => {
      mockValidator.validate.mockReturnValue({
        success: true,
        data: validStudentData
      });
      
      mockStorage.findOne.mockResolvedValue(null); // No duplicate
      
      mockStorage.insert.mockResolvedValue({
        id: 'student-123',
        ...validStudentData
      });
      
      const result = await studentService.create(validStudentData);
      
      expect(result.id).toBe('student-123');
      expect(mockStorage.insert).toHaveBeenCalledWith({
        collection: 'students',
        tenantId: 'tenant-abc',
        data: expect.objectContaining({
          firstName: 'JOHN',
          lastName: 'DOE',
          admissionNumber: 'ADM-2025-001'
        })
      });
      expect(mockAudit.log).toHaveBeenCalled();
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'Student.Created',
        expect.any(Object)
      );
    });
    
    it('should reject duplicate admission number', async () => {
      mockValidator.validate.mockReturnValue({
        success: true,
        data: validStudentData
      });
      
      mockStorage.findOne.mockResolvedValue({
        id: 'existing-student',
        admissionNumber: 'ADM-2025-001'
      });
      
      await expect(studentService.create(validStudentData))
        .rejects
        .toThrow('Duplicate admission number');
    });
    
    it('should validate required fields', async () => {
      mockValidator.validate.mockReturnValue({
        success: false,
        errors: [{ field: 'firstName', message: 'Required' }]
      });
      
      await expect(studentService.create({
        lastName: 'Doe'
        // Missing firstName
      }))
        .rejects
        .toThrow('Invalid student data');
    });
  });
  
  describe('updateStudent', () => {
    it('should update student and increment version', async () => {
      mockStorage.findOne.mockResolvedValue({
        id: 'student-123',
        version: 5,
        firstName: 'John',
        lastName: 'Doe'
      });
      
      mockStorage.update.mockResolvedValue({
        id: 'student-123',
        version: 6,
        ...updates
      });
      
      const result = await studentService.update('student-123', {
        phone: '9999999999'
      });
      
      expect(result.version).toBe(6);
      expect(mockStorage.update).toHaveBeenCalledWith({
        collection: 'students',
        tenantId: 'tenant-abc',
        id: 'student-123',
        data: {
          phone: '9999999999',
          version: 6,
          updatedAt: expect.any(String),
          updatedBy: 'Student/Parent-123'
        }
      });
    });
    
    it('should reject update if version mismatch', async () => {
      mockStorage.findOne.mockResolvedValue({
        id: 'student-123',
        version: 7, // Server has newer version
        firstName: 'John'
      });
      
      await expect(studentService.update('student-123', {
        firstName: 'Jane'
      }, { expectedVersion: 5 }))
        .rejects
        .toThrow('Version mismatch');
    });
  });
});
```

---

## Storage Tests

### 4.1 Storage Test Requirements

**RULE TEST-STOR-01**: Test tenant isolation.

```javascript
// src/services/__tests__/storage.test.js

describe('StorageService - Tenant Isolation', () => {
  let storageService;
  let tenantA;
  let tenantB;
  
  beforeEach(async () => {
    storageService = new StorageService();
    tenantA = await createTestTenant({ id: 'tenant-a' });
    tenantB = await createTestTenant({ id: 'tenant-b' });
  });
  
  afterEach(async () => {
    await cleanupTestTenants();
  });
  
  it('should isolate data between tenants', async () => {
    // Tenant A creates student
    const studentA = await storageService.insert({
      collection: 'students',
      tenantId: tenantA.id,
      data: {
        firstName: 'Student A',
        lastName: 'Test',
        admissionNumber: 'ADM-A-001'
      }
    });
    
    // Tenant B creates student
    const studentB = await storageService.insert({
      collection: 'students',
      tenantId: tenantB.id,
      data: {
        firstName: 'Student B',
        lastName: 'Test',
        admissionNumber: 'ADM-B-001'
      }
    });
    
    // Tenant A queries students
    const studentsA = await storageService.find({
      collection: 'students',
      tenantId: tenantA.id
    });
    
    // Should only see their own student
    expect(studentsA).toHaveLength(1);
    expect(studentsA[0].id).toBe(studentA.id);
    expect(studentsA[0].firstName).toBe('Student A');
    
    // Tenant B queries students
    const studentsB = await storageService.find({
      collection: 'students',
      tenantId: tenantB.id
    });
    
    // Should only see their own student
    expect(studentsB).toHaveLength(1);
    expect(studentsB[0].id).toBe(studentB.id);
    expect(studentsB[0].firstName).toBe('Student B');
  });
  
  it('should not allow cross-tenant queries', async () => {
    // Tenant A creates student
    const studentA = await storageService.insert({
      collection: 'students',
      tenantId: tenantA.id,
      data: {
        firstName: 'Student A',
        admissionNumber: 'ADM-A-001'
      }
    });
    
    // Tenant B tries to query Tenant A's student
    await expect(
      storageService.findOne({
        collection: 'students',
        tenantId: tenantB.id, // Wrong tenant
        id: studentA.id
      })
    ).rejects.toThrow('Record not found');
  });
  
  it('should enforce soft delete', async () => {
    const student = await storageService.insert({
      collection: 'students',
      tenantId: tenantA.id,
      data: {
        firstName: 'Test Student',
        admissionNumber: 'ADM-001'
      }
    });
    
    // Soft delete
    await storageService.update({
      collection: 'students',
      tenantId: tenantA.id,
      id: student.id,
      data: {
        isDeleted: true,
        deletedAt: new Date().toISOString()
      }
    });
    
    // Query should not return deleted record
    const result = await storageService.find({
      collection: 'students',
      tenantId: tenantA.id,
      filters: { isDeleted: false }
    });
    
    expect(result).toHaveLength(0);
  });
});
```

### 4.2 Storage Transaction Tests

```javascript
describe('StorageService - Transactions', () => {
  it('should rollback on failure', async () => {
    const tx = await storageService.beginTransaction();
    
    try {
      // First operation succeeds
      await tx.insert({
        collection: 'students',
        tenantId: 'tenant-a',
        data: { firstName: 'Student' }
      });
      
      // Second operation fails
      await tx.insert({
        collection: 'students',
        tenantId: 'tenant-a',
        data: { invalid: 'data' } // Missing required fields
      });
      
      await tx.commit();
    } catch (error) {
      await tx.rollback();
    }
    
    // Verify both operations rolled back
    const students = await storageService.find({
      collection: 'students',
      tenantId: 'tenant-a',
      filters: { isDeleted: false }
    });
    
    expect(students).toHaveLength(0);
  });
  
  it('should support nested transactions', async () => {
    // Test nested transaction behavior
  });
});
```

---

## Validation Tests

### 5.1 Validation Test Requirements

**RULE TEST-VAL-01**: Test all validation rules.

```javascript
// src/__tests__/validation/studentValidation.test.js

import { StudentValidationSchema } from '@/validation/studentSchema';

describe('Student Validation', () => {
  describe('field validations', () => {
    it('should accept valid student data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+919876543210',
        dateOfBirth: '2010-05-15',
        gender: 'MALE',
        classId: 'class-123',
        admissionNumber: 'ADM-2025-001'
      };
      
      const result = StudentValidationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
    
    it('should reject empty first name', () => {
      const data = {
        firstName: '',
        lastName: 'Doe',
        dateOfBirth: '2010-05-15',
        classId: 'class-123'
      };
      
      const result = StudentValidationSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.flatten().fieldErrors.firstName).toBeDefined();
    });
    
    it('should reject invalid email', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        dateOfBirth: '2010-05-15',
        classId: 'class-123'
      };
      
      const result = StudentValidationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
    
    it('should reject future date of birth', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '2030-05-15', // Future date
        classId: 'class-123'
      };
      
      const result = StudentValidationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
    
    it('should reject phone with letters', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        phone: 'abc123',
        dateOfBirth: '2010-05-15',
        classId: 'class-123'
      };
      
      const result = StudentValidationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
  
  describe('custom validations', () => {
    it('should reject if class does not exist', async () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        classId: 'non-existent-class',
        dateOfBirth: '2010-05-15'
      };
      
      // Mock class existence check
      mockClassExists.mockResolvedValue(false);
      
      const result = await StudentValidationSchema.safeParseAsync(data);
      expect(result.success).toBe(false);
    });
  });
});
```

---

## Regression Testing

### 6.1 Regression Test Suite

**RULE TEST-REG-01**: Every bug fix includes regression test.

```javascript
// Regression test for issue #123
// Bug: Student with same admission number could be created twice

describe('Regression: Admission Number Duplicate', () => {
  it('should not create duplicate admission numbers', async () => {
    // Setup: Create first student
    await StudentService.create({
      admissionNumber: 'ADM-2025-001',
      firstName: 'John',
      lastName: 'Doe'
    });
    
    // Try to create duplicate
    await expect(
      StudentService.create({
        admissionNumber: 'ADM-2025-001', // Same admission number
        firstName: 'Jane',
        lastName: 'Doe'
      })
    ).rejects.toThrow('Duplicate admission number');
  });
});

// Regression test for issue #456
// Bug: Deleting student also deleted fee records

describe('Regression: Student Delete Cascade', () => {
  it('should soft delete student but preserve fee records', async () => {
    // Setup: Create student with fees
    const student = await StudentService.create({
      firstName: 'John',
      lastName: 'Doe'
    });
    
    await FeeService.create({
      studentId: student.id,
      amount: 1000,
      dueDate: '2025-04-01'
    });
    
    // Delete student
    await StudentService.delete(student.id);
    
    // Verify student soft-deleted
    const deletedStudent = await storageService.findOne({
      collection: 'students',
      id: student.id,
      includeDeleted: true
    });
    expect(deletedStudent.isDeleted).toBe(true);
    
    // Verify fee records preserved
    const fees = await FeeService.find({ studentId: student.id });
    expect(fees.length).toBe(1);
    expect(fees[0].studentId).toBe(student.id); // Reference preserved
  });
});
```

---

## Future E2E Testing

### 7.1 E2E Test Strategy (Future)

**RULE TEST-E2E-01**: E2E tests for critical flows.

```javascript
// Future: E2E tests with Playwright

describe('Student Admission Flow', () => {
  test('complete admission workflow', async ({ page }) => {
    // 1. Login as admin
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@school.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // 2. Navigate to admission form
    await page.goto('/students/new');
    
    // 3. Fill student details
    await page.fill('[name="firstName"]', 'John');
    await page.fill('[name="lastName"]', 'Doe');
    await page.selectOption('[name="classId"]', 'class-10-a');
    await page.fill('[name="admissionNumber"]', 'ADM-2025-001');
    
    // 4. Submit form
    await page.click('button[type="submit"]');
    
    // 5. Verify success message
    await expect(page.locator('.success-message'))
      .toContainText('Student admitted successfully');
    
    // 6. Verify redirect to student list
    await expect(page.url()).toContain('/students');
    
    // 7. Verify student in list
    await expect(page.locator('text=John Doe')).toBeVisible();
  });
});
```

---

## Coverage Rules

### 8.1 Coverage Requirements

**RULE TEST-COV-01**: Minimum coverage thresholds.

| Metric | Minimum | Target | Critical |
|--------|---------|--------|----------|
| Line Coverage | 80% | 90% | 95% |
| Branch Coverage | 70% | 80% | 90% |
| Function Coverage | 80% | 90% | 95% |
| Statement Coverage | 80% | 90% | 95% |

**RULE TEST-COV-02**: Critical paths require 100% coverage.

```javascript
// Critical paths requiring 100% coverage:
const CriticalPaths = [
  // Authentication
  'login', 'logout', 'passwordReset', 'mfaVerification',
  
  // Authorization
  'permissionCheck', 'roleValidation',
  
  // Data integrity
  'studentCreate', 'feeCalculation', 'paymentProcessing',
  
  // Multi-tenant
  'tenantIsolation', 'tenantContextResolution',
  
  // Security
  'inputValidation', 'sanitization', 'encryption'
];
```

### 8.2 Coverage Enforcement

```javascript
// .github/workflows/test-coverage.yml
- name: Run tests with coverage
  run: npm test -- --coverage

- name: Enforce coverage thresholds
  run: npx jest --coverage --coverageThreshold='{"global":{"lines":80,"branches":70,"functions":80}}'

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
    fail_ci_if_error: true
```

---

## Test Automation

### 9.1 CI/CD Integration


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

```yaml
# .github/workflows/tests.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: '18' }
      - run: npm install
      - run: npm run test:unit
      - run: npm run test:coverage
      
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: '18' }
      - run: npm install
      - run: npm run test:integration
```

---

*End of RULE-10: Testing Strategy*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

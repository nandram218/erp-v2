# RULE-18: Validation Standards

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Backend Team  
**Severity:** CRITICAL  
**Category:** Data Integrity  
**Applies To:** All input validation, data validation, API validation, form validation  
**Detection Method:** Validation Tests, Linting, Runtime Checks  
**Auto-Fix Available:** Partial  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Validation Strategy](#validation-strategy)
5. [Schema Validation](#schema-validation)
6. [Field Validation](#field-validation)
7. [Cross-Field Validation](#cross-field-validation)
8. [Business Rule Validation](#business-rule-validation)
9. [Async Validation](#async-validation)
10. [Error Handling](#error-handling)
11. [Performance](#performance)

---

## WHY

### Business Rationale
- **Data Integrity**: Invalid data causes cascade failures in reports and billing.
- **Security**: Validation prevents injection attacks and data corruption.
- **Student/Parent Experience**: Clear validation errors help users correct mistakes quickly.
- **Compliance**: Data validation ensures regulatory compliance (FERPA, GDPR).

### Technical Rationale
- **Error Prevention**: Catch errors early, fail fast.
- **API Contracts**: Validation enforces API contracts.
- **Storage Layer Integrity**: Validation prevents invalid data from reaching storage.
- **Type Safety**: Runtime validation complements TypeScript types.

---

## WHEN

### Applies To
- **All Student/Parent Input**: Forms, API requests, file uploads.
- **All API Endpoints**: Every request body and parameter.
- **All Service Methods**: Method parameters validated.
- **All External Data**: Third-party integrations, imports.
- **All Data Imports**: CSV, Excel, API imports.

### Does NOT Apply To
- Internal function calls (trusted code)
- Pre-validated cached data
- Read-only operations on existing data

---

## WHERE

### Scope
- **Validation Service**: `src/services/validationService.js`
- **Zod Schemas**: `src/**/*.schema.js`
- **Form Validation**: `src/modules/**/validation/*`
- **API Middleware**: `src/middleware/validation.js`

---

## Validation Strategy

### 1.1 Validation Layers

**RULE VAL-STRAT-01**: Multi-layer validation defense.

```javascript
// 4 layers of validation:

// Layer 1: School/Tenant-side (UX)
// - Instant feedback
// - Prevent unnecessary server calls
// - Student/Parent-friendly error messages
const ClientValidation = {
  format: 'Zod schema in React component',
  timing: 'On blur / onChange',
  feedback: 'Inline error messages',
  example: 'Email format, required fields, phone format'
};

// Layer 2: API Gateway (Security)
// - First line of defense
// - Prevents bad requests from reaching backend
// - Rate limiting, authentication
const APIGatewayValidation = {
  format: 'Zod schema in route handler',
  timing: 'On request',
  feedback: '400 Bad Request with details',
  example: 'Content-Type, request size, JSON format'
};

// Layer 3: Service Layer (Business Logic)
// - Business rule validation
// - Cross-field validation
// - Consistency checks
const ServiceValidation = {
  format: 'Explicit validation in service methods',
  timing: 'Before processing',
  feedback: 'ValidationError with business context',
  example: 'Admission number unique, fee calculation valid'
};

// Layer 4: Storage Layer Layer (Integrity)
// - Final defense
// - Unique constraints, foreign keys
// - Data type enforcement
const DatabaseValidation = {
  format: 'Storage Layer constraints',
  timing: 'On insert/update',
  feedback: 'Storage Layer error',
  example: 'UNIQUE(tenant_id, admission_number)'
};
```

### 1.2 Validation Principles

**RULE VAL-PRIN-01**: Validation best practices.

```javascript
const ValidationPrinciples = {
  failFast: {
    description: 'Detect and report errors early',
    reason: 'Prevents cascade failures',
    example: 'Validate before expensive operations'
  },
  
  failSafe: {
    description: 'Default to rejection',
    reason: 'Unknown input is dangerous',
    example: 'Whitelist approach - reject by default'
  },
  
  failExplicit: {
    description: 'Clear error messages',
    reason: 'Users and developers can fix issues',
    example: 'Email must contain @ symbol'
  },
  
  failSecure: {
    description: 'Security-first validation',
    reason: 'Security before convenience',
    example: 'Reject ambiguous inputs'
  },
  
  validateEverywhere: {
    description: 'Validate at every layer',
    reason: 'Defense in depth',
    example: 'Don\'t trust previous layer validation'
  },
  
  neverTrustClient: {
    description: 'Always validate server-side',
    reason: 'School/Tenant can be bypassed',
    example: 'Must validate even if School/Tenant validated'
  }
};
```

---

## Schema Validation

### 2.1 Zod Schemas

**RULE VAL-SCHEMA-01**: Use Zod for all schema validation.

```javascript
import { z } from 'zod';

// Student input schema
const StudentInputSchema = z.object({
  // Required fields
  firstName: z.string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
  
  dateOfBirth: z.coerce.date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .refine(
      date => {
        const age = calculateAge(date);
        return age >= 3 && age <= 20;
      },
      { message: 'Student age must be between 3 and 20 years' }
    ),
  
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    errorMap: () => ({ message: 'Gender must be MALE, FEMALE, or OTHER' })
  }),
  
  classId: z.string()
    .uuid('Invalid class ID'),
  
  admissionNumber: z.string()
    .min(1, 'Admission number is required')
    .max(20, 'Admission number must be less than 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Admission number format: A-Z, 0-9, dash only')
    .toUpperCase(),
  
  // Optional fields
  email: z.string()
    .email('Invalid email address')
    .optional()
    .nullable(),
  
  phone: z.string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format')
    .optional()
    .nullable(),
  
  address: z.object({
    street: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    pincode: z.string()
      .regex(/^\d{6}$/, 'Pincode must be 6 digits')
      .optional()
  }).optional(),
  
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'])
    .optional(),
  
  nationality: z.string().max(50).default('Indian'),
  
  // System fields (server-set only)
  tenantId: z.string().uuid().optional(), // Set by server
  id: z.string().uuid().optional(), // Generated by server
  version: z.number().int().nonnegative().optional() // Optimistic locking
});

// Derived schema (output after validation/transformation)
export const StudentOutputSchema = StudentInputSchema.extend({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  version: z.number().int().nonnegative(),
  isDeleted: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

// Usage
function createStudent(inputData) {
  // Validate
  const result = StudentInputSchema.safeParse(inputData);
  
  if (!result.success) {
    // Format errors for Student/Parent
    const errors = result.error.flatten().fieldErrors;
    throw new ValidationError('Invalid student data', errors);
  }
  
  const validatedData = result.data;
  // Continue with validated data...
}
```

### 2.2 Schema Composition

```javascript
// Common field schemas (reusable)
const NameSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100)
});

const ContactSchema = z.object({
  email: z.string().email().optional().nullable(),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/).optional().nullable()
});

const AddressSchema = z.object({
  street: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().regex(/^\d{6}$/).optional()
});

// Compose schemas
const StudentInputSchema = z.object({
  name: NameSchema,
  contact: ContactSchema,
  address: AddressSchema.optional(),
  dateOfBirth: z.coerce.date(),
  classId: z.string().uuid()
});

// Partial updates (PATCH)
const StudentUpdateSchema = StudentInputSchema.partial();

// Strict schema (reject unknown fields)
const StudentInputSchemaStrict = StudentInputSchema.strict();

// Strip unknown fields (for safety)
const StudentInputSchemaStrip = StudentInputSchema.strip();
```

---

## Field Validation

### 3.1 Text Field Validation

```javascript
// Text field validators
const TextValidators = {
  // Required
  required: (fieldName) => 
    z.string().min(1, `${fieldName} is required`),
  
  // Length constraints
  short: (max = 50) => z.string().max(max),
  medium: (max = 200) => z.string().max(max),
  long: (max = 1000) => z.string().max(max),
  
  // Patterns
  alpha: (fieldName) => 
    z.string().regex(/^[a-zA-Z]+$/, `${fieldName} must contain only letters`),
  
  alphaNumeric: (fieldName) => 
    z.string().regex(/^[a-zA-Z0-9]+$/, `${fieldName} must be alphanumeric`),
  
  alphaNumericWithSpaces: (fieldName) => 
    z.string().regex(/^[a-zA-Z0-9\s]+$/, `${fieldName} contains invalid characters`),
  
  // Specific formats
  admissionNumber: z.string()
    .regex(/^[A-Z]{2,4}-\d{4}-\d{3}$/, 
      'Format: XX-YYYY-NNN (e.g., ADM-2025-001)'),
  
  rollNumber: z.string()
    .regex(/^\d{1,3}$/, 
      'Roll number must be 1-3 digits'),
  
  // Sanitization
  sanitized: z.string()
    .transform(val => val.trim())
    .pipe(z.string().min(1))
};

// Usage
const StudentSchema = z.object({
  firstName: TextValidators.alpha('First name').max(100),
  lastName: TextValidators.alpha('Last name').max(100),
  admissionNumber: TextValidators.admissionNumber
});
```

### 3.2 Number Validation

```javascript
// Number field validators
const NumberValidators = {
  integer: (fieldName, options = {}) => z.coerce.number()
    .int(`${fieldName} must be a whole number`)
    .min(options.min, `${fieldName} must be at least ${options.min}`)
    .max(options.max, `${fieldName} must be at most ${options.max}`),
  
  positive: (fieldName) => z.coerce.number()
    .positive(`${fieldName} must be positive`),
  
  percentage: (fieldName) => z.coerce.number()
    .min(0, `${fieldName} cannot be negative`)
    .max(100, `${fieldName} cannot exceed 100`),
  
  currency: (fieldName, options = {}) => z.coerce.number()
    .min(options.min || 0, `${fieldName} cannot be negative`)
    .max(options.max || 1000000, `${fieldName} exceeds maximum`)
    .multipleOf(0.01, `${fieldName} can have at most 2 decimal places`),
  
  phone: z.string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  
  pincode: z.string()
    .regex(/^\d{6}$/, 'Pincode must be 6 digits')
};

// Usage
const FeeSchema = z.object({
  amount: NumberValidators.currency('Fee amount', { min: 100, max: 100000 }),
  discount: NumberValidators.percentage('Discount'),
  lateFee: NumberValidators.currency('Late fee', { min: 0, max: 5000 })
});
```

### 3.3 Date Validation

```javascript
// Date field validators
const DateValidators = {
  past: (fieldName) => z.coerce.date()
    .max(new Date(), `${fieldName} cannot be in the future`),
  
  future: (fieldName) => z.coerce.date()
    .min(new Date(), `${fieldName} must be in the future`),
  
  ageBetween: (fieldName, min, max) => z.coerce.date()
    .max(new Date(), `${fieldName} cannot be in the future`)
    .refine(
      date => {
        const age = calculateAge(date);
        return age >= min && age <= max;
      },
      { message: `${fieldName} indicates age outside ${min}-${max} years` }
    ),
  
  withinAcademicYear: (fieldName, academicYear) => {
    const [start, end] = academicYear.split('-').map(Number);
    const startDate = new Date(start, 3, 1); // April 1
    const endDate = new Date(end, 2, 31); // March 31
    
    return z.coerce.date()
      .min(startDate, `${fieldName} must be in academic year ${academicYear}`)
      .max(endDate, `${fieldName} must be in academic year ${academicYear}`);
  },
  
  iso8601: () => z.string()
    .datetime({ offset: true })
    .transform(str => new Date(str))
};

// Usage
const StudentSchema = z.object({
  dateOfBirth: DateValidators.ageBetween('Date of Birth', 3, 20),
  admissionDate: DateValidators.withinAcademicYear('Admission Date', '2024-2025')
});
```

---

## Cross-Field Validation

### 4.1 Dependent Field Validation

**RULE VAL-CROSS-01**: Validate fields together.

```javascript
// Cross-field validation example
const StudentSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable()
}).refine(
  data => data.email || data.phone,
  {
    message: 'At least one contact method (email or phone) is required',
    path: ['email'] // Error shown on email field
  }
);

// Complex cross-field validation
const FeePaymentSchema = z.object({
  amount: z.number(),
  paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'CHEQUE']),
  chequeNumber: z.string().optional(),
  chequeDate: z.coerce.date().optional()
}).refine(
  data => {
    if (data.paymentMethod === 'CHEQUE') {
      return data.chequeNumber && data.chequeDate;
    }
    return true;
  },
  {
    message: 'Cheque number and date are required for cheque payments',
    path: ['chequeNumber']
  }
);

// Multiple fields dependency
const AttendanceSchema = z.object({
  studentId: z.string().uuid(),
  classId: z.string().uuid(),
  date: z.coerce.date(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY']),
  reason: z.string().optional()
}).refine(
  data => {
    // If absent or late, reason is required
    if (data.status === 'ABSENT' || data.status === 'LATE') {
      return data.reason && data.reason.trim().length > 0;
    }
    return true;
  },
  {
    message: 'Reason is required for absence/late attendance',
    path: ['reason']
  }
);
```

### 4.2 Conditional Validation

```javascript
// Conditional validation based on other fields
const StudentSchema = z.object({
  hasSibling: z.boolean(),
  siblingId: z.string().uuid().optional(),
  siblingClassId: z.string().uuid().optional()
}).refine(
  data => data.hasSibling === false || (data.siblingId && data.siblingClassId),
  {
    message: 'Sibling information is required when hasSibling is true',
    path: ['siblingId']
  }
);

// Different validation based on type
const TransactionSchema = z.object({
  type: z.enum(['FEE', 'PAYMENT', 'DISCOUNT', 'REFUND']),
  amount: z.number(),
  discountReason: z.string().optional(),
  refundReason: z.string().optional()
}).and(
  z.object({}).refine(data => {
    if (data.type === 'DISCOUNT' && !data.discountReason) return false;
    if (data.type === 'REFUND' && !data.refundReason) return false;
    return true;
  }, {
    message: 'Reason required for discount/refund',
    path: ['discountReason', 'refundReason']
  })
);
```

---

## Business Rule Validation

### 5.1 Complex Business Rules

**RULE VAL-BIZ-01**: Validate business rules explicitly.

```javascript
// Business rule: Cannot mark attendance after 30 days
const AttendanceBusinessRule = {
  rule: 'ATT-003',
  description: 'Attendance cannot be modified after 30 days',
  
  validate(attendanceDate) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (attendanceDate < thirtyDaysAgo) {
      throw new BusinessRuleError(
        'ATT-003',
        'Attendance cannot be modified after 30 days from date'
      );
    }
  }
};

// Business rule: Maximum 10 students per class
const ClassCapacityRule = {
  rule: 'ADM-005',
  description: 'Class cannot exceed maximum capacity',
  
  async validate(classId, excludeStudentId = null) {
    const currentCount = await storageService.count({
      collection: 'students',
      filters: {
        classId,
        isDeleted: false,
        ...(excludeStudentId && { id: { $ne: excludeStudentId } })
      }
    });
    
    const classInfo = await storageService.findOne({
      collection: 'classes',
      id: classId
    });
    
    if (currentCount >= classInfo.maxCapacity) {
      throw new BusinessRuleError(
        'ADM-005',
        `Class ${classInfo.name} has reached maximum capacity of ${classInfo.maxCapacity}`
      );
    }
  }
};

// Business rule: Fee cannot be negative
const FeeValidationRule = {
  rule: 'FEE-002',
  description: 'Student cannot have negative balance',
  
  async validate(studentId) {
    const balance = await calculateStudentBalance(studentId);
    
    if (balance < 0) {
      throw new BusinessRuleError(
        'FEE-002',
        `Student has negative balance: ${balance}. Cannot process new fees.`,
        { balance, studentId }
      );
    }
  }
};

// Usage
async function createAttendance(data) {
  // 1. Schema validation
  const validatedData = AttendanceSchema.parse(data);
  
  // 2. Business rule validation
  AttendanceBusinessRule.validate(validatedData.date);
  
  // 3. Continue
  return await attendanceService.create(validatedData);
}
```

### 5.2 Validation Service

```javascript
// Centralized validation service
class ValidationService {
  // Run all validations
  async validateStudent(data, operation) {
    const errors = [];
    
    // 1. Schema validation
    const schemaResult = operation === 'create' 
      ? StudentInputSchema.safeParse(data)
      : StudentUpdateSchema.safeParse(data);
    
    if (!schemaResult.success) {
      errors.push(...this.formatZodErrors(schemaResult.error));
    }
    
    // 2. Business rules
    try {
      await ClassCapacityRule.validate(data.classId);
    } catch (error) {
      errors.push({
        field: 'classId',
        message: error.message,
        code: error.code
      });
    }
    
    // 3. Cross-validation
    if (data.admissionNumber) {
      const dupResult = await storageService.exists({
        collection: 'students',
        filters: {
          admissionNumber: data.admissionNumber.toUpperCase(),
          id: { $ne: data.id }
        }
      });
      
      if (dupResult) {
        errors.push({
          field: 'admissionNumber',
          message: 'Admission number already exists',
          code: 'DUPLICATE'
        });
      }
    }
    
    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }
    
    return schemaResult.success ? schemaResult.data : data;
  }
  
  formatZodErrors(error) {
    return error.flatten().fieldErrors;
  }
}
```

---

## Async Validation

### 6.1 Server-Side Validation

**RULE VAL-ASYNC-01**: Validate asynchronously where needed.

```javascript
// Async validation functions
const AsyncValidators = {
  // Check if admission number exists
  admissionNumberUnique: async (admissionNumber, excludeId = null) => {
    const existing = await storageService.findOne({
      collection: 'students',
      filters: {
        admissionNumber: admissionNumber.toUpperCase(),
        ...(excludeId && { id: { $ne: excludeId } })
      }
    });
    
    return !existing;
spinal tap
  
  // Check if class has capacity
  classHasCapacity: async (classId) => {
    const classInfo = await storageService.findOne({
      collection: 'classes',
      id: classId
    });
    
    const count = await storageService.count({
      collection: 'students',
      filters: {
        classId,
        isDeleted: false
      }
    });
    
    return count < classInfo.maxCapacity;
  },
  
  // Check if email exists
  emailUnique: async (email) => {
    const existing = await storageService.findOne({
      collection: 'users',
      filters: { email: email.toLowerCase() }
    });
    
    return !existing;
  }
};

// Usage
const StudentInputSchema = z.object({
  firstName: z.string(),
  admissionNumber: z.string(),
  email: z.string().email().optional()
}).refine(
  async (data) => {
    // Async validation
    return await AsyncValidators.admissionNumberUnique(data.admissionNumber);
  },
  {
    message: 'Admission number already exists',
    path: ['admissionNumber']
  }
).refine(
  async (data) => {
    if (!data.email) return true;
    return await AsyncValidators.emailUnique(data.email);
  },
  {
    message: 'Email already registered',
    path: ['email']
  }
);
```

---

## Error Handling

### 7.1 Validation Error Format

**RULE VAL-ERR-01**: Standardized error responses.

```javascript
// Validation error structure
const ValidationErrorResponse = {
  success: false,
  error: {
    type: 'VALIDATION_ERROR',
    code: 'INVALID_INPUT',
    message: 'Request validation failed',
    timestamp: '2025-01-15T10:30:00Z',
    requestId: 'req-123'
  },
  errors: [
    {
      field: 'firstName',
      message: 'First name must be between 1 and 100 characters',
      code: 'MIN_LENGTH',
      value: '' // Submitted value
    },
    {
      field: 'email',
      message: 'Invalid email format',
      code: 'INVALID_FORMAT',
      value: 'invalid-email'
    },
    {
      field: 'classId',
      message: 'Class is full',
      code: 'BUSINESS_RULE',
      value: 'class-123'
    }
  ]
};

// Validation error class
class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
    this.statusCode = 400;
  }
  
  toJSON() {
    return {
      success: false,
      error: {
        type: 'VALIDATION_ERROR',
        message: this.message
      },
      errors: this.errors
    };
  }
}

// Usage
try {
  const validated = StudentSchema.parse(input);
} catch (error) {
  if (error instanceof z.ZodError) {
    const validationError = new ValidationError(
      'Invalid student data',
      error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
    );
    
    return res.status(400).json(validationError.toJSON());
  }
}
```

---

## Performance

### 8.1 Validation Performance

**RULE VAL-PERF-01**: Optimize validation performance.

```javascript
// Caching for expensive validations
class ValidationCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 60000; // 1 minute
  }
  
  async validateUnique(field, value, collection) {
    const cacheKey = `${collection}:${field}:${value}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.valid;
    }
    
    // Expensive DB query
    const exists = await storageService.findOne({
      collection,
      filters: { [field]: value }
    });
    
    const valid = !exists;
    
    this.cache.set(cacheKey, {
      valid,
      timestamp: Date.now()
    });
    
    return valid;
  }
}

// Batch validation
async function validateBatchStudentInputs(inputs) {
  // Batch DB queries instead of individual
  const admissionNumbers = inputs.map(i => i.admissionNumber.toUpperCase());
  
  const existing = await storageService.find({
    collection: 'students',
    filters: {
      admissionNumber: { $in: admissionNumbers }
    },
    fields: ['admissionNumber']
  });
  
  const existingSet = new Set(existing.map(e => e.admissionNumber));
  
  return inputs.map(input => ({
    ...input,
    admissionNumberValid: !existingSet.has(input.admissionNumber.toUpperCase())
  }));
}

// Lazy validation for optional fields
const LazyValidationSchema = z.object({
  email: z.string().email().optional()
}).refine(
  data => !data.email || isValidEmailDomain(data.email),
  {
    message: 'Email domain not allowed',
    path: ['email']
  }
);
```

---

## Validation Middleware

### 9.1 API Validation Middleware


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

```javascript
// Express middleware for validation
import { z } from 'zod';

function validateBody(schema) {
  return async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            errors: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          }
        });
      }
      next(error);
    }
  };
}

// Usage
app.post('/api/v2/students',
  validateBody(StudentInputSchema),
  async (req, res) => {
    const student = await studentService.create(req.body);
    res.status(201).json(student);
  }
);
```

---

*End of RULE-18: Validation Standards*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

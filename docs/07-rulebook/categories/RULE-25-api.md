# RULE-25: API Design Standards

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Backend Team  
**Severity:** CRITICAL  
**Category:** Interface Design  
**Applies To:** REST API design, GraphQL schemas, SDK design, API contracts  
**Detection Method:** API Review, Contract Tests, Linting  
**Auto-Fix Available:** No  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [API Principles](#api-principles)
5. [REST API Design](#rest-api-design)
6. [Request Design](#request-design)
7. [Response Design](#response-design)
8. [Error Handling](#error-handling)
9. [Authentication & Authorization](#authentication--authorization)
10. [Rate Limiting](#rate-limiting)
11. [API Documentation](#api-documentation)
12. [Versioning](#versioning)

---

## WHY

### Business Rationale
- **Developer Experience**: Well-designed APIs reduce integration time from days to hours.
- **Consistency**: Standard APIs reduce training and support costs.
- **Ecosystem Growth**: Good APIs enable third-party integrations.
- **Long-term Viability**: Stable APIs reduce breaking changes.

### Technical Rationale
- **Interoperability**: Standard HTTP/REST principles ensure broad compatibility.
- **Maintainability**: Consistent design patterns ease maintenance.
- **Testing**: Well-designed APIs are easier to test.
- **Monitoring**: Predictable APIs enable better monitoring.

---

## WHEN

### Applies To
- **All Public APIs**: REST endpoints, GraphQL queries, webhooks.
- **All Internal APIs**: Service-to-service communication.
- **All SDKs**: School/Tenant libraries for JavaScript, mobile, etc.
- **All Integrations**: Third-party API integrations.
- **All Webhooks**: Event notifications to external systems.

### Does NOT Apply To
- Internal function calls (within same service)
- Private APIs (internal use only, no contract)
- Experimental APIs (flagged as unstable)

---

## WHERE

### Scope
- **API Routes**: `src/api/**/*.js`
- **API Controllers**: `src/controllers/**/*.js`
- **API Schemas**: `src/schemas/api/**/*.js`
- **API Tests**: `tests/api/**/*.js`
- **API Documentation**: `docs/api/`

---

## API Principles

### 1.1 Core Principles

**RULE API-01**: Follow RESTful design principles.

```javascript
const APIPrinciples = {
  // 1. Resource-oriented
  resourceOriented: {
    description: 'URLs represent resources (nouns, not verbs)',
    good: '/api/v2/students',
    bad: '/api/v2/getStudents',
    bad: '/api/v2/createStudent'
  },
  
  // 2. HTTP methods
  httpMethods: {
    GET: 'Read/retrieve resources',
    POST: 'Create new resource',
    PUT: 'Update/replace entire resource',
    PATCH: 'Partial update',
    DELETE: 'Delete resource'
  },
  
  // 3. Stateless
  stateless: {
    description: 'Each request contains all necessary information',
    rule: 'No server-side session state',
    implementation: 'JWT tokens, API keys in headers'
  },
  
  // 4. Consistent naming
  naming: {
    resources: 'Plural nouns (students, not student)',
    hierarchy: '/students/{id}/attendance',
    actions: 'Use HTTP methods, not URLs (/students/{id}/enroll is bad)',
    filters: 'Query parameters (/students?classId=123)'
  },
  
  // 5. Standard status codes
  statusCodes: {
    200: 'OK - GET/PUT succeeded',
    201: 'Created - POST succeeded',
    204: 'No Content - DELETE succeeded',
    400: 'Bad Request - Invalid input',
    401: 'Unauthorized - Not authenticated',
    403: 'Forbidden - Not authorized',
    404: 'Not Found - Resource doesn\'t exist',
    409: 'Conflict - Duplicate, constraint violation',
    422: 'Unprocessable - Validation failed',
    429: 'Too Many Requests - Rate limited',
    500: 'Internal Server Error - Server failed',
    503: 'Service Unavailable - Temporary downtime'
  }
};
```

### 1.2 API Maturity

```javascript
const APIMaturity = {
  // Richardson Maturity Model
  levels: {
    L0: {
      name: 'Swamp of POX',
      description: 'HTTP as transport, XML/JSON as format',
    },
    
    L1: {
      name: 'Resources',
      description: 'Individual endpoints for resources',
      example: '/api/students, /api/fees'
    },
    
    L2: {
      name: 'HTTP Verbs',
      description: 'Proper use of GET, POST, PUT, DELETE',
      example: 'GET /students, POST /students, PUT /students/123'
    },
    
    L3: {
      name: 'Hypermedia',
      description: 'HATEOAS - links in responses',
      example: `
        {
          "id": "123",
          "name": "John",
          "links": [
            { "rel": "self", "href": "/students/123" },
            { "rel": "fees", "href": "/students/123/fees" }
          ]
        }
      `
    }
  },
  
  target: 'All APIs should be at least Level 2',
  recommendation: 'Level 3 for public APIs'
};
```

---

## REST API Design

### 2.1 Endpoint Design

**RULE API-ENDPOINT-01**: Consistent endpoint structure.

```javascript
const EndpointDesign = {
  // Format: /api/v{version}/{resource}[/{id}[/{subresource}]]
  format: '/api/v{version}/{resource}/{id?}/{action?}',
  
  examples: {
    // List all students
    list: 'GET /api/v2/students',
    
    // Get specific student
    get: 'GET /api/v2/students/{id}',
    
    // Create student
    create: 'POST /api/v2/students',
    
    // Update student (full)
    update: 'PUT /api/v2/students/{id}',
    
    // Partial update
    patch: 'PATCH /api/v2/students/{id}',
    
    // Delete student
    delete: 'DELETE /api/v2/students/{id}',
    
    // Sub-resource: Student's attendance
    listAttendance: 'GET /api/v2/students/{id}/attendance',
    
    // Sub-resource: Mark attendance
    markAttendance: 'POST /api/v2/students/{id}/attendance',
    
    // Action: Enroll student in class
    enroll: 'POST /api/v2/students/{id}/enroll',
    
    // Bulk operations
    bulkCreate: 'POST /api/v2/students/bulk',
    bulkDelete: 'DELETE /api/v2/students/bulk'
  },
  
  // Endpoint naming rules
  rules: {
    useNouns: 'Students (not GetStudents)',
    plural: 'Students (not Student)',
    lowercase: 'students (not Students)',
    hyphens: 'student-profiles (not studentProfiles)',
    noTrailingSlash: '/students (not /students/)'
  }
};

// Express router setup
const studentRoutes = express.Router();

// GET /api/v2/students - List students
studentRoutes.get('/', async (req, res) => {
  const { page, limit, classId } = req.query;
  const students = await studentService.list({ page, limit, classId });
  res.json(students);
});

// GET /api/v2/students/:id - Get student
studentRoutes.get('/:id', async (req, res) => {
  const { id } = req.params;
  const student = await studentService.getById(id);
  res.json(student);
});

// POST /api/v2/students - Create student
studentRoutes.post('/', async (req, res) => {
  const student = await studentService.create(req.body);
  res.status(201).json(student);
});

// PUT /api/v2/students/:id - Update student
studentRoutes.put('/:id', async (req, res) => {
  const { id } = req.params;
  const student = await studentService.update(id, req.body);
  res.json(student);
});

// DELETE /api/v2/students/:id - Delete student
studentRoutes.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await studentService.delete(id);
  res.status(204).send();
});
```

### 2.2 Query Parameters

```javascript
// Standard query parameters
const QueryParameters = {
  // Pagination
  pagination: {
    page: 'page number (1-indexed)',
    limit: 'items per page (default: 50, max: 100)',
    offset: 'alternative to page',
    cursor: 'cursor-based pagination'
  },
  
  // Filtering
  filtering: {
    field: 'filter by field',
    operator: 'eq, ne, gt, lt, gte, lte, in, nin, contains',
    example: '?classId=123&age.gte=18&name.contains=john'
  },
  
  // Sorting
  sorting: {
    sort: 'field name',
    Fee Transaction: 'asc or desc',
    example: '?sort=lastName&Fee Transaction=asc'
  },
  
  // Fields (sparse fieldsets)
  fields: {
    fields: 'comma-separated list of fields',
    example: '?fields=id,firstName,lastName,classId',
    reason: 'Reduce response size'
  },
  
  // Search
  search: {
    q: 'search query',
    example: '?q=john+doe'
  },
  
  // Example: Complex query
  example: `
    GET /api/v2/students?
      page=2&
      limit=50&
      classId=123&
      sort=lastName&
      Fee Transaction=asc&
      fields=id,firstName,lastName&
      q=john
  `
};

// Usage in controller
async function listStudents(req, res) {
  const {
    page = 1,
    limit = 50,
    classId,
    sort = 'createdAt',
    Fee Transaction = 'desc',
    fields,
    q
  } = req.query;
  
  // Build query
  const query = {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 100), // Max 100
    sortBy: sort,
    sortOrder: Fee Transaction,
    filters: {}
  };
  
  if (classId) {
    query.filters.classId = classId;
  }
  
  if (q) {
    query.search = q;
  }
  
  if (fields) {
    query.fields = fields.split(',');
  }
  
  const students = await studentService.list(query);
  res.json(students);
}
```

---

## Request Design

### 3.1 Request Structure

**RULE API-REQ-01**: Standardized request format.

```javascript
// Request format
const RequestFormat = {
  // HTTP Method
  method: 'GET | POST | PUT | PATCH | DELETE',
  
  // URL
  url: '/api/v2/students',
  
  // Headers
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {token}',
    'X-API-Version': 'v2',
    'X-Request-ID': '{uuid}',
    'X-Tenant-ID': '{tenant-id}'
  },
  
  // Body (for POST/PUT/PATCH)
  body: {
    // Required fields first
    firstName: 'John',
    lastName: 'Doe',
    
    // Optional fields
    email: 'john@example.com',
    phone: '+919876543210',
    
    // Nested objects
    address: {
      street: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    
    // Arrays
    subjects: ['math', 'science', 'english']
  },
  
  // Query parameters
  query: '?page=1&limit=50&classId=123&sort=lastName&Fee Transaction=asc'
};

// Validation
const StudentCreateSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  classId: z.string().uuid(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.object({
    street: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    pincode: z.string().regex(/^\d{6}$/).optional()
  }).optional()
});

// Controller with validation
async function createStudent(req, res) {
  try {
    // 1. Validate input
    const validatedData = StudentCreateSchema.parse(req.body);
    
    // 2. Business logic
    const student = await studentService.create(validatedData, {
      tenantId: req.tenantId,
      userId: req.Student/Parent.id
    });
    
    // 3. Return response
    res.status(201).json({
      success: true,
      data: student
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: error.errors
        }
      });
    }
    
    // Other errors
    next(error);
  }
}
```

### 3.2 Headers

```javascript
const StandardHeaders = {
  // Request headers
  request: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer {jwt-token}',
    'X-API-Version': 'v2',
    'X-Request-ID': '{uuid}',
    'X-Tenant-ID': '{tenant-id}',
    'X-Device-ID': '{device-id}',
    'Student/Parent-Agent': '{School/Tenant-info}'
  },
  
  // Response headers
  response: {
    'Content-Type': 'application/json',
    'X-API-Version': 'v2',
    'X-Request-ID': '{uuid}',
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': '95',
    'X-RateLimit-Reset': '1642000000',
    'X-Response-Time': '150ms',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
  },
  
  // CORS headers
  cors: {
    'Access-Control-Allow-Origin': 'https://app.erp.com',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  }
};
```

---

## Response Design

### 4.1 Response Structure

**RULE API-RES-01**: Standardized response format.

```javascript
// Success response
const SuccessResponse = {
  success: true,
  data: {
    // Resource(s)
  },
  
  meta: {
    // Pagination metadata
    page: 1,
    limit: 50,
    total: 1250,
    totalPages: 25,
    
    // Request metadata
    requestId: 'req-123',
    timestamp: '2025-01-15T10:30:00Z',
    duration: '150ms'
  },
  
  // Optional: Links for HATEOAS
  links: {
    self: '/api/v2/students?page=1',
    next: '/api/v2/students?page=2',
    prev: null,
    first: '/api/v2/students?page=1',
    last: '/api/v2/students?page=25'
  }
};

// Example: List students
GET /api/v2/students?page=1&limit=2

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "student-1",
      "firstName": "John",
      "lastName": "Doe",
      "classId": "class-123"
    },
    {
      "id": "student-2",
      "firstName": "Jane",
      "lastName": "Smith",
      "classId": "class-123"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 2,
    "total": 1250,
    "totalPages": 25
  },
  "links": {
    "self": "/api/v2/students?page=1&limit=2",
    "next": "/api/v2/students?page=2&limit=2",
    "prev": null
  }
}

// Example: Create student
POST /api/v2/students
Body: {
  "firstName": "John",
  "lastName": "Doe",
  "classId": "class-123"
}

Response (201 Created):
{
  "success": true,
  "data": {
    "id": "student-new",
    "firstName": "John",
    "lastName": "Doe",
    "classId": "class-123",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}

// Example: Delete student
DELETE /api/v2/students/student-123

Response (204 No Content):
(Empty body)
```

### 4.2 Response Envelope

```javascript
// Response envelope helper
class ResponseFormatter {
  // Success response
  static success(res, data, status = 200, meta = {}) {
    const response = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    };
    
    return res.status(status).json(response);
  }
  
  // Error response
  static error(res, error, status = 500) {
    const response = {
      success: false,
      error: {
        type: error.type || 'INTERNAL_ERROR',
        message: error.message || 'An error occurred',
        code: error.code,
        ...(error.details && { details: error.details }),
        ...(error.documentation && { documentation: error.documentation })
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: error.requestId
      }
    };
    
    return res.status(status).json(response);
  }
  
  // Paginated response
  static paginated(res, data, pagination, links = {}) {
    return this.success(res, data, 200, {
      pagination,
      links
    });
  }
}

// Usage in controller
async function getStudent(req, res) {
  const student = await studentService.getById(req.params.id);
  
  if (!student) {
    return ResponseFormatter.error(res, {
      type: 'NOT_FOUND',
      message: 'Student not found',
      code: 'STUDENT_NOT_FOUND'
    }, 404);
  }
  
  return ResponseFormatter.success(res, student);
}

async function listStudents(req, res) {
  const { data, pagination } = await studentService.list(req.query);
  
  return ResponseFormatter.paginated(res, data, pagination, {
    self: `/api/v2/students?page=${pagination.page}`,
    next: pagination.page < pagination.totalPages 
      ? `/api/v2/students?page=${pagination.page + 1}` 
      : null
  });
}
```

---

## Error Handling

### 5.1 Error Response Format

**RULE API-ERR-01**: Standardized error responses.

```javascript
// Error format
const ErrorResponse = {
  success: false,
  error: {
    type: 'ERROR_TYPE', // Machine-readable
    message: 'Human-readable message',
    code: 'ERROR_CODE', // Application-specific code
    status: 400, // HTTP status code
    
    // Validation errors
    validation: [
      {
        field: 'email',
        message: 'Invalid email format',
        value: 'invalid-email'
      }
    ],
    
    // Additional context
    details: {},
    
    // Documentation link
    documentation: 'https://docs.erp.com/errors/INVALID_INPUT',
    
    // Request info
    requestId: 'req-123',
    timestamp: '2025-01-15T10:30:00Z'
  }
};

// Error types
const ErrorTypes = {
  VALIDATION_ERROR: {
    status: 400,
    message: 'Invalid input',
    example: 'Email format invalid'
  },
  
  UNAUTHORIZED: {
    status: 401,
    message: 'Authentication required',
    example: 'Missing or invalid token'
  },
  
  FORBIDDEN: {
    status: 403,
    message: 'Access denied',
    example: 'Insufficient permissions'
  },
  
  NOT_FOUND: {
    status: 404,
    message: 'Resource not found',
    example: 'Student ID doesn\'t exist'
  },
  
  CONFLICT: {
    status: 409,
    message: 'Resource conflict',
    example: 'Admission number already exists'
  },
  
  UNPROCESSABLE: {
    status: 422,
    message: 'Validation failed',
    example: 'Business rule violated'
  },
  
  RATE_LIMIT_EXCEEDED: {
    status: 429,
    message: 'Too many requests',
    example: 'Rate limit exceeded, retry after 60s'
  },
  
  INTERNAL_ERROR: {
    status: 500,
    message: 'Internal server error',
    example: 'Storage Layer connection failed'
  },
  
  SERVICE_UNAVAILABLE: {
    status: 503,
    message: 'Service temporarily unavailable',
    example: 'Maintenance in progress'
  }
};
```

### 5.2 Error Handling Middleware

```javascript
// Global error handler
app.use((err, req, res, next) => {
  // Log error
  logger.error('API Error', {
    error: err.message,
    stack: err.stack,
    requestId: req.requestId,
    tenantId: req.tenantId,
    userId: req.Student/Parent?.id
  });
  
  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Format error response
  const errorResponse = {
    type: err.type || 'INTERNAL_ERROR',
    message: err.message || 'An unexpected error occurred',
    code: err.code,
    status: statusCode,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  };
  
  // Add validation errors
  if (err.validationErrors) {
    errorResponse.validation = err.validationErrors;
  }
  
  // Add documentation link
  if (err.documentation) {
    errorResponse.documentation = err.documentation;
  }
  
  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    errorResponse.message = 'An internal server error occurred';
    errorResponse.type = 'INTERNAL_ERROR';
  }
  
  res.status(statusCode).json({
    success: false,
    error: errorResponse
  });
});

// Custom error classes
class ValidationError extends Error {
  constructor(message, validationErrors = []) {
    super(message);
    this.type = 'VALIDATION_ERROR';
    this.statusCode = 400;
    this.validationErrors = validationErrors;
  }
}

class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} not found`);
    this.type = 'NOT_FOUND';
    this.statusCode = 404;
    this.code = `${resource.toUpperCase()}_NOT_FOUND`;
  }
}

class ConflictError extends Error {
  constructor(message, code) {
    super(message);
    this.type = 'CONFLICT';
    this.statusCode = 409;
    this.code = code || 'RESOURCE_CONFLICT';
  }
}

// Usage
async function createStudent(req, res) {
  // Check if admission number exists
  const exists = await studentService.admissionNumberExists(req.body.admissionNumber);
  if (exists) {
    throw new ConflictError(
      'Admission number already exists',
      'ADMISSION_NUMBER_EXISTS'
    );
  }
  
  // Create student
  const student = await studentService.create(req.body);
  
  return res.status(201).json({
    success: true,
    data: student
  });
}
```

---

## Authentication & Authorization

### 6.1 Authentication

**RULE API-AUTH-01**: Secure authentication.

```javascript
const Authentication = {
  // Methods
  methods: {
    bearer: {
      type: 'JWT Token',
      header: 'Authorization: Bearer {token}',
      use: 'Primary authentication method',
      
      structure: {
        header: { alg: 'HS256', typ: 'JWT' },
        payload: {
          sub: 'Student/Parent-123', // Subject (Student/Parent ID)
          email: 'Student/Parent@example.com',
          role: 'ADMIN',
          tenantId: 'tenant-abc',
          iat: 1642000000, // Issued at
          exp: 1642086400  // Expires
        },
        signature: 'HMAC-SHA256'
      }
    },
    
    apiKey: {
      type: 'API Key',
      header: 'X-API-Key: {key}',
      use: 'Service-to-service, third-party integrations',
      
      format: 'sk_live_... or sk_test_...',
      rotation: 'Every 90 days'
    },
    
    basic: {
      type: 'Basic Auth',
      header: 'Authorization: Basic {base64(Student/Parent:pass)}',
      use: 'NOT RECOMMENDED (use only for legacy)'
    }
  },
  
  // Token lifecycle
  tokenLifecycle: {
    accessToken: {
      expiry: '15 minutes',
      refresh: true,
      storage: 'Memory (not localStorage)'
    },
    
    refreshToken: {
      expiry: '7 days',
      refresh: false,
      storage: 'HttpOnly cookie'
    }
  }
};

// Authentication middleware
async function authenticate(req, res, next) {
  try {
    // 1. Extract token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'UNAUTHORIZED',
          message: 'Missing authorization header'
        }
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Load Student/Parent
    const Student/Parent = await userService.getById(decoded.sub);
    if (!Student/Parent) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'UNAUTHORIZED',
          message: 'Invalid token'
        }
      });
    }
    
    // 4. Attach to request
    req.Student/Parent = Student/Parent;
    req.tenantId = Student/Parent.tenantId;
    
    next();
    
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        type: 'UNAUTHORIZED',
        message: 'Invalid or expired token'
      }
    });
  }
}
```

### 6.2 Authorization

```javascript
// Authorization middleware
function authorize(...permissions) {
  return async (req, res, next) => {
    // Check if Student/Parent has required permissions
    const hasPermission = req.Student/Parent.permissions.some(p => 
      permissions.includes(p)
    );
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: {
          type: 'FORBIDDEN',
          message: 'Insufficient permissions',
          required: permissions,
          current: req.Student/Parent.permissions
        }
      });
    }
    
    next();
  };
}

// Usage
const studentRoutes = express.Router();

// Read - requires student:read permission
studentRoutes.get('/:id', 
  authenticate,
  authorize('students:read'),
  getStudent
);

// Write - requires student:write permission
studentRoutes.post('/',
  authenticate,
  authorize('students:write'),
  createStudent
);

// Admin only - requires student:admin permission
studentRoutes.delete('/:id',
  authenticate,
  authorize('students:admin'),
  deleteStudent
);

// Resource-based authorization
async function authorizeResource(req, res, next) {
  const studentId = req.params.id;
  const Student/Parent = req.Student/Parent;
  
  // Admin can access anything
  if (Student/Parent.role === 'ADMIN') {
    return next();
  }
  
  // Teachers can only access their students
  if (Student/Parent.role === 'TEACHER') {
    const student = await studentService.getById(studentId);
    const teacherClasses = await teacherService.getClassIds(Student/Parent.id);
    
    if (!teacherClasses.includes(student.classId)) {
      return res.status(403).json({
        success: false,
        error: {
          type: 'FORBIDDEN',
          message: 'Cannot access student not in your class'
        }
      });
    }
  }
  
  next();
}
```

---

## Rate Limiting

### 7.1 Rate Limit Strategy

**RULE API-RATE-01**: Implement rate limiting.

```javascript
const RateLimiting = {
  // Rate limits by endpoint
  limits: {
    // Public endpoints (no auth)
    public: {
      login: {
        limit: 5,
        window: '15 minutes',
        reason: 'Prevent brute force'
      },
      
      signup: {
        limit: 3,
        window: '1 hour',
        reason: 'Prevent spam'
      }
    },
    
    // Authenticated endpoints
    authenticated: {
      default: {
        limit: 1000,
        window: '1 hour',
        reason: 'General API usage'
      },
      
      heavy: {
        limit: 100,
        window: '1 hour',
        endpoints: ['/reports/*', '/exports/*'],
        reason: 'Expensive operations'
      },
      
      write: {
        limit: 500,
        window: '1 hour',
        endpoints: ['/students', '/fees'],
        reason: 'Limit data modifications'
      }
    },
    
    // By Student/Parent role
    byRole: {
      ADMIN: {
        limit: 5000,
        window: '1 hour'
      },
      TEACHER: {
        limit: 2000,
        window: '1 hour'
      },
      STUDENT: {
        limit: 500,
        window: '1 hour'
      }
    }
  },
  
  // Response headers
  headers: {
    'X-RateLimit-Limit': '1000',
    'X-RateLimit-Remaining': '950',
    'X-RateLimit-Reset': '1642086400',
    'Retry-After': '3600' // Only on 429
  },
  
  // Rate limit exceeded response
  exceeded: {
    status: 429,
    body: {
      success: false,
      error: {
        type: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
        limit: 1000,
        remaining: 0,
        resetAt: '2025-01-15T11:00:00Z',
        retryAfter: 3600
      }
    }
  }
};

// Rate limiter middleware
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1000 requests per window
  message: {
    success: false,
    error: {
      type: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.Student/Parent?.id || req.ip
});

// Apply to routes
app.use('/api/v2/', apiLimiter);

// Stricter limit for specific endpoints
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests
  message: {
    success: false,
    error: {
      type: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts, please try again later'
    }
  }
});

app.post('/api/v2/auth/login', strictLimiter, login);
```

---

## API Documentation

### 8.1 OpenAPI Specification

**RULE API-DOC-01**: Document all APIs.

```yaml
# docs/api/openapi.yaml
openapi: 3.0.0
info:
  title: ERP-v2 API
  description: Enterprise Resource Planning System API
  version: 2.0.0
  contact:
    name: API Support
    email: api-support@erp.com

servers:
  - url: https://api.erp.com/v2
    description: Production server
  - url: https://staging-api.erp.com/v2
    description: Staging server

security:
  - BearerAuth: []

paths:
  /students:
    get:
      summary: List students
      operationId: listStudents
      tags:
        - Students
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 50
            maximum: 100
        - name: classId
          in: query
          schema:
            type: string
            format: uuid
        - name: search
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Student'
                  meta:
                    $ref: '#/components/schemas/PaginationMeta'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '429':
          $ref: '#/components/responses/RateLimitExceeded'
    
    post:
      summary: Create student
      operationId: createStudent
      tags:
        - Students
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/StudentCreate'
      responses:
        '201':
          description: Student created
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: '#/components/schemas/Student'
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '409':
          $ref: '#/components/responses/Conflict'

components:
  schemas:
    Student:
      type: object
      properties:
        id:
          type: string
          format: uuid
        tenantId:
          type: string
          format: uuid
        firstName:
          type: string
        lastName:
          type: string
        dateOfBirth:
          type: string
          format: date
        gender:
          type: string
          enum: [MALE, FEMALE, OTHER]
        classId:
          type: string
          format: uuid
        admissionNumber:
          type: string
        email:
          type: string
          format: email
        phone:
          type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      required:
        - id
        - tenantId
        - firstName
        - lastName
    
    StudentCreate:
      type: object
      required:
        - firstName
        - lastName
        - dateOfBirth
        - gender
        - classId
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
        dateOfBirth:
          type: string
          format: date
        gender:
          type: string
          enum: [MALE, FEMALE, OTHER]
        classId:
          type: string
          format: uuid
        admissionNumber:
          type: string
          minLength: 1
          maxLength: 20
        email:
          type: string
          format: email
        phone:
          type: string
    
    PaginationMeta:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer

  responses:
    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    
    Forbidden:
      description: Insufficient permissions
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    
    ValidationError:
      description: Validation failed
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    
    Conflict:
      description: Resource conflict
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
```

### 8.2 API Documentation Best Practices

```javascript
const APIDocumentation = {
  requirements: [
    'All endpoints documented',
    'Request/response examples provided',
    'Error codes documented',
    'Authentication requirements specified',
    'Rate limits documented',
    'Breaking changes highlighted'
  ],
  
  tools: {
    openapi: 'OpenAPI 3.0 specification',
    swagger: 'Swagger UI for interactive docs',
    postman: 'Postman collection',
    redoc: 'ReDoc for beautiful docs'
  },
  
  endpoints: {
    list: {
      method: 'GET',
      path: '/students',
      summary: 'List all students',
      description: 'Returns a paginated list of students',
      authentication: 'Required',
      permissions: ['students:read'],
      parameters: [
        { name: 'page', type: 'integer', description: 'Page number', default: 1 },
        { name: 'limit', type: 'integer', description: 'Items per page', default: 50, max: 100 }
      ],
      responses: [
        { status: 200, description: 'Success', example: { ... } },
        { status: 401, description: 'Unauthorized' },
        { status: 403, description: 'Forbidden' }
      ]
    }
  }
};
```

---

## API Testing

### 9.1 Contract Tests


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

```javascript
// API contract test
describe('Students API', () => {
  it('should list students', async () => {
    const response = await request(app)
      .get('/api/v2/students')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    // Validate response structure
    expect(response.body).to.have.property('success', true);
    expect(response.body).to.have.property('data').that.is.an('array');
    expect(response.body).to.have.property('meta');
    expect(response.body.meta).to.have.property('pagination');
    
    // Validate student schema
    if (response.body.data.length > 0) {
      const student = response.body.data[0];
      expect(student).to.have.property('id');
      expect(student).to.have.property('firstName');
      expect(student).to.have.property('lastName');
    }
  });
  
  it('should create student', async () => {
    const newStudent = {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '2010-01-01',
      gender: 'MALE',
      classId: 'class-123',
      admissionNumber: 'ADM-2025-001'
    };
    
    const response = await request(app)
      .post('/api/v2/students')
      .set('Authorization', `Bearer ${token}`)
      .send(newStudent)
      .expect(201);
    
    expect(response.body.success).to.be.true;
    expect(response.body.data).to.have.property('id');
    expect(response.body.data.firstName).to.equal(newStudent.firstName);
  });
  
  it('should validate input', async () => {
    const invalidStudent = {
      firstName: '', // Invalid: empty
      lastName: 'Doe'
      // Missing required fields
    };
    
    const response = await request(app)
      .post('/api/v2/students')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidStudent)
      .expect(400);
    
    expect(response.body.success).to.be.false;
    expect(response.body.error.type).to.equal('VALIDATION_ERROR');
  });
  
  it('should prevent unauthorized access', async () => {
    await request(app)
      .get('/api/v2/students')
      .expect(401);
  });
  
  it('should prevent forbidden access', async () => {
    const limitedToken = generateToken({ role: 'STUDENT' });
    
    await request(app)
      .get('/api/v2/students')
      .set('Authorization', `Bearer ${limitedToken}`)
      .expect(403);
  });
});
```

---

*End of RULE-25: API Design Standards*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

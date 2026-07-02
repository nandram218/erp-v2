# RULE-26: Error Handling Standards

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Backend Team  
**Severity:** CRITICAL  
**Category:** Reliability  
**Applies To:** Error handling, exception management, error recovery, Student/Parent experience  
**Detection Method:** Error Tracking, Log Analysis, Student/Parent Feedback  
**Auto-Fix Available:** No  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Error Philosophy](#error-philosophy)
5. [Error Classification](#error-classification)
6. [Error Structure](#error-structure)
7. [Error Handling Patterns](#error-handling-patterns)
8. [Error Recovery](#error-recovery)
9. [Error Logging](#error-logging)
10. [Error Monitoring](#error-monitoring)

---

## WHY

### Business Rationale
- **Student/Parent Experience**: Clear errors reduce Student/Parent frustration and support tickets.
- **Data Integrity**: Proper error handling prevents data corruption.
- **Debugging**: Well-structured errors accelerate bug fixes by 50%.
- **Trust**: Graceful error handling builds Student/Parent confidence.

### Technical Rationale
- **Fail Fast**: Catch errors early to prevent cascade failures.
- **Recovery**: Enable automatic recovery from transient errors.
- **Observability**: Structured errors enable monitoring and alerting.
- **Maintainability**: Consistent error handling eases debugging.

---

## WHEN

### Applies To
- **All Application Code**: Services, controllers, utilities.
- **All External Calls**: APIs, databases, file systems.
- **All Student/Parent Input**: Forms, API requests, file uploads.
- **All Async Operations**: Promises, callbacks, event handlers.
- **All Error Scenarios**: Expected and unexpected errors.

### Does NOT Apply To
- Development-only error handling (different in production)
- Test assertions (testing framework handles this)
- Internal control flow (use conditionals, not exceptions)

---

## WHERE

### Scope
- **Error Classes**: `src/errors/*.js`
- **Error Middleware**: `src/middleware/errorHandler.js`
- **Error Utils**: `src/utils/errorUtils.js`
- **Error Tracking**: `src/services/errorTrackingService.js`
- **Error Responses**: Standardized across all APIs

---

## Error Philosophy

### 1.1 Error Handling Principles

**RULE ERR-PHIL-01**: Handle errors explicitly and gracefully.

```javascript
const ErrorHandlingPrinciples = {
  failFast: {
    description: 'Detect and report errors immediately',
    reason: 'Prevents cascade failures and data corruption',
    example: 'Validate input before processing'
  },
  
  failSafe: {
    description: 'Default to safe state on error',
    reason: 'Prevents data loss and security issues',
    example: 'Rollback transaction on failure'
  },
  
  failExplicit: {
    description: 'Be specific about what went wrong',
    reason: 'Enables debugging and Student/Parent correction',
    example: 'Invalid email format' not 'Error occurred'
  },
  
  failQuietly: {
    description: 'Don\'t leak sensitive information',
    reason: 'Security - prevent information disclosure',
    example: 'Invalid credentials' not 'Password hash mismatch'
  },
  
  failRecoverably: {
    description: 'Enable automatic recovery when possible',
    reason: 'Improves reliability and Student/Parent experience',
    example: 'Retry with exponential backoff'
  },
  
  failAuditably: {
    description: 'Log all errors for analysis',
    reason: 'Enable debugging and trend analysis',
    example: 'Log error with context, stack trace, request ID'
  }
};

// CORRECT: Fail fast with clear message
if (!email) {
  throw new ValidationError('Email is required', {
    field: 'email',
    code: 'REQUIRED'
  });
}

// FORBIDDEN: Silent failure
function createStudent(data) {
  if (!data.email) return null; // Silent failure - caller doesn't know what happened
}

// FORBIDDEN: Leak sensitive information
try {
  await db.query('SELECT * FROM users WHERE password_hash = ?', [hash]);
} catch (error) {
  throw new Error(`Storage Layer query failed: ${error.message}`);
  // Leaks Storage Layer schema, query details
}
```

---

## Error Classification

### 2.1 Error Types

**RULE ERR-CLASS-01**: Classify errors by type.

```javascript
// Error type hierarchy
class ERPError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.requestId = global.requestId;
  }
}

// 1. Validation Errors (School/Tenant mistakes)
class ValidationError extends ERPError {
  constructor(message, validationErrors = []) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
    this.userMessage = 'Please check your input and try again';
  }
}

// 2. Authentication Errors
class AuthenticationError extends ERPError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
    this.userMessage = 'Please log in to continue';
  }
}

// 3. Authorization Errors
class AuthorizationError extends ERPError {
  constructor(message = 'Access denied', requiredPermissions = []) {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
    this.requiredPermissions = requiredPermissions;
    this.userMessage = 'You don\'t have permission to perform this action';
  }
}

// 4. Not Found Errors
class NotFoundError extends ERPError {
  constructor(resource, id) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
    this.resource = resource;
    this.resourceId = id;
    this.userMessage = 'The requested resource was not found';
  }
}

// 5. Conflict Errors (Business logic)
class ConflictError extends ERPError {
  constructor(message, code, details = {}) {
    super(message, code || 'CONFLICT', 409);
    this.name = 'ConflictError';
    this.details = details;
    this.userMessage = message;
  }
}

// 6. Business Rule Errors
class BusinessRuleError extends ERPError {
  constructor(ruleCode, message, details = {}) {
    super(message, ruleCode, 422);
    this.name = 'BusinessRuleError';
    this.ruleCode = ruleCode;
    this.details = details;
    this.userMessage = message;
  }
}

// 7. Rate Limit Errors
class RateLimitError extends ERPError {
  constructor(retryAfter) {
    super('Too many requests', 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    this.userMessage = `Too many requests. Please try again in ${retryAfter} seconds`;
  }
}

// 8. External Service Errors
class ExternalServiceError extends ERPError {
  constructor(service, message, retryable = true) {
    super(`${service} error: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502);
    this.name = 'ExternalServiceError';
    this.service = service;
    this.retryable = retryable;
    this.userMessage = 'Service temporarily unavailable. Please try again later';
  }
}

// 9. Storage Layer Errors
class DatabaseError extends ERPError {
  constructor(message, originalError = null) {
    super(message, 'DATABASE_ERROR', 500);
    this.name = 'DatabaseError';
    this.originalError = originalError;
    this.userMessage = 'A Storage Layer error occurred. Please try again';
  }
}

// 10. Internal Server Errors
class InternalError extends ERPError {
  constructor(message = 'An unexpected error occurred') {
    super(message, 'INTERNAL_ERROR', 500);
    this.name = 'InternalError';
    this.userMessage = 'Something went wrong. Please try again or contact support';
  }
}

// Usage
async function createStudent(data) {
  // Validation
  if (!data.firstName) {
    throw new ValidationError('Invalid student data', [
      { field: 'firstName', message: 'First name is required' }
    ]);
  }
  
  // Business rule
  const exists = await studentService.admissionNumberExists(data.admissionNumber);
  if (exists) {
    throw new ConflictError(
      'Admission number already exists',
      'ADMISSION_NUMBER_EXISTS',
      { admissionNumber: data.admissionNumber }
    );
  }
  
  // Create student
  try {
    return await studentService.create(data);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw new ExternalServiceError('Storage Layer', error.message);
    }
    throw error;
  }
}
```

### 2.2 Error Severity

```javascript
const ErrorSeverity = {
  LOW: {
    level: 1,
    description: 'Minor issue, Student/Parent can continue',
    examples: ['Validation error', 'Not found'],
    logging: 'INFO',
    alerting: false,
    userImpact: 'None (Student/Parent can correct and retry)'
  },
  
  MEDIUM: {
    level: 2,
    description: 'Operation failed but system is stable',
    examples: ['Business rule violation', 'Conflict'],
    logging: 'WARN',
    alerting: false,
    userImpact: 'Moderate (Student/Parent needs to take action)'
  },
  
  HIGH: {
    level: 3,
    description: 'Significant functionality broken',
    examples: ['External service down', 'Payment failed'],
    logging: 'ERROR',
    alerting: true,
    userImpact: 'High (Student/Parent cannot complete task)'
  },
  
  CRITICAL: {
    level: 4,
    description: 'System-wide failure',
    examples: ['Storage Layer down', 'Authentication system failure'],
    logging: 'ERROR',
    alerting: true,
    userImpact: 'Critical (system unusable)'
  }
};
```

---

## Error Structure

### 3.1 Error Object Format

**RULE ERR-STRUCT-01**: Standardized error structure.

```javascript
// Error object structure
const ErrorStructure = {
  // Server-side (logged and tracked)
  internal: {
    name: 'ValidationError',
    code: 'VALIDATION_ERROR',
    statusCode: 400,
    message: 'Invalid student data',
    stack: 'Error: Invalid student data\n    at validate...',
    timestamp: '2025-01-15T10:30:00Z',
    requestId: 'req-123',
    userId: 'Student/Parent-456',
    tenantId: 'tenant-789',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    context: {
      endpoint: '/api/v2/students',
      method: 'POST',
      input: { /* sanitized input */ }
    },
    cause: { /* original error if chained */ },
    validationErrors: [ /* field-level errors */ ]
  },
  
  // School/Tenant-facing (safe to expose)
  external: {
    success: false,
    error: {
      type: 'VALIDATION_ERROR', // Machine-readable
      message: 'Invalid student data', // Human-readable
      code: 'VALIDATION_ERROR', // Application error code
      status: 400, // HTTP status
      
      // Validation errors (if applicable)
      validation: [
        {
          field: 'email',
          message: 'Invalid email format',
          value: 'invalid-email'
        }
      ],
      
      // Student/Parent-friendly message
      userMessage: 'Please check your input and try again',
      
      // Documentation link
      documentation: 'https://docs.erp.com/errors/VALIDATION_ERROR',
      
      // Request tracking
      requestId: 'req-123',
      timestamp: '2025-01-15T10:30:00Z'
    }
  }
};

// Error serialization
class ERPError extends Error {
  toJSON() {
    return {
      success: false,
      error: {
        type: this.code,
        message: this.message,
        code: this.code,
        status: this.statusCode,
        userMessage: this.userMessage,
        documentation: this.getDocumentationUrl(),
        requestId: this.requestId,
        timestamp: this.timestamp,
        ...(this.validationErrors && { validation: this.validationErrors })
      }
    };
  }
  
  getDocumentationUrl() {
    return `https://docs.erp.com/errors/${this.code}`;
  }
}
```

---

## Error Handling Patterns

### 4.1 Try-Catch Pattern

**RULE ERR-PATTERN-01**: Consistent try-catch usage.

```javascript
// CORRECT: Try-catch with specific error handling
async function createStudent(studentData) {
  try {
    // 1. Validate
    const validated = StudentCreateSchema.parse(studentData);
    
    // 2. Business checks
    if (await studentService.exists(validated.admissionNumber)) {
      throw new ConflictError(
        'Admission number already exists',
        'ADMISSION_NUMBER_EXISTS'
      );
    }
    
    // 3. Create
    const student = await studentService.create(validated);
    
    // 4. Return success
    return student;
    
  } catch (error) {
    // Re-throw known errors
    if (error instanceof ValidationError ||
        error instanceof ConflictError) {
      throw error; // School/Tenant error, already formatted
    }
    
    // Wrap unknown errors
    if (error instanceof DatabaseError) {
      throw new ExternalServiceError('Storage Layer', error.message);
    }
    
    // Log unexpected errors
    logger.error('Student creation failed', {
      error: error.message,
      stack: error.stack,
      input: studentData
    });
    
    // Throw generic error to School/Tenant
    throw new InternalError('Failed to create student');
  }
}

// FORBIDDEN: Catch and ignore
async function createStudentUnsafe(studentData) {
  try {
    return await studentService.create(studentData);
  } catch (error) {
    // Silent failure - bad!
    return null;
  }
}

// FORBIDDEN: Catch and throw generic
async function createStudentUnsafe2(studentData) {
  try {
    return await studentService.create(studentData);
  } catch (error) {
    throw new Error('Error'); // Too generic!
  }
}
```

### 4.2 Error Handler Middleware

```javascript
// Global error handler
app.use((err, req, res, next) => {
  // 1. Assign request ID if not present
  const requestId = req.requestId || generateId();
  
  // 2. Log error
  logError(err, req);
  
  // 3. Track error
  trackError(err, req);
  
  // 4. Format response
  const response = formatErrorResponse(err, requestId);
  
  // 5. Send response
  res.status(err.statusCode || 500).json(response);
});

// Format error response
function formatErrorResponse(error, requestId) {
  // Handle ERP errors
  if (error instanceof ERPError) {
    return error.toJSON();
  }
  
  // Handle validation errors (Zod)
  if (error instanceof z.ZodError) {
    return new ValidationError(
      'Validation failed',
      error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        value: err.path ? getNestedValue(error.input, err.path) : undefined
      }))
    ).toJSON();
  }
  
  // Handle unknown errors
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    name: error.name
  });
  
  // Don't expose internals in production
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : error.message;
  
  return new InternalError(message).toJSON();
}

// Error logging
function logError(error, req) {
  const logData = {
    name: error.name,
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
    requestId: req.requestId,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['Student/Parent-agent'],
    userId: req.Student/Parent?.id,
    tenantId: req.tenantId,
    timestamp: new Date().toISOString()
  };
  
  // Log based on severity
  if (error instanceof ValidationError) {
    logger.warn('Validation error', logData);
  } else if (error instanceof ERPError && error.statusCode >= 500) {
    logger.error('Server error', logData);
  } else {
    logger.error('Error', logData);
  }
}
```

---

## Error Recovery

### 5.1 Retry Logic

**RULE ERR-RETRY-01**: Retry transient errors.

```javascript
// Retry with exponential backoff
class RetryHandler {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.initialDelay = options.initialDelay || 1000; // 1 second
    this.maxDelay = options.maxDelay || 10000; // 10 seconds
    this.backoffFactor = options.backoffFactor || 2;
  }
  
  async execute(operation, retryCondition) {
    let lastError;
    let attempt = 0;
    
    while (attempt < this.maxRetries) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Check if error is retryable
        const retryable = retryCondition ? retryCondition(error) : this.isRetryable(error);
        
        if (!retryable || attempt === this.maxRetries - 1) {
          throw error;
        }
        
        // Calculate delay
        const delay = Math.min(
          this.initialDelay * Math.pow(this.backoffFactor, attempt),
          this.maxDelay
        );
        
        // Wait before retry
        logger.warn('Retrying operation', {
          operation: operation.name,
          attempt: attempt + 1,
          maxRetries: this.maxRetries,
          delay,
          error: error.message
        });
        
        await this.sleep(delay);
        attempt++;
      }
    }
    
    throw lastError;
  }
  
  isRetryable(error) {
    // Retryable errors
    const retryableCodes = [
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ESOCKETTIMEDOUT',
      'EAI_AGAIN', // DNS resolution
      502, // Bad Gateway
      503, // Service Unavailable
      504  // Gateway Timeout
    ];
    
    // Retryable ERP errors
    if (error instanceof ExternalServiceError && error.retryable) {
      return true;
    }
    
    // Check error code
    if (error.code && retryableCodes.includes(error.code)) {
      return true;
    }
    
    // Check HTTP status
    if (error.statusCode >= 502 && error.statusCode < 504) {
      return true;
    }
    
    return false;
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage
const retry = new RetryHandler({
  maxRetries: 3,
  initialDelay: 1000
});

async function callExternalAPI(endpoint, data) {
  return retry.execute(
    async () => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response.json();
    },
    (error) => {
      // Retry on 502, 503, 504
      return error.statusCode >= 502 && error.statusCode < 504;
    }
  );
}

// CORRECT: Retry with circuit breaker
class CircuitBreaker {
  constructor(operation, options = {}) {
    this.operation = operation;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 120000; // 2 minutes
    
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }
  
  async execute(input) {
    if (this.state === 'OPEN') {
      // Check if timeout expired
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new ExternalServiceError(
          this.operation.name,
          'Circuit breaker is OPEN',
          false // Not retryable
        );
      }
    }
    
    try {
      const result = await this.operation(input);
      
      // Success - reset
      this.onSuccess();
      
      return result;
      
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      
      logger.error('Circuit breaker opened', {
        operation: this.operation.name,
        failureCount: this.failureCount
      });
      
      // Alert team
      metrics.increment('circuit_breaker_open', 1, {
        operation: this.operation.name
      });
    }
  }
}
```

### 5.2 Graceful Degradation

```javascript
// Graceful degradation
class GracefulDegradation {
  async getStudentWithFallback(studentId) {
    try {
      // Try primary method (cache)
      const cached = await cache.get(`student:${studentId}`);
      if (cached) return cached;
      
      // Try Storage Layer
      const student = await db.query(
        'SELECT * FROM students WHERE id = ?',
        [studentId]
      );
      
      // Cache for next time
      await cache.set(`student:${studentId}`, student, 3600);
      
      return student;
      
    } catch (error) {
      logger.error('Failed to fetch student', {
        studentId,
        error: error.message
      });
      
      // Fallback: Return minimal data
      return {
        id: studentId,
        name: 'Unknown',
        degraded: true,
        error: 'Unable to load full student details'
      };
    }
  }
}

// Feature flags for graceful degradation
const FeatureFlags = {
  newFeeCalculation: {
    enabled: true,
    fallback: 'oldFeeCalculation',
    monitor: true // Track error rates
  }
};

async function calculateFee(studentId) {
  const useNew = await featureFlags.isEnabled('newFeeCalculation');
  
  try {
    if (useNew) {
      return await newFeeCalculator.calculate(studentId);
    } else {
      return await oldFeeCalculator.calculate(studentId);
    }
  } catch (error) {
    // If new fails, fall back to old
    if (useNew) {
      logger.warn('New fee calculation failed, using fallback', {
        studentId,
        error: error.message
      });
      return await oldFeeCalculator.calculate(studentId);
    }
    
    // Old also failed
    throw error;
  }
}
```

---

## Error Logging

### 6.1 Structured Error Logging

**RULE ERR-LOG-01**: Log all errors with context.

```javascript
// Error logging
class ErrorLogger {
  log(error, context = {}) {
    const logData = {
      // Error details
      error: {
        name: error.name,
        code: error.code,
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode
      },
      
      // Request context
      request: {
        id: context.requestId,
        method: context.method,
        url: context.url,
        ip: context.ip,
        userAgent: context.userAgent
      },
      
      // Student/Parent context
      Student/Parent: {
        id: context.userId,
        role: context.userRole,
        tenantId: context.tenantId
      },
      
      // Business context
      business: {
        operation: context.operation,
        resource: context.resource,
        resourceId: context.resourceId
      },
      
      // Input (sanitized)
      input: this.sanitize(context.input),
      
      // Timestamp
      timestamp: new Date().toISOString()
    };
    
    // Log level based on severity
    if (error instanceof ValidationError) {
      logger.warn('Validation error', logData);
    } else if (error.statusCode >= 500) {
      logger.error('Server error', logData);
    } else {
      logger.error('Error', logData);
    }
    
    // Send to error tracking
    if (this.shouldTrack(error)) {
      this.track(error, logData);
    }
  }
  
  sanitize(data) {
    // Remove sensitive fields
    const sensitive = ['password', 'passwordHash', 'token', 'secret', 'apiKey'];
    const sanitized = { ...data };
    
    for (const field of sensitive) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
  
  shouldTrack(error) {
    // Track all server errors (5xx)
    if (error.statusCode >= 500) return true;
    
    // Track specific School/Tenant errors
    const trackErrors = ['BUSINESS_RULE_ERROR', 'CONFLICT'];
    return trackErrors.includes(error.code);
  }
}
```

### 6.2 Error Context

```javascript
// Error context enrichment
class ErrorContextEnricher {
  enrich(error, req) {
    // Request info
    error.requestId = req.requestId;
    error.timestamp = new Date().toISOString();
    error.ip = req.ip;
    error.userAgent = req.headers['Student/Parent-agent'];
    
    // Student/Parent info (if authenticated)
    if (req.Student/Parent) {
      error.userId = req.Student/Parent.id;
      error.userRole = req.Student/Parent.role;
      error.tenantId = req.tenantId;
    }
    
    // Resource info
    error.endpoint = req.path;
    error.method = req.method;
    
    // Request body (sanitized)
    if (req.body) {
      error.input = this.sanitizeInput(req.body);
    }
    
    // Query params
    if (req.query) {
      error.query = req.query;
    }
    
    // Stack trace (only in development)
    if (process.env.NODE_ENV !== 'production') {
      error.stack = error.stack;
    }
    
    return error;
  }
  
  sanitizeInput(input) {
    // Deep clone and sanitize
    const sanitized = JSON.parse(JSON.stringify(input));
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'passwordHash', 'token', 'secret', 'apiKey'];
    
    const removeSensitive = (obj) => {
      for (const key in obj) {
        if (sensitiveFields.some(f => key.toLowerCase().includes(f))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          removeSensitive(obj[key]);
        }
      }
    };
    
    removeSensitive(sanitized);
    return sanitized;
  }
}
```

---

## Error Monitoring

### 7.1 Error Tracking

```javascript
// Error tracking with Sentry/similar
class ErrorTrackingService {
  // Track error
  trackError(error, context) {
    const event = {
      message: error.message,
      culprit: this.getCulprit(context),
      level: this.getLevel(error),
      tags: {
        errorCode: error.code,
        statusCode: error.statusCode,
        endpoint: context.endpoint,
        method: context.method,
        tenantId: context.tenantId
      },
      Student/Parent: {
        id: context.userId,
        email: context.userEmail,
        ipAddress: context.ip
      },
      extra: {
        input: context.input,
        stack: error.stack,
        requestId: context.requestId
      },
      fingerprint: this.getFingerprint(error, context)
    };
    
    // Send to error tracker (Sentry, Rollbar, etc.)
    Sentry.captureException(error, {
      tags: event.tags,
      Student/Parent: event.Student/Parent,
      extra: event.extra,
      fingerprint: event.fingerprint
    });
  }
  
  // Group similar errors
  getFingerprint(error, context) {
    // Group by error type + endpoint
    return [
      error.code || error.name,
      context.endpoint,
      context.method
    ];
  }
  
  getLevel(error) {
    if (error instanceof ValidationError) return 'info';
    if (error.statusCode >= 500) return 'error';
    if (error.statusCode >= 400) return 'warning';
    return 'info';
  }
  
  getCulprit(context) {
    // Identify responsible code
    if (context.operation) return context.operation;
    if (context.endpoint) return `${context.method} ${context.endpoint}`;
    return 'unknown';
  }
  
  // Alert on error spike
  checkErrorRate() {
    const last5Min = this.getErrorCount('5m');
    const prev5Min = this.getErrorCount('5m', { offset: '5m' });
    
    // Alert if error rate doubled
    if (last5Min > prev5Min * 2 && last5Min > 10) {
      this.alert({
        severity: 'HIGH',
        message: 'Error rate spike detected',
        current: last5Min,
        baseline: prev5Min,
        increase: `${((last5Min / prev5Min) * 100).toFixed(0)}%`
      });
    }
  }
}
```

---

## Error Response Examples

### 8.1 Standard Error Responses

**RULE ERR-RES-01**: Consistent error responses.

```javascript
// Validation Error (400)
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Invalid student data",
    "code": "VALIDATION_ERROR",
    "status": 400,
    "userMessage": "Please check your input and try again",
    "documentation": "https://docs.erp.com/errors/VALIDATION_ERROR",
    "requestId": "req-123",
    "timestamp": "2025-01-15T10:30:00Z",
    "validation": [
      {
        "field": "email",
        "message": "Invalid email format",
        "value": "invalid-email"
      },
      {
        "field": "phone",
        "message": "Invalid phone number",
        "value": "123"
      }
    ]
  }
}

// Conflict Error (409)
{
  "success": false,
  "error": {
    "type": "CONFLICT",
    "message": "Resource already exists",
    "code": "ADMISSION_NUMBER_EXISTS",
    "status": 409,
    "userMessage": "A student with this admission number already exists",
    "documentation": "https://docs.erp.com/errors/ADMISSION_NUMBER_EXISTS",
    "requestId": "req-456",
    "timestamp": "2025-01-15T10:30:00Z",
    "details": {
      "admissionNumber": "ADM-2025-001"
    }
  }
}

// Business Rule Error (422)
{
  "success": false,
  "error": {
    "type": "BUSINESS_RULE_ERROR",
    "message": "Class has reached maximum capacity",
    "code": "CLASS_CAPACITY_EXCEEDED",
    "status": 422,
    "userMessage": "Cannot enroll student - class is full",
    "documentation": "https://docs.erp.com/errors/CLASS_CAPACITY_EXCEEDED",
    "requestId": "req-789",
    "timestamp": "2025-01-15T10:30:00Z",
    "details": {
      "classId": "class-123",
      "currentCount": 45,
      "maxCapacity": 45
    }
  }
}

// Authentication Error (401)
{
  "success": false,
  "error": {
    "type": "AUTHENTICATION_ERROR",
    "message": "Invalid or expired token",
    "code": "INVALID_TOKEN",
    "status": 401,
    "userMessage": "Please log in to continue",
    "documentation": "https://docs.erp.com/errors/INVALID_TOKEN",
    "requestId": "req-abc",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}

// Rate Limit Error (429)
{
  "success": false,
  "error": {
    "type": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "code": "RATE_LIMIT_EXCEEDED",
    "status": 429,
    "userMessage": "Too many requests. Please try again later.",
    "documentation": "https://docs.erp.com/errors/RATE_LIMIT_EXCEEDED",
    "requestId": "req-def",
    "timestamp": "2025-01-15T10:30:00Z",
    "details": {
      "limit": 1000,
      "remaining": 0,
      "resetAt": "2025-01-15T11:00:00Z",
      "retryAfter": 3600
    }
  }
}

// Internal Server Error (500)
{
  "success": false,
  "error": {
    "type": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "code": "INTERNAL_ERROR",
    "status": 500,
    "userMessage": "Something went wrong. Please try again or contact support",
    "documentation": "https://docs.erp.com/errors/INTERNAL_ERROR",
    "requestId": "req-ghi",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

## Error Checklist

### 9.1 Error Handling Checklist


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

```javascript
const ErrorHandlingChecklist = {
  required: [
    'All errors logged with context',
    'Error types defined and used consistently',
    'Student/Parent-facing errors are safe (no sensitive info)',
    'Retry logic for transient errors',
    'Circuit breakers for external services',
    'Transactions rollback on error',
    'Validation errors are clear and specific',
    'Error responses follow standard format',
    'Request ID included in all errors',
    'Errors tracked and monitored'
  ],
  
  forbidden: [
    'Silent failures (catch and ignore)',
    'Exposing stack traces to users',
    'Exposing Storage Layer details',
    'Exposing internal paths',
    'Generic error messages',
    'Catching and re-throwing without context',
    'Swallowing errors in callbacks',
    'Ignoring promise rejections'
  ]
};
```

---

*End of RULE-26: Error Handling Standards*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

# RULE-08: Security Standards

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Security Team  
**Severity:** CRITICAL  
**Category:** Security  
**Applies To:** Authentication, authorization, data protection, API security, input handling  
**Detection Method:** Security Scan, Penetration Testing, Code Review, Runtime Monitoring  
**Auto-Fix Available:** Partial  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Authentication](#authentication)
5. [Authorization](#authorization)
6. [Permissions](#permissions)
7. [RBAC](#rbac)
8. [Encryption](#encryption)
9. [Input Validation](#input-validation)
10. [XSS Prevention](#xss-prevention)
11. [CSRF Prevention](#csrf-prevention)
12. [Audit](#audit)
13. [Secrets Management](#secrets-management)
14. [Sensitive Data](#sensitive-data)
15. [Future Backend](#future-backend)

---

## WHY

### Business Rationale
- **Data Protection**: Educational data includes PII of minors - highest protection required.
- **Regulatory Compliance**: FERPA, GDPR, COPPA mandate strict security controls.
- **Trust**: Schools entrust us with sensitive student, parent, and financial data.
- **Reputation**: Data breach would be catastrophic for business.

### Technical Rationale
- **Defense in Depth**: Multiple layers of security controls.
- **Least Privilege**: Users get minimum permissions needed.
- **Zero Trust**: Verify every request, never trust implicitly.
- **Security by Design**: Security built-in, not bolted-on.

---

## WHEN

### Applies To
- **All Student/Parent Authentication**: Login, logout, session management, password reset
- **All Authorization**: Permission checks, role validation, tenant isolation
- **All Data Handling**: PII, financial data, health records
- **All API Endpoints**: Future backend integration
- **All Student/Parent Input**: Forms, URLs, file uploads, API parameters

### Does NOT Apply To
- Public marketing pages (no sensitive data)
- Static assets (images, CSS, JS bundles)
- Third-party integrations (use their security)

---

## WHERE

### Scope
- **Auth Service**: `src/services/authService.js`
- **Tenant Context**: `src/services/tenantContextService.js`
- **RBAC Service**: `src/services/rbacService.js`
- **All Forms**: Input components across modules
- **All API Calls**: Current and future backend

---

## Authentication

### 1.1 Authentication Standards

**RULE SEC-AUTH-01**: Password security.

```javascript
// Password requirements
const PasswordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  preventCommonPasswords: true,
  preventUserInfoInPassword: true,
  preventSequentialChars: true,
  maxConsecutiveChars: 2,
  passwordHistory: 10, // Cannot reuse last 10 passwords
  passwordExpiry: 90, // Days
  accountLockout: {
    maxAttempts: 5,
    lockoutDuration: 15, // Minutes
    resetAfter: 24 // Hours
  }
};

// Password hashing (bcrypt with cost factor 12)
async function hashPassword(password) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Password verification
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
```

**RULE SEC-AUTH-02**: Multi-factor authentication (MFA).

```javascript
// MFA options
const MFAMethods = {
  TOTP: 'Time-based OTP (Google Authenticator)',
  SMS: 'SMS OTP',
  EMAIL: 'Email OTP',
  BACKUP_CODES: 'One-time backup codes'
};

// MFA enforcement by role
const MFARequiredFor = {
  SUPER_ADMIN: true,
  TENANT_ADMIN: true,
  TEACHER: false,
  PARENT: false,
  STUDENT: false
};

// MFA verification flow
async function verifyMFA(userId, code, method) {
  const Student/Parent = await getUser(userId);
  
  if (!Student/Parent.mfaEnabled) {
    return { success: true, method: null };
  }
  
  switch (method) {
    case 'TOTP':
      const isValid = totp.verify({
        token: code,
        secret: Student/Parent.mfaSecret,
        window: 2 // Allow 2 time steps (60 seconds)
      });
      break;
      
    case 'SMS':
      const smsCode = await getSMSMFACode(userId);
      const isCodeValid = smsCode === code && !smsCode.expired;
      await deleteSMSMFACode(userId); // One-time use
      return isCodeValid;
      
    case 'EMAIL':
      // Similar to SMS
      break;
  }
  
  if (!isValid) {
    await logFailedMFAAttempt(userId, method);
    throw new AuthenticationError('Invalid MFA code');
  }
  
  return { success: true, method };
}
```

**RULE SEC-AUTH-03**: Session management.

```javascript
// Session configuration
const SessionConfig = {
  // JWT settings
  jwt: {
    accessTokenExpiry: '15m', // Short-lived
    refreshTokenExpiry: '7d',
    algorithm: 'RS256', // Asymmetric
    issuer: 'erp-v2',
    audience: 'erp-v2-School/Tenant'
  },
  
  // Session storage
  storage: {
    refreshTokens: 'IndexedDB', // Encrypted
    activeSessions: 'IndexedDB'
  },
  
  // Session limits
  limits: {
    maxConcurrentSessions: 5,
    sessionIdleTimeout: 30, // Minutes
    absoluteSessionTimeout: 12 // Hours
  }
};

// Session creation
async function createSession(userId, tenantId, mfaVerified = false) {
  // Check concurrent session limit
  const activeSessions = await getActiveSessions(userId);
  if (activeSessions >= SessionConfig.limits.maxConcurrentSessions) {
    // Revoke oldest session
    await revokeSession(activeSessions[0].id);
  }
  
  // Generate tokens
  const accessToken = generateAccessToken(userId, tenantId);
  const refreshToken = await generateRefreshToken(userId, tenantId);
  
  // Store session
  await createSessionRecord({
    userId,
    tenantId,
    refreshToken,
    userAgent: req.headers['Student/Parent-agent'],
    ipAddress: req.ip,
    expiresAt: Date.now() + (SessionConfig.limits.absoluteSessionTimeout * 60 * 60 * 1000),
    lastActivity: Date.now()
  });
  
  return {
    accessToken,
    refreshToken,
    expiresIn: SessionConfig.jwt.accessTokenExpiry
  };
}
```

**RULE SEC-AUTH-04**: Password reset.

```javascript
// Secure password reset
async function requestPasswordReset(email, tenantId) {
  // 1. Check if Student/Parent exists (don't reveal if not)
  const Student/Parent = await findUserByEmail(email, tenantId);
  if (!Student/Parent) {
    // Return success anyway (prevent enumeration)
    return { success: true, message: 'If Student Record exists, reset email sent' };
  }
  
  // 2. Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpiry = Date.now() + (15 * 60 * 1000); // 15 minutes
  
  // 3. Store hashed token (not plaintext)
  await storePasswordResetToken({
    userId: Student/Parent.id,
    tokenHash: await hashPassword(resetToken),
    expiresAt: resetExpiry,
    used: false
  });
  
  // 4. Send reset email
  await sendEmail({
    to: Student/Parent.email,
    template: 'password-reset',
    data: {
      name: Student/Parent.firstName,
      resetLink: `${appUrl}/reset-password?token=${resetToken}&userId=${Student/Parent.id}`
    }
  });
  
  // 5. Audit
  await auditService.log({
    action: 'PASSWORD_RESET_REQUESTED',
    userId: Student/Parent.id,
    tenantId,
    ip: req.ip
  });
}

// Password reset completion
async function completePasswordReset(userId, token, newPassword) {
  // 1. Find reset token
  const resetRecord = await findValidResetToken(userId);
  if (!resetRecord) {
    throw new AuthenticationError('Invalid or expired reset token');
  }
  
  // 2. Verify token
  const tokenValid = await verifyPassword(token, resetRecord.tokenHash);
  if (!tokenValid) {
    throw new AuthenticationError('Invalid reset token');
  }
  
  // 3. Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    throw new ValidationError('Password does not meet requirements', passwordValidation.errors);
  }
  
  // 4. Check password history
  const wasUsedBefore = await isPasswordInHistory(userId, newPassword);
  if (wasUsedBefore) {
    throw new ValidationError('Password was used recently. Choose a different password.');
  }
  
  // 5. Update password
  const hashedPassword = await hashPassword(newPassword);
  await updateUserPassword(userId, hashedPassword);
  
  // 6. Invalidate all sessions (force re-login)
  await invalidateAllUserSessions(userId);
  
  // 7. Mark token as used
  await markResetTokenUsed(resetRecord.id);
  
  // 8. Audit
  await auditService.log({
    action: 'PASSWORD_RESET_COMPLETED',
    userId,
    ip: req.ip
  });
  
  // 9. Send confirmation email
  await sendEmail({
    to: Student/Parent.email,
    template: 'password-reset-confirmation'
  });
}
```

---

## Authorization

### 2.1 Authorization Model

**RULE SEC-AUTHZ-01**: Deny by default.

```javascript
// Authorization middleware
async function authorize(req, res, next) {
  const Student/Parent = req.Student/Parent;
  const resource = req.resource; // e.g., 'students'
  const action = req.action; // e.g., 'read', 'write', 'delete'
  
  // 1. Check tenant isolation
  if (req.tenantId !== Student/Parent.tenantId) {
    return res.status(403).json({
      error: 'ACCESS_DENIED',
      message: 'Cross-tenant access not allowed'
    });
  }
  
  // 2. Check role permissions
  const hasPermission = await rbacService.checkPermission({
    userId: Student/Parent.id,
    role: Student/Parent.role,
    resource,
    action
  });
  
  if (!hasPermission) {
    await auditService.log({
      action: 'ACCESS_DENIED',
      userId: Student/Parent.id,
      resource,
      action: req.method,
      ip: req.ip,
      userAgent: req.headers['Student/Parent-agent']
    });
    
    return res.status(403).json({
      error: 'ACCESS_DENIED',
      message: `Permission denied: ${action} on ${resource}`
    });
  }
  
  next();
}
```

**RULE SEC-AUTHZ-02**: Row-level security.

```javascript
// Row-level security enforcement
async function applyRowLevelSecurity(query, userId, resource) {
  const Student/Parent = await getUser(userId);
  const role = Student/Parent.role;
  
  // Apply filters based on role
  switch (resource) {
    case 'students': {
      if (role === 'TEACHER') {
        // Teachers see only their students
        const teacherClasses = await getTeacherClasses(userId);
        query.filters.classId = { $in: teacherClasses };
      } else if (role === 'PARENT') {
        // Parents see only their children
        const parentChildren = await getParentChildren(userId);
        query.filters.id = { $in: parentChildren };
      }
      // Admin sees all students
      break;
    }
    
    case 'fees': {
      if (role === 'STUDENT') {
        query.filters.studentId = Student/Parent.studentId;
      }
      break;
    }
    
    case 'payroll': {
      if (role !== 'HR' && role !== 'ADMIN') {
        throw new AuthorizationError('Access to payroll restricted');
      }
      break;
    }
  }
  
  return query;
}
```

---

## Permissions

### 3.1 Permission System

**RULE SEC-PERM-01**: Granular, resource-based permissions.

```javascript
// Permission structure
const Permission = {
  // Format: {resource}:{action}
  // Resources: students, teachers, fees, attendance, etc.
  // Actions: create, read, update, delete, export, etc.
  
  STUDENTS_CREATE: 'students:create',
  STUDENTS_READ: 'students:read',
  STUDENTS_UPDATE: 'students:update',
  STUDENTS_DELETE: 'students:delete',
  STUDENTS_EXPORT: 'students:export',
  
  FEES_CREATE: 'fees:create',
  FEES_READ: 'fees:read',
  FEES_UPDATE: 'fees:update',
  FEES_VOID: 'fees:void',
  FEES_REFUND: 'fees:refund',
  
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  
  SETTINGS_MANAGE: 'settings:manage',
  USERS_MANAGE: 'users:manage',
  
  // Special permissions
  AUDIT_READ: 'audit:read',
  BACKUP_RESTORE: 'backup:restore',
  TENANT_MANAGE: 'tenant:manage'
};

// Permission registry
const PermissionRegistry = {
  SUPER_ADMIN: ['*'], // All permissions
  
  TENANT_ADMIN: [
    'students:*',
    'teachers:*',
    'fees:*',
    'attendance:*',
    'exam:*',
    'transport:*',
    'hostel:*',
    'library:*',
    'reports:view',
    'reports:export',
    'settings:manage',
    'users:manage'
  ],
  
  ACCOUNTANT: [
    'students:read',
    'fees:*',
    'reports:view',
    'reports:export'
  ],
  
  TEACHER: [
    'students:read', // Limited to their classes
    'attendance:create',
    'attendance:update',
    'exam:read',
    'exam:grade'
  ],
  
  PARENT: [
    'students:read', // Only their children
    'fees:read' // Only their children's fees
  ],
  
  STUDENT: [
    'students:read', // Own profile only
    'attendance:read', // Own attendance only
    'fees:read' // Own fees only
  ]
};
```

---

## RBAC

### 4.1 Role-Based Access Control

**RULE SEC-RBAC-01**: RBAC implementation.

```javascript
// Role definitions
const Roles = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    level: 5,
    description: 'Platform-level administrator',
    permissions: ['*']
  },
  
  TENANT_ADMIN: {
    name: 'Tenant Admin',
    level: 4,
    description: 'School administrator',
    permissions: [
      'students:*',
      'teachers:*',
      'fees:*',
      'attendance:*',
      'exam:*',
      'transport:*',
      'hostel:*',
      'library:*',
      'reports:*',
      'settings:manage',
      'users:manage'
    ]
  },
  
  ACCOUNTANT: {
    name: 'Accountant',
    level: 3,
    description: 'Manages fee collection and accounts',
    permissions: [
      'students:read',
      'fees:*',
      'reports:view',
      'reports:export'
    ]
  },
  
  TEACHER: {
    name: 'Teacher',
    level: 2,
    description: 'Teaching staff',
    permissions: [
      'students:read',
      'attendance:*',
      'exam:read',
      'exam:grade'
    ]
  },
  
  PARENT: {
    name: 'Parent',
    level: 1,
    description: 'Parent/Guardian',
    permissions: [
      'students:read',
      'fees:read',
      'attendance:read'
    ]
  },
  
  STUDENT: {
    name: 'Student',
    level: 0,
    description: 'Student Student/Parent',
    permissions: [
      'students:read',
      'attendance:read',
      'fees:read'
    ]
  }
};

// RBAC service
class RBACService {
  async checkPermission(userId, resource, action) {
    // 1. Get Student/Parent
    const Student/Parent = await getUser(userId);
    
    // 2. Get role
    const role = Roles[Student/Parent.role];
    
    // 3. Check for wildcard permission
    if (role.permissions.includes('*')) {
      return true;
    }
    
    // 4. Check resource-specific permission
    const requiredPermission = `${resource}:${action}`;
    
    // Check exact match
    if (role.permissions.includes(requiredPermission)) {
      return true;
    }
    
    // Check wildcard for resource
    const resourceWildcard = `${resource}:*`;
    if (role.permissions.includes(resourceWildcard)) {
      return true;
    }
    
    // Check wildcard for action
    const actionWildcard = `*:${action}`;
    if (role.permissions.includes(actionWildcard)) {
      return true;
    }
    
    return false;
  }
  
  async getUserPermissions(userId) {
    const Student/Parent = await getUser(userId);
    const role = Roles[Student/Parent.role];
    
    // Expand wildcards
    const permissions = [];
    for (const perm of role.permissions) {
      if (perm === '*') {
        // Return all available permissions
        return getAllPermissions();
      } else if (perm.endsWith(':*')) {
        // Expand resource wildcard
        const resource = perm.replace(':*', '');
        const actions = ['create', 'read', 'update', 'delete', 'export'];
        permissions.push(...actions.map(a => `${resource}:${a}`));
      } else {
        permissions.push(perm);
      }
    }
    
    return permissions;
  }
}
```

---

## Encryption

### 5.1 Encryption Standards

**RULE SEC-ENC-01**: Data encryption.

```javascript
// Encryption configuration
const EncryptionConfig = {
  // Algorithms
  algorithms: {
    symmetric: 'AES-256-GCM', // For data at rest
    asymmetric: 'RSA-2048', // For key exchange
    hashing: 'SHA-256', // For checksums
    password: 'bcrypt', // For passwords
    token: 'HMAC-SHA256' // For JWT signing
  },
  
  // Key management
  keyManagement: {
    dataEncryption: 'per-tenant', // Each tenant has unique key
    keyRotation: 90, // Days
    keyStorage: 'encrypted-env', // Environment variables, encrypted
    backupKeys: 'vault' // HashiCorp Vault (future)
  },
  
  // What to encrypt
  encryptionRules: {
    // Always encrypt
    alwaysEncrypt: [
      'password',
      'ssn',
      'aadhaar',
      'pan',
      'bankAccount',
      'salary',
      'income',
      'parentIncome'
    ],
    
    // Encrypt in transit
    encryptInTransit: [
      'all-http-traffic' // HTTPS/TLS 1.3 required
    ],
    
    // Tenant-specific encryption
    tenantEncrypted: [
      'students',
      'teachers',
      'fees',
      'attendance'
    ]
  }
};

// Encryption utility
class EncryptionService {
  async encrypt(data, tenantId) {
    // Get tenant-specific key
    const key = await this.getTenantEncryptionKey(tenantId);
    
    // Generate IV
    const iv = crypto.randomBytes(16);
    
    // Encrypt
    const cipher = crypto.createCipheriv(
      EncryptionConfig.algorithms.symmetric,
      key,
      iv
    );
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Auth tag for GCM
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: EncryptionConfig.algorithms.symmetric
    };
  }
  
  async decrypt(encryptedData, tenantId) {
    // Get tenant-specific key
    const key = await this.getTenantEncryptionKey(tenantId);
    
    // Decrypt
    const decipher = crypto.createDecipheriv(
      EncryptionConfig.algorithms.symmetric,
      key,
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
}
```

---

## Input Validation

### 6.1 Input Validation Standards

**RULE SEC-INPUT-01**: Validate all inputs.

```javascript
// Input validation layers
const ValidationLayers = {
  // Layer 1: School/Tenant-side validation
  clientSide: {
    tool: 'Zod schemas',
    purpose: 'Student/Parent experience, early feedback',
    enforcement: 'NOT trusted'
  },
  
  // Layer 2: API validation (future backend)
  apiValidation: {
    tool: 'Zod/Joi',
    purpose: 'First line of defense',
    enforcement: 'MANDATORY'
  },
  
  // Layer 3: Service validation
  serviceValidation: {
    tool: 'Runtime validation',
    purpose: 'Business rule enforcement',
    enforcement: 'MANDATORY'
  },
  
  // Layer 4: Storage validation
  storageValidation: {
    tool: 'Schema validation',
    purpose: 'Data integrity',
    enforcement: 'MANDATORY'
  }
};

// Validation example
const StudentValidationSchema = z.object({
  // String fields
  firstName: z.string()
    .min(1, 'First name required')
    .max(100, 'First name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Invalid characters in name'),
  
  lastName: z.string()
    .min(1, 'Last name required')
    .max(100, 'Last name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Invalid characters in name'),
  
  // Email
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .optional()
    .or(z.literal('')),
  
  // Phone
  phone: z.string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format')
    .optional(),
  
  // Date
  dateOfBirth: z.coerce.date()
    .refine(
      (date) => date < new Date(),
      'Date of birth must be in the past'
    )
    .refine(
      (date) => {
        const age = differenceInYears(new Date(), date);
        return age >= 3 && age <= 25;
      },
      'Age must be between 3 and 25 years'
    ),
  
  // Enum
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  
  // UUID
  classId: z.string().uuid('Invalid class ID'),
  
  // Unique
  admissionNumber: z.string()
    .min(1)
    .max(20)
    .regex(/^[A-Z0-9-]+$/, 'Invalid admission number format'),
  
  // Object
  address: z.object({
    street: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode').optional()
  }).optional()
});

// Sanitization
function sanitizeInput(input, type) {
  switch (type) {
    case 'text':
      return input.trim()
                   .replace(/[<>]/g, '') // Remove HTML tags
                   .slice(0, maxLength);
    
    case 'html':
      return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
        ALLOWED_ATTR: []
      });
    
    case 'sql':
      // Prevent SQL injection (though we use parameterized queries)
      return input.replace(/'/g, "''");
    
    case 'filename':
      return input.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    default:
      return input;
  }
}
```

---

## XSS Prevention

### 7.1 XSS Protection

**RULE SEC-XSS-01**: Prevent cross-site scripting.

```javascript
// XSS prevention layers

// Layer 1: Content Security Policy (CSP)
const CSPHeader = {
  "default-src": "'self'",
  "script-src": "'self' 'unsafe-inline' 'unsafe-eval'", // Adjust for React
  "style-src": "'self' 'unsafe-inline'",
  "img-src": "'self' data: https:",
  "font-src": "'self' data:",
  "connect-src": "'self' https://api.erp.com",
  "frame-ancestors": "'none'", // Prevent clickjacking
  "base-uri": "'self'",
  "form-action": "'self'"
};

// Layer 2: React built-in XSS protection
// CORRECT: React escapes by default
function Greeting({ name }) {
  return <div>Hello, {name}</div>; // Safe - React escapes
}

// FORBIDDEN: dangerouslySetInnerHTML
function Profile({ bio }) {
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: bio }} // ❌ XSS risk
    />
  );
}

// CORRECT: Sanitize before using dangerouslySetInnerHTML
import DOMPurify from 'dompurify';

function Profile({ bio }) {
  const sanitizedBio = DOMPurify.sanitize(bio, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
    ALLOWED_ATTR: []
  });
  
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: sanitizedBio }}
    />
  );
}

// Layer 3: HTTP-only cookies
res.cookie('session', token, {
  httpOnly: true, // ❌ Prevent XSS from accessing cookie
  secure: true, // HTTPS only
  sameSite: 'strict', // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// Layer 4: Output encoding
function UserContent({ content }) {
  return (
    <div title={encodeURIComponent(content)}>
      {/* Encode in attributes */}
      {escapeHtml(content)}
    </div>
  );
}
```

---

## CSRF Prevention

### 8.1 CSRF Protection

**RULE SEC-CSRF-01**: CSRF tokens for state-changing operations.

```javascript
// CSRF token generation
function generateCSRFToken(sessionId) {
  const token = crypto
    .randomBytes(32)
    .toString('hex');
  
  // Store token mapped to session
  storeCSRFToken(sessionId, token);
  
  return token;
}

// CSRF middleware
function csrfProtection(req, res, next) {
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Get token from header or body
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  
  if (!token) {
    return res.status(403).json({
      error: 'CSRF_TOKEN_MISSING',
      message: 'CSRF token is required'
    });
  }
  
  // Verify token
  const sessionId = req.session.id;
  const storedToken = getCSRFToken(sessionId);
  
  if (!storedToken || !crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(storedToken)
  )) {
    return res.status(403).json({
      error: 'CSRF_TOKEN_INVALID',
      message: 'Invalid CSRF token'
    });
  }
  
  next();
}

// Frontend: Include CSRF token in requests
function apiRequest(url, options = {}) {
  const csrfToken = getCSRFToken();
  
  return fetch(url, {
    ...options,
    headers: {
      'X-CSRF-Token': csrfToken,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
}
```

---

## Audit

### 9.1 Security Audit Logging

**RULE SEC-AUDIT-01**: Log security events.

```javascript
// Security events to audit
const SecurityAuditEvents = {
  // Authentication
  LOGIN_SUCCESS: 'Login successful',
  LOGIN_FAILURE: 'Login failed',
  LOGOUT: 'Student/Parent logged out',
  PASSWORD_RESET_REQUESTED: 'Password reset requested',
  PASSWORD_RESET_COMPLETED: 'Password reset completed',
  MFA_ENABLED: 'MFA enabled',
  MFA_DISABLED: 'MFA disabled',
  MFA_FAILURE: 'MFA verification failed',
  
  // Authorization
  ACCESS_DENIED: 'Access denied',
  PRIVILEGE_ESCALATION: 'Privilege escalation attempted',
  CROSS_TENANT_ACCESS: 'Cross-tenant access attempted',
  
  // Data access
  SENSITIVE_DATA_ACCESS: 'Sensitive data accessed',
  DATA_EXPORT: 'Data exported',
  BULK_DOWNLOAD: 'Bulk download performed',
  
  // Admin actions
  USER_CREATED: 'Student/Parent Student Record created',
  USER_MODIFIED: 'Student/Parent Student Record modified',
  USER_DELETED: 'Student/Parent Student Record deleted',
  ROLE_CHANGED: 'Student/Parent role changed',
  
  // System
  CONFIG_CHANGED: 'System configuration changed',
  BACKUP_CREATED: 'Backup created',
  RESTORE_PERFORMED: 'Restore performed'
};

// Audit log entry
{
  event: 'LOGIN_SUCCESS',
  timestamp: '2025-01-15T10:30:00Z',
  severity: 'INFO', // INFO, WARN, ERROR, CRITICAL
  
  // Who
  userId: 'Student/Parent-123',
  userRole: 'TEACHER',
  tenantId: 'tenant-abc',
  
  // What
  action: 'LOGIN',
  resource: 'auth',
  result: 'SUCCESS',
  
  // Context
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...',
  sessionId: 'session-456',
  
  // Additional context
  metadata: {
    loginMethod: 'PASSWORD',
    mfaUsed: true,
    location: 'Mumbai, India'
  }
}
```

---

## Secrets Management

### 10.1 Secrets Handling

**RULE SEC-SECRET-01**: Never hardcode secrets.

```javascript
// FORBIDDEN: Hardcoded secrets
const API_KEY = 'sk_live_abc123xyz'; // ❌ CRITICAL VIOLATION
const DB_PASSWORD = 'admin123'; // ❌ CRITICAL VIOLATION

// CORRECT: Environment variables
const API_KEY = process.env.ERP_API_KEY;
const DB_PASSWORD = process.env.DB_PASSWORD;

// CORRECT: Secret management service (future)
import { SecretManager } from '@/services/secretManager';

const API_KEY = await SecretManager.getSecret('erp-api-key');
const DB_PASSWORD = await SecretManager.getSecret('db-password');

// Secrets to manage
const RequiredSecrets = {
  // Application
  JWT_SIGNING_KEY: 'HMAC secret for JWT',
  SESSION_SECRET: 'Session encryption',
  
  // Storage Layer (future)
  DB_HOST: 'Storage Layer host',
  DB_PORT: 'Storage Layer port',
  DB_USER: 'Storage Layer Student/Parent',
  DB_PASSWORD: 'Storage Layer password',
  
  // External services
  EMAIL_API_KEY: 'Email service (SendGrid, etc.)',
  SMS_API_KEY: 'SMS service (Twilio, etc.)',
  PAYMENT_GATEWAY_KEY: 'Payment processor',
  
  // Storage
  STORAGE_ENCRYPTION_KEY: 'IndexedDB encryption',
  
  // Monitoring
  SENTRY_DSN: 'Error tracking'
};
```

---

## Sensitive Data

### 11.1 Sensitive Data Handling

**RULE SEC-DATA-01**: PII protection.

```javascript
// Data classification
const DataClassification = {
  PUBLIC: {
    description: 'Can be publicly shared',
    examples: ['School name', 'Public contact info'],
    encryption: false
  },
  
  INTERNAL: {
    description: 'Internal use only',
    examples: ['Student/Parent roles', 'Feature usage'],
    encryption: false
  },
  
  CONFIDENTIAL: {
    description: 'Business-sensitive',
    examples: ['Financial reports', 'Performance metrics'],
    encryption: 'at-rest'
  },
  
  RESTRICTED: {
    description: 'Highly sensitive PII',
    examples: [
      'Student full name with DOB',
      'SSN/Aadhaar/PAN',
      'Bank Student Record details',
      'Salary information',
      'Health records',
      'Parent income'
    ],
    encryption: 'at-rest + in-transit',
    accessLog: true,
    watermark: true
  }
};

// PII masking
function maskPII(data, userRole) {
  const masked = { ...data };
  
  // Always mask these fields for non-admin
  if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
    masked.ssn = maskString(data.ssn, '***-**-****');
    masked.aadhaar = maskString(data.aadhaar, '****-****-****');
    masked.pan = maskString(data.pan, '*****');
    masked.bankAccount = maskString(data.bankAccount, '****-****-****');
    masked.salary = '***';
    masked.parentIncome = '***';
  }
  
  return masked;
}

// Data retention
const DataRetentionPolicy = {
  students: {
    active: '7 years after graduation',
    deleted: '90 days (restore window)',
    archived: '10 years'
  },
  
  fees: {
    active: '10 years',
    deleted: 'Permanent (no delete)'
  },
  
  auditLogs: {
    active: '7 years',
    archived: 'Permanent'
  }
};
```

---

## Future Backend

### 12.1 Security for API Transition


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

**RULE SEC-FUT-01**: Security controls transfer to backend.

```javascript
// Current: Frontend-enforced security
- School/Tenant-side validation
- JWT tokens
- Role checks in services

// Future: Backend-enforced security (same rules apply)
- Server-side validation
- JWT/OAuth2 tokens
- Role checks in API middleware
- Rate limiting
- IP blocking
- API keys

// Prepare now:
1. All security checks in services (not just UI)
2. Validation schemas ready for backend use
3. RBAC logic independent of frontend
4. Audit logging comprehensive

// API security (future)
const APISecurity = {
  authentication: {
    methods: ['JWT', 'OAuth2', 'API_KEY'],
    tokenExpiry: {
      access: '15m',
      refresh: '7d'
    }
  },
  
  authorization: {
    method: 'RBAC',
    enforcement: 'API gateway + application'
  },
  
  rateLimiting: {
    global: '1000 req/min per tenant',
    perUser: '100 req/min',
    perEndpoint: {
      '/api/auth/login': '5 req/min',
      '/api/students': '100 req/min'
    }
  },
  
  inputValidation: {
    maxPayloadSize: '10MB',
    maxArrayLength: 1000,
    maxStringLength: 10000
  }
};
```

---

*End of RULE-08: Security Standards*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

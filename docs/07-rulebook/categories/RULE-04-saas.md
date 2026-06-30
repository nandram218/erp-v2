# RULE-04: SaaS Multi-Tenant Architecture

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team SaaS Architecture Team  
**Severity:** CRITICAL  
**Category:** Core  
**Applies To:** All multi-tenant functionality, tenant isolation, data segregation  
**Detection Method:** Architecture Tests, Runtime Validation, Integration Tests  
**Auto-Fix Available:** No  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Tenant Isolation](#tenant-isolation)
5. [School Context](#school-context)
6. [Tenant Bootstrap](#tenant-bootstrap)
7. [Tenant Storage](#tenant-storage)
8. [Tenant Cache](#tenant-cache)
9. [Tenant Backup](#tenant-backup)
10. [Tenant Restore](#tenant-restore)
11. [Tenant Migration](#tenant-migration)
12. [Tenant Branding](#tenant-branding)
13. [Tenant Settings](#tenant-settings)
14. [Tenant Security](#tenant-security)
15. [Tenant Validation](#tenant-validation)
16. [Tenant Switching](#tenant-switching)
17. [Cross Tenant Detection](#cross-tenant-detection)

---

## WHY

### Business Rationale
- **Data Sovereignty**: Each school (tenant) owns its data. No school can access another school's data.
- **Regulatory Compliance**: Educational data is heavily regulated (FERPA, GDPR, etc.) requiring strict isolation.
- **Brand Identity**: Each school needs custom branding (logos, colors, themes).
- **Scalability**: Multi-tenant architecture allows serving 100+ schools with single codebase.
- **Cost Efficiency**: Shared infrastructure reduces per-school cost.

### Technical Rationale
- **Security**: Tenant isolation prevents data leakage between schools.
- **Customization**: Each tenant can have different settings, features, and integrations.
- **Performance**: Tenant-scoped queries are faster and use indexes effectively.
- **Maintainability**: Single codebase serves all tenants, reducing maintenance burden.
- **Disaster Recovery**: Per-tenant backup and restore capability.

---

## WHEN

### Applies To
- **All Data Operations**: Every CRUD operation must be tenant-scoped.
- **Authentication**: Login determines tenant context.
- **Authorization**: Permissions are tenant-specific.
- **Configuration**: Settings are per-tenant.
- **Branding**: UI themes are per-tenant.
- **Billing**: Invoicing and payments are per-tenant.

### Does NOT Apply To
- Global platform settings (app version, default configurations)
- System-wide audit logs (aggregated across tenants)
- Super-admin operations (platform management)

---

## WHERE

### Scope
- **Tenant Context Service**: `src/services/tenantContextService.js`
- **Storage Service**: `src/services/storageService.js` (tenant isolation)
- **Auth Service**: `src/services/authService.js` (tenant login)
- **UI Components**: `src/components/`, `src/layouts/` (tenant branding)
- **Settings**: `src/master-setting/`, `src/config/`

---

## Tenant Isolation

### 1.1 Tenant Isolation Mandate

**RULE SAAS-ISO-01**: Every data operation MUST include tenantId.

```
ISOLATION MODEL:

┌─────────────────────────────────────────────┐
│           SaaS Application                   │
│  ┌─────────────┐  ┌─────────────┐          │
│  │   Tenant A  │  │   Tenant B  │  ...     │
│  │  (School 1) │  │  (School 2) │          │
│  └─────────────┘  └─────────────┘          │
│        ↓                 ↓                  │
│  ┌─────────────────────────────────────┐   │
│  │      Storage Service (Isolated)      │   │
│  │  tenantId injected at service level  │   │
│  └─────────────────────────────────────┘   │
│                 ↓                           │
│  ┌─────────────────────────────────────┐   │
│  │      IndexedDB (Per-Tenant DB)       │   │
│  │  erp-tenant-a (isolated)             │   │
│  │  erp-tenant-b (isolated)             │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**RULE SAAS-ISO-02**: No cross-tenant queries allowed.

```javascript
// CORRECT: Tenant-scoped query
await storageService.find({
  collection: 'students',
  tenantId: currentTenant.id,
  filters: { classId: 'class-123' }
});

// FORBIDDEN: Cross-tenant query
await storageService.find({
  collection: 'students',
  // Missing tenantId - could return students from ALL tenants!
  filters: { classId: 'class-123' }
});

// FORBIDDEN: Explicit cross-tenant access
await storageService.find({
  collection: 'students',
  tenantId: 'tenant-b', // Accessing another tenant!
  filters: { classId: 'class-123' }
});
```

**RULE SAAS-ISO-03**: Storage enforces tenant isolation automatically.

```javascript
// StorageService automatically injects tenantId
export class StorageService {
  async find(collection, options = {}) {
    // Automatically add tenantId if not present
    if (!options.tenantId) {
      const currentTenant = this.tenantContext.getCurrentTenant();
      if (currentTenant) {
        options.tenantId = currentTenant.id;
      }
    }
    
    // Add tenant filter to all queries
    const query = {
      ...options.filters,
      tenantId: options.tenantId
    };
    
    // Execute query
    return this.executeQuery(collection, { ...options, filters: query });
  }
}
```

**RULE SAAS-ISO-04**: Cross-tenant access requires super-admin privileges.

```javascript
// Super-admin can access cross-tenant data
if (currentUser.hasRole('SUPER_ADMIN')) {
  const allStudents = await storageService.find({
    collection: 'students',
    // Super-admin can query without tenant filter
    bypassTenantIsolation: true,
    filters: { classId: 'class-123' }
  });
}
```

---

## School Context

### 2.1 School (Tenant) Model

```javascript
// Tenant/School schema
{
  id: 'tenant-abc-123',
  name: 'ABC Public School',
  code: 'ABCPS', // Unique school code
  type: 'PRIVATE', // PUBLIC, PRIVATE, GOVERNMENT, INTERNATIONAL
  affiliation: 'CBSE',
  establishedYear: 1995,
  address: {
    street: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    country: 'India'
  },
  contact: {
    phone: '+91-22-12345678',
    email: 'info@abcps.edu',
    website: 'https://abcps.edu'
  },
  admin: {
    name: 'Principal Name',
    email: 'principal@abcps.edu',
    phone: '+91-98-76543210'
  },
  settings: {
    academicYear: '2024-2025',
    currentTerm: 'SECOND',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  },
  branding: {
    logo: 'base64... or URL',
    primaryColor: '#1a5490',
    secondaryColor: '#f39c12',
    accentColor: '#27ae60',
    fontFamily: 'Roboto'
  },
  features: {
    enableTransport: true,
    enableHostel: true,
    enableLibrary: true,
    enableOnlinePayments: true,
    enableSMSNotifications: true,
    enableEmailNotifications: true,
    enableBiometric: false
  },
  limits: {
    maxStudents: 5000,
    maxTeachers: 200,
    maxStaff: 100,
    storageQuota: 10737418240, // 10GB
    apiCallsPerDay: 100000
  },
  status: 'ACTIVE', // ACTIVE, SUSPENDED, TRIAL, ARCHIVED
  subscription: {
    plan: 'ENTERPRISE',
    startDate: '2024-01-01',
    endDate: '2025-01-01',
    autoRenew: true,
    paymentMethod: 'CREDIT_CARD'
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
  createdBy: 'platform-admin-123'
}
```

### 2.2 Tenant Identification

```javascript
// Tenant can be identified by:
// 1. Subdomain: tenant-abc.erp.com
// 2. Path: erp.com/tenant-abc
// 3. Header: X-Tenant-ID (for API)
// 4. Token claims (JWT)

// Tenant resolution flow
function resolveTenant(request) {
  // Priority Fee Transaction:
  // 1. JWT token (authenticated Student/Parent)
  // 2. X-Tenant-ID header (API)
  // 3. Subdomain (web)
  // 4. URL path (web)
  
  if (request.Student/Parent && request.Student/Parent.tenantId) {
    return request.Student/Parent.tenantId;
  }
  
  if (request.headers['X-Tenant-ID']) {
    return request.headers['X-Tenant-ID'];
  }
  
  const subdomain = extractSubdomain(request.hostname);
  if (subdomain) {
    return subdomain;
  }
  
  const path = extractTenantFromPath(request.path);
  if (path) {
    return path;
  }
  
  throw new Error('Unable to resolve tenant');
}
```

---

## Tenant Bootstrap

### 3.1 Tenant Onboarding Flow

```javascript
// Step 1: Tenant registration
async function registerTenant(tenantData) {
  // Create tenant record
  const tenant = await storageService.insert({
    collection: 'tenants',
    data: {
      ...tenantData,
      id: generateTenantId(tenantData.code),
      status: 'TRIAL',
      createdAt: new Date().toISOString()
    }
  });
  
  // Step 2: Initialize tenant Storage Layer
  await initializeTenantDatabase(tenant.id);
  
  // Step 3: Create default admin Student/Parent
  await createTenantAdmin(tenant.id, tenantData.admin);
  
  // Step 4: Load default settings
  await loadDefaultSettings(tenant.id);
  
  // Step 5: Initialize default data
  await initializeDefaultData(tenant.id);
  
  // Step 6: Create subscription
  await createSubscription(tenant.id, tenantData.plan);
  
  // Step 7: Send welcome email
  await sendWelcomeEmail(tenant);
  
  return tenant;
}

// Step 2: Initialize tenant Storage Layer
async function initializeTenantDatabase(tenantId) {
  // Create tenant-specific IndexedDB
  await storageService.createTenantDatabase(tenantId);
  
  // Create collections
  const collections = [
    'students', 'teachers', 'staff', 'classes', 'subjects',
    'fees', 'attendance', 'exams', 'results', 'transport',
    'hostel', 'library', 'inventory', 'payroll', 'settings'
  ];
  
  for (const collection of collections) {
    await storageService.createCollection({
      tenantId,
      name: collection,
      schema: getCollectionSchema(collection)
    });
  }
  
  // Create indexes
  await createDefaultIndexes(tenantId);
}

// Step 3: Create default admin
async function createTenantAdmin(tenantId, adminData) {
  const adminPassword = generateSecurePassword();
  
  await storageService.insert({
    collection: 'users',
    tenantId,
    data: {
      ...adminData,
      role: 'ADMIN',
      permissions: ['*'], // All permissions
      passwordHash: await hashPassword(adminPassword),
      mustChangePassword: true,
      emailVerified: false
    }
  });
  
  // Send credentials to admin
  await sendAdminCredentials(tenantId, adminData.email, adminPassword);
}

// Step 5: Initialize default data
async function initializeDefaultData(tenantId) {
  // Default fee structures
  await loadDefaultFeeStructures(tenantId);
  
  // Default classes
  await loadDefaultClasses(tenantId);
  
  // Default subjects
  await loadDefaultSubjects(tenantId);
  
  // Default roles and permissions
  await loadDefaultRoles(tenantId);
  
  // Default notification templates
  await loadDefaultNotificationTemplates(tenantId);
}
```

### 3.2 Tenant Lifecycle

```
TRIAL (14 days, limited features)
   ↓ [Upgrade]
ACTIVE (paid subscription)
   ↓ [Non-payment]
SUSPENDED (read-only, 30 days to pay)
   ↓ [Payment received]
ACTIVE
   ↓ [Request archive]
ARCHIVED (read-only, 1 year retention)
   ↓ [Retention expired]
DELETED (anonymized, irreversible)
```

---

## Tenant Storage

### 4.1 Per-Tenant Storage Layer Architecture

**RULE SAAS-STO-01**: Each tenant has isolated storage.

```
Storage Isolation Levels:

Level 1: Storage Layer per Tenant (Recommended)
  - erp-tenant-abc
  - erp-tenant-xyz
  - erp-tenant-123

Level 2: Schema per Tenant (Future)
  - erp_main
    - tenant_abc.students
    - tenant_abc.fees
    - tenant_xyz.students
    - tenant_xyz.fees

Level 3: Collection with tenantId (Current)
  - students (all tenants)
    - { tenantId: 'abc', ... }
    - { tenantId: 'xyz', ... }
  - MUST include tenantId in ALL queries
```

**RULE SAAS-STO-02**: Storage Layer naming convention.

```javascript
const tenantDatabaseName = {
  // Current: Single Storage Layer with tenantId in records
  singleDb: 'erp-v2',
  
  // Future: Per-tenant databases
  multiDb: `erp-${tenantId}`,
  
  // Backup naming
  backup: `erp-${tenantId}-backup-${date}`,
  
  // Historical archive
  archive: `erp-${tenantId}-archive-${year}`
};
```

**RULE SAAS-STO-03**: Storage quotas enforced per-tenant.

```javascript
async function checkStorageQuota(tenantId) {
  const tenant = await getTenant(tenantId);
  const used = await calculateTenantStorageUsage(tenantId);
  const quota = tenant.limits.storageQuota;
  
  if (used >= quota) {
    throw new QuotaExceededError(
      `Storage quota exceeded. Used: ${formatBytes(used)}, Limit: ${formatBytes(quota)}`,
      { used, quota, tenantId }
    );
  }
  
  // Warn at 80%
  if (used >= quota * 0.8) {
    await notifyTenantAdmin(tenantId, 'storage_quota_warning', {
      used: formatBytes(used),
      quota: formatBytes(quota),
      percentage: Math.round((used / quota) * 100)
    });
  }
}
```

---

## Tenant Cache

### 5.1 Tenant-Scoped Caching

**RULE SAAS-CACHE-01**: All cache keys include tenantId.

```javascript
// Cache key pattern
const cacheKey = `${collection}:${query}:tenant:${tenantId}:${hash}`;

// Examples
const studentCacheKey = `students:class:cls-123:tenant:${tenantId}:abc123`;
const settingsCacheKey = `settings:tenant:${tenantId}:xyz789`;
const dashboardCacheKey = `dashboard:stats:tenant:${tenantId}:latest`;

// CORRECT: Tenant-scoped cache
await cacheService.set(
  `students:class:${classId}:tenant:${tenantId}`,
  students,
  { ttl: 300000 }
);

// FORBIDDEN: Missing tenantId in cache key
await cacheService.set(
  `students:class:${classId}`, // ❌ Missing tenantId
  students,
  { ttl: 300000 }
);
```

**RULE SAAS-CACHE-02**: Cache invalidation is tenant-scoped.

```javascript
// Invalidate all caches for a tenant
await cacheService.invalidatePattern(`*:tenant:${tenantId}:*`);

// Invalidate specific collection for tenant
await cacheService.invalidatePattern(`students:*:tenant:${tenantId}:*`);
```

**RULE SAAS-CACHE-03**: Cache isolation prevents cross-tenant leaks.

```javascript
// Cache is partitioned by tenant
class TenantAwareCache {
  get(key) {
    const tenantId = this.tenantContext.getTenantId();
    const tenantKey = `tenant:${tenantId}:${key}`;
    return this.cache.get(tenantKey);
  }
  
  set(key, value, options) {
    const tenantId = this.tenantContext.getTenantId();
    const tenantKey = `tenant:${tenantId}:${key}`;
    return this.cache.set(tenantKey, value, options);
  }
}
```

---

## Tenant Backup

### 6.1 Tenant Backup Strategy

**RULE SAAS-BAK-01**: Each tenant backed up independently.

```javascript
async function backupTenant(tenantId, options = {}) {
  const tenant = await getTenant(tenantId);
  
  const backup = {
    id: generateBackupId(),
    tenantId,
    tenantName: tenant.name,
    timestamp: new Date().toISOString(),
    initiatedBy: options.initiatedBy,
    type: options.type || 'SCHEDULED', // SCHEDULED, MANUAL, PRE_MIGRATION
    collections: options.collections || ['*'], // All or specific
    encryption: {
      algorithm: 'AES-256-GCM',
      keyId: `tenant-${tenantId}-key`
    },
    compression: 'gzip',
    size: 0, // Calculated after backup
    checksum: '' // Calculated after backup
  };
  
  // Backup all tenant data
  const data = await storageService.exportTenant(tenantId, backup.collections);
  
  // Compress
  const compressed = await compress(data);
  
  // Encrypt
  const encrypted = await encrypt(compressed, tenantId);
  
  // Calculate checksum
  backup.checksum = await calculateChecksum(encrypted);
  backup.size = encrypted.length;
  
  // Store backup
  await storeBackup(tenantId, backup.id, encrypted);
  
  // Record backup metadata
  await recordBackupMetadata(backup);
  
  return backup;
}
```

**RULE SAAS-BAK-02**: Backup retention per-tenant.

| Tenant Plan | Daily Backup | Weekly Backup | Monthly Backup | Retention |
|-------------|-------------|---------------|----------------|-----------|
| TRIAL | Yes | Yes | No | 14 days |
| BASIC | Yes | Yes | Yes | 1 year |
| PREMIUM | Yes | Yes | Yes | 3 years |
| ENTERPRISE | Yes | Yes | Yes | 7 years |

**RULE SAAS-BAK-03**: Backup includes tenant configuration.

```javascript
const backupContents = {
  // Data collections
  data: {
    students, teachers, staff, classes, subjects,
    fees, attendance, exams, results, transport,
    hostel, library, inventory, payroll
  },
  
  // Tenant configuration
  configuration: {
    settings, branding, features, roles, permissions,
    notificationTemplates, feeStructures, classConfigs
  },
  
  // Metadata
  metadata: {
    tenant: tenantSnapshot,
    exportDate: new Date().toISOString(),
    erpVersion: '2.0.0',
    exportTool: 'erp-backup-tool'
  },
  
  // Analytics
  analytics: {
    dashboardStats, reports, customQueries
  }
};
```

---

## Tenant Restore

### 7.1 Tenant Restore Process

**RULE SAAS-REST-01**: Restore preserves tenant identity.

```javascript
async function restoreTenant(tenantId, backupId, options = {}) {
  const backup = await getBackup(tenantId, backupId);
  
  // Verify backup integrity
  const integrityCheck = await verifyBackupIntegrity(backup);
  if (!integrityCheck.valid) {
    throw new BackupError('Backup integrity check failed', { backupId });
  }
  
  // Confirm restore
  if (!options.skipConfirmation) {
    const confirmation = await getRestoreConfirmation(tenantId, backup);
    if (!confirmation.confirmed) {
      throw new RestoreError('Restore not confirmed');
    }
  }
  
  // Create restore point (safety snapshot)
  const restorePoint = await createSnapshot(tenantId, 'before-restore');
  
  try {
    // Clear current tenant data (optional)
    if (options.clearExisting) {
      await storageService.clearTenant(tenantId);
    }
    
    // Restore data
    await storageService.importTenant(tenantId, backup.data);
    
    // Restore configuration
    await restoreTenantConfiguration(tenantId, backup.configuration);
    
    // Rebuild indexes
    await rebuildTenantIndexes(tenantId);
    
    // Clear tenant cache
    await cacheService.invalidatePattern(`*:tenant:${tenantId}:*`);
    
    // Log restore
    await auditService.log({
      action: 'TENANT_RESTORE',
      tenantId,
      backupId,
      performedBy: options.performedBy,
      snapshotBefore: restorePoint.id,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: true,
      restoredAt: new Date().toISOString(),
      recordsRestored: backup.data.recordCount
    };
  } catch (error) {
    // Rollback to restore point on failure
    await restoreSnapshot(restorePoint.id);
    throw error;
  }
}
```

---

## Tenant Migration

### 8.1 Tenant Migration Strategy

**RULE SAAS-MIG-01**: Zero-downtime tenant migration.

```javascript
// Migration from one environment to another
async function migrateTenant(sourceTenantId, destination, options = {}) {
  // Step 1: Pre-migration checks
  await validateMigrationSource(sourceTenantId);
  await validateMigrationDestination(destination);
  
  // Step 2: Create migration snapshot
  const snapshot = await createSnapshot(sourceTenantId, 'pre-migration');
  
  // Step 3: Export from source
  const data = await exportTenantData(sourceTenantId);
  
  // Step 4: Transform data (if schema changed)
  if (options.schemaMigration) {
    data.transformed = await transformSchema(data.original, options.migrationScript);
  }
  
  // Step 5: Import to destination
  await importTenantData(destination.tenantId, data.transformed || data.original);
  
  // Step 6: Validate import
  const validation = await validateImportedData(destination.tenantId);
  
  if (!validation.success) {
    // Rollback
    throw new MigrationError('Validation failed', validation.errors);
  }
  
  // Step 7: Verify tenant in new environment
  await verifyTenantIntegrity(destination.tenantId);
  
  // Step 8: Update DNS/Domain
  if (options.updateDomain) {
    await updateTenantDomain(sourceTenantId, destination.domain);
  }
  
  // Step 9: Notify tenant
  await notifyTenantAdmin(sourceTenantId, 'migration_complete', {
    newDomain: destination.domain,
    downtime: '< 5 minutes'
  });
  
  return {
    success: true,
    migratedAt: new Date().toISOString()
  };
}
```

---

## Tenant Branding

### 9.1 Custom Branding Per Tenant

**RULE SAAS-BRAND-01**: UI respects tenant branding.

```javascript
// Tenant branding configuration
const tenantBranding = {
  tenantId: 'tenant-abc',
  
  // Visual Identity
  logo: {
    light: 'https://cdn.erp.com/tenants/abc/logo-light.png',
    dark: 'https://cdn.erp.com/tenants/abc/logo-dark.png',
    icon: 'https://cdn.erp.com/tenants/abc/logo-icon.png'
  },
  colors: {
    primary: '#1a5490',      // Primary brand color
    secondary: '#f39c12',    // Secondary color
    accent: '#27ae60',       // Accent color
    background: '#ffffff',   // Page background
    surface: '#f8f9fa',      // Card backgrounds
    text: {
      primary: '#212529',
      secondary: '#6c757d',
      inverted: '#ffffff'
    },
    status: {
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#17a2b8'
    }
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    headingFont: 'Montserrat, sans-serif',
    monospaceFont: 'Fira Code, monospace',
    baseFontSize: '16px',
    lineHeight: 1.5
  },
  
  // Customization
  customCSS: `
    .sidebar { background: ${primaryColor}; }
    .header { border-bottom: 3px solid ${accentColor}; }
  `,
  favicon: 'https://cdn.erp.com/tenants/abc/favicon.ico',
  
  // Login page customization
  loginPage: {
    backgroundImage: 'https://cdn.erp.com/tenants/abc/login-bg.jpg',
    welcomeMessage: 'Welcome to ABC Public School ERP',
    supportContact: 'support@abcps.edu'
  }
};

// Apply branding at app startup
function applyTenantBranding(branding) {
  const root = document.documentElement;
  
  // Apply colors
  root.style.setProperty('--color-primary', branding.colors.primary);
  root.style.setProperty('--color-secondary', branding.colors.secondary);
  root.style.setProperty('--color-accent', branding.colors.accent);
  
  // Apply fonts
  root.style.setProperty('--font-family', branding.typography.fontFamily);
  root.style.setProperty('--font-heading', branding.typography.headingFont);
  
  // Apply custom CSS
  if (branding.customCSS) {
    const style = document.createElement('style');
    style.textContent = branding.customCSS;
    document.head.appendChild(style);
  }
  
  // Update favicon
  if (branding.favicon) {
    const link = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = branding.favicon;
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = branding.favicon;
      document.head.appendChild(newLink);
    }
  }
}
```

---

## Tenant Settings

### 10.1 Hierarchical Settings

**RULE SAAS-SET-01**: Settings follow hierarchy.

```
Settings Hierarchy (highest to lowest priority):

1. Student/Parent Override (per-Student/Parent settings)
   ↓ overrides
2. Role Defaults (per-role settings)
   ↓ overrides
3. Tenant Settings (school-level)
   ↓ overrides
4. Module Defaults (application defaults)
   ↓ overrides
5. System Defaults (fallback)
```

```javascript
// Settings resolution
async function getSetting(settingKey, userId, tenantId) {
  // 1. Check Student/Parent override
  const userSetting = await storageService.findOne({
    collection: 'userSettings',
    tenantId,
    filters: { userId, key: settingKey }
  });
  if (userSetting) return userSetting.value;
  
  // 2. Check role defaults
  const Student/Parent = await getUser(userId);
  const roleSetting = await storageService.findOne({
    collection: 'roleSettings',
    tenantId,
    filters: { role: Student/Parent.role, key: settingKey }
  });
  if (roleSetting) return roleSetting.value;
  
  // 3. Check tenant settings
  const tenantSetting = await storageService.findOne({
    collection: 'tenantSettings',
    tenantId,
    filters: { key: settingKey }
  });
  if (tenantSetting) return tenantSetting.value;
  
  // 4. Check module defaults
  const moduleSetting = await getModuleDefault(settingKey);
  if (moduleSetting) return moduleSetting.value;
  
  // 5. System default
  return getSystemDefault(settingKey);
}
```

---

## Tenant Security

### 11.1 Tenant-Specific Security

**RULE SAAS-SEC-01**: Passwords and secrets are per-tenant encrypted.

```javascript
// Each tenant has unique encryption keys
const tenantEncryption = {
  dataEncryptionKey: `key:${tenantId}:data`, // AES-256 for PII
  passwordHashSalt: `salt:${tenantId}:password`, // bcrypt/argon2
  jwtSigningKey: `jwt:${tenantId}:signing`, // HMAC-SHA256
  backupEncryptionKey: `key:${tenantId}:backup` // AES-256 for backups
};

// Tenant isolation in authentication
async function authenticateUser(credentials) {
  // 1. Resolve tenant
  const tenantId = await resolveTenantFromCredentials(credentials);
  
  // 2. Get tenant-specific Student/Parent
  const Student/Parent = await storageService.findOne({
    collection: 'users',
    tenantId,
    filters: { email: credentials.email }
  });
  
  // 3. Verify password with tenant-specific salt
  const valid = await verifyPassword(
    credentials.password,
    Student/Parent.passwordHash,
    tenantEncryption.passwordHashSalt
  );
  
  if (!valid) {
    await logFailedLogin(tenantId, credentials.email);
    throw new UnauthorizedError('Invalid credentials');
  }
  
  // 4. Generate tenant-specific JWT
  const token = generateJWT({
    userId: Student/Parent.id,
    tenantId: Student/Parent.tenantId,
    role: Student/Parent.role
  }, tenantEncryption.jwtSigningKey);
  
  return { Student/Parent, token };
}
```

---

## Tenant Validation

### 12.1 Tenant Data Validation

**RULE SAAS-VAL-01**: All tenant data is tenant-scoped.

```javascript
// Validation middleware
function tenantValidationMiddleware(req, res, next) {
  const tenantId = req.tenantId;
  
  // Verify tenant exists and is active
  const tenant = getCurrentTenant();
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found' });
  }
  
  if (tenant.status !== 'ACTIVE') {
    return res.status(403).json({ 
      error: 'Tenant is not active',
      status: tenant.status,
      message: getTenantStatusMessage(tenant.status)
    });
  }
  
  next();
}
```

**RULE SAAS-VAL-02**: Tenant limits enforced.

```javascript
async function validateTenantLimits(tenantId, operation) {
  const tenant = await getTenant(tenantId);
  
  switch (operation.type) {
    case 'CREATE_STUDENT': {
      const count = await storageService.count({
        collection: 'students',
        tenantId
      });
      
      if (count >= tenant.limits.maxStudents) {
        throw new LimitExceededError(
          `Student limit reached (${tenant.limits.maxStudents}). Upgrade your plan.`,
          { limit: tenant.limits.maxStudents, current: count }
        );
      }
      break;
    }
    
    case 'API_CALL': {
      const dailyCalls = await getDailyApiCalls(tenantId);
      if (dailyCalls >= tenant.limits.apiCallsPerDay) {
        throw new RateLimitError('Daily API limit exceeded');
      }
      break;
    }
  }
}
```

---

## Tenant Switching

### 13.1 Super-Admin Multi-Tenant Access

**RULE SAAS-SWITCH-01**: Super-admin can switch tenant context.

```javascript
// Super-admin switches to tenant
async function switchTenantContext(superAdminId, targetTenantId) {
  // Verify super-admin permissions
  const admin = await getUser(superAdminId);
  if (!admin.hasRole('SUPER_ADMIN')) {
    throw new AuthorizationError('Only super-admin can switch tenants');
  }
  
  // Verify target tenant exists
  const tenant = await getTenant(targetTenantId);
  if (!tenant) {
    throw new NotFoundError('Tenant', targetTenantId);
  }
  
  // Log tenant switch
  await auditService.log({
    action: 'TENANT_CONTEXT_SWITCH',
    performedBy: superAdminId,
    fromTenant: getCurrentTenantId(),
    toTenant: targetTenantId,
    reason: 'Support request',
    timestamp: new Date().toISOString()
  });
  
  // Switch context
  return tenantContextService.setTenant(targetTenantId);
}
```

---

## Cross Tenant Detection

### 14.1 Cross-Tenant Access Prevention

**RULE SAAS-CROSS-01**: Detect and prevent cross-tenant data access.

```javascript
// Query analyzer - detects cross-tenant queries
class TenantIsolationEnforcer {
  validateQuery(query) {
    const violations = [];
    
    // Check 1: Missing tenantId
    if (!query.tenantId) {
      violations.push({
        rule: 'SAAS-ISO-01',
        severity: 'CRITICAL',
        message: 'Query missing tenantId'
      });
    }
    
    // Check 2: Tenant mismatch (if Student/Parent is from different tenant)
    if (query.tenantId && query.tenantId !== this.currentTenantId) {
      if (!this.currentUser.hasRole('SUPER_ADMIN')) {
        violations.push({
          rule: 'SAAS-ISO-02',
          severity: 'CRITICAL',
          message: `Cross-tenant access: Student/Parent from ${this.currentTenantId} 
                    trying to access ${query.tenantId}`,
          userId: this.currentUser.id,
          attemptedTenantId: query.tenantId
        });
      }
    }
    
    // Check 3: Bulk export without tenant filter
    if (query.collection === '*' && !query.tenantId) {
      violations.push({
        rule: 'SAAS-ISO-03',
        severity: 'CRITICAL',
        message: 'Bulk export without tenant filter'
      });
    }
    
    if (violations.length > 0) {
      throw new TenantIsolationViolationError(
        'Cross-tenant access detected',
        { violations }
      );
    }
  }
}

// Runtime interceptor
function tenantIsolationInterceptor(storageService) {
  const originalFind = storageService.find;
  
  storageService.find = async function(collection, options) {
    // Enforce tenant isolation
    isolationEnforcer.validateQuery({ collection, ...options });
    
    return originalFind.call(this, collection, options);
  };
}
```

---

## Tenant Testing

### 15.1 Multi-Tenant Testing

**RULE SAAS-TEST-01**: Test cross-tenant isolation.

```javascript
describe('Tenant Isolation', () => {
  let tenantA;
  let tenantB;
  let userA;
  let userB;
  
  beforeEach(async () => {
    // Create two tenants
    tenantA = await createTenant({ code: 'TENANT_A' });
    tenantB = await createTenant({ code: 'TENANT_B' });
    
    // Create users for each tenant
    userA = await createUser({ tenantId: tenantA.id });
    userB = await createUser({ tenantId: tenantB.id });
  });
  
  it('should not allow tenant A to access tenant B data', async () => {
    // Tenant A creates a student
    const studentA = await createStudent(tenantA.id, {
      name: 'Student A'
    });
    
    // Try to access as tenant B
    await expect(
      storageService.findOne({
        collection: 'students',
        tenantId: tenantB.id,
        id: studentA.id
      })
    ).rejects.toThrow(NotFoundError);
  });
  
  it('should return different data for same query on different tenants', async () => {
    // Create student in both tenants with same name
    await createStudent(tenantA.id, { name: 'John Doe' });
    await createStudent(tenantB.id, { name: 'John Doe' });
    
    // Query as tenant A
    const studentsA = await storageService.find({
      collection: 'students',
      tenantId: tenantA.id
    });
    
    // Query as tenant B
    const studentsB = await storageService.find({
      collection: 'students',
      tenantId: tenantB.id
    });
    
    // Should return different records
    expect(studentsA).not.toEqual(studentsB);
    expect(studentsA[0].tenantId).toBe(tenantA.id);
    expect(studentsB[0].tenantId).toBe(tenantB.id);
  });
});
```

---

## Tenant Audit

### 16.1 Tenant-Specific Auditing


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

**RULE SAAS-AUDIT-01**: All tenant actions audited.

```javascript
const tenantAuditEvents = [
  // Tenant lifecycle
  'TENANT_CREATED',
  'TENANT_UPDATED',
  'TENANT_SUSPENDED',
  'TENANT_ARCHIVED',
  'TENANT_DELETED',
  
  // Tenant settings
  'TENANT_SETTINGS_CHANGED',
  'TENANT_BRANDING_UPDATED',
  'TENANT_FEATURES_TOGGLED',
  
  // Tenant access
  'TENANT_LOGIN',
  'TENANT_LOGOUT',
  'TENANT_CONTEXT_SWITCH',
  'CROSS_TENANT_ACCESS_ATTEMPT',
  
  // Tenant data
  'TENANT_BACKUP_CREATED',
  'TENANT_BACKUP_RESTORED',
  'TENANT_MIGRATED',
  'TENANT_DATA_EXPORTED'
];

// Audit log entry
{
  event: 'TENANT_LOGIN',
  timestamp: '2025-01-15T10:30:00Z',
  tenantId: 'tenant-abc',
  userId: 'Student/Parent-123',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  success: true,
  metadata: {
    loginMethod: 'PASSWORD',
    mfaUsed: true,
    location: 'Mumbai, India'
  }
}
```

---

*End of RULE-04: SaaS Multi-Tenant Architecture*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

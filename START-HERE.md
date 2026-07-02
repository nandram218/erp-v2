# START-HERE.md
## AI Agent Entry Point - ERP-v2 Governance Phase-2

**READ THIS FIRST. This is the single authoritative entry point for all AI agents.**

---

## READ ORDER (Mandatory)

1. **This file** - Authority and constraints
2. `docs/contracts/*.contract.json` - Machine-readable contracts
3. `docs/FOUNDATION-BASELINE.md` - Foundation rules
4. `docs/05-locks/*.md` - Architecture locks
5. `src/core/contracts/validators.js` - Validation utilities
6. `src/core/contracts/guards.js` - Architecture guards
7. `src/core/serviceRegistry.js` - Service access patterns
8. `src/core/constants/storageKeys.js` - Storage key registry

---

## AUTHORITY ORDER

1. **Contracts** (`docs/contracts/*.json`) - Highest authority
2. **Locks** (`docs/05-locks/*.md`) - Architecture freezes
3. **Baseline** (`docs/FOUNDATION-BASELINE.md`) - Foundation rules
4. **Code** - Must comply with all above
5. **Documentation** - Lowest authority, never contradicts 1-4

---

## ALLOWED EDITS

- Additive changes only (new files, new functions, new constants)
- Bug fixes that preserve contract compliance
- Performance improvements
- Validation logic enhancements
- New contract files for new modules
- Test files

---

## FORBIDDEN EDITS

- **NEVER** modify frozen contracts without migration
- **NEVER** rename storage keys
- **NEVER** rename identifiers
- **NEVER** change service APIs
- **NEVER** break tenant isolation
- **NEVER** create duplicate constants
- **NEVER** access localStorage directly
- **NEVER** bypass ServiceRegistry
- **NEVER** modify frozen files without explicit lock removal
- **NEVER** create overlapping governance documents

---

## VALIDATION REQUIRED

Before ANY code change:

1. Validate storage keys via `validateStorageKey()`
2. Validate tenant context via `validateTenantContext()`
3. Validate identifiers via `validateIdentifier()`
4. Validate entities via `validateEntityShape()`
5. Check architecture guards via `assert*()` functions
6. Verify service registration via `validateServiceRegistration()`

---

## EXTENSION WORKFLOW

To add new functionality:

1. **Check contracts** - Does existing contract cover this?
2. **If yes** - Follow contract strictly
3. **If no** - Create new contract file in `docs/contracts/`
4. **Register services** - Use `registerService()` in ServiceRegistry
5. **Use validators** - Call validation functions before operations
6. **Use guards** - Assert architectural constraints
7. **No direct access** - Always use ServiceRegistry.getService()

---

## FILES TO READ BEFORE CODING

**Minimum required reading:**
- `START-HERE.md` (this file)
- `docs/contracts/storage.contract.json`
- `docs/contracts/tenant.contract.json`
- `docs/contracts/service.contract.json`
- Domain-specific contract for your module

**Before modifying any file:**
- Read its existing contract tags (`@CONTRACT`, `@LOCK`)
- Understand its dependencies
- Verify you won't break frozen contracts

---

## MODULE-SPECIFIC RULES

### Storage
- **ONLY** use `storageService.js`
- **NEVER** hardcode keys
- **ALWAYS** use constants from `storageKeys.js`
- **PREFIX**: `ERP_` for core, `SCHOOL_` for school data

### Identifiers
- **STUDENT_ID**: `STU-{YEAR}-{SEQUENCE}` (e.g., STU-2024-000001)
- **RECEIPT_NUMBER**: `ERP-R-{YEAR}-{SEQUENCE}` (e.g., ERP-R-2024-000001)
- **FEE_ID**: `FEE-{UUID}`
- **ROUTE_ID**: `ROUTE-{SEQUENCE}`

### Services
- **MUST** be registered in ServiceRegistry
- **MUST** be tenant-aware
- **MUST** validate tenant context on every access
- **NEVER** access services directly

### Tenant Isolation
- **EVERY** data operation must include tenant context
- **EVERY** storage key must include tenant prefix
- **NEVER** mix tenant data
- **ALWAYS** validate tenant context before operations

---

## ENFORCEMENT

These are not suggestions. These are enforceable rules:

1. **Code review** must verify contract compliance
2. **Validation functions** must be called before operations
3. **Architecture guards** must be active in production
4. **ServiceRegistry** blocks direct access in production
5. **Tenant validation** occurs on every service access
6. **Storage keys** are validated on every access

Violations will be caught at runtime in production.

---

## ADDING NEW MODULES

When adding Attendance, Exams, Library, Hostel, etc.:

1. Create `docs/contracts/{module}.contract.json`
2. Add storage keys to `docs/contracts/storage.contract.json`
3. Register services in `src/core/serviceRegistry.js`
4. Use validators from `src/core/contracts/validators.js`
5. Use guards from `src/core/contracts/guards.js`
6. **DO NOT** modify existing frozen contracts

---

## PRIORITY ORDER

When conflicts arise:

1. **Tenant Isolation** > All other concerns
2. **Contract Compliance** > Feature implementation
3. **Security** > Convenience
4. **Data Integrity** > Performance
5. **Additive Changes** > Breaking changes
6. **Documentation** > Assumptions

---

## GOT A QUESTION?

1. Check contracts first
2. Check locks second
3. Check baseline third
4. If still unclear, ASK before coding

**Assumptions are not allowed. Documentation is mandatory. Enforcement is automatic.**

---

**Last Updated**: Phase-2 Enforcement Layer  
**Status**: ACTIVE  
**Version**: 2.0.0
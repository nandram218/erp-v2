# PACK-02: Folder & File Ownership
> **ERP-v2 Knowledge Base v1.0 (Permanent)**
> सभी files का ownership — कौन किसे modify कर सकता है

---

## 1. Ownership Matrix

| Folder | Owner | Can Read | Can Write |
|--------|-------|----------|-----------|
| `src/modules/*/` | Module Owner | All | **Only their module** |
| `src/services/` | Service Registry | All | **Only assigned service** |
| `src/master-setting/*/` | Parent Module Owner | All | **Same as parent module** |
| `src/store/` | Store Owner | All | **Only store/slices** |
| `src/core/` | Core Owner | All | **Only core utilities** |
| `src/layouts/` | UI Framework Owner | All | **Only layout files** |
| `src/config/` | Config Owner | All | **Only config owners** |

## 2. Service Registry

`src/services/` मे file के specific ownership:

| File | Owner Module | Responsibility |
|------|--------------|----------------|
| `studentService.js` | students | Student CRUD |
| `feeSettingsService.js` | fees | Fee configuration |
| `transportService.js` | transport | Transport settings |
| `hostelService.js` | hostel | Hostel settings |
| `classSubjectService.js` | classes-subjects | Class & subject setup |
| `storageService.js` | **IO Layer** (shared) | LocalStorage / API abstraction |
| `snapshotService.js` | **Core** | Year-end snapshots |
| `authService.js` | **Auth** | Authentication |
| `tenantContextService.js` | **SaaS Core** | Tenant resolution |
| `contextService.js` | **Core** | App context |

## 3. master-setting Ownership

`src/master-setting/` का rule:

> **जो module की `src/modules/X/` है, वही `src/master-setting/X/` का owner है**

Example:
- `src/modules/fees/` → owns `src/master-setting/fees/`
- `src/modules/transport/` → owns `src/master-setting/transport/`

## 4. Prohibited Actions

| Action | Penalty |
|--------|---------|
| Module A writing in Module B folder | ❌ FORBIDDEN |
| Module A calling Module B service directly | ❌ FORBIDDEN (use service registry) |
| Modifying other module's master-setting | ❌ FORBIDDEN |
| Hardcoding tenant filters | ❌ FORBIDDEN (use tenantContextService) |

## 5. New Module Checklist

Creating new module `{name}`:

- [ ] `src/modules/{name}/` — Create with owner
- [ ] `06-modules/module-{name}.md` — Document
- [ ] `03-audits/audit-{name}-module.md` — Audit
- [ ] Own master-setting (if applicable)
- [ ] Add services to Service Registry
- [ ] Update TAG_INDEX.md
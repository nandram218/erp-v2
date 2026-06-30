# PACK-06: Module Rules
> **ERP-v2 Knowledge Base v1.0 (Permanent)**
> कैसे module बनाएं, divide करें, और manage करें

---

## 1. Module Structure

```
src/modules/{module-name}/
├── components/       # Reusable UI components
├── pages/           # Route-level pages
├── services/        # Module-specific service (optional)
├── utils/           # Module-specific helpers
├── styles/          # Module-specific styles
└── certificates/    # Module-specific certificates (if applicable)
```

## 2. Module Responsibilities

| Module | Owns | Cannot Touch |
|--------|------|--------------|
| students | Student CRUD, certificates, ID cards | Fee calculations |
| fees | Receipts, fee structures, normalizer | Student profile (read-only) |
| transport | Routes, vehicles, stops, students transport | Hostel rooms |
| hostel | Rooms, allocations, wardens | Transport routes |
| attendance | Daily attendance records | Fee rules |

## 3. Cross-Module Communication Rules

```javascript
// ❌ FORBIDDEN: Direct module import
import { calculateFee } from '../fees/feesCalculator';

// ✅ CORRECT: Via service registry
import { getFeeForStudent } from '../../services/feeSettingsService';

// ❌ FORBIDDEN: Direct storage access
localStorage.getItem('students');

// ✅ CORRECT: Via storageService
storageService.get('students', { schoolId });
```

## 4. Module Independence

Each module must:
- [ ] Work independently (can be tree-shaken)
- [ ] Export a `registerXxxModule(app)` function
- [ ] Declare its storage keys in service registry
- [ ] Have an `audit-{module}-module.md` entry

## 5. New Module Approval Process

1. Create `06-modules/module-{name}.md`
2. Create `03-audits/audit-{name}-module.md`
3. Get ADR approved in `04-decisions/`
4. Lock file ownership in `05-locks/`
5. Implement with module template
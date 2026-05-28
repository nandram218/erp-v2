# ERP-v2 FINAL LOCK WORKFLOW
Version: FINAL LOCK v1
Branch Base: saas-refactor-v1
Editor Stack: Windsurf + VS Code + Git
Architecture Goal: SaaS ERP + Multi School + Production Ready

---

# FINAL CORE GOAL

Build ERP-v2 into a:

- SaaS-ready ERP
- Multi-school architecture
- Centralized storage system
- Clean dependency system
- Fully modular frontend
- Backend-connected architecture
- Production deployable system
- Stable scalable codebase
- Zero duplicate logic
- Controlled replace-safe architecture
- Dependency-safe refactor workflow

WITHOUT:
- breaking UI
- random refactors
- duplicate services
- hidden storage keys
- uncontrolled imports
- scattered logic
- unsafe replacements

---

# FINAL LOCK RULES (PERMANENT)

These rules apply to:

- ChatGPT
- Windsurf
- Cursor
- Future AI agents
- All future chats
- All future updates
- All future refactors

UNTIL ERP PROJECT COMPLETION.

---

# ABSOLUTE DEVELOPMENT RULES

## RULE 1 — NEVER RANDOMLY MODIFY

Before editing ANY file:

- trace dependencies
- check imports
- check exports
- check state usage
- check storage usage
- check routing usage
- check connected modules
- check UI impact
- check services impact

NO blind replace.

---

## RULE 2 — SAFE REPLACE STRATEGY

Use:

### FULL FILE REPLACE ONLY WHEN:
- architecture mismatch exists
- dependency chain is deeply connected
- file logic is fragmented
- duplicate patterns exist
- entire module requires cleanup

### PARTIAL CHANGES ONLY WHEN:
- isolated fix
- UI text change
- tiny bug
- single function patch
- no dependency chain risk

---

## RULE 3 — CENTRALIZED STORAGE ONLY

ALL storage must go through:

services/storageService.js

NEVER:
- direct localStorage access
- hardcoded storage keys
- duplicated storage logic

ALL keys must come from:

core/constants/storageKeys.js

---

## RULE 4 — SaaS-FIRST ARCHITECTURE

Every future feature MUST support:

- schoolId
- branchId
- sessionId
- tenant isolation
- scalable DB migration
- API-ready structure

No single-school assumptions allowed.

---

## RULE 5 — MODULE BOUNDARY DISCIPLINE

UI Layer:
components/pages only

Business Logic:
services/

Global State:
store/

Constants:
core/constants/

NO mixed responsibilities.

---

## RULE 6 — DEPENDENCY TRACE REQUIRED

Before replacing:
- identify dependent files
- identify import chain
- identify affected UI
- identify affected services
- identify affected storage
- identify affected routes

ALL connected effects must be corrected together.

---

## RULE 7 — NO DUPLICATE SERVICES

Only ONE source of truth allowed for:
- storage
- auth
- fees
- students
- subjects
- school profile
- transport

No parallel logic systems.

---

## RULE 8 — UI SAFETY

Refactor must NOT:
- break layouts
- break routing
- break forms
- break tables
- break state
- break responsiveness

UI stability is mandatory.

---

## RULE 9 — BACKEND READY STRUCTURE

Frontend must always remain:
- API-ready
- backend-connectable
- auth-ready
- RBAC-ready
- deploy-ready

Never tightly bind frontend to localStorage permanently.

---

## RULE 10 — GIT SAFETY

Before major changes:
- git status
- commit
- push

Every stable stage:
MUST become rollback point.

---

# DEVELOPMENT PHASE ORDER (LOCKED)

---

# PHASE 1 — FOUNDATION STABILIZATION

## STATUS
IN PROGRESS

## GOALS

- eliminate storage fragmentation
- eliminate direct localStorage usage
- centralize constants
- centralize services
- stabilize routes
- stabilize store hydration
- stabilize module boundaries

## TARGET FILES

- storageService.js
- storageKeys.js
- schoolStore.js
- App.js
- AppRoutes.jsx
- studentService.js
- subjectSettingsService.js
- classSubjectService.js

---

# PHASE 2 — DEPENDENCY CLEANUP

## GOALS

- dependency-safe imports
- remove hidden coupling
- standardize service usage
- standardize module structure
- stabilize shared utilities

---

# PHASE 3 — AUTH + SaaS CORE

## GOALS

- tenant auth system
- RBAC permissions
- session management
- protected routes
- organization model
- branch model

---

# PHASE 4 — BACKEND FOUNDATION

## GOALS

Backend stack setup:
- Node.js
- Express
- PostgreSQL/MySQL
- Prisma/Sequelize
- JWT auth
- tenant middleware
- API architecture

---

# PHASE 5 — API MIGRATION

## GOALS

- convert services from localStorage to API
- maintain backward compatibility
- preserve frontend UI

---

# PHASE 6 — MODULE HARDENING

Modules:
- Students
- Fees
- Transport
- Exams
- Staff
- Hostel
- Certificates

Each module:
- dependency audited
- storage audited
- API ready
- SaaS ready

---

# PHASE 7 — DEPLOYMENT READY

## GOALS

- production env
- build optimization
- deployment configs
- DB migrations
- tenant setup flow
- backup system
- monitoring
- logs

---

# WINDSURF USAGE RULES

Windsurf must:

- analyze before edit
- explain dependency impact
- avoid blind replace
- avoid partial dangerous edits
- trace affected files
- identify hidden coupling
- mention indexing limitations honestly

Windsurf should NEVER:
- randomly create architecture
- duplicate services
- bypass storageService
- hardcode keys
- create parallel state systems

---

# SAFE EDIT WORKFLOW

STEP 1:
Analyze target file

STEP 2:
Trace dependencies

STEP 3:
Classify:
- isolated fix
OR
- architecture-level replace

STEP 4:
Apply safest strategy

STEP 5:
Verify:
- imports
- exports
- routes
- state
- storage
- UI

STEP 6:
git commit

STEP 7:
git push

---

# CURRENT STABLE CHECKPOINT

Branch:
saas-refactor-v1

Stable Commit:
0ee17a4

Checkpoint Meaning:
- SaaS refactor base stabilized
- storage centralization started
- modular structure improved
- dependency cleanup started
- rollback safe

---

# IMPORTANT FINAL LOCK

No future development should:
- bypass SaaS architecture
- bypass dependency tracing
- bypass centralized storage
- bypass module boundaries
- bypass rollback checkpoints

This lock remains active until ERP-v2 reaches production deployment.
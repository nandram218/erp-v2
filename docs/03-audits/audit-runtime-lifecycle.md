# audit-runtime-lifecycle
> Runtime lifecycle and initialization order audit

Findings:
- App loads in src/App.js
- Routes are defined in DashboardLayout
- Stores initialized before services

Gaps:
- No documented boot sequence
- Missing pre-flight checks for tenant/school readiness

Action items:
- [ ] Document initialization order in architecture-current-reality.md
- [ ] Add pre-flight check for storageService availability
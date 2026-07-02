# authority-locks
> Who can write, approve, and review per area (see also architecture-authority-matrix.md)

**PRIMARY SOURCE:** [FOUNDATION-BASELINE.md](../FOUNDATION-BASELINE.md)
**Status:** Redirected to baseline

All authority contracts are now documented in FOUNDATION-BASELINE.md.

**Quick Reference:**
- Service authority map: Section 7.3 (PERMANENT)
- Write permissions: Section 7.3 (various classifications)
- Approval requirements: Section 29 (PERMANENT)

---

### Write (Owner)
- students: students module owner
- fees: fees module owner
- transport: transport module owner
- hostel: hostel module owner
- attendance: attendance module owner
- services: service registry owner
- settings (master-setting): same as parent module

### Approve (Lead only for cross-cutting changes)
- Any change touching > 1 module
- Any ADR (ADR-0003+)
- Lock file changes

### Review (Any senior dev)
- UI changes
- Bug fixes within 1 module
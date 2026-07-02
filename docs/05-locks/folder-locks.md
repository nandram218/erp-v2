# folder-locks
> File placement locks (see also PACK-02)

**PRIMARY SOURCE:** [FOUNDATION-BASELINE.md](../FOUNDATION-BASELINE.md)
**Status:** Redirected to baseline

All folder structure contracts are now documented in FOUNDATION-BASELINE.md.

**Quick Reference:**
- Folder structure: Section 10 (PERMANENT)
- Module boundaries: Section 18.2 (PERMANENT)
- File ownership: Section 10 (PERMANENT)

---

## Locked
- Module folder: `src/modules/[moduleName]/`
- Master-setting ownership: `src/master-setting/[moduleName]/` owned by same module
- Shared services: `src/services/`
- Global state: `src/store/`
- Core utilities: `src/core/`
- Layouts: `src/layouts/`
- Config: `src/config/`

## Forbidden placements
- Putting module A UI inside module B folder
- Storing module-specific data in another module's master-setting
- Shared business logic inside a module (must go to services/)

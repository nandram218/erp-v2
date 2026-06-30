# folder-locks
> File placement locks (see also PACK-02)

## Locked
- Module folder: `src/modules/{moduleName}/`
- Master-setting ownership: `src/master-setting/{moduleName}/` owned by same module
- Shared services: `src/services/`
- Global state: `src/store/`
- Core utilities: `src/core/`
- Layouts: `src/layouts/`
- Config: `src/config/`

## Forbidden placements
- Putting module A UI inside module B folder
- Storing module-specific data in another module's master-setting
- Shared business logic inside a module (must go to services/)
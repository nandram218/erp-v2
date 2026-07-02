# naming-locks
> Variable, function, and file naming rules

**PRIMARY SOURCE:** [FOUNDATION-BASELINE.md](../FOUNDATION-BASELINE.md)
**Status:** Redirected to baseline

All naming standards are now documented in FOUNDATION-BASELINE.md.

**Quick Reference:**
- Naming standards: Section 16 (PERMANENT)
- Storage key names: Section 16.1 (PERMANENT)
- Service names: Section 16.2 (PERMANENT)
- Registry keys: Section 16.3 (PERMANENT)
- Variable names: Section 16.4 (PERMANENT)
- Function names: Section 16.5 (PERMANENT)

---

## Locked conventions
- Service files: `{domain}Service.js`
- Page files: `{Domain}Page.jsx`
- Component files: `{Domain}{Component}.jsx`
- Utility files: `{domain}Helpers.js`
- Constants files: `{domain}Constants.js`

## Rules
- Use PascalCase for React components
- Use camelCase for functions/variables
- Use UPPER_SNAKE_CASE for constants
- Prefix test files: `{name}.test.js`

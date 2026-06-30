# architecture-current-reality
> Current as-built architecture state (maps to existing codebase)

---

## Active Services

- `storageService.js` (localStorage + API stub)
- `authService.js`
- `tenantContextService.js`
- `studentService.js`
- `feeSettingsService.js`
- `transportService.js`
- `schoolProfileService.js`
- `snapshotService.js`

## Active Stores

- `schoolStore.js` (Zustand)

## Modules

- students
- fees
- transport
- hostel
- attendance

## Current Limitations

- No backend sync yet (localStorage only)
- Limited audit trail (in progress)
- Authorization is role-based, not granular
- No WebSocket/real-time updates
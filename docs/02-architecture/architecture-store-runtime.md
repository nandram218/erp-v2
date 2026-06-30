# architecture-store-runtime
> State management architecture (Zustand + runtime contracts)

---

## Store Structure

```
src/store/schoolStore.js (root)
├── students: { list, selected, isLoading, error }
├── fees: { receipts, settings, outstanding }
├── transport: { routes, vehicles, stops }
├── hostel: { rooms, allocations }
├── auth: { user, school, permissions }
├── ui: { theme, language, sidebarOpen }
└── notifications: { list, unread }
```

## Runtime Contracts

- Every module reads from and writes to its own store slice only
- Slices must be prefixed by module name to avoid collisions
- Store does NOT contain business logic (moves to services)

## Rules

- No direct state mutation outside of actions
- Selectors must be memoized
- Actions must dispatch audit events
# architecture-data-flow
> Data flow and integration points across layers

---

## Read Path (UI → Data)

```
Component (UI)
→ Service method (e.g., studentService.getAll)
→ tenantContextService.get() (get schoolId)
→ storageService.get(key, { schoolId })
→ Return typed data to component
```

## Write Path (UI → Storage)

```
Component (submit form)
→ Service method (e.g., studentService.create)
→ business rule validation (PACK-01)
→ feeNormalizer (if fees)
→ auditService.log({ who, what, old, new })
→ storageService.set(key, data, { schoolId })
→ Emit success/error event
```

## Cross-Module Read (Allowed)

```
Component A needs data from Module B
→ Use serviceRegistry.get('moduleB.proxyMethod')
→ Service B exposes only safe, read-optimized methods
→ schoolId enforcement still applies
```

## Events / Pub-Sub

- Use `contextService.on(event, handler)` for decoupled messaging
- Only module-emitted events allowed
- Events must be prefixed: `fees:receiptCreated`, `students:imported`
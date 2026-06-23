# TRANSPORT MIGRATION PLAN

**Phase:** PHASE-3D PACKAGE-05A  
**Date:** 2026-06-23  
**Branch:** saas-mainline  
**Tag:** phase-3.2f-db-authority-audit-complete  
**Commit:** 1c318a8  
**Status:** MIGRATION PLAN COMPLETE

---

## OBJECTIVE

Produce transport migration plan with OLD CALLER → NEW CALLER mapping to consolidate transport authority from duplicate services to single canonical service.

---

## MIGRATION STRATEGY

### Canonical Service

**Target:** `modules/transport/services/transportService.js`  
**Registry Name:** `transport`  
**Tenant Aware:** YES  
**Pattern:** SaaS-aware with normalization

### Duplicate Service

**Source:** `master-setting/transport/transportService.js`  
**Registry Name:** `masterTransport`  
**Tenant Aware:** NO  
**Pattern:** Legacy master-setting

---

## CALLER MIGRATION MAPPING

### MIGRATION 1: TransportSettings.jsx

**OLD CALLER:**
- **File:** `src/master-setting/transport/TransportSettings.jsx`
- **Service:** `getService("masterTransport")`
- **Pattern:** Legacy master-setting

**NEW CALLER:**
- **File:** `src/master-setting/transport/TransportSettings.jsx`
- **Service:** `getService("transport")`
- **Pattern:** Modern SaaS pattern

**Migration Steps:**

**Step 1: Update Service Call**
```javascript
// OLD (Line 5)
const transportService = getService("masterTransport");

// NEW
const transportService = getService("transport");
```

**Step 2: Update Data Loading**
```javascript
// OLD (Line 12)
const [store, setStore] = useState(transportService.get());

// NEW
const [store, setStore] = useState(transportService.getTransportDB());
```

**Step 3: Update Refresh Function**
```javascript
// OLD (Line 15)
const refreshStore = () => {
    setStore(transportService.get());
};

// NEW
const refreshStore = () => {
    setStore(transportService.getTransportDB());
};
```

**Step 4: Update Save Operations**

**Vehicle Save (Line 200):**
```javascript
// OLD
transportService.save(updated);

// NEW
transportService.saveTransportDB(updated);
```

**Vehicle Delete (Line 242):**
```javascript
// OLD
transportService.save(updated);

// NEW
transportService.saveTransportDB(updated);
```

**Driver Save (Line 316):**
```javascript
// OLD
transportService.save(updated);

// NEW
transportService.saveTransportDB(updated);
```

**Driver Delete (Line 358):**
```javascript
// OLD
transportService.save(updated);

// NEW
transportService.saveTransportDB(updated);
```

**Mapping Save (Line 424):**
```javascript
// OLD
transportService.save(updated);

// NEW
transportService.saveTransportDB(updated);
```

**Mapping Delete (Line 448):**
```javascript
// OLD
transportService.save(updated);

// NEW
transportService.saveTransportDB(updated);
```

**Step 5: Update Schema Access**

**Stats Calculation (Lines 105-127):**
```javascript
// OLD
const stats = useMemo(() => {
    return {
        totalVehicles: store.vehicles?.length || 0,
        activeVehicles: store.vehicles?.filter((v) => v.status !== "inactive").length || 0,
        totalDrivers: store.drivers?.length || 0,
        activeDrivers: store.drivers?.filter((d) => d.status !== "inactive").length || 0,
        mappedRoutes: store.mappings?.length || 0,
    };
}, [store]);

// NEW (No change - schema compatible)
```

**Step 6: Update Helper Functions**

**Route Helper (Line 457):**
```javascript
// OLD
const getRoute = (r) => store.routes.find((x) => x.routeNo === r);

// NEW (No change - schema compatible)
```

**Vehicle Helper (Line 462):**
```javascript
// OLD
const getVehicle = (num) => store.vehicles.find((v) => v.number === num);

// NEW (No change - schema compatible)
```

**Driver Helper (Line 467):**
```javascript
// OLD
const getDriver = (ph) => store.drivers.find((d) => d.phone === ph);

// NEW (No change - schema compatible)
```

**Risk:** LOW - Simple API change, schema compatible

**Testing:** Verify vehicle, driver, and mapping operations work

---

### MIGRATION 2: TransportRoutes.jsx

**OLD CALLER:**
- **File:** `src/master-setting/transport/TransportRoutes.jsx`
- **Service:** `getService("masterTransport")`
- **Pattern:** Legacy master-setting

**NEW CALLER:**
- **File:** `src/master-setting/transport/TransportRoutes.jsx`
- **Service:** `getService("transport")`
- **Pattern:** Modern SaaS pattern

**Migration Steps:**

**Step 1: Update Service Call**
```javascript
// OLD (Line 5)
const transportService = getService("masterTransport");

// NEW
const transportService = getService("transport");
```

**Step 2: Update Data Loading**
```javascript
// OLD (Line 12)
const [store, setStore] = useState(transportService.get());

// NEW
const [store, setStore] = useState(transportService.getTransportDB());
```

**Step 3: Update Save Route Operation**

**Create Route (Line 197):**
```javascript
// OLD
transportService.createRoute({
    routeNo: finalRoute,
    routeName,
    fareType,
    fixedFare: fareType === "fixed" ? Number(fixedFare) : 0,
    status: routeStatus,
    note: routeNote,
    points: points.filter((p) => p.name),
});

// NEW
transportService.createTransportRoute({
    id: uid(), // Generate ID for canonical service
    routeName,
    vehicleNumber: "", // Required by canonical service
    vehicleType: "Bus", // Default
    driverName: "", // Required by canonical service
    driverPhone: "", // Required by canonical service
    monthlyFee: fareType === "fixed" ? Number(fixedFare) : 0,
    pickupPoints: points.filter((p) => p.name).map((p) => ({
        pickupPointName: p.name,
        routeFee: Number(p.fare || 0),
        pickupTime: p.pickup || "",
        dropTime: p.drop || "",
    })),
    gpsEnabled: false,
    liveTrackingEnabled: false,
    active: routeStatus === "active",
});
```

**Step 4: Update Data Refresh After Create**
```javascript
// OLD (Line 221)
const fresh = transportService.get();

// NEW
const fresh = transportService.getTransportDB();
```

**Step 5: Update Update Route Operation**

**Update Route (Lines 239-326):**
```javascript
// OLD
const updateRoute = () => {
    if (!selectedRoute) {
        return alert("⚠ Select Route");
    }
    
    if (!window.confirm("Update this route?")) {
        return;
    }
    
    const updatedRoutes = store.routes.map((r) => {
        if (r.routeNo !== selectedRoute) {
            return r;
        }
        
        return {
            ...r,
            routeName,
            fareType,
            fixedFare: fareType === "fixed" ? Number(fixedFare) : 0,
            status: routeStatus,
            note: routeNote,
            updatedAt: new Date().toISOString(),
            pickupPoints: points.filter((p) => p.name).map((p, index) => ({
                id: r.pickupPoints?.[index]?.id || r.points?.[index]?.id || Date.now() + index,
                pickupPointName: p.name,
                routeFee: Number(p.fare || 0),
                pickupTime: p.pickup || "",
                dropTime: p.drop || "",
            })),
        };
    });
    
    const updatedDB = {
        ...store,
        routes: updatedRoutes,
    };
    
    transportService.save(updatedDB);
    setStore(updatedDB);
    alert("✏ Route Updated");
    resetForm();
};

// NEW
const updateRoute = () => {
    if (!selectedRoute) {
        return alert("⚠ Select Route");
    }
    
    if (!window.confirm("Update this route?")) {
        return;
    }
    
    // Find route by routeNo (legacy identifier)
    const route = store.routes.find((r) => r.routeNo === selectedRoute);
    
    if (!route) {
        return alert("❌ Route not found");
    }
    
    // Update using canonical service
    const updatedRoute = {
        id: route.id,
        routeName,
        vehicleNumber: route.vehicleNumber || "",
        vehicleType: route.vehicleType || "Bus",
        driverName: route.driverName || "",
        driverPhone: route.driverPhone || "",
        monthlyFee: fareType === "fixed" ? Number(fixedFare) : 0,
        pickupPoints: points.filter((p) => p.name).map((p, index) => ({
            id: route.pickupPoints?.[index]?.id || route.points?.[index]?.id || Date.now() + index,
            pickupPointName: p.name,
            routeFee: Number(p.fare || 0),
            pickupTime: p.pickup || "",
            dropTime: p.drop || "",
        })),
        gpsEnabled: route.gpsEnabled || false,
        liveTrackingEnabled: route.liveTrackingEnabled || false,
        active: routeStatus === "active",
    };
    
    // Manual update since canonical service doesn't have updateRoute
    const updatedRoutes = store.routes.map((r) =>
        r.id === updatedRoute.id ? updatedRoute : r
    );
    
    const updatedDB = {
        ...store,
        routes: updatedRoutes,
    };
    
    transportService.saveTransportDB(updatedDB);
    setStore(updatedDB);
    alert("✏ Route Updated");
    resetForm();
};
```

**Step 6: Update Delete Route Operation**

**Delete Route (Lines 332-374):**
```javascript
// OLD
const deleteRoute = () => {
    if (!selectedRoute) {
        return alert("⚠ Select Route");
    }
    
    if (!window.confirm("Delete this route?")) {
        return;
    }
    
    const updatedDB = {
        ...store,
        routes: store.routes.filter((r) => r.routeNo !== selectedRoute),
        mappings: store.mappings.filter((m) => m.route !== selectedRoute),
    };
    
    transportService.save(updatedDB);
    setStore(updatedDB);
    alert("🗑 Route Deleted");
    resetForm();
};

// NEW
const deleteRoute = () => {
    if (!selectedRoute) {
        return alert("⚠ Select Route");
    }
    
    if (!window.confirm("Delete this route?")) {
        return;
    }
    
    // Find route by routeNo (legacy identifier)
    const route = store.routes.find((r) => r.routeNo === selectedRoute);
    
    if (!route) {
        return alert("❌ Route not found");
    }
    
    // Use canonical service to remove route
    transportService.removeTransportRoute(route.id);
    
    // Refresh data
    const fresh = transportService.getTransportDB();
    setStore(fresh);
    alert("🗑 Route Deleted");
    resetForm();
};
```

**Step 7: Update Save Operations**

**Update Route Save (Line 319):**
```javascript
// OLD
transportService.save(updatedDB);

// NEW
transportService.saveTransportDB(updatedDB);
```

**Delete Route Save (Line 367):**
```javascript
// OLD
transportService.save(updatedDB);

// NEW
transportService.saveTransportDB(updatedDB);
```

**Step 8: Update Schema Access**

**Stats Calculation (Lines 58-84):**
```javascript
// OLD
const stats = useMemo(() => {
    const routes = store.routes || [];
    const totalRoutes = routes.length;
    const totalPoints = routes.reduce(
        (acc, r) => acc + (r.pickupPoints?.length || r.points?.length || 0),
        0
    );
    const activeRoutes = routes.filter((r) => r.status !== "inactive").length;
    
    return {
        totalRoutes,
        totalPoints,
        activeRoutes,
    };
}, [store]);

// NEW (No change - schema compatible)
```

**Step 9: Update Route Selection Handler**

**Handle Select Route (Lines 115-163):**
```javascript
// OLD
const handleSelectRoute = (val) => {
    setSelectedRoute(val);
    
    const route = store.routes.find((r) => r.routeNo === val);
    
    if (!route) return;
    
    setRouteNo(route.routeNo.replace("R", ""));
    setRouteName(route.routeName || "");
    setFareType(route.fareType || "fixed");
    setFixedFare(route.fixedFare || "");
    setRouteStatus(route.status || "active");
    setRouteNote(route.note || "");
    
    const mappedPoints = route.pickupPoints?.length || route.points?.length
        ? (route.pickupPoints || route.points).map((p) => ({
            name: p.pickupPointName || p.pointName || p.name || "",
            fare: p.routeFee || p.fee || "",
            pickup: p.pickupTime || "",
            drop: p.dropTime || "",
        }))
        : emptyPoints();
    
    setPoints(mappedPoints);
};

// NEW (No change - normalization layer handles schema differences)
```

**Step 10: Update Route Display**

**Route Preview (Lines 835-914):**
```javascript
// OLD
{store.routes.map((r) => (
    <div key={r.routeNo} style={{...styles.routeCard, border: selectedRoute === r.routeNo ? "2px solid #3b82f6" : "1px solid #334155"}}>
        <div style={styles.routeTop}>
            <div>
                <div style={styles.routeNo}>{r.routeNo}</div>
                <div style={styles.routeName}>{r.routeName}</div>
            </div>
            <div style={{...styles.statusBadge, background: r.status === "inactive" ? "#991b1b" : "#166534"}}>
                {r.status || "active"}
            </div>
        </div>
        <div style={styles.routeMeta}>🚏 {r.pickupPoints?.length || r.points?.length || 0} Points</div>
        {r.fareType === "fixed" && (
            <div style={styles.routeMeta}>💰 Fixed Fare : ₹ {r.fixedFare}</div>
        )}
        <div style={styles.pointList}>
            {(r.pickupPoints || r.points)?.map((p) => (
                <div key={p.id} style={styles.pointItem}>
                    <div><b>{p.pickupPointName || p.pointName}</b></div>
                    <div>₹ {p.routeFee || p.fee}</div>
                    <div>{p.pickupTime}</div>
                </div>
            ))}
        </div>
    </div>
))}

// NEW (No change - normalization layer handles schema differences)
```

**Risk:** MEDIUM - Schema differences require mapping, routeNo to ID conversion

**Testing:** Verify route CRUD operations work

---

## SCHEMA MAPPING

### Legacy Schema (master-setting/transport)

```javascript
{
    routeNo: "R1",              // Legacy identifier
    routeName: "Talwandi Route",
    fareType: "fixed",
    fixedFare: 1200,            // Legacy fee field
    status: "active",           // Legacy status field
    note: "Special notes",
    points: [                   // Legacy points field
        {
            name: "Point A",
            fare: 100,
            pickup: "07:00",
            drop: "08:00"
        }
    ]
}
```

### Canonical Schema (modules/transport)

```javascript
{
    id: "1234567890",           // Canonical identifier
    routeName: "Talwandi Route",
    vehicleNumber: "",          // Required
    vehicleType: "Bus",         // Default
    driverName: "",             // Required
    driverPhone: "",            // Required
    monthlyFee: 1200,           // Canonical fee field
    pickupPoints: [             // Canonical points field
        {
            id: "123",
            pickupPointName: "Point A",
            routeFee: 100,
            pickupTime: "07:00",
            dropTime: "08:00"
        }
    ],
    gpsEnabled: false,
    liveTrackingEnabled: false,
    active: true                // Canonical status field
}
```

### Schema Mapping Table

| Legacy Field | Canonical Field | Mapping Strategy |
|--------------|-----------------|-----------------|
| routeNo | id | Generate new ID, store routeNo in metadata |
| routeName | routeName | Direct mapping |
| fareType | N/A | Not used in canonical schema |
| fixedFare | monthlyFee | Direct mapping |
| status | active | "active" → true, "inactive" → false |
| note | N/A | Not used in canonical schema |
| points.name | pickupPoints.pickupPointName | Direct mapping |
| points.fare | pickupPoints.routeFee | Direct mapping |
| points.pickup | pickupPoints.pickupTime | Direct mapping |
| points.drop | pickupPoints.dropTime | Direct mapping |
| N/A | vehicleNumber | Default to empty string |
| N/A | vehicleType | Default to "Bus" |
| N/A | driverName | Default to empty string |
| N/A | driverPhone | Default to empty string |
| N/A | gpsEnabled | Default to false |
| N/A | liveTrackingEnabled | Default to false |

---

## MIGRATION SEQUENCE

### Phase 1: Service Registry Update

**Objective:** Mark masterTransport as deprecated

**File:** `src/core/serviceRegistry.js`

**Change:**
```javascript
// Lines 196-199
// OLD
registerService("masterTransport", masterTransportService.transportService, { 
    description: "Master transport service",
    deprecated: false 
});

// NEW
registerService("masterTransport", masterTransportService.transportService, { 
    description: "Master transport service",
    deprecated: true,
    replacement: "transport"
});
```

**Risk:** LOW - Deprecation warning only

**Testing:** Verify deprecation warning appears

---

### Phase 2: Migrate TransportSettings.jsx

**Objective:** Update TransportSettings to use canonical service

**File:** `src/master-setting/transport/TransportSettings.jsx`

**Changes:**
1. Update service call (Line 5)
2. Update data loading (Line 12)
3. Update refresh function (Line 15)
4. Update all save operations (Lines 200, 242, 316, 358, 424, 448)

**Risk:** LOW - Simple API change, schema compatible

**Testing:** Verify vehicle, driver, and mapping operations work

---

### Phase 3: Migrate TransportRoutes.jsx

**Objective:** Update TransportRoutes to use canonical service

**File:** `src/master-setting/transport/TransportRoutes.jsx`

**Changes:**
1. Update service call (Line 5)
2. Update data loading (Line 12)
3. Update create route operation (Line 197)
4. Update data refresh (Line 221)
5. Update update route operation (Lines 239-326)
6. Update delete route operation (Lines 332-374)
7. Update save operations (Lines 319, 367)

**Risk:** MEDIUM - Schema differences require mapping

**Testing:** Verify route CRUD operations work

---

### Phase 4: Data Migration

**Objective:** Migrate existing route data to canonical schema

**Steps:**
1. Read all routes from ERP_DB
2. Convert legacy schema to canonical schema
3. Write back to ERP_DB
4. Verify data integrity

**Migration Script:**
```javascript
// One-time migration utility
const migrateTransportData = () => {
    const transport = getTransportDB();
    
    const migratedRoutes = transport.routes.map((route) => ({
        id: route.id || uid(),
        routeName: route.routeName || "",
        vehicleNumber: route.vehicleNumber || "",
        vehicleType: route.vehicleType || "Bus",
        driverName: route.driverName || "",
        driverPhone: route.driverPhone || "",
        monthlyFee: route.fixedFare || route.monthlyFee || 0,
        pickupPoints: (route.pickupPoints || route.points || []).map((point) => ({
            id: point.id || uid(),
            pickupPointName: point.pickupPointName || point.pointName || point.name || "",
            routeFee: point.routeFee || point.fee || 0,
            pickupTime: point.pickupTime || point.pickup || "",
            dropTime: point.dropTime || point.drop || "",
        })),
        gpsEnabled: route.gpsEnabled || false,
        liveTrackingEnabled: route.liveTrackingEnabled || false,
        active: route.status !== "inactive",
        createdAt: route.createdAt,
        updatedAt: route.updatedAt,
    }));
    
    transport.routes = migratedRoutes;
    saveTransportDB(transport);
    
    console.log(`Migrated ${migratedRoutes.length} routes to canonical schema`);
};
```

**Risk:** MEDIUM - Data migration

**Testing:** Verify data integrity after migration

---

### Phase 5: Remove Duplicate Service

**Objective:** Remove master-setting/transport/transportService.js

**Prerequisites:**
- Phase 2 complete
- Phase 3 complete
- Phase 4 complete
- All callers migrated

**Steps:**
1. Remove from serviceRegistry
2. Delete master-setting/transport/transportService.js

**File:** `src/core/serviceRegistry.js`

**Change:**
```javascript
// Lines 163, 196-199
// Remove these lines:
const masterTransportService = require("../master-setting/transport/transportService");
registerService("masterTransport", masterTransportService.transportService, { 
    description: "Master transport service",
    deprecated: true,
    replacement: "transport"
});
```

**File:** `src/master-setting/transport/transportService.js`

**Action:** DELETE ENTIRE FILE

**Risk:** MEDIUM - Dependent on caller migration

**Testing:** Verify no broken imports

---

## ROLLBACK PLAN

### If Phase 2 Fails

1. Revert TransportSettings.jsx changes
2. Continue with Phase 3 (TransportRoutes migration)

### If Phase 3 Fails

1. Revert TransportRoutes.jsx changes
2. Revert TransportSettings.jsx changes
3. Continue with data migration (Phase 4)

### If Phase 4 Fails

1. Restore from backup before migration
2. Revert all caller changes
3. Continue with service removal (Phase 5)

### If Phase 5 Fails

1. Restore serviceRegistry
2. Restore master-setting/transport/transportService.js
3. Revert all caller changes

---

## TESTING PLAN

### Unit Tests

1. **Service Migration Test**
   - Verify canonical service functions work
   - Verify schema normalization works

2. **Caller Migration Test**
   - Verify TransportSettings works with canonical service
   - Verify TransportRoutes works with canonical service

### Integration Tests

1. **Data Migration Test**
   - Verify legacy data converts to canonical schema
   - Verify data integrity after migration

2. **End-to-End Test**
   - Verify vehicle CRUD operations work
   - Verify driver CRUD operations work
   - Verify route CRUD operations work
   - Verify mapping operations work

### Regression Tests

1. **TransportPage Test**
   - Verify TransportPage still works (no changes)
   - Verify StudentForm still works (no changes)

2. **Navigation Test**
   - Verify TransportSettings → TransportRoutes navigation works
   - Verify TransportRoutes → TransportSettings navigation works

---

## SUCCESS CRITERIA

### Service Criteria

- ✅ Canonical service (modules/transport) is single authority
- ✅ Duplicate service (master-setting/transport) removed
- ✅ All callers migrated to canonical service
- ✅ No broken imports

### Data Criteria

- ✅ All legacy data migrated to canonical schema
- ✅ No data loss
- ✅ No data corruption
- ✅ Data integrity verified

### Functionality Criteria

- ✅ Vehicle operations work
- ✅ Driver operations work
- ✅ Route operations work
- ✅ Mapping operations work

---

## ESTIMATED EFFORT

### Phase 1: Service Registry Update
- **Effort:** 1 hour
- **Risk:** LOW

### Phase 2: Migrate TransportSettings.jsx
- **Effort:** 2-3 hours
- **Risk:** LOW

### Phase 3: Migrate TransportRoutes.jsx
- **Effort:** 4-5 hours
- **Risk:** MEDIUM

### Phase 4: Data Migration
- **Effort:** 2-3 hours
- **Risk:** MEDIUM

### Phase 5: Remove Duplicate Service
- **Effort:** 1 hour
- **Risk:** MEDIUM

**Total Estimated Effort:** 10-13 hours

---

## DELIVERABLES

### Documentation

1. ✅ TRANSPORT_CALLER_MAP.md
2. ✅ TRANSPORT_MIGRATION_PLAN.md (this document)

### Code Changes

1. Phase 1: Service registry update
2. Phase 2: TransportSettings.jsx migration
3. Phase 3: TransportRoutes.jsx migration
4. Phase 4: Data migration script
5. Phase 5: Remove duplicate service

### Tests

1. Unit tests for service migration
2. Unit tests for caller migration
3. Integration tests for data migration
4. End-to-end tests for functionality

---

## CONCLUSION

### Current State

**Canonical Service:** modules/transport/services/transportService.js  
**Duplicate Service:** master-setting/transport/transportService.js  
**Callers to Migrate:** 2 (TransportSettings.jsx, TransportRoutes.jsx)  
**Migration Required:** YES  
**Risk Level:** MEDIUM

### Target State

**Canonical Service:** modules/transport/services/transportService.js (single authority)  
**Duplicate Service:** REMOVED  
**Callers:** All migrated to canonical service  
**Data:** Migrated to canonical schema

### Recommendation

**EXECUTE MIGRATION** to establish single transport authority

**Required Actions:**
1. Execute Phase-1 (Service registry update)
2. Execute Phase-2 (Migrate TransportSettings.jsx)
3. Execute Phase-3 (Migrate TransportRoutes.jsx)
4. Execute Phase-4 (Data migration)
5. Execute Phase-5 (Remove duplicate service)
6. Complete all testing
7. Verify success criteria met

### Next Steps

1. **Review** this migration plan
2. **Approve** migration plan
3. **Create** rollback branch
4. **Backup** all data
5. **Execute** Phase-1
6. **Test** Phase-1
7. **Proceed** to Phase-2
8. **Continue** through all phases
9. **Validate** final state
10. **Deploy** to production

---

**STEP-4 COMPLETE**

**Status:** Transport migration plan complete  
**Migrations Defined:** 2 (TransportSettings.jsx, TransportRoutes.jsx)  
**Phases Defined:** 5  
**Estimated Effort:** 10-13 hours  
**Risk Level:** MEDIUM  
**Recommendation:** Execute migration to establish single authority

---

## FINAL REPORT SUMMARY

### All Transport Writers

**Service A (modules/transport):**
- saveDB() - INTERNAL
- saveTransportDB() - INTERNAL
- createTransportRoute() - PUBLIC (tenant-aware)
- removeTransportRoute() - PUBLIC
- toggleRouteStatus() - PUBLIC
- assignStudentTransport() - PUBLIC (tenant-aware)
- saveStudentTransport() - PUBLIC (tenant-aware)

**Service B (master-setting/transport):**
- saveDB() - INTERNAL
- save() - PUBLIC
- createRoute() - PUBLIC
- updateRoute() - PUBLIC
- deleteRoute() - PUBLIC

### All Transport Readers

**Service A (modules/transport):**
- getDB() - INTERNAL
- getTransportDB() - INTERNAL
- getTransportRoutes() - PUBLIC
- getRouteById() - PUBLIC
- getTransportDashboard() - PUBLIC

**Service B (master-setting/transport):**
- getDB() - INTERNAL
- get() - PUBLIC
- getRoutes() - PUBLIC
- getRouteById() - PUBLIC

### All Transport Callers

**Service A Callers:**
- TransportPage.jsx (modules/transport/pages) - ACTIVE
- StudentForm.jsx (modules/students) - ACTIVE

**Service B Callers:**
- TransportSettings.jsx (master-setting/transport) - ACTIVE (TO MIGRATE)
- TransportRoutes.jsx (master-setting/transport) - ACTIVE (TO MIGRATE)

### Dependency Graph

```
ERP_DB
    ↑
    │
    ├── Service A (modules/transport) ← CANONICAL
    │   ├── TransportPage.jsx
    │   └── StudentForm.jsx
    │
    └── Service B (master-setting/transport) ← DUPLICATE (TO REMOVE)
        ├── TransportSettings.jsx ← TO MIGRATE
        └── TransportRoutes.jsx ← TO MIGRATE
```

### Safe Migration Sequence

1. **Phase 1:** Mark masterTransport as deprecated
2. **Phase 2:** Migrate TransportSettings.jsx to canonical service
3. **Phase 3:** Migrate TransportRoutes.jsx to canonical service
4. **Phase 4:** Migrate existing data to canonical schema
5. **Phase 5:** Remove duplicate service

**STOP REACHED** - No implementation, no file deletion, no refactoring as requested.

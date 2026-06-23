# TRANSPORT CONSOLIDATION AUDIT

**Phase:** PHASE-3D PACKAGE-04 STEP-4B  
**Date:** 2026-06-23  
**Branch:** saas-mainline  
**Tag:** phase-3.2e-pre-db-consolidation  
**Commit:** c509863  
**Status:** AUDIT COMPLETE

---

## OBJECTIVE

Audit both transport services to identify canonical service, duplicate service, imports, callers, and write locations for consolidation.

---

## TRANSPORT SERVICES OVERVIEW

### Service A: modules/transport/services/transportService.js

**Location:** `src/modules/transport/services/transportService.js`  
**Registry Name:** `transport`  
**Tenant Aware:** YES (uses withTenantContext)  
**Storage Key:** `STORAGE_KEYS.ERP_DB`  
**Authority Bypass:** YES (direct ERP_DB write)  
**Status:** ACTIVE - SaaS-aware

### Service B: master-setting/transport/transportService.js

**Location:** `src/master-setting/transport/transportService.js`  
**Registry Name:** `masterTransport`  
**Tenant Aware:** NO  
**Storage Key:** `STORAGE_KEYS.ERP_DB`  
**Authority Bypass:** YES (direct ERP_DB write)  
**Status:** ACTIVE - Legacy pattern

---

## SERVICE A: modules/transport/services/transportService.js

### File Information

**Path:** `src/modules/transport/services/transportService.js`  
**Lines:** 421  
**Pattern:** SaaS-aware with tenant context

### Imports

```javascript
// Lines 1-6
import {
    getStorageCompat,
    setStorageCompat,
    STORAGE_KEYS,
} from "../../../services/storageService";
import { withTenantContext } from "../../../services/tenantContextService";
import { blockDirectServiceAccess } from "../../../core/serviceRegistry";

// Phase 3.1 D Safe Mode: Block direct access in production mode
blockDirectServiceAccess("transportService");
```

### Storage Key Assignment

```javascript
// Line 12
const DB_KEY = STORAGE_KEYS.ERP_DB;
```

### Write Functions

**1. saveDB()**
```javascript
// Lines 31-33
const saveDB = (db) => {
    setStorageCompat(DB_KEY, db);
};
```

**2. saveTransportDB()**
```javascript
// Lines 58-64
const saveTransportDB = (transport) => {
    const db = getDB();
    db.transport = transport;
    saveDB(db);
};
```

### Read Functions

**1. getDB()**
```javascript
// Lines 23-29
const getDB = () => {
    try {
        return getStorageCompat(DB_KEY, {}) || {};
    } catch {
        return {};
    }
};
```

**2. getTransportDB()**
```javascript
// Lines 35-56
const getTransportDB = () => {
    const db = getDB();
    
    if (!db.transport) {
        db.transport = {
            routes: [],
            vehicles: [],
            drivers: [],
            mappings: [],
            settings: {
                transportEnabled: true,
                attendanceTracking: false,
                gpsTracking: false,
                smsAlerts: false,
            },
        };
        
        saveDB(db);
    }
    
    return db.transport;
};
```

### Public API Functions

**Route Management:**
- `getTransportRoutes()` (Line 105)
- `getRouteById()` (Line 110)
- `createTransportRoute()` (Line 120)
- `removeTransportRoute()` (Line 202)
- `toggleRouteStatus()` (Line 218)

**Fee Calculation:**
- `calculateRouteFee()` (Line 248)

**Student Transport:**
- `assignStudentTransport()` (Line 263)
- `saveStudentTransport()` (Line 298)

**Occupancy:**
- `calculateRouteOccupancy()` (Line 332)

**Dashboard:**
- `getTransportDashboard()` (Line 351)

**Snapshot:**
- `generateTransportSnapshot()` (Line 393)

### Tenant Context Usage

**1. withTenantContext on Route Creation**
```javascript
// Lines 136-180
const route = withTenantContext({
    id: payload.id || uid(),
    routeName: payload.routeName || "",
    vehicleNumber: payload.vehicleNumber || "",
    vehicleType: payload.vehicleType || "Bus",
    driverName: payload.driverName || "",
    driverPhone: payload.driverPhone || "",
    monthlyFee: Number(payload.monthlyFee || 0),
    pickupPoints: payload.pickupPoints || [],
    gpsEnabled: payload.gpsEnabled || false,
    liveTrackingEnabled: payload.liveTrackingEnabled || false,
    active: payload.active !== undefined ? payload.active : true,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});
```

**2. withTenantContext on Student Transport**
```javascript
// Lines 304-305
const tenantAwareTransportData = withTenantContext(transportData);
```

### Normalization Layer

**normalizeRoute() Function**
```javascript
// Lines 74-103
const normalizeRoute = (route) => {
    // Normalize pickup points - convert all fee variations to routeFee
    const pickupPoints = (route.pickupPoints || route.points || []).map(point => ({
        id: point.id,
        pickupPointName: point.pickupPointName || point.pointName || point.name || "",
        routeFee: point.routeFee || point.fee || point.fare || 0,
        pickupTime: point.pickupTime || point.pickup || "",
        dropTime: point.dropTime || point.drop || ""
    }));
    
    // Convert all route fee variations to transportFee (canonical)
    const transportFee = route.fixedFare || route.routeFee || route.monthlyFee || route.fee || route.fare || 0;
    
    return {
        id: route.id,
        routeName: route.routeName || route.name || "",
        fareType: route.fareType || "fixed",
        transportFee,
        vehicleNumber: route.vehicleNumber || "",
        vehicleType: route.vehicleType || "Bus",
        driverName: route.driverName || "",
        driverPhone: route.driverPhone || "",
        gpsEnabled: route.gpsEnabled || false,
        liveTrackingEnabled: route.liveTrackingEnabled || false,
        active: route.active !== undefined ? route.active : true,
        pickupPoints,
        createdAt: route.createdAt,
        updatedAt: route.updatedAt
    };
};
```

### Registry Registration

**File:** `src/core/serviceRegistry.js`  
**Line:** 160, 181-184

```javascript
// Line 160
const transportService = require("../modules/transport/services/transportService");

// Lines 181-184
registerService("transport", transportService, { 
    description: "Transport service",
    deprecated: false 
});
```

### Callers (Direct Imports)

**1. modules/transport/pages/TransportPage.jsx**
```javascript
// Line 12
const transportService = getService("transport");

// Lines 27-29
setRoutes(transportService.getTransportRoutes());
setDashboard(transportService.getTransportDashboard());

// Line 48
transportService.createTransportRoute(payload);

// Line 71
transportService.removeTransportRoute(id);

// Line 77
transportService.toggleRouteStatus(id);
```

**2. modules/students/StudentForm.jsx**
```javascript
// Line 11
import { getTransportRoutes } from "../../modules/transport/services/transportService";
```

### Callers (Via Service Registry)

**1. modules/transport/pages/TransportPage.jsx**
```javascript
// Line 12
const transportService = getService("transport");
```

---

## SERVICE B: master-setting/transport/transportService.js

### File Information

**Path:** `src/master-setting/transport/transportService.js`  
**Lines:** 336  
**Pattern:** Legacy master-setting pattern

### Imports

```javascript
// Lines 6-10
import {
    getStorageCompat,
    setStorageCompat,
    STORAGE_KEYS,
} from "../../services/storageService";

// No tenant context import
// No service registry block
```

### Storage Key Assignment

```javascript
// Line 12
const DB_KEY = STORAGE_KEYS.ERP_DB;
```

### Write Functions

**1. saveDB()**
```javascript
// Lines 41-44
const saveDB = (db) => {
    setStorageCompat(DB_KEY, db);
};
```

### Read Functions

**1. getDB()**
```javascript
// Lines 29-39
const getDB = () => {
    try {
        return getStorageCompat(DB_KEY, {}) || {};
    } catch {
        return {};
    }
};
```

### Public API Functions

**Main Service Object:**
```javascript
// Line 69
export const transportService = {
```

**Full DB Operations:**
- `get()` (Line 75)
- `save()` (Line 107)
- `reset()` (Line 120)

**Route Management:**
- `getRoutes()` (Line 134)
- `getRouteById()` (Line 141)
- `createRoute()` (Line 152)
- `updateRoute()` (Line 260)
- `deleteRoute()` (Line 293)

**Point Helpers:**
- `getPointById()` (Line 314)

### Tenant Context Usage

**NONE** - This service does not use tenant context

### Normalization Layer

**NONE** - This service does not have a normalization layer

### Registry Registration

**File:** `src/core/serviceRegistry.js`  
**Line:** 163, 196-199

```javascript
// Line 163
const masterTransportService = require("../master-setting/transport/transportService");

// Lines 196-199
registerService("masterTransport", masterTransportService.transportService, { 
    description: "Master transport service",
    deprecated: false 
});
```

### Callers (Direct Imports)

**NONE** - No direct imports found

### Callers (Via Service Registry)

**1. master-setting/transport/TransportSettings.jsx**
```javascript
// Line 5
const transportService = getService("masterTransport");

// Line 12
useState(transportService.get());

// Line 15
setStore(transportService.get());

// Line 200
transportService.save(updated);

// Line 242
transportService.save(updated);

// Line 316
transportService.save(updated);

// Line 358
transportService.save(updated);

// Line 424
transportService.save(updated);

// Line 448
transportService.save(updated);
```

**2. master-setting/transport/TransportRoutes.jsx**
```javascript
// Line 5
const transportService = getService("masterTransport");

// Line 12
useState(transportService.get());

// Line 197
transportService.createRoute({...});

// Line 221
const fresh = transportService.get();

// Line 319
transportService.save(updatedDB);

// Line 367
transportService.save(updatedDB);
```

---

## COMPARISON ANALYSIS

### Feature Comparison

| Feature | modules/transport | master-setting/transport |
|---------|------------------|-------------------------|
| **Tenant Context** | YES (withTenantContext) | NO |
| **Normalization** | YES (normalizeRoute) | NO |
| **Service Registry** | YES ("transport") | YES ("masterTransport") |
| **Direct Access Block** | YES (blockDirectServiceAccess) | NO |
| **Student Transport** | YES (assignStudentTransport) | NO |
| **Occupancy Calculation** | YES (calculateRouteOccupancy) | NO |
| **Dashboard** | YES (getTransportDashboard) | NO |
| **Snapshot** | YES (generateTransportSnapshot) | NO |
| **Fee Calculation** | YES (calculateRouteFee) | NO |
| **Point Helpers** | YES (getPointById) | YES |
| **Route Management** | YES (CRUD) | YES (CRUD) |
| **Full DB Operations** | NO (transport section only) | YES (full DB) |

### Storage Write Comparison

| Aspect | modules/transport | master-setting/transport |
|--------|------------------|-------------------------|
| **Storage Key** | ERP_DB | ERP_DB |
| **Write Method** | Direct setStorageCompat | Direct setStorageCompat |
| **Authority Bypass** | YES | YES |
| **Tenant Context on Write** | YES | NO |
| **Section Written** | transport only | full DB (transport section) |

### API Comparison

**modules/transport API:**
- getTransportRoutes()
- getRouteById()
- createTransportRoute()
- removeTransportRoute()
- toggleRouteStatus()
- calculateRouteFee()
- assignStudentTransport()
- saveStudentTransport()
- calculateRouteOccupancy()
- getTransportDashboard()
- generateTransportSnapshot()

**master-setting/transport API:**
- get()
- save()
- reset()
- getRoutes()
- getRouteById()
- createRoute()
- updateRoute()
- deleteRoute()
- getPointById()

### Schema Comparison

**modules/transport Schema (normalized):**
```javascript
{
    id: string,
    routeName: string,
    fareType: "fixed" | string,
    transportFee: number,  // normalized from multiple fee fields
    vehicleNumber: string,
    vehicleType: "Bus" | string,
    driverName: string,
    driverPhone: string,
    gpsEnabled: boolean,
    liveTrackingEnabled: boolean,
    active: boolean,
    pickupPoints: [{
        id: string,
        pickupPointName: string,  // normalized
        routeFee: number,  // normalized
        pickupTime: string,
        dropTime: string
    }],
    createdAt: string,
    updatedAt: string
}
```

**master-setting/transport Schema (raw):**
```javascript
{
    id: string,
    routeNo: string,
    routeName: string,
    fareType: "fixed" | string,
    fixedFare: number,
    vehicleNumber: string,
    vehicleType: "Bus" | string,
    driverName: string,
    driverPhone: string,
    gpsEnabled: boolean,
    liveTrackingEnabled: boolean,
    active: boolean,
    points: [{
        id: string,
        name: string,  // not normalized
        fare: number,  // not normalized
        pickup: string,  // not normalized
        drop: string  // not normalized
    }],
    createdAt: string,
    updatedAt: string
}
```

---

## DUPLICATE WRITE CONFLICT

### Conflict Scenario

**Both services write to ERP_DB.transport section**

**modules/transport writes:**
```javascript
// Line 63
db.transport = transport;
saveDB(db);
```

**master-setting/transport writes:**
```javascript
// Line 111
db.transport = transportData;
saveDB(db);
```

**Risk:** Last write wins, no coordination between services

### Data Schema Conflict

**modules/transport uses normalized schema:**
- `transportFee` (canonical)
- `pickupPointName` (canonical)
- `routeFee` (canonical)

**master-setting/transport uses raw schema:**
- `fixedFare` (raw)
- `name` (raw)
- `fare` (raw)

**Risk:** Schema drift, data inconsistency

---

## CALLER ANALYSIS

### modules/transport Callers

**1. TransportPage.jsx (modules/transport/pages)**
- Uses: getService("transport")
- Functions: getTransportRoutes, getTransportDashboard, createTransportRoute, removeTransportRoute, toggleRouteStatus
- Pattern: Modern React with service registry

**2. StudentForm.jsx (modules/students)**
- Uses: Direct import
- Functions: getTransportRoutes
- Pattern: Direct import for dropdown population

### master-setting/transport Callers

**1. TransportSettings.jsx (master-setting/transport)**
- Uses: getService("masterTransport")
- Functions: get, save
- Pattern: Master-setting UI with service registry

**2. TransportRoutes.jsx (master-setting/transport)**
- Uses: getService("masterTransport")
- Functions: get, createRoute, save
- Pattern: Master-setting UI with service registry

---

## CANONICAL SERVICE DETERMINATION

### Criteria for Canonical Service

1. **Tenant Awareness** ✅ modules/transport
2. **Normalization Layer** ✅ modules/transport
3. **Feature Completeness** ✅ modules/transport
4. **SaaS Architecture** ✅ modules/transport
5. **Modern Pattern** ✅ modules/transport
6. **Service Registry Integration** ✅ Both

### Canonical Service: modules/transport/services/transportService.js

**Reasons:**
1. Uses withTenantContext for SaaS isolation
2. Has normalization layer for schema consistency
3. More complete API (student transport, occupancy, dashboard)
4. Follows modern SaaS architecture patterns
5. Has direct access blocking for production safety
6. Better schema handling (normalized vs raw)

### Duplicate Service: master-setting/transport/transportService.js

**Reasons:**
1. No tenant context (SaaS violation)
2. No normalization layer (schema drift risk)
3. Legacy master-setting pattern
4. Less complete API
5. Raw schema (not normalized)
6. Conflicts with canonical service on ERP_DB.transport

---

## MIGRATION PATH

### Phase 1: Deprecate master-setting/transport

**Actions:**
1. Mark masterTransport as deprecated in serviceRegistry
2. Add deprecation warning to master-setting/transport/transportService.js
3. Document migration path for callers

### Phase 2: Migrate Callers

**TransportSettings.jsx:**
- From: getService("masterTransport")
- To: getService("transport")
- Update API calls to match modules/transport API

**TransportRoutes.jsx:**
- From: getService("masterTransport")
- To: getService("transport")
- Update API calls to match modules/transport API

**StudentForm.jsx:**
- Already using modules/transport (no change needed)

### Phase 3: Schema Migration

**Actions:**
1. Migrate existing data from raw schema to normalized schema
2. Use normalizeRoute() function for migration
3. Verify data integrity after migration

### Phase 4: Remove Duplicate Service

**Actions:**
1. Remove master-setting/transport/transportService.js
2. Remove masterTransport from serviceRegistry
3. Remove master-setting/transport UI components (or update to use canonical service)

---

## RISK ASSESSMENT

### Current Risks

**1. Data Loss Risk (HIGH)**
- Two services writing to same ERP_DB section
- Last write wins
- No coordination

**2. Schema Drift Risk (HIGH)**
- Different schemas between services
- Normalized vs raw data
- Data inconsistency

**3. Tenant Boundary Violation (HIGH)**
- master-setting/transport has no tenant context
- Data leakage between tenants

**4. API Confusion (MEDIUM)**
- Two different APIs for same functionality
- Developers unsure which to use

### Migration Risks

**1. Breaking Changes (MEDIUM)**
- UI components need API updates
- Schema changes may break existing code

**2. Data Migration (MEDIUM)**
- Schema normalization required
- Data integrity verification needed

---

## RECOMMENDATIONS

### Immediate Actions

1. **Mark masterTransport as Deprecated**
   - Update serviceRegistry to mark as deprecated
   - Add deprecation warning to service

2. **Document Migration Path**
   - Create migration guide for UI components
   - Document API differences

3. **Add Write Coordination**
   - Implement write queue for ERP_DB.transport
   - Add conflict detection

### Short-term Actions

1. **Migrate Callers**
   - Update TransportSettings.jsx to use canonical service
   - Update TransportRoutes.jsx to use canonical service

2. **Schema Migration**
   - Migrate existing data to normalized schema
   - Verify data integrity

### Long-term Actions

1. **Remove Duplicate Service**
   - Delete master-setting/transport/transportService.js
   - Remove from serviceRegistry
   - Update or remove UI components

2. **Enforce Single Authority**
   - Route all transport writes through canonical service
   - Add validation to detect bypassing writes

---

## EVIDENCE REFERENCES

### Search Results

**transportService imports:** 8 matches
- modules/transport/services/transportService.js (service definition)
- modules/transport/pages/TransportPage.jsx (via service registry)
- modules/students/StudentForm.jsx (direct import)
- master-setting/transport/transportService.js (service definition)
- master-setting/transport/TransportSettings.jsx (via service registry)
- master-setting/transport/TransportRoutes.jsx (via service registry)
- core/serviceRegistry.js (registration)
- core/fee-engine/feeNormalizer.js (comment reference)

**master-setting/transport references:** 4 matches
- master-setting/transport/transportService.js (service definition)
- master-setting/transport/TransportSettings.jsx (caller)
- master-setting/transport/TransportRoutes.jsx (caller)
- core/serviceRegistry.js (registration)

**modules/transport references:** 3 matches
- modules/transport/services/transportService.js (service definition)
- modules/transport/pages/TransportPage.jsx (caller)
- modules/students/StudentForm.jsx (caller)

---

## CONCLUSION

**Canonical Service:** modules/transport/services/transportService.js  
**Duplicate Service:** master-setting/transport/transportService.js  
**Migration Required:** YES  
**Risk Level:** HIGH  
**Recommendation:** Deprecate master-setting/transport, migrate callers, remove duplicate service

---

**STEP-4B COMPLETE**

**Status:** Transport consolidation audit complete  
**Canonical Service Identified:** modules/transport/services/transportService.js  
**Duplicate Service Identified:** master-setting/transport/transportService.js  
**Migration Path:** Documented  
**Risk Level:** HIGH (data loss, schema drift, tenant violations)

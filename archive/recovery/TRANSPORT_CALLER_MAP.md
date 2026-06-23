# TRANSPORT CALLER MAP

**Phase:** PHASE-3D PACKAGE-05A  
**Date:** 2026-06-23  
**Branch:** saas-mainline  
**Tag:** phase-3.2f-db-authority-audit-complete  
**Commit:** 1c318a8  
**Status:** AUDIT COMPLETE

---

## OBJECTIVE

Document every import, caller, write operation, and ERP_DB touchpoint for transport services to determine real transport authority and remove duplicate ownership.

---

## TRANSPORT SERVICES OVERVIEW

### Service A: modules/transport/services/transportService.js (CANONICAL CANDIDATE)

**Location:** `src/modules/transport/services/transportService.js`  
**Registry Name:** `transport`  
**Tenant Aware:** YES (uses withTenantContext)  
**Storage Key:** `STORAGE_KEYS.ERP_DB`  
**Authority Bypass:** YES (direct ERP_DB write)  
**Status:** ACTIVE - SaaS-aware

### Service B: master-setting/transport/transportService.js (DUPLICATE CANDIDATE)

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
// Lines 1-7
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

### ERP_DB Touchpoints

**1. getDB() - READ**
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

**2. saveDB() - WRITE**
```javascript
// Lines 31-33
const saveDB = (db) => {
    setStorageCompat(DB_KEY, db);
};
```

**3. getTransportDB() - READ**
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

**4. saveTransportDB() - WRITE**
```javascript
// Lines 58-64
const saveTransportDB = (transport) => {
    const db = getDB();
    
    db.transport = transport;
    
    saveDB(db);
};
```

### Write Operations

**1. createTransportRoute()**
```javascript
// Lines 120-193
export const createTransportRoute = (payload) => {
    const transport = getTransportDB();
    
    const routes = transport.routes || [];
    
    const existing = routes.find(
        (r) => String(r.id) === String(payload.id)
    );
    
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
    
    if (existing) {
        const updatedRoutes = routes.map((r) =>
            String(r.id) === String(route.id) ? route : r
        );
        transport.routes = updatedRoutes;
    } else {
        transport.routes.push(route);
    }
    
    saveTransportDB(transport);
    
    return route;
};
```

**2. removeTransportRoute()**
```javascript
// Lines 195-236
export const removeTransportRoute = (routeId) => {
    const transport = getTransportDB();
    
    transport.routes = transport.routes.filter(
        (r) => String(r.id) !== String(routeId)
    );
    
    saveTransportDB(transport);
    
    return true;
};
```

**3. toggleRouteStatus()**
```javascript
// Lines 238-246
export const toggleRouteStatus = (routeId) => {
    const transport = getTransportDB();
    
    const route = transport.routes.find(
        (r) => String(r.id) === String(routeId)
    );
    
    if (route) {
        route.active = !route.active;
        route.updatedAt = new Date().toISOString();
        saveTransportDB(transport);
    }
    
    return route;
};
```

**4. assignStudentTransport()**
```javascript
// Lines 263-295
export const assignStudentTransport = (payload) => {
    const transport = getTransportDB();
    
    const studentId = payload.studentId;
    const routeId = payload.routeId;
    const pickupPointId = payload.pickupPointId;
    
    const existingAssignment = transport.mappings?.find(
        (m) => String(m.studentId) === String(studentId)
    );
    
    if (existingAssignment) {
        existingAssignment.routeId = routeId;
        existingAssignment.pickupPointId = pickupPointId;
        existingAssignment.updatedAt = new Date().toISOString();
    } else {
        transport.mappings.push({
            id: uid(),
            studentId,
            routeId,
            pickupPointId,
            assignedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }
    
    saveTransportDB(transport);
    
    return existingAssignment || transport.mappings[transport.mappings.length - 1];
};
```

**5. saveStudentTransport()**
```javascript
// Lines 297-330
export const saveStudentTransport = (payload) => {
    const transport = getTransportDB();
    
    const tenantAwareTransportData = withTenantContext(transport);
    
    const studentId = payload.studentId;
    
    const existingIndex = transport.mappings?.findIndex(
        (m) => String(m.studentId) === String(studentId)
    );
    
    if (existingIndex >= 0) {
        transport.mappings[existingIndex] = {
            ...transport.mappings[existingIndex],
            ...payload,
            updatedAt: new Date().toISOString(),
        };
    } else {
        transport.mappings.push({
            id: uid(),
            ...payload,
            assignedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }
    
    saveTransportDB(transport);
    
    return transport;
};
```

### Read Operations

**1. getTransportRoutes()**
```javascript
// Lines 105-108
export const getTransportRoutes = () => {
    const routes = getTransportDB().routes || [];
    return routes.map(normalizeRoute);
};
```

**2. getRouteById()**
```javascript
// Lines 110-118
export const getRouteById = (routeId) => {
    return getTransportRoutes().find(
        (r) => String(r.id) === String(routeId)
    );
};
```

**3. getTransportDashboard()**
```javascript
// Lines 351-388
export const getTransportDashboard = () => {
    const transport = getTransportDB();
    
    const routes = transport.routes || [];
    const vehicles = transport.vehicles || [];
    const drivers = transport.drivers || [];
    const mappings = transport.mappings || [];
    
    const totalRoutes = routes.length;
    const activeRoutes = routes.filter((r) => r.active !== false).length;
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter((v) => v.status !== "inactive").length;
    const totalDrivers = drivers.length;
    const activeDrivers = drivers.filter((d) => d.status !== "inactive").length;
    const totalStudents = mappings.length;
    
    const monthlyRevenue = routes.reduce((acc, route) => {
        const routeFee = route.transportFee || route.monthlyFee || 0;
        const studentsOnRoute = mappings.filter((m) => m.routeId === route.id).length;
        return acc + (routeFee * studentsOnRoute);
    }, 0);
    
    return {
        totalRoutes,
        activeRoutes,
        totalVehicles,
        activeVehicles,
        totalDrivers,
        activeDrivers,
        totalStudents,
        monthlyRevenue,
    };
};
```

### Registry Registration

**File:** `src/core/serviceRegistry.js`  
**Lines:** 160, 181-184

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

**1. modules/students/StudentForm.jsx**
```javascript
// Line 11
import { getTransportRoutes } from "../../modules/transport/services/transportService";

// Line 50
const transportRoutes = getTransportRoutes();
```

**Usage:** Dropdown population for student transport assignment

### Callers (Via Service Registry)

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

**Usage:** Main transport management UI

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

### ERP_DB Touchpoints

**1. getDB() - READ**
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

**2. saveDB() - WRITE**
```javascript
// Lines 41-44
const saveDB = (db) => {
    setStorageCompat(DB_KEY, db);
};
```

### Write Operations

**1. save()**
```javascript
// Lines 107-114
save: (transportData) => {
    const db = getDB();
    db.transport = transportData;
    saveDB(db);
},
```

**2. createRoute()**
```javascript
// Lines 152-256
createRoute: ({
    routeNo = "",
    routeName = "",
    fareType = "fixed",
    fixedFare = 0,
    vehicleNumber = "",
    vehicleType = "Bus",
    driverName = "",
    driverPhone = "",
    gpsEnabled = false,
    liveTrackingEnabled = false,
    active = true,
    points = [],
}) => {
    const transport = transportService.get();
    
    const exists = transport.routes.find(
        (route) => String(route.routeNo) === String(routeNo)
    );
    
    if (exists) {
        throw new Error("Duplicate Route Number");
    }
    
    const route = {
        id: uid(),
        routeNo,
        routeName,
        fareType,
        fixedFare: Number(fixedFare),
        vehicleNumber,
        vehicleType,
        driverName,
        driverPhone,
        gpsEnabled,
        liveTrackingEnabled,
        active,
        pickupPoints: safeArray(points).map((point) => ({
            id: uid(),
            pickupPointName: point.name || point.pointName || point.pickupPointName || "",
            routeFee: Number(point.fare || point.fee || point.routeFee || 0),
            pickupTime: point.pickup || point.pickupTime || "",
            dropTime: point.drop || point.dropTime || "",
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    
    transport.routes.push(route);
    
    transportService.save(transport);
    
    return route;
},
```

**3. updateRoute()**
```javascript
// Lines 260-291
updateRoute: (routeId, updatedData = {}) => {
    const transport = transportService.get();
    
    transport.routes = transport.routes.map((route) =>
        String(route.id) === String(routeId)
            ? {
                ...route,
                ...updatedData,
                updatedAt: new Date().toISOString(),
            }
            : route
    );
    
    transportService.save(transport);
},
```

**4. deleteRoute()**
```javascript
// Lines 293-308
deleteRoute: (routeId) => {
    const transport = transportService.get();
    
    transport.routes = transport.routes.filter(
        (route) => String(route.id) !== String(routeId)
    );
    
    transportService.save(transport);
},
```

### Read Operations

**1. get()**
```javascript
// Lines 75-101
get: () => {
    const db = getDB();
    
    return {
        ...defaultTransport,
        ...(db.transport || {}),
        routes: safeArray(db.transport?.routes),
        vehicles: safeArray(db.transport?.vehicles),
        drivers: safeArray(db.transport?.drivers),
        mappings: safeArray(db.transport?.mappings),
    };
},
```

**2. getRoutes()**
```javascript
// Lines 134-139
getRoutes: () => {
    return transportService.get().routes;
},
```

**3. getRouteById()**
```javascript
// Lines 141-151
getRouteById: (routeId) => {
    return transportService.getRoutes().find(
        (route) => String(route.id) === String(routeId)
    );
},
```

### Registry Registration

**File:** `src/core/serviceRegistry.js`  
**Lines:** 163, 196-199

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

**Usage:** Vehicle, driver, and mapping management

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

**Usage:** Route management

---

## CALLER SUMMARY

### Service A Callers (modules/transport)

| Caller | Type | Location | Functions Used | Status |
|--------|------|----------|----------------|--------|
| TransportPage.jsx | Service Registry | modules/transport/pages | getTransportRoutes, getTransportDashboard, createTransportRoute, removeTransportRoute, toggleRouteStatus | ACTIVE |
| StudentForm.jsx | Direct Import | modules/students | getTransportRoutes | ACTIVE |

**Total Callers:** 2  
**Active Callers:** 2  
**Dead Callers:** 0  
**Legacy Callers:** 0

### Service B Callers (master-setting/transport)

| Caller | Type | Location | Functions Used | Status |
|--------|------|----------|----------------|--------|
| TransportSettings.jsx | Service Registry | master-setting/transport | get, save | ACTIVE |
| TransportRoutes.jsx | Service Registry | master-setting/transport | get, createRoute, save | ACTIVE |

**Total Callers:** 2  
**Active Callers:** 2  
**Dead Callers:** 0  
**Legacy Callers:** 2 (both legacy pattern)

---

## WRITE OPERATION SUMMARY

### Service A Write Operations (modules/transport)

| Function | Line | ERP_DB Touchpoint | Tenant Aware | Status |
|----------|------|-------------------|--------------|--------|
| saveDB() | 32 | setStorageCompat(DB_KEY, db) | NO | INTERNAL |
| saveTransportDB() | 58-64 | setStorageCompat(DB_KEY, db) | NO | INTERNAL |
| createTransportRoute() | 120-193 | saveTransportDB() | YES | PUBLIC |
| removeTransportRoute() | 195-236 | saveTransportDB() | NO | PUBLIC |
| toggleRouteStatus() | 238-246 | saveTransportDB() | NO | PUBLIC |
| assignStudentTransport() | 263-295 | saveTransportDB() | YES | PUBLIC |
| saveStudentTransport() | 297-330 | saveTransportDB() | YES | PUBLIC |

**Total Write Operations:** 7  
**Tenant-Aware Writes:** 3  
**Non-Tenant-Aware Writes:** 4

### Service B Write Operations (master-setting/transport)

| Function | Line | ERP_DB Touchpoint | Tenant Aware | Status |
|----------|------|-------------------|--------------|--------|
| saveDB() | 43 | setStorageCompat(DB_KEY, db) | NO | INTERNAL |
| save() | 107-114 | saveDB() | NO | PUBLIC |
| createRoute() | 152-256 | save() | NO | PUBLIC |
| updateRoute() | 260-291 | save() | NO | PUBLIC |
| deleteRoute() | 293-308 | save() | NO | PUBLIC |

**Total Write Operations:** 5  
**Tenant-Aware Writes:** 0  
**Non-Tenant-Aware Writes:** 5

---

## ERP_DB TOUCHPOINT SUMMARY

### Service A ERP_DB Touchpoints

| Touchpoint | Type | Line | Function | Tenant Aware |
|------------|------|------|----------|--------------|
| getStorageCompat(DB_KEY, {}) | READ | 25 | getDB() | NO |
| setStorageCompat(DB_KEY, db) | WRITE | 32 | saveDB() | NO |
| getStorageCompat(DB_KEY, {}) | READ | 25 | getTransportDB() | NO |
| setStorageCompat(DB_KEY, db) | WRITE | 32 | saveTransportDB() | NO |

**Total Touchpoints:** 4  
**Read Touchpoints:** 2  
**Write Touchpoints:** 2

### Service B ERP_DB Touchpoints

| Touchpoint | Type | Line | Function | Tenant Aware |
|------------|------|------|----------|--------------|
| getStorageCompat(DB_KEY, {}) | READ | 33 | getDB() | NO |
| setStorageCompat(DB_KEY, db) | WRITE | 43 | saveDB() | NO |

**Total Touchpoints:** 2  
**Read Touchpoints:** 1  
**Write Touchpoints:** 1

---

## DEPENDENCY GRAPH

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERP_DB (STORAGE)                              │
│                         ↑                                        │
│                         │                                        │
│         ┌───────────────┴───────────────┐                        │
│         │                               │                        │
│         │                               │                        │
│  Service A                      Service B                     │
│  (modules/transport)            (master-setting/transport)     │
│         │                               │                        │
│         │                               │                        │
│    ┌────┴────┐                     ┌────┴────┐                   │
│    │         │                     │         │                   │
│    │         │                     │         │                   │
│TransportPage              TransportSettings              TransportRoutes
│(modules/transport)       (master-setting/transport) (master-setting/transport)
│    │                               │                        │
│    │                               │                        │
│    └───────────────┬───────────────┘                        │
│                    │                                        │
│            StudentForm                                     │
│        (modules/students)                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## SCREEN DEPENDENCY ANALYSIS

### Screens Using Service A (modules/transport)

**1. TransportPage.jsx**
- **Path:** `src/modules/transport/pages/TransportPage.jsx`
- **Route:** `/transport` (inferred)
- **Service:** `getService("transport")`
- **Functions:** getTransportRoutes, getTransportDashboard, createTransportRoute, removeTransportRoute, toggleRouteStatus
- **Status:** ACTIVE
- **Pattern:** Modern SaaS pattern

**2. StudentForm.jsx**
- **Path:** `src/modules/students/StudentForm.jsx`
- **Route:** `/students/:id` (inferred)
- **Service:** Direct import
- **Functions:** getTransportRoutes
- **Status:** ACTIVE
- **Pattern:** Direct import for dropdown

### Screens Using Service B (master-setting/transport)

**1. TransportSettings.jsx**
- **Path:** `src/master-setting/transport/TransportSettings.jsx`
- **Route:** `/master-setting/transport`
- **Service:** `getService("masterTransport")`
- **Functions:** get, save
- **Status:** ACTIVE
- **Pattern:** Legacy master-setting pattern

**2. TransportRoutes.jsx**
- **Path:** `src/master-setting/transport/TransportRoutes.jsx`
- **Route:** `/master-setting/transport/routes`
- **Service:** `getService("masterTransport")`
- **Functions:** get, createRoute, save
- **Status:** ACTIVE
- **Pattern:** Legacy master-setting pattern

---

## SCREEN NAVIGATION

**TransportSettings.jsx → TransportRoutes.jsx**
```javascript
// TransportSettings.jsx Line 514
onClick={() => navigate("/master-setting/transport/routes")}
```

**TransportRoutes.jsx → TransportSettings.jsx**
```javascript
// TransportRoutes.jsx Line 438
onClick={() => navigate("/master-setting/transport")}
```

---

## EVIDENCE REFERENCES

### Search Results

**master-setting/transport/transportService imports:** 4 matches
- master-setting/transport/transportService.js (service definition)
- master-setting/transport/TransportSettings.jsx (via service registry)
- master-setting/transport/TransportRoutes.jsx (via service registry)
- core/serviceRegistry.js (registration)

**modules/transport/services/transportService imports:** 3 matches
- modules/transport/services/transportService.js (service definition)
- modules/transport/pages/TransportPage.jsx (via service registry)
- modules/students/StudentForm.jsx (direct import)

**transportService.save calls:** 8 matches
- master-setting/transport/TransportSettings.jsx (6 calls)
- master-setting/transport/transportService.js (3 calls)
- master-setting/transport/TransportRoutes.jsx (2 calls)

**transportService.create calls:** 2 matches
- modules/transport/pages/TransportPage.jsx (createTransportRoute)
- master-setting/transport/TransportRoutes.jsx (createRoute)

**transportService.get calls:** 8 matches
- modules/transport/pages/TransportPage.jsx (getTransportRoutes, getTransportDashboard)
- master-setting/transport/TransportSettings.jsx (get)
- master-setting/transport/transportService.js (get)
- master-setting/transport/TransportRoutes.jsx (get)

**masterTransport references:** 4 matches
- master-setting/transport/TransportSettings.jsx (via service registry)
- master-setting/transport/TransportRoutes.jsx (via service registry)
- core/serviceRegistry.js (registration)
- core/serviceRegistry.js (import)

---

## CONCLUSION

### Active Callers

**Service A (modules/transport):** 2 active callers  
**Service B (master-setting/transport):** 2 active callers

### Dead Callers

**Service A (modules/transport):** 0 dead callers  
**Service B (master-setting/transport):** 0 dead callers

### Legacy Callers

**Service A (modules/transport):** 0 legacy callers  
**Service B (master-setting/transport):** 2 legacy callers (both screens)

### Screen Dependencies

**Screens still depend on master-setting/transport/transportService.js:**
- ✅ TransportSettings.jsx (`/master-setting/transport`)
- ✅ TransportRoutes.jsx (`/master-setting/transport/routes`)

**Status:** BOTH SCREENS ACTIVE AND DEPENDENT

---

**STEP-1 COMPLETE**

**Status:** Transport caller map complete  
**Total Callers:** 4 (2 per service)  
**Active Callers:** 4  
**Dead Callers:** 0  
**Legacy Callers:** 2 (Service B)  
**Screen Dependencies:** 2 screens depend on master-setting/transport

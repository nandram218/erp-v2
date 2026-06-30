# module-transport
> Transport Management Module documentation

## Ownership
- Module: `src/modules/transport/`
- Master-setting: `src/master-setting/transport/`
- Service: `src/services/transportService.js`

## Responsibilities
- Route & stop management
- Vehicle & driver management
- Student transport assignment
- Transport fee integration

## Data Entities
- Route: schoolId, id, name, stops, ...
- Vehicle: schoolId, id, registrationNumber, capacity, ...
- Stop: schoolId, id, routeId, name, ...
- TransportAllocation: schoolId, id, studentId, routeId, stopId, ...

## Rules (see PACK-01)
- TR-01..TR-03
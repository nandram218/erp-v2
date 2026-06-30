# module-hostel
> Hostel Management Module documentation

## Ownership
- Module: `src/modules/hostel/`
- Master-setting: `src/master-setting/hostel/`
- Service: `src/services/hostelService.js`

## Responsibilities
- Room management
- Student allocation
- Warden assignment
- Mess/amenities tracking

## Data Entities
- Room: schoolId, id, name, capacity, ...
- Allocation: schoolId, id, studentId, roomId, from, to
- Warden: schoolId, id, userId, roomId, ...

## Rules
- Allocation must not exceed room capacity
- Rooms cannot be double-booked
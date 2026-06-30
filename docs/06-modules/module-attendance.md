# module-attendance
> Attendance Management Module documentation

## Ownership
- Module: `src/modules/attendance/`
- Service: (to be assigned)

## Responsibilities
- Daily attendance marking
- Attendance reports
- Leave management integration
- SMS/notification triggers

## Data Entities
- AttendanceRecord: schoolId, id, studentId, date, status, ...
- LeaveRequest: schoolId, id, studentId, from, to, reason, ...

## Rules
- One record per student per date
- Attendance can only be modified by teacher/warden
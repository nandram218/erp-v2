# module-students
> Student Management Module documentation

## Ownership
- Module: `src/modules/students/`
- Master-setting: `src/master-setting/classes-subjects/`
- Service: `src/services/studentService.js`

## Responsibilities
- Student CRUD
- ID cards & certificates
- Duplicate prevention
- Soft delete only

## Data Entities
- Student: schoolId, id, firstName, lastName, dob, gender, classId, ...
- Certificate: schoolId, id, studentId, type, issuedAt
- ID Card: schoolId, id, studentId, validFrom, validTo

## Rules (see PACK-01)
- S-01..S-04
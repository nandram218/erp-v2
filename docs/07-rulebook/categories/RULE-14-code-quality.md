# RULE-14: Code Quality Standards

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Architecture Team  
**Severity:** MEDIUM  
**Category:** Quality  
**Applies To:** All code - JavaScript, React, CSS  
**Detection Method:** Linting, Static Analysis, Code Review  
**Auto-Fix Available:** Yes  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Naming](#naming)
5. [Complexity](#complexity)
6. [Function Size](#function-size)
7. [File Size](#file-size)
8. [React Best Practices](#react-best-practices)
9. [Duplicate Detection](#duplicate-detection)
10. [Magic Numbers](#magic-numbers)
11. [Imports](#imports)
12. [Exports](#exports)

---

## WHY

### Business Rationale
- **Maintenance Cost**: Poor code quality increases maintenance cost by 40%.
- **Bug Rate**: High complexity correlates with higher defect density.
- **Onboarding Time**: Clean code reduces new developer ramp-up time by 50%.
- **Technical Debt**: Code quality issues accumulate as debt.

### Technical Rationale
- **Readability**: Clean code is self-documenting.
- **Maintainability**: Simple code is easier to modify safely.
- **Testability**: Well-structured code is easier to test.
- **Performance**: Quality code often performs better.

---

## WHEN

### Applies To
- **All Code**: Every line of code committed.
- **All Pull Requests**: Must pass quality checks.
- **All Code Reviews**: Quality is review criteria.
- **All Refactoring**: Improve code quality.

### Does NOT Apply To
- Auto-generated code (different standards)
- Third-party libraries (not maintained by us)
- Experimental/spike code (throwaway)

---

## WHERE

### Scope
- **JavaScript/JSX**: `src/**/*.js`, `src/**/*.jsx`
- **CSS**: `**/*.css`, `**/*.module.css`
- **Configuration**: `.eslintrc`, `.prettierrc`

---

## Naming

### 1.1 Naming Conventions

**RULE CQ-NAME-01**: Descriptive, intention-revealing names.

```javascript
// CORRECT: Descriptive names
const studentCount = students.length;
const isEligibleForDiscount = student.fees > 1000;
const calculateTotalFee = (baseFee, discount) => baseFee - discount;
const hasValidAdmissionNumber = /^[A-Z0-9-]+$/.test(admissionNumber);

// FORBIDDEN: Vague names
const x = students.length;
const flag = student.fees > 1000;
const calc = (a, b) => a - b;
const check = /^[A-Z0-9-$/;
```

### 1.2 Naming Patterns

```javascript
// CORRECT: Consistent patterns

// Booleans: is/has/can/should prefix
const isActive = true;
const hasPermission = false;
const canEdit = true;
const shouldNotify = false;

// Functions: verb + noun
function getStudentById(id) { }
function calculateTotalFees(studentId) { }
function validateAdmissionNumber(number) { }
function sendNotification(userId, message) { }

// Classes: PascalCase nouns
class StudentService { }
class FeeCalculator { }
class AttendanceTracker { }

// Constants: UPPER_SNAKE_CASE
const MAX_STUDENT_LIMIT = 5000;
const DEFAULT_CURRENCY = 'INR';
const FEE_PAYMENT_TERMS = 30;

// Private fields: _prefix
class StudentService {
  _cache = new Map();
  
  _generateAdmissionNumber() {
    // Private method
  }
}
```

### 1.3 Abbreviations

**RULE CQ-NAME-02**: Avoid abbreviations except universal ones.

```javascript
// CORRECT: Universal abbreviations okay
const id = 'student-123';
const url = 'https://example.com';
const httpClient = new HTTPClient();
const ttl = 5000; // Time to live (common)

// CORRECT: Abbreviate if full form is awkward
const numStudents = 50; // number → num
const maxItemsPerPage = 50; //

// FORBIDDEN: Unclear abbreviations
const std = new Student(); // Is this student, standard, or studio?
const cnt = students.length; // Count? Contains?
const fn = () => {}; // Function? First name?
const x = calcY(z); // What are x, Y, z?

// CORRECT: Use full words
const student = new Student();
const count = students.length;
const calculateFee(studentId) { }
```

---

## Complexity

### 2.1 Cyclomatic Complexity

**RULE CQ-COMP-01**: Keep complexity low.

```javascript
// Cyclomatic complexity = number of execution paths
// Target: < 10
// Maximum: 15

// CORRECT: Low complexity (3)
function isEligibleForScholarship(student) {
  if (student.income < 100000) {
    return true;
  }
  return false;
}

// FORBIDDEN: High complexity (12)
function processStudentData(student, options) {
  if (student) {
    if (student.classId) {
      if (options.includeFees) {
        if (student.fees > 0) {
          if (student.fees.paid) {
            // ... deeply nested
          }
        }
      }
    }
  }
}

// CORRECT: Reduce complexity with early returns
function processStudentData(student, options) {
  if (!student) return null;
  if (!student.classId) return null;
  if (!options.includeFees) return student;
  if (student.fees <= 0) return student;
  
  // Main logic here (less indentation)
  return calculateFees(student);
}

// CORRECT: Extract complex conditions
function canPromoteStudent(student, academicYear) {
  const hasPassedAllSubjects = checkAllSubjectsPassed(student);
  const hasMinimumAttendance = checkAttendance(student);
  const hasNoOutstandingFees = checkFeesCleared(student);
  const isPromotionWindowOpen = checkPromotionWindow(academicYear);
  
  return hasPassedAllSubjects && 
         hasMinimumAttendance && 
         hasNoOutstandingFees &&
         isPromotionWindowOpen;
}
```

### 2.2 Complexity Metrics

```javascript
const ComplexityLimits = {
  cyclomatic: {
    max: 10,
    ideal: 5,
    action: 'Refactor if exceeded'
  },
  
  cognitive: {
    max: 15,
    ideal: 10,
    action: 'Extract functions'
  },
  
  nesting: {
    max: 4,
    ideal: 2,
    action: 'Use early returns'
  },
  
  parameters: {
    max: 4,
    ideal: 3,
    action: 'Use parameter object'
  }
};
```

---

## Function Size

### 3.1 Function Length Rules

**RULE CQ-FUNC-01**: Functions should do one thing.

```javascript
// CORRECT: Small, focused functions
function createStudent(studentData) {
  const validated = validateStudent(studentData);
  const normalized = normalizeStudent(validated);
  const student = saveStudent(normalized);
  notifyStudentCreated(student);
  return student;
}

// Each function is 5-15 lines
function validateStudent(studentData) {
  // 10 lines
}
function normalizeStudent(studentData) {
  // 8 lines
}
function saveStudent(studentData) {
  // 12 lines
}
function notifyStudentCreated(student) {
  // 5 lines
}

// FORBIDDEN: 100-line function
function createStudent(studentData) {
  // 100 lines doing everything
}

// CORRECT: Extract complex logic
async function processStudentEnrollment(studentId, classId) {
  // High-level workflow (5 lines)
  await validateEnrollmentEligibility(studentId);
  await allocateSeat(classId);
  await updateStudentClass(studentId, classId);
  await generateAdmissionLetter(studentId);
  await sendConfirmationEmail(studentId);
}

// Detailed logic in separate functions
async function validateEnrollmentEligibility(studentId) {
  // 20 lines
}
async function allocateSeat(classId) {
  // 25 lines
}
```

### 3.2 Function Purpose

**RULE CQ-FUNC-02**: Functions should be pure when possible.

```javascript
// CORRECT: Pure function (no side effects)
function calculateFee(baseFee, discount) {
  return baseFee * (1 - discount);
}

// Testable, predictable, reusable

// CORRECT: Impure function (has side effects, but isolated)
async function saveStudent(student) {
  // Side effect: writes to Storage Layer
  await storageService.insert({
    collection: 'students',
    data: student
  });
}

// FORBIDDEN: Mixing pure and impure
function processAndSaveStudent(studentData) {
  // Pure logic
  const fee = calculateFee(studentData.baseFee, studentData.discount);
  
  // Impure logic (side effect)
  await storageService.insert({
    collection: 'students',
    data: { ...studentData, fee }
  });
  
  // More pure logic
  return fee;
}
```

---

## File Size

### 4.1 File Size Limits

**RULE CQ-FILE-01**: Keep files small and focused.

| File Type | Maximum | Ideal | Action if Exceeded |
|-----------|---------|-------|-------------------|
| Component (.jsx) | 300 lines | 150 lines | Extract sub-components |
| Service (.js) | 500 lines | 300 lines | Split into multiple services |
| Utility (.js) | 200 lines | 100 lines | Split utilities |
| Test (.test.js) | 500 lines | 300 lines | Split test suites |
| CSS (.css) | 400 lines | 200 lines | Split by component |

### 4.2 File Organization

```javascript
// CORRECT: Small, focused files

// StudentService.js (400 lines)
export class StudentService {
  // CRUD operations
}

// StudentValidator.js (200 lines)
export class StudentValidator {
  // Validation logic
}

// StudentNotifier.js (150 lines)
export class StudentNotifier {
  // Notification logic
}

// FORBIDDEN: Monolithic files

// StudentService.js (2000 lines)
export class StudentService {
  // Everything in one file
}
```

---

## React Best Practices

### 5.1 Component Structure

**RULE CQ-REACT-01**: Presentational vs Container pattern.

```javascript
// CORRECT: Presentational component (UI only)
function StudentRow({ student, onEdit }) {
  return (
    <tr>
      <td>{student.name}</td>
      <td>{student.classId}</td>
      <td>
        <Button onClick={() => onEdit(student.id)}>Edit</Button>
      </td>
    </tr>
  );
}

// CORRECT: Container component (logic)
function StudentTableContainer() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadStudents();
  }, []);
  
  async function loadStudents() {
    setLoading(true);
    const data = await StudentService.getAll();
    setStudents(data);
    setLoading(false);
  }
  
  function handleEdit(studentId) {
    // Navigation logic
    navigate(`/students/${studentId}`);
  }
  
  if (loading) return <Spinner />;
  
  return (
    <StudentTable 
      students={students}
      onEdit={handleEdit}
    />
  );
}

// FORBIDDEN: Mixed concerns
function StudentTable() {
  // Logic
  const [students, setStudents] = useState([]);
  async function loadStudents() { /* ... */ }
  
  // UI
  return (
    <table>
      {students.map(/* ... */)}
    </table>
  );
}
```

### 5.2 Hooks Usage

**RULE CQ-REACT-02**: Custom hooks for reusable logic.

```javascript
// CORRECT: Extract reusable logic to custom hook
function useStudents(classId) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await StudentService.getByClass(classId);
        setStudents(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    load();
  }, [classId]);
  
  return { students, loading, error };
}

// Usage
function StudentTable({ classId }) {
  const { students, loading, error } = useStudents(classId);
  
  if (loading) return <Spinner />;
  if (error) return <Error error={error} />;
  
  return <Table data={students} />;
}

// FORBIDDEN: Duplicate logic in components
function ComponentA() {
  const [students, setStudents] = useState([]);
  // 30 lines of identical loading logic
}

function ComponentB() {
  const [students, setStudents] = useState([]);
  // 30 lines of identical loading logic
}
```

---

## Duplicate Detection

### 6.1 DRY Principle

**RULE CQ-DRY-01**: Don't Repeat Yourself.

```javascript
// FORBIDDEN: Duplicated code
// File A
function formatStudentName(student) {
  return `${student.firstName} ${student.lastName}`.trim();
}

// File B (copy-pasted)
function formatTeacherName(teacher) {
  return `${teacher.firstName} ${teacher.lastName}`.trim();
}

// CORRECT: Shared utility
// utils/nameFormatter.js
export function formatName(firstName, lastName) {
  return `${firstName} ${lastName}`.trim();
}

// Usage
const studentName = formatName(student.firstName, student.lastName);
const teacherName = formatName(teacher.firstName, teacher.lastName);

// FORBIDDEN: Duplicate business logic
// StudentService.js
function calculateTotalFees(student) {
  let total = student.baseFee;
  if (student.hasSibling) total *= 0.85; // 15% discount
  if (student.isEarlyPayment) total *= 0.95; // 5% discount
  return total;
}

// FeesService.js (copy-pasted)
function calculateStudentFee(student) {
  let total = student.baseFee;
  if (student.hasSibling) total *= 0.85; // Same logic!
  if (student.isEarlyPayment) total *= 0.95; // Same logic!
  return total;
}

// CORRECT: Single source of truth
// core/fee-engine/feeCalculator.js
export function calculateStudentFee(student) {
  // 20 lines of well-tested logic
}

// Both services use same function
import { calculateStudentFee } from '@/core/fee-engine/feeCalculator';
```

---

## Magic Numbers

### 7.1 Named Constants

**RULE CQ-MAGIC-01**: No magic numbers.

```javascript
// FORBIDDEN: Magic numbers
if (student.fees > 1000) { }
setTimeout(callback, 86400000);
const discount = price * 0.15;
const maxStudents = 5000;
const bufferSize = 1024 * 1024;

// CORRECT: Named constants
const DISCOUNT_RATE = 0.15;
const MAX_STUDENTS = 5000;
const BUFFER_SIZE = 1024 * 1024;

if (student.fees > SCHOLARSHIP_THRESHOLD) { }
setTimeout(callback, ONE_DAY_IN_MS);
const discount = price * SIBLING_DISCOUNT_RATE;

// CORRECT: Configuration object
const FeeConfig = {
  SIBLING_DISCOUNT: 0.15,
  EARLY_PAYMENT_DISCOUNT: 0.05,
  MAX_DISCOUNT: 0.20,
  SCHOLARSHIP_THRESHOLD: 1000,
  PAYMENT_TERM_DAYS: 30,
  LATE_FEE_PERCENTAGE: 0.02
};

// Usage
const totalDiscount = Math.min(
  (student.hasSibling ? FeeConfig.SIBLING_DISCOUNT : 0) +
  (student.isEarlyPayment ? FeeConfig.EARLY_PAYMENT_DISCOUNT : 0),
  FeeConfig.MAX_DISCOUNT
);
```

---

## Imports

### 8.1 Import Organization

**RULE CQ-IMP-01**: Organize imports consistently.

```javascript
// CORRECT: Import Fee Transaction
// 1. External packages
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';

// 2. Internal packages (alias imports)
import { StorageService } from '@/services/storageService';
import { EventBus } from '@/services/eventService';
import { formatDate } from '@/utils/dateUtils';

// 3. Module imports
import { StudentService } from '../services/studentService';
import { StudentValidator } from '../validation/studentValidator';

// 4. Relative imports
import StudentTable from './StudentTable';
import StudentForm from './StudentForm';

// 5. Styles (last)
import './StudentPage.css';

// FORBIDDEN: Unorganized imports
import React from 'react';
import StudentTable from './StudentTable';
import { z } from 'zod';
import { EventBus } from '@/services/eventService';
```

### 8.2 Import Restrictions

**RULE CQ-IMP-02**: No wildcard imports.

```javascript
// CORRECT: Named imports
import { formatDate, parseDate } from '@/utils/dateUtils';

// FORBIDDEN: Wildcard import
import * as DateUtils from '@/utils/dateUtils';
DateUtils.formatDate();

// CORRECT: Import what you use
import { debounce } from 'lodash-es';

// FORBIDDEN: Import entire library
import _ from 'lodash';

// FORBIDDEN: Import from barrel files (causes bloat)
import { StudentService } from '@/modules'; // Imports everything!
```

---

## Exports

### 9.1 Export Organization

**RULE CQ-EXP-01**: Clear exports.

```javascript
// CORRECT: Single export per line
export function createStudent() { }
export function updateStudent() { }
export function deleteStudent() { }

// FORBIDDEN: Multiple exports per line
export function createStudent() { } export function updateStudent() { }

// CORRECT: Named exports (preferred)
export const StudentService = { /* ... */ };
export { StudentService as default };

// ACCEPTABLE: Default export for main component
export default function StudentPage() { }

// FORBIDDEN: Mixed default and named
export default function StudentService() { }
export const createStudent = () => { };
// Confusing: Which is the 'main' export?

// CORRECT: Barrel file for module
// src/modules/students/index.js
export { StudentService } from './services/studentService';
export { StudentValidator } from './validation/studentValidator';
export { StudentTable } from './components/StudentTable';
export { StudentForm } from './components/StudentForm';

// Usage (clear what's exported)
import { StudentService, StudentForm } from '@/modules/students';
```

---

## Code Smells

### 10.1 Code Smell Detection

**RULE CQ-SMELL-01**: Detect and fix code smells.

```javascript
// Code Smell: Long Method
// Problem: 100-line method doing multiple things
// Fix: Extract methods

// Code Smell: Large Class
// Problem: 2000-line service handling everything
// Fix: Split into focused services

// Code Smell: Duplicate Code
// Problem: Same logic in 5 places
// Fix: Extract to shared utility

// Code Smell: Long Parameter List
// Problem: 8 parameters in function
// Fix: Use parameter object

// Code Smell: Feature Envy
// Problem: Function uses another class excessively
// Fix: Move function to that class

// Code Smell: Data Clumps
// Problem: Same 3 fields always together
// Fix: Create object for them

// Code Smell: Primitive Obsession
// Problem: Using strings for everything
// Fix: Create value objects

// CORRECT: Value object
class Email {
  constructor(value) {
    this.value = value;
    this.validate();
  }
  
  validate() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value)) {
      throw new Error('Invalid email');
    }
  }
}

// Usage
const email = new Email('Student/Parent@example.com');
```

---

## Linting & Formatting

### 11.1 Tooling

**RULE CQ-LINT-01**: Automated code quality enforcement.

```javascript
// .eslintrc.js
export default {
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  
  rules: {
    // Complexity
    'complexity': ['error', 10],
    'max-depth': ['error', 4],
    'max-lines-per-function': ['error', 50],
    'max-parameters': ['error', 4],
    
    // Naming
    'func-names': 'error',
    'camelcase': 'error',
    'new-cap': 'error',
    
    // Best practices
    'no-unused-vars': 'error',
    'no-console': 'warn',
    'no-debugger': 'error',
    'eqeqeq': 'error',
    'curly': 'error',
    
    // React
    'react/prop-types': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
};

// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 11.2 Husky Integration

```json
// package.json
{
  "scripts": {
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,css}\"",
    "quality": "npm run lint && npm run format"
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run test:affected",
      "pre-push": "npm run test:ci"
    }
  }
}
```

---

## Code Review Checklist

### 12.1 Quality Checklist


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

**RULE CQ-REVIEW-01**: Code quality review criteria.

```javascript
const CodeQualityChecklist = {
  naming: [
    'Names reveal intention',
    'No abbreviations',
    'Consistent naming style',
    'Constants are UPPER_CASE'
  ],
  
  functions: [
    'Do one thing',
    'Less than 50 lines',
    'Less than 4 parameters',
    'No side effects (or clearly isolated)',
    'Descriptive names'
  ],
  
  complexity: [
    'Cyclomatic complexity < 10',
    'Nesting depth < 4',
    'No deeply nested if-else',
    'Early returns used'
  ],
  
  duplication: [
    'No copy-pasted code',
    'DRY principle followed',
    'Shared utilities extracted'
  ],
  
  comments: [
    'Explains why, not what',
    'No commented-out code',
    'Public APIs documented',
    'Business rules explained'
  ],
  
  structure: [
    'Files < 300 lines',
    'One component per file',
    'Logical organization',
    'No circular dependencies'
  ]
};
```

---

*End of RULE-14: Code Quality Standards*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

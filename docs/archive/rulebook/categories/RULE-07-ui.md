# RULE-07: UI & Component Standards

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Frontend Team  
**Severity:** MEDIUM  
**Category:** Frontend  
**Applies To:** All React components, UI logic, styling, Student/Parent interactions  
**Detection Method:** Component Tests, Visual Regression, Linting, Code Review  
**Auto-Fix Available:** Yes  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Professional React Standards](#professional-react-standards)
5. [Reusable Components](#reusable-components)
6. [Rendering Rules](#rendering-rules)
7. [State Rules](#state-rules)
8. [Forms](#forms)
9. [Validation](#validation)
10. [Accessibility](#accessibility)
11. [Responsive Rules](#responsive-rules)
12. [Performance](#performance)
13. [Large Tables](#large-tables)
14. [Dialogs](#dialogs)
15. [Theme Rules](#theme-rules)

---

## WHY

### Business Rationale
- **Student/Parent Experience**: Consistent, professional UI builds trust with school administrators.
- **Accessibility**: Legal requirement (WCAG 2.1) - schools must accommodate disabled users.
- **Efficiency**: Reusable components reduce development time by 40%.
- **Brand Consistency**: Each school wants professional, branded experience.

### Technical Rationale
- **Maintainability**: Consistent patterns reduce bugs and onboarding time.
- **Performance**: Optimized rendering ensures smooth UX with large datasets.
- **Testability**: Well-structured components are easier to test.
- **Accessibility**: Screen reader support, keyboard navigation, semantic HTML.

---

## WHEN

### Applies To
- **All React Components**: Pages, components, layouts, hooks
- **All Student/Parent Interactions**: Clicks, form inputs, navigation
- **All Styling**: CSS, CSS modules, styled-components, themes
- **All Responsive Behavior**: Desktop, tablet, mobile

### Does NOT Apply To
- Third-party UI libraries (use adapter pattern)
- Marketing pages (different standards)
- Email templates (HTML emails)

---

## WHERE

### Scope
- **Feature Components**: `src/modules/{module}/components/`
- **Feature Pages**: `src/modules/{module}/pages/`
- **Shared Components**: `src/components/` or `src/shared/`
- **Layouts**: `src/layouts/`
- **Hooks**: `src/hooks/` or `src/modules/{module}/hooks/`
- **Styles**: `*.module.css`, `*.styled.js`

---

## Professional React Standards

### 1.1 Component Structure

**RULE UI-STR-01**: Functional components with hooks only.

```javascript
// CORRECT: Functional component
export function StudentTable({ students, onEdit }) {
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  
  return (
    <table>
      {/* Table content */}
    </table>
  );
}

// FORBIDDEN: Class components
export class StudentTable extends React.Component {
  // FORBIDDEN - use functional components
}
```

**RULE UI-STR-02**: One component per file.

```javascript
// CORRECT: One component per file
// StudentTable.jsx
export function StudentTable(props) { /* ... */ }

// StudentTableRow.jsx
export function StudentTableRow({ student }) { /* ... */ }

// StudentTableCell.jsx
export function StudentTableCell({ value }) { /* ... */ }

// FORBIDDEN: Multiple components in one file
// StudentTable.jsx
export function StudentTable() { /* ... */ }
export function StudentTableRow() { /* ... */ } // ❌ Should be separate file
```

**RULE UI-STR-03**: Named exports only.

```javascript
// CORRECT: Named exports
export function StudentTable() { /* ... */ }
export function StudentRow() { /* ... */ }
export function StudentCell() { /* ... */ }

// FORBIDDEN: Default export
export default function StudentTable() { /* ... */ }
```

### 1.2 Component Naming

**RULE UI-STR-04**: PascalCase for components.

```javascript
// CORRECT
StudentTable.jsx
StudentListPage.jsx
DashboardLayout.jsx
FeeCollectModal.jsx

// FORBIDDEN
studentTable.jsx
student-list-page.jsx
dashboard_layout.jsx
```

**RULE UI-STR-05**: Descriptive names indicating purpose.

```javascript
// CORRECT
ActiveStudentsTable.jsx
StudentEnrollmentForm.jsx
PendingFeePaymentsList.jsx

// FORBIDDEN (too vague)
Table.jsx
Form.jsx
List.jsx
```

### 1.3 Props Interface

**RULE UI-STR-06**: Explicit propTypes or TypeScript interfaces.

```javascript
// Using PropTypes
import PropTypes from 'prop-types';

function StudentTable({ students, onEdit, onDelete, isLoading }) {
  return (
    <table>
      {/* ... */}
    </table>
  );
}

StudentTable.propTypes = {
  students: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    classId: PropTypes.string.isRequired
  })).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

StudentTable.defaultProps = {
  isLoading: false
};

// Using TypeScript (preferred)
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  classId: string;
}

interface StudentTableProps {
  students: Student[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function StudentTable({ 
  students, 
  onEdit, 
  onDelete, 
  isLoading = false 
}: StudentTableProps) {
  // ...
}
```

### 1.4 Component Composition

**RULE UI-STR-07**: Composition over inheritance.

```javascript
// CORRECT: Composition
function Page({ header, sidebar, content, footer }) {
  return (
    <div className="page">
      {header}
      <div className="page-body">
        {sidebar}
        <main>{content}</main>
      </div>
      {footer}
    </div>
  );
}

// Usage
<Page
  header={<PageHeader title="Students" />}
  sidebar={<Sidebar />}
  content={<StudentTable students={students} />}
  footer={<PageFooter />}
/>

// FORBIDDEN: Inheritance
class BasePage extends React.Component { /* ... */ }
class StudentPage extends BasePage { /* ... */ }
```

---

## Reusable Components

### 2.1 Shared Component Library

**RULE UI-REUS-01**: Extract truly reusable UI into shared library.

```
ALLOWED in src/components/ or src/shared/:
- Button (generic button with variants)
- Input (text input with validation)
- Select (dropdown)
- Modal (dialog)
- Table (data table with sorting/pagination)
- Card (content card)
- Badge (status badge)
- Avatar (Student/Parent avatar)
- Spinner (loading indicator)
- Alert (message alert)
- ConfirmationDialog (yes/no dialog)

FORBIDDEN in shared:
- StudentTable (module-specific)
- FeeCollectModal (module-specific)
- DashboardLayout (application-specific)
```

### 2.2 Component API Design

**RULE UI-REUS-02**: Components are configurable via props.

```javascript
// CORRECT: Highly configurable
<Button
  variant="primary"      // primary, secondary, danger, ghost
  size="medium"          // small, medium, large
  disabled={false}
  loading={isSubmitting}
  icon={<SaveIcon />}
  iconPosition="left"    // left, right
  onClick={handleSave}
  fullWidth={false}
  type="button"
>
  Save Changes
</Button>

// FORBIDDEN: One-off components
<StudentSaveButton onClick={handleSave} />
```

### 2.3 Compound Components

```javascript
// CORRECT: Compound components for complex UI
<Card>
  <Card.Header>
    <Card.Title>Student Details</Card.Title>
    <Card.Actions>
      <Button>Edit</Button>
      <Button>Delete</Button>
    </Card.Actions>
  </Card.Header>
  <Card.Body>
    <StudentInfo student={student} />
  </Card.Body>
  <Card.Footer>
    <Text>Last updated: {formatDate(student.updatedAt)}</Text>
  </Card.Footer>
</Card>

// Implementation
function Card({ children }) {
  return <div className="card">{children}</div>;
}

Card.Header = function CardHeader({ children }) {
  return <div className="card-header">{children}</div>;
};

Card.Title = function CardTitle({ children }) {
  return <h3 className="card-title">{children}</h3>;
};
```

---

## Rendering Rules

### 3.1 Conditional Rendering

**RULE UI-REND-01**: Use ternary for conditionals.

```javascript
// CORRECT: Ternary operator
<div>
  {isLoading ? <Spinner /> : <StudentTable students={students} />}
</div>

// CORRECT: && for showing/hiding
<div>
  {error && <Alert type="error" message={error} />}
</div>

// CORRECT: Early return
function StudentPage() {
  if (!student) {
    return <NotFound message="Student not found" />;
  }
  
  return <StudentDetail student={student} />;
}

// ACCEPTABLE: if-else (for complex logic)
function StudentPage() {
  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <ErrorAlert error={error} />;
  } else if (student) {
    return <StudentDetail student={student} />;
  } else {
    return <NotFound />;
  }
}
```

### 3.2 List Rendering

**RULE UI-REND-02**: Always use keys for lists.

```javascript
// CORRECT: Stable, unique key
{students.map(student => (
  <StudentRow 
    key={student.id} 
    student={student} 
  />
))}

// ACCEPTABLE: Composite key (if no unique field)
{classes.map(cls => (
  <ClassOption 
    key={`${cls.academicYear}-${cls.id}`} 
    class={cls} 
  />
))}

// FORBIDDEN: Index as key (if list can reorder)
{students.map((student, index) => (
  <StudentRow key={index} student={student} /> // ❌
))}

// FORBIDDEN: No key
{students.map(student => (
  <StudentRow student={student} /> // ❌ Missing key
))}
```

### 3.3 Empty States

**RULE UI-REND-03**: Always provide empty state.

```javascript
function StudentTable({ students }) {
  if (students.length === 0) {
    return (
      <EmptyState
        icon={<UsersIcon />}
        title="No students found"
        description="Get started by adding your first student."
        action={
          <Button onClick={handleAddStudent}>
            Add Student
          </Button>
        }
      />
    );
  }
  
  return <table>{/* ... */}</table>;
}
```

### 3.4 Loading States

**RULE UI-REND-04**: Skeleton screens over spinners.

```javascript
// CORRECT: Skeleton screen
function StudentTable({ students, isLoading }) {
  if (isLoading) {
    return (
      <div className="table-skeleton">
        <SkeletonRow count={10} />
      </div>
    );
  }
  
  return <table>{/* ... */}</table>;
}

// ACCEPTABLE: Spinner (for initial page load)
function StudentPage() {
  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }
  
  return <StudentTable students={students} />;
}
```

---

## State Rules

### 4.1 State Management

**RULE UI-STATE-01**: Lift state up only when necessary.

```javascript
// CORRECT: Local state for isolated component
function SearchInput({ onSearch }) {
  const [query, setQuery] = useState('');
  
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
    />
  );
}

// CORRECT: Lift state when siblings need to share
function FilterPanel({ onFilter }) {
  const [classId, setClassId] = useState('');
  const [section, setSection] = useState('');
  
  useEffect(() => {
    onFilter({ classId, section });
  }, [classId, section]);
  
  return (
    <>
      <ClassSelect value={classId} onChange={setClassId} />
      <SectionSelect value={section} onChange={setSection} />
    </>
  );
}
```

### 4.2useState Best Practices

**RULE UI-STATE-02**: Group related state.

```javascript
// CORRECT: Group related state
const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
});

const handleChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};

// FORBIDDEN: Separate state for related data
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [email, setEmail] = useState('');
const [phone, setPhone] = useState('');
```

### 4.3 Derived State

**RULE UI-STATE-03**: Compute derived state, don't duplicate.

```javascript
// CORRECT: Derive state
const fullName = `${firstName} ${lastName}`;

// CORRECT: Derive with useMemo for expensive computation
const sortedStudents = useMemo(() => {
  return [...students].sort((a, b) => 
    a[sortKey].localeCompare(b[sortKey])
  );
}, [students, sortKey]);

// FORBIDDEN: Duplicate state
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [fullName, setFullName] = useState(''); // ❌ Derived - don't duplicate
```

### 4.4 useEffect Best Practices

**RULE UI-STATE-04**: Use useEffect for side effects only.

```javascript
// CORRECT: useEffect for data fetching
useEffect(() => {
  let isMounted = true;
  
  async function loadStudents() {
    const data = await StudentService.getAll();
    if (isMounted) {
      setStudents(data);
    }
  }
  
  loadStudents();
  
  return () => {
    isMounted = false; // Cleanup
  };
}, []); // Empty deps = run once on mount

// CORRECT: useEffect for subscriptions
useEffect(() => {
  const handler = (event) => {
    console.log('Student updated', event);
  };
  
  EventBus.on('Student.Updated', handler);
  
  return () => {
    EventBus.off('Student.Updated', handler); // Cleanup
  };
}, []);

// FORBIDDEN: useEffect for derived state
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${firstName} ${lastName}`); // ❌ Use derived state instead
}, [firstName, lastName]);
```

---

## Forms

### 5.1 Form Structure

**RULE UI-FRM-01**: Controlled components.

```javascript
function StudentForm({ onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    classId: initialData?.classId || ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const validationResult = await validateForm(formData);
    if (!validationResult.success) {
      setErrors(validationResult.errors);
      return;
    }
    
    // Submit
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when Student/Parent corrects
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label="First Name"
        name="firstName"
        value={formData.firstName}
        onChange={(value) => handleChange('firstName', value)}
        error={errors.firstName}
        required
      />
      
      <FormField
        label="Last Name"
        name="lastName"
        value={formData.lastName}
        onChange={(value) => handleChange('lastName', value)}
        error={errors.lastName}
        required
      />
      
      {errors.submit && <Alert type="error" message={errors.submit} />}
      
      <Button type="submit" loading={isSubmitting}>
        Save Student
      </Button>
    </form>
  );
}
```

### 5.2 Form Validation

**RULE UI-FRM-02**: Validate on blur and submit.

```javascript
function ValidatedInput({ label, name, value, onChange, schema }) {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState(null);
  
  // Validate on blur
  const handleBlur = () => {
    setTouched(true);
    const result = schema.safeParse(value);
    setError(result.success ? null : result.error.issues[0]);
  };
  
  // Validate on change (only if already touched)
  useEffect(() => {
    if (touched) {
      const result = schema.safeParse(value);
      setError(result.success ? null : result.error.issues[0]);
    }
  }, [value, touched, schema]);
  
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        className={error ? 'input-error' : ''}
      />
      {error && <span className="error-message">{error.message}</span>}
    </div>
  );
}
```

---

## Validation

### 6.1 Input Validation

**RULE UI-VAL-01**: School/Tenant-side validation mirrors server-side.

```javascript
// Validation schema (shared between School/Tenant and server)
import { z } from 'zod';

export const StudentSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  dateOfBirth: z.coerce.date().refine(
    (date) => date < new Date(),
    'Date of birth must be in the past'
  ),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  classId: z.string().uuid().refine(
    async (id) => await classExists(id),
    'Class does not exist'
  ),
  admissionNumber: z.string().min(1).max(20)
});

// Use in form
const result = StudentSchema.safeParse(formData);
if (!result.success) {
  const errors = result.error.flatten().fieldErrors;
  setErrors(errors);
}
```

---

## Accessibility

### 7.1 Accessibility Standards

**RULE UI-A11Y-01**: WCAG 2.1 AA compliance.

```javascript
// CORRECT: Accessible button
<button
  onClick={handleSubmit}
  disabled={isSubmitting}
  aria-busy={isSubmitting}
  aria-label="Save student information"
>
  {isSubmitting ? 'Saving...' : 'Save'}
</button>

// FORBIDDEN: Div as button
<div onClick={handleSubmit}>Save</div> // ❌ Not accessible

// CORRECT: Form labels
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  aria-describedby="email-help email-error"
  aria-invalid={!!errors.email}
/>
<p id="email-help">We'll never share your email.</p>
{errors.email && <p id="email-error" role="alert">{errors.email}</p>}

// CORRECT: Semantic HTML
<header>...</header>
<nav>...</nav>
<main>...</main>
<aside>...</aside>
<footer>...</footer>

// CORRECT: Heading hierarchy
<h1>Student Management</h1>
  <h2>Student List</h2>
    <h3>Filters</h3>
    <h3>Results</h3>
      <h4>John Doe</h4> // Student name in table row

// CORRECT: Focus management in modals
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef();
  const previousFocus = useRef();
  
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      modalRef.current.focus();
      
      // Trap focus within modal
      const handler = (e) => {
        if (e.key === 'Tab') {
          // Focus trap logic
        }
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    } else {
      previousFocus.current?.focus();
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div role="dialog" aria-modal="true" ref={modalRef}>
      {children}
    </div>
  );
}
```

---

## Responsive Rules

### 8.1 Responsive Design

**RULE UI-RESP-01**: Mobile-first responsive design.

```css
/* CORRECT: Mobile-first */
.student-table {
  /* Mobile: Stack vertically */
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .student-table {
    /* Tablet: Horizontal layout */
    flex-direction: row;
  }
}

@media (min-width: 1024px) {
  .student-table {
    /* Desktop: Full table */
    display: table;
  }
}
```

**RULE UI-RESP-02**: Breakpoints.

| Breakpoint | Width | Device |
|------------|-------|--------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Laptop |
| xl | 1280px | Desktop |
| 2xl | 1536px | Large desktop |

---

## Performance

### 9.1 Render Optimization

**RULE UI-PERF-01**: Memoize expensive computations.

```javascript
import { useMemo, useCallback, memo } from 'react';

// Memoize expensive calculations
function StudentDashboard({ students, fees }) {
  const stats = useMemo(() => {
    return {
      totalStudents: students.length,
      totalFees: fees.reduce((sum, fee) => sum + fee.amount, 0),
      paidFees: fees.filter(f => f.status === 'PAID').length,
      // ... more calculations
    };
  }, [students, fees]); // Only recompute if data changes
  
  return <DashboardStats stats={stats} />;
}

// Memoize callbacks
function StudentFilters({ onFilter }) {
  const handleClassChange = useCallback((classId) => {
    onFilter({ classId });
  }, [onFilter]);
  
  const handleSectionChange = useCallback((section) => {
    onFilter({ section });
  }, [onFilter]);
  
  return (
    <>
      <ClassSelect onChange={handleClassChange} />
      <SectionSelect onChange={handleSectionChange} />
    </>
  );
}
```

**RULE UI-PERF-02**: Memoize components.

```javascript
// Memoize child components
const StudentRow = memo(function StudentRow({ student, onEdit }) {
  return (
    <tr>
      <td>{student.name}</td>
      <td>{student.classId}</td>
      <td>
        <Button onClick={() => onEdit(student.id)}>Edit</Button>
      </td>
    </tr>
  );
});

StudentRow.displayName = 'StudentRow';
```

---

## Large Tables

### 10.1 Virtualization

**RULE UI-TABLE-01**: Virtualize large tables.

```javascript
import { useVirtualizer } from '@tanstack/react-virtual';

function LargeStudentTable({ students, onEdit }) {
  const parentRef = useRef();
  
  const virtualizer = useVirtualizer({
    count: students.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Row height in pixels
    overscan: 5 // Render 5 extra rows above/below viewport
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <table style={{ height: `${virtualizer.getTotalSize()}px` }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Class</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {virtualizer.getVirtualItems().map(virtualRow => {
            const student = students[virtualRow.index];
            return (
              <tr
                key={student.id}
                style={{
                  position: 'absolute',
                  transform: `translateY(${virtualRow.start}px)`
                }}
              >
                <td>{student.name}</td>
                <td>{student.classId}</td>
                <td>
                  <Button onClick={() => onEdit(student.id)}>Edit</Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

**RULE UI-TABLE-02**: Pagination for non-virtualized tables.

```javascript
function StudentTable({ students, total, page, onPageChange }) {
  const pageSize = 50;
  const totalPages = Math.ceil(total / pageSize);
  
  return (
    <div>
      <table>
        {/* Table content */}
      </table>
      
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
```

---

## Dialogs

### 11.1 Dialog Standards

**RULE UI-DLG-01**: Use semantic dialog elements.

```javascript
function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  
  return (
    <dialog open={isOpen} onClose={onCancel}>
      <h2>{title}</h2>
      <p>{message}</p>
      <div className="dialog-actions">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </dialog>
  );
}

// For broader compatibility
function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  
  useEffect(() => {
    // Focus first button
    const button = document.querySelector('[data-autofocus]');
    button?.focus();
  }, []);
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-message"
    >
      <h2 id="dialog-title">{title}</h2>
      <p id="dialog-message">{message}</p>
      <div className="dialog-actions">
        <Button variant="secondary" onClick={onCancel} data-autofocus>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  );
}
```

---

## Theme Rules

### 12.1 Theming System

**RULE UI-THEME-01**: CSS custom properties for theming.

```css
/* src/styles/theme.css */
:root {
  /* Primary colors */
  --color-primary: #1a5490;
  --color-primary-hover: #153d75;
  --color-primary-light: #e6f0fa;
  
  /* Secondary colors */
  --color-secondary: #f39c12;
  --color-secondary-hover: #d68910;
  
  /* Status colors */
  --color-success: #28a745;
  --color-warning: #ffc107;
  --color-error: #dc3545;
  --color-info: #17a2b8;
  
  /* Text colors */
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-inverse: #ffffff;
  
  /* Background colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
  
  /* Border colors */
  --border-color: #dee2e6;
  --border-radius: 4px;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* Apply tenant branding */
[data-tenant="tenant-abc"] {
  --color-primary: #1a5490;
  --color-secondary: #f39c12;
}
```

**RULE UI-THEME-02**: Use theme tokens, not hardcoded values.

```css
/* CORRECT */
.button {
  background: var(--color-primary);
  color: var(--text-inverse);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
}

/* FORBIDDEN */
.button {
  background: #1a5490; /* ❌ Hardcoded */
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
}
```

---

## Auto Fix

### 13.1 Auto-Fixable Issues


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

```javascript
// scripts/ui-fixes.js

export const UIFixes = {
  // Fix 1: Add missing key prop
  addMissingKeys(content, listVar, keyField = 'id') {
    // Detect map() without key
    return content.replace(
      /{(\w+)\.map\(\((\w+)\) =>/g,
      `{$1.map(($2) => <Component key={$2.${keyField}} ...`
    );
  },
  
  // Fix 2: Replace div with semantic element
  replaceDivWithSemantic(content, className) {
    const semanticMap = {
      'header': 'header',
      'footer': 'footer',
      'nav': 'nav',
      'main': 'main',
      'aside': 'aside',
      'article': 'article'
    };
    
    for (const [classPattern, element] of Object.entries(semanticMap)) {
      const regex = new RegExp(`<div className="${classPattern}"`, 'g');
      content = content.replace(regex, `<${element}`);
    }
    
    return content;
  },
  
  // Fix 3: Add missing aria-label
  addAriaLabels(content, componentName) {
    // Add aria-label to buttons without text
    return content.replace(
      /<Button(?!.*aria-label)([^>]*)\/>/g,
      `<Button aria-label="${componentName}"$1/>`
    );
  },
  
  // Fix 4: Replace index keys with stable keys
  fixIndexKeys(content, arrayName) {
    return content.replace(
      new RegExp(`key=\\{${arrayName}\.map\\(\\w+,\\s*index\\)`, 'g'),
      `key={$1.id}`
    );
  }
};
```

---

*End of RULE-07: UI & Component Standards*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

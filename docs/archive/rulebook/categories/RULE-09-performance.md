# RULE-09: Performance Standards

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Performance Team  
**Severity:** HIGH  
**Category:** Performance  
**Applies To:** Rendering, data fetching, caching, bundle size, large datasets  
**Detection Method:** Lighthouse CI, Performance Tests, Bundle Analysis, Monitoring  
**Auto-Fix Available:** Partial  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Rendering](#rendering)
5. [Caching](#caching)
6. [Bundle](#bundle)
7. [Virtualization](#virtualization)
8. [Memoization](#memoization)
9. [Lazy Loading](#lazy-loading)
10. [Storage Performance](#storage-performance)
11. [Search Performance](#search-performance)
12. [Large Dataset Rules](#large-dataset-rules)

---

## WHY

### Business Rationale
- **Student/Parent Productivity**: Slow UI frustrates users. Every 100ms delay reduces productivity by 1.5%.
- **Student/Parent Retention**: Applications loading >3 seconds lose 50% of users.
- **Hardware Constraints**: Schools may use older hardware; must work smoothly on low-end devices.
- **Scalability**: Performance degradation is exponential with data growth.

### Technical Rationale
- **Perceived Performance**: Users judge quality by UI responsiveness.
- **Resource Efficiency**: Reducing unnecessary re-renders saves CPU, memory, battery.
- **Network Efficiency**: Smaller bundles, fewer requests = faster load times.
- **Storage Layer Efficiency**: Proper indexing prevents query timeout on large datasets.

---

## WHEN

### Applies To
- **All Components**: Every React component must be performance-conscious.
- **All Data Operations**: Queries, mutations, subscriptions.
- **All Asset Loading**: Images, fonts, JavaScript bundles.
- **All Caching**: School/Tenant-side, server-side, service worker.

### Does NOT Apply To
- Development builds (performance checks on production builds only)
- One-off admin tools (different standards)
- Marketing pages (different optimization strategy)

---

## WHERE

### Scope
- **Components**: All `.jsx` files in `src/modules/`, `src/layouts/`, `src/components/`
- **Services**: All `.js` files in `src/services/`, `src/modules/{module}/services/`
- **Routes**: `src/App.js`, routing configuration
- **Assets**: `public/`, `static/`, imported images/fonts

---

## Rendering

### 1.1 Render Optimization

**RULE PERF-REND-01**: Minimize re-renders.

```javascript
// CORRECT: Memoize component
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

// FORBIDDEN: Re-renders unnecessarily
function StudentTable({ students, onEdit }) {
  return (
    <table>
      {students.map(student => (
        <StudentRow 
          key={student.id}
          student={student}
          onEdit={onEdit}
        />
      ))}
    </table>
  );
}
// Problem: If onEdit is recreated on every render, all rows re-render

// CORRECT: Memoize callback
function StudentTable({ students }) {
  const handleEdit = useCallback((studentId) => {
    console.log('Edit', studentId);
  }, []); // Empty deps = stable reference
  
  return (
    <table>
      {students.map(student => (
        <StudentRow 
          key={student.id}
          student={student}
          onEdit={handleEdit}
        />
      ))}
    </table>
  );
}
```

**RULE PERF-REND-02**: Avoid inline objects/functions in JSX.

```javascript
// FORBIDDEN: Inline object/function
<StudentRow
  student={student}
  onEdit={(id) => console.log(id)} // ❌ New function every render
  style={{ color: 'red' }} // ❌ New object every render
/>

// CORRECT: Pre-defined
const handleEdit = useCallback((id) => console.log(id), []);
const rowStyle = { color: 'red' };

<StudentRow
  student={student}
  onEdit={handleEdit}
  style={rowStyle}
/>
```

### 1.2 Component Splitting

**RULE PERF-REND-03**: Split heavy components.

```javascript
// BEFORE: Monolithic component (slow)
function StudentDashboard() {
  // Fetch students, fees, attendance, exams, transport, hostel
  // Render 10 different sections
  // Total: 2000 lines, 5 second initial render
}

// AFTER: Split into sections (fast)
function StudentDashboard() {
  return (
    <div>
      <StudentSummary />      {/* Lazy loaded */}
      <FeeOverview />         {/* Lazy loaded */}
      <AttendanceChart />     {/* Lazy loaded */}
      <ExamSchedule />        {/* Lazy loaded */}
    </div>
  );
}

// Each section loads independently
const StudentSummary = lazy(() => import('./StudentSummary'));
const FeeOverview = lazy(() => import('./FeeOverview'));
```

### 1.3 Render Timing

**RULE PERF-REND-04**: Use requestIdleCallback for non-critical work.

```javascript
// CORRECT: Non-critical work during idle time
function StudentDashboard() {
  useEffect(() => {
    // Critical: Load students immediately
    loadStudents();
    
    // Non-critical: Preload related data during idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        loadTeachers();
        loadClasses();
        loadAttendance();
      });
    } else {
      // Fallback
      setTimeout(() => {
        loadTeachers();
        loadClasses();
      }, 100);
    }
  }, []);
  
  return <Dashboard />;
}
```

---

## Caching

### 2.1 Caching Strategy

**RULE PERF-CACHE-01**: Multi-level caching.

```javascript
// Cache levels (fastest to slowest)
const CacheLevels = {
  L1: 'Memory (Map)',           // O(1), 50MB limit, 1 minute TTL
  L2: 'IndexedDB',             // O(log n), 50MB+, 1 hour TTL
  L3: 'Service Worker Cache',   // O(1), unlimited, 1 day TTL
  L4: 'Network'                 // O(network), unlimited, no TTL
};

// Cache-aside pattern
class StudentCache {
  async getStudent(studentId) {
    // L1: Check memory
    let student = this.memoryCache.get(`student:${studentId}`);
    if (student) return student;
    
    // L2: Check IndexedDB
    student = await this.indexedDBCache.get(`student:${studentId}`);
    if (student) {
      this.memoryCache.set(`student:${studentId}`, student);
      return student;
    }
    
    // L3: Fetch from storage service
    student = await StudentService.getById(studentId);
    
    // Populate caches
    this.memoryCache.set(`student:${studentId}`, student);
    await this.indexedDBCache.set(`student:${studentId}`, student);
    
    return student;
  }
  
  async invalidateStudent(studentId) {
    // Invalidate all levels
    this.memoryCache.delete(`student:${studentId}`);
    await this.indexedDBCache.delete(`student:${studentId}`);
    await this.serviceWorkerCache.delete(`student:${studentId}`);
  }
}
```

**RULE PERF-CACHE-02**: Cache invalidation on writes.

```javascript
async function updateStudent(studentId, updates) {
  // 1. Update storage
  const student = await StudentService.update(studentId, updates);
  
  // 2. Invalidate caches
  await cache.invalidate(`student:${studentId}`);
  await cache.invalidatePattern(`students:class:${student.classId}:*`);
  await cache.invalidatePattern(`students:list:*`); // List may have changed
  
  return student;
}
```

### 2.2 Cache Key Strategy

```javascript
// Cache key format: {entity}:{identifier}:{scope}:{version}
const cacheKey = {
  student: (id, tenantId) => `student:${id}:tenant:${tenantId}:v2`,
  studentsByClass: (classId, tenantId) => `students:class:${classId}:tenant:${tenantId}:v2`,
  feeStats: (tenantId, academicYear) => `fees:stats:tenant:${tenantId}:year:${academicYear}:v1`
};
```

---

## Bundle

### 3.1 Bundle Size Budgets

**RULE PERF-BUNDLE-01**: Enforce bundle size limits.

| Asset | Budget | Current | Max |
|-------|--------|---------|-----|
| Main bundle (JS) | 300KB | 250KB | 350KB |
| Vendor bundle | 500KB | 400KB | 600KB |
| CSS bundle | 100KB | 80KB | 120KB |
| Route chunks | 100KB | 70KB | 150KB |
| Total initial load | 900KB | 730KB | 1MB |

**Enforcement**:
```javascript
// package.json scripts
{
  "scripts": {
    "analyze": "vite-bundle-analyzer",
    "size-limit": "size-limit --json"
  }
}

// .github/workflows/bundle-size.yml
- name: Check bundle size
  run: npm run size-limit
```

### 3.2 Code Splitting

**RULE PERF-BUNDLE-02**: Route-based code splitting.

```javascript
// CORRECT: Lazy load routes
import { lazy, Suspense } from 'react';

const StudentListPage = lazy(() => import('./pages/StudentListPage'));
const StudentFormPage = lazy(() => import('./pages/StudentFormPage'));
const FeesPage = lazy(() => import('./pages/FeesPage'));

function App() {
  return (
    <Routes>
      <Route path="/students" element={
        <Suspense fallback={<PageSkeleton />}>
          <StudentListPage />
        </Suspense>
      } />
      <Route path="/fees" element={
        <Suspense fallback={<PageSkeleton />}>
          <FeesPage />
        </Suspense>
      } />
    </Routes>
  );
}

// FORBIDDEN: Eager loading all routes
import StudentListPage from './pages/StudentListPage';
import StudentFormPage from './pages/StudentFormPage';
import FeesPage from './pages/FeesPage';
// All loaded upfront - slow initial load
```

### 3.3 Dependency Optimization

**RULE PERF-BUNDLE-03**: Tree-shakeable imports.

```javascript
// CORRECT: Import specific functions
import { formatDate } from '@/utils/dateUtils';

// FORBIDDEN: Import entire module
import * as DateUtils from '@/utils/dateUtils';
DateUtils.formatDate();

// CORRECT: Named imports from libraries
import { debounce } from 'lodash-es';

// FORBIDDEN: Default import (prevents tree-shaking)
import _ from 'lodash';
```

### 3.4 Asset Optimization

```javascript
// Image optimization
const ImageOptimization = {
  formats: ['webp', 'avif'], // Modern formats
  sizes: [320, 640, 1024, 1920], // Responsive sizes
  lazyLoad: true, // Use loading="lazy"
  placeholder: 'blur', // Blur-up effect
  maxWidth: 1920,
  maxHeight: 1080
};

// CORRECT: Optimized image
<img
  src={student.photo}
  srcSet={`
    ${student.photo}?w=320 320w,
    ${student.photo}?w=640 640w,
    ${student.photo}?w=1024 1024w
  `}
  sizes="(max-width: 640px) 320px, (max-width: 1024px) 640px, 1024px"
  loading="lazy"
  decoding="async"
  alt={student.name}
/>

// FORBIDDEN: Unoptimized image
<img src={student.photo} alt={student.name} />
```

---

## Virtualization

### 4.1 Large List Virtualization

**RULE PERF-VIRT-01**: Virtualize lists >100 items.

```javascript
import { useVirtualizer } from '@tanstack/react-virtual';

function StudentList({ students }) {
  const parentRef = useRef();
  
  const virtualizer = useVirtualizer({
    count: students.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // Row height
    overscan: 5 // Extra rows to render
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualRow => {
          const student = students[virtualRow.index];
          return (
            <div
              key={student.id}
              style={{
                position: 'absolute',
                top: virtualRow.start,
                height: virtualRow.size
              }}
            >
              {student.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 4.2 Windowing for Tabs

```javascript
// Virtualize tab content
function TabContainer({ tabs, activeTab }) {
  return (
    <div>
      {tabs.map(tab => (
        <TabPanel
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
        >
          {activeTab === tab.id && <TabContent content={tab.content} />}
        </TabPanel>
      ))}
    </div>
  );
}
```

---

## Memoization

### 5.1 Memoization Rules

**RULE PERF-MEMO-01**: Memoize expensive computations.

```javascript
import { useMemo, useCallback, memo } from 'react';

// Memoize expensive calculations
function StudentStats({ students, fees }) {
  const stats = useMemo(() => {
    console.log('Calculating stats...'); // Only runs when dependencies change
    
    return {
      totalStudents: students.length,
      totalFees: fees.reduce((sum, fee) => sum + fee.amount, 0),
      paidPercentage: fees.filter(f => f.status === 'PAID').length / fees.length,
      averageFee: fees.reduce((sum, fee) => sum + fee.amount, 0) / fees.length
    };
  }, [students, fees]); // Dependencies
  
  return <StatsDisplay stats={stats} />;
}

// FORBIDDEN: Recalculate on every render
function StudentStats({ students, fees }) {
  const stats = {
    totalStudents: students.length,
    totalFees: fees.reduce((sum, fee) => sum + fee.amount, 0),
    // Expensive calculation runs on EVERY render
    paidPercentage: fees.filter(f => f.status === 'PAID').length / fees.length
  };
  
  return <StatsDisplay stats={stats} />;
}
```

**RULE PERF-MEMO-02**: Memoize callbacks passed to children.

```javascript
function ParentComponent() {
  const [students, setStudents] = useState([]);
  
  // FORBIDDEN: New function on every render
  const handleEdit = (id) => {
    console.log('Edit', id);
  };
  
  // CORRECT: Stable reference
  const handleEdit = useCallback((id) => {
    console.log('Edit', id);
  }, []); // No dependencies = never changes
  
  return <StudentTable students={students} onEdit={handleEdit} />;
}
```

---

## Lazy Loading

### 6.1 Lazy Loading Strategy

**RULE PERF-LAZY-01**: Lazy load below-fold content.

```javascript
import { lazy, Suspense } from 'react';

// Lazy load components
const LazyComponent = lazy(() => import('./HeavyComponent'));

function Page() {
  return (
    <div>
      <h1>Above fold content</h1>
      
      {/* Below fold - lazy load */}
      <Suspense fallback={<Skeleton />}>
        <LazyComponent />
      </Suspense>
    </div>
  );
}
```

**RULE PERF-LAZY-02**: Lazy load routes.

```javascript
const routes = [
  {
    path: '/students',
    component: lazy(() => import('./pages/StudentListPage'))
  },
  {
    path: '/fees',
    component: lazy(() => import('./pages/FeesPage'))
  }
];
```

**RULE PERF-LAZY-03**: Preload on hover/focus.

```javascript
function Navigation() {
  const preloadStudentModule = useCallback(() => {
    import('./pages/StudentListPage');
  }, []);
  
  return (
    <nav>
      <Link 
        to="/students"
        onMouseEnter={preloadStudentModule} // Preload on hover
        onFocus={preloadStudentModule} // Preload on focus
      >
        Students
      </Link>
    </nav>
  );
}
```

---

## Storage Performance

### 7.1 Query Optimization

**RULE PERF-STOR-01**: Index frequently queried fields.

```javascript
// Create indexes at app startup
await storageService.createIndex({
  collection: 'students',
  tenantId: currentTenant.id,
  field: 'classId',
  indexType: 'btree'
});

await storageService.createIndex({
  collection: 'students',
  tenantId: currentTenant.id,
  field: 'admissionNumber',
  indexType: 'unique'
});

// Compound index for common queries
await storageService.createIndex({
  collection: 'fees',
  tenantId: currentTenant.id,
  fields: ['studentId', 'status', 'academicYear'],
  indexType: 'btree'
});
```

**RULE PERF-STOR-02**: Use projection to limit fields.

```javascript
// CORRECT: Only fetch needed fields
const students = await storageService.find({
  collection: 'students',
  tenantId: currentTenant.id,
  fields: ['id', 'firstName', 'lastName', 'classId'] // Only these fields
});

// FORBIDDEN: Fetch everything
const students = await storageService.find({
  collection: 'students',
  tenantId: currentTenant.id
  // Fetches all fields including large blobs
});
```

**RULE PERF-STOR-03**: Batch operations.

```javascript
// CORRECT: Batch insert
const batchSize = 100;
for (let i = 0; i < students.length; i += batchSize) {
  const batch = students.slice(i, i + batchSize);
  await storageService.insertMany({
    collection: 'students',
    tenantId: currentTenant.id,
    records: batch
  });
}

// FORBIDDEN: One-by-one insert
for (const student of students) {
  await storageService.insert({
    collection: 'students',
    tenantId: currentTenant.id,
    data: student
  });
}
```

---

## Search Performance

### 8.1 Search Optimization

**RULE PERF-SEARCH-01**: Debounce search input.

```javascript
import { debounce } from 'lodash-es';

function StudentSearch({ onSearch }) {
  const debouncedSearch = useMemo(
    () => debounce((query) => {
      onSearch(query);
    }, 300), // Wait 300ms after typing stops
    [onSearch]
  );
  
  const handleChange = (e) => {
    debouncedSearch(e.target.value);
  };
  
  return <input onChange={handleChange} />;
}
```

**RULE PERF-SEARCH-02**: Use full-text search for large datasets.

```javascript
// Create full-text index
await storageService.createIndex({
  collection: 'students',
  tenantId: currentTenant.id,
  fields: ['firstName', 'lastName', 'admissionNumber'],
  indexType: 'fulltext'
});

// Search using index
const results = await storageService.search({
  collection: 'students',
  tenantId: currentTenant.id,
  query: 'john doe',
  fields: ['firstName', 'lastName', 'admissionNumber']
});
```

---

## Large Dataset Rules

### 9.1 Pagination

**RULE PERF-DATA-01**: Always paginate large datasets.

```javascript
// CORRECT: Paginated query
const result = await storageService.find({
  collection: 'students',
  tenantId: currentTenant.id,
  pagination: {
    page: 1,
    limit: 50,
    sort: { lastName: 'asc' }
  }
});

// Access pagination metadata
const { data, total, page, totalPages } = result;

// FORBIDDEN: Fetch all records
const allStudents = await storageService.find({
  collection: 'students',
  tenantId: currentTenant.id
  // Returns 50,000 records - will crash UI
});
```

### 9.2 Infinite Scroll

```javascript
function InfiniteStudentList() {
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    const result = await StudentService.list({
      page,
      limit: 50
    });
    
    setStudents(prev => [...prev, ...result.data]);
    setHasMore(result.hasMore);
    setPage(prev => prev + 1);
    setIsLoading(false);
  }, [page, isLoading, hasMore]);
  
  // Infinite scroll trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }
    
    return () => observer.disconnect();
  }, [loadMore]);
  
  return (
    <div>
      {students.map(student => (
        <StudentCard key={student.id} student={student} />
      ))}
      
      <div id="scroll-sentinel" />
      
      {isLoading && <Spinner />}
      {!hasMore && <p>No more students</p>}
    </div>
  );
}
```

---

## Performance Monitoring

### 10.1 Performance Metrics

```javascript
// Web Vitals monitoring
function reportWebVitals(metric) {
  switch (metric.name) {
    case 'FCP':
    case 'LCP':
    case 'FID':
    case 'CLS':
    case 'TTFB':
      console.log(metric);
      // Send to analytics
      analytics.track('Web Vital', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating
      });
      break;
  }
}

// Performance budgets
const PerformanceBudgets = {
  FCP: 1800, // First Contentful Paint < 1.8s
  LCP: 2500, // Largest Contentful Paint < 2.5s
  FID: 100,  // First Input Delay < 100ms
  CLS: 0.1,  // Cumulative Layout Shift < 0.1
  TTFB: 800  // Time to First Byte < 800ms
};
```

### 10.2 Performance Testing


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

```javascript
// Performance test with Lighthouse CI
// .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/students'],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

---

*End of RULE-09: Performance Standards*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

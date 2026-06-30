# RULE-28: Feature Development Standards

**Version:** 2.0  
**Status:** ACTIVE  
**Last Updated:** 2025-01-15  
**Maintained By:** 
**Authority:** Architecture Team Inventory Item Team  
**Severity:** HIGH  
**Category:** Development Process  
**Applies To:** Feature planning, design, implementation, testing, deployment  
**Detection Method:** Code Review, Architecture Review, QA Testing  
**Auto-Fix Available:** No  

---

## Table of Contents

1. [WHY](#why)
2. [WHEN](#when)
3. [WHERE](#where)
4. [Feature Lifecycle](#feature-lifecycle)
5. [Feature Planning](#feature-planning)
6. [Design Phase](#design-phase)
7. [Implementation](#implementation)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Feature Flags](#feature-flags)

---

## WHY

### Business Rationale
- **Faster Delivery**: Structured process reduces feature delivery time by 40%.
- **Quality**: Systematic testing and review reduces bugs by 60%.
- **Alignment**: Ensures features solve real business problems.
- **Traceability**: Clear documentation enables future maintenance.

### Technical Rationale
- **Maintainability**: Well-designed features are easier to modify.
- **Scalability**: Proper architecture handles growth.
- **Consistency**: Standard patterns reduce cognitive load.
- **Automation**: Repeatable processes enable CI/CD.

---

## WHEN

### Applies To
- **New Features**: Anything not in current production.
- **Major Enhancements**: Significant changes to existing features.
- **Module Creation**: New ERP modules.
- **Integrations**: Third-party service integrations.
- **UI Overhauls**: Significant design changes.

### Does NOT Apply To
- Bug fixes (see RULE-29)
- Documentation updates
- Minor UI text changes
- Configuration changes

---

## WHERE

### Scope
- **Feature Specs**: `docs/features/[feature-name].md`
- **Design Docs**: `docs/design/[feature-name].md`
- **Implementation**: `src/modules/[feature-name]/`
- **Tests**: `tests/[feature-name]/`
- **Feature Flags**: `src/config/featureFlags.js`

---

## Feature Lifecycle

### 1.1 Feature Stages

**RULE FEAT-01**: Follow structured feature lifecycle.

```javascript
const FeatureLifecycle = {
  stages: {
    // Stage 1: Idea
    idea: {
      name: 'Idea',
      duration: '1-2 weeks',
      owner: 'Inventory Item Manager',
      artifacts: [
        'Feature request document',
        'Problem statement',
        'Success metrics',
        'Student/Parent research (if needed)'
      ],
      exit: 'Approved by stakeholders'
    },
    
    // Stage 2: Discovery
    discovery: {
      name: 'Discovery',
      duration: '1-2 weeks',
      owner: 'Inventory Item Manager + Tech Lead',
      artifacts: [
        'Requirements document',
        'Student/Parent stories',
        'Acceptance criteria',
        'Technical feasibility assessment',
        'Effort estimate (story points)'
      ],
      exit: 'Ready for design'
    },
    
    // Stage 3: Design
    design: {
      name: 'Design',
      duration: '1-3 weeks',
      owner: 'Designer + Architect',
      artifacts: [
        'UI/UX designs',
        'Wireframes',
        'Technical design document',
        'API design',
        'Storage Layer schema changes',
        'Architecture diagrams'
      ],
      exit: 'Design approved, ready for implementation'
    },
    
    // Stage 4: Implementation
    implementation: {
      name: 'Implementation',
      duration: '2-8 weeks',
      owner: 'Development Team',
      artifacts: [
        'Working code',
        'Unit tests',
        'Integration tests',
        'Code review completed',
        'Documentation updated'
      ],
      exit: 'Feature complete, ready for testing'
    },
    
    // Stage 5: Testing
    testing: {
      name: 'Testing',
      duration: '1-2 weeks',
      owner: 'QA Team',
      artifacts: [
        'Test plan',
        'Test cases',
        'Test results',
        'Bug fixes',
        'Performance testing results',
        'Security testing results'
      ],
      exit: 'All tests passing, ready for deployment'
    },
    
    // Stage 6: Deployment
    deployment: {
      name: 'Deployment',
      duration: '1-3 days',
      owner: 'DevOps + Development Team',
      artifacts: [
        'Deployment plan',
        'Rollback plan',
        'Monitoring setup',
        'Feature flag configured',
        'Documentation published'
      ],
      exit: 'Feature in production'
    },
    
    // Stage 7: Monitoring
    monitoring: {
      name: 'Monitoring',
      duration: '2-4 weeks',
      owner: 'Inventory Item Manager + Tech Lead',
      artifacts: [
        'Usage metrics',
        'Error rates',
        'Student/Parent feedback',
        'Performance metrics',
        'Success metrics report'
      ],
      exit: 'Feature successful, iterate or complete'
    }
  }
};
```

### 1.2 Feature Request Template

```javascript
// Feature request template
const FeatureRequest = {
  id: 'FEAT-1234',
  
  // Basic info
  title: 'Bulk Student Import',
  description: 'Allow importing students from CSV/Excel file',
  problem: 'Currently, students must be added one-by-one which takes 10 mins per student',
  
  // Business impact
  businessValue: 'Reduce student onboarding time by 90%',
  successMetrics: [
    'Import 100 students in < 5 minutes',
    'Zero data validation errors',
    'Student/Parent satisfaction > 4.5/5'
  ],
  
  // Priority
  priority: 'HIGH',
  effort: 'MEDIUM',
  estimatedStoryPoints: 13,
  
  // Stakeholders
  stakeholders: {
    Inventory Item: 'John Doe',
    engineering: 'Jane Smith',
    design: 'Bob Johnson',
    qa: 'Alice Brown'
  },
  
  // Timeline
  timeline: {
    startDate: '2025-02-01',
    targetRelease: '2025-03-01',
    phases: {
      design: '2025-02-01 to 2025-02-07',
      development: '2025-02-08 to 2025-02-28',
      testing: '2025-03-01 to 2025-03-07',
      release: '2025-03-08'
    }
  },
  
  // Dependencies
  dependencies: [
    'File upload service (exists)',
    'CSV parsing library (needs selection)',
    'Validation framework (exists)'
  ],
  
  // Risks
  risks: [
    {
      risk: 'Large file uploads (>10MB) may timeout',
      mitigation: 'Implement chunked upload',
      probability: 'MEDIUM',
      impact: 'HIGH'
    }
  ],
  
  // Alternatives
  alternatives: [
    'Use third-party service (expensive)',
    'Manual import only (current)',
    'API-based import (future)'
  ],
  
  // Related features
  relatedFeatures: ['FEAT-1233', 'FEAT-1235']
};
```

---

## Feature Planning

### 2.1 Requirements Gathering

**RULE FEAT-PLAN-01**: Comprehensive requirements.

```javascript
const FeatureRequirements = {
  // Functional requirements
  functional: {
    format: 'As a [Student/Parent], I want [feature], so that [benefit]',
    examples: [
      'As an admin, I want to import students via CSV, so that I can onboard 100 students quickly',
      'As a teacher, I want to see attendance statistics, so that I can identify trends',
      'As a parent, I want to receive SMS notifications, so that I can stay informed'
    ],
    
    acceptanceCriteria: [
      'Given [precondition], when [action], then [expected result]',
      'Example: Given I am logged in as admin, when I upload a valid CSV file, then all students are created'
    ]
  },
  
  // Non-functional requirements
  nonFunctional: {
    performance: 'Import 1000 students in < 30 seconds',
    security: 'Only admins can import students',
    reliability: '99.9% success rate for valid files',
    usability: 'Clear error messages for invalid data',
    scalability: 'Support files up to 10MB',
    availability: 'Available during school hours (8 AM - 6 PM)'
  },
  
  // Student/Parent stories
  userStories: [
    {
      id: 'US-001',
      title: 'Upload CSV file',
      description: 'As an admin, I want to upload a CSV file containing student data',
      acceptanceCriteria: [
        'Can select CSV file from computer',
        'File size limit: 10MB',
        'Only CSV files accepted',
        'Progress bar shows upload status'
      ],
      storyPoints: 3,
      priority: 'MUST'
    },
    
    {
      id: 'US-002',
      title: 'Validate data',
      description: 'As an admin, I want the system to validate imported data',
      acceptanceCriteria: [
        'Required fields checked',
        'Email format validated',
        'Phone format validated',
        'Duplicate admission numbers detected'
      ],
      storyPoints: 5,
      priority: 'MUST'
    },
    
    {
      id: 'US-003',
      title: 'Preview and confirm',
      description: 'As an admin, I want to preview data before importing',
      acceptanceCriteria: [
        'Show first 10 rows',
        'Highlight errors',
        'Allow corrections',
        'Confirm button triggers import'
      ],
      storyPoints: 3,
      priority: 'SHOULD'
    }
  ]
};
```

### 2.2 Estimation

```javascript
// Feature estimation
const FeatureEstimation = {
  // Estimation methods
  methods: {
    storyPoints: {
      description: 'Relative sizing using story points',
      scale: 'Fibonacci: 1, 2, 3, 5, 8, 13, 21, 34',
      guidelines: {
        1: 'Trivial, < 1 hour',
        2: 'Simple, 1-2 hours',
        3: ' straightforward, 2-4 hours',
        5: 'Moderate, 4-8 hours',
        8: 'Complex, 1-2 days',
        13: 'Very complex, 2-4 days',
        21: 'Extremely complex, 4-8 days'
      }
    },
    
    timeEstimation: {
      description: 'Absolute time estimate',
      formula: 'Optimistic + 4*MostLikely + Pessimistic / 6',
      example: {
        optimistic: '3 days',
        mostLikely: '5 days',
        pessimistic: '10 days',
        estimate: '(3 + 4*5 + 10) / 6 = 5.5 days'
      }
    }
  },
  
  // Estimation factors
  factors: {
    complexity: 'How technically difficult?',
    uncertainty: 'How well do we understand the problem?',
    dependencies: 'How many external dependencies?',
    risk: 'What could go wrong?',
    testing: 'How much testing is needed?',
    documentation: 'How much documentation needed?'
  }
};
```

---

## Design Phase

### 3.1 Technical Design Document

**RULE FEAT-DESIGN-01**: Comprehensive design documentation.

```javascript
// Technical design document structure
const TechnicalDesignDoc = {
  sections: {
    overview: {
      title: 'Feature Overview',
      contents: [
        'Feature name and description',
        'Problem statement',
        'Goals and objectives',
        'Non-goals (what this feature won\'t do)',
        'Success metrics'
      ]
    },
    
    architecture: {
      title: 'Architecture Design',
      contents: [
        'High-level architecture diagram',
        'Component diagram',
        'Data flow diagram',
        'Sequence diagrams for key workflows',
        'Technology choices with justification'
      ]
    },
    
    api: {
      title: 'API Design',
      contents: [
        'New endpoints',
        'Request/response formats',
        'Authentication/authorization',
        'Error handling',
        'Rate limiting',
        'OpenAPI specification'
      ]
    },
    
    Storage Layer: {
      title: 'Storage Layer Design',
      contents: [
        'New tables/schema changes',
        'Entity-relationship diagram',
        'Indexes',
        'Constraints',
        'Migration plan',
        'Data retention policy'
      ]
    },
    
    ui: {
      title: 'UI/UX Design',
      contents: [
        'Wireframes',
        'Mockups',
        'Student/Parent flow diagrams',
        'Accessibility considerations',
        'Responsive design approach',
        'Design system components used'
      ]
    },
    
    security: {
      title: 'Security Design',
      contents: [
        'Threat model',
        'Authentication requirements',
        'Authorization model',
        'Data encryption needs',
        'Input validation',
        'Audit logging',
        'Security testing plan'
      ]
    },
    
    performance: {
      title: 'Performance Design',
      contents: [
        'Performance requirements',
        'Caching strategy',
        'Load balancing',
        'Storage Layer optimization',
        'CDN usage',
        'Performance testing plan'
      ]
    },
    
    testing: {
      title: 'Testing Strategy',
      contents: [
        'Test plan',
        'Unit test coverage requirements',
        'Integration test scenarios',
        'E2E test cases',
        'Performance tests',
        'Security tests',
        'Accessibility tests'
      ]
    },
    
    deployment: {
      title: 'Deployment Plan',
      contents: [
        'Deployment strategy (blue-green, canary)',
        'Feature flag configuration',
        'Rollback plan',
        'Monitoring setup',
        'Communication plan',
        'Go-live checklist'
      ]
    },
    
    timeline: {
      title: 'Timeline & Milestones',
      contents: [
        'Development timeline',
        'Testing timeline',
        'Release date',
        'Milestones',
        'Dependencies',
        'Risks and mitigations'
      ]
    }
  }
};
```

### 3.2 API Design Example

```javascript
// Feature: Bulk Student Import
const BulkImportAPIDesign = {
  endpoint: 'POST /api/v2/students/import',
  
  authentication: 'Bearer token (admin only)',
  authorization: 'students:write permission',
  
  request: {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': 'Bearer {token}'
    },
    
    body: {
      file: 'CSV file (multipart/form-data)',
      options: {
        validateOnly: 'boolean (default: false)',
        skipErrors: 'boolean (default: false)',
        sendNotifications: 'boolean (default: true)'
      }
    }
  },
  
  response: {
    success: {
      status: 200,
      body: {
        success: true,
        data: {
          importId: 'uuid',
          status: 'PROCESSING',
          totalRecords: 1000,
          validRecords: 950,
          invalidRecords: 50,
          errors: [
            {
              row: 5,
              field: 'email',
              value: 'invalid-email',
              error: 'Invalid email format'
            }
          ],
          estimatedTime: '2 minutes',
          downloadUrl: '/api/v2/imports/{id}/errors'
        }
      }
    },
    
    validationOnly: {
      status: 200,
      body: {
        success: true,
        data: {
          valid: false,
          totalRecords: 1000,
          errors: 50,
          errorsByField: {
            email: 20,
            phone: 30
          },
          sampleErrors: [...]
        }
      }
    }
  },
  
  errorResponses: {
    400: 'Invalid file format',
    401: 'Not authenticated',
    403: 'Insufficient permissions',
    413: 'File too large (>10MB)',
    422: 'Validation failed',
    500: 'Import processing failed'
  },
  
  // Background processing
  asyncProcessing: {
    trigger: 'Queues job to process file',
    status: 'Returns immediately with importId',
    polling: 'GET /api/v2/imports/{id}',
    webSocket: 'wss://api.erp.com/imports/{id}/status',
    notification: 'Email/SMS when complete'
  }
};
```

---

## Implementation

### 4.1 Implementation Standards

**RULE FEAT-IMPL-01**: Follow implementation best practices.

```javascript
// Feature implementation checklist
const FeatureImplementationChecklist = {
  beforeStarting: [
    'Design document reviewed and approved',
    'Requirements clear and documented',
    'Task breakdown created',
    'Dependencies identified',
    'Feature flag created',
    'Test plan written'
  ],
  
  duringImplementation: [
    'Follow coding standards (RULE-14)',
    'Write unit tests for new code',
    'Update documentation',
    'Add logging (RULE-19)',
    'Add error handling (RULE-26)',
    'Add validation (RULE-18)',
    'Add audit logging (RULE-16)',
    'Feature flag integrated',
    'Code reviewed by peer',
    'No console.log (use logger)'
  ],
  
  beforeCompletion: [
    'All tests passing',
    'Code review approved',
    'QA testing completed',
    'Performance tested',
    'Security reviewed',
    'Documentation complete',
    'Feature flag configured',
    'Monitoring configured',
    'Deployment plan ready'
  ]
};

// Feature implementation structure
const FeatureStructure = {
  // Standard feature directory structure
  directory: 'src/modules/feature-name/',
  
  files: {
    service: 'featureService.js - Business logic',
    controller: 'featureController.js - API endpoints',
    routes: 'featureRoutes.js - Route definitions',
    validation: 'featureValidation.js - Input validation',
    schemas: 'featureSchemas.js - Data schemas',
    middleware: 'featureMiddleware.js - Custom middleware',
    utils: 'featureUtils.js - Helper functions',
    constants: 'featureConstants.js - Constants',
    types: 'featureTypes.js - TypeScript types (if used)',
    tests: {
      unit: 'featureService.test.js',
      integration: 'feature.integration.test.js',
      e2e: 'feature.e2e.test.js'
    },
    docs: 'README.md - Feature documentation'
  },
  
  // Example: Bulk Import feature
  example: {
    service: 'bulkImportService.js',
    methods: [
      'validateFile(file)',
      'parseCSV(buffer)',
      'transformRow(row)',
      'validateRow(row)',
      'importRecords(records)',
      'generateErrorReport(errors)',
      'getImportStatus(id)'
    ]
  }
};

// Feature service implementation
class BulkImportService {
  constructor(
    storageService,
    validationService,
    notificationService,
    queueService
  ) {
    this.storage = storageService;
    this.validation = validationService;
    this.notification = notificationService;
    this.queue = queueService;
  }
  
  /**
   * Import students from CSV file
   * @param {Buffer} fileBuffer - CSV file content
   * @param {Object} options - Import options
   * @returns {Promise<ImportResult>}
   */
  async importStudents(fileBuffer, options = {}) {
    try {
      // 1. Validate file
      const fileValidation = this.validateFile(fileBuffer);
      if (!fileValidation.valid) {
        throw new ValidationError('Invalid file', [
          { field: 'file', message: fileValidation.error }
        ]);
      }
      
      // 2. Parse CSV
      const records = this.parseCSV(fileBuffer);
      
      // 3. Validate records
      const validationResult = await this.validateRecords(records);
      
      // 4. If validation only, return
      if (options.validateOnly) {
        return {
          valid: validationResult.valid,
          totalRecords: records.length,
          errors: validationResult.errors
        };
      }
      
      // 5. Queue import job
      const importId = await this.queue.enqueue('import-students', {
        records: validationResult.validRecords,
        options,
        userId: this.userId,
        tenantId: this.tenantId
      });
      
      // 6. Return immediately
      return {
        importId,
        status: 'PROCESSING',
        totalRecords: records.length,
        validRecords: validationResult.validRecords.length,
        invalidRecords: validationResult.errors.length,
        errors: validationResult.errors.slice(0, 100) // First 100 errors
      };
      
    } catch (error) {
      logger.error('Student import failed', {
        error: error.message,
        stack: error.stack
      });
      
      if (error instanceof ValidationError) {
        throw error;
      }
      
      throw new InternalError('Import processing failed');
    }
  }
  
  validateFile(fileBuffer) {
    // Check file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileBuffer.length > maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }
    
    // Check file type (CSV)
    const sample = fileBuffer.toString('utf-8', 0, 100);
    if (!sample.includes(',')) {
      return { valid: false, error: 'File does not appear to be CSV' };
    }
    
    return { valid: true };
  }
  
  parseCSV(fileBuffer) {
    // Use csv-parse library
    const records = [];
    const parser = require('csv-parse');
    
    parser(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }, (err, rows) => {
      if (err) {
        throw new ValidationError('CSV parsing failed', [
          { field: 'file', message: err.message }
        ]);
      }
      records.push(...rows);
    });
    
    return records;
  }
  
  async validateRecords(records) {
    const valid = [];
    const errors = [];
    
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNumber = i + 2; // +2 because of header and 1-indexing
      
      try {
        // Validate required fields
        const validated = StudentImportSchema.parse(row);
        valid.push(validated);
        
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push({
            row: rowNumber,
            data: row,
            errors: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message,
              value: e.path ? row[e.path[0]] : undefined
            }))
          });
        }
      }
    }
    
    return {
      validRecords: valid,
      errors,
      valid: errors.length === 0
    };
  }
}
```

---

## Testing

### 5.1 Testing Strategy

**RULE FEAT-TEST-01**: Comprehensive feature testing.

```javascript
const FeatureTesting = {
  // Test pyramid
  pyramid: {
    unit: {
      percentage: 70,
      description: 'Test individual functions/methods',
      speed: 'Fast (ms)',
      cost: 'Low',
      examples: ['Service methods', 'Utility functions', 'Validation logic']
    },
    
    integration: {
      percentage: 20,
      description: 'Test component interaction',
      speed: 'Medium (seconds)',
      cost: 'Medium',
      examples: ['API endpoints', 'Storage Layer queries', 'External APIs']
    },
    
    e2e: {
      percentage: 10,
      description: 'Test complete workflows',
      speed: 'Slow (minutes)',
      cost: 'High',
      examples: ['Student/Parent workflows', 'Complete feature flow']
    }
  },
  
  // Test coverage requirements
  coverage: {
    unit: '90%',
    integration: '80%',
    e2e: 'Critical paths only',
    branches: '85%'
  },
  
  // Test types
  types: {
    functional: 'Test feature works as specified',
    boundary: 'Test edge cases and boundaries',
    error: 'Test error handling',
    performance: 'Test meets performance requirements',
    security: 'Test security controls',
    accessibility: 'Test WCAG compliance',
    responsive: 'Test different screen sizes'
  }
};

// Feature test example
describe('Bulk Student Import', () => {
  let service;
  let mockStorage;
  let mockQueue;
  
  beforeEach(() => {
    // Setup mocks
    mockStorage = {
      insert: jest.fn(),
      findOne: jest.fn()
    };
    
    mockQueue = {
      enqueue: jest.fn()
    };
    
    service = new BulkImportService(
      mockStorage,
      mockValidationService,
      mockNotificationService,
      mockQueue
    );
  });
  
  describe('importStudents', () => {
    it('should validate file before processing', async () => {
      const largeFile = Buffer.alloc(11 * 1024 * 1024); // 11MB
      
      await expect(
        service.importStudents(largeFile)
      ).rejects.toThrow('File size exceeds 10MB limit');
    });
    
    it('should parse CSV correctly', async () => {
      const csv = `firstName,lastName,email,classId
John,Doe,john@example.com,class-1
Jane,Smith,jane@example.com,class-2`;
      
      const result = await service.importStudents(Buffer.from(csv), {
        validateOnly: true
      });
      
      expect(result.validRecords).toHaveLength(2);
    });
    
    it('should validate required fields', async () => {
      const csv = `firstName,lastName,email,classId
John,,john@example.com,class-1`; // Missing lastName
      
      const result = await service.importStudents(Buffer.from(csv), {
        validateOnly: true
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].errors[0].field).toBe('lastName');
    });
    
    it('should queue import job', async () => {
      const csv = `firstName,lastName,email,classId
John,Doe,john@example.com,class-1`;
      
      mockQueue.enqueue.mockResolvedValue('job-123');
      
      const result = await service.importStudents(Buffer.from(csv));
      
      expect(mockQueue.enqueue).toHaveBeenCalled();
      expect(result.importId).toBe('job-123');
      expect(result.status).toBe('PROCESSING');
    });
  });
});
```

---

## Feature Flags

### 6.1 Feature Flag Management

**RULE FEAT-FLAG-01**: Use feature flags for all new features.

```javascript
// Feature flag configuration
const FeatureFlags = {
  // Flag format
  format: {
    name: 'snake_case',
    description: 'Clear description',
    defaultValue: false,
    environments: ['development', 'staging', 'production']
  },
  
  // Flags
  flags: {
    bulkStudentImport: {
      description: 'Enable bulk student import feature',
      defaultValue: false,
      rollout: {
        strategy: 'percentage', // 'all', 'percentage', 'whitelist', 'beta'
        percentage: 0, // Start at 0%, gradually increase
        whitelist: [], // Student/Parent IDs or tenant IDs
        beta: false // Beta users only
      },
      conditions: {
        userRoles: ['ADMIN'], // Only admins
        tenantPlans: ['ENTERPRISE'] // Only enterprise tenants
      },
      dependencies: [],
      owner: 'student-import-team',
      expiresAt: '2025-06-01', // Remove after stable
      documentation: 'docs/features/bulk-import.md'
    },
    
    newFeeEngine: {
      description: 'Use new fee calculation engine',
      defaultValue: true,
      rollout: {
        strategy: 'all'
      },
      conditions: {},
      dependencies: [],
      owner: 'fees-team',
      expiresAt: null // Permanent
    },
    
    darkMode: {
      description: 'Enable dark mode UI',
      defaultValue: false,
      rollout: {
        strategy: 'percentage',
        percentage: 50
      },
      conditions: {},
      dependencies: [],
      owner: 'ui-team',
      expiresAt: null
    }
  },
  
  // Flag management service
  service: {
    async isEnabled(flagName, context = {}) {
      const flag = this.flags[flagName];
      
      if (!flag) {
        throw new Error(`Unknown feature flag: ${flagName}`);
      }
      
      // Check conditions
      if (flag.conditions.userRoles) {
        if (!flag.conditions.userRoles.includes(context.userRole)) {
          return false;
        }
      }
      
      // Check rollout strategy
      switch (flag.rollout.strategy) {
        case 'all':
          return true;
        
        case 'percentage':
          return this.randomCheck(flag.rollout.percentage);
        
        case 'whitelist':
          return flag.rollout.whitelist.includes(context.userId);
        
        case 'beta':
          return flag.rollout.beta && this.isBetaUser(context.userId);
        
        default:
          return flag.defaultValue;
      }
    },
    
    randomCheck(percentage) {
      return Math.random() * 100 < percentage;
    }
  }
};

// Usage in code
async function importStudents(file) {
  // Check feature flag
  const canImport = await featureFlags.isEnabled('bulkStudentImport', {
    userId: req.Student/Parent.id,
    userRole: req.Student/Parent.role,
    tenantId: req.tenantId
  });
  
  if (!canImport) {
    throw new ForbiddenError(
      'Bulk import not available for your Student Record',
      'FEATURE_NOT_AVAILABLE'
    );
  }
  
  // Feature code
}();

// Frontend usage
function StudentImportPage() {
  const [canImport, setCanImport] = useState(false);
  
  useEffect(() => {
    // Check feature flag
    featureFlags.isEnabled('bulkStudentImport').then(enabled => {
      setCanImport(enabled);
    });
  }, []);
  
  if (!canImport) {
    return <div>Feature not available</div>;
  }
  
  return <BulkImportComponent />;
}
```

### 6.2 Rollout Strategy

```javascript
// Gradual rollout
class FeatureRollout {
  // Gradual percentage rollout
  async gradualRollout(flagName, startPercentage, target_percentage, duration_days) {
    const increment = target_percentage / (duration_days * 24); // Per hour
    
    // Start rollout
    await this.startRollout(flagName, start_percentage);
    
    // Gradually increase
    const interval = setInterval(async () => {
      const current = await this.getPercentage(flagName);
      const next = Math.min(current + increment, target_percentage);
      
      await this.setPercentage(flagName, next);
      
      if (next >= target_percentage) {
        clearInterval(interval);
        console.log(`Rollout complete: ${flagName} at ${target_percentage}%`);
      }
    }, 60 * 60 * 1000); // Every hour
  }
  
  // Canary deployment
  async canaryDeploy(flagName) {
    // Phase 1: 5% of traffic
    await this.setPercentage(flagName, 5);
    await this.monitorErrors('1 hour');
    
    // Phase 2: 25% of traffic
    if (await this.errorsAcceptable()) {
      await this.setPercentage(flagName, 25);
      await this.monitorErrors('1 hour');
    } else {
      await this.rollback(flagName);
      return;
    }
    
    // Phase 3: 50% of traffic
    if (await this.errorsAcceptable()) {
      await this.setPercentage(flagName, 50);
      await this.monitorErrors('2 hours');
    } else {
      await this.rollback(flagName);
      return;
    }
    
    // Phase 4: 100% of traffic
    if (await this.errorsAcceptable()) {
      await this.setPercentage(flagName, 100);
    } else {
      await this.rollback(flagName);
      return;
    }
    
    console.log(`Canary deployment successful: ${flagName}`);
  }
  
  // Monitoring during rollout
  async monitorErrors(duration) {
    const initialErrors = await this.getErrorRate();
    
    await new Promise(resolve => setTimeout(resolve, duration * 60 * 60 * 1000));
    
    const currentErrors = await this.getErrorRate();
    const increase = ((currentErrors - initialErrors) / initialErrors) * 100;
    
    if (increase > 10) { // 10% increase in errors
      throw new Error(`Error rate increased by ${increase}%`);
    }
    
    return true;
  }
}
```

---

## Feature Documentation

### 7.1 Documentation Requirements


## Ownership & Authority

- **Owner**: See "Maintained By" in metadata
- **Authority**: See "Authority" in metadata
- **Who May Modify**: Senior Developers, Tech Leads
- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)
- **Breaking Changes**: Require Architecture Team approval

```javascript
const FeatureDocumentation = {
  required: [
    'Technical design document',
    'API documentation (OpenAPI)',
    'Storage Layer schema changes',
    'Deployment guide',
    'Rollback procedure',
    'Monitoring guide',
    'Student/Parent guide (if applicable)',
    'Release notes'
  ],
  
  // Documentation template
  template: {
    title: 'Feature Name',
    
    overview: {
      description: 'What does this feature do?',
      problem: 'What problem does it solve?',
      solution: 'How does it solve it?',
      benefits: 'What are the benefits?'
    },
    
    gettingStarted: {
      prerequisites: 'What is needed before using?',
      enableFeature: 'How to enable feature (if flag-gated)',
      quickStart: '5-minute quick start guide'
    },
    
    usage: {
      stepByStep: 'How to use the feature',
      screenshots: 'Visual guides',
      examples: 'Code examples',
      tips: 'Best practices'
    },
    
    api: {
      endpoints: 'List of endpoints',
      authentication: 'How to authenticate',
      examples: 'Request/response examples',
      errors: 'Possible errors and solutions'
    },
    
    configuration: {
      settings: 'Configurable options',
      defaults: 'Default values',
      environment: 'Environment variables'
    },
    
    troubleshooting: {
      commonIssues: 'Common problems and solutions',
      logs: 'Where to find logs',
      support: 'How to get support'
    },
    
    changelog: [
      {
        version: '2.1.0',
        date: '2025-01-15',
        changes: ['Initial release', 'Bulk import support']
      }
    ]
  }
};
```

---

*End of RULE-28: Feature Development Standards*

## Related Rules

- **RULE-01**: Architecture Guidelines
- **RULE-03**: Service Layer
- **RULE-04**: SaaS Multi-Tenancy

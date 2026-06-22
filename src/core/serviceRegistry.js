/**
 * SERVICE REGISTRY LAYER
 * Phase 3.1 D Enforcement - SaaS-Grade Service Access Control
 * Phase 3.1 D Hardening - STRICT SaaS Enforcement Layer
 * 
 * This is the SINGLE CONTROLLED SERVICE GATEWAY for the entire application.
 * All service access must go through this layer to enforce:
 * - Tenant context validation
 * - Service access control
 * - Duplicate service prevention
 * - Enterprise-grade SaaS architecture
 * - STRICT multi-tenant isolation
 */

import { getTenantContext, isTenantContextValid } from "../services/tenantContextService";

// ================= ENFORCEMENT FLAGS =================
const ENFORCE_REGISTRY = true;

// ================= SERVICE REGISTRY =================
const serviceRegistry = new Map();

// ================= DIRECT ACCESS BLOCKER =================
/**
 * Block direct service access in production mode
 * Phase 3.1 D Hardening - STRICT SaaS Enforcement
 * 
 * @param {string} serviceName - Name of the service being accessed directly
 * @throws {Error} If enforcement is enabled and in production mode
 */
export const blockDirectServiceAccess = (serviceName) => {
    if (ENFORCE_REGISTRY && process.env.NODE_ENV === 'production') {
        throw new Error(
            `[SAAS BLOCK] Direct access to ${serviceName} is forbidden. Use ServiceRegistry.getService("${serviceName}") instead.`
        );
    }
};

// ================= SERVICE REGISTRATION =================
/**
 * Register a service in the registry
 * @param {string} name - Service name
 * @param {Object} service - Service object
 * @param {Object} options - Registration options
 */
export const registerService = (name, service, options = {}) => {
    if (serviceRegistry.has(name)) {
        console.warn(`[ServiceRegistry] Service "${name}" already registered. Overriding.`);
    }
    
    serviceRegistry.set(name, {
        service,
        registeredAt: new Date().toISOString(),
        ...options
    });
    
    console.log(`[ServiceRegistry] Service "${name}" registered successfully.`);
};

// ================= SERVICE RETRIEVAL =================
/**
 * Get a service from the registry with tenant validation and Proxy wrapper
 * Phase 3.1 D Hardening - STRICT SaaS Enforcement
 * Phase 3.1 D Safe Mode - Tenant Safety Hardening
 * 
 * @param {string} name - Service name
 * @returns {Object} Service object wrapped in Proxy for tenant validation
 */
export const getService = (name) => {
    const entry = serviceRegistry.get(name);
    
    // Phase 3.1 D Hardening: Enforce service registration
    if (ENFORCE_REGISTRY && !entry) {
        throw new Error(`[SAAS BLOCK] Service not registered: ${name}. Use registerService() first.`);
    }
    
    if (!entry) {
        console.error(`[ServiceRegistry] Service "${name}" not found in registry.`);
        throw new Error(`Service "${name}" not registered. Use registerService() first.`);
    }
    
    // Phase 3.1 D Safe Mode: Tenant safety hardening - Validate tenant context before service access
    if (!isTenantContextValid()) {
        throw new Error("[TENANT BLOCK] Invalid context access via registry");
    }
    
    // Phase 3.1 D Hardening: Wrap service in Proxy for tenant validation on every access
    const service = entry.service;
    
    return new Proxy(service, {
        get(target, prop) {
            if (ENFORCE_REGISTRY && !isTenantContextValid()) {
                throw new Error("[TENANT BLOCK] Invalid context access via registry");
            }
            return target[prop];
        }
    });
};

// ================= SPECIFIC SERVICE GETTERS =================
/**
 * Get fee service (unified)
 * @returns {Object} Fee service
 */
export const getFeeService = () => {
    return getService("fees");
};

/**
 * Get transport service
 * @returns {Object} Transport service
 */
export const getTransportService = () => {
    return getService("transport");
};

/**
 * Get student service
 * @returns {Object} Student service
 */
export const getStudentService = () => {
    return getService("student");
};

/**
 * Get class subject service
 * @returns {Object} Class subject service
 */
export const getClassSubjectService = () => {
    return getService("classSubject");
};

// ================= SERVICE LISTING =================
/**
 * Get all registered services
 * @returns {Array} Array of service names
 */
export const getRegisteredServices = () => {
    return Array.from(serviceRegistry.keys());
};

// ================= SERVICE VALIDATION =================
/**
 * Check if a service is registered
 * @param {string} name - Service name
 * @returns {boolean} True if registered
 */
export const isServiceRegistered = (name) => {
    return serviceRegistry.has(name);
};

// ================= DEFAULT SERVICE REGISTRATION =================
/**
 * Register default services
 * This should be called during app initialization
 */
export const registerDefaultServices = () => {
    // Import services lazily to avoid circular dependencies
    const feeService = require("../modules/fees/feesService");
    const transportService = require("../modules/transport/services/transportService");
    const studentService = require("../services/studentService");
    const classSubjectService = require("../master-setting/classes-subjects/classSubjectService");
    const masterTransportService = require("../master-setting/transport/transportService");
    const ledgerService = require("../modules/fees/ledgerService");
    
    // Phase-3D Receipt Authority Layer Services
    const receiptService = require("../modules/fees/receiptService");
    const receiptAuditService = require("../modules/fees/receiptAuditService");
    const receiptSearchService = require("../modules/fees/receiptSearchService");
    const receiptCancelService = require("../modules/fees/receiptCancelService");
    const receiptVoidService = require("../modules/fees/receiptVoidService");
    const receiptPrintService = require("../modules/fees/receiptPrintService");
    const receiptMigrationService = require("../modules/fees/receiptMigrationService");
    
    registerService("fees", feeService, { 
        description: "Unified fee service",
        deprecated: false 
    });
    
    registerService("transport", transportService, { 
        description: "Transport service",
        deprecated: false 
    });
    
    registerService("student", studentService, { 
        description: "Student service",
        deprecated: false 
    });
    
    registerService("classSubject", classSubjectService.classSubjectService, { 
        description: "Class subject service",
        deprecated: false 
    });
    
    registerService("masterTransport", masterTransportService.transportService, { 
        description: "Master transport service",
        deprecated: false 
    });
    
    registerService("ledger", ledgerService, { 
        description: "Read-only ledger summary service",
        deprecated: false 
    });
    
    // Phase-3D Receipt Authority Layer Registration
    registerService("receipt", receiptService.default || receiptService, { 
        description: "Primary financial authority - Receipt Register",
        deprecated: false 
    });
    
    registerService("receiptAudit", receiptAuditService.default || receiptAuditService, { 
        description: "Receipt audit trail service",
        deprecated: false 
    });
    
    registerService("receiptSearch", receiptSearchService.default || receiptSearchService, { 
        description: "Receipt search service",
        deprecated: false 
    });
    
    registerService("receiptCancel", receiptCancelService.default || receiptCancelService, { 
        description: "Receipt cancellation service",
        deprecated: false 
    });
    
    registerService("receiptVoid", receiptVoidService.default || receiptVoidService, { 
        description: "Receipt void service",
        deprecated: false 
    });
    
    registerService("receiptPrint", receiptPrintService.default || receiptPrintService, { 
        description: "Receipt print tracking service",
        deprecated: false 
    });
    
    registerService("receiptMigration", receiptMigrationService.default || receiptMigrationService, { 
        description: "Receipt migration utility",
        deprecated: false 
    });
    
    console.log("[ServiceRegistry] Default services registered successfully.");
};

// ================= DEPRECATED SERVICE WARNINGS =================
/**
 * Mark a service as deprecated
 * @param {string} name - Service name
 * @param {string} replacement - Replacement service name
 */
export const markServiceDeprecated = (name, replacement) => {
    const entry = serviceRegistry.get(name);
    
    if (entry) {
        entry.deprecated = true;
        entry.replacement = replacement;
        console.warn(`[ServiceRegistry] Service "${name}" marked as deprecated. Use "${replacement}" instead.`);
    }
};

// ================= EXPORTS =================
export default {
    registerService,
    getService,
    getFeeService,
    getTransportService,
    getStudentService,
    getClassSubjectService,
    getRegisteredServices,
    isServiceRegistered,
    registerDefaultServices,
    markServiceDeprecated
};

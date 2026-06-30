/**
 * MASTER ENTITY REPOSITORY
 * Canonical implementation - Single Source of Truth for all Master Data
 * 
 * Responsibilities:
 * - Tenant-scoped storage operations
 * - Runtime cache with invalidation
 * - Dependency tracking for delete protection
 * - Change propagation to subscribers
 * - Referential integrity enforcement
 * 
 * No module may bypass this repository for master data.
 */

import {
    getTenantStorage,
    setTenantStorage,
    removeTenantStorage,
    STORAGE_KEYS,
} from "../../services/storageService";
import { getTenantContextForStorage, withTenantContext } from "../../services/tenantContextService";
import { registerService, getService } from "../serviceRegistry";

// ================= MASTER ENTITY TYPES =================

export const MASTER_ENTITY_TYPES = Object.freeze({
    SCHOOL_PROFILE: "SCHOOL_PROFILE",
    ACADEMIC_YEAR: "ACADEMIC_YEAR",
    CLASS: "CLASS",
    SECTION: "SECTION",
    SUBJECT: "SUBJECT",
    STREAM: "STREAM",
    FEE_CATEGORY: "FEE_CATEGORY",
    FEE_STRUCTURE: "FEE_STRUCTURE",
    TRANSPORT_ROUTE: "TRANSPORT_ROUTE",
    PICKUP_POINT: "PICKUP_POINT",
    HOSTEL: "HOSTEL",
    ROOM: "ROOM",
    HOUSE: "HOUSE",
    RELIGION: "RELIGION",
    CATEGORY: "CATEGORY",
    CASTE: "CASTE",
    CERTIFICATE_TEMPLATE: "CERTIFICATE_TEMPLATE",
    ID_CARD_TEMPLATE: "ID_CARD_TEMPLATE",
    SESSION_SETTINGS: "SESSION_SETTINGS",
    ATTENDANCE_SETTINGS: "ATTENDANCE_SETTINGS",
});

// ================= REPOSITORY CLASS =================

class MasterEntityRepository {
    constructor() {
        this.cache = new Map();
        this.subscribers = new Map();
        this.dependencyGraph = new Map();
        this.storageKey = STORAGE_KEYS.ERP_DB;
        this.initialized = false;
        
        // Register this repository as a service
        registerService("masterDataRepository", this, {
            description: "Canonical master data repository",
            tenantAware: true,
        });
    }

    // ================= INITIALIZATION =================

    initialize() {
        if (this.initialized) return;
        
        const tenantContext = getTenantContextForStorage();
        const db = getTenantStorage(this.storageKey, tenantContext, null);
        
        if (db?.masterData) {
            // Hydrate cache from storage
            Object.entries(db.masterData).forEach(([entityType, entities]) => {
                this.cache.set(entityType, new Map(entities.map(e => [e.id, e])));
            });
        } else {
            // Initialize empty masterData structure
            this.cache.clear();
        }
        
        this.buildDependencyGraph();
        this.initialized = true;
        
        console.log("[MasterRepository] Initialized with master data cache");
    }

    // ================= DEPENDENCY GRAPH =================

    buildDependencyGraph() {
        // Define which master entities are referenced by others
        this.dependencyGraph.set(MASTER_ENTITY_TYPES.CLASS, [
            MASTER_ENTITY_TYPES.SECTION,
            MASTER_ENTITY_TYPES.SUBJECT,
            MASTER_ENTITY_TYPES.STREAM,
        ]);
        
        this.dependencyGraph.set(MASTER_ENTITY_TYPES.SECTION, [
            MASTER_ENTITY_TYPES.STREAM,
        ]);
        
        this.dependencyGraph.set(MASTER_ENTITY_TYPES.SUBJECT, [
            MASTER_ENTITY_TYPES.FEE_STRUCTURE,
        ]);
        
        this.dependencyGraph.set(MASTER_ENTITY_TYPES.FEE_STRUCTURE, [
            MASTER_ENTITY_TYPES.FEE_CATEGORY,
        ]);
        
        this.dependencyGraph.set(MASTER_ENTITY_TYPES.TRANSPORT_ROUTE, [
            MASTER_ENTITY_TYPES.PICKUP_POINT,
        ]);
        
        this.dependencyGraph.set(MASTER_ENTITY_TYPES.HOSTEL, [
            MASTER_ENTITY_TYPES.ROOM,
        ]);
        
        this.dependencyGraph.set(MASTER_ENTITY_TYPES.CERTIFICATE_TEMPLATE, [
            MASTER_ENTITY_TYPES.SCHOOL_PROFILE,
        ]);
        
        this.dependencyGraph.set(MASTER_ENTITY_TYPES.ID_CARD_TEMPLATE, [
            MASTER_ENTITY_TYPES.SCHOOL_PROFILE,
        ]);
    }

    getDependents(entityType) {
        return this.dependencyGraph.get(entityType) || [];
    }

    // ================= STORAGE OPERATIONS =================

    getMasterData() {
        const tenantContext = getTenantContextForStorage();
        const db = getTenantStorage(this.storageKey, tenantContext, {});
        return db.masterData || {};
    }

    saveMasterData(masterData) {
        const tenantContext = getTenantContextForStorage();
        const db = getTenantStorage(this.storageKey, tenantContext, {});
        
        db.masterData = masterData;
        
        setTenantStorage(this.storageKey, db, tenantContext);
    }

    // ================= CACHE OPERATIONS =================

    getFromCache(entityType, entityId) {
        const typeCache = this.cache.get(entityType);
        return typeCache?.get(entityId) || null;
    }

    getCacheByType(entityType) {
        const typeCache = this.cache.get(entityType);
        return typeCache ? Array.from(typeCache.values()) : [];
    }

    setCache(entityType, entities) {
        const typeCache = new Map(entities.map(e => [e.id, e]));
        this.cache.set(entityType, typeCache);
    }

    invalidateCache(entityType) {
        this.cache.delete(entityType);
        this.notifySubscribers(entityType, "INVALIDATED");
    }

    // ================= SUBSCRIBER NOTIFICATIONS =================

    subscribe(entityType, callback) {
        if (!this.subscribers.has(entityType)) {
            this.subscribers.set(entityType, new Set());
        }
        this.subscribers.get(entityType).add(callback);
        
        // Return unsubscribe function
        return () => {
            this.subscribers.get(entityType)?.delete(callback);
        };
    }

    notifySubscribers(entityType, action, entity) {
        const callbacks = this.subscribers.get(entityType);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(entity, action);
                } catch (error) {
                    console.error(`[MasterRepository] Subscriber error for ${entityType}:`, error);
                }
            });
        }
    }

    // ================= VALIDATION =================

    validate(entityType, entity) {
        const errors = [];
        
        // Common validations
        if (!entity.id || entity.id.trim() === "") {
            errors.push(`${entityType} ID is required`);
        }
        
        // Entity-specific validations
        switch (entityType) {
            case MASTER_ENTITY_TYPES.CLASS:
            case MASTER_ENTITY_TYPES.SECTION:
            case MASTER_ENTITY_TYPES.SUBJECT:
            case MASTER_ENTITY_TYPES.STREAM:
                if (!entity.name || entity.name.trim() === "") {
                    errors.push(`${entityType} name is required`);
                }
                break;
                
            case MASTER_ENTITY_TYPES.TRANSPORT_ROUTE:
                if (!entity.routeName || entity.routeName.trim() === "") {
                    errors.push("Route name is required");
                }
                break;
                
            case MASTER_ENTITY_TYPES.PICKUP_POINT:
                if (!entity.pickupPointName || entity.pickupPointName.trim() === "") {
                    errors.push("Pickup point name is required");
                }
                break;
                
            case MASTER_ENTITY_TYPES.HOSTEL:
            case MASTER_ENTITY_TYPES.ROOM:
                if (!entity.name || entity.name.trim() === "") {
                    errors.push(`${entityType} name is required`);
                }
                break;
                
            case MASTER_ENTITY_TYPES.FEE_STRUCTURE:
                if (!entity.name || entity.name.trim() === "") {
                    errors.push("Fee structure name is required");
                }
                if (!entity.feeCategoryId) {
                    errors.push("Fee category is required");
                }
                break;
        }
        
        // Tenant context validation
        const tenantContext = getTenantContextForStorage();
        if (!tenantContext.schoolId) {
            errors.push("Invalid tenant context - schoolId missing");
        }
        
        return {
            valid: errors.length === 0,
            errors,
        };
    }

    // ================= CRUD OPERATIONS =================

    /**
     * Create a new master entity
     * @param {string} entityType - Type of entity
     * @param {Object} entity - Entity data
     * @returns {Object} Created entity with generated fields
     */
    create(entityType, entity) {
        // Validate
        const validation = this.validate(entityType, entity);
        if (!validation.valid) {
            throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
        }
        
        // Check for duplicates
        const existing = this.getCacheByType(entityType);
        const duplicate = existing.find(e => 
            e.name?.toLowerCase() === entity.name?.toLowerCase() &&
            String(e.schoolId) === String(getTenantContextForStorage().schoolId)
        );
        
        if (duplicate) {
            throw new Error(`${entityType} already exists with this name`);
        }
        
        // Create entity with metadata
        const tenantContext = getTenantContextForStorage();
        const now = new Date().toISOString();
        
        const newEntity = withTenantContext({
            ...entity,
            id: entity.id || `${entityType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: now,
            updatedAt: now,
            createdBy: tenantContext.schoolId,
            active: entity.active !== undefined ? entity.active : true,
        });
        
        // Save to cache
        const currentEntities = this.getCacheByType(entityType);
        this.setCache(entityType, [...currentEntities, newEntity]);
        
        // Persist to storage
        const masterData = this.getMasterData();
        masterData[entityType] = this.getCacheByType(entityType);
        this.saveMasterData(masterData);
        
        // Notify subscribers
        this.notifySubscribers(entityType, "CREATED", newEntity);
        
        console.log(`[MasterRepository] Created ${entityType}:`, newEntity.id);
        return newEntity;
    }

    /**
     * Update existing master entity
     * @param {string} entityType - Type of entity
     * @param {string} entityId - Entity ID to update
     * @param {Object} updates - Fields to update
     * @returns {Object} Updated entity
     */
    update(entityType, entityId, updates) {
        // Validate
        const validation = this.validate(entityType, { ...updates, id: entityId });
        if (!validation.valid) {
            throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
        }
        
        // Get existing entity
        const existing = this.getFromCache(entityType, entityId);
        if (!existing) {
            throw new Error(`${entityType} not found: ${entityId}`);
        }
        
        // Update entity
        const updatedEntity = {
            ...existing,
            ...updates,
            id: existing.id, // Prevent ID changes
            createdAt: existing.createdAt, // Prevent created at changes
            updatedAt: new Date().toISOString(),
        };
        
        // Update cache
        const currentEntities = this.getCacheByType(entityType);
        const updatedEntities = currentEntities.map(e => 
            e.id === entityId ? updatedEntity : e
        );
        this.setCache(entityType, updatedEntities);
        
        // Persist to storage
        const masterData = this.getMasterData();
        masterData[entityType] = updatedEntities;
        this.saveMasterData(masterData);
        
        // Notify subscribers
        this.notifySubscribers(entityType, "UPDATED", updatedEntity);
        
        console.log(`[MasterRepository] Updated ${entityType}:`, entityId);
        return updatedEntity;
    }

    /**
     * Delete master entity
     * @param {string} entityType - Type of entity
     * @param {string} entityId - Entity ID to delete
     * @returns {Object} Result with success status and message
     */
    delete(entityType, entityId) {
        // Check if entity exists
        const existing = this.getFromCache(entityType, entityId);
        if (!existing) {
            return {
                success: false,
                message: `${entityType} not found: ${entityId}`,
            };
        }
        
        // Check dependencies
        const dependents = this.findDependents(entityType, entityId);
        if (dependents.length > 0) {
            return {
                success: false,
                message: `Cannot delete ${entityType}. It is referenced by: ${dependents.join(", ")}`,
                dependents,
            };
        }
        
        // Delete from cache
        const currentEntities = this.getCacheByType(entityType);
        const updatedEntities = currentEntities.filter(e => e.id !== entityId);
        this.setCache(entityType, updatedEntities);
        
        // Persist to storage
        const masterData = this.getMasterData();
        masterData[entityType] = updatedEntities;
        this.saveMasterData(masterData);
        
        // Notify subscribers
        this.notifySubscribers(entityType, "DELETED", existing);
        
        console.log(`[MasterRepository] Deleted ${entityType}:`, entityId);
        return {
            success: true,
            message: `${entityType} deleted successfully`,
        };
    }

    /**
     * Get master entity by ID
     * @param {string} entityType - Type of entity
     * @param {string} entityId - Entity ID
     * @returns {Object|null} Entity or null
     */
    getById(entityType, entityId) {
        return this.getFromCache(entityType, entityId);
    }

    /**
     * Get all master entities of a type
     * @param {string} entityType - Type of entity
     * @returns {Array} Array of entities
     */
    getAll(entityType) {
        return this.getCacheByType(entityType);
    }

    // ================= DEPENDENCY CHECKS =================

    /**
     * Find all entities that depend on the given entity
     * @param {string} entityType - Type of entity
     * @param {string} entityId - Entity ID
     * @returns {Array} Array of dependency descriptions
     */
    findDependents(entityType, entityId) {
        const dependents = [];
        
        // This is a simplified check - in production, scan transaction data
        // For now, we check common references
        
        const entity = this.getFromCache(entityType, entityId);
        if (!entity) return dependents;
        
        // Check if this entity has child entities stored locally
        const children = this.getCacheByType(entityType);
        const childDependents = children.filter(child => {
            // Check for parent reference fields
            return child.parentId === entityId || 
                   child[`${entityType.toLowerCase()}Id`] === entityId;
        });
        
        if (childDependents.length > 0) {
            dependents.push(`${childDependents.length} ${entityType} records`);
        }
        
        return dependents;
    }

    // ================= BATCH OPERATIONS =================

    /**
     * Create multiple entities in batch
     * @param {string} entityType - Type of entity
     * @param {Array} entities - Array of entity data
     * @returns {Array} Array of created entities
     */
    createBatch(entityType, entities) {
        const results = [];
        const errors = [];
        
        entities.forEach((entity, index) => {
            try {
                const created = this.create(entityType, entity);
                results.push(created);
            } catch (error) {
                errors.push({
                    index,
                    entity,
                    error: error.message,
                });
            }
        });
        
        if (errors.length > 0) {
            console.warn(`[MasterRepository] Batch create completed with ${errors.length} errors:`, errors);
        }
        
        return results;
    }

    /**
     * Refresh all cached data from storage
     */
    refreshAll() {
        Object.values(MASTER_ENTITY_TYPES).forEach(entityType => {
            this.invalidateCache(entityType);
        });
        
        this.initialize();
        console.log("[MasterRepository] All caches refreshed");
    }

    // ================= CLEAR =================

    /**
     * Clear all master data (for testing/reset)
     * @param {boolean} preserveSchema - Keep structure but clear data
     */
    clearAll(preserveSchema = false) {
        this.cache.clear();
        
        if (!preserveSchema) {
            this.subscribers.clear();
            const masterData = this.getMasterData();
            Object.keys(masterData).forEach(key => {
                delete masterData[key];
            });
            this.saveMasterData(masterData || {});
        }
        
        console.log("[MasterRepository] Cleared all master data");
    }
}

// ================= EXPORT SINGLETON =================

const masterEntityRepository = new MasterEntityRepository();

export default masterEntityRepository;
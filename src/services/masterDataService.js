/**
 * MASTER DATA SERVICE
 * Canonical service for all master data operations
 * Single source of truth - all master entities flow through this service
 * 
 * Responsibilities:
 * - CRUD operations for all master entities
 * - Validation and business rules
 * - Dependency checking before delete
 * - Change propagation to subscribers
 * - Tenant isolation enforcement
 * 
 * All master-setting modules must use this service.
 * All business modules must read master data via this service.
 */

import masterEntityRepository from "../core/masterData/MasterEntityRepository";
import { getTenantContext, isTenantContextValid } from "./tenantContextService";
import { blockDirectServiceAccess } from "../core/serviceRegistry";

// Block direct access - use ServiceRegistry.getService("masterData")
blockDirectServiceAccess("masterDataService");

// Re-export entity types for convenience
export const MASTER_ENTITY_TYPES = masterEntityRepository.MASTER_ENTITY_TYPES || {
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
};

class MasterDataService {
    constructor() {
        this.initialized = false;
        this.ensureInitialized();
    }

    ensureInitialized() {
        if (!this.initialized) {
            masterEntityRepository.initialize();
            this.initialized = true;
        }
    }

    // ================= SCHOOL PROFILE =================

    /**
     * Get school profile (singleton per tenant)
     * @returns {Object|null} School profile
     */
    getSchoolProfile() {
        this.ensureInitialized();
        const profiles = masterEntityRepository.getAll(MASTER_ENTITY_TYPES.SCHOOL_PROFILE);
        return profiles.length > 0 ? profiles[0] : null;
    }

    /**
     * Create or update school profile
     * @param {Object} profileData - School profile data
     * @returns {Object} Created/updated profile
     */
    saveSchoolProfile(profileData) {
        this.ensureInitialized();
        
        // Tenant validation
        const tenantContext = getTenantContext();
        if (!isTenantContextValid()) {
            throw new Error("Invalid tenant context for school profile");
        }
        
        const existing = this.getSchoolProfile();
        
        if (existing) {
            return masterEntityRepository.update(
                MASTER_ENTITY_TYPES.SCHOOL_PROFILE,
                existing.id,
                {
                    ...profileData,
                    schoolId: tenantContext.schoolId,
                    branchId: tenantContext.branchId,
                    sessionId: tenantContext.sessionId,
                }
            );
        } else {
            return masterEntityRepository.create(MASTER_ENTITY_TYPES.SCHOOL_PROFILE, {
                ...profileData,
                schoolId: tenantContext.schoolId,
                branchId: tenantContext.branchId,
                sessionId: tenantContext.sessionId,
            });
        }
    }

    // ================= GENERIC CRUD =================

    /**
     * Create a master entity
     * @param {string} entityType - Type of entity
     * @param {Object} entity - Entity data
     * @returns {Object} Created entity
     */
    create(entityType, entity) {
        this.ensureInitialized();
        return masterEntityRepository.create(entityType, entity);
    }

    /**
     * Update a master entity
     * @param {string} entityType - Type of entity
     * @param {string} entityId - Entity ID
     * @param {Object} updates - Updates to apply
     * @returns {Object} Updated entity
     */
    update(entityType, entityId, updates) {
        this.ensureInitialized();
        return masterEntityRepository.update(entityType, entityId, updates);
    }

    /**
     * Delete a master entity (with dependency check)
     * @param {string} entityType - Type of entity
     * @param {string} entityId - Entity ID
     * @returns {Object} Result with success status
     */
    delete(entityType, entityId) {
        this.ensureInitialized();
        return masterEntityRepository.delete(entityType, entityId);
    }

    /**
     * Get a master entity by ID
     * @param {string} entityType - Type of entity
     * @param {string} entityId - Entity ID
     * @returns {Object|null} Entity or null
     */
    getById(entityType, entityId) {
        this.ensureInitialized();
        return masterEntityRepository.getById(entityType, entityId);
    }

    /**
     * Get all master entities of a type
     * @param {string} entityType - Type of entity
     * @returns {Array} Array of entities
     */
    getAll(entityType) {
        this.ensureInitialized();
        return masterEntityRepository.getAll(entityType);
    }

    // ================= CLASSES =================

    /**
     * Get all classes
     * @returns {Array} Array of classes
     */
    getClasses() {
        return this.getAll(MASTER_ENTITY_TYPES.CLASS);
    }

    /**
     * Create a class
     * @param {Object} classData - Class data
     * @returns {Object} Created class
     */
    createClass(classData) {
        return this.create(MASTER_ENTITY_TYPES.CLASS, {
            ...classData,
            name: classData.name || classData.className,
        });
    }

    /**
     * Update a class
     * @param {string} classId - Class ID
     * @param {Object} updates - Updates to apply
     * @returns {Object} Updated class
     */
    updateClass(classId, updates) {
        return this.update(MASTER_ENTITY_TYPES.CLASS, classId, {
            ...updates,
            name: updates.name || updates.className,
        });
    }

    // ================= SECTIONS =================

    /**
     * Get all sections
     * @returns {Array} Array of sections
     */
    getSections() {
        return this.getAll(MASTER_ENTITY_TYPES.SECTION);
    }

    /**
     * Get sections by class ID
     * @param {string} classId - Class ID
     * @returns {Array} Array of sections
     */
    getSectionsByClass(classId) {
        const allSections = this.getSections();
        return allSections.filter(section => section.classId === classId);
    }

    /**
     * Create a section
     * @param {Object} sectionData - Section data
     * @returns {Object} Created section
     */
    createSection(sectionData) {
        return this.create(MASTER_ENTITY_TYPES.SECTION, {
            ...sectionData,
            name: sectionData.name || sectionData.sectionName,
        });
    }

    /**
     * Update a section
     * @param {string} sectionId - Section ID
     * @param {Object} updates - Updates to apply
     * @returns {Object} Updated section
     */
    updateSection(sectionId, updates) {
        return this.update(MASTER_ENTITY_TYPES.SECTION, sectionId, {
            ...updates,
            name: updates.name || updates.sectionName,
        });
    }

    // ================= SUBJECTS =================

    /**
     * Get all subjects
     * @returns {Array} Array of subjects
     */
    getSubjects() {
        return this.getAll(MASTER_ENTITY_TYPES.SUBJECT);
    }

    /**
     * Create a subject
     * @param {Object} subjectData - Subject data
     * @returns {Object} Created subject
     */
    createSubject(subjectData) {
        return this.create(MASTER_ENTITY_TYPES.SUBJECT, {
            ...subjectData,
            name: subjectData.name || subjectData.subjectName,
        });
    }

    /**
     * Update a subject
     * @param {string} subjectId - Subject ID
     * @param {Object} updates - Updates to apply
     * @returns {Object} Updated subject
     */
    updateSubject(subjectId, updates) {
        return this.update(MASTER_ENTITY_TYPES.SUBJECT, subjectId, {
            ...updates,
            name: updates.name || updates.subjectName,
        });
    }

    // ================= TRANSPORT ROUTES =================

    /**
     * Get all transport routes
     * @returns {Array} Array of routes
     */
    getTransportRoutes() {
        return this.getAll(MASTER_ENTITY_TYPES.TRANSPORT_ROUTE);
    }

    /**
     * Create a transport route
     * @param {Object} routeData - Route data
     * @returns {Object} Created route
     */
    createTransportRoute(routeData) {
        return this.create(MASTER_ENTITY_TYPES.TRANSPORT_ROUTE, {
            ...routeData,
            routeName: routeData.routeName || routeData.name,
        });
    }

    /**
     * Update a transport route
     * @param {string} routeId - Route ID
     * @param {Object} updates - Updates to apply
     * @returns {Object} Updated route
     */
    updateTransportRoute(routeId, updates) {
        return this.update(MASTER_ENTITY_TYPES.TRANSPORT_ROUTE, routeId, {
            ...updates,
            routeName: updates.routeName || updates.name,
        });
    }

    /**
     * Delete a transport route
     * @param {string} routeId - Route ID
     * @returns {Object} Result
     */
    deleteTransportRoute(routeId) {
        return this.delete(MASTER_ENTITY_TYPES.TRANSPORT_ROUTE, routeId);
    }

    // ================= PICKUP POINTS =================

    /**
     * Get all pickup points
     * @returns {Array} Array of pickup points
     */
    getPickupPoints() {
        return this.getAll(MASTER_ENTITY_TYPES.PICKUP_POINT);
    }

    /**
     * Get pickup points by route ID
     * @param {string} routeId - Route ID
     * @returns {Array} Array of pickup points
     */
    getPickupPointsByRoute(routeId) {
        const allPoints = this.getPickupPoints();
        return allPoints.filter(point => point.routeId === routeId);
    }

    /**
     * Create a pickup point
     * @param {Object} pointData - Pickup point data
     * @returns {Object} Created pickup point
     */
    createPickupPoint(pointData) {
        return this.create(MASTER_ENTITY_TYPES.PICKUP_POINT, {
            ...pointData,
            pickupPointName: pointData.pickupPointName || pointData.name,
        });
    }

    /**
     * Update a pickup point
     * @param {string} pointId - Pickup point ID
     * @param {Object} updates - Updates to apply
     * @returns {Object} Updated pickup point
     */
    updatePickupPoint(pointId, updates) {
        return this.update(MASTER_ENTITY_TYPES.PICKUP_POINT, pointId, {
            ...updates,
            pickupPointName: updates.pickupPointName || updates.name,
        });
    }

    // ================= FEE STRUCTURES =================

    /**
     * Get all fee structures
     * @returns {Array} Array of fee structures
     */
    getFeeStructures() {
        return this.getAll(MASTER_ENTITY_TYPES.FEE_STRUCTURE);
    }

    /**
     * Create a fee structure
     * @param {Object} feeStructureData - Fee structure data
     * @returns {Object} Created fee structure
     */
    createFeeStructure(feeStructureData) {
        return this.create(MASTER_ENTITY_TYPES.FEE_STRUCTURE, feeStructureData);
    }

    /**
     * Update a fee structure
     * @param {string} feeStructureId - Fee structure ID
     * @param {Object} updates - Updates to apply
     * @returns {Object} Updated fee structure
     */
    updateFeeStructure(feeStructureId, updates) {
        return this.update(MASTER_ENTITY_TYPES.FEE_STRUCTURE, feeStructureId, updates);
    }

    // ================= FEE CATEGORIES =================

    /**
     * Get all fee categories
     * @returns {Array} Array of fee categories
     */
    getFeeCategories() {
        return this.getAll(MASTER_ENTITY_TYPES.FEE_CATEGORY);
    }

    /**
     * Create a fee category
     * @param {Object} categoryData - Category data
     * @returns {Object} Created category
     */
    createFeeCategory(categoryData) {
        return this.create(MASTER_ENTITY_TYPES.FEE_CATEGORY, categoryData);
    }

    // ================= HOSTEL =================

    /**
     * Get all hostels
     * @returns {Array} Array of hostels
     */
    getHostels() {
        return this.getAll(MASTER_ENTITY_TYPES.HOSTEL);
    }

    /**
     * Create a hostel
     * @param {Object} hostelData - Hostel data
     * @returns {Object} Created hostel
     */
    createHostel(hostelData) {
        return this.create(MASTER_ENTITY_TYPES.HOSTEL, {
            ...hostelData,
            name: hostelData.name || hostelData.hostelName,
        });
    }

    /**
     * Update a hostel
     * @param {string} hostelId - Hostel ID
     * @param {Object} updates - Updates to apply
     * @returns {Object} Updated hostel
     */
    updateHostel(hostelId, updates) {
        return this.update(MASTER_ENTITY_TYPES.HOSTEL, hostelId, {
            ...updates,
            name: updates.name || updates.hostelName,
        });
    }

    // ================= ROOMS =================

    /**
     * Get all rooms
     * @returns {Array} Array of rooms
     */
    getRooms() {
        return this.getAll(MASTER_ENTITY_TYPES.ROOM);
    }

    /**
     * Get rooms by hostel ID
     * @param {string} hostelId - Hostel ID
     * @returns {Array} Array of rooms
     */
    getRoomsByHostel(hostelId) {
        const allRooms = this.getRooms();
        return allRooms.filter(room => room.hostelId === hostelId);
    }

    /**
     * Create a room
     * @param {Object} roomData - Room data
     * @returns {Object} Created room
     */
    createRoom(roomData) {
        return this.create(MASTER_ENTITY_TYPES.ROOM, {
            ...roomData,
            name: roomData.name || roomData.roomName,
        });
    }

    /**
     * Update a room
     * @param {string} roomId - Room ID
     * @param {Object} updates - Updates to apply
     * @returns {Object} Updated room
     */
    updateRoom(roomId, updates) {
        return this.update(MASTER_ENTITY_TYPES.ROOM, roomId, {
            ...updates,
            name: updates.name || updates.roomName,
        });
    }

    // ================= SUBSCRIPTION TO CHANGES =================

    /**
     * Subscribe to changes for a master entity type
     * @param {string} entityType - Type of entity
     * @param {Function} callback - Callback function(entity, action)
     * @returns {Function} Unsubscribe function
     */
    subscribe(entityType, callback) {
        return masterEntityRepository.subscribe(entityType, callback);
    }

    /**
     * Refresh all cached master data from storage
     */
    refreshAll() {
        masterEntityRepository.refreshAll();
    }

    // ================= VALIDATION HELPERS =================

    /**
     * Validate tenant context for master data operations
     * @returns {boolean} True if valid
     */
    validateTenantContext() {
        return isTenantContextValid();
    }

    /**
     * Get dependency graph for an entity type
     * @param {string} entityType - Type of entity
     * @returns {Array} Dependent entity types
     */
    getDependents(entityType) {
        return masterEntityRepository.getDependents(entityType);
    }
}

// ================= EXPORT SINGLETON =================

const masterDataService = new MasterDataService();

export default masterDataService;
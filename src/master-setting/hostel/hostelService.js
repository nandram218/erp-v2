/* =========================================================
   ERP HOSTEL SERVICE - SINGLE SOURCE OF TRUTH
   Phase 3.2C Foundation - Hostel Configuration
========================================================= */

import {
    getStorageCompat,
    setStorageCompat,
    STORAGE_KEYS,
} from "../../services/storageService";

const DB_KEY = STORAGE_KEYS.ERP_DB;

const getDB = () => {
    try {
        return getStorageCompat(DB_KEY, {});
    } catch {
        return {};
    }
};

const saveDB = (db) => {
    setStorageCompat(DB_KEY, db);
};

const defaultHostel = {
    rooms: [],
    beds: [],
    assignments: [],
    hostelFee: {
        amount: 0,
        enabled: false
    }
};

/* =========================
   GET HOSTEL DB
========================= */

export const get = () => {
    const db = getDB();
    return {
        ...defaultHostel,
        ...(db.hostel || {}),
        rooms: db.hostel?.rooms || [],
        beds: db.hostel?.beds || [],
        assignments: db.hostel?.assignments || [],
    };
};

/* =========================
   SAVE HOSTEL DB
========================= */

export const save = (hostelData) => {
    const db = getDB();
    db.hostel = hostelData;
    saveDB(db);
};

/* =========================
   RESET HOSTEL
========================= */

export const reset = () => {
    const db = getDB();
    db.hostel = defaultHostel;
    saveDB(db);
};

/* =========================
   ROOM MANAGEMENT
========================= */

export const getRooms = () => {
    const hostel = get();
    return hostel.rooms || [];
};

export const getRoomById = (roomId) => {
    const rooms = getRooms();
    return rooms.find(r => String(r.id) === String(roomId));
};

export const createRoom = ({ roomNumber, capacity, type, floor }) => {
    const hostel = get();
    const existing = hostel.rooms?.find(r => r.roomNumber === roomNumber);
    
    if (existing) {
        throw new Error(`Room ${roomNumber} already exists`);
    }
    
    const newRoom = {
        id: Date.now(),
        roomNumber,
        capacity: Number(capacity),
        type,
        floor,
        occupiedBeds: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    hostel.rooms.push(newRoom);
    save(hostel);
    
    return newRoom;
};

export const updateRoom = (roomId, updates) => {
    const hostel = get();
    const roomIndex = hostel.rooms.findIndex(r => String(r.id) === String(roomId));
    
    if (roomIndex === -1) {
        throw new Error(`Room not found`);
    }
    
    hostel.rooms[roomIndex] = {
        ...hostel.rooms[roomIndex],
        ...updates,
        updatedAt: new Date().toISOString()
    };
    
    save(hostel);
    
    return hostel.rooms[roomIndex];
};

/* =========================
   BED MANAGEMENT
========================= */

export const getBeds = () => {
    const hostel = get();
    return hostel.beds || [];
};

export const getBedById = (bedId) => {
    const beds = getBeds();
    return beds.find(b => String(b.id) === String(bedId));
};

export const getAvailableBeds = (roomId) => {
    const beds = getBeds();
    return beds.filter(b => 
        String(b.roomId) === String(roomId) && 
        !b.occupied
    );
};

export const createBed = ({ roomId, bedNumber }) => {
    const hostel = get();
    const room = getRoomById(roomId);
    
    if (!room) {
        throw new Error(`Room not found`);
    }
    
    const existingBed = hostel.beds?.find(b => 
        String(b.roomId) === String(roomId) && 
        b.bedNumber === bedNumber
    );
    
    if (existingBed) {
        throw new Error(`Bed ${bedNumber} already exists in room ${room.roomNumber}`);
    }
    
    const newBed = {
        id: Date.now(),
        roomId,
        bedNumber,
        occupied: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    hostel.beds.push(newBed);
    
    room.occupiedBeds = hostel.beds.filter(b => 
        String(b.roomId) === String(roomId) && b.occupied
    ).length;
    
    save(hostel);
    
    return newBed;
};

/* =========================
   HOSTEL FEE MANAGEMENT
========================= */

export const getHostelFee = () => {
    const hostel = get();
    return hostel.hostelFee || { amount: 0, enabled: false };
};

export const setHostelFee = (amount, enabled = true) => {
    const hostel = get();
    hostel.hostelFee = {
        amount: Number(amount),
        enabled
    };
    save(hostel);
    
    return hostel.hostelFee;
};

/* =========================
   STUDENT ASSIGNMENT
========================= */

export const assignStudentToBed = ({ studentId, bedId }) => {
    const hostel = get();
    const bed = getBedById(bedId);
    
    if (!bed) {
        throw new Error(`Bed not found`);
    }
    
    if (bed.occupied) {
        throw new Error(`Bed is already occupied`);
    }
    
    const existingAssignment = hostel.assignments?.find(a => String(a.studentId) === String(studentId));
    if (existingAssignment) {
        throw new Error(`Student already assigned to a bed`);
    }
    
    bed.occupied = true;
    bed.occupiedBy = studentId;
    bed.occupiedAt = new Date().toISOString();
    
    hostel.assignments.push({
        id: Date.now(),
        studentId,
        bedId,
        assignedAt: new Date().toISOString()
    });
    
    const room = getRoomById(bed.roomId);
    if (room) {
        room.occupiedBeds = hostel.beds.filter(b => 
            String(b.roomId) === String(room.id) && b.occupied
        ).length;
    }
    
    save(hostel);
    
    return bed;
};

export const releaseStudentBed = (studentId) => {
    const hostel = get();
    const assignment = hostel.assignments?.find(a => String(a.studentId) === String(studentId));
    
    if (!assignment) {
        throw new Error(`Student assignment not found`);
    }
    
    const bed = getBedById(assignment.bedId);
    if (bed) {
        bed.occupied = false;
        bed.occupiedBy = null;
        bed.occupiedAt = null;
        
        const room = getRoomById(bed.roomId);
        if (room) {
            room.occupiedBeds = hostel.beds.filter(b => 
                String(b.roomId) === String(room.id) && b.occupied
            ).length;
        }
    }
    
    hostel.assignments = hostel.assignments.filter(a => String(a.studentId) !== String(studentId));
    
    save(hostel);
    
    return true;
};

export const getStudentAssignment = (studentId) => {
    const hostel = get();
    return hostel.assignments?.find(a => String(a.studentId) === String(studentId));
};

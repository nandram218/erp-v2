/* =========================================================
   ERP LEDGER SERVICE - READ-ONLY SUMMARY LAYER
   Phase 3.2C Step-2.1B - Professional SaaS Ledger
   ⚠️ READ-ONLY SERVICE - No direct mutations allowed
   Use feesService for all write operations
========================================================= */

import { getService } from "../../core/serviceRegistry";

/* =========================
   LEDGER CONTRACT
   Summary-only data structure
   NO transaction-level fields
========================= */

export const LEDGER_CONTRACT = {
  studentId: "string",
  studentName: "string",
  className: "string",
  
  // Core Ledger Fields (from feesService)
  assignedAmount: "number",  // totalFee from feesService
  collectedAmount: "number", // paidAmount from feesService
  dueAmount: "number",       // dueAmount from feesService
  
  // Status (derived)
  paymentStatus: "string",   // status from feesService
  
  // Metadata (derived)
  paymentCount: "number",
  lastPaymentDate: "string",
  
  // Timestamps
  ledgerGeneratedAt: "string"
};

/* =========================
   GET STUDENT LEDGER
   Read-only summary for single student
========================= */

export const getStudentLedger = (studentId) => {
  const feesService = getService("fees");
  const feeRecord = feesService.getStudentFeesRecord(studentId);
  
  if (!feeRecord) {
    return null;
  }
  
  const payments = feesService.getStudentPaymentHistory(studentId) || [];
  
  return {
    studentId: feeRecord.studentId,
    studentName: feeRecord.studentName,
    className: feeRecord.className,
    
    // Core Ledger Fields (from feesService)
    assignedAmount: Number(feeRecord.totalFee || 0),
    collectedAmount: Number(feeRecord.paidAmount || 0),
    dueAmount: Number(feeRecord.dueAmount || 0),
    
    // Status (derived)
    paymentStatus: feeRecord.status || "unpaid",
    
    // Metadata (derived)
    paymentCount: payments.length,
    lastPaymentDate: payments.length > 0 
      ? payments[0].paymentDate 
      : null,
    
    // Timestamps
    ledgerGeneratedAt: new Date().toISOString()
  };
};

/* =========================
   GET ALL STUDENT LEDGERS
   Read-only summary for all students
========================= */

export const getAllStudentLedgers = () => {
  const feesService = getService("fees");
  const feeRecords = feesService.getAllFeesRecords() || [];
  
  return feeRecords.map(feeRecord => {
    const payments = feesService.getStudentPaymentHistory(feeRecord.studentId) || [];
    
    return {
      studentId: feeRecord.studentId,
      studentName: feeRecord.studentName,
      className: feeRecord.className,
      
      // Core Ledger Fields (from feesService)
      assignedAmount: Number(feeRecord.totalFee || 0),
      collectedAmount: Number(feeRecord.paidAmount || 0),
      dueAmount: Number(feeRecord.dueAmount || 0),
      
      // Status (derived)
      paymentStatus: feeRecord.status || "unpaid",
      
      // Metadata (derived)
      paymentCount: payments.length,
      lastPaymentDate: payments.length > 0 
        ? payments[0].paymentDate 
        : null,
      
      // Timestamps
      ledgerGeneratedAt: new Date().toISOString()
    };
  });
};

/* =========================
   GET LEDGER SUMMARY
   Overall financial summary
========================= */

export const getLedgerSummary = () => {
  const ledgers = getAllStudentLedgers();
  
  return {
    totalAssigned: ledgers.reduce((sum, ledger) => sum + ledger.assignedAmount, 0),
    totalCollected: ledgers.reduce((sum, ledger) => sum + ledger.collectedAmount, 0),
    totalDue: ledgers.reduce((sum, ledger) => sum + ledger.dueAmount, 0),
    totalStudents: ledgers.length,
    paidStudents: ledgers.filter(l => l.paymentStatus === "paid").length,
    partialStudents: ledgers.filter(l => l.paymentStatus === "partial").length,
    unpaidStudents: ledgers.filter(l => l.paymentStatus === "unpaid").length,
    ledgerGeneratedAt: new Date().toISOString()
  };
};

/* =========================
   GET CLASS-WISE LEDGER SUMMARY
   Financial summary by class
========================= */

export const getClassWiseLedgerSummary = () => {
  const ledgers = getAllStudentLedgers();
  
  const classGroups = {};
  
  ledgers.forEach(ledger => {
    const className = ledger.className || "Unknown";
    
    if (!classGroups[className]) {
      classGroups[className] = {
        className,
        totalAssigned: 0,
        totalCollected: 0,
        totalDue: 0,
        studentCount: 0,
        paidStudents: 0,
        partialStudents: 0,
        unpaidStudents: 0
      };
    }
    
    classGroups[className].totalAssigned += ledger.assignedAmount;
    classGroups[className].totalCollected += ledger.collectedAmount;
    classGroups[className].totalDue += ledger.dueAmount;
    classGroups[className].studentCount += 1;
    
    if (ledger.paymentStatus === "paid") {
      classGroups[className].paidStudents += 1;
    } else if (ledger.paymentStatus === "partial") {
      classGroups[className].partialStudents += 1;
    } else {
      classGroups[className].unpaidStudents += 1;
    }
  });
  
  return Object.values(classGroups);
};

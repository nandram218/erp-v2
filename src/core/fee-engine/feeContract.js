/**
 * Canonical Fee Structure Contract
 * 
 * This is the single source of truth for fee data structure across the entire ERP system.
 * All modules (FeeSettings, StudentForm, FeeCollection) must use this contract.
 * 
 * NO TRANSLATION LAYERS. NO ADAPTERS. NO MAPPING.
 */

/**
 * Fee Settings Storage Contract
 * Stored in localStorage key: ERP_FEE_SETTINGS
 */
export const FEE_SETTINGS_CONTRACT = {
  schoolId: "string",
  academicYear: "string",
  classes: {
    "Class 10": {
      compulsoryFees: [
        { id: "fee_1", name: "Tuition Fee", amount: 5000 },
        { id: "fee_2", name: "Library Fee", amount: 500 }
      ],
      optionalFees: [
        { id: "fee_3", name: "Computer Lab", amount: 1000 },
        { id: "fee_4", name: "Sports Fee", amount: 800 }
      ]
    }
  },
  transportRoutes: [
    { id: "route_1", name: "Route A", fee: 1200, pickupPoints: ["Point 1", "Point 2"] },
    { id: "route_2", name: "Route B", fee: 1500, pickupPoints: ["Point 3", "Point 4"] }
  ],
  hostelFee: { enabled: true, amount: 8000 }
};

/**
 * Student Fee Selection Contract
 * Saved in student record
 */
export const STUDENT_FEE_CONTRACT = {
  studentId: "string",
  class: "Class 10",
  selectedCompulsoryFees: ["fee_1", "fee_2"], // Auto-selected
  selectedOptionalFees: ["fee_3"], // User-selected
  transport: { enabled: true, routeId: "route_1", pickupPoint: "Point 1", fee: 1200 },
  hostel: { enabled: true, fee: 8000 }
};

/**
 * Runtime Fee Calculation
 * Calculate totals at runtime - DO NOT STORE
 */
export const calculateStudentTotal = (studentFee, feeSettings) => {
  const classData = feeSettings.classes[studentFee.class];
  
  const compulsoryTotal = classData.compulsoryFees
    .filter(fee => studentFee.selectedCompulsoryFees.includes(fee.id))
    .reduce((sum, fee) => sum + fee.amount, 0);
  
  const optionalTotal = classData.optionalFees
    .filter(fee => studentFee.selectedOptionalFees.includes(fee.id))
    .reduce((sum, fee) => sum + fee.amount, 0);
  
  const transportFee = studentFee.transport.enabled ? studentFee.transport.fee : 0;
  const hostelFee = studentFee.hostel.enabled ? studentFee.hostel.fee : 0;
  
  return {
    compulsoryTotal,
    optionalTotal,
    transportFee,
    hostelFee,
    totalFee: compulsoryTotal + optionalTotal + transportFee + hostelFee
  };
};

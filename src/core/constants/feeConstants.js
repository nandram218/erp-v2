export const CLASS_FEES = {
    PP3: 500, PP4: 500, PP5: 600,
    Nursery: 600, LKG: 700, UKG: 800,
    "1st": 1000, "2nd": 1100, "3rd": 1200,
    "4th": 1300, "5th": 1400, "6th": 1500,
    "7th": 1600, "8th": 1700, "9th": 1800,
    "10th": 2000, "11th": 2500, "12th": 3000
};

export const HOSTEL_FEE_CONST = 1500;

export const TRANSPORT_ROUTES = Array.from({ length: 8 }, (_, i) => ({
    name: `Route ${i + 1}`,
    fee: 500 + i * 100
}));
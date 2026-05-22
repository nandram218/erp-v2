export const calculateAnnualFee = (monthlyFee) => {
    return Number(monthlyFee || 0) * 12;
};

export const calculateRouteOccupancy = (
    students = [],
    routeId
) => {
    return students.filter(
        (s) => s.transport?.routeId === routeId
    ).length;
};

export const getVehicleStatus = (
    active
) => {
    return active ? "Active" : "Inactive";
};

export const formatVehicleLabel = (
    vehicle
) => {
    return `${vehicle.vehicleNumber} (${vehicle.vehicleType})`;
}; 
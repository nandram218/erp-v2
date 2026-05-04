const KEY = "ERP_TRANSPORT";

export const transportService = {

    get: () => {
        const data = JSON.parse(localStorage.getItem(KEY));

        return {
            routes: data?.routes || [],
            vehicles: data?.vehicles || [],
            drivers: data?.drivers || [],
            mappings: data?.mappings || []
        };
    },

    save: (data) => {
        localStorage.setItem(KEY, JSON.stringify(data));
    },

    reset: () => {
        localStorage.removeItem(KEY);
    }
};
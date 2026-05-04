const FEE_KEY = "ERP_FEES";

export const feesService = {

    save: (data) => {
        localStorage.setItem(FEE_KEY, JSON.stringify(data));
    },

    get: () => {
        return JSON.parse(localStorage.getItem(FEE_KEY)) || {};
    },

    reset: () => {
        localStorage.removeItem(FEE_KEY);
    }
};
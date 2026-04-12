import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardPage from "../modules/dashboard/pages/DashboardPage";

const AppRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <DashboardLayout>
                        <DashboardPage />
                    </DashboardLayout>
                }
            />
        </Routes>
    );
};

export default AppRoutes;
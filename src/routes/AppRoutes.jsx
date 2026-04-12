import { Routes, Route } from "react-router-dom";
import DashboardPage from "../modules/dashboard/pages/DashboardPage";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<DashboardPage />} />
        </Routes>
    );
};

export default AppRoutes;
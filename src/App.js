import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import DashboardPage from "./modules/dashboard/pages/DashboardPage";

import StudentPage from "./modules/students/pages/StudentPage";
import StudentForm from "./modules/students/StudentForm";
import StudentListPage from "./modules/students/pages/StudentListPage";
import StudentProfile from "./modules/students/pages/StudentProfile";
import StudentIDCard from "./modules/students/pages/StudentIDCard";     // single card
import StudentIDCards from "./modules/students/pages/StudentIDCards";   // bulk cards
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ✅ Dashboard only */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
        </Route>

        {/* 🔥 Students WITHOUT DashboardLayout */}
        <Route path="/students" element={<StudentPage />}>
          <Route index element={<StudentListPage />} />
          <Route path="add" element={<StudentForm />} />
          <Route path="edit/:id" element={<StudentForm />} />
          <Route path="view/:id" element={<StudentProfile />} />
          <Route path="idcard/:id" element={<StudentIDCard />} />
          <Route path="idcards" element={<StudentIDCards />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
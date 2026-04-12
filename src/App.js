import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Students
import StudentPage from "./modules/students/pages/StudentPage";
import StudentForm from "./modules/students/StudentForm";

function App() {
  return (
    <Router>
      <Routes>

        {/* Students Main Page */}
        <Route path="/" element={<StudentPage />} />
        <Route path="/students" element={<StudentPage />} />

        {/* Add Student */}
        <Route path="/students/add" element={<StudentForm />} />

      </Routes>
    </Router>
  );
}

export default App;
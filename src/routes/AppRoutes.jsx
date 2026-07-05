import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

/* ================= LAZY LOADED MODULES ================= */

// DASHBOARD
const DashboardPage = lazy(() =>
    import("../modules/dashboard/pages/DashboardPage")
);

// STUDENTS
const StudentPage = lazy(() =>
    import("../modules/students/pages/StudentPage")
);
const StudentListPage = lazy(() =>
    import("../modules/students/pages/StudentListPage")
);
const StudentForm = lazy(() =>
    import("../modules/students/StudentForm")
);
const StudentIDCards = lazy(() =>
    import("../modules/students/pages/StudentIDCards")
);
const StudentProfile = lazy(() =>
    import("../modules/students/pages/StudentProfile")
);

// FEES
const FeesPage = lazy(() =>
    import("../modules/fees/pages/FeesPage")
);
const FeesHistoryPage = lazy(() =>
    import("../modules/fees/pages/FeesHistoryPage")
);
const StudentFeeAccountPage = lazy(() =>
    import("../modules/fees/pages/StudentFeeAccountPage")
);
const DueReportPage = lazy(() =>
    import("../modules/fees/pages/DueReportPage")
);
const PrintReceipt = lazy(() =>
    import("../modules/fees/pages/PrintReceipt")
);

// STAFF
const StaffPage = lazy(() =>
    import("../modules/staff/pages/StaffPage")
);

// CERTIFICATES
const CertificateSelector = lazy(() =>
    import("../modules/students/certificates/CertificateSelector")
);
const CertificatePreview = lazy(() =>
    import("../modules/students/certificates/CertificatePreview")
);

// MASTER SETTINGS
const MasterSettingDashboard = lazy(() =>
    import("../master-setting/MasterSettingDashboard")
);
const SchoolProfile = lazy(() =>
    import("../master-setting/school-profile/SchoolProfile")
);
const AcademicSettings = lazy(() =>
    import("../master-setting/academic/AcademicSettings")
);
const ClassManager = lazy(() =>
    import("../master-setting/classes-subjects/ClassManager")
);
const SubjectManager = lazy(() =>
    import("../master-setting/classes-subjects/SubjectManager")
);
const FeeSettings = lazy(() =>
    import("../master-setting/fees/FeeSettings")
);
const FeeStructure = lazy(() =>
    import("../master-setting/fees/FeeStructure")
);
const ExamSetup = lazy(() =>
    import("../master-setting/exams/ExamSetup")
);
const ExamSchedule = lazy(() =>
    import("../master-setting/exams/ExamSchedule")
);
const TransportSettings = lazy(() =>
    import("../master-setting/transport/TransportSettings")
);
const TransportRoutes = lazy(() =>
    import("../master-setting/transport/TransportRoutes")
);
const HostelSetup = lazy(() =>
    import("../master-setting/hostel/HostelSetup")
);
const RoleManager = lazy(() =>
    import("../master-setting/security/RoleManager")
);
const AccessControl = lazy(() =>
    import("../master-setting/security/AccessControl")
);
const TransportPage = lazy(() =>
    import("../modules/transport/pages/TransportPage")
);

/* ================= LOADER ================= */

const Loading = () => (
    <div style={{ padding: 20, fontWeight: 600 }}>
        🚀 Loading Module...
    </div>
);

/* ================= ROUTES ================= */

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="*" element={
                <DashboardLayout>
                    <Suspense fallback={<Loading />}>
                        <Routes>
                                {/* DASHBOARD */}
                                <Route index element={<DashboardPage />} />
                                <Route path="dashboard" element={<DashboardPage />} />

                                {/* STUDENTS */}
                                <Route path="students" element={<StudentPage />} />
                                <Route path="students/list" element={<StudentListPage />} />
                                <Route path="students/add" element={<StudentForm />} />
                                <Route path="students/idcards" element={<StudentIDCards />} />
                                <Route path="students/view/:id" element={<StudentProfile />} />

                                {/* CERTIFICATES */}
                                <Route path="certificate-selector" element={<CertificateSelector />} />
                                <Route path="certificate" element={<CertificatePreview />} />

                                {/* FEES */}
                                <Route path="fees" element={<FeesPage />} />
                                <Route path="fees/history" element={<FeesHistoryPage />} />
                                <Route path="fees/account/:studentId" element={<StudentFeeAccountPage />} />
                                <Route path="fees/due-report" element={<DueReportPage />} />
                                <Route path="fees/receipt/:id" element={<PrintReceipt />} />

                                {/* STAFF */}
                                <Route path="staff" element={<StaffPage />} />

                                {/* MASTER SETTINGS */}
                                <Route path="master-setting" element={<MasterSettingDashboard />} />
                                <Route path="master-setting/school-profile" element={<SchoolProfile />} />
                                <Route path="master-setting/academic" element={<AcademicSettings />} />
                                <Route path="master-setting/classes-subjects/classes" element={<ClassManager />} />
                                <Route path="master-setting/classes-subjects/subjects" element={<SubjectManager />} />
                                <Route path="master-setting/fees" element={<FeeSettings />} />
                                <Route path="master-setting/fees/structure" element={<FeeStructure />} />
                                <Route path="master-setting/exams" element={<ExamSetup />} />
                                <Route path="master-setting/exams/schedule" element={<ExamSchedule />} />
                                <Route path="master-setting/transport" element={<TransportSettings />} />
                                <Route path="master-setting/transport/routes" element={<TransportRoutes />} />
                                <Route path="master-setting/hostel" element={<HostelSetup />} />
                                <Route path="master-setting/security" element={<RoleManager />} />
                                <Route path="master-setting/security/access" element={<AccessControl />} />

                                {/* TRANSPORT */}
                                <Route path="transport" element={<TransportPage />} />
                        </Routes>
                    </Suspense>
                </DashboardLayout>
            } />
        </Routes>
    );
}
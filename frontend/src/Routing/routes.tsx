import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../auth/login";
import Register from "../auth/register";
import RoleRoute from "./roleRoute";
import AdminDashboard from "../admin/AdminDashboard";
import UserDashboard from "../user/studentDashboard";
import AddExam from "../admin/addExam";
import ViewExams from "../admin/viewExams";
import ShowExams from "../user/showExams";
import ExamPage from "../user/exam";
import AllResults from "../user/GetResult";
import UsersPage from "../admin/getUsers";
import UserMarksPage from "../admin/userMarks";
// check auth

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* root */}
        <Route
          path="/"
          element={
       
               <Navigate to="/login" replace />
          }
        />

        {/* auth */}
        <Route
          path="/login"
          element={
         
          
               <Login />
          }
        />

        <Route path="/register" element={<Register />} />

        {/* user */}
        <Route
          path="/dashboard"
          element={
            <RoleRoute allowedRoles={["user"]}>
              <UserDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/exams"
          element={
            <RoleRoute allowedRoles={["user"]}>
              <ShowExams />
            </RoleRoute>
          }
        />
        <Route
          path="/exam/:examId"
          element={
            <RoleRoute allowedRoles={["user"]}>
              <ExamPage />
            </RoleRoute>
          }
        />
           <Route
          path="/results"
          element={
            <RoleRoute allowedRoles={["user"]}>
              <AllResults />
            </RoleRoute>
          }
        />

        {/* admin */}
        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
         <Route
        path="/admin/addexam"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <AddExam />
            </RoleRoute>
          }
        />
         <Route
        path="/admin/viewexams"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <ViewExams />
            </RoleRoute>
          }
        />

        {/* unauthorized */}
        <Route
          path="/unauthorized"
          element={<h1>Unauthorized ❌</h1>}
        />

        <Route
          path="/admin/manageusers"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <UsersPage />
            </RoleRoute>
          }
        />
  <Route
          path="/users/:id"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <UserMarksPage />
            </RoleRoute>
          }
        />
        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
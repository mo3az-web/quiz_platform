import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../auth/login";
import Register from "../auth/register";
import RoleRoute from "./roleRoute";
import AdminDashboard from "../admin/AdminDashboard";
import UserDashboard from "../user/studentDashboard";
import AddExam from "../admin/addExam";
import ViewExams from "../admin/viewExams";

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

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
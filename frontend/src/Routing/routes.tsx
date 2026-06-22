import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../auth/login";
import Register from "../auth/register";
import RoleRoute from "./roleRoute";
import AdminDashboard from "../admin/AdminDashboard";
import UserDashboard from "../user/studentDashboard";
// check auth
const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* الصفحة الرئيسية */}
        <Route
          path="/"
          element={
            isAuthenticated() ? <Navigate to="/dashboard" /> : <Login />
          }
        />

        <Route path="/register" element={<Register />} />

        {/* user routes*/}
        <Route
          path="/dashboard"
          element={
            <RoleRoute allowedRoles={["user"]}>
              <UserDashboard />
            </RoleRoute>
          }
        />

        {/* admin routes*/}
        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <AdminDashboard/>
            </RoleRoute>
          }
        />

    
  
        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}
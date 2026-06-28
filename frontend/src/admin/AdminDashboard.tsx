import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus,
  ClipboardList,
  Users,
  LogOut,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("username") || "Admin";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-white">
      <div className="mx-auto max-w-5xl rounded-2xl bg-gray-900 p-6 shadow-xl border border-gray-800">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-red-500" size={28} />
            <h1 className="text-2xl font-bold">
              Admin Dashboard
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm hover:bg-red-700 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Welcome */}
        <p className="mt-4 text-gray-400">
          Welcome back, <span className="text-white font-semibold">{adminName}</span>
        </p>

        {/* Actions */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          <NavLink
            to="/admin/addexam"
            className="flex items-center gap-3 rounded-xl bg-blue-600 p-4 hover:bg-blue-700 transition shadow"
          >
            <FilePlus size={22} />
            <span className="font-medium">Add Exam</span>
          </NavLink>

          <NavLink
            to="/admin/viewexams"
            className="flex items-center gap-3 rounded-xl bg-green-600 p-4 hover:bg-green-700 transition shadow"
          >
            <ClipboardList size={22} />
            <span className="font-medium">View Exams</span>
          </NavLink>

          <NavLink
            to="/admin/manageusers"
            className="flex items-center gap-3 rounded-xl bg-purple-600 p-4 hover:bg-purple-700 transition shadow sm:col-span-2"
          >
            <Users size={22} />
            <span className="font-medium">Manage Users</span>
          </NavLink>

        </div>

      </div>
    </div>
  );
}
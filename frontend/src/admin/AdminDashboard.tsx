import { NavLink } from "react-router-dom";

export default function AdminDashboard() {
  const adminName = localStorage.getItem("username") || "Admin";

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="rounded-2xl bg-gray-800 p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-red-400">
          Admin Panel 🔥 {adminName}
        </h1>

        <p className="mt-2 text-gray-300">
          Manage users, courses, and system settings.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <NavLink
            to="/admin/addexam"
            className="inline-block rounded-lg bg-blue-500 px-4 py-2 transition-colors hover:bg-blue-600"
          >
            Add Exam
          </NavLink>

          <NavLink
            to="/admin/viewexams"
            className="inline-block rounded-lg bg-green-600 px-4 py-2 transition-colors hover:bg-green-700"
          >
            View Exams
          </NavLink>
        </div>

        <div className="mt-6 grid gap-4">
          <div className="rounded-lg bg-gray-700 p-4">👥 Total Users: 120</div>
          <div className="rounded-lg bg-gray-700 p-4">📚 Total Courses: 25</div>
          <div className="rounded-lg bg-gray-700 p-4">⚙️ System Status: Healthy</div>
        </div>

        <button className="mt-6 rounded-lg bg-red-500 px-4 py-2 hover:bg-red-600">
          Manage Users
        </button>
      </div>
    </div>
  );
}

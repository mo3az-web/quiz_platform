import { NavLink } from "react-router-dom";


export default function AdminDashboard() {
  const adminName = localStorage.getItem("username") || "Admin";

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
        
        <h1 className="text-3xl font-bold text-red-400">
          Admin Panel 🔥 {adminName}
        </h1>

      
<NavLink 
  to="/admin/addexam"
  className="inline-block mt-4 bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
>
  Add Exam
</NavLink>
        <p className="mt-2 text-gray-300">
          Manage users, courses, and system settings.
        </p>
          
        <div className="mt-6 grid gap-4">

          <div className="p-4 bg-gray-700 rounded-lg">
            👥 Total Users: 120
          </div>

          <div className="p-4 bg-gray-700 rounded-lg">
            📚 Total Courses: 25
          </div>

          <div className="p-4 bg-gray-700 rounded-lg">
            ⚙️ System Status: Healthy
          </div>

        </div>

        <button className="mt-6 bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600">
          Manage Users
        </button>

      </div>
    </div>
  );
}
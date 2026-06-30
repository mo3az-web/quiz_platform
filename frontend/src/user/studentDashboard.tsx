import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Bell,
  LogOut,
  BookOpen,
  BarChart3,
} from "lucide-react";

export default function UserDashboard() {
  const username = localStorage.getItem("username") || "User";
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    "امتحان جديد متاح الآن",
    "تم إعلان نتيجتك",
    "اختبار سينتهي قريبًا",
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      {/* 🔵 Navbar */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center sticky top-0">

        <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <BookOpen size={22} />
          Exam Portal
        </h2>

        <div className="flex items-center gap-5">

          <span className="text-sm text-gray-600 hidden md:block">
            👋 {username}
          </span>

          {/* 🔔 Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative hover:scale-110 transition"
            >
              <Bell size={22} />

              {/* Badge */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                {notifications.length}
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-xl border">
                <div className="p-4 border-b font-semibold text-gray-700">
                  الإشعارات
                </div>

                {notifications.map((note, idx) => (
                  <div
                    key={idx}
                    className="p-3 text-sm hover:bg-gray-50 border-b cursor-pointer"
                  >
                    {note}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 🔴 Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow transition"
          >
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* 🔵 Main */}
      <div className="p-6">
        <div className="max-w-5xl mx-auto">

          {/* Hero */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-10 rounded-3xl shadow-xl mb-10">
            <h1 className="text-3xl font-bold mb-2">
              {username}
            </h1>
         
          </div>

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-8">

            {/* Start Exam */}
            <div
              onClick={() => navigate("/exams")}
              className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-xl cursor-pointer transition hover:-translate-y-2 border"
            >
              <BookOpen
                size={40}
                className="mb-4 text-blue-600 group-hover:scale-110 transition"
              />

              <h2 className="text-xl font-bold text-gray-800 mb-2">
                بدء الاختبار
              </h2>

              <p className="text-gray-500 text-sm">
                ادخل على الامتحانات المتاحة وابدأ فورًا
              </p>
            </div>

            {/* Results */}
            <div
              onClick={() => navigate("/results")}
              className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-xl cursor-pointer transition hover:-translate-y-2 border"
            >
              <BarChart3
                size={40}
                className="mb-4 text-green-600 group-hover:scale-110 transition"
              />

              <h2 className="text-xl font-bold text-gray-800 mb-2">
                النتائج
              </h2>

              <p className="text-gray-500 text-sm">
                تابع درجاتك في الاختبارات السابقة
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
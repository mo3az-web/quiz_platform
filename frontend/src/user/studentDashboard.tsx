import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const username = localStorage.getItem("username") || "User";
  const navigate = useNavigate();

  const stats = [
    { label: "Your Courses", value: "3", icon: "📊", color: "bg-blue-50 border-blue-200" },
    { label: "Completed Tasks", value: "12", icon: "✅", color: "bg-green-50 border-green-200" },
    { label: "Pending Tasks", value: "5", icon: "⏳", color: "bg-yellow-50 border-yellow-200" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            Welcome 👋 {username}
          </h1>
          <p className="text-gray-500 mb-8">
            Track your learning progress and manage your courses
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className={`p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition ${stat.color}`}>
                <div className="text-3xl mb-2">{stat.icon}</div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/exams")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-200"
          >
            📝 Go to Exams
          </button>
        </div>
      </div>
    </div>
  );
}
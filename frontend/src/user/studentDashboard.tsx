export default function UserDashboard() {
  const username = localStorage.getItem("username") || "User";

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-2xl shadow-md">
        
        <h1 className="text-2xl font-bold text-blue-600">
          Welcome 👋 {username}
        </h1>

        <p className="mt-2 text-gray-600">
          This is your user dashboard. You can view your data here.
        </p>

        <div className="mt-6 grid gap-4">
          
          <div className="p-4 bg-blue-50 rounded-lg">
            📊 Your Courses: 3
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            ✅ Completed Tasks: 12
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            ⏳ Pending Tasks: 5
          </div>

        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../Api/api";

const UserMarksPage = () => {
const { id } = useParams();
const [user, setUser] = useState<any>(null);
const [loading, setLoading] = useState(true);

const fetchUser = async () => {
try {
const res = await api.get(`/admin/users/${id}`);
setUser(res.data);
} catch (err) {
console.error("Error fetching user", err);
} finally {
setLoading(false);
}
};

useEffect(() => {
fetchUser();
}, [id]);

if (loading)
return ( <div className="flex justify-center items-center h-screen text-lg font-semibold">
Loading... </div>
);

return ( <div className="p-6 bg-gray-100 min-h-screen"> <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6">

```
    {/* 👤 User Info */}
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-800">
        {user.name}
      </h2>
      <p className="text-gray-500">Student Results</p>
    </div>

    {/* 📊 Results */}
    <div className="grid gap-4">
      {user.quiz_attempts?.length > 0 ? (
        user.quiz_attempts.map((attempt: any) => (
          <div
            key={attempt.id}
            className="flex justify-between items-center p-4 border rounded-xl hover:shadow-md transition"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                {attempt.quiz.title}
              </h3>
            </div>

            <div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  attempt.score >= 5
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {attempt.score} / 10
              </span>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No exams taken yet.</p>
      )}
    </div>

  </div>
</div>


);
};

export default UserMarksPage;

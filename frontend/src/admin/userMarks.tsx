import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../Api/api";
import { User, ClipboardList } from "lucide-react";

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

  // ✅ الحل الصحيح
  const getQuizTotal = (attempt: any): number => {
    // إذا total_points أكبر من 0 استخدمه
    if (attempt.total_points && attempt.total_points > 0) {
      return attempt.total_points;
    }
    
    // وإلا استخدم عدد الأسئلة التي أجاب عليها
    const answersLength = attempt.answers?.length;
    if (answersLength && answersLength > 0) {
      return answersLength;
    }
    
    // قيمة افتراضية
    return 10;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold">
        ⏳ Loading results...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-white">
      <div className="max-w-4xl mx-auto bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-800">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <User className="text-purple-500" size={28} />
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-400 text-sm">Student Results</p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {user.quiz_attempts?.length > 0 ? (
            user.quiz_attempts.map((attempt: any) => {
              const total = getQuizTotal(attempt);
              const percentage = Math.round(
                (attempt.score / total) * 100
              );
              const isPass = percentage >= 50;

              return (
                <div
                  key={attempt.id}
                  className="p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition"
                >
                  {/* Title */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <ClipboardList size={18} />
                      <h3 className="font-medium">
                        {attempt.quiz.title}
                      </h3>
                    </div>

                    <span
                      className={`text-sm font-semibold ${
                        isPass ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${
                        isPass ? "bg-green-500" : "bg-red-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Score */}
                  <div className="text-xs text-gray-400 text-right">
                    {attempt.score} / {total}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-400 py-10">
              📭 No exams taken yet
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserMarksPage;
import React, { useState, useEffect } from "react";
import api from "../Api/api";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  HelpCircle,
  PlayCircle,
  Loader2,
  FileText,
} from "lucide-react";

interface Exam {
  id: number;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  passingScore: number;
  status: "active";
}

const ShowExams: React.FC = () => {
  const username = localStorage.getItem("username") || "User";
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);

      const res = await api.get("/student/quizzes");

      const quizzes = res.data?.data || res.data || [];

      // 👇 فلترة المتاح فقط
      const available = quizzes.filter(
        (q: any) => !q.is_completed && (q.available ?? true)
      );

      const formatted: Exam[] = available.map((q: any) => ({
        id: q.id,
        title: q.title || "Untitled Exam",
        description: q.description || "No description",
        duration: q.duration || 0,
        totalQuestions: q.questions_count || q.questions?.length || 0,
        passingScore: q.passing_score || 50,
        status: "active",
      }));

      setExams(formatted);
    } catch (err) {
      console.error(err);
      setError("فشل تحميل الامتحانات");
    } finally {
      setLoading(false);
    }
  };

  // Loading
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  // Error
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800">
          أهلاً، {username}
        </h1>
        <p className="text-gray-500 mt-2">
          اختر الامتحان وابدأ الحل
        </p>
      </div>

      {/* Available Exams فقط */}
      <div>
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          Available Exams
        </h2>

        {exams.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            مفيش امتحانات متاحة حالياً
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div
                key={exam.id}
                onClick={() => navigate(`/exam/${exam.id}`)}
                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition cursor-pointer border hover:-translate-y-1"
              >
                {/* Title */}
                <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition mb-3">
                  {exam.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500 mb-5 line-clamp-2">
                  {exam.description}
                </p>

                {/* Info */}
                <div className="flex justify-between text-xs text-gray-500 mb-5">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {exam.duration} min
                  </div>

                  <div className="flex items-center gap-1">
                    <HelpCircle size={14} />
                    {exam.totalQuestions}
                  </div>

                  <div className="flex items-center gap-1">
                    <FileText size={14} />
                    {exam.passingScore}%
                  </div>
                </div>

                {/* Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/exam/${exam.id}`);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  <PlayCircle size={16} />
                  Start Exam
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowExams;
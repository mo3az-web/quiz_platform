import React, { useEffect, useState } from "react";
import api from "../Api/api";
import {
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3,
  Loader2,
} from "lucide-react";

interface Result {
  id: number;
  title: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: string;
  status: "passed" | "failed";
}

const AllResults: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/student/results");
      setResults(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("لازم تسجل دخول الأول");
      } else {
        setError("حصل خطأ في تحميل النتائج");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Loading UI
  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  // Error UI
  if (error)
    return (
      <p className="text-center mt-10 text-red-500 font-semibold">{error}</p>
    );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="text-blue-600" />
        <h1 className="text-2xl font-bold">نتائج الاختبارات</h1>
      </div>

      {results.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          مفيش نتائج لحد دلوقتي 😅
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-4">الاختبار</th>
                <th className="p-4">التاريخ</th>
                <th className="p-4">الدرجة</th>
                <th className="p-4">النسبة</th>
                <th className="p-4">الحالة</th>
              </tr>
            </thead>

            <tbody>
              {results.map((r) => (
                <tr
                  key={r.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  {/* Title */}
                  <td className="p-4 font-medium">{r.title}</td>

                  {/* Date */}
                  <td className="p-4 flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    {new Date(r.date).toLocaleDateString()}
                  </td>

                  {/* Score */}
                  <td className="p-4">
                    {r.score} / {r.totalQuestions}
                  </td>

                  {/* Percentage */}
                  <td className="p-4 w-[200px]">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${r.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">
                      {r.percentage}%
                    </span>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span
                      className={`flex items-center gap-1 w-fit px-3 py-1 text-xs rounded-full text-white ${
                        r.status === "passed"
                          ? "bg-green-600"
                          : "bg-red-600"
                      }`}
                    >
                      {r.status === "passed" ? (
                        <>
                          <CheckCircle size={14} />
                          ناجح
                        </>
                      ) : (
                        <>
                          <XCircle size={14} />
                          راسب
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllResults;
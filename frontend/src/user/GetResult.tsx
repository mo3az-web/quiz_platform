import React, { useEffect, useState } from "react";
import api from "../Api/api";



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

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📊 كل النتائج</h1>

      {results.length === 0 ? (
        <p className="text-gray-500">مفيش نتائج لحد دلوقتي</p>
      ) : (
        <div className="space-y-4">
          {results.map((r) => (
            <div
              key={r.id}
              className="border rounded-lg p-4 shadow hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg">{r.title}</h2>

                <span
                  className={`px-3 py-1 text-sm rounded text-white ${
                    r.status === "passed"
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
                >
                  {r.status === "passed" ? "ناجح" : "ساقط"}
                </span>
              </div>

              <div className="mt-2 text-sm text-gray-600">
                {new Date(r.date).toLocaleDateString()}
              </div>

              <div className="mt-3 flex justify-between items-center">
                <div>
                  <p>
                    Score: {r.score} / {r.totalQuestions}
                  </p>
                  <p className="font-bold text-blue-600">
                    {r.percentage}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllResults;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../Api/api';
import { useParams } from 'react-router-dom';
import type { Choice } from '../types/types';
import type { Exam } from '../types/types';
import type { Question } from '../types/types';

type PageStatus = 'loading' | 'ready' | 'already_submitted' | 'error' | 'submitted';

export default function ExamPage() {
  const { examId } = useParams<{ examId: string }>();

  const [exam, setExam] = useState<Exam | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [status, setStatus] = useState<PageStatus>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total_points: number } | null>(null);

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const submittedRef = useRef(false);

  // ================= بدء/استكمال المحاولة + جلب الامتحان =================
  useEffect(() => {
    if (!examId) return;

    const initQuiz = async () => {
      try {
        setStatus('loading');
        setErrorMsg('');

        const startRes = await api.post(`/student/quizzes/${examId}/start`);
        const startData = startRes.data;

        if (startData.status === 'completed') {
          setAttemptId(startData.attempt_id);
          setResult({
            score: startData.score ?? 0,
            total_points: startData.total_points ?? 0,
          });
          setStatus('already_submitted');
          return;
        }

        setAttemptId(startData.attempt_id);

        const res = await api.get(`/student/quizzes/${examId}`);
        const data = res.data.quiz || res.data.data || res.data;

        const formatted: Exam = {
          id: data.id,
          title: data.title,
          description: data.description,
          duration: data.duration || 0,
          questions: Array.isArray(data.questions)
            ? data.questions.map((q: any) => ({
                id: q.id,
                text: q.question ?? q.text ?? 'بدون نص سؤال',
                points: q.points ?? 1,
                choices: Array.isArray(q.choices)
                  ? q.choices.map((c: any) => ({
                      id: c.id,
                      text: c.choice ?? c.text ?? 'بدون نص اختيار',
                    }))
                  : [],
              }))
            : [],
        };

        setExam(formatted);

        const totalSeconds = (startData.duration ?? formatted.duration ?? 0) * 60;

        if (startData.started_at) {
          const startedAtMs = new Date(startData.started_at).getTime();
          const elapsed = Math.floor((Date.now() - startedAtMs) / 1000);
          setTimeLeft(Math.max(totalSeconds - elapsed, 0));
        } else {
          setTimeLeft(totalSeconds);
        }

        setStatus('ready');
      } catch (err: any) {
        console.error('Init Error:', err);
        setErrorMsg(
          err?.response?.data?.message || 'حدث خطأ أثناء تحميل الامتحان، حاول مرة أخرى'
        );
        setStatus('error');
      }
    };

    initQuiz();
  }, [examId]);

  // ================= التسليم =================
  const handleSubmit = useCallback(async () => {
    if (!examId || submittedRef.current || !attemptId) return;

    if (Object.keys(answersRef.current).length === 0) {
      alert("لازم تجاوب على الأقل سؤال واحد");
      return;
    }

    submittedRef.current = true;
    setSubmitting(true);

    try {
      const formattedAnswers = Object.entries(answersRef.current).map(
        ([question_id, choice_id]) => ({
          question_id: Number(question_id),
          choice_id: Number(choice_id),
        })
      );

      const payload = {
        attempt_id: Number(attemptId),
        answers: formattedAnswers,
      };

      console.log("🚀 FINAL DATA:", payload);

      const res = await api.post(`/student/quizzes/${examId}/submit`, payload);

      setResult({
        score: res.data.score,
        total_points: res.data.total_points,
      });

      setStatus('submitted');
    } catch (error: any) {
      console.error("❌ ERROR FULL:", error?.response?.data || error);

      submittedRef.current = false;
      setErrorMsg(error?.response?.data?.message || 'فشل تسليم الامتحان');
      setSubmitting(false);
    }
  }, [examId, attemptId]);

  // ================= المؤقّت =================
  useEffect(() => {
    if (status !== 'ready') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, handleSubmit]);

  // ================= التفاعل مع الأسئلة =================
  const handleAnswerSelect = (choiceId: number) => {
    if (!exam) return;
    const questionId = exam.questions[currentQuestion]?.id;
    if (!questionId) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId,
    }));
  };

  const handleGoToQuestion = (index: number) => {
    setCurrentQuestion(index);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ================= حالات الصفحة =================
  if (status === 'loading') {
    return (
      <div dir="rtl" className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">جاري تحميل الامتحان...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div dir="rtl" className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="text-center bg-white shadow-lg rounded-2xl p-8 max-w-md w-full">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-600 mb-6 text-lg">{errorMsg}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (status === 'already_submitted') {
    return (
      <div dir="rtl" className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="text-center bg-white shadow-lg rounded-2xl p-8 max-w-sm w-full">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">لقد قمت بتسليم هذا الامتحان</h2>
          {result && (
            <p className="text-3xl font-bold text-blue-600 mt-4">
              {result.score} / {result.total_points}
            </p>
          )}
          <p className="text-gray-500 mt-3 text-sm">لا يمكن إعادة المحاولة مرة أخرى</p>
        </div>
      </div>
    );
  }

  if (status === 'submitted') {
    return (
      <div dir="rtl" className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="text-center bg-white shadow-lg rounded-2xl p-8 max-w-sm w-full">
          <div className="text-6xl mb-4 animate-bounce">✅</div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">تم تسليم الامتحان بنجاح</h2>
          {result && (
            <p className="text-3xl font-bold text-green-600 mt-4">
              {result.score} / {result.total_points}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!exam || exam.questions.length === 0) {
    return (
      <div dir="rtl" className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <p className="text-gray-500 text-lg">لا توجد أسئلة في هذا الامتحان</p>
      </div>
    );
  }

  const question = exam.questions[currentQuestion];
  const isLowTime = timeLeft <= 60;
  const answeredCount = Object.keys(answers).length;

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header with timer */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{exam.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {answeredCount} من {exam.questions.length} تمت الإجابة عليها
            </p>
          </div>
          <div
            className={`px-5 py-2 rounded-full font-semibold text-lg whitespace-nowrap transition-all ${
              isLowTime
                ? 'bg-red-100 text-red-700 animate-pulse border-2 border-red-300'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar - Question Navigator */}
          <div className="w-32 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-4 sticky top-24">
              <h3 className="font-bold text-gray-700 mb-4 text-sm">الأسئلة</h3>
              <div className="grid grid-cols-4 gap-2">
                {exam.questions.map((q, index) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = index === currentQuestion;

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleGoToQuestion(index)}
                      className={`
                        aspect-square rounded-lg font-semibold text-sm transition-all duration-200
                        flex items-center justify-center relative overflow-hidden
                        ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-lg scale-105'
                            : isAnswered
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-gray-300'
                        }
                      `}
                      title={`السؤال ${index + 1}${isAnswered ? ' - مجابة' : ''}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span>حالي</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                  <span>مجابة</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
                  <span>لم تجب</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Question Content */}
          <div className="flex-1 min-w-0">
            {errorMsg && (
              <div className="bg-red-50 text-red-700 border-l-4 border-red-500 rounded-lg p-4 mb-6">
                <p className="font-semibold">خطأ</p>
                <p className="text-sm mt-1">{errorMsg}</p>
              </div>
            )}

            {/* Question Card */}
            <div className="bg-white rounded-xl shadow-md p-8 mb-6">
              {/* Question Header */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-lg font-bold text-gray-800">السؤال {currentQuestion + 1}</p>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {question.points} نقطة
                  </span>
                </div>
                <p className="text-xl font-medium text-gray-900 leading-relaxed mt-3">
                  {question.text}
                </p>
              </div>

              {/* Choices */}
              <div className="space-y-3">
                {question.choices.map((choice, index) => {
                  const selected = answers[question.id] === choice.id;
                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleAnswerSelect(choice.id)}
                      className={`
                        w-full text-right p-4 rounded-lg transition-all duration-200 
                        border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                        flex items-center gap-3
                        ${
                          selected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                            : 'bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-400'
                        }
                      `}
                    >
                      <div
                        className={`
                          w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center
                          ${
                            selected
                              ? 'bg-white text-blue-600'
                              : 'bg-gray-300'
                          }
                        `}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-lg">{choice.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => handleGoToQuestion(currentQuestion - 1)}
                disabled={currentQuestion === 0}
                className={`
                  px-6 py-3 rounded-lg font-semibold transition-all duration-200
                  ${
                    currentQuestion === 0
                      ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-500'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                  }
                `}
              >
                ← السابق
              </button>

              {currentQuestion === exam.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`
                    px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200
                    ${
                      submitting
                        ? 'bg-green-400 opacity-70 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
                    }
                  `}
                >
                  {submitting ? '⏳ جاري التسليم...' : '✓ تسليم الامتحان'}
                </button>
              ) : (
                <button
                  onClick={() => handleGoToQuestion(currentQuestion + 1)}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  التالي →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
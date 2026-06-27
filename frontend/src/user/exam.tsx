import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../Api/api';
import { useParams } from 'react-router-dom';
import  type  { Choice } from '../types/types';
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

  // نخزّن آخر نسخة من answers في ref، عشان المؤقّت (setInterval) ميستخدمش
  // نسخة قديمة من answers لما يسلّم تلقائيًا بعد انتهاء الوقت (stale closure).
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // يمنع إرسال أكتر من طلب تسليم في نفس الوقت (دبل كليك أو تسليم تلقائي + يدوي معًا)
  const submittedRef = useRef(false);

  // ================= بدء/استكمال المحاولة + جلب الامتحان =================
  useEffect(() => {
    if (!examId) return;

    const initQuiz = async () => {
      try {
        setStatus('loading');
        setErrorMsg('');

        // 1. بدء المحاولة (أو استكمال محاولة قائمة)
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

        // 2. جلب بيانات الامتحان والأسئلة
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
                // الباك إند بيرجع اسم الحقل "question" مش "text"
                text: q.question ?? q.text ?? 'بدون نص سؤال',
                points: q.points ?? 1,
                choices: Array.isArray(q.choices)
                  ? q.choices.map((c: any) => ({
                      id: c.id,
                      // الباك إند بيرجع اسم الحقل "choice" مش "text"
                      text: c.choice ?? c.text ?? 'بدون نص اختيار',
                    }))
                  : [],
              }))
            : [],
        };

        setExam(formatted);

        // حساب الوقت المتبقي اعتمادًا على started_at الراجع من السيرفر،
        // عشان لو الطالب عمل refresh الوقت يكمل صحيح بدل ما يرجع كامل من جديد.
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

  // 🛑 منع الإرسال لو مفيش إجابات
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
        choice_id: Number(choice_id), // 🔥 fix مهم
      })
    );

    const payload = {
      attempt_id: Number(attemptId), // 🔥 fix مهم
      answers: formattedAnswers,
    };

    console.log("🚀 FINAL DATA:", payload); // 🔥 debug مهم

    const res = await api.post(
      `/student/quizzes/${examId}/submit`,
      payload
    );

    setResult({
      score: res.data.score,
      total_points: res.data.total_points,
    });

    setStatus('submitted');
  } catch (error: any) {
    console.error("❌ ERROR FULL:", error?.response?.data || error);

    submittedRef.current = false;
    setErrorMsg(
      error?.response?.data?.message || 'فشل تسليم الامتحان'
    );
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

  const handleNext = () => {
    if (!exam) return;
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ================= حالات الصفحة =================
  if (status === 'loading') {
    return (
      <div dir="rtl" className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600">جاري تحميل الامتحان...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div dir="rtl" className="flex items-center justify-center min-h-screen bg-gray-50 p-8">
        <div className="text-center max-w-md bg-white shadow rounded-xl p-8">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-600 mb-5">{errorMsg}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (status === 'already_submitted') {
    return (
      <div dir="rtl" className="flex items-center justify-center min-h-screen bg-gray-50 p-8">
        <div className="text-center bg-white shadow rounded-xl p-8 max-w-sm w-full">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-bold mb-2">لقد قمت بتسليم هذا الامتحان من قبل</h2>
          {result && (
            <p className="text-2xl font-bold text-blue-600 mt-3">
              {result.score} / {result.total_points}
            </p>
          )}
          <p className="text-gray-500 mt-2 text-sm">لا يمكن إعادة المحاولة مرة أخرى</p>
        </div>
      </div>
    );
  }

  if (status === 'submitted') {
    return (
      <div dir="rtl" className="flex items-center justify-center min-h-screen bg-gray-50 p-8">
        <div className="text-center bg-white shadow rounded-xl p-8 max-w-sm w-full">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold mb-2">تم تسليم الامتحان بنجاح</h2>
          {result && (
            <p className="text-2xl font-bold text-blue-600 mt-3">
              {result.score} / {result.total_points}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!exam || exam.questions.length === 0) {
    return (
      <div dir="rtl" className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500">لا توجد أسئلة في هذا الامتحان</p>
      </div>
    );
  }

  const question = exam.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / exam.questions.length) * 100;
  const isLowTime = timeLeft <= 60;
  
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* رأس الصفحة: العنوان + المؤقّت + شريط التقدّم */}
        <div className="bg-white rounded-xl shadow p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold">{exam.title}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                isLowTime ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-700'
              }`}
            >
              ⏱ {formatTime(timeLeft)}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            سؤال {currentQuestion + 1} من {exam.questions.length}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4 text-sm">
            {errorMsg}
          </div>
        )}

        {/* السؤال الحالي */}
        <div className="bg-white rounded-xl shadow p-6 mb-4">
          <p className="text-lg font-medium mb-5">{question.text}</p>

          <div className="space-y-3">
            {question.choices.map((choice) => {
              const selected = answers[question.id] === choice.id;
              return (
                <button
                  key={choice.id}
                  onClick={() => handleAnswerSelect(choice.id)}
                  className={`w-full text-right p-4 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    selected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  {choice.text}
                </button>
              );
            })}
          </div>
        </div>

        {/* التنقّل بين الأسئلة */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-5 py-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            السابق
          </button>

          {currentQuestion === exam.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'جاري التسليم...' : 'تسليم الامتحان'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              التالي
            </button>
          )}
        </div>
      </div>
    </div>
  );

}
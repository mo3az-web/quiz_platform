import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { isAxiosError } from "axios";
import api from "../Api/api";
import type { ChoiceForm, ExamForm, QuestionForm , Quiz } from "../types/types";


const emptyChoice = (): ChoiceForm => ({
  choice: "",
  is_correct: false,
});

const emptyQuestion = (): QuestionForm => ({
  question: "",
  points: 1,
  choices: [
    { choice: "", is_correct: true },
    emptyChoice(),
    emptyChoice(),
    emptyChoice(),
  ],
});

export default function ViewExams() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [exam, setExam] = useState<ExamForm>({
    title: "",
    description: "",
    duration: "",
    is_active: true,
  });
  const [questions, setQuestions] = useState<QuestionForm[]>([emptyQuestion()]);
  const [loading, setLoading] = useState(true);
  const [savingExam, setSavingExam] = useState(false);
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const emptyQuizzes = useMemo(
    () => quizzes.filter((quiz) => quiz.questions.length === 0),
    [quizzes]
  );

  const quizzesWithQuestions = useMemo(
    () => quizzes.filter((quiz) => quiz.questions.length > 0),
    [quizzes]
  );

  const getErrorMessage = (err: unknown) => {
    if (isAxiosError(err)) {
      const errors = err.response?.data?.errors;

      if (errors && typeof errors === "object") {
        return Object.values(errors).flat().join(", ");
      }

      return err.response?.data?.message || "حصل خطأ في العملية";
    }

    return "حصل خطأ في العملية";
  };

  const loadQuizzes = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/admin/quizzes");
      setQuizzes(res.data.quizzes ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const selectQuiz = (quiz: Quiz) => {
    setSelectedQuizId(quiz.id);
    setExam({
      title: quiz.title,
      description: quiz.description ?? "",
      duration: quiz.duration ? String(quiz.duration) : "",
      is_active: quiz.is_active,
    });
    setQuestions([emptyQuestion()]);
    setMessage("");
    setError("");
  };

  const handleExamChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setExam((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleActiveChange = (e: ChangeEvent<HTMLInputElement>) => {
    setExam((current) => ({
      ...current,
      is_active: e.target.checked,
    }));
  };

  const updateQuestion = (
    questionIndex: number,
    field: keyof Pick<QuestionForm, "question" | "points">,
    value: string
  ) => {
    setQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              [field]: field === "points" ? Number(value) || 1 : value,
            }
          : question
      )
    );
  };

  const updateChoice = (
    questionIndex: number,
    choiceIndex: number,
    value: string
  ) => {
    setQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              choices: question.choices.map((choice, itemIndex) =>
                itemIndex === choiceIndex ? { ...choice, choice: value } : choice
              ),
            }
          : question
      )
    );
  };

  const setCorrectChoice = (questionIndex: number, choiceIndex: number) => {
    setQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              choices: question.choices.map((choice, itemIndex) => ({
                ...choice,
                is_correct: itemIndex === choiceIndex,
              })),
            }
          : question
      )
    );
  };

  const addQuestion = () => {
    setQuestions((current) => [...current, emptyQuestion()]);
  };

  const removeQuestion = (questionIndex: number) => {
    setQuestions((current) =>
      current.length === 1
        ? current
        : current.filter((_, index) => index !== questionIndex)
    );
  };

  const addChoice = (questionIndex: number) => {
    setQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex
          ? { ...question, choices: [...question.choices, emptyChoice()] }
          : question
      )
    );
  };

  const removeChoice = (questionIndex: number, choiceIndex: number) => {
    setQuestions((current) =>
      current.map((question, index) => {
        if (index !== questionIndex || question.choices.length <= 2) {
          return question;
        }

        const choices = question.choices.filter(
          (_, itemIndex) => itemIndex !== choiceIndex
        );

        if (!choices.some((choice) => choice.is_correct)) {
          choices[0] = { ...choices[0], is_correct: true };
        }

        return { ...question, choices };
      })
    );
  };

  const validateQuestions = () => {
    const hasEmptyQuestion = questions.some(
      (question) => !question.question.trim()
    );
    const hasEmptyChoice = questions.some((question) =>
      question.choices.some((choice) => !choice.choice.trim())
    );
    const hasQuestionWithoutCorrectAnswer = questions.some(
      (question) => !question.choices.some((choice) => choice.is_correct)
    );

    if (hasEmptyQuestion) {
      return "اكتب نص كل سؤال قبل الحفظ.";
    }

    if (hasEmptyChoice) {
      return "اكتب كل الاختيارات قبل الحفظ.";
    }

    if (hasQuestionWithoutCorrectAnswer) {
      return "حدد إجابة صحيحة لكل سؤال.";
    }

    return "";
  };

  const updateExamOnly = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedQuizId) {
      setError("اختار امتحان الأول.");
      return;
    }

    setSavingExam(true);
    setError("");
    setMessage("");

    try {
      await api.put(`/admin/quizzes/${selectedQuizId}`, {
        title: exam.title,
        description: exam.description || null,
        duration: exam.duration ? Number(exam.duration) : null,
        is_active: exam.is_active,
      });

      await loadQuizzes();
      setMessage("تم تعديل بيانات الامتحان بنجاح.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingExam(false);
    }
  };

  const saveQuestions = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedQuizId) {
      setError("اختار امتحان الأول.");
      return;
    }

    const validationError = validateQuestions();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSavingQuestions(true);
    setError("");
    setMessage("");

    try {
      await api.put(`/admin/quizzes/${selectedQuizId}`, {
        title: exam.title,
        description: exam.description || null,
        duration: exam.duration ? Number(exam.duration) : null,
        is_active: exam.is_active,
        questions: questions.map((question) => ({
          question: question.question,
          type: "multiple_choice",
          points: question.points,
          choices: question.choices.map((choice) => ({
            choice: choice.choice,
            is_correct: choice.is_correct,
          })),
        })),
      });

      await loadQuizzes();
      setSelectedQuizId(null);
      setExam({ title: "", description: "", duration: "", is_active: true });
      setQuestions([emptyQuestion()]);
      setMessage("تم إضافة الأسئلة للامتحان بنجاح.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingQuestions(false);
    }
  };

  const deleteQuiz = async (quiz: Quiz) => {
    const confirmed = window.confirm(`هل تريد حذف امتحان "${quiz.title}"؟`);

    if (!confirmed) {
      return;
    }

    setDeletingId(quiz.id);
    setError("");
    setMessage("");

    try {
      await api.delete(`/admin/quizzes/${quiz.id}`);
      await loadQuizzes();
      setMessage("تم حذف الامتحان بنجاح.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-red-300">Admin Exams</p>
            <h1 className="mt-1 text-3xl font-bold">عرض وإدارة الامتحانات</h1>
          </div>

          <button
            type="button"
            onClick={loadQuizzes}
            className="rounded-lg bg-gray-700 px-4 py-2 text-sm transition hover:bg-gray-600"
          >
            تحديث القائمة
          </button>
        </div>

        {message && (
          <div className="mb-4 rounded-lg border border-green-500 bg-green-500/10 p-4 text-green-200">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-500 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg bg-gray-800 p-6 text-gray-200">
            جاري تحميل الامتحانات...
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <div className="space-y-6">
              <section className="rounded-lg bg-gray-800 p-5 shadow-lg">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">امتحانات بدون أسئلة</h2>
                  <span className="rounded bg-blue-500/20 px-3 py-1 text-sm text-blue-200">
                    {emptyQuizzes.length}
                  </span>
                </div>

                {emptyQuizzes.length === 0 ? (
                  <p className="text-sm text-gray-300">
                    لا يوجد امتحانات بدون أسئلة حاليًا.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {emptyQuizzes.map((quiz) => (
                      <button
                        key={quiz.id}
                        type="button"
                        onClick={() => selectQuiz(quiz)}
                        className={`w-full rounded-lg border p-4 text-left transition ${
                          selectedQuizId === quiz.id
                            ? "border-red-400 bg-red-500/10"
                            : "border-gray-700 bg-gray-900 hover:border-gray-500"
                        }`}
                      >
                        <div className="font-semibold text-white">{quiz.title}</div>
                        <div className="mt-1 text-sm text-gray-300">
                          المدة: {quiz.duration ?? "غير محددة"} دقيقة
                        </div>
                        <div className="mt-2 text-xs text-green-200">
                          متاح للتعديل وإضافة الأسئلة
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-lg bg-gray-800 p-5 shadow-lg">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">امتحانات فيها أسئلة</h2>
                  <span className="rounded bg-green-500/20 px-3 py-1 text-sm text-green-200">
                    {quizzesWithQuestions.length}
                  </span>
                </div>

                {quizzesWithQuestions.length === 0 ? (
                  <p className="text-sm text-gray-300">
                    لا يوجد امتحانات بأسئلة حاليًا.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {quizzesWithQuestions.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="rounded-lg border border-gray-700 bg-gray-900 p-4"
                      >
                        <div className="font-semibold">{quiz.title}</div>
                        <div className="mt-1 text-sm text-gray-300">
                          عدد الأسئلة: {quiz.questions.length}
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteQuiz(quiz)}
                          disabled={deletingId === quiz.id}
                          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-600"
                        >
                          {deletingId === quiz.id ? "جاري الحذف..." : "حذف الامتحان"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-6">
              <form
                onSubmit={updateExamOnly}
                className={`rounded-lg bg-gray-800 p-6 shadow-lg ${
                  !selectedQuizId ? "opacity-60" : ""
                }`}
              >
                <h2 className="text-xl font-semibold">تعديل بيانات الامتحان</h2>
                <p className="mt-1 text-sm text-gray-300">
                  اختار امتحان بدون أسئلة من القائمة عشان تعدل بياناته.
                </p>

                <fieldset disabled={!selectedQuizId} className="mt-5 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        اسم الامتحان
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={exam.title}
                        onChange={handleExamChange}
                        required
                        className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2 outline-none focus:border-red-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        المدة بالدقائق
                      </label>
                      <input
                        type="number"
                        name="duration"
                        min="1"
                        value={exam.duration}
                        onChange={handleExamChange}
                        className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2 outline-none focus:border-red-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">الوصف</label>
                    <textarea
                      name="description"
                      value={exam.description}
                      onChange={handleExamChange}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-gray-600 bg-gray-900 px-4 py-2 outline-none focus:border-red-400"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-200">
                    <input
                      type="checkbox"
                      checked={exam.is_active}
                      onChange={handleActiveChange}
                      className="h-4 w-4 accent-red-500"
                    />
                    الامتحان مفعل للطلاب
                  </label>
                </fieldset>

                <button
                  type="submit"
                  disabled={!selectedQuizId || savingExam}
                  className="mt-5 rounded-lg bg-red-500 px-5 py-2 font-medium transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-600"
                >
                  {savingExam ? "جاري التعديل..." : "حفظ التعديل"}
                </button>
              </form>

              <form
                onSubmit={saveQuestions}
                className={`rounded-lg bg-gray-800 p-6 shadow-lg ${
                  !selectedQuizId ? "opacity-60" : ""
                }`}
              >
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">إضافة أسئلة للامتحان</h2>
                    <p className="mt-1 text-sm text-gray-300">
                      حدد إجابة صحيحة واحدة لكل سؤال.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addQuestion}
                    disabled={!selectedQuizId}
                    className="rounded-lg bg-gray-700 px-4 py-2 text-sm transition hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    إضافة سؤال
                  </button>
                </div>

                <fieldset disabled={!selectedQuizId} className="space-y-5">
                  {questions.map((question, questionIndex) => (
                    <div
                      key={questionIndex}
                      className="rounded-lg border border-gray-700 bg-gray-900 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="font-semibold">سؤال {questionIndex + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeQuestion(questionIndex)}
                          className="rounded bg-red-500/20 px-3 py-1 text-sm text-red-200 transition hover:bg-red-500/30"
                        >
                          حذف السؤال
                        </button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-[1fr_130px]">
                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            نص السؤال
                          </label>
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) =>
                              updateQuestion(questionIndex, "question", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 outline-none focus:border-red-400"
                            placeholder="اكتب السؤال"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            الدرجة
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={question.points}
                            onChange={(e) =>
                              updateQuestion(questionIndex, "points", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 outline-none focus:border-red-400"
                          />
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {question.choices.map((choice, choiceIndex) => (
                          <div
                            key={choiceIndex}
                            className="grid gap-3 md:grid-cols-[auto_1fr_auto]"
                          >
                            <label className="flex items-center gap-2 text-sm text-gray-200">
                              <input
                                type="radio"
                                name={`correct-${questionIndex}`}
                                checked={choice.is_correct}
                                onChange={() =>
                                  setCorrectChoice(questionIndex, choiceIndex)
                                }
                                className="h-4 w-4 accent-green-500"
                              />
                              صح
                            </label>

                            <input
                              type="text"
                              value={choice.choice}
                              onChange={(e) =>
                                updateChoice(questionIndex, choiceIndex, e.target.value)
                              }
                              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 outline-none focus:border-red-400"
                              placeholder={`اختيار ${choiceIndex + 1}`}
                            />

                            <button
                              type="button"
                              onClick={() => removeChoice(questionIndex, choiceIndex)}
                              className="rounded bg-gray-700 px-3 py-2 text-sm transition hover:bg-gray-600"
                            >
                              حذف
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addChoice(questionIndex)}
                        className="mt-4 rounded-lg border border-gray-600 px-4 py-2 text-sm transition hover:border-red-400 hover:text-red-200"
                      >
                        إضافة اختيار
                      </button>
                    </div>
                  ))}
                </fieldset>

                <button
                  type="submit"
                  disabled={!selectedQuizId || savingQuestions}
                  className="mt-6 rounded-lg bg-green-600 px-5 py-2 font-medium transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-600"
                >
                  {savingQuestions ? "جاري حفظ الأسئلة..." : "حفظ الأسئلة"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

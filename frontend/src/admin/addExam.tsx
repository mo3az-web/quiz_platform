import { useState, type ChangeEvent, type FormEvent } from "react";
import { isAxiosError } from "axios";
import api from "../Api/api";
import type { ChoiceForm, ExamForm, QuestionForm } from "../types/types";


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

export default function AddExam() {
  const [exam, setExam] = useState<ExamForm>({
    title: "",
    description: "",
    duration: "",
    is_active: true,
  });
  const [quizId, setQuizId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuestionForm[]>([emptyQuestion()]);
  const [loadingExam, setLoadingExam] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getErrorMessage = (err: unknown) => {
    if (isAxiosError(err)) {
      const errors = err.response?.data?.errors;

      if (errors && typeof errors === "object") {
        return Object.values(errors).flat().join(", ");
      }

      return err.response?.data?.message || "حصل خطأ أثناء الحفظ";
    }

    return "حصل خطأ أثناء الحفظ";
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

  const createExam = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoadingExam(true);

    try {
      const payload = {
        title: exam.title,
        description: exam.description || null,
        duration: exam.duration ? Number(exam.duration) : null,
        is_active: exam.is_active,
      };

      const res = await api.post("/admin/quizzes", payload);
      setQuizId(res.data.quiz.id);
      setMessage("تم إنشاء الامتحان. تقدر تضيف الأسئلة دلوقتي.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingExam(false);
    }
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
              choices: question.choices.map((choice, choiceItemIndex) =>
                choiceItemIndex === choiceIndex
                  ? { ...choice, choice: value }
                  : choice
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
              choices: question.choices.map((choice, choiceItemIndex) => ({
                ...choice,
                is_correct: choiceItemIndex === choiceIndex,
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
          ? {
              ...question,
              choices: [...question.choices, emptyChoice()],
            }
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

        return {
          ...question,
          choices,
        };
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

  const saveQuestions = async (e: FormEvent) => {
    e.preventDefault();

    if (!quizId) {
      setError("لازم تنشئ الامتحان الأول.");
      return;
    }

    const validationError = validateQuestions();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setMessage("");
    setLoadingQuestions(true);

    try {
      const payload = {
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
      };

      await api.put(`/admin/quizzes/${quizId}`, payload);
      setMessage("تم حفظ الأسئلة والإجابات بنجاح.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingQuestions(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-sm text-red-300">Admin Exams</p>
          <h1 className="mt-1 text-3xl font-bold">إضافة امتحان جديد</h1>
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

        <form
          onSubmit={createExam}
          className="mb-6 rounded-lg bg-gray-800 p-6 shadow-lg"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">1. بيانات الامتحان</h2>
              <p className="mt-1 text-sm text-gray-300">
                ابدأ بإنشاء الامتحان، وبعدها هتظهر مرحلة إضافة الأسئلة.
              </p>
            </div>

            {quizId && (
              <span className="rounded bg-green-600 px-3 py-1 text-sm">
                تم الإنشاء
              </span>
            )}
          </div>

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
                disabled={Boolean(quizId)}
                className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2 outline-none focus:border-red-400 disabled:cursor-not-allowed disabled:opacity-70"
                placeholder="مثال: امتحان JavaScript"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                مدة الامتحان بالدقائق
              </label>
              <input
                type="number"
                name="duration"
                min="1"
                value={exam.duration}
                onChange={handleExamChange}
                disabled={Boolean(quizId)}
                className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2 outline-none focus:border-red-400 disabled:cursor-not-allowed disabled:opacity-70"
                placeholder="30"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium">الوصف</label>
            <textarea
              name="description"
              value={exam.description}
              onChange={handleExamChange}
              disabled={Boolean(quizId)}
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-600 bg-gray-900 px-4 py-2 outline-none focus:border-red-400 disabled:cursor-not-allowed disabled:opacity-70"
              placeholder="اكتب وصف مختصر للامتحان"
            />
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-gray-200">
            <input
              type="checkbox"
              checked={exam.is_active}
              onChange={handleActiveChange}
              disabled={Boolean(quizId)}
              className="h-4 w-4 accent-red-500"
            />
            الامتحان مفعل للطلاب
          </label>

          <button
            type="submit"
            disabled={loadingExam || Boolean(quizId)}
            className="mt-5 rounded-lg bg-red-500 px-5 py-2 font-medium transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-600"
          >
            {loadingExam ? "جاري الإنشاء..." : "إنشاء الامتحان"}
          </button>
        </form>

        <form
          onSubmit={saveQuestions}
          className={`rounded-lg bg-gray-800 p-6 shadow-lg ${
            !quizId ? "opacity-60" : ""
          }`}
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">2. الأسئلة والإجابات</h2>
              <p className="mt-1 text-sm text-gray-300">
                حدد الاختيار الصحيح لكل سؤال عشان يتبعت بقيمة true.
              </p>
            </div>

            <button
              type="button"
              onClick={addQuestion}
              disabled={!quizId}
              className="rounded-lg bg-gray-700 px-4 py-2 text-sm transition hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              إضافة سؤال
            </button>
          </div>

          <fieldset disabled={!quizId} className="space-y-5">
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

                <div className="grid gap-4 md:grid-cols-[1fr_140px]">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      نص السؤال
                    </label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) =>
                        updateQuestion(
                          questionIndex,
                          "question",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 outline-none focus:border-red-400"
                      placeholder="اكتب السؤال هنا"
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
                          updateChoice(
                            questionIndex,
                            choiceIndex,
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 outline-none focus:border-red-400"
                        placeholder={`اختيار ${choiceIndex + 1}`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeChoice(questionIndex, choiceIndex)
                        }
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
            disabled={!quizId || loadingQuestions}
            className="mt-6 rounded-lg bg-green-600 px-5 py-2 font-medium transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-600"
          >
            {loadingQuestions ? "جاري حفظ الأسئلة..." : "حفظ الأسئلة"}
          </button>
        </form>
      </div>
    </div>
  );
}

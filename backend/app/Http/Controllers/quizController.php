<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class quizController extends Controller
{
    public function index()
    {
        if (! auth()->check()) {
            return response()->json([
                "message" => "Unauthenticated",
            ], 401);
        }

        $quizzes = Quiz::with("questions.choices")
            ->where("user_id", auth()->id())
            ->latest()
            ->get();

        return response()->json([
            "quizzes" => $quizzes,
        ]);
    }

    public function store(Request $request)
    {
        if (! auth()->check()) {
            return response()->json([
                "message" => "Unauthenticated",
            ], 401);
        }

        $validator = Validator::make($request->all(), $this->rules());

        if ($validator->fails()) {
            return response()->json([
                "message" => "Validation error",
                "errors" => $validator->errors(),
            ], 422);
        }

        $quiz = DB::transaction(function () use ($validator) {
            $data = $validator->validated();

            $quiz = Quiz::create([
                "user_id" => auth()->id(),
                "title" => $data["title"],
                "description" => $data["description"] ?? null,
                "duration" => $data["duration"] ?? null,
                "is_active" => $data["is_active"] ?? true,
            ]);

            $this->saveQuestions($quiz, $data["questions"] ?? []);

            return $quiz->load("questions.choices");
        });

        return response()->json([
            "message" => "Quiz created successfully",
            "quiz" => $quiz,
        ], 201);
    }

    public function show(string $id)
    {
        $quiz = $this->findUserQuiz($id);

        if (! $quiz) {
            return response()->json([
                "message" => "Quiz not found",
            ], 404);
        }

        return response()->json([
            "quiz" => $quiz,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $quiz = $this->findUserQuiz($id);

        if (! $quiz) {
            return response()->json([
                "message" => "Quiz not found",
            ], 404);
        }

        $validator = Validator::make($request->all(), $this->rules(false));

        if ($validator->fails()) {
            return response()->json([
                "message" => "Validation error",
                "errors" => $validator->errors(),
            ], 422);
        }

        $quiz = DB::transaction(function () use ($quiz, $validator) {
            $data = $validator->validated();

            $quiz->update([
                "title" => $data["title"] ?? $quiz->title,
                "description" => array_key_exists("description", $data) ? $data["description"] : $quiz->description,
                "duration" => array_key_exists("duration", $data) ? $data["duration"] : $quiz->duration,
                "is_active" => array_key_exists("is_active", $data) ? $data["is_active"] : $quiz->is_active,
            ]);

            if (array_key_exists("questions", $data)) {
                foreach ($quiz->questions as $question) {
                    $question->choices()->delete();
                }

                $quiz->questions()->delete();
                $this->saveQuestions($quiz, $data["questions"]);
            }

            return $quiz->load("questions.choices");
        });

        return response()->json([
            "message" => "Quiz updated successfully",
            "quiz" => $quiz,
        ]);
    }

    public function destroy(string $id)
    {
        $quiz = $this->findUserQuiz($id);

        if (! $quiz) {
            return response()->json([
                "message" => "Quiz not found",
            ], 404);
        }

        DB::transaction(function () use ($quiz) {
            foreach ($quiz->questions as $question) {
                $question->choices()->delete();
            }

            $quiz->questions()->delete();
            $quiz->delete();
        });

        return response()->json([
            "message" => "Quiz deleted successfully",
        ]);
    }

    private function findUserQuiz(string $id): ?Quiz
    {
        if (! auth()->check()) {
            return null;
        }

        return Quiz::with("questions.choices")
            ->where("user_id", auth()->id())
            ->find($id);
    }

private function saveQuestions(Quiz $quiz, array $questions): void
{
    foreach ($questions as $questionData) {
        $type = $questionData["type"] ?? "mcq";

        $question = $quiz->questions()->create([
            "question" => $questionData["question"],
            "type" => $type,
            "points" => $questionData["points"] ?? 1,
        ]);

        // 🔥 choices بس لو MCQ
        if ($type === "mcq") {
            foreach ($questionData["choices"] ?? [] as $choiceData) {
                $question->choices()->create([
                    "choice" => $choiceData["choice"],
                    "is_correct" => $choiceData["is_correct"] ?? false,
                ]);
            }
        }
    }
}

  private function rules(bool $creating = true): array
{
    $required = $creating ? ["required"] : ["sometimes", "required"];

    return [
        "title" => [...$required, "string", "max:255"],
        "description" => ["nullable", "string"],
        "duration" => ["nullable", "integer", "min:1"],
        "is_active" => ["sometimes", "boolean"],

        "questions" => ["sometimes", "array"],

        "questions.*.question" => ["required_with:questions", "string"],

        // 🔥 مهم
        "questions.*.type" => ["required", "in:mcq,essay"],

        "questions.*.points" => ["nullable", "integer", "min:1"],

        // 🔥 choices required فقط في mcq
        "questions.*.choices" => ["required_if:questions.*.type,mcq", "array"],

        "questions.*.choices.*.choice" => [
            "required_if:questions.*.type,mcq",
            "string"
        ],

        "questions.*.choices.*.is_correct" => [
            "required_if:questions.*.type,mcq",
            "boolean"
        ],
    ];
}

    // =====================================================================
    // Student-facing endpoints
    // =====================================================================

    public function studentIndex()
    {
        $quizzes = Quiz::where("is_active", true)
            ->select("id", "title", "description", "duration")
            ->latest()
            ->get();

        return response()->json([
            "data" => $quizzes,
        ]);
    }

    public function studentShow(string $id)
    {
        $quiz = Quiz::with("questions.choices")
            ->where("is_active", true)
            ->find($id);

        if (! $quiz) {
            return response()->json([
                "message" => "Quiz not found",
            ], 404);
        }

        // FIX: لا يجب إرسال "is_correct" للطالب أبدًا قبل التسليم،
        // وإلا أصبحت الإجابة الصحيحة موجودة داخل استجابة الـ API نفسها.
        $quiz->questions->each(function ($question) {
            $question->choices->each(function ($choice) {
                $choice->makeHidden("is_correct");
            });
        });

        return response()->json([
            "quiz" => $quiz,
        ]);
    }

    public function startQuiz(string $id)
    {
        if (! auth()->check()) {
            return response()->json([
                "message" => "Unauthenticated",
            ], 401);
        }

        $quiz = Quiz::find($id);

        if (! $quiz || ! $quiz->is_active) {
            return response()->json([
                "message" => "Quiz not available",
            ], 404);
        }

        $existingAttempt = DB::table('quiz_attempts')
            ->where("user_id", auth()->id())
            ->where("quiz_id", $quiz->id)
            ->first();

        if ($existingAttempt) {
            // FIX: لو المحاولة منتهية، لا تسمح بالبدء من جديد كأنها محاولة جارية.
            if ($existingAttempt->status === "completed") {
                return response()->json([
                    "message" => "You already submitted this quiz",
                    "attempt_id" => $existingAttempt->id,
                    "status" => "completed",
                    "score" => $existingAttempt->score,
                    "total_points" => $existingAttempt->total_points,
                ], 409);
            }

            // FIX: نرجع started_at و duration برضه هنا، عشان لو الطالب عمل
            // refresh للصفحة يقدر الفرونت يحسب الوقت المتبقي الصحيح
            // بدل ما يرجّع المؤقّت للمدة الكاملة من جديد.
            return response()->json([
                "message" => "You already started this quiz",
                "attempt_id" => $existingAttempt->id,
                "started_at" => $existingAttempt->started_at,
                "duration" => $quiz->duration,
                "status" => $existingAttempt->status,
            ]);
        }

        $startedAt = now();

        $attemptId = DB::table('quiz_attempts')->insertGetId([
            "user_id" => auth()->id(),
            "quiz_id" => $quiz->id,
            "answers" => json_encode([]),
            "score" => 0,
            "total_points" => 0,
            "status" => "in_progress",
            "started_at" => $startedAt,
            "created_at" => $startedAt,
            "updated_at" => $startedAt,
        ]);

        return response()->json([
            "message" => "Quiz started",
            "attempt_id" => $attemptId,
            "started_at" => $startedAt,
            "duration" => $quiz->duration,
            "status" => "in_progress",
        ]);
    }

   public function submitQuiz(Request $request, string $id)
{
    if (! auth()->check()) {
        return response()->json([
            "message" => "Unauthenticated",
        ], 401);
    }

    $validator = Validator::make($request->all(), [
        "attempt_id" => ["required", "integer"],
        "answers" => ["required", "array"],
    ]);

    if ($validator->fails()) {
        return response()->json([
            "message" => "Validation error",
            "errors" => $validator->errors(),
        ], 422);
    }

    $data = $validator->validated();

    $attempt = DB::table('quiz_attempts')
        ->where("id", $data["attempt_id"])
        ->where("user_id", auth()->id())
        ->where("quiz_id", $id)
        ->first();

    if (! $attempt) {
        return response()->json([
            "message" => "Attempt not found",
        ], 404);
    }

    if ($attempt->status === "completed") {
        return response()->json([
            "message" => "Quiz already submitted",
            "score" => $attempt->score,
            "total_points" => $attempt->total_points,
        ], 409);
    }

    $quiz = Quiz::with("questions.choices")->find($id);

    if (! $quiz) {
        return response()->json([
            "message" => "Quiz not found",
        ], 404);
    }

    $score = 0;
    $totalPoints = 0;

    foreach ($quiz->questions as $question) {
        $totalPoints += $question->points;

        $userAnswer = $data["answers"][$question->id] ?? null;

        // 🔥 MCQ
        if ($question->type === "mcq") {
            $correctChoice = $question->choices->firstWhere("is_correct", true);

            if ($correctChoice && $userAnswer == $correctChoice->id) {
                $score += $question->points;
            }
        }

        // 🔥 Essay (حالياً بدون تصحيح)
        else {
            // ممكن تضيف AI هنا بعدين
            // حالياً بنحسبها 0
        }
    }

    DB::table('quiz_attempts')
        ->where("id", $attempt->id)
        ->update([
            "answers" => json_encode($data["answers"]),
            "score" => $score,
            "total_points" => $totalPoints,
            "status" => "completed",
            "updated_at" => now(),
        ]);

    return response()->json([
        "message" => "Quiz submitted successfully",
        "score" => $score,
        "total_points" => $totalPoints,
    ]);
}
}
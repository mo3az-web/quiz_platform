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
            $question = $quiz->questions()->create([
                "question" => $questionData["question"],
                "type" => $questionData["type"] ?? "multiple_choice",
                "points" => $questionData["points"] ?? 1,
            ]);

            foreach ($questionData["choices"] ?? [] as $choiceData) {
                $question->choices()->create([
                    "choice" => $choiceData["choice"],
                    "is_correct" => $choiceData["is_correct"] ?? false,
                ]);
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
            "questions.*.type" => ["nullable", "string", "max:50"],
            "questions.*.points" => ["nullable", "integer", "min:1"],
            "questions.*.choices" => ["sometimes", "array"],
            "questions.*.choices.*.choice" => ["required_with:questions.*.choices", "string"],
            "questions.*.choices.*.is_correct" => ["sometimes", "boolean"],
        ];
    }
}

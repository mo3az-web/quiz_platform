<?php


use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\quizController;

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Admin Routes (إدارة الكويز)
    |--------------------------------------------------------------------------
    */
 Route::prefix('admin')->middleware('auth:sanctum')->group(function () {

    Route::get('/quizzes', [quizController::class, 'index']);
    Route::post('/quizzes', [quizController::class, 'store']);
    Route::get('/quizzes/{id}', [quizController::class, 'show']);
    Route::put('/quizzes/{id}', [quizController::class, 'update']);
    Route::delete('/quizzes/{id}', [quizController::class, 'destroy']);

});


    /*
    |--------------------------------------------------------------------------
    | Student Routes (حل الكويز)
    |--------------------------------------------------------------------------
    */
    Route::prefix('student')->group(function () {

        // عرض كل الكويزات
        Route::get('/quizzes', [quizController::class, 'studentIndex']);

        // عرض كويز واحد بالأسئلة
        Route::get('/quizzes/{id}', [quizController::class, 'studentShow']);

        // بدء المحاولة
        Route::post('/quizzes/{id}/start', [quizController::class, 'startQuiz']);

        // تسليم الإجابات
        Route::post('/quizzes/{id}/submit', [quizController::class, 'submitQuiz']);

    });


    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */
    Route::post('/logout', [AuthController::class, 'logout']);

});
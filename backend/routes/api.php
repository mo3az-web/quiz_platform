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

    Route::get('/quizzes', [quizController::class, 'studentIndex']);

    Route::get('/quizzes/{id}', [quizController::class, 'studentShow']);

    Route::post('/quizzes/{id}/start', [quizController::class, 'startQuiz']);

    Route::post('/quizzes/{id}/submit', [quizController::class, 'submitQuiz']);

    Route::get('/results', [quizController::class, 'allResults']);

});

    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */
    Route::post('/logout', [AuthController::class, 'logout']);

});
<?php


use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\quizController;
use App\Http\Controllers\adminController;
use App\Notifications\NewExamNotification;

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/user', [AuthController::class, 'CurrentUserInfo']);



/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Admin Routes (manage quizzes)
    |--------------------------------------------------------------------------
    */
 Route::prefix('admin')->middleware('auth:sanctum')->group(function () {

    Route::get('/quizzes', [quizController::class, 'index']);
    Route::post('/quizzes', [quizController::class, 'store']);
    Route::get('/quizzes/{id}', [quizController::class, 'show']);
    Route::put('/quizzes/{id}', [quizController::class, 'update']);
    Route::delete('/quizzes/{id}', [quizController::class, 'destroy']);
      /*
    |--------------------------------------------------------------------------
    | Admin Routes (manage users)
    |--------------------------------------------------------------------------
    */
    
    Route::get('/users', [adminController::class, 'getUsers']);
    Route::get('/users/{id}', [adminController::class, 'getUserMarks']);


});


    /*
    |--------------------------------------------------------------------------
    | Student Routes (solve quizzes)
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
    | Notifications Routes
    |--------------------------------------------------------------------------
    */
    Route::post('/notifications/{id}/read', function ($id) {
    $notification = auth()->user()
        ->notifications()
        ->where('id', $id)
        ->first();

    if ($notification) {
        $notification->markAsRead();
    }

    return response()->json(['message' => 'done']);
});
    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */
    Route::post('/logout', [AuthController::class, 'logout']);

});
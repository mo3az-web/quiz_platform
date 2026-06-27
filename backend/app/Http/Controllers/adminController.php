<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class adminController extends Controller
{
    public function getUsers(Request $request)
    {
        $users = User::paginate(10); // أفضل من all
        return response()->json($users);
    }

 public function getUserMarks($id)
{
    $user = User::with('quizAttempts.quiz')->find($id);

    if (!$user) {
        return response()->json([
            'message' => 'User not found'
        ], 404);
    }

    return response()->json($user);
}
}
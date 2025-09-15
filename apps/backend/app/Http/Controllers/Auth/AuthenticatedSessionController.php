<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required','email'],
            'password' => ['required'],
        ]);

        if (! Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        /** @var \App\Models\User $user */
        $user  = $request->user();
        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user->only(['id','name','email']),
        ]);
    }

    public function destroy(Request $request)
    {
        if ($request->user()?->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }
        return response()->noContent();
    }
}

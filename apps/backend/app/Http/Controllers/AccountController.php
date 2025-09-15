<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AccountController extends Controller
{
    public function destroy(Request $request){
        $data = $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user = $request->user();
        if (!Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Senha inválida'], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Conta deletada com sucesso']);
    }
}

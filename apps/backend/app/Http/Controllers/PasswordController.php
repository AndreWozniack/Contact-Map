<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PasswordController extends Controller
{
    public function update(Request $request)
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'confirmed', 'min:8'],
        ]);

        if (!Hash::check($data['current_password'], $request->user()->password)) {
            return response()->json(['message' => 'Senha atual incorreta.'], 422);
        }
        $request->user()->update(['password' => Hash::make($data['password'])])->save();
        return response()->json(['message' => 'Senha atualizada com sucesso.']);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Controlador responsável por operações de alteração de senha
 * 
 * Este controlador gerencia a atualização de senhas de usuários autenticados,
 * garantindo validação da senha atual antes de permitir a alteração.
 */
class PasswordController extends Controller
{
    /**
     * Atualiza a senha do usuário autenticado
     * 
     * Valida a senha atual antes de proceder com a alteração,
     * garantindo que apenas o próprio usuário possa alterar sua senha.
     * 
     * @param Request $request Requisição HTTP contendo senha atual e nova senha
     * @return \Illuminate\Http\JsonResponse Confirmação da atualização ou erro de validação
     */
    public function update(Request $request)
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'confirmed', 'min:8'],
        ]);

        if (!Hash::check($data['current_password'], $request->user()->password)) {
            return response()->json(['message' => 'Senha atual incorreta.'], 422);
        }
        $request->user()->update(['password' => Hash::make($data['password'])]);
        return response()->json(['message' => 'Senha atualizada com sucesso.']);
    }
}

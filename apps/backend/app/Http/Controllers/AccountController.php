<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Controlador responsável por operações de gerenciamento de conta
 * 
 * Este controlador gerencia operações críticas da conta do usuário,
 * como exclusão permanente da conta.
 */
class AccountController extends Controller
{
    /**
     * Remove permanentemente a conta do usuário autenticado
     * 
     * Valida a senha antes de proceder com a exclusão da conta,
     * remove todos os tokens de acesso e exclui o usuário do sistema.
     * 
     * @param Request $request Requisição HTTP contendo a senha de confirmação
     * @return \Illuminate\Http\JsonResponse Confirmação da exclusão ou erro de validação
     */
    public function destroy(Request $request)
    {
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

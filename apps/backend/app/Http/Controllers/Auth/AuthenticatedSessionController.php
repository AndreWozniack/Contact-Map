<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;

/**
 * Controlador responsável por gerenciar sessões de usuário autenticado
 * 
 * Este controlador gerencia operações de login e logout utilizando
 * tokens de API do Laravel Sanctum para autenticação stateless.
 */
class AuthenticatedSessionController extends Controller
{
    /**
     * Autentica um usuário e cria uma sessão
     * 
     * Valida as credenciais do usuário e gera um token de acesso
     * para autenticação nas próximas requisições da API.
     * 
     * @param LoginRequest $request Requisição de login com credenciais validadas
     * @return \Illuminate\Http\JsonResponse Token e dados do usuário autenticado
     */
    public function store(LoginRequest $request)
    {
        $request->authenticate();

        /** @var \App\Models\User $user */
        $user  = $request->user();
        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user->only(['id','name','email']),
        ]);
    }

    /**
     * Encerra a sessão do usuário autenticado
     * 
     * Remove o token de acesso atual, efetivamente fazendo logout
     * do usuário da aplicação.
     * 
     * @param Request $request Requisição HTTP do usuário autenticado
     * @return \Illuminate\Http\Response Resposta vazia confirmando logout
     */
    public function destroy(Request $request)
    {
        if ($request->user()?->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }
        return response()->noContent();
    }
}

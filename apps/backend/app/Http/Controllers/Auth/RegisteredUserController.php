<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

/**
 * Controlador responsável pelo registro de novos usuários
 * 
 * Este controlador gerencia a criação de contas de usuário,
 * incluindo validação de dados, criação do usuário e geração
 * automática de token de acesso.
 */
class RegisteredUserController extends Controller
{
    /**
     * Registra um novo usuário no sistema
     * 
     * Valida os dados fornecidos, cria a conta do usuário,
     * dispara eventos de registro e gera um token de acesso
     * para autenticação imediata.
     * 
     * @param Request $request Requisição contendo dados de registro (name, email, password)
     * @return \Illuminate\Http\JsonResponse Token e dados do usuário criado
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        event(new Registered($user));

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user->only(['id','name','email']),
        ], 201);
    }
}

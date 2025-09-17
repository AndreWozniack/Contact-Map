<?php

/**
 * Rotas da API
 * 
 * Define todas as rotas da API da aplicação, organizadas por funcionalidade.
 * Todas as rotas são protegidas por autenticação via Laravel Sanctum,
 * exceto as rotas de autenticação definidas em auth.php.
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\MeController;
use App\Http\Controllers\PasswordController;

require __DIR__.'/auth.php';

/**
 * Grupo de rotas protegidas por autenticação
 * 
 * Todas as rotas neste grupo requerem um token válido do Laravel Sanctum
 */
Route::middleware('auth:sanctum')->group(function () {
    // Rotas do usuário autenticado
    Route::get ('/me',          [MeController::class,'show']);
    Route::put ('/me',          [MeController::class,'update']);
    Route::post('/me/password', [PasswordController::class,'update']);

    // Rotas de gerenciamento de contatos (CRUD completo)
    Route::get   ('/contacts',       [ContactController::class,'index']);
    Route::post  ('/contacts',       [ContactController::class,'store']);
    Route::get   ('/contacts/{id}',  [ContactController::class,'show']);
    Route::put   ('/contacts/{id}',  [ContactController::class,'update']);
    Route::delete('/contacts/{id}',  [ContactController::class,'destroy']);

    // Rotas de consulta de endereços via ViaCEP
    Route::get   ('/address/search', [AddressController::class,'search']);
    Route::get   ('/address/',       [AddressController::class,'byCep']);
    
    // Rota de exclusão de conta
    Route::delete('/account',        [AccountController::class,'destroy']);
});

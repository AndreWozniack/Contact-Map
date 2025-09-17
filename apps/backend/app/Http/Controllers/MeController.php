<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * Controlador responsável por operações relacionadas ao usuário autenticado
 * 
 * Este controlador gerencia informações do próprio usuário logado,
 * permitindo visualizar e atualizar dados pessoais.
 */
class MeController extends Controller 
{
    /**
     * Exibe informações do usuário autenticado
     * 
     * @param Request $r Requisição HTTP
     * @return array Dados do usuário (id, name, email, email_verified_at, created_at)
     */
    public function show(Request $r) 
    {
        return $r->user()->only(['id','name','email','email_verified_at','created_at']);
    }

    /**
     * Atualiza informações do usuário autenticado
     * 
     * @param Request $r Requisição HTTP contendo dados a serem atualizados
     * @return array Dados atualizados do usuário (id, name, email)
     */
    public function update(Request $r) 
    {
        $data = $r->validate([
            'name'  => ['sometimes','required','string','max:255'],
            'email' => ['sometimes','required','email','max:255','unique:users,email,'.$r->user()->id],
        ]);
        $r->user()->update($data);
        return $r->user()->only(['id','name','email']);
    }
}

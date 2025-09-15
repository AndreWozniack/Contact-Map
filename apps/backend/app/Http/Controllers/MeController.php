<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MeController extends Controller {
    public function show(Request $r) {
        return $r->user()->only(['id','name','email','email_verified_at','created_at']);
    }
    public function update(Request $r) {
        $data = $r->validate([
            'name'  => ['sometimes','required','string','max:255'],
            'email' => ['sometimes','required','email','max:255','unique:users,email,'.$r->user()->id],
        ]);
        $r->user()->update($data);
        return $r->user()->only(['id','name','email']);
    }
}

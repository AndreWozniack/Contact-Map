<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AddressController extends Controller
{
    public function search(Request $request)
    {
        $data = $request->validate([
            'uf'   => ['required','size:2'],
            'city' => ['required','string','max:255'],
            'q'    => ['required','string','max:255'],
        ]);

        $url  = "https://viacep.com.br/ws/{$data['uf']}/{$data['city']}/{$data['q']}/json/";
        $resp = Http::get($url)->json();

        $items = collect($resp)->filter(fn($i) => empty($i['erro'] ?? false))->map(function ($i) {
            return [
                'cep'      => preg_replace('/\D/','', $i['cep'] ?? ''),
                'state'    => $i['uf'] ?? '',
                'city'     => $i['localidade'] ?? '',
                'street'   => $i['logradouro'] ?? '',
                'district' => $i['bairro'] ?? '',
            ];
        })->values();

        return ['items' => $items];
    }

    public function byCep(Request $request)
    {
        $data = $request->validate([
            'cep' => ['required','size:8'],
        ]);

        $url  = "https://viacep.com.br/ws/{$data['cep']}/json/";
        $resp = Http::get($url)->json();
        if (!is_array($resp) || ($resp['erro'] ?? false)) {
            return response()->json(['message' => 'CEP não encontrado'], 404);
        }

        return [
            'address' => [
                'cep'      => preg_replace('/\D/', '', $resp['cep'] ?? $data['cep']),
                'state'    => $resp['uf'] ?? '',
                'city'     => $resp['localidade'] ?? '',
                'street'   => $resp['logradouro'] ?? '',
                'district' => $resp['bairro'] ?? '',
            ],
        ];
    }
}

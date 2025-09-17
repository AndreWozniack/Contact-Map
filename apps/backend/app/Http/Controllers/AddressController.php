<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

/**
 * Controlador responsável por operações relacionadas a endereços
 * 
 * Este controlador integra com a API do ViaCEP para busca de endereços
 * por cidade/estado/logradouro e consulta por CEP específico.
 */
class AddressController extends Controller
{
    /**
     * Busca endereços por UF, cidade e termo de pesquisa
     * 
     * Utiliza a API do ViaCEP para encontrar endereços que correspondam
     * aos critérios de busca fornecidos.
     * 
     * @param Request $request Requisição contendo uf, city e q (termo de busca)
     * @return array|\Illuminate\Http\JsonResponse Lista de endereços encontrados ou erro
     */
    public function search(Request $request)
    {
        $data = $request->validate([
            'uf'   => ['required','size:2'],
            'city' => ['required','string','max:255'],
            'q'    => ['required','string','max:255'],
        ]);

        $url  = "https://viacep.com.br/ws/{$data['uf']}/{$data['city']}/{$data['q']}/json/";
        
        try {
            $resp = Http::timeout(8)->retry(2, 200)->get($url)->json();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erro ao consultar ViaCEP. Tente novamente.'], 503);
        }

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

    /**
     * Busca informações de endereço por CEP
     * 
     * Consulta a API do ViaCEP para obter informações completas
     * de um endereço baseado no CEP fornecido.
     * 
     * @param Request $request Requisição contendo o CEP a ser consultado
     * @return array|\Illuminate\Http\JsonResponse Informações do endereço encontrado ou erro
     */
    public function byCep(Request $request)
    {
        $data = $request->validate([
            'cep' => ['required','size:8'],
        ]);

        $url  = "https://viacep.com.br/ws/{$data['cep']}/json/";
        
        try {
            $resp = Http::timeout(8)->retry(2, 200)->get($url)->json();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erro ao consultar ViaCEP. Tente novamente.'], 503);
        }
        
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

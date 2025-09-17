<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AddressSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_viacep_proxy_returns_normalized_items(): void
    {
        Sanctum::actingAs(User::factory()->create());

        Http::fake([
            'https://viacep.com.br/ws/*' => Http::response([
                [
                    'cep' => '80010-000',
                    'logradouro' => 'Rua XV de Novembro',
                    'bairro' => 'Centro',
                    'localidade' => 'Curitiba',
                    'uf' => 'PR',
                ],
                [
                    'cep' => '80020-000',
                    'logradouro' => 'Rua Marechal',
                    'bairro' => 'Centro',
                    'localidade' => 'Curitiba',
                    'uf' => 'PR',
                ],
            ], 200),
        ]);

        $res = $this->getJson('/api/address/search?uf=PR&city=Curitiba&q=Rua');
        $res->assertOk()
            ->assertJsonStructure(['items'=>[['cep','state','city','street','district']]])
            ->assertJsonFragment(['cep'=>'80010000','state'=>'PR','city'=>'Curitiba','street'=>'Rua XV de Novembro','district'=>'Centro']);
    }
}

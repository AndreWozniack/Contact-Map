<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeder principal do banco de dados
 * 
 * Este seeder cria dados de exemplo para desenvolvimento e testes,
 * incluindo um usuário de demonstração e vários contatos com
 * endereços reais de Curitiba-PR.
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Executa o seeding do banco de dados
     * 
     * Cria um usuário de demonstração e uma coleção de contatos
     * com dados realísticos para facilitar o desenvolvimento
     * e demonstração da aplicação.
     * 
     * @return void
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name'     => 'Demo User',
            'email'    => 'demo@example.com',
            'password' => bcrypt('secret123'),
        ]);

        $enderecos = [
            [
                'name' => 'João da Silva',
                'cpf' => '12345678901',
                'phone' => '(41) 99999-0001',
                'cep' => '80010000',
                'street' => 'Rua XV de Novembro',
                'number' => '123',
                'complement' => 'Centro',
                'city' => 'Curitiba',
                'state' => 'PR',
                'lat' => -25.4284,
                'lng' => -49.2733,
            ],
            [
                'name' => 'Maria Oliveira',
                'cpf' => '12345678902',
                'phone' => '(41) 99999-0002',
                'cep' => '80510000',
                'street' => 'Rua São Francisco',
                'number' => '456',
                'complement' => 'São Francisco',
                'city' => 'Curitiba',
                'state' => 'PR',
                'lat' => -25.4231,
                'lng' => -49.2700,
            ],
            [
                'name' => 'Carlos Souza',
                'cpf' => '12345678903',
                'phone' => '(41) 99999-0003',
                'cep' => '80610000',
                'street' => 'Av. República Argentina',
                'number' => '789',
                'complement' => 'Água Verde',
                'city' => 'Curitiba',
                'state' => 'PR',
                'lat' => -25.4547,
                'lng' => -49.2808,
            ],
            [
                'name' => 'Ana Pereira',
                'cpf' => '12345678904',
                'phone' => '(41) 99999-0004',
                'cep' => '81310000',
                'street' => 'Rua João Dembinski',
                'number' => '321',
                'complement' => 'Cidade Industrial',
                'city' => 'Curitiba',
                'state' => 'PR',
                'lat' => -25.4950,
                'lng' => -49.3380,
            ],
            [
                'name' => 'Lucas Almeida',
                'cpf' => '12345678905',
                'phone' => '(41) 99999-0005',
                'cep' => '83005010',
                'street' => 'Rua Marechal Deodoro',
                'number' => '654',
                'complement' => 'Centro',
                'city' => 'São José dos Pinhais',
                'state' => 'PR',
                'lat' => -25.5325,
                'lng' => -49.2031,
            ],
        ];

        foreach ($enderecos as $dados) {
            Contact::create(array_merge($dados, [
                'user_id' => $user->id,
            ]));
        }
    }
}

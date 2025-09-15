<?php

namespace Database\Factories;

use App\Models\Contact;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Contact>
 */
class ContactFactory extends Factory
{

    protected $model = Contact::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id'    => User::factory(),
            'name'       => $this->faker->name(),
            'cpf'        => $this->validCpf(),
            'phone'      => $this->faker->numerify('+55###########'),
            'cep'        => '80010000',
            'state'      => 'PR',
            'city'       => 'Curitiba',
            'street'     => 'Rua XV de Novembro',
            'number'     => '100',
            'complement' => null,
            'lat'        => -25.4283567,
            'lng'        => -49.2732515,
        ];
    }

    private function validCpf(): string
    {
        $n = [];
        for ($i=0; $i<9; $i++) $n[$i] = random_int(0,9);

        $d = 0; for ($i=0; $i<9; $i++) $d += $n[$i] * (10 - $i);
        $d = 11 - ($d % 11); $n[9] = ($d >= 10) ? 0 : $d;

        $d = 0; for ($i=0; $i<10; $i++) $d += $n[$i] * (11 - $i);
        $d = 11 - ($d % 11); $n[10] = ($d >= 10) ? 0 : $d;

        return implode('', $n);
    }
}

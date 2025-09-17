<?php

namespace Tests\Unit;

use App\Models\Contact;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Testes unitários para o modelo Contact
 * 
 * Testa funcionalidades específicas do modelo Contact,
 * incluindo relacionamentos, casting e validações.
 */
class ContactTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Testa a criação básica de contato
     */
    public function test_contact_creation(): void
    {
        $user = User::factory()->create();
        
        $contactData = [
            'user_id' => $user->id,
            'name' => 'João Silva',
            'cpf' => '39053344705',
            'phone' => '41999999999',
            'cep' => '80010000',
            'state' => 'PR',
            'city' => 'Curitiba',
            'street' => 'Rua XV de Novembro',
            'number' => '100',
            'lat' => -25.4284,
            'lng' => -49.2733,
        ];

        $contact = Contact::create($contactData);

        $this->assertInstanceOf(Contact::class, $contact);
        $this->assertEquals('João Silva', $contact->name);
        $this->assertEquals('39053344705', $contact->cpf);
        $this->assertEquals($user->id, $contact->user_id);
    }

    /**
     * Testa atributos fillable
     */
    public function test_fillable_attributes(): void
    {
        $expectedFillable = [
            'user_id',
            'name', 'cpf', 'phone',
            'cep', 'state', 'city', 'street', 'number', 'complement',
            'lat', 'lng',
        ];
        
        $contact = new Contact();
        $this->assertEquals($expectedFillable, $contact->getFillable());
    }

    /**
     * Testa casting de coordenadas para float
     */
    public function test_coordinates_casting(): void
    {
        $user = User::factory()->create();
        
        $contact = Contact::factory()->create([
            'user_id' => $user->id,
            'lat' => '25.4284',  // String
            'lng' => '49.2733',  // String
        ]);

        $this->assertIsFloat($contact->lat);
        $this->assertIsFloat($contact->lng);
        $this->assertEquals(25.4284, $contact->lat);
        $this->assertEquals(49.2733, $contact->lng);
    }

    /**
     * Testa relacionamento com usuário
     */
    public function test_user_relationship(): void
    {
        $user = User::factory()->create();
        $contact = Contact::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $contact->user());
        $this->assertInstanceOf(User::class, $contact->user);
        $this->assertEquals($user->id, $contact->user->id);
        $this->assertEquals($user->name, $contact->user->name);
    }

    /**
     * Testa factory do contato
     */
    public function test_contact_factory(): void
    {
        $user = User::factory()->create();
        $contact = Contact::factory()->create(['user_id' => $user->id]);

        $this->assertNotEmpty($contact->name);
        $this->assertNotEmpty($contact->cpf);
        $this->assertNotEmpty($contact->phone);
        $this->assertNotEmpty($contact->cep);
        $this->assertNotEmpty($contact->state);
        $this->assertNotEmpty($contact->city);
        $this->assertNotEmpty($contact->street);
        $this->assertNotEmpty($contact->number);
        $this->assertIsFloat($contact->lat);
        $this->assertIsFloat($contact->lng);
    }

    /**
     * Testa factory com atributos customizados
     */
    public function test_contact_factory_with_custom_attributes(): void
    {
        $user = User::factory()->create();
        
        $contact = Contact::factory()->create([
            'user_id' => $user->id,
            'name' => 'Maria Silva',
            'city' => 'São Paulo',
            'state' => 'SP',
        ]);

        $this->assertEquals('Maria Silva', $contact->name);
        $this->assertEquals('São Paulo', $contact->city);
        $this->assertEquals('SP', $contact->state);
    }

    /**
     * Testa campos opcionais
     */
    public function test_optional_fields(): void
    {
        $user = User::factory()->create();
        
        $contact = Contact::create([
            'user_id' => $user->id,
            'name' => 'João',
            'cpf' => '39053344705',
            'phone' => '41999999999',
            'cep' => '80010000',
            'state' => 'PR',
            'city' => 'Curitiba',
            'street' => 'Rua XV',
            'number' => '100',
            'lat' => -25.4284,
            'lng' => -49.2733,
            // complement é opcional
        ]);

        $this->assertNull($contact->complement);
        $this->assertNotNull($contact->name);
    }

    /**
     * Testa validação de coordenadas válidas
     */
    public function test_valid_coordinates(): void
    {
        $user = User::factory()->create();
        
        $contact = Contact::factory()->create([
            'user_id' => $user->id,
            'lat' => -90.0,  // Latitude mínima válida
            'lng' => -180.0, // Longitude mínima válida
        ]);

        $this->assertEquals(-90.0, $contact->lat);
        $this->assertEquals(-180.0, $contact->lng);

        $contact = Contact::factory()->create([
            'user_id' => $user->id,
            'lat' => 90.0,   // Latitude máxima válida
            'lng' => 180.0,  // Longitude máxima válida
        ]);

        $this->assertEquals(90.0, $contact->lat);
        $this->assertEquals(180.0, $contact->lng);
    }

    /**
     * Testa que o contato pertence ao usuário correto
     */
    public function test_contact_belongs_to_correct_user(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        
        $contact = Contact::factory()->create(['user_id' => $user1->id]);

        $this->assertEquals($user1->id, $contact->user_id);
        $this->assertNotEquals($user2->id, $contact->user_id);
    }

    /**
     * Testa timestamps automáticos
     */
    public function test_timestamps(): void
    {
        $user = User::factory()->create();
        $contact = Contact::factory()->create(['user_id' => $user->id]);

        $this->assertNotNull($contact->created_at);
        $this->assertNotNull($contact->updated_at);
        $this->assertInstanceOf(\Carbon\Carbon::class, $contact->created_at);
        $this->assertInstanceOf(\Carbon\Carbon::class, $contact->updated_at);
    }
}

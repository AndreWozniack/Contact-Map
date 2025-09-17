<?php

namespace Tests\Feature;

use App\Models\Contact;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ContactCrudTest extends TestCase
{
    use RefreshDatabase;

    private function fakeGeocode($lat = -25.4283567, $lng = -49.2732515): void
    {
        Http::fake([
            'maps.googleapis.com/*' => Http::response([
                'results' => [[
                    'geometry' => ['location' => ['lat' => $lat, 'lng' => $lng]]
                ]],
                'status' => 'OK'
            ], 200),
        ]);
    }

    public function test_create_contact_with_valid_cpf_and_address_geocodes(): void
    {
        $this->fakeGeocode();
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $payload = [
            'name' => 'João da Silva',
            'cpf' => '39053344705',
            'phone' => '+5541999999999',
            'cep' => '80010000',
            'state' => 'PR',
            'city' => 'Curitiba',
            'street' => 'Rua XV de Novembro',
            'number' => '100',
        ];

        $res = $this->postJson('/api/contacts', $payload);
        $res->assertCreated()->assertJsonFragment(['name' => 'João da Silva']);

        $this->assertDatabaseHas('contacts', [
            'user_id' => $user->id,
            'cpf' => '39053344705',
        ]);
        $contact = Contact::first();
        $this->assertNotNull($contact->lat);
        $this->assertNotNull($contact->lng);
    }

    public function test_cpf_must_be_unique_per_user(): void
    {
        $this->fakeGeocode();
        $u1 = User::factory()->create();
        $u2 = User::factory()->create();

        Sanctum::actingAs($u1);
        $this->postJson('/api/contacts', [
            'name' => 'A', 'cpf' => '39053344705', 'phone' => '+55', 'cep' => '80010000', 'state' => 'PR', 'city' => 'Curitiba', 'street' => 'Rua', 'number' => '1'
        ])->assertCreated();

        $this->postJson('/api/contacts', [
            'name' => 'B', 'cpf' => '39053344705', 'phone' => '+55', 'cep' => '80010000', 'state' => 'PR', 'city' => 'Curitiba', 'street' => 'Rua', 'number' => '2'
        ])->assertStatus(422);

        Sanctum::actingAs($u2);
        $this->postJson('/api/contacts', [
            'name' => 'C', 'cpf' => '39053344705', 'phone' => '+55', 'cep' => '80010000', 'state' => 'PR', 'city' => 'Curitiba', 'street' => 'Rua', 'number' => '3'
        ])->assertCreated();
    }

    public function test_only_owner_can_access_contact(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        Sanctum::actingAs($owner);
        $this->fakeGeocode();

        $c = Contact::factory()->for($owner)->create();

        Sanctum::actingAs($other);
        $this->getJson("/api/contacts/{$c->id}")->assertNotFound();
    }

    public function test_index_filters_by_name_or_cpf_and_orders_asc(): void
    {
        $u = User::factory()->create();
        Sanctum::actingAs($u);

        Contact::factory()->for($u)->create(['name' => 'Bruno']);
        Contact::factory()->for($u)->create(['name' => 'Ana']);
        Contact::factory()->for($u)->create(['name' => 'Carlos']);

        $res = $this->getJson('/api/contacts?per_page=10');
        $names = array_column($res->json('data'), 'name');
        $this->assertSame(['Ana', 'Bruno', 'Carlos'], $names);

        $res = $this->getJson('/api/contacts?q=bru');
        $this->assertCount(1, $res->json('data'));
        $this->assertSame('Bruno', $res->json('data')[0]['name']);
    }

    public function test_update_regeocodes_when_address_changes(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $contact = Contact::factory()->for($user)->create([
            'cep' => '80010000',
            'state' => 'PR',
            'city' => 'Curitiba',
            'street' => 'Rua A', 
            'number' => '10', 
            'lat' => -25.1, 
            'lng' => -49.1
        ]);

        $originalLat = $contact->lat;
        $originalLng = $contact->lng;
        
        Http::fake([
            'maps.googleapis.com/*' => Http::response([
                'results' => [[
                    'geometry' => ['location' => ['lat' => -25.999, 'lng' => -49.999]]
                ]],
                'status' => 'OK'
            ], 200),
        ]);
        
        $response = $this->putJson("/api/contacts/{$contact->id}", [
            'street' => 'Rua B',
            'number' => '20'
        ]);
        
        $response->assertOk();
        $contact->refresh();
        
        $this->assertNotEquals($originalLat, $contact->lat);
        $this->assertNotEquals($originalLng, $contact->lng);
        
        $this->assertEquals('Rua B', $contact->street);
        $this->assertEquals('20', $contact->number);
    }
}

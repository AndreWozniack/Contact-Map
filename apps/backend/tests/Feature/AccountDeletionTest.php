<?php

namespace Tests\Feature;

use App\Models\Contact;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AccountDeletionTest extends TestCase
{
    use RefreshDatabase;

    public function test_delete_account_requires_valid_password(): void
    {
        $user = User::factory()->create(['password'=>bcrypt('secret123')]);
        Sanctum::actingAs($user);

        Contact::factory()->count(2)->for($user)->create();

        $this->deleteJson('/api/account', ['password'=>'wrong'])->assertStatus(422);
        $this->assertDatabaseHas('users', ['id'=>$user->id]);

        $this->deleteJson('/api/account', ['password'=>'secret123'])->assertJson(['message' => 'Conta deletada com sucesso']);
        $this->assertDatabaseMissing('users', ['id'=>$user->id]);
        $this->assertDatabaseCount('contacts', 0);
    }
}

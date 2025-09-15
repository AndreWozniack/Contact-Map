<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('name');
            $table->string('cpf', 11);
            $table->string('phone', 20);

            $table->string('cep', 8);
            $table->string('state', 2);
            $table->string('city');
            $table->string('street');
            $table->string('number');
            $table->string('complement')->nullable();

            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);

            $table->timestamps();

            $table->unique(['user_id', 'cpf']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};

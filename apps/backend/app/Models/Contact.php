<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use \Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Modelo Contact - Representa um contato no sistema
 * 
 * Este modelo contém informações pessoais e de endereço de um contato,
 * incluindo coordenadas geográficas para exibição em mapas.
 * Cada contato pertence a um usuário específico.
 * 
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string $cpf
 * @property string $phone
 * @property string $cep
 * @property string $state
 * @property string $city
 * @property string $street
 * @property string $number
 * @property string|null $complement
 * @property float $lat
 * @property float $lng
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Contact extends Model
{
    use HasFactory;

    /**
     * Configuração de casting de tipos para atributos
     * 
     * @var array
     */
    protected $casts = ['lat' => 'float', 'lng' => 'float'];

    /**
     * Atributos que podem ser preenchidos em massa
     * 
     * @var array
     */
    protected $fillable = [
        'user_id',
        'name','cpf','phone',
        'cep','state','city','street','number','complement',
        'lat','lng',
    ];

    /**
     * Relacionamento: Contact pertence a User
     * 
     * @return BelongsTo
     */
    public function user(): BelongsTo
    { 
        return $this->belongsTo(User::class); 
    }
}

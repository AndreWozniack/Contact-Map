<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use \Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contact extends Model
{
    use HasFactory;

    protected $casts = ['lat' => 'float', 'lng' => 'float'];

    protected $fillable = [
        'user_id',
        'name','cpf','phone',
        'cep','state','city','street','number','complement',
        'lat','lng',
    ];

    public function user():BelongsTo
    { return $this->belongsTo(User::class); }
}

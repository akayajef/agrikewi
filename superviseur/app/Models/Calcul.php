<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Calcul extends Model
{
    use HasFactory;

    protected $table = 'calculs';

    protected $fillable = [
        'user_id',
        'type_calcul',
        'donnees_entree',
        'resultats',
    ];

    protected $casts = [
        'donnees_entree' => 'array',
        'resultats' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

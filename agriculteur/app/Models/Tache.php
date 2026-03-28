<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tache extends Model
{
    use HasFactory;

    protected $table = 'tache';

    // Désactive les timestamps automatiques
    public $timestamps = false;

    protected $fillable = [
        'description',
        'statut',       // en_cours, terminee, retard
        'date_echeance',
        'agriculteur_id',
    ];

    protected $casts = [
        'date_echeance' => 'datetime',
    ];
}

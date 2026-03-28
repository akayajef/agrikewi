<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Historique extends Model
{
    use HasFactory;

    protected $table = 'historique_commandes'; // nom de la table
    public $timestamps = false; // la table utilise `date_changement` au lieu de created_at

    protected $fillable = [
        'commande_id',
        'statut',       // en_cours, en_preparation, livree, annulee
        'date_changement',
    ];

    /**
     * L'historique appartient à une commande
     */
    public function commande()
    {
        return $this->belongsTo(\App\Models\Commande::class, 'commande_id');
    }
}

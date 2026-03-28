<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// Assurez-vous d'avoir un modèle Agriculteur qui hérite de Ouvrier ou référence la table 'ouvrier'

class Plantation extends Model
{
    use HasFactory;

    protected $table = 'plantation';
    public $timestamps = false;

    protected $fillable = [
        'nom',
        'zone_id',
        'agriculteur_id',
        'type_sol',
        'perimetre',
        'date_plantation',
        'created_by',
    ];

    // ================= Relations =================

    /**
     * Zone de production associée
     */
    public function zone()
    {
        return $this->belongsTo(ZoneDeProduction::class, 'zone_id');
    }

    /**
     * Agriculteur associé
     */
    public function agriculteur()
    {
        // CLÉ ÉTRANGÈRE CORRIGÉE: 
        // 1. Clé locale (sur plantation) : 'agriculteur_id'
        // 2. Clé de référence (sur Agriculteur/Ouvrier) : 'id' (clé primaire de la table ouvrier)
        return $this->belongsTo(Agriculteur::class, 'agriculteur_id', 'id')
            ->withDefault();
    }

    /**
     * Produits agricoles liés à cette plantation
     */
    public function produits()
    {
        return $this->belongsToMany(
            ProduitAgricole::class,
            'plantation_produit',
            'plantation_id',
            'produit_agricole_id'
        )->withPivot('quantite_prevue');
    }
}

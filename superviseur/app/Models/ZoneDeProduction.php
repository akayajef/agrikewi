<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ZoneDeProduction extends Model
{
    use HasFactory;

    protected $table = 'zone_de_production';
    public $timestamps = false;

    protected $fillable = [
        'nom',
        'localite_id',
        'superviseur_id',
    ];

    // ================= Relations =================

    /**
     * Relation : la zone appartient à une localité
     */
    public function localite()
    {
        return $this->belongsTo(Localite::class, 'localite_id');
    }

    /**
     * Relation : la zone appartient à un superviseur (qui est un Ouvrier)
     */
    public function superviseur()
    {
        // Correction : la relation pointe vers Ouvrier::class
        return $this->belongsTo(Ouvrier::class, 'superviseur_id');
    }

    /**
     * Relation : la zone contient plusieurs plantations
     */
    public function plantations()
    {
        return $this->hasMany(Plantation::class, 'zone_id');
    }

    /**
     * Relation : Récupérer tous les produits agricoles liés à cette zone via les plantations
     */
    public function produitsAgricoles()
    {
        // Plantation::class est l'intermédiaire, ProduitAgricole::class est le modèle final
        return $this->hasManyThrough(
            ProduitAgricole::class, // modèle final : le produit que l'on veut récupérer
            Plantation::class,      // modèle intermédiaire
            'zone_id',              // clé étrangère sur Plantation pointant vers ZoneDeProduction
            'plantation_id',        // Clé étrangère sur ProduitAgricole pointant vers Plantation
            'id',                   // clé locale sur ZoneDeProduction
            'id'                    // clé locale sur Plantation (qui est la clé étrangère sur ProduitAgricole)
        );
    }
}

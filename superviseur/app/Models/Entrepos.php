<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Stock;
use App\Models\ProduitAgricole;
use App\Models\ProduitIntrant;

class Entrepos extends Model
{
    use HasFactory;

    protected $table = 'entrepos'; // nom exact de la table
    public $timestamps = true;

    protected $fillable = [
        'nom',
        'adresse',
        'capacite',
    ];

    /**
     * Relation avec les stocks (tous les produits stockés)
     */
    public function stocks()
    {
        return $this->hasMany(Stock::class, 'entrepos_id');
    }

    /**
     * Relation avec les produits agricoles présents dans cet entrepôt via la table stock
     */
    public function produitsAgricoles()
    {
        // CORRECTION: Utilisation de hasManyThrough pour lier Entrepos -> Stock -> ProduitAgricole
        return $this->hasManyThrough(
            ProduitAgricole::class,
            Stock::class,
            'entrepos_id',        // Clé étrangère dans Stock (table intermédiaire)
            'id',                 // Clé primaire dans ProduitAgricole (modèle cible)
            'id',                 // Clé locale dans Entrepos (modèle source)
            'produit_agricole_id' // Clé locale dans Stock pointant vers ProduitAgricole
        );
    }

    /**
     * Relation avec les produits intrants présents dans cet entrepôt via la table stock
     */
    public function produitsIntrants()
    {
        return $this->hasManyThrough(
            ProduitIntrant::class,
            Stock::class,
            'entrepos_id',        // clé étrangère dans Stock
            'id',                 // clé primaire dans ProduitIntrant
            'id',                 // clé locale dans Entrepos
            'produit_intrant_id'  // clé locale dans Stock pointant vers ProduitIntrant
        );
    }
}

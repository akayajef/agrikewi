<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProduitAgricole extends Model
{
    use HasFactory;

    protected $table = 'produit_agricole';
    public $timestamps = true; // created_at et updated_at

    protected $fillable = [
        'nom',
        'type',             // fruit, legume, tubercule, cereale
        'nature',           // Correction: Ajout de 'nature' qui était manquante
        'superviseur_id',
        'description',
        // 'quantite' et 'entrepos_id' RETIRÉS : ces champs appartiennent à la table 'stock'
    ];

    // ================= Relations =================

    /**
     * Superviseur responsable du produit
     */
    public function superviseur()
    {
        return $this->belongsTo(Ouvrier::class, 'superviseur_id');
    }

    /**
     * Stocks associés au produit. Un produit agricole peut être dans plusieurs 
     * entrées de stock (ex: différents entrepôts ou différentes quantités).
     */
    public function stocks()
    {
        return $this->hasMany(Stock::class, 'produit_agricole_id');
    }

    /*
     * REMARQUE: La relation 'entrepos()' a été RETIRÉE car un produit est lié à 
     * l'entrepôt UNIQUEMENT via sa relation 'stocks' (Stock -> Entrepos).
     *
     * Pour obtenir les entrepôts, il faut utiliser: $produit->stocks->first()->entrepos
     */

    /**
     * Articles liés à ce produit (Produits vendus)
     */
    public function articles()
    {
        return $this->hasMany(Article::class, 'produit_agricole_id');
    }

    /**
     * Plantation(s) utilisant ce produit (Relation Many-to-Many)
     */
    public function plantations()
    {
        return $this->belongsToMany(
            Plantation::class,      // modèle cible
            'plantation_produit',   // table pivot
            'produit_agricole_id',  // clé étrangère dans pivot vers produit
            'plantation_id'         // clé étrangère dans pivot vers plantation
        )->withPivot('quantite_prevue');
    }
}

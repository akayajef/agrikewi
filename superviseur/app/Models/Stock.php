<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ProduitAgricole;
use App\Models\ProduitIntrant;
use App\Models\ProduitTransforme; // 🌟 NOUVEAU : Importation du modèle de produit transformé
use App\Models\Entrepos;

class Stock extends Model
{
    use HasFactory;

    protected $table = 'stock';
    public $timestamps = true;

    protected $fillable = [
        'produit_agricole_id',
        'produit_intrant_id',
        'produit_transforme_id', // 🌟 AJOUTÉ : Clé étrangère pour les articles transformés
        'entrepos_id',
        'quantite',
        'seuil_alerte',
        'unite_stock', // 'unite', 'kilo', 'tonne'
    ];

    // -------------------------------------------------------------------------
    // RELATIONS
    // -------------------------------------------------------------------------

    /**
     * Produit agricole associé à ce stock (si applicable)
     */
    public function produitAgricole()
    {
        return $this->belongsTo(ProduitAgricole::class, 'produit_agricole_id');
    }

    /**
     * Produit intrant associé à ce stock (si applicable)
     */
    public function produitIntrant()
    {
        return $this->belongsTo(ProduitIntrant::class, 'produit_intrant_id');
    }

    /**
     * Produit transformé associé à ce stock (si applicable) // 🌟 NOUVEAU
     */
    public function produitTransforme()
    {
        return $this->belongsTo(ProduitTransforme::class, 'produit_transforme_id');
    }

    /**
     * Entrepôt où le produit est stocké
     */
    public function entrepos()
    {
        return $this->belongsTo(Entrepos::class, 'entrepos_id');
    }

    // -------------------------------------------------------------------------
    // ACCESSEURS ET HELPERS
    // -------------------------------------------------------------------------

    /**
     * Récupère le produit réel associé à cette entrée de stock (Agricole, Intrant ou Transformé).
     * @return Model|null
     */
    public function getProduitAssocieAttribute()
    {
        return $this->produitAgricole ?? $this->produitIntrant ?? $this->produitTransforme;
    }

    /**
     * Détermine la nature du stock ('agricole', 'intrant' ou 'transforme').
     * @return string
     */
    public function getNatureAttribute(): string
    {
        if ($this->produit_agricole_id !== null) {
            return 'agricole';
        }
        if ($this->produit_intrant_id !== null) {
            return 'intrant';
        }
        if ($this->produit_transforme_id !== null) {
            return 'transforme';
        }
        return 'inconnu';
    }
}

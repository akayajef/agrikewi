<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProduitIntrant extends Model
{
    use HasFactory;

    protected $table = 'produit_intrant';

    // Laravel gérera automatiquement les colonnes created_at et updated_at
    public $timestamps = true;

    protected $fillable = [
        'nom',
        'type',
        'description',
        // 'quantite' RETIRÉE : cette information est stockée dans la table 'stock'
        'superviseur_id',
    ];

    /*
     * REMARQUE: La section $casts pour 'quantite' est retirée car le champ
     * n'est plus dans ce modèle, mais dans le modèle Stock.
     */

    /**
     * Relation : un produit intrant peut avoir plusieurs stocks
     */
    public function stocks()
    {
        return $this->hasMany(Stock::class, 'produit_intrant_id');
    }

    /**
     * Relation : un produit intrant appartient à un superviseur
     */
    public function superviseur()
    {
        return $this->belongsTo(Ouvrier::class, 'superviseur_id');
    }
}

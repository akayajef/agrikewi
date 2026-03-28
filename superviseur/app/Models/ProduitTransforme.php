<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProduitTransforme extends Model
{
    use HasFactory;

    protected $table = 'produit_transforme';
    public $timestamps = false;

    // Le script SQL ne spécifiait pas les colonnes de timestamps, mais par défaut,
    // Laravel suppose qu'elles existent. Si elles n'existent pas dans votre DB, ajoutez:
    // public $timestamps = false;

    protected $fillable = [
        'nom',
        'type_produit', // Correspond à l'ENUM du SQL : 'jus','conserve','huile','farine','autre'
        'description',
        'superviseur_id',
    ];

    // -------------------------------------------------------------------------
    // RELATIONS
    // -------------------------------------------------------------------------

    /**
     * Relation avec le superviseur (Ouvrier qui a créé ce produit transformé)
     */
    public function superviseur()
    {
        // Assurez-vous d'avoir un modèle Ouvrier ou d'utiliser le modèle Agriculteur si c'est le même
        return $this->belongsTo(Ouvrier::class, 'superviseur_id', 'id');
    }

    /**
     * Relation avec les articles qui sont basés sur ce produit transformé
     */
    public function articles()
    {
        return $this->hasMany(Article::class, 'produit_transforme_id');
    }

    /**
     * Relation avec le stock associé à ce produit transformé
     */
    public function stocks()
    {
        return $this->hasMany(Stock::class, 'produit_transforme_id');
    }
}

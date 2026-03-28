<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Catalogue extends Model
{
    use HasFactory;

    protected $table = 'catalogue_client'; // la vue SQL

    protected $primaryKey = 'article_id'; // clé primaire de la vue

    public $timestamps = false; // pas de created_at/updated_at dans la vue

    protected $fillable = [
        'article_id',
        'article_nom',
        'article_description',
        'article_prix',
        'article_image',
        'produit_source_nom',    // MODIFIÉ : Nom du produit (brut ou transformé)
        'article_categorie',     // NOUVEAU : Catégorie principale ('brut' ou 'transforme')
        'produit_type',          // MODIFIÉ : Type spécifique (fruit, legume, jus, conserve, etc.)
        'quantite_disponible',
        'unite_vente',           // Ajouté pour être sûr
    ];
}

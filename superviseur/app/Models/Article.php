<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use App\Models\ProduitAgricole;
use App\Models\ProduitTransforme; // 🌟 NOUVEAU : Importation du modèle ProduitTransforme
use App\Models\Ouvrier;

class Article extends Model
{
    use HasFactory;

    protected $table = 'article';
    public $timestamps = true;

    protected $fillable = [
        'produit_agricole_id',
        'produit_transforme_id', // 🌟 AJOUTÉ : Clé étrangère pour les articles transformés
        'nom',
        'description',
        'prix',
        'image_url',
        'superviseur_id',
        'unite_vente', // Peut être 'unite', 'kilo', 'tonne', 'litre', 'paquet'
    ];

    // Les attributs suivants seront ajoutés automatiquement quand on utilise ->toJson() ou ->toArray()
    protected $appends = [
        'type_article' // Utilise l'accesseur getTypeArticleAttribute
    ];


    // -------------------------------------------------------------------------
    // RELATIONS
    // -------------------------------------------------------------------------

    /**
     * Relation avec le produit agricole (si article brut)
     */
    public function produitAgricole()
    {
        return $this->belongsTo(ProduitAgricole::class, 'produit_agricole_id');
    }

    /**
     * Relation avec le produit transformé (si article transformé)
     */
    public function produitTransforme()
    {
        return $this->belongsTo(ProduitTransforme::class, 'produit_transforme_id');
    }

    /**
     * Relation avec le superviseur (ouvrier de type superviseur)
     */
    public function superviseur()
    {
        return $this->belongsTo(Ouvrier::class, 'superviseur_id', 'id');
    }


    // -------------------------------------------------------------------------
    // SCOPES ET ÉVÉNEMENTS DE MODÈLE (Booted)
    // -------------------------------------------------------------------------

    /**
     * Attribuer automatiquement le superviseur connecté lors de la création
     */
    protected static function booted()
    {
        static::creating(function ($article) {
            if (Auth::check() && !$article->superviseur_id) {
                // Tente de trouver l'ouvrier de l'utilisateur connecté s'il est superviseur
                $superviseur = Ouvrier::where('user_id', Auth::id())
                    ->where('type', 'superviseur')
                    ->first();

                $article->superviseur_id = $superviseur ? $superviseur->id : null;
            }
        });
    }


    // -------------------------------------------------------------------------
    // ACCESSEURS (Getters) ET HELPERS
    // -------------------------------------------------------------------------

    /**
     * Accesseur pour déterminer le type de l'article ('agricole' ou 'transforme')
     * Utilisation: $article->type_article
     */
    public function getTypeArticleAttribute()
    {
        if ($this->produit_transforme_id !== null) {
            return 'transforme';
        }
        return 'agricole';
    }

    /**
     * Accesseur pour récupérer l'unité de vente. Reste inchangé, mais permet
     * d'assurer la cohérence.
     */
    public function getUniteVenteAttribute($value)
    {
        return $value;
    }

    /**
     * Vérifie si l'article se vend à l'unité
     */
    public function isVenduAUnite()
    {
        return $this->unite_vente === 'unite';
    }

    /**
     * Vérifie si l'article se vend au kilogramme
     */
    public function isVenduAKilo()
    {
        return $this->unite_vente === 'kilo';
    }

    /**
     * Vérifie si l'article se vend à la tonne
     */
    public function isVenduATonne()
    {
        return $this->unite_vente === 'tonne';
    }

    /**
     * Vérifie si l'article se vend au litre // 🌟 NOUVEAU
     */
    public function isVenduALitre()
    {
        return $this->unite_vente === 'litre';
    }

    /**
     * Vérifie si l'article se vend au paquet // 🌟 NOUVEAU
     */
    public function isVenduAPaquet()
    {
        return $this->unite_vente === 'paquet';
    }
}

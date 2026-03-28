<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    use HasFactory;

    protected $table = 'commande'; // Nom de la table
    public $timestamps = false; // Si pas de created_at / updated_at

    protected $fillable = [
        'client_id',
        'date_commande',
        'statut', // en_cours, en_preparation, livree, annulee
    ];

    /**
     * La commande appartient à un client
     */
    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    /**
     * Les articles liés à la commande
     */
    public function articles()
    {
        return $this->hasMany(ArticleCommande::class, 'commande_id');
    }

    /**
     * Le paiement lié à la commande
     */
    public function paiement()
    {
        return $this->hasOne(Paiement::class, 'commande_id');
    }

    /**
     * La facture liée à la commande
     */
    public function facture()
    {
        return $this->hasOne(Facture::class, 'commande_id');
    }

    /**
     * Historique des changements de statut de la commande
     */
    public function historique()
    {
        return $this->hasMany(Historique::class, 'commande_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Paiement extends Model
{
    use HasFactory;

    protected $table = 'paiement';
    public $timestamps = false; // Désactive les colonnes created_at et updated_at

    protected $fillable = [
        'commande_id',
        'montant', // Montant après réduction
        'mode_paiement',
        'statut',
        // ✅ Ajout des champs pour la réduction
        'montant_initial',
        'reduction_pourcentage',
    ];

    /**
     * Une relation de paiement appartient à une seule commande.
     */
    public function commande()
    {
        return $this->belongsTo(Commande::class, 'commande_id');
    }
}

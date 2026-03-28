<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'client';

    protected $primaryKey = 'user_id'; // correspond à la colonne user_id

    public $incrementing = false; // car user_id n'est pas auto-incrémenté ici

    protected $keyType = 'bigint';

    protected $fillable = [
        'user_id',
        'adresse_livraison',
    ];

    // ==========================
    // Relation avec User
    // ==========================
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    // ==========================
    // Relation avec Commandes
    // ==========================
    public function commandes()
    {
        return $this->hasMany(Commande::class, 'client_id', 'user_id');
    }

    // ==========================
    // Relation avec Panier
    // ==========================
    public function panier()
    {
        return $this->hasMany(Panier::class, 'client_id', 'user_id');
    }

    // ==========================
    // Relation avec Paiements via Commandes
    // ==========================
    public function paiements()
    {
        return $this->hasManyThrough(
            Paiement::class,
            Commande::class,
            'client_id', // clé étrangère sur la table Commande
            'commande_id', // clé étrangère sur la table Paiement
            'user_id', // clé locale sur Client
            'id' // clé locale sur Commande
        );
    }
}

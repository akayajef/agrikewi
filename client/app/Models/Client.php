<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'client'; // Nom exact de la table
     public $timestamps = false;
    /**
     * Les attributs pouvant être assignés en masse
     */
    protected $fillable = [
        'user_id',
        'adresse_livraison', // supprimé selon ta demande
    ];

    /**
     * Relation vers l'utilisateur
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

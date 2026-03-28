<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

// Importation des modèles de dépendance
use App\Models\Ouvrier;
use App\Models\Plantation;

class ProduitAgricole extends Model
{
    use HasFactory, SoftDeletes;

    // Nom de la table dans la base de données (conformément à votre schéma SQL)
    protected $table = 'produit_agricole';

    /**
     * Les attributs qui peuvent être massivement assignés.
     * @var array<int, string>
     */
    protected $fillable = [
        'nom',
        'nature',
        'type',
        'superviseur_id',
        'description'
    ];

    // --- RELATIONS ---

    /**
     * Un produit agricole peut être cultivé dans plusieurs plantations.
     * Cette relation utilise la clé étrangère 'produit_agricole_id' dans la table 'plantation'.
     */
    public function plantations()
    {
        return $this->hasMany(Plantation::class, 'produit_agricole_id');
    }

    /**
     * Le produit agricole est géré par un superviseur (un Ouvrier).
     */
    public function superviseur()
    {
        return $this->belongsTo(Ouvrier::class, 'superviseur_id');
    }
}

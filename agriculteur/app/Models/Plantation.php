<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

// Importation des classes de modèles pour les relations
use App\Models\ZoneDeProduction;
use App\Models\ProduitAgricole;

class Plantation extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Nom de la table dans la base de données.
     * Définir explicitement au singulier 'plantation' pour éviter l'erreur SQL.
     * @var string
     */
    protected $table = 'plantation';

    /**
     * Les attributs qui peuvent être massivement assignés.
     * @var array<int, string>
     */
    protected $fillable = [
        'nom',
        'zone_id',
        'agriculteur_id',
        'produit_agricole_id',
        'type_sol',
        'perimetre',
        'date_plantation'
    ];

    // --- RELATIONS ---

    /**
     * La plantation appartient à une zone de production.
     */
    public function zone()
    {
        // 'zone_id' est la clé étrangère dans cette table qui pointe vers ZoneDeProduction
        return $this->belongsTo(ZoneDeProduction::class, 'zone_id');
    }

    /**
     * La plantation possède un produit agricole.
     */
    public function produitAgro()
    {
        // 'produit_agricole_id' est la clé étrangère dans cette table qui pointe vers ProduitAgricole
        return $this->belongsTo(ProduitAgricole::class, 'produit_agricole_id');
    }

    /**
     * La plantation appartient à un agriculteur (Utilisateur ou Agriculteur selon votre structure).
     * Si 'agriculteur_id' pointe vers le modèle User, modifiez User::class.
     */
    public function agriculteur()
    {
        // En supposant que le modèle User représente l'agriculteur
        return $this->belongsTo(User::class, 'agriculteur_id');
    }
}

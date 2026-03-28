<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use App\Models\User;
use App\Models\Tache;
use App\Models\Localite;

class Agriculteur extends Model
{
    protected $table = 'ouvrier'; // utilise la table ouvrier
    protected $primaryKey = 'id'; // clé primaire de la table ouvrier
    public $timestamps = false; // Basé sur votre script SQL, la table 'ouvrier' n'a pas created_at/updated_at

    protected $fillable = [
        'user_id',
        'type',
        'localite_id',
        'created_by_user_id', // <--- C'EST LE CHAMP CRITIQUE QUI MANQUAIT !
    ];

    /**
     * Scope global pour ne récupérer que les agriculteurs
     */
    protected static function booted()
    {
        static::addGlobalScope('agriculteur', function (Builder $query) {
            // Remarquez l'utilisation de $query->withoutGlobalScope() dans le contrôleur si vous voulez tous les types
            $query->where('type', 'agriculteur');
        });
    }

    // --- Relations ---

    /**
     * Relation avec l'utilisateur
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Relation avec l'utilisateur qui a créé cet enregistrement (le superviseur)
     */
    public function createur()
    {
        return $this->belongsTo(User::class, 'created_by_user_id', 'id');
    }

    /**
     * Tâches assignées à l'agriculteur
     */
    public function taches()
    {
        return $this->hasMany(Tache::class, 'agriculteur_id', 'id');
    }

    /**
     * Localité de l'agriculteur
     */
    public function localite()
    {
        return $this->belongsTo(Localite::class, 'localite_id', 'id');
    }
}

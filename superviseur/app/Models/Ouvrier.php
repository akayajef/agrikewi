<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ouvrier extends Model
{
    use HasFactory;

    protected $table = 'ouvrier';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'type',             // 'agriculteur' ou 'superviseur'
        'localite_id',
    ];

    // ================= Relations =================

    /**
     * L'utilisateur associé
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * La localité de l'ouvrier
     */
    public function localite()
    {
        return $this->belongsTo(Localite::class, 'localite_id');
    }

    /**
     * Tâches assignées à cet ouvrier (s'il est agriculteur)
     */
    public function taches()
    {
        return $this->hasMany(Tache::class, 'agriculteur_id');
    }

    /**
     * Produits agricoles supervisés (si superviseur)
     */
    public function produitsAgricoles() // Renommé de produitsAgro()
    {
        return $this->hasMany(ProduitAgricole::class, 'superviseur_id');
    }

    /**
     * Produits intrants supervisés (si superviseur)
     */
    public function produitsIntrants()
    {
        return $this->hasMany(ProduitIntrant::class, 'superviseur_id');
    }

    /**
     * Zones de production supervisées (si superviseur)
     */
    public function zones()
    {
        return $this->hasMany(ZoneDeProduction::class, 'superviseur_id');
    }

    /**
     * Rapports créés par le superviseur
     */
    public function rapports()
    {
        return $this->hasMany(Rapport::class, 'superviseur_id');
    }

    /**
     * Vérifie si l'ouvrier est un superviseur
     */
    public function isSuperviseur(): bool
    {
        return $this->type === 'superviseur';
    }

    /**
     * Vérifie si l'ouvrier est un agriculteur
     */
    public function isAgriculteur(): bool
    {
        return $this->type === 'agriculteur';
    }
}

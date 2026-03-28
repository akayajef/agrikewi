<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Superviseur extends Model
{
    use HasFactory;

    protected $table = 'superviseur';
    protected $primaryKey = 'user_id';
    public $incrementing = false; // clé primaire non auto-incrémentée
    public $timestamps = false;   // pas de created_at / updated_at

    protected $fillable = [
        'user_id',
    ];

    /**
     * Relation avec l'utilisateur correspondant
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Produits agricoles supervisés
     */
    public function produitsAgricoles()
    {
        return $this->hasMany(ProduitAgricole::class, 'superviseur_id');
    }

    /**
     * Produits intrants supervisés
     */
    public function produitsIntrants()
    {
        return $this->hasMany(ProduitIntrant::class, 'superviseur_id');
    }

    /**
     * Zones de production supervisées
     */
    public function zones()
    {
        return $this->hasMany(ZoneDeProduction::class, 'superviseur_id');
    }

    /**
     * Tâches assignées par ce superviseur
     */
    public function taches()
    {
        return $this->hasMany(Tache::class, 'superviseur_id');
    }
}

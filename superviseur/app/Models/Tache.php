<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tache extends Model
{
    use HasFactory;

    protected $table = 'tache';
    public $timestamps = false; // pas de created_at / updated_at

    protected $fillable = [
        'description',
        'date_echeance',
        'superviseur_id',
        'agriculteur_id',
        'statut',
    ];

    /**
     * Relation : le superviseur assignant la tâche (doit être un Ouvrier de type 'superviseur')
     */
    public function superviseur()
    {
        // Correction : pointe vers Ouvrier::class
        return $this->belongsTo(Ouvrier::class, 'superviseur_id');
    }

    /**
     * Relation : l'agriculteur assigné à la tâche (doit être un Ouvrier de type 'agriculteur')
     */
    public function agriculteur()
    {
        // Correction : pointe vers Ouvrier::class
        return $this->belongsTo(Ouvrier::class, 'agriculteur_id');
    }

    /**
     * Historique des changements de statut de la tâche
     */
    public function historiques()
    {
        return $this->hasMany(HistoriqueTache::class, 'tache_id');
    }
}

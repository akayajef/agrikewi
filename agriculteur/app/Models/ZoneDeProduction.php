<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ZoneDeProduction extends Model
{
    use HasFactory, SoftDeletes;

    // Nom de la table dans la base de données (conformément à votre schéma SQL)
    protected $table = 'zone_de_production';

    protected $fillable = [
        'nom',
        'localite_id',
        'superviseur_id'
    ];

    /**
     * Une zone de production a plusieurs plantations.
     */
    public function plantations()
    {
        return $this->hasMany(Plantation::class, 'zone_id');
    }

    /**
     * Une zone appartient à une localité.
     */
    public function localite()
    {
        return $this->belongsTo(Localite::class, 'localite_id');
    }

    /**
     * Une zone est supervisée par un Ouvrier.
     */
    public function superviseur()
    {
        return $this->belongsTo(Ouvrier::class, 'superviseur_id');
    }
}

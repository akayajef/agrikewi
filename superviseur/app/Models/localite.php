<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Ouvrier;
use App\Models\ZoneDeProduction;

class Localite extends Model
{
    use HasFactory;

    protected $table = 'localite'; // correspond exactement au nom de la table
    public $timestamps = false; // ta table n'a pas de created_at / updated_at

    protected $fillable = [
        'nom',
    ];

    /**
     * Relation vers les ouvriers associés à cette localité
     */
    public function ouvriers()
    {
        return $this->hasMany(Ouvrier::class, 'localite_id', 'id');
    }

    /**
     * Relation vers les zones de production situées dans cette localité
     */
    public function zones()
    {
        return $this->hasMany(ZoneDeProduction::class, 'localite_id', 'id');
    }
}

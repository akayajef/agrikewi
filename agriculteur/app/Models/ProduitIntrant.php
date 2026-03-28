<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProduitIntrant extends Model
{
    use HasFactory;

    protected $table = 'produit_intrant'; // nom de ta table

    protected $fillable = [
        'nom',
        'type', // 'engrais','semence','materiel','autre'
        'superviseur_id',
        'description',
    ];

    public $timestamps = true;

    /**
     * Un intrant appartient à un superviseur
     */
    public function superviseur()
    {
        return $this->belongsTo(Ouvrier::class, 'superviseur_id');
    }

    /**
     * Relation avec le stock
     */
    public function stocks()
    {
        return $this->hasMany(Stock::class, 'produit_intrant_id');
    }
}

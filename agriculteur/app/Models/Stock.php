<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ProduitIntrant;
use App\Models\Entrepos;

class Stock extends Model
{
    use HasFactory;

    protected $table = 'stock';

    protected $fillable = [
        'produit_intrant_id',
        'entrepos_id',
        'quantite',

        'deleted_at',
    ];

    // Relation vers l'intrant
    public function intrant()
    {
        return $this->belongsTo(ProduitIntrant::class, 'produit_intrant_id');
    }

    // Relation vers l'entrepôt
    public function entrepot()
    {
        return $this->belongsTo(Entrepos::class, 'entrepos_id');
    }
}

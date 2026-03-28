<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    use HasFactory;

    protected $table = 'facture';
    public $timestamps = false;

    protected $fillable = [
        'commande_id',
        'montant_total',
        'date_creation',
    ];

    // La facture appartient à une commande
    public function commande()
    {
        return $this->belongsTo(Commande::class, 'commande_id');
    }
}

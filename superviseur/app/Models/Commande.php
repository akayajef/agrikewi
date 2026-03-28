<?php
// ==========================================
// Commande.php
// ==========================================

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    use HasFactory;

    protected $table = 'commande';
    public $timestamps = false;

    protected $fillable = [
        'client_id',
        'adresse_livraison',
        'date_commande',
        'statut',
    ];

    protected $casts = [
        'date_commande' => 'datetime',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id', 'user_id');
    }

    public function paiements()
    {
        return $this->hasMany(Paiement::class, 'commande_id');
    }

    public function articlesCommande()
    {
        return $this->hasMany(ArticleCommande::class, 'commande_id');
    }
}

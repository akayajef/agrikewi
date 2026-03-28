<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArticleCommande extends Model
{
    use HasFactory;

    protected $table = 'article_commande';

    protected $fillable = [
        'commande_id',
        'article_id',
        'quantite',
        'prix_unitaire',
    ];

    public $timestamps = false;

    public function commande()
    {
        return $this->belongsTo(Commande::class, 'commande_id');
    }

    public function article()
    {
        return $this->belongsTo(Article::class, 'article_id');
    }
}

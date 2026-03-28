<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Notification extends Model
{
    use HasFactory;

    protected $table = 'notifications';

    protected $fillable = [
        'user_id',    // destinataire (agriculteur)
        'sender_id',  // expéditeur (superviseur ou autre)
        'title',
        'message',
        'type',       // 'cible' ou 'groupe'
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    /**
     * Relation vers le destinataire (agriculteur)
     */
    public function destinataire()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relation vers l'expéditeur
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Scope pour filtrer les notifications visibles par un agriculteur
     */
    public function scopeForAgriculteur($query, $agriculteurId)
    {
        return $query->where(function ($q) use ($agriculteurId) {
            $q->where('type', 'groupe')
                ->orWhere(function ($sub) use ($agriculteurId) {
                    $sub->where('type', 'cible')
                        ->where('user_id', $agriculteurId);
                });
        });
    }

    /**
     * Vérifie si la notification est lue
     */
    public function isRead()
    {
        return !is_null($this->read_at);
    }
}

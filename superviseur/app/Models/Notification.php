<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class Notification extends Model
{
    use HasFactory;

    protected $table = 'notifications';
    public $timestamps = true;

    protected $fillable = [
        'user_id',    // destinataire (toujours renseigné dans l'implémentation actuelle)
        'sender_id',  // expéditeur (admin ou superviseur)
        'title',      // optionnel
        'message',
        'type',       // 'cible' ou 'groupe'
        'read_at',
    ];

    protected $dates = [
        'read_at',
        'created_at',
        'updated_at',
    ];

    // ================= Relations =================

    /**
     * Destinataire de la notification
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Expéditeur de la notification
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    // ================= Helpers =================

    /**
     * Vérifie si c'est une notification de groupe
     */
    public function isGroupe(): bool
    {
        return $this->type === 'groupe';
    }

    /**
     * Vérifie si c'est une notification ciblée
     */
    public function isCible(): bool
    {
        return $this->type === 'cible';
    }

    /**
     * Marquer la notification comme lue
     */
    public function markAsRead()
    {
        // Ne fait rien si déjà lue
        if (!$this->read_at) {
            $this->update(['read_at' => now()]);
        }
    }

    // ================= Scopes =================

    /**
     * Scope pour les notifications non lues
     */
    public function scopeUnread(Builder $query): Builder
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope pour récupérer les notifications de l'utilisateur connecté
     * (Ce scope n'est pas utilisé dans le Controller, mais est conservé pour référence.)
     */
    public function scopeForUser(Builder $query, $userId): Builder
    {
        return $query->where('user_id', $userId);
    }
}

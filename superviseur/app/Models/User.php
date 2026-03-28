<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
// Assurez-vous d'inclure les traits Fortify si vous les utilisez
// use Laravel\Fortify\TwoFactorAuthenticatable; 

class User extends Authenticatable
{
    // J'ai retiré TwoFactorAuthenticatable si Fortify n'est pas utilisé. Réintégrez-le si nécessaire.
    use HasFactory, Notifiable;

    /**
     * Champs assignables
     */
    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'telephone',
        'role',
        'password',
    ];

    /**
     * Champs cachés
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casts automatiques
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // ================= Relations =================

    /**
     * Relation : L'utilisateur est associé à une entrée dans la table ouvrier
     * (C'est la clé utilisée pour déterminer le rôle de l'utilisateur : agriculteur ou superviseur).
     */
    public function ouvrier()
    {
        // La clé étrangère est user_id dans la table ouvrier.
        return $this->hasOne(Ouvrier::class, 'user_id');
    }

    /**
     * Accesseurs pour la vérification de rôles
     */
    public function isSuperviseur(): bool
    {
        return $this->ouvrier && $this->ouvrier->type === 'superviseur';
    }

    public function isAgriculteur(): bool
    {
        return $this->ouvrier && $this->ouvrier->type === 'agriculteur';
    }
}

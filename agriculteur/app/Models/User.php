<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable; // HasApiTokens supprimé

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'telephone',
        'role',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Un utilisateur peut être un ouvrier
     */
    public function ouvrier()
    {
        return $this->hasOne(Ouvrier::class, 'user_id');
    }
}

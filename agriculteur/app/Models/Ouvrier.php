<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ouvrier extends Model
{
    use HasFactory;

    protected $table = 'ouvrier';

    protected $fillable = [
        'user_id',
        'type', // 'agriculteur' ou 'superviseur'
        'localite_id',
    ];

    // Relation vers l'utilisateur
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relation vers les tâches assignées à l'agriculteur
    public function taches()
    {
        return $this->hasMany(Tache::class, 'agriculteur_id');
    }

    // Relation vers les tâches supervisées par le superviseur
    public function tachesSuperviseur()
    {
        return $this->hasMany(Tache::class, 'superviseur_id');
    }

    // Notifications reçues par cet ouvrier
    public function notificationsRecues()
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    // Relation avec la localité
    public function localite()
    {
        return $this->belongsTo(Localite::class);
    }
}

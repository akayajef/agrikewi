<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Entrepos extends Model
{
    use SoftDeletes;

    protected $table = 'entrepos'; // Nom exact de la table
    protected $fillable = ['nom', 'adresse', 'capacite', 'deleted_at'];

    public $timestamps = true;
}

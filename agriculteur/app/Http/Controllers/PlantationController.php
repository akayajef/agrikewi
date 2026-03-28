<?php

namespace App\Http\Controllers;

use App\Models\Plantation;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PlantationController extends Controller
{
    /**
     * Affiche toutes les plantations affiliées à l'agriculteur connecté
     */
    public function index()
    {
        $ouvrier = Auth::user()->ouvrier;

        if (!$ouvrier || $ouvrier->type !== 'agriculteur') {
            abort(403, "Accès réservé aux agriculteurs.");
        }

        $plantations = Plantation::with(['zone', 'produitAgro'])
            ->where('agriculteur_id', $ouvrier->id)
            ->get();

        return Inertia::render('plantations', [
            'plantations' => $plantations,
        ]);
    }

    /**
     * Détail d'une plantation spécifique
     */
    public function show($id)
    {
        $ouvrier = Auth::user()->ouvrier;

        $plantation = Plantation::with(['zone', 'produitAgro'])
            ->where('id', $id)
            ->where('agriculteur_id', $ouvrier->id)
            ->firstOrFail();

        return Inertia::render('plantations', [
            'plantation' => $plantation,
        ]);
    }
}

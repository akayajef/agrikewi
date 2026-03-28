<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\Plantation;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Vérifie si l'utilisateur est un ouvrier
        $ouvrier = $user->ouvrier;
        if (!$ouvrier) {
            abort(403, "Accès réservé aux ouvriers.");
        }

        // ==============================
        // Notifications non lues
        // ==============================
        $notificationsCount = $ouvrier->notificationsRecues()
            ->whereNull('read_at')
            ->count();

        // ==============================
        // Tâches en cours (non terminées)
        // ==============================
        $tachesCount = match($ouvrier->type) {
            'agriculteur' => $ouvrier->taches()->where('statut', '!=', 'terminee')->count(),
            'superviseur' => $ouvrier->tachesSuperviseur()->where('statut', '!=', 'terminee')->count(),
            default => 0,
        };

        // ==============================
        // Tâches terminées
        // ==============================
        $tachesTermineesCount = match($ouvrier->type) {
            'agriculteur' => $ouvrier->taches()->where('statut', 'terminee')->count(),
            'superviseur' => $ouvrier->tachesSuperviseur()->where('statut', 'terminee')->count(),
            default => 0,
        };

        // ==============================
        // Nombre de plantations
        // ==============================
        $plantationsCount = 0;

        if ($ouvrier->type === 'agriculteur') {
            // L’agriculteur voit uniquement ses plantations
            $plantationsCount = Plantation::where('agriculteur_id', $ouvrier->id)->count();
        } elseif ($ouvrier->type === 'superviseur') {
            // Le superviseur voit toutes les plantations de ses zones
            $plantationsCount = Plantation::whereHas('zone', function ($query) use ($ouvrier) {
                $query->where('superviseur_id', $ouvrier->id);
            })->count();
        }

        // ==============================
        // Stock uniquement des intrants
        // ==============================
        $stocks = Stock::with(['intrant', 'entrepot'])
            ->whereNotNull('produit_intrant_id')
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'produit' => $s->intrant?->nom ?? 'N/A',
                    'quantite' => $s->quantite,
                    'entrepot' => $s->entrepot?->nom ?? 'N/A',
                    'statut_stock' => $s->quantite < 10 ? 'faible' : 'normal',
                ];
            });

        // ==============================
        // Retour vers Inertia
        // ==============================
        return Inertia::render('dashboard', [
            'notificationsCount' => $notificationsCount,
            'tachesCount' => $tachesCount,
            'tachesTermineesCount' => $tachesTermineesCount,
            'plantationsCount' => $plantationsCount,
            'stocks' => $stocks,
            'type' => $ouvrier->type,
        ]);
    }
}

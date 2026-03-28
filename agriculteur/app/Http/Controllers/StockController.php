<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StockController extends Controller
{
    /**
     * Afficher la liste des intrants en stock pour l'agriculteur connecté.
     */
    public function index()
    {
        $user = Auth::user();

        // Vérifie que l'utilisateur est un agriculteur
        if (!$user->ouvrier || $user->ouvrier->type !== 'agriculteur') {
            abort(403, 'Accès refusé.');
        }

        // Récupère uniquement les intrants
        $stocks = Stock::with(['intrant', 'entrepot'])
            ->whereNotNull('produit_intrant_id')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'produit' => $s->intrant?->nom ?? 'N/A',
                'type' => $s->intrant?->type ?? 'N/A', // type de l'intrant
                'quantite' => $s->quantite,
                'unite' => $s->unite_stock,
                'entrepot' => $s->entrepot?->nom ?? 'N/A',
                'statut_stock' => $s->quantite < 10 ? 'faible' : 'normal',
            ]);

        return Inertia::render('stock', [
            'stocks' => $stocks,
        ]);
    }

    /**
     * Retirer une quantité d'intrant du stock.
     */
    public function retirer(Request $request, Stock $stock)
    {
        $user = Auth::user();

        if (!$user->ouvrier || $user->ouvrier->type !== 'agriculteur') {
            abort(403, 'Accès refusé.');
        }

        $request->validate([
            'quantite' => 'required|integer|min:1',
        ]);

        if ($stock->quantite < $request->quantite) {
            return back()->withErrors(['quantite' => 'Quantité insuffisante en stock']);
        }

        $stock->quantite -= $request->quantite;
        $stock->save();

        return back()->with('success', 'Intrant retiré avec succès');
    }
}

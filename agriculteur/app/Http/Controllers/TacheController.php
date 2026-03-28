<?php

namespace App\Http\Controllers;

use App\Models\Tache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TacheController extends Controller
{
    /**
     * Liste les tâches de l'agriculteur connecté
     */
    public function index(): Response
    {
        $user = Auth::user();

        // Récupère l'ID de l'ouvrier lié à l'utilisateur connecté
        $agriculteurId = optional($user->ouvrier)->id;

        if (!$agriculteurId) {
            abort(403, "Vous n'êtes pas autorisé à voir ces tâches.");
        }

        $taches = Tache::where('agriculteur_id', $agriculteurId)
            ->orderBy('date_echeance', 'asc')
            ->get();

        return Inertia::render('taches', [
            'taches' => $taches,
        ]);
    }

    /**
     * Marque une tâche comme terminée via POST
     */
    public function terminer(Request $request, Tache $tache)
    {
        $user = Auth::user();
        $agriculteurId = optional($user->ouvrier)->id;

        if ($tache->agriculteur_id !== $agriculteurId) {
            return redirect()->back()->withErrors([
                'error' => 'Vous n’avez pas la permission de modifier cette tâche.'
            ]);
        }

        $tache->update([
            'statut' => 'terminee',
        ]);

        return redirect()->back()->with('success', 'Tâche marquée comme terminée.');
    }
}

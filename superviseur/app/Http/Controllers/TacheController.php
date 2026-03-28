<?php

namespace App\Http\Controllers;

use App\Models\Tache;
use App\Models\Agriculteur; // Utilisation du modèle Agriculteur (qui représente Ouvrier avec scope)
use App\Models\User; // Nécessaire si vous filtrez sur le rôle dans User
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Throwable; // Ajout pour gestion des erreurs

class TacheController extends Controller
{
    /**
     * Afficher toutes les tâches et les agriculteurs
     */
    public function index()
    {
        $user = Auth::user();
        $query = Tache::with(['agriculteur.user', 'superviseur.user']);

        // Vérification de l'existence d'un enregistrement 'ouvrier' pour l'utilisateur
        // On utilise Agriculteur sans Global Scope car l'utilisateur peut être 'superviseur' ou 'agriculteur'
        $ouvrier = Agriculteur::withoutGlobalScope('agriculteur')
            ->where('user_id', optional($user)->id)
            ->first();

        if ($ouvrier) {
            if ($ouvrier->type === 'superviseur') {
                // Si l'utilisateur est un Superviseur, il ne voit que les tâches qu'il a créées
                $query->where('superviseur_id', $ouvrier->id);
            } elseif ($ouvrier->type === 'agriculteur') {
                // Si l'utilisateur est un Agriculteur, il ne voit que les tâches qui lui sont assignées
                $query->where('agriculteur_id', $ouvrier->id);
            }
        }

        // Récupère toutes les tâches avec les relations et applique le filtre
        $taches = $query->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'description' => $t->description,
                'agriculteur' => [
                    'id' => $t->agriculteur->id,
                    'nom_complet' => ($t->agriculteur->user->prenom ?? '') . ' ' . ($t->agriculteur->user->nom ?? 'Inconnu')
                ],
                'superviseur' => [
                    'id' => $t->superviseur->id,
                    'nom_complet' => ($t->superviseur->user->prenom ?? '') . ' ' . ($t->superviseur->user->nom ?? 'Inconnu')
                ],
                'date_echeance' => $t->date_echeance,
                'statut' => $t->statut,
            ]);

        // Récupère tous les ouvriers de type agriculteur pour le formulaire
        // On utilise ici le modèle Agriculteur qui, grâce à son Global Scope, filtre par 'type=agriculteur'
        $agriculteurs = Agriculteur::with('user')
            ->get()
            ->map(fn($o) => [
                'id' => $o->id, // ID de l'ouvrier (clé à utiliser pour l'assignation de la tâche)
                'nom' => $o->user->nom ?? 'Inconnu',
                'prenom' => $o->user->prenom ?? '',
                'nom_complet' => ($o->user->prenom ?? '') . ' ' . ($o->user->nom ?? 'Inconnu')
            ]);

        return Inertia::render('tache', [
            'taches' => $taches,
            'agriculteurs' => $agriculteurs,
        ]);
    }

    /**
     * Créer une nouvelle tâche
     */
    public function store(Request $request)
    {
        $data = $this->validateTache($request);

        // Récupère l'ID de l'ouvrier/superviseur connecté pour l'assigner à la tâche
        // On utilise Agriculteur::withoutGlobalScope car l'utilisateur est de type 'superviseur'
        $superviseur = Agriculteur::withoutGlobalScope('agriculteur')
            ->where('user_id', Auth::id())
            ->where('type', 'superviseur')
            ->first();

        if (!$superviseur) {
            return back()->with('flash', ['message' => '❌ Vous devez être un superviseur pour créer une tâche.', 'type' => 'error']);
        }

        $superviseurId = $superviseur->id;

        Tache::create([
            'description' => $data['description'],
            'agriculteur_id' => $data['agriculteur_id'],
            'date_echeance' => $data['date_echeance'] ?? null,
            'superviseur_id' => $superviseurId,
            'statut' => 'en_cours',
        ]);

        return redirect()->back()->with('flash', [
            'message' => '✅ Tâche créée avec succès !',
            'type' => 'success',
        ]);
    }

    /**
     * Récupérer une tâche pour l'édition
     */
    public function edit($id)
    {
        $tache = Tache::with(['agriculteur.user'])->findOrFail($id);

        return response()->json([
            'description' => $tache->description,
            'agriculteur_id' => $tache->agriculteur_id,
            'date_echeance' => $tache->date_echeance,
            'statut' => $tache->statut,
        ]);
    }

    /**
     * Mettre à jour une tâche
     */
    public function update(Request $request, $id)
    {
        $tache = Tache::findOrFail($id);
        $data = $this->validateTache($request, true);

        // Récupère l'ID de l'ouvrier/superviseur connecté pour la validation
        $superviseur = Agriculteur::withoutGlobalScope('agriculteur')
            ->where('user_id', Auth::id())
            ->where('type', 'superviseur')
            ->first();

        if (!$superviseur) {
            return back()->with('flash', ['message' => '❌ Vous devez être un superviseur pour modifier une tâche.', 'type' => 'error']);
        }

        $superviseurId = $superviseur->id;

        $tache->update([
            'description' => $data['description'],
            'agriculteur_id' => $data['agriculteur_id'],
            'date_echeance' => $data['date_echeance'] ?? null,
            // On ne met pas à jour le superviseur_id ici si on veut garder l'original
            // Si on veut mettre à jour vers le superviseur actuel: 'superviseur_id' => $superviseurId,
            'statut' => $data['statut'] ?? $tache->statut,
        ]);

        return redirect()->back()->with('flash', [
            'message' => '✅ Tâche mise à jour avec succès !',
            'type' => 'info',
        ]);
    }

    /**
     * Supprimer une tâche
     */
    public function destroy($id)
    {
        $tache = Tache::findOrFail($id);

        // Optionnel: Ajouter une vérification que seul le superviseur créateur peut supprimer
        // if ($tache->superviseur_id !== optional(Auth::user()->ouvrier)->id) { ... }

        $tache->delete();

        return redirect()->back()->with('flash', [
            'message' => '🗑️ Tâche supprimée avec succès !',
            'type' => 'danger',
        ]);
    }

    /**
     * Validation des données
     */
    private function validateTache(Request $request, bool $includeStatus = false): array
    {
        $rules = [
            'description' => 'required|string|max:255',
            'agriculteur_id' => 'required|exists:ouvrier,id',
            'date_echeance' => 'nullable|date',
        ];

        if ($includeStatus) {
            $rules['statut'] = 'required|in:en_cours,terminee,retard';
        }

        return $request->validate($rules);
    }
}

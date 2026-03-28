<?php

namespace App\Http\Controllers;

use App\Models\Plantation;
use App\Models\ZoneDeProduction;
use App\Models\Ouvrier;
// Assurez-vous d'avoir un modèle Agriculteur qui fait référence à la table 'ouvrier'
use App\Models\Agriculteur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Database\Eloquent\Builder;

class PlantationController extends Controller
{
    /**
     * Affiche la liste des plantations filtrées selon le rôle de l'utilisateur.
     */
    public function index()
    {
        $user = Auth::user();
        $query = Plantation::with([
            'zone:id,nom,superviseur_id',
            'agriculteur.user:id,nom,prenom'
        ]);

        $isAdmin = optional($user)->role === 'admin';
        $currentOuvrier = optional($user)->ouvrier;
        $currentOuvrierId = optional($currentOuvrier)->id;
        $roleType = optional($currentOuvrier)->type;

        // --- 1. FILTRAGE DE LA REQUÊTE ---
        if (!$isAdmin) {
            if ($roleType === 'superviseur') {
                // Filtre : Plantations sans zone OU Plantations dans ses zones supervisées
                $query->where(function (Builder $q) use ($currentOuvrierId) {
                    $q->whereNull('zone_id')
                        ->orWhereHas('zone', function (Builder $sq) use ($currentOuvrierId) {
                            $sq->where('superviseur_id', $currentOuvrierId);
                        });
                });
            } elseif ($roleType === 'agriculteur') {
                // Filtre : Plantations qu'il a plantées
                $query->where('agriculteur_id', $currentOuvrierId);
            } else {
                // Empêche de voir toutes les plantations si le rôle est inconnu
                $query->whereRaw('1 = 0');
            }
        }

        $plantations = $query->orderBy('nom')->get();

        $plantationsProps = $plantations->map(fn($p) => [
            'id' => $p->id,
            'nom' => $p->nom,
            // IDs pour le formulaire (important pour l'édition)
            'zone_id' => $p->zone_id,
            'agriculteur_id' => $p->agriculteur_id,

            // Affichage des noms
            'zone' => $p->zone?->nom ?? 'Aucune zone',
            'agriculteur' => $p->agriculteur?->user?->nom && $p->agriculteur?->user?->prenom
                ? $p->agriculteur->user->nom . ' ' . $p->agriculteur->user->prenom
                : 'Aucun agriculteur',

            'type_sol' => $p->type_sol ?? '—',
            'perimetre' => $p->perimetre ?? '—',
            'date_plantation' => $p->date_plantation ?? '—',
        ]);

        // Pour les formulaires
        $zonesList = ZoneDeProduction::select('id', 'nom')->orderBy('nom')->get();

        $agriculteursList = Ouvrier::where('type', 'agriculteur')->with('user:id,nom,prenom')->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'nom' => $a->user ? $a->user->nom . ' ' . $a->user->prenom : 'Utilisateur inconnu',
            ]);

        $canWrite = $isAdmin || $roleType === 'superviseur';

        return Inertia::render('plantation', [
            'plantations' => $plantationsProps,
            'zones' => $zonesList,
            'agriculteurs' => $agriculteursList,
            'canWrite' => $canWrite,
            'flash' => session('flash')
        ]);
    }

    /**
     * Gère la création d'une plantation.
     */
    public function store(Request $request)
    {
        $this->authorizeWrite(); // Vérification d'autorisation centralisée

        $validated = $this->validatePlantation($request);
        Plantation::create($validated);

        return redirect()->route('plantation.index')->with('flash', [
            'message' => '✅ Plantation créée avec succès.',
            'type' => 'success',
        ]);
    }

    /**
     * Gère la modification d'une plantation.
     */
    public function update(Request $request, Plantation $plantation)
    {
        // ✅ Chargement de la relation AVANT la vérification d'autorisation (nécessaire pour accéder à zone->superviseur_id)
        $plantation->loadMissing('zone');

        $this->authorizeWrite($plantation);

        $validated = $this->validatePlantation($request);
        $plantation->update($validated);

        return redirect()->route('plantation.index')->with('flash', [
            'message' => '✏️ Plantation mise à jour avec succès.',
            'type' => 'info',
        ]);
    }

    /**
     * Gère la suppression d'une plantation.
     */
    public function destroy(Plantation $plantation)
    {
        // ✅ Chargement de la relation AVANT la vérification d'autorisation
        $plantation->loadMissing('zone');

        $this->authorizeWrite($plantation);

        $plantation->delete();

        return redirect()->back()->with('flash', [
            'message' => '🗑️ Plantation supprimée avec succès.',
            'type' => 'danger',
        ]);
    }

    /**
     * Logique d'autorisation centralisée pour la gestion (création/modification/suppression).
     *
     * @param Plantation|null $plantation La plantation à modifier/supprimer. Null pour la création.
     */
    private function authorizeWrite(Plantation $plantation = null): void
    {
        $user = Auth::user();
        $isAdmin = optional($user)->role === 'admin';
        $isSuperviseur = optional($user->ouvrier)->type === 'superviseur';
        $currentOuvrierId = optional($user->ouvrier)->id;

        // --- 1. VÉRIFICATION D'AUTORISATION GÉNÉRALE ---
        if (!$isAdmin && !$isSuperviseur) {
            abort(403, 'Seul un superviseur ou un administrateur peut gérer les plantations.');
        }

        // --- 2. VÉRIFICATION SPÉCIFIQUE À LA MODIFICATION/SUPPRESSION ---
        if ($isSuperviseur && $plantation) {

            // Les superviseurs peuvent modifier/supprimer les plantations non assignées à une zone
            if (is_null($plantation->zone_id)) {
                return;
            }

            // Si la plantation a une zone, le superviseur doit être le superviseur de CETTE zone.
            if ($plantation->zone?->superviseur_id !== $currentOuvrierId) {
                abort(403, 'Vous ne pouvez modifier/supprimer que les plantations de vos zones assignées.');
            }
        }
        // Si admin, ou si superviseur et plantation est null (création), ou si superviseur et l'autorisation spécifique est passée, on continue.
    }

    /**
     * Valide les données de la plantation.
     */
    private function validatePlantation(Request $request): array
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'zone_id' => 'nullable|exists:zone_de_production,id',
            // On vérifie que c'est un ouvrier qui existe
            'agriculteur_id' => 'nullable|integer|exists:ouvrier,id',
            'type_sol' => 'nullable|string|max:255',
            'perimetre' => 'nullable|numeric|min:0',
            'date_plantation' => 'nullable|date',
        ]);

        // Convertir les chaînes vides ou 'null' en valeur null PHP pour la DB
        $validated['zone_id'] = empty($validated['zone_id']) ? null : $validated['zone_id'];
        $validated['agriculteur_id'] = empty($validated['agriculteur_id']) ? null : $validated['agriculteur_id'];
        $validated['perimetre'] = empty($validated['perimetre']) ? null : $validated['perimetre'];
        $validated['date_plantation'] = empty($validated['date_plantation']) ? null : $validated['date_plantation'];

        return $validated;
    }
}

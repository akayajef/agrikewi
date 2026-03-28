<?php

namespace App\Http\Controllers;

use App\Models\ZoneDeProduction;
use App\Models\Localite;
use App\Models\Agriculteur; // Utilisation de l'alias pour Ouvrier, ou Ouvrier directement
use App\Models\Ouvrier; // Garder Ouvrier car il contient la liste des superviseurs
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Database\Eloquent\Builder; // Ajout pour le typage des query builders

class ZoneDeProductionController extends Controller
{
    /**
     * Afficher la liste des zones avec leurs localités et superviseurs.
     */
    public function index()
    {
        $user = Auth::user();
        $query = ZoneDeProduction::with(['localite', 'superviseur.user']);

        // 1. Détermination du rôle et application du filtre
        $isSuperviseur = false;
        $isAdmin = optional($user)->role === 'admin';
        $currentOuvrierId = null;

        if (!$isAdmin && $user) {
            // Utiliser Ouvrier sans Global Scope pour récupérer l'ID de l'ouvrier connecté, quel que soit son type
            $ouvrier = Ouvrier::where('user_id', $user->id)->first();

            if ($ouvrier) {
                $currentOuvrierId = $ouvrier->id;
                if ($ouvrier->type === 'superviseur') {
                    $isSuperviseur = true;
                }
            }
        }

        // Si l'utilisateur est un superviseur, il ne voit que ses zones.
        if ($isSuperviseur) {
            $query->where('superviseur_id', $currentOuvrierId);
        } elseif (!$isAdmin) {
            // Si ce n'est ni un Admin ni un Superviseur (ou pas d'ouvrier associé), 
            // on filtre pour n'afficher aucune zone.
            // On utilise where('id', null) qui est une condition toujours fausse.
            $query->where('id', null);
        }

        // Récupération des zones après application du filtre
        $zones = $query->get();

        $localites = Localite::all();

        // Récupérer uniquement les ouvriers de type 'superviseur' (pour le formulaire, non filtré)
        $superviseurs = Ouvrier::where('type', 'superviseur')->with('user')->get()
            ->map(fn($ouvrier) => [
                'id' => $ouvrier->id, // ID de l'ouvrier (clé étrangère dans zone_de_production)
                'nom_complet' => $ouvrier->user->prenom . ' ' . $ouvrier->user->nom,
            ]);

        return Inertia::render('zone', [
            'zones' => $zones->map(fn($z) => [
                'id' => $z->id,
                'nom' => $z->nom,
                'localite' => $z->localite?->nom ?? 'Non défini',
                'superviseur' => $z->superviseur?->user
                    ? $z->superviseur->user->prenom . ' ' . $z->superviseur->user->nom
                    : 'Non assigné',
                'localite_id' => $z->localite_id,
                'superviseur_id' => $z->superviseur_id,
            ]),
            'localites' => $localites->map(fn($l) => [
                'id' => $l->id,
                'nom' => $l->nom,
            ]),
            'superviseurs' => $superviseurs,
        ]);
    }

    /**
     * Afficher les détails d'une zone spécifique (Show).
     */
    public function show(ZoneDeProduction $zone)
    {
        $user = Auth::user();
        $currentOuvrierId = optional($user->ouvrier)->id;

        // Autorisation de lecture: Seul le superviseur assigné ou un administrateur peut voir les détails
        if (optional($user)->role !== 'admin' && $zone->superviseur_id !== $currentOuvrierId) {
            abort(403, 'Vous n’êtes pas autorisé à consulter cette zone.');
        }

        $zone->load(['localite', 'superviseur.user', 'plantations']);
        return response()->json($zone);
    }

    /**
     * Récupérer les données d'une zone pour l'édition (Edit/API).
     */
    public function edit(ZoneDeProduction $zone)
    {
        $user = Auth::user();
        $currentOuvrierId = optional($user->ouvrier)->id;

        // Autorisation de lecture: Seul le superviseur assigné ou un administrateur peut accéder à l'édition
        if (optional($user)->role !== 'admin' && $zone->superviseur_id !== $currentOuvrierId) {
            abort(403, 'Vous n’êtes pas autorisé à modifier cette zone.');
        }

        // Charge les relations nécessaires pour l'édition
        $zone->load(['localite', 'superviseur.user']);
        return response()->json($zone);
    }

    /**
     * Créer une nouvelle zone.
     */
    public function store(Request $request)
    {
        // L'utilisateur connecté doit être un superviseur ou un admin pour créer
        $currentUser = Auth::user();
        $currentOuvrier = optional($currentUser->ouvrier);

        // Si l'utilisateur n'est pas un admin ET n'est pas un superviseur
        if ($currentUser->role !== 'admin' && $currentOuvrier->type !== 'superviseur') {
            abort(403, 'Seul un superviseur ou un administrateur peut créer une zone.');
        }

        $data = $request->validate([
            'nom' => 'required|string|max:100',
            'localite_id' => 'required|exists:localite,id',
            // Validation plus stricte : doit exister dans 'ouvrier' ET être de type 'superviseur'
            'superviseur_id' => [
                'nullable',
                Rule::exists('ouvrier', 'id')->where(function (Builder $query) {
                    return $query->where('type', 'superviseur');
                }),
            ],
        ]);

        // Si l'utilisateur est superviseur et n'a pas spécifié de superviseur, on utilise son ID d'ouvrier.
        $superviseurIdToAssign = $data['superviseur_id'] ?? $currentOuvrier->id;

        // Vérification de sécurité supplémentaire : s'assurer qu'un ID valide est présent
        if (!$superviseurIdToAssign) {
            return redirect()->back()->withErrors(['superviseur_id' => 'Le superviseur est requis.'])
                ->withInput();
        }

        ZoneDeProduction::create([
            'nom' => $data['nom'],
            'localite_id' => $data['localite_id'],
            'superviseur_id' => $superviseurIdToAssign,
        ]);

        return redirect()->back()->with('flash', [
            'message' => '✅ Zone créée avec succès !',
            'type' => 'success',
        ]);
    }

    /**
     * Mettre à jour une zone existante.
     */
    public function update(Request $request, ZoneDeProduction $zone)
    {
        $currentUser = Auth::user();
        $currentOuvrierId = optional($currentUser->ouvrier)->id;

        // Autorisation: Seul le superviseur assigné OU un administrateur peut modifier
        if ($zone->superviseur_id !== $currentOuvrierId && optional($currentUser)->role !== 'admin') {
            abort(403, 'Vous n’êtes pas autorisé à modifier cette zone.');
        }

        $data = $request->validate([
            'nom' => 'required|string|max:100',
            'localite_id' => 'required|exists:localite,id',
            // Validation plus stricte : doit exister dans 'ouvrier' ET être de type 'superviseur'
            'superviseur_id' => [
                'nullable',
                Rule::exists('ouvrier', 'id')->where(function (Builder $query) {
                    return $query->where('type', 'superviseur');
                }),
            ],
        ]);

        $zone->update([
            'nom' => $data['nom'],
            'localite_id' => $data['localite_id'],
            'superviseur_id' => $data['superviseur_id'] ?? $zone->superviseur_id, // Permet de changer le superviseur
        ]);

        return redirect()->back()->with('flash', [
            'message' => '✅ Zone mise à jour avec succès !',
            'type' => 'info',
        ]);
    }

    /**
     * Supprimer une zone.
     */
    public function destroy(ZoneDeProduction $zone)
    {
        $currentUser = Auth::user();
        $currentOuvrierId = optional($currentUser->ouvrier)->id;

        // Autorisation: Seul le superviseur assigné OU un administrateur peut supprimer
        if ($zone->superviseur_id !== $currentOuvrierId && optional($currentUser)->role !== 'admin') {
            abort(403, 'Vous n’êtes pas autorisé à effectuer cette action.');
        }

        $zone->delete();

        return redirect()->back()->with('flash', [
            'message' => '🗑️ Zone supprimée avec succès !',
            'type' => 'danger',
        ]);
    }
}

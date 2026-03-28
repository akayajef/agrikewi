<?php

namespace App\Http\Controllers;

use App\Models\Agriculteur;
use App\Models\Localite;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\AgriculteurCreated;
use Throwable;

class AgriculteurController extends Controller
{
    /**
     * Affiche la liste des agriculteurs.
     * FILTRAGE: Si l'utilisateur est un superviseur, il ne voit que les agriculteurs qu'il a créés.
     */
    public function index()
    {
        // 1. Détermine l'utilisateur connecté
        $user = Auth::user();

        // Démarre la requête. Le Global Scope du modèle Agriculteur s'occupe déjà du where('type', 'agriculteur')
        $query = Agriculteur::with(['user', 'localite']);

        // 2. Applique le filtre si l'utilisateur est un superviseur
        if ($user && $user->role === 'ouvrier') {

            // CORRECTION: On utilise withoutGlobalScope('agriculteur') pour forcer la requête à chercher
            // le type réel de l'utilisateur dans la table 'ouvrier', sans le filtre 'type = agriculteur'.
            $estSuperviseur = Agriculteur::withoutGlobalScope('agriculteur')
                ->where('user_id', $user->id)
                ->where('type', 'superviseur')
                ->exists();

            if ($estSuperviseur) {
                // Si c'est un superviseur, on filtre par les agriculteurs qu'il a créés
                // Cette colonne doit être renseignée dans la méthode store()
                $query->where('created_by_user_id', $user->id);
            }
        }

        // Exécute la requête paginée
        $agriculteurs = $query->paginate(10);

        $localites = Localite::all();

        return Inertia::render('agriculteur', [
            'agriculteurs' => $agriculteurs->through(fn($a) => [
                'id' => $a->user_id,
                'nom' => $a->user->nom,
                'prenom' => $a->user->prenom,
                'email' => $a->user->email,
                'telephone' => $a->user->telephone,
                'localite' => $a->localite->nom ?? 'Non définie',
            ]),
            'localites' => $localites,
        ]);
    }

    /**
     * Enregistre un nouvel agriculteur et envoie un email avec les identifiants depuis l'adresse du superviseur.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'telephone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8',
            'localite_id' => 'required|exists:localite,id',
        ]);

        try {
            DB::beginTransaction();

            // Récupère l'utilisateur connecté (le superviseur)
            $superviseur = Auth::user();
            $creatorId = $superviseur->id;

            // Sauvegarde le mot de passe en clair pour l'email (temporairement)
            $plainPassword = $validated['password'];

            // 1. Création du compte utilisateur dans la table 'users'
            $user = User::create([
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'email' => $validated['email'],
                'telephone' => $validated['telephone'],
                'role' => 'ouvrier',
                'password' => bcrypt($plainPassword),
            ]);

            // 2. Création de l'ouvrier/Agriculteur dans la table 'ouvrier'
            Agriculteur::create([
                'user_id' => $user->id,
                'type' => 'agriculteur',
                'localite_id' => $validated['localite_id'],
                'created_by_user_id' => $creatorId,
            ]);

            // 3. Envoi de l'email avec les identifiants depuis l'adresse du superviseur
            try {
                Mail::to($user->email)->send(new AgriculteurCreated($user, $plainPassword, $superviseur));
            } catch (\Exception $e) {
                // Log l'erreur mais ne bloque pas la création
                \Log::error('Erreur envoi email agriculteur: ' . $e->getMessage());
            }

            DB::commit();

            return redirect()
                ->route('agriculteur.index')
                ->with('success', '✅ Agriculteur ajouté avec succès. Un email avec les identifiants a été envoyé à ' . $user->email . ' depuis votre adresse.');
        } catch (Throwable $e) {
            DB::rollBack();
            \Log::error('Erreur création agriculteur: ' . $e->getMessage());
            return redirect()
                ->back()
                ->with('error', '❌ Erreur lors de l\'ajout de l\'agriculteur. Veuillez vérifier les informations.');
        }
    }

    /**
     * Met à jour un agriculteur existant.
     */
    public function update(Request $request, $id)
    {
        // Récupération de l'objet Agriculteur via l'user_id
        $agri = Agriculteur::with('user')->where('user_id', $id)->firstOrFail();

        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            // Le 3e argument de unique permet d'ignorer l'utilisateur actuel lors de la vérification de l'unicité
            'email' => 'required|email|unique:users,email,' . $agri->user_id,
            'telephone' => 'nullable|string|max:20',
            'localite_id' => 'required|exists:localite,id',
        ]);

        try {
            DB::beginTransaction();

            // Mise à jour des informations utilisateur dans 'users'
            $agri->user->update([
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'email' => $validated['email'],
                'telephone' => $validated['telephone'],
            ]);

            // Mise à jour de la localité dans 'ouvrier'
            $agri->update([
                'localite_id' => $validated['localite_id'],
            ]);

            DB::commit();

            return redirect()
                ->route('agriculteur.index')
                ->with('success', '✅ Agriculteur mis à jour avec succès.');
        } catch (Throwable $e) {
            DB::rollBack();
            return redirect()
                ->back()
                ->with('error', '❌ Erreur lors de la mise à jour de l\'agriculteur. Veuillez réessayer.');
        }
    }

    /**
     * Supprime un agriculteur et ses relations associées.
     */
    public function destroy($id)
    {
        // On récupère le modèle Agriculteur (ouvrier)
        // NOTE: Le Global Scope s'applique ici, il est donc nécessaire que l'agriculteur soit bien de type 'agriculteur'
        $agri = Agriculteur::where('user_id', $id)->firstOrFail();

        try {
            DB::beginTransaction();

            // RAPPEL DB: La FK ouvrier.user_id référence users.id avec ON DELETE CASCADE.
            $user = $agri->user;

            if ($user) {
                // Cette suppression CASCADE la suppression de l'entrée dans la table 'ouvrier'
                $user->delete();
            }

            DB::commit();

            return redirect()
                ->route('agriculteur.index')
                ->with('success', '🗑️ Agriculteur supprimé avec succès.');
        } catch (Throwable $e) {
            DB::rollBack();
            return redirect()
                ->back()
                ->with('error', '❌ Erreur lors de la suppression de l\'agriculteur. Veuillez réessayer.');
        }
    }
}

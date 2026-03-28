<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Ouvrier;
use App\Models\Localite;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    // Numéro de la sandbox Twilio
    private $sandboxNumber = '+14155238886';
    private $sandboxCode = 'join grandmother-question';

    /**
     * Affiche le formulaire d'inscription superviseur.
     */
    public function createSuperviseur(): Response
    {
        $localites = Localite::all();
        return Inertia::render('auth/register', compact('localites'));
    }

    /**
     * Enregistre un superviseur avec possibilité de créer une nouvelle localité.
     */
    public function storeSuperviseur(Request $request): RedirectResponse
    {
        // Validation de base
        $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'email' => 'required|string|email|max:150|unique:users',
            'telephone' => 'required|string|max:20|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            // ✨ NOUVEAU : Validation conditionnelle pour localité
            'localite_id' => 'nullable|exists:localite,id',
            'nouvelle_localite' => 'nullable|string|max:100',
        ]);

        // ✅ VALIDATION : Au moins un des deux champs localité doit être rempli
        if (empty($request->localite_id) && empty($request->nouvelle_localite)) {
            return back()->withErrors([
                'localite_id' => 'Veuillez sélectionner ou créer une localité.'
            ])->withInput();
        }

        // ✅ VALIDATION : Les deux champs ne peuvent pas être remplis en même temps
        if (!empty($request->localite_id) && !empty($request->nouvelle_localite)) {
            return back()->withErrors([
                'localite_id' => 'Vous ne pouvez pas sélectionner et créer une localité en même temps.'
            ])->withInput();
        }

        DB::beginTransaction();

        try {
            // 🆕 GESTION DE LA LOCALITÉ
            $localiteId = $request->localite_id;

            // Si une nouvelle localité est fournie, la créer
            if (!empty($request->nouvelle_localite)) {
                // Vérifier si la localité existe déjà (insensible à la casse)
                $localiteExistante = Localite::whereRaw('LOWER(nom) = ?', [
                    strtolower(trim($request->nouvelle_localite))
                ])->first();

                if ($localiteExistante) {
                    // Utiliser la localité existante
                    $localiteId = $localiteExistante->id;
                } else {
                    // Créer la nouvelle localité
                    $nouvelleLocalite = Localite::create([
                        'nom' => ucfirst(trim($request->nouvelle_localite))
                    ]);
                    $localiteId = $nouvelleLocalite->id;
                }
            }

            // Création de l'utilisateur (Superviseur)
            $user = User::create([
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'email' => $request->email,
                'telephone' => $request->telephone,
                'role' => 'ouvrier',
                'password' => Hash::make($request->password),
            ]);

            // Création de l'entrée Ouvrier
            Ouvrier::create([
                'user_id' => $user->id,
                'type' => 'superviseur',
                'localite_id' => $localiteId,
            ]);

            DB::commit();

            event(new Registered($user));

            // Connecter l'utilisateur
            Auth::login($user);

            // Redirection vers l'onboarding WhatsApp
            return redirect()->route('superviseur.onboarding', ['id' => $user->id]);
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors([
                'error' => 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.'
            ])->withInput();
        }
    }

    /**
     * Affiche l'écran d'onboarding WhatsApp.
     */
    public function onboardingWhatsApp($id): Response
    {
        $superviseur = User::findOrFail($id);

        // Si l'utilisateur est déjà connecté à WhatsApp, redirection
        if (!is_null($superviseur->whatsapp_connected_at)) {
            return Inertia::location('/dashboard');
        }

        return Inertia::render('OnboardingWhatsApp', [
            'superviseur' => [
                'id' => $superviseur->id,
                'nom' => $superviseur->nom,
                'prenom' => $superviseur->prenom,
                'telephone' => $superviseur->telephone,
            ],
            'sandboxNumber' => $this->sandboxNumber,
            'sandboxCode' => $this->sandboxCode,
        ]);
    }

    /**
     * Vérifie si le superviseur est connecté à WhatsApp (polling frontend).
     */
    public function confirmWhatsApp($id): \Illuminate\Http\JsonResponse
    {
        $superviseur = User::findOrFail($id);

        // Vérifie si la connexion WhatsApp est établie
        $connected = !is_null($superviseur->whatsapp_connected_at);

        return response()->json([
            'connected' => $connected,
        ]);
    }

    /**
     * Gère le webhook de Twilio, marque l'utilisateur comme connecté.
     */
    public function webhook(Request $request): \Illuminate\Http\Response
    {
        $from = $request->input('From');
        $body = trim($request->input('Body'));

        // Nettoyer le numéro de téléphone
        $cleanedPhoneNumber = str_replace('whatsapp:', '', $from);

        // Chercher l'utilisateur par numéro de téléphone
        $user = User::where('telephone', $cleanedPhoneNumber)->first();

        // Normaliser le code sandbox et le message
        $sandboxCodeNormalized = strtolower($this->sandboxCode);
        $bodyNormalized = strtolower($body);

        // Vérifier si le message correspond au code sandbox
        if ($user && $bodyNormalized === $sandboxCodeNormalized) {
            // Vérifier que c'est un superviseur et qu'il n'est pas déjà connecté
            if ($user->role === 'ouvrier' && is_null($user->whatsapp_connected_at)) {
                // Marquer comme connecté
                $user->whatsapp_connected_at = now();
                $user->save();
            }
        }

        // Réponse vide pour Twilio
        return response()->make('', 204);
    }
}

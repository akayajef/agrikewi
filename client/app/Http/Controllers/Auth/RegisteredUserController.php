<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Client;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Affiche la page d'inscription client.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Gère l'inscription du client.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'email' => 'required|string|email|max:150|unique:users,email',
            'telephone' => 'required|string|max:20',
            'adresse_livraison' => 'nullable|string|max:255',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Création de l'utilisateur
        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'telephone' => $request->telephone,
            'role' => 'client',
            'password' => Hash::make($request->password),
        ]);

        // Création du profil client
        Client::create([
            'user_id' => $user->id,
            'adresse_livraison' => $request->adresse_livraison ?? '',
        ]);

        event(new Registered($user));

        Auth::login($user);

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }
}

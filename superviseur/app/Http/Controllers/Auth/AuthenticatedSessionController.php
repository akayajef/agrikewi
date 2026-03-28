<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Affiche la page de connexion.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Gère la tentative de connexion.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Récupère l'utilisateur validé par Fortify
        $user = $request->validateCredentials();

        // Vérifie si l'utilisateur est un superviseur
        if (! $user->ouvrier || $user->ouvrier->type !== 'superviseur') {
            return back()->withErrors([
                'email' => 'Vous n\'êtes pas autorisé à vous connecter ici.',
            ])->onlyInput('email');
        }

        // Connexion normale
        Auth::login($user, $request->boolean('remember'));

        // Régénère la session
        $request->session()->regenerate();

        // Redirection vers le dashboard
        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Déconnexion de l'utilisateur.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}

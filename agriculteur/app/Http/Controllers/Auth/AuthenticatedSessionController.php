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
     * Gère une requête d'authentification.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Récupère l'utilisateur validé
        $user = $request->validateCredentials();

        // Vérifie si l'utilisateur est un agriculteur
        $ouvrier = $user->ouvrier ?? null;
        if (!$ouvrier || $ouvrier->type !== 'agriculteur') {
            return redirect()->back()->withErrors([
                'email' => 'Seuls les agriculteurs sont autorisés à se connecter.',
            ]);
        }

        // Connexion normale
        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Déconnecte l'utilisateur.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}

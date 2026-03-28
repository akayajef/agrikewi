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
use Laravel\Fortify\Features;

class AuthenticatedSessionController extends Controller
{
    /**
     * Affiche la page de connexion client.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Gère la connexion client.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Récupération de l'utilisateur à partir des identifiants
        $user = $request->validateCredentials();

        // Vérification que l'utilisateur est un client
        if ($user->role !== 'client') {
            return back()->withErrors([
                'email' => 'Seuls les clients peuvent se connecter ici.',
            ]);
        }

        // Vérification de la double authentification
        if (Features::enabled(Features::twoFactorAuthentication()) && $user->hasEnabledTwoFactorAuthentication()) {
            $request->session()->put([
                'login.id' => $user->getKey(),
                'login.remember' => $request->boolean('remember'),
            ]);

            return to_route('two-factor.login');
        }

        // Connexion de l'utilisateur
        Auth::login($user, $request->boolean('remember'));

        // Régénération de la session
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

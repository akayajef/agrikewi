<?php

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AgriculteurController;
use App\Http\Controllers\TacheController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\PlantationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ZoneDeProductionController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\CalculateurController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ==========================================
// Redirection vers la page de login
// ==========================================
Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

// ==========================================
// Routes publiques d'inscription / onboarding
// ==========================================
Route::get('/superviseur/create', [RegisteredUserController::class, 'createSuperviseur'])
    ->name('superviseur.create');
Route::post('/superviseur/store', [RegisteredUserController::class, 'storeSuperviseur'])
    ->name('superviseur.store');

// ✅ AJOUT : Page d'onboarding WhatsApp
Route::get('/superviseur/{id}/onboarding-whatsapp', [RegisteredUserController::class, 'onboardingWhatsApp'])
    ->name('superviseur.onboarding');

// ✅ AJOUT : Vérification de la connexion WhatsApp (appelée par le frontend)
Route::get('/superviseur/{id}/confirm-whatsapp', [RegisteredUserController::class, 'confirmWhatsApp'])
    ->name('superviseur.confirm');

// Webhook Twilio pour recevoir les messages WhatsApp
Route::post('/webhook/twilio', [RegisteredUserController::class, 'webhook'])
    ->name('twilio.webhook');

Route::middleware(['auth', 'verified'])->group(function () {

    // ==========================================
    // Dashboard
    // ==========================================
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ==========================================
    // Gestion des agriculteurs
    // ==========================================
    Route::get('/agriculteur', [AgriculteurController::class, 'index'])->name('agriculteur.index');
    Route::post('/agriculteur', [AgriculteurController::class, 'store'])->name('agriculteur.store');
    Route::put('/agriculteur/{agriculteur}', [AgriculteurController::class, 'update'])->name('agriculteur.update');
    Route::delete('/agriculteur/{agriculteur}', [AgriculteurController::class, 'destroy'])->name('agriculteur.destroy');

    // ==========================================
    // Gestion des tâches
    // ==========================================
    Route::get('/tache', [TacheController::class, 'index'])->name('tache.index');
    Route::post('/tache', [TacheController::class, 'store'])->name('tache.store');
    Route::put('/tache/{tache}', [TacheController::class, 'update'])->name('tache.update');
    Route::delete('/tache/{tache}', [TacheController::class, 'destroy'])->name('tache.destroy');
    Route::put('/tache/{tache}/statut', [TacheController::class, 'updateStatut'])->name('tache.updateStatut');
    Route::post('/tache/{tache}/progression', [TacheController::class, 'updateProgression'])->name('tache.updateProgression');

    // ==========================================
    // Gestion des articles (blog/actualités)
    // ==========================================
    Route::get('/article', [ArticleController::class, 'index'])->name('article.index');
    Route::post('/article', [ArticleController::class, 'store'])->name('article.store');
    Route::put('/article/{article}', [ArticleController::class, 'update'])->name('article.update');
    Route::delete('/article/{article}', [ArticleController::class, 'destroy'])->name('article.destroy');

    // ==========================================
    // Gestion des stocks
    // ==========================================
    Route::get('/stock', [StockController::class, 'index'])->name('stock.index');
    Route::post('/stock', [StockController::class, 'store'])->name('stock.store');
    Route::put('/stock/{stock}', [StockController::class, 'update'])->name('stock.update');
    Route::delete('/stock/{stock}', [StockController::class, 'destroy'])->name('stock.destroy');

    // ==========================================
    // Gestion des notifications
    // ==========================================
    Route::get('/notification', [NotificationController::class, 'index'])->name('notification.index');
    Route::post('/notification', [NotificationController::class, 'store'])->name('notification.store');
    Route::put('/notification/{notification}/lu', [NotificationController::class, 'markAsRead'])->name('notification.markAsRead');

    // ==========================================
    // Gestion des plantations
    // ==========================================
    Route::get('/plantation', [PlantationController::class, 'index'])->name('plantation.index');
    Route::post('/plantation', [PlantationController::class, 'store'])->name('plantation.store');

    // ✅ CORRECTION FINALE : Utiliser POST et PATCH pour l'update
    Route::match(['post', 'patch'], '/plantation/{plantation}', [PlantationController::class, 'update'])->name('plantation.update');

    Route::delete('/plantation/{plantation}', [PlantationController::class, 'destroy'])->name('plantation.destroy');

    // ==========================================
    // Gestion des commandes et paiements
    // ==========================================
    Route::prefix('commandes')->group(function () {
        Route::get('/', [CommandeController::class, 'index'])->name('commandes.index');
        Route::put('/{id}/statut', [CommandeController::class, 'updateStatutCommande'])->name('commandes.updateStatut');
        Route::put('/paiement/{id}/statut', [CommandeController::class, 'updateStatutPaiement'])->name('commandes.paiement.updateStatut');
    });

    // ==========================================
    // Zones de production
    // ==========================================
    Route::prefix('zone')->group(function () {
        Route::get('/', [ZoneDeProductionController::class, 'index'])->name('zone.index');
        Route::get('/create', [ZoneDeProductionController::class, 'create'])->name('zone.create');
        Route::post('/', [ZoneDeProductionController::class, 'store'])->name('zone.store');
        Route::get('/{zone}/edit', [ZoneDeProductionController::class, 'edit'])->name('zone.edit');
        Route::put('/{zone}', [ZoneDeProductionController::class, 'update'])->name('zone.update');
        Route::delete('/{zone}', [ZoneDeProductionController::class, 'destroy'])->name('zone.destroy');
    });

    Route::prefix('calculateurs')->group(function () {
        Route::get('/', [CalculateurController::class, 'index'])->name('calculateurs.index');
        Route::post('/irrigation', [CalculateurController::class, 'calculerIrrigation'])->name('calculateurs.irrigation');
        Route::post('/engrais', [CalculateurController::class, 'calculerEngrais'])->name('calculateurs.engrais');
        Route::post('/surface', [CalculateurController::class, 'calculerSurface'])->name('calculateurs.surface');
        Route::post('/cout', [CalculateurController::class, 'calculerCout'])->name('calculateurs.cout');
        Route::delete('/{id}', [CalculateurController::class, 'destroy'])->name('calculateurs.destroy');
    });
});

// ==========================================
// Inclusion des autres fichiers de routes
// ==========================================
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CatalogueController;
use App\Http\Controllers\HistoriqueController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\DashboardController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Routes du Tableau de Bord
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    // ✨ NOUVELLE ROUTE : Pour marquer une notification comme lue.
    Route::post('/notifications/mark-as-read', [DashboardController::class, 'markAsRead'])->name('notifications.markAsRead');

    // Route catalogue pour les clients
    Route::get('/catalogue', [CatalogueController::class, 'index'])->name('catalogue');

    // Routes de Commande et Panier
    Route::get('/commande', [CommandeController::class, 'index'])->name('commande.index');
    Route::post('/commande', [CommandeController::class, 'store'])->name('commande.store');
    Route::delete('/commande/panier/{id}', [CommandeController::class, 'supprimerDuPanier'])->name('commande.panier.supprimer');
    Route::post('/panier/ajouter', [CommandeController::class, 'ajouterAuPanier'])->name('panier.ajouter');
    Route::get('/test-whatsapp', [CommandeController::class, 'testWhatsapp']);

    // Routes d'Historique
    Route::get('/historique', [HistoriqueController::class, 'index'])->name('historique.index');
    Route::post('/historique/ajouter/{commande}/{statut}', [HistoriqueController::class, 'ajouter'])->name('historique.ajouter');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

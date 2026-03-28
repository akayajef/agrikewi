<?php

use App\Http\Controllers\PlantationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\TacheController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Page d'accueil → login
Route::get('/', function () {
    return Inertia::render('auth/login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    // Routes des tâches
    Route::get('/taches', [TacheController::class, 'index'])->name('taches.index');
    Route::post('/taches/{tache}/terminer', [TacheController::class, 'terminer'])->name('taches.terminer');

    // Routes des notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');

    //routes des stock
    Route::prefix('stock')->group(function () {
        // Lister le stock (accessible à tous les utilisateurs)
        Route::get('/', [StockController::class, 'index'])->name('stock.index');

        // Ajouter un produit au stock → uniquement superviseur
        Route::post('/ajouter', [StockController::class, 'ajouter'])
            ->name('stock.ajouter');

        // Retirer un produit du stock → uniquement agriculteur pour les intrants
        Route::post('/{stock}/retirer', [StockController::class, 'retirer'])->name('stock.retirer');
    });

    Route::get('/plantations', [PlantationController::class, 'index'])->name('plantations.index');
    Route::get('/plantations/{id}', [PlantationController::class, 'show'])->name('plantations.show');

    // Route du conseil agricole
    Route::get('/conseil', function () {
        return Inertia::render('conseil');
    })->name('conseil.index');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

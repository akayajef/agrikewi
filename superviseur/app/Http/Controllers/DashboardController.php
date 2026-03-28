<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\ProduitAgricole;
use App\Models\ProduitIntrant;
use App\Models\ProduitTransforme;
use App\Models\Tache;
use App\Models\Ouvrier;
use App\Models\ZoneDeProduction;
use App\Models\Plantation;
use App\Models\Commande;
use App\Models\Article; // ✅ AJOUT : Import du modèle Article pour le filtrage
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        // Récupération du superviseur
        $superviseur = Ouvrier::where('user_id', $userId)
            ->where('type', 'superviseur')
            ->first();

        // Si l'utilisateur n'est pas un superviseur
        if (!$superviseur) {
            // L'utilisateur n'est pas un superviseur, retour dashboard vide
            return Inertia::render('dashboard', [
                'stats' => [
                    ['label' => 'Zones supervisées', 'value' => 0],
                    ['label' => 'Agriculteurs', 'value' => 0],
                    ['label' => 'Produits agricoles', 'value' => 0],
                    ['label' => 'Intrants', 'value' => 0],
                    ['label' => 'Tâches en retard', 'value' => 0],
                ],
                'stocks' => [],
                'dernieresTaches' => [],
                'notifications' => [],
                'produitsTransformes' => 0,
                'totalCommandes' => 0,
                'totalPlantations' => 0,
            ]);
        }

        $superviseurId = $superviseur->id;
        $zoneIds = ZoneDeProduction::where('superviseur_id', $superviseurId)->pluck('id');
        $localiteIds = ZoneDeProduction::whereIn('id', $zoneIds)->pluck('localite_id');

        // --- 📊 Calcul des Statistiques pour le Superviseur ---

        // 1️⃣ Agriculteurs
        $totalAgriculteurs = Ouvrier::where('type', 'agriculteur')
            ->whereIn('localite_id', $localiteIds)
            ->count();

        // 2️⃣ Zones supervisées
        $totalZonesSupervisees = ZoneDeProduction::where('superviseur_id', $superviseurId)->count();

        // 3️⃣ Produits agricoles supervisés
        $totalProduitsAgro = ProduitAgricole::where('superviseur_id', $superviseurId)->count();

        // 4️⃣ Intrants supervisés
        $totalIntrants = ProduitIntrant::where('superviseur_id', $superviseurId)->count();

        // ✅ Produits transformés supervisés
        $totalProduitsTransformes = ProduitTransforme::where('superviseur_id', $superviseurId)->count();

        // ✅ Plantations supervisées (via les zones du superviseur)
        $totalPlantations = Plantation::whereIn('zone_id', $zoneIds)->count();

        // -------------------------------------------------------------
        // ✅ CORRECTION CRITIQUE : Filtrage des Commandes par Superviseur
        // -------------------------------------------------------------

        // 1. Récupérer les IDs des produits supervisés
        $produitAgricoleIds = ProduitAgricole::where('superviseur_id', $superviseurId)->pluck('id');
        $produitTransformeIds = ProduitTransforme::where('superviseur_id', $superviseurId)->pluck('id');

        // 2. Récupérer les IDs des articles basés sur ces produits
        $articleIds = Article::whereIn('produit_agricole_id', $produitAgricoleIds)
            ->orWhereIn('produit_transforme_id', $produitTransformeIds)
            ->pluck('id');

        // 3. Commandes filtrées : Compter les commandes qui contiennent au moins un de ces articles supervisés
        $totalCommandes = Commande::where('statut', '!=', 'annulee')
            ->whereHas('articlesCommande', function ($query) use ($articleIds) {
                // 'articlesCommande' est la relation de Commande à article_commande
                $query->whereIn('article_id', $articleIds);
            })
            ->count();

        // -------------------------------------------------------------

        // 5️⃣ Tâches en retard
        $tachesEnRetard = Tache::where('superviseur_id', $superviseurId)
            ->where('statut', '!=', 'terminee')
            ->whereDate('date_echeance', '<', now())
            ->count();

        // 6️⃣ Stocks produits agricoles
        // Utilisation de $produitAgricoleIds calculé précédemment
        $stocks = Stock::whereIn('produit_agricole_id', $produitAgricoleIds)
            ->with(['produitAgricole', 'entrepos'])
            ->get()
            ->map(fn($stock) => [
                'id' => $stock->id,
                'produit' => $stock->produitAgricole->nom ?? 'Inconnu',
                'quantite' => $stock->quantite,
                'entrepot' => $stock->entrepos->nom ?? 'Non défini',
                'statut_stock' => $stock->quantite < 50 ? 'faible' : 'normal',
            ]);

        // 7️⃣ Dernières tâches assignées
        $dernieresTaches = Tache::where('superviseur_id', $superviseurId)
            ->with('agriculteur.user')
            ->orderBy('date_echeance', 'asc')
            ->take(5)
            ->get()
            ->map(fn($tache) => [
                'description' => $tache->description,
                'echeance' => Carbon::parse($tache->date_echeance)->format('d/m/Y'),
                'statut' => match ($tache->statut) {
                    'terminee' => 'Terminée',
                    'en_cours' => 'En cours',
                    default => 'En retard',
                },
                'agriculteur' => $tache->agriculteur?->user
                    ? $tache->agriculteur->user->prenom . ' ' . $tache->agriculteur->user->nom
                    : 'Inconnu',
            ]);

        // 8️⃣ Notifications non lues
        $notifications = DB::table('notifications')
            ->join('users', 'notifications.sender_id', '=', 'users.id')
            ->where('notifications.user_id', $userId)
            ->whereNull('notifications.read_at')
            ->orderBy('notifications.created_at', 'desc')
            ->take(4)
            ->select(
                'notifications.id',
                'notifications.title',
                'notifications.message',
                'notifications.type as notif_type',
                'notifications.created_at',
                DB::raw("CONCAT(users.prenom, ' ', users.nom) as sender_name")
            )
            ->get()
            ->map(function ($n) {
                $frontendType = 'info';
                $message = strtolower($n->message);
                if (strpos($message, 'commande') !== false || strpos($message, 'nouvelle') !== false) {
                    $frontendType = 'success';
                } elseif (strpos($message, 'retard') !== false || strpos($message, 'urgent') !== false || strpos($message, 'alerte') !== false) {
                    $frontendType = 'danger';
                }

                return [
                    'id' => $n->id,
                    'title' => $n->title ?? 'Notification',
                    'message' => $n->message,
                    'type' => $frontendType,
                    'created_at' => Carbon::parse($n->created_at)->diffForHumans(),
                    'sender_name' => $n->sender_name,
                ];
            });

        // 9️⃣ Retour vers Inertia
        return Inertia::render('dashboard', [
            'stats' => [
                ['label' => 'Zones supervisées', 'value' => $totalZonesSupervisees],
                ['label' => 'Agriculteurs', 'value' => $totalAgriculteurs],
                ['label' => 'Produits agricoles', 'value' => $totalProduitsAgro],
                ['label' => 'Intrants', 'value' => $totalIntrants],
                ['label' => 'Tâches en retard', 'value' => $tachesEnRetard],
            ],
            'stocks' => $stocks,
            'dernieresTaches' => $dernieresTaches,
            'notifications' => $notifications,
            'produitsTransformes' => $totalProduitsTransformes,
            'totalCommandes' => $totalCommandes, // <- Maintenant filtré par produits supervisés
            'totalPlantations' => $totalPlantations,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request; // ✨ NOUVEAU: Import nécessaire pour la méthode markAsRead
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Récupérer l'objet utilisateur complet
        $user = Auth::user();
        $userId = $user->id;

        // ✨ Récupérer le prénom de l'utilisateur (seulement le premier mot)
        $prenomUtilisateur = explode(' ', $user->prenom ?? 'Client')[0];

        // --- 1️⃣ Statistiques (Stats) ---
        $nombreArticlesPanier = DB::table('panier')
            ->where('client_id', $userId)
            ->sum('quantite') ?? 0;

        // 💰 Total dépensé
        // STATUT EN MODE DEV : Maintenu à 'en_attente' comme demandé.
        $totalDepense = DB::table('paiement as p')
            ->join('commande as c', 'p.commande_id', '=', 'c.id')
            ->where('c.client_id', $userId)
            ->where('p.statut', 'effectue') // <-- STATUT MAINTENU À 'en_attente'
            // Utilise la somme des montants des paiements pour une lecture plus fiable et rapide
            ->selectRaw('SUM(p.montant) as total_depense')
            ->value('total_depense') ?? 0;

        // S'assurer que le total dépensé est un entier
        $totalDepense = intval($totalDepense);


        $commandesEnCours = DB::table('commande')
            ->where('client_id', $userId)
            ->whereIn('statut', ['en_cours', 'en_preparation', 'en_attente'])
            ->count();

        $stats = [
            ['label' => "Articles dans le panier", 'value' => (int) $nombreArticlesPanier],
            // ENVOIE: La valeur brute (0 ou le total)
            ['label' => "Total dépensé", 'value' => $totalDepense],
            ['label' => "Commandes en cours", 'value' => $commandesEnCours],
        ];

        // --- 2️⃣ 3 dernières commandes ---
        $dernieresCommandes = DB::table('commande as c')
            ->where('c.client_id', $userId)
            ->orderBy('c.date_commande', 'desc')
            ->limit(3)
            ->get();

        $dernieresCommandes = $dernieresCommandes->map(function ($commande) {

            // Articles
            $articles = DB::table('article_commande as ac')
                ->join('article as a', 'ac.article_id', '=', 'a.id')
                ->where('ac.commande_id', $commande->id)
                ->select(
                    'ac.id as article_commande_id',
                    'a.nom',
                    'ac.quantite',
                    'ac.prix_unitaire'
                )
                ->get();

            // Paiement
            $paiement = DB::table('paiement')
                ->where('commande_id', $commande->id)
                ->first()
                ?? (object)['montant' => 0, 'mode_paiement' => 'N/A', 'statut' => 'N/A'];

            // Enrichir l'objet commande original (aplatissement des données)
            $commande->adresse_livraison = $commande->adresse_livraison ?? 'N/A';
            $commande->statut = $commande->statut ?? 'N/A';
            $commande->date_changement = $commande->date_commande;
            $commande->articles = $articles;
            $commande->paiement = $paiement;

            return $commande;
        });

        // --- 3️⃣ Notifications ---
        $notifications = DB::table('notifications')
            ->where('user_id', $userId)
            // 🚨 AJOUT DU FILTRE : Ne sélectionne que les notifications NON LUES
            ->whereNull('read_at')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get(['id', 'title', 'message', 'type', 'created_at']);

        // --- 4️⃣ Retour à Inertia ---
        return Inertia::render('dashboard', [
            'prenom' => $prenomUtilisateur,
            'stats' => $stats,
            'dernieresCommandes' => $dernieresCommandes,
            'notifications' => $notifications,
        ]);
    }

    /**
     * Marque une notification spécifique comme lue.
     * Appelée via Inertia.post depuis le composant React.
     */
    public function markAsRead(Request $request)
    {
        $request->validate([
            'notification_id' => 'required|integer|exists:notifications,id',
        ]);

        $userId = Auth::id();

        DB::table('notifications')
            ->where('id', $request->input('notification_id'))
            ->where('user_id', $userId) // Sécurité : S'assurer que l'utilisateur est bien le destinataire
            ->update([
                'read_at' => now(), // Marquer comme lue
                'updated_at' => now(),
            ]);

        // Rediriger vers la page précédente. Inertia intercepte ceci et recharge les props,
        // ce qui fait disparaître la notification du tableau de bord.
        return back();
    }
}

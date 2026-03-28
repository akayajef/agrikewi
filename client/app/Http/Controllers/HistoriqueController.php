<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HistoriqueController extends Controller
{
    /**
     * Affiche l'historique des commandes du client connecté
     */
    public function index()
    {
        $clientId = Auth::id();

        // Récupérer les commandes du client
        $commandes = DB::table('commande')
            ->where('client_id', $clientId)
            ->orderBy('date_commande', 'desc')
            ->get();

        $historiques = [];

        foreach ($commandes as $commande) {
            // Récupérer l'historique de cette commande
            $commandeHistos = DB::table('historique_commandes')
                ->where('commande_id', $commande->id)
                ->orderBy('date_changement', 'desc')
                ->get();

            // Récupérer les articles de la commande avec article_commande_id
            $articles = DB::table('article_commande')
                ->join('article', 'article_commande.article_id', '=', 'article.id')
                ->where('article_commande.commande_id', $commande->id)
                ->select(
                    'article_commande.id as article_commande_id', // clé unique pour React
                    'article.nom',
                    'article_commande.quantite',
                    'article_commande.prix_unitaire'
                )
                ->get();

            // Récupérer le paiement (ou objet par défaut si nul)
            $paiement = DB::table('paiement')
                ->where('commande_id', $commande->id)
                ->first();

            if (!$paiement) {
                $paiement = (object)[
                    'montant' => 0,
                    'mode_paiement' => 'N/A',
                    'statut' => 'N/A'
                ];
            }

            // Ajouter chaque entrée d'historique avec un ID unique
            foreach ($commandeHistos as $h) {
                $historiques[] = [
                    'id' => $h->id ?? $commande->id . '_' . $h->date_changement,
                    'commande_id' => $commande->id,
                    'statut' => $h->statut,
                    'date_changement' => $h->date_changement,
                    'commande' => [
                        'id' => $commande->id,
                        'adresse_livraison' => $commande->adresse_livraison,
                        'date_commande' => $commande->date_commande,
                        'statut' => $commande->statut,
                        'articles' => $articles,
                        'paiement' => $paiement,
                    ],
                ];
            }

            // Si la commande n'a pas d'historique, on ajoute quand même une entrée
            if ($commandeHistos->isEmpty()) {
                $historiques[] = [
                    'id' => $commande->id . '_init',
                    'commande_id' => $commande->id,
                    'statut' => $commande->statut,
                    'date_changement' => $commande->date_commande,
                    'commande' => [
                        'id' => $commande->id,
                        'adresse_livraison' => $commande->adresse_livraison,
                        'date_commande' => $commande->date_commande,
                        'statut' => $commande->statut,
                        'articles' => $articles,
                        'paiement' => $paiement,
                    ],
                ];
            }
        }

        return Inertia::render('historique', [
            'historiques' => $historiques,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use App\Models\Paiement;
use App\Models\Ouvrier; // ✅ AJOUT
use App\Models\ProduitAgricole; // ✅ AJOUT
use App\Models\ProduitTransforme; // ✅ AJOUT
use App\Models\Article; // ✅ AJOUT
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // ✅ AJOUT
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Database\Eloquent\Builder;

class CommandeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('commande', [
            'commandes' => $this->getCommandesFiltrees(),
        ]);
    }

    public function updateStatutCommande(Request $request, $id): Response
    {
        $request->validate([
            'statut' => 'required|in:en_cours,en_preparation,livree,annulee',
        ]);

        $commande = Commande::with('paiements')->findOrFail($id);
        $commande->update(['statut' => $request->statut]);

        return Inertia::render('commande', [
            'commandes' => $this->getCommandesFiltrees(),
        ]);
    }

    public function updateStatutPaiement(Request $request, $id): Response
    {
        $request->validate([
            'statut' => 'required|in:en_attente,effectue,annule',
        ]);

        $paiement = Paiement::findOrFail($id);
        $paiement->update(['statut' => $request->statut]);

        return Inertia::render('commande', [
            'commandes' => $this->getCommandesFiltrees(),
        ]);
    }

    private function getCommandesFiltrees()
    {
        $user = Auth::user();

        // 1. Initialiser la requête avec les relations et les filtres de base
        $commandesQuery = Commande::with(['client.user', 'paiements', 'articlesCommande.article'])
            ->where('statut', '!=', 'annulee') // Exclusion des commandes annulées (plus efficace dans la requête)
            ->orderByDesc('date_commande');

        // 2. Vérifier si l'utilisateur est un superviseur
        $superviseur = null;
        if ($user->role === 'ouvrier') {
            $superviseur = Ouvrier::where('user_id', $user->id)->where('type', 'superviseur')->first();
        }

        // 3. Appliquer le filtre si c'est un superviseur
        if ($superviseur) {
            $superviseurId = $superviseur->id;
            
            // a. Récupérer les IDs des produits supervisés (agricoles OU transformés)
            $produitAgricoleIds = ProduitAgricole::where('superviseur_id', $superviseurId)->pluck('id');
            $produitTransformeIds = ProduitTransforme::where('superviseur_id', $superviseurId)->pluck('id');

            // b. Récupérer les IDs des articles basés sur ces produits
            $articleIds = Article::whereIn('produit_agricole_id', $produitAgricoleIds)
                ->orWhereIn('produit_transforme_id', $produitTransformeIds)
                ->pluck('id');

            // c. Filtrer les commandes pour celles contenant au moins un de ces articles
            $commandesQuery->whereHas('articlesCommande', function (Builder $query) use ($articleIds) {
                $query->whereIn('article_id', $articleIds);
            });
        }
        
        // 4. Bloquer l'accès aux utilisateurs qui ne sont ni admin ni superviseur (si besoin de sécurité renforcée)
        if (!$superviseur && $user->role !== 'admin') {
            return collect();
        }

        // 5. Exécuter la requête
        $commandes = $commandesQuery->get();

        // 6. Appliquer le filtre sur la collection (celui qui ne peut pas être fait en SQL) et mapper les données
        return $commandes
            ->filter(
                fn($c) =>
                // Exclut les commandes livrées et entièrement payées
                !($c->statut === 'livree' && $c->paiements->every(fn($p) => $p->statut === 'effectue'))
            )
            ->map(fn($c) => [
                'id' => $c->id,
                'client' => [
                    'nom_complet' => trim(optional($c->client?->user)->prenom . ' ' . optional($c->client?->user)->nom),
                    'nom' => optional($c->client?->user)->nom,
                    'prenom' => optional($c->client?->user)->prenom,
                    'email' => optional($c->client?->user)->email,
                    'telephone' => optional($c->client?->user)->telephone,
                ],
                'adresse_livraison' => $c->adresse_livraison,
                'date_commande' => optional($c->date_commande)->format('d/m/Y H:i'),
                'statut' => $c->statut,
                'articles' => $c->articlesCommande->map(fn($ac) => [
                    'nom' => optional($ac->article)->nom,
                    'quantite' => (int) $ac->quantite,
                    'prix_unitaire' => (float) $ac->prix_unitaire,
                    'prix_total' => (float) $ac->prix_unitaire * (int) $ac->quantite,
                ]),
                'paiements' => $c->paiements->map(fn($p) => [
                    'id' => $p->id,
                    'montant' => (float) $p->montant,
                    'montant_initial' => (float) ($p->montant_initial ?? 0),
                    'reduction_pourcentage' => (float) ($p->reduction_pourcentage ?? 0),
                    'reduction_montant' => (float) (($p->montant_initial ?? 0) - $p->montant),
                    'mode_paiement' => $p->mode_paiement,
                    'statut' => $p->statut,
                ]),
                'total_articles' => $c->articlesCommande->sum(fn($ac) => $ac->prix_unitaire * $ac->quantite),
            ])
            ->values();
    }
}
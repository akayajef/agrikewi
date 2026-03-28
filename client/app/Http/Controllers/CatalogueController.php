<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CatalogueController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('catalogue_client');
        // Ajout de 'categorie' au tableau de filtres pour la persistance dans l'URL
        $filters = $request->only(['search', 'produit', 'type', 'tri', 'categorie']);

        // --- FILTRES SERVEUR (Pour la persistance de l'état via l'URL) ---

        // 1. Recherche par nom ou description
        if ($request->filled('search')) {
            $search = strtolower($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(article_nom) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(article_description) LIKE ?', ["%{$search}%"]);
            });
        }

        // 2. Filtrer par CATÉGORIE (brut/transforme) - NOUVEAU
        if ($request->filled('categorie')) {
            $query->where('article_categorie', $request->input('categorie'));
        }

        // 3. Filtrer par type (fruit, legume, jus, conserve, etc.)
        if ($request->filled('type')) {
            // Utilise la nouvelle colonne 'produit_type' de la vue
            $query->where('produit_type', $request->input('type'));
        }

        // 4. Filtrer par nom de produit (Banane, Tomate, Jus de fruit, etc.)
        if ($request->filled('produit')) {
            // Utilise la nouvelle colonne 'produit_source_nom' de la vue
            $query->where('produit_source_nom', $request->input('produit'));
        }

        // 5. Tri (Tri côté serveur pour être plus efficace)
        if ($request->filled('tri')) {
            switch ($request->input('tri')) {
                case 'prix_asc':
                    $query->orderBy('article_prix', 'asc');
                    break;
                case 'prix_desc':
                    $query->orderBy('article_prix', 'desc');
                    break;
                case 'nom':
                    $query->orderBy('article_nom', 'asc');
                    break;
                default:
                    // Ordre par défaut
                    $query->orderBy('article_id', 'desc');
                    break;
            }
        } else {
            // Tri par défaut si aucun n'est spécifié
            $query->orderBy('article_id', 'desc');
        }

        $articles = $query->get()->map(function ($article) {
            return [
                'article_id' => $article->article_id,
                'article_nom' => $article->article_nom,
                'article_description' => $article->article_description,
                'article_prix' => floatval($article->article_prix),
                'article_image' => $article->article_image,
                // Nouvelles colonnes pour les filtres
                'produit_source_nom' => $article->produit_source_nom,
                'article_categorie' => $article->article_categorie,
                // Fin des nouvelles colonnes
                'quantite_disponible' => floatval($article->quantite_disponible),
                'produit_type' => $article->produit_type, // Renommé (anciennement 'type')
                // Le champ 'reduction' est retiré
                'unite_vente' => $article->unite_vente, // <-- Inclut l'unité de vente
            ];
        });

        // Calculer les listes de filtres à partir du jeu de données COMPLET
        $fullArticleList = DB::table('catalogue_client')->get();
        // Types (fruit, legume, jus, conserve, etc.)
        $produitTypes = $fullArticleList->pluck('produit_type')->unique()->values();
        // Noms des produits source (Banane, Jus de Banane, etc.)
        $produitsSource = $fullArticleList->pluck('produit_source_nom')->unique()->values();
        // Catégories (brut, transforme) - NOUVEAU
        $categories = $fullArticleList->pluck('article_categorie')->unique()->values();

        // Calculer le nombre d'articles dans le panier
        $panierCount = 0;
        if (Auth::check()) {
            $panierCount = DB::table('panier')
                ->where('client_id', Auth::id())
                ->sum('quantite');
        }

        return Inertia::render('catalogue', [
            'articles' => $articles,
            'produitTypes' => $produitTypes, // Renommé (anciennement typesProduits)
            'produitsSource' => $produitsSource, // Renommé (anciennement produitsAgricoles)
            'categories' => $categories, // AJOUTÉ
            'panierCountInitial' => intval($panierCount),
            'filters' => $filters,
        ]);
    }
}

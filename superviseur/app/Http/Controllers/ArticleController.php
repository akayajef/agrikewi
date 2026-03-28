<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ProduitAgricole;
use App\Models\ProduitTransforme; // AJOUTÉ : Importation du nouveau modèle
use App\Models\User;
use App\Models\Ouvrier; // AJOUTÉ : Pour une vérification de permission plus robuste si non dans User
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule; // AJOUTÉ : Pour valider l'énumération

class ArticleController extends Controller
{
    private const ROLE_ADMIN = 'admin';
    private const TYPE_SUPERVISEUR = 'superviseur';
    private const UNITES_DE_VENTE_AUTORISEES = ['unite', 'kilo', 'tonne', 'litre', 'paquet']; // MODIFIÉ

    /**
     * Affiche la liste des articles.
     */
    public function index()
    {
        $user = Auth::user();

        // Chargement des deux relations de produits
        $query = Article::with(['produitAgricole', 'produitTransforme', 'superviseur.user']);

        // Logique de filtrage : Si l'utilisateur est un Superviseur, il ne voit que ses articles.
        if (optional($user->ouvrier)->type === self::TYPE_SUPERVISEUR) {
            $superviseurId = $user->ouvrier->id;
            $query->where('superviseur_id', $superviseurId);
        }

        $articles = $query->latest()
            ->get()
            ->map(function ($article) {
                // Détermination du produit associé (Agricole OU Transformé)
                $produitAssocie = $article->produitAgricole ?? $article->produitTransforme;

                // Détermination de la nature et du type pour l'affichage
                if ($article->produit_agricole_id) {
                    $nature = 'Agricole Brut';
                    $type = $produitAssocie->type ?? 'Inconnu'; // Type de produit agricole (fruit, légume...)
                } elseif ($article->produit_transforme_id) {
                    $nature = 'Agricole Transformé';
                    $type = $produitAssocie->type_produit ?? 'Inconnu'; // Type de produit transformé (jus, conserve...)
                } else {
                    $nature = 'Non Classé';
                    $type = 'N/A';
                }

                return [
                    'id' => $article->id,
                    'nom' => $article->nom,
                    'description' => $article->description,
                    'prix' => $article->prix,
                    'nature' => $nature,
                    'type' => $type,
                    'produit' => $produitAssocie->nom ?? 'Non défini',
                    'superviseur' => $article->superviseur?->user
                        ? $article->superviseur->user->nom . ' ' . $article->superviseur->user->prenom
                        : 'Non assigné',
                    'image_url' => $article->image_url
                        ? asset('articles/' . $article->image_url)
                        : asset('default/article-placeholder.jpg'),
                    'unite_vente' => $article->unite_vente,
                ];
            });

        // Charger les produits agricoles et transformés pour les formulaires
        $produitsAgricoles = ProduitAgricole::all(['id', 'nom', 'type']);
        $produitsTransformes = ProduitTransforme::all(['id', 'nom', 'type_produit as type']);

        $canManageArticles = $this->hasArticleManagementPermission($user);

        return Inertia::render('articles', [
            'articles' => $articles,
            'produitsAgricoles' => $produitsAgricoles,
            'produitsTransformes' => $produitsTransformes, // AJOUTÉ
            'unitesVente' => self::UNITES_DE_VENTE_AUTORISEES, // Optionnel, si besoin dans la vue
            'flash' => session('flash'),
            'canManageArticles' => $canManageArticles,
        ]);
    }

    /**
     * Enregistre un nouvel article.
     */
    public function store(Request $request)
    {
        if (!$this->hasArticleManagementPermission(Auth::user())) {
            return back()->with('flash', [
                'message' => '❌ Non autorisé à créer des articles.',
                'type' => 'error',
            ]);
        }

        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'description' => 'nullable|string',
            'prix' => 'nullable|numeric|min:0',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'produit_agricole_id' => 'nullable|exists:produit_agricole,id',
            'produit_transforme_id' => 'nullable|exists:produit_transforme,id', // AJOUTÉ
            'unite_vente' => ['required', Rule::in(self::UNITES_DE_VENTE_AUTORISEES)], // MODIFIÉ
        ]);

        // --- LOGIQUE DE VÉRIFICATION MUTUELLE ---
        if (empty($validated['produit_agricole_id']) && empty($validated['produit_transforme_id'])) {
            return back()->withErrors([
                'produit_agricole_id' => 'Vous devez sélectionner soit un Produit Agricole, soit un Produit Transformé.',
            ])->withInput();
        }

        // Si les deux sont fournis, on annule l'ID du produit agricole pour donner la priorité au produit transformé.
        if (!empty($validated['produit_agricole_id']) && !empty($validated['produit_transforme_id'])) {
            $validated['produit_agricole_id'] = null;
        }

        // --- GESTION DE L'IMAGE ---
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '-' . $image->getClientOriginalName();
            $image->move(public_path('articles'), $imageName);
            $validated['image_url'] = $imageName;
        }

        // --- ATTRIBUTION DU SUPERVISEUR ---
        // Le modèle Article gère l'attribution du superviseur via la méthode `booted` (méthode `static::creating`).
        // Si vous retirez la logique de `booted`, il faut l'ajouter ici:
        /*
        $superviseur = Ouvrier::where('user_id', Auth::id())
            ->where('type', self::TYPE_SUPERVISEUR)
            ->first();
        $validated['superviseur_id'] = $superviseur ? $superviseur->id : null;
        */

        Article::create($validated);

        return redirect()->route('articles.index')->with('flash', [
            'message' => '✅ Article créé avec succès !',
            'type' => 'success',
        ]);
    }

    /**
     * Met à jour un article existant.
     */
    public function update(Request $request, Article $article)
    {
        if (!$this->hasArticleManagementPermission(Auth::user())) {
            return back()->with('flash', [
                'message' => '❌ Non autorisé à modifier des articles.',
                'type' => 'error',
            ]);
        }

        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'description' => 'nullable|string',
            'prix' => 'nullable|numeric|min:0',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'produit_agricole_id' => 'nullable|exists:produit_agricole,id',
            'produit_transforme_id' => 'nullable|exists:produit_transforme,id', // AJOUTÉ
            'unite_vente' => ['required', Rule::in(self::UNITES_DE_VENTE_AUTORISEES)], // MODIFIÉ
        ]);

        // --- LOGIQUE DE VÉRIFICATION MUTUELLE ---
        if (empty($validated['produit_agricole_id']) && empty($validated['produit_transforme_id'])) {
            return back()->withErrors([
                'produit_agricole_id' => 'Vous devez sélectionner soit un Produit Agricole, soit un Produit Transformé.',
            ])->withInput();
        }

        if (!empty($validated['produit_agricole_id']) && !empty($validated['produit_transforme_id'])) {
            $validated['produit_agricole_id'] = null;
        }

        // --- GESTION DE L'IMAGE ---
        if ($request->hasFile('image')) {
            // Suppression de l'ancienne image si elle existe
            if ($article->image_url && File::exists(public_path('articles/' . $article->image_url))) {
                File::delete(public_path('articles/' . $article->image_url));
            }

            $image = $request->file('image');
            $imageName = time() . '-' . $image->getClientOriginalName();
            $image->move(public_path('articles'), $imageName);
            $validated['image_url'] = $imageName;
        }

        $article->update($validated);

        return redirect()->route('articles.index')->with('flash', [
            'message' => '✅ Article mis à jour avec succès !',
            'type' => 'info',
        ]);
    }

    /**
     * Supprime un article.
     */
    public function destroy(Article $article)
    {
        if (!$this->hasArticleManagementPermission(Auth::user())) {
            return back()->with('flash', [
                'message' => '❌ Non autorisé à supprimer des articles.',
                'type' => 'error',
            ]);
        }

        // Suppression du fichier image
        if ($article->image_url && File::exists(public_path('articles/' . $article->image_url))) {
            File::delete(public_path('articles/' . $article->image_url));
        }

        $article->delete();

        return redirect()->route('articles.index')->with('flash', [
            'message' => '🗑️ Article supprimé avec succès !',
            'type' => 'danger',
        ]);
    }

    /**
     * Vérifie si l'utilisateur a la permission de gérer les articles (Admin ou Superviseur).
     */
    private function hasArticleManagementPermission(User $user = null): bool
    {
        if (!$user) {
            return false;
        }

        // Vérification du rôle d'Admin
        if ($user->role === self::ROLE_ADMIN) {
            return true;
        }

        // Vérification du type Superviseur via la relation ouvrier
        if (optional($user->ouvrier)->type === self::TYPE_SUPERVISEUR) {
            return true;
        }

        return false;
    }
}

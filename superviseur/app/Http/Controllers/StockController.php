<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\ProduitAgricole;
use App\Models\ProduitIntrant;
use App\Models\ProduitTransforme; // 🌟 NOUVEAU : Importation du modèle de produit transformé
use App\Models\Entrepos;
use App\Models\Agriculteur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class StockController extends Controller
{
    /**
     * Affiche la page de gestion des stocks.
     */
    public function index()
    {
        $user = Auth::user();
        $isSuperviseur = false;
        $superviseurOuvrierId = null;

        // 1. Vérification du rôle de l'utilisateur dans la table 'ouvrier'
        if ($user) {
            $ouvrier = Agriculteur::withoutGlobalScope('agriculteur')
                ->where('user_id', $user->id)
                ->first();

            // Si l'utilisateur a un enregistrement dans 'ouvrier' et est de type 'superviseur'
            if ($ouvrier && $ouvrier->type === 'superviseur') {
                $isSuperviseur = true;
                $superviseurOuvrierId = $ouvrier->id;
            }
        }

        $produitsAgricoles = collect([]);
        $produitsIntrants = collect([]);
        $produitsTransformes = collect([]); // 🌟 NOUVEAU

        // 2. Filtrage des données : Seuls les superviseurs voient leurs stocks
        if ($isSuperviseur) {
            // Le Superviseur voit les produits qu'il a créés (son superviseur_id).
            $produitsAgricoles = ProduitAgricole::with(['stocks.entrepos', 'superviseur.user'])
                ->where('superviseur_id', $superviseurOuvrierId)
                ->get();

            $produitsIntrants = ProduitIntrant::with(['stocks.entrepos', 'superviseur.user'])
                ->where('superviseur_id', $superviseurOuvrierId)
                ->get();

            // 🌟 NOUVEAU : Récupération des produits transformés
            $produitsTransformes = ProduitTransforme::with(['stocks.entrepos', 'superviseur.user'])
                ->where('superviseur_id', $superviseurOuvrierId)
                ->get();
        }

        $entreposList = Entrepos::all();

        $flash = session('flash');
        $flashData = is_array($flash) ? $flash : null;

        return Inertia::render('stock', [
            'produitsAgricoles' => $produitsAgricoles,
            'produitsIntrants' => $produitsIntrants,
            'produitsTransformes' => $produitsTransformes, // 🌟 NOUVEAU
            'entreposList' => $entreposList,
            'isSuperviseur' => $isSuperviseur,
            'flash' => $flashData,
        ]);
    }

    /**
     * Enregistre un nouveau produit (Agricole, Intrant ou Transformé) et son stock initial.
     */
    public function store(Request $request)
    {
        // 1. Récupération de l'ID du superviseur
        $superviseur = Agriculteur::withoutGlobalScope('agriculteur')
            ->where('user_id', Auth::id())
            ->where('type', 'superviseur')
            ->first();

        if (!$superviseur) {
            return back()->with('flash', ['message' => '❌ Action non autorisée. Vous devez être un superviseur pour ajouter un produit/stock.', 'type' => 'danger']);
        }

        $data = $this->validateProduit($request);
        $superviseurOuvrierId = $superviseur->id;

        DB::transaction(function () use ($data, $superviseurOuvrierId) {
            if ($data['nature'] === 'agricole') {
                $produit = ProduitAgricole::create([
                    'nom' => $data['nom'],
                    'nature' => 'agricole',
                    'type' => $data['type'],
                    'description' => $data['description'] ?? null,
                    'superviseur_id' => $superviseurOuvrierId,
                ]);

                Stock::create([
                    'produit_agricole_id' => $produit->id,
                    'entrepos_id' => $data['entrepos_id'],
                    'quantite' => $data['quantite'],
                    'unite_stock' => $data['unite_stock'] ?? 'unite',
                ]);
            }
            // 🌟 NOUVEAU : Gestion de la création d'un produit transformé
            elseif ($data['nature'] === 'transforme') {
                // Assumer que le champ 'type' dans la requête correspond au champ 'type_produit' dans la table
                $produit = ProduitTransforme::create([
                    'nom' => $data['nom'],
                    'type_produit' => $data['type'],
                    'description' => $data['description'] ?? null,
                    'superviseur_id' => $superviseurOuvrierId,
                ]);

                Stock::create([
                    'produit_transforme_id' => $produit->id, // Utilisation de la nouvelle clé étrangère
                    'entrepos_id' => $data['entrepos_id'],
                    'quantite' => $data['quantite'],
                    'unite_stock' => $data['unite_stock'] ?? 'unite',
                ]);
            }
            // Gestion de la création d'un intrant
            else {
                $produit = ProduitIntrant::create([
                    'nom' => $data['nom'],
                    'type' => $data['type'],
                    'description' => $data['description'] ?? null,
                    'superviseur_id' => $superviseurOuvrierId,
                ]);

                Stock::create([
                    'produit_intrant_id' => $produit->id,
                    'entrepos_id' => $data['entrepos_id'],
                    'quantite' => $data['quantite'],
                    'unite_stock' => $data['unite_stock'] ?? 'unite',
                ]);
            }
        });

        return redirect()->back()->with('flash', ['message' => '✅ Produit et stock ajoutés avec succès !', 'type' => 'success']);
    }

    /**
     * Met à jour la quantité et/ou l'entrepôt d'un stock existant.
     */
    public function updateStock(Request $request, $stockId)
    {
        // Vérification de l'autorisation de modification (seul le superviseur)
        $superviseur = Agriculteur::withoutGlobalScope('agriculteur')
            ->where('user_id', Auth::id())
            ->where('type', 'superviseur')
            ->first();

        if (!$superviseur) {
            return back()->with('flash', ['message' => '❌ Action non autorisée. Seul un superviseur peut modifier un stock.', 'type' => 'danger']);
        }

        $stock = Stock::findOrFail($stockId);

        // 🌟 MODIFIÉ : Vérification de la propriété du produit (Agricole OU Intrant OU Transformé)
        $produit = $stock->produitAgricole ?? $stock->produitIntrant ?? $stock->produitTransforme;

        if (!$produit || $produit->superviseur_id !== $superviseur->id) {
            return back()->with('flash', ['message' => '❌ Non autorisé. Vous ne pouvez modifier que le stock de produits que vous avez créés.', 'type' => 'danger']);
        }

        $data = $request->validate([
            'quantite' => 'required|numeric|min:0',
            // 🔄 CORRECTION : Ajout de 'paquet' et 'litre' pour correspondre au front-end
            'unite_stock' => ['nullable', Rule::in(['unite', 'kilo', 'tonne', 'paquet', 'litre'])],
            'entrepos_id' => 'nullable|exists:entrepos,id',
        ]);


        $stock->update([
            'quantite' => $data['quantite'],
            'unite_stock' => $data['unite_stock'] ?? $stock->unite_stock,
            'entrepos_id' => $data['entrepos_id'] ?? $stock->entrepos_id,
        ]);

        return back()->with('flash', ['message' => '✅ Stock mis à jour avec succès !', 'type' => 'success']);
    }

    /**
     * Supprime une entrée de stock.
     */
    public function destroyStock($id)
    {
        // Vérification de l'autorisation de suppression (seul le superviseur)
        $superviseur = Agriculteur::withoutGlobalScope('agriculteur')
            ->where('user_id', Auth::id())
            ->where('type', 'superviseur')
            ->first();

        if (!$superviseur) {
            return back()->with('flash', ['message' => '❌ Action non autorisée. Seul un superviseur peut supprimer un stock.', 'type' => 'danger']);
        }

        $stock = Stock::findOrFail($id);

        // 🌟 MODIFIÉ : Vérification de la propriété du produit (Agricole OU Intrant OU Transformé)
        $produit = $stock->produitAgricole ?? $stock->produitIntrant ?? $stock->produitTransforme;

        if (!$produit || $produit->superviseur_id !== $superviseur->id) {
            return back()->with('flash', ['message' => '❌ Non autorisé. Vous ne pouvez supprimer que le stock de produits que vous avez créés.', 'type' => 'danger']);
        }

        $stock->delete();

        return back()->with('flash', ['message' => '🗑️ Stock supprimé avec succès !', 'type' => 'danger']);
    }

    /**
     * Met à jour le produit et son stock associé (créé ou mis à jour).
     */
    public function update(Request $request, $id, $nature)
    {
        // Vérification de l'autorisation de modification du produit (seul le superviseur)
        $superviseur = Agriculteur::withoutGlobalScope('agriculteur')
            ->where('user_id', Auth::id())
            ->where('type', 'superviseur')
            ->first();

        if (!$superviseur) {
            return back()->with('flash', ['message' => '❌ Action non autorisée. Seul un superviseur peut modifier un produit/stock.', 'type' => 'danger']);
        }

        $data = $this->validateProduit($request);
        $superviseurOuvrierId = $superviseur->id;

        DB::transaction(function () use ($data, $nature, $id, $superviseurOuvrierId) {
            if ($nature === 'agricole') {
                $produit = ProduitAgricole::findOrFail($id);

                // **Vérification de propriété**
                if ($produit->superviseur_id !== $superviseurOuvrierId) {
                    abort(403, 'Vous ne pouvez modifier que les produits que vous avez créés.');
                }

                $produit->update([
                    'nom' => $data['nom'],
                    'type' => $data['type'],
                    'description' => $data['description'] ?? null,
                    'superviseur_id' => $superviseurOuvrierId,
                ]);

                // Création/Mise à jour du stock
                Stock::updateOrCreate(
                    ['produit_agricole_id' => $produit->id, 'entrepos_id' => $data['entrepos_id']],
                    ['quantite' => $data['quantite'], 'unite_stock' => $data['unite_stock'] ?? 'unite']
                );
            }
            // 🌟 NOUVEAU : Gestion de la mise à jour d'un produit transformé
            elseif ($nature === 'transforme') {
                $produit = ProduitTransforme::findOrFail($id);

                // **Vérification de propriété**
                if ($produit->superviseur_id !== $superviseurOuvrierId) {
                    abort(403, 'Vous ne pouvez modifier que les produits que vous avez créés.');
                }

                $produit->update([
                    'nom' => $data['nom'],
                    'type_produit' => $data['type'], // Utilisation du champ 'type_produit'
                    'description' => $data['description'] ?? null,
                    'superviseur_id' => $superviseurOuvrierId,
                ]);

                // Création/Mise à jour du stock
                Stock::updateOrCreate(
                    ['produit_transforme_id' => $produit->id, 'entrepos_id' => $data['entrepos_id']],
                    ['quantite' => $data['quantite'], 'unite_stock' => $data['unite_stock'] ?? 'unite']
                );
            }
            // Gestion de la mise à jour d'un intrant
            else {
                $produit = ProduitIntrant::findOrFail($id);

                // **Vérification de propriété**
                if ($produit->superviseur_id !== $superviseurOuvrierId) {
                    abort(403, 'Vous ne pouvez modifier que les produits que vous avez créés.');
                }

                $produit->update([
                    'nom' => $data['nom'],
                    'type' => $data['type'],
                    'description' => $data['description'] ?? null,
                    'superviseur_id' => $superviseurOuvrierId,
                ]);

                Stock::updateOrCreate(
                    ['produit_intrant_id' => $produit->id, 'entrepos_id' => $data['entrepos_id']],
                    ['quantite' => $data['quantite'], 'unite_stock' => $data['unite_stock'] ?? 'unite']
                );
            }
        });

        return redirect()->back()->with('flash', ['message' => '✅ Produit et stock mis à jour avec succès !', 'type' => 'success']);
    }

    /**
     * Supprime un produit (Agricole, Intrant ou Transformé) et son stock associé.
     */
    public function destroy(Request $request, $id)
    {
        // Vérification de l'autorisation de suppression du produit (seul le superviseur)
        $superviseur = Agriculteur::withoutGlobalScope('agriculteur')
            ->where('user_id', Auth::id())
            ->where('type', 'superviseur')
            ->first();

        if (!$superviseur) {
            return back()->with('flash', ['message' => '❌ Action non autorisée. Seul un superviseur peut supprimer un produit.', 'type' => 'danger']);
        }

        $nature = $request->query('nature');
        // 🌟 MODIFIÉ : Ajout de 'transforme' à la vérification de la nature
        abort_if(!in_array($nature, ['agricole', 'intrant', 'transforme']), 400, 'Type de produit invalide.');

        $superviseurOuvrierId = $superviseur->id;

        DB::transaction(function () use ($id, $nature, $superviseurOuvrierId) {
            if ($nature === 'agricole') {
                $produit = ProduitAgricole::findOrFail($id);

                // **Vérification de propriété**
                if ($produit->superviseur_id !== $superviseurOuvrierId) {
                    abort(403, 'Vous ne pouvez supprimer que les produits que vous avez créés.');
                }

                Stock::where('produit_agricole_id', $produit->id)->delete();
                $produit->delete();
            }
            // 🌟 NOUVEAU : Gestion de la suppression d'un produit transformé
            elseif ($nature === 'transforme') {
                $produit = ProduitTransforme::findOrFail($id);

                // **Vérification de propriété**
                if ($produit->superviseur_id !== $superviseurOuvrierId) {
                    abort(403, 'Vous ne pouvez supprimer que les produits que vous avez créés.');
                }

                Stock::where('produit_transforme_id', $produit->id)->delete();
                $produit->delete();
            }
            // Gestion de la suppression d'un intrant
            else {
                $produit = ProduitIntrant::findOrFail($id);

                // **Vérification de propriété**
                if ($produit->superviseur_id !== $superviseurOuvrierId) {
                    abort(403, 'Vous ne pouvez supprimer que les produits que vous avez créés.');
                }

                Stock::where('produit_intrant_id', $produit->id)->delete();
                $produit->delete();
            }
        });

        return back()->with('flash', ['message' => '🗑️ Produit et stock supprimés avec succès !', 'type' => 'danger']);
    }

    /**
     * Règle de validation pour la création/modification d'un produit.
     */
    private function validateProduit(Request $request): array
    {
        return $request->validate([
            'nom' => 'required|string|max:100',
            // 🌟 MODIFIÉ : Ajout de 'transforme' aux natures possibles
            'nature' => ['required', Rule::in(['agricole', 'intrant', 'transforme'])],
            'type' => 'required|string|max:100',
            'description' => 'nullable|string',
            'quantite' => 'required|numeric|min:0',
            'entrepos_id' => 'required|exists:entrepos,id',
            // 🔄 CORRECTION : Ajout de 'paquet' et 'litre' pour correspondre au front-end
            'unite_stock' => ['nullable', Rule::in(['unite', 'kilo', 'tonne', 'paquet', 'litre'])],
        ]);
    }
}

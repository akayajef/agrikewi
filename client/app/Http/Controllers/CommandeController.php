<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class CommandeController extends Controller
{
    /**
     * Affiche le panier et les infos de livraison
     */
    public function index()
    {
        $clientId = Auth::id();

        $panier = DB::table('panier')
            ->join('article', 'panier.article_id', '=', 'article.id')
            ->select(
                'panier.id as panier_id',
                'article.id as article_id',
                'article.nom',
                'article.prix',
                'article.image_url',
                'panier.quantite'
            )
            ->where('panier.client_id', $clientId)
            ->get()
            ->map(fn($item) => [
                'panier_id' => $item->panier_id,
                'article_id' => $item->article_id,
                'nom' => $item->nom,
                'prix' => floatval($item->prix),
                'image_url' => $item->image_url,
                'quantite' => intval($item->quantite),
            ]);

        $total = $panier->sum(fn($a) => $a['prix'] * $a['quantite']);

        $adresseLivraison = DB::table('client')
            ->where('user_id', $clientId)
            ->value('adresse_livraison');

        return Inertia::render('commande', [
            'panier' => $panier,
            'total' => $total,
            'adresseLivraison' => $adresseLivraison,
        ]);
    }

    /**
     * Ajouter un article au panier
     */
    public function ajouterAuPanier(Request $request)
    {
        $clientId = Auth::id();

        $request->validate([
            'article_id' => 'required|exists:article,id',
        ]);

        $panierItem = DB::table('panier')
            ->where('client_id', $clientId)
            ->where('article_id', $request->article_id)
            ->first();

        if ($panierItem) {
            DB::table('panier')
                ->where('id', $panierItem->id)
                ->update(['quantite' => $panierItem->quantite + 1]);
        } else {
            DB::table('panier')->insert([
                'client_id' => $clientId,
                'article_id' => $request->article_id,
                'quantite' => 1,
            ]);
        }

        return redirect()->back()->with('success', 'Article ajouté au panier.');
    }

    /**
     * Supprimer un article du panier
     */
    public function supprimerDuPanier($id)
    {
        $clientId = Auth::id();

        DB::table('panier')
            ->where('id', $id)
            ->where('client_id', $clientId)
            ->delete();

        return redirect()->back()->with('success', 'Article retiré du panier.');
    }

    /**
     * Teste l'intégration ou l'envoi d'un message WhatsApp.
     */
    public function testWhatsapp(Request $request)
    {
        $request->validate([
            'telephone' => 'required|string|min:9|max:15',
            'message' => 'required|string|max:500',
        ]);

        try {
            $this->sendWhatsappNotification($request->telephone, $request->message);

            return response()->json([
                'status' => 'success',
                'message' => "Message WhatsApp envoyé au {$request->telephone}",
                'details' => 'Vérifiez les logs Laravel pour confirmer la réponse de Twilio.'
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur test WhatsApp: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors du test WhatsApp: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Logique d'envoi de notification WhatsApp via l'API Twilio.
     */
    private function sendWhatsappNotification(string $rawPhoneNumber, string $message): void
    {
        $accountSid = env('TWILIO_ACCOUNT_SID');
        $authToken = env('TWILIO_AUTH_TOKEN');
        $fromNumber = env('TWILIO_WHATSAPP_FROM');
        $sslCertPath = "C:\\wamp64\\bin\\php\\php8.3.14\\extras\\ssl\\cacert.pem";

        if (empty($accountSid) || empty($authToken) || empty($fromNumber)) {
            \Log::warning('Configuration Twilio manquante. Notification WhatsApp non envoyée.');
            return;
        }

        // Formatage du numéro pour le Sénégal (+221)
        $cleanNumber = preg_replace('/[^0-9]/', '', $rawPhoneNumber);

        if (!str_starts_with($cleanNumber, '221')) {
            if (strlen($cleanNumber) == 9) {
                $formattedNumber = '221' . $cleanNumber;
            } else {
                \Log::error("Numéro {$rawPhoneNumber} au format invalide. Non envoyé.");
                return;
            }
        } else {
            $formattedNumber = $cleanNumber;
        }

        $toWhatsappNumber = 'whatsapp:+' . $formattedNumber;
        $url = "https://api.twilio.com/2010-04-01/Accounts/{$accountSid}/Messages.json";

        try {
            $response = Http::asForm()
                ->withBasicAuth($accountSid, $authToken)
                ->withOptions(['verify' => $sslCertPath])
                ->post($url, [
                    'From' => $fromNumber,
                    'To' => $toWhatsappNumber,
                    'Body' => $message,
                ]);

            if ($response->failed()) {
                \Log::error('Erreur Twilio pour ' . $toWhatsappNumber .
                    ' (Statut: ' . $response->status() . '). Réponse: ' . $response->body());
            } else {
                \Log::info('Message WhatsApp envoyé à ' . $toWhatsappNumber .
                    '. SID: ' . $response->json('sid'));
            }
        } catch (\Exception $e) {
            \Log::error('Erreur HTTP WhatsApp: ' . $e->getMessage());
        }
    }

    /**
     * Passer la commande, mettre à jour le stock et notifier les superviseurs
     *
     * ✅ Les champs 'total' (après réduction) et 'reduction' (pourcentage) sont attendus du front-end.
     * Ces informations sont persistées dans la table paiement pour l'affichage in-app.
     */
    public function store(Request $request)
    {
        $request->validate([
            'adresse_livraison' => 'required|string|max:255',
            'mode_paiement' => 'required|in:espece,mobile_money,carte_bancaire',
            'code_promo' => 'nullable|string|max:50',
            'total' => 'required|numeric', // Total APRES réduction
            'reduction' => 'required|numeric|min:0|max:100', // Pourcentage de réduction
        ]);

        $clientId = Auth::id();
        $commandeId = null;
        $montantTotalAvantPromo = 0; // Initialisation du total AVANT promo
        $reductionPourcentage = $request->reduction;

        DB::transaction(function () use ($request, $clientId, &$commandeId, &$montantTotalAvantPromo, $reductionPourcentage) {
            // Mettre à jour l'adresse du client
            DB::table('client')->where('user_id', $clientId)
                ->update(['adresse_livraison' => $request->adresse_livraison]);

            // Récupérer les articles du panier avec le nom
            $panierItems = DB::table('panier')
                ->join('article', 'panier.article_id', '=', 'article.id')
                ->where('panier.client_id', $clientId)
                ->select(
                    'panier.article_id',
                    'panier.quantite as panier_quantite',
                    'article.prix',
                    'article.produit_agricole_id',
                    'article.produit_transforme_id',
                    'article.superviseur_id',
                    'article.nom as nom_article'
                )
                ->get();

            if ($panierItems->isEmpty()) {
                abort(400, 'Votre panier est vide.');
            }

            // Vérification/Décrémentation du stock et calcul du total AVANT PROMO
            foreach ($panierItems as $item) {
                $quantiteRequise = $item->panier_quantite;

                $stockTotalDisponible = DB::table('stock')
                    ->where('produit_agricole_id', $item->produit_agricole_id)
                    ->lockForUpdate()
                    ->sum('quantite');

                if ($stockTotalDisponible < $quantiteRequise) {
                    abort(400, 'Stock insuffisant pour ' . $item->nom_article .
                        '. Disponible: ' . $stockTotalDisponible);
                }

                $stocks = DB::table('stock')
                    ->where('produit_agricole_id', $item->produit_agricole_id)
                    ->where('quantite', '>', 0)
                    ->orderByDesc('quantite')
                    ->get();

                $restantADeduire = $quantiteRequise;

                foreach ($stocks as $stock) {
                    if ($restantADeduire <= 0) break;

                    $quantiteDeduite = min($restantADeduire, $stock->quantite);

                    DB::table('stock')
                        ->where('id', $stock->id)
                        ->update(['quantite' => DB::raw('quantite - ' . $quantiteDeduite)]);

                    $restantADeduire -= $quantiteDeduite;
                }

                if ($restantADeduire > 0) {
                    abort(500, 'Erreur interne de stock après déduction.');
                }

                // Calcul du total AVANT PROMO
                $montantTotalAvantPromo += $item->prix * $item->panier_quantite;
            }

            $montantTotalAPayer = $request->total;

            // Création de la commande
            $commandeId = DB::table('commande')->insertGetId([
                'client_id' => $clientId,
                'adresse_livraison' => $request->adresse_livraison,
                'statut' => 'en_cours',
                'date_commande' => now(),
            ]);

            // Historique initial
            DB::table('historique_commandes')->insert([
                'commande_id' => $commandeId,
                'statut' => 'en_cours',
                'date_changement' => now(),
            ]);

            // Insérer les articles commandés
            foreach ($panierItems as $item) {
                DB::table('article_commande')->insert([
                    'commande_id' => $commandeId,
                    'article_id' => $item->article_id,
                    'quantite' => $item->panier_quantite,
                    'prix_unitaire' => $item->prix,
                ]);
            }

            // Créer le paiement (avec les données de réduction persistantes)
            DB::table('paiement')->insert([
                'commande_id' => $commandeId,
                'montant' => $montantTotalAPayer,
                'mode_paiement' => $request->mode_paiement,
                'statut' => 'en_attente',
                // ✅ ENREGISTREMENT DES DONNÉES DE RÉDUCTION (pour l'affichage in-app)
                'montant_initial' => $montantTotalAvantPromo,
                'reduction_pourcentage' => $reductionPourcentage,
            ]);

            // Créer la facture (utilise le montant final après promo)
            DB::table('facture')->insert([
                'commande_id' => $commandeId,
                'montant_total' => $montantTotalAPayer,
            ]);

            // Vider le panier
            DB::table('panier')->where('client_id', $clientId)->delete();

            // ========================================
            // NOTIFICATIONS AUX SUPERVISEURS
            // ========================================
            $client = DB::table('users')->where('id', $clientId)->first();
            $nomClient = $client ? $client->prenom . ' ' . $client->nom : 'Client #' . $clientId;

            $valeurReduction = $montantTotalAvantPromo - $montantTotalAPayer;

            // Préparation du message WHATSAPP détaillé
            $articlesList = $panierItems->map(function ($item) {
                return "• {$item->nom_article} x{$item->panier_quantite} (" . number_format($item->prix * $item->panier_quantite, 0, ',', ' ') . " FCFA)";
            })->implode("\n");

            $messageWhatsapp = "🔔 *NOUVELLE COMMANDE* 🔔\n\n"
                . "📦 Commande #{$commandeId}\n"
                . "👤 Client: {$nomClient}\n\n"
                . "🛒 *Articles commandés:*\n{$articlesList}\n\n"
                . "💵 Total avant promo: " . number_format($montantTotalAvantPromo, 0, ',', ' ') . " FCFA\n";

            if ($reductionPourcentage > 0) {
                $messageWhatsapp .= "🎁 Réduction ({$reductionPourcentage}%): -" . number_format($valeurReduction, 0, ',', ' ') . " FCFA\n";
            }

            $messageWhatsapp .= "💰 *TOTAL À PAYER:* " . number_format($montantTotalAPayer, 0, ',', ' ') . " FCFA\n"
                . "🏠 Livraison: {$request->adresse_livraison}\n"
                . "💳 Paiement: {$request->mode_paiement}\n\n"
                . "⏰ " . now()->format('d/m/Y H:i');

            // Récupération de tous les superviseurs concernés (produits agricoles, produits transformés, ou articles directs)
            $superviseursToNotify = collect();

            $produitAgricoleIds = $panierItems->pluck('produit_agricole_id')->filter();
            if ($produitAgricoleIds->isNotEmpty()) {
                $superviseursProdAgricoles = DB::table('produit_agricole')
                    ->join('ouvrier', 'produit_agricole.superviseur_id', '=', 'ouvrier.id')
                    ->join('users', 'ouvrier.user_id', '=', 'users.id')
                    ->whereIn('produit_agricole.id', $produitAgricoleIds)
                    ->select('users.id as superviseur_user_id', 'users.telephone', 'users.prenom', 'users.nom')
                    ->get();
                $superviseursToNotify = $superviseursToNotify->merge($superviseursProdAgricoles);
            }

            $produitTransformeIds = $panierItems->pluck('produit_transforme_id')->filter();
            if ($produitTransformeIds->isNotEmpty()) {
                $superviseursProdTransformes = DB::table('produit_transforme')
                    ->join('ouvrier', 'produit_transforme.superviseur_id', '=', 'ouvrier.id')
                    ->join('users', 'ouvrier.user_id', '=', 'users.id')
                    ->whereIn('produit_transforme.id', $produitTransformeIds)
                    ->select('users.id as superviseur_user_id', 'users.telephone', 'users.prenom', 'users.nom')
                    ->get();
                $superviseursToNotify = $superviseursToNotify->merge($superviseursProdTransformes);
            }

            $superviseurIdsArticles = $panierItems->pluck('superviseur_id')->filter();
            if ($superviseurIdsArticles->isNotEmpty()) {
                $superviseursDirects = DB::table('ouvrier')
                    ->join('users', 'ouvrier.user_id', '=', 'users.id')
                    ->whereIn('ouvrier.id', $superviseurIdsArticles)
                    ->select('users.id as superviseur_user_id', 'users.telephone', 'users.prenom', 'users.nom')
                    ->get();
                $superviseursToNotify = $superviseursToNotify->merge($superviseursDirects);
            }

            $superviseursToNotify = $superviseursToNotify->unique('superviseur_user_id');

            foreach ($superviseursToNotify as $superviseur) {

                // 1. Notification en BDD (Affichage dans l'application)
                $notificationMessage = "Commande de {$nomClient}. Total: " . number_format($montantTotalAPayer, 0, ',', ' ') . " FCFA";

                // ✅ Rendre la notification in-app explicite en cas de promotion
                if ($reductionPourcentage > 0) {
                    $notificationMessage = "Commande de {$nomClient} (PROMO -{$reductionPourcentage}%) - Total final: " . number_format($montantTotalAPayer, 0, ',', ' ') . " FCFA";
                }

                DB::table('notifications')->insert([
                    'user_id' => $superviseur->superviseur_user_id,
                    'sender_id' => $clientId,
                    'title' => 'Nouvelle commande #' . $commandeId,
                    'message' => $notificationMessage,
                    'type' => 'cible',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // 2. Notification WhatsApp
                if (!empty($superviseur->telephone)) {
                    \Log::info("Envoi WhatsApp au superviseur {$superviseur->prenom} {$superviseur->nom} ({$superviseur->telephone})");
                    $this->sendWhatsappNotification($superviseur->telephone, $messageWhatsapp);
                }
            }

            \Log::info("Commande #{$commandeId} créée. {$superviseursToNotify->count()} superviseurs notifiés.");
        });

        return redirect()->route('commande.index')->with('success', 'Commande passée avec succès !');
    }

    /**
     * Retourne les informations de la Sandbox Twilio pour l'onboarding
     */
    public function getTwilioOnboardingInstructions()
    {
        $fromNumber = env('TWILIO_WHATSAPP_FROM');
        $sandboxCode = env('TWILIO_SANDBOX_CODE', 'join <VOTRE_CODE_SANDBOX>');

        $instructions = [
            'sandboxNumber' => $fromNumber ? str_replace('whatsapp:', '', $fromNumber) : 'Non configuré',
            'joinCode' => $sandboxCode,
            'note' => 'Les superviseurs doivent envoyer ce code au numéro Twilio pour recevoir les notifications.',
            'steps' => [
                "1. Ouvrez WhatsApp",
                "2. Créez un nouveau message au numéro: " . str_replace('whatsapp:', '', $fromNumber),
                "3. Envoyez exactement: {$sandboxCode}",
                "4. Vous recevrez une confirmation de Twilio"
            ]
        ];

        return response()->json($instructions);
    }

    /**
     * Valide une commande (passage de 'en_cours' à 'validee')
     */
    public function validerCommande($commandeId)
    {
        $updated = DB::table('commande')
            ->where('id', $commandeId)
            ->where('statut', 'en_cours')
            ->update([
                'statut' => 'en_preparation', // Utilise un statut valide
                'updated_at' => now(),
            ]);

        if (!$updated) {
            return redirect()->back()->with('error', 'Commande non trouvée ou déjà validée.');
        }

        // Ajout à l'historique
        DB::table('historique_commandes')->insert([
            'commande_id' => $commandeId,
            'statut' => 'en_preparation',
            'date_changement' => now(),
        ]);

        // Mise à jour du paiement avec le statut CORRECT
        DB::table('paiement')
            ->where('commande_id', $commandeId)
            ->update([
                'statut' => 'effectue', // utilise 'effectue'
                'updated_at' => now(),
            ]);

        // Notification au client
        $commande = DB::table('commande')->where('id', $commandeId)->first();
        if ($commande) {
            DB::table('notifications')->insert([
                'user_id' => $commande->client_id,
                'sender_id' => Auth::id(),
                'title' => 'Commande validée',
                'message' => "Votre commande #{$commandeId} a été validée et est en préparation.",
                'type' => 'cible',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return redirect()->back()->with('success', "Commande #{$commandeId} validée avec succès.");
    }
}

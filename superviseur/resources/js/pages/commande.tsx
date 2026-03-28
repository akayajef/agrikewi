// ==========================================
// commande.tsx - MIS À JOUR
// ==========================================

import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card } from "@/components/ui/card";
import { 
    CheckCircle, 
    Package, 
    AlertTriangle, 
    CreditCard, 
    Clock, 
    Tag, 
    ShoppingCart,
    Loader2,
    User
} from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Paiement {
  id: number;
  montant: number;
  montant_initial: number;
  reduction_pourcentage: number;
  reduction_montant: number;
  mode_paiement: string;
  statut: string;
}

interface ArticleCommande {
    nom: string;
    quantite: number;
    prix_unitaire: number;
    prix_total: number;
}

interface Commande {
  id: number;
  client: {
    nom: string;
    prenom: string;
    nom_complet: string;
    email?: string;
    telephone?: string;
  } | null;
  adresse_livraison: string;
  date_commande: string;
  statut: string;
  paiements: Paiement[];
  articles: ArticleCommande[];
  total_articles: number;
}

export default function Commandes() {
  const { commandes: commandesProps } = usePage<{ commandes: Commande[] }>().props;
  const [commandes, setCommandes] = useState<Commande[]>(commandesProps);
  const [loading, setLoading] = useState<number | null>(null);

  const statutColorMap: Record<string, { bg: string; text: string; border: string }> = {
    'en_cours': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500' },
    'en_preparation': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500' },
    'livree': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500' },
    'annulee': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500' },
  };

  const getStatusColor = (statut: string) => statutColorMap[statut] || statutColorMap['en_cours'];

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'livree': return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'en_preparation': return <Package className="w-4 h-4 mr-1" />;
      case 'annulee': return <AlertTriangle className="w-4 h-4 mr-1" />;
      case 'en_cours':
      default: return <Clock className="w-4 h-4 mr-1" />;
    }
  };

  const updateCommandeStatut = (commandeId: number, newStatut: string) => {
    setLoading(commandeId);
    router.put(`/commandes/${commandeId}/statut`, { statut: newStatut }, {
      onSuccess: ({ props }) => {
        setCommandes(props.commandes as Commande[]); 
      },
      onError: (errors) => {
        console.error("Erreur de mise à jour du statut:", errors);
        alert("Erreur lors de la mise à jour du statut de la commande.");
      },
      onFinish: () => setLoading(null),
      preserveScroll: true,
    });
  };

  const updatePaiementStatut = (paiementId: number, newStatut: string) => {
    setLoading(paiementId);
    router.put(`/commandes/paiement/${paiementId}/statut`, { statut: newStatut }, {
      onSuccess: ({ props }) => {
        setCommandes(props.commandes as Commande[]);
      },
      onError: (errors) => {
        console.error("Erreur de mise à jour du paiement:", errors);
        alert("Erreur lors de la mise à jour du statut du paiement.");
      },
      onFinish: () => setLoading(null),
      preserveScroll: true,
    });
  };

  const renderPaymentDetails = (paiements: Paiement[]) => {
    if (paiements.length === 0) {
      return <p className="text-gray-500 text-sm">Aucun paiement enregistré.</p>;
    }

    const p = paiements[0];
    const isLoading = loading === p.id;

    return (
      <div className="space-y-1 mt-2">
        <p className="text-sm flex justify-between">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Prix Avant Réduction:</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">{Math.round(p.montant_initial)} FCFA</span>
        </p>

        {p.reduction_pourcentage > 0 && (
            <p className="text-sm flex justify-between border-b border-dashed pb-1">
                <span className="font-semibold flex items-center text-red-600 dark:text-red-400">
                    <Tag className="w-3 h-3 mr-1" /> Réduction ({p.reduction_pourcentage}%):
                </span>
                <span className="font-bold text-red-600 dark:text-red-400">-{Math.round(p.reduction_montant)} FCFA</span>
            </p>
        )}

        <p className="text-lg flex justify-between font-extrabold text-[#2D5F3F] dark:text-[#4CAF50] pt-1">
          <span>Prix Final (Net):</span>
          <span>{Math.round(p.montant)} FCFA</span>
        </p>
        <p className="text-xs text-gray-500 capitalize">Mode: {p.mode_paiement.replace('_', ' ')}</p>
        
        <div className="flex items-center space-x-2 mt-3">
            <label htmlFor={`paiement-statut-${p.id}`} className="text-sm font-medium">Statut Paiement:</label>
            <div className="relative">
                <select
                    id={`paiement-statut-${p.id}`}
                    value={p.statut}
                    onChange={e => updatePaiementStatut(p.id, e.target.value)}
                    disabled={isLoading}
                    className="border p-1 pr-8 rounded text-xs bg-white dark:bg-gray-700 appearance-none"
                >
                    <option value="en_attente">En attente</option>
                    <option value="effectue">Effectué</option>
                    <option value="annule">Annulé</option>
                </select>
                {isLoading && (
                    <Loader2 className="animate-spin w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2" />
                )}
            </div>
        </div>
      </div>
    );
  };
  
  const renderArticles = (articles: ArticleCommande[]) => (
      <ul className="space-y-1 text-sm mt-2">
          {articles.map((item, index) => (
              <li key={index} className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {item.nom} <span className="text-xs text-gray-500">x {item.quantite}</span>
                  </span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">{Math.round(item.prix_total)} FCFA</span>
              </li>
          ))}
      </ul>
  );
  
  return (
    <AppLayout title="Commandes Superviseur">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 flex items-center">
            <Package className="w-8 h-8 mr-3 text-[#2D5F3F]"/>
            Tableau de Bord des Commandes
        </h1>

        {commandes.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-lg text-gray-500 dark:text-gray-400">
                Aucune commande active à afficher.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {commandes.map(commande => (
                <motion.div
                  key={commande.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`p-5 shadow-xl border-t-4 ${getStatusColor(commande.statut).border} dark:border-gray-700 dark:bg-gray-800 h-full flex flex-col justify-between`}>
                    
                    <div>
                        <div className="flex justify-between items-start mb-3 border-b pb-3 border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-extrabold text-[#2D5F3F] dark:text-[#4CAF50] flex items-center">
                                Commande #{commande.id}
                            </h2>
                            <div className="text-right">
                                <span className={`text-sm font-semibold p-1 rounded ${getStatusColor(commande.statut).bg} ${getStatusColor(commande.statut).text}`}>
                                    {commande.statut.toUpperCase().replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        {/* ✅ INFORMATIONS CLIENT COMPLÈTES */}
                        <div className="space-y-2 mb-4 bg-[#F8F6F1] dark:bg-[#1B1B18] p-3 rounded-lg border-2 border-[#E8E6E0] dark:border-[#4A4A42]">
                            <p className="text-gray-900 dark:text-gray-100 font-bold text-lg flex items-center gap-2">
                                <User className="w-5 h-5 text-[#2D5F3F] dark:text-[#4CAF50]" />
                                {commande.client?.nom_complet || 'Client N/A'}
                            </p>
                            {commande.client?.email && (
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    📧 {commande.client.email}
                                </p>
                            )}
                            {commande.client?.telephone && (
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    📱 {commande.client.telephone}
                                </p>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start pt-2 border-t border-gray-300 dark:border-gray-600">
                                <Package className="w-4 h-4 mt-1 mr-2 flex-shrink-0" />
                                {commande.adresse_livraison}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {commande.date_commande}
                            </p>
                        </div>

                        {/* DÉTAILS ARTICLES */}
                        <div className="mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="text-md font-extrabold mb-1 flex items-center text-[#2D5F3F] dark:text-[#4CAF50]">
                                <ShoppingCart className="w-4 h-4 mr-2"/> Articles Commandés
                            </h3>
                            {renderArticles(commande.articles)} 
                            <p className="text-sm font-bold text-right mt-2 pt-2 border-t border-dashed">
                                Total: {Math.round(commande.total_articles)} FCFA
                            </p>
                        </div>

                        {/* DÉTAILS PAIEMENT ET RÉDUCTION */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="text-md font-extrabold mb-1 flex items-center text-[#2D5F3F] dark:text-[#4CAF50]">
                                <CreditCard className="w-4 h-4 mr-2"/> Paiement & Total
                            </h3>
                            {renderPaymentDetails(commande.paiements)}
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <label htmlFor={`commande-statut-${commande.id}`} className="block text-sm font-medium mb-2">
                            Statut de la Commande:
                        </label>
                        <div className="flex space-x-2">
                            <select
                                id={`commande-statut-${commande.id}`}
                                value={commande.statut}
                                onChange={e => updateCommandeStatut(commande.id, e.target.value)}
                                disabled={loading === commande.id}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-[#2D5F3F] focus:ring focus:ring-[#2D5F3F] focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="en_cours">En Cours</option>
                                <option value="en_preparation">En Préparation</option>
                                <option value="livree">Livrée</option>
                                <option value="annulee">Annulée</option>
                            </select>
                            {loading === commande.id && (
                                <Loader2 className="animate-spin w-6 h-6 text-[#2D5F3F] mt-1" />
                            )}
                        </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
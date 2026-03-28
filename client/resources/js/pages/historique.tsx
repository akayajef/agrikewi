import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Package, MapPin, CreditCard, Calendar } from 'lucide-react';

interface Article {
  article_commande_id: number;
  nom: string;
  quantite: number;
  prix_unitaire: number;
}

interface Paiement {
  montant: number;
  mode_paiement: string;
  statut: string;
}

interface Commande {
  id: number;
  adresse_livraison: string;
  date_commande: string;
  statut: string;
  articles: Article[];
  paiement: Paiement;
}

interface HistoriqueItem {
  id: string | number;
  commande_id: number;
  statut: string;
  date_changement: string;
  commande: Commande;
}

interface HistoriqueProps {
  historiques: HistoriqueItem[];
}

const getStatusClasses = (statut: string) => {
  switch (statut) {
    case 'livree':
      return 'bg-[#4CAF50] text-white';
    case 'en_preparation':
      return 'bg-[#FFB74D] text-[#2B2B26]';
    case 'annulee':
      return 'bg-[#E53935] text-white';
    case 'en_transit':
      return 'bg-[#4A90E2] text-white';
    default:
      return 'bg-[#E8E6E0] text-[#4A4A42] dark:bg-[#4A4A42] dark:text-[#E8E6E0]';
  }
};

const getPaymentStatusColor = (statut: string | undefined) => {
    if (statut === 'paye') return 'text-[#4CAF50]';
    if (statut === 'echec') return 'text-[#E53935]';
    return 'text-[#A8A599]';
}

const Historique: React.FC<HistoriqueProps> = ({ historiques }) => {
  return (
    <AppLayout>
      <Head title="Historique des commandes" />
      <div className="p-4 sm:p-6 md:p-10 bg-[#F8F6F1] dark:bg-[#1B1B18] min-h-screen">
        <div className="mb-10 pb-6 border-b-2 border-dashed border-[#E8E6E0] dark:border-[#4A4A42]">
          <h1 className="text-4xl font-extrabold text-[#2D5F3F] dark:text-[#4CAF50] flex items-center gap-3">
            <Package className="w-10 h-10" />
            Historique des Commandes
          </h1>
          <p className="text-lg text-[#8B6F47] dark:text-[#A0826D] mt-2 font-medium">
            Consultez toutes vos commandes passées
          </p>
        </div>

        {historiques.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-[#2B2B26] rounded-2xl shadow-xl border-t-4 border-[#8B6F47]">
            <Package className="w-20 h-20 text-[#A8A599] mb-6" />
            <p className="text-2xl text-[#A8A599] font-bold mb-2">Aucune commande trouvée.</p>
            <p className="text-sm text-[#A8A599]">Passez votre première commande pour voir l'historique ici.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {historiques.map((histo) => (
              <div
                key={histo.id}
                className="rounded-2xl p-6 shadow-lg border-t-4 border-[#4CAF50] bg-white dark:bg-[#2B2B26] transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-[#2D5F3F]"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-5 pb-4 border-b-2 border-dashed border-[#E8E6E0] dark:border-[#4A4A42]">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#2D5F3F] dark:text-[#4CAF50] mb-1">
                      Commande #{histo.commande_id}
                    </h2>
                    <p className="text-xs text-[#8B6F47] dark:text-[#A0826D] font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(histo.date_changement).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Statut et Total */}
                <div className="flex justify-between items-center mb-5 p-4 rounded-xl bg-[#F8F6F1] dark:bg-[#1B1B18] border-2 border-[#E8E6E0] dark:border-[#4A4A42]">
                  <div className={`text-xs font-bold px-3 py-2 rounded-full uppercase tracking-wider ${getStatusClasses(histo.statut)}`}>
                    {histo.statut.replace('_', ' ')}
                  </div>
                  <div className="text-xl font-extrabold text-[#2D5F3F] dark:text-[#4CAF50]">
                    {Math.round(histo.commande.paiement?.montant)} F
                  </div>
                </div>

                {/* Détails */}
                <div className="space-y-4">
                  {/* Adresse */}
                  <div className="text-sm">
                    <p className="font-bold text-[#2B2B26] dark:text-[#E8E6E0] mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#8B6F47]" />
                      Adresse de livraison
                    </p>
                    <p className='text-[#4A4A42] dark:text-[#A8A599] truncate font-medium bg-[#F8F6F1] dark:bg-[#1B1B18] p-2 rounded-lg' title={histo.commande.adresse_livraison||'N/A'}>
                      {histo.commande.adresse_livraison||'N/A'}
                    </p>
                  </div>

                  {/* Articles */}
                  <div className="border-t-2 border-dashed border-[#E8E6E0] dark:border-[#4A4A42] pt-4">
                    <p className="font-bold text-[#2B2B26] dark:text-[#E8E6E0] mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#8B6F47]" />
                      Articles ({histo.commande.articles.length})
                    </p>
                    {histo.commande.articles.length > 0 ? (
                      <ul className="text-sm space-y-2 max-h-32 overflow-y-auto pr-2">
                        {histo.commande.articles.map((article) => (
                          <li key={article.article_commande_id} className='flex justify-between items-center text-[#4A4A42] dark:text-[#A8A599] bg-[#F8F6F1] dark:bg-[#1B1B18] p-2 rounded-lg hover:bg-[#E8E6E0] dark:hover:bg-[#4A4A42] transition-colors'>
                            <span className="font-medium truncate flex-1">{article.nom}</span>
                            <span className='font-bold text-xs bg-[#8B6F47] text-white px-2 py-1 rounded-full ml-2'>
                              {article.quantite} x {Math.round(article.prix_unitaire)}F
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm italic text-[#A8A599]">Aucun article.</p>
                    )}
                  </div>

                  {/* Paiement */}
                  <div className="pt-4 border-t-2 border-dashed border-[#E8E6E0] dark:border-[#4A4A42] text-sm">
                    <p className="font-bold text-[#2B2B26] dark:text-[#E8E6E0] mb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#8B6F47]" />
                      Paiement
                    </p>
                    <div className='bg-[#F8F6F1] dark:bg-[#1B1B18] p-3 rounded-lg space-y-1'>
                      <div className="flex justify-between">
                        <span className="text-[#4A4A42] dark:text-[#A8A599]">Mode:</span>
                        <span className='font-bold text-[#2B2B26] dark:text-[#E8E6E0]'>
                          {histo.commande.paiement?.mode_paiement || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#4A4A42] dark:text-[#A8A599]">Statut:</span>
                        <span className={`font-extrabold ${getPaymentStatusColor(histo.commande.paiement?.statut)}`}>
                          {histo.commande.paiement?.statut || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Historique;
import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import AppLayout from '@/layouts/app-layout';
import { TrendingUp, ShoppingBag, ShoppingCart, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface Article { article_commande_id: number; nom: string; quantite: number; prix_unitaire: number; }
interface Paiement { montant: number; mode_paiement: string; statut: string; }
interface CommandeAplatie { id: number; adresse_livraison: string; date_commande: string; statut: string; articles: Article[]; paiement: Paiement; date_changement: string; }
interface Notification { id: number; title: string; message: string; type: string; created_at: string; }
interface Stat { label: string; value: number; }
interface DashboardProps { stats: Stat[]; dernieresCommandes: CommandeAplatie[]; notifications: Notification[]; prenom: string; }

const getGreeting = (name: string) => {
  const hour = new Date().getHours();
  const salutation = hour >= 5 && hour < 12 ? "Bonjour" : hour >= 12 && hour < 18 ? "Bon après-midi" : "Bonsoir";
  return `${salutation}, ${name.split(' ')[0]} !`;
};

const StatusBadge: React.FC<{ statut: string }> = ({ statut }) => {
  const s = statut?.toLowerCase().replace(/ /g, '_') ?? 'inconnu';
  let colorClass = 'bg-[#E8E6E0] text-[#4A4A42] dark:bg-[#4A4A42] dark:text-[#E8E6E0]';
  if (['livree','terminé','succès'].includes(s)) colorClass='bg-[#4CAF50] text-white';
  else if (['en_preparation','en_cours'].includes(s)) colorClass='bg-[#FFB74D] text-[#2B2B26]';
  else if (['annulee','echec'].includes(s)) colorClass='bg-[#E53935] text-white';
  else if (['en_attente'].includes(s)) colorClass='bg-[#4A90E2] text-white';
  return <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full capitalize ${colorClass}`}>{s.replace(/_/g,' ')}</span>;
};

const StatCard: React.FC<{ stat: Stat }> = ({ stat }) => {
  const getIcon = (label: string) => {
    switch(label){
      case "Total dépensé": return <TrendingUp className="w-8 h-8 text-[#4CAF50]" />;
      case "Articles dans le panier": return <ShoppingCart className="w-8 h-8 text-[#F5A623]" />;
      case "Commandes en cours": return <ShoppingBag className="w-8 h-8 text-[#8B6F47]" />;
      default: return null;
    }
  };
  const formattedValue = stat.label==="Total dépensé" ? `${Math.round(stat.value).toLocaleString('fr-FR')} FCFA` : stat.value.toLocaleString();
  return (
    <div className="flex items-center justify-between border-t-4 border-[#4CAF50] rounded-2xl p-8 shadow-lg hover:shadow-2xl bg-white dark:bg-[#2B2B26] transition-all duration-300 hover:scale-105">
      <div>
        <p className="text-sm font-bold text-[#8B6F47] dark:text-[#A0826D] mb-2 uppercase tracking-wide">{stat.label}</p>
        <p className="text-4xl font-extrabold text-[#2D5F3F] dark:text-[#4CAF50]">{formattedValue}</p>
      </div>
      {getIcon(stat.label)}
    </div>
  );
};

const LatestOrdersTable: React.FC<{ commandes: CommandeAplatie[] }> = ({ commandes }) => {
  if (!commandes.length) return (
    <div className="text-center py-16 bg-[#F8F6F1] dark:bg-[#1B1B18] rounded-xl">
      <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[#A8A599]" />
      <p className="text-[#A8A599]">Aucune commande récente.</p>
    </div>
  );
  return (
    <div className="overflow-x-auto border-2 border-[#E8E6E0] dark:border-[#4A4A42] rounded-xl shadow-sm">
      <table className="min-w-full divide-y-2 divide-[#E8E6E0] dark:divide-[#4A4A42]">
        <thead className="bg-[#F8F6F1] dark:bg-[#1B1B18]">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-[#2D5F3F] dark:text-[#4CAF50] uppercase tracking-wider">Date</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-[#2D5F3F] dark:text-[#4CAF50] uppercase tracking-wider">Statut</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-[#2D5F3F] dark:text-[#4CAF50] uppercase tracking-wider">Articles & Total</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-[#2D5F3F] dark:text-[#4CAF50] uppercase tracking-wider hidden md:table-cell">Adresse / Paiement</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-[#2B2B26] divide-y-2 divide-[#E8E6E0] dark:divide-[#4A4A42] text-[#2B2B26] dark:text-[#E8E6E0]">
          {commandes.map(cmd => {
            const totalArticles = cmd.articles?.reduce((sum,a)=>sum+a.quantite,0)||0;
            return (
              <tr key={cmd.id} className="hover:bg-[#F8F6F1] dark:hover:bg-[#1B1B18] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{new Date(cmd.date_commande).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge statut={cmd.statut} /></td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-[#2D5F3F] dark:text-[#4CAF50]">{totalArticles} article(s)</p>
                  <p className="text-xs text-[#8B6F47] dark:text-[#A0826D] font-medium">Total: {Math.round(cmd.paiement?.montant||0).toLocaleString('fr-FR')} FCFA</p>
                </td>
                <td className="px-6 py-4 text-sm text-[#4A4A42] dark:text-[#A8A599] hidden md:table-cell">
                  <p className="truncate w-40 font-medium" title={cmd.adresse_livraison||'N/A'}>{cmd.adresse_livraison||'N/A'}</p>
                  <p className="flex items-center gap-2 mt-1">Paiement: <StatusBadge statut={cmd.paiement?.statut||'N/A'} /></p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ stats, dernieresCommandes, notifications, prenom }) => {
  const greeting = getGreeting(prenom);

  const markAsRead = (id: number) => {
    Inertia.post('/notifications/mark-as-read', { notification_id: id });
  };

  const renderIcon = (type: string) => {
    const cls="w-6 h-6 mr-3 flex-shrink-0";
    switch(type.toLowerCase()){
      case 'success': return <CheckCircle className={`${cls} text-[#4CAF50]`} />;
      case 'warning': return <AlertCircle className={`${cls} text-[#FFB74D]`} />;
      case 'error': return <AlertCircle className={`${cls} text-[#E53935]`} />;
      default: return <Info className={`${cls} text-[#4A90E2]`} />;
    }
  };

  return (
    <AppLayout>
      <div className="p-6 bg-[#F8F6F1] dark:bg-[#1B1B18] rounded-2xl min-h-screen">
        <div className="mb-8 pb-6 border-b-2 border-dashed border-[#E8E6E0] dark:border-[#4A4A42]">
          <h1 className="text-4xl font-extrabold text-[#2D5F3F] dark:text-[#4CAF50] mb-2">{greeting}</h1>
          <p className="text-xl font-semibold text-[#8B6F47] dark:text-[#A0826D]">Bienvenue sur votre tableau de bord agricole.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((s,i)=><StatCard key={i} stat={s} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="p-8 bg-white dark:bg-[#2B2B26] rounded-2xl shadow-xl border-t-4 border-[#8B6F47]">
              <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-dashed border-[#E8E6E0] dark:border-[#4A4A42]">
                <h2 className="text-2xl font-bold text-[#2D5F3F] dark:text-[#4CAF50] flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6" />
                  3 Dernières Commandes
                </h2>
                <a 
                  href="/historique" 
                  className="px-6 py-3 bg-[#2D5F3F] hover:bg-[#1B3A28] text-white text-sm font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Voir tout l'historique
                </a>
              </div>
              <LatestOrdersTable commandes={dernieresCommandes} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="p-8 bg-white dark:bg-[#2B2B26] rounded-2xl shadow-xl border-t-4 border-[#F5A623] h-full">
              <h2 className="text-2xl font-bold mb-6 text-[#2D5F3F] dark:text-[#4CAF50] pb-4 border-b-2 border-dashed border-[#E8E6E0] dark:border-[#4A4A42]">
                Dernières Notifications
              </h2>
              {notifications.length === 0 && (
                <div className="text-center py-12">
                  <Info className="w-12 h-12 mx-auto mb-3 text-[#A8A599]" />
                  <p className="text-[#A8A599]">Aucune nouvelle notification.</p>
                </div>
              )}
              <ul className="space-y-4">
                {notifications.map(n=>(
                  <li 
                    key={n.id} 
                    className="flex items-start border-b-2 border-dashed border-[#E8E6E0] dark:border-[#4A4A42] pb-4 last:border-b-0 last:pb-0 hover:bg-[#F8F6F1] dark:hover:bg-[#1B1B18] p-3 rounded-lg transition-colors"
                  >
                    {renderIcon(n.type)}
                    <div className="flex-grow">
                      <p className="font-bold text-[#2B2B26] dark:text-[#E8E6E0] leading-tight mb-1">{n.title}</p>
                      <p className="text-sm text-[#4A4A42] dark:text-[#A8A599] mb-2">{n.message}</p>
                      <small className="text-xs text-[#8B6F47] dark:text-[#A0826D] font-medium">
                        {new Date(n.created_at).toLocaleString('fr-FR')}
                      </small>
                      <button
                        onClick={()=>markAsRead(n.id)}
                        className="mt-2 text-xs text-[#4A90E2] hover:text-[#2C5F7D] hover:underline font-bold transition-colors"
                      >
                        Marquer comme lu
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
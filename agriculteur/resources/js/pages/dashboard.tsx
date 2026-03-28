import React from "react";
import AppLayout from "@/layouts/app-layout";

// --- Interfaces (non modifiées) ---
interface StockType {
  id: number;
  produit: string;
  quantite: number;
  entrepot: string;
  statut_stock: string;
}

interface DashboardProps {
  notificationsCount: number;
  tachesCount: number;
  tachesTermineesCount: number;
  plantationsCount: number;
  stocks: StockType[];
  type: string;
}

// --- Composant d'icône utilitaire (Inline SVG) ---
// Utiliser des SVG légers pour représenter les métriques
const IconWrapper: React.FC<{ children: React.ReactNode; color: string }> = ({
  children,
  color,
}) => (
  <div className={`p-3 rounded-full ${color} inline-flex items-center justify-center shadow-lg`}>
    {children}
  </div>
);

// --- Composant de Badge de Statut pour la lisibilité ---
const StockStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isLow = status.toLowerCase() === "faible";
  const baseClasses =
    "px-3 py-1 text-xs font-medium rounded-full transition-all duration-300";

  if (isLow) {
    return (
      <span className={`${baseClasses} bg-red-100 text-red-700 ring-1 ring-red-300`}>
        {status.toUpperCase()}
      </span>
    );
  } else {
    return (
      <span className={`${baseClasses} bg-green-100 text-green-700 ring-1 ring-green-300`}>
        {status.toUpperCase()}
      </span>
    );
  }
};


const Dashboard: React.FC<DashboardProps> = ({
  notificationsCount,
  tachesCount,
  tachesTermineesCount,
  plantationsCount,
  stocks,
  type,
}) => {
  // Styles pour les cartes de métriques, maintenant avec dark:bg-gray-800
  const cardClasses =
    "bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 p-6 border-t-4";

  return (
    <AppLayout>
      {/* Fond principal adapté au mode sombre */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
        
        {/* En-tête du Dashboard */}
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
            Tableau de Bord
        </h1>

        {/* === Section des compteurs (Cards modernes) === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          
          {/* Carte 1: Notifications */}
          <div className={`${cardClasses} border-t-blue-500`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Notifications reçues
              </h2>
              <IconWrapper color="bg-blue-100">
                {/* Icône de Cloche */}
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.16 6.78 6 8.358 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </IconWrapper>
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-4">
              {notificationsCount || 0}
            </p>
          </div>

          {/* Carte 2: Tâches en cours */}
          <div className={`${cardClasses} border-t-yellow-500`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tâches en cours
              </h2>
              <IconWrapper color="bg-yellow-100">
                {/* Icône de sablier/temps */}
                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </IconWrapper>
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-4">
              {tachesCount || 0}
            </p>
          </div>

          {/* Carte 3: Tâches terminées */}
          <div className={`${cardClasses} border-t-green-500`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tâches terminées
              </h2>
              <IconWrapper color="bg-green-100">
                {/* Icône de coche */}
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </IconWrapper>
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-4">
              {tachesTermineesCount || 0}
            </p>
          </div>

          {/* Carte 4: Plantations */}
          <div className={`${cardClasses} border-t-teal-500`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Plantations Actives
              </h2>
              <IconWrapper color="bg-teal-100">
                {/* Icône de feuille */}
                <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-8v8m-4-8v8m9-5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v3z" />
                </svg>
              </IconWrapper>
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-4">
              {plantationsCount || 0}
            </p>
          </div>

          {/* Carte 5: Intrants en stock */}
          <div className={`${cardClasses} border-t-orange-500`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Intrants en stock
              </h2>
              <IconWrapper color="bg-orange-100">
                {/* Icône de boîte/stock */}
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10m0 0h16M4 17l.583-.417M18.832 5.168A2 2 0 0017.025 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 001.732-1.025l2.768-3.954A1 1 0 0022 13V9a1 1 0 00-.332-.768l-2.67-1.928z" />
                </svg>
              </IconWrapper>
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-4">
              {stocks.length || 0}
            </p>
          </div>
        </div>

        {/* --- Ligne de séparation --- */}
        <hr className="my-8 border-gray-200 dark:border-gray-700" />


        {/* === Tableau du stock (Design de Carte de Données) === */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
            Inventaire des Intrants (Stock)
          </h2>

          {stocks.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full text-sm text-gray-700 dark:text-gray-300 divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold">Produit</th>
                    <th className="px-6 py-3 text-left font-bold">Quantité</th>
                    <th className="px-6 py-3 text-left font-bold">Entrepôt</th>
                    <th className="px-6 py-3 text-left font-bold">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {stocks.map((stock) => (
                    <tr
                      key={stock.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {stock.produit}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {stock.quantite}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {stock.entrepot}
                      </td>
                      <td className="px-6 py-4">
                        <StockStatusBadge status={stock.statut_stock} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-gray-500 dark:text-gray-400 text-md italic">
                  Aucun intrant n'est enregistré en stock pour le moment.
                  Veuillez ajouter des éléments pour les voir apparaître ici.
                </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;

import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
// En React, on va utiliser une simple balise <button> stylisée avec Tailwind
// car nous ne générons pas de fichier `ui/button.tsx` séparé.
import { Inertia } from '@inertiajs/inertia';

// --- Interfaces (non modifiées) ---
interface Tache {
  id: number;
  description: string;
  date_creation: string;
  date_echeance: string | null;
  statut: 'en_cours' | 'terminee' | 'retard';
}

// --- Composant utilitaire pour afficher le statut ---
const StatusBadge: React.FC<{ statut: Tache['statut'] }> = ({ statut }) => {
  let colorClasses = '';
  let text = statut.replace('_', ' ');

  if (statut === 'retard') {
    colorClasses = 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400';
  } else if (statut === 'en_cours') {
    colorClasses = 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400';
  } else {
    // Si la tâche était dans la liste, mais on conserve la logique complète
    colorClasses = 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400';
  }

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold uppercase rounded-full tracking-wider ${colorClasses}`}
    >
      {text}
    </span>
  );
};

const TachesPage: React.FC = () => {
  // Récupère les tâches des props de la page (Inertia)
  const { taches: tachesProps } = usePage<{ taches: Tache[] }>().props;

  // Filtre uniquement les tâches non terminées
  const [localTaches, setLocalTaches] = useState(
    tachesProps.filter(t => t.statut !== 'terminee')
  );

  const terminerTache = (id: number) => {
    // Envoi de la requête POST au serveur
    Inertia.post(`/taches/${id}/terminer`, {}, { preserveScroll: true });

    // Supprime la tâche de la liste locale immédiatement
    setLocalTaches(prev => prev.filter(t => t.id !== id));
  };

  // --- Composant de bouton stylisé (Terminer) ---
  const TerminerButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
    <button
      {...props}
      className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                 bg-green-600 text-white hover:bg-green-700 h-10 w-10 p-0 shadow-md hover:shadow-lg dark:ring-offset-gray-900 flex-shrink-0"
      title="Marquer comme terminée"
    >
      {/* Icône de coche dans un cercle */}
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </button>
  );

  return (
    <AppLayout>
      {/* Fond principal adapté au mode sombre */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
          Gestion des Tâches ({localTaches.length} en cours)
        </h1>

        {localTaches.length === 0 && (
          <div className="p-10 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              Félicitations ! Aucune tâche n'est en cours pour le moment.
            </p>
          </div>
        )}

        <ul className="space-y-4">
          {localTaches.map(tache => {
            const isRetard = tache.statut === 'retard';
            
            // Classes conditionnelles pour la bordure latérale (couleur principale)
            const borderClasses = isRetard
              ? 'border-red-500' // Rouge pour Retard
              : 'border-blue-500'; // Bleu pour En Cours
              
            const dateEcheance = tache.date_echeance 
              ? new Date(tache.date_echeance).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              : 'Non définie';

            return (
              <li
                key={tache.id}
                // Carte moderne et épurée
                className={`p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center 
                            transition-all duration-300 transform hover:shadow-xl hover:-translate-y-0.5
                            border-l-4 ${borderClasses}`}
              >
                <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                  <p className="font-bold text-xl text-gray-900 dark:text-white">
                    {tache.description}
                  </p>
                  
                  {/* Conteneur pour les badges et détails */}
                  <div className="flex items-center space-x-4 mt-2">
                    <StatusBadge statut={tache.statut} />
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold mr-1">Échéance:</span>
                      {dateEcheance}
                    </p>
                  </div>
                </div>

                {/* Bouton Terminer aligné à droite sur desktop */}
                <TerminerButton onClick={() => terminerTache(tache.id)} />
              </li>
            );
          })}
        </ul>
      </div>
    </AppLayout>
  );
};

export default TachesPage;

import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';

// --- Interfaces ---
interface ConseilType {
  message: string;
  estWeekend: boolean;
}

// --- Composant d'icône utilitaire ---
const IconWrapper: React.FC<{ children: React.ReactNode; color: string }> = ({
  children,
  color,
}) => (
  <div className={`p-3 rounded-full ${color} inline-flex items-center justify-center shadow-lg`}>
    {children}
  </div>
);

// --- Composant de Badge de Saison ---
const SaisonBadge: React.FC<{ saison: string }> = ({ saison }) => {
  const getSaisonStyle = () => {
    switch (saison) {
      case 'seche':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 ring-1 ring-yellow-300 dark:ring-yellow-700';
      case 'petitePluie':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 ring-1 ring-blue-300 dark:ring-blue-700';
      case 'grandePluie':
        return 'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-300 dark:ring-cyan-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getSaisonNom = () => {
    const noms: Record<string, string> = {
      seche: 'Saison Sèche',
      petitePluie: 'Petite Saison des Pluies',
      grandePluie: 'Grande Saison des Pluies'
    };
    return noms[saison] || saison;
  };

  return (
    <span className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${getSaisonStyle()}`}>
      {getSaisonNom()}
    </span>
  );
};

const ConseilAgricole: React.FC = () => {
  const [conseilDuJour, setConseilDuJour] = useState<ConseilType | null>(null);
  const [saison, setSaison] = useState<string>('');

  // Conseils par saison (saisons africaines)
  const conseilsParSaison: Record<string, string[]> = {
    seche: [
      "Privilégiez l'irrigation goutte à goutte pour économiser l'eau pendant la saison sèche.",
      "Protégez vos cultures avec du paillage pour conserver l'humidité du sol.",
      "C'est le moment idéal pour préparer les terres avant les premières pluies.",
      "Vérifiez et réparez vos systèmes d'irrigation avant la grande chaleur.",
      "Plantez des cultures résistantes à la sécheresse comme le mil et le sorgho.",
      "Stockez l'eau dans des citernes pour la période la plus sèche.",
      "Appliquez du compost pour améliorer la rétention d'eau du sol.",
      "Taillez les arbres fruitiers pendant cette période de repos végétatif.",
      "Désherbage manuel recommandé pour préserver l'humidité du sol.",
      "Surveillez les parasites qui se développent en période sèche.",
      "Récoltez les cultures de contre-saison irriguées.",
      "Planifiez votre calendrier cultural pour la saison des pluies.",
      "Entretenez vos outils agricoles pendant cette période moins intense.",
      "Formez-vous sur les nouvelles techniques d'agriculture adaptées au climat sec.",
      "Constituez vos stocks de semences pour la prochaine saison.",
      "Pratiquez la culture en buttes pour mieux gérer l'eau.",
      "Installez des brise-vents pour protéger vos cultures du vent sec.",
      "Contrôlez l'érosion éolienne en maintenant une couverture végétale.",
      "Récoltez et conservez le fourrage pour vos animaux.",
      "Vérifiez la qualité de vos semences stockées.",
      "Préparez des bassins de rétention d'eau pour la saison des pluies.",
      "Enrichissez le sol avec du fumier bien décomposé.",
      "Plantez des haies vives pour créer un microclimat favorable.",
      "Nettoyez et désinfectez les serres et tunnels.",
      "Récoltez les légumes de saison sèche comme les tomates et les oignons."
    ],
    petitePluie: [
      "Semez rapidement après les premières pluies pour profiter de l'humidité.",
      "Privilégiez les cultures à cycle court comme le maïs et les haricots.",
      "Surveillez l'apparition de maladies fongiques avec l'humidité.",
      "Désherbez régulièrement car les mauvaises herbes poussent vite.",
      "Vérifiez le drainage de vos parcelles pour éviter l'engorgement.",
      "Appliquez l'engrais organique avant les semis.",
      "Installez des tuteurs pour les cultures grimpantes.",
      "Surveillez les limaces et escargots qui prolifèrent avec la pluie.",
      "Pratiquez le sarclage pour aérer le sol et favoriser la croissance.",
      "Semez des légumes-feuilles qui poussent rapidement.",
      "Protégez les jeunes plants contre les fortes pluies.",
      "Mettez en place la rotation des cultures.",
      "Traitez préventivement contre les maladies cryptogamiques.",
      "Récoltez l'eau de pluie dans des citernes pour la saison sèche.",
      "Semez du niébé entre les rangées de maïs (culture associée).",
      "Buttez les plants pour renforcer leur ancrage.",
      "Contrôlez les adventices avant qu'elles ne montent en graines.",
      "Appliquez du purin d'ortie comme fertilisant naturel.",
      "Aérez vos cultures sous serre pour éviter l'excès d'humidité.",
      "Surveillez et traitez les chenilles défoliatrices.",
      "Éclaircissez les semis trop denses.",
      "Installez des pièges à insectes nuisibles.",
      "Plantez des boutures pendant cette période humide.",
      "Préparez des planches de cultures surélevées dans les zones inondables.",
      "Vérifiez la santé des racines de vos cultures régulièrement."
    ],
    grandePluie: [
      "Renforcez le désherbage car c'est la période de croissance maximale.",
      "Surveillez attentivement les maladies liées à l'humidité excessive.",
      "Éclaircissez vos cultures pour une meilleure circulation de l'air.",
      "Apportez un engrais de couverture pour soutenir la croissance.",
      "Protégez vos cultures contre les inondations avec des drains.",
      "Traitez biologiquement les mildiou et autres champignons.",
      "Récoltez les cultures à maturité avant les pluies trop abondantes.",
      "Installez des systèmes de drainage si nécessaire.",
      "Surveillez les ravageurs qui se multiplient rapidement.",
      "Pincez les extrémités des plants pour favoriser la ramification.",
      "Attachez les plants sensibles au vent pour éviter la casse.",
      "Pratiquez le paillage entre les rangs pour limiter les éclaboussures.",
      "Contrôlez les nématodes qui prolifèrent en sol humide.",
      "Récoltez les fruits avant leur sur-maturité.",
      "Semez des cultures de succession pour des récoltes continues.",
      "Aérez bien les zones de stockage pour éviter les moisissures.",
      "Appliquez des décoctions de plantes comme répulsifs naturels.",
      "Surveillez la pollinisation des cultures fruitières.",
      "Préparez les zones de séchage des récoltes à venir.",
      "Contrôlez les fourmis coupeuses de feuilles.",
      "Installez des filets de protection contre les oiseaux.",
      "Vérifiez l'état des racines exposées par l'érosion.",
      "Récoltez et stockez les tubercules en bon état.",
      "Planifiez les cultures de contre-saison pour la période sèche.",
      "Nettoyez régulièrement les canaux d'irrigation et de drainage.",
      "Appliquez du soufre contre l'oïdium si nécessaire.",
      "Surveillez les signes de carences nutritionnelles.",
      "Préparez des abris temporaires pour protéger les jeunes plants.",
      "Contrôlez les termites qui endommagent les cultures.",
      "Échelonnez vos plantations pour étaler les récoltes."
    ]
  };

  const getSaison = (mois: number): string => {
    if (mois >= 11 || mois <= 3) return 'seche';
    if (mois >= 4 && mois <= 6) return 'petitePluie';
    if (mois >= 7 && mois <= 10) return 'grandePluie';
    return 'seche';
  };

  const getIconeSaison = (saisonKey: string) => {
    const icones: Record<string, JSX.Element> = {
      seche: (
        <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      petitePluie: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
      grandePluie: (
        <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    };
    return icones[saisonKey] || icones.seche;
  };

  const getConseilAleatoire = () => {
    const maintenant = new Date();
    const jour = maintenant.getDay();
    const mois = maintenant.getMonth() + 1;
    
    if (jour === 0 || jour === 6) {
      setConseilDuJour({
        message: "Profitez de votre weekend ! Les conseils agricoles reprennent en semaine. 🌿",
        estWeekend: true
      });
      setSaison('');
      return;
    }

    const saisonActuelle = getSaison(mois);
    setSaison(saisonActuelle);
    
    const conseils = conseilsParSaison[saisonActuelle];
    const indexAleatoire = Math.floor(Math.random() * conseils.length);
    
    setConseilDuJour({
      message: conseils[indexAleatoire],
      estWeekend: false
    });
  };

  useEffect(() => {
    getConseilAleatoire();
  }, []);

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('fr-FR', options);
  };

  const cardClasses = "bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 p-6 border-t-4";

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
        
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
          Conseil Agricole du Jour
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className={`${cardClasses} border-t-blue-500`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date du jour
              </h2>
              <IconWrapper color="bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </IconWrapper>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
              {formatDate()}
            </p>
          </div>

          {!conseilDuJour?.estWeekend && saison && (
            <div className={`${cardClasses} border-t-green-500`}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Saison Actuelle
                </h2>
                <IconWrapper color="bg-green-100">
                  {getIconeSaison(saison)}
                </IconWrapper>
              </div>
              <div className="mt-4">
                <SaisonBadge saison={saison} />
              </div>
            </div>
          )}

          <div className={`${cardClasses} border-t-teal-500`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type de conseil
              </h2>
              <IconWrapper color="bg-teal-100">
                <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </IconWrapper>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
              {conseilDuJour?.estWeekend ? "Weekend" : "Quotidien"}
            </p>
          </div>
        </div>

        <hr className="my-8 border-gray-200 dark:border-gray-700" />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Votre Conseil Agricole
            </h2>
            {!conseilDuJour?.estWeekend && (
              <button
                onClick={getConseilAleatoire}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
              >
                Nouveau conseil
              </button>
            )}
          </div>

          <div className={`${conseilDuJour?.estWeekend ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-green-500 to-green-600'} rounded-xl p-8 text-white shadow-lg`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xl leading-relaxed flex-1">
                {conseilDuJour?.message || "Chargement..."}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
            📅 Calendrier des Saisons Agricoles en Afrique
          </h2>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-sm text-gray-700 dark:text-gray-300 divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left font-bold">Saison</th>
                  <th className="px-6 py-3 text-left font-bold">Période</th>
                  <th className="px-6 py-3 text-left font-bold">Caractéristiques</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <IconWrapper color="bg-yellow-100">
                        {getIconeSaison('seche')}
                      </IconWrapper>
                      <span className="ml-3">Saison Sèche</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    Novembre - Mars
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    Irrigation, conservation de l'eau, préparation des terres
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <IconWrapper color="bg-blue-100">
                        {getIconeSaison('petitePluie')}
                      </IconWrapper>
                      <span className="ml-3">Petite Saison des Pluies</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    Avril - Juin
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    Semis rapides, cultures à cycle court, surveillance des maladies
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <IconWrapper color="bg-cyan-100">
                        {getIconeSaison('grandePluie')}
                      </IconWrapper>
                      <span className="ml-3">Grande Saison des Pluies</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    Juillet - Octobre
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    Désherbage intensif, drainage, protection contre l'humidité
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              💡 <span className="font-semibold">Note :</span> Les conseils sont adaptés aux saisons agricoles africaines et changent automatiquement selon la période de l'année.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              ⏰ <span className="font-semibold">Weekend :</span> Pas de conseils le samedi et le dimanche - profitez de votre repos bien mérité !
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ConseilAgricole;
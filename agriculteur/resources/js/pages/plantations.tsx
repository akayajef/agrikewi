import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
// Simulation de usePage et Inertia pour l'environnement Canvas
// Si vous utilisez Inertia/Laravel, retirez la simulation et utilisez vos imports réels.
const usePage = (data: any) => ({ props: data });
const Inertia = { post: (url: string) => console.log(`Simulating POST to ${url}`) };

// --- Interfaces (non modifiées) ---
interface Zone {
    id: number;
    nom: string;
}

interface ProduitAgricole {
    id: number;
    nom: string;
}

interface Plantation {
    id: number;
    nom: string;
    type_sol?: string | null;
    perimetre?: number | null;
    date_plantation?: string | null;
    zone?: Zone | null;
    produitAgro?: ProduitAgricole | null;
}

interface PlantationsProps {
    plantations: Plantation[];
}

// Les données fictives ont été supprimées. Le composant s'appuie désormais uniquement sur les props.

export default function Plantations({ plantations }: PlantationsProps) {
    
    const [selectedPlantation, setSelectedPlantation] = useState<Plantation | null>(null);

    // Fonction de formatage pour la date (ajoute la prise en charge de l'absence de date)
    const formatDate = (date: string | null | undefined): string => {
        if (!date) return 'Non définie';
        try {
            return new Date(date).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return date; // Retourne la chaîne brute si le format est invalide
        }
    };

    // Composant pour un détail dans la modale
    const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
        <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 text-green-600 dark:text-green-400 mt-1">{icon}</div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-gray-900 dark:text-white font-semibold">{value}</p>
            </div>
        </div>
    );

    return (
        <AppLayout>
            <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Gestion des Plantations ({plantations.length})
                </h1>

                {plantations.length === 0 ? (
                    <div className="p-10 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                            Aucune plantation n'a été enregistrée pour le moment.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {plantations.map((plantation) => (
                            <div
                                key={plantation.id}
                                className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 
                                           hover:shadow-2xl hover:border-green-400 dark:hover:border-green-600 cursor-pointer 
                                           transition duration-300 transform hover:-translate-y-1"
                                onClick={() => setSelectedPlantation(plantation)}
                            >
                                <div className="flex items-center space-x-3 mb-2">
                                    {/* Icône de plante (utilisé pour la clarté visuelle) */}
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.108a12.022 12.022 0 01-5.618 1.108c-2.454 0-4.757-.464-6.864-1.288L6.4 12l-1.942.72c-2.107.824-4.41.464-6.864-1.288a12.022 12.022 0 01-5.618-1.108z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18V20M12 4V6M4 12H6M18 12H20M5.618 5.892L7.05 7.324M16.95 16.95l1.432 1.432" />
                                    </svg>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                                        {plantation.produitAgro?.nom ?? plantation.nom}
                                    </h2>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-semibold">Zone:</span> {plantation.zone?.nom ?? 'Non définie'}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    ID: {plantation.id}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal de Détails (Refonte pour Dark Mode) */}
                {selectedPlantation && (
                    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-70 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-8 relative transform transition-all duration-300 scale-100 opacity-100">
                            
                            {/* Bouton de fermeture stylisé */}
                            <button
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                                onClick={() => setSelectedPlantation(null)}
                                title="Fermer"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <h2 className="text-2xl font-extrabold mb-5 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                Détails de {selectedPlantation.produitAgro?.nom ?? selectedPlantation.nom}
                            </h2>

                            <div className="space-y-4 pt-2">
                                {/* Zone */}
                                <DetailItem 
                                    label="Zone d'exploitation"
                                    value={selectedPlantation.zone?.nom ?? 'Non définie'}
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                                />
                                
                                {/* Type de sol */}
                                <DetailItem 
                                    label="Type de Sol"
                                    value={selectedPlantation.type_sol ?? 'Non défini'}
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292V15H8a2 2 0 01-2-2v-1a2 2 0 00-2-2H2v7a4 4 0 004 4h12a4 4 0 004-4v-7h-2a2 2 0 00-2 2v1a2 2 0 01-2 2h-4v-5.354z" /></svg>}
                                />
                                
                                {/* Périmètre */}
                                <DetailItem 
                                    label="Périmètre"
                                    value={`${selectedPlantation.perimetre?.toLocaleString('fr-FR') ?? 'Non défini'} m²`}
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                />
                                
                                {/* Date de plantation */}
                                <DetailItem 
                                    label="Date de Plantation"
                                    value={formatDate(selectedPlantation.date_plantation)}
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-4 4h.01M3 20h18V6H3v14z" /></svg>}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

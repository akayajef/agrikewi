import React, { useState } from 'react';
import { usePage } from '@inertiajs/react'; 
import { Inertia } from '@inertiajs/inertia';
import AppLayout from '@/layouts/app-layout';

// --- Interface des stocks ---
interface StockItem {
    id: number;
    quantite: number;
    produit?: string;
    type?: string;
    entrepot?: string;
}

const StockPage: React.FC = () => {
    const { stocks: stocksProps } = usePage<{ stocks: StockItem[] }>().props;
    const [stocks, setStocks] = useState(stocksProps);
    const [quantites, setQuantites] = useState<{ [key: number]: number }>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // --- Icône selon le type d'intrant ---
    const getIconForType = (type: string) => {
        switch (type.toLowerCase()) {
            case 'engrais':
                return (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21.05V13m-2.5 0h5a.5.5 0 00.5-.5V10c0-1.5-.5-3.5-2.5-3.5S9 8.5 9 10v2.5a.5.5 0 00.5.5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21H7a2 2 0 01-2-2v-5l7-7 7 7v5a2 2 0 01-2 2h-3" />
                    </svg>
                );
            case 'semence':
                return (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15h2" />
                    </svg>
                );
            case 'pesticide':
                return (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10m0-10l4-2m-4 2l4 2m-4-2l-4-2" />
                    </svg>
                );
        }
    };

    // --- Retirer une quantité ---
    const handleRetirer = (stock: StockItem) => {
        setErrorMessage(null);
        const q = quantites[stock.id];

        if (!q || q <= 0 || isNaN(q)) {
            setErrorMessage(`Veuillez spécifier une quantité valide (1 à ${stock.quantite}).`);
            return;
        }

        if (stock.quantite < q) {
            setErrorMessage(`Impossible de retirer ${q}. Quantité disponible : ${stock.quantite}.`);
            return;
        }

        // Mise à jour locale (optimiste)
        setStocks(prev =>
            prev.map(s => s.id === stock.id ? { ...s, quantite: s.quantite - q } : s)
        );

        // Réinitialiser le champ de quantité
        setQuantites(prev => {
            const newQuantites = { ...prev };
            delete newQuantites[stock.id];
            return newQuantites;
        });

        // Appel Inertia pour mise à jour serveur
        Inertia.post(`/stock/${stock.id}/retirer`, { quantite: q }, { preserveScroll: true });
    };

    return (
        <AppLayout>
            <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b border-green-300 dark:border-green-600 pb-2">
                    Inventaire des Intrants ({stocks.length})
                </h1>

                {errorMessage && (
                    <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-100 dark:bg-red-900/50 dark:text-red-400" role="alert">
                        <span className="font-medium">Attention:</span> {errorMessage}
                    </div>
                )}

                {stocks.length === 0 ? (
                    <div className="p-10 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                            Aucun intrant n'est actuellement en stock.
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {stocks.map(stock => {
                            const intrantNom = stock.produit ?? 'Intrant inconnu';
                            const intrantType = stock.type ?? 'Inconnu';
                            const icon = getIconForType(intrantType);

                            return (
                                <li key={stock.id} className="list-none bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 
                                    flex flex-col md:flex-row justify-between items-start md:items-center transition duration-200 hover:shadow-xl dark:hover:border-green-500">
                                    
                                    <div className="flex items-center space-x-4 mb-3 md:mb-0 min-w-0 flex-1">
                                        <div className="text-green-600 dark:text-green-400 flex-shrink-0">{icon}</div>
                                        <div>
                                            <p className="font-bold text-xl text-gray-900 dark:text-white truncate">{intrantNom}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Type: <span className="font-semibold text-green-700 dark:text-green-300">{intrantType}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
                                        <div className="flex-shrink-0 text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                            Stock: <span className="font-bold">{stock.quantite.toLocaleString('fr-FR')}</span>
                                        </div>

                                        <input
                                            type="number"
                                            min={1}
                                            max={stock.quantite}
                                            value={quantites[stock.id] || ''}
                                            onChange={e =>
                                                setQuantites({ ...quantites, [stock.id]: parseInt(e.target.value) })
                                            }
                                            placeholder="Qté à retirer"
                                            className="w-32 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500 transition"
                                        />

                                        <button
                                            onClick={() => handleRetirer(stock)}
                                            disabled={!quantites[stock.id] || quantites[stock.id] <= 0 || isNaN(quantites[stock.id])}
                                            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                        >
                                            Retirer
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </AppLayout>
    );
};

export default StockPage;

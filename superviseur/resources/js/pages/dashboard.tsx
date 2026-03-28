import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { 
    ArrowUpRight, 
    CheckCircle, 
    Package, 
    AlertTriangle, 
    Clock, 
    Users, 
    ClipboardList,
    Warehouse,
    Calendar,
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    Sprout,
    Box
} from 'lucide-react';

// Interfaces
interface Stat {
    label: string;
    value: number;
}
interface Stock {
    id: number;
    produit: string;
    quantite: number;
    entrepot: string;
    statut_stock: 'faible' | 'normal';
}
interface Tache {
    description: string;
    echeance: string;
    statut: 'En cours' | 'Terminée' | 'En retard';
    agriculteur: string;
}
interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'danger' | 'info' | 'success';
    created_at: string;
}
interface DashboardProps {
    stats: Stat[];
    stocks: Stock[];
    dernieresTaches: Tache[];
    notifications: Notification[];
}

// Composant Diagramme en Anneau
const DonutChart = ({ data }: { data: Array<{ label: string; value: number; color: string; icon: React.ReactNode }> }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    if (total === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
                <div className="text-center">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucune donnée disponible</p>
                </div>
            </div>
        );
    }

    let currentAngle = -90;
    
    const segments = data.map((item) => {
        const percentage = (item.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        
        const x1 = 100 + 80 * Math.cos(startRad);
        const y1 = 100 + 80 * Math.sin(startRad);
        const x2 = 100 + 80 * Math.cos(endRad);
        const y2 = 100 + 80 * Math.sin(endRad);

        const largeArc = angle > 180 ? 1 : 0;

        return {
            ...item,
            percentage,
            path: `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`,
        };
    });

    return (
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            {/* SVG Donut */}
            <div className="relative">
                <svg width="240" height="240" viewBox="0 0 200 200" className="transform rotate-0">
                    {segments.map((segment, idx) => (
                        <g key={idx}>
                            <path
                                d={segment.path}
                                fill={segment.color}
                                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                            />
                        </g>
                    ))}
                    {/* Centre blanc */}
                    <circle cx="100" cy="100" r="50" fill="white" className="dark:fill-gray-800" />
                </svg>
                
                {/* Total au centre */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{total}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Total</div>
                </div>
            </div>

            {/* Légende */}
            <div className="grid grid-cols-2 gap-3 max-w-md">
                {segments.map((segment, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex-shrink-0">
                            <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                                style={{ backgroundColor: segment.color }}
                            >
                                {segment.icon}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{segment.label}</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">{segment.value}</span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {segment.percentage.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function Dashboard({ stats, stocks, dernieresTaches, notifications }: DashboardProps) {
    const { auth } = usePage().props as any;
    const user = auth?.user;

    // Couleurs AgriKewi
    const PRIMARY_COLOR = '#4CAF50';
    const DANGER_COLOR = '#EF4444';
    const INFO_COLOR = '#3B82F6';

    const getStatIcon = (label: string) => {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes('parcelle') || lowerLabel.includes('surface')) return <Users className="w-6 h-6" />;
        if (lowerLabel.includes('stock')) return <Package className="w-6 h-6" />;
        if (lowerLabel.includes('ouvrier')) return <Users className="w-6 h-6" />;
        if (lowerLabel.includes('tâche') || lowerLabel.includes('tache')) return <ClipboardList className="w-6 h-6" />;
        return <ArrowUpRight className="w-6 h-6" />;
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bonjour';
        if (hour < 18) return 'Bon après-midi';
        return 'Bonsoir';
    };

    const getStatutClasses = (statut: Tache['statut']): string => {
        if (statut === 'Terminée') {
            return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300';
        }
        if (statut === 'En retard') {
            return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300';
        }
        if (statut === 'En cours') {
            return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300';
        }
        return 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300';
    };

    const getNotificationClasses = (type: Notification['type']): string => {
        if (type === 'danger') {
            return 'border-red-500 bg-red-50 dark:bg-red-950/30';
        }
        if (type === 'info') {
            return 'border-blue-500 bg-blue-50 dark:bg-blue-950/30';
        }
        if (type === 'success') {
            return 'border-green-500 bg-green-50 dark:bg-green-950/30';
        }
        return 'border-gray-300 bg-white dark:bg-gray-800';
    };

    // Données pour le diagramme en anneau (venant du backend)
    const chartData = [
        { 
            label: 'Produits Transformés', 
            value: (usePage().props as any).produitsTransformes || 0,
            color: '#8B5CF6', 
            icon: <Box className="w-5 h-5" />
        },
        { 
            label: 'Produits Bruts', 
            value: stats.find(s => s.label.toLowerCase().includes('agricole'))?.value || 0,
            color: '#4CAF50', 
            icon: <Package className="w-5 h-5" />
        },
        { 
            label: 'Commandes', 
            value: (usePage().props as any).totalCommandes || 0,
            color: '#F59E0B', 
            icon: <ShoppingCart className="w-5 h-5" />
        },
        { 
            label: 'Plantations', 
            value: (usePage().props as any).totalPlantations || 0,
            color: '#10B981', 
            icon: <Sprout className="w-5 h-5" />
        },
        { 
            label: 'Ouvriers', 
            value: stats.find(s => s.label.toLowerCase().includes('agriculteur'))?.value || 0,
            color: '#3B82F6', 
            icon: <Users className="w-5 h-5" />
        },
    ];

    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="p-6 space-y-8 text-gray-900 dark:text-gray-100">

                {/* Salutation utilisateur */}
                {user && (
                    <header>
                        <h1 className="text-4xl font-extrabold tracking-tight">
                            {getGreeting()}, <span className="font-extrabold" style={{ color: PRIMARY_COLOR }}>{user.nom}</span> 👋
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Aperçu des opérations agricoles en un coup d'œil.
                        </p>
                    </header>
                )}

                {/* Section Statistiques */}
                <section>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {stats.map((stat, idx) => (
                            <Card 
                                key={idx} 
                                className="flex flex-col items-start p-5 shadow-xl border-t-4 transition-transform hover:scale-[1.02] duration-300 dark:bg-gray-800 dark:border-gray-700 rounded-xl"
                                style={{ borderTopColor: PRIMARY_COLOR }}
                            >
                                <div className="mb-3 p-2 rounded-full bg-green-100 dark:bg-green-900/70" style={{ color: PRIMARY_COLOR }}>
                                    {getStatIcon(stat.label)}
                                </div> 
                                <div className="text-4xl font-extrabold mb-1">{stat.value}</div>
                                <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">{stat.label}</div>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Section Principale */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Colonne 1 : Diagramme et Tâches */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Nouveau Diagramme en Anneau */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                <Warehouse className="w-6 h-6" /> Vue d'ensemble des activités
                            </h2>
                            <Card className="rounded-xl shadow-2xl dark:bg-gray-800 p-8 border border-gray-200 dark:border-gray-700">
                                <DonutChart data={chartData} />
                            </Card>
                        </section>

                        {/* Alertes Stocks Faibles */}
                        {stocks.some(s => s.statut_stock === 'faible') && (
                            <section>
                                <Card className="rounded-xl shadow-xl dark:bg-gray-800 p-6 border-l-4 border-red-500">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-red-800 dark:text-red-300 mb-2 text-lg">
                                                ⚠️ Alerte stocks faibles
                                            </h3>
                                            <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                                                {stocks.filter(s => s.statut_stock === 'faible').length} produit(s) nécessitent un réapprovisionnement urgent.
                                            </p>
                                            <div className="space-y-2">
                                                {stocks.filter(s => s.statut_stock === 'faible').map((stock) => (
                                                    <div key={stock.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded">
                                                        <span className="font-semibold text-sm">{stock.produit}</span>
                                                        <span className="text-sm text-red-600 dark:text-red-400">{stock.quantite} kg</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </section>
                        )}

                        {/* Dernières Tâches */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                <ClipboardList className="w-6 h-6" /> Dernières tâches assignées
                            </h2>
                            <Card className="rounded-xl shadow-2xl dark:bg-gray-800 p-0 border border-gray-200 dark:border-gray-700">
                                <div className="overflow-x-auto">
                                    {dernieresTaches.length > 0 ? (
                                        <table className="min-w-full text-left text-sm text-gray-700 dark:text-gray-400 divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-200 sticky top-0">
                                                <tr>
                                                    <th scope="col" className="p-4">Description</th>
                                                    <th scope="col" className="p-4">Échéance</th>
                                                    <th scope="col" className="p-4">Statut</th>
                                                    <th scope="col" className="p-4">ouvrier</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dernieresTaches.map((t, idx) => {
                                                    const isDelayed = t.statut === 'En retard';
                                                    return (
                                                        <tr 
                                                            key={idx} 
                                                            className={`border-b dark:border-gray-700 transition-colors ${isDelayed ? 'bg-red-50/50 dark:bg-red-950/20 font-bold hover:bg-red-100/70 dark:hover:bg-red-900/30' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                                        >
                                                            <td className="p-4 text-gray-900 dark:text-white">{t.description}</td>
                                                            <td className="p-4 flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                                <Calendar className="w-4 h-4" /> {t.echeance}
                                                            </td>
                                                            <td className="p-4">
                                                                <span 
                                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold text-xs ${getStatutClasses(t.statut)}`}
                                                                >
                                                                    {t.statut === 'Terminée' && <CheckCircle className="w-3 h-3" />}
                                                                    {t.statut === 'En cours' && <Clock className="w-3 h-3" />}
                                                                    {t.statut === 'En retard' && <AlertTriangle className="w-3 h-3" />}
                                                                    {t.statut}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-gray-600 dark:text-gray-400">{t.agriculteur}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                            <ClipboardList className="w-8 h-8 mx-auto mb-2" />
                                            <p>Aucune tâche récente à afficher. Tout est sous contrôle !</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </section>
                    </div>

                    {/* Colonne 2 : Notifications */}
                    <div className="lg:col-span-1">
                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6" /> Fil de notifications
                            </h2>
                            <div className="space-y-4">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <Card
                                            key={n.id}
                                            className={`p-4 rounded-xl shadow-lg transition-shadow hover:shadow-xl border-l-4 ${getNotificationClasses(n.type)} text-gray-900 dark:text-gray-100 border-opacity-70 dark:border-opacity-70`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1" style={{ color: n.type === 'danger' ? DANGER_COLOR : (n.type === 'info' ? INFO_COLOR : PRIMARY_COLOR) }}>
                                                        {n.type === 'danger' && <AlertTriangle className="w-5 h-5" />}
                                                        {n.type === 'info' && <Clock className="w-5 h-5" />}
                                                        {n.type === 'success' && <CheckCircle className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-lg leading-snug">{n.title}</div>
                                                        <div className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{n.message}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">{n.created_at}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="p-8 text-center rounded-xl shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                        <p>Aucune notification urgente. Tout est en ordre !</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
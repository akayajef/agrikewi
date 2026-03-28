import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Pencil, X, PlusCircle, Factory, Wheat, Package, Warehouse, Edit3, Trash2 } from 'lucide-react';

// --- Constantes de Design Standardisées (Alignées sur articles.tsx) ---
const PRIMARY_COLOR = '#43A047'; // Vert principal
const DANGER_COLOR = '#EF4444';
// 🟢 MODIFICATION : J'ajuste le gradient pour être plus vert et donc plus "soutenu/sombre" visuellement
const BG_GRADIENT = `#388E3C`; 

const UNITES_STOCK = ['unite', 'kilo', 'tonne', 'paquet', 'litre'] as const;
const NATURES_PRODUIT = ['agricole', 'intrant', 'transforme'] as const;

const TYPES_PRODUIT_AGRICOLE = ['céréale', 'légumineuse', 'fruit', 'légume', 'tubercule', 'épice', 'autre'];
const TYPES_PRODUIT_INTRANT = ['engrais', 'pesticide', 'semence', 'outil', 'carburant', 'autre'];
const TYPES_PRODUIT_TRANSFORME = ['jus', 'conserve', 'huile', 'farine', 'autre'];

// --- Interfaces de Données ---
interface FlashMessage { message: string; type: 'success' | 'danger'; }
interface Entrepot { id: number; nom: string; }
interface StockEntry { id: number; quantite: number; unite_stock: typeof UNITES_STOCK[number]; entrepos: Entrepot; }
interface Superviseur { user: { nom: string; prenom: string; } }
interface ProduitBase { id: number; nom: string; description: string | null; superviseur?: Superviseur; stocks: StockEntry[]; }

interface ProduitAgricole extends ProduitBase { nature: 'agricole'; type: string; }
interface ProduitIntrant extends ProduitBase { nature: 'intrant'; type: string; }
interface ProduitTransforme extends ProduitBase { nature: 'transforme'; type_produit: string; }

interface StockProps {
    produitsAgricoles: ProduitAgricole[];
    produitsIntrants: ProduitIntrant[];
    produitsTransformes: ProduitTransforme[];
    entrepotsList: Entrepot[];
    isSuperviseur: boolean;
    flash?: FlashMessage;
}

const getProductTypeList = (nature: 'agricole' | 'intrant' | 'transforme'): string[] => {
    switch (nature) {
        case 'agricole': return TYPES_PRODUIT_AGRICOLE;
        case 'intrant': return TYPES_PRODUIT_INTRANT;
        case 'transforme': return TYPES_PRODUIT_TRANSFORME;
        default: return [];
    }
};

export default function StockComponent({ produitsAgricoles, produitsIntrants, produitsTransformes, entreposList, isSuperviseur, flash }: StockProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingStock, setEditingStock] = useState<StockEntry | null>(null);
    const defaultNature = NATURES_PRODUIT[0];

    const { data, setData, post, processing, errors, reset } = useForm({
        nom: '',
        nature: defaultNature,
        type: getProductTypeList(defaultNature)[0] || '',
        description: '',
        quantite: '' as string | number,
        entrepos_id: entreposList[0]?.id.toString() || '',
        unite_stock: UNITES_STOCK[0],
    });

    const { data: stockData, setData: setStockData, reset: resetStockForm } = useForm({
        quantite: '' as string | number,
        unite_stock: UNITES_STOCK[0],
        entrepos_id: '',
    });

    const handleCreate = () => {
        reset();
        setIsCreateModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formOptions = {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            }
        };

        router.post('/stock', {
            nom: data.nom,
            nature: data.nature,
            type: data.type,
            description: data.description,
            quantite: Number(data.quantite),
            entrepos_id: Number(data.entrepos_id),
            unite_stock: data.unite_stock,
        }, formOptions);
    };

    const handleEditStock = (stock: StockEntry) => {
        setEditingStock(stock);
        setStockData({
            quantite: stock.quantite,
            unite_stock: stock.unite_stock,
            entrepos_id: stock.entrepos.id.toString(),
        });
    };

    const handleStockUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStock) return;

        router.patch(`/stock/update-stock/${editingStock.id}`, {
            quantite: Number(stockData.quantite),
            unite_stock: stockData.unite_stock,
            entrepos_id: Number(stockData.entrepos_id),
        }, { 
            preserveScroll: true,
            onSuccess: () => { 
                setEditingStock(null); 
                resetStockForm(); 
            } 
        });
    };

    const handleDeleteStock = (id: number) => {
        if (confirm('Voulez-vous vraiment supprimer cette entrée de stock ?')) {
            router.delete(`/stock/destroy-stock/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const handleDeleteProduit = (produit: ProduitAgricole | ProduitIntrant | ProduitTransforme) => {
        const nomProduit = produit.nom;
        const nature = produit.nature;
        
        if (confirm(`Voulez-vous vraiment supprimer le produit "${nomProduit}" ? Cette action supprimera également tous les stocks associés.`)) {
            // Utiliser la route DELETE /stock/{id}?nature={nature}
            router.delete(`/stock/${produit.id}?nature=${nature}`, {
                preserveScroll: true,
                onSuccess: () => {
                    console.log(`Produit ${nomProduit} supprimé avec succès`);
                },
                onError: (errors) => {
                    console.error('Erreur lors de la suppression:', errors);
                    alert('Erreur lors de la suppression du produit. Vérifiez la console pour plus de détails.');
                }
            });
        }
    };

    const categories = [
        { 
            title: 'Produits Agricoles Bruts', 
            icon: Wheat, 
            nature: 'agricole' as const, 
            data: produitsAgricoles.map(p => ({ ...p, nature: 'agricole' as const })) 
        },
        { 
            title: 'Produits Transformés', 
            icon: Factory, 
            nature: 'transforme' as const, 
            data: produitsTransformes.map(p => ({ ...p, nature: 'transforme' as const })) 
        },
        { 
            title: 'Intrants Agricoles', 
            icon: Package, 
            nature: 'intrant' as const, 
            data: produitsIntrants.map(p => ({ ...p, nature: 'intrant' as const })) 
        },
    ];

    const renderStock = (stocks: StockEntry[]) => {
        if (!stocks.length) return <span className="text-sm italic text-gray-500">Aucun stock.</span>;
        return stocks.map(stock => (
            <div key={stock.id} className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100 dark:bg-gray-700 dark:border-gray-600 mb-1">
                <span className="text-sm dark:text-gray-100">{stock.quantite} {stock.unite_stock} | {stock.entrepos.nom}</span>
                {isSuperviseur && (
                    <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEditStock(stock)}>
                            <Edit3 size={16} className="text-green-600" />
                        </Button>
                        <Button size="sm" style={{ backgroundColor: DANGER_COLOR }} onClick={() => handleDeleteStock(stock.id)}>
                            <Trash2 size={16} />
                        </Button>
                    </div>
                )}
            </div>
        ));
    };

    return (
        <AppLayout>
            <Head title="Gestion des Stocks" />

            <div className="p-4 sm:p-6 lg:p-8">
                {flash && (
                    <div className={`p-4 rounded mb-4 ${flash.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {flash.message}
                    </div>
                )}

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white dark:bg-gray-800 shadow-xl sm:rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Warehouse size={28} style={{ color: PRIMARY_COLOR }} /> Gestion des Stocks
                        </h1>
                        {isSuperviseur && (
                               <Button style={{ backgroundColor: PRIMARY_COLOR }} onClick={handleCreate}>
                                   <PlusCircle size={18} className="mr-2" /> Ajouter Produit
                               </Button>
                        )}
                    </div>

                    {categories.map(cat => (
                        <div key={cat.nature} className="mb-8">
                            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100"><cat.icon size={20} style={{ color: PRIMARY_COLOR }} /> {cat.title} ({cat.data.length})</h2>
                            
                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    {/* 🟢 MODIFICATION : Le style de l'en-tête est ajusté ici */}
                                    <thead style={{ background: BG_GRADIENT }}>
                                        <tr>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-200">Nom</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-200">Type</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-200">Superviseur</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-200">Stocks (Quantité | Entrepôt)</th>
                                            {isSuperviseur && <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-200">Actions Produit</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                        {cat.data.map(p => (
                                            <tr key={p.id} className="hover:bg-green-50 dark:hover:bg-gray-700 transition-colors">
                                                <td className="p-4 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{p.nom}</td>
                                                <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>
                                                        {cat.nature === 'transforme' ? (p as ProduitTransforme).type_produit : (p as ProduitAgricole | ProduitIntrant).type}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                                                    {p.superviseur?.user ? `${p.superviseur.user.nom} ${p.superviseur.user.prenom}` : '-'}
                                                </td>
                                                <td className="p-4">{renderStock(p.stocks)}</td>
                                                {isSuperviseur && (
                                                    <td className="p-4 text-center">
                                                        <Button 
                                                            size="sm" 
                                                            style={{ backgroundColor: DANGER_COLOR }} 
                                                            onClick={() => handleDeleteProduit(p)}
                                                        >
                                                            <Trash2 size={16} className="mr-1" /> Supprimer Produit
                                                        </Button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                        {cat.data.length === 0 && <tr><td colSpan={isSuperviseur ? 5 : 4} className="p-4 text-center text-gray-500 dark:text-gray-400">Aucun produit trouvé</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Modal Création Produit + Stock Initial */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[500px] dark:bg-gray-800">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold dark:text-gray-100">Ajouter Produit et Stock</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Nature</Label>
                            <Select value={data.nature} onValueChange={(value) => { setData('nature', value); setData('type', getProductTypeList(value)[0] || ''); }}>
                                <SelectTrigger><SelectValue placeholder="Nature" /></SelectTrigger>
                                <SelectContent>
                                    {NATURES_PRODUIT.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Nom</Label>
                            <Input value={data.nom} onChange={(e) => setData('nom', e.target.value)} />
                            {errors.nom && <span className="text-red-600 text-sm">{errors.nom}</span>}
                        </div>

                        <div>
                            <Label>Type</Label>
                            <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                                <SelectContent>
                                    {getProductTypeList(data.nature).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {errors.type && <span className="text-red-600 text-sm">{errors.type}</span>}
                        </div>

                        <div>
                            <Label>Description</Label>
                            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <Label>Quantité</Label>
                                <Input type="number" value={data.quantite} onChange={(e) => setData('quantite', e.target.value)} />
                                {errors.quantite && <span className="text-red-600 text-sm">{errors.quantite}</span>}
                            </div>
                            <div>
                                <Label>Unité</Label>
                                <Select value={data.unite_stock} onValueChange={(v) => setData('unite_stock', v as any)}>
                                    <SelectTrigger><SelectValue placeholder="Unité" /></SelectTrigger>
                                    <SelectContent>
                                        {UNITES_STOCK.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>Entrepôt</Label>
                            <Select value={data.entrepos_id} onValueChange={(v) => setData('entrepos_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Entrepôt" /></SelectTrigger>
                                <SelectContent>
                                    {entreposList.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.nom}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Annuler</Button>
                            <Button type="submit" style={{ backgroundColor: PRIMARY_COLOR }} disabled={processing}>
                                {processing ? 'Création...' : 'Créer'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edition Stock */}
            <Dialog open={!!editingStock} onOpenChange={() => setEditingStock(null)}>
                <DialogContent className="sm:max-w-[425px] dark:bg-gray-800">
                    <DialogHeader><DialogTitle className="text-xl font-bold dark:text-gray-100">Modifier Stock</DialogTitle></DialogHeader>
                    {editingStock && (
                        <form onSubmit={handleStockUpdate} className="space-y-4">
                            <div>
                                <Label>Quantité</Label>
                                <Input type="number" value={stockData.quantite} onChange={(e) => setStockData('quantite', e.target.value)} />
                            </div>
                            <div>
                                <Label>Unité</Label>
                                <Select value={stockData.unite_stock} onValueChange={(v) => setStockData('unite_stock', v as any)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {UNITES_STOCK.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                                <div>
                                    <Label>Entrepôt</Label>
                                    <Select value={stockData.entrepos_id} onValueChange={(v) => setStockData('entrepos_id', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {entreposList.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.nom}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditingStock(null)}>Annuler</Button>
                                <Button type="submit" style={{ backgroundColor: PRIMARY_COLOR }}>Sauvegarder</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
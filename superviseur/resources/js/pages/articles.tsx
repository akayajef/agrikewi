import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Edit3, Trash2, PlusCircle, ShoppingBag, Leaf, Utensils } from 'lucide-react';

// --- Constantes de Style ---
const PRIMARY_COLOR = '#43A047';
const DANGER_COLOR = '#EF4444';
// 🟢 MODIFICATION : Couleur de fond de l'en-tête en vert foncé pour le contraste
const HEADER_BG_COLOR = '#388E3C'; 

// --- Interfaces de Données ---
interface FlashMessage {
    message: string;
    type: 'success' | 'info' | 'danger' | 'error';
}

interface ArticleType {
    id: number;
    nom: string;
    description: string;
    prix: number;
    image_url: string;
    unite_vente: string;
    nature: 'Agricole Brut' | 'Agricole Transformé' | 'Non Classé';
    type: string;
    produit: string;
    superviseur: string;
}

interface ProduitSelect {
    id: number;
    nom: string;
    type: string;
    unite_vente?: string;
}

interface ArticlesProps {
    articles: ArticleType[];
    produitsAgricoles: ProduitSelect[];
    produitsTransformes: ProduitSelect[];
    unitesVente: string[];
    flash?: FlashMessage;
    canManageArticles: boolean;
}

export default function Articles({
    articles,
    produitsAgricoles,
    produitsTransformes,
    unitesVente,
    flash,
    canManageArticles,
}: ArticlesProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data, setData, post, delete: destroy, reset, errors } = useForm({
        id: null as number | null,
        nom: '',
        description: '',
        prix: '',
        image: null as File | null,
        produit_agricole_id: '',
        produit_transforme_id: '',
        unite_vente: unitesVente[0] || 'unite',
        _method: 'post' as 'post' | 'put',
    });

    // Fonction pour récupérer les infos d'un produit
    const getProduitInfo = (produitId: string, isTransforme: boolean) => {
        const liste = isTransforme ? produitsTransformes : produitsAgricoles;
        return liste.find(p => p.id.toString() === produitId);
    };

    // Effet pour auto-remplir le nom et l'unité quand un produit est sélectionné
    useEffect(() => {
        if (data.produit_agricole_id) {
            const produit = getProduitInfo(data.produit_agricole_id, false);
            if (produit) {
                setData(prev => ({
                    ...prev,
                    nom: produit.nom,
                    unite_vente: produit.unite_vente || unitesVente[0] || 'unite'
                }));
            }
        } else if (data.produit_transforme_id) {
            const produit = getProduitInfo(data.produit_transforme_id, true);
            if (produit) {
                setData(prev => ({
                    ...prev,
                    nom: produit.nom,
                    unite_vente: produit.unite_vente || unitesVente[0] || 'unite'
                }));
            }
        }
    }, [data.produit_agricole_id, data.produit_transforme_id]);

    // Ouvrir le modal pour créer
    const handleCreate = () => {
        setIsEditing(false);
        reset();
        setImagePreview(null);
        setIsModalOpen(true);
    };

    // Ouvrir le modal pour éditer
    const handleEdit = (article: ArticleType) => {
        setIsEditing(true);
        const produitAgricoleId = produitsAgricoles.find(p => p.nom === article.produit)?.id || '';
        const produitTransformeId = produitsTransformes.find(p => p.nom === article.produit)?.id || '';

        setData({
            id: article.id,
            nom: article.nom,
            description: article.description,
            prix: article.prix.toString(),
            image: null,
            produit_agricole_id: produitAgricoleId.toString(),
            produit_transforme_id: produitTransformeId.toString(),
            unite_vente: article.unite_vente,
            _method: 'put',
        });
        setImagePreview(article.image_url);
        setIsModalOpen(true);
    };

    // Soumission du formulaire
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formOptions = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                setImagePreview(null);
                setIsEditing(false);
            },
            onError: (errors: any) => {
                console.error('Erreur de validation:', errors);
            }
        };

        if (isEditing && data.id) {
            router.post(
                `/article/${data.id}`,
                {
                    ...data,
                    _method: 'put',
                    produit_agricole_id: data.produit_agricole_id || null,
                    produit_transforme_id: data.produit_transforme_id || null,
                },
                formOptions
            );
        } else {
            router.post(
                '/article',
                {
                    nom: data.nom,
                    description: data.description,
                    prix: data.prix,
                    image: data.image,
                    produit_agricole_id: data.produit_agricole_id || null,
                    produit_transforme_id: data.produit_transforme_id || null,
                    unite_vente: data.unite_vente,
                },
                formOptions
            );
        }
    };

    // Suppression
    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            destroy(`/article/${id}`);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('image', file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const renderProduitOptions = (list: ProduitSelect[], isTransforme: boolean) =>
        list.map(p => (
            <SelectItem key={p.id} value={p.id.toString()}>
                {p.nom} ({p.type}) {isTransforme ? <Utensils size={12} className="inline ml-1" /> : <Leaf size={12} className="inline ml-1" />}
            </SelectItem>
        ));

    const PLACEHOLDER_AGRICOLE = '_null_agricole';
    const PLACEHOLDER_TRANSFORME = '_null_transforme';
    const selectedAgricoleValue = data.produit_agricole_id ? data.produit_agricole_id.toString() : PLACEHOLDER_AGRICOLE;
    const selectedTransformeValue = data.produit_transforme_id ? data.produit_transforme_id.toString() : PLACEHOLDER_TRANSFORME;

    useEffect(() => {
        if (flash?.message) console.log(`Flash ${flash.type}: ${flash.message}`);
    }, [flash]);

    return (
        <AppLayout>
            <Head title="Gestion des Articles" />

            <div className="p-4 sm:p-6 lg:p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 shadow-xl sm:rounded-lg p-6"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <ShoppingBag size={28} style={{ color: PRIMARY_COLOR }} /> Catalogue des Articles
                        </h1>
                        {canManageArticles && (
                            <Button style={{ backgroundColor: PRIMARY_COLOR }} onClick={handleCreate}>
                                <PlusCircle size={18} className="mr-2" /> Ajouter un Article
                            </Button>
                        )}
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            {/* 🟢 MODIFICATION : Couleur de fond de l'en-tête en vert foncé */}
                            <thead style={{ backgroundColor: HEADER_BG_COLOR }}>
                                <tr>
                                    {/* 🟢 MODIFICATION : Texte en blanc pour un contraste maximal */}
                                    <th className="p-4 text-left text-xs font-extrabold uppercase text-white">Nom</th>
                                    <th className="p-4 text-left text-xs font-extrabold uppercase text-white">Nature</th>
                                    {/* Colonne Produit Source retirée */}
                                    <th className="p-4 text-left text-xs font-extrabold uppercase text-white">Prix</th>
                                    <th className="p-4 text-left text-xs font-extrabold uppercase text-white">Unité</th>
                                    <th className="p-4 text-left text-xs font-extrabold uppercase text-white">Superviseur</th>
                                    {canManageArticles && <th className="p-4 text-white">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                {articles.length > 0 ? (
                                    articles.map(a => (
                                        <tr key={a.id} className="hover:bg-green-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="p-4 font-medium">{a.nom}</td>
                                            <td className="p-4 text-sm">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.nature === 'Agricole Brut' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {a.nature} ({a.type})
                                                </span>
                                            </td>
                                            <td className="p-4 font-semibold text-green-600 dark:text-green-400">{a.prix} XOF</td>
                                            <td className="p-4 uppercase">{a.unite_vente}</td>
                                            <td className="p-4 text-sm">{a.superviseur}</td>
                                            {canManageArticles && (
                                                <td className="p-4 flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleEdit(a)}>
                                                        <Edit3 size={16} className="text-green-600" />
                                                    </Button>
                                                    <Button size="sm" style={{ backgroundColor: DANGER_COLOR }} onClick={() => handleDelete(a.id)}>
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        {/* colSpan ajusté à 6 (5 si canManageArticles est false) */}
                                        <td colSpan={canManageArticles ? 6 : 5} className="p-4 text-center text-gray-500 dark:text-gray-400">
                                            Aucun article trouvé.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px] dark:bg-gray-800">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold dark:text-gray-100">
                            {isEditing ? 'Modifier l\'Article' : 'Ajouter un Nouvel Article'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Produit Agricole (Optionnel)</Label>
                                <Select
                                    value={selectedAgricoleValue}
                                    onValueChange={(v) => {
                                        const val = v === PLACEHOLDER_AGRICOLE ? '' : v;
                                        setData('produit_agricole_id', val);
                                        if (val) setData('produit_transforme_id', '');
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un produit agricole" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={PLACEHOLDER_AGRICOLE}>-- Aucun --</SelectItem>
                                        {renderProduitOptions(produitsAgricoles, false)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Produit Transformé (Optionnel)</Label>
                                <Select
                                    value={selectedTransformeValue}
                                    onValueChange={(v) => {
                                        const val = v === PLACEHOLDER_TRANSFORME ? '' : v;
                                        setData('produit_transforme_id', val);
                                        if (val) setData('produit_agricole_id', '');
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un produit transformé" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={PLACEHOLDER_TRANSFORME}>-- Aucun --</SelectItem>
                                        {renderProduitOptions(produitsTransformes, true)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Nom (auto-rempli)</Label>
                                <Input 
                                    value={data.nom} 
                                    onChange={(e) => setData('nom', e.target.value)}
                                    placeholder="Choisissez un produit pour auto-remplir"
                                />
                            </div>
                            <div>
                                <Label>Prix (XOF)</Label>
                                <Input type="number" step="any" value={data.prix} onChange={(e) => setData('prix', e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <Label>Unité de Vente (auto-remplie)</Label>
                            <Select value={data.unite_vente} onValueChange={(v) => setData('unite_vente', v)}>
                                <SelectTrigger><SelectValue placeholder="Sélectionner l'unité" /></SelectTrigger>
                                <SelectContent>
                                    {unitesVente.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Description (Optionnel)</Label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <Label>Image</Label>
                            <Input type="file" accept="image/*" onChange={handleImageChange} />
                            {imagePreview && <img src={imagePreview} alt="Aperçu" className="mt-2 w-32 h-32 object-cover rounded" />}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                            <Button type="button" onClick={handleSubmit} style={{ backgroundColor: PRIMARY_COLOR }}>
                                {isEditing ? 'Sauvegarder' : 'Créer'}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
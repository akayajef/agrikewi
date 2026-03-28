import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, Filter, SortAsc, Tag, Leaf, Factory, Package, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Label = ({ children, htmlFor, className = "" }: { children: React.ReactNode, htmlFor?: string, className?: string }) => (
    <label htmlFor={htmlFor} className={`font-semibold text-[#2B2B26] dark:text-[#E8E6E0] text-sm ${className}`}>
        {children}
    </label>
);

// --- Interfaces ---
interface Article {
    article_id: number;
    article_nom: string;
    article_description: string;
    article_prix: number;
    article_image: string | null;
    produit_source_nom: string;
    article_categorie: 'brut' | 'transforme';
    produit_type: string;
    quantite_disponible: number;
    unite_vente: string;
}

interface CatalogueProps {
    articles: Article[];
    produitTypes: string[];
    produitsSource: string[];
    categories: string[];
    panierCountInitial: number;
    filters: {
        search?: string;
        produit?: string;
        type?: string;
        tri?: string;
        categorie?: string;
    };
}

const Catalogue: React.FC<CatalogueProps> = ({ 
    articles, 
    produitTypes, 
    produitsSource, 
    categories,
    panierCountInitial,
    filters 
}) => {
    // États avec valeurs initiales depuis les filtres de l'URL
    const [search, setSearch] = useState(filters.search || '');
    const [filtreProduit, setFiltreProduit] = useState(filters.produit || '');
    const [filtreType, setFiltreType] = useState(filters.type || '');
    const [filtreCategorie, setFiltreCategorie] = useState<string>(filters.categorie || '');
    const [tri, setTri] = useState(filters.tri || '');
    const [panierCount, setPanierCount] = useState(panierCountInitial);
    const [showFilters, setShowFilters] = useState(false);

    // Synchronisation des filtres avec l'URL (recherche côté serveur)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams();
            
            if (search) params.set('search', search);
            if (filtreProduit) params.set('produit', filtreProduit);
            if (filtreType) params.set('type', filtreType);
            if (filtreCategorie) params.set('categorie', filtreCategorie);
            if (tri) params.set('tri', tri);

            const queryString = params.toString();
            const url = queryString ? `/catalogue?${queryString}` : '/catalogue';
            
            router.get(url, {}, { 
                preserveState: true, 
                preserveScroll: true,
                replace: true 
            });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search, filtreProduit, filtreType, filtreCategorie, tri]);

    // Séparation des articles par catégorie
    const articlesBruts = articles.filter(a => a.article_categorie === 'brut');
    const articlesTransformes = articles.filter(a => a.article_categorie === 'transforme');

    const ajouterAuPanier = async (article_id: number) => {
        try {
            router.post('/panier/ajouter', { article_id }, {
                preserveScroll: true,
                onSuccess: () => {
                    setPanierCount(prev => prev + 1);
                }
            });
        } catch (error) {
            console.error('Erreur ajout panier:', error);
        }
    };

    const resetFiltres = () => {
        setSearch('');
        setFiltreProduit('');
        setFiltreType('');
        setFiltreCategorie('');
        setTri('');
        router.get('/catalogue', {}, { preserveScroll: true });
    };

    // Composant pour afficher une carte produit
    const ProductCard = ({ article }: { article: Article }) => (
        <motion.div
            key={article.article_id}
            className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 w-full bg-white dark:bg-[#2B2B26] flex flex-col group border-2 border-[#E8E6E0] dark:border-[#4A4A42] hover:border-[#4CAF50] dark:hover:border-[#4CAF50]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
        >
           

            {/* Image */}
            <div className="h-48 w-full overflow-hidden bg-[#F8F6F1] dark:bg-[#1B1B18]">
                <img
                    src={article.article_image ? `/articles/${article.article_image}` : '/articles/default.png'}
                    alt={article.article_nom}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            </div>

            {/* Contenu */}
            <div className="p-5 flex flex-col flex-grow bg-[#F8F6F1] dark:bg-[#1B1B18]">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="font-extrabold text-lg text-[#2B2B26] dark:text-[#E8E6E0] leading-tight flex-1">
                        {article.article_nom}
                    </h2>
                </div>

                <div className="mb-3">
                    <p className="text-xl font-bold text-[#2D5F3F] dark:text-[#4CAF50]">
                        {Math.round(article.article_prix)} <span className="text-sm">FCFA</span>
                    </p>
                    <p className="text-xs text-[#8B6F47] dark:text-[#A0826D] font-medium">
                        Prix par {article.unite_vente}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#E8E6E0] dark:bg-[#2B2B26] text-[#8B6F47] dark:text-[#A0826D] border-2 border-[#8B6F47]/30">
                        {article.produit_source_nom}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#E8E6E0] dark:bg-[#2B2B26] text-[#8B6F47] dark:text-[#A0826D] border-2 border-[#8B6F47]/30 capitalize">
                        {article.produit_type}
                    </span>
                </div>

                {article.article_description && (
                    <p className="text-sm text-[#4A4A42] dark:text-[#A8A599] mb-3 line-clamp-2 leading-relaxed">
                        {article.article_description}
                    </p>
                )}

                {/* Stock et Action */}
                <div className="mt-auto pt-4 border-t-2 border-dashed border-[#E8E6E0] dark:border-[#4A4A42]">
                    <div className={`mb-3 p-2.5 rounded-lg ${
                        article.quantite_disponible <= 10 
                            ? 'bg-[#E53935]/10 border-2 border-[#E53935]/30' 
                            : 'bg-[#4CAF50]/10 border-2 border-[#4CAF50]/30'
                    }`}>
                        <p className={`text-sm font-bold flex items-center gap-2 ${
                            article.quantite_disponible <= 10 
                                ? 'text-[#E53935]' 
                                : 'text-[#2D5F3F] dark:text-[#4CAF50]'
                        }`}>
                            <Package className="w-4 h-4" />
                            <span>Stock: {article.quantite_disponible} {article.unite_vente}</span>
                        </p>
                        {article.quantite_disponible <= 10 && article.quantite_disponible > 0 && (
                            <p className="text-xs font-semibold text-[#E53935] mt-1 ml-6">
                                ⚠️ Stock faible !
                            </p>
                        )}
                    </div>

                    <Button
                        onClick={() => ajouterAuPanier(article.article_id)}
                        disabled={article.quantite_disponible <= 0}
                        className={`w-full py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-base ${
                            article.quantite_disponible > 0 
                                ? 'bg-[#2D5F3F] hover:bg-[#1B3A28] text-white shadow-lg hover:scale-105 hover:shadow-2xl' 
                                : 'bg-[#A8A599] text-[#E8E6E0] cursor-not-allowed'
                        }`}
                    >
                        <ShoppingCart size={18} />
                        {article.quantite_disponible > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
                    </Button>
                </div>
            </div>
        </motion.div>
    );

    // Composant pour une section de produits
    const ProductSection = ({ 
        title, 
        icon: Icon, 
        articles, 
        color 
    }: { 
        title: string; 
        icon: React.ElementType; 
        articles: Article[];
        color: string;
    }) => (
        <section className="mb-12">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b-4" style={{ borderColor: color }}>
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}20` }}>
                    <Icon size={32} style={{ color }} />
                </div>
                <div className="flex-1">
                    <h2 className="text-3xl font-extrabold text-[#2B2B26] dark:text-[#E8E6E0]">
                        {title}
                    </h2>
                </div>
                <span className="bg-[#F5A623] text-[#2B2B26] px-5 py-2 rounded-full text-sm font-bold shadow-lg">
                    {articles.length} produit{articles.length > 1 ? 's' : ''}
                </span>
            </div>

            {articles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {articles.map(article => (
                            <ProductCard key={article.article_id} article={article} />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-[#2B2B26] rounded-2xl border-2 border-dashed border-[#E8E6E0] dark:border-[#4A4A42]">
                    <p className="text-xl text-[#A8A599] italic">
                        Aucun produit {title.toLowerCase()} disponible pour le moment.
                    </p>
                </div>
            )}
        </section>
    );

    return (
        <AppLayout>
            <div className="p-4 sm:p-6 md:p-8 lg:p-10 min-h-screen bg-[#F8F6F1] dark:bg-[#1B1B18]">
                {/* En-tête */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b-4 border-[#4CAF50]">
                    <div>
                        <h1 className="text-4xl font-extrabold text-[#2D5F3F] dark:text-[#4CAF50] flex items-center gap-3">
                            <Leaf className="w-10 h-10" />
                            Notre Catalogue
                        </h1>
                        <p className="text-[#8B6F47] dark:text-[#A0826D] mt-2 text-lg">
                            Produits frais et transformés de qualité
                        </p>
                    </div>
                    <button
                        onClick={() => router.get('/commande')}
                        className="relative bg-[#2D5F3F] hover:bg-[#1B3A28] text-white px-6 py-4 rounded-xl flex items-center gap-3 shadow-xl transition-all duration-300 hover:scale-105 font-bold"
                    >
                        <ShoppingCart size={24} />
                        <span className="hidden sm:inline text-lg">Mon Panier</span>
                        {panierCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#E53935] text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-lg animate-pulse">
                                {panierCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Layout: Sidebar + Contenu */}
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Sidebar Filtres */}
                    <aside className="lg:w-1/4 bg-white dark:bg-[#2B2B26] rounded-2xl shadow-xl border-t-4 border-[#F5A623] h-fit lg:sticky top-6">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-extrabold text-[#2D5F3F] dark:text-[#4CAF50] flex items-center gap-2">
                                    <Filter size={24} />
                                    Filtres
                                </h3>
                                <button 
                                    onClick={() => setShowFilters(!showFilters)} 
                                    className="lg:hidden p-2 rounded-lg hover:bg-[#F8F6F1] dark:hover:bg-[#1B1B18] transition-colors"
                                >
                                    <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                                </button>
                            </div>

                            <AnimatePresence>
                                {(showFilters || window.innerWidth >= 1024) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-6"
                                    >
                                        {/* Recherche */}
                                        <div className="space-y-2">
                                            <Label htmlFor="search" className="flex items-center gap-2 font-bold">
                                                <Search size={16} className='text-[#8B6F47]' /> 
                                                Recherche
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="search"
                                                    type="text"
                                                    placeholder="Nom ou description..."
                                                    value={search}
                                                    onChange={e => setSearch(e.target.value)}
                                                    className="w-full px-4 py-3 pr-10 border-2 border-[#E8E6E0] dark:border-[#4A4A42] rounded-xl bg-[#F8F6F1] dark:bg-[#1B1B18] focus:border-[#4CAF50] text-[#2B2B26] dark:text-[#E8E6E0]"
                                                />
                                                {search && (
                                                    <button 
                                                        onClick={() => setSearch('')}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A599] hover:text-[#E53935]"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Catégorie (Brut/Transformé) */}
                                        <div className="space-y-2 pt-4 border-t-2 border-dashed border-[#E8E6E0] dark:border-[#4A4A42]">
                                            <Label className="flex items-center gap-2 font-bold">
                                                <Package size={16} className='text-[#8B6F47]'/> 
                                                Catégorie
                                            </Label>
                                            <select 
                                                value={filtreCategorie} 
                                                onChange={e => setFiltreCategorie(e.target.value)} 
                                                className="w-full border-2 border-[#E8E6E0] dark:border-[#4A4A42] rounded-xl px-4 py-3 bg-[#F8F6F1] dark:bg-[#1B1B18] text-[#2B2B26] dark:text-[#E8E6E0] focus:border-[#4CAF50] font-medium"
                                            >
                                                <option value="">Toutes les catégories</option>
                                                {categories.map((cat, i) => (
                                                    <option key={i} value={cat}>
                                                        {cat === 'brut' ? '🌾 Produits Bruts' : '🏭 Produits Transformés'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Type de produit */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 font-bold">
                                                <Leaf size={16} className='text-[#8B6F47]'/> 
                                                Type de Produit
                                            </Label>
                                            <select 
                                                value={filtreType} 
                                                onChange={e => setFiltreType(e.target.value)} 
                                                className="w-full border-2 border-[#E8E6E0] dark:border-[#4A4A42] rounded-xl px-4 py-3 bg-[#F8F6F1] dark:bg-[#1B1B18] text-[#2B2B26] dark:text-[#E8E6E0] focus:border-[#4CAF50] font-medium capitalize"
                                            >
                                                <option value="">Tous les types</option>
                                                {produitTypes.map((t, i) => (
                                                    <option key={i} value={t} className="capitalize">
                                                        {t}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Produit Source */}
                                        <div className="space-y-2">
                                            <Label className="font-bold">Produit Source</Label>
                                            <select 
                                                value={filtreProduit} 
                                                onChange={e => setFiltreProduit(e.target.value)} 
                                                className="w-full border-2 border-[#E8E6E0] dark:border-[#4A4A42] rounded-xl px-4 py-3 bg-[#F8F6F1] dark:bg-[#1B1B18] text-[#2B2B26] dark:text-[#E8E6E0] focus:border-[#4CAF50] font-medium"
                                            >
                                                <option value="">Tous les produits</option>
                                                {produitsSource.map((p, i) => (
                                                    <option key={i} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Tri */}
                                        <div className="space-y-2 pt-4 border-t-2 border-dashed border-[#E8E6E0] dark:border-[#4A4A42]">
                                            <Label className="flex items-center gap-2 font-bold">
                                                <SortAsc size={16} className='text-[#8B6F47]'/> 
                                                Trier par
                                            </Label>
                                            <select 
                                                value={tri} 
                                                onChange={e => setTri(e.target.value)} 
                                                className="w-full border-2 border-[#E8E6E0] dark:border-[#4A4A42] rounded-xl px-4 py-3 bg-[#F8F6F1] dark:bg-[#1B1B18] text-[#2B2B26] dark:text-[#E8E6E0] focus:border-[#4CAF50] font-medium"
                                            >
                                                <option value="">Pertinence</option>
                                                <option value="prix_asc">Prix croissant</option>
                                                <option value="prix_desc">Prix décroissant</option>
                                                <option value="nom">Nom (A-Z)</option>
                                            </select>
                                        </div>

                                        {/* Bouton Reset */}
                                        <Button
                                            onClick={resetFiltres}
                                            className="w-full py-3 px-4 bg-[#F5A623] hover:bg-[#E09616] rounded-xl transition-all font-bold text-[#2B2B26] shadow-lg hover:scale-105"
                                        >
                                            Réinitialiser les filtres
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </aside>
                    
                    {/* Contenu Principal */}
                    <main className="lg:w-3/4">
                        {articles.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-[#2B2B26] rounded-2xl shadow-xl border-2 border-dashed border-[#E8E6E0] dark:border-[#4A4A42]">
                                <ShoppingCart className="w-20 h-20 mx-auto text-[#A8A599] mb-4" />
                                <p className="text-2xl text-[#A8A599] italic font-medium">
                                    Aucun produit ne correspond à vos critères. 🔍
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Section Produits Bruts */}
                                {(!filtreCategorie || filtreCategorie === 'brut') && (
                                    <ProductSection 
                                        title="Nos Recoltes"
                                        icon={Leaf}
                                        articles={articlesBruts}
                                        color="#2D5F3F"
                                    />
                                )}

                                {/* Section Produits Transformés */}
                                {(!filtreCategorie || filtreCategorie === 'transforme') && (
                                    <ProductSection 
                                        title="Produits Transformés"
                                        icon={Factory}
                                        articles={articlesTransformes}
                                        color="#8B6F47"
                                    />
                                )}

                                {/* Message si aucun résultat après filtrage */}
                                {articlesBruts.length === 0 && articlesTransformes.length === 0 && (
                                    <div className="text-center py-20 bg-white dark:bg-[#2B2B26] rounded-2xl shadow-xl border-2 border-dashed border-[#E8E6E0] dark:border-[#4A4A42]">
                                        <Search className="w-20 h-20 mx-auto text-[#A8A599] mb-4" />
                                        <p className="text-2xl text-[#A8A599] italic font-medium">
                                            Aucun produit ne correspond à vos critères. 🔍
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </AppLayout>
    );
};

export default Catalogue;
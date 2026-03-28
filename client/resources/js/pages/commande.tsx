import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Truck, CreditCard, Tag, CheckCircle, Package } from 'lucide-react';

interface ArticlePanier {
    panier_id: number;
    article_id: number;
    nom: string;
    prix: number;
    quantite: number;
    image_url?: string | null;
}

interface CommandeProps {
    panier: ArticlePanier[];
    total: number;
    adresseLivraison: string;
}

const Commande: React.FC<CommandeProps> = ({ panier: initialPanier, total: initialTotal, adresseLivraison: initialAdresse }) => {
    const [articles, setArticles] = useState<ArticlePanier[]>(initialPanier);
    const [adresseLivraison, setAdresseLivraison] = useState(initialAdresse || '');
    const [codePromo, setCodePromo] = useState('');
    const [reduction, setReduction] = useState(0);
    const [messagePromo, setMessagePromo] = useState('');
    const [modePaiement, setModePaiement] = useState<'espece' | 'mobile_money' | 'carte_bancaire'>('espece');
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [factureData, setFactureData] = useState<{ articles: ArticlePanier[]; total: number; totalApresPromo: number; adresseLivraison: string }>({
        articles: [],
        total: 0,
        totalApresPromo: 0,
        adresseLivraison: '',
    });

    const total = articles.reduce((acc, a) => acc + a.prix * a.quantite, 0);
    const totalApresPromo = total - Math.round((total * reduction) / 100);

    const handleQuantiteChange = (panier_id: number, quantite: number) => {
        if (quantite < 1) return;
        setArticles(articles.map(a => (a.panier_id === panier_id ? { ...a, quantite } : a)));
    };

    const handleSupprimer = (panier_id: number) => {
        setArticles(articles.filter(a => a.panier_id !== panier_id));
        router.delete(`/commande/panier/${panier_id}`);
    };

    const handleCodePromo = () => {
        const codes = { AGRI10: 10, AGRI20: 20, TEST5: 5 };
        const codeMaj = codePromo.toUpperCase();

        if (codeMaj in codes) {
            const valeur = codes[codeMaj as keyof typeof codes];
            setReduction(valeur);
            setMessagePromo(`✅ Code appliqué : -${valeur}% de réduction !`);
        } else {
            setReduction(0);
            setMessagePromo('❌ Code promo invalide ou déjà utilisé.');
        }
    };

    const handleCommander = () => {
        if (articles.length === 0) { alert('Votre panier est vide !'); return; }
        if (!adresseLivraison.trim()) { alert('Veuillez renseigner votre adresse de livraison !'); return; }

        setLoading(true);
        router.post(
            '/commande',
            { articles, adresse_livraison: adresseLivraison, code_promo: codePromo, reduction, total: totalApresPromo, mode_paiement: modePaiement },
            {
                onSuccess: () => {
                    setLoading(false);
                    setFactureData({ 
                        articles: [...articles], 
                        total, 
                        totalApresPromo,
                        adresseLivraison: adresseLivraison 
                    });
                    setArticles([]);
                    setAdresseLivraison('');
                    setCodePromo('');
                    setReduction(0);
                    setMessagePromo('');
                    setModePaiement('espece');
                    setModalIsOpen(true);
                },
                onError: () => setLoading(false),
            }
        );
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        const logo = '/logo.png';
        
        const logoWidth = 30;
        const logoHeight = 30;
        const logoX = 14;
        const logoY = 10;
        doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

        const titreX = logoX + logoWidth + 5;
        const titreY = logoY + (logoHeight / 2);
        doc.setFontSize(18);
        doc.text('Facture AgriKewi Solution', titreX, titreY);
        
        let y = logoY + logoHeight + 10;
        doc.setFontSize(12);
        doc.text(`Date de la commande: ${new Date().toLocaleDateString()}`, 14, y);
        y += 6;
        doc.text(`Adresse de livraison: ${factureData.adresseLivraison}`, 14, y);

        y += 15;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Produit', 14, y);
        doc.text('Qté', 100, y);
        doc.text('Prix Unit.', 130, y);
        doc.text('Total', 170, y);
        doc.setFont('helvetica', 'normal');
        
        y += 2;
        doc.line(14, y, 200, y);
        y += 5;

        factureData.articles.forEach(a => {
            doc.text(a.nom.length > 50 ? a.nom.substring(0, 47) + '...' : a.nom, 14, y);
            doc.text(String(a.quantite), 100, y);
            doc.text(`${Math.round(a.prix)} FCFA`, 130, y);
            const totalArticle = Math.round(a.quantite * a.prix);
            doc.text(`${totalArticle} FCFA`, 170, y);
            y += 6;
        });

        y += 5;
        doc.line(14, y, 200, y);
        y += 6;
        
        doc.text(`Total avant promo: ${Math.round(factureData.total)} FCFA`, 140, y);
        y += 6;
        if (reduction > 0) {
            doc.text(`Réduction (${reduction}%): -${Math.round(factureData.total * reduction / 100)} FCFA`, 140, y);
        }
        y += 8;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total à payer: ${Math.round(factureData.totalApresPromo)} FCFA`, 140, y);
        doc.setFont('helvetica', 'normal');
        
        y += 15;
        doc.setFontSize(10);
        doc.text("Merci d'avoir acheté vos produits chez AgriKewi Solution !", 105, y, { align: 'center' });
        
        doc.save('facture.pdf');
    };

    return (
        <AppLayout>
            <div className="p-4 md:p-8 bg-[#F8F6F1] dark:bg-[#1B1B18] min-h-screen">
                <h1 className="text-3xl font-bold mb-8 text-[#2B2B26] dark:text-[#E8E6E0] flex items-center gap-3">
                    <Package className="w-8 h-8 text-[#8B6F47]" /> 
                    Validation de la Commande
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Panier */}
                    <div className="lg:col-span-2 bg-white dark:bg-[#2B2B26] shadow-xl rounded-2xl border-t-4 border-[#4CAF50]">
                        <div className="p-6 border-b-2 border-dashed border-[#E8E6E0] dark:border-[#4A4A42]">
                            <h2 className="text-2xl font-bold flex items-center text-[#2D5F3F] dark:text-[#4CAF50] gap-3">
                                <ShoppingCart className="w-6 h-6" /> 
                                Votre Panier ({articles.length} articles)
                            </h2>
                        </div>
                        <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                            <AnimatePresence>
                                {articles.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        exit={{ opacity: 0 }} 
                                        className="text-center py-16"
                                    >
                                        <ShoppingCart className="w-16 h-16 mx-auto text-[#A8A599] mb-4" />
                                        <p className="text-xl text-[#A8A599]">Votre panier est vide. Ajoutez des produits pour continuer !</p>
                                    </motion.div>
                                ) : (
                                    articles.map(a => (
                                        <motion.div 
                                            key={a.panier_id} 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            className="flex items-center gap-4 p-4 border-2 border-[#E8E6E0] dark:border-[#4A4A42] rounded-xl shadow-sm hover:shadow-md transition-all bg-[#F8F6F1] dark:bg-[#1B1B18]"
                                        >
                                            <img 
                                                src={a.image_url ? `/articles/${a.image_url}` : '/articles/default.png'} 
                                                alt={a.nom} 
                                                className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border-2 border-[#E8E6E0]"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold truncate text-lg text-[#2B2B26] dark:text-[#E8E6E0]">{a.nom}</p>
                                                <p className="text-sm text-[#8B6F47] dark:text-[#A0826D] mt-1 font-medium">{Math.round(a.prix)} FCFA / Unité</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <Input 
                                                    type="number" 
                                                    min={1} 
                                                    value={a.quantite} 
                                                    onChange={e => handleQuantiteChange(a.panier_id, Number(e.target.value))} 
                                                    className="w-16 text-center text-base p-2 border-2 border-[#E8E6E0] dark:border-[#4A4A42] rounded-lg"
                                                />
                                            </div>
                                            
                                            <div className="font-bold w-28 text-right text-[#2D5F3F] dark:text-[#4CAF50]">
                                                {Math.round(a.quantite * a.prix)} FCFA
                                            </div>

                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleSupprimer(a.panier_id)} 
                                                className="text-[#E53935] hover:bg-[#E53935]/10 rounded-lg"
                                            >
                                                <X className="w-5 h-5" />
                                            </Button>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Récapitulatif */}
                    <div className="lg:col-span-1 bg-white dark:bg-[#2B2B26] shadow-xl rounded-2xl border-t-4 border-[#F5A623]">
                        <div className="p-6 border-b-2 border-dashed border-[#E8E6E0] dark:border-[#4A4A42]">
                            <h2 className="text-2xl font-bold text-[#2D5F3F] dark:text-[#4CAF50]">
                                Récapitulatif & Paiement
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            
                            {/* Adresse */}
                            <div className="space-y-3">
                                <Label htmlFor="adresse" className="text-base font-bold flex items-center text-[#2B2B26] dark:text-[#E8E6E0] gap-2">
                                    <Truck className="w-5 h-5 text-[#8B6F47]" /> 
                                    Adresse de Livraison
                                </Label>
                                <Input 
                                    id="adresse"
                                    type="text" 
                                    placeholder="Rue, ville, pays..." 
                                    value={adresseLivraison} 
                                    onChange={e => setAdresseLivraison(e.target.value)} 
                                    className="p-3 border-2 border-[#E8E6E0] dark:border-[#4A4A42] rounded-lg focus:border-[#4CAF50] bg-[#F8F6F1] dark:bg-[#1B1B18]"
                                />
                            </div>
                            
                            {/* Paiement */}
                            <div className="space-y-3">
                                <Label htmlFor="paiement" className="text-base font-bold flex items-center text-[#2B2B26] dark:text-[#E8E6E0] gap-2">
                                    <CreditCard className="w-5 h-5 text-[#8B6F47]" /> 
                                    Mode de Paiement
                                </Label>
                                <select 
                                    id="paiement"
                                    value={modePaiement} 
                                    onChange={e => setModePaiement(e.target.value as any)} 
                                    className="w-full border-2 border-[#E8E6E0] dark:border-[#4A4A42] rounded-lg p-3 bg-[#F8F6F1] dark:bg-[#1B1B18] text-[#2B2B26] dark:text-[#E8E6E0]"
                                >
                                    <option value="espece">Espèce à la livraison</option>
                                </select>
                            </div>

                            {/* Code Promo */}
                            <div className="space-y-3">
                                <Label htmlFor="promo" className="text-base font-bold flex items-center text-[#2B2B26] dark:text-[#E8E6E0] gap-2">
                                    <Tag className="w-5 h-5 text-[#F5A623]" /> 
                                    Code Promo
                                </Label>
                                <div className="flex gap-2">
                                    <Input 
                                        id="promo"
                                        type="text" 
                                        placeholder="Code promo" 
                                        value={codePromo} 
                                        onChange={e => setCodePromo(e.target.value)} 
                                        className="flex-1 p-3 border-2 border-[#E8E6E0] dark:border-[#4A4A42] rounded-lg bg-[#F8F6F1] dark:bg-[#1B1B18]"
                                    />
                                    <Button 
                                        onClick={handleCodePromo} 
                                        className="bg-[#F5A623] hover:bg-[#E09616] text-[#2B2B26] font-bold px-6 rounded-lg"
                                    >
                                        Appliquer
                                    </Button>
                                </div>
                                {messagePromo && (
                                    <motion.p 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className={`text-sm font-medium ${reduction > 0 ? 'text-[#4CAF50]' : 'text-[#E53935]'}`}
                                    >
                                        {messagePromo}
                                    </motion.p>
                                )}
                            </div>

                            {/* Totaux */}
                            <div className="pt-6 border-t-2 border-dashed border-[#E8E6E0] dark:border-[#4A4A42] space-y-3">
                                <div className="flex justify-between text-base text-[#4A4A42] dark:text-[#A8A599]">
                                    <span>Total Panier:</span>
                                    <span className="font-bold">{Math.round(total)} FCFA</span>
                                </div>
                                {reduction > 0 && (
                                    <div className="flex justify-between text-base text-[#4CAF50] font-bold">
                                        <span>Réduction ({reduction}%):</span>
                                        <span>-{Math.round(total * reduction / 100)} FCFA</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-2xl font-extrabold pt-3 border-t-2 border-[#E8E6E0] dark:border-[#4A4A42] text-[#2D5F3F] dark:text-[#4CAF50]">
                                    <span>TOTAL À PAYER:</span>
                                    <span>{Math.round(totalApresPromo)} FCFA</span>
                                </div>
                            </div>

                            {/* Bouton Commander */}
                            <Button 
                                onClick={handleCommander} 
                                disabled={loading || articles.length === 0 || !adresseLivraison.trim()} 
                                className="w-full text-lg py-6 mt-6 bg-[#2D5F3F] hover:bg-[#1B3A28] text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg disabled:bg-[#A8A599] disabled:cursor-not-allowed"
                            >
                                {loading ? 'Traitement...' : 'Finaliser la commande'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Facture */}
            <AnimatePresence>
                {modalIsOpen && (
                    <motion.div 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="bg-white dark:bg-[#2B2B26] rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-8 relative border-t-8 border-[#4CAF50]"
                            initial={{ scale: 0.8, y: -50 }} 
                            animate={{ scale: 1, y: 0 }} 
                            exit={{ scale: 0.8, y: 50 }}
                        >
                            <CheckCircle className="w-20 h-20 text-[#4CAF50] mx-auto mb-6" />
                            <h2 className="text-3xl font-extrabold mb-3 text-center text-[#2D5F3F] dark:text-[#4CAF50]">Commande Réussie !</h2>
                            <p className="text-center text-[#4A4A42] dark:text-[#A8A599] mb-8">Votre commande est en cours de traitement.</p>

                            <div className="border-2 border-[#E8E6E0] dark:border-[#4A4A42] rounded-xl p-6 mb-6 bg-[#F8F6F1] dark:bg-[#1B1B18]">
                                <div className="flex justify-between font-bold border-b-2 border-dashed pb-3 mb-3 text-sm text-[#2B2B26] dark:text-[#E8E6E0] border-[#E8E6E0] dark:border-[#4A4A42]">
                                    <span>Produit</span>
                                    <span>Qté</span>
                                    <span>Total</span>
                                </div>
                                {factureData.articles.map(a => (
                                    <div key={a.panier_id} className="flex justify-between py-2 text-[#2B2B26] dark:text-[#E8E6E0]">
                                        <span className="max-w-[50%] truncate">{a.nom}</span>
                                        <span>x{a.quantite}</span>
                                        <span className="font-bold text-[#8B6F47]">{Math.round(a.quantite * a.prix)} F</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 border-t-2 border-dashed border-[#E8E6E0] dark:border-[#4A4A42] pt-6">
                                {reduction > 0 && (
                                    <p className="flex justify-between text-base text-[#4CAF50] font-bold">
                                        <span>Réduction ({reduction}%):</span>
                                        <span>-{Math.round(factureData.total * reduction / 100)} FCFA</span>
                                    </p>
                                )}
                                <p className="flex justify-between text-2xl font-extrabold text-[#2D5F3F] dark:text-[#4CAF50]">
                                    <span>TOTAL PAYÉ:</span>
                                    <span>{Math.round(factureData.totalApresPromo)} FCFA</span>
                                </p>
                            </div>

                            <div className="mt-8 flex justify-center gap-4">
                                <Button 
                                    onClick={downloadPDF} 
                                    className="bg-[#2D5F3F] hover:bg-[#1B3A28] text-white px-8 py-3 rounded-xl text-lg font-bold"
                                >
                                    Télécharger la Facture
                                </Button>
                                <Button 
                                    onClick={() => setModalIsOpen(false)} 
                                    variant="outline" 
                                    className="px-8 py-3 text-lg font-bold border-2 border-[#E8E6E0] dark:border-[#4A4A42] rounded-xl hover:bg-[#F8F6F1] dark:hover:bg-[#1B1B18]"
                                >
                                    Fermer
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
};

export default Commande;
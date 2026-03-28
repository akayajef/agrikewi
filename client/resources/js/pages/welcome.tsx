import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Menu, X } from 'lucide-react';
import { 
    Target, Eye, Handshake, Mail, Phone, Facebook, Instagram, Linkedin, MapPin, 
    Zap, Users, Leaf, ArrowRight, Layers, Send, MessageSquare, 
    ShoppingCart, Truck, ClipboardList, Factory, Package, 
    LayoutDashboard, ChevronUp, ChevronDown, LogIn, UserPlus
} from 'lucide-react';

export default function Welcome() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // --- ARCHITECTURE MICROSERVICES ---
    // Détection automatique de l'environnement
    const getBaseURL = (port: number) => {
        // Si on est sur localhost, utiliser localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return `http://localhost:${port}`;
        }
        // Sinon, utiliser l'IP actuelle avec le port
        return `http://${window.location.hostname}:${port}`;
    };

    const AGRICULTEUR_BASE_URL = getBaseURL(8001);
    const CLIENT_BASE_URL = getBaseURL(8003);
    const SUPERVISEUR_BASE_URL = getBaseURL(8001);

    const CLIENT_LOGIN_URL = `${CLIENT_BASE_URL}/login`;
    const CLIENT_REGISTER_URL = `${CLIENT_BASE_URL}/register`;
    const AGRICULTEUR_LOGIN_URL = `${AGRICULTEUR_BASE_URL}/login`;
    const AGRICULTEUR_REGISTER_URL = `${AGRICULTEUR_BASE_URL}/register`;

    // PALETTE DE COULEURS
    const PRIMARY_COLOR = '#4CAF50';
    const ACCENT_COLOR = '#FFC107';
    const SECONDARY_COLOR = '#004AAD';

    // --- COORDONNÉES GUÉDIAWAYE ---
    const GPS_COORDINATES = "QJMP+44, Guédiawaye";
    const DECIMAL_COORDS = "14.782812485725376,-17.367262426180613";
    const LOCATION_NAME = "Guédiawaye, Dakar, Sénégal";
    const IFRAME_SRC = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3003.825034131255!2d-17.367262426180613!3d14.782812485725376!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec10b47b6b25bcd%3A0x594b67bd352beb!2zUUpNUCs0NCwgR3XDqWRpYXdheWU!5e1!3m2!1sfr!2ssn!4v1762198754691!5m2!1sfr!2ssn";

    const heroImageUrl = "/img/dash.jpg";
    const heroBackgroundImage = "/img/ferme.jpg";

    const socialLinks = [
        { name: 'Facebook', href: '#', Icon: Facebook, color: 'hover:text-blue-600' },
        { name: 'Instagram', href: '#', Icon: Instagram, color: 'hover:text-pink-500' },
        { name: 'LinkedIn', href: '#', Icon: Linkedin, color: 'hover:text-blue-700' },
    ];
    
    const appFeatures = [
        { 
            title: "Dashboard Opérationnel", 
            description: "Vue synthétique des tâches en cours, des niveaux de stock, et du statut des commandes client en temps réel.", 
            icon: LayoutDashboard 
        },
        { 
            title: "Gestion des Tâches", 
            description: "Le Superviseur assigne, suit et valide les tâches d'entretien et de récolte pour optimiser le travail de l'Agriculteur.", 
            icon: ClipboardList 
        },
        { 
            title: "Traçabilité des Stocks", 
            description: "Enregistrez les produits agricoles et les intrants (semences, outils) dans les entrepôts, suivez les mouvements et les niveaux.", 
            icon: Package 
        },
    ];

    const testimonials = [
        { quote: "La plateforme AgriKewi est incroyablement intuitive. J'ai pu optimiser mes ressources et augmenter mon rendement de façon significative.", author: "Jean M., Producteur de tubercules" },
        { quote: "Le système de commande et de paiement est très fluide pour mes clients. Cela me permet de me concentrer sur la qualité de la production.", author: "Dr. Leke, Expert Agronome Partenaire" },
    ];

    interface CardProps {
        id?: string;
        title: string;
        children: React.ReactNode;
        icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
        className?: string;
    }

    const Card: React.FC<CardProps> = ({ id, title, children, icon: Icon, className = '' }) => (
        <div id={id} className={`p-4 sm:p-6 md:p-8 lg:p-12 bg-white rounded-xl shadow-lg dark:bg-gray-800 transition-all duration-300 hover:shadow-xl ${className}`}>
            <div className="flex items-center mb-4 sm:mb-6">
                <Icon className="w-6 h-6 sm:w-8 sm:h-8 mr-3 sm:mr-4 flex-shrink-0" style={{ color: PRIMARY_COLOR }} />
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold border-b-2 border-dashed pb-1 text-gray-900 dark:text-gray-100" style={{ borderColor: ACCENT_COLOR }}>{title}</h2>
            </div>
            {children}
        </div>
    );

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const [formData, setFormData] = useState({
        objet: '',
        message: '',
        email: ''
    });
    const [formStatus, setFormStatus] = useState('idle');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.email || !formData.objet || !formData.message) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        setFormStatus('sending');

        try {
            const serviceID = 'service_b97tqoi'; 
            const templateID = 'template_dgivw09'; 
            const publicKey = '3ug725wYa7uWBvB3k'; 

            const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    service_id: serviceID,
                    template_id: templateID,
                    user_id: publicKey,
                    template_params: {
                        to_email: 'agrikewi@gmail.com',
                        from_email: formData.email,
                        subject: formData.objet,
                        message: formData.message,
                        reply_to: formData.email
                    }
                })
            });

            if (response.ok) {
                setFormStatus('success');
                setFormData({ objet: '', message: '', email: '' });
                setTimeout(() => setFormStatus('idle'), 5000);
            } else {
                throw new Error('Erreur lors de l\'envoi');
            }
        } catch (error) {
            console.error('Erreur:', error);
            setFormStatus('error');
            setTimeout(() => setFormStatus('idle'), 5000);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-white dark:bg-gray-900 transition-colors duration-300">
            
            {/* Navbar Fixe avec Menu Mobile */}
            <header className="sticky top-0 z-50 w-full backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-black/80 shadow-md">
                <div className="relative z-10 flex justify-between items-center px-4 py-3 lg:px-8 max-w-7xl mx-auto">
                    
                    <div className="flex items-center space-x-2">
                        <img 
                            src="/img/logo2.png" 
                            alt="Logo AgriKewi Solution" 
                            className="h-12 sm:h-14 md:h-16 w-auto" 
                        />
                    </div>
                    
                    {/* Navigation Desktop */}
                    <nav className="hidden lg:flex items-center gap-6 text-base font-bold text-gray-900 dark:text-gray-100">
                        <a href="#accueil" className="hover:text-green-600 transition-colors" style={{ color: SECONDARY_COLOR }}>Accueil</a>
                        <a href="#processus" className="hover:text-green-600 transition-colors" style={{ color: SECONDARY_COLOR }}>Fonctionnement</a>
                        <a href="#utilisateurs" className="hover:text-green-600 transition-colors" style={{ color: SECONDARY_COLOR }}>Pour Qui ?</a>
                        <a href="#fonctionnalites" className="hover:text-green-600 transition-colors" style={{ color: SECONDARY_COLOR }}>Fonctionnalités</a>
                        <a href="#contact" className="hover:text-green-600 transition-colors" style={{ color: SECONDARY_COLOR }}>Contact</a>
                    </nav>

                    {/* Boutons Desktop */}
                    <nav className="hidden lg:flex items-center gap-4 text-sm">
                        <div className="relative group">
                            <button
                                className="inline-flex items-center rounded-full px-4 py-2 text-sm leading-normal text-gray-900 hover:text-green-600 dark:text-gray-100 transition-colors font-bold focus:outline-none"
                                style={{ color: SECONDARY_COLOR }}
                            >
                                <LogIn className="w-4 h-4 mr-2" /> Connexion <ChevronDown className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:rotate-180" />
                            </button>

                            <ul 
                                className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform scale-95 group-hover:scale-100 z-50 border-t-4"
                                style={{ borderColor: SECONDARY_COLOR }}
                            >
                                <li className="px-4 py-2 font-bold text-gray-900 dark:text-gray-100 border-b dark:border-gray-700">Je me connecte en tant que :</li>
                                
                                <li>
                                    <a
                                        href={CLIENT_LOGIN_URL}
                                        className="flex items-center px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-green-500/10 dark:hover:bg-green-500/20 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: ACCENT_COLOR }} /> 
                                        <div className='text-left'>
                                            <span className='font-bold text-gray-900 dark:text-gray-100'>Client</span>
                                            <span className='block text-xs text-gray-500 dark:text-gray-400'>Accéder à mon espace client.</span>
                                        </div>
                                    </a>
                                </li>

                                <div className="border-t border-dashed dark:border-gray-700 my-1"></div>

                                <li>
                                    <a
                                        href={AGRICULTEUR_LOGIN_URL}
                                        className="flex items-center px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-green-500/10 dark:hover:bg-green-500/20 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                    >
                                        <Leaf className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: PRIMARY_COLOR }} /> 
                                        <div className='text-left'>
                                            <span className='font-bold text-gray-900 dark:text-gray-100'>Superviseur / Agriculteur</span>
                                            <span className='block text-xs text-gray-500 dark:text-gray-400'>Accéder à mon tableau de bord.</span>
                                        </div>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="relative group">
                            <button
                                className="inline-flex items-center rounded-full px-6 py-2 text-sm leading-normal text-white transition-colors shadow-2xl font-extrabold focus:outline-none"
                                style={{ backgroundColor: PRIMARY_COLOR }}
                            >
                                <UserPlus className="w-4 h-4 mr-1" /> S'inscrire <ChevronDown className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:rotate-180" />
                            </button>

                            <ul 
                                className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform scale-95 group-hover:scale-100 z-50 border-t-4"
                                style={{ borderColor: ACCENT_COLOR }}
                            >
                                <li className="px-4 py-2 font-bold text-gray-900 dark:text-gray-100 border-b dark:border-gray-700">Je m'inscris en tant que :</li>
                                
                                <li>
                                    <a
                                        href={CLIENT_REGISTER_URL}
                                        className="flex items-center px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-green-500/10 dark:hover:bg-green-500/20 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: ACCENT_COLOR }} /> 
                                        <div className='text-left'>
                                            <span className='font-bold text-gray-900 dark:text-gray-100'>Client</span>
                                            <span className='block text-xs text-gray-500 dark:text-gray-400'>Pour commander des produits.</span>
                                        </div>
                                    </a>
                                </li>

                                <div className="border-t border-dashed dark:border-gray-700 my-1"></div>

                                <li>
                                    <a
                                        href={AGRICULTEUR_REGISTER_URL}
                                        className="flex items-center px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-green-500/10 dark:hover:bg-green-500/20 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                    >
                                        <Leaf className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: PRIMARY_COLOR }} /> 
                                        <div className='text-left'>
                                            <span className='font-bold text-gray-900 dark:text-gray-100'>Superviseur / Agriculteur</span>
                                            <span className='block text-xs text-gray-500 dark:text-gray-400'>Pour gérer la production.</span>
                                        </div>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    {/* Bouton Menu Mobile */}
                    <button 
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6 text-gray-900 dark:text-gray-100" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-900 dark:text-gray-100" />
                        )}
                    </button>
                </div>

                {/* Menu Mobile */}
                {mobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
                        <nav className="flex flex-col p-4 space-y-3">
                            <a href="#accueil" className="py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-gray-900 dark:text-gray-100" onClick={() => setMobileMenuOpen(false)}>Accueil</a>
                            <a href="#processus" className="py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-gray-900 dark:text-gray-100" onClick={() => setMobileMenuOpen(false)}>Fonctionnement</a>
                            <a href="#utilisateurs" className="py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-gray-900 dark:text-gray-100" onClick={() => setMobileMenuOpen(false)}>Pour Qui ?</a>
                            <a href="#fonctionnalites" className="py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-gray-900 dark:text-gray-100" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</a>
                            <a href="#contact" className="py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-gray-900 dark:text-gray-100" onClick={() => setMobileMenuOpen(false)}>Contact</a>
                            
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 space-y-3">
                                <div className="font-bold text-sm text-gray-500 dark:text-gray-400 px-4">CONNEXION</div>
                                <a href={CLIENT_LOGIN_URL} className="flex items-center py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <ShoppingCart className="w-5 h-5 mr-3" style={{ color: ACCENT_COLOR }} />
                                    <span className="font-bold text-gray-900 dark:text-gray-100">Client</span>
                                </a>
                                <a href={AGRICULTEUR_LOGIN_URL} className="flex items-center py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <Leaf className="w-5 h-5 mr-3" style={{ color: PRIMARY_COLOR }} />
                                    <span className="font-bold text-gray-900 dark:text-gray-100">Superviseur / Agriculteur</span>
                                </a>
                                
                                <div className="font-bold text-sm text-gray-500 dark:text-gray-400 px-4 pt-3">INSCRIPTION</div>
                                <a href={CLIENT_REGISTER_URL} className="flex items-center py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <UserPlus className="w-5 h-5 mr-3" style={{ color: ACCENT_COLOR }} />
                                    <span className="font-bold text-gray-900 dark:text-gray-100">S'inscrire comme Client</span>
                                </a>
                                <a href={AGRICULTEUR_REGISTER_URL} className="flex items-center py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <UserPlus className="w-5 h-5 mr-3" style={{ color: PRIMARY_COLOR }} />
                                    <span className="font-bold text-gray-900 dark:text-gray-100">S'inscrire comme Agriculteur</span>
                                </a>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            <main className="w-full max-w-7xl px-4 py-8 sm:py-12 lg:py-24 space-y-12 sm:space-y-16 lg:space-y-24">
                
                {/* SECTION HERO */}
                <section 
                    id="accueil" 
                    className="relative pt-10 pb-16 sm:pb-20 lg:pt-20 lg:pb-32 overflow-hidden rounded-xl shadow-2xl"
                    style={{
                        backgroundImage: `url('${heroBackgroundImage}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div 
                        className="absolute inset-0 transition-all duration-300" 
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        }}
                    ></div>
                    
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 sm:gap-12 px-4 mx-auto max-w-7xl">
                        
                        <div className="text-center lg:text-left">
                            <span className="inline-block text-xs sm:text-sm font-bold uppercase rounded-full px-3 py-1 mb-3 sm:mb-4 text-white" style={{ backgroundColor: ACCENT_COLOR }}>
                                Accès Instantané par Navigateur
                            </span>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-3 sm:mb-4 text-white leading-tight">
                                Gérez votre ferme, <span style={{ color: ACCENT_COLOR }}>Optimisez vos récoltes</span>.
                            </h1>
                            <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8">
                                L'application Web AgriKewi est votre plateforme complète de gestion de production agricole et de vente en ligne.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8">
                                <a
                                    href="#nousrejoindre" 
                                    className="inline-flex items-center justify-center rounded-full px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-extrabold text-white shadow-2xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                                    style={{ backgroundColor: PRIMARY_COLOR }}
                                >
                                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Rejoindre
                                </a>
                                <a
                                    href="#processus" 
                                    className="inline-flex items-center justify-center rounded-full px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-extrabold text-white transition-colors border-2 border-white hover:bg-white hover:text-gray-900 w-full sm:w-auto"
                                >
                                    <Layers className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> En savoir plus
                                </a>
                            </div>
                        </div>

                        <div className="relative p-4 sm:p-8 rounded-2xl bg-white/10 shadow-2xl hidden lg:block backdrop-blur-sm" style={{ border: `4px solid ${ACCENT_COLOR}` }}>
                            <img 
                                src={heroImageUrl} 
                                alt="Interface AgriKewi" 
                                className="w-full h-auto object-cover rounded-lg shadow-inner opacity-90" 
                            />
                            <div className='absolute top-4 right-4 text-xs sm:text-sm font-bold p-2 rounded-full text-white' style={{ backgroundColor: PRIMARY_COLOR }}>
                                Plateforme Web
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* SECTION PROCESSUS */}
                <section id="processus" className="pt-8 sm:pt-12 lg:pt-16 text-center">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-8 sm:mb-12 text-gray-900 dark:text-gray-100 px-4">
                        Le Flux Complet d'<span style={{ color: PRIMARY_COLOR }}>AgriKewi</span> : Du Champ à l'Assiette
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
                        
                        <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl transition-all duration-300 border-t-4 hover:shadow-2xl hover:translate-y-[-4px]" style={{ borderColor: SECONDARY_COLOR }}>
                            <span className="text-3xl sm:text-4xl font-extrabold block mb-3" style={{ color: PRIMARY_COLOR }}>1</span>
                            <ClipboardList className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3" style={{ color: ACCENT_COLOR }} />
                            <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Supervision & Exécution</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">Le Superviseur crée et attribue des tâches agricoles au personnel via l'interface de gestion.</p>
                        </div>
                        
                        <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl transition-all duration-300 border-t-4 hover:shadow-2xl hover:translate-y-[-4px]" style={{ borderColor: PRIMARY_COLOR }}>
                            <span className="text-3xl sm:text-4xl font-extrabold block mb-3" style={{ color: PRIMARY_COLOR }}>2</span>
                            <Factory className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3" style={{ color: ACCENT_COLOR }} />
                            <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Valorisation des Récoltes</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">Après la récolte, le Superviseur valide la mise en stock et l'affichage des produits au catalogue.</p>
                        </div>
                        
                        <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl transition-all duration-300 border-t-4 hover:shadow-2xl hover:translate-y-[-4px]" style={{ borderColor: ACCENT_COLOR }}>
                            <span className="text-3xl sm:text-4xl font-extrabold block mb-3" style={{ color: PRIMARY_COLOR }}>3</span>
                            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3" style={{ color: ACCENT_COLOR }} />
                            <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Achat Client en Ligne</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">Le Client navigue dans le catalogue, ajoute des produits au panier et valide sa commande.</p>
                        </div>
                        
                        <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl transition-all duration-300 border-t-4 hover:shadow-2xl hover:translate-y-[-4px]" style={{ borderColor: SECONDARY_COLOR }}>
                            <span className="text-3xl sm:text-4xl font-extrabold block mb-3" style={{ color: PRIMARY_COLOR }}>4</span>
                            <Truck className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3" style={{ color: ACCENT_COLOR }} />
                            <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Préparation et Livraison</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">L'équipe prépare la commande à partir du stock, et la livraison est effectuée à l'adresse du client.</p>
                        </div>
                    </div>
                </section>

                {/* SECTION UTILISATEURS */}
                <section id="utilisateurs" className="pt-12 sm:pt-16 text-center">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-8 sm:mb-12 text-gray-900 dark:text-gray-100 px-4">
                        Pour <span style={{ color: PRIMARY_COLOR }}>Qui ?</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
                        <div className="p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 hover:shadow-2xl transition-all" style={{borderColor: PRIMARY_COLOR}}>
                            <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4" style={{color: PRIMARY_COLOR}} />
                            <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Superviseur / Propriétaire</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Créez vos parcelles, assignez les tâches aux agriculteurs et suivez la production en temps réel.
                            </p>
                        </div>

                        <div className="p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 hover:shadow-2xl transition-all" style={{borderColor: ACCENT_COLOR}}>
                            <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4" style={{color: ACCENT_COLOR}} />
                            <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Client</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Parcourez le catalogue des produits, passez vos commandes et suivez vos livraisons.
                            </p>
                        </div>
                    </div>
                </section>
                
                {/* SECTION PARTENAIRES */}
                <section id="partenaires" className="pt-12 sm:pt-16 text-center">
                    <div className="p-6 sm:p-8 lg:p-10 rounded-xl shadow-xl border-2 border-dashed mx-auto max-w-4xl transition-all duration-500 hover:shadow-2xl dark:bg-gray-800" style={{ borderColor: ACCENT_COLOR }}>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 text-gray-900 dark:text-gray-100">
                            Envie de forger l'avenir de l'Agri-Tech avec nous ?
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6">
                            <span style={{ color: PRIMARY_COLOR, fontWeight: 700 }}>AgriKewi est en pleine croissance.</span> Devenez notre partenaire stratégique.
                        </p>
                        <a 
                            href="#contact" 
                            className="inline-flex items-center justify-center rounded-full px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-extrabold shadow-2xl transition-all duration-300 transform hover:scale-105 text-white"
                            style={{ backgroundColor: PRIMARY_COLOR }}
                        >
                            <Handshake className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Discutons Partenariat
                        </a>
                    </div>
                </section>
                
                {/* SECTION FONCTIONNALITÉS */}
                <section id="fonctionnalites" className="pt-12 sm:pt-16">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center mb-8 sm:mb-12 text-gray-900 dark:text-gray-100 px-4">
                        Les <span style={{ color: PRIMARY_COLOR }}>Outils de Gestion</span> de notre Plateforme
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {appFeatures.map((feature, index) => (
                            <div key={index} className="p-6 sm:p-8 text-center bg-white rounded-xl shadow-lg dark:bg-gray-800 border-t-4 transition-all duration-300 hover:shadow-2xl hover:translate-y-[-4px]" style={{ borderColor: ACCENT_COLOR }}>
                                <feature.icon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4" style={{ color: PRIMARY_COLOR }} />
                                <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION MISSION/VISION/OBJECTIFS */}
                <section className='pt-12 sm:pt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8'>
                    <Card title="Notre Mission" icon={Target} className='col-span-1'>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 text-base sm:text-lg">
                            AgriKewi Solution est au cœur de la révolution numérique agricole. Notre objectif est de garantir une autosuffisance alimentaire durable.
                        </p>
                        <p className="font-extrabold text-base sm:text-lg" style={{ color: PRIMARY_COLOR }}>
                            "Meilleure organisation. Plus d'efficacité."
                        </p>
                    </Card>

                    <Card title="Notre Vision" icon={Eye} className='col-span-1'>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 text-base sm:text-lg">
                            Devenir la référence en solutions numériques pour l'agriculture, en connectant producteurs, clients et partenaires dans un écosystème durable.
                        </p>
                    </Card>

                    <Card title="Nos Objectifs" icon={Zap} className='col-span-1'>
                        <ul className="text-gray-600 dark:text-gray-300 list-disc pl-5 text-sm space-y-2">
                            <li>Optimiser la gestion agricole via une plateforme digitale.</li>
                            <li>Faciliter l'accès au marché pour les producteurs locaux.</li>
                            <li>Promouvoir des circuits courts et durables.</li>
                            <li>Renforcer la collaboration avec des partenaires stratégiques.</li>
                        </ul>
                    </Card>
                </section>
                
                {/* SECTION TÉMOIGNAGES */}
                <section id="temoignages" className="pt-12 sm:pt-16 bg-blue-50 dark:bg-gray-800 p-6 sm:p-8 lg:p-16 rounded-xl shadow-inner">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center mb-8 sm:mb-12 text-gray-900 dark:text-gray-100 px-4">
                        Ce que nos utilisateurs <span style={{ color: PRIMARY_COLOR }}>Disent</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
                        {testimonials.map((t, index) => (
                            <div key={index} className="p-4 sm:p-6 bg-white dark:bg-gray-700 rounded-xl shadow-lg border-l-4 transition-all duration-500 hover:shadow-xl" style={{ borderColor: PRIMARY_COLOR }}>
                                <blockquote className="italic text-gray-700 dark:text-gray-200 text-base sm:text-lg mb-4">
                                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 inline-block align-top" style={{ color: ACCENT_COLOR }} />
                                    "{t.quote}"
                                </blockquote>
                                <p className="font-bold text-right text-sm sm:text-base text-gray-900 dark:text-gray-100">- {t.author}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION FAQ */}
                <section id="faq" className="pt-12 sm:pt-16 text-center max-w-5xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-8 sm:mb-12 text-gray-900 dark:text-gray-100 px-4">
                        Questions <span style={{ color: PRIMARY_COLOR }}>Fréquentes</span>
                    </h2>
                    <div className="space-y-4 sm:space-y-6 text-left">
                        <details className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4" style={{borderColor: SECONDARY_COLOR}}>
                            <summary className="cursor-pointer font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100">Comment créer une parcelle pour un superviseur ?</summary>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Une fois connecté, allez dans "Mes Parcelles", cliquez sur "Ajouter une parcelle", renseignez les informations et assignez un agriculteur.</p>
                        </details>
                        <details className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4" style={{borderColor: SECONDARY_COLOR}}>
                            <summary className="cursor-pointer font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100">Comment un client passe une commande ?</summary>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Connectez-vous à votre espace client, parcourez le catalogue, ajoutez les produits au panier et validez le paiement.</p>
                        </details>
                        <details className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4" style={{borderColor: SECONDARY_COLOR}}>
                            <summary className="cursor-pointer font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100">Est-ce que l'application est disponible en mobile ?</summary>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">L'application est entièrement web-based et optimisée pour tous les appareils via un navigateur internet.</p>
                        </details>
                    </div>
                </section>
                
                {/* SECTION CTA FINALE */}
                <section id="nousrejoindre" className="text-center py-12 sm:py-16 rounded-xl shadow-2xl" style={{ backgroundColor: SECONDARY_COLOR }}>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 px-4">
                        Prêt à nous rejoindre ?
                    </h3>
                    <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 px-4">
                        Choisissez votre profile pour créer votre compte en quelques secondes.
                    </p>
                     
                    <div className='flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 max-w-lg mx-auto px-4'>
                        
                        <a
                            href={AGRICULTEUR_REGISTER_URL} 
                            className="inline-flex items-center justify-center rounded-full px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-extrabold text-white shadow-2xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                            style={{ backgroundColor: PRIMARY_COLOR }}
                        >
                            <Leaf className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Agriculteur
                        </a>
                        
                        <a
                            href={CLIENT_REGISTER_URL} 
                            className="inline-flex items-center justify-center rounded-full px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-extrabold text-black shadow-2xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                            style={{ backgroundColor: ACCENT_COLOR }}
                        >
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Client
                        </a>
                    </div>

                </section>
                
                {/* SECTION CONTACT */}
                <div id="contact" className="pt-12 sm:pt-16 space-y-8 sm:space-y-12">
                     <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center mb-8 sm:mb-12 text-gray-900 dark:text-gray-100 px-4">
                        Nous <span style={{ color: PRIMARY_COLOR }}>Contacter</span>
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
                        
                        {/* Coordonnées et Localisation */}
                        <Card title="Coordonnées et Localisation" icon={MapPin} className='h-full'>
                            <p className='mb-4 text-sm sm:text-base text-gray-600 dark:text-gray-300'>Pour les partenariats, la presse ou les questions techniques.</p>
                            
                            <div className="space-y-3 sm:space-y-4 text-gray-600 dark:text-gray-300">
                                <p className="flex items-center text-sm sm:text-base lg:text-lg">
                                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" style={{ color: ACCENT_COLOR }} />
                                    <span className="break-all">Email : agrikewi@mail.com</span>
                                </p>
                                <p className="flex items-center text-sm sm:text-base lg:text-lg">
                                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" style={{ color: ACCENT_COLOR }} />
                                    Téléphone : +221 77 723 95 40
                                </p>
                                <p className="flex items-start text-sm sm:text-base lg:text-lg">
                                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 mt-1 flex-shrink-0" style={{ color: ACCENT_COLOR }} />
                                    <span>
                                        <span className="font-bold mr-2 text-gray-900 dark:text-gray-100">Emplacement :</span> 
                                        <span className="font-medium text-gray-600 dark:text-gray-300">
                                            {LOCATION_NAME}
                                        </span>
                                    </span>
                                </p>
                            </div>

                            <hr className="my-6 sm:my-8 border-t border-gray-200 dark:border-gray-700" />

                            {/* Carte Google Maps */}
                            <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Localisation Interactive</h3>
                            <div className="h-64 sm:h-80 lg:h-96 w-full rounded-lg overflow-hidden shadow-xl" style={{ border: `2px solid ${SECONDARY_COLOR}` }}>
                                <iframe 
                                    title="Localisation du bureau AgriKewi"
                                    src={IFRAME_SRC} 
                                    width="100%" 
                                    height="100%" 
                                    style={{ border: 0 }} 
                                    allowFullScreen 
                                    loading="lazy" 
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                            <p className="text-center text-xs mt-3 text-gray-500 dark:text-gray-400">
                                Coordonnées exactes : {GPS_COORDINATES}
                            </p>
                        </Card>

                        {/* Formulaire de Contact */}
                        <div className="p-4 sm:p-6 md:p-8 lg:p-12 bg-white rounded-xl shadow-lg dark:bg-gray-800 h-fit">
                            <div className="flex items-center mb-4 sm:mb-6">
                                <Mail className="w-6 h-6 sm:w-8 sm:h-8 mr-3 sm:mr-4 flex-shrink-0" style={{ color: PRIMARY_COLOR }} />
                                <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-dashed pb-1 text-gray-900 dark:text-gray-100" style={{ borderColor: ACCENT_COLOR }}>
                                    Écrivez-nous
                                </h2>
                            </div>

                            {/* Messages de statut */}
                            {formStatus === 'success' && (
                                <div className="mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-start text-green-800 dark:bg-green-900/20 dark:border-green-800">
                                    <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                    <span className="text-xs sm:text-sm font-bold">Message envoyé avec succès ! Nous vous répondrons rapidement.</span>
                                </div>
                            )}

                            {formStatus === 'error' && (
                                <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-800 dark:bg-red-900/20 dark:border-red-800">
                                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                    <span className="text-xs sm:text-sm font-bold">Erreur lors de l'envoi. Veuillez réessayer ou nous contacter par email.</span>
                                </div>
                            )}

                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
                                        Votre Email *
                                    </label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:border-green-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100" 
                                        placeholder="votre@email.com" 
                                    />
                                </div>

                                <div>
                                    <label htmlFor="objet" className="block text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
                                        Objet *
                                    </label>
                                    <input 
                                        type="text" 
                                        id="objet" 
                                        name="objet"
                                        value={formData.objet}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:border-green-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100" 
                                        placeholder="Demande de partenariat..." 
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
                                        Message *
                                    </label>
                                    <textarea 
                                        id="message" 
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows={5} 
                                        className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:border-green-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100" 
                                        placeholder="Votre proposition détaillée..."
                                    ></textarea>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={formStatus === 'sending'}
                                    className="w-full flex items-center justify-center rounded-lg px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white font-extrabold transition-colors shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: PRIMARY_COLOR }}
                                >
                                    {formStatus === 'sending' ? (
                                        <>
                                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Envoyer le Message
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="w-full mt-8 sm:mt-12 py-8 sm:py-12 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    
                    {/* Logo & Sociaux */}
                    <div className="space-y-3 text-center sm:text-left">
                        <img src="/img/logo2.png" alt="Logo AgriKewi Solution" className="h-12 sm:h-16 w-auto mb-2 mx-auto sm:mx-0" />
                        <p>L'innovation au service de l'agriculture.</p>
                        
                        <div className="flex space-x-4 pt-2 justify-center sm:justify-start">
                            {socialLinks.map(({ name, href, Icon, color }) => (
                                <a
                                    key={name}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`transition-colors text-gray-600 dark:text-gray-400 ${color}`}
                                    aria-label={name}
                                >
                                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Liens Rapides */}
                    <div className="space-y-3 text-center sm:text-left">
                        <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-900 dark:text-gray-100">Navigation</h3>
                        <ul className="space-y-2">
                            <li><a href="#accueil" className="hover:text-green-600 transition-colors">Accueil</a></li>
                            <li><a href="#processus" className="hover:text-green-600 transition-colors">Fonctionnement</a></li>
                            <li><a href="#utilisateurs" className="hover:text-green-600 transition-colors">Pour Qui ?</a></li>
                            <li><a href="#fonctionnalites" className="hover:text-green-600 transition-colors">Fonctionnalités</a></li>
                            <li><a href="#faq" className="hover:text-green-600 transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    {/* Accès Plateforme */}
                    <div className="space-y-3 text-center sm:text-left">
                        <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-900 dark:text-gray-100">Mon Espace</h3>
                        <ul className="space-y-2">
                            <li><a href={CLIENT_LOGIN_URL} className='hover:text-green-600 transition-colors'>Connexion Client</a></li>
                            
                            <li className="pt-2 border-t border-dashed dark:border-gray-600">
                                <a href={AGRICULTEUR_LOGIN_URL} className='hover:text-green-600 transition-colors'>Connexion Agriculteur/Sup.</a>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Infos Légales & Contact */}
                    <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
                        <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-900 dark:text-gray-100">Infos & Contact</h3>
                        <p className="mb-3">
                            <a href="#" className="hover:underline">Mentions Légales</a>
                            <br/>
                            <a href="#" className="hover:underline">Politique de Confidentialité</a>
                        </p>
                        <p className="font-bold text-gray-900 dark:text-gray-100 break-all">
                            Email: contact@agrikewi.com
                        </p>
                        <p className="font-bold text-gray-900 dark:text-gray-100">
                            Tél: +241 077 97 46 87
                        </p>
                    </div>

                </div>
                
                {/* Bas du Footer */}
                <div className="mt-6 sm:mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-600 dark:text-gray-400 px-4">
                    <p>
                        © {new Date().getFullYear()} AgriKewi Solution. Tous droits réservés. Basé à {LOCATION_NAME}.
                    </p>
                </div>
            </footer>
            
            {/* Bouton Scroll-to-Top */}
            <button 
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 p-2.5 sm:p-3 rounded-full shadow-lg text-gray-900 transition-all duration-300 transform hover:scale-110 z-40"
                style={{ backgroundColor: ACCENT_COLOR }}
                aria-label="Retour en haut de page"
            >
                <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
        </div>
    );
}
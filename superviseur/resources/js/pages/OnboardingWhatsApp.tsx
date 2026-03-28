import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

interface OnboardingProps {
    superviseur: {
        id: number;
        nom: string;
        prenom: string;
        telephone: string;
    };
    sandboxNumber: string;
    sandboxCode: string;
}

export default function OnboardingWhatsApp({ superviseur, sandboxNumber, sandboxCode }: OnboardingProps) {
    const [connected, setConnected] = useState(false);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        if (connected) return;

        const checkConnection = async () => {
            setChecking(true);
            try {
                const res = await fetch(`/superviseur/${superviseur.id}/confirm-whatsapp`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.connected) {
                        setConnected(true);
                        // Redirection Inertia vers le dashboard
                        setTimeout(() => {
                            router.visit('/dashboard');
                        }, 1000);
                    }
                }
            } catch (error) {
                console.error('Erreur vérification WhatsApp :', error);
            } finally {
                setChecking(false);
            }
        };

        const interval = setInterval(checkConnection, 5000);
        return () => clearInterval(interval);
    }, [connected, superviseur.id]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                {/* Icône WhatsApp */}
                <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                    </div>
                </div>

                {/* Titre */}
                <h1 className="text-2xl font-bold text-green-600 mb-4">
                    Connecte ton WhatsApp
                </h1>

                {/* Instructions */}
                <p className="text-gray-600 mb-6">
                    Pour recevoir les notifications, envoie ce message depuis WhatsApp :
                </p>

                {/* Code à envoyer */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-600 mb-2">Envoyer à :</p>
                    <p className="text-xl font-bold text-green-700 mb-3">
                        {sandboxNumber}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">Le message :</p>
                    <p className="text-2xl font-bold text-teal-700">
                        {sandboxCode}
                    </p>
                </div>

                {/* Statut */}
                {!connected && (
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            {checking ? '🔄 Vérification en cours...' : '⏳ En attente de la connexion...'}
                        </p>
                        
                        {/* Loader animé */}
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-200 border-t-green-600"></div>
                        </div>
                    </div>
                )}

                {connected && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                        <p className="font-bold">✅ Connexion réussie !</p>
                        <p className="text-sm">Redirection en cours...</p>
                    </div>
                )}

                {/* Info supplémentaire */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Superviseur : <span className="font-medium text-gray-700">{superviseur.prenom} {superviseur.nom}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
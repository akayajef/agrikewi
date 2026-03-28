import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Plus } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface Props {
    localites: { id: number; nom: string }[];
}

const STEP_1_FIELDS = ['nom', 'prenom', 'email', 'telephone'];

export default function RegisterSuperviseur({ localites }: Props) {
    const [step, setStep] = useState(1);
    const [modeLocalite, setModeLocalite] = useState<'select' | 'custom'>('select');

    const PRIMARY_COLOR = '#4CAF50';
    const HOVER_PRIMARY_COLOR = '#388E3C';
    const SECONDARY_COLOR = '#004AAD';

    const form = useForm({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        localite_id: '',
        nouvelle_localite: '', // Nouveau champ pour la localité personnalisée
        password: '',
        password_confirmation: '',
    });

    const inputClasses = `bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-[${PRIMARY_COLOR}] focus:border-[${PRIMARY_COLOR}]`;

    useEffect(() => {
        if (Object.keys(form.errors).length > 0) {
            const hasStep1Error = STEP_1_FIELDS.some(field => form.errors[field]);
            if (hasStep1Error) setStep(1);
        }
    }, [form.errors]);

    // Basculer entre les modes de sélection de localité
    const toggleModeLocalite = () => {
        const newMode = modeLocalite === 'select' ? 'custom' : 'select';
        setModeLocalite(newMode);
        
        // Réinitialiser les champs appropriés
        if (newMode === 'select') {
            form.setData('nouvelle_localite', '');
        } else {
            form.setData('localite_id', '');
        }
    };

    return (
        <AuthLayout
            title="Créer un compte superviseur"
            description="Remplissez les informations pour démarrer l'enregistrement"
            className={`bg-gradient-to-br from-[${PRIMARY_COLOR}] to-[${SECONDARY_COLOR}] text-white`}
        >
            <Head title="Inscription Superviseur" />

            <form
                onSubmit={e => {
                    e.preventDefault();
                    form.post('/register');
                }}
                className="flex flex-col gap-6 p-6 rounded-xl"
            >
                {step === 1 && (
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="nom">Nom</Label>
                            <Input
                                id="nom"
                                type="text"
                                value={form.data.nom}
                                onChange={e => {
                                    const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, '');
                                    form.setData('nom', value);
                                }}
                                autoFocus
                                placeholder="Votre nom"
                                className={inputClasses}
                            />
                            <InputError message={form.errors.nom} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="prenom">Prénom</Label>
                            <Input
                                id="prenom"
                                type="text"
                                value={form.data.prenom}
                                onChange={e => {
                                    const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, '');
                                    form.setData('prenom', value);
                                }}
                                placeholder="Votre prénom"
                                className={inputClasses}
                            />
                            <InputError message={form.errors.prenom} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.data.email}
                                onChange={e => form.setData('email', e.target.value)}
                                placeholder="email@example.com"
                                className={inputClasses}
                            />
                            <InputError message={form.errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="telephone">Téléphone</Label>
                            <Input
                                id="telephone"
                                type="text"
                                value={form.data.telephone}
                                onChange={e => {
                                    const value = e.target.value.replace(/[^0-9\s+()-]/g, '');
                                    form.setData('telephone', value);
                                }}
                                placeholder="Votre numéro de téléphone"
                                className={inputClasses}
                                maxLength={20}
                            />
                            <InputError message={form.errors.telephone} />
                        </div>

                        <div className="flex justify-end mt-4">
                            <Button
                                type="button"
                                onClick={() => setStep(2)}
                                className={`w-auto bg-[${PRIMARY_COLOR}] hover:bg-[${HOVER_PRIMARY_COLOR}] text-white`}
                            >
                                Suivant
                            </Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="grid gap-6">
                        {/* ✨ NOUVELLE SECTION : Localité avec option personnalisée */}
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="localite">Localité</Label>
                                <button
                                    type="button"
                                    onClick={toggleModeLocalite}
                                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 font-medium"
                                >
                                    {modeLocalite === 'select' ? (
                                        <>
                                            <Plus className="h-4 w-4" />
                                            Nouvelle localité
                                        </>
                                    ) : (
                                        'Choisir dans la liste'
                                    )}
                                </button>
                            </div>

                            {modeLocalite === 'select' ? (
                                // Mode sélection : choisir parmi les localités existantes
                                <select
                                    id="localite_id"
                                    value={form.data.localite_id}
                                    onChange={e => form.setData('localite_id', e.target.value)}
                                    className={`border rounded p-3 block w-full text-gray-900 dark:text-white dark:bg-neutral-800 dark:border-neutral-700 focus:ring-[${PRIMARY_COLOR}] focus:border-[${PRIMARY_COLOR}]`}
                                    required
                                >
                                    <option value="">-- Sélectionnez une localité --</option>
                                    {localites.map(loc => (
                                        <option key={loc.id} value={loc.id}>
                                            {loc.nom}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                // Mode personnalisé : créer une nouvelle localité
                                <div className="space-y-2">
                                    <Input
                                        id="nouvelle_localite"
                                        type="text"
                                        value={form.data.nouvelle_localite}
                                        onChange={e => form.setData('nouvelle_localite', e.target.value)}
                                        placeholder="Entrez le nom de votre localité"
                                        className={inputClasses}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        💡 Ecrivez le nom de votre ville si elle ne fait pas partie des localites a selectionner 
                                    </p>
                                </div>
                            )}
                            
                            <InputError message={form.errors.localite_id || form.errors.nouvelle_localite} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input
                                id="password"
                                type="password"
                                value={form.data.password}
                                onChange={e => form.setData('password', e.target.value)}
                                placeholder="Mot de passe sécurisé"
                                className={inputClasses}
                            />
                            <InputError message={form.errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirmer le mot de passe</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={form.data.password_confirmation}
                                onChange={e => form.setData('password_confirmation', e.target.value)}
                                placeholder="Confirmez le mot de passe"
                                className={inputClasses}
                            />
                            <InputError message={form.errors.password_confirmation} />
                        </div>

                        <div className="flex justify-between mt-4">
                            <Button
                                type="button"
                                onClick={() => setStep(1)}
                                variant="outline"
                                className={`w-auto border-2 border-[${PRIMARY_COLOR}] text-[${PRIMARY_COLOR}] hover:bg-gray-100 dark:hover:bg-neutral-800`}
                            >
                                Précédent
                            </Button>

                            <Button
                                type="submit"
                                disabled={form.processing}
                                className={`w-auto bg-[${PRIMARY_COLOR}] hover:bg-[${HOVER_PRIMARY_COLOR}] text-white`}
                            >
                                {form.processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                Créer le compte
                            </Button>
                        </div>
                    </div>
                )}

                <div className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4">
                    Déjà un compte ?{' '}
                    <TextLink
                        href="/login"
                        className={`text-[${PRIMARY_COLOR}] hover:text-[${HOVER_PRIMARY_COLOR}]`}
                    >
                        Connectez-vous
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
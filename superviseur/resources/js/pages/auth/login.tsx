import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

// NOTE: Remove the AuthenticatedSessionController import - it doesn't exist!

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    // COULEURS DU THÈME AGRI-KEWI (Green: #4CAF50, Deep Blue: #004AAD)
    const PRIMARY_COLOR = '#4CAF50';
    const SECONDARY_COLOR = '#004AAD';
    const HOVER_PRIMARY_COLOR = '#388E3C'; 

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Connexion à votre compte"
            description="Entrez votre email et mot de passe pour vous connecter"
            // Mise à jour du dégradé pour correspondre au thème Green/Deep Blue
            className="bg-gradient-to-br from-[#4CAF50] to-[#004AAD] text-white" 
        >
            <Head title="Connexion" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    {/* Champ email */}
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">
                            Adresse email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            placeholder="exemple@email.com"
                            className="bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-[#4CAF50] focus:border-[#4CAF50]"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Champ mot de passe */}
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">
                                Mot de passe
                            </Label>
                            {canResetPassword && (
                                <TextLink
                                    href={request()}
                                    className="ml-auto text-sm text-[#4CAF50] hover:text-[#388E3C]"
                                    tabIndex={5}
                                >
                                    Mot de passe oublié ?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            placeholder="Mot de passe"
                            className="bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-[#4CAF50] focus:border-[#4CAF50]"
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Checkbox "Se souvenir de moi" */}
                    <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-200">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked as boolean)}
                            tabIndex={3}
                            className="accent-[#4CAF50]"
                        />
                        <Label htmlFor="remember">Se souvenir de moi</Label>
                    </div>

                    {/* Bouton de connexion */}
                    <Button
                        type="submit"
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white"
                        tabIndex={4}
                        disabled={processing}
                        data-test="login-button"
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Connexion
                    </Button>
                </div>

                {/* Lien vers l'inscription */}
                <div className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4">
                    Pas encore de compte ?{' '}
                    <TextLink 
                        href={register()} 
                        tabIndex={5} 
                        className="text-[#4CAF50] hover:text-[#388E3C]"
                    >
                        Inscrivez-vous
                    </TextLink>
                </div>
            </form>

            {/* Message de statut */}
            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-500 dark:text-green-400">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
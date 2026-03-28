import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AuthLayout from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { LoaderCircle } from 'lucide-react';
import { register } from '@/routes';
import { request } from '@/routes/password';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
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
        >
            <Head title="Connexion" />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Adresse email</Label>
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
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Mot de passe</Label>
                            {canResetPassword && (
                                <TextLink
                                    href={request()}
                                    className="ml-auto text-sm"
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
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked as boolean)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Se souvenir de moi</Label>
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 w-full"
                        tabIndex={4}
                        disabled={processing}
                        data-test="login-button"
                    >
                        {processing && (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        )}
                        Connexion
                    </Button>
                </div>

                <div className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4">
                    Pas encore de compte ?{' '}
                    <TextLink href={register()} tabIndex={6}>
                        Inscrivez-vous
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
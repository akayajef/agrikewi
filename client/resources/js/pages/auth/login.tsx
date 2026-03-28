import { Form, Head } from '@inertiajs/react'; 
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { request as passwordRequest } from '@/routes/password';
import { LoaderCircle, LogIn } from 'lucide-react';

interface LoginProps {
  status?: string;
  canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
  const [roleError, setRoleError] = useState('');
  const GABON_GREEN = '#66bb6a'; // vert Gabon

  return (
    <AuthLayout
      title="Connexion client"
      description="Accédez à votre espace personnel et suivez vos commandes facilement."
    >
      <Head title="Connexion client" />

      <div className="w-full max-w-5xl mx-auto px-4">
        <Form
          method="post"
          action="/login"
          onError={(errors: any) => {
            if (errors.email?.includes('client')) setRoleError(errors.email);
          }}
          onFinish={() => setRoleError('')}
          className="flex flex-col gap-6 items-center"
        >
          {roleError && (
            <div className="text-red-600 text-sm font-medium text-center bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-3 py-2 rounded-md w-full max-w-md">
              {roleError}
            </div>
          )}

          <div className="grid gap-4 w-full max-w-md">
            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Adresse e-mail
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                required
                autoFocus
                autoComplete="email"
                placeholder="exemple@email.com"
                className="rounded-lg shadow-sm focus-visible:ring-2 focus-visible:ring-primary/70 w-full"
              />
              <InputError message={roleError} />
            </div>

            {/* Mot de passe */}
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </Label>
                {canResetPassword && (
                  <TextLink
                    href={passwordRequest()}
                    className="ml-auto text-sm font-medium hover:underline"
                    style={{ color: GABON_GREEN }}
                  >
                    Mot de passe oublié ?
                  </TextLink>
                )}
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="rounded-lg shadow-sm focus-visible:ring-2 focus-visible:ring-primary/70 w-full"
              />
              <InputError message={roleError} />
            </div>

            {/* Se souvenir de moi */}
            <div className="flex items-center space-x-3">
              <Checkbox id="remember" name="remember" />
              <Label htmlFor="remember" className="text-sm text-muted-foreground">
                Se souvenir de moi
              </Label>
            </div>

            {/* Bouton connexion */}
            <Button
              type="submit"
              style={{ backgroundColor: GABON_GREEN, color: 'white' }}
              className="mt-4 w-full text-base py-5 font-semibold rounded-lg shadow-md hover:opacity-90 transition-all duration-150 flex items-center justify-center"
              disabled={roleError ? true : false}
            >
              {roleError ? (
                <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <LogIn className="h-5 w-5 mr-2" />
              )}
              Se connecter
            </Button>

            {/* Lien vers inscription */}
            <div className="text-center text-sm text-muted-foreground mt-4">
              Pas encore de compte ?{' '}
              <TextLink
                href={register()}
                className="font-medium hover:underline"
                style={{ color: GABON_GREEN }}
              >
                Inscrivez-vous
              </TextLink>
            </div>

            {/* Message de statut */}
            {status && (
              <div className="mt-4 text-center text-sm font-medium text-green-600 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 px-3 py-2 rounded-md w-full max-w-md">
                {status}
              </div>
            )}
          </div>
        </Form>
      </div>
    </AuthLayout>
  );
}

import { login } from '@/routes';
import { Form, Head, router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
  const GABON_GREEN = '#66bb6a';

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');

  const submit = (e) => {
    e.preventDefault();

    router.post(route('register'), {
      nom,
      prenom,
      telephone,
      email: e.target.email.value,
      password: e.target.password.value,
      password_confirmation: e.target.password_confirmation.value,
    });
  };

  return (
    <AuthLayout
      title="Créer un compte client"
      description="Entrez vos informations ci-dessous pour créer votre compte client"
    >
      <Head title="Inscription" />

      <form onSubmit={submit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 w-full max-w-5xl mx-auto">

          {/* Nom */}
          <div className="grid gap-2">
            <Label htmlFor="nom">Nom</Label>
            <Input
              id="nom"
              type="text"
              required
              autoFocus
              tabIndex={1}
              autoComplete="family-name"
              name="nom"
              placeholder="Votre nom"
              value={nom}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, '');
                setNom(value);
              }}
            />
          </div>

          {/* Prénom */}
          <div className="grid gap-2">
            <Label htmlFor="prenom">Prénom</Label>
            <Input
              id="prenom"
              type="text"
              required
              tabIndex={2}
              autoComplete="given-name"
              name="prenom"
              placeholder="Votre prénom"
              value={prenom}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, '');
                setPrenom(value);
              }}
            />
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input
              id="email"
              type="email"
              required
              tabIndex={3}
              autoComplete="email"
              name="email"
              placeholder="exemple@email.com"
            />
          </div>

          {/* Téléphone */}
          <div className="grid gap-2">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input
              id="telephone"
              type="tel"
              required
              tabIndex={4}
              autoComplete="tel"
              name="telephone"
              placeholder="00 00 00 00"
              value={telephone}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9\s+()-]/g, '');
                setTelephone(value);
              }}
              maxLength={20}
            />
          </div>

          {/* MDP */}
          <div className="grid gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              required
              tabIndex={5}
              autoComplete="new-password"
              name="password"
            />
          </div>

          {/* Confirmation MDP */}
          <div className="grid gap-2">
            <Label htmlFor="password_confirmation">Confirmer le mot de passe</Label>
            <Input
              id="password_confirmation"
              type="password"
              required
              tabIndex={6}
              autoComplete="new-password"
              name="password_confirmation"
            />
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <Button
            type="submit"
            style={{ backgroundColor: GABON_GREEN, color: 'white' }}
            className="px-8 py-3 w-auto hover:opacity-90"
            tabIndex={7}
          >
            Créer le compte
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-4">
          Vous avez déjà un compte ?{' '}
          <TextLink href={login()} tabIndex={8} style={{ color: GABON_GREEN }}>
            Se connecter
          </TextLink>
        </div>
      </form>
    </AuthLayout>
  );
}

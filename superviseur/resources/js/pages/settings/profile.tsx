import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, usePage } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

// Fil d'Ariane
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Paramètres du profil',
        href: '#', // tu peux mettre l'URL de ton profil ici
    },
];

export default function Profile() {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Paramètres du profil" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Informations du profil"
                        description="Mettez à jour votre nom et votre adresse email"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{ preserveScroll: true }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                {/* Nom */}
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nom</Label>
                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Nom complet"
                                    />
                                    <InputError className="mt-2" message={errors.name} />
                                </div>

                                {/* Email */}
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Adresse email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Adresse email"
                                    />
                                    <InputError className="mt-2" message={errors.email} />
                                </div>

                                {/* Bouton sauvegarder */}
                                <div className="flex items-center gap-4">
                                    <Button disabled={processing}>Enregistrer</Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">Enregistré</p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                {/* Composant pour supprimer l'utilisateur */}
                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}

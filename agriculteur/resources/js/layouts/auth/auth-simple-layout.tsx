import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div
            className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
            style={{
                backgroundImage: "url('/img/plante.png')", // 🖼️ Ton image ici
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Overlay sombre pour lisibilité */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Contenu */}
            <div className="relative z-10 w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    {/* LOGO + TITRE */}
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex h-24 w-24 items-center justify-center rounded-full bg-black shadow-lg">
                                <AppLogoIcon className="size-16 text-white" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight text-white drop-shadow-md">
                                {title}
                            </h1>
                            <p className="text-sm text-white/80 max-w-xs mx-auto leading-relaxed">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* FORMULAIRE */}
                    <div className="bg-black/60 p-6 rounded-xl shadow-md w-full text-white backdrop-blur-sm">
                        <div className="space-y-4">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

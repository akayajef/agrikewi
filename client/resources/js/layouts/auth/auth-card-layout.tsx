import AppLogoIcon from '@/components/app-logo-icon';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                {/* Logo cliquable */}
                <Link
                    href={home()}
                    className="flex items-center justify-center gap-2 font-medium"
                >
                    <div className="flex h-20 w-20 items-center justify-center">
                        <AppLogoIcon className="w-16 h-16 object-contain" />
                    </div>
                </Link>

                {/* Carte d'authentification */}
                <div className="flex flex-col gap-6">
                    <Card className="rounded-xl shadow-md">
                        <CardHeader className="px-10 pt-8 pb-0 text-center">
                            <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 py-8">
                            {children}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

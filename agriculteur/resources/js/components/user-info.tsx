import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user?: User | null;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();

    if (!user) {
        return <span className="text-sm text-muted-foreground">Utilisateur non connecté</span>;
    }

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.nom ?? 'Utilisateur'} />
                ) : (
                    <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                        {user.nom ? getInitials(user.nom) : '?'}
                    </AvatarFallback>
                )}
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.nom ?? 'Utilisateur'}</span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email ?? '-'}
                    </span>
                )}
            </div>
        </>
    );
}

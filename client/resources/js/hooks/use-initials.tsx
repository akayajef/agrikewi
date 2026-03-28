import { useCallback } from 'react';

/**
 * Hook pour générer les initiales d'un nom complet.
 * Si nom ou prénom sont absents, il renvoie une valeur par défaut.
 */
export function useInitials() {
    return useCallback((fullName?: string): string => {
        if (!fullName) return '?';

        // Sépare le nom complet par les espaces et filtre les segments vides
        const names = fullName.trim().split(' ').filter(n => n.length > 0);

        if (names.length === 0) return '?';
        if (names.length === 1) return names[0].charAt(0).toUpperCase();

        const firstInitial = names[0].charAt(0);
        const lastInitial = names[names.length - 1].charAt(0);

        return `${firstInitial}${lastInitial}`.toUpperCase();
    }, []);
}

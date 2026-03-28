import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';

import { Routes } from '@custom'; // ✅ Import global unique

import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    Users,
    ClipboardList,
    Package,
    Database,
    FileText,
    Bell,
    MapPin,
    Tag,
    ShoppingCart,
    CreditCard,
    Calculator // ✅ Ajout de l'icône Calculator
} from 'lucide-react';

import AppLogo from './app-logo';

// =====================
// Main Navigation
// =====================
const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    { title: 'Ouvrier', href: Routes.Agriculteur.index().url, icon: Users },
    { title: 'Tâche', href: Routes.Tache.index().url, icon: ClipboardList },
    { title: 'Stock', href: Routes.Stock.index().url, icon: Database },
    { title: 'Plantation', href: Routes.Plantation.index().url, icon: FileText },
    { title: 'Article', href: Routes.Article.index().url, icon: Tag },
    { title: 'Commande & Paiement', href: Routes.Commande.index().url, icon: ShoppingCart },
    { title: 'Calculateurs', href: Routes.Calculateur.index().url, icon: Calculator }, // ✅ Nouvelle entrée
    { title: 'Notification', href: Routes.Notification.index().url, icon: Bell },
    { title: 'Zone', href: Routes.Zone.index().url, icon: MapPin },
];

// =====================
// Footer Navigation
// =====================
const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
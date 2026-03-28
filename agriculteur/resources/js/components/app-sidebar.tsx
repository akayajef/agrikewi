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
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, FileCheck, Archive, Sprout } from 'lucide-react';
import AppLogo from './app-logo';

import { taches, stock, notifications, plantations, conseil } from '@custom'; // Ajout de conseil

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Conseil du Jour',
        href: conseil(),
        icon: Sprout, // Icône de pousse/plante
    },
    {
        title: 'Tâches',
        href: taches(),
        icon: FileCheck,
    },
    {
        title: 'Plantations',
        href: plantations(),
        icon: Folder,
    },
    {
        title: 'Stock',
        href: stock(),
        icon: Archive,
    },
    
    {
        title: 'Notifications',
        href: notifications(),
        icon: BookOpen,
    },
];

const footerNavItems: NavItem[] = [
    
];

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
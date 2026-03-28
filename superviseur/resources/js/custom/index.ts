// /resources/js/custom/index.ts
import { RouteDefinition } from '@custom/wayfinder';

// =====================
// Routes Agriculteur
// =====================
export const AgriculteurRoutes = {
    index: (): RouteDefinition<'get'> => ({ url: '/agriculteur', method: 'get' }),
    create: (): RouteDefinition<'post'> => ({ url: '/agriculteur', method: 'post' }),
    update: (id: number): RouteDefinition<'put'> => ({ url: `/agriculteur/${id}`, method: 'put' }),
    delete: (id: number): RouteDefinition<'delete'> => ({ url: `/agriculteur/${id}`, method: 'delete' }),
};

// =====================
// Routes Tache
// =====================
export const TacheRoutes = {
    index: (): RouteDefinition<'get'> => ({ url: '/tache', method: 'get' }),
    create: (): RouteDefinition<'post'> => ({ url: '/tache', method: 'post' }),
    update: (id: number): RouteDefinition<'put'> => ({ url: `/tache/${id}`, method: 'put' }),
    delete: (id: number): RouteDefinition<'delete'> => ({ url: `/tache/${id}`, method: 'delete' }),
};

// =====================
// Routes Stock
// =====================
export const StockRoutes = {
    index: (): RouteDefinition<'get'> => ({ url: '/stock', method: 'get' }),
    create: (): RouteDefinition<'post'> => ({ url: '/stock', method: 'post' }),
    update: (id: number): RouteDefinition<'put'> => ({ url: `/stock/${id}`, method: 'put' }),
    delete: (id: number): RouteDefinition<'delete'> => ({ url: `/stock/${id}`, method: 'delete' }),
};

// =====================
// Routes Plantation
// =====================
export const PlantationRoutes = {
    index: (): RouteDefinition<'get'> => ({ url: '/plantation', method: 'get' }),
    create: (): RouteDefinition<'post'> => ({ url: '/plantation', method: 'post' }),
    update: (id: number): RouteDefinition<'put'> => ({ url: `/plantation/${id}`, method: 'put' }),
    delete: (id: number): RouteDefinition<'delete'> => ({ url: `/plantation/${id}`, method: 'delete' }),
};

// =====================
// Routes Rapport
// =====================
export const RapportRoutes = {
    index: (): RouteDefinition<'get'> => ({ url: '/rapport', method: 'get' }),
    create: (): RouteDefinition<'post'> => ({ url: '/rapport', method: 'post' }),
    update: (id: number): RouteDefinition<'put'> => ({ url: `/rapport/${id}`, method: 'put' }),
    delete: (id: number): RouteDefinition<'delete'> => ({ url: `/rapport/${id}`, method: 'delete' }),
};

// =====================
// Routes Notification
// =====================
export const NotificationRoutes = {
    index: (): RouteDefinition<'get'> => ({ url: '/notification', method: 'get' }),
    create: (): RouteDefinition<'post'> => ({ url: '/notification', method: 'post' }),
    delete: (id: number): RouteDefinition<'delete'> => ({ url: `/notification/${id}`, method: 'delete' }),
    markAsRead: (id: number): RouteDefinition<'post'> => ({ url: `/notification/mark-as-read/${id}`, method: 'post' }),
};

// =====================
// Routes Article
// =====================
export const ArticleRoutes = {
    index: (): RouteDefinition<'get'> => ({ url: '/article', method: 'get' }),
    create: (): RouteDefinition<'post'> => ({ url: '/article', method: 'post' }),
    update: (id: number): RouteDefinition<'put'> => ({ url: `/article/${id}`, method: 'put' }),
    delete: (id: number): RouteDefinition<'delete'> => ({ url: `/article/${id}`, method: 'delete' }),
};

// =====================
// Routes Zone de Production
// =====================
export const ZoneRoutes = {
    index: (): RouteDefinition<'get'> => ({ url: '/zone', method: 'get' }),
    create: (): RouteDefinition<'post'> => ({ url: '/zone', method: 'post' }),
    update: (id: number): RouteDefinition<'put'> => ({ url: `/zone/${id}`, method: 'put' }),
    delete: (id: number): RouteDefinition<'delete'> => ({ url: `/zone/${id}`, method: 'delete' }),
};

// =====================
// Routes Commande & Paiement
// =====================
export const CommandeRoutes = {
    index: (): RouteDefinition<'get'> => ({ url: '/commandes', method: 'get' }),

    updateStatutCommande: (id: number): RouteDefinition<'put'> => ({
        url: `/commandes/${id}/statut`,
        method: 'put',
    }),

    updateStatutPaiement: (id: number): RouteDefinition<'put'> => ({
        url: `/commandes/paiement/${id}/statut`,
        method: 'put',
    }),
};

export const CalculateurRoutes = {
    index: (): RouteDefinition<'get'> => ({ url: '/calculateurs', method: 'get' }),
    irrigation: (): RouteDefinition<'post'> => ({ url: '/calculateurs/irrigation', method: 'post' }),
    engrais: (): RouteDefinition<'post'> => ({ url: '/calculateurs/engrais', method: 'post' }),
    surface: (): RouteDefinition<'post'> => ({ url: '/calculateurs/surface', method: 'post' }),
    cout: (): RouteDefinition<'post'> => ({ url: '/calculateurs/cout', method: 'post' }),
    delete: (id: number): RouteDefinition<'delete'> => ({ url: `/calculateurs/${id}`, method: 'delete' }),
};

// =====================
// Export global pour simplifier les imports
// =====================
export const Routes = {
    Agriculteur: AgriculteurRoutes,
    Tache: TacheRoutes,
    Stock: StockRoutes,
    Plantation: PlantationRoutes,
    Rapport: RapportRoutes,
    Notification: NotificationRoutes,
    Article: ArticleRoutes,
    Zone: ZoneRoutes,
    Commande: CommandeRoutes,
    Calculateur: CalculateurRoutes,
};

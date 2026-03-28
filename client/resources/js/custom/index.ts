import { queryParams, type RouteQueryOptions, type RouteDefinition } from '../wayfinder';

/* ===============================
   Routes Catalogue
=============================== */

/**
 * @see \App\Http\Controllers\CatalogueController::index
 * @route '/catalogue'
 */
export const catalogue = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: catalogue.url(options),
    method: 'get',
});

catalogue.definition = {
    methods: ['get', 'head'],
    url: '/catalogue',
} satisfies RouteDefinition<['get', 'head']>;

catalogue.url = (options?: RouteQueryOptions) => catalogue.definition.url + queryParams(options);

catalogue.get = (options?: RouteQueryOptions) => ({ url: catalogue.url(options), method: 'get' });
catalogue.head = (options?: RouteQueryOptions) => ({ url: catalogue.url(options), method: 'head' });


/* ===============================
   Routes Commande
=============================== */

/**
 * @see \App\Http\Controllers\CommandeController::index
 * @route '/commande'
 */
export const commande = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: commande.url(options),
    method: 'get',
});

commande.definition = {
    methods: ['get', 'head'],
    url: '/commande',
} satisfies RouteDefinition<['get', 'head']>;

commande.url = (options?: RouteQueryOptions) => commande.definition.url + queryParams(options);

commande.get = (options?: RouteQueryOptions) => ({ url: commande.url(options), method: 'get' });
commande.head = (options?: RouteQueryOptions) => ({ url: commande.url(options), method: 'head' });

/**
 * POST pour créer la commande
 * @see \App\Http\Controllers\CommandeController::store
 */
commande.store = (): RouteDefinition<'post'> => ({
    url: '/commande',
    method: 'post',
});

/**
 * DELETE pour supprimer un article du panier
 * @see \App\Http\Controllers\CommandeController::supprimerDuPanier
 */
commande.supprimerDuPanier = (id: number | string): RouteDefinition<'delete'> => ({
    url: `/panier/${id}`,
    method: 'delete',
});


/* ===============================
   Routes Historique
=============================== */

/**
 * @see \App\Http\Controllers\HistoriqueController::index
 * @route '/historique'
 */
export const historique = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: historique.url(options),
    method: 'get',
});

historique.definition = {
    methods: ['get', 'head'],
    url: '/historique',
} satisfies RouteDefinition<['get', 'head']>;

historique.url = (options?: RouteQueryOptions) => historique.definition.url + queryParams(options);

historique.get = (options?: RouteQueryOptions) => ({ url: historique.url(options), method: 'get' });
historique.head = (options?: RouteQueryOptions) => ({ url: historique.url(options), method: 'head' });

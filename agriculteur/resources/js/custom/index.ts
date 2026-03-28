import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../wayfinder'

/**
 * @see \App\Http\Controllers\TacheController::index
 * @see app/Http/Controllers/TacheController.php
 * @route '/taches'
 */
export const taches = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: taches.url(options),
    method: 'get',
})

taches.definition = {
    methods: ["get","head"],
    url: '/taches',
} satisfies RouteDefinition<["get","head"]>

taches.url = (options?: RouteQueryOptions) => {
    return taches.definition.url + queryParams(options)
}

taches.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: taches.url(options),
    method: 'get',
})

taches.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: taches.url(options),
    method: 'head',
})

const tachesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: taches.url(options),
    method: 'get',
})

taches.form = tachesForm

/**
 * @see \App\Http\Controllers\TacheController::terminer
 * @see app/Http/Controllers/TacheController.php
 * @route '/taches/{tache}/terminer'
 */
export const tacheTerminer = (id: number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: tacheTerminer.url(id, options),
    method: 'patch', // PATCH ici pour correspondre à Laravel
})

tacheTerminer.definition = {
    methods: ["patch"],
    url: '/taches/:tache/terminer',
} satisfies RouteDefinition<["patch"]>

tacheTerminer.url = (id: number, options?: RouteQueryOptions) => {
    return tacheTerminer.definition.url.replace(':tache', String(id)) + queryParams(options)
}

tacheTerminer.patch = (id: number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: tacheTerminer.url(id, options),
    method: 'patch',
})

const tacheTerminerForm = (id: number, options?: RouteQueryOptions): RouteFormDefinition<'patch'> => ({
    action: tacheTerminer.url(id, options),
    method: 'patch',
})

tacheTerminer.form = tacheTerminerForm



/**
 * Liste le stock
 * @see \App\Http\Controllers\StockController::index
 * @route '/stock'
 */
export const stock = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stock.url(options),
    method: 'get',
});

stock.definition = {
    methods: ['get', 'head'],
    url: '/stock',
} satisfies RouteDefinition<['get', 'head']>;

stock.url = (options?: RouteQueryOptions) => stock.definition.url + queryParams(options);

stock.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stock.url(options),
    method: 'get',
});

stock.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stock.url(options),
    method: 'head',
});

const stockForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: stock.url(options),
    method: 'get',
});

stock.form = stockForm;

/**
 * Ajouter un produit intrant au stock (uniquement superviseur)
 * @see \App\Http\Controllers\StockController::ajouter
 * @route '/stock/ajouter'
 */
export const stockAjouter = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stockAjouter.url(options),
    method: 'post',
});

stockAjouter.definition = {
    methods: ['post'],
    url: '/stock/ajouter',
} satisfies RouteDefinition<['post']>;

stockAjouter.url = (options?: RouteQueryOptions) => stockAjouter.definition.url + queryParams(options);

const stockAjouterForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: stockAjouter.url(options),
    method: 'post',
});

stockAjouter.form = stockAjouterForm;

/**
 * Retirer un produit du stock (uniquement agriculteur pour intrants)
 * @see \App\Http\Controllers\StockController::retirer
 * @route '/stock/:id/retirer'
 */
export const stockRetirer = (id: number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stockRetirer.url(id, options),
    method: 'post',
});

stockRetirer.definition = {
    methods: ['post'],
    url: '/stock/:id/retirer',
} satisfies RouteDefinition<['post']>;

stockRetirer.url = (id: number, options?: RouteQueryOptions) =>
    stockRetirer.definition.url.replace(':id', String(id)) + queryParams(options);

const stockRetirerForm = (id: number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: stockRetirer.url(id, options),
    method: 'post',
});

stockRetirer.form = stockRetirerForm;


/**
 * Liste les notifications
 * @see \App\Http\Controllers\NotificationController::index
 * @route '/notifications'
 */
export const notifications = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notifications.url(options),
    method: 'get',
});

notifications.definition = {
    methods: ['get', 'head'],
    url: '/notifications',
} satisfies RouteDefinition<['get', 'head']>;

notifications.url = (options?: RouteQueryOptions) => notifications.definition.url + queryParams(options);

notifications.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notifications.url(options),
    method: 'get',
});

notifications.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: notifications.url(options),
    method: 'head',
});

const notificationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: notifications.url(options),
    method: 'get',
});

notifications.form = notificationsForm;

/**
 * Marquer une notification comme lue
 * @see \App\Http\Controllers\NotificationController::read
 * @route '/notifications/:id/read'
 */
export const notificationRead = (id: number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: notificationRead.url(id, options),
    method: 'post',
});

notificationRead.definition = {
    methods: ['post'],
    url: '/notifications/:id/read',
} satisfies RouteDefinition<['post']>;

notificationRead.url = (id: number, options?: RouteQueryOptions) =>
    notificationRead.definition.url.replace(':id', String(id)) + queryParams(options);

const notificationReadForm = (id: number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: notificationRead.url(id, options),
    method: 'post',
});

notificationRead.form = notificationReadForm;



/**
 * Liste des plantations pour l'agriculteur
 * @see \App\Http\Controllers\PlantationController::index
 * @route '/plantations'
 */
export const plantations = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: plantations.url(options),
    method: 'get',
});

plantations.definition = {
    methods: ['get', 'head'],
    url: '/plantations', // <-- CORRECTION : Suppression du préfixe /stock
} satisfies RouteDefinition<['get', 'head']>


plantations.url = (options?: RouteQueryOptions) => plantations.definition.url + queryParams(options);

plantations.get = (options?: RouteQueryOptions) => ({
    url: plantations.url(options),
    method: 'get',
});

plantations.head = (options?: RouteQueryOptions) => ({
    url: plantations.url(options),
    method: 'head',
});

const plantationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: plantations.url(options),
    method: 'get',
});

plantations.form = plantationsForm;


/**
 * Détail d'une plantation spécifique
 * @see \App\Http\Controllers\PlantationController::show
 * @route '/plantations/{id}'
 */
export const plantationShow = (id: number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: plantationShow.url(id, options),
    method: 'get',
});

plantationShow.definition = {
    methods: ['get', 'head'],
    url: '/plantations/:id', // <-- CORRECTION : Suppression du préfixe /stock
} satisfies RouteDefinition<['get', 'head']>;

plantationShow.url = (id: number, options?: RouteQueryOptions) =>
    plantationShow.definition.url.replace(':id', String(id)) + queryParams(options);

plantationShow.get = (id: number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: plantationShow.url(id, options),
    method: 'get',
});

plantationShow.head = (id: number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: plantationShow.url(id, options),
    method: 'head',
});

const plantationShowForm = (id: number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: plantationShow.url(id, options),
    method: 'get',
});

plantationShow.form = plantationShowForm;





/**
 * Page du conseil agricole quotidien
 * @route '/conseil'
 */
export const conseil = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conseil.url(options),
    method: 'get',
});

conseil.definition = {
    methods: ['get', 'head'],
    url: '/conseil',
} satisfies RouteDefinition<['get', 'head']>;

conseil.url = (options?: RouteQueryOptions) => conseil.definition.url + queryParams(options);

conseil.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conseil.url(options),
    method: 'get',
});

conseil.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: conseil.url(options),
    method: 'head',
});

const conseilForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: conseil.url(options),
    method: 'get',
});

conseil.form = conseilForm;
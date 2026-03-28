import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import AppLayout from '@/layouts/app-layout';

interface Notification {
    id: number;
    message: string;
    created_at: string;
    sender: {
        id: number;
        nom: string;
        prenom: string;
    } | null;
}

const NotificationsAgriculteur: React.FC = () => {
    const { notifications: notifProps } = usePage<{ notifications: Notification[] }>().props;

    // Filtrer les notifications non lues
    const unreadNotifications = notifProps.filter(n => !('read_at' in n) || n.read_at === null);

    const [notifications, setNotifications] = useState<Notification[]>(unreadNotifications);
    const [loadingIds, setLoadingIds] = useState<number[]>([]);
    const [notificationError, setNotificationError] = useState<string | null>(null);

    const markAsRead = (id: number) => {
        setNotificationError(null);
        setLoadingIds(prev => [...prev, id]);

        router.post(`/notifications/${id}/read`, {}, {
            onSuccess: () => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            },
            onError: () => {
                setNotificationError("Impossible de marquer la notification comme lue. Veuillez réessayer.");
            },
            onFinish: () => {
                setLoadingIds(prev => prev.filter(i => i !== id));
            }
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: "Notifications", href: "/notifications" }] as any}>
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b border-green-300 dark:border-green-600 pb-2">
                    Vos Notifications ({notifications.length})
                </h1>

                {notificationError && (
                    <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-100 dark:bg-red-900/50 dark:text-red-400" role="alert">
                        <span className="font-medium">Erreur:</span> {notificationError}
                    </div>
                )}

                {notifications.length === 0 ? (
                    <div className="p-10 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                            Vous êtes à jour ! Aucune nouvelle notification non lue pour le moment.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((n) => (
                            <li
                                key={n.id}
                                className="list-none p-5 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center transition duration-300 border
                                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-green-400 dark:border-green-500 shadow-lg hover:shadow-xl"
                            >
                                <div className="flex-1 min-w-0 pr-4 space-y-1">
                                    <p className="font-semibold text-green-700 dark:text-green-300">
                                        NOUVEAU MESSAGE
                                    </p>
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        {n.message}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                                        De :{" "}
                                        <span className="font-medium">
                                            {n.sender?.nom ?? "Expéditeur inconnu"} {n.sender?.prenom ?? ""}
                                        </span>{" "}
                                        |{" "}
                                        <span className="italic">
                                            {new Intl.DateTimeFormat("fr-FR", {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }).format(new Date(n.created_at))}
                                        </span>
                                    </p>
                                </div>

                                <button
                                    onClick={() => markAsRead(n.id)}
                                    disabled={loadingIds.includes(n.id)}
                                    className="mt-3 md:mt-0 px-4 py-2 text-sm font-semibold rounded-lg shadow-md transition
                                               bg-green-600 text-white hover:bg-green-700
                                               disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    {loadingIds.includes(n.id) ? "Traitement..." : "Marquer comme lue"}
                                </button>
                            </li>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default NotificationsAgriculteur;

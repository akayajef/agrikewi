<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Notification;

class NotificationController extends Controller
{
    /**
     * Affiche les notifications non lues pour l'agriculteur connecté
     */
    public function index()
    {
        $user = Auth::user();

        // Vérifie que l'utilisateur est bien un agriculteur
        if (!$user->ouvrier || $user->ouvrier->type !== 'agriculteur') {
            abort(403, "Accès réservé aux agriculteurs.");
        }

        // Récupère uniquement les notifications non lues
        $notifications = Notification::where(function ($query) use ($user) {
            $query->where('type', 'groupe')
                ->orWhere(function ($q) use ($user) {
                    $q->where('type', 'cible')
                        ->where('user_id', $user->id);
                });
        })
            ->whereNull('read_at') // notifications non lues
            ->orderByDesc('created_at')
            ->get();

        // Rend la page avec les notifications via Inertia
        return Inertia::render('notification', [
            'notifications' => $notifications
        ]);
    }

    /**
     * Marquer une notification comme lue
     */
    public function markAsRead($id)
    {
        $user = Auth::user();

        if (!$user->ouvrier || $user->ouvrier->type !== 'agriculteur') {
            abort(403, "Accès réservé aux agriculteurs.");
        }

        $notification = Notification::where('type', 'cible')
            ->where('user_id', $user->id)
            ->findOrFail($id);

        $notification->read_at = now();
        $notification->save();

        // On peut rediriger vers la page des notifications
        return redirect()->route('notifications.index');
    }
}

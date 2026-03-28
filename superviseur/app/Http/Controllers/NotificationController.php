<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Builder;

class NotificationController extends Controller
{
    private const ROLE_ADMIN = 'admin';
    private const ROLE_CLIENT = 'client';
    private const TYPE_SUPERVISEUR = 'superviseur';
    private const TYPE_AGRICULTEUR = 'agriculteur';
    private const NOTIF_CIBLE = 'cible';
    private const NOTIF_GROUPE = 'groupe';

    public function index()
    {
        $userId = Auth::id();

        $notifications = Notification::with(['sender:id,prenom,nom,email'])
            ->where('user_id', $userId)
            ->select('id', 'user_id', 'sender_id', 'title', 'message', 'type', 'read_at', 'created_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($n) => [
                'id' => $n->id,
                'title' => $n->title,
                'message' => $n->message,
                'type' => $n->type,
                'read_at' => $n->read_at,
                'created_at' => $n->created_at->format('d/m/Y H:i'),
                'sender' => [
                    'nom_complet' => optional($n->sender)->prenom . ' ' . optional($n->sender)->nom,
                    'prenom' => optional($n->sender)->prenom,
                    'nom' => optional($n->sender)->nom,
                    'email' => optional($n->sender)->email,
                ],
            ]);

        $user = Auth::user();
        $canSend = $this->hasSendingPermission($user);

        $agriculteurs = $canSend
            ? $this->getUsersByOuvrierType(self::TYPE_AGRICULTEUR, 'Agriculteur')
            : collect([]);

        $clients = $canSend
            ? $this->getUsersByRole(self::ROLE_CLIENT, 'Client')
            : collect([]);

        return Inertia::render('notification', [
            'notifications' => $notifications,
            'agriculteurs' => $agriculteurs,
            'clients' => $clients,
            'canSend' => $canSend,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'message' => 'required|string',
            'user_id' => 'nullable|integer|exists:users,id',
            'type' => 'required|in:' . self::NOTIF_CIBLE . ',' . self::NOTIF_GROUPE,
            'cible' => 'required|in:' . self::TYPE_AGRICULTEUR . ',' . self::ROLE_CLIENT,
            'title' => 'nullable|string|max:150',
        ]);

        $sender = Auth::user();

        if (!$this->hasSendingPermission($sender)) {
            return back()->with('flash', [
                'message' => '❌ Vous n\'avez pas le droit d\'envoyer des notifications.',
                'type' => 'error',
            ]);
        }

        // ✅ SUPPRIMÉ : La restriction qui empêchait les superviseurs d'envoyer aux clients
        // Les superviseurs peuvent maintenant envoyer des notifications aux agriculteurs ET aux clients

        if ($data['type'] === self::NOTIF_CIBLE) {
            $result = $this->handleTargetedNotification($sender->id, $data);
            if ($result !== true) {
                return back()->with('flash', $result);
            }
        } elseif ($data['type'] === self::NOTIF_GROUPE) {
            $this->sendGroupNotificationChunked($sender->id, $data);
        }

        return back()->with('flash', [
            'message' => '✅ Notification envoyée avec succès !',
            'type' => 'success',
        ]);
    }

    public function markAsRead($id)
    {
        try {
            $notification = Notification::where('id', $id)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $notification->delete();

            return redirect()->back()->with('flash', [
                'message' => '✅ Notification lue et supprimée.',
                'type' => 'success',
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->with('flash', [
                'message' => '❌ Notification introuvable ou vous n\'avez pas la permission de la supprimer.',
                'type' => 'error',
            ]);
        } catch (QueryException $e) {
            Log::error("Erreur marquage notification ID {$id} : {$e->getMessage()}");
            return back()->with('flash', [
                'message' => '❌ Impossible de marquer cette notification.',
                'type' => 'error',
            ]);
        }
    }

    private function handleTargetedNotification(int $senderId, array $data)
    {
        if (empty($data['user_id'])) {
            return [
                'message' => '❌ Veuillez sélectionner un utilisateur ciblé.',
                'type' => 'error',
            ];
        }

        $targetUser = User::findOrFail((int) $data['user_id']);
        $targetRole = $targetUser->role;
        $targetOuvrierType = optional($targetUser->ouvrier)->type;

        if ($data['cible'] === self::TYPE_AGRICULTEUR && $targetOuvrierType !== self::TYPE_AGRICULTEUR) {
            return [
                'message' => '❌ L\'utilisateur ciblé n\'est pas un Agriculteur.',
                'type' => 'error',
            ];
        }

        if ($data['cible'] === self::ROLE_CLIENT && $targetRole !== self::ROLE_CLIENT) {
            return [
                'message' => '❌ L\'utilisateur ciblé n\'est pas un Client.',
                'type' => 'error',
            ];
        }

        Notification::create([
            'sender_id' => $senderId,
            'user_id' => (int) $data['user_id'],
            'message' => $data['message'],
            'type' => $data['type'],
            'title' => $data['title'] ?? null,
        ]);

        return true;
    }

    private function sendGroupNotificationChunked(int $senderId, array $data)
    {
        $query = User::query()->where('id', '!=', $senderId);

        if ($data['cible'] === self::TYPE_AGRICULTEUR) {
            $query->whereHas('ouvrier', fn(Builder $q) => $q->where('type', self::TYPE_AGRICULTEUR));
        } elseif ($data['cible'] === self::ROLE_CLIENT) {
            $query->where('role', self::ROLE_CLIENT);
        }

        $query->chunk(500, function ($usersChunk) use ($senderId, $data) {
            $now = now();
            $notificationsToCreate = $usersChunk->map(fn($u) => [
                'sender_id' => $senderId,
                'user_id' => $u->id,
                'message' => $data['message'],
                'type' => self::NOTIF_GROUPE,
                'title' => $data['title'] ?? null,
                'created_at' => $now,
                'updated_at' => $now,
            ])->toArray();

            try {
                Notification::insert($notificationsToCreate);
            } catch (QueryException $e) {
                Log::error('Erreur insertion notifications groupe : ' . $e->getMessage());
                if (config('app.debug')) {
                    throw $e;
                }
            }
        });
    }

    private function hasSendingPermission(User $user): bool
    {
        return $user->role === self::ROLE_ADMIN || optional($user->ouvrier)->type === self::TYPE_SUPERVISEUR;
    }

    private function getUsersByOuvrierType(string $ouvrierType, string $roleLabel)
    {
        return User::whereHas('ouvrier', fn(Builder $q) => $q->where('type', $ouvrierType))
            ->select('id', 'prenom', 'nom')
            ->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'nom_complet' => $u->prenom . ' ' . $u->nom,
                'role' => $roleLabel,
            ]);
    }

    private function getUsersByRole(string $role, string $roleLabel)
    {
        return User::where('role', $role)
            ->select('id', 'prenom', 'nom')
            ->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'nom_complet' => $u->prenom . ' ' . $u->nom,
                'role' => $roleLabel,
            ]);
    }
}

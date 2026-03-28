<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AgriculteurCreated extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $password;
    public $loginUrl;
    public $superviseur;

    public function __construct(User $user, string $password, User $superviseur)
    {
        $this->user = $user;
        $this->password = $password;
        $this->superviseur = $superviseur;
        $this->loginUrl = config('app.agriculteur_url', 'http://localhost:8002') . '/login';
    }

    public function build()
    {
        // L'email est envoyé depuis le compte global mais avec le nom du superviseur
        // et avec l'adresse du superviseur en reply-to
        return $this
            ->from(config('mail.from.address'),  $this->superviseur->nom . ' ' . $this->superviseur->prenom . ' (via AgriKewi)')
            ->replyTo($this->superviseur->email, $this->superviseur->nom . ' ' . $this->superviseur->prenom)
            ->subject('Bienvenue sur AgriKewi - Vos identifiants de connexion')
            ->view('emails.agriculteur-created');
    }
}

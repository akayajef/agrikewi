<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .header {
            background: linear-gradient(135deg, #43A047, #66BB6A);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 28px;
        }

        .content {
            padding: 30px;
        }

        .credentials {
            background: #E8F5E9;
            border-left: 4px solid #43A047;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }

        .credentials p {
            margin: 10px 0;
            font-size: 16px;
        }

        .credentials strong {
            color: #43A047;
        }

        .button {
            display: inline-block;
            background: #43A047;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }

        .button:hover {
            background: #388E3C;
        }

        .footer {
            background: #f9f9f9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
        }

        .warning {
            background: #FFF3CD;
            border-left: 4px solid #FFA000;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }

        .superviseur-info {
            background: #E3F2FD;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header" style="background: linear-gradient(135deg, #43A047, #66BB6A); color: white; padding: 30px; text-align: center;">
            <!-- Cercle noir avec le logo -->
            <div style="width: 100px; height: 100px; border-radius: 50%; background-color: #000; margin: 0 auto 15px; line-height: 100px;">
                <img src="https://i.imgur.com/DDxTs42.png"
                    alt="Logo AgriKewi"
                    style="width: 100px; height: 100px; border-radius: 50%; display: block; margin: 0 auto;">
            </div>

            <!-- Titre -->
            <h1 style="margin: 0; font-size: 28px;">Bienvenue sur AgriKewi</h1>
        </div>

        <div class="content">
            <p>Bonjour <strong>{{ $user->nom }} {{ $user->prenom }}</strong>,</p>

            <p>Votre compte agriculteur a été créé avec succès sur la plateforme AgriKewi par votre superviseur <strong>{{ $superviseur->prenom }} {{ $superviseur->nom }}</strong>.</p>

            <div class="credentials">
                <p><strong>📧 Email :</strong> {{ $user->email }}</p>
                <p><strong>🔑 Mot de passe :</strong> {{ $password }}</p>
            </div>

            <div class="warning">
                <p><strong>⚠️ Important :</strong> Pour votre sécurité, nous vous recommandons de changer votre mot de passe lors de votre première connexion.</p>
            </div>

            <p style="text-align: center;">
                <a href="{{ $loginUrl }}" class="button">
                    Se connecter à AgriKewi
                </a>
            </p>

            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
                {{ $loginUrl }}
            </p>

            <div class="superviseur-info">
                <p><strong>👤 Votre superviseur :</strong></p>
                <p>{{ $superviseur->nom }} {{ $superviseur->prenom }}</p>
                <p>📧 {{ $superviseur->email }}</p>
                @if($superviseur->telephone)
                <p>📱 {{ $superviseur->telephone }}</p>
                @endif
            </div>

            <p>Si vous avez des questions, vous pouvez contacter directement votre superviseur en répondant à cet email.</p>

            <p>Cordialement,<br><strong> {{ $superviseur->nom }} {{ $superviseur->prenom }}</strong><br>Superviseur AgriKewi</p>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} AgriKewi. Tous droits réservés.</p>
            <p>Cet email a été envoyé par {{ $superviseur->email }}</p>
        </div>
    </div>
</body>

</html>
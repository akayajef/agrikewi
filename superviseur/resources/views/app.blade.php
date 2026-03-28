<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark'=> ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{-- Inline script to detect system dark mode preference and apply it immediately --}}
    <script>
        (function() {
            const appearance = '{{ $appearance ?? "system" }}';

            if (appearance === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }
            }
        })();
    </script>

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }
    </style>

    <title inertia>{{ config('app.name', 'AgriKewi') }}</title>

    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

    @php
    // ============================================
    // DÉTECTION AUTOMATIQUE DE L'IP DYNAMIQUE
    // Cette logique est conservée pour les autres besoins (ex: construction de l'URL Laravel).
    // Elle n'est plus utilisée pour l'inclusion des assets Vite (voir @vite plus bas).
    // ============================================
    $host = request()->getHost();
    $isLocalhost = in_array($host, ['localhost', '127.0.0.1']) || str_starts_with($host, '127.');

    // Port Vite depuis .env
    $vitePort = env('VITE_PORT', '5173');

    if ($isLocalhost) {
    // Accès depuis localhost (PC) → utilise localhost
    $viteUrl = "http://localhost:{$vitePort}";
    } else {
    // Accès depuis IP externe (mobile) → utilise l'IP du serveur
    $serverIp = $_SERVER['SERVER_ADDR'] ?? env('VITE_HOST', 'localhost');
    $viteUrl = "http://{$serverIp}:{$vitePort}";
    }
    @endphp

    {{-- Initialisation React Refresh AVANT le chargement Vite --}}
    <script>
        window.$RefreshReg$ = () => {};
        window.$RefreshSig$ = () => (type) => type;
        window.__vite_plugin_react_preamble_installed__ = true;
    </script>

    {{-- CORRIGÉ : Utiliser la directive @vite unique. Laravel gère la détection DEV/PROD/IP. --}}
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])

    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>
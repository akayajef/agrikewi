<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>" class="<?php echo \Illuminate\Support\Arr::toCssClasses(['dark'=> ($appearance ?? 'system') == 'dark']); ?>">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">

    
    <script>
        (function() {
            const appearance = '<?php echo e($appearance ?? "system"); ?>';

            if (appearance === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }
            }
        })();
    </script>

    
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }
    </style>

    <title inertia><?php echo e(config('app.name', 'AgriKewi')); ?></title>

    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

    <?php
    // ============================================
    // DÉTECTION AUTOMATIQUE DE L'IP DYNAMIQUE
    // Cette logique est conservée pour les autres besoins (ex: construction de l'URL Laravel).
    // Elle n'est plus utilisée pour l'inclusion des assets Vite (voir @vite plus bas).
    // ============================================
    $host = request()->getHost();
    $isLocalhost = in_array($host, ['localhost', '127.0.0.1']) || str_starts_with($host, '127.');

    // Port Vite depuis .env
    $vitePort = env('VITE_PORT', '5174');

    if ($isLocalhost) {
    // Accès depuis localhost (PC) → utilise localhost
    $viteUrl = "http://localhost:{$vitePort}";
    } else {
    // Accès depuis IP externe (mobile) → utilise l'IP du serveur
    $serverIp = $_SERVER['SERVER_ADDR'] ?? env('VITE_HOST', 'localhost');
    $viteUrl = "http://{$serverIp}:{$vitePort}";
    }
    ?>

    
    <script>
        window.$RefreshReg$ = () => {};
        window.$RefreshSig$ = () => (type) => type;
        window.__vite_plugin_react_preamble_installed__ = true;
    </script>

    
    <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/app.tsx']); ?>

    <?php if (!isset($__inertiaSsrDispatched)) { $__inertiaSsrDispatched = true; $__inertiaSsrResponse = app(\Inertia\Ssr\Gateway::class)->dispatch($page); }  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->head; } ?>
</head>

<body class="font-sans antialiased">
    <?php if (!isset($__inertiaSsrDispatched)) { $__inertiaSsrDispatched = true; $__inertiaSsrResponse = app(\Inertia\Ssr\Gateway::class)->dispatch($page); }  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->body; } else { ?><div id="app" data-page="<?php echo e(json_encode($page)); ?>"></div><?php } ?>
</body>

</html><?php /**PATH C:\wamp64\www\projet1\agriculteur\resources\views/app.blade.php ENDPATH**/ ?>
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        if (app()->environment('local')) {
            $this->configureViteForMobileAccess();
        }
    }

    private function configureViteForMobileAccess(): void
    {
        $request = request();
        $serverIp = $_SERVER['SERVER_ADDR'] ?? '127.0.0.1';
        $vitePort = 5174;

        // DÃ©tection automatique: localhost OU IP
        $isLocalhost = in_array($request->ip(), ['127.0.0.1', '::1']) 
            ||
$request->getHost() === 'localhost' 
            ||
str_starts_with($request->getHost(), '127.');

        $viteUrl = $isLocalhost 
            ?
"http://localhost:{$vitePort}"
            : "http://{$serverIp}:{$vitePort}";

        // Partager avec toutes les vues
        View::share('viteDevServerUrl', $viteUrl);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class CalculateurController extends Controller
{
    /**
     * Affiche la page des calculateurs
     */
    public function index()
    {
        return Inertia::render('calculateurs');
    }

    /**
     * Calcul d'irrigation
     */
    public function calculerIrrigation(Request $request)
    {
        $validated = $request->validate([
            'surface' => 'required|numeric|min:0',
            'type_culture' => 'required|in:legumes,cereales,tubercules,fruits',
            'type_irrigation' => 'required|in:goutte,aspersion,gravitaire',
        ]);

        $besoinsEau = [
            'legumes' => 5,
            'cereales' => 3.5,
            'tubercules' => 4,
            'fruits' => 6,
        ];

        $efficacite = [
            'goutte' => 0.9,
            'aspersion' => 0.75,
            'gravitaire' => 0.6,
        ];

        $surf = $validated['surface'];
        $besoinBase = $besoinsEau[$validated['type_culture']];
        $eff = $efficacite[$validated['type_irrigation']];

        $besoinJournalier = ($surf * $besoinBase) / $eff;
        $besoinHebdo = $besoinJournalier * 7;
        $besoinMensuel = $besoinJournalier * 30;

        $resultats = [
            'besoin_journalier' => round($besoinJournalier, 2),
            'besoin_hebdomadaire' => round($besoinHebdo, 2),
            'besoin_mensuel' => round($besoinMensuel, 2),
            'efficacite' => $eff * 100,
        ];

        return back()->with([
            'resultats' => $resultats,
            'type' => 'irrigation',
        ]);
    }

    /**
     * Calcul d'engrais
     */
    public function calculerEngrais(Request $request)
    {
        $validated = $request->validate([
            'surface' => 'required|numeric|min:0',
            'type_culture' => 'required|in:cereales,legumes,tubercules,fruits',
            'type_engrais' => 'required|in:npk,uree,fumier',
        ]);

        $dosages = [
            'cereales' => ['npk' => 200, 'uree' => 150, 'fumier' => 5000],
            'legumes' => ['npk' => 250, 'uree' => 100, 'fumier' => 7000],
            'tubercules' => ['npk' => 300, 'uree' => 120, 'fumier' => 8000],
            'fruits' => ['npk' => 150, 'uree' => 80, 'fumier' => 6000],
        ];

        $surf = $validated['surface'];
        $dosage = $dosages[$validated['type_culture']][$validated['type_engrais']];
        $quantiteTotale = ($dosage * $surf) / 1000;
        $nombreSacs = ceil($quantiteTotale / 50);
        $coutEstime = $nombreSacs * ($validated['type_engrais'] === 'fumier' ? 2000 : 15000);

        $resultats = [
            'quantite_totale' => round($quantiteTotale, 2),
            'nombre_sacs' => $nombreSacs,
            'cout_estime' => $coutEstime,
            'unite' => $validated['type_engrais'] === 'fumier' ? 'tonnes' : 'kg',
        ];

        return back()->with([
            'resultats' => $resultats,
            'type' => 'engrais',
        ]);
    }

    /**
     * Calcul de surface
     */
    public function calculerSurface(Request $request)
    {
        $validated = $request->validate([
            'forme' => 'required|in:rectangle,carre,cercle',
            'longueur' => 'nullable|numeric|min:0',
            'largeur' => 'nullable|numeric|min:0',
            'rayon' => 'nullable|numeric|min:0',
        ]);

        $surf = 0;
        $perimetre = 0;

        switch ($validated['forme']) {
            case 'rectangle':
                $l = $validated['longueur'];
                $w = $validated['largeur'];
                $surf = $l * $w;
                $perimetre = 2 * ($l + $w);
                break;
            case 'carre':
                $c = $validated['longueur'];
                $surf = $c * $c;
                $perimetre = 4 * $c;
                break;
            case 'cercle':
                $r = $validated['rayon'];
                $surf = pi() * $r * $r;
                $perimetre = 2 * pi() * $r;
                break;
        }

        $hectares = $surf / 10000;
        $acres = $surf / 4047;

        $resultats = [
            'surface_m2' => round($surf, 2),
            'surface_hectares' => round($hectares, 4),
            'surface_acres' => round($acres, 4),
            'perimetre' => round($perimetre, 2),
        ];

        return back()->with([
            'resultats' => $resultats,
            'type' => 'surface',
        ]);
    }

    /**
     * Calcul de coût
     */
    public function calculerCout(Request $request)
    {
        $validated = $request->validate([
            'surface' => 'required|numeric|min:0',
            'semences' => 'nullable|numeric|min:0',
            'engrais' => 'nullable|numeric|min:0',
            'main_oeuvre' => 'nullable|numeric|min:0',
            'irrigation' => 'nullable|numeric|min:0',
            'autres' => 'nullable|numeric|min:0',
        ]);

        $surf = $validated['surface'];
        $sem = $validated['semences'] ?? 0;
        $eng = $validated['engrais'] ?? 0;
        $main = $validated['main_oeuvre'] ?? 0;
        $irr = $validated['irrigation'] ?? 0;
        $aut = $validated['autres'] ?? 0;

        $total = $sem + $eng + $main + $irr + $aut;
        $coutParM2 = $surf > 0 ? $total / $surf : 0;
        $coutParHa = $coutParM2 * 10000;

        // Calcul des pourcentages
        $repartition = [
            'semences' => $total > 0 ? round(($sem / $total) * 100, 1) : 0,
            'engrais' => $total > 0 ? round(($eng / $total) * 100, 1) : 0,
            'main_oeuvre' => $total > 0 ? round(($main / $total) * 100, 1) : 0,
            'irrigation' => $total > 0 ? round(($irr / $total) * 100, 1) : 0,
            'autres' => $total > 0 ? round(($aut / $total) * 100, 1) : 0,
        ];

        $resultats = [
            'cout_total' => $total,
            'cout_par_m2' => round($coutParM2, 2),
            'cout_par_hectare' => round($coutParHa, 2),
            'repartition' => $repartition,
        ];

        return back()->with([
            'resultats' => $resultats,
            'type' => 'cout',
        ]);
    }
}
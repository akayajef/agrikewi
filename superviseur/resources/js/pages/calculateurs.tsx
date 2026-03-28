import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Calculator, Droplets, Sprout, Ruler, DollarSign, Settings } from 'lucide-react';

const PRIMARY_COLOR = '#43A047';
const HEADER_BG_COLOR = '#388E3C';

export default function Calculateurs() {
    const [activeCalculator, setActiveCalculator] = useState('irrigation');
    const [results, setResults] = useState<any>(null);
    const [showPriceSettings, setShowPriceSettings] = useState(false);

    // États pour Irrigation
    const [irrigationData, setIrrigationData] = useState({
        surface: '',
        type_culture: 'legumes',
        type_irrigation: 'goutte',
    });

    // États pour Engrais
    const [engraisData, setEngraisData] = useState({
        surface: '',
        type_culture: 'cereales',
        type_engrais: 'npk',
    });

    // Prix des engrais modifiables
    const [prixEngrais, setPrixEngrais] = useState({
        npk: 15000,
        uree: 18000,
        fumier: 2500,
    });

    // États pour Surface
    const [surfaceData, setSurfaceData] = useState({
        forme: 'rectangle',
        longueur: '',
        largeur: '',
        rayon: '',
    });

    // États pour Coût
    const [coutData, setCoutData] = useState({
        surface: '',
        semences: '',
        engrais: '',
        main_oeuvre: '',
        irrigation: '',
        autres: '',
    });

    const calculators = [
        { id: 'irrigation', name: 'Irrigation', icon: Droplets },
        { id: 'engrais', name: 'Engrais', icon: Sprout },
        { id: 'surface', name: 'Surface', icon: Ruler },
        { id: 'cout', name: 'Coût', icon: DollarSign },
    ];

    // Calcul Irrigation
    const handleIrrigationSubmit = () => {
        const besoinsEau: { [key: string]: number } = {
            legumes: 5,
            cereales: 3.5,
            tubercules: 4,
            fruits: 6,
        };

        const efficacite: { [key: string]: number } = {
            goutte: 0.9,
            aspersion: 0.75,
            gravitaire: 0.6,
        };

        const surf = parseFloat(irrigationData.surface);
        const besoinBase = besoinsEau[irrigationData.type_culture];
        const eff = efficacite[irrigationData.type_irrigation];

        const besoinJournalier = (surf * besoinBase) / eff;
        const besoinHebdo = besoinJournalier * 7;
        const besoinMensuel = besoinJournalier * 30;

        setResults({
            type: 'irrigation',
            data: {
                besoin_journalier: besoinJournalier.toFixed(2),
                besoin_hebdomadaire: besoinHebdo.toFixed(2),
                besoin_mensuel: besoinMensuel.toFixed(2),
                efficacite: (eff * 100).toFixed(0),
            },
        });
    };

    // Calcul Engrais avec prix modifiables
    const handleEngraisSubmit = () => {
        const dosages: { [key: string]: { [key: string]: number } } = {
            cereales: { npk: 200, uree: 150, fumier: 5000 },
            legumes: { npk: 250, uree: 100, fumier: 7000 },
            tubercules: { npk: 300, uree: 120, fumier: 8000 },
            fruits: { npk: 150, uree: 80, fumier: 6000 },
        };

        const surf = parseFloat(engraisData.surface);
        const dosage = dosages[engraisData.type_culture][engraisData.type_engrais];
        const quantiteTotale = (dosage * surf) / 1000;
        const nombreSacs = Math.ceil(quantiteTotale / 50);
        
        // Utiliser le prix personnalisé
        const prixParSac = prixEngrais[engraisData.type_engrais as keyof typeof prixEngrais];
        const coutEstime = nombreSacs * prixParSac;

        setResults({
            type: 'engrais',
            data: {
                quantite_totale: quantiteTotale.toFixed(2),
                nombre_sacs: nombreSacs,
                cout_estime: coutEstime,
                prix_unitaire: prixParSac,
                unite: engraisData.type_engrais === 'fumier' ? 'tonnes' : 'kg',
            },
        });
    };

    // Calcul Surface
    const handleSurfaceSubmit = () => {
        let surf = 0;
        let perimetre = 0;

        if (surfaceData.forme === 'rectangle') {
            const l = parseFloat(surfaceData.longueur);
            const w = parseFloat(surfaceData.largeur);
            surf = l * w;
            perimetre = 2 * (l + w);
        } else if (surfaceData.forme === 'carre') {
            const c = parseFloat(surfaceData.longueur);
            surf = c * c;
            perimetre = 4 * c;
        } else if (surfaceData.forme === 'cercle') {
            const r = parseFloat(surfaceData.rayon);
            surf = Math.PI * r * r;
            perimetre = 2 * Math.PI * r;
        }

        const hectares = surf / 10000;
        const acres = surf / 4047;

        setResults({
            type: 'surface',
            data: {
                surface_m2: surf.toFixed(2),
                surface_hectares: hectares.toFixed(4),
                surface_acres: acres.toFixed(4),
                perimetre: perimetre.toFixed(2),
            },
        });
    };

    // Calcul Coût
    const handleCoutSubmit = () => {
        const surf = parseFloat(coutData.surface) || 0;
        const sem = parseFloat(coutData.semences) || 0;
        const eng = parseFloat(coutData.engrais) || 0;
        const main = parseFloat(coutData.main_oeuvre) || 0;
        const irr = parseFloat(coutData.irrigation) || 0;
        const aut = parseFloat(coutData.autres) || 0;

        const total = sem + eng + main + irr + aut;
        const coutParM2 = surf > 0 ? total / surf : 0;
        const coutParHa = coutParM2 * 10000;

        const repartition = {
            semences: total > 0 ? parseFloat(((sem / total) * 100).toFixed(1)) : 0,
            engrais: total > 0 ? parseFloat(((eng / total) * 100).toFixed(1)) : 0,
            main_oeuvre: total > 0 ? parseFloat(((main / total) * 100).toFixed(1)) : 0,
            irrigation: total > 0 ? parseFloat(((irr / total) * 100).toFixed(1)) : 0,
            autres: total > 0 ? parseFloat(((aut / total) * 100).toFixed(1)) : 0,
        };

        setResults({
            type: 'cout',
            data: {
                cout_total: total,
                cout_par_m2: coutParM2.toFixed(2),
                cout_par_hectare: coutParHa.toFixed(2),
                repartition: repartition,
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Calculateurs Agricoles" />

            <div className="p-4 sm:p-6 lg:p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 shadow-xl sm:rounded-lg p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Calculator size={32} style={{ color: PRIMARY_COLOR }} />
                        <h1 className="text-3xl font-bold">Calculateurs Agricoles</h1>
                    </div>

                    {/* Onglets */}
                    <div className="flex flex-wrap space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                        {calculators.map((calc) => {
                            const Icon = calc.icon;
                            return (
                                <button
                                    key={calc.id}
                                    onClick={() => {
                                        setActiveCalculator(calc.id);
                                        setResults(null);
                                    }}
                                    className={`px-4 py-3 font-medium transition-all flex items-center gap-2 rounded-t-lg ${
                                        activeCalculator === calc.id
                                            ? 'text-white'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                    style={
                                        activeCalculator === calc.id
                                            ? { backgroundColor: PRIMARY_COLOR }
                                            : {}
                                    }
                                >
                                    <Icon size={18} />
                                    {calc.name}
                                </button>
                            );
                        })}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Formulaires */}
                        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                            {activeCalculator === 'irrigation' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Droplets size={20} style={{ color: PRIMARY_COLOR }} />
                                        Calcul des besoins en irrigation
                                    </h3>

                                    <div>
                                        <Label>Surface (m²)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={irrigationData.surface}
                                            onChange={(e) => setIrrigationData({ ...irrigationData, surface: e.target.value })}
                                            placeholder="Ex: 1000"
                                        />
                                    </div>

                                    <div>
                                        <Label>Type de culture</Label>
                                        <Select
                                            value={irrigationData.type_culture}
                                            onValueChange={(v) => setIrrigationData({ ...irrigationData, type_culture: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="legumes">Légumes (5 L/m²/jour)</SelectItem>
                                                <SelectItem value="cereales">Céréales (3.5 L/m²/jour)</SelectItem>
                                                <SelectItem value="tubercules">Tubercules (4 L/m²/jour)</SelectItem>
                                                <SelectItem value="fruits">Fruits (6 L/m²/jour)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Type d'irrigation</Label>
                                        <Select
                                            value={irrigationData.type_irrigation}
                                            onValueChange={(v) => setIrrigationData({ ...irrigationData, type_irrigation: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="goutte">Goutte à goutte (90% efficace)</SelectItem>
                                                <SelectItem value="aspersion">Aspersion (75% efficace)</SelectItem>
                                                <SelectItem value="gravitaire">Gravitaire (60% efficace)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        onClick={handleIrrigationSubmit}
                                        className="w-full"
                                        style={{ backgroundColor: PRIMARY_COLOR }}
                                        disabled={!irrigationData.surface}
                                    >
                                        Calculer
                                    </Button>
                                </div>
                            )}

                            {activeCalculator === 'engrais' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Sprout size={20} style={{ color: PRIMARY_COLOR }} />
                                            Calcul des besoins en engrais
                                        </h3>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowPriceSettings(!showPriceSettings)}
                                            className="flex items-center gap-2"
                                        >
                                            <Settings size={16} />
                                            Prix
                                        </Button>
                                    </div>

                                    {/* Paramètres de prix */}
                                    {showPriceSettings && (
                                        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                                <Settings size={16} style={{ color: PRIMARY_COLOR }} />
                                                Modifier les prix (FCFA/sac de 50kg)
                                            </h4>
                                            <div className="space-y-3">
                                                <div>
                                                    <Label className="text-xs">NPK</Label>
                                                    <Input
                                                        type="number"
                                                        value={prixEngrais.npk}
                                                        onChange={(e) => setPrixEngrais({ ...prixEngrais, npk: parseFloat(e.target.value) || 0 })}
                                                        className="text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Urée</Label>
                                                    <Input
                                                        type="number"
                                                        value={prixEngrais.uree}
                                                        onChange={(e) => setPrixEngrais({ ...prixEngrais, uree: parseFloat(e.target.value) || 0 })}
                                                        className="text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Fumier</Label>
                                                    <Input
                                                        type="number"
                                                        value={prixEngrais.fumier}
                                                        onChange={(e) => setPrixEngrais({ ...prixEngrais, fumier: parseFloat(e.target.value) || 0 })}
                                                        className="text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                                                💡 Ces prix sont indicatifs. Vérifiez les prix actuels auprès de vos fournisseurs locaux.
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <Label>Surface (m²)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={engraisData.surface}
                                            onChange={(e) => setEngraisData({ ...engraisData, surface: e.target.value })}
                                            placeholder="Ex: 1000"
                                        />
                                    </div>

                                    <div>
                                        <Label>Type de culture</Label>
                                        <Select
                                            value={engraisData.type_culture}
                                            onValueChange={(v) => setEngraisData({ ...engraisData, type_culture: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cereales">Céréales</SelectItem>
                                                <SelectItem value="legumes">Légumes</SelectItem>
                                                <SelectItem value="tubercules">Tubercules</SelectItem>
                                                <SelectItem value="fruits">Fruits</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Type d'engrais</Label>
                                        <Select
                                            value={engraisData.type_engrais}
                                            onValueChange={(v) => setEngraisData({ ...engraisData, type_engrais: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="npk">NPK ({prixEngrais.npk.toLocaleString()} FCFA/sac)</SelectItem>
                                                <SelectItem value="uree">Urée ({prixEngrais.uree.toLocaleString()} FCFA/sac)</SelectItem>
                                                <SelectItem value="fumier">Fumier ({prixEngrais.fumier.toLocaleString()} FCFA/sac)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        onClick={handleEngraisSubmit}
                                        className="w-full"
                                        style={{ backgroundColor: PRIMARY_COLOR }}
                                        disabled={!engraisData.surface}
                                    >
                                        Calculer
                                    </Button>
                                </div>
                            )}

                            {activeCalculator === 'surface' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Ruler size={20} style={{ color: PRIMARY_COLOR }} />
                                        Calcul de surface
                                    </h3>

                                    <div>
                                        <Label>Forme du terrain</Label>
                                        <Select
                                            value={surfaceData.forme}
                                            onValueChange={(v) => {
                                                setSurfaceData({
                                                    forme: v,
                                                    longueur: '',
                                                    largeur: '',
                                                    rayon: '',
                                                });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="rectangle">Rectangle</SelectItem>
                                                <SelectItem value="carre">Carré</SelectItem>
                                                <SelectItem value="cercle">Cercle</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {surfaceData.forme === 'rectangle' && (
                                        <>
                                            <div>
                                                <Label>Longueur (m)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={surfaceData.longueur}
                                                    onChange={(e) => setSurfaceData({ ...surfaceData, longueur: e.target.value })}
                                                    placeholder="Ex: 50"
                                                />
                                            </div>
                                            <div>
                                                <Label>Largeur (m)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={surfaceData.largeur}
                                                    onChange={(e) => setSurfaceData({ ...surfaceData, largeur: e.target.value })}
                                                    placeholder="Ex: 20"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {surfaceData.forme === 'carre' && (
                                        <div>
                                            <Label>Côté (m)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={surfaceData.longueur}
                                                onChange={(e) => setSurfaceData({ ...surfaceData, longueur: e.target.value })}
                                                placeholder="Ex: 30"
                                            />
                                        </div>
                                    )}

                                    {surfaceData.forme === 'cercle' && (
                                        <div>
                                            <Label>Rayon (m)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={surfaceData.rayon}
                                                onChange={(e) => setSurfaceData({ ...surfaceData, rayon: e.target.value })}
                                                placeholder="Ex: 15"
                                            />
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleSurfaceSubmit}
                                        className="w-full"
                                        style={{ backgroundColor: PRIMARY_COLOR }}
                                        disabled={
                                            (surfaceData.forme === 'rectangle' && (!surfaceData.longueur || !surfaceData.largeur)) ||
                                            (surfaceData.forme === 'carre' && !surfaceData.longueur) ||
                                            (surfaceData.forme === 'cercle' && !surfaceData.rayon)
                                        }
                                    >
                                        Calculer
                                    </Button>
                                </div>
                            )}

                            {activeCalculator === 'cout' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <DollarSign size={20} style={{ color: PRIMARY_COLOR }} />
                                        Calcul du coût de production
                                    </h3>

                                    <div>
                                        <Label>Surface (m²)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={coutData.surface}
                                            onChange={(e) => setCoutData({ ...coutData, surface: e.target.value })}
                                            placeholder="Ex: 1000"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Semences (FCFA)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={coutData.semences}
                                                onChange={(e) => setCoutData({ ...coutData, semences: e.target.value })}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <Label>Engrais (FCFA)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={coutData.engrais}
                                                onChange={(e) => setCoutData({ ...coutData, engrais: e.target.value })}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Main d'œuvre (FCFA)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={coutData.main_oeuvre}
                                                onChange={(e) => setCoutData({ ...coutData, main_oeuvre: e.target.value })}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <Label>Irrigation (FCFA)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={coutData.irrigation}
                                                onChange={(e) => setCoutData({ ...coutData, irrigation: e.target.value })}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Autres (FCFA)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={coutData.autres}
                                            onChange={(e) => setCoutData({ ...coutData, autres: e.target.value })}
                                            placeholder="0"
                                        />
                                    </div>

                                    <Button
                                        onClick={handleCoutSubmit}
                                        className="w-full"
                                        style={{ backgroundColor: PRIMARY_COLOR }}
                                        disabled={!coutData.surface}
                                    >
                                        Calculer
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Résultats */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 p-6 rounded-lg border-2 border-green-200 dark:border-green-900">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Calculator size={20} style={{ color: PRIMARY_COLOR }} />
                                Résultats
                            </h3>

                            {!results ? (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                    <Calculator size={64} className="mb-4 opacity-30" />
                                    <p className="text-center">
                                        Remplissez le formulaire et cliquez sur "Calculer"
                                        <br />
                                        pour voir les résultats
                                    </p>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-4"
                                >
                                    {results.type === 'irrigation' && (
                                        <>
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: PRIMARY_COLOR }}>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Besoin journalier</div>
                                                <div className="text-3xl font-bold" style={{ color: PRIMARY_COLOR }}>
                                                    {results.data.besoin_journalier} L
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: PRIMARY_COLOR }}>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Besoin hebdomadaire</div>
                                                <div className="text-3xl font-bold" style={{ color: PRIMARY_COLOR }}>
                                                    {results.data.besoin_hebdomadaire} L
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: PRIMARY_COLOR }}>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Besoin mensuel</div>
                                                <div className="text-3xl font-bold" style={{ color: PRIMARY_COLOR }}>
                                                    {results.data.besoin_mensuel} L
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: PRIMARY_COLOR }}>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Efficacité du système</div>
                                                <div className="text-3xl font-bold" style={{ color: PRIMARY_COLOR }}>
                                                    {results.data.efficacite}%
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {results.type === 'engrais' && (
                                        <>
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: PRIMARY_COLOR }}>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Quantité totale</div>
                                                <div className="text-3xl font-bold" style={{ color: PRIMARY_COLOR }}>
                                                    {results.data.quantite_totale} {results.data.unite}
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: PRIMARY_COLOR }}>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nombre de sacs (50kg)</div>
                                                <div className="text-3xl font-bold" style={{ color: PRIMARY_COLOR }}>
                                                    {results.data.nombre_sacs} sacs
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: PRIMARY_COLOR }}>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Prix unitaire</div>
                                                <div className="text-xl font-bold" style={{ color: PRIMARY_COLOR }}>
                                                    {results.data.prix_unitaire.toLocaleString()} FCFA/sac
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: PRIMARY_COLOR }}>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Coût estimé</div>
                                                <div className="text-3xl font-bold" style={{ color: PRIMARY_COLOR }}>
                                                    {results.data.cout_estime.toLocaleString()} FCFA
                                                </div>
                                            </div>
                                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
                                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                                    💡 <strong>Note :</strong> Ces prix sont indicatifs et peuvent varier selon le marché local. 
                                                    Vérifiez auprès de vos fournisseurs (SEDIMA, ISRA, coopératives) pour les prix actuels.
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    {results.type === 'surface' && (
                                        <>
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: PRIMARY_COLOR }}>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Surface en m²</div>
                                                <div className="text-3xl font-bold" style={{ color: PRIMARY_COLOR }}>
                                                    {results.data.surface_m2} m²
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: PRIMARY_COLOR }}>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Surface en hectares</div>
                                                <div className="text-3xl font-bold" style={{ color: PRIMARY_COLOR }}>
                                                    {results.data.surface_hectares} ha
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: PRIMARY_COLOR }}>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Surface en acres</div>
                                                <div className="text-3xl font-bold" style={{ color: PRIMARY_COLOR }}>
                                                    {results.data.surface_acres} acres
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: PRIMARY_COLOR }}>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Périmètre</div>
                                                <div className="text-3xl font-bold" style={{ color: PRIMARY_COLOR }}>
                                                    {results.data.perimetre} m
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {results.type === 'cout' && (
                                        <>
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: PRIMARY_COLOR }}>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Coût total</div>
                                                <div className="text-3xl font-bold" style={{ color: PRIMARY_COLOR }}>
                                                    {results.data.cout_total.toLocaleString()} FCFA
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: PRIMARY_COLOR }}>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Coût par m²</div>
                                                <div className="text-3xl font-bold" style={{ color: PRIMARY_COLOR }}>
                                                    {parseFloat(results.data.cout_par_m2).toLocaleString()} FCFA
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: PRIMARY_COLOR }}>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Coût par hectare</div>
                                                <div className="text-3xl font-bold" style={{ color: PRIMARY_COLOR }}>
                                                    {parseFloat(results.data.cout_par_hectare).toLocaleString()} FCFA
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-semibold">
                                                    Répartition des coûts
                                                </div>
                                                <div className="space-y-3">
                                                    {Object.entries(results.data.repartition).map(([key, value]: [string, any]) => (
                                                        <div key={key}>
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                                                                <span className="text-sm font-bold" style={{ color: PRIMARY_COLOR }}>
                                                                    {value}%
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                                <div
                                                                    className="h-2.5 rounded-full transition-all duration-300"
                                                                    style={{
                                                                        width: `${value}%`,
                                                                        backgroundColor: PRIMARY_COLOR,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Edit3, Trash2, PlusCircle, MapPin } from 'lucide-react';

interface ZoneType {
  id: number;
  nom: string;
}

interface AgriculteurType {
  id: number;
  nom: string; // Le nom formaté (nom prénom) de l'agriculteur
}

interface PlantationType {
  id: number;
  nom: string;
  // Champs pour l'affichage direct (strings formatées par le contrôleur)
  zone: string;
  agriculteur: string;
  // Champs originaux pour les actions (Edit/Delete)
  zone_id?: number | string | null;
  agriculteur_id?: number | string | null;
  type_sol?: string;
  perimetre?: number | null;
  date_plantation?: string | null;
}

interface FlashMessage {
  message?: string;
  type?: 'success' | 'info' | 'danger';
}

interface PlantationProps {
  plantations: PlantationType[];
  zones: ZoneType[];
  agriculteurs: AgriculteurType[];
  flash?: FlashMessage;
  canWrite?: boolean;
}

const PRIMARY_COLOR = '#43A047';
const DANGER_COLOR = '#EF4444';
const HEADER_BG_COLOR = '#388E3C';

export default function Plantation({
  plantations,
  zones,
  agriculteurs,
  flash,
  canWrite = true,
}: PlantationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const confirm = (message: string) => window.confirm(message);

  // ✅ CORRECTION : Utiliser 'patch' au lieu de 'put' pour l'update
  const { data, setData, reset, post, patch, delete: destroy, errors } = useForm({
    id: null as number | null,
    nom: '',
    zone_id: '' as string | null,
    agriculteur_id: '' as string | null,
    type_sol: '',
    perimetre: '' as string | number,
    date_plantation: '',
  });

  const handleCreate = () => {
    reset();
    setIsEditing(false);
    setIsModalOpen(true);
  };

  /**
   * Ouvre la modale d'édition et charge les données de la plantation.
   */
  const handleEdit = (p: PlantationType) => {
    setData({
      id: p.id,
      nom: p.nom,
      // Utilisation des IDs pour le formulaire (Doit être une chaîne)
      zone_id: p.zone_id?.toString() || '',
      agriculteur_id: p.agriculteur_id?.toString() || '',
      type_sol: p.type_sol || '',
      perimetre: p.perimetre !== null && p.perimetre !== undefined ? p.perimetre.toString() : '',
      date_plantation: p.date_plantation || '',
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  /**
   * Gère la suppression d'une plantation.
   */
  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette plantation ?')) {
      destroy(`/plantation/${id}`); 
    }
  };

  /**
   * Soumet le formulaire de création ou de modification.
   */
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const formOptions = {
      preserveScroll: true,
      onSuccess: () => {
        setIsModalOpen(false);
        setIsEditing(false);
        reset();
      },
      onError: (errs: any) => console.error('Erreur de validation:', errs),
    };

    // Préparation du payload : s'assurer que les chaînes vides sont null ou des nombres
    const payload = {
      nom: data.nom,
      type_sol: data.type_sol,
      date_plantation: data.date_plantation === '' ? null : data.date_plantation,

      // Conversion des champs vides en `null`
      zone_id: data.zone_id === '' ? null : data.zone_id,
      agriculteur_id: data.agriculteur_id === '' ? null : data.agriculteur_id,
      // Le périmètre doit être un nombre ou null
      perimetre: data.perimetre === '' ? null : Number(data.perimetre),
    };

    if (isEditing && data.id) {
      // ✅ CORRECTION FINALE : Utiliser form.patch()
      // Envoie une requête POST avec _method: 'patch' à /plantation/{id}
      patch(
        `/plantation/${data.id}`,
        payload,
        formOptions
      );
    } else {
      // Utiliser form.post() pour la création
      post(
        '/plantation',
        payload,
        formOptions
      );
    }
  };

  return (
    <AppLayout>
      <Head title="Gestion des Plantations" />

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Flash Message */}
        {flash?.message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-4 mb-4 rounded-lg shadow-md font-medium ${
              flash.type === 'success' ? 'bg-green-100 text-green-700' : 
              flash.type === 'info' ? 'bg-blue-100 text-blue-700' : 
              'bg-red-100 text-red-700'
            }`}
          >
            {flash.message}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-white dark:bg-gray-800 shadow-xl sm:rounded-lg p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MapPin size={28} style={{ color: PRIMARY_COLOR }} /> Gestion des Plantations
            </h1>
            {canWrite && (
              <Button style={{ backgroundColor: PRIMARY_COLOR }} onClick={handleCreate}>
                <PlusCircle size={18} className="mr-2" /> Ajouter une Plantation
              </Button>
            )}
          </div>

          {/* TABLEAU */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead style={{ backgroundColor: HEADER_BG_COLOR }}>
                <tr>
                  <th className="p-4 text-left text-xs font-extrabold uppercase text-white">Nom</th>
                  <th className="p-4 text-left text-xs font-extrabold uppercase text-white">Agriculteur</th>
                  <th className="p-4 text-left text-xs font-extrabold uppercase text-white">Zone</th>
                  <th className="p-4 text-left text-xs font-extrabold uppercase text-white">Type Sol</th>
                  <th className="p-4 text-left text-xs font-extrabold uppercase text-white">Périmètre (m²)</th>
                  <th className="p-4 text-left text-xs font-extrabold uppercase text-white">Date</th>
                  {canWrite && <th className="p-4 text-white">Actions</th>}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {plantations.length > 0 ? (
                  plantations.map((p) => {
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-green-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="p-4 font-medium">{p.nom}</td>
                        {/* AFFICHAGE DIRECT DES NOMS PRÉPARÉS PAR LE CONTRÔLEUR */}
                        <td className="p-4">{p.agriculteur}</td> 
                        <td className="p-4">{p.zone}</td>
                        {/* FIN AFFICHAGE DIRECT */}
                        <td className="p-4">{p.type_sol || '—'}</td>
                        <td className="p-4">{p.perimetre || '—'}</td>
                        <td className="p-4">{p.date_plantation || '—'}</td>
                        {canWrite && (
                          <td className="p-4 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(p)}>
                              <Edit3 size={16} className="text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              style={{ backgroundColor: DANGER_COLOR }}
                              onClick={() => handleDelete(p.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={canWrite ? 7 : 6}
                      className="p-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      Aucune plantation trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* MODAL FORMULAIRE */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[640px] dark:bg-gray-800" aria-describedby="dialog-desc">
          <p id="dialog-desc" className="sr-only">
            Formulaire de création ou modification d’une plantation.
          </p>

          <DialogHeader>
            <DialogTitle className="text-xl font-bold dark:text-gray-100">
              {isEditing ? 'Modifier la plantation' : 'Ajouter une plantation'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Zone</Label>
                <Select
                  value={data.zone_id || '_none'}
                  onValueChange={(v) => setData('zone_id', v === '_none' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">-- Aucune --</SelectItem>
                    {zones.map((z) => (
                      <SelectItem key={z.id} value={z.id.toString()}>
                        {z.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.zone_id && <p className="text-red-500 text-xs mt-1">{errors.zone_id}</p>}
              </div>

              <div>
                <Label>Agriculteur</Label>
                <Select
                  value={data.agriculteur_id || '_none'}
                  onValueChange={(v) => setData('agriculteur_id', v === '_none' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un agriculteur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">-- Aucun --</SelectItem>
                    {agriculteurs.map((a) => (
                      <SelectItem key={a.id} value={a.id.toString()}>
                        {a.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.agriculteur_id && <p className="text-red-500 text-xs mt-1">{errors.agriculteur_id}</p>}
              </div>
            </div>

            <div>
              <Label>Nom</Label>
              <Input
                value={data.nom}
                onChange={(e) => setData('nom', e.target.value)}
                placeholder="Nom de la plantation"
              />
              {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type de sol</Label>
                <Input
                  value={data.type_sol}
                  onChange={(e) => setData('type_sol', e.target.value)}
                  placeholder="Argileux, Sableux..."
                />
              </div>
              <div>
                <Label>Périmètre (m²)</Label>
                <Input
                  type="number"
                  value={data.perimetre}
                  onChange={(e) => setData('perimetre', e.target.value)}
                  placeholder="Surface estimée"
                />
                {errors.perimetre && <p className="text-red-500 text-xs mt-1">{errors.perimetre}</p>}
              </div>
            </div>

            <div>
              <Label>Date de plantation</Label>
              <Input
                type="date"
                value={data.date_plantation}
                onChange={(e) => setData('date_plantation', e.target.value)}
              />
              {errors.date_plantation && <p className="text-red-500 text-xs mt-1">{errors.date_plantation}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" style={{ backgroundColor: PRIMARY_COLOR }}>
                {isEditing ? 'Sauvegarder' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, X, Edit3, Trash2, MapPin } from 'lucide-react'; // Import icons
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

// Couleurs AgriKewi (Uniformisation)
const PRIMARY_COLOR = '#43A047'; // Vert (commun aux trois fichiers)
const DANGER_COLOR = '#EF4444'; // Rouge standard
const HEADER_BG_COLOR = '#388E3C'; // Couleur d'en-tête (commun aux trois fichiers)

interface Localite {
  id: number;
  nom: string;
}

interface Zone {
  id: number;
  nom: string;
  localite_id: number;
}

interface ZoneProps {
  zones?: Zone[];
  localites?: Localite[];
}

export default function ZoneDeProductionComponent({
  zones = [],
  localites = [],
}: ZoneProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data, setData, reset, post, put } = useForm({
    id: null as number | null,
    nom: '',
    localite_id: '',
  });

  const localiteNom = (id: number) => localites.find(l => l.id === id)?.nom || '—';

  const handleCreate = () => {
    reset();
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (zone: Zone) => {
    setData({
      id: zone.id,
      nom: zone.nom,
      localite_id: zone.localite_id.toString(),
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Voulez-vous vraiment supprimer cette zone ?')) {
      router.delete(`/zone/${id}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitMethod = isEditing && data.id ? put : post;
    const url = isEditing && data.id ? `/zone/${data.id}` : '/zone';

    submitMethod(url, {
      preserveScroll: true,
      onSuccess: () => {
        setIsModalOpen(false);
        setIsEditing(false);
        reset();
      },
      onError: (errs) => console.error('Erreur de validation:', errs),
    });
  };

  return (
    <AppLayout>
      <Head title="Zones de production" />

      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="bg-white dark:bg-gray-800 shadow-xl sm:rounded-lg p-6"
        >
          
          {/* =====================
              Contrôle du formulaire et Titre
          ===================== */}
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
            <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <MapPin size={28} style={{ color: PRIMARY_COLOR }} /> Gestion des Zones de Production
            </h1>
            <Button
                size="sm"
                className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                onClick={handleCreate}
                style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}
            >
                <PlusCircle className="w-5 h-5" />
                Créer une nouvelle zone
            </Button>
          </div>


          {/* =====================
              Liste des zones (Tableau)
          ===================== */}
          <div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead style={{ backgroundColor: HEADER_BG_COLOR }}>
                  <tr>
                    <th scope="col" className="p-4 text-left text-xs font-extrabold uppercase text-white">Nom</th>
                    <th scope="col" className="p-4 text-left text-xs font-extrabold uppercase text-white">Localité</th>
                    <th scope="col" className="p-4 text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {zones.length > 0 ? (
                    zones.map(z => (
                      <tr key={z.id} className="hover:bg-green-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="p-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{z.nom}</td>
                        <td className="p-4">
                          {localiteNom(z.localite_id)}
                        </td>
                        <td className="p-4 flex gap-2">
                          <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEdit(z)}
                          >
                            <Edit3 size={16} className="text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            style={{ backgroundColor: DANGER_COLOR }}
                            onClick={() => handleDelete(z.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-500 dark:text-gray-400">
                        Aucune zone trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>

      {/* FORMULAIRE MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[420px] dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold dark:text-gray-100">
              {isEditing ? 'Modifier la zone' : 'Créer une nouvelle zone'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4"> 
            
            {/* Nom */}
            <div>
              <Label htmlFor="nom">Nom de la zone</Label>
              <Input
                id="nom"
                name="nom"
                value={data.nom}
                onChange={(e) => setData('nom', e.target.value)}
                required
                placeholder="Ex: Zone Nord Cotonou"
              />
            </div>

            {/* Localité */}
            <div>
              <Label>Localité</Label>
              <Select
                value={data.localite_id || '_none'}
                onValueChange={(v) => setData('localite_id', v === '_none' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une localité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">-- Aucune --</SelectItem>
                  {localites.map(l => (
                    <SelectItem key={l.id} value={l.id.toString()}>
                      {l.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
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
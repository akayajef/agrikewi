import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Clock, ListChecks, PlusCircle, Edit3, Trash2 } from 'lucide-react';

// Couleurs AgriKewi (Uniformisation)
const PRIMARY_COLOR = '#43A047'; // Vert Principal
const DANGER_COLOR = '#EF4444'; // Rouge Danger
const INFO_COLOR = '#3B82F6';   // Bleu Info
const HEADER_BG_COLOR = '#388E3C'; // Vert En-tête de tableau

interface Agriculteur {
  id: number;
  nom: string;
  prenom: string;
}

interface Tache {
  id: number;
  description: string;
  agriculteur_id: number | null;
  date_echeance?: string;
  statut: 'en_cours' | 'terminee' | 'retard';
}

interface TacheProps {
  taches: Tache[];
  agriculteurs: Agriculteur[];
}

// Styles utilitaires
const getStatutClasses = (statut: Tache['statut']): string => {
  if (statut === 'terminee') return 'bg-green-100 dark:bg-green-900/50';
  if (statut === 'retard') return 'bg-red-100 dark:bg-red-900/50';
  if (statut === 'en_cours') return 'bg-blue-100 dark:bg-blue-900/50';
  return 'bg-gray-100 dark:bg-gray-700/50';
};

const getStatutTextColor = (statut: Tache['statut']): string => {
  if (statut === 'terminee') return PRIMARY_COLOR;
  if (statut === 'retard') return DANGER_COLOR;
  if (statut === 'en_cours') return INFO_COLOR;
  return 'text-gray-500 dark:text-gray-400';
};

const getStatutIcon = (statut: Tache['statut']) => {
  const className = "w-3 h-3";
  if (statut === 'terminee') return <CheckCircle className={className} />;
  if (statut === 'en_cours') return <Clock className={className} />;
  if (statut === 'retard') return <AlertTriangle className={className} />;
  return null;
};

// Fonction pour obtenir la date d'aujourd'hui au format YYYY-MM-DD
const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function TacheComponent({ taches, agriculteurs }: TacheProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data, setData, reset, post, put } = useForm({
    id: null as number | null,
    description: '',
    agriculteur_id: '' as string | number,
    date_echeance: '',
  });
  
  const resetForm = () => {
    reset();
    setIsEditing(false);
    setIsModalOpen(false);
  };

  const handleCreate = () => {
    reset();
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (t: Tache) => {
    setData({
      id: t.id,
      description: t.description,
      agriculteur_id: t.agriculteur_id ? t.agriculteur_id.toString() : '_none', 
      date_echeance: t.date_echeance || '',
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer cette tâche ?")) {
      router.delete(`/tache/${id}`);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...data,
      agriculteur_id: data.agriculteur_id === '_none' ? null : data.agriculteur_id,
    };

    const formOptions = {
      preserveScroll: true,
      onSuccess: () => resetForm(),
      onError: (errs: any) => console.error('Erreur de validation:', errs),
    };

    if (isEditing && data.id) {
      router.post(
        `/tache/${data.id}`,
        {
          ...payload,
          _method: 'put',
        },
        formOptions
      );
    } else {
      router.post('/tache', payload, formOptions);
    }
  };

  const getAgriculteurName = (id: number | null): string => {
    if (!id) return 'Non attribué';
    const agri = agriculteurs.find(a => a.id === id);
    return agri ? `${agri.nom} ${agri.prenom}` : 'Inconnu';
  };
  
  const handleSelectChange = (value: string) => {
    setData('agriculteur_id', value);
  };


  return (
    <AppLayout>
      <Head title="Gestion des Tâches" />

      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-white dark:bg-gray-800 shadow-xl sm:rounded-lg p-6 w-full" 
        >
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
            <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <ListChecks size={28} style={{ color: PRIMARY_COLOR }} /> Gestion des Tâches
            </h1>
            <Button
              size="sm"
              onClick={handleCreate}
              style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}
              className="flex items-center gap-1 hover:opacity-90 transition-opacity"
            >
              <PlusCircle size={18} />
              <span className="hidden sm:inline">Créer une nouvelle tâche</span><span className="sm:hidden">Créer</span>
            </Button>
          </div>

          {/* TABLEAU */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead style={{ backgroundColor: HEADER_BG_COLOR }}>
                <tr>
                  <th className="p-4 text-left text-xs font-extrabold uppercase text-white whitespace-nowrap">Description</th>
                  <th className="p-4 text-left text-xs font-extrabold uppercase text-white whitespace-nowrap hidden sm:table-cell">Agriculteur</th>
                  <th className="p-4 text-left text-xs font-extrabold uppercase text-white whitespace-nowrap hidden md:table-cell">Échéance</th>
                  <th className="p-4 text-left text-xs font-extrabold uppercase text-white whitespace-nowrap">Statut</th>
                  <th className="p-4 text-white whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {taches.length > 0 ? (
                  taches.map(t => (
                    <tr 
                      key={t.id} 
                      className="hover:bg-green-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="p-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">{t.description}</td>
                      <td className="p-4 whitespace-nowrap hidden sm:table-cell">
                        {getAgriculteurName(t.agriculteur_id)}
                      </td>
                      <td className="p-4 whitespace-nowrap hidden md:table-cell">
                        {t.date_echeance ? new Date(t.date_echeance).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span 
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold text-xs ${getStatutClasses(t.statut)}`}
                          style={{ color: getStatutTextColor(t.statut) }}
                        >
                          {getStatutIcon(t.statut)}
                          {t.statut === 'terminee' ? 'Terminée' : t.statut === 'en_cours' ? 'En cours' : 'En retard'}
                        </span>
                      </td>
                      <td className="p-4 flex gap-2 whitespace-nowrap">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(t)}>
                          <Edit3 size={16} className="text-green-600" />
                          <span className='sr-only sm:not-sr-only sm:ml-1'>Modifier</span>
                        </Button>
                        <Button
                          size="sm"
                          style={{ backgroundColor: DANGER_COLOR }}
                          onClick={() => handleDelete(t.id)}
                        >
                          <Trash2 size={16} />
                          <span className='sr-only sm:not-sr-only sm:ml-1'>Supprimer</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Aucune tâche trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
      
      {/* FORMULAIRE MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[640px] dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold dark:text-gray-100">
              {isEditing ? 'Modifier la tâche' : 'Ajouter une tâche'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Description */}
            <div>
              <Label htmlFor="description">Description de la tâche</Label>
              <Input
                id="description"
                name="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                required
                placeholder="Ex: Arroser la plantation A"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Agriculteur */}
              <div>
                <Label>Attribuer à l'ouvrier</Label>
                <Select
                  value={data.agriculteur_id?.toString() || '_none'}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un ouvrier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">-- Non attribué --</SelectItem>
                    {agriculteurs.map((a) => (
                      <SelectItem key={a.id} value={a.id.toString()}>
                        {a.nom} {a.prenom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date d'échéance */}
              <div>
                <Label htmlFor="date_echeance">Date d'échéance</Label>
                <Input
                  id="date_echeance"
                  type="date"
                  name="date_echeance"
                  value={data.date_echeance}
                  onChange={(e) => setData('date_echeance', e.target.value)}
                  min={getTodayDate()}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
              <Button type="submit" style={{ backgroundColor: PRIMARY_COLOR }}>
                {isEditing ? 'Sauvegarder les modifications' : 'Créer la tâche'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
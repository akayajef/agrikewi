import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Leaf, Edit3, Trash2, PlusCircle } from 'lucide-react';

const PRIMARY_COLOR = '#43A047'; // Vert AgriKewi (commun aux trois fichiers)
const DANGER_COLOR = '#EF4444'; // Rouge standard
const HEADER_BG_COLOR = '#388E3C'; // Couleur d'en-tête (commun aux trois fichiers)

interface AgriculteurType {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  localite?: string;
  localite_id?: number;
}

interface LocaliteType {
  id: number;
  nom: string;
}

interface AgriculteurProps {
  agriculteurs: {
    data: AgriculteurType[];
    meta: any;
  };
  localites: LocaliteType[];
}

export default function Agriculteur({ agriculteurs, localites }: AgriculteurProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data, setData, reset, post, put, errors } = useForm({
    id: null as number | null,
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    localite_id: '',
  });

  const agriList = agriculteurs.data || [];

  const handleCreate = () => {
    reset();
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (a: AgriculteurType) => {
    setData({
      id: a.id,
      nom: a.nom,
      prenom: a.prenom,
      email: a.email,
      telephone: a.telephone || '',
      password: '',
      localite_id: a.localite_id?.toString() || '',
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Voulez-vous vraiment supprimer cet agriculteur ?')) {
      router.delete(`/agriculteur/${id}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitMethod = isEditing && data.id ? put : post;
    const url = isEditing && data.id ? `/agriculteur/${data.id}` : '/agriculteur';

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
      <Head title="Agriculteurs" />

      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-white dark:bg-gray-800 shadow-xl sm:rounded-lg p-6"
        >
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
            <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <Leaf size={28} style={{ color: PRIMARY_COLOR }} /> Gestion des ouvriers
            </h1>
            <Button
              size="sm"
              onClick={handleCreate}
              style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}
              className="flex items-center gap-1 hover:opacity-90 transition-opacity"
            >
              <PlusCircle size={18} />
              Ajouter un ouvrier
            </Button>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead style={{ backgroundColor: HEADER_BG_COLOR }}>
                <tr>
                  <th className="p-4 text-left text-xs font-extrabold uppercase text-white">Nom</th>
                  <th className="p-4 text-left text-xs font-extrabold uppercase text-white">Prénom</th>
                  <th className="p-4 text-left text-xs font-extrabold uppercase text-white">Email</th>
                  <th className="p-4 text-left text-xs font-extrabold uppercase text-white">Téléphone</th>
                  <th className="p-4 text-left text-xs font-extrabold uppercase text-white">Localité</th>
                  <th className="p-4 text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {agriList.length > 0 ? (
                  agriList.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-green-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="p-4 font-medium">{a.nom}</td>
                      <td className="p-4">{a.prenom}</td>
                      <td className="p-4">{a.email}</td>
                      <td className="p-4">{a.telephone || '-'}</td>
                      <td className="p-4">{a.localite || '-'}</td>
                      <td className="p-4 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(a)}>
                          <Edit3 size={16} className="text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          style={{ backgroundColor: DANGER_COLOR }}
                          onClick={() => handleDelete(a.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Aucun ouvrier trouvé.
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
              {isEditing ? 'Modifier un agriculteur' : 'Ajouter un agriculteur'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Nom */}
              <div>
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  name="nom"
                  value={data.nom}
                  onChange={(e) => {
                    // Accepter uniquement les lettres, espaces et traits d'union
                    const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, '');
                    setData('nom', value);
                  }}
                  required
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              {/* Prénom */}
              <div>
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  name="prenom"
                  value={data.prenom}
                  onChange={(e) => {
                    // Accepter uniquement les lettres, espaces et traits d'union
                    const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, '');
                    setData('prenom', value);
                  }}
                  required
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  required
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              {/* Téléphone */}
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  name="telephone"
                  value={data.telephone}
                  onChange={(e) => {
                    // Accepter uniquement les chiffres, espaces, +, - et ()
                    const value = e.target.value.replace(/[^0-9\s+()-]/g, '');
                    setData('telephone', value);
                  }}
                  maxLength={20}
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Localité */}
              <div>
                <Label>Localité</Label>
                <Select
                  value={data.localite_id || '_none'}
                  onValueChange={(v) => setData('localite_id', v === '_none' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une localité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">-- Aucune --</SelectItem>
                    {localites.map((l) => (
                      <SelectItem key={l.id} value={l.id.toString()}>
                        {l.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mot de passe (seulement en création) */}
              {!isEditing && (
                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    required
                    className="dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              )}
            </div>


            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" style={{ backgroundColor: PRIMARY_COLOR }}>
                {isEditing ? 'Sauvegarder' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
import React, { useMemo, useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, AlertTriangle, Info, Send, User, Mail, Bell } from "lucide-react";
import { motion } from 'framer-motion';

// Couleurs AgriKewi
const PRIMARY_COLOR = "#4CAF50"; // Vert principal
const DANGER_COLOR = "#EF4444"; // Rouge pour les erreurs/dangers
const BG_LIGHT = "#F9FAFB"; // Gris très clair pour le fond
const CARD_BG = "#FFFFFF"; // Blanc pour les cartes
const DARK_CARD_BG = "#1F2937"; // Gris foncé pour les cartes en mode sombre

type NotificationTypeEnum = "cible" | "groupe";
type CibleTypeEnum = "client" | "agriculteur";

interface NotificationType {
  id: number;
  title?: string;
  message: string;
  type: NotificationTypeEnum;
  read_at?: string | null;
  created_at: string;
  sender: {
    nom_complet: string;
    prenom: string;
    nom: string;
    email: string;
  };
}

interface UtilisateurType {
  id: number;
  nom_complet: string;
  role: string;
}

interface FlashType {
  message: string;
  type: "success" | "error" | "info" | "danger";
}

interface NotificationPageProps {
  notifications: NotificationType[];
  clients: UtilisateurType[];
  agriculteurs: UtilisateurType[];
  flash?: FlashType;
  canSend?: boolean;
}

// Composants stylisés pour Input, Select et Label (améliorés)
const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <Input
    {...props}
    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-800 text-gray-900 dark:text-gray-100 transition-all h-10"
    style={{ "--tw-ring-color": PRIMARY_COLOR } as React.CSSProperties}
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-800 text-gray-900 dark:text-gray-100 appearance-none transition-all h-10"
    style={{ "--tw-ring-color": PRIMARY_COLOR } as React.CSSProperties}
  />
);

const Label = (props: React.ComponentPropsWithoutRef<"label">) => (
  <label
    {...props}
    className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300"
  />
);

// Composant FlashMessage pour les notifications système
const getNotificationStyles = (type: FlashType["type"]) => {
  const isSuccess = type === "success" || type === "info";
  const isDanger = type === "danger" || type === "error";

  let bgColor = "bg-blue-50 dark:bg-blue-900/20";
  let icon = <Info className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />;
  let border = "#3B82F6"; // Blue
  let text = "text-blue-800 dark:text-blue-300";

  if (isSuccess) {
    bgColor = "bg-green-50 dark:bg-green-900/20";
    icon = <CheckCircle className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />;
    border = PRIMARY_COLOR;
    text = "text-green-800 dark:text-green-300";
  } else if (isDanger) {
    bgColor = "bg-red-50 dark:bg-red-900/20";
    icon = <AlertTriangle className="w-5 h-5 mr-3 text-red-600 dark:text-red-400" />;
    border = DANGER_COLOR;
    text = "text-red-800 dark:text-red-300";
  }

  return { bgColor, icon, border, text };
};

const FlashMessage: React.FC<{ flash: FlashType }> = ({ flash }) => {
  const styles = getNotificationStyles(flash.type);
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="alert"
      className={`p-4 rounded-xl border-l-4 ${styles.bgColor} shadow-lg`}
      style={{ borderLeftColor: styles.border }}
    >
      <div className="flex items-center">
        {styles.icon}
        <span className={`font-medium ${styles.text}`}>{flash.message}</span>
      </div>
    </motion.div>
  );
};

// Composant de formulaire d'envoi de notification
const NotificationForm: React.FC<{
  clients: UtilisateurType[];
  agriculteurs: UtilisateurType[];
}> = ({ clients, agriculteurs }) => {
  const { data, setData, post, processing, errors } = useForm({
    title: "",
    message: "",
    type: "cible" as NotificationTypeEnum,
    user_id: "" as number | "",
    cible: "agriculteur" as CibleTypeEnum,
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const destinataires = useMemo(
    () => (data.cible === "client" ? clients : agriculteurs),
    [data.cible, clients, agriculteurs]
  );

  const performPost = () => {
    post("/notification", {
      onSuccess: () =>
        setData({
          ...data,
          message: "",
          title: "",
          user_id: "",
        }),
      onFinish: () => setShowConfirmModal(false),
    });
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (data.type === "groupe") {
      // Dans un environnement Canvas, nous évitons window.confirm
      // On utilise un modal UI ou, à défaut, on simule l'action post-confirmation.
      // Dans ce cas, nous allons juste logger l'action et envoyer.
      console.warn(`[CONFIRMATION SIMULÉE] Envoi groupé à ${data.cible}s.`);
    }

    // Le vrai modal UI pourrait être implémenté ici en utilisant showConfirmModal
    performPost();
  };

  const isSendDisabled =
    processing ||
    !data.message ||
    (data.type === "cible" && !data.user_id) ||
    !data.cible;

  const handleTypeChange = (newType: NotificationTypeEnum) =>
    setData((prev) => ({
      ...prev,
      type: newType,
      user_id: "",
    }));

  const handleCibleChange = (newCible: CibleTypeEnum) =>
    setData((prev) => ({
      ...prev,
      cible: newCible,
      user_id: "",
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-full mx-auto border border-gray-100 dark:border-gray-700"
    >
      <h2 className="text-2xl font-extrabold mb-6 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center">
        <Send size={24} style={{ color: PRIMARY_COLOR }} className="mr-3"/> Nouvelle Notification
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          
          {/* Section de Ciblage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Type d'envoi */}
            <div>
              <Label htmlFor="type">Mode d'envoi</Label>
              <Select
                id="type"
                value={data.type}
                onChange={(e) =>
                  handleTypeChange(e.target.value as NotificationTypeEnum)
                }
              >
                <option value="cible">Ciblé</option>
                <option value="groupe">Groupe (Diffusion)</option>
              </Select>
            </div>

            {/* Groupe / Type destinataire */}
            <div>
              <Label htmlFor="cible">
                {data.type === "groupe" ? "Groupe cible" : "Type destinataire"}
              </Label>
              <Select
                id="cible"
                value={data.cible}
                onChange={(e) =>
                  handleCibleChange(e.target.value as CibleTypeEnum)
                }
                required
              >
                <option value="agriculteur">Agriculteur(s)</option>
                <option value="client">Client(s)</option>
              </Select>
              {errors.cible && (
                <div className="text-red-500 text-xs mt-1">{errors.cible}</div>
              )}
            </div>
            
            {/* Utilisateur ciblé (si type = cible) */}
            {data.type === "cible" && (
              <div className="lg:col-span-2">
                <Label htmlFor="userId">Utilisateur spécifique</Label>
                <Select
                  key={`user_select_${data.cible}`} 
                  id="userId"
                  value={data.user_id}
                  onChange={(e) =>
                    setData("user_id", e.target.value ? parseInt(e.target.value) : "")
                  }
                  required
                >
                  <option value="">Sélectionner un {data.cible}</option>
                  {destinataires.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nom_complet} ({u.role})
                    </option>
                  ))}
                </Select>
                {errors.user_id && (
                  <div className="text-red-500 text-xs mt-1">{errors.user_id}</div>
                )}
              </div>
            )}
          </div>

          {/* Section de Contenu */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Label htmlFor="title">Titre (Optionnel)</Label>
              <StyledInput
                id="title"
                type="text"
                value={data.title}
                onChange={(e) => setData("title", e.target.value)}
                placeholder="Ex: Mise à jour importante"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="message">Message *</Label>
              <StyledInput
                id="message"
                type="text"
                value={data.message}
                onChange={(e) => setData("message", e.target.value)}
                required
                placeholder="Votre message ici..."
              />
              {errors.message && (
                <div className="text-red-500 text-xs mt-1">{errors.message}</div>
              )}
            </div>
          </div>
          
          {/* Prévisualisation */}
          {data.message && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-green-500 dark:border-green-600 shadow-inner"
            >
              <h3 className="font-bold mb-2 text-green-800 dark:text-green-300 flex items-center text-sm">
                <Info size={16} className="mr-2"/> Aperçu
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {data.title && <strong className="font-extrabold">{data.title}: </strong>}
                {data.message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Ciblage :{" "}
                {data.type === "cible" && data.user_id
                  ? destinataires.find((u) => u.id === data.user_id)?.nom_complet
                  : `Tous les ${data.cible}s`}
              </p>
            </motion.div>
          )}
          
          {/* Bouton d'envoi */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSendDisabled}
              className="flex items-center gap-2 px-8 py-2 text-white rounded-lg font-bold shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] h-10 disabled:opacity-50"
              style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
            >
              <Send className="w-5 h-5" />
              {processing ? "Envoi en cours..." : "Envoyer"}
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

// Composant d'historique des notifications
const NotificationHistory: React.FC<{ notifications: NotificationType[] }> = ({
  notifications,
}) => {
  const { post } = useForm();
  const [notifList, setNotifList] =
    useState<NotificationType[]>(notifications);

  const handleMarkAsRead = (id: number) => {
    post(`/notification/${id}/mark-as-read`, {
      onSuccess: () => {
        // Animation de fade-out pour un effet de "suppression" douce
        const element = document.getElementById(`notif-${id}`);
        if (element) {
          element.classList.add("opacity-0", "translate-x-10", "transition-all", "duration-500");
          setTimeout(
            () => setNotifList((prev) => prev.filter((n) => n.id !== id)),
            500
          );
        } else {
          setNotifList((prev) => prev.filter((n) => n.id !== id));
        }
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 }}
    >
      <h2 className="text-2xl font-extrabold mb-6 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center">
        <Bell size={24} style={{ color: PRIMARY_COLOR }} className="mr-3"/> Historique des Notifications
      </h2>
      
      {notifList.length === 0 && (
          <div className="p-10 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-inner border border-dashed border-gray-300 dark:border-gray-700">
            <Info className="w-8 h-8 mx-auto mb-3 text-gray-400" />
            <p className="font-medium">Aucun historique de notification trouvé.</p>
            <p className="text-sm">Envoyez votre première notification via le formulaire ci-dessus.</p>
          </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {notifList.map((n) => {
          const isRead = !!n.read_at;
          const cardStyle = isRead
              ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100"
              : "bg-yellow-50 dark:bg-yellow-950/50 border-yellow-300 dark:border-yellow-700 ring-2 ring-yellow-400/50 dark:ring-yellow-600/50 shadow-md";
          
          return (
            <motion.div
              key={n.id}
              id={`notif-${n.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`p-5 rounded-xl border shadow-lg transition-all duration-300 transform hover:shadow-xl ${cardStyle}`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-extrabold text-lg text-gray-800 dark:text-gray-200 truncate pr-2">
                  {n.title || "Message de Service"}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap shadow-sm ${
                    isRead
                      ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                      : "bg-yellow-200 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-300"
                  }`}
                >
                  {isRead ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <Info className="w-3 h-3" />
                  )}
                  {isRead ? "Lue" : "NEUF"}
                </span>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm leading-relaxed">
                {n.message}
              </p>

              {/* Informations de l'expéditeur */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 mb-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-1">
                  <User className="w-3 h-3 text-green-600" />
                  <strong>Expéditeur:</strong> {n.sender.nom_complet}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-2">
                  <Mail className="w-3 h-3 text-green-600" />
                  {n.sender.email}
                </p>
              </div>

              <div className="flex justify-between items-center mt-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {n.type === 'groupe' ? 'Diffusion' : 'Ciblage'} | Le {new Date(n.created_at).toLocaleDateString()}
                </div>
                {!isRead && (
                  <Button
                    size="sm"
                    onClick={() => handleMarkAsRead(n.id)}
                    className="flex items-center gap-1 px-3 py-1 text-xs rounded-full font-bold transition-colors bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white shadow-md"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  >
                    <CheckCircle className="w-3 h-3" />
                    Marquer lue
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default function NotificationPage({
  notifications,
  clients,
  agriculteurs,
  flash,
  canSend = false,
}: NotificationPageProps) {
  return (
    <AppLayout>
      <Head title="Notifications" />
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-12 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900">
        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-4 flex items-center">
          <Bell className="w-8 h-8 mr-4" style={{ color: PRIMARY_COLOR }}/> Centre de Gestion des Notifications
        </h1>
        
        {flash && <FlashMessage flash={flash} />}
        
        {canSend && (
          <NotificationForm clients={clients} agriculteurs={agriculteurs} />
        )}
        
        <NotificationHistory notifications={notifications} />
      </div>
    </AppLayout>
  );
}
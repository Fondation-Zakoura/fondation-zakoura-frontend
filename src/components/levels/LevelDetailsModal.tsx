import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Info, Tag, Code, CalendarDays, User, Hash, GitFork } from "lucide-react"; // Ajout de GitFork pour le cycle

import type { Level } from '@/types/levels'; // Importez l'interface Level

interface LevelDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: Level | null;
}

export const LevelDetailsModal: React.FC<LevelDetailsModalProps> = ({ isOpen, onClose, level }) => {
  if (!isOpen || !level) return null;

  // Helper function to format dates
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString; // Fallback to original string if parsing fails
    }
  };

  // Helper function to get user's name
  const getUserName = (user: any) => {
    if (!user) return "N/A";
    if (user.name) return user.name;
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    return "N/A";
  };

  // Déterminer le statut basé sur deleted_at
  const levelStatus = level.deleted_at ? "Inactif" : "Actif";
  const statusBadgeClass = level.deleted_at
    ? "bg-red-100 text-red-800 border-red-200"
    : "bg-green-100 text-green-800 border-green-200";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] p-0">
        <ScrollArea className="max-h-[90vh] rounded-lg">
          <div className="p-8 bg-gradient-to-br from-slate-50 to-white">
            <DialogHeader className="pb-6 border-b border-gray-200 mb-6">
              <DialogTitle className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                <Tag className="h-8 w-8 text-primary" />
                {level.title}
              </DialogTitle>
              <div className="mt-2 flex items-center gap-3 text-gray-600 text-sm">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  <Code className="h-3 w-3 mr-1" />
                  {level.level_id || 'ID non défini'}
                </Badge>
                {/* Affichage du statut basé sur deleted_at */}
                <Badge variant="default" className={statusBadgeClass}>
                  <Info className="h-3 w-3 mr-1" />
                  {levelStatus}
                </Badge>
              </div>
            </DialogHeader>

            <div className="mt-8 space-y-8">
              <section className="border-b pb-6 border-gray-100">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-gray-600" />
                  Informations Générales
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-gray-500" />
                    <strong>Code:</strong> {level.code || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <strong>Ordre:</strong> {level.order ?? 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <GitFork className="h-4 w-4 text-gray-500" />
                    <strong>Cycle:</strong> {level.cycle?.title || 'N/A'} ({level.cycle?.code || 'N/A'})
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-gray-500" />
                    <strong>Âge Min:</strong> {level.min_age  ?? 'N/A'} ans
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-gray-500" />
                    <strong>Âge Max:</strong> {level.max_age ?? 'N/A'} ans
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-gray-600" />
                  Dates & Métadonnées
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <strong>Date de création:</strong> {formatDate(level.created_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <strong>Dernière mise à jour:</strong> {formatDate(level.updated_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <strong>Créé par:</strong> {getUserName(level.creator)}
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <strong>Date de suppression:</strong> {level.deleted_at ? formatDate(level.deleted_at) : 'ne pas supprimer'}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

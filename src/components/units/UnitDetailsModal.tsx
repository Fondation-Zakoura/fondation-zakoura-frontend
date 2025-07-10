// src/components/units/UnitDetailsModal.tsx

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MapPin, Info, Tag, FileText, User, CalendarDays, Code, Hash } from "lucide-react"; // Importation des icônes nécessaires

import type{ Unit } from '@/features/api/unitApi'; 

interface UnitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: Unit | null;
}

export const UnitDetailsModal: React.FC<UnitDetailsModalProps> = ({ isOpen, onClose, unit }) => {
  if (!isOpen || !unit) return null;

  // Helper function to format dates
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
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
  console.log(unit);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] p-0">
        <ScrollArea className="max-h-[90vh] rounded-lg">
          <div className="p-8 bg-gradient-to-br from-slate-50 to-white">
            <DialogHeader className="pb-6 border-b border-gray-200 mb-6">
              <DialogTitle className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                <Tag className="h-8 w-8 text-primary" /> {/* Using Tag icon for Unit */}
                {unit.name}
              </DialogTitle>
              <div className="mt-2 flex items-center gap-3 text-gray-600 text-sm">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  <Code className="h-3 w-3 mr-1" />
                  {unit.unit_id || 'ID non défini'}
                </Badge>
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                  <Info className="h-3 w-3 mr-1" />
                  {unit.type}
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                  <Info className="h-3 w-3 mr-1" />
                  {unit.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="mt-8 space-y-8">
              <section className="border-b pb-6 border-gray-100">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-gray-600" />
                  Informations Générales
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-gray-700">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-gray-500" />
                    <strong>Code interne:</strong> {unit.internal_code || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <strong>Code partenaire:</strong> {unit.partner_reference_code || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <strong>Nombre de classes:</strong> {unit.number_of_classes ?? 'N/A'}
                  </div>
                </div>
              </section>

              <section className="border-b pb-6 border-gray-100">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  Détails de Localisation (Site)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-gray-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <strong>Nom du site:</strong> {unit.site?.name || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <strong>Région:</strong> {unit.site?.commune?.cercle?.province?.region?.name || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <strong>Province:</strong> {unit.site?.commune?.cercle?.province?.name || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <strong>Cercle:</strong> {unit.site?.commune?.cercle?.name || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <strong>Commune:</strong> {unit.site?.commune?.name || 'N/A'}
                  </div>
                </div>
              </section>

              <section className="border-b pb-6 border-gray-100">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-600" />
                  Responsables
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <strong>Éducatrice:</strong> {getUserName(unit.educator)}
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
                    <strong>Date de création:</strong> {formatDate(unit.created_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <strong>Dernière mise à jour:</strong> {formatDate(unit.updated_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <strong>Créé par:</strong> {getUserName(unit.creator)}
                  </div>
                </div>
              </section>

              {unit.observations && (
                <section>
                  <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    Observations / Remarques
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-md border border-gray-100">
                    {unit.observations}
                  </p>
                </section>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

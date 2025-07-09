import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MapPin, Info, Tag, Flag, FileText, User, CalendarDays, Code, Globe } from "lucide-react";

import countries from "@/data/countries.json"; // Import your countries data

// Define interfaces for your geographic entities to match the backend response
interface Region {
  id: number;
  name: string;
}

interface Province {
  id: number;
  name: string;
  region_id?: number | null;
  region?: Region | null; // Nested region object
}

interface Cercle {
  id: number;
  name: string;
  province_id?: number | null;
  province?: Province | null; // Nested province object
}

interface Commune {
  id: number;
  name: string;
  cercle_id?: number | null;
  cercle?: Cercle | null; // Nested cercle object
}

interface Douar {
  id: number;
  name: string;
  commune_id?: number | null;
}

interface Site {
  id?: number;
  site_id?: string;
  name: string;
  internal_code: string;
  partner_reference_code?: string;
  type: "Rural" | "Urbain" | "Semi-urbain";
  commune_id?: number | null;
  douar_id?: number | null;
  country: string; // This is the country CODE (e.g., "MA")

  // REMOVE THESE, as they will now be accessed via nested objects:
  // region?: string;
  // province?: string;
  // cercle?: string;
  // commune?: string;
  // douar?: string;

  start_date: string;
  status: "Actif" | "Fermé" | "En pause" | "Archivé";
  latitude?: number | string | null;
  longitude?: number | string | null;
  local_operational_manager_id?: number | null;
  observations?: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;

  // Now, correctly define the nested objects as per your API Resource structure
  commune?: Commune | null; // Use the new Commune interface
  douar?: Douar | null;     // Use the new Douar interface

  local_operational_manager?: { id: number; name?: string; email?: string } | null;
  creator?: { id: number; name?: string; first_name?: string; last_name?: string; email?: string } | null;
}

export const SiteDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  site: Site | null;
}> = ({ isOpen, onClose, site }) => {
  if (!isOpen || !site) return null;

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    try {
      // Ensure the date string is parsable for toLocaleDateString
      // If it's already "YYYY-MM-DD HH:mm:ss" from Laravel, it should work fine
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateString; // Fallback to original string if parsing fails
    }
  };

  const getUserName = (user: any) => {
    if (!user) return "N/A";
    if (user.name) return user.name;
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    return "N/A";
  };

  // Helper function to get country name from code
  const getCountryName = (countryCode: string | undefined) => {
    if (!countryCode) return "N/A";
    const country = countries.find(c => c.code === countryCode);
    return country ? country.name : countryCode;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] p-0">
        <ScrollArea className="max-h-[90vh] rounded-lg">
          <div className="p-8 bg-gradient-to-br from-slate-50 to-white">
            <DialogHeader className="pb-6 border-b border-gray-200 mb-6">
              <DialogTitle className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                <MapPin className="h-8 w-8 text-primary" />
                {site.name}
              </DialogTitle>
              <div className="mt-2 flex items-center gap-3 text-gray-600 text-sm">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  <Code className="h-3 w-3 mr-1" />
                  {site.site_id || 'ID non défini'}
                </Badge>
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                  <Tag className="h-3 w-3 mr-1" />
                  {site.type}
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                  <Info className="h-3 w-3 mr-1" />
                  {site.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="mt-8 space-y-8">
              <section className="border-b pb-6 border-gray-100">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  Détails de Localisation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-gray-700">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-gray-500" />
                    <strong>Pays:</strong> {getCountryName(site.country)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    {/* Access nested properties for region, province, cercle, commune */}
                    <strong>Région:</strong> {site.commune?.cercle?.province?.region?.name || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <strong>Province:</strong> {site.commune?.cercle?.province?.name || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <strong>Cercle:</strong> {site.commune?.cercle?.name || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <strong>Commune:</strong> {site.commune?.name || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <strong>Douar:</strong> {site.douar?.name || 'N/A'} {/* Access douar.name */}
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <strong>Latitude:</strong> {site.latitude ?? 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <strong>Longitude:</strong> {site.longitude ?? 'N/A'}
                  </div>
                </div>
              </section>

              <section className="border-b pb-6 border-gray-100">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-gray-600" />
                  Informations Administratives
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-gray-500" />
                    <strong>Code interne:</strong> {site.internal_code || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <strong>Code partenaire:</strong> {site.partner_reference_code || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <strong>Responsable opérationnel local:</strong> {getUserName(site.local_operational_manager)}
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
                    <strong>Date de démarrage:</strong> {formatDate(site.start_date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <strong>Date de création:</strong> {formatDate(site.created_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <strong>Dernière mise à jour:</strong> {formatDate(site.updated_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <strong>Créé par:</strong> {getUserName(site.creator)}
                  </div>
                </div>
              </section>

              {site.observations && (
                <section>
                  <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    Observations / Remarques
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-md border border-gray-100">
                    {site.observations}
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
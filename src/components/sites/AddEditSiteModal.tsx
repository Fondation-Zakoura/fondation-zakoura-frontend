// src/components/sites/AddEditSiteModal.tsx

import countries from "@/data/countries.json";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Combobox } from "@/components/ui/combobox";
import { ComboboxString } from "@/components/ui/combobox-string";

import {
  useGetRegionsQuery,
  useGetProvincesQuery,
  useGetCerclesQuery,
  useGetCommunesQuery,
  useGetDouarsQuery,
} from '@/features/api/geographicApi';
import { useGetUsersQuery } from '@/features/api/usersApi';
import { toast } from "sonner"; // For notifications

interface Region {
  id: number;
  name: string;
}

interface Province {
  id: number;
  name: string;
  region_id?: number | null;
  region?: Region | null;
}

interface Cercle {
  id: number;
  name: string;
  province_id?: number | null;
  province?: Province | null;
}

interface Commune {
  id: number;
  name: string;
  cercle_id?: number | null;
  cercle?: Cercle | null;
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
  country: string;
  start_date: string;
  status: "Actif" | "Fermé" | "En pause" | "Archivé";
  latitude?: number | null;
  longitude?: number | null;
  local_operational_manager_id?: number | null;
  observations?: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  commune?: Commune | null;
  douar?: Douar | null;
  local_operational_manager?: { id: number; name: string } | null;
}

interface UserOption {
  id: number;
  name: string;
}

// Options for Type select
const typeOptions = [
  { value: "Rural", label: "Rural" },
  { value: "Urbain", label: "Urbain" },
  { value: "Semi-urbain", label: "Semi-urbain" },
];

const statusOptions = [
  { value: "Actif", label: "Actif" },
  { value: "Fermé", label: "Fermé" },
  { value: "En pause", label: "En pause" },
  { value: "Archivé", label: "Archivé" },
];

interface AddEditSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData, id?: number) => void;
  site: Site | null; // The site data for editing, or null for adding
  isLoading: boolean; // Indicates if a save operation is in progress
  allSiteInternalCodes: string[]; // Array of all existing site internal codes
}

type SiteFormData = Partial<Site>;

const RequiredLabel: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
  <Label htmlFor={htmlFor}>
    {children} <span className="text-red-500">*</span>
  </Label>
);

export const AddEditSiteModal: React.FC<AddEditSiteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  site,
  isLoading,
  allSiteInternalCodes = [], // <-- ADDED DEFAULT VALUE HERE
}) => {
  const [formData, setFormData] = useState<SiteFormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedCercleId, setSelectedCercleId] = useState<number | null>(null);
  const [selectedCommuneId, setSelectedCommuneId] = useState<number | null>(null);
  const [selectedDouarId, setSelectedDouarId] = useState<number | null>(null);

  // RTK Query hooks for fetching geographic data
  const { data: regions = [] } = useGetRegionsQuery();
  const { data: provinces = [] } = useGetProvincesQuery(selectedRegionId);
  const { data: cercles = [] } = useGetCerclesQuery(selectedProvinceId);
  const { data: communes = [] } = useGetCommunesQuery(selectedCercleId);
  const { data: douars = [] } = useGetDouarsQuery(selectedCommuneId);

  // RTK Query hook for fetching users (for local operational manager)
  const { data: usersApiResponse, isLoading: usersLoading } = useGetUsersQuery();


  // Safely extract the array of users from the API response
  const users = useMemo(() => {
    // Assuming usersApiResponse is an object like { data: [...] }
    if (usersApiResponse && Array.isArray(usersApiResponse.users)) {
      return usersApiResponse.users;
    }
    // Fallback if usersApiResponse is directly an array (less common for RTK Query, but possible)
    if (Array.isArray(usersApiResponse)) {
      return usersApiResponse;
    }
    return []; // Default to empty array
  }, [usersApiResponse]);

  useEffect(() => {
    if (isOpen) {
      setFormData(site ? { ...site } : { type: "Rural", status: "Actif", country: "" });
      setErrors({});

      setSelectedRegionId(null);
      setSelectedProvinceId(null);
      setSelectedCercleId(null);
      setSelectedCommuneId(null);
      setSelectedDouarId(null);

      if (site) {
        setSelectedRegionId(site.commune?.cercle?.province?.region?.id || null);
        setSelectedProvinceId(site.commune?.cercle?.province?.id || null);
        setSelectedCercleId(site.commune?.cercle?.id || null);
        setSelectedCommuneId(site.commune?.id || null);
        setSelectedDouarId(site.douar?.id || null);
      }
    }
  }, [site, isOpen]);

  // Effects to auto-clear dependent dropdowns when a parent selection changes
  useEffect(() => {
    if (selectedRegionId === null) {
      setSelectedProvinceId(null);
      setSelectedCercleId(null);
      setSelectedCommuneId(null);
      setSelectedDouarId(null);
      setFormData(prev => ({ ...prev, commune_id: null, douar_id: null }));
    }
  }, [selectedRegionId]);

  useEffect(() => {
    if (selectedProvinceId === null) {
      setSelectedCercleId(null);
      setSelectedCommuneId(null);
      setSelectedDouarId(null);
      setFormData(prev => ({ ...prev, commune_id: null, douar_id: null }));
    }
  }, [selectedProvinceId]);

  useEffect(() => {
    if (selectedCercleId === null) {
      setSelectedCommuneId(null);
      setSelectedDouarId(null);
      setFormData(prev => ({ ...prev, commune_id: null, douar_id: null }));
    }
  }, [selectedCercleId]);

  useEffect(() => {
    if (selectedCommuneId === null) {
      setSelectedDouarId(null);
      setFormData(prev => ({ ...prev, douar_id: null }));
    }
  }, [selectedCommuneId]);

  const handleRegionChange = useCallback((id: number | null) => {
    setSelectedRegionId(id);
    setErrors((prev) => ({ ...prev, region: undefined, province: undefined, cercle: undefined, commune: undefined, douar: undefined }));
  }, []);

  const handleProvinceChange = useCallback((id: number | null) => {
    setSelectedProvinceId(id);
    setErrors((prev) => ({ ...prev, province: undefined, cercle: undefined, commune: undefined, douar: undefined }));
  }, []);

  const handleCercleChange = useCallback((id: number | null) => {
    setSelectedCercleId(id);
    setErrors((prev) => ({ ...prev, cercle: undefined, commune: undefined, douar: undefined }));
  }, []);

  const handleCommuneChange = useCallback((id: number | null) => {
    setSelectedCommuneId(id);
    setFormData((prev) => ({ ...prev, commune_id: id }));
    setErrors((prev) => ({ ...prev, commune: undefined, douar: undefined }));
  }, []);

  const handleDouarChange = useCallback((id: number | null) => {
    setSelectedDouarId(id);
    setFormData((prev) => ({ ...prev, douar_id: id }));
    setErrors((prev) => ({ ...prev, douar: undefined }));
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      let newValue: string | number | null = value;

      if (name === "latitude" || name === "longitude") {
        newValue = value === "" ? null : parseFloat(value);
        if (newValue !== null && (isNaN(newValue) || (name === "latitude" && (newValue < -90 || newValue > 90)) || (name === "longitude" && (newValue < -180 || newValue > 180)))) {
          setErrors((prev) => ({ ...prev, [name]: `Veuillez entrer une valeur valide pour ${name}.` }));
        } else {
          setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
      } else {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }

      setFormData((prev) => ({ ...prev, [name]: newValue }));
    },
    []
  );

  const handleGeneralSelectChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleManagerComboboxChange = useCallback((id: number | null) => {
    setFormData((prev) => ({ ...prev, local_operational_manager_id: id }));
    setErrors((prev) => ({ ...prev, local_operational_manager_id: undefined }));
  }, []);

  const handleCountryComboboxChange = useCallback((selectedCode: string | null) => {
    setFormData((prev) => ({ ...prev, country: selectedCode || "" }));
    setErrors((prev) => ({ ...prev, country: undefined }));
  }, []);

  // Form validation logic
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = "Le nom du site est obligatoire.";

    // Validate Internal Code for uniqueness and presence
    const trimmedInternalCode = formData.internal_code?.trim();
    if (!trimmedInternalCode) {
      newErrors.internal_code = "Le code interne est obligatoire.";
    } else {
      const isEditing = !!site;
      const originalInternalCode = site?.internal_code;

      // Ensure allSiteInternalCodes is an array before using includes
      if (
        Array.isArray(allSiteInternalCodes) && // ADDED THIS DEFENSIVE CHECK
        allSiteInternalCodes.includes(trimmedInternalCode) &&
        !(isEditing && trimmedInternalCode === originalInternalCode)
      ) {
        newErrors.internal_code = "Ce code interne existe déjà. Veuillez en choisir un autre.";
      }
    }

    if (!formData.type) newErrors.type = "Le type est obligatoire.";
    if (!formData.status) newErrors.status = "Le statut est obligatoire.";
    if (!formData.country || formData.country.trim() === "") newErrors.country = "Le pays est obligatoire.";
    if (!formData.start_date?.trim()) newErrors.start_date = "La date de début est obligatoire.";

    if (selectedRegionId === null) newErrors.region = "La région est obligatoire.";
    if (selectedProvinceId === null) newErrors.province = "La province est obligatoire.";
    if (selectedCommuneId === null) newErrors.commune = "La commune est obligatoire.";

    if (formData.latitude !== null && formData.latitude !== undefined) {
      const lat = Number(formData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.latitude = "La latitude doit être un nombre entre -90 et 90.";
      }
    }
    if (formData.longitude !== null && formData.longitude !== undefined) {
      const lon = Number(formData.longitude);
      if (isNaN(lon) || lon < -180 || lon > 180) {
        newErrors.longitude = "La longitude doit être un nombre entre -180 et 180.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, site, allSiteInternalCodes, selectedRegionId, selectedProvinceId, selectedCommuneId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire.");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        data.append(key, String(value));
      }
    });

    if (selectedCommuneId !== null) data.append('commune_id', String(selectedCommuneId));
    if (selectedDouarId !== null) data.append('douar_id', String(selectedDouarId));
    if (formData.local_operational_manager_id !== null && formData.local_operational_manager_id !== undefined) {
      data.append('local_operational_manager_id', String(formData.local_operational_manager_id));
    }

    if (site?.id) {
      data.append("_method", "PUT");
    }

    onSave(data, site?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold text-gray-800">
            {site ? "Modifier le site" : "Ajouter un site"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="p-6 pt-0">
            <ScrollArea className="max-h-[65vh] overflow-auto pr-2">
              <div className="space-y-10">
                <section>
                  <h3 className="text-lg font-medium text-primary mb-4">
                    Informations Générales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div>
                      <RequiredLabel htmlFor="name">
                        <span className="mb-2 block">Nom du Site</span>
                      </RequiredLabel>
                      <Input id="name" name="name" value={formData.name || ""} onChange={handleInputChange} />
                      {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <RequiredLabel htmlFor="internal_code">
                        <span className="mb-2 block">Code Interne</span>
                      </RequiredLabel>
                      <Input id="internal_code" name="internal_code" value={formData.internal_code || ""} onChange={handleInputChange} />
                      {errors.internal_code && <p className="text-sm text-destructive mt-1">{errors.internal_code}</p>}
                    </div>
                    <div>
                      <Label className="mb-2 " htmlFor="partner_reference_code">Code Partenaire</Label>
                      <Input id="partner_reference_code" name="partner_reference_code" value={formData.partner_reference_code || ""} onChange={handleInputChange} />
                    </div>
                    <div>
                      <RequiredLabel htmlFor="type">
                        <span className="mb-2 block">Type </span>
                      </RequiredLabel>
                      <Select
                        name="type"
                        value={formData.type || ""}
                        onValueChange={(value) => handleGeneralSelectChange("type", value)}
                      >
                        <SelectTrigger className="w-full max-w-[220px] truncate">
                          <SelectValue placeholder="Sélectionnez..." className="truncate" />
                        </SelectTrigger>
                        <SelectContent>
                          {typeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="truncate">
                              <span className="block max-w-[160px] truncate">{opt.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.type && <p className="text-sm text-destructive mt-1">{errors.type}</p>}
                    </div>
                    {/* Geographic Comboboxes */}
                    <div>
                      <RequiredLabel htmlFor="region">
                        <span className="mb-2 block">Région
                        </span>
                      </RequiredLabel>
                      <Combobox
                        label=""
                        options={regions.map(r => ({ id: r.id, value: String(r.id), label: r.name }))}
                        value={selectedRegionId}
                        onValueChange={handleRegionChange}
                        placeholder="Sélectionnez une région..."
                        className="w-full"
                      />
                      {errors.region && <p className="text-sm text-destructive mt-1">{errors.region}</p>}
                    </div>
                    <div>
                      <RequiredLabel htmlFor="province">
                        <span className="mb-2 block">Province
                        </span>
                      </RequiredLabel>
                      <Combobox
                        label=""
                        options={provinces.map(p => ({ id: p.id, value: String(p.id), label: p.name }))}
                        value={selectedProvinceId}
                        onValueChange={handleProvinceChange}
                        placeholder="Sélectionnez une province..."
                        disabled={selectedRegionId === null && regions.length > 0 && provinces.length === 0}
                        className="w-full"
                      />
                      {errors.province && <p className="text-sm text-destructive mt-1">{errors.province}</p>}
                    </div>
                    <div>
                      <Label className="mb-2 " htmlFor="cercle">Cercle</Label>
                      <Combobox
                        label=""
                        options={cercles.map(c => ({ id: c.id, value: String(c.id), label: c.name }))}
                        value={selectedCercleId}
                        onValueChange={handleCercleChange}
                        placeholder="Sélectionnez un cercle..."
                        disabled={selectedProvinceId === null && provinces.length > 0 && cercles.length === 0}
                        className="w-full"
                      />
                      {errors.cercle && <p className="text-sm text-destructive mt-1">{errors.cercle}</p>}
                    </div>
                    <div>
                      <RequiredLabel htmlFor="commune">
                        <span className="mb-2 block">Commune
                        </span>
                      </RequiredLabel>
                      <Combobox
                        label=""
                        options={communes.map(c => ({ id: c.id, value: String(c.id), label: c.name }))}
                        value={selectedCommuneId}
                        onValueChange={handleCommuneChange}
                        placeholder="Sélectionnez une commune..."
                        disabled={selectedCercleId === null && cercles.length > 0 && communes.length === 0}
                        className="w-full"
                      />
                      {errors.commune && <p className="text-sm text-destructive mt-1">{errors.commune}</p>}
                    </div>
                    <div>
                      <Label className="mb-2 " htmlFor="douar">Douar</Label>
                      <Combobox
                        label=""
                        options={douars.map(d => ({ id: d.id, value: String(d.id), label: d.name }))}
                        value={selectedDouarId}
                        onValueChange={handleDouarChange}
                        placeholder="Sélectionnez un douar..."
                        disabled={selectedCommuneId === null && communes.length > 0 && douars.length === 0}
                        className="w-full"
                      />
                      {errors.douar && <p className="text-sm text-destructive mt-1">{errors.douar}</p>}
                    </div>
                    {/* End Geographic Comboboxes */}
                    <div>
                      <RequiredLabel htmlFor="country">
                        <span className="mb-2 block">Pays</span>
                      </RequiredLabel>
                      <ComboboxString
                        options={countries.map(c => ({ value: c.code, label: c.name }))}
                        value={formData.country}
                        onValueChange={handleCountryComboboxChange}
                        placeholder="Sélectionnez un pays..."
                        className="w-full"
                      />
                      {errors.country && <p className="text-sm text-destructive mt-1">{errors.country}</p>}
                    </div>
                    <div>
                      <RequiredLabel htmlFor="start_date">Date de début</RequiredLabel>
                      <Input id="start_date" name="start_date" type="date" value={formData.start_date || ""} onChange={handleInputChange} />
                      {errors.start_date && <p className="text-sm text-destructive mt-1">{errors.start_date}</p>}
                    </div>
                    <div>
                      <RequiredLabel htmlFor="status">
                        <span className="mb-2 block">Statut
                        </span>
                      </RequiredLabel>
                      <Select
                        name="status"
                        value={formData.status || ""}
                        onValueChange={(value) => handleGeneralSelectChange("status", value)}
                      >
                        <SelectTrigger className="w-full max-w-[220px] truncate">
                          <SelectValue placeholder="Sélectionnez..." className="truncate" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="truncate">
                              <span className="block max-w-[160px] truncate">{opt.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.status && <p className="text-sm text-destructive mt-1">{errors.status}</p>}
                    </div>
                    <div>
                      <Label className="mb-2 " htmlFor="latitude">Latitude</Label>
                      <Input id="latitude" name="latitude" type="number" step="any" value={formData.latitude ?? ""} onChange={handleInputChange} />
                      {errors.latitude && <p className="text-sm text-destructive mt-1">{errors.latitude}</p>}
                    </div>
                    <div>
                      <Label className="mb-2 " htmlFor="longitude">Longitude</Label>
                      <Input id="longitude" name="longitude" type="number" step="any" value={formData.longitude ?? ""} onChange={handleInputChange} />
                      {errors.longitude && <p className="text-sm text-destructive mt-1">{errors.longitude}</p>}
                    </div>
                    <div>
                      <Label className="mb-2 " htmlFor="local_operational_manager_id">Responsable opérationnel local</Label>
                      <Combobox
                        label=""
                        options={users.map(u => ({ id: u.id, value: String(u.id), label: u.name }))}
                        value={formData.local_operational_manager_id || null}
                        onValueChange={handleManagerComboboxChange}
                        placeholder={usersLoading ? "Chargement..." : "Sélectionnez un responsable..."}
                        className="w-full"
                        disabled={usersLoading}
                      />
                      {errors.local_operational_manager_id && <p className="text-sm text-destructive mt-1">{errors.local_operational_manager_id}</p>}
                    </div>
                  </div>
                </section>
                <section>
                  <Label className="mb-2 " htmlFor="observations">Observations / remarques</Label>
                  <Textarea id="observations" name="observations" rows={3} value={formData.observations || ""} onChange={handleInputChange} />
                </section>
              </div>
            </ScrollArea>
          </div>
          <DialogFooter className="p-4 bg-gray-50 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (<Loader2 className="animate-spin mr-2" size={16} />) : (<Save size={16} className="mr-2" />)} Sauvegarder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
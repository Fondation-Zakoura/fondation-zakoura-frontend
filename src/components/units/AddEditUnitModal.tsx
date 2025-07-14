import React, { useState, useEffect, useCallback } from "react";
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
import { toast } from "sonner";

import { useCreateUnitMutation, useUpdateUnitMutation } from '@/features/api/unitApi';
// Ensure these types correctly reflect your API's nullable fields
import type { Unit, UnitFormData, UnitFormOptions, Site, User } from '@/features/api/unitApi';

// Options pour les types d'unité (doivent correspondre aux Enums backend)
const unitTypeOptions = [
  { value: "Préscolaire", label: "Préscolaire" },
  { value: "École", label: "École" },
  { value: "Regroupement", label: "Regroupement" },
  { value: "Centre", label: "Centre" },
  { value: "Communautaire", label: "Communautaire" },
];

// Options pour les statuts d'unité (doivent correspondre aux Enums backend)
const unitStatusOptions = [
  { value: "Active", label: "Active" },
  { value: "Fermée", label: "Fermée" },
  { value: "En pause", label: "En pause" },
  { value: "Archivée", label: "Archivée" },
];

interface AddEditUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: Unit | null;
  formOptions: UnitFormOptions | undefined;
}

// Helper component for required labels with a red asterisk
const RequiredLabel: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
  <Label htmlFor={htmlFor}>
    {children} <span className="text-red-500">*</span>
  </Label>
);

// Define a local UnitFormData type that explicitly allows null for site_id and educator_id.
// This is important if the imported UnitFormData does not already reflect this,
// or if your API can return nulls for these fields.
interface LocalUnitFormData extends Omit<UnitFormData, 'site_id' | 'educator_id'> {
  site_id: number | null;
  educator_id: number | null;
}

export const AddEditUnitModal: React.FC<AddEditUnitModalProps> = ({
  isOpen,
  onClose,
  unit,
  formOptions,
}) => {
  // Use LocalUnitFormData to correctly type the state
  const [formData, setFormData] = useState<LocalUnitFormData>({
    name: '',
    internal_code: '',
    partner_reference_code: undefined,
    site_id: null, // Initialize with null as it's optional
    type: 'Préscolaire',
    number_of_classes: 0,
    status: 'Active',
    educator_id: null, // Initialize with null as it's optional
    observations: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formOptionsLoading = !formOptions;

  const [createUnit, { isLoading: isCreating }] = useCreateUnitMutation();
  const [updateUnit, { isLoading: isUpdating }] = useUpdateUnitMutation();
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (isOpen) {
      if (unit) {
        setFormData({
          name: unit.name,
          internal_code: unit.internal_code,
          partner_reference_code: unit.partner_reference_code || undefined,
          // Coerce unit.site_id to number or null correctly
          site_id: (unit.site_id === 0 || unit.site_id === null || unit.site_id === undefined) ? null : unit.site_id,
          type: unit.type,
          number_of_classes: unit.number_of_classes,
          status: unit.status,
          // Coerce unit.educator_id to number or null correctly
          educator_id: (unit.educator_id === 0 || unit.educator_id === null || unit.educator_id === undefined) ? null : unit.educator_id,
          observations: unit.observations || undefined,
        });
      } else {
        setFormData({
          name: '',
          internal_code: '',
          partner_reference_code: undefined,
          site_id: null, // For new units, default to null
          type: 'Préscolaire',
          number_of_classes: 0,
          status: 'Active',
          educator_id: null, // For new units, default to null
          observations: undefined,
        });
      }
      setErrors({});
    }
  }, [isOpen, unit]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'number_of_classes' ? parseInt(value) || 0 : value,
      }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    },
    []
  );

  const handleSelectChange = useCallback((name: keyof LocalUnitFormData, value: string | number | null) => {
    // If the value is an empty string for a numeric field that can be null, convert it to null
    const processedValue = (name === 'site_id' || name === 'educator_id') && value === '' ? null : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = "Le nom de l'unité est obligatoire.";
    if (!formData.internal_code?.trim()) newErrors.internal_code = "Le code interne est obligatoire.";

    // FIX: Corrected validation for site_id to handle null explicitly
    // If site_id is null or a non-positive number after conversion (if it exists)
    if (formData.site_id === null || formData.site_id <= 0) {
      newErrors.site_id = "Le site d'appartenance est obligatoire.";
    }

    if (!formData.type) newErrors.type = "Le type d'unité est obligatoire.";
    if (formData.number_of_classes === undefined || formData.number_of_classes < 0 || isNaN(formData.number_of_classes)) {
      newErrors.number_of_classes = "Le nombre de classes est obligatoire et doit être un nombre positif.";
    }
    if (!formData.status) newErrors.status = "Le statut de l'unité est obligatoire.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire.");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        data.append(key, String(value));
      } else if (key === 'number_of_classes' && (value === 0 || value === undefined)) {
        data.append(key, '0');
      }
      // Explicitly append empty string for null educator_id if backend expects it to unset
      // Otherwise, not appending means it won't be updated, which is often fine.
      // If backend needs explicit null, you might need to send data.append('educator_id', '');
    });


    if (unit?.id) {
      data.append("_method", "PUT");
    }

    try {
      if (unit) {
        await updateUnit({ id: unit.id, data }).unwrap();
        toast.success("Unité mise à jour avec succès.");
      } else {
        await createUnit(data).unwrap();
        toast.success("Unité créée avec succès.");
      }
      onClose();
    } catch (err: unknown) {
      console.error("Erreur lors de la sauvegarde de l'unité:", err);
      if (typeof err === 'object' && err !== null && 'data' in err && typeof (err as { data: unknown }).data === 'object' && (err as { data: { errors?: Record<string, string> } }).data?.errors) {
        setErrors((err as { data: { errors: Record<string, string> } }).data.errors);
        toast.error("Veuillez corriger les erreurs de validation.");
      } else {
        toast.error("Échec de la sauvegarde de l'unité.");
      }
    }
  };

  const sitesOptions = (formOptions?.sites || []).map((s: Site) => ({ value: String(s.id), label: s.name }));
  const educatorsOptions = (formOptions?.educators || []).map((e: User) => ({ value: String(e.id), label: e.name }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold text-gray-800">
            {unit ? "Modifier l'unité" : "Ajouter une unité"}
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
                        <span className="mb-2 block">Nom de l'unité</span>
                      </RequiredLabel>
                      <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                      {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <RequiredLabel htmlFor="internal_code">
                        <span className="mb-2 block">Code de l'unité (interne)</span>
                      </RequiredLabel>
                      <Input id="internal_code" name="internal_code" value={formData.internal_code} onChange={handleInputChange} />
                      {errors.internal_code && <p className="text-sm text-destructive mt-1">{errors.internal_code}</p>}
                    </div>
                    <div>
                      <Label className="mb-2 " htmlFor="partner_reference_code">Code de l'unité (référentiel partenaire)</Label>
                      <Input id="partner_reference_code" name="partner_reference_code" value={formData.partner_reference_code || ''} onChange={handleInputChange} />
                    </div>
                    <div>
                      <RequiredLabel htmlFor="site_id">
                        <span className="mb-2 block">Site d'appartenance</span>
                      </RequiredLabel>
                      {formOptionsLoading ? (
                        <Input value="Chargement des sites..." disabled />
                      ) : (
                        <Combobox
                          options={sitesOptions}
                          value={String(formData.site_id || '')} // Ensure value is a string, handle null
                          onChange={(val) => handleSelectChange('site_id', val ? Number(val) : null)} // Convert to number or null
                          placeholder="Sélectionnez un site..."
                          className="w-full"
                        />
                      )}
                      {errors.site_id && <p className="text-sm text-destructive mt-1">{errors.site_id}</p>}
                    </div>
                    <div>
                      <RequiredLabel htmlFor="type">
                        <span className="mb-2 block">Type d'unité</span>
                      </RequiredLabel>
                      <Select
                        name="type"
                        value={formData.type}
                        onValueChange={(value) => handleSelectChange("type", value as Unit['type'])}
                      >
                        <SelectTrigger className="w-full max-w-[220px] truncate">
                          <SelectValue placeholder="Sélectionnez un type..." className="truncate" />
                        </SelectTrigger>
                        <SelectContent>
                          {unitTypeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="truncate">
                              <span className="block max-w-[160px] truncate">{opt.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.type && <p className="text-sm text-destructive mt-1">{errors.type}</p>}
                    </div>
                    <div>
                      <RequiredLabel htmlFor="number_of_classes">
                        <span className="mb-2 block">Nombre de classes</span>
                      </RequiredLabel>
                      <Input
                        id="number_of_classes"
                        name="number_of_classes"
                        type="number"
                        value={formData.number_of_classes}
                        onChange={handleInputChange}
                        min="0"
                      />
                      {errors.number_of_classes && <p className="text-sm text-destructive mt-1">{errors.number_of_classes}</p>}
                    </div>
                    <div>
                      <RequiredLabel htmlFor="status">
                        <span className="mb-2 block">Statut de l'unité</span>
                      </RequiredLabel>
                      <Select
                        name="status"
                        value={formData.status}
                        onValueChange={(value) => handleSelectChange("status", value as Unit['status'])}
                      >
                        <SelectTrigger className="w-full max-w-[220px] truncate">
                          <SelectValue placeholder="Sélectionnez un statut..." className="truncate" />
                        </SelectTrigger>
                        <SelectContent>
                          {unitStatusOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="truncate">
                              <span className="block max-w-[160px] truncate">{opt.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.status && <p className="text-sm text-destructive mt-1">{errors.status}</p>}
                    </div>
                    <div>
                      <Label className="mb-2 " htmlFor="educator_id">Responsable affecté (Éducatrice)</Label>
                      {formOptionsLoading ? (
                        <Input value="Chargement des éducatrices..." disabled />
                      ) : (
                        <Combobox
                          options={educatorsOptions}
                          value={String(formData.educator_id || '')} // Ensure value is a string, handle null
                          onChange={(val) => handleSelectChange('educator_id', val ? Number(val) : null)} // Convert to number or null
                          placeholder="Sélectionnez une éducatrice..."
                          className="w-full"
                        />
                      )}
                      {errors.educator_id && <p className="text-sm text-destructive mt-1">{errors.educator_id}</p>}
                    </div>
                  </div>
                </section>
                <section>
                  <Label className="mb-2 " htmlFor="observations">Observations / remarques</Label>
                  <Textarea id="observations" name="observations" rows={3} value={formData.observations || ''} onChange={handleInputChange} />
                </section>
              </div>
            </ScrollArea>
          </div>
          <DialogFooter className="p-4 bg-gray-50 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (<Loader2 className="animate-spin" />) : (<> <Save size={16} className="mr-2" /> Sauvegarder </>)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
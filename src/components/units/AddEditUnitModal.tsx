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

import { useCreateUnitMutation, useUpdateUnitMutation, useGetUnitFormOptionsQuery } from '@/features/api/unitApi';
import type { Unit, UnitFormData, } from '@/features/api/unitApi';

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
  unit: Unit | null; // L'unité à modifier, ou null pour une nouvelle unité
}

// Helper component for required labels with a red asterisk
const RequiredLabel: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
  <Label htmlFor={htmlFor}>
    {children} <span className="text-red-500">*</span>
  </Label>
);

export const AddEditUnitModal: React.FC<AddEditUnitModalProps> = ({
  isOpen,
  onClose,
  unit,
}) => {
  const [formData, setFormData] = useState<UnitFormData>({
    name: '',
    internal_code: '',
    partner_reference_code: '',
    site_id: 0, // Valeur par défaut ou placeholder
    type: 'Préscolaire', // Valeur par défaut
    number_of_classes: 0,
    status: 'Active', // Valeur par défaut
    educator_id: null,
    observations: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // RTK Query hooks pour récupérer les options des formulaires (sites, éducateurs)
  const { data: formOptions, isLoading: formOptionsLoading } = useGetUnitFormOptionsQuery();
  const [createUnit, { isLoading: isCreating }] = useCreateUnitMutation();
  const [updateUnit, { isLoading: isUpdating }] = useUpdateUnitMutation();
  const isLoading = isCreating || isUpdating; // Indicateur global de chargement pour le bouton de sauvegarde

  // Effet pour initialiser les données du formulaire lorsque le modal s'ouvre ou que l'unité change
  useEffect(() => {
    if (isOpen) {
      if (unit) {
        // Remplir les données du formulaire pour l'édition
        setFormData({
          name: unit.name,
          internal_code: unit.internal_code,
          partner_reference_code: unit.partner_reference_code || '',
          site_id: unit.site_id,
          type: unit.type,
          number_of_classes: unit.number_of_classes,
          status: unit.status,
          educator_id: unit.educator_id || null,
          observations: unit.observations || '',
        });
      } else {
        // Réinitialiser le formulaire pour l'ajout d'une nouvelle unité
        setFormData({
          name: '',
          internal_code: '',
          partner_reference_code: '',
          site_id: 0, // Réinitialiser à une valeur par défaut/invalide
          type: 'Préscolaire',
          number_of_classes: 0,
          status: 'Active',
          educator_id: null,
          observations: '',
        });
      }
      setErrors({}); // Effacer les erreurs précédentes
    }
  }, [isOpen, unit]);

  // Gestionnaire de changement générique pour les champs de texte et numériques
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'number_of_classes' ? parseInt(value) || 0 : value, // Convertir en entier pour number_of_classes
      }));
      setErrors((prev) => ({ ...prev, [name]: undefined })); // Effacer l'erreur pour ce champ
    },
    []
  );

  // Gestionnaire de changement générique pour les composants Select et Combobox (pour IDs numériques)
  const handleSelectChange = useCallback((name: string, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  // Logique de validation du formulaire
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Champs de texte requis
    if (!formData.name?.trim()) newErrors.name = "Le nom de l'unité est obligatoire.";
    if (!formData.internal_code?.trim()) newErrors.internal_code = "Le code interne est obligatoire.";

    // Champs Select/Combobox requis
    if (!formData.site_id || formData.site_id === 0) newErrors.site_id = "Le site d'appartenance est obligatoire.";
    if (!formData.type) newErrors.type = "Le type d'unité est obligatoire.";
    if (formData.number_of_classes === undefined || formData.number_of_classes < 0) newErrors.number_of_classes = "Le nombre de classes est obligatoire et doit être positif.";
    if (!formData.status) newErrors.status = "Le statut de l'unité est obligatoire.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Retourne true si aucune erreur
  };

  // Gestionnaire de soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire.");
      return; // Arrêter si la validation échoue
    }

    // Créer un objet FormData pour la soumission
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      // Ajouter uniquement les valeurs non nulles/non définies
      if (value !== null && value !== undefined) {
        data.append(key, String(value));
      }
    });

    // Ajouter _method pour les requêtes PUT si modification
    if (unit?.id) {
      data.append("_method", "PUT");
    }

    try {
      if (unit) {
        // Mettre à jour l'unité existante
        await updateUnit({ id: unit.id, data }).unwrap();
        toast.success("Unité mise à jour avec succès.");
      } else {
        // Créer une nouvelle unité
        await createUnit(data).unwrap();
        toast.success("Unité créée avec succès.");
      }
      onClose(); // Fermer le modal en cas de succès
    } catch (err: any) {
      console.error("Erreur lors de la sauvegarde de l'unité:", err);
      // Gérer les erreurs de validation de l'API (si le backend renvoie des erreurs de validation)
      if (err.data && err.data.errors) {
        setErrors(err.data.errors); // Afficher les erreurs spécifiques du backend
        toast.error("Veuillez corriger les erreurs de validation.");
      } else {
        toast.error("Échec de la sauvegarde de l'unité.");
      }
    }
  };

  // Préparer les options pour les Comboboxes
  const sitesOptions = (formOptions?.sites || []).map(s => ({ value: String(s.id), label: s.name }));
  const educatorsOptions = (formOptions?.educators || []).map(e => ({ value: String(e.id), label: e.name }));

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
                          value={String(formData.site_id)} // Ensure value is a string
                          onChange={(val) => handleSelectChange('site_id', Number(val))} // Corrected prop name and value conversion
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
                      <Input id="number_of_classes" name="number_of_classes" type="number" value={formData.number_of_classes} onChange={handleInputChange} min="0" />
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
                          onChange={(val) => handleSelectChange('educator_id', val ? Number(val) : null)} // Corrected prop name and value conversion
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
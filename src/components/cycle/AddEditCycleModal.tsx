// src/components/cycles/AddEditCycleModal.tsx

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Although not used for cycles, keeping it for completeness
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner"; // For notifications

import {  useCreateCycleMutation, useUpdateCycleMutation } from '@/features/api/cycleApi';
import type { Cycle , CycleFormData } from "@/types/cycles";

interface AddEditCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycle: Cycle | null;
  onSave: (formData: FormData, id?: number) => Promise<void>;
  isLoading: boolean;
  allCycleCodes: string[]; // NEW PROP: Array of all existing cycle codes
}

// Helper component for required labels with a red asterisk
const RequiredLabel: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
  <Label htmlFor={htmlFor}>
    {children} <span className="text-red-500">*</span>
  </Label>
);

export const AddEditCycleModal: React.FC<AddEditCycleModalProps> = ({
  isOpen,
  onClose,
  cycle,
  onSave,
  isLoading,
  allCycleCodes, // Receive new prop
}) => {
  const [formData, setFormData] = useState<CycleFormData>({
    title: '',
    code: '',
    order: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Effet pour initialiser les données du formulaire lorsque le modal s'ouvre ou que le cycle change
  useEffect(() => {
    if (isOpen) {
      if (cycle) {
        // Remplir les données du formulaire pour l'édition
        setFormData({
          title: cycle.title,
          code: cycle.code,
          order: cycle.order,
        });
      } else {
        // Réinitialiser le formulaire pour l'ajout d'un nouveau cycle
        setFormData({
          title: '',
          code: '',
          order: 0,
        });
      }
      setErrors({}); // Effacer les erreurs précédentes
    }
  }, [isOpen, cycle]);

  // Gestionnaire de changement générique pour les champs de texte et numériques
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'order' ? parseInt(value) || 0 : value, // Convertir en entier pour 'order'
      }));
      setErrors((prev) => ({ ...prev, [name]: undefined })); // Effacer l'erreur pour ce champ
    },
    []
  );

  // Logique de validation du formulaire
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate Title
    if (!formData.title?.trim()) {
      newErrors.title = "L'intitulé du cycle est obligatoire.";
    }

    // Validate Code
    const trimmedCode = formData.code?.trim();
    if (!trimmedCode) {
      newErrors.code = "Le code du cycle est obligatoire.";
    } else {
      // Check for uniqueness
      const isEditing = !!cycle;
      const originalCode = cycle?.code;

      if (
        allCycleCodes.includes(trimmedCode) && // Code exists in the list
        !(isEditing && trimmedCode === originalCode) // And it's not the current cycle's original code during edit
      ) {
        newErrors.code = "Ce code de cycle existe déjà. Veuillez en choisir un autre.";
      }
    }

    // Validate Order
    // parseInt(String(formData.order)) ensures it's treated as a number even if it's initially 0 (which is falsy)
    if (isNaN(parseInt(String(formData.order))) || formData.order === undefined || formData.order < 0) {
      newErrors.order = "L'ordre du cycle est obligatoire et doit être un nombre positif ou zéro.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  }, [formData, cycle, allCycleCodes]); // Add allCycleCodes to dependencies

  // Gestionnaire de soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire.");
      return; // Stop if validation fails
    }

    // Create a FormData object for submission
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      // Append only non-null/non-undefined values
      if (value !== null && value !== undefined) {
        data.append(key, String(value));
      }
    });

    try {
      await onSave(data, cycle?.id); // Call the onSave function passed by props
      // If onSave is successful, it handles closing the modal and showing success toast.
      // Any backend validation errors will be caught by the parent's try-catch (CyclesListPage).
    } catch (err: any) {
      // This catch block is for errors specific to the onSave call itself,
      // not necessarily backend validation errors which should be caught by CyclesListPage's onSave.
      console.error("Erreur inattendue lors de la soumission du cycle:", err);
      toast.error("Une erreur inattendue est survenue lors de la sauvegarde.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold text-gray-800">
            {cycle ? "Modifier le cycle" : "Ajouter un cycle"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="p-6 pt-0">
            <ScrollArea className="max-h-[65vh] overflow-auto pr-2">
              <div className="space-y-6">
                <section>
                  <h3 className="text-lg font-medium text-primary mb-4">
                    Informations du Cycle
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-x-6 gap-y-4">
                    <div>
                      <RequiredLabel htmlFor="title">
                        <span className="mb-2 block">Intitulé du cycle</span>
                      </RequiredLabel>
                      <Input id="title" name="title" value={formData.title} onChange={handleInputChange} />
                      {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
                    </div>
                    <div>
                      <RequiredLabel htmlFor="code">
                        <span className="mb-2 block">Code du cycle</span>
                      </RequiredLabel>
                      <Input id="code" name="code" value={formData.code} onChange={handleInputChange} />
                      {errors.code && <p className="text-sm text-destructive mt-1">{errors.code}</p>}
                    </div>
                    <div>
                      <RequiredLabel htmlFor="order">
                        <span className="mb-2 block">Ordre du cycle</span>
                      </RequiredLabel>
                      <Input id="order" name="order" type="number" value={formData.order} onChange={handleInputChange} min="0" />
                      {errors.order && <p className="text-sm text-destructive mt-1">{errors.order}</p>}
                    </div>
                  </div>
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
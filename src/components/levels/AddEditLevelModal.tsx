// src/components/levels/AddEditLevelModal.tsx

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Level, LevelFormData, FilterOption } from '@/types/levels'; // Importez les types

interface AddEditLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: Level | null; // Le niveau à modifier, ou null pour un nouveau niveau
  onSave: (formData: FormData, id?: number) => Promise<void>;
  isLoading: boolean;
  options: {
    cycles: FilterOption[]; // Liste des cycles pour le sélecteur
  };
}

// Helper component for required labels with a red asterisk
const RequiredLabel: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
  <Label htmlFor={htmlFor}>
    {children} <span className="text-red-500">*</span>
  </Label>
);

export const AddEditLevelModal: React.FC<AddEditLevelModalProps> = ({
  isOpen,
  onClose,
  level,
  onSave,
  isLoading,
  options,
}) => {
  const [formData, setFormData] = useState<LevelFormData>({
    title: '',
    code: '',
    cycle_id: 0, // Valeur par défaut pour le sélecteur
    order: 0,
    min_age: 0,
    max_age: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Effet pour initialiser les données du formulaire lorsque le modal s'ouvre ou que le niveau change
  useEffect(() => {
    if (isOpen) {
      if (level) {
        // Remplir les données du formulaire pour l'édition
        setFormData({
          title: level.title,
          code: level.code,
          cycle_id: level.cycle_id,
          order: level.order,
          min_age: level.min_age,
          max_age: level.max_age,
        });
      } else {
        // Réinitialiser le formulaire pour l'ajout d'un nouveau niveau
        setFormData({
          title: '',
          code: '',
          cycle_id: options.cycles.length > 0 ? (options.cycles[0].value as number) : 0, // Sélectionne le premier cycle par défaut si disponible
          order: 0,
          min_age: 0,
          max_age: 0,
        });
      }
      setErrors({}); // Effacer les erreurs précédentes
    }
  }, [isOpen, level, options.cycles]);

  // Gestionnaire de changement générique pour les champs de texte et numériques
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: ['order', 'min_age', 'max_age', 'cycle_id'].includes(name) ? parseInt(value) || 0 : value,
      }));
      setErrors((prev) => ({ ...prev, [name]: undefined })); // Effacer l'erreur pour ce champ
    },
    []
  );

  // Gestionnaire de changement pour le Select (cycle_id)
  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value),
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  // Logique de validation du formulaire côté client
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) newErrors.title = "L'intitulé du niveau est obligatoire.";
    if (!formData.code?.trim()) newErrors.code = "Le code du niveau est obligatoire.";
    if (!formData.cycle_id) newErrors.cycle_id = "Le cycle d'appartenance est obligatoire.";
    if (formData.order === undefined || formData.order < 0) newErrors.order = "L'ordre du niveau est obligatoire et doit être positif.";
    if (formData.min_age === undefined || formData.min_age < 0) newErrors.min_age = "L'âge minimum est obligatoire et doit être positif.";
    if (formData.max_age === undefined || formData.max_age < 0) newErrors.max_age = "L'âge maximum est obligatoire et doit être positif.";
    if (formData.min_age > formData.max_age) newErrors.max_age = "L'âge maximum doit être supérieur ou égal à l'âge minimum.";

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
      if (value !== null && value !== undefined) {
        data.append(key, String(value));
      }
    });

    try {
      await onSave(data, level?.id); // Appeler la fonction onSave passée par props
    } catch (err: any) {
      console.error("Erreur lors de la sauvegarde du niveau:", err);
      if (err.data && err.data.errors) {
        setErrors(err.data.errors); // Afficher les erreurs spécifiques du backend
        toast.error("Veuillez corriger les erreurs de validation.");
      } else {
        toast.error("Échec de la sauvegarde du niveau.");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold text-gray-800">
            {level ? "Modifier le niveau" : "Ajouter un niveau"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="p-6 pt-0">
            <ScrollArea className="max-h-[65vh] overflow-auto pr-2">
              <div className="space-y-6">
                <section>
                  <h3 className="text-lg font-medium text-primary mb-4">
                    Informations du Niveau
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <RequiredLabel htmlFor="title">
                        <span className="mb-2 block">Intitulé du niveau</span>
                      </RequiredLabel>
                      <Input id="title" name="title" value={formData.title} onChange={handleInputChange} />
                      {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
                    </div>
                    <div>
                      <RequiredLabel htmlFor="code">
                        <span className="mb-2 block">Code du niveau</span>
                      </RequiredLabel>
                      <Input id="code" name="code" value={formData.code} onChange={handleInputChange} />
                      {errors.code && <p className="text-sm text-destructive mt-1">{errors.code}</p>}
                    </div>
                    <div>
                      <RequiredLabel htmlFor="cycle_id">
                        <span className="mb-2 block">Cycle d'appartenance</span>
                      </RequiredLabel>
                      <Select
                        value={String(formData.cycle_id)}
                        onValueChange={(value) => handleSelectChange('cycle_id', value)}
                      >
                        <SelectTrigger id="cycle_id" className="w-full">
                          <SelectValue placeholder="Sélectionner un cycle" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.cycles.length > 0 ? (
                            options.cycles.map((cycleOption) => (
                              <SelectItem key={cycleOption.value} value={String(cycleOption.value)}>
                                {cycleOption.label}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>Aucun cycle disponible</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {errors.cycle_id && <p className="text-sm text-destructive mt-1">{errors.cycle_id}</p>}
                    </div>
                    <div>
                      <RequiredLabel htmlFor="order">
                        <span className="mb-2 block">Ordre du niveau</span>
                      </RequiredLabel>
                      <Input id="order" name="order" type="number" value={formData.order} onChange={handleInputChange} min="0" />
                      {errors.order && <p className="text-sm text-destructive mt-1">{errors.order}</p>}
                    </div>
                    <div>
                      <RequiredLabel htmlFor="min_age">
                        <span className="mb-2 block">Âge minimum autorisé</span>
                      </RequiredLabel>
                      <Input id="min_age" name="min_age" type="number" value={formData.min_age} onChange={handleInputChange} min="0" />
                      {errors.min_age && <p className="text-sm text-destructive mt-1">{errors.min_age}</p>}
                    </div>
                    <div>
                      <RequiredLabel htmlFor="max_age">
                        <span className="mb-2 block">Âge maximum autorisé</span>
                      </RequiredLabel>
                      <Input id="max_age" name="max_age" type="number" value={formData.max_age} onChange={handleInputChange} min="0" />
                      {errors.max_age && <p className="text-sm text-destructive mt-1">{errors.max_age}</p>}
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
              {isLoading ? (<Loader2 className="animate-spin" />) : (<> <Save size={16} className="mr-2" /> Sauvegarder </>)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

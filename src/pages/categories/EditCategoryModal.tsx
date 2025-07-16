import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  useUpdateCategoryMutation,
  useShowCategoryQuery,

} from "../../features/api/categoriesApi";
import { Save } from "lucide-react";
import InfoDialog from "@/components/ui/InfoDialog";

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryCode: number;
}

interface FormData {
  name: string;
  description: string;
  statut: "0" | "1";
}

interface InfoDialogState {
  title: string;
  description: string;
}

export default function EditCategoryModal({
  isOpen,
  onClose,
  categoryCode,
}: EditCategoryModalProps) {
  const { data: categoryData, isLoading: isFetchingDetails } = useShowCategoryQuery(
    { id: categoryCode },
    { skip: !categoryCode }
  );

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    statut: "1",
  });

  
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [infoDialogContent, setInfoDialogContent] = useState<InfoDialogState>({
    title: "",
    description: "",
  });

  const [updateCategory, { isLoading: isUpdating, isError }] = useUpdateCategoryMutation();
 

  useEffect(() => {
    if (categoryData) {
      const status = categoryData.deleted_at == null ? "1" : "0";
      
      setFormData({
        name: categoryData.name ?? "",
        description: categoryData.description ?? "",
        statut: status,
      });
    }
  }, [categoryData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: "0" | "1") => {
    setFormData((prev) => ({ ...prev, statut: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryCode) {
      alert("ID de catégorie manquant !");
      return;
    }

    if (!formData.name.trim()) {
      alert("Le nom de la catégorie ne peut pas être vide.");
      return;
    }

    try {
      const payload = {
        category_id: categoryCode,
        name: formData.name,
        description: formData.description,
        deleted_at: formData.statut === "1" ? false : true,
      };

      await updateCategory(payload).unwrap();
      onClose();
    } catch (err: unknown) {
      console.error("Failed to update/delete category:", err);
      const error = err as { data?: { message?: string }; status?: number };
      const isConstraintError =
        error?.data?.message?.includes("foreign key") || error?.status === 409;

      if (formData.statut === "0" && isConstraintError) {
        setInfoDialogContent({
          title: "Désactivation impossible",
          description:
            "La catégorie ne peut pas être désactivée car elle est liée à des produits existants. Veuillez les dissocier avant de réessayer.",
        });
        setInfoDialogOpen(true);
      }
    }
  };

  if (isFetchingDetails || !categoryData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-6">Chargement des détails...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier la catégorie</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations de la catégorie.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Nom
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nom de la catégorie"
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description de la catégorie"
              rows={3}
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="statut" className="block text-sm font-medium">
              Statut
            </label>
            <Select
              value={formData.statut}
              onValueChange={handleStatusChange}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue>
                  {formData.statut === "1" ? "Actif" : "Inactif"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Actif</SelectItem>
                <SelectItem value="0">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isError && (
            <p className="text-sm text-red-500">
              Une erreur est survenue lors de la mise à jour.
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="bg-primary hover:bg-cyan-900"
            >
              <Save /> {isUpdating ? "Mise à jour..." : "Sauvegarder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <InfoDialog
        isOpen={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        title={infoDialogContent.title}
        description={infoDialogContent.description}
        duration={3000}
      />
    </Dialog>
  );
}
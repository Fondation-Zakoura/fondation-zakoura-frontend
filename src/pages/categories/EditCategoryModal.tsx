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
import { useShowCategoryQuery, useUpdateCategoryMutation } from "@/features/api/categoriesApi";

 
interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryCode: number;
}
 
export default function EditCategoryModal({
  isOpen,
  onClose,
  categoryCode,
}: EditCategoryModalProps) {
  const { data: categoryData, isLoading: isFetchingDetails } =
    useShowCategoryQuery(categoryCode, {
      skip: !categoryCode,
    });
 
  const [updateCategory, { isLoading: isUpdating, isError }] =
    useUpdateCategoryMutation();
 
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "1", // derived from deleted_at
  });
 
  useEffect(() => {
    if (categoryData?.data) {
      const cat = categoryData.data;
      setFormData({
        name: cat.name ?? "",
        description: cat.description ?? "",
        status: cat.deleted_at === null ? "1" : "0",
      });
    }
  }, [categoryData]);
 
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
 
  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Le nom de la catégorie ne peut pas être vide.");
      return;
    }
 
    const payload = {
      category_id: categoryCode,
      name: formData.name,
      description: formData.description.trim() || "",
      deleted_at: formData.status === "1" ? false : true,
    };
 
    try {
      await updateCategory(payload).unwrap();
      onClose();
    } catch (err) {
      console.error("Échec de mise à jour de la catégorie:", err);
    }
  };
 
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier la catégorie</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations de la catégorie.
          </DialogDescription>
        </DialogHeader>
 
        {isFetchingDetails ? (
          <div className="text-center py-6">Chargement des détails...</div>
        ) : (
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
              <label htmlFor="status" className="block text-sm font-medium">
                Statut
              </label>
              <Select
                value={formData.status}
                onValueChange={handleStatusChange}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le statut" />
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
                type="submit"
                disabled={isUpdating}
                className="bg-[#18365A] hover:bg-cyan-900"
              >
                {isUpdating ? "Mise à jour..." : "Sauvegarder"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isUpdating}
              >
                Annuler
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
 
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  useShowProductQuery,
  useUpdateProductMutation,
} from "@/features/api/products";
import { useGetProductTypesQuery } from "@/features/api/product_types";
import { useGetCategoriesQuery } from "@/features/api/categoriesApi";
import type { Product } from "@/types/products";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
}

const EditProductModal = ({ isOpen, onClose, productId }: EditProductModalProps) => {
  const { data: productData, isLoading: isFetchingDetails } = useShowProductQuery(productId);
  const { data: categoriesData } = useGetCategoriesQuery({ page: 1, perPage: 100 });
  const { data: productTypesData } = useGetProductTypesQuery({ page: 1, perPage: 100 });

  const [updateProduct, { isLoading: isUpdating, isError }] = useUpdateProductMutation();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "1",
    category_id: "",
    product_type_id: "",
  });

 useEffect(() => {
  if (!productData) return;

  const details: Product =
    "data" in productData ? productData.data : productData;

  setFormData({
    name: details.name ?? "",
    description: details.description ?? "",
    status: details.deleted_at === null ? "1" : "0",
    category_id: String(details.category_id ?? ""),
    product_type_id: String(details.product_type_id ?? ""),
  });
}, [productData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, category_id, product_type_id } = formData;

    if (!name.trim() || !category_id || !product_type_id) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const payload = {
      product_id: productId,
      name: name.trim(),
      description: formData.description.trim() || undefined,
      deleted_at: formData.status === "1" ? false : true,
      category_id: Number(category_id),
      product_type_id: Number(product_type_id),
    };

    try {
      await updateProduct(payload).unwrap();
      onClose();
    } catch (err) {
      console.error("Échec de mise à jour du produit:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le produit</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations du produit.
          </DialogDescription>
        </DialogHeader>

        {isFetchingDetails || !categoriesData?.data || !productTypesData?.data ? (
          <p className="text-sm text-muted-foreground">Chargement des détails...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Combobox
                options={categoriesData.data.map((cat) => ({
                  label: cat.name,
                  value: String(cat.category_id),
                }))}
                value={formData.category_id}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, category_id: value }))
                }
                placeholder="Sélectionner une catégorie"
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Combobox
                options={productTypesData.data.map((type) => ({
                  label: type.name,
                  value: String(type.id),
                }))}
                value={formData.product_type_id}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, product_type_id: value }))
                }
                placeholder="Sélectionner un type"
              />
            </div>

            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Actif</SelectItem>
                  <SelectItem value="0">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isError && (
              <p className="text-sm text-red-500">Erreur lors de la mise à jour.</p>
            )}

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isUpdating}>
                Annuler
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Mise à jour..." : "Sauvegarder"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditProductModal;
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
  useShowArticleQuery,
  useUpdateArticleMutation,
} from "@/features/api/articles";
import { useGetProductsQuery } from "@/features/api/products";
// import { useGetCategoriesQuery } from "@/features/api/categoriesApi";
// import { useGetProductTypesQuery } from "@/features/api/product_types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type EditArticleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  articleId: number;
};

const EditArticleModal = ({ isOpen, onClose, articleId }: EditArticleModalProps) => {
  const { data: articleData, isLoading: isFetchingDetails } = useShowArticleQuery(articleId);
  const { data: productsData } = useGetProductsQuery({ page: 1, perPage: 100 });
  // const { data: productTypesData } = useGetProductTypesQuery({ page: 1, perPage: 100 });
  // const { data: categoriesData } = useGetCategoriesQuery({ page: 1, perPage: 100 });

  const [updateArticle, { isLoading: isUpdating, isError }] = useUpdateArticleMutation();

  const [formData, setFormData] = useState<{
    product_id: string;
    name: string;
    specifications: string;
    brand: string;
    reference_price: string;
    status: "1" | "0";
  }>({
    product_id: "",
    name: "",
    specifications: "",
    brand: "",
    reference_price: "",
    status: "1",
  });

  useEffect(() => {
    if (!articleData) return;
    const details = "data" in articleData ? articleData.data : articleData;

    setFormData({
      product_id: details.product_id ? String(details.product_id) : "",
      name: details.name ?? "",
      specifications: details.specifications ?? "",
      brand: details.brand ?? "",
      reference_price: details.reference_price ? String(details.reference_price) : "",
      status: details.deleted_at === null ? "1" : "0",
    });
  }, [articleData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { product_id, name } = formData;

    if (!product_id || !name.trim()) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const payload = {
      article_id: articleId,
      product_id: Number(formData.product_id),
      name: formData.name.trim(),
      specifications: formData.specifications.trim() || undefined,
      brand: formData.brand.trim() || undefined,
      reference_price: formData.reference_price ? Number(formData.reference_price) : undefined,
      deleted_at: formData.status === "1" ? false : true,
    };

    try {
      await updateArticle(payload).unwrap();
      onClose();
    } catch (err) {
      console.error("Échec de mise à jour de l'article:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier l'article</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations de l'article.
          </DialogDescription>
        </DialogHeader>

        {isFetchingDetails || !productsData?.data ? (
          <p className="text-sm text-muted-foreground">Chargement des détails...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Produit</Label>
              <Combobox
                options={productsData.data.map((prod) => ({
                  label: prod.name,
                  value: String(prod.product_id),
                }))}
                value={formData.product_id}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, product_id: value }))
                }
                placeholder="Sélectionner un produit"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specifications">Spécifications</Label>
              <Textarea
                id="specifications"
                name="specifications"
                value={formData.specifications}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Marque</Label>
              <Input
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference_price">Prix de référence</Label>
              <Input
                id="reference_price"
                name="reference_price"
                type="number"
                value={formData.reference_price}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value as "1" | "0" }))
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
              <Button type="button" variant="outline" onClick={onClose}>
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

export default EditArticleModal;
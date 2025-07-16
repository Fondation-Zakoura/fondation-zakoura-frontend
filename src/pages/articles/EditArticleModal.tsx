import React, { useState, useEffect } from "react";
import { useGetProductsQuery } from "@/features/api/products";
import { useShowArticleQuery, useUpdateArticleMutation } from "@/features/api/articles";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  articleId: number;
};

const EditArticleModal: React.FC<ModalProps> = ({ isOpen, onClose, articleId }) => {
  const { data: productsData } = useGetProductsQuery({ page: 1, perPage: 100 });
  const { data: articleData, isLoading: isFetching } = useShowArticleQuery(articleId);
  const [updateArticle, { isLoading: isSaving, isError }] = useUpdateArticleMutation();

  // Form state
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [specifications, setSpecifications] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [referencePrice, setReferencePrice] = useState<string>("");

  // Pre-fill form
  useEffect(() => {
    if (articleData) {
      const details = articleData.data || articleData;
      setSelectedProductId(String(details.product_id ?? ""));
      setName(details.name ?? "");
      setSpecifications(details.specifications ?? "");
      setBrand(details.brand ?? "");
      setReferencePrice(details.reference_price ?? "");
    }
  }, [articleData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('data',articleId, selectedProductId,name,specifications,brand,referencePrice)
    if (!selectedProductId) return;

    try {
      await updateArticle({
  id: String(articleId),
  product_id: Number(selectedProductId),
  name,
  specifications: specifications || undefined,
  brand: brand || undefined,
  reference_price: referencePrice ? parseFloat(referencePrice) : undefined,
}).unwrap();

      onClose();
    } catch (err) {
      console.error("Failed to update article:", err);
    }
  };

  const handleClose = () => {
    if (isSaving) return;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Modifier l'article</DialogTitle>
        </DialogHeader>

        {isFetching ? (
          <p className="text-center py-6">Chargement...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 ">
              {/* Produit */}
              <div className="grid grid-cols-4 ">
                <Label>Produit<span className="text-red-500">*</span></Label>
                <Combobox
                  options={productsData?.data?.filter(p => p.status === 1).map((prod) => ({
                    label: prod.name,
                    value: String(prod.product_id),
                  })) || []}
                  value={selectedProductId}
                  onChange={(v) => {
                    setSelectedProductId(v);
                  }}
                  placeholder="Sélectionner un produit"
                  className="col-span-3"
                />
              </div>

              {/* Nom */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="article-name" className="text-right">
                  Nom<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="article-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>

              {/* Spécifications */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="specifications" className="text-right">
                  Spécifications
                </Label>
                <Textarea
                  id="specifications"
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  className="col-span-3"
                  rows={3}
                />
              </div>

              {/* Marque */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="brand" className="text-right">
                  Marque
                </Label>
                <Input
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="col-span-3"
                />
              </div>

              {/* Prix de référence */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reference-price">
                  Prix de référence
                </Label>
                <Input
                  id="reference-price"
                  type="number"
                  value={referencePrice}
                  onChange={(e) => setReferencePrice(e.target.value)}
                  className="col-span-3"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
            {isError && (
              <p className="text-sm text-red-500 text-center mt-2">
                Une erreur est survenue. Veuillez réessayer.
              </p>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditArticleModal;

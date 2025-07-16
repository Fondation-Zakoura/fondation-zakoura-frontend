import React, { useState } from "react";
import {  useCreateArticleMutation } from "@/features/api/articles";
import { useGetProductsQuery } from "@/features/api/products";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

const AddArticleModal: React.FC<ModalProps> = ({ isOpen, onClose, title }) => {
  const { data: productsData } = useGetProductsQuery({ page: 1, perPage: 100 });
  const [addArticle, { isLoading, isError }] = useCreateArticleMutation();

  // Form state
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [specifications, setSpecifications] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [referencePrice, setReferencePrice] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) return;

    try {
      await addArticle({
        product_id: Number(selectedProductId),
        name,
        specifications,
        brand,
        reference_price: referencePrice ? parseFloat(referencePrice) : undefined,
      }).unwrap();

      // Reset fields and close modal
      setSelectedProductId("");
      setName("");
      setSpecifications("");
      setBrand("");
      setReferencePrice("");
      onClose();
    } catch (error) {
      console.error("Failed to add article:", error);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Produit */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product" className="text-right">
                Produit<span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="selectionner un produit">
                    {
                      productsData?.data?.find(
                        (p) => String(p.product_id) === selectedProductId
                      )?.name
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {productsData?.data
                    ?.filter((p) => p.status === 1)
                    .map((product) => (
                      <SelectItem
                        key={product.product_id}
                        value={String(product.product_id)}
                      >
                        {product.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="reference-price" className="">
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
          {isError && (
            <p className="text-sm text-red-500 text-center mt-2">
              Une erreur est survenue. Veuillez réessayer.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddArticleModal;

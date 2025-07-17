import  { useState, useEffect } from "react";
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
import { useGetProductTypeByIdQuery, useUpdateProductTypeMutation } from "../../features/api/product_types";
import InfoDialog from "@/components/ui/InfoDialog";


type EditProductTypeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productTypeId: number;
};

export default function EditProductTypeModal({ isOpen, onClose, productTypeId }: EditProductTypeModalProps) {
  const { data:productData, isLoading: isLoadingData } = useGetProductTypeByIdQuery(productTypeId, { skip: !productTypeId });
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [updateProductType, { isLoading: isUpdating }] = useUpdateProductTypeMutation();
   const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [infoDialogContent, setInfoDialogContent] = useState({ title: "", description: "" });

useEffect(() => {
  // productData.data is an array!

  const details = Array.isArray(productData?.data) ? productData.data[0] : productData?.data;
  if (details) {
    setName(details.name);
  }
}, [productData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Le nom est requis.");
      return;
    }
    try {
      await updateProductType({ product_type_id: productTypeId, name }).unwrap();
      onClose();
    } catch (err:any) {
        
      setError("Erreur lors de la mise à jour du type de produit.");
      console.error(err);
      if (err.status===409) {
        setInfoDialogContent({
          title: "Conflit de mise à jour",
          description: "Le type de produit que vous essayez de modifier a été mis à jour par un autre utilisateur. Veuillez recharger la page et réessayer.",
        });
        setInfoDialogOpen(true);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier le type de produit</DialogTitle>
          <DialogDescription>
            Mettez à jour le nom du type de produit ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1 font-medium">
              Nom
            </label>
            <Input
              id="name"
              placeholder="Nom du type de produit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoadingData || isUpdating}
              autoFocus
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoadingData || isUpdating}
              className="bg-[#18365A] hover:bg-cyan-900"
            >
              {isUpdating ? "Mise à jour en cours..." : "Mettre à jour"}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isLoadingData || isUpdating}>
              Annuler
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <InfoDialog
  isOpen={infoDialogOpen}
  onClose={() => setInfoDialogOpen(false)}
  title={infoDialogContent.title}
  description={infoDialogContent.description}
  duration={2500}
/>
    </Dialog>
  );
}

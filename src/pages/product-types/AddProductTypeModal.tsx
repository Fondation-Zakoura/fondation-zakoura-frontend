import  { useState } from "react";
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
import { useAddProductTypeMutation } from "../../features/api/product_types";

type AddProductTypeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AddProductTypeModal({ isOpen, onClose }: AddProductTypeModalProps) {
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [addProductType, { isLoading }] = useAddProductTypeMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   
    if (!name.trim()) {
      setErrorMessage("Le nom est requis.");
      return;
    }
    try {
      await addProductType({ name }).unwrap();
      setName("");
      onClose();
    } catch (err) {
    
      console.error(err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter un type de produit</DialogTitle>
          <DialogDescription>
            Remplissez le formulaire ci-dessous pour créer un nouveau type de produit.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1 font-medium">
              
              Nom   <span className="text-red-500 text-right">*</span>
            </label>
            <Input
              id="name"
              placeholder="Nom du type de produit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
            {errorMessage && <p className="text-sm text-red-600 mt-1">{errorMessage}</p>}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#18365A] hover:bg-cyan-900"
            >
              {isLoading ? "Ajout en cours..." : "Ajouter"}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

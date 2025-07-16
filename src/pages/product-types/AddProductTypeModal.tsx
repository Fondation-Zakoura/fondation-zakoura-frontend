import React, { useState } from "react";
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

export default function AddProductTypeModal({ isOpen, onClose }) {
  const [name, setName] = useState("");

  const [addProductType, { isLoading ,error}] = useAddProductTypeMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
   
    if (!name.trim()) {
      setError("Le nom est requis.");
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
            {error && <p className="text-sm text-red-600 mt-1">{error?.data?.message}</p>}
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

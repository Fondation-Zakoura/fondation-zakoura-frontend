import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, id?: number) => void;
  naturePartner?: { id?: number; name?: string };
  isLoading: boolean;
}

export const AddEditNaturePartnerModal: React.FC<Props> = ({
  isOpen, onClose, onSave, naturePartner, isLoading
}) => {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(naturePartner?.name || "");
  }, [naturePartner, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, naturePartner?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{naturePartner ? "Modifier" : "Ajouter"} une nature de partenaire</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Nom de la nature"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : <><Save size={16} className="mr-2" />Sauvegarder</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
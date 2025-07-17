import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, id?: number) => void;
  statusPartner?: { id?: number; name?: string };
  isLoading: boolean;
}

export const AddEditStatusPartnerModal: React.FC<Props> = ({
  isOpen, onClose, onSave, statusPartner, isLoading
}) => {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(statusPartner?.name || "");
  }, [statusPartner, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, statusPartner?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{statusPartner ? "Modifier" : "Ajouter"} un Phase de Partenaire</DialogTitle>
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
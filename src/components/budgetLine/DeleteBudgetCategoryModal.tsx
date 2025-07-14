import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteBudgetCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  loading: boolean;
}

export const DeleteBudgetCategoryModal: React.FC<DeleteBudgetCategoryModalProps> = ({
  open,
  onClose,
  onDelete,
  loading,
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogDescription>
          Êtes-vous sûr de vouloir supprimer cette rubrique budgétaire ? Cette action est irréversible.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button
          variant="destructive"
          disabled={loading}
          onClick={onDelete}
        >
          {loading ? <span className="loader mr-2"></span> : null} Supprimer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
); 
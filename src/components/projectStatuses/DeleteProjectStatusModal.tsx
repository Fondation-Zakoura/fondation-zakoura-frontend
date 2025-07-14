import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface DeleteProjectStatusModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  loading: boolean;
}

export const DeleteProjectStatusModal: React.FC<DeleteProjectStatusModalProps> = ({
  open,
  onClose,
  onDelete,
  loading,
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirmer la suppression</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        Êtes-vous sûr de vouloir supprimer ce statut de projet&nbsp;?
        <div className="mt-2 text-sm text-gray-500">
          Cette action est irréversible.
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Annuler
          </Button>
        </DialogClose>
        <Button
          type="button"
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={onDelete}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin w-4 h-4 mr-2 inline" />
          ) : null}
          {loading ? "Suppression..." : "Supprimer"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
); 
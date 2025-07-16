import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteSiteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  siteName?: string;
  isBulk?: boolean;
  isLoading?: boolean;
}

export const DeleteSiteDialog: React.FC<DeleteSiteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  siteName,
  isBulk,
  isLoading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isBulk
              ? `Supprimer ${siteName || "la sélection"}`
              : `Supprimer le site`}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 text-sm text-gray-700">
          {isBulk ? (
            <>
              Êtes-vous sûr de vouloir supprimer <strong>{siteName}</strong> ?
              <br />
              <span className="text-red-600 font-semibold">
                Cette action supprimera définitivement tous les sites sélectionnés.
              </span>
            </>
          ) : (
            <>
              Êtes-vous sûr de vouloir supprimer <strong>{siteName}</strong> ?
              <br />
              Cette action est irréversible.
            </>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ProjectStatus } from "@/features/types/project";

interface ShowProjectStatusModalProps {
  open: boolean;
  onClose: () => void;
  selected: ProjectStatus | null;
}

export const ShowProjectStatusModal: React.FC<ShowProjectStatusModalProps> = ({
  open,
  onClose,
  selected,
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Détail du statut de projet</DialogTitle>
      </DialogHeader>
      {selected && (
        <div className="space-y-4">
          <div>
            <span className="block text-xs text-gray-500">Nom</span>
            <span className="font-semibold text-gray-800 text-sm">
              {selected.name}
            </span>
          </div>
        </div>
      )}
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Fermer
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
); 
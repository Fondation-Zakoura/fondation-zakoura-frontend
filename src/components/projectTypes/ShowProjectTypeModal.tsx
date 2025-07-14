import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ProjectType } from "@/features/types/project";

interface ShowProjectTypeModalProps {
  open: boolean;
  onClose: () => void;
  selected: ProjectType | null;
}

export const ShowProjectTypeModal: React.FC<ShowProjectTypeModalProps> = ({
  open,
  onClose,
  selected,
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Détail du type de projet</DialogTitle>
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
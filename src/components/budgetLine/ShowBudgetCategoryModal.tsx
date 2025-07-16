import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ShowBudgetCategoryModalProps {
  open: boolean;
  onClose: () => void;
  selected: any;
}

export const ShowBudgetCategoryModal: React.FC<ShowBudgetCategoryModalProps> = ({
  open,
  onClose,
  selected,
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Détail de la rubrique budgétaire</DialogTitle>
      </DialogHeader>
      {selected && (
        <div className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="block text-xs text-gray-500">Code</span>
            <span className="font-semibold text-gray-800 text-sm">{selected.code}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Libellé</span>
            <span className="font-semibold text-gray-800 text-sm">{selected.label}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Type</span>
            <span className="font-semibold text-gray-800 text-sm">{selected.type}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Domaine budgétaire</span>
            <span className="font-semibold text-gray-800 text-sm">
              {Array.isArray(selected.budgetary_area)
                ? selected.budgetary_area.map((area: string, idx: number) => (
                    <span key={idx} className="inline-block bg-gray-100 rounded px-2 py-0.5 mr-1 mb-1">
                      {area}
                    </span>
                  ))
                : selected.budgetary_area}
            </span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Statut</span>
            <span className="font-semibold text-gray-800 text-sm">{selected.is_active ? 'Actif' : 'Inactif'}</span>
          </div>
        </div>
      )}
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="outline">Fermer</Button></DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
); 
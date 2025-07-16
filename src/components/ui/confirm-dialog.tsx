
    // src/components/ui/confirm-dialog.tsx
    import React from 'react';
    import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogFooter,
      DialogClose,
    } from "@/components/ui/dialog";
    import { Button } from "@/components/ui/button";
    import { Loader2 } from 'lucide-react';

    interface ConfirmDialogProps {
      isOpen: boolean;
      onClose: () => void;
      onConfirm: () => void;
      title: string;
      description: string;
      confirmText?: string;
      cancelText?: string;
      isConfirming?: boolean;
    }

    export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
      isOpen,
      onClose,
      onConfirm,
      title,
      description,
      confirmText = "Confirmer",
      cancelText = "Annuler",
      isConfirming = false,
    }) => {
      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-gray-700">
              <p>{description}</p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isConfirming} onClick={onClose}>
                  {cancelText}
                </Button>
              </DialogClose>
              <Button type="button" variant="destructive" onClick={onConfirm} disabled={isConfirming}>
                {isConfirming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {confirmText}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };
    
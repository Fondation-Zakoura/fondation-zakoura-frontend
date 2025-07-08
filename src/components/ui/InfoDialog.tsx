import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type InfoDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  duration?: number; // e.g., 3000 for 3 seconds
};

const InfoDialog: React.FC<InfoDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = "OK",
  duration,
}) => {
  // Auto-close effect
  React.useEffect(() => {
    if (isOpen && duration) {
      const timeout = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timeout); // Clean up if component unmounts or closes early
    }
  }, [isOpen, duration, onClose]);

  return (
    <Dialog open={isOpen}   onOpenChange={onClose} >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription className="mt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button onClick={onClose}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InfoDialog;

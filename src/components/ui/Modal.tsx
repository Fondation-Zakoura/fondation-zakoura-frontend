import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; // Make sure path is correct

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/**
 * A reusable modal component built with Shadcn UI's Dialog.
 * @param {boolean} isOpen - Controls whether the modal is open or closed.
 * @param {function} onClose - Function to call when the modal should close.
 * @param {string} title - The title displayed in the modal's header.
 * @param {string} [description] - An optional description displayed below the title.
 * @param {React.ReactNode} children - The main content/body of the modal (e.g., a form).
 * @param {React.ReactNode} [footer] - The content for the footer, usually action buttons.
 */
export function Modal({ isOpen, onClose, title, description, children, footer }: ModalProps) {
  // The `onOpenChange` handler syncs the dialog's state with your parent component's state.
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* This is where the main content, like your form, will go */}
        <div className="py-4">{children}</div>

        {/* The footer is optional and will only render if you pass content to it */}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface AddProjectStatusModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: { name: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error: string;
  loading: boolean;
}

export const AddProjectStatusModal: React.FC<AddProjectStatusModalProps> = ({
  open,
  onClose,
  onSubmit,
  form,
  onChange,
  error,
  loading,
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Ajouter un statut de projet</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          name="name"
          placeholder="Nom du statut"
          value={form.name}
          onChange={onChange}
          required
        />
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        <DialogFooter>
          <Button
            type="submit"
            className="text-white"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin w-4 h-4 mr-2 inline" />
            ) : null}
            {loading ? "Ajout..." : "Ajouter"}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
); 
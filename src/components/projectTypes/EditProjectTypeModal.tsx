import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface EditProjectTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: { name: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error: string;
  loading: boolean;
}

export const EditProjectTypeModal: React.FC<EditProjectTypeModalProps> = ({
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
        <DialogTitle>Modifier le type de projet</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          name="name"
          placeholder="Nom du type"
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
            className="bg-[#576CBC] hover:bg-[#19376D] text-white"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin w-4 h-4 mr-2 inline" />
            ) : null}
            {loading ? "Enregistrement..." : "Enregistrer"}
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
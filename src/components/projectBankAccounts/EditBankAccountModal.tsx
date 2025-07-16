import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditBankAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  filePreview: string | null;
  removeExistingFile: boolean;
  fieldErrors: { [key: string]: string };
  error: string;
  loading: boolean;
  moroccanBanks: string[];
  currencies: string[];
}

export const EditBankAccountModal: React.FC<EditBankAccountModalProps> = ({
  open,
  onClose,
  onSubmit,
  form,
  onFileChange,
  onRemoveFile,
  filePreview,
  removeExistingFile,
  fieldErrors,
  error,
  loading,
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Modifier le compte bancaire</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        </div>
        {/* File preview and remove logic */}
        {filePreview && typeof form.supporting_document !== "string" ? (
          <div className="relative flex items-center gap-2 mb-2">
            {typeof form.supporting_document !== "string" && "type" in form.supporting_document && form.supporting_document.type.startsWith("image/") ? (
              <img src={filePreview} alt="Preview" className="w-24 h-24 object-cover rounded border" />
            ) : (
              <span className="text-sm">{filePreview}</span>
            )}
            <button type="button" onClick={onRemoveFile} className="ml-2 text-red-500 hover:text-red-700" title="Supprimer">&#10005;</button>
          </div>
        ) : null}
        {!filePreview && typeof form.supporting_document === "string" && form.supporting_document && !removeExistingFile && (
          <div className="relative flex items-center gap-2 mb-2">
            {/* ...existing file preview logic as in ProjectBankAccountsPage... */}
            <a href={`${import.meta.env.VITE_STORAGE_URL}/${form.supporting_document}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mt-2 block">Voir le document</a>
            <button type="button" onClick={onRemoveFile} className="ml-2 text-red-500 hover:text-red-700" title="Supprimer">&#10005;</button>
          </div>
        )}
        {!filePreview && (!form.supporting_document || removeExistingFile) && (
          <>
            <span className="text-xs text-gray-500 mb-1">Aucun document. Veuillez en ajouter un :</span>
            <Input id="supporting_document" name="supporting_document" type="file" accept="application/pdf,image/*" onChange={onFileChange} />
          </>
        )}
        {fieldErrors.supporting_document && <span className="text-xs text-red-500">{fieldErrors.supporting_document}</span>}
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <DialogFooter>
          <Button type="submit" className="bg-[#576CBC] hover:bg-[#19376D] text-white" disabled={loading}>
            {loading ? <span className="loader mr-2"></span> : null} Enregistrer
          </Button>
          <DialogClose asChild><Button type="button" variant="outline">Annuler</Button></DialogClose>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
); 
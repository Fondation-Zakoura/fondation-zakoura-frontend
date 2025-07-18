import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import countriesData from "@/data/countries.json";
import { UploadCloud, XCircle, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface AddBankAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fieldErrors: { [key: string]: string };
  error: string;
  loading: boolean;
  moroccanBanks: string[];
  currencies: string[];
}

export const AddBankAccountModal: React.FC<AddBankAccountModalProps> = ({
  open,
  onClose,
  onSubmit,
  form,
  onChange,
  onTextareaChange,
  onFileChange,
  fieldErrors,
  error,
  loading,
  moroccanBanks,
  currencies,
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Ajouter un compte bancaire</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="rib_iban">RIB / IBAN <span className="text-red-500">*</span></Label>
            <Input id="rib_iban" name="rib_iban" placeholder="RIB / IBAN" value={form.rib_iban} onChange={onChange} required />
            {fieldErrors.rib_iban && <span className="text-xs text-red-500">{fieldErrors.rib_iban}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="agency">Agence <span className="text-red-500">*</span></Label>
            <Input id="agency" name="agency" placeholder="Agence" value={form.agency} onChange={onChange} required />
            {fieldErrors.agency && <span className="text-xs text-red-500">{fieldErrors.agency}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="bank">Banque <span className="text-red-500">*</span></Label>
            <Select value={form.bank} onValueChange={value => onChange({ target: { name: "bank", value } } as any)}>
              <SelectTrigger className="w-full" id="bank" name="bank">
                <SelectValue placeholder="Banque" />
              </SelectTrigger>
              <SelectContent>
                {moroccanBanks.map((bank) => (
                  <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.bank && <span className="text-xs text-red-500">{fieldErrors.bank}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="account_title">Intitulé du compte <span className="text-red-500">*</span></Label>
            <Input id="account_title" name="account_title" placeholder="Intitulé du compte" value={form.account_title} onChange={onChange} required />
            {fieldErrors.account_title && <span className="text-xs text-red-500">{fieldErrors.account_title}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="account_holder_name">Nom du titulaire <span className="text-red-500">*</span></Label>
            <Input id="account_holder_name" name="account_holder_name" placeholder="Nom du titulaire" value={form.account_holder_name} onChange={onChange} required />
            {fieldErrors.account_holder_name && <span className="text-xs text-red-500">{fieldErrors.account_holder_name}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="bic_swift">BIC / SWIFT</Label>
            <Input id="bic_swift" name="bic_swift" placeholder="BIC / SWIFT" value={form.bic_swift} onChange={onChange} />
            {fieldErrors.bic_swift && <span className="text-xs text-red-500">{fieldErrors.bic_swift}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="opening_date">Date d'ouverture</Label>
            <Popover>
              <PopoverTrigger asChild>
                <div className="relative w-full">
                  <Input
                    id="opening_date"
                    name="opening_date"
                    placeholder="jj/mm/aaaa"
                    value={form.opening_date ? dayjs(form.opening_date).format("DD/MM/YYYY") : ""}
                    readOnly
                    className="pr-10 cursor-pointer bg-white"
                  />
                  <CalendarIcon
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={20}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.opening_date ? dayjs(form.opening_date).toDate() : undefined}
                  onSelect={date => {
                    if (date) {
                      const iso = dayjs(date).format("YYYY-MM-DD");
                      onChange({ target: { name: "opening_date", value: iso } } as any);
                    }
                  }}
                  initialFocus
                  captionLayout="dropdown"
                  fromYear={1900}
                  toYear={new Date().getFullYear() + 5}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="opening_country">Pays d'ouverture <span className="text-red-500">*</span></Label>
            <Combobox
              options={countriesData.map((c: { code: string; name: string }) => ({ value: c.name, label: c.name }))}
              value={form.opening_country}
              onChange={value => onChange({ target: { name: "opening_country", value } } as any)}
              placeholder="Pays d'ouverture"
            />
            {fieldErrors.opening_country && <span className="text-xs text-red-500">{fieldErrors.opening_country}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="currency">Devise <span className="text-red-500">*</span></Label>
            <Select value={form.currency} onValueChange={value => onChange({ target: { name: "currency", value } } as any)}>
              <SelectTrigger className="w-full" id="currency" name="currency">
                <SelectValue placeholder="Devise" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.currency && <span className="text-xs text-red-500">{fieldErrors.currency}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
            <Select value={form.status} onValueChange={value => onChange({ target: { name: "status", value } } as any)}>
              <SelectTrigger className="w-full" id="status" name="status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="closed">Fermé</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.status && <span className="text-xs text-red-500">{fieldErrors.status}</span>}
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label htmlFor="supporting_document">Pièce justificative (Scan)</Label>
            <SupportingDocumentDropzone
              value={form.supporting_document}
              onFileChange={onFileChange}
              error={fieldErrors.supporting_document}
            />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label htmlFor="comments">Commentaires / Remarques</Label>
            <Textarea id="comments" name="comments" placeholder="Commentaires / Remarques" value={form.comments} onChange={onTextareaChange} className="w-full" />
          </div>
        </div>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <DialogFooter>
          <Button type="submit" className=" text-white" disabled={loading}>
            {loading ? <span className="loader mr-2"></span> : null} Ajouter
          </Button>
          <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);

interface SupportingDocumentDropzoneProps {
  value: File | string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const SupportingDocumentDropzone: React.FC<SupportingDocumentDropzoneProps> = ({ value, onFileChange, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  React.useEffect(() => {
    if (value && typeof value !== "string" && value.type.startsWith("image/")) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fileInputEvent = {
        target: {
          name: "supporting_document",
          files: e.dataTransfer.files,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onFileChange(fileInputEvent);
    }
  };
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    const emptyEvent = {
      target: {
        name: "supporting_document",
        files: null,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onFileChange(emptyEvent);
    setPreviewUrl(null);
  };
  return (
    <div>
      <input
        id="supporting_document"
        type="file"
        accept="application/pdf,image/*"
        onChange={onFileChange}
        className="hidden"
        ref={fileInputRef}
      />
      <div
        className={cn(
          "relative w-full h-32 border-2 rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary-foreground" : "border-gray-300 hover:border-primary"
        )}
        style={{ width: "100%" }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Document Preview"
              className="max-h-full max-w-full object-contain p-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="absolute top-1 right-1 text-red-500 hover:bg-red-100 rounded-full"
              title="Supprimer le fichier"
            >
              <XCircle size={20} />
            </Button>
          </>
        ) : value && typeof value !== "string" ? (
          <>
            {value.type === "application/pdf" ? (
              <>
                <UploadCloud size={32} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">{value.name}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  className="absolute top-1 right-1 text-red-500 hover:bg-red-100 rounded-full"
                  title="Supprimer le fichier"
                >
                  <XCircle size={20} />
                </Button>
              </>
            ) : null}
          </>
        ) : (
          <>
            <UploadCloud size={32} className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Sélectionnez ou déposez un fichier</p>
            <p className="text-xs text-gray-400">(PDF, PNG, JPEG, SVG - max 2MB)</p>
          </>
        )}
      </div>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}; 
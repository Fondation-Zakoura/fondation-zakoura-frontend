import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
            <Input id="opening_date" type="date" name="opening_date" placeholder="Date d'ouverture" value={form.opening_date} onChange={onChange} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="opening_country">Pays d'ouverture <span className="text-red-500">*</span></Label>
            <Input id="opening_country" type="text" name="opening_country" placeholder="Pays d'ouverture" value={form.opening_country} onChange={onChange} required />
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
          <div className="flex flex-col gap-1">
            <Label htmlFor="supporting_document">Pièce justificative (Scan)</Label>
            <Input id="supporting_document" name="supporting_document" type="file" accept="application/pdf,image/*" onChange={onFileChange} />
            {fieldErrors.supporting_document && <span className="text-xs text-red-500">{fieldErrors.supporting_document}</span>}
            {form.supporting_document && typeof form.supporting_document !== "string" && (form.supporting_document as File).name && (
              <span className="text-xs text-gray-600 mt-1">Fichier sélectionné : {(form.supporting_document as File).name}</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="comments">Commentaires / Remarques</Label>
            <Textarea id="comments" name="comments" placeholder="Commentaires / Remarques" value={form.comments} onChange={onTextareaChange} />
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
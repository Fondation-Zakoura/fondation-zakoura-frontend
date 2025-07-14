import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface AddBudgetCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: any) => void;
  fieldErrors: { [key: string]: string };
  error: string;
  loading: boolean;
  domaineBudgetaires: { value: string; label: string }[];
  typeOptions: { value: string; label: string }[];
  activeOptions: { value: string; label: string }[];
}

export const AddBudgetCategoryModal: React.FC<AddBudgetCategoryModalProps> = ({
  open,
  onClose,
  onSubmit,
  form,
  onChange,
  onSelectChange,
  fieldErrors,
  error,
  loading,
  domaineBudgetaires,
  typeOptions,
  activeOptions,
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Ajouter une rubrique budgétaire</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="code">Code <span className="text-red-500">*</span></Label>
            <Input id="code" name="code" placeholder="Code" value={form.code} onChange={onChange} required />
            {fieldErrors.code && <span className="text-xs text-red-500">{fieldErrors.code}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="label">Libellé <span className="text-red-500">*</span></Label>
            <Input id="label" name="label" placeholder="Libellé" value={form.label} onChange={onChange} required />
            {fieldErrors.label && <span className="text-xs text-red-500">{fieldErrors.label}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="type">Type <span className="text-red-500">*</span></Label>
            <Select value={form.type} onValueChange={val => onSelectChange('type', val)}>
              <SelectTrigger className="w-full" id="type" name="type">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.type && <span className="text-xs text-red-500">{fieldErrors.type}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="budgetary_area">Domaine budgétaire <span className="text-red-500">*</span></Label>
            <div className="relative">
              <div className="flex flex-wrap gap-1 mb-1">
                {form.budgetary_area.map((area: string) => (
                  <span key={area} className="flex items-center bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-xs mr-1 mb-1">
                    {area}
                    <button
                      type="button"
                      className="ml-1 text-blue-500 hover:text-red-500"
                      onClick={() => {
                        const newAreas = form.budgetary_area.filter((a: string) => a !== area);
                        onSelectChange('budgetary_area', newAreas);
                      }}
                      aria-label={`Retirer ${area}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="border rounded px-2 py-1 flex flex-wrap gap-2 bg-white">
                {domaineBudgetaires.filter(opt => !form.budgetary_area.includes(opt.value)).length === 0 ? (
                  <span className="text-gray-400 text-xs">Tous les domaines sont sélectionnés</span>
                ) : (
                  domaineBudgetaires.filter(opt => !form.budgetary_area.includes(opt.value)).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className="bg-gray-100 hover:bg-blue-100 text-gray-700 rounded px-2 py-0.5 text-xs"
                      onClick={() => onSelectChange('budgetary_area', [...form.budgetary_area, opt.value])}
                    >
                      {opt.label}
                    </button>
                  ))
                )}
              </div>
            </div>
            {fieldErrors.budgetary_area && <span className="text-xs text-red-500">{fieldErrors.budgetary_area}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="is_active">Statut <span className="text-red-500">*</span></Label>
            <Select value={form.is_active ? 'true' : 'false'} onValueChange={val => onSelectChange('is_active', val)}>
              <SelectTrigger className="w-full" id="is_active" name="is_active">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                {activeOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
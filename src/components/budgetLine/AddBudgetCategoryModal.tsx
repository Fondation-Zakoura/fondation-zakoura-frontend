import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import ReactSelect from "react-select";

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
            <Label htmlFor="budgetary_area">
              Domaine budgétaire <span className="text-red-500">*</span>
            </Label>
            <ReactSelect
              id="budgetary_area"
              isMulti
              options={domaineBudgetaires}
              value={domaineBudgetaires.filter(opt => form.budgetary_area.includes(opt.value))}
              onChange={(selected: import('react-select').MultiValue<{ value: string; label: string }>) =>
                onSelectChange('budgetary_area', selected.map(opt => opt.value))
              }
              classNamePrefix="react-select"
              placeholder="Sélectionner un ou plusieurs domaines"
            />
            {fieldErrors.budgetary_area && (
              <span className="text-xs text-red-500">{fieldErrors.budgetary_area}</span>
            )}
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
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '../ui/input';
import { useUpdateBudgetLineMutation, useGetBudgetLineOptionsQuery } from '@/features/api/budgetLineApi';
import { Button } from '../ui/button';
import { Select, SelectValue, SelectItem, SelectTrigger, SelectContent } from '../ui/select';
import { Trash2 } from 'lucide-react';
import type { BudgetLine } from '@/features/types/budgetLine';

interface Props {
  onClose: () => void;
  refetch: () => void;
  budgetLine: BudgetLine;
}

function EditBudgetLineModal({ onClose, refetch, budgetLine }: Props) {
  // All hooks at the top
  const [form, setForm] = useState({ 
    total_amount: '',
    project_id: '',
    budget_category_id: '',
    partners: [
      {
        id: '',
        allocated_amount: '',
      }
    ]
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [updateBudgetLine] = useUpdateBudgetLineMutation();
  const [updateLoading, setUpdateLoading] = useState(false);
  const { data: options, isLoading } = useGetBudgetLineOptionsQuery();

  // Extract data from options object
  const budgetCategoriesData = options?.budgetCategories || [];
  const partnersData = options?.partners || [];
  const projectsData = options?.projects || [];

  // Initialize form with budget line data
  useEffect(() => {
    if (budgetLine) {
    
      setForm({
        total_amount: budgetLine.total_amount?.toString() || '',
        project_id: budgetLine.project_id?.toString() || '',
        budget_category_id: budgetLine.budget_category_id?.toString() || '',
        partners: budgetLine.partners?.length > 0 
          ? budgetLine.partners.map(partner => {
              // Access partner data from pivot table (Laravel relationship)
              const partnerId = partner.id?.toString() || '';
              const allocatedAmount = (partner as any).pivot?.allocated_amount?.toString() || '';
              return {
                id: partnerId,
                allocated_amount: allocatedAmount
              };
            })
          : [{ id: '', allocated_amount: '' }]
      });
    }
  }, [budgetLine]);

  // Real-time validation function
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'total_amount':
        if (!value) {
          newErrors[name] = 'Le montant total est requis';
        } else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
          newErrors[name] = 'Le montant total doit être un nombre positif';
        } else {
          delete newErrors[name];
        }
        break;
      case 'project_id':
        if (!value) {
          newErrors[name] = 'Le projet est requis';
        } else {
          delete newErrors[name];
        }
        break;
      case 'budget_category_id':
        if (!value) {
          newErrors[name] = 'La catégorie budgétaire est requise';
        } else {
          delete newErrors[name];
        }
        break;
    }
    
    setErrors(newErrors);
  };

  // Validate partner field
  const validatePartner = (index: number, field: string, value: string) => {
    const newErrors = { ...errors };
    const errorKey = `partner_${index}_${field}`;
    
    if (field === 'id') {
      if (!value) {
        newErrors[errorKey] = 'Le partenaire est requis';
      } else {
        delete newErrors[errorKey];
      }
    } else if (field === 'allocated_amount') {
      if (!value) {
        newErrors[errorKey] = 'Le montant alloué est requis';
      } else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
        newErrors[errorKey] = 'Le montant alloué doit être un nombre positif';
      } else {
        delete newErrors[errorKey];
      }
    }
    
    setErrors(newErrors);
  };

  // Update total_amount and consumed_amount handlers to recalculate remaining_amount
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newForm = { ...form, [name]: value };
    setForm(newForm);
    validateField(name, value);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    
    try {
      // Validate form data
      if (!form.total_amount || !form.project_id || !form.budget_category_id) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }
      
      // Validate partners
      const validPartners = form.partners.filter(partner => 
        partner.id && partner.allocated_amount && 
        partner.allocated_amount.trim() !== ''
      );
      
      if (validPartners.length === 0) {
        throw new Error('Veuillez ajouter au moins un partenaire avec un montant alloué');
      }
      
      // Prepare the data to send
      const totalAmount = parseFloat(form.total_amount);
      const budgetLineData = {
        total_amount: totalAmount,
        consumed_amount: totalAmount,
        remaining_amount: totalAmount,
        project_id: parseInt(form.project_id),
        budget_category_id: parseInt(form.budget_category_id),
        status: 'active',
        partners: validPartners.map(partner => ({
          id: parseInt(partner.id),
          allocated_amount: parseFloat(partner.allocated_amount)
        }))
      };
      
      // Log the JSON object as a formatted string
      
      await updateBudgetLine({ id: budgetLine.id, body: budgetLineData }).unwrap();
      onClose();
      refetch();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Une erreur est survenue lors de la modification");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Only after all hooks:
  if (isLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la ligne budgétaire</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12 text-lg text-gray-500">
            Chargement des données...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier la ligne budgétaire</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="total_amount">
                Montant Total <span className="text-red-500">*</span>
              </Label>
              <Input
                id="total_amount"
                name="total_amount"
                placeholder="Le Montant Total"
                value={form.total_amount}
                onChange={handleAmountChange}
                className={errors.total_amount ? 'border-red-500' : ''}
                required
              />
              {errors.total_amount && (
                <span className="text-red-500 text-sm">{errors.total_amount}</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="project_id">
                Le Projet Concerné <span className="text-red-500">*</span>
              </Label>
              <Select value={form.project_id} onValueChange={(e) => {
                setForm({ ...form, project_id: e });
                validateField('project_id', e);
              }}>
                <SelectTrigger className={`w-full ${errors.project_id ? 'border-red-500' : ''}`} id='project_id' name='project_id'>
                  <SelectValue placeholder="Le Projet Concerné" />
                </SelectTrigger>
                <SelectContent>
                  {projectsData.map((project: any) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.project_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.project_id && (
                <span className="text-red-500 text-sm">{errors.project_id}</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="budget_category_id">
                Catégorie Budgétaire <span className="text-red-500">*</span>
              </Label>
              <Select value={form.budget_category_id} onValueChange={(e) => {
                setForm({ ...form, budget_category_id: e });
                validateField('budget_category_id', e);
              }}>
                <SelectTrigger className={`w-full ${errors.budget_category_id ? 'border-red-500' : ''}`} id='budget_category_id' name='budget_category_id'>
                  <SelectValue placeholder="Catégorie Budgétaire" />
                </SelectTrigger>
                <SelectContent>
                  {budgetCategoriesData.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.budget_category_id && (
                <span className="text-red-500 text-sm">{errors.budget_category_id}</span>
              )}
            </div>
          </div>
          
          {/* Partners Section */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Partenaires</Label>
            {form.partners.map((partner, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border rounded-lg relative">
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`partner-${index}`}>
                    Partenaire <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={partner.id} 
                    onValueChange={(e) => {
                      const updatedPartners = [...form.partners];
                      updatedPartners[index].id = e;
                      setForm({ ...form, partners: updatedPartners });
                      validatePartner(index, 'id', e);
                    }}
                  >
                    <SelectTrigger className={`w-full ${errors[`partner_${index}_id`] ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Sélectionner un partenaire" />
                    </SelectTrigger>
                    <SelectContent>
                      {partnersData.map((partnerItem: any) => (
                        <SelectItem key={partnerItem.id} value={partnerItem.id.toString()}>
                          {partnerItem.partner_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`partner_${index}_id`] && (
                    <span className="text-red-500 text-sm">{errors[`partner_${index}_id`]}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`allocated-${index}`}>
                    Montant Alloué <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`allocated-${index}`}
                    placeholder="Montant alloué"
                    value={partner.allocated_amount}
                    onChange={(e) => {
                      const updatedPartners = [...form.partners];
                      updatedPartners[index].allocated_amount = e.target.value;
                      setForm({ ...form, partners: updatedPartners });
                      validatePartner(index, 'allocated_amount', e.target.value);
                    }}
                    className={errors[`partner_${index}_allocated_amount`] ? 'border-red-500' : ''}
                    required
                  />
                  {errors[`partner_${index}_allocated_amount`] && (
                    <span className="text-red-500 text-sm">{errors[`partner_${index}_allocated_amount`]}</span>
                  )}
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const updatedPartners = form.partners.filter((_, i) => i !== index);
                      setForm({ ...form, partners: updatedPartners });
                    }}
                    className="h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={form.partners.length === 1}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm({
                  ...form,
                  partners: [...form.partners, { id: '', allocated_amount: '' }]
                });
              }}
              className="w-full"
            >
              + Ajouter un partenaire
            </Button>
          </div>
          
          <DialogFooter>
            <Button type="submit" className="text-white" disabled={updateLoading}>
              {updateLoading && <span className="loader mr-2"></span>} Modifier
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditBudgetLineModal; 
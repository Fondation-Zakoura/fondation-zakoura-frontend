import React, { useState, useMemo } from 'react';
import {
  useGetBudgetCategoriesQuery,
  useAddBudgetCategoryMutation,
  useUpdateBudgetCategoryMutation,
  useDeleteBudgetCategoryMutation,
  useBulkDeleteBudgetCategoriesMutation,
} from '@/features/api/budgetCategoryApi';
import type { BudgetCategory } from '@/features/types/budgetCategory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pen, Eye, Trash, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { PageHeaderLayout } from '@/layouts/MainLayout';
import type { Column, ColumnFilter } from '@/components/ui/data-table';
import { DataTable } from '@/components/ui/data-table';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

const TYPE_OPTIONS = [
  { value: 'Fonctionnement', label: 'Fonctionnement' },
  { value: 'Investissement', label: 'Investissement' },
];
const ACTIVE_OPTIONS = [
  { value: 'true', label: 'Actif' },
  { value: 'false', label: 'Inactif' },
];

const emptyCategory: BudgetCategory = {
  code: '',
  label: '',
  type: '',
  budgetary_area: [], // doit être un tableau vide
  is_active: true,
};

type FormType = typeof emptyCategory;

const BudgetCategoryPage: React.FC = () => {
  const { data: apiData, isLoading, refetch } = useGetBudgetCategoriesQuery();
  const categories: (BudgetCategory & { id?: number })[] = Array.isArray(apiData) ? apiData : apiData?.data || [];
  const [addCategory] = useAddBudgetCategoryMutation();
  const [updateCategory] = useUpdateBudgetCategoryMutation();
  const [deleteCategory] = useDeleteBudgetCategoryMutation();
  const [bulkDeleteCategories] = useBulkDeleteBudgetCategoriesMutation();

  const [modal, setModal] = useState<'add' | 'edit' | 'show' | null>(null);
  const [selected, setSelected] = useState<BudgetCategory & { id?: number } | null>(null);
  const [form, setForm] = useState<FormType>({ ...emptyCategory });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<BudgetCategory & { id?: number } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [pendingBulkDeleteIds, setPendingBulkDeleteIds] = useState<number[]>([]);
  const [dataTableKey, setDataTableKey] = useState(0);

  const openAdd = () => {
    setForm(emptyCategory);
    setModal('add');
  };
  const openEdit = (category: BudgetCategory & { id?: number }) => {
    setForm({
      ...category,
      budgetary_area: typeof category.budgetary_area === 'string'
        ? category.budgetary_area.split(',').map(s => s.trim()).filter(Boolean)
        : Array.isArray(category.budgetary_area)
          ? category.budgetary_area
          : [],
    });
    setSelected(category);
    setModal('edit');
  };
  const openShow = (category: BudgetCategory & { id?: number }) => {
    setSelected({
      ...category,
      budgetary_area: typeof category.budgetary_area === 'string'
        ? category.budgetary_area.split(',').map(s => s.trim()).filter(Boolean)
        : Array.isArray(category.budgetary_area)
          ? category.budgetary_area
          : [],
    });
    setModal('show');
  };
  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm(emptyCategory);
    setError('');
    setFieldErrors({});
  };

  function validateForm(form: FormType) {
    const errors: { [key: string]: string } = {};
    if (!form.code.trim()) errors.code = 'Code requis';
    if (!form.label.trim()) errors.label = 'Libellé requis';
    if (!form.type) errors.type = 'Type requis';
    if (!form.budgetary_area || form.budgetary_area.length === 0) errors.budgetary_area = 'Domaine budgétaire requis';
    return errors;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors(validateForm({ ...form, [e.target.name]: e.target.value }));
  };
  const handleSelectChange = (name: keyof FormType, value: any) => {
    if (name === 'is_active') {
      setForm({ ...form, [name]: value === 'true' });
      setFieldErrors(validateForm({ ...form, [name]: value === 'true' }));
    } else if (name === 'budgetary_area') {
      setForm({ ...form, budgetary_area: value });
      setFieldErrors(validateForm({ ...form, budgetary_area: value }));
    } else {
      setForm({ ...form, [name]: value });
      setFieldErrors(validateForm({ ...form, [name]: value }));
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAddLoading(true);
    const errors = validateForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setAddLoading(false);
      return;
    }
    try {
      const payload = {
        ...form,
        budgetary_area: form.budgetary_area.join(','),
      };
      await addCategory(payload).unwrap();
      closeModal();
      refetch();
    } catch (err: any) {
      setError(err.data?.message || 'Erreur lors de la création');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEditLoading(true);
    const errors = validateForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0 || !selected?.id) {
      setEditLoading(false);
      return;
    }
    try {
      const payload = {
        ...form,
        budgetary_area: form.budgetary_area.join(','),
      };
      await updateCategory({ id: selected.id, body: payload }).unwrap();
      closeModal();
      refetch();
    } catch (err: any) {
      setError(err.data?.message || 'Erreur lors de la modification');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (category: BudgetCategory & { id?: number }) => {
    setDeleteLoading(true);
    try {
      await deleteCategory(category.id!).unwrap();
      refetch();
    } catch (err: any) {
      alert(err.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleteLoading(true);
    try {
      await bulkDeleteCategories(selectedRows).unwrap();
      setSelectedRows([]);
      refetch();
    } catch (err: any) {
      alert(err.data?.message || 'Erreur lors de la suppression multiple');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  // Instead of calling handleBulkDelete directly, show confirmation modal
  const handleBulkDeleteRequest = (ids: string[]) => {
    const numIds = ids.map(id => Number(id)).filter(Boolean);
    setPendingBulkDeleteIds(numIds);
    setBulkDeleteConfirmOpen(true);
  };
  const confirmBulkDelete = async () => {
    setBulkDeleteLoading(true);
    try {
      await bulkDeleteCategories(pendingBulkDeleteIds).unwrap();
      setPendingBulkDeleteIds([]);
      setBulkDeleteConfirmOpen(false);
      setDataTableKey((k) => k + 1); // force DataTable to reset selection
      refetch();
    } catch (err: any) {
      alert(err.data?.message || 'Erreur lors de la suppression multiple');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const columnFilters = useMemo((): ColumnFilter<BudgetCategory & { id?: number }>[] => {
    const uniqueTypes = Array.from(new Set(categories.map((c) => c.type)));
    // Aplatir tous les domaines budgétaires pour obtenir la liste unique
    const allAreas = categories.flatMap((c) => Array.isArray(c.budgetary_area) ? c.budgetary_area : [c.budgetary_area]);
    const uniqueAreas = Array.from(new Set(allAreas)).filter((a): a is string => typeof a === 'string' && a.length > 0);
    return [
      {
        id: 'type',
        label: 'Type',
        options: uniqueTypes.map((type) => ({ value: type, label: type })),
      },
      {
        id: 'budgetary_area',
        label: 'Domaine budgétaire',
        options: uniqueAreas.map((area) => ({ value: area, label: area })),
      },
      {
        id: 'is_active',
        label: 'Statut',
        options: [
          { value: 'true', label: 'Actif' },
          { value: 'false', label: 'Inactif' },
        ],
      },
    ];
  }, [categories]);

  const columns: Column<BudgetCategory & { id?: number }>[] = [
    { key: 'code', header: 'Code', sortable: true },
    { key: 'label', header: 'Libellé', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    {
      key: 'budgetary_area',
      header: 'Domaine budgétaire',
      sortable: true,
      render: (row) => (
        <span>
          {Array.isArray(row.budgetary_area)
            ? row.budgetary_area.join(', ')
            : row.budgetary_area}
        </span>
      ),
    },
    {
      key: 'is_active',
      header: 'Statut',
      render: (row) => (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow ${row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.is_active ? 'Actif' : 'Inactif'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => openShow(row)} className="p-2 rounded hover:bg-gray-200 text-gray-600" title="Voir"><Eye size={16} /></button>
          <button onClick={() => openEdit(row)} className="p-2 rounded hover:bg-blue-100 text-blue-600" title="Éditer"><Pen size={16} /></button>
          <button
            onClick={() => {
              setCategoryToDelete(row);
              setConfirmDeleteOpen(true);
            }}
            className="p-2 rounded hover:bg-red-100 text-red-600"
            title="Supprimer"
          >
            <Trash size={16} />
          </button>
        </div>
      ),
      sortable: false,
    },
  ];

  const DOMAINE_BUDGETAIRES = [
    { value: 'RH', label: 'RH' },
    { value: 'IT', label: 'IT' },
    { value: 'Logistique', label: 'Logistique' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Opérations', label: 'Opérations' },
    { value: 'Général', label: 'Général' },
    { value: 'Projet', label: 'Projet' },
  ];

  // S'assurer que lors du mapping des catégories, budgetary_area est toujours un tableau
  const tableCategories = useMemo(() =>
    categories.map((cat) => ({
      ...cat,
      id: String(cat.id ?? cat.code),
      budgetary_area: typeof cat.budgetary_area === 'string'
        ? cat.budgetary_area.split(',').map(s => s.trim()).filter(Boolean)
        : Array.isArray(cat.budgetary_area)
          ? cat.budgetary_area
          : [],
    })),
  [categories]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Rubriques budgétaires"
          breadcrumbs={[
            { label: 'Paramètres' },
            { label: 'Finance', url: '/projets/finance/ressources' },
            { label: 'Rubriques budgétaires', active: true },
          ]}
        />
        <Button onClick={openAdd} className="ml-auto flex items-center gap-2 bg-[#19376D] hover:bg-[#19386df9] text-white font-bold px-6 py-2 cursor-pointer rounded-lg shadow" disabled={addLoading}>
          <Plus className="w-4 h-4" /> {addLoading ? <span className="loader mr-2"></span> : null} Ajouter
        </Button>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        {isLoading ? (
          <div>Chargement...</div>
        ) : (
          <DataTable
            key={dataTableKey}
            columns={columns as Column<any>[]}
            data={tableCategories}
            hoverEffect
            emptyText={isLoading ? 'Chargement des données...' : 'Aucune rubrique trouvée'}
            headerStyle={'primary'}
            striped
            initialPageSize={10}
            columnFilters={columnFilters as ColumnFilter<any>[]}
            enableBulkDelete={true}
            onBulkDelete={handleBulkDeleteRequest}
          />
        )}
      </div>
      {/* Add Modal */}
      <Dialog open={modal === 'add'} onOpenChange={closeModal}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter une rubrique budgétaire</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="code">Code <span className="text-red-500">*</span></Label>
                <Input id="code" name="code" placeholder="Code" value={form.code} onChange={handleChange} required />
                {fieldErrors.code && <span className="text-xs text-red-500">{fieldErrors.code}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="label">Libellé <span className="text-red-500">*</span></Label>
                <Input id="label" name="label" placeholder="Libellé" value={form.label} onChange={handleChange} required />
                {fieldErrors.label && <span className="text-xs text-red-500">{fieldErrors.label}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="type">Type <span className="text-red-500">*</span></Label>
                <Select value={form.type} onValueChange={val => handleSelectChange('type', val)}>
                  <SelectTrigger className="w-full" id="type" name="type">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map(opt => (
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
                    {form.budgetary_area.map((area) => (
                      <span key={area} className="flex items-center bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-xs mr-1 mb-1">
                        {area}
                        <button
                          type="button"
                          className="ml-1 text-blue-500 hover:text-red-500"
                          onClick={() => {
                            const newAreas = form.budgetary_area.filter((a) => a !== area);
                            handleSelectChange('budgetary_area', newAreas);
                          }}
                          aria-label={`Retirer ${area}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="border rounded px-2 py-1 flex flex-wrap gap-2 bg-white">
                    {DOMAINE_BUDGETAIRES.filter(opt => !form.budgetary_area.includes(opt.value)).length === 0 ? (
                      <span className="text-gray-400 text-xs">Tous les domaines sont sélectionnés</span>
                    ) : (
                      DOMAINE_BUDGETAIRES.filter(opt => !form.budgetary_area.includes(opt.value)).map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          className="bg-gray-100 hover:bg-blue-100 text-gray-700 rounded px-2 py-0.5 text-xs"
                          onClick={() => handleSelectChange('budgetary_area', [...form.budgetary_area, opt.value])}
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
                <Select value={form.is_active ? 'true' : 'false'} onValueChange={val => handleSelectChange('is_active', val)}>
                  <SelectTrigger className="w-full" id="is_active" name="is_active">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <DialogFooter>
              <Button type="submit" className=" text-white" disabled={addLoading}>
                {addLoading ? <span className="loader mr-2"></span> : null} Ajouter
              </Button>
              <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Edit Modal */}
      <Dialog open={modal === 'edit'} onOpenChange={closeModal}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la rubrique budgétaire</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="code">Code <span className="text-red-500">*</span></Label>
                <Input id="code" name="code" placeholder="Code" value={form.code} onChange={handleChange} required />
                {fieldErrors.code && <span className="text-xs text-red-500">{fieldErrors.code}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="label">Libellé <span className="text-red-500">*</span></Label>
                <Input id="label" name="label" placeholder="Libellé" value={form.label} onChange={handleChange} required />
                {fieldErrors.label && <span className="text-xs text-red-500">{fieldErrors.label}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="type">Type <span className="text-red-500">*</span></Label>
                <Select value={form.type} onValueChange={val => handleSelectChange('type', val)}>
                  <SelectTrigger className="w-full" id="type" name="type">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map(opt => (
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
                    {form.budgetary_area.map((area) => (
                      <span key={area} className="flex items-center bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-xs mr-1 mb-1">
                        {area}
                        <button
                          type="button"
                          className="ml-1 text-blue-500 hover:text-red-500"
                          onClick={() => {
                            const newAreas = form.budgetary_area.filter((a) => a !== area);
                            handleSelectChange('budgetary_area', newAreas);
                          }}
                          aria-label={`Retirer ${area}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="border rounded px-2 py-1 flex flex-wrap gap-2 bg-white">
                    {DOMAINE_BUDGETAIRES.filter(opt => !form.budgetary_area.includes(opt.value)).length === 0 ? (
                      <span className="text-gray-400 text-xs">Tous les domaines sont sélectionnés</span>
                    ) : (
                      DOMAINE_BUDGETAIRES.filter(opt => !form.budgetary_area.includes(opt.value)).map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          className="bg-gray-100 hover:bg-blue-100 text-gray-700 rounded px-2 py-0.5 text-xs"
                          onClick={() => handleSelectChange('budgetary_area', [...form.budgetary_area, opt.value])}
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
                <Select value={form.is_active ? 'true' : 'false'} onValueChange={val => handleSelectChange('is_active', val)}>
                  <SelectTrigger className="w-full" id="is_active" name="is_active">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <DialogFooter>
              <Button type="submit" className="bg-[#576CBC] hover:bg-[#19376D] text-white" disabled={editLoading}>
                {editLoading ? <span className="loader mr-2"></span> : null} Enregistrer
              </Button>
              <DialogClose asChild><Button type="button" variant="outline">Annuler</Button></DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Show Modal */}
      <Dialog open={modal === 'show'} onOpenChange={closeModal}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détail de la rubrique budgétaire</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs text-gray-500">Code</span>
                <span className="font-semibold text-gray-800 text-sm">{selected.code}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">Libellé</span>
                <span className="font-semibold text-gray-800 text-sm">{selected.label}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">Type</span>
                <span className="font-semibold text-gray-800 text-sm">{selected.type}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">Domaine budgétaire</span>
                <span className="font-semibold text-gray-800 text-sm">
                  {Array.isArray(selected.budgetary_area)
                    ? selected.budgetary_area.map((area, idx) => (
                        <span key={area} className="inline-block bg-gray-100 rounded px-2 py-0.5 mr-1 mb-1">
                          {area}
                        </span>
                      ))
                    : selected.budgetary_area}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">Statut</span>
                <span className="font-semibold text-gray-800 text-sm">{selected.is_active ? 'Actif' : 'Inactif'}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Fermer</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Modal */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette rubrique budgétaire ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={deleteLoading}
              onClick={async () => {
                if (categoryToDelete) {
                  await handleDelete(categoryToDelete);
                  setConfirmDeleteOpen(false);
                  setCategoryToDelete(null);
                }
              }}
            >
              {deleteLoading ? <span className="loader mr-2"></span> : null} Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Bulk Delete Confirmation Modal */}
      <Dialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression multiple</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer les rubriques budgétaires sélectionnées ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteConfirmOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={bulkDeleteLoading}
              onClick={confirmBulkDelete}
            >
              {bulkDeleteLoading ? <span className="loader mr-2"></span> : null} Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Bulk Delete Loader */}
      {bulkDeleteLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow text-center">Suppression en cours...</div>
        </div>
      )}
      <style>{`
.loader {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  display: inline-block;
  vertical-align: middle;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`}</style>
    </div>
  );
};

export default BudgetCategoryPage;
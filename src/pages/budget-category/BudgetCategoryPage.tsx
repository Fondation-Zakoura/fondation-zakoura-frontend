import React, { useState, useMemo } from 'react';
import {
  useGetBudgetCategoriesQuery,
  useAddBudgetCategoryMutation,
  useUpdateBudgetCategoryMutation,
  useDeleteBudgetCategoryMutation,
  useBulkDeleteBudgetCategoriesMutation,
  useRestoreBudgetCategoryMutation,
} from '@/features/api/budgetCategoryApi';
import type { BudgetCategory } from '@/features/types/budgetCategory';
import { Button } from '@/components/ui/button';
import { Plus, Pen, Trash, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { PageHeaderLayout } from '@/layouts/MainLayout';
import type { Column, ColumnFilter } from '@/components/ui/data-table';
import { NewDataTable } from '@/components/ui/new-data-table';

import { AddBudgetCategoryModal } from "@/components/budgetLine/AddBudgetCategoryModal";
import { EditBudgetCategoryModal } from "@/components/budgetLine/EditBudgetCategoryModal";
import { ShowBudgetCategoryModal } from "@/components/budgetLine/ShowBudgetCategoryModal";
import { DeleteBudgetCategoryModal } from "@/components/budgetLine/DeleteBudgetCategoryModal";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TYPE_OPTIONS = [
  { value: 'Fonctionnement', label: 'Fonctionnement' },
  { value: 'Investissement', label: 'Investissement' },
];
const ACTIVE_OPTIONS = [
  { value: 'true', label: 'Actif' },
  { value: 'false', label: 'Inactif' },
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

const emptyCategory: BudgetCategory = {
  code: '',
  label: '',
  type: '',
  budgetary_area: [],
  is_active: true,
  created_at: '',
  deleted_at: '',
  updated_at: '',
};

type FormType = typeof emptyCategory;

const BudgetCategoryPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<Record<string, string | string[]>>({ is_active: 'true' });
  const [search, setSearch] = useState('');
  const { data: apiData, isLoading, refetch } = useGetBudgetCategoriesQuery({
    page,
    perPage: pageSize,
    ...filters,
    code: search || undefined,
  });
  

  const pagination = apiData || {};
  const categories: (BudgetCategory & { id?: number })[] = pagination.data || [];
  const total = pagination.total || 0;
  const currentPage = pagination.current_page || page;
  

  const [addCategory] = useAddBudgetCategoryMutation();
  const [updateCategory] = useUpdateBudgetCategoryMutation();
  const [deleteCategory] = useDeleteBudgetCategoryMutation();
  const [bulkDeleteCategories] = useBulkDeleteBudgetCategoriesMutation();
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [restoreBudgetCategory, { isLoading: isRestoring }] = useRestoreBudgetCategoryMutation();
  console.log(apiData)
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
        ? (category.budgetary_area as string).split(',').map((s: string) => s.trim()).filter(Boolean)
        : Array.isArray(category.budgetary_area)
          ? category.budgetary_area
          : [],
    });
    setSelected(category);
    setModal('edit');
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
  const handleSelectChange = (name: string, value: any) => {
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
    const payload = {
      ...form,
      budgetary_area: form.budgetary_area.join(','),
    };
    addCategory(payload)
      .unwrap()
      .then(() => {
        toast.success('Rubrique budgétaire créée avec succès !');
        closeModal();
        refetch();
      })
      .catch((err: any) => {
        setError(err.data?.message || 'Erreur lors de la création');
        toast.error(err.data?.message || 'Erreur lors de la création');
      })
      .finally(() => {
        setAddLoading(false);
      });
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
    const payload = {
      ...form,
      budgetary_area: form.budgetary_area.join(','),
    };
    updateCategory({ id: selected.id, body: payload })
      .unwrap()
      .then(() => {
        toast.success('Rubrique budgétaire modifiée avec succès !');
        closeModal();
        refetch();
      })
      .catch((err: any) => {
        setError(err.data?.message || 'Erreur lors de la modification');
        toast.error(err.data?.message || 'Erreur lors de la modification');
      })
      .finally(() => {
        setEditLoading(false);
      });
  };

  const handleDelete = async (category: BudgetCategory & { id?: number }) => {
    setDeleteLoading(true);
    deleteCategory(category.id!)
      .unwrap()
      .then(() => {
        toast.success('Rubrique budgétaire supprimée avec succès !');
        refetch();
      })
      .catch((err: any) => {
        toast.error(err.data?.message || 'Erreur lors de la suppression');
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };

  

  // Instead of calling handleBulkDelete directly, show confirmation modal
  const handleBulkDeleteRequest = (selectedIds: (string | number)[]) => {
    const numIds = selectedIds.map(id => Number(id)).filter(Boolean);
    setPendingBulkDeleteIds(numIds);
    setBulkDeleteConfirmOpen(true);
  };
  const confirmBulkDelete = async () => {
    setBulkDeleteLoading(true);
    bulkDeleteCategories(pendingBulkDeleteIds)
      .unwrap()
      .then(() => {
        toast.success('Suppression multiple réussie !');
        setPendingBulkDeleteIds([]);
        setBulkDeleteConfirmOpen(false);
        setDataTableKey((k) => k + 1);
        refetch();
      })
      .catch((err: any) => {
        toast.error(err.data?.message || 'Erreur lors de la suppression multiple');
      })
      .finally(() => {
        setBulkDeleteLoading(false);
      });
  };

  const columnFilters = useMemo((): ColumnFilter[] => [
    {
      id: 'type',
      label: 'Type',
      options: TYPE_OPTIONS,
    },
    {
      id: 'budgetary_area',
      label: 'Domaine budgétaire',
      options: DOMAINE_BUDGETAIRES,
    },
    {
      id: 'is_active',
      label: 'Active',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
  ], []);

  const columns: Column<BudgetCategory & { id: number }>[] = [
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
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => openEdit(row)} className="p-2 rounded hover:bg-blue-100 text-blue-600" title="Éditer"><Pen size={16} /></button>
          {row.deleted_at ? (
            restoringId === row.id && isRestoring ? (
              <span className="loader mr-2" />
            ) : (
              <button
                onClick={async () => {
                  setRestoringId(row.id as number);
                  try {
                    await restoreBudgetCategory(row.id as number);
                    refetch();
                  } finally {
                    setRestoringId(null);
                  }
                }}
                className="p-2 rounded hover:bg-green-100 text-green-600"
                title="Restaurer"
                disabled={isRestoring && restoringId === row.id}
              >
                <RotateCcw size={16} />
              </button>
            )
          ) : (
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
          )}
        </div>
      ),
      sortable: false,
    },
  ];

  // S'assurer que lors du mapping des catégories, budgetary_area est toujours un tableau
  const tableCategories = useMemo(() =>
    categories
      .filter(cat => typeof cat.id === 'number') // Only include categories with a numeric id
      .map((cat) => ({
        ...cat,
        id: cat.id as number, // ensure id is always present and not optional
        budgetary_area: typeof cat.budgetary_area === 'string'
          ? (cat.budgetary_area as string).split(',').map((s: string) => s.trim()).filter(Boolean)
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
          <NewDataTable<BudgetCategory & { id: number }>
            globalSearchLabel={'Code'}
            globalSearchPlaceholder={'Rechercher par code...'}
            key={dataTableKey}
            columns={columns}
            data={tableCategories}
            hoverEffect
            emptyText={isLoading ? 'Chargement des données...' : 'Aucune rubrique trouvée'}
            headerStyle={'primary'}
            striped
            initialPageSize={pageSize}
            columnFilters={columnFilters as ColumnFilter[]}
            enableBulkDelete={true}
            onBulkDelete={handleBulkDeleteRequest}
            serverPagination={true}
            pageCount={Math.ceil(total / pageSize)}
            pageIndex={currentPage - 1}
            onPaginationChange={({ pageIndex, pageSize }) => {
              setPage(pageIndex + 1);
              if (pageSize) {
                setPageSize(pageSize);
              }
            }}
            onFilterChange={(newFilters) => {
              setFilters(newFilters);
              setPage(1);
            }}
            onGlobalSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            globalSearchTerm={search}
          />
        )}
      </div>
      {/* Add Modal */}
      <AddBudgetCategoryModal
        open={modal === 'add'}
        onClose={closeModal}
        onSubmit={handleAdd}
        form={form}
        onChange={handleChange}
        onSelectChange={handleSelectChange}
        fieldErrors={fieldErrors}
        error={error}
        loading={addLoading}
        domaineBudgetaires={DOMAINE_BUDGETAIRES}
        typeOptions={TYPE_OPTIONS}
        activeOptions={ACTIVE_OPTIONS}
      />
      {/* Edit Modal */}
      <EditBudgetCategoryModal
        open={modal === 'edit'}
        onClose={closeModal}
        onSubmit={handleEdit}
        form={form}
        onChange={handleChange}
        onSelectChange={handleSelectChange}
        fieldErrors={fieldErrors}
        error={error}
        loading={editLoading}
        domaineBudgetaires={DOMAINE_BUDGETAIRES}
        typeOptions={TYPE_OPTIONS}
        activeOptions={ACTIVE_OPTIONS}
      />
      {/* Show Modal */}
      <ShowBudgetCategoryModal
        open={modal === 'show'}
        onClose={closeModal}
        selected={selected}
      />
      {/* Delete Confirmation Modal */}
      <DeleteBudgetCategoryModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onDelete={async () => {
          if (categoryToDelete) {
            await handleDelete(categoryToDelete);
            setConfirmDeleteOpen(false);
            setCategoryToDelete(null);
          }
        }}
        loading={deleteLoading}
      />
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
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default BudgetCategoryPage;
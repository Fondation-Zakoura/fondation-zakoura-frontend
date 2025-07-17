import React, { useState, useMemo, useCallback } from "react";
import { Plus, Trash2, Eye, Pencil, RotateCw, Loader2, AlertCircle } from "lucide-react";
import { AddEditPartnerModal } from "../components/partners/AddEditPartnerModal";
import { PartnerDetailsModal } from "../components/partners/PartnersTable";
import type { Partner, OptionItem } from "../types/partners";
import {
  useGetPartnersQuery,
  useAddPartnerMutation,
  useUpdatePartnerMutation,
  useDeletePartnersMutation,
  useGetPartnerOptionsQuery,
} from "../features/api/partnersApi";
import { DataTable } from "../components/ui/data-table";
import type { Column, ColumnFilter } from "../components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { PageHeaderLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useDebounce } from '../hooks/useDebounce';
import { toast, ToastContainer } from 'react-toastify'; // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS

// --- MAIN PAGE COMPONENT ---
const PartnersListPage: React.FC = () => {
  // State for modals and single item actions
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPartnerForDetails, setSelectedPartnerForDetails] = useState<Partner | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // State for the partner being activated or deactivated
  const [partnerToAction, setPartnerToAction] = useState<Partner | null>(null);

  // State for bulk delete/toggle
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // Loading states for delete dialogs
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // --- Backend Filtering, Sorting, and Pagination States ---
  // Global search term (local, immediate updates for debouncing)
  const [localSearchTerm, setLocalSearchTerm] = useState<string>('');
  // Debounced search term (updates after a delay, used for API call)
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  // State for column filters (sent to backend)
  const [columnFilterState, setColumnFilterState] = useState<Record<string, string | string[]>>({
    activation_status: 'active' // Default to 'active' partners
  });

  // State for sorting (sent to backend)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({
    key: 'created_at', // Default sort key
    direction: 'desc', // Default sort direction
  });

  // State for pagination (sent to backend)
  const [pagination, setPagination] = useState({
    pageIndex: 0, // 0-based index for API, will be converted to 1-based for backend
    pageSize: 10, // Default page size
  });

  // State for selected rows in the data table
  const [selectedRows, setSelectedRows] = useState<Partner[]>([]);
  const [dialogErrorMessage, setDialogErrorMessage] = useState<string | null>(null);

  // Combine all filter, search, sort, and pagination parameters for the API call
  const combinedFilters = useMemo(() => {
    // Explicitly type filters to match the expected type in useGetPartnersQuery
    const filters: Record<string, string | string[]> = {
      page: String(pagination.pageIndex + 1), // Convert to string
      per_page: String(pagination.pageSize), // Convert to string
    };

    // Add debounced global search term
    if (debouncedSearchTerm) {
      filters.partner_name = debouncedSearchTerm;
    }

    // Add column filters
    for (const key in columnFilterState) {
      if (Object.prototype.hasOwnProperty.call(columnFilterState, key) && columnFilterState[key] !== null && columnFilterState[key] !== '') {
        filters[key] = columnFilterState[key];
      }
    }

    // Add sorting parameters
    if (sortConfig) {
      filters.sort_by = sortConfig.key;
      filters.sort_direction = sortConfig.direction;
    }

    return filters;
  }, [columnFilterState, debouncedSearchTerm, pagination, sortConfig]);

  // RTK Query: Fetch Partners with combined filters and pagination
  const {
    data: partnersApiResponse,
    error: fetchError,
    isLoading,
    refetch,
  } = useGetPartnersQuery({ filters: combinedFilters, page: pagination.pageIndex + 1 }); // Pass combinedFilters to the query

  const [addPartner] = useAddPartnerMutation();
  const [updatePartner] = useUpdatePartnerMutation();
  const [deletePartners] = useDeletePartnersMutation(); // Used for both single and bulk toggle/delete

  // RTK Query: Fetch filter options
  const { data: naturesData, isLoading: isLoadingNatures } = useGetPartnerOptionsQuery("nature-partners");
  const { data: structuresData, isLoading: isLoadingStructures } = useGetPartnerOptionsQuery("structure-partners");
  const { data: statutsData, isLoading: isLoadingStatuts } = useGetPartnerOptionsQuery("status-partners");

  // Memoize partners list and derived filter options to prevent re-renders
  const allPartners = useMemo(() => partnersApiResponse?.data || [], [partnersApiResponse]);

  // Derive filter options inside useMemo and explicitly type them
  const filterOptions = useMemo(() => {
    const typeOptions: OptionItem[] = [
      { id: "National", name: "National" },
      { id: "International", name: "International" },
    ];

    // New options for activation status
    const activationStatusOptions: OptionItem[] = [
      { id: "active", name: "Actif" },
      { id: "deactivated", name: "Désactivé" },
    ];

    return {
      natures: naturesData?.data || [],
      structures: structuresData?.data || [],
      statuts: statutsData?.data || [],
      types: typeOptions,
      activation_status: activationStatusOptions, // Add new filter options
    };
  }, [naturesData, structuresData, statutsData]);

  // Prepare the filter configuration for the DataTable
  const columnFilters = useMemo((): ColumnFilter[] => {
    return [
      {
        id: "activation_status", // New filter ID
        label: "Statut d'activation",
        options: filterOptions.activation_status.map(opt => ({ // Map OptionItem to { value, label }
          value: String(opt.id),
          label: opt.name,
        })),
        isLoading: false, // This is a static list, so no loading
      },
      {
        id: "nature_partner",
        label: "Nature du partenaire",
        options: (filterOptions.natures || []).map((n: OptionItem) => ({
          value: String(n.name),
          label: n.name,
        })),
        isLoading: isLoadingNatures,
      },
      {
        id: "partner_type",
        label: "Type du partenaire",
        options: (filterOptions.types || []).map((t: OptionItem) => ({
          value: String(t.name),
          label: t.name,
        })),
      },
      {
        id: "structure_partner",
        label: "Structure du partenaire",
        options: (filterOptions.structures || []).map((s: OptionItem) => ({
          value: String(s.name),
          label: s.name,
        })),
        isLoading: isLoadingStructures,
      },
      {
        id: "status",
        label: "Phase du partenaire",
        options: (filterOptions.statuts || []).map((s: OptionItem) => ({
          value: String(s.name),
          label: s.name,
        })),
        isLoading: isLoadingStatuts,
      },
    ];
  }, [filterOptions, isLoadingNatures, isLoadingStructures, isLoadingStatuts]);

  // Handler for DataTable filter changes (column filters)
  const handleDataTableFilterChange = useCallback((newFilters: Record<string, string | string[]>) => {
    // This handler receives the *combined* filters from DataTable,
    // including the global search term. We need to separate them.
    const globalSearchValue = newFilters['partner_name'];
    setLocalSearchTerm(typeof globalSearchValue === 'string' ? globalSearchValue : '');

    // Remove the global search key before setting column filters
    const { partner_name, ...otherColumnFilters } = newFilters;
    setColumnFilterState(otherColumnFilters);

    // Reset pagination to first page when filters change
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  // Handler for global search input changes (from DataTable)
  const handleGlobalSearchChange = useCallback((value: string) => {
    setLocalSearchTerm(value);
    // Reset pagination to first page when global search changes
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  // Handler for sort changes (from DataTable)
  const handleSortChange = useCallback((key: string, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
    // Reset pagination to first page when sort changes
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  // Handler for pagination changes (from DataTable)
  const handlePaginationChange = useCallback((newPagination: { pageIndex: number; pageSize: number }) => {
    setPagination(newPagination);
  }, []);


  // --- Modal and Action Handlers (wrapped in useCallback) ---
  const handleOpenAddModal = useCallback(() => {
    setEditingPartner(null);
    setEditModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((partner: Partner) => {
    setEditingPartner(partner);
    setEditModalOpen(true);
  }, []);

  const handleSavePartner = useCallback(
    async (formData: FormData, id?: number) => {
      setIsSaving(true);
      setDialogErrorMessage(null); // Clear previous errors
      try {
        if (id) {
          await updatePartner({ id, data: formData }).unwrap();
          toast.success("Le partenaire a été mis à jour avec succès.");
        } else {
          await addPartner(formData).unwrap();
          toast.success("Le partenaire a été ajouté avec succès.");
        }
        setEditModalOpen(false);
        refetch();
      } catch (err: unknown) {
        console.error("Failed to save partner:", err);
        const error = err as FetchBaseQueryError;
        const msg = (error.data && typeof error.data === 'object' && 'message' in error.data)
          ? (error.data as { message: string }).message
          : "Une erreur est survenue lors de l'enregistrement du partenaire.";
        toast.error(msg);
      } finally {
        setIsSaving(false);
      }
    },
    [addPartner, updatePartner, refetch]
  );

  const handleToggleRequest = useCallback((partner: Partner) => {
    setPartnerToAction(partner);
    setDialogErrorMessage(null); // Clear previous errors
    setConfirmOpen(true);
  }, []);

  const handleConfirmToggle = useCallback(async () => {
    if (!partnerToAction) return;
    setIsDeleting(true);
    setDialogErrorMessage(null); // Clear previous errors
    try {
      await deletePartners([partnerToAction.id]).unwrap();
      setConfirmOpen(false);
      setPartnerToAction(null);
      refetch();
      toast.success(
        partnerToAction.deleted_at
          ? `Le partenaire "${partnerToAction.partner_name}" a été réactivé avec succès.`
          : `Le partenaire "${partnerToAction.partner_name}" a été désactivé avec succès.`
      );
    } catch (err: unknown) {
      console.error("Toggle failed:", err);
      const error = err as FetchBaseQueryError;
      const msg = (error.data && typeof error.data === 'object' && 'message' in error.data)
        ? (error.data as { message: string }).message
        : "Une erreur est survenue lors du changement de statut du partenaire.";
      toast.error(msg);
      setDialogErrorMessage(msg); // Keep error message in dialog if it's still open
    } finally {
      setIsDeleting(false);
    }
  }, [partnerToAction, deletePartners, refetch]);

  const handleCancelToggle = useCallback(() => {
    if (isDeleting) return;
    setConfirmOpen(false);
    setPartnerToAction(null);
    setDialogErrorMessage(null); // Clear error on cancel
  }, [isDeleting]);

  const handleViewDetails = useCallback((partner: Partner) => {
    setSelectedPartnerForDetails(partner);
  }, []);

  const handleBulkDelete = useCallback((ids: (string | number)[]) => {
    const numericIds = ids.map((id) => Number(id));
    if (!numericIds.length) return;
    setPendingDeleteIds(numericIds);
    setDialogErrorMessage(null); // Clear previous errors
    setShowBulkDeleteDialog(true);
  }, []);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (!pendingDeleteIds.length) return;
    setIsBulkDeleting(true);
    setDialogErrorMessage(null); // Clear previous errors
    try {
      await deletePartners(pendingDeleteIds).unwrap();
      setPendingDeleteIds([]);
      setShowBulkDeleteDialog(false);
      setSelectedRows([]); // Clear selected rows after bulk action
      refetch();
      toast.success(`Action groupée effectuée avec succès sur ${pendingDeleteIds.length} partenaire(s).`);
    } catch (err: unknown) {
      console.error("Bulk delete/toggle failed:", err);
      const error = err as FetchBaseQueryError;
      const msg = (error.data && typeof error.data === 'object' && 'message' in error.data)
        ? (error.data as { message: string }).message
        : "Une erreur est survenue lors de l'action groupée sur les partenaires.";
      toast.error(msg);
      setDialogErrorMessage(msg); // Keep error message in dialog if it's still open
    } finally {
      setIsBulkDeleting(false);
    }
  }, [deletePartners, pendingDeleteIds, refetch]);

  const columns: Column<Partner>[] = useMemo(
    () => [
      {
        key: "partner_logo",
        header: "Logo",
        render: (row) =>
          row.logo_url ? (
            <img
              src={`${import.meta.env.VITE_STORAGE_URL}/${row.partner_logo}`}
              alt={row.partner_name}
              className="h-10 w-10 rounded-full object-cover border"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
              <span className="text-xs font-bold">
                {row.partner_name?.[0]?.toUpperCase() || "?"}
              </span>
            </div>
          ),
        width: '80px',
        align: "center",
      },
      { key: "partner_name", header: "Nom du partenaire", sortable: true },
      { key: "abbreviation", header: "Abréviation", sortable: true },
      { key: "phone", header: "Téléphone", sortable: true },
      { key: "email", header: "E-mail", sortable: true },
      { key: "country", header: "Pays", sortable: true },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        width: '120px',
        render: (row) => (
          <div className="flex gap-1 justify-end">
            <Button
              onClick={() => handleViewDetails(row)}
              className="p-2 rounded hover:bg-gray-200 text-gray-600"
              title="Voir"
              variant="ghost"
              size="sm"
            >
              <Eye size={16} />
            </Button>
            <Button
              onClick={() => handleOpenEditModal(row)}
              className="p-2 rounded hover:bg-blue-100 text-blue-600"
              title="Éditer"
              variant="ghost"
              size="sm"
            >
              <Pencil size={16} />
            </Button>
            {row.deleted_at ? (
              <Button
                onClick={() => handleToggleRequest(row)}
                className="p-2 rounded hover:bg-green-100 text-green-600"
                title="Réactiver"
                variant="ghost"
                size="sm"
              >
                <RotateCw size={16} />
              </Button>
            ) : (
              <Button
                onClick={() => handleToggleRequest(row)}
                className="p-2 rounded hover:bg-red-100 text-red-600"
                title="Désactiver"
                variant="ghost"
                size="sm"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [handleViewDetails, handleOpenEditModal, handleToggleRequest]
  );

  return (
    <div className=" p-4 sm:p-6 lg:p-8 min-h-screen font-sans">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Liste des Partenaires"
          breadcrumbs={[
            { label: "Partenariat" },
            { label: "Prospection" },
            { label: "Partenaires", active: true },
          ]}
        />
        <Button
          className="bg-primary hover:bg-[#576CBC] text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2"
          onClick={handleOpenAddModal}
        >
          <Plus size={18} /> Ajouter un partenaire
        </Button>
      </div>
      <div className="max-w-screen-2xl mx-auto ">
        {/* Loading and Error states for the overall data fetch */}
        {isLoading && !partnersApiResponse ? ( // Only show full loading if no data yet
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-[#576CBC]" />
            <p className="ml-4 text-lg text-gray-600">Chargement des données...</p>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-600">
            <AlertCircle size={48} className="mb-4" />
            <p className="text-xl font-semibold">Erreur de chargement des données</p>
            <p className="text-md text-gray-500">Impossible de récupérer les partenaires. Veuillez réessayer plus tard.</p>
            {typeof fetchError === 'object' && fetchError !== null && 'status' in fetchError && (
              <p className="text-sm text-gray-500 mt-2">Status: {(fetchError as FetchBaseQueryError).status}</p>
            )}
          </div>
        ) : (
          <DataTable<Partner>
            columns={columns}
            data={allPartners} // Data is already paginated/filtered by backend
            columnFilters={columnFilters}
            onFilterChange={handleDataTableFilterChange}
            onGlobalSearchChange={handleGlobalSearchChange} // Pass global search handler
            onSortChange={handleSortChange} // Pass sort handler
            onPaginationChange={handlePaginationChange} // Pass pagination handler
            selectedRows={selectedRows}
            onSelectedRowsChange={setSelectedRows}
            emptyText={"Aucun partenaire trouvé"}
            initialPageSize={pagination.pageSize} // Pass current page size to DataTable
            headerStyle="light"
            hoverEffect
            striped
            serverPagination={true} // Crucial: tell DataTable to use server-side pagination
            pageCount={partnersApiResponse?.meta?.last_page || 0} // Total pages from backend meta
            pageIndex={pagination.pageIndex} // Current page index (0-based)
            totalItems={partnersApiResponse?.meta?.total || 0} // Total items from backend meta
            onBulkDelete={handleBulkDelete}
            globalFilterKey="partner_name"
            globalFilterValue={localSearchTerm} // Pass local search term for input display
            isLoading={isLoading} // Pass isLoading to DataTable for its internal loading overlay
            globalSearchLabel="Nom du partenaire"
          />
        )}
      </div>

      <AddEditPartnerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setDialogErrorMessage(null); // Clear error on close
        }}
        onSave={handleSavePartner}
        partner={editingPartner}
        options={filterOptions}
        serverErrors={{}}
        isLoading={isSaving}
      />
      <PartnerDetailsModal
        isOpen={!!selectedPartnerForDetails}
        onClose={() => setSelectedPartnerForDetails(null)}
        partner={selectedPartnerForDetails}
      />

      {/* Single Toggle/Delete Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {partnerToAction?.deleted_at
                ? "Confirmer la réactivation"
                : "Confirmer la désactivation"}
            </DialogTitle>
            <DialogDescription>
              {partnerToAction?.deleted_at
                ? `Êtes-vous sûr de vouloir réactiver le partenaire "${partnerToAction?.partner_name}" ?`
                : `Êtes-vous sûr de vouloir désactiver le partenaire "${partnerToAction?.partner_name}" ? Cette action est réversible.`}
              {dialogErrorMessage && (
                <p className="text-red-500 text-sm mt-2">{dialogErrorMessage}</p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={handleCancelToggle}
              >
                Annuler
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant={partnerToAction?.deleted_at ? "default" : "destructive"}
              disabled={isDeleting}
              onClick={handleConfirmToggle}
            >
              {isDeleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {partnerToAction?.deleted_at ? "Réactiver" : "Désactiver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'action groupée</DialogTitle>
            <DialogDescription>
              You are about to change the status of{" "}
              <strong>{pendingDeleteIds.length} partner(s)</strong>. Active partners
              will be deactivated and inactive ones will be reactivated. Are you sure
              you want to continue?
              {dialogErrorMessage && (
                <p className="text-red-500 text-sm mt-2">{dialogErrorMessage}</p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isBulkDeleting}
                onClick={() => {
                  setPendingDeleteIds([]);
                  setDialogErrorMessage(null); // Clear error on cancel
                }}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={isBulkDeleting}
              onClick={handleConfirmBulkDelete}
            >
              {isBulkDeleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnersListPage;

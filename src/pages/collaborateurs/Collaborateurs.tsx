import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { PageHeaderLayout } from '@/layouts/MainLayout';
import { DataTable, type Column, type ColumnFilter } from '@/components/ui/data-tableForColab';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useDebounce } from '@/hooks/useDebounce';

import {
  useGetCollaborateursQuery,
  useGetArchivedCollaborateursQuery,
  useDeleteCollaborateurMutation,
  useGetTypeContratsQuery,
  useGetAllStatutCollaborateursQuery,
  useBulkDeleteCollaborateursMutation,
  useRestoureCollaborateurMutation,
} from '@/features/api/CollaborateursApi';
import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import ShowCollaborateur from './ShowCollaborateur';

type Collaborateur = {
  id: number;
  civilite: string;
  nom: string;
  prenom: string;
  cin: string;
  type_contrat_id: number;
  poste: string;
  statut_collaborateur_id: number;
  deleted_at?: string | null;
};

const Collaborateurs = () => {
  const navigate = useNavigate();
  
  // State for modals and single item actions
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedCollabId, setSelectedCollabId] = useState<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<Collaborateur[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  const [dialogErrorMessage, setDialogErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // Add this state near your other state declarations
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCollaborateur, setSelectedCollaborateur] = useState<Collaborateur | null>(null);


  // --- Backend Filtering, Sorting, and Pagination States ---
  // Global search term (local, immediate updates for debouncing)
  const [localSearchTerm, setLocalSearchTerm] = useState<string>('');
  // Debounced search term (updates after a delay, used for API call)
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  // State for column filters (sent to backend)
  const [columnFilterState, setColumnFilterState] = useState<Record<string, string | string[]>>({});

  // State for sorting (sent to backend)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({
    key: 'nom', // Default sort key
    direction: 'asc', // Default sort direction
  });

  // State for pagination (sent to backend)
  const [pagination, setPagination] = useState({
    pageIndex: 0, // 0-based index for API, will be converted to 1-based for backend
    pageSize: 10, // Default page size
  });

  // Combine all filter, search, sort, and pagination parameters for the API call
  const combinedFilters = useMemo(() => {
    const filters: Record<string, string | string[]> = {
      page: String(pagination.pageIndex + 1), // Convert to string
      per_page: String(pagination.pageSize), // Convert to string
    };
    

    // Add debounced global search term
    if (debouncedSearchTerm) {
      filters.search = debouncedSearchTerm;
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

  // RTK Query: Fetch data based on archive state with combined filters
  const { 
    data: regularData, 
    isLoading: isRegularLoading, 
    isError: isRegularError,
    error: regularError,
    refetch: refetchRegular
  } = useGetCollaborateursQuery({ 
    filters: combinedFilters,
    page: pagination.pageIndex + 1 // Convert to 1-based for backend
  });

  const { 
    data: archivedData, 
    isLoading: isArchivedLoading, 
    isError: isArchivedError,
    error: archivedError,
    refetch: refetchArchived 
  } = useGetArchivedCollaborateursQuery({ 
    filters: combinedFilters,
    page: pagination.pageIndex + 1 // Convert to 1-based for backend
  });

  const { data: allStatusData, isLoading: isLoadingStatus } = useGetAllStatutCollaborateursQuery();
  const allStatusCollaborateurs = allStatusData?.data || [];
  const { data: typeContratsData, isLoading: isLoadingContrats } = useGetTypeContratsQuery();
  const typeContrats = typeContratsData?.data || [];

  const [deleteCollaborateur] = useDeleteCollaborateurMutation();
  const [bulkDeleteCollaborateurs] = useBulkDeleteCollaborateursMutation();
  const [restoureCollaborateur] = useRestoureCollaborateurMutation();

  const data = showArchived ? archivedData : regularData;
  const isLoading = showArchived ? isArchivedLoading : isRegularLoading;
  const isError = showArchived ? isArchivedError : isRegularError;
  const error = showArchived ? archivedError : regularError;
  
  const collaborateurs = data?.data || [];
  const pageCount = data?.pagination?.total_pages || 1;
  const totalItems = data?.pagination?.total || 0;

  // Handlers
  const handleShow = useCallback((id: number) => {
  const collab = collaborateurs.find(c => c.id === id);
  if (collab) {
    setSelectedCollaborateur(collab);
    setShowDetailsModal(true);
  }
}, [collaborateurs]);
  const handleEdit = useCallback((id: number) => navigate(`/rh/collaborateurs/${id}/edit`), [navigate]);

  const handleDelete = useCallback((id: number) => {
    setSelectedCollabId(id);
    setDialogErrorMessage(null);
    setConfirmDeleteOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!selectedCollabId) return;
    setIsDeleting(true);
    setDialogErrorMessage(null);
    
    try {
      await deleteCollaborateur(selectedCollabId).unwrap();
      setConfirmDeleteOpen(false);
      showArchived ? refetchArchived() : refetchRegular();
    } catch (err: unknown) {
      console.error("Delete failed:", err);
      const error = err as FetchBaseQueryError;
      const msg = (error.data && typeof error.data === 'object' && 'message' in error.data)
        ? (error.data as { message: string }).message
        : "Une erreur est survenue lors de la suppression du collaborateur.";
      setDialogErrorMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedCollabId, deleteCollaborateur, showArchived, refetchArchived, refetchRegular]);

  const handleBulkDelete = useCallback((ids: (string | number)[]) => {
    const numericIds = ids.map((id) => Number(id));
    if (!numericIds.length) return;
    setPendingDeleteIds(numericIds);
    setDialogErrorMessage(null);
    setShowBulkDeleteDialog(true);
  }, []);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (!pendingDeleteIds.length) return;
    setIsBulkDeleting(true);
    setDialogErrorMessage(null);    
    try {
      await bulkDeleteCollaborateurs(pendingDeleteIds).unwrap();
      setPendingDeleteIds([]);
      setShowBulkDeleteDialog(false);
      setSelectedRows([]);
      showArchived ? refetchArchived() : refetchRegular();
    } catch (err: unknown) {
      console.error("Bulk delete failed:", err);
      const error = err as FetchBaseQueryError;
      const msg = (error.data && typeof error.data === 'object' && 'message' in error.data)
        ? (error.data as { message: string }).message
        : "Une erreur est survenue lors de la suppression groupée des collaborateurs.";
      setDialogErrorMessage(msg);
    } finally {
      setIsBulkDeleting(false);
    }
  }, [bulkDeleteCollaborateurs, pendingDeleteIds, showArchived, refetchArchived, refetchRegular]);
  const handleRestoure = useCallback(async (id: number) => {
    try {
      await restoureCollaborateur(id).unwrap();
      showArchived ? refetchArchived() : refetchRegular();
    } catch (err: unknown) {
      console.error("Restore failed:", err);
      const error = err as FetchBaseQueryError;
      const msg = (error.data && typeof error.data === 'object' && 'message' in error.data)
        ? (error.data as { message: string }).message
        : "Une erreur est survenue lors de la restauration du collaborateur.";
      setDialogErrorMessage(msg);
    }
  }, [restoureCollaborateur, showArchived, refetchArchived, refetchRegular]); 

    const handlePaginationChange = useCallback(({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
        setPagination({
          pageIndex,
          pageSize,
        });
      }, []);
    const handleDataTableFilterChange = useCallback(
      (newFilters: Record<string,string|string[]>) => {
        // Extract the trashed flag
        const trashedValue = Array.isArray(newFilters.with_trashed)
          ? newFilters.with_trashed[0]
          : (newFilters.with_trashed as string | undefined);

        // Sync your "showArchived" toggle
        setShowArchived(trashedValue === 'true');

        // Drop that key before pushing the rest into columnFilterState
        const { with_trashed, ...otherFilters } = newFilters;
        setColumnFilterState(otherFilters);

        // Reset to first page
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
      },
      []
    );


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
  
  const columns: Column<Collaborateur>[] = useMemo(() => [
    { key: 'civilite', header: 'Civilité', sortable: true },
    { key: 'nom', header: 'Nom', sortable: true },
    { key: 'prenom', header: 'Prénom', sortable: true },
    { key: 'cin', header: 'CIN', sortable: true },
    { 
      key: 'type_contrat_id', 
      header: 'Type de contrat',
      sortable: true,
      render: (row: Collaborateur) => {
        const contrat = typeContrats.find((c: { id: number }) => c.id === row.type_contrat_id);
        return contrat?.type ?? 'Type inconnu';
      },
    },
    { key: 'poste', header: 'Poste', sortable: true },
    {
      key: 'statut_collaborateur_id',
      header: 'Statut',
      sortable: true,
      render: (row: Collaborateur) => {
        const statut = allStatusCollaborateurs.find((s: { id: number }) => s.id === row.statut_collaborateur_id);
        return statut?.type ?? 'Statut inconnu';
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row: Collaborateur) => (
        <>
          <div className="flex gap-2 justify-end">
            <Button 
              className="text-gray-600 hover:text-blue-600"
              variant="ghost" 
              size="icon" 
              onClick={() => handleShow(row.id)}
              >
              <FaEye/>
            </Button>
            {!showArchived && (
              <>
                <Button 
                  className="p-2 rounded hover:bg-blue-100 text-blue-600"
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleEdit(row.id)}>
                  <FaEdit />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(row.id)}
                  className="p-2 rounded hover:bg-red-100 text-red-600"
                >
                  <FaTrash />
                </Button>
              </>
            )}
            {showArchived && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleRestoure(row.id)}
                className="hover:bg-green-100 text-green-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
        </>
      ),
    },
  ], [typeContrats, allStatusCollaborateurs, showArchived, handleShow, handleEdit, handleDelete]);

  const columnFilters: ColumnFilter[] = useMemo(() => [
    { id: 'nom', label: 'Nom' },
    { id: 'cin', label: 'CIN' },
    {
      id: 'type_contrat_id',
      label: 'Type de contrat',
      options: typeContrats.map((t: any) => ({ value: String(t.id), label: t.type })),
      isLoading: isLoadingContrats,
    },
    {
      id: 'statut_collaborateur_id',
      label: 'Statut',
      options: allStatusCollaborateurs.map((s: any) => ({ value: String(s.id), label: s.type })),
      isLoading: isLoadingStatus,
    },
     {
      id: 'with_trashed',
      label: 'État',
      options: [
        { value: 'false', label: 'Actif' },
        { value: 'true',  label: 'Archivé' },
      ],
    },
  ], [collaborateurs, typeContrats, allStatusCollaborateurs, isLoading, isLoadingContrats, isLoadingStatus]);

  return (
    <>
      <div className="p-4 md:p-8 min-h-screen bg-gray-50">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <PageHeaderLayout
            title={showArchived ? "Archives des collaborateurs" : "Liste des collaborateurs"}
            breadcrumbs={[
              { label: 'Tableau de bord' },
              { label: showArchived ? 'Archives des collaborateurs' : 'Collaborateurs', active: true },
            ]}
          />
          <div className="flex gap-2">
            {!showArchived && (
              <Button
                onClick={() => navigate('/rh/collaborateurs/add')}
                className="text-white font-bold px-4 py-2 rounded-md shadow transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Ajouter un collaborateur</span>
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading && !data ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="ml-4 text-lg text-gray-600">Chargement des données...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-600">
              <AlertCircle size={48} className="mb-4" />
              <p className="text-xl font-semibold">Erreur de chargement des données</p>
              <p className="text-md text-gray-500">Impossible de récupérer les collaborateurs. Veuillez réessayer plus tard.</p>
              {typeof error === 'object' && error !== null && 'status' in error && (
                <p className="text-sm text-gray-500 mt-2">Status: {(error as FetchBaseQueryError).status}</p>
              )}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={collaborateurs}
              columnFilters={columnFilters}
              striped
              hoverEffect
              pageCount={pageCount}
              totalItems={totalItems}
              pageIndex={pagination.pageIndex}
              onPaginationChange={handlePaginationChange}
              initialPageSize={pagination.pageSize} 
              enableBulkDelete={!showArchived}
              onBulkDelete={handleBulkDelete}
              emptyText={showArchived ? "Aucun collaborateur archivé trouvé" : "Aucun collaborateur trouvé"}
              selectedRows={selectedRows}
              onSelectedRowsChange={setSelectedRows}
              serverPagination={true}
              onFilterChange={handleDataTableFilterChange}
              onGlobalSearchChange={handleGlobalSearchChange}
              onSortChange={handleSortChange}
              globalFilterValue={localSearchTerm}
              isLoading={isLoading}
              headerStyle="light"
            />
          )}
        </div>
      </div>
      
      {/* Single Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir {showArchived ? 'supprimer définitivement' : 'archiver'} ce collaborateur ?
              {dialogErrorMessage && (
                <p className="text-red-500 text-sm mt-2">{dialogErrorMessage}</p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)} disabled={isDeleting}>
                Annuler
              </Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'action groupée</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de {showArchived ? 'supprimer définitivement' : 'archiver'} <strong>{pendingDeleteIds.length} collaborateur(s)</strong>. Êtes-vous sûr de vouloir continuer ?
              {dialogErrorMessage && (
                <p className="text-red-500 text-sm mt-2">{dialogErrorMessage}</p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button 
                variant="outline" 
                onClick={() => {
                  setPendingDeleteIds([]);
                  setDialogErrorMessage(null);
                }} 
                disabled={isBulkDeleting}
              >
                Annuler
              </Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleConfirmBulkDelete} 
              disabled={isBulkDeleting}
            >
              {isBulkDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {selectedCollaborateur && (
          <ShowCollaborateur 
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            collaborateurid={selectedCollaborateur.id}
            isArchived={showArchived}
          />
    )}
    </>
    
  );
};

export default Collaborateurs;
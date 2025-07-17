import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Pen, Trash, Plus, Archive } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { PageHeaderLayout } from '@/layouts/MainLayout';
import { DataTable, type Column, type ColumnFilter } from '@/components/ui/data-table';

import {
  useGetCollaborateursQuery,
  useGetArchivedCollaborateursQuery,
  useDeleteCollaborateurMutation,
  useGetTypeContratsQuery,
  useGetAllStatutCollaborateursQuery,
  useBulkDeleteCollaborateursMutation,
} from '@/features/api/CollaborateursApi';

type Collaborateur = {
  id: number;
  civilite: string;
  nom: string;
  prenom: string;
  cin: string;
  type_contrat_id: number;
  poste: string;
  statut_collaborateur_id: number;
};

const Collaborateurs = () => {
  const navigate = useNavigate();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedCollabId, setSelectedCollabId] = useState<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<Collaborateur[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0, // 0-based for frontend
    pageSize: 10,
  });

  // Fetch data based on archive state
  const { 
    data: regularData, 
    isLoading: isRegularLoading, 
    isError: isRegularError,
    refetch: refetchRegular
  } = useGetCollaborateursQuery({ 
    page: pagination.pageIndex + 1, // Convert to 1-based for backend
    per_page: pagination.pageSize 
  });

  const { 
    data: archivedData, 
    isLoading: isArchivedLoading, 
    isError: isArchivedError,
    refetch: refetchArchived 
  } = useGetArchivedCollaborateursQuery({ 
    page: pagination.pageIndex + 1, // Convert to 1-based for backend
    per_page: pagination.pageSize 
  });

  const { data: allStatusData } = useGetAllStatutCollaborateursQuery();
  const allStatusCollaborateurs = allStatusData?.data || [];
  const { data: typeContratsData } = useGetTypeContratsQuery();
  const typeContrats = typeContratsData?.data || [];

  const [deleteCollaborateur, { isLoading: isDeleting }] = useDeleteCollaborateurMutation();
  const [bulkDeleteCollaborateurs] = useBulkDeleteCollaborateursMutation();

  const data = showArchived ? archivedData : regularData;
  const isLoading = showArchived ? isArchivedLoading : isRegularLoading;
  const isError = showArchived ? isArchivedError : isRegularError;
  
  const collaborateurs = data?.data || [];
  const pageCount = data?.pagination?.total_pages || 1;
  const totalItems = data?.pagination?.total || 0;

  console.log('Collaborateurs data:', collaborateurs);
  console.log('Page count:', pageCount);
  console.log('Total items:', totalItems);

  const handleShow = useCallback((id: number) => navigate(`/rh/collaborateurs/${id}`), [navigate]);
  const handleEdit = useCallback((id: number) => navigate(`/rh/collaborateurs/${id}/edit`), [navigate]);

  const handleDelete = useCallback((id: number) => {
    setSelectedCollabId(id);
    setConfirmDeleteOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (selectedCollabId) {
      try {
        await deleteCollaborateur(selectedCollabId).unwrap();
        showArchived ? refetchArchived() : refetchRegular();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setConfirmDeleteOpen(false);
      }
    }
  }, [selectedCollabId, deleteCollaborateur, showArchived, refetchArchived, refetchRegular]);

  const handleBulkDelete = useCallback(async (ids: number[]) => {
    try {
      await bulkDeleteCollaborateurs(ids).unwrap();
      setSelectedRows([]);
      showArchived ? refetchArchived() : refetchRegular();
    } catch (error) {
      console.error('Erreur lors de la suppression en masse:', error);
    }
  }, [bulkDeleteCollaborateurs, showArchived, refetchArchived, refetchRegular]);

  const handlePaginationChange = useCallback(({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
    setPagination({
      pageIndex,
      pageSize,
    });
  }, []);

  const toggleArchiveView = useCallback(() => {
    setShowArchived(prev => !prev);
    setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset to first page when switching views
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
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="icon" onClick={() => handleShow(row.id)}>
            <Eye className="w-4 h-4" />
          </Button>
          {!showArchived && (
            <>
              <Button variant="ghost" size="icon" onClick={() => handleEdit(row.id)}>
                <Pen className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)}>
                <Trash className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ], [typeContrats, allStatusCollaborateurs, showArchived, handleShow, handleEdit, handleDelete]);

  const columnFilters: ColumnFilter[] = useMemo(() => [
    { id: 'nom', label: 'Nom', type: 'text', options: [] },
    { id: 'cin', label: 'CIN', type: 'text', options: [] },
    { id: 'poste', label: 'Poste', type: 'text', options: [] },
    { 
      id: 'type_contrat_id', 
      label: 'Type de contrat', 
      options: typeContrats.map((t: any) => ({ value: t.id, label: t.type }))
    },
    { 
      id: 'statut_collaborateur_id', 
      label: 'Statut', 
      options: allStatusCollaborateurs.map((s: any) => ({ value: s.id, label: s.type }))
    },
  ], [typeContrats, allStatusCollaborateurs]);

  return (
    <>
      <div className="p-4 md:p-8 min-h-screen">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <PageHeaderLayout
            title={showArchived ? "Archives des collaborateurs" : "Liste des collaborateurs"}
            breadcrumbs={[
              { label: 'Tableau de bord' },
              { label: showArchived ? 'Archives des collaborateurs' : 'Collaborateurs', active: true },
            ]}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={toggleArchiveView}
              className="flex items-center gap-2"
            >
              {showArchived ? (
                <>
                  <Eye className="w-4 h-4" /> Voir les collaborateurs actifs
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" /> Voir les archives
                </>
              )}
            </Button>
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
          {isLoading ? (
            <p>Chargement...</p>
          ) : isError ? (
            <p>Erreur lors du chargement des collaborateurs.</p>
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
              enableBulkDelete={!showArchived}
              onBulkDelete={handleBulkDelete}
              emptyText={showArchived ? "Aucun collaborateur archivé trouvé" : "Aucun collaborateur trouvé"}
              selectedRows={selectedRows}
              onSelectedRowsChange={setSelectedRows}
              serverPagination={true}
            />
          )}
        </div>
      </div>
      
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce collaborateur ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Collaborateurs;
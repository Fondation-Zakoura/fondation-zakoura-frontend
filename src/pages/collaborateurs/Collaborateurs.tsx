import { useState, useMemo } from 'react';
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
import { type Column, type ColumnFilter } from '@/components/ui/data-table';
import {DataTable} from '@/components/ui/data-table';

import {
  useGetCollaborateursQuery,
  useGetArchivedCollaborateursQuery,
  useDeleteCollaborateurMutation,
  useGetTypeContratsQuery,
  useGetAllStatutCollaborateursQuery,
  useBulkDeleteCollaborateursMutation,
} from '@/features/api/CollaborateursApi';

const Collaborateurs = () => {
  const navigate = useNavigate();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedCollabId, setSelectedCollabId] = useState<number | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  
  // Fetch data based on archive state
  const { data: regularData, isLoading: isRegularLoading, isError: isRegularError } = useGetCollaborateursQuery({});
  const { data: archivedData, isLoading: isArchivedLoading, isError: isArchivedError } = useGetArchivedCollaborateursQuery({});
  
  const {data: allStatusData } = useGetAllStatutCollaborateursQuery();
  const allStatusCollaborateurs = allStatusData?.data || [];
  const {data: typeContratsData} = useGetTypeContratsQuery();
  const typeContrats = typeContratsData?.data || [];

  const [deleteCollaborateur, { isLoading: isDeleting }] = useDeleteCollaborateurMutation();
  const [bulkDeleteCollaborateurs] = useBulkDeleteCollaborateursMutation();

  const data = showArchived ? archivedData : regularData;
  const isLoading = showArchived ? isArchivedLoading : isRegularLoading;
  const isError = showArchived ? isArchivedError : isRegularError;
  
  const collaborateurs = data?.data || [];

  const handleShow = (id: number) => navigate(`/rh/collaborateurs/${id}`);
  const handleEdit = (id: number) => navigate(`/rh/collaborateurs/${id}/edit`);
  const handleDelete = (id: number) => {
    setSelectedCollabId(id);
    setConfirmDeleteOpen(true);
  };
  
  const confirmDelete = async () => {
    if (selectedCollabId) {
      console.log('Suppression du collaborateur avec ID:', selectedCollabId);
      deleteCollaborateur(selectedCollabId)
        .unwrap()
        .catch((error) => {
          console.error('Erreur lors de la suppression:', error);
      });
    }
    setConfirmDeleteOpen(false);
  };
  
  const handleBulkDelete = async (ids: number[]) => {
  console.log('Suppression multiple pour les IDs:', ids);
  bulkDeleteCollaborateurs(ids)
    .unwrap()
    .then(() => {
      console.log('Suppression multiple réussie pour les IDs:', ids);
      setConfirmDeleteOpen(false);
    })
    .catch((error) => {
      console.error('Erreur lors de la suppression multiple:', error);
    });
};


  const columns: Column<any>[] = [
    { key: 'civilite', header: 'Civilité', sortable: true },
    { key: 'nom', header: 'Nom', sortable: true },
    { key: 'prenom', header: 'Prénom', sortable: true },
    { key: 'cin', header: 'CIN', sortable: true },
    { 
      key: 'type_contrat_id', 
      header: 'Type de contrat',
      sortable: true,
      render: (row) => {
        const contrat = typeContrats.find((c: { id: Number; }) => c.id === row.type_contrat_id);
        return contrat?.type ?? 'Type inconnu';
      },
    },
    { key: 'poste', header: 'Poste', sortable: true },
    {
      key: 'statut_collaborateur_id',
      header: 'Statut',
      sortable: true,
      render: (row) => {
        const statut = allStatusCollaborateurs.find((s: { id: Number; }) => s.id === row.statut_collaborateur_id);
        return statut?.type ?? 'Statut inconnu';
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
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
  ];

  const columnFilters: ColumnFilter[] = useMemo(() => {
    return [
      { id: 'nom', label: 'Nom', type: 'text', options: [] },
      { id: 'cin', label: 'CIN', type: 'text', options: [] },
      { id: 'poste', label: 'Poste', type: 'text', options: [] },
      { id: 'type_contrat.label', label: 'Type de contrat', type: 'text', options: [] },
      { id: 'statut_collaborateur.label', label: 'Statut', type: 'text', options: [] },
    ];
  }, []);

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
              onClick={() => setShowArchived(!showArchived)}
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
              initialPageSize={10}
              enableBulkDelete={!showArchived} // Disable bulk delete in archive view
              onBulkDelete={handleBulkDelete}
              emptyText={showArchived ? "Aucun collaborateur archivé trouvé" : "Aucun collaborateur trouvé"}
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
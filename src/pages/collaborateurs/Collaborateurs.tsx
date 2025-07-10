import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Pen, Trash, Plus } from 'lucide-react';
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
  useDeleteCollaborateurMutation,
} from '@/features/api/CollaborateursApi';

const Collaborateurs = () => {
  const navigate = useNavigate();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedCollabId, setSelectedCollabId] = useState<number | null>(null);

  const { data, isLoading, isError } = useGetCollaborateursQuery({});
  const [deleteCollaborateur, { isLoading: isDeleting }] = useDeleteCollaborateurMutation();

  const collaborateurs = data?.data || [];

  const handleShow = (id: number) => navigate(`/rh/collaborateurs/${id}`);
  const handleEdit = (id: number) => navigate(`/rh/collaborateurs/${id}/edit`);
  const handleDelete = (id: number) => {
    setSelectedCollabId(id);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedCollabId) {
      try {
        await deleteCollaborateur(selectedCollabId).unwrap();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
    setConfirmDeleteOpen(false);
  };




  const columns: Column<any>[] = [
    { key: 'matricule', header: 'Matricule', sortable: true },
    { key: 'civilite', header: 'Civilité', sortable: true },
    { key: 'nom', header: 'Nom', sortable: true },
    { key: 'prenom', header: 'Prénom', sortable: true },
    { key: 'cin', header: 'CIN', sortable: true },
    {
      key: 'type_contrat_id',
      header: 'Type de contrat',
      sortable: true,
      render: (row) => <span>{row?.type_contrat?.label || '-'}</span>,
    },
    { key: 'poste', header: 'Poste', sortable: true },
    {
      key: 'statut_collaborateur_id',
      header: 'Statut',
      sortable: true,
      render: (row) => <span>{row?.statut_collaborateur?.label || '-'}</span>,
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
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row.id)}>
            <Pen className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)}>
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];


const columnFilters: ColumnFilter<any>[] = useMemo(() => {
  return [
    { id: 'nom', label: 'Nom', type: 'text', options: [] },
    { id: 'matricule', label: 'Matricule', type: 'text', options: [] },
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
            title="Liste des collaborateurs"
            breadcrumbs={[
              { label: 'Tableau de bord' },
              { label: 'Collaborateurs', active: true },
            ]}
          />
          <Button
            onClick={() => navigate('/rh/collaborateurs/add')}
            className="text-white font-bold px-4 py-2 rounded-md shadow transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter un collaborateur</span>
          </Button>
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

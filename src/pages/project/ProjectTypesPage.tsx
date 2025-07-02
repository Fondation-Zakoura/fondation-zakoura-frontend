import React, { useState } from 'react';
import { useGetProjectTypesQuery, useCreateProjectTypeMutation, useUpdateProjectTypeMutation, useDeleteProjectTypeMutation } from '@/features/api/projectsApi';
import type { ProjectType } from '@/features/types/project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pen, Eye, Trash, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { PageHeaderLayout } from '@/layouts/MainLayout';
import { DataTable, type Column } from '@/components/ui/data-table';

const emptyType: ProjectType = { id: 0, name: ''};

const ProjectTypesPage: React.FC = () => {
  const { data: types = [], isLoading, refetch } = useGetProjectTypesQuery();
  const [createType] = useCreateProjectTypeMutation();
  const [updateType] = useUpdateProjectTypeMutation();
  const [deleteType] = useDeleteProjectTypeMutation();

  const [modal, setModal] = useState<'add' | 'edit' | 'show' | null>(null);
  const [selected, setSelected] = useState<ProjectType | null>(null);
  const [form, setForm] = useState(emptyType);
  const [error, setError] = useState('');
  const [typeToDelete, setTypeToDelete] = useState<ProjectType | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const openAdd = () => { setForm(emptyType); setModal('add'); };
  const openEdit = (type: ProjectType) => { setForm(type); setSelected(type); setModal('edit'); };
  const openShow = (type: ProjectType) => { setSelected(type); setModal('show'); };
  const closeModal = () => { setModal(null); setSelected(null); setForm(emptyType); setError(''); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAddLoading(true);
    try {
      await createType({ name: form.name }).unwrap();
      closeModal();
      refetch();
      setAddLoading(false);
    } catch (err: any) {
      setError(err.data?.message || 'Erreur lors de la création');
      setAddLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selected) return;
    setEditLoading(true);
    try {
      await updateType({ id: selected.id, body: { name: form.name } }).unwrap();
      closeModal();
      refetch();
      setEditLoading(false);
    } catch (err: any) {
      setError(err.data?.message || 'Erreur lors de la modification');
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!typeToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteType(typeToDelete.id).unwrap();
      refetch();
      setConfirmDeleteOpen(false);
      setTypeToDelete(null);
      setDeleteLoading(false);
    } catch (err: any) {
      alert(err.data?.message || 'Erreur lors de la suppression');
      setDeleteLoading(false);
    }
  };
  const columns: Column<ProjectType>[] = [
    { key: "name", header: "Name" ,sortable:true},
    { 
      key: "created_at", 
      header: "Date de creation", 
      sortable:true,
      render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString('fr-FR') : '-' 
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => openShow(row)} className="p-2 rounded hover:bg-gray-200 text-gray-600" title="Voir"><Eye size={16} /></button>
          <button onClick={() => openEdit(row)} className="p-2 rounded hover:bg-blue-100 text-blue-600" title="Éditer"><Pen size={16} /></button>
          <button
            className="p-2 rounded hover:bg-red-100 text-red-600"
            title="Supprimer"
            onClick={() => { setTypeToDelete(row); setConfirmDeleteOpen(true); }}
          >
            <Trash size={16} />
          </button>
        </div>
      ),
      sortable: false,
    }
  ];
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">

      <PageHeaderLayout
        title="Types de projet"
        breadcrumbs={[
          { label: 'Parametres' },
          { label: 'Finance' },
          { label: 'Types' },
          { label: 'Types de projet', active: true }
        ]}
      >
      </PageHeaderLayout>
        <Button onClick={openAdd} className="ml-auto flex items-center gap-2 bg-[#19376D]  text-white font-bold px-6 py-2 cursor-pointer rounded-lg shadow">
          <Plus className="w-4 h-4" /> Ajouter
        </Button>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        {isLoading ? (
          <div>Chargement...</div>
        ) : (
          <DataTable 
          columns={columns}
          data={types} 
          />
        )}
      </div>
      {/* Add Modal */}
      <Dialog open={modal === 'add'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un type de projet</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <Input name="name" placeholder="Nom du type" value={form.name} onChange={handleChange} required />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <DialogFooter>
              <Button type="submit" className="bg-[#576CBC] hover:bg-[#19376D] text-white" disabled={addLoading}>
                {addLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2 inline" /> : null}
                {addLoading ? 'Ajout...' : 'Ajouter'}
              </Button>
              <DialogClose asChild><Button type="button" variant="outline">Annuler</Button></DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Edit Modal */}
      <Dialog open={modal === 'edit'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le type de projet</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <Input name="name" placeholder="Nom du type" value={form.name} onChange={handleChange} required />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <DialogFooter>
              <Button type="submit" className="bg-[#576CBC] hover:bg-[#19376D] text-white" disabled={editLoading}>
                {editLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2 inline" /> : null}
                {editLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <DialogClose asChild><Button type="button" variant="outline">Annuler</Button></DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Show Modal */}
      <Dialog open={modal === 'show'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détail du type de projet</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div>
                <span className="block text-xs text-gray-500">Nom</span>
                <span className="font-semibold text-gray-800 text-sm">{selected.name}</span>
              </div>
            
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Fermer</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Êtes-vous sûr de vouloir supprimer ce type de projet&nbsp;?
            <div className="mt-2 text-sm text-gray-500">Cette action est irréversible.</div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Annuler</Button>
            </DialogClose>
            <Button type="button" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2 inline" /> : null}
              {deleteLoading ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectTypesPage; 
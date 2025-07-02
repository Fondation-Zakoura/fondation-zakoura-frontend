import React, { useState } from 'react';
import { useGetProjectStatusesQuery, useCreateProjectStatusMutation, useUpdateProjectStatusMutation, useDeleteProjectStatusMutation } from '@/features/api/projectsApi';
import type { ProjectStatus } from '@/features/types/project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Pen, Eye, Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { PageHeaderLayout } from '@/layouts/MainLayout';

const emptyStatus: ProjectStatus = { id: 0, name: '', description: ''};

const ProjectStatusesPage: React.FC = () => {
  const { data: statuses = [], isLoading, refetch } = useGetProjectStatusesQuery();
  const [createStatus] = useCreateProjectStatusMutation();
  const [updateStatus] = useUpdateProjectStatusMutation();
  const [deleteStatus] = useDeleteProjectStatusMutation();

  const [modal, setModal] = useState<'add' | 'edit' | 'show' | null>(null);
  const [selected, setSelected] = useState<ProjectStatus | null>(null);
  const [form, setForm] = useState(emptyStatus);
  const [error, setError] = useState('');

  const openAdd = () => { setForm(emptyStatus); setModal('add'); };
  const openEdit = (status: ProjectStatus) => { setForm(status); setSelected(status); setModal('edit'); };
  const openShow = (status: ProjectStatus) => { setSelected(status); setModal('show'); };
  const closeModal = () => { setModal(null); setSelected(null); setForm(emptyStatus); setError(''); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createStatus({ name: form.name, description: form.description }).unwrap();
      closeModal();
      refetch();
    } catch (err: any) {
      setError(err.data?.message || 'Erreur lors de la création');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selected) return;
    try {
      await updateStatus({ id: selected.id, body: { name: form.name, description: form.description, color: form.color } }).unwrap();
      closeModal();
      refetch();
    } catch (err: any) {
      setError(err.data?.message || 'Erreur lors de la modification');
    }
  };

  const handleDelete = async (status: ProjectStatus) => {
    if (!window.confirm('Supprimer ce statut de projet ?')) return;
    try {
      await deleteStatus(status.id).unwrap();
      refetch();
    } catch (err: any) {
      alert(err.data?.message || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="p-8 ">
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
            title="Statuts de projet"
            breadcrumbs={[
            { label: 'Tableaux de bord' },
            { label: 'Statuts de projet', active: true }
            ]}
        >
        </PageHeaderLayout>
            <Button onClick={openAdd} className="ml-auto flex items-center gap-2 bg-[#576CBC] hover:bg-[#19376D] text-white font-bold px-6 py-2 rounded-lg shadow">
            <Plus className="w-4 h-4" /> Ajouter
            </Button>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        {isLoading ? (
          <div>Chargement...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-600">Id</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-600">Nom</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-600">Description</th>
                <th className="px-4 py-2 text-center text-xs font-bold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {statuses.map((status) => (
                <tr key={status.id} className="border-b hover:bg-blue-50">
                  <td className="px-4 py-2 font-medium text-left text-gray-800">{status.id}</td>
                  <td className="px-4 py-2 font-medium text-left text-gray-800">{status.name}</td>
                  <td className="px-4 py-2 text-left text-gray-500">{status.description ?? 'Aucune description'}</td>
                  <td className="px-4 py-2 text-center flex gap-2 justify-center">
                    <Button variant="ghost" size="icon" onClick={() => openShow(status)}><Eye className="w-5 h-5 text-blue-600" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(status)}><Pen className="w-5 h-5 text-green-600" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(status)}><Trash className="w-5 h-5 text-red-600" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Add Modal */}
      <Dialog open={modal === 'add'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un statut de projet</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <Input name="name" placeholder="Nom du statut" value={form.name} onChange={handleChange} required />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 w-full" rows={3} />
           
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <DialogFooter>
              <Button type="submit" className="bg-[#576CBC] hover:bg-[#19376D] text-white">Ajouter</Button>
              <DialogClose asChild><Button type="button" variant="outline">Annuler</Button></DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Edit Modal */}
      <Dialog open={modal === 'edit'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le statut de projet</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <Input name="name" placeholder="Nom du statut" value={form.name} onChange={handleChange} required />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 w-full" rows={3} />
            
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <DialogFooter>
              <Button type="submit" className="bg-[#576CBC] hover:bg-[#19376D] text-white">Enregistrer</Button>
              <DialogClose asChild><Button type="button" variant="outline">Annuler</Button></DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Show Modal */}
      <Dialog open={modal === 'show'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détail du statut de projet</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div>
                <span className="block text-xs text-gray-500">Nom</span>
                <span className="font-semibold text-gray-800 text-sm">{selected.name}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">Description</span>
                <span className="font-semibold text-gray-800 text-sm">{selected.description}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Fermer</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectStatusesPage; 
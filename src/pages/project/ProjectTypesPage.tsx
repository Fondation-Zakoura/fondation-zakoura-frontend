import React, { useState } from 'react';
import { useGetProjectTypesQuery, useCreateProjectTypeMutation, useUpdateProjectTypeMutation, useDeleteProjectTypeMutation } from '@/features/api/projectsApi';
import type { ProjectType } from '@/features/types/project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pen, Eye, Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { PageHeaderLayout } from '@/layouts/MainLayout';

const emptyType: ProjectType = { id: 0, name: '', description: '' };

const ProjectTypesPage: React.FC = () => {
  const { data: types = [], isLoading, refetch } = useGetProjectTypesQuery();
  const [createType] = useCreateProjectTypeMutation();
  const [updateType] = useUpdateProjectTypeMutation();
  const [deleteType] = useDeleteProjectTypeMutation();

  const [modal, setModal] = useState<'add' | 'edit' | 'show' | null>(null);
  const [selected, setSelected] = useState<ProjectType | null>(null);
  const [form, setForm] = useState(emptyType);
  const [error, setError] = useState('');

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
    try {
      await createType({ name: form.name, description: form.description }).unwrap();
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
      await updateType({ id: selected.id, body: { name: form.name, description: form.description } }).unwrap();
      closeModal();
      refetch();
    } catch (err: any) {
      setError(err.data?.message || 'Erreur lors de la modification');
    }
  };

  const handleDelete = async (type: ProjectType) => {
    if (!window.confirm('Supprimer ce type de projet ?')) return;
    try {
      await deleteType(type.id).unwrap();
      refetch();
    } catch (err: any) {
      alert(err.data?.message || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="p-8">
      <PageHeaderLayout
        title="Types de projet"
        breadcrumbs={[
          { label: 'Tableaux de bord' },
          { label: 'Types de projet', active: true }
        ]}
      >
        <Button onClick={openAdd} className="ml-auto flex items-center gap-2 bg-[#576CBC] hover:bg-[#19376D] text-white font-bold px-6 py-2 rounded-lg shadow">
          <Plus className="w-4 h-4" /> Ajouter
        </Button>
      </PageHeaderLayout>
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
              {types.map((type) => (
                <tr key={type.id} className="border-b hover:bg-blue-50">
                  <td className="px-4 py-2 font-medium text-left text-gray-800">{type.id}</td>
                  <td className="px-4 py-2 font-medium text-left text-gray-800">{type.name}</td>
                  <td className="px-4 py-2 text-left text-gray-500">{type.description ?? 'Aucune description'}</td>
                  <td className="px-4 py-2 text-center flex gap-2 justify-center">
                    <Button variant="ghost" size="icon" onClick={() => openShow(type)}><Eye className="w-5 h-5 text-blue-600" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(type)}><Pen className="w-5 h-5 text-green-600" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(type)}><Trash className="w-5 h-5 text-red-600" /></Button>
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
            <DialogTitle>Ajouter un type de projet</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <Input name="name" placeholder="Nom du type" value={form.name} onChange={handleChange} required />
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
            <DialogTitle>Modifier le type de projet</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <Input name="name" placeholder="Nom du type" value={form.name} onChange={handleChange} required />
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
            <DialogTitle>Détail du type de projet</DialogTitle>
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

export default ProjectTypesPage; 
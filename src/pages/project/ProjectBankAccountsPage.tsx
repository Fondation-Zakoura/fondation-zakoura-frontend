import React, { useState } from 'react';
import { useGetProjectBankAccountsQuery, useCreateProjectBankAccountMutation, useUpdateProjectBankAccountMutation, useDeleteProjectBankAccountMutation } from '@/features/api/projectsApi';
import type {  ProjectBankAccount } from '@/features/types/project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pen, Eye, Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { PageHeaderLayout } from '@/layouts/MainLayout';

const emptyAccount: ProjectBankAccount = { id: 0, rib: '', agency: '', bank: '' };

const ProjectBankAccountsPage: React.FC = () => {
  const { data:accounts = [], isLoading, refetch } = useGetProjectBankAccountsQuery();

  const [createAccount] = useCreateProjectBankAccountMutation();
  const [updateAccount] = useUpdateProjectBankAccountMutation();
  const [deleteAccount] = useDeleteProjectBankAccountMutation();

  const [modal, setModal] = useState<'add' | 'edit' | 'show' | null>(null);
  const [selected, setSelected] = useState<ProjectBankAccount | null>(null);
  const [form, setForm] = useState(emptyAccount);
  const [error, setError] = useState('');

  const openAdd = () => { setForm(emptyAccount); setModal('add'); };
  const openEdit = (account: ProjectBankAccount) => { setForm(account); setSelected(account); setModal('edit'); };
  const openShow = (account: ProjectBankAccount) => { setSelected(account); setModal('show'); };
  const closeModal = () => { setModal(null); setSelected(null); setForm(emptyAccount); setError(''); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createAccount({ rib: form.rib, agency: form.agency, bank: form.bank }).unwrap();
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
      await updateAccount({ id: selected.id, body: { rib: form.rib, agency: form.agency, bank: form.bank } }).unwrap();
      closeModal();
      refetch();
    } catch (err: any) {
      setError(err.data?.message || 'Erreur lors de la modification');
    }
  };

  const handleDelete = async (account: ProjectBankAccount) => {
    if (!window.confirm('Supprimer ce compte bancaire ?')) return;
    try {
      await deleteAccount(account.id).unwrap();
      refetch();
    } catch (err: any) {
      alert(err.data?.message || 'Erreur lors de la suppression');
    }
  };

  

  return (
    <div className="p-8">
      <PageHeaderLayout
        title="Comptes bancaires de projet"
        breadcrumbs={[
          { label: 'Tableaux de bord' },
          { label: 'Comptes bancaires de projet', active: true }
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
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-600">RIB</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-600">Agence</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-600">Banque</th>
                <th className="px-4 py-2 text-center text-xs font-bold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account:ProjectBankAccount,index:number) => (
                <tr key={index} className="border-b hover:bg-blue-50">
                  <td className="px-4 py-2 font-medium text-left text-gray-800">{account.id}</td>
                  <td className="px-4 py-2 font-medium text-left text-gray-800">{account.rib}</td>
                  <td className="px-4 py-2 text-left text-gray-500">{account.agency}</td>
                  <td className="px-4 py-2 text-left text-gray-500">{account.bank}</td>
                  <td className="px-4 py-2 text-center flex gap-2 justify-center">
                    <Button variant="ghost" size="icon" onClick={() => openShow(account)}><Eye className="w-5 h-5 text-blue-600" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(account)}><Pen className="w-5 h-5 text-green-600" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(account)}><Trash className="w-5 h-5 text-red-600" /></Button>
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
            <DialogTitle>Ajouter un compte bancaire</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <Input name="rib" placeholder="RIB" value={form.rib} onChange={handleChange} required />
            <Input name="agency" placeholder="Agence" value={form.agency} onChange={handleChange} required />
            <Input name="bank" placeholder="Banque" value={form.bank} onChange={handleChange} required />
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
            <DialogTitle>Modifier le compte bancaire</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <Input name="rib" placeholder="RIB" value={form.rib} onChange={handleChange} required />
            <Input name="agency" placeholder="Agence" value={form.agency} onChange={handleChange} required />
            <Input name="bank" placeholder="Banque" value={form.bank} onChange={handleChange} required />
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
            <DialogTitle>Détail du compte bancaire</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div>
                <span className="block text-xs text-gray-500">RIB</span>
                <span className="font-semibold text-gray-800 text-sm">{selected.rib}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">Agence</span>
                <span className="font-semibold text-gray-800 text-sm">{selected.agency}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">Banque</span>
                <span className="font-semibold text-gray-800 text-sm">{selected.bank}</span>
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

export default ProjectBankAccountsPage; 
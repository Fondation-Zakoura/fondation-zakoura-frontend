import React, { useState, useMemo } from 'react';
import { useGetProjectBankAccountsQuery, useCreateProjectBankAccountMutation, useUpdateProjectBankAccountMutation, useDeleteProjectBankAccountMutation } from '@/features/api/projectsApi';
import type {  ProjectBankAccount } from '@/features/types/project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pen, Eye, Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { PageHeaderLayout } from '@/layouts/MainLayout';
import type { Column, ColumnFilter } from "@/components/ui/data-table";
import { DataTable } from '@/components/ui/data-table';

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
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<ProjectBankAccount | null>(null);

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

  const columnFilters = useMemo((): ColumnFilter<ProjectBankAccount>[] => {
    const uniqueRibs = Array.from(new Set(accounts.map(a => a.rib)));
    const uniqueAgencies = Array.from(new Set(accounts.map(a => a.agency)));
    const uniqueBanks = Array.from(new Set(accounts.map(a => a.bank)));

    return [
      {
        id: "rib",
        label: "RIB",
        options: uniqueRibs.map(rib => ({ value: rib, label: rib }))
      },
      {
        id: "agency",
        label: "Agence",
        options: uniqueAgencies.map(agency => ({ value: agency, label: agency }))
      },
      {
        id: "bank",
        label: "Banque",
        options: uniqueBanks.map(bank => ({ value: bank, label: bank }))
      }
    ];
  }, [accounts]);

  const columns: Column<ProjectBankAccount>[] = [
    { key: "rib", header: "RIB",sortable:true },
    { key: "agency", header: "Agence" ,sortable:true},
    { key: "bank", header: "Banque" ,sortable:true},
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => openShow(row)} className="p-2 rounded hover:bg-gray-200 text-gray-600" title="Voir"><Eye size={16} /></button>
          <button onClick={() => openEdit(row)} className="p-2 rounded hover:bg-blue-100 text-blue-600" title="Éditer"><Pen size={16} /></button>
          <button
            onClick={() => {
              setAccountToDelete(row);
              setConfirmDeleteOpen(true);
            }}
            className="p-2 rounded hover:bg-red-100 text-red-600"
            title="Supprimer"
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
            title="Comptes bancaires de projet"
            breadcrumbs={[
            { label: 'Tableaux de bord' },
            { label: 'Comptes bancaires de projet', active: true }
            ]}
        >
        </PageHeaderLayout>
        <Button onClick={openAdd} className="ml-auto flex items-center gap-2 bg-[#19376D] hover:bg-[#19386df9] text-white font-bold px-6 py-2 cursor-pointer rounded-lg shadow">
        <Plus className="w-4 h-4" /> Ajouter
        </Button>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        {isLoading ? (
          <div>Chargement...</div>
        ) : (
          <DataTable 
          columns={columns}
          data={accounts}
          hoverEffect
          emptyText={isLoading ? 'Chargement des données...'  : 'Aucun partenaire trouvé'}
          headerStyle={'primary'}
          striped
          initialPageSize={10}
          columnFilters={columnFilters}
          /> 
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
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce compte bancaire ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (accountToDelete) {
                  await handleDelete(accountToDelete);
                  setConfirmDeleteOpen(false);
                  setAccountToDelete(null);
                }
              }}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectBankAccountsPage; 
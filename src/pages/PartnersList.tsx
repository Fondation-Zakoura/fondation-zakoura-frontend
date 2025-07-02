import React, { useState, useMemo, useCallback } from "react";
import { Plus, Trash2, ChevronRight, Eye, Pencil } from "lucide-react";
import { AddEditPartnerModal } from "../components/partners/AddEditPartnerModal";
import { PartnerDetailsModal } from "../components/partners/PartnersTable";
import type { Partner, FilterOption } from "../types/partners";
import {
  useGetPartnersQuery,
  useAddPartnerMutation,
  useUpdatePartnerMutation,
  useDeletePartnersMutation,
  useGetOptionsQuery,
} from "../features/partnersApi";
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
import { PageHeaderLayout } from '@/layouts/MainLayout';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";


// --- MAIN PAGE COMPONENT ---
const PartnersListPage: React.FC = () => {
  // State for modals and single item actions
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPartnerForDetails, setSelectedPartnerForDetails] = useState<Partner | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  
  // State for bulk delete
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // Loading states for delete dialogs
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const navigate = useNavigate();

  // RTK Query: Fetch ALL partners once
  const { data: partnersData, error: fetchError, isLoading, refetch } = useGetPartnersQuery({ filters: {} });

  const [addPartner] = useAddPartnerMutation();
  const [updatePartner] = useUpdatePartnerMutation();
  const [deletePartners] = useDeletePartnersMutation();

  // RTK Query: Fetch filter options
  const { data: natures = [] } = useGetOptionsQuery("nature-partners");
  const { data: structures = [] } = useGetOptionsQuery("structure-partners");
  const { data: statuts = [] } = useGetOptionsQuery("status-partners");

  // Memoize partners list and derived filter options to prevent re-renders
  const allPartners = useMemo(() => partnersData?.data || [], [partnersData]);

  const filterOptions = useMemo(() => {
    const typeOptions: FilterOption[] = [
      { id: "National", name: "National" },
      { id: "International", name: "International" },
    ];
    return {
      natures,
      structures,
      statuts,
      types: typeOptions,
    };
  }, [natures, structures, statuts]);

  // Prepare the filter configuration for the DataTable
  const columnFilters = useMemo((): ColumnFilter<Partner>[] => {
    return [
      {
        id: "nature_partner",
        label: "Nature du partenaire",
        options: (filterOptions.natures || []).map((n) => ({ value: n.name, label: n.name })),
      },
      {
        id: "partner_type",
        label: "Type du partenaire",
        options: (filterOptions.types || []).map((t) => ({ value: t.name, label: t.name })),
      },
      {
        id: "structure_partner",
        label: "Structure du partenaire",
        options: (filterOptions.structures || []).map((s) => ({ value: s.name, label: s.name })),
      },
    ];
  }, [filterOptions]);

  // --- Modal and Action Handlers (wrapped in useCallback) ---
  const handleOpenAddModal = useCallback(() => {
    setEditingPartner(null);
    setEditModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((partner: Partner) => {
    setEditingPartner(partner);
    setEditModalOpen(true);
  }, []);

  const handleSavePartner = useCallback(async (formData: FormData, id?: number) => {
    setIsSaving(true);
    try {
      if (id) {
        await updatePartner({ id, data: formData }).unwrap();
      } else {
        await addPartner(formData).unwrap();
      }
      setEditModalOpen(false);
      refetch();
    } catch (err) {
      console.error("Failed to save partner:", err);
    } finally {
      setIsSaving(false);
    }
  }, [addPartner, updatePartner, refetch]);

  const handleDeleteRequest = useCallback((id: number) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  }, []);
  
  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDeleteId) return;
    setIsDeleting(true);
    try {
      await deletePartners([pendingDeleteId]).unwrap();
      setConfirmOpen(false);
      setPendingDeleteId(null);
      refetch();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  }, [pendingDeleteId, deletePartners, refetch]);

  const handleCancelDelete = useCallback(() => {
    if (isDeleting) return; // Prevent closing while deleting
    setConfirmOpen(false);
    setPendingDeleteId(null);
  }, [isDeleting]);

  const handleViewDetails = useCallback((partner: Partner) => {
    setSelectedPartnerForDetails(partner);
  }, []);

  const handleBulkDelete = useCallback((ids: number[]) => {
    if (!ids.length) return;
    setPendingDeleteIds(ids);
    setShowBulkDeleteDialog(true);
  }, []);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (!pendingDeleteIds.length) return;
    setIsBulkDeleting(true);
    try {
      await deletePartners(pendingDeleteIds).unwrap();
      setPendingDeleteIds([]);
      setShowBulkDeleteDialog(false);
      refetch();
    } catch (err) {
      console.error("Bulk delete failed:", err);
    } finally {
      setIsBulkDeleting(false);
    }
  }, [deletePartners, pendingDeleteIds, refetch]);


  // --- DataTable Column Definitions ---
  const columns: Column<Partner>[] = useMemo(() => [
    {
      key: "partner_logo",
      header: "Logo",
      render: (row) =>
        row.logo_url ? (
          <img
            src={row.logo_url}
            alt={row.partner_name}
            className="h-10 w-10 rounded-full object-cover border"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
            <span className="text-xs font-bold">{row.partner_name?.[0]?.toUpperCase() || "?"}</span>
          </div>
        ),
      width: 80,
      align: "center",
    },
    { key: "partner_name", header: "Nom", sortable: true },
    { key: "abbreviation", header: "Abbr.", sortable: true },
    { key: "country", header: "Pays", sortable: true },
    { key: "partner_type", header: "Type", sortable: true },
    { key: "nature_partner", header: "Nature", sortable: true },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => handleViewDetails(row)} className="p-2 rounded hover:bg-gray-200 text-gray-600" title="Voir"><Eye size={16} /></button>
          <button onClick={() => handleOpenEditModal(row)} className="p-2 rounded hover:bg-blue-100 text-blue-600" title="Éditer"><Pencil size={16} /></button>
          <button onClick={() => handleDeleteRequest(row.id)} className="p-2 rounded hover:bg-red-100 text-red-600" title="Supprimer"><Trash2 size={16} /></button>
        </div>
      ),
    },
  ], [handleViewDetails, handleOpenEditModal, handleDeleteRequest]); // Dependencies are now stable

  return (
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Liste des Partenaires"
          breadcrumbs={[
            { label: 'Tableaux de bord' },
            { label: 'Partenariat', active: true }
          ]}
        />
        <Button
          className="bg-[#008c95] hover:bg-[#19376D] text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2"
          onClick={handleOpenAddModal}
        >
          <Plus size={18} /> Ajouter un partenaire
        </Button>
      </div>
      <div className="max-w-screen-2xl mx-auto ">
        {fetchError && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p className="font-bold">Erreur de chargement</p>
            <p>{String(fetchError)}</p>
          </div>
        )}

        <DataTable
          columns={columns}
          data={allPartners}
          columnFilters={columnFilters}
          emptyText={isLoading ? "Chargement des données..." : "Aucun partenaire trouvé"}
          initialPageSize={10}
          headerStyle="primary"
          hoverEffect
          striped
          onBulkDelete={handleBulkDelete}
        />
      </div>

      <AddEditPartnerModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
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

<<<<<<< HEAD
      {confirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 p-2 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Confirmer la suppression</h3>
              <p className="mt-2 text-sm text-gray-500">Êtes-vous sûr de vouloir supprimer ce partenaire ? Cette action est réversible (soft delete).</p>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
              <button
                type="button"
                disabled={isDeleting}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handleConfirmDelete}
              >
                {isDeleting && <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>}
                Confirmer
              </button>
              <button
                type="button"
                disabled={isDeleting}
                className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handleCancelDelete}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
=======
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirmer la suppression</DialogTitle>
      <DialogDescription>
        Êtes-vous sûr de vouloir supprimer ce partenaire ? Cette action est réversible (soft delete).
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button
          type="button"
          variant="outline"
          disabled={isDeleting}
          onClick={handleCancelDelete}
        >
          Annuler
        </Button>
      </DialogClose>
      <Button
        type="button"
        variant="destructive"
        disabled={isDeleting}
        onClick={handleConfirmDelete}
      >
        {isDeleting && (
          <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        )}
        Confirmer
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
>>>>>>> 093bc3a (updating the filter to use RTK query)

      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Êtes-vous sûr de vouloir supprimer ?</DialogTitle>
            <DialogDescription>
              {pendingDeleteIds.length > 1 ? `Vous êtes sur le point de supprimer ${pendingDeleteIds.length} partenaires. ` : "Vous êtes sur le point de supprimer ce partenaire. "}Cette action est réversible (soft delete).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isBulkDeleting} onClick={() => setPendingDeleteIds([])}>
                Annuler
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={isBulkDeleting}
              onClick={handleConfirmBulkDelete}
            >
              {isBulkDeleting && <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>}
              Confirmer la suppression
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnersListPage;
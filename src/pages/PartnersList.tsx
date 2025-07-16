import React, { useState, useMemo, useCallback } from "react";
import { Plus, Trash2, Eye, Pencil, RotateCw } from "lucide-react";
import { AddEditPartnerModal } from "../components/partners/AddEditPartnerModal";
import { PartnerDetailsModal } from "../components/partners/PartnersTable";
import type { Partner  , OptionItem} from "../types/partners"; // Assuming 'Partner' is defined here
import {
  useGetPartnersQuery,
  useAddPartnerMutation,
  useUpdatePartnerMutation,
  useDeletePartnersMutation,
  useGetOptionsQuery,
} from "../features/partnersApi";
import { DataTable } from "../components/ui/data-table";
import type { Column, ColumnFilter } from "../components/ui/data-table"; // Import ColumnFilter WITHOUT generic
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { PageHeaderLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";

// --- MAIN PAGE COMPONENT ---
const PartnersListPage: React.FC = () => {
  // State for modals and single item actions
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPartnerForDetails, setSelectedPartnerForDetails] =
    useState<Partner | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // State for the partner being activated or deactivated
  const [partnerToAction, setPartnerToAction] = useState<Partner | null>(null);

  // State for bulk delete/toggle
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // Loading states for delete dialogs
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // RTK Query: Fetch ALL partners once
  const {
    data: partnersData,
    error: fetchError,
    isLoading,
    refetch,
  } = useGetPartnersQuery({ filters: {} });

  const [addPartner] = useAddPartnerMutation();
  const [updatePartner] = useUpdatePartnerMutation();
  const [deletePartners] = useDeletePartnersMutation();

  // RTK Query: Fetch filter options
  // Use GetOptionsResponse as the generic type for useGetOptionsQuery
  const { data: natures } = useGetOptionsQuery("nature-partners");
  const { data: structures } = useGetOptionsQuery("structure-partners");
  const { data: statuts } = useGetOptionsQuery("status-partners");
  // Memoize partners list and derived filter options to prevent re-renders
  const allPartners = useMemo(() => partnersData?.data || [], [partnersData]);
  // Inside PartnersListPage, before the filterOptions useMemo
console.log("Natures data:", natures);
console.log("Structures data:", structures);
console.log("Statuts data:", statuts);

  // Derive filter options inside useMemo and explicitly type them
// Derive filter options inside useMemo and explicitly type them
const filterOptions = useMemo(() => {
    const typeOptions: OptionItem[] = [
        { id: "National", name: "National" },
        { id: "International", name: "International" },
    ];

    return {

        natures: natures?.data || [],
        structures: structures?.data || [],
        statuts: statuts?.data || [],
        types: typeOptions,
    };
}, [natures, structures, statuts]); // This dependency array is correct


  // Prepare the filter configuration for the DataTable
  // Correct: ColumnFilter is NOT generic
  const columnFilters = useMemo((): ColumnFilter[] => {
    return [
      {
        id: "nature_partner",
        label: "Nature du partenaire",
        // Explicitly type 'n' as OptionItem
        options: (filterOptions.natures || []).map((n: OptionItem) => ({
          value: String(n.name), // Ensure value is a string
          label: n.name,
        })),
      },
      {
        id: "partner_type",
        label: "Type du partenaire",
        // Explicitly type 't' as OptionItem
        options: (filterOptions.types || []).map((t: OptionItem) => ({
          value: String(t.name), // Ensure value is a string
          label: t.name,
        })),
      },
      {
        id: "structure_partner",
        label: "Structure du partenaire",
        // Explicitly type 's' as OptionItem
        options: (filterOptions.structures || []).map((s: OptionItem) => ({
          value: String(s.name), // Ensure value is a string
          label: s.name,
        })),
      },
      {
        id: "status",
        label: "Phase du partenaire",
        // Explicitly type 's' as OptionItem
        options: (filterOptions.statuts || []).map((s: OptionItem) => ({
          value: String(s.name), // Ensure value is a string
          label: s.name,
        })),
      },
    ];
  }, [filterOptions]); // Now correctly depends on filterOptions

  // --- Modal and Action Handlers (wrapped in useCallback) ---
  const handleOpenAddModal = useCallback(() => {
    setEditingPartner(null);
    setEditModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((partner: Partner) => {
    setEditingPartner(partner);
    setEditModalOpen(true);
  }, []);

  const handleSavePartner = useCallback(
    async (formData: FormData, id?: number) => {
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
    },
    [addPartner, updatePartner, refetch]
  );

  const handleToggleRequest = useCallback((partner: Partner) => {
    setPartnerToAction(partner);
    setConfirmOpen(true);
  }, []);

  const handleConfirmToggle = useCallback(async () => {
    if (!partnerToAction) return;
    setIsDeleting(true);
    try {
      // Assuming deletePartners expects an array of numbers (partner IDs)
      await deletePartners([partnerToAction.id]).unwrap();
      setConfirmOpen(false);
      setPartnerToAction(null);
      refetch();
    } catch (err) {
      console.error("Toggle failed:", err);
    } finally {
      setIsDeleting(false);
    }
  }, [partnerToAction, deletePartners, refetch]);

  const handleCancelToggle = useCallback(() => {
    if (isDeleting) return;
    setConfirmOpen(false);
    setPartnerToAction(null);
  }, [isDeleting]);

  const handleViewDetails = useCallback((partner: Partner) => {
    setSelectedPartnerForDetails(partner);
  }, []);

  const handleBulkDelete = useCallback((ids: (string | number)[]) => {
    // Convert to number[] as per pendingDeleteIds state type
    const numericIds = ids.map((id) => Number(id));
    if (!numericIds.length) return;
    setPendingDeleteIds(numericIds);
    setShowBulkDeleteDialog(true);
  }, []);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (!pendingDeleteIds.length) return;
    setIsBulkDeleting(true);
    try {
      // Assuming deletePartners expects an array of numbers (partner IDs)
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

  // --- DataTable Column Definitions (Updated) ---
  const columns: Column<Partner>[] = useMemo(
    () => [
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
              <span className="text-xs font-bold">
                {row.partner_name?.[0]?.toUpperCase() || "?"}
              </span>
            </div>
          ),
        width: 80,
        align: "center",
      },
      { key: "partner_name", header: "Nom du partenaire", sortable: true },
      { key: "abbreviation", header: "Abréviation", sortable: true },
      { key: "phone", header: "Téléphone", sortable: true },
      { key: "email", header: "E-mail", sortable: true },
      { key: "country", header: "Pays", sortable: true },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        render: (row) => (
          <div className="flex gap-1 justify-end">
            <button
              onClick={() => handleViewDetails(row)}
              className="p-2 rounded hover:bg-gray-200 text-gray-600"
              title="Voir"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => handleOpenEditModal(row)}
              className="p-2 rounded hover:bg-blue-100 text-blue-600"
              title="Éditer"
            >
              <Pencil size={16} />
            </button>
            {row.deleted_at ? (
              <button
                onClick={() => handleToggleRequest(row)}
                className="p-2 rounded hover:bg-green-100 text-green-600"
                title="Réactiver"
              >
                <RotateCw size={16} />
              </button>
            ) : (
              <button
                onClick={() => handleToggleRequest(row)}
                className="p-2 rounded hover:bg-red-100 text-red-600"
                title="Désactiver"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ),
      },
    ],
    [handleViewDetails, handleOpenEditModal, handleToggleRequest]
  );

  return (
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Liste des Partenaires"
          breadcrumbs={[
            { label: "Tableaux de bord" },
            { label: "Partenariat", active: true },
          ]}
        />
        <Button
          className="bg-[#576CBC] hover:bg-[#19376D] text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2"
          onClick={handleOpenAddModal}
        >
          <Plus size={18} /> Ajouter un partenaire
        </Button>
      </div>
      <div className="max-w-screen-2xl mx-auto ">
        {fetchError && (
          <div
            className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
            role="alert"
          >
            <p className="font-bold">Erreur de chargement</p>
            <p>{String(fetchError)}</p>
          </div>
        )}

        <DataTable
          columns={columns}
          data={allPartners}
          columnFilters={columnFilters}
          emptyText={
            isLoading ? "Chargement des données..." : "Aucun partenaire trouvé"
          }
          initialPageSize={10}
          headerStyle="primary"
          hoverEffect
          striped
          onBulkDelete={handleBulkDelete}
          globalFilterKey="partner_name"
        />
      </div>

      <AddEditPartnerModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSavePartner}
        partner={editingPartner}
        options={filterOptions} // Pass the correctly structured filterOptions
        serverErrors={{}}
        isLoading={isSaving}
      />
      <PartnerDetailsModal
        isOpen={!!selectedPartnerForDetails}
        onClose={() => setSelectedPartnerForDetails(null)}
        partner={selectedPartnerForDetails}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {partnerToAction?.deleted_at
                ? "Confirmer la réactivation"
                : "Confirmer la désactivation"}
            </DialogTitle>
            <DialogDescription>
              {partnerToAction?.deleted_at
                ? `Êtes-vous sûr de vouloir réactiver le partenaire "${partnerToAction?.partner_name}" ?`
                : `Êtes-vous sûr de vouloir désactiver le partenaire "${partnerToAction?.partner_name}" ? Cette action est réversible.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={handleCancelToggle}
              >
                Annuler
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant={partnerToAction?.deleted_at ? "default" : "destructive"}
              disabled={isDeleting}
              onClick={handleConfirmToggle}
            >
              {isDeleting && (
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {partnerToAction?.deleted_at ? "Réactiver" : "Désactiver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'action groupée</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de modifier le statut de{" "}
              {pendingDeleteIds.length} partenaire(s). Les partenaires actifs
              seront désactivés et les inactifs seront réactivés. Êtes-vous sûr
              de vouloir continuer ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isBulkDeleting}
                onClick={() => setPendingDeleteIds([])}
              >
                Annuler
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={isBulkDeleting}
              onClick={handleConfirmBulkDelete}
            >
              {isBulkDeleting && (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnersListPage;

import React, { useState, useMemo, useCallback } from "react";
import { Plus, Trash2, Eye, Pencil, RotateCw, Loader2, AlertCircle } from "lucide-react";
import { AddEditPartnerModal } from "../components/partners/AddEditPartnerModal";
import { PartnerDetailsModal } from "../components/partners/PartnersTable"; // Assuming PartnerDetailsModal is defined here
import type { Partner, OptionItem   } from "../types/partners";
import {
  useGetPartnersQuery,
  useAddPartnerMutation,
  useUpdatePartnerMutation,
  useDeletePartnersMutation,
  useGetPartnerOptionsQuery, // Updated hook name
} from "../features/api/partnersApi";
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
import { PageHeaderLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

// --- MAIN PAGE COMPONENT ---
const PartnersListPage: React.FC = () => {
  // State for modals and single item actions
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPartnerForDetails, setSelectedPartnerForDetails] = useState<Partner | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // State for the partner being activated or deactivated
  const [partnerToAction, setPartnerToAction] = useState<Partner | null>(null);

  // State for bulk delete/toggle
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // Loading states for delete dialogs
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [tableFilters, setTableFilters] = useState<Record<string, string | string[]>>({});
  const [selectedRows, setSelectedRows] = useState<Partner[]>([]);
  const [dialogErrorMessage, setDialogErrorMessage] = useState<string | null>(null);

  // RTK Query: Fetch Partners with filters and pagination
  const {
    data: partnersApiResponse, // This will be ApiResponse<Partner> | undefined
    error: fetchError,
    isLoading,
    refetch,
  } = useGetPartnersQuery({ filters: tableFilters, page: 1 });

  const [addPartner] = useAddPartnerMutation();
  const [updatePartner] = useUpdatePartnerMutation();
  const [deletePartners] = useDeletePartnersMutation(); // Used for both single and bulk toggle/delete

  // RTK Query: Fetch filter options
  const { data: naturesData, isLoading: isLoadingNatures } = useGetPartnerOptionsQuery("nature-partners");
  const { data: structuresData, isLoading: isLoadingStructures } = useGetPartnerOptionsQuery("structure-partners");
  const { data: statutsData, isLoading: isLoadingStatuts } = useGetPartnerOptionsQuery("status-partners");

  // Memoize partners list and derived filter options to prevent re-renders
  const allPartners = useMemo(() => partnersApiResponse?.data || [], [partnersApiResponse]);

  // Derive filter options inside useMemo and explicitly type them
  const filterOptions = useMemo(() => {
    const typeOptions: OptionItem[] = [
      { id: "National", name: "National" },
      { id: "International", name: "International" },
    ];

    return {
      natures: naturesData?.data || [],
      structures: structuresData?.data || [],
      statuts: statutsData?.data || [],
      types: typeOptions,
    };
  }, [naturesData, structuresData, statutsData]);

  // Prepare the filter configuration for the DataTable
  const columnFilters = useMemo((): ColumnFilter[] => {
    return [
      {
        id: "nature_partner",
        label: "Nature du partenaire",
        options: (filterOptions.natures || []).map((n: OptionItem) => ({
          value: String(n.name),
          label: n.name,
        })),
        isLoading: isLoadingNatures,
      },
      {
        id: "partner_type",
        label: "Type du partenaire",
        options: (filterOptions.types || []).map((t: OptionItem) => ({
          value: String(t.name),
          label: t.name,
        })),
      },
      {
        id: "structure_partner",
        label: "Structure du partenaire",
        options: (filterOptions.structures || []).map((s: OptionItem) => ({
          value: String(s.name),
          label: s.name,
        })),
        isLoading: isLoadingStructures,
      },
      {
        id: "status",
        label: "Phase du partenaire",
        options: (filterOptions.statuts || []).map((s: OptionItem) => ({
          value: String(s.name),
          label: s.name,
        })),
        isLoading: isLoadingStatuts,
      },
    ];
  }, [filterOptions, isLoadingNatures, isLoadingStructures, isLoadingStatuts]);

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
      setDialogErrorMessage(null); // Clear previous errors
      try {
        if (id) {
          await updatePartner({ id, data: formData }).unwrap();
        } else {
          await addPartner(formData).unwrap();
        }
        setEditModalOpen(false);
        refetch();
      } catch (err: unknown) {
        console.error("Failed to save partner:", err);
        const error = err as FetchBaseQueryError;
        const msg = (error.data && typeof error.data === 'object' && 'message' in error.data)
          ? (error.data as { message: string }).message
          : "Une erreur est survenue lors de l'enregistrement du partenaire.";
        setDialogErrorMessage(msg); // Set error for display if modal supports it
      } finally {
        setIsSaving(false);
      }
    },
    [addPartner, updatePartner, refetch]
  );

  const handleToggleRequest = useCallback((partner: Partner) => {
    setPartnerToAction(partner);
    setDialogErrorMessage(null); // Clear previous errors
    setConfirmOpen(true);
  }, []);

  const handleConfirmToggle = useCallback(async () => {
    if (!partnerToAction) return;
    setIsDeleting(true);
    setDialogErrorMessage(null); // Clear previous errors
    try {
      // Assuming deletePartners endpoint also handles soft deletes/restores based on IDs
      // You might need a specific backend endpoint for toggle, or your current delete handles it.
      await deletePartners([partnerToAction.id]).unwrap();
      setConfirmOpen(false);
      setPartnerToAction(null);
      refetch();
    } catch (err: unknown) {
      console.error("Toggle failed:", err);
      const error = err as FetchBaseQueryError;
      const msg = (error.data && typeof error.data === 'object' && 'message' in error.data)
        ? (error.data as { message: string }).message
        : "Une erreur est survenue lors du changement de statut du partenaire.";
      setDialogErrorMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  }, [partnerToAction, deletePartners, refetch]);

  const handleCancelToggle = useCallback(() => {
    if (isDeleting) return;
    setConfirmOpen(false);
    setPartnerToAction(null);
    setDialogErrorMessage(null); // Clear error on cancel
  }, [isDeleting]);

  const handleViewDetails = useCallback((partner: Partner) => {
    setSelectedPartnerForDetails(partner);
  }, []);

  const handleBulkDelete = useCallback((ids: (string | number)[]) => {
    const numericIds = ids.map((id) => Number(id));
    if (!numericIds.length) return;
    setPendingDeleteIds(numericIds);
    setDialogErrorMessage(null); // Clear previous errors
    setShowBulkDeleteDialog(true);
  }, []);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (!pendingDeleteIds.length) return;
    setIsBulkDeleting(true);
    setDialogErrorMessage(null); // Clear previous errors
    try {
      await deletePartners(pendingDeleteIds).unwrap();
      setPendingDeleteIds([]);
      setShowBulkDeleteDialog(false);
      setSelectedRows([]); // Clear selected rows after bulk action
      refetch();
    } catch (err: unknown) {
      console.error("Bulk delete/toggle failed:", err);
      const error = err as FetchBaseQueryError;
      const msg = (error.data && typeof error.data === 'object' && 'message' in error.data)
        ? (error.data as { message: string }).message
        : "Une erreur est survenue lors de l'action groupée sur les partenaires.";
      setDialogErrorMessage(msg);
    } finally {
      setIsBulkDeleting(false);
    }
  }, [deletePartners, pendingDeleteIds, refetch]);

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
        width: '80px',
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
        width: '120px',
        render: (row) => (
          <div className="flex gap-1 justify-end">
            <Button
              onClick={() => handleViewDetails(row)}
              className="p-2 rounded hover:bg-gray-200 text-gray-600"
              title="Voir"
              variant="ghost"
              size="sm"
            >
              <Eye size={16} />
            </Button>
            <Button
              onClick={() => handleOpenEditModal(row)}
              className="p-2 rounded hover:bg-blue-100 text-blue-600"
              title="Éditer"
              variant="ghost"
              size="sm"
            >
              <Pencil size={16} />
            </Button>
            {row.deleted_at ? (
              <Button
                onClick={() => handleToggleRequest(row)}
                className="p-2 rounded hover:bg-green-100 text-green-600"
                title="Réactiver"
                variant="ghost"
                size="sm"
              >
                <RotateCw size={16} />
              </Button>
            ) : (
              <Button
                onClick={() => handleToggleRequest(row)}
                className="p-2 rounded hover:bg-red-100 text-red-600"
                title="Désactiver"
                variant="ghost"
                size="sm"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [handleViewDetails, handleOpenEditModal, handleToggleRequest]
  );

  const totalItems = partnersApiResponse?.meta?.total || 0;
  const perPage = partnersApiResponse?.meta?.per_page || 10;

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
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-[#576CBC]" />
            <p className="ml-4 text-lg text-gray-600">Chargement des données...</p>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-600">
            <AlertCircle size={48} className="mb-4" />
            <p className="text-xl font-semibold">Erreur de chargement des données</p>
            <p className="text-md text-gray-500">Impossible de récupérer les partenaires. Veuillez réessayer plus tard.</p>
            {typeof fetchError === 'object' && fetchError !== null && 'status' in fetchError && (
              <p className="text-sm text-gray-500 mt-2">Status: {(fetchError as FetchBaseQueryError).status}</p>
            )}
          </div>
        ) : (
          <DataTable<Partner>
            columns={columns}
            data={allPartners}
            columnFilters={columnFilters}
            onFilterChange={setTableFilters}
            selectedRows={selectedRows}
            onSelectedRowsChange={setSelectedRows}
            emptyText={"Aucun partenaire trouvé"}
            initialPageSize={perPage}
            headerStyle="primary"
            hoverEffect
            striped
            totalItems={totalItems}
            onBulkDelete={handleBulkDelete}
            globalFilterKey="partner_name"
          />
        )}
      </div>

      <AddEditPartnerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setDialogErrorMessage(null); // Clear error on close
        }}
        onSave={handleSavePartner}
        partner={editingPartner}
        options={filterOptions}
        serverErrors={{}} // You might want to populate this with actual server errors from handleSavePartner
        isLoading={isSaving}
      />
      <PartnerDetailsModal
        isOpen={!!selectedPartnerForDetails}
        onClose={() => setSelectedPartnerForDetails(null)}
        partner={selectedPartnerForDetails}
      />

      {/* Single Toggle/Delete Dialog */}
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
              {dialogErrorMessage && (
                <p className="text-red-500 text-sm mt-2">{dialogErrorMessage}</p>
              )}
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {partnerToAction?.deleted_at ? "Réactiver" : "Désactiver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'action groupée</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de modifier le statut de{" "}
              **{pendingDeleteIds.length} partenaire(s)**. Les partenaires actifs
              seront désactivés et les inactifs seront réactivés. Êtes-vous sûr
              de vouloir continuer ?
              {dialogErrorMessage && (
                <p className="text-red-500 text-sm mt-2">{dialogErrorMessage}</p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isBulkDeleting}
                onClick={() => {
                  setPendingDeleteIds([]);
                  setDialogErrorMessage(null); // Clear error on cancel
                }}
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
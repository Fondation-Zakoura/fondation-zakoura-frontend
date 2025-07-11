import React, { useState, useMemo, useCallback } from "react";
import { Plus, Trash2, Eye, Pencil, RotateCw, XCircle, CheckCircle } from "lucide-react"; // Import XCircle and CheckCircle
import { AddEditPartnerModal } from "../components/partners/AddEditPartnerModal";
import { PartnerDetailsModal } from "../components/partners/PartnersTable"; // Assuming this is correct
import type { Partner, FilterOption } from "../types/partners";
import {
  useGetPartnersQuery,
  useAddPartnerMutation,
  useUpdatePartnerMutation,
  useDeletePartnersMutation, 
  useGetOptionsQuery,
} from "../features/partnersApi";
import type { ToggleActivationResult } from "../features/partnersApi";
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
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; // Re-import toast for notifications

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
  const navigate = useNavigate();

  // State for displaying custom modal alerts (for errors only now)
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState("");
  const [customAlertMessage, setCustomAlertMessage] = useState("");
  const [customAlertVariant, setCustomAlertVariant] = useState<"success" | "error">("success"); // Still needed for error dialog styling


  // RTK Query: Fetch ALL partners once
  const {
    data: partnersData,
    error: fetchError,
    isLoading,
    isFetching, // <--- Added isFetching here
    refetch,
  } = useGetPartnersQuery({ filters: {} });

  const [addPartner] = useAddPartnerMutation();
  const [updatePartner] = useUpdatePartnerMutation();
  // Ensure useDeletePartnersMutation is correctly typed to return ToggleActivationResult[]
  const [deletePartners] = useDeletePartnersMutation();

  // RTK Query: Fetch filter options
  const { data: naturesData } = useGetOptionsQuery("nature-partners");
  const natures = naturesData?.data || [];
  const { data: structuresData } = useGetOptionsQuery("structure-partners");
  const structures = structuresData?.data || [];
  const { data: statutsData } = useGetOptionsQuery("status-partners");
  const statuts = statutsData?.data || [];

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
        options: (filterOptions.natures || []).map((n) => ({
          value: n.name,
          label: n.name,
        })),
      },
      {
        id: "partner_type",
        label: "Type du partenaire",
        options: (filterOptions.types || []).map((t) => ({
          value: t.name,
          label: t.name,
        })),
      },
      {
        id: "structure_partner",
        label: "Structure du partenaire",
        options: (filterOptions.structures || []).map((s) => ({
          value: s.name,
          label: s.name,
        })),
      },
      {
        id: "status",
        label: "Phase du partenaire",
        options: (filterOptions.statuts || []).map((s) => ({
          value: s.name,
          label: s.name,
        })),
      }
    ];
  }, [filterOptions]);

  // Function to show a custom modal alert (now primarily for errors)
  const showModalAlert = useCallback((title: string, message: string, variant: "success" | "error") => {
    setCustomAlertTitle(title);
    setCustomAlertMessage(message);
    setCustomAlertVariant(variant);
    setShowCustomAlert(true);
  }, []);

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
          toast.success("Partenaire mis à jour avec succès."); // Success toast
        } else {
          await addPartner(formData).unwrap();
          toast.success("Partenaire créé avec succès."); // Success toast
        }
        setEditModalOpen(false);
        refetch();
      } catch (err: any) { // Catch the error here
        console.error("Failed to save partner in PartnersListPage:", err);
        // Re-throw the error so AddEditPartnerModal can catch and display specific toasts
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [addPartner, updatePartner, refetch] // Removed showModalAlert from dependencies as it's not used for success here
  );

  const handleToggleRequest = useCallback((partner: Partner) => {
    setPartnerToAction(partner);
    setConfirmOpen(true);
  }, []);

  const handleConfirmToggle = useCallback(async () => {
    if (!partnerToAction) return;
    setIsDeleting(true);
    try {
      const response = await deletePartners([partnerToAction.id]);
      
      if ('data' in response && response.data) {
        // Backend returns { message: string, successful_count: number } for single successful toggle
        toast.success(response.data.message || "Statut du partenaire mis à jour avec succès."); // Success toast
      } else if ('error' in response && response.error) {
        const errorData = (response.error as any)?.data;
        
        if (errorData && errorData.failed_operations && Array.isArray(errorData.failed_operations)) {
          // This handles the 422 case where some operations failed (even for a single item)
          // Prioritize specific messages from failed_operations
          const specificMessages = errorData.failed_operations.map((failedResult: ToggleActivationResult) => failedResult.message).join("\n");
          showModalAlert("Échec de l'opération", specificMessages, "error");
        } else if (errorData && errorData.message) {
          // Generic error message from backend for other error statuses (e.g., 500)
          showModalAlert("Erreur", errorData.message, "error");
        } else {
          // Fallback generic error if the response structure is unexpected
          showModalAlert("Erreur", "Échec de la modification du statut du partenaire.", "error");
        }
        console.error("Toggle failed:", response.error);
      }
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false); // Close dialog in finally
      setPartnerToAction(null); // Reset partner in finally
      refetch(); // Refetch in finally
    }
  }, [partnerToAction, deletePartners, refetch, showModalAlert]);

  const handleCancelToggle = useCallback(() => {
    if (isDeleting) return;
    setConfirmOpen(false);
    setPartnerToAction(null);
  }, [isDeleting]);

  const handleViewDetails = useCallback((partner: Partner) => {
    setSelectedPartnerForDetails(partner);
  }, []);

  const handleBulkDelete = useCallback((ids: (string | number)[]) => {
    const numericIds = ids.map((id) => Number(id));
    if (!numericIds.length) return;
    setPendingDeleteIds(numericIds);
    setShowBulkDeleteDialog(true);
  }, []);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (!pendingDeleteIds.length) return;
    setIsBulkDeleting(true);
    try {
      const response = await deletePartners(pendingDeleteIds);
      
      if ('data' in response && response.data) {
        toast.success(response.data.message || `${response.data.successful_count} partenaire(s) mis à jour avec succès.`); // Success toast
      } else if ('error' in response && response.error) {
        const errorData = (response.error as any)?.data;
        
        if (errorData && errorData.failed_operations && Array.isArray(errorData.failed_operations)) {
          const specificMessages = errorData.failed_operations.map((failedResult: ToggleActivationResult) => failedResult.message).join("\n");
          showModalAlert("Certaines opérations ont échoué", specificMessages, "error");
          
          if (errorData.successful_count > 0) {
            toast.success(`${errorData.successful_count} partenaire(s) mis à jour avec succès.`); // Partial success toast
          }
        } else if (errorData && errorData.message) {
          showModalAlert("Erreur", errorData.message, "error");
        } else {
          // Fallback generic error if the response structure is unexpected
          showModalAlert("Erreur", "Échec de l'action groupée.", "error");
        }
        console.error("Bulk delete failed:", response.error);
      }
    } finally {
      setIsBulkDeleting(false);
      setPendingDeleteIds([]); // Reset pending IDs in finally
      setShowBulkDeleteDialog(false); // Close dialog in finally
      refetch(); // Refetch in finally
    }
  }, [deletePartners, pendingDeleteIds, refetch, showModalAlert]);

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
      {/* Custom Modal Alert (now primarily for errors) */}
      <Dialog open={showCustomAlert} onOpenChange={setShowCustomAlert}>
        <DialogContent className="max-w-md p-6 bg-white rounded-lg shadow-xl"> {/* Added padding, background, shadow */}
          <DialogHeader className="pb-4 border-b border-gray-200 mb-4"> {/* Added border-b and margin-bottom */}
            <DialogTitle className={`text-2xl font-bold flex items-center gap-2 ${customAlertVariant === "error" ? "text-red-600" : "text-green-600"}`}>
              {customAlertVariant === "error" ? <XCircle className="h-6 w-6" /> : <CheckCircle className="h-6 w-6" />}
              {customAlertTitle}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-gray-700 text-base leading-relaxed mb-6"> {/* Adjusted text styles and margin */}
            {customAlertMessage}
          </DialogDescription>
          <DialogFooter className="flex justify-end pt-4 border-t border-gray-200"> {/* Added padding and border-t */}
            <Button onClick={() => setShowCustomAlert(false)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md transition-colors">OK</Button> {/* Enhanced button style */}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Liste des Partenaires"
          breadcrumbs={[
            { label: "Tableaux de bord" },
            { label: "Partenariat", active: true },
          ]}
        />
        <Button
          className="bg-[#576CBC] hover:bg-[#19376D]  text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2"
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
          isLoading={isLoading || isFetching}
          pageCount={partnersData?.meta?.last_page || 0}
          pagination={{ pageIndex: partnersData?.meta?.current_page ? partnersData.meta.current_page - 1 : 0, pageSize: partnersData?.meta?.per_page || 10 }}         
          columnFilters={columnFilters}
          onFilterChange={(filters) => { /* Handle filter changes if your DataTable supports it */ }}
          onBulkDelete={handleBulkDelete}
          hasSelectedRows={Object.keys(partnersData?.data || {}).some(key => (partnersData?.data as any)[key]?.isSelected)} // Placeholder, adjust based on actual DataTable row selection state
          isBulkDeleting={isBulkDeleting}
          emptyText={isLoading ? "Chargement des données..." : "Aucun partenaire trouvé."}
          initialPageSize={10}
          headerStyle="primary"
          hoverEffect
          striped
          globalFilterKey="partner_name"
          serverPagination 
        />
      </div>

      <AddEditPartnerModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSavePartner}
        partner={editingPartner}
        options={filterOptions}
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
                {partnerToAction?.deleted_at ? "Confirmer la réactivation" : "Confirmer la désactivation"}
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
                Vous êtes sur le point de modifier le statut de {pendingDeleteIds.length} partenaire(s). 
                Les partenaires actifs seront désactivés et les inactifs seront réactivés.
                Êtes-vous sûr de vouloir continuer ?
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
                    d="M4 12a8 8 0 018-8v4a4 0 00-4 4H4z"
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

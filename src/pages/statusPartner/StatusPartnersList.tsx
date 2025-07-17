import React, { useState, useMemo } from "react";
import { Plus, Trash2, Pencil, AlertCircle, Loader2 } from "lucide-react";
import { DataTable } from "../../components/ui/data-table"; // Assuming this path is correct
import type { Column } from "../../components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  useGetStatusPartnersQuery,
  useAddStatusPartnerMutation,
  useUpdateStatusPartnerMutation,
  useDeleteStatusPartnerMutation,
} from "../../features/api/statusPartnersApi"; // Assuming this path is correct
import {AddEditStatusPartnerModal} from "@/components/statusPartner/AddEditStatusPartnerModal";
import { PageHeaderLayout } from "@/layouts/MainLayout";
// Import your StatusPartner type from its dedicated types file
import type { StatusPartner } from "@/types/statusPartners"; // Adjust this path as necessary

export const StatusPartnersListPage: React.FC = () => {
  const {
    data: statusPartnersResponse, // Renamed to consistently reflect 'status'
    isLoading,
    refetch,
    error: fetchError, // Renamed to avoid conflict with `error` property on `delete` mutation
  } = useGetStatusPartnersQuery();

  // Use consistent naming for mutations: 'addStatusPartner', 'updateStatusPartner', 'deleteStatusPartner'
  const [addStatusPartner] = useAddStatusPartnerMutation();
  const [updateStatusPartner] = useUpdateStatusPartnerMutation();
  const [deleteStatusPartner] = useDeleteStatusPartnerMutation();

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingStatusPartner, setEditingStatusPartner] =
    useState<StatusPartner | null>(null); // Corrected type and name for editing item
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for the error alert (e.g., when deletion fails due to conflict)
  const [isErrorAlertOpen, setErrorAlertOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // --- CRITICAL FIX: Extract the array from the API response ---
  // Ensure that 'tableData' is always an array, even if the API response is undefined or null initially.
  const tableData: StatusPartner[] = statusPartnersResponse?.data || [];
  // --- END CRITICAL FIX ---

  const handleOpenAddModal = () => {
    setEditingStatusPartner(null); // When adding, clear any previous editing state
    setModalOpen(true);
  };

  const handleOpenEditModal = (statusPartner: StatusPartner) => {
    // Corrected parameter name
    setEditingStatusPartner(statusPartner); // Corrected state setter
    setModalOpen(true);
  };

  const handleSaveStatusPartner = async (name: string, id?: number) => {
    // Renamed function to reflect 'statusPartner'
    setIsSaving(true);
    try {
      if (id) {
        await updateStatusPartner({ id, name }).unwrap();
      } else {
        await addStatusPartner({ name }).unwrap();
      }
      setModalOpen(false);
      refetch(); // Refetch data to update the table
    } catch (error) {
      // Handle save errors if needed
      console.error("Failed to save status partner:", error); // Improved error message
      setErrorMessage(
        "Une erreur est survenue lors de l'enregistrement du partenaire de statut."
      ); // Corrected French message
      setErrorAlertOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRequest = (id: number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteStatusPartner(deleteId).unwrap(); // Corrected mutation name
      setDeleteDialogOpen(false);
      setDeleteId(null);
      refetch(); // Refetch data to update the table after deletion
    } catch (error) {
      interface ApiError {
        status: number;
        data?: { message?: string; error?: string }; // More robust error interface
      }
      const err = error as ApiError;
      if (err.status === 409) {
        setErrorMessage(
          err.data?.message ||
            err.data?.error ||
            "Ce partenaire de statut est utilisé et ne peut pas être supprimé car il est associé à d'autres enregistrements." // Corrected French message
        );
        setErrorAlertOpen(true);
        setDeleteDialogOpen(false); // Close the delete confirmation dialog
      } else {
        setErrorMessage(
          "Une erreur inattendue est survenue lors de la suppression."
        );
        setErrorAlertOpen(true);
        console.error("Failed to delete status partner:", error); // Improved error message
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Define columns for the DataTable
  const columns: Column<StatusPartner>[] = useMemo(
    () => [
      { key: "id", header: "ID", sortable: true, width: "80px" }, // Added width for smaller ID column
      { key: "name", header: "Nom", sortable: true },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <div className="flex items-center justify-end space-x-2">
            {" "}
            {/* Added spacing */}
            <Button
              variant="outline" // Use outline variant for action buttons
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Prevent row click from triggering
                handleOpenEditModal(row);
              }}
              title="Éditer"
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="destructive" // Use destructive variant for delete
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Prevent row click from triggering
                handleDeleteRequest(row.id);
              }}
              title="Supprimer"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ),
        align: "right",
        width: "120px", // Added width for actions column
      },
    ],
    [handleOpenEditModal, handleDeleteRequest] // Add dependencies for memoization
  );

  return (
    <div className="bg-gray-50 p-4 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Partenaires de statut" // Corrected title
          breadcrumbs={[
            { label: "Tableaux de bord" },
            { label: "Partenaires de statut", active: true }, // Corrected breadcrumb
          ]}
        />
        <Button
          onClick={handleOpenAddModal}
          className="bg-[#576CBC] hover:bg-[#19376D] text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Ajouter un Phase de Partenaire{" "}
          {/* Corrected button text */}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-[#576CBC]" />
          <p className="ml-4 text-lg text-gray-600">
            Chargement des données...
          </p>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center h-64 text-red-600">
          <AlertCircle size={48} className="mb-4" />
          <p className="text-xl font-semibold">Erreur de chargement des données</p>
          <p className="text-md text-gray-500">
            Impossible de récupérer les phases de partenaire. Veuillez réessayer plus tard.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tableData}
          emptyText="Aucun phase de partenaire trouvé." // Corrected empty text
          initialPageSize={10}
          headerStyle="light"
          hoverEffect
          striped
          enableBulkDelete={false} // Keeping this false as per your original code
        />
      )}

      {/* Corrected component name, prop names, and data for the modal */}
      <AddEditStatusPartnerModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveStatusPartner} // Corrected function name
        statusPartner={editingStatusPartner || undefined} // Corrected prop name and variable
        isLoading={isSaving}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce phase de partenaire ? Cette
              action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => setDeleteId(null)}
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
              {isDeleting && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Alert Dialog for deletion conflicts or other errors */}
      <Dialog open={isErrorAlertOpen} onOpenChange={setErrorAlertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle size={20} /> Erreur
            </DialogTitle>
            <DialogDescription className="pt-4">
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setErrorAlertOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StatusPartnersListPage; // Changed default export name for consistency
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
  useGetStructurePartnersQuery,
  useAddStructurePartnerMutation,
  useUpdateStructurePartnerMutation,
  useDeleteStructurePartnerMutation,
} from "../../features/api/structurePartnersApi"; // Assuming this path is correct
import { AddEditStructurePartnerModal } from "@/components/structurePartner/AddEditStructurePartnerModal";
import { PageHeaderLayout } from "@/layouts/MainLayout";
// Import your StructurePartner type from its dedicated types file
import type { StructurePartner } from "@/types/structurePartners"; // Adjust this path as necessary

export const StructurePartnersListPage: React.FC = () => {
  const {
    data: structurePartnersResponse, // Renamed to clearly indicate it's the full response object
    isLoading,
    refetch,
    error: fetchError // Renamed to avoid conflict with `error` property on `delete` mutation
  } = useGetStructurePartnersQuery();

  const [addStructurePartner] = useAddStructurePartnerMutation();
  const [updateStructurePartner] = useUpdateStructurePartnerMutation();
  const [deleteStructurePartner] = useDeleteStructurePartnerMutation();

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<
    { id?: number; name?: string } | null
  >(null);
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
  const tableData: StructurePartner[] = structurePartnersResponse?.data || [];
  // --- END CRITICAL FIX ---


  const handleOpenAddModal = () => {
    setEditingStructure(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (structure: StructurePartner) => {
    setEditingStructure(structure);
    setModalOpen(true);
  };

  const handleSaveStructure = async (name: string, id?: number) => {
    setIsSaving(true);
    try {
      if (id) {
        await updateStructurePartner({ id, name }).unwrap();
      } else {
        await addStructurePartner({ name }).unwrap();
      }
      setModalOpen(false);
      refetch(); // Refetch data to update the table
    } catch (error) {
        // Handle save errors if needed
        console.error("Failed to save structure:", error);
        setErrorMessage("Une erreur est survenue lors de l'enregistrement de la structure.");
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
      await deleteStructurePartner(deleteId).unwrap();
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
          err.data?.message || err.data?.error || "Cette structure est utilisée et ne peut pas être supprimée car elle est associée à d'autres enregistrements."
        );
        setErrorAlertOpen(true);
        setDeleteDialogOpen(false); // Close the delete confirmation dialog
      } else {
        setErrorMessage("Une erreur inattendue est survenue lors de la suppression.");
        setErrorAlertOpen(true);
        console.error("Failed to delete structure:", error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Define columns for the DataTable
  const columns: Column<StructurePartner>[] = useMemo(
    () => [
      { key: "id", header: "ID", sortable: true, width: '80px' }, // Added width for smaller ID column
      { key: "name", header: "Nom", sortable: true },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <div className="flex items-center justify-end space-x-2"> {/* Added spacing */}
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
        width: '120px' // Added width for actions column
      },
    ],
    [handleOpenEditModal, handleDeleteRequest] // Add dependencies for memoization
  );

  return (
    <div className="bg-gray-50 p-4 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Structures de partenaires"
          breadcrumbs={[
            { label: "Tableaux de bord" },
            { label: "Structures de partenaires", active: true },
          ]}
        />
        <Button
          onClick={handleOpenAddModal}
          className="bg-[#576CBC] hover:bg-[#19376D] text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Ajouter une Structure de Partenaire
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-[#576CBC]" />
          <p className="ml-4 text-lg text-gray-600">Chargement des données...</p>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center h-64 text-red-600">
            <AlertCircle size={48} className="mb-4" />
            <p className="text-xl font-semibold">Erreur de chargement des données</p>
            <p className="text-md text-gray-500">Impossible de récupérer les structures de partenaires. Veuillez réessayer plus tard.</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tableData} 
          emptyText="Aucune structure de partenaire trouvée."
          initialPageSize={10}
          headerStyle="light" // Changed to light, assuming primary was a placeholder color
          hoverEffect
          striped
          enableBulkDelete={false} // Keeping this false as per your original code
        />
      )}

      <AddEditStructurePartnerModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveStructure}
        structurePartner={editingStructure || undefined}
        isLoading={isSaving}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette structure de partenaire ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isDeleting} onClick={() => setDeleteId(null)}>
                Annuler
              </Button>
            </DialogClose>
            <Button type="button" variant="destructive" disabled={isDeleting} onClick={handleConfirmDelete}>
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

export default StructurePartnersListPage;
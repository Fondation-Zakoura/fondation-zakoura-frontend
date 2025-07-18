import React, { useState, useMemo } from "react";
import { Plus, AlertCircle, Loader2, Pen, Trash } from "lucide-react";
import { DataTable } from "../../components/ui/data-table"; // Adjust path if needed
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
  useGetNaturePartnersQuery,
  useAddNaturePartnerMutation,
  useUpdateNaturePartnerMutation,
  useDeleteNaturePartnerMutation,
} from "../../features/api/naturePartnersApi"; // Adjust path if needed
import { AddEditNaturePartnerModal } from "@/components/naturePartner/AddEditNaturePartnerModal"; // Adjust path if needed
import { PageHeaderLayout } from "@/layouts/MainLayout"; // Adjust path if needed

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { NaturePartner } from '@/types/naturePartners'; // Import the NaturePartner type

// Import react-toastify components
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS

export const NaturePartnersListPage: React.FC = () => {
  const {
    data: naturePartnersResponse, // This will be NaturePartnersApiResponse | undefined
    isLoading,
    refetch,
    error: fetchError // Renamed to avoid conflict with `error` property on `delete` mutation
  } = useGetNaturePartnersQuery();

  // Extract the actual array of NaturePartner from the response.
  // Default to an empty array to prevent 'data is not iterable' errors when loading or no data.
  const tableData: NaturePartner[] = naturePartnersResponse?.data || [];

  const [addNaturePartner] = useAddNaturePartnerMutation();
  const [updateNaturePartner] = useUpdateNaturePartnerMutation();
  const [deleteNaturePartner] = useDeleteNaturePartnerMutation();

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingNature, setEditingNature] = useState<
    NaturePartner | null // Use NaturePartner type
  >(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Removed error alert state as toastify will handle it
  // const [isErrorAlertOpen, setErrorAlertOpen] = useState(false);
  // const [errorMessage, setErrorMessage] = useState("");

  const handleOpenAddModal = () => {
    setEditingNature(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (nature: NaturePartner) => { // Use NaturePartner type
    setEditingNature(nature);
    setModalOpen(true);
  };

  const handleSaveNature = async (name: string, id?: number) => {
    setIsSaving(true);
    const mutationPromise = id
      ? updateNaturePartner({ id, name })
      : addNaturePartner({ name });

    mutationPromise.unwrap()
      .then(() => {
        setModalOpen(false);
        refetch(); // Refetch data to update the table
        toast.success(id ? "Nature de partenaire mise à jour avec succès !" : "Nature de partenaire ajoutée avec succès !");
      })
      .catch((error: FetchBaseQueryError) => {
        console.error("Failed to save nature:", error);
        toast.error("Une erreur est survenue lors de l'enregistrement de la nature de partenaire.");
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleDeleteRequest = (id: number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId == null) return;
    setIsDeleting(true);
    
    deleteNaturePartner(deleteId).unwrap()
      .then(() => {
        setDeleteDialogOpen(false);
        setDeleteId(null);
        refetch(); // Refetch data to update the table after deletion
        toast.success("Nature de partenaire supprimée avec succès !");
      })
      .catch((err: FetchBaseQueryError) => {
        const error = err; // 'err' is already typed as FetchBaseQueryError

        if (error.status === 409) {
          let msg = "Cette nature est utilisée par un ou plusieurs partenaires et ne peut pas être supprimée.";

          if (
            typeof error.data === "object" &&
            error.data !== null &&
            "error" in error.data &&
            typeof (error.data as { error: unknown }).error === "string"
          ) {
            msg = (error.data as { error: string }).error;
          }

          toast.error(msg); // Use toast.error instead of setting state for Dialog
          setDeleteDialogOpen(false); // Close dialog even on conflict error
        } else {
          toast.error("Une erreur inattendue est survenue lors de la suppression de la nature.");
          console.error("Failed to delete nature:", error);
        }
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  // Define columns for the DataTable using NaturePartner type
  const columns: Column<NaturePartner>[] = useMemo(
    () => [
      { key: "id", header: "ID", sortable: true, width: '80px' },
      { key: "name", header: "Nom", sortable: true },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <div className="flex items-center justify-end space-x-2"> {/* Added spacing */}
              <button
                className="p-2 rounded hover:bg-blue-100 text-blue-600"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent row click from triggering
                  handleOpenEditModal(row);
                }}
                title="Éditer"
              >
                <Pen size={16} />
              </button>
              <button
              className="p-2 rounded hover:bg-red-100 text-red-600"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent row click from triggering
                  handleDeleteRequest(row.id);
                }}
                title="Supprimer"
              >
                <Trash size={16} />
              </button>
            </div>
        ),
        align: "right",
        width: '120px'
      },
    ],
    [handleOpenEditModal, handleDeleteRequest] // Dependencies for memoization
  );

  return (
    <div className="p-4 min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Natures de partenaires"
          breadcrumbs={[
            { label: "Paramètres"},
            { label: "Projets" },
            { label: "Types" },
            { label: "Natures de partenaires" , active: true },
          ]}
        />
        <Button
          onClick={handleOpenAddModal}
          className="bg-primary hover:bg-[#576CBC] text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Ajouter une Nature de Partenaire
        </Button>
      </div>

      {/* Conditional rendering for loading, error, or data */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-[#576CBC]" />
          <p className="ml-4 text-lg text-gray-600">Chargement des données...</p>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center h-64 text-red-600">
            <AlertCircle size={48} className="mb-4" />
            <p className="text-xl font-semibold">Erreur de chargement des données</p>
            <p className="text-md text-gray-500">Impossible de récupérer les natures de partenaires. Veuillez réessayer plus tard.</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tableData}
          emptyText="Aucune nature de partenaire trouvée."
          initialPageSize={10}
          headerStyle="light"
          hoverEffect
          striped
          enableBulkDelete={false}
          globalSearchLabel="Rechercher un nature de partenaire..."
        />
      )}

      <AddEditNaturePartnerModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveNature}
        naturePartner={editingNature || undefined}
        isLoading={isSaving}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette nature de partenaire ? Cette action est irréversible.
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
    </div>
  );
};

export default NaturePartnersListPage;

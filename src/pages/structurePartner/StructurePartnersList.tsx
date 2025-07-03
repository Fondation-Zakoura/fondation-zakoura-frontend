import React, { useState, useMemo } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { DataTable } from "../../components/ui/data-table";
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
} from "../../features/api/structurePartnersApi";
import { AddEditStructurePartnerModal } from "@/components/structurePartner/AddEditStructurePartnerModal";
import { PageHeaderLayout } from "@/layouts/MainLayout";

export const StructurePartnersListPage: React.FC = () => {
  const {
    data: structurePartners = [],
    isLoading,
    refetch,
  } = useGetStructurePartnersQuery();
  const [addStructurePartner] = useAddStructurePartnerMutation();
  const [updateStructurePartner] = useUpdateStructurePartnerMutation();
  const [deleteStructurePartner] = useDeleteStructurePartnerMutation();

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<{
    id?: number;
    name?: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenAddModal = () => {
    setEditingStructure(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (structure: { id: number; name: string }) => {
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
      refetch();
    } finally {
      setIsSaving(false);
    }
  };

  // Open delete dialog
  const handleDeleteRequest = (id: number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteStructurePartner(deleteId).unwrap();
      setDeleteDialogOpen(false);
      setDeleteId(null);
      refetch();
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<{ id: number; name: string }>[] = useMemo(
    () => [
      { key: "id", header: "ID" },
      { key: "name", header: "Nom" },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <div className="">
            <button
              onClick={() => handleOpenEditModal(row)}
              className="p-2 rounded hover:bg-blue-100 text-blue-600"
              title="Éditer"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => handleDeleteRequest(row.id)}
              className="p-2 rounded hover:bg-red-100 text-red-600"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
        align: "right",
      },
    ],
    []
  );

  return (
    <div className="bg-gray-50 p-4 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Liste des projets"
          breadcrumbs={[
            { label: "Tableaux de bord" },
            { label: "Structures de partenaires", active: true },
          ]}
        />
        <Button
          onClick={handleOpenAddModal}
          className="bg-[#576CBC] hover:bg-[#19376D] text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Ajouter un Structure de Partenaire
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={structurePartners}
        emptyText={isLoading ? "Chargement..." : "Aucune structure trouvée"}
        initialPageSize={10}
        headerStyle="primary"
        hoverEffect
        striped
        enableBulkDelete={false}
      />
      <AddEditStructurePartnerModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveStructure}
        structurePartner={editingStructure || undefined}
        isLoading={isSaving}
      />

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette structure de partenaire ?
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
              {isDeleting && (
                <span className="animate-spin mr-2">
                  <Trash2 size={16} />
                </span>
              )}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StructurePartnersListPage;

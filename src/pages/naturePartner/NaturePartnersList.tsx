import React, { useState, useMemo } from "react";
import { Plus, Trash2, Pencil, AlertCircle, Loader2 } from "lucide-react";
import { DataTable } from "../../components/ui/data-table";
import type { Column } from "../../components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useGetNaturePartnersQuery, useAddNaturePartnerMutation, useUpdateNaturePartnerMutation, useDeleteNaturePartnerMutation } from "../../features/api/naturePartnersApi";
import { AddEditNaturePartnerModal } from "@/components/naturePartner/AddEditNaturePartnerModal";
import { PageHeaderLayout } from "@/layouts/MainLayout";

export const NaturePartnersListPage: React.FC = () => {
    const { data: naturePartners = [], isLoading, refetch } = useGetNaturePartnersQuery();
    const [addNaturePartner] = useAddNaturePartnerMutation();
    const [updateNaturePartner] = useUpdateNaturePartnerMutation();
    const [deleteNaturePartner] = useDeleteNaturePartnerMutation();

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingNature, setEditingNature] = useState<{ id?: number; name?: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Delete dialog state
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // ✨ New state for the error alert
    const [isErrorAlertOpen, setErrorAlertOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleOpenAddModal = () => {
        setEditingNature(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (nature: { id: number; name: string }) => {
        setEditingNature(nature);
        setModalOpen(true);
    };

    const handleSaveNature = async (name: string, id?: number) => {
        setIsSaving(true);
        try {
            if (id) {
                await updateNaturePartner({ id, name }).unwrap();
            } else {
                await addNaturePartner({ name }).unwrap();
            }
            setModalOpen(false);
            refetch();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteRequest = (id: number) => {
        setDeleteId(id);
        setDeleteDialogOpen(true);
    };

    // ✨ Updated delete handler
    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await deleteNaturePartner(deleteId).unwrap();
            setDeleteDialogOpen(false);
            setDeleteId(null);
            refetch();
        } catch (error) {
            if (error.status === 409) {
                setErrorMessage(error.data?.error || "Cette nature est utilisée par un ou plusieurs partenaires et ne peut pas être supprimée.");
                setErrorAlertOpen(true);
                setDeleteDialogOpen(false); // Close the confirmation dialog
            } else {
                console.error("Failed to delete nature:", error);
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const columns: Column<{ id: number; name: string }>[] = useMemo(() => [
        { key: "id", header: "ID" , sortable: true  },
        { key: "name", header: "Nom" , sortable: true },
        {
            key: "actions",
            header: "Actions",
            render: (row) => (
                <div className="flex items-center justify-end">
                    <button onClick={() => handleOpenEditModal(row)} className="p-2 rounded hover:bg-blue-100 text-blue-600" title="Éditer"><Pencil size={16} /></button>
                    <button onClick={() => handleDeleteRequest(row.id)} className="p-2 rounded hover:bg-red-100 text-red-600" title="Supprimer"><Trash2 size={16} /></button>
                </div>
            ),
            align: "right",
        },
    ], []);

    return (
        <div className="bg-gray-50 p-4 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <PageHeaderLayout
                    title="Natures de partenaires"
                    breadcrumbs={[
                        { label: "Tableaux de bord" },
                        { label: "Natures de partenaires", active: true },
                    ]}
                />
                <Button
                    onClick={handleOpenAddModal}
                    className="bg-[#576CBC] hover:bg-[#19376D] text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Ajouter une Nature de Partenaire
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={naturePartners}
                emptyText={isLoading ? "Chargement..." : "Aucune nature trouvée"}
                initialPageSize={10}
                headerStyle="primary"
                hoverEffect
                striped
                enableBulkDelete={false}
            />
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
                            Êtes-vous sûr de vouloir supprimer cette nature de partenaire ?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isDeleting} onClick={() => setDeleteId(null)}>Annuler</Button>
                        </DialogClose>
                        <Button type="button" variant="destructive" disabled={isDeleting} onClick={handleConfirmDelete}>
                            {isDeleting && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ✨ New Error Alert Dialog */}
            <Dialog open={isErrorAlertOpen} onOpenChange={setErrorAlertOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle size={20} /> Impossible de supprimer
                        </DialogTitle>
                        <DialogDescription className="pt-4">
                            {errorMessage}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setErrorAlertOpen(false)}>
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default NaturePartnersListPage;
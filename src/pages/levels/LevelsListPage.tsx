
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, Eye, Pencil, Trash2, RotateCw } from "lucide-react";
import {
  useGetLevelsQuery,
  useCreateLevelMutation,
  useUpdateLevelMutation,
  useBulkToggleLevelsStatusMutation, // Renommé
  useGetFormOptionsQuery, // Pour récupérer les cycles pour le filtre/formulaire
} from '@/features/api/levelApi';
import type { Level, FilterOption } from '@/types/levels'; // Importez les types
import { AddEditLevelModal } from '@/components/levels/AddEditLevelModal';
import { LevelDetailsModal } from '@/components/levels/LevelDetailsModal';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable } from '@/components/ui/data-table';
import type { Column, ColumnFilter } from "@/components/ui/data-table";
import { PageHeaderLayout } from "@/layouts/MainLayout"; // Assurez-vous d'avoir ce composant

// Options pour les filtres de statut (dérivé de deleted_at)
const levelStatusOptions: FilterOption[] = [
  { value: "Actif", label: "Actif" },
  { value: "Inactif", label: "Inactif" },
];

export const LevelsListPage: React.FC = () => {
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLevelForDetails, setSelectedLevelForDetails] = useState<Level | null>(null);
  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false); // Pour activation/désactivation individuelle
  const [levelToToggle, setLevelToToggle] = useState<Level | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  // State for bulk actions
  const [pendingActionIds, setPendingActionIds] = useState<number[]>([]);
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false);
  const [isBulkActing, setIsBulkActing] = useState(false);


  // État de pagination pour la DataTable (pageIndex est basé sur 0, pageSize)
  const [pagination, setPagination] = useState<{ pageIndex: number; pageSize: number }>({
    pageIndex: 0,
    pageSize: 10,
  });
  // État pour les filtres envoyés à l'API (correspond à filterValues de DataTable)
  const [apiFilters, setApiFilters] = useState<Record<string, any>>({});
  // État pour la sélection des lignes (IDs des niveaux sélectionnés)
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // RTK Query: Récupération des niveaux
  const { data: levelsData, isLoading, isFetching, error, refetch } = useGetLevelsQuery({
    page: pagination.pageIndex + 1, // Convertir pageIndex (0-based) en page (1-based) pour l'API
    filters: { ...apiFilters, per_page: pagination.pageSize }, // Passer pageSize comme filtre
    withTrashed: true, // Demande au backend d'inclure les éléments soft-deleted
  });

  // RTK Query: Récupération des options de formulaire (ex: cycles)
  const { data: formOptionsData, isLoading: isLoadingFormOptions, error: formOptionsError } = useGetFormOptionsQuery();

  const [createLevel] = useCreateLevelMutation();
  const [updateLevel] = useUpdateLevelMutation();
  const [bulkToggleLevelsStatus] = useBulkToggleLevelsStatusMutation(); // Nouvelle mutation

  useEffect(() => {
    if (error) {
      console.error("Erreur lors du chargement des niveaux:", error);
      toast.error("Erreur lors du chargement des niveaux.");
    }
    if (formOptionsError) {
      console.error("Erreur lors du chargement des options de formulaire:", formOptionsError);
      toast.error("Erreur lors du chargement des options de formulaire (cycles).");
    }
  }, [error, formOptionsError]);

  // Options de cycles pour le filtre et le formulaire
  const cycleOptions: FilterOption[] = useMemo(() => {
    return formOptionsData?.cycles || [];
  }, [formOptionsData]);

  // Options pour les filtres de colonnes de la DataTable
  const columnFilters = useMemo((): ColumnFilter<Level>[] => [
    { id: "status", label: "Statut", options: levelStatusOptions },
    { id: "cycle_id", label: "Cycle d'appartenance", options: cycleOptions },
  ], [cycleOptions]);

  // Gère les changements de filtres de la DataTable et les applique à l'état `apiFilters`
  const handleDataTableFilterChange = useCallback((filters: Record<string, any>) => {
    setApiFilters(filters);
    setPagination(prev => ({ ...prev, pageIndex: 0 })); // Réinitialiser à la première page lors du changement de filtre
  }, []);

  const handleOpenAddModal = useCallback(() => {
    setEditingLevel(null);
    setIsAddEditModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((level: Level) => {
    setEditingLevel(level);
    setIsAddEditModalOpen(true);
  }, []);

  const handleSaveLevel = useCallback(async (formData: FormData, id?: number) => {
    setIsSaving(true);
    try {
      if (id) {
        await updateLevel({ id, data: formData }).unwrap();
        toast.success("Niveau mis à jour avec succès.");
      } else {
        await createLevel(formData).unwrap();
        toast.success("Niveau créé avec succès.");
      }
      setIsAddEditModalOpen(false);
      setSelectedRows([]); // Clear selection after save
      refetch(); // Recharger les données après sauvegarde
    } catch (err: any) {
      console.error("Échec de la sauvegarde du niveau:", err);
      if (err.data && err.data.errors) {
        // Gérer les erreurs de validation spécifiques du backend
        const errorMessages = Object.values(err.data.errors).flat().join('\n');
        toast.error(`Erreur de validation: ${errorMessages}`);
      } else {
        toast.error("Échec de la sauvegarde du niveau.");
      }
    } finally {
      setIsSaving(false);
    }
  }, [createLevel, updateLevel, refetch]);

  const handleViewDetails = useCallback((level: Level) => setSelectedLevelForDetails(level), []);

  const handleToggleRequest = useCallback((level: Level) => {
    setLevelToToggle(level);
    setConfirmToggleOpen(true);
  }, []);

  const handleConfirmToggle = useCallback(async () => {
    if (!levelToToggle) return;
    setIsToggling(true);
    try {
      // Appel de la mutation pour basculer le statut d'un seul niveau
      await bulkToggleLevelsStatus([levelToToggle.id]).unwrap();
      toast.success(`Niveau "${levelToToggle.title}" ${levelToToggle.deleted_at ? 'réactivé' : 'désactivé'} avec succès.`);
      setConfirmToggleOpen(false);
      setLevelToToggle(null);
      setSelectedRows([]); // Clear selection after toggle
      refetch(); // Recharger les données après l'action
    } catch (err) {
      console.error("Toggle failed:", err);
      toast.error("Échec de l'opération de statut.");
    } finally {
      setIsToggling(false);
    }
  }, [levelToToggle, bulkToggleLevelsStatus, refetch]);

  const handleBulkAction = useCallback((ids: (string | number)[]) => {
    const numericIds = ids.map((id) => Number(id));
    if (!numericIds.length) {
      toast.info("Aucun niveau sélectionné pour l'action groupée.");
      return;
    }
    setPendingActionIds(numericIds);
    setShowBulkActionDialog(true);
  }, []);

  const handleConfirmBulkAction = useCallback(async () => {
    if (!pendingActionIds.length) return;
    setIsBulkActing(true);
    try {
      // Appel de la mutation pour basculer le statut en masse
      await bulkToggleLevelsStatus(pendingActionIds).unwrap();
      toast.success(`${pendingActionIds.length} niveau(x) mis à jour avec succès.`);
      setShowBulkActionDialog(false);
      setPendingActionIds([]);
      setSelectedRows([]); // Clear row selection after bulk action
      refetch(); // Recharger les données
    } catch (err) {
      console.error("Bulk action failed:", err);
      toast.error("Échec de l'action groupée.");
    } finally {
      setIsBulkActing(false);
    }
  }, [bulkToggleLevelsStatus, pendingActionIds, refetch]);


  // Définition des colonnes directement dans le composant, adaptées à votre interface Column<T>
  const columns: Column<Level>[] = useMemo(() => [
    {
      key: "level_id",
      header: "ID Niveau",
      sortable: true,
      align: "left",
    },
    {
      key: "title",
      header: "Intitulé du niveau",
      sortable: true,
      align: "left",
    },
    {
      key: "code",
      header: "Code du niveau",
      sortable: true,
      align: "left",
    },
    {
      key: "order",
      header: "Ordre",
      sortable: true,
      align: "center",
    },
    {
      key: "status",
      header: "Statut",
      sortable: true,
      align: "center",
      render: (row) => (
          <span className={`px-2 py-1 text-sm rounded-full ${row.deleted_at ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {row.deleted_at ? "Inactif" : "Actif"}
          </span>),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(row)}>
            <Pencil className="h-4 w-4 text-blue-600" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleToggleRequest(row)}>
            {row.deleted_at ? (
              <RotateCw className="h-4 w-4 text-green-600" title="Réactiver" />
            ) : (
              <Trash2 className="h-4 w-4 text-red-600" title="Désactiver" />
            )}
          </Button>
        </div>
      ),
    },
  ], [handleViewDetails, handleOpenEditModal, handleToggleRequest]);

  // Données et pagination pour la DataTable
  const allLevels = useMemo(() => levelsData?.data || [], [levelsData]);
  const pageCount = levelsData?.meta?.last_page || 0; // Total de pages depuis l'API meta

  return (
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Liste des Niveaux"
          breadcrumbs={[
            { label: "Opérations" },
            { label: "Paramètres" },
            { label: "Niveaux", active: true },
          ]}
        />
        <Button className="bg-[#576CBC] hover:bg-[#19376D] text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2" onClick={handleOpenAddModal}>
          <Plus size={18} /> Ajouter un niveau
        </Button>
      </div>

      <div className="max-w-screen-2xl mx-auto">
        {(error || formOptionsError) && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p className="font-bold">Erreur de chargement</p>
            <p>{String(error || formOptionsError)}</p>
          </div>
        )}

        <DataTable
          columns={columns}
          data={allLevels}
          isLoading={isLoading || isFetching || isLoadingFormOptions}
          pageCount={pageCount}
          pageIndex={pagination.pageIndex} // Passer pageIndex (0-based)
          onPaginationChange={setPagination} // La DataTable interne gérera la conversion 1-based pour l'affichage
          onSelectedRowsChange={setSelectedRows}
          selectedRows={selectedRows}
          columnFilters={columnFilters}
          onFilterChange={handleDataTableFilterChange}
          onBulkDelete={handleBulkAction} // Utiliser handleBulkAction pour la suppression groupée
          enableBulkDelete={true} // Activer la suppression en masse
          globalFilterKey="title" // Clé pour la recherche globale par titre
          serverPagination={true} // Indiquer que la pagination est gérée côté serveur
          emptyText={isLoading || isLoadingFormOptions ? "Chargement des données..." : "Aucun niveau trouvé."}
          initialPageSize={10}
          headerStyle="primary"
          hoverEffect
          striped
        />
      </div>

      {/* Modals */}
      <AddEditLevelModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        level={editingLevel}
        onSave={handleSaveLevel}
        isLoading={isSaving}
        options={{ cycles: cycleOptions }}
      />

      <LevelDetailsModal
        isOpen={!!selectedLevelForDetails}
        onClose={() => setSelectedLevelForDetails(null)}
        level={selectedLevelForDetails}
      />

      {/* Confirmation Dialog for Single Toggle (Activate/Deactivate) */}
      <ConfirmDialog
        isOpen={confirmToggleOpen}
        onClose={() => setConfirmToggleOpen(false)}
        onConfirm={handleConfirmToggle}
        title={levelToToggle?.deleted_at ? "Confirmer la réactivation" : "Confirmer la désactivation"}
        description={
          levelToToggle?.deleted_at
            ? `Êtes-vous sûr de vouloir réactiver le niveau "${levelToToggle?.title}" ?`
            : `Êtes-vous sûr de vouloir désactiver le niveau "${levelToToggle?.title}" ? Cette action est réversible.`
        }
        confirmText={levelToToggle?.deleted_at ? "Réactiver" : "Désactiver"}
        cancelText="Annuler"
        isConfirming={isToggling}
      />

      <ConfirmDialog
        isOpen={showBulkActionDialog}
        onClose={() => setShowBulkActionDialog(false)}
        onConfirm={handleConfirmBulkAction}
        title="Confirmer l'action groupée"
        description={
          `Vous êtes sur le point de modifier le statut de ${pendingActionIds.length} niveau(x). ` +
          `Les niveaux actifs seront désactivés et les inactifs seront réactivés. ` +
          `Êtes-vous sûr de vouloir continuer ?`
        }
        confirmText="Confirmer"
        cancelText="Annuler"
        isConfirming={isBulkActing}
      />
    </div>
  );
};

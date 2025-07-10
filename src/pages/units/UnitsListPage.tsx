// src/pages/UnitsListPage.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import {
  useGetUnitsQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitsMutation,
  useGetUnitFormOptionsQuery, // Importation de la query pour les options de formulaire
} from '@/features/api/unitApi';
import type { Unit } from '@/features/api/unitApi';
// Les imports useGetSitesQuery et useGetUsersQuery ne sont plus nécessaires ici
// import { useGetSitesQuery } from '@/features/api/sitesApi';
// import { useGetUsersQuery } from '@/features/api/usersApi';
import { AddEditUnitModal } from '@/components/units/AddEditUnitModal';
import { UnitDetailsModal } from '@/components/units/UnitDetailsModal';
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable } from '@/components/ui/data-table'; // Assurez-vous que ce chemin est correct pour votre composant DataTable
import type { Column, ColumnFilter } from "@/components/ui/data-table"; // Importez les types Column et ColumnFilter

// Options pour les filtres de type et statut (doivent correspondre aux Enums backend)
const unitTypeOptions = [
  { value: "Préscolaire", label: "Préscolaire" },
  { value: "École", label: "École" },
  { value: "Regroupement", label: "Regroupement" },
  { value: "Centre", label: "Centre" },
  { value: "Communautaire", label: "Communautaire" },
];

const unitStatusOptions = [
  { value: "Active", label: "Active" },
  { value: "Fermée", label: "Fermée" },
  { value: "En pause", label: "En pause" },
  { value: "Archivée", label: "Archivée" },
];

export const UnitsListPage: React.FC = () => {
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedUnitForDetails, setSelectedUnitForDetails] = useState<Unit | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // État de pagination pour la DataTable (pageIndex est basé sur 0, pageSize)
  const [pagination, setPagination] = useState<{ pageIndex: number; pageSize: number }>({
    pageIndex: 0,
    pageSize: 10,
  });
  // État pour les filtres envoyés à l'API (correspond à filterValues de DataTable)
  const [apiFilters, setApiFilters] = useState<Record<string, any>>({});
  // État pour la sélection des lignes (IDs des unités sélectionnées)
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // RTK Query: pageIndex est basé sur 0, l'API Laravel attend une page basée sur 1
  const { data: unitsData, isLoading, isFetching, error } = useGetUnitsQuery({
    page: pagination.pageIndex + 1, // Convertir pageIndex (0-based) en page (1-based) pour l'API
    filters: { ...apiFilters, per_page: pagination.pageSize } // Passer pageSize comme filtre
  });

  // Utilisation de useGetUnitFormOptionsQuery pour obtenir toutes les options nécessaires
  const { data: formOptions, isLoading: formOptionsLoading } = useGetUnitFormOptionsQuery();

  const [createUnit] = useCreateUnitMutation();
  const [updateUnit] = useUpdateUnitMutation();
  const [deleteUnits] = useDeleteUnitsMutation();

  // Les options pour les filtres sont maintenant dérivées de formOptions
  const sitesForFilters = formOptions?.sites || [];
  const educatorsForFilters = formOptions?.educators || [];

  useEffect(() => {
    if (error) {
      console.error("Erreur lors du chargement des unités:", error);
      toast.error("Erreur lors du chargement des unités.");
    }
  }, [error]);

  // Options pour les filtres de colonnes de la DataTable
  const columnFilters = useMemo((): ColumnFilter<Unit>[] => [
    { id: "type", label: "Type", options: unitTypeOptions },
    { id: "status", label: "Statut", options: unitStatusOptions },
    { id: "site_id", label: "Site", options: sitesForFilters.map(s => ({ value: String(s.id), label: s.name })) },
    { id: "educator_id", label: "Éducatrice", options: educatorsForFilters.map(e => ({ value: String(e.id), label: e.name })) },
  ], [sitesForFilters, educatorsForFilters]); // Dépendances mises à jour

  // Gère les changements de filtres de la DataTable et les applique à l'état `apiFilters`
  const handleDataTableFilterChange = useCallback((filters: Record<string, any>) => {
    setApiFilters(filters);
    setPagination(prev => ({ ...prev, pageIndex: 0 })); // Réinitialiser à la première page lors du changement de filtre
  }, []);

  const handleOpenAddModal = useCallback(() => {
    setEditingUnit(null);
    setIsAddEditModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((unit: Unit) => {
    setEditingUnit(unit);
    setIsAddEditModalOpen(true);
  }, []);

  const handleSaveUnit = useCallback(async (formData: FormData, id?: number) => {
    setIsSaving(true);
    try {
      if (id) {
        await updateUnit({ id, data: formData }).unwrap();
        toast.success("Unité mise à jour avec succès.");
      } else {
        await createUnit(formData).unwrap();
        toast.success("Unité créée avec succès.");
      }
      setIsAddEditModalOpen(false);
      setSelectedRows([]); // Clear selection after save
    } catch (err: any) {
      console.error("Échec de la sauvegarde de l'unité:", err);
      if (err.data && err.data.errors) {
        toast.error("Veuillez corriger les erreurs de validation.");
      } else {
        toast.error("Échec de la sauvegarde de l'unité.");
      }
    } finally {
      setIsSaving(false);
    }
  }, [createUnit, updateUnit]);

  const handleViewDetails = useCallback((unit: Unit) => setSelectedUnitForDetails(unit), []);

  const handleDeleteRequest = useCallback((unit: Unit) => {
    setPendingDeleteIds([unit.id]);
    setConfirmDeleteOpen(true);
  }, []);

  const handleBulkDelete = useCallback((ids: number[]) => { // DataTable passe déjà les IDs sélectionnés
    if (!ids.length) {
      toast.info("Aucune unité sélectionnée pour la suppression en masse.");
      return;
    }
    setPendingDeleteIds(ids);
    setConfirmDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDeleteIds.length) return;
    setIsBulkDeleting(true);
    try {
      await deleteUnits(pendingDeleteIds).unwrap();
      toast.success(`${pendingDeleteIds.length} unité(s) supprimée(s) avec succès.`);
      setConfirmDeleteOpen(false);
      setPendingDeleteIds([]);
      setSelectedRows([]); // Clear row selection after delete
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Échec de la suppression.");
    } finally {
      setIsBulkDeleting(false);
    }
  }, [deleteUnits, pendingDeleteIds]);

  // Définition des colonnes directement dans le composant, adaptées à votre interface Column<T>
  const columns: Column<Unit>[] = useMemo(() => [
    // La colonne de sélection est gérée automatiquement par la DataTable si enableBulkDelete est true
    {
      key: "unit_id",
      header: "ID Unité",
      sortable: true,
      align: "left",
    },
    {
      key: "name",
      header: "Nom de l'unité",
      sortable: true,
      align: "left",
    },
    {
      key: "internal_code",
      header: "Code Interne",
      sortable: true,
      align: "left",
    },
    {
      key: "site_name", // Clé pour le filtre si nécessaire, mais le rendu sera personnalisé
      header: "Site",
      sortable: true,
      align: "left",
      render: (row) => row.site?.name || 'N/A', // Affiche le nom du site
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      align: "left",
    },
    {
      key: "status",
      header: "Statut",
      sortable: true,
      align: "left",
    },
    {
      key: "educator_name", // Clé pour le filtre si nécessaire, mais le rendu sera personnalisé
      header: "Éducatrice",
      sortable: true,
      align: "left",
      render: (row) => row.educator?.name || 'Non assignée', // Affiche le nom de l'éducateur
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(row)}>
            <Eye className="h-4 w-4 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(row)}>
            <Pencil className="h-4 w-4 text-blue-600" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteRequest(row)}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ], [handleViewDetails, handleOpenEditModal, handleDeleteRequest]);

  // Données et pagination pour la DataTable
  const allUnits = useMemo(() => unitsData?.data || [], [unitsData]);
  const pageCount = unitsData?.meta?.last_page || 0; // Total de pages depuis l'API meta

  return (
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Liste des Unités</h1>
        <Button className="bg-[#576CBC] hover:bg-[#19376D] text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2" onClick={handleOpenAddModal}>
          <Plus size={18} /> Ajouter une unité
        </Button>
      </div>

      <div className="max-w-screen-2xl mx-auto">
        {error && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p className="font-bold">Erreur de chargement</p>
            <p>{String(error)}</p>
          </div>
        )}

        <DataTable
          columns={columns}
          data={allUnits}
          isLoading={isLoading || isFetching}
          pageCount={pageCount}
          pageIndex={pagination.pageIndex} // Passer pageIndex (0-based)
          onPaginationChange={setPagination} // La DataTable interne gérera la conversion 1-based pour l'affichage
          onSelectedRowsChange={setSelectedRows}
          selectedRows={selectedRows}
          columnFilters={columnFilters}
          onFilterChange={handleDataTableFilterChange}
          onBulkDelete={handleBulkDelete}
          enableBulkDelete={true} // Activer la suppression en masse
          globalFilterKey="name" // Clé pour la recherche globale par nom
          serverPagination={true} // Indiquer que la pagination est gérée côté serveur
          emptyText={isLoading || formOptionsLoading ? "Chargement des données..." : "Aucune unité trouvée."}
          initialPageSize={10}
          headerStyle="primary"
          hoverEffect
          striped
        />
      </div>

      {/* Modals */}
      <AddEditUnitModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        unit={editingUnit}
        onSave={handleSaveUnit}
        isLoading={isSaving}
      />

      <UnitDetailsModal
        isOpen={!!selectedUnitForDetails}
        onClose={() => setSelectedUnitForDetails(null)}
        unit={selectedUnitForDetails}
      />

      {/* Confirmation Dialog for Deletion */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression"
        description={
          pendingDeleteIds.length > 1
            ? `Êtes-vous sûr de vouloir supprimer les ${pendingDeleteIds.length} unités sélectionnées ? Cette action est irréversible.`
            : `Êtes-vous sûr de vouloir supprimer l'unité "${allUnits.find(unit => unit.id === pendingDeleteIds[0])?.name || 'sélectionnée'}" ? Cette action est irréversible.`
        }
        confirmText="Supprimer"
        cancelText="Annuler"
        isConfirming={isBulkDeleting}
      />
    </div>
  );
};

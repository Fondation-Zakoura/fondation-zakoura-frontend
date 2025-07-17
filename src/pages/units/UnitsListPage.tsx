// src/pages/UnitsListPage.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import {
  useGetUnitsQuery,
  useDeleteUnitsMutation,
  useGetUnitFormOptionsQuery,
} from '@/features/api/unitApi';
import type { Unit, Site, User } from '@/features/api/unitApi'; // Import Site and User now that they are exported
import { AddEditUnitModal } from '@/components/units/AddEditUnitModal';
import { UnitDetailsModal } from '@/components/units/UnitDetailsModal';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable } from '@/components/ui/data-table';
import type { Column, ColumnFilter } from "@/components/ui/data-table"; // ColumnFilter no longer generic
import { PageHeaderLayout } from '@/layouts/MainLayout';

// Options for type and status filters (should match backend Enums)
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
  const [selectedUnitForDetails, setSelectedUnitForDetails] = useState<Unit | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // --- States for DataTable (Server-Side) ---
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // 0-based for react-table
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [tableFilters, setTableFilters] = useState<Record<string, string | string[]>>({}); // Column filters
  // const [globalSearchTerm, setGlobalSearchTerm] = useState<string>(''); // Global search
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null); // Sorting
  const [selectedRows, setSelectedRows] = useState<Unit[]>([]); // DataTable returns full row objects

  // RTK Query: Fetch units with all dynamic parameters
  const {
    data: unitsData,
    isLoading,
    isFetching,
    error,
    refetch, 
  } = useGetUnitsQuery({
    page: currentPageIndex + 1,
    per_page: currentPageSize,
    filters: tableFilters,
  });


  const { data: formOptions, isLoading: formOptionsLoading } = useGetUnitFormOptionsQuery();


  const [deleteUnits] = useDeleteUnitsMutation();

  // Memoized options for site and educator filters, derived from formOptions
  // Explicitly type `s` and `e` for clarity and to satisfy TS if inference struggles
  const sitesForFilters = useMemo(() =>
    (formOptions?.sites || []).map((s: Site) => ({ value: String(s.id), label: s.name })),
    [formOptions?.sites]
  );
  const educatorsForFilters = useMemo(() =>
    (formOptions?.educators || []).map((e: User) => ({ value: String(e.id), label: e.name })),
    [formOptions?.educators]
  );

  useEffect(() => {
    if (error) {
      console.error("Erreur lors du chargement des unités:", error);
      toast.error("Erreur lors du chargement des unités.");
    }
  }, [error]);

  // Options for DataTable column filters
  // FIX: ColumnFilter is no longer generic
  const columnFilters = useMemo((): ColumnFilter[] => [
    { id: "type", label: "Type", options: unitTypeOptions },
    { id: "status", label: "Statut", options: unitStatusOptions },
    { id: "site_id", label: "Site", options: sitesForFilters },
    { id: "educator_id", label: "Éducatrice", options: educatorsForFilters },
  ], [sitesForFilters, educatorsForFilters]);

  // --- Handlers for DataTable actions ---
  const handlePaginationChange = useCallback(
    ({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
      setCurrentPageIndex(pageIndex);
      setCurrentPageSize(pageSize);
    },
    []
  );

  // Handler for column filter changes from DataTable
  const handleFilterChange = useCallback((filters: Record<string, string | string[]>) => {
    setTableFilters(filters);
    setCurrentPageIndex(0); // Reset to first page when filters change
  }, []);

  // Handler for global search changes from DataTable
  const handleGlobalSearchChange = useCallback(() => {
    // setGlobalSearchTerm(value);
    setCurrentPageIndex(0); // Reset to first page when global search changes
  }, []);

  // Handler for sort changes from DataTable
  const handleSortChange = useCallback((key: string, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
  }, []);


  const handleOpenAddModal = useCallback(() => {
    setEditingUnit(null);
    setIsAddEditModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((unit: Unit) => {
    setEditingUnit(unit);
    setIsAddEditModalOpen(true);
  }, []);


  const handleViewDetails = useCallback((unit: Unit) => setSelectedUnitForDetails(unit), []);

  const handleDeleteRequest = useCallback((unit: Unit) => {
    setPendingDeleteIds([unit.id]);
    setConfirmDeleteOpen(true);
  }, []);

  // DataTable passes an array of selected Unit objects
  const handleBulkDelete = useCallback(() => {
    const idsToDelete = selectedRows.map(row => row.id);
    if (!idsToDelete.length) {
      toast.info("Aucune unité sélectionnée pour la suppression en masse.");
      return;
    }
    setPendingDeleteIds(idsToDelete);
    setConfirmDeleteOpen(true);
  }, [selectedRows]);

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDeleteIds.length) return;
    setIsBulkDeleting(true);
    try {
      await deleteUnits(pendingDeleteIds).unwrap();
      toast.success(`${pendingDeleteIds.length} unité(s) supprimée(s) avec succès.`);
      setConfirmDeleteOpen(false);
      setPendingDeleteIds([]);
      setSelectedRows([]); // Clear row selection after delete
      refetch(); // Crucial: Refetch data after successful delete
    } catch (err: unknown) { // Fix 2: Change `any` to `unknown`
      console.error("Delete failed:", err);
      // Generic error toast for deletion
      toast.error("Échec de la suppression.");
    } finally {
      setIsBulkDeleting(false);
    }
  }, [deleteUnits, pendingDeleteIds, refetch]);

  // Definition of columns
  const columns: Column<Unit>[] = useMemo(() => [
    { key: "unit_id", header: "ID Unité", sortable: true, align: "left" },
    { key: "name", header: "Nom de l'unité", sortable: true, align: "left" },
    { key: "internal_code", header: "Code Interne", sortable: true, align: "left" },
    {
      key: "site.name", // This key is for display, but filter should use site_id
      header: "Site",
      sortable: true,
      align: "left",
      render: (row) => row.site?.name || 'N/A',
    },
    { key: "type", header: "Type", sortable: true, align: "left" },
    { key: "status", header: "Statut", sortable: true, align: "left" },
    {
      key: "educator.name", // This key is for display, but filter should use educator_id
      header: "Éducatrice",
      sortable: true,
      align: "left",
      render: (row) => row.educator?.name || 'Non assignée',
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(row)} title="Voir">
            <Eye className="h-4 w-4 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(row)} title="Éditer">
            <Pencil className="h-4 w-4 text-blue-600" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteRequest(row)} title="Supprimer">
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ], [handleViewDetails, handleOpenEditModal, handleDeleteRequest]);

  // Data for the current page from the API response
  const allUnits = useMemo(() => unitsData?.data || [], [unitsData]);
const totalPages = useMemo(() => unitsData?.last_page || 0, [unitsData]); // Expects unitsData.meta.last_page
const totalItems = useMemo(() => unitsData?.total || 0, [unitsData]);     // Expects unitsData.meta.total
const currentPageFromAPI = useMemo(() => unitsData?.current_page || 1, [unitsData]);

  return (
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Liste des unités"
          breadcrumbs={[
            { label: "Tableaux de bord" },
            { label: "Unités", active: true },
          ]}
        />
        <Button className="bg-[#576CBC] hover:bg-[#19376D] text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2" onClick={handleOpenAddModal}>
          <Plus size={18} /> Ajouter une unité
        </Button>
      </div>

      <div className="max-w-screen-2xl mx-auto">
        {error && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p className="font-bold">Erreur de chargement</p>
            {/* Provide a more user-friendly error message, or log the full error object */}
            <p>{JSON.stringify(error)}</p>
          </div>
        )}

        <DataTable<Unit>
          columns={columns}
          data={allUnits}
          isLoading={isLoading || isFetching || formOptionsLoading}
          serverPagination={true}
          pageCount={totalPages} // Total pages from API
          totalItems={totalItems} // Pass totalItems if your DataTable pagination component needs it
          pageIndex={currentPageFromAPI - 1} // Convert 1-based API page to 0-based for DataTable
          onPaginationChange={handlePaginationChange}
          columnFilters={columnFilters}
          onFilterChange={handleFilterChange} // Fix 3: Use the dedicated handler
          onGlobalSearchChange={handleGlobalSearchChange} // Use the dedicated handler
          sortConfig={sortConfig} // Pass sort config
          onSortChange={handleSortChange} // Use the dedicated handler
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          onBulkDelete={handleBulkDelete}
          enableBulkDelete={true}
          emptyText={isLoading || isFetching ? "Chargement des données..." : "Aucune unité trouvée."}
          initialPageSize={currentPageSize}
          headerStyle="primary"
          hoverEffect
          striped
          // globalFilterKey="name" // This prop might not be needed if DataTable itself handles the search input and passes it via onGlobalSearchChange
        />
      </div>

      {/* Modals */}
      <AddEditUnitModal
      isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        unit={editingUnit}
        formOptions={formOptions} 
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
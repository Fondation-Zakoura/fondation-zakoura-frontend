import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, Eye, Pencil, Trash2, RotateCw, Badge } from "lucide-react";
import {
  useGetCyclesQuery,
  useCreateCycleMutation,
  useUpdateCycleMutation,
  useDeleteCyclesMutation,
} from '@/features/api/cycleApi';
import type { Cycle } from '@/types/cycles';
import { AddEditCycleModal } from '@/components/cycle/AddEditCycleModal'; // Updated import path
import { CycleDetailsModal } from '@/components/cycle/CycleDetailsModal';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable } from '@/components/ui/data-table';
import type { Column, ColumnFilter } from "@/components/ui/data-table";
import { PageHeaderLayout } from "@/layouts/MainLayout";

// Options pour les filtres de statut (dérivé de deleted_at)
const cycleStatusOptions = [
  { value: "Actif", label: "Activé" },
  { value: "Inactif", label: "Desactivé" },
];

export const CyclesListPage: React.FC = () => {
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<Cycle | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCycleForDetails, setSelectedCycleForDetails] = useState<Cycle | null>(null);
  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false);
  const [cycleToToggle, setCycleToToggle] = useState<Cycle | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const [pendingActionIds, setPendingActionIds] = useState<number[]>([]);
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false);
  const [isBulkActing, setIsBulkActing] = useState(false);
  const [pagination, setPagination] = useState<{ pageIndex: number; pageSize: number }>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [clientSideFilters, setClientSideFilters] = useState<Record<string, any>>({});
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const { data: cyclesData, isLoading, isFetching, error, refetch } = useGetCyclesQuery({});
  console.log(cyclesData);

  const [createCycle] = useCreateCycleMutation();
  const [updateCycle] = useUpdateCycleMutation();
  const [deleteCycles] = useDeleteCyclesMutation();

  useEffect(() => {
    if (error) {
      console.error("Erreur lors du chargement des cycles:", error);
      toast.error("Erreur lors du chargement des cycles.");
    }
  }, [error]);

  // Derive allCycles here, as it's the source for dynamic filter options and unique codes
  const allCycles = useMemo(() => cyclesData?.data || [], [cyclesData]);

  // Dynamically generate options for "Code du cycle" filter
  const codeFilterOptions = useMemo(() => {
    const uniqueCodes = new Set<string>();
    allCycles.forEach(cycle => {
      if (cycle.code) {
        uniqueCodes.add(cycle.code);
      }
    });
    const sortedCodes = Array.from(uniqueCodes).sort();
    return sortedCodes.map(code => ({ value: code, label: code }));
  }, [allCycles]);

  // NEW: Extract all existing cycle codes for uniqueness validation in the modal
  const existingCycleCodes = useMemo(() => {
    return allCycles.map(cycle => cycle.code);
  }, [allCycles]);


  const columnFilters = useMemo((): ColumnFilter<Cycle>[] => [
    { id: "status", label: "Statut", options: cycleStatusOptions },
    { id: "code", label: "Code du cycle", options: codeFilterOptions },
  ], [codeFilterOptions]);

  const handleDataTableFilterChange = useCallback((filters: Record<string, any>) => {
    setClientSideFilters(filters);
  }, []);

  const handleOpenAddModal = useCallback(() => {
    setEditingCycle(null);
    setIsAddEditModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((cycle: Cycle) => {
    setEditingCycle(cycle);
    setIsAddEditModalOpen(true);
  }, []);

  const handleSaveCycle = useCallback(async (formData: FormData, id?: number) => {
    setIsSaving(true);
    try {
      if (id) {
        await updateCycle({ id, data: formData }).unwrap();
        toast.success("Cycle mis à jour avec succès.");
      } else {
        await createCycle(formData).unwrap();
        toast.success("Cycle créé avec succès.");
      }
      setIsAddEditModalOpen(false);
      setSelectedRows([]);
      refetch();
    } catch (err: any) {
      console.error("Échec de la sauvegarde du cycle:", err);
      if (err.data && err.data.errors) {
        const errorMessages = Object.values(err.data.errors).flat().join('\n');
        toast.error(`Erreur de validation: ${errorMessages}`);
      } else {
        toast.error("Échec de la sauvegarde du cycle.");
      }
    } finally {
      setIsSaving(false);
    }
  }, [createCycle, updateCycle, refetch]);

  const handleViewDetails = useCallback((cycle: Cycle) => setSelectedCycleForDetails(cycle), []);

  const handleToggleRequest = useCallback((cycle: Cycle) => {
    setCycleToToggle(cycle);
    setConfirmToggleOpen(true);
  }, []);

  const handleConfirmToggle = useCallback(async () => {
    if (!cycleToToggle) return;
    setIsToggling(true);
    try {
      await deleteCycles([cycleToToggle.id]).unwrap();
      toast.success(`Cycle "${cycleToToggle.title}" ${cycleToToggle.deleted_at ? 'réactivé' : 'désactivé'} avec succès.`);
      setConfirmToggleOpen(false);
      setCycleToToggle(null);
      setSelectedRows([]);
      refetch();
    } catch (err) {
      console.error("Toggle failed:", err);
      toast.error("Échec de l'opération de statut.");
    } finally {
      setIsToggling(false);
    }
  }, [cycleToToggle, deleteCycles, refetch]);

  const handleBulkAction = useCallback((ids: (string | number)[]) => {
    const numericIds = ids.map((id) => Number(id));
    if (!numericIds.length) {
      toast.info("Aucun cycle sélectionné pour l'action groupée.");
      return;
    }
    setPendingActionIds(numericIds);
    setShowBulkActionDialog(true);
  }, []);

  const handleConfirmBulkAction = useCallback(async () => {
    if (!pendingActionIds.length) return;
    setIsBulkActing(true);
    try {
      await deleteCycles(pendingActionIds).unwrap();
      toast.success(`${pendingActionIds.length} cycle(s) mis à jour avec succès.`);
      setShowBulkActionDialog(false);
      setPendingActionIds([]);
      setSelectedRows([]);
      refetch();
    } catch (err) {
      console.error("Bulk action failed:", err);
      toast.error("Échec de l'action groupée.");
    } finally {
      setIsBulkActing(false);
    }
  }, [deleteCycles, pendingActionIds, refetch]);

  const columns: Column<Cycle>[] = useMemo(() => [
    { key: "cycle_id", header: "ID Cycle", sortable: true, align: "left" },
    { key: "title", header: "Intitulé du cycle", sortable: true, align: "left" },
    { key: "code", header: "Code du cycle", sortable: true, align: "left" },
    { key: "order", header: "Ordre", sortable: true, align: "center" },
    {
      key: "status",
      header: "Statut",
      sortable: true,
      align: "center",
      render: (row) => (
        <span className={`px-2 py-1 text-sm rounded-full ${row.deleted_at ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {row.deleted_at ? "Désactivé" : "Activé"}
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
            <Pencil className="h-4 w-4" />
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


  return (
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Liste des Cycles"
          breadcrumbs={[
            { label: "Opérations" },
            { label: "Paramètres" },
            { label: "Cycles", active: true },
          ]}
        />
        <Button className="bg-[#576CBC] hover:bg-[#19376D] text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2" onClick={handleOpenAddModal}>
          <Plus size={18} /> Ajouter un cycle
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
          data={allCycles}
          isLoading={isLoading || isFetching}
          onSelectedRowsChange={setSelectedRows}
          selectedRows={selectedRows}
          columnFilters={columnFilters}
          onFilterChange={handleDataTableFilterChange}
          onBulkDelete={handleBulkAction}
          enableBulkDelete={true}
          globalFilterKey="title"
          serverPagination={false}
          emptyText={isLoading ? "Chargement des données..." : "Aucun cycle trouvé."}
          initialPageSize={10}
          headerStyle="primary"
          hoverEffect
          striped
        />
      </div>

      {/* Modals */}
      <AddEditCycleModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        cycle={editingCycle}
        onSave={handleSaveCycle}
        isLoading={isSaving}
        allCycleCodes={existingCycleCodes} 
      />

      <CycleDetailsModal
        isOpen={!!selectedCycleForDetails}
        onClose={() => setSelectedCycleForDetails(null)}
        cycle={selectedCycleForDetails}
      />

      <ConfirmDialog
        isOpen={confirmToggleOpen}
        onClose={() => setConfirmToggleOpen(false)}
        onConfirm={handleConfirmToggle}
        title={cycleToToggle?.deleted_at ? "Confirmer la réactivation" : "Confirmer la désactivation"}
        description={
          cycleToToggle?.deleted_at
            ? `Êtes-vous sûr de vouloir réactiver le cycle "${cycleToToggle?.title}" ?`
            : `Êtes-vous sûr de vouloir désactiver le cycle "${cycleToToggle?.title}" ? Cette action est réversible.`
        }
        confirmText={cycleToToggle?.deleted_at ? "Réactiver" : "Désactiver"}
        cancelText="Annuler"
        isConfirming={isToggling}
      />

      <ConfirmDialog
        isOpen={showBulkActionDialog}
        onClose={() => setShowBulkActionDialog(false)}
        onConfirm={handleConfirmBulkAction}
        title="Confirmer l'action groupée"
        description={
          `Vous êtes sur le point de modifier le statut de ${pendingActionIds.length} cycle(s). ` +
          `Les cycles actifs seront désactivés et les inactifs seront réactivés. ` +
          `Êtes-vous sûr de vouloir continuer ?`
        }
        confirmText="Confirmer"
        cancelText="Annuler"
        isConfirming={isBulkActing}
      />
    </div>
  );
};
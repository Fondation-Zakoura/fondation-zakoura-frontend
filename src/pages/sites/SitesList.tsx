import React, { useState, useMemo, useCallback } from "react";
import { Plus, Trash2, Eye, Pencil } from "lucide-react";
import {
  useGetSitesQuery,
  useAddSiteMutation,
  useUpdateSiteMutation,
  useDeleteSitesMutation,
} from "@/features/api/sitesApi";
import {
  useGetRegionsQuery,
} from "@/features/api/geographicApi";
import { DataTable } from "@/components/ui/data-table";
import type { Column, ColumnFilter } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { AddEditSiteModal } from "@/components/sites/AddEditSiteModal";
import { SiteDetailsModal } from "@/components/sites/SiteDetailsModal";
import { DeleteSiteDialog } from "@/components/sites/DeleteSiteDialog";
import { PageHeaderLayout } from "@/layouts/MainLayout";
import type { Site } from "@/types/site"; // Import Site interface

const SitesListPage: React.FC = () => {
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSiteForDetails, setSelectedSiteForDetails] = useState<Site | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [tableFilters, setTableFilters] = useState<Record<string, string | string[]>>({});
  const [selectedRows, setSelectedRows] = useState<Site[]>([]);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);

  // Pass tableFilters to the query
  const { data: sitesData, error: fetchError, isLoading, refetch } = useGetSitesQuery({ filters: tableFilters, page: 1 });
  const [addSite] = useAddSiteMutation();
  const [updateSite] = useUpdateSiteMutation();
  const [deleteSites] = useDeleteSitesMutation();

  const { data: regions = [] } = useGetRegionsQuery();

  const typeOptions = useMemo(() => [
    { value: "Regroupement", label: "Regroupement" },
    { value: "Centre", label: "Centre" },
    { value: "Communautaire", label: "Communautaire" },
    { value: "Préscolaire", label: "Préscolaire" },
    // Add other types from your data if any
  ], []);

  const statusOptions = useMemo(() => [
    { value: "En pause", label: "En pause" },
    { value: "Archivée", label: "Archivée" },
    { value: "Active", label: "Active" },
    // Add other statuses from your data if any
  ], []);

  const educatorOptions = useMemo(() => [
    { value: "nasar fatin", label: "nasar fatin" },
    { value: "Mouchcine attif", label: "Mouchcine attif" },
    { value: "Non assignée", label: "Non assignée" },
    // Add other educators from your data
  ], []);

  const regionOptions = useMemo(() => regions.map(r => ({ value: r.name, label: r.name })), [regions]);

  const columnFilters = useMemo((): ColumnFilter[] => [
    // This filter for 'Type' corresponds to the 'TYPE' column in the image
    { id: "type", label: "Type", options: typeOptions },
    // This filter for 'Statut' corresponds to the 'STATUT' column in the image
    { id: "status", label: "Statut", options: statusOptions },
    // This filter for 'Educatrice' corresponds to the 'ÉDUCATRICE' column in the image
    { id: "educator", label: "Éducatrice", options: educatorOptions }, // Assuming 'educator' key in your Site type
    // If 'Site' filter is for the site's name or partner reference code:
    { id: "partner_reference_code", label: "Site", options: [] }, // You might need to populate this dynamically or remove if not a dropdown
    // If you still need a Region filter:
    { id: "commune.cercle.province.region.name", label: "Région", options: regionOptions },
  ], [typeOptions, statusOptions, educatorOptions, regionOptions]); // Added educatorOptions dependency

  const handleOpenAddModal = useCallback(() => {
    setEditingSite(null);
    setEditModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((site: Site) => {
    setEditingSite(site);
    setEditModalOpen(true);
  }, []);

  const handleSaveSite = useCallback(async (formData: FormData, id?: number) => {
    setIsSaving(true);
    try {
      if (id) await updateSite({ id, data: formData }).unwrap();
      else await addSite(formData).unwrap();
      setEditModalOpen(false);
      refetch(); // Refetch data after saving
    } catch (err) {
      console.error("Failed to save site:", err);
      // TODO: Add user-friendly error notification
    } finally {
      setIsSaving(false);
    }
  }, [addSite, updateSite, refetch]);

  const handleViewDetails = useCallback((site: Site) => setSelectedSiteForDetails(site), []);

  const handleDeleteRequest = useCallback((site: Site) => {
    setPendingDeleteIds([site.id]);
    setConfirmDeleteOpen(true);
  }, []);

  const handleBulkDelete = useCallback((ids: (string | number)[]) => {
    const numericIds = ids.map((id) => Number(id));
    if (!numericIds.length) return;
    setPendingDeleteIds(numericIds);
    setConfirmDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDeleteIds.length) return;
    setIsBulkDeleting(true);
    try {
      await deleteSites(pendingDeleteIds).unwrap();
      setConfirmDeleteOpen(false);
      setPendingDeleteIds([]);
      setSelectedRows([]); // Clear selected rows after deletion
      refetch(); // Refetch data after deletion
    } catch (err) {
      console.error("Delete failed:", err);
      // TODO: Add user-friendly error notification
    } finally {
      setIsBulkDeleting(false);
    }
  }, [deleteSites, pendingDeleteIds, refetch]);

  const columns: Column<Site>[] = useMemo(() => [
    { key: "id", header: "ID UNITÉ", sortable: true }, // Assuming 'id' is the primary key for ID UNITÉ
    { key: "name", header: "NOM DE L'UNITÉ", sortable: true },
    { key: "internal_code", header: "CODE INTERNE", sortable: true },
    { key: "partner_reference_code", header: "SITE", sortable: true }, // Changed to 'SITE' header
    { key: "type", header: "TYPE", sortable: true }, // Added 'TYPE' column
    { key: "status", header: "STATUT", sortable: true }, // Added 'STATUT' column
    { key: "educator", header: "ÉDUCATRICE", sortable: true }, // Added 'ÉDUCATRICE' column, assuming 'educator' key
    {
      key: "actions",
      header: "ACTIONS",
      align: "right",
      render: (row) => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => handleViewDetails(row)} className="p-2 rounded hover:bg-gray-200 text-gray-600" title="Voir">
            <Eye size={16} />
          </button>
          <button onClick={() => handleOpenEditModal(row)} className="p-2 rounded hover:bg-blue-100 text-blue-600" title="Éditer">
            <Pencil size={16} />
          </button>
          <button onClick={() => handleDeleteRequest(row)} className="p-2 rounded hover:bg-red-100 text-red-600" title="Supprimer">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ], [handleViewDetails, handleOpenEditModal, handleDeleteRequest]);

  const allSites = useMemo(() => sitesData?.data || [], [sitesData]);

  return (
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Liste des Sites"
          breadcrumbs={[
            { label: "Tableaux de bord" },
            { label: "Sites", active: true },
          ]}
        />
        <Button className="bg-[#576CBC] hover:bg-[#19376D] text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2" onClick={handleOpenAddModal}>
          <Plus size={18} /> Ajouter un site
        </Button>
      </div>

      <div className="max-w-screen-2xl mx-auto">
        {fetchError && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p className="font-bold">Erreur de chargement</p>
            <p>{String(fetchError)}</p>
          </div>
        )}

        <DataTable<Site>
          columns={columns}
          data={allSites}
          columnFilters={columnFilters}
          onFilterChange={setTableFilters}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          emptyText={isLoading ? "Chargement des données..." : "Aucun site trouvé"}
          initialPageSize={10}
          headerStyle="primary"
          hoverEffect
          striped
          globalFilterKey="name"
          onBulkDelete={handleBulkDelete}
        />
      </div>

      <AddEditSiteModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveSite}
        site={editingSite}
        isLoading={isSaving}
      />

      <SiteDetailsModal
        isOpen={!!selectedSiteForDetails}
        onClose={() => setSelectedSiteForDetails(null)}
        site={selectedSiteForDetails}
      />

      <DeleteSiteDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        siteName={
          pendingDeleteIds.length > 1
            ? `${pendingDeleteIds.length} sites sélectionnés`
            : allSites.find(site => site.id === pendingDeleteIds[0])?.name
        }
        isLoading={isBulkDeleting}
      />
    </div>
  );
};

export default SitesListPage;
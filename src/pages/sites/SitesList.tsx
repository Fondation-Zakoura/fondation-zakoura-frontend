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
  // Removed unused imports if provinces and communes are not directly used for options
  // useGetProvincesQuery,
  // useGetCommunesQuery,
} from "@/features/api/geographicApi";
import { DataTable } from "@/components/ui/data-table";
import type { Column, ColumnFilter } from "@/components/ui/data-table"; // Import types from DataTable
import { Button } from "@/components/ui/button";
import { AddEditSiteModal } from "@/components/sites/AddEditSiteModal";
import { SiteDetailsModal } from "@/components/sites/SiteDetailsModal";
import { DeleteSiteDialog } from "@/components/sites/DeleteSiteDialog";
import type { Site } from "@/types/site";
import { PageHeaderLayout } from "@/layouts/MainLayout";

const SitesListPage: React.FC = () => {
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSiteForDetails, setSelectedSiteForDetails] = useState<Site | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  // Use a more specific type for tableFilters
  const [tableFilters, setTableFilters] = useState<Record<string, string | string[]>>({});
  const [selectedRows, setSelectedRows] = useState<Site[]>([]);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);


  // Pass tableFilters to the query
  const { data: sitesApiResponse, error: fetchError, isLoading, refetch } = useGetSitesQuery({ filters: tableFilters, page: 1 });
  const [addSite] = useAddSiteMutation();
  const [updateSite] = useUpdateSiteMutation();
  const [deleteSites] = useDeleteSitesMutation();

  const { data: regions = [] } = useGetRegionsQuery();
  // Removed unused province and commune queries
  // const { data: provinces = [] } = useGetProvincesQuery(null, { skip: false });
  // const { data: communes = [] } = useGetCommunesQuery(null, { skip: false });


  const typeOptions = useMemo(() => [
    { value: "Rural", label: "Rural" },
    { value: "Urbain", label: "Urbain" },
    { value: "Semi-urbain", label: "Semi-urbain" },
  ], []);

  const statusOptions = useMemo(() => [
    { value: "Actif", label: "Actif" },
    { value: "Fermé", label: "Fermé" },
    { value: "En pause", label: "En pause" },
    { value: "Archivé", label: "Archivé" },
  ], []);

  // Ensure regionOptions are properly memoized
  const regionOptions = useMemo(() => regions.map(r => ({ value: r.name, label: r.name })), [regions]);
  // Removed unused provinceOptions and communeOptions
  // const provinceOptions = useMemo(() => provinces.map(p => ({ value: p.name, label: p.name })), [provinces]);
  // const communeOptions = useMemo(() => communes.map(c => ({ value: c.name, label: c.name })), [communes]);

  // Removed unused getCountryName function as it's not used in the component's render or logic
  // const getCountryName = useCallback((countryCode: string | undefined) => {
  //   if (!countryCode) return "N/A";
  //   const country = countries.find(c => c.code === countryCode);
  //   return country ? country.name : countryCode;
  // }, []);

  // The 'id' for region filter should match what your DataTable's getDeepValue expects
  // and what you plan to send to the backend.
  // If your backend expects `region_name`, change the `id` here and in `sitesApi.ts`.
  // If `region.name` is for client-side filtering only, and backend uses `region_id`, then
  // you need a more complex mapping in `onFilterChange` or `sitesApi`.
  const columnFilters = useMemo((): ColumnFilter[] => [
    { id: "type", label: "Type", options: typeOptions },
    { id: "status", label: "Statut", options: statusOptions },
    { id: "commune.cercle.province.region.name", label: "Région", options: regionOptions }, // Use the full path for filtering
  ], [typeOptions, statusOptions, regionOptions]);

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
    { key: "site_id", header: "ID Site", sortable: true },
    { key: "name", header: "Nom du site", sortable: true },
    { key: "internal_code", header: "Code interne", sortable: true },
    { key: "partner_reference_code", header: "Code partenaire", sortable: true },
    {
      // Use the full path for display as well
      key: "commune.cercle.province.region.name",
      header: "Région",
      sortable: true,
      render: (row) => row.commune?.cercle?.province?.region?.name || 'N/A',
    },
    {
      key: "actions",
      header: "Actions",
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

    const allSites = useMemo(() => sitesApiResponse?.data || [], [sitesApiResponse]);


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

        <DataTable<Site> // Explicitly type DataTable with Site
          columns={columns}
          data={allSites}
          columnFilters={columnFilters}
          onFilterChange={setTableFilters} // This will pass filters to the API query
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          emptyText={isLoading ? "Chargement des données..." : "Aucun site trouvé"}
          initialPageSize={10}
          headerStyle="primary"
          hoverEffect
          striped
          globalFilterKey="name" // Changed to a direct key from Site
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
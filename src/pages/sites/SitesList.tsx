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
  useGetProvincesQuery,
  useGetCommunesQuery,
} from "@/features/api/geographicApi";
import { DataTable } from "@/components/ui/data-table";
import type { Column, ColumnFilter } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { AddEditSiteModal } from "@/components/sites/AddEditSiteModal";
import { SiteDetailsModal } from "@/components/sites/SiteDetailsModal";
import { DeleteSiteDialog } from "@/components/sites/DeleteSiteDialog";

import countries from "@/data/countries.json"; // Import your countries data

const SitesListPage: React.FC = () => {
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSiteForDetails, setSelectedSiteForDetails] = useState<any | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<any | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [tableFilters, setTableFilters] = useState<Record<string, any>>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);

  const { data: sitesData, error: fetchError, isLoading, refetch } = useGetSitesQuery({ filters: tableFilters, page: 1 });
  const [addSite] = useAddSiteMutation();
  const [updateSite] = useUpdateSiteMutation();
  const [deleteSites] = useDeleteSitesMutation();

  const { data: regions = [] } = useGetRegionsQuery();
  const { data: provinces = [] } = useGetProvincesQuery(null, { skip: false });
  const { data: communes = [] } = useGetCommunesQuery(null, { skip: false });

  const typeOptions = [
    { value: "Rural", label: "Rural" },
    { value: "Urbain", label: "Urbain" },
    { value: "Semi-urbain", label: "Semi-urbain" },
  ];
  const statusOptions = [
    { value: "Actif", label: "Actif" },
    { value: "Fermé", label: "Fermé" },
    { value: "En pause", label: "En pause" },
    { value: "Archivé", label: "Archivé" },
  ];
  const regionOptions = regions.map(r => ({ value: r.name, label: r.name }));
  const provinceOptions = provinces.map(p => ({ value: p.name, label: p.name }));
  const communeOptions = communes.map(c => ({ value: c.name, label: c.name }));

  // Helper function to get country name from code
  const getCountryName = useCallback((countryCode: string | undefined) => {
    if (!countryCode) return "N/A";
    const country = countries.find(c => c.code === countryCode);
    return country ? country.name : countryCode; // Return name if found, otherwise the code itself
  }, []);

  const columnFilters = useMemo((): ColumnFilter<any>[] => [
    { id: "type", label: "Type", options: typeOptions },
    { id: "status", label: "Statut", options: statusOptions },
    // Adjust filter ID if you want to filter by the nested region name
    // For filtering, you might need a custom filter function or adjust your backend
    { id: "region.name", label: "Région", options: regionOptions }, // If your DataTable supports dot notation for filtering, this might work
  ], [regionOptions, provinceOptions, communeOptions]); // Keep all dependencies for completeness

  const handleOpenAddModal = useCallback(() => {
    setEditingSite(null);
    setEditModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((site: any) => {
    setEditingSite(site);
    setEditModalOpen(true);
  }, []);

  const handleSaveSite = useCallback(async (formData: FormData, id?: number) => {
    setIsSaving(true);
    try {
      if (id) await updateSite({ id, data: formData }).unwrap();
      else await addSite(formData).unwrap();
      setEditModalOpen(false);
      refetch();
    } catch (err) {
      console.error("Failed to save site:", err);
    } finally {
      setIsSaving(false);
    }
  }, [addSite, updateSite, refetch]);

  const handleViewDetails = useCallback((site: any) => setSelectedSiteForDetails(site), []);

  const handleDeleteRequest = useCallback((site: any) => {
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
      setSelectedRows([]);
      refetch();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsBulkDeleting(false);
    }
  }, [deleteSites, pendingDeleteIds, refetch]);

  const columns: Column<any>[] = useMemo(() => [
    { key: "site_id", header: "ID Site", sortable: true },
    { key: "name", header: "Nom du site", sortable: true },
    { key: "internal_code", header: "Code interne", sortable: true },
    { key: "partner_reference_code", header: "Code partenaire", sortable: true },
    {
      key: "region", // Keep the key as 'region' or change it to match the actual display field
      header: "Région",
      sortable: true, // You might need custom sorting if `DataTable` doesn't handle nested properties automatically
      render: (row) => row.commune?.cercle?.province?.region?.name || 'N/A', // <-- FIX: Access nested name
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
  ], [handleViewDetails, handleOpenEditModal, handleDeleteRequest, getCountryName]); // getCountryName dependency is not directly used in columns, but harmless.

  const allSites = useMemo(() => sitesData?.data || [], [sitesData]);
  const pageCount = sitesData?.meta?.last_page || 1;
  const pageIndex = (sitesData?.meta?.current_page || 1) - 1;

  return (
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Liste des Sites</h1>
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

        <DataTable
          columns={columns}
          data={allSites}
          columnFilters={columnFilters}
          onFilterChange={setTableFilters}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          emptyText={isLoading ? "Chargement des données..." : "Aucun site trouvé"}
          initialPageSize={15}
          headerStyle="primary"
          hoverEffect
          striped
          globalFilterKey="name"
          serverPagination
          pageCount={pageCount}
          pageIndex={pageIndex}
          onPaginationChange={({ pageIndex }) => refetch({ filters: {}, page: pageIndex + 1 })}
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
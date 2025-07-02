import React, { useEffect, useState, useMemo } from "react";
import { Plus, Trash2, ChevronRight, Eye, Pencil } from "lucide-react";
import { AddEditPartnerModal } from "../components/partners/AddEditPartnerModal";
import { PartnerDetailsModal } from "../components/partners/PartnersTable";
import type { Partner, FilterOption } from "../types/partners";
import {
  useGetPartnersQuery,
  useAddPartnerMutation,
  useUpdatePartnerMutation,
  useDeletePartnersMutation,
} from "../features/partnersApi";
import { DataTable } from "../components/ui/data-table";
import type { Column, ColumnFilter } from "../components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// --- MAIN PAGE COMPONENT ---
const PartnersListPage: React.FC = () => {
  // State for modals and single item actions
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPartnerForDetails, setSelectedPartnerForDetails] =
    useState<Partner | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // State for filter options needed for the Add/Edit Modal
  const [filterOptions, setFilterOptions] = useState<
    Record<string, FilterOption[]>
  >({});
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  // State for row selection
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Loading states for delete dialogs
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // RTK Query: Fetch ALL partners once
  const {
    data: partnersData,
    error: fetchError,
    isLoading,
    refetch,
  } = useGetPartnersQuery({ filters: {} });

  const [addPartner] = useAddPartnerMutation();
  const [updatePartner] = useUpdatePartnerMutation();
  const [deletePartners] = useDeletePartnersMutation();

  // Memoize partners list to prevent re-renders
  const allPartners = useMemo(() => partnersData?.data || [], [partnersData]);

  // Fetch filter options for the modals and the table filters
  useEffect(() => {
    const fetchAllOptions = async () => {
      const typeOptions: FilterOption[] = [
        { id: "National", name: "National" },
        { id: "International", name: "International" },
      ];
      const endpoints = {
        natures: "/nature-partners",
        structures: "/structure-partners",
        statuts: "/status-partners",
      };
      try {
        const api = (await import("../features/api")).api;
        const results = await Promise.all(
          Object.values(endpoints).map((endpoint) => api.getOptions(endpoint))
        );
        setFilterOptions({
          natures: results[0],
          structures: results[1],
          statuts: results[2],
          types: typeOptions,
        });
      } catch (err) {
        console.error("Failed to fetch filter options:", err);
      }
    };
    fetchAllOptions();
  }, []);

  // Prepare the filter configuration for the DataTable
  const columnFilters = useMemo((): ColumnFilter<Partner>[] => {
    if (
      !filterOptions.natures ||
      !filterOptions.structures ||
      !filterOptions.types
    ) {
      return [];
    }

    return [
      {
        id: "nature_partner", // This key must match the key in your Partner data object
        label: "Nature du partenaire",
        options: filterOptions.natures.map((n) => ({
          value: n.name,
          label: n.name,
        })),
      },
      {
        id: "partner_type",
        label: "Type du partenaire",
        options: filterOptions.types.map((t) => ({
          value: t.name,
          label: t.name,
        })),
      },
      {
        id: "structure_partner",
        label: "Structure du partenaire",
        options: filterOptions.structures.map((s) => ({
          value: s.name,
          label: s.name,
        })),
      },
    ];
  }, [filterOptions]);

  // --- Modal and Action Handlers ---
  const handleOpenAddModal = () => {
    setEditingPartner(null);
    setEditModalOpen(true);
  };
  const handleOpenEditModal = (partner: Partner) => {
    setEditingPartner(partner);
    setEditModalOpen(true);
  };
  const handleSavePartner = async (formData: FormData, id?: number) => {
    setIsSaving(true);
    try {
      if (id) {
        await updatePartner({ id, data: formData }).unwrap();
      } else {
        await addPartner(formData).unwrap();
      }
      setEditModalOpen(false);
      refetch();
    } catch (err) {
      console.error("Failed to save partner:", err);
    } finally {
      setIsSaving(false);
    }
  };
  const handleDeleteRequest = (id: number) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    setIsDeleting(true);
    try {
      await deletePartners([pendingDeleteId]).unwrap();
      setConfirmOpen(false);
      setPendingDeleteId(null);
      refetch();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };
  const handleCancelDelete = () => {
    if (isDeleting) return; // Prevent closing while deleting
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };
  const handleViewDetails = (partner: Partner) =>
    setSelectedPartnerForDetails(partner);

  // Row selection handlers
  // const handleSelectRow = (row: Partner, checked: boolean) => {
  //   setSelectedRows((prev) =>
  //     checked ? [...prev, row.id] : prev.filter((id) => id !== row.id)
  //   );
  // };

  // const handleSelectAll = (checked: boolean) => {
  //   setSelectedRows(checked ? allPartners.map((p) => p.id) : []);
  // };

  const handleBulkDelete = (ids: number[]) => {
    if (!ids.length) return;
    setPendingDeleteIds(ids);
    setShowBulkDeleteDialog(true);
  };

  const handleConfirmBulkDelete = async () => {
    if (!pendingDeleteIds.length) return;
    setIsBulkDeleting(true);
    try {
      await deletePartners(pendingDeleteIds).unwrap();
      setSelectedRows([]);
      setPendingDeleteIds([]);
      setShowBulkDeleteDialog(false);
      refetch();
    } catch (err) {
      console.error("Bulk delete failed:", err);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // --- DataTable Column Definitions ---
  const columns: Column<Partner>[] = [
    {
      key: "partner_logo",
      header: "Logo",
      render: (row) =>
        row.logo_url ? (
          <img
            src={row.logo_url}
            alt={row.partner_name}
            className="h-10 w-10 rounded-full object-cover border"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
            <span className="text-xs font-bold">
              {row.partner_name?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
        ),
      width: 80,
      align: "center",
    },
    { key: "partner_name", header: "Nom", sortable: true },
    { key: "abbreviation", header: "Abbr.", sortable: true },
    { key: "country", header: "Pays", sortable: true },
    { key: "partner_type", header: "Type", sortable: true },
    { key: "nature_partner", header: "Nature", sortable: true },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex gap-1 justify-end">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-2 rounded hover:bg-gray-200 text-gray-600"
            title="Voir"
          >
            <Eye size={16} />
          </button>
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
    },
  ];

  return (
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 min-h-screen font-sans">
      <div className="max-w-screen-2xl mx-auto ">
        <header className="mb-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-gray-500">
              <li>
                <a href="#" className="hover:underline">
                  Partenariat
                </a>
              </li>
              <li>
                <ChevronRight size={16} />
              </li>
              <li>
                <span className="font-medium text-gray-700">Partenaires</span>
              </li>
            </ol>
          </nav>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestion des Partenaires
              </h1>
              <p className="text-base text-gray-600 mt-1">
                {isLoading
                  ? "Chargement des partenaires..."
                  : `Total de ${allPartners.length} partenaires.`}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0 shrink-0">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-[#008c95] text-white rounded-lg shadow-sm hover:bg-[#00727a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#008c95] focus:ring-offset-2"
                onClick={handleOpenAddModal}
              >
                <Plus size={18} /> Ajouter un partenaire
              </button>
            </div>
          </div>
        </header>

        {fetchError && (
          <div
            className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
            role="alert"
          >
            <p className="font-bold">Erreur de chargement</p>
            <p>{String(fetchError)}</p>
          </div>
        )}

        {/* --- DATA TABLE IMPLEMENTATION --- */}
        <DataTable
          columns={columns}
          data={allPartners}
          columnFilters={columnFilters}
          emptyText={
            isLoading ? "Chargement des données..." : "Aucun partenaire trouvé"
          }
          initialPageSize={10}
          headerStyle="primary"
          hoverEffect
          striped
          onBulkDelete={handleBulkDelete}
        />
      </div>

      {/* --- Modals and Confirmation Dialogs --- */}
      <AddEditPartnerModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSavePartner}
        partner={editingPartner}
        options={filterOptions}
        serverErrors={{}}
        isLoading={isSaving}
      />
      <PartnerDetailsModal
        isOpen={!!selectedPartnerForDetails}
        onClose={() => setSelectedPartnerForDetails(null)}
        partner={selectedPartnerForDetails}
      />

      {/* Single Delete Confirmation Dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 p-2 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Confirmer la suppression
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Êtes-vous sûr de vouloir supprimer ce partenaire ? Cette action
                est réversible (soft delete).
              </p>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
              <button
                type="button"
                disabled={isDeleting}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition ${
                  isDeleting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleConfirmDelete}
              >
                {isDeleting && (
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                )}
                Confirmer
              </button>
              <button
                type="button"
                disabled={isDeleting}
                className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition ${
                  isDeleting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleCancelDelete}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Êtes-vous sûr de vouloir supprimer ?</DialogTitle>
            <DialogDescription>
              {pendingDeleteIds.length > 1
                ? `Vous êtes sur le point de supprimer ${pendingDeleteIds.length} partenaires. `
                : "Vous êtes sur le point de supprimer ce partenaire. "}
              Cette action est réversible (soft delete).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <button
                type="button"
                disabled={isBulkDeleting}
                className={`inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition ${
                  isBulkDeleting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => setPendingDeleteIds([])}
              >
                Annuler
              </button>
            </DialogClose>
            <button
              type="button"
              disabled={isBulkDeleting}
              className={`inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition ${
                isBulkDeleting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleConfirmBulkDelete}
            >
              {isBulkDeleting && (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              Confirmer la suppression
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnersListPage;

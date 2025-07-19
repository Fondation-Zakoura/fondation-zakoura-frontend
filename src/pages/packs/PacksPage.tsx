import { useState, useMemo, useCallback } from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { Plus } from "lucide-react";
import {
  useGetPacksQuery,
  useDeletePackMutation,
  useDeletePacksMutation,
} from "@/features/api/packs";
import { DataTable, type ColumnFilter } from "@/components/ui/data-table";
import { PageHeaderLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import AddPackModal from "./AddPackModal";
import EditPackModal from "./EditPackModal";
import ViewPackArticlesModal from "./ViewPackArticlesModal";
import type { TransformedPack } from "@/types/packs";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
export default function PacksPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 const [viewArticlesPack, setViewArticlesPack] = useState<TransformedPack | null>(null);
  const [selectedPackId, setSelectedPackId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [currentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const { data: packData, isError, refetch } = useGetPacksQuery({
    page: currentPage,
    perPage: rowsPerPage,
  });
  const userName = useSelector((state: RootState) => state.user.name);

  const [deletePack] = useDeletePackMutation();
  const [deletePacks] = useDeletePacksMutation();

  const handleAddOpen = () => setIsAddModalOpen(true);
  const handleEdit = (row: TransformedPack) => {
  setSelectedPackId(row.id);
  setIsEditModalOpen(true);
};

const handleViewArticles = (row: TransformedPack) => {
  setViewArticlesPack(row);
};

const handleDeleteClick = useCallback((row: TransformedPack) => {
  setDeleteId(row.id);
}, []);

  const handleCloseModal = () => setDeleteId(null);

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePack(deleteId).unwrap();
      refetch();
      setDeleteId(null);
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const handleBulkDelete = async (ids: number[]) => {
    if (ids.length === 0) return;
    if (!window.confirm(`Supprimer ${ids.length} packs sélectionnés?`)) return;
    try {
      await deletePacks({ ids }).unwrap();
      refetch();
    } catch (err) {
      console.error("Erreur suppression multiple:", err);
    }
  };

  const transformedData: TransformedPack[] = useMemo(
  () =>
    packData?.data?.map((pack) => ({
      id: pack.pack_id, // 
      pack_id: pack.pack_id,
      name: pack.name,
      description: pack.description ?? "",
      articlesCount: pack.articles?.length ?? 0,
      articles: pack.articles ?? [],
      created_at: pack.created_at ?? "",
      created_by: userName || "N/A",
      deleted_at: pack.deleted_at,
      status: pack.deleted_at === null ? "1" : "0",
    })) ?? [],
[userName, packData]
);

  const columns = [
    { key: "pack_id", header: "ID Pack", sortable: true },
    { key: "name", header: "Nom", sortable: true },
    { key: "description", header: "Description" },
    {
      key: "articlesCount",
      header: "Articles",
      render: (row: TransformedPack) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleViewArticles(row);
          }}
        >
          Voir
        </Button>
      ),
    },
    {
      key: "created_at",
      header: "Date création",
      render: (row: TransformedPack) =>
        row.created_at
          ? new Date(row.created_at).toLocaleDateString()
          : "—",
    },
    { key: "created_by", header: "Créé par" },
    {
      key: "status",
      header: "Statut",
      sortable: true,
      render: (row: TransformedPack) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            row.status === "1"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.status === "1" ? "Actif" : "Inactif"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: TransformedPack) => (
        <div className="flex gap-2">
          <button
            className="text-gray-600 hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              handleViewArticles(row);
            }}
          >
            <FaEye />
          </button>
          <button
            className="text-gray-600 hover:text-green-600"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
          >
            <FaEdit />
          </button>
          <button
            className="text-gray-600 hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

 const columnFilters: ColumnFilter[]= [
    {
      id: "status",
      label: "Statut",
      options: [
        { value: "1", label: "Actif" },
        { value: "0", label: "Inactif" },
      ],
    },
    {
      id: "created_by",
      label: "Créé par",
      options: Array.from(new Set(transformedData.map((p) => p.created_by))).map((name) => ({
        value: name,
        label: name,
      })),
    },
  ];

  if (isError) return <p>Erreur lors du chargement des packs.</p>;

  return (
    <div className="space-y-4 mx-4">
      <div className="flex justify-between items-center">
        <PageHeaderLayout
          title="Liste des Packs"
          breadcrumbs={[{ label: "Achat" }, { label: "Packs", active: true }]}
        />
        <Button
          onClick={handleAddOpen}
          className="bg-[#18365A] hover:bg-blue-900 cursor-pointer text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Ajouter un Pack
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={transformedData}
        columnFilters={columnFilters}
        emptyText="Aucun pack trouvé."
        striped
        hoverEffect
        globalFilterKey="name"
        initialPageSize={rowsPerPage}
        onBulkDelete={handleBulkDelete}
        onRowClick={handleViewArticles}
        
      />

          {isAddModalOpen && (
        <AddPackModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {isEditModalOpen && selectedPackId !== null && (
        <EditPackModal
          key={selectedPackId}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          packId={selectedPackId}
        />
      )}

      {viewArticlesPack && (
        <ViewPackArticlesModal
          pack={viewArticlesPack}
          onClose={() => setViewArticlesPack(null)}
        />
      )}

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Supprimer le pack"
        description="Cette action supprimera le pack de façon permanente. Êtes-vous sûr ?"
      />
    </div>
  );
}
import { useState, useMemo, useCallback } from "react";
import AddCategory from "./AddCategory";
import EditCategoryModal from "./EditCategoryModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ViewCategoryModal from "./ShowCategory";
import { useGetProductsQuery } from "@/features/api/products";
import InfoDialog from "@/components/ui/InfoDialog";
import {
  useGetCategoriesQuery,
  useDeleteCategoriesMutation,
  useDeleteCategoryMutation,
} from "../../features/api/categoriesApi";
import { DataTable } from "@/components/ui/data-table";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { PageHeaderLayout } from "@/layouts/MainLayout";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";


type TransformedRow = {
  id: number;
  code: number;
  name: string;
  status: string;
  description: string;
  deleted_at: string | null;
};

type InfoContent = {
  title: string;
  description: string;
};

export default function CategoriesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCode, setSelectedCode] = useState<number | null>(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [infoDialogContent, setInfoDialogContent] = useState<InfoContent>({
    title: "",
    description: "",
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: categoryData, isError, refetch } = useGetCategoriesQuery({
    page: currentPage,
    perPage: rowsPerPage,
    withTrashed: true,
  });

  const { data: productsData } = useGetProductsQuery({
    page: currentPage,
    perPage: rowsPerPage,
    withTrashed: true,
  });

  const [deleteCategories] = useDeleteCategoriesMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const handleDeleteClick = useCallback((row: TransformedRow) => {
    setDeleteId(row.id);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    const relatedProducts =
      productsData?.data?.filter((prod) => prod.category_id === deleteId) ?? [];

    if (relatedProducts.length > 0) {
      setInfoDialogContent({
        title: "Suppression impossible",
        description:
          "Impossible de supprimer cette catégorie car des produits y sont associés. Veuillez les dissocier avant de réessayer.",
      });
      setInfoDialogOpen(true);
      setShowDeleteModal(false);
      setDeleteId(null);
      return;
    }

    try {
      await deleteCategory(deleteId).unwrap();
      refetch();
    } catch (err) {
      console.error("Erreur suppression:", err);
      setInfoDialogContent({
        title: "Erreur",
        description: "La suppression a échoué. Veuillez réessayer.",
      });
      setInfoDialogOpen(true);
    }

    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const transformedData: TransformedRow[] = useMemo(() => {
    return (
      categoryData?.data?.map((cat) => ({
        id: cat.category_id,
        code: cat.category_id,
        name: cat.name,
        status: cat.deleted_at === null ? "Active" : "Inactive",
        deleted_at: cat.deleted_at,
        description: cat.description ?? "",
      })) ?? []
    );
  }, [categoryData]);

  const columns = useMemo(
    () => [
      { key: "code", header: "Code", sortable: true },
      { key: "name", header: "Nom", sortable: true },
      {
        key: "status",
        header: "Statut",
        render: (row: TransformedRow) => (
          <span
            className={`px-2 py-1 text-sm rounded-full ${
              row.deleted_at === null
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {row.deleted_at === null ? "Active" : "Inactive"}
          </span>
        ),
      },
      { key: "description", header: "Description" },
      {
        key: "actions",
        header: "Actions",
        render: (row: TransformedRow) => (
          <div className="flex gap-3">
            <button
              className="text-gray-600 hover:text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCategoryId(row.id);
                setViewModalOpen(true);
              }}
            >
              <FaEye />
            </button>
            <button
              className="text-gray-600 hover:text-green-600"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCode(row.id);
                setEditModalOpen(true);
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
    ],
    [handleDeleteClick]
  );

  if (isError) return <p>Erreur lors du chargement des catégories.</p>;

  return (
    <div className="p-6 bg-white rounded-2xl mx-4">
      <div className="mb-4 flex justify-between">
        <PageHeaderLayout
          title="Liste des catégories"
          breadcrumbs={[{ label: "Catégories", active: true }]}
        />
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-[#18365A] hover:bg-blue-900 cursor-pointer text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Ajouter une catégorie
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={transformedData}
        emptyText="Aucune catégorie trouvée."
        onRowClick={(row: TransformedRow) => {
          setSelectedCategoryId(row.id);
          setViewModalOpen(true);
        }}
        globalFilterKey="name"
        onBulkDelete={async (selectedIds: number[]) => {
  try {
    await deleteCategories({ ids: selectedIds.map(String) }).unwrap();
    refetch();
  } catch (err) {
    console.error("Erreur lors de la suppression multiple:", err);
  }
}}
        pagination={{
          server: true,
          totalRows: categoryData?.meta?.total ?? 0,
          currentPage,
          rowsPerPage,
          onPageChange: setCurrentPage,
          onRowsPerPageChange: (perPage) => {
            setRowsPerPage(perPage);
            setCurrentPage(1);
          },
        }}
      />

      {isOpen && (
        <AddCategory isOpen={isOpen} onClose={() => setIsOpen(false)} title="Ajouter une catégorie" />
      )}

      {editModalOpen && selectedCode !== null && (
        <EditCategoryModal
          key={selectedCode}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          categoryCode={selectedCode}
        />
      )}

      {viewModalOpen && selectedCategoryId !== null && (
        <ViewCategoryModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          categoryId={selectedCategoryId}
        />
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Supprimer la catégorie"
        description="Cette action supprimera la catégorie de façon permanente. Êtes-vous sûr ?"
      />

      <InfoDialog
        isOpen={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        title={infoDialogContent.title}
        description={infoDialogContent.description}
        duration={3000}
      />
    </div>
  );
}
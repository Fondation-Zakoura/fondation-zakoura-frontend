import { useState, useMemo } from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { Plus } from "lucide-react";

import { useGetProductsQuery } from "@/features/api/products";
import { DataTable, type ColumnFilter } from "@/components/ui/data-table";
import { PageHeaderLayout } from "@/layouts/MainLayout";
import AddCategory from "./AddCategory";
import EditCategoryModal from "./EditCategoryModal";
import ViewCategoryModal from "./ShowCategory";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import InfoDialog from "@/components/ui/InfoDialog";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types/categories";
import { useDeleteCategoriesMutation, useDeleteCategoryMutation, useGetCategoriesQuery } from "@/features/api/categoriesApi";
 
type TransformedRow = {
  id: number;
  code: number;
  name: string;
  description: string;
  deleted_at: string | null;
  status: "1" | "0";
};
 
export default function CategoriesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCode, setSelectedCode] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [infoDialogContent, setInfoDialogContent] = useState({ title: "", description: "" });
  
  // At the top of your CategoriesPage component
const [queryParams, setQueryParams] = useState({
  page: 1,
  perPage: 5,
  search: "",
  sort_by: null as string | null,
  sort_direction: null as 'asc' | 'desc' | null,
  withTrashed: false,
});
  // Replace your existing useGetCategoriesQuery call with this
const { data: categoryData, isError, isLoading, refetch } = useGetCategoriesQuery(queryParams);
 
  const { data: productsData } = useGetProductsQuery({
    page: 1,
    perPage: 100,
    withTrashed: true,
  });
 
  const [deleteCategories] = useDeleteCategoriesMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
 
  const transformedData: TransformedRow[] = useMemo(() => {
    return (
      categoryData?.data?.map((cat:Category) => ({
        id: cat.category_id,
        code: cat.category_id,
        name: cat.name,
        description: cat.description ?? "",
        deleted_at: cat.deleted_at,
        status: cat.deleted_at === null ? "1" : "0",
      })) ?? []
    );
  }, [categoryData]);
 
  const columns = useMemo(() => {
    return [
      { key: "code", header: "Code", sortable: true },
      { key: "name", header: "Nom", sortable: true },
      {
        key: "status",
        header: "Statut",
        render: (row: TransformedRow) => (
          <span
            className={`px-2 py-1 text-sm rounded-full ${
              row.status === "1"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {row.status === "1" ? "Active" : "Inactive"}
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
                setDeleteId(row.id);
              }}
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
    ];
  }, []);
 
  const columnFilters: ColumnFilter[] = [
    {
      id: "status",
      label: "Statut",
      options: [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
      ],
    },
  ];
  // Add these handler functions inside your CategoriesPage component

const handlePaginationChange = (pagination: { pageIndex: number; pageSize: number }) => {
  setQueryParams(prev => ({
    ...prev,
    page: pagination.pageIndex + 1, // API is 1-indexed
    perPage: pagination.pageSize,
  }));
};

const handleSearchChange = (value: string) => {
  // We reset to page 1 on a new search
  setQueryParams(prev => ({ ...prev, search: value, page: 1 }));
};

const handleSortChange = (key: string | null, direction: 'asc' | 'desc' | null) => {
  setQueryParams(prev => ({ ...prev, sort_by: key, sort_direction: direction }));
};

const handleFilterChange = (filters: Record<string, string | string[]>) => {
  // Your logic here is safe because you know your 'status' filter only sends simple strings
  const withTrashed = filters.status === "0"; // "0" is Inactive
  setQueryParams(prev => ({ ...prev, withTrashed, page: 1 }));
};
 
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
      setDeleteId(null);
      return;
    }
 
    try {
      await deleteCategory(deleteId).unwrap();
      refetch();
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
 
    setDeleteId(null);
  };
 
  const handleBulkDelete = async (ids: number[]) => {
    try {
      await deleteCategories({ ids: ids.map(String) }).unwrap();
      refetch();
    } catch (err) {
      console.error("Erreur lors de la suppression multiple:", err);
    }
  };
 
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
 
    

<DataTable<TransformedRow>
  columns={columns}
  data={transformedData}
  columnFilters={columnFilters}
  emptyText="Aucune catégorie trouvée."
  onBulkDelete={handleBulkDelete}
  onRowClick={(row) => {
    setSelectedCategoryId(row.id);
    setViewModalOpen(true);
  }}

  // --- SERVER-SIDE PROPS ---
  serverPagination={true}
  isLoading={isLoading}

  // Controlled State Props
  pageIndex={categoryData?.pagination?.current_page ? categoryData.pagination.current_page - 1 : 0}
  pageCount={categoryData?.pagination?.total_pages || 0}
  globalFilterValue={queryParams.search}
   sortConfig={
    queryParams.sort_by && queryParams.sort_direction
      ? { key: queryParams.sort_by, direction: queryParams.sort_direction }
      : null
  }

  // Callback Handlers
  onPaginationChange={handlePaginationChange}
  onGlobalSearchChange={handleSearchChange}
  onSortChange={handleSortChange}
  onFilterChange={handleFilterChange}
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
  isOpen={!!deleteId}
  onClose={() => setDeleteId(null)}
  onConfirm={handleConfirmDelete}
  title="Supprimer la catégorie"
  description="Cette action supprimera la catégorie de façon permanente. Êtes-vous sûr ?"
/>
 
<InfoDialog
  isOpen={infoDialogOpen}
  onClose={() => setInfoDialogOpen(false)}
  title={infoDialogContent.title}
  description={infoDialogContent.description}
  duration={4500}
/>
    </div>
  );
};
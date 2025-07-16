import { useState, useMemo, useCallback } from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { Plus } from "lucide-react";
import AddProductModal from "./AddProduct";
import EditProductModal from "./EditProductModal";
import ViewProductModal from "./ViewProductModal";
import {
  useGetProductsQuery,
  useDeleteProductsMutation,
  useDeleteProductMutation,
} from "@/features/api/products";
import { DataTable, type Column } from "@/components/ui/data-table";
import { PageHeaderLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";

type TransformedProductRow = {
  id: number;
  product_id: number;
  name: string;
  description: string;
  category: string;
  type: string;
  deleted_at: string | null;
  status: "1" | "0";
};
type LocalColumnFilter = {
  id: keyof TransformedProductRow;
  label: string;
  options: { value: string | number; label: string }[];
};

export default function ProductsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [currentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const { data: productData, isLoading, isError, refetch } = useGetProductsQuery({
    page: currentPage,
    perPage: rowsPerPage,
    withTrashed: true,
  });

  const [deleteProducts] = useDeleteProductsMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleEdit = useCallback((row: TransformedProductRow) => {
    setSelectedProductId(row.product_id);
    setIsEditModalOpen(true);
  }, []);

  const handleView = useCallback((row: TransformedProductRow) => {
    setSelectedProductId(row.product_id);
    setIsViewModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((row: TransformedProductRow) => {
    setDeleteId(row.product_id);
  }, []);

  const handleCloseModal = () => setDeleteId(null);

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId).unwrap();
      refetch();
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
    setDeleteId(null);
  };

  const handleBulkDelete = async (ids: number[]) => {
    if (ids.length === 0) return;
    try {
      await deleteProducts({ ids: ids.map(String) }).unwrap();
      refetch();
    } catch (err) {
      console.error("Erreur suppression multiple:", err);
    }
  };

  const transformedData: TransformedProductRow[] = useMemo(() => {
    return (
      productData?.data?.map((prod) => ({
        id: prod.product_id,
        product_id: prod.product_id,
        name: prod.name,
        description: prod.description ?? "",
        category: prod.category_name ?? "N/A",
        type: prod.product_type_name ?? "N/A",
        deleted_at: prod.deleted_at,
        status: prod.deleted_at === null ? "1" : "0",
      })) ?? []
    );
  }, [productData]);

  const columns: Column<TransformedProductRow>[] = useMemo(() => [
    { key: "product_id", header: "ID Produit", sortable: true },
    { key: "name", header: "Nom", sortable: true },
    { key: "description", header: "Description" },
    { key: "category", header: "Catégorie", sortable: true },
    { key: "type", header: "Type Produit", sortable: true },
    {
      key: "status",
      header: "Statut",
      sortable: true,
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            row.status === "1"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.status === "1" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button className="text-gray-600 hover:text-blue-600" onClick={(e) => {
            e.stopPropagation();
            handleView(row);
          }}>
            <FaEye />
          </button>
          <button className="text-gray-600 hover:text-green-600" onClick={(e) => {
            e.stopPropagation();
            handleEdit(row);
          }}>
            <FaEdit />
          </button>
          <button className="text-gray-600 hover:text-red-600" onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(row);
          }}>
            <FaTrash />
          </button>
        </div>
      ),
    },
  ], [handleEdit, handleView, handleDeleteClick]);

 const columnFilters: LocalColumnFilter[] = [
  {
    id: "status",
    label: "Statut",
    options: [
      { value: "1", label: "Active" },
      { value: "0", label: "Inactive" },
    ],
  },
  {
    id: "category",
    label: "Catégorie",
    options: Array.from(new Set(transformedData.map((p) => p.category))).map((cat) => ({
      value: cat,
      label: cat,
    })),
  },
];
  if (isLoading) return <div className="text-center py-8 text-lg text-gray-500">Chargement des produits...</div>;
  if (isError) return <p>Erreur lors du chargement des produits.</p>;

  return (
    <div className="space-y-4 mx-4">
      <div className="flex justify-between items-center">
        <PageHeaderLayout
          title="Liste des produits"
          breadcrumbs={[{ label: "Produits", active: true }]}
        />
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#18365A] hover:bg-blue-900 text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Ajouter un Produit
        </Button>
      </div>

      <DataTable<TransformedProductRow>
        columns={columns}
        data={transformedData}
        columnFilters={columnFilters}
        striped
        hoverEffect
        globalFilterKey="name"
        emptyText="Aucun produit trouvé."
        initialPageSize={rowsPerPage}
        onRowClick={handleView}
        onBulkDelete={handleBulkDelete}
      />

      {isAddModalOpen && (
        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Ajouter un produit"
        />
      )}
      {isEditModalOpen && selectedProductId !== null && (
        <EditProductModal
          key={selectedProductId}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          productId={selectedProductId}
        />
      )}
      {isViewModalOpen && selectedProductId !== null && (
        <ViewProductModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          productId={selectedProductId}
        />
      )}
      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Supprimer le produit"
        description="Cette action supprimera le produit de façon permanente. Êtes-vous sûr ?"
      />
    </div>
  );
}
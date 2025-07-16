import { useState, useMemo, useCallback } from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import AddProductModal from "./AddProduct";
import EditProductModal from "./EditProductModal";
import ViewProductModal from "./ViewProductModal";
import {
  useGetProductsQuery,
  useDeleteProductsMutation,
  useDeleteProductMutation,
} from "../../features/api/products";
import { DataTable } from "@/components/ui/data-table"; // ✅ your reusable component
import { PageHeaderLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";

export default function ProductsPage() {
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);


  // Pagination state
  const [currentPage, _setCurrentPage] = useState(1);
  const [rowsPerPage, _setRowsPerPage] = useState(10);

  // Data fetching
  const { data: productData, isLoading, isError, refetch } = useGetProductsQuery({
    page: currentPage,
    perPage: rowsPerPage,
  });

  const [deleteProducts] = useDeleteProductsMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleEdit = (row: { product_id: number }) => {
    setSelectedProductId(row.product_id);
    setIsEditModalOpen(true);
  };
  const handleView = (row: { product_id: number }) => {
    setSelectedProductId(row.product_id);
    setIsViewModalOpen(true);
  };
  const handleDeleteClick = useCallback((row: { product_id: number }) => {
  setDeleteId(row.product_id);
}, []);
const handleCloseModal = () => {
  setDeleteId(null);
};


  const handleConfirmDelete = async () => {
  if (!deleteId) return;
  try {
    await deleteProduct(deleteId).unwrap();
    refetch();
    setDeleteId(null);
  } catch (err) {
    console.error("Erreur suppression:", err);
  }
};


  const handleBulkDelete = async (ids: number[]) => {
    if (ids.length === 0) return;
    if (!window.confirm(`Supprimer ${ids.length} produits sélectionnés?`)) return;
    try {
      await deleteProducts({ ids: ids.map(String) }).unwrap();
      refetch();
    } catch (err) {
      console.error("Erreur suppression multiple:", err);
    }
  };

  // Data transformation
  const transformedData = useMemo(
    () =>
      productData?.data?.map((prod) => ({
        id: prod.product_id,
        product_id: prod.product_id, 
        name: prod.name,
        description: prod.description || "",
        category: prod.category_name || "N/A",
        type: prod.product_type_name || "N/A",
        status: prod.status,
      })) ?? [],
    [productData]
  );

  // Columns definition
  const columns = [
    { key: "product_id", header: "ID Produit", sortable: true },
    { key: "name", header: "Nom", sortable: true },
    { key: "description", header: "Description" },
    { key: "category", header: "Catégorie", sortable: true },
    { key: "type", header: "Type Produit", sortable: true },
    {
      key: "status",
      header: "Statut",
      sortable: true,
      render: (row: { id: number; product_id: number; name: string; description: string; category: string; type: string; status?: number }) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            row.status === 1
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.status === 1 ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: { product_id: number }) => (
        <div className="flex gap-2">
          <button
            className="text-gray-600 hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              handleView(row);
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

  // Filter dropdown example (optional)
  const columnFilters = [
    {
      id: "status",
      label: "Statut",
      options: [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
      ],
    },
      {
    id: "category", // Must match the key in `transformedData`
    label: "Catégorie",
    options: Array.from(
      new Set(transformedData.map((p) => p.category))
    ).map((cat) => ({
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
            
            breadcrumbs={[
              { label: 'Produits', active: true }
            ]}
          />
          <Button
            onClick={()=>setIsAddModalOpen(true)}
            className="bg-[#18365A] hover:bg-blue-900 cursor-pointer text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4"  /> Ajouter un Produit
          </Button>
      </div>

      <DataTable
        columns={columns}
        data={transformedData}
        columnFilters={columnFilters}
        emptyText="Aucun produit trouvé."
        striped
        hoverEffect
        globalFilterKey="name"
        initialPageSize={5}
        onBulkDelete={(selectedIds: number[]) => handleBulkDelete(selectedIds)}
        onRowClick={(row: { product_id: number }) => handleView(row)}
      />

      {isAddModalOpen && (
        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Ajouter un produit "
        />
      )}
      {isEditModalOpen && selectedProductId !== null && (
        <EditProductModal
          key={selectedProductId}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          productId={selectedProductId as number}
        />
      )}
      {isViewModalOpen && (
        <ViewProductModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          productId={selectedProductId as number}
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

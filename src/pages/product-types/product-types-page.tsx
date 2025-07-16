import { useState, useMemo, useCallback } from "react";
import { useGetProductTypesQuery, useDeleteProductTypeMutation, useDeleteProductTypesMutation } from "../../features/api/product_types";
import { DataTable } from "@/components/ui/data-table"; // your reusable DataTable

import AddProductTypeModal from "./AddProductTypeModal";
import EditProductTypeModal from "./EditProductTypeModal";
import ViewProductTypeModal from "./ViewProductTypeModal";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageHeaderLayout } from "@/layouts/MainLayout";

// Define ProductType type for type safety
type ProductType = {
  id: number;
  name: string;
  created_at: string;
};

const ProductTypesPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Fetch all product types without server pagination/filtering (handled in reusable table)
  const { data: productTypesData, isError, refetch } = useGetProductTypesQuery({ page: 1, perPage: 100 });

  // Delete mutations
  const [deleteProductType] = useDeleteProductTypeMutation();
  const [deleteProductTypes] = useDeleteProductTypesMutation();

  const handleCloseModal = () => {
    setDeleteId(null);
  };

  const handleDeleteClick = useCallback((row: ProductType) => {
    setDeleteId(row.id);
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProductType(deleteId).unwrap();
      refetch();
      setDeleteId(null);
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  // Prepare rows: your backend data shape:
  // [{ id: 1, name: "service", created_at: "2025-07-02 13:51:17" }]
  const rows = useMemo<ProductType[]>(() => productTypesData?.data ?? [], [productTypesData]);

  // Define columns for DataTable
  const columns = useMemo(
    () => [
      { key: "id", header: "ID", sortable: true },
      { key: "name", header: "Nom", sortable: true },
      { key: "created_at", header: "Créé le", sortable: true },
      {
        key: "actions",
        header: "Actions",
        render: (row: ProductType) => (
          <div className="flex gap-3">
            <button
              className="text-gray-600 hover:text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(row.id);
                setIsViewModalOpen(true);
              }}
            >
              <FaEye />
            </button>
            <button
              className="text-gray-600 hover:text-green-600"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(row.id);
                setIsEditModalOpen(true);
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

  // Handle bulk delete from DataTable selection
  const handleBulkDelete = useCallback(
    async (ids: number[]) => {
      if (ids.length === 0) return;
      if (window.confirm(`Supprimer ${ids.length} type(s) de produit ?`)) {
        try {
          await deleteProductTypes({ ids }).unwrap();
          refetch();
        } catch (err) {
          console.error("Erreur lors de la suppression en masse:", err);
        }
      }
    },
    [deleteProductTypes, refetch]
  );

  if (isError) return <p>Erreur lors du chargement des types de produits.</p>;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-300">
      <div className="flex justify-between items-center mb-4">
        <PageHeaderLayout
                    title="Liste des types de produit"
                    
                    breadcrumbs={[
                      { label: 'Type de Produits', active: true }
                    ]}
                  />
                  <Button
                    onClick={()=>setIsAddModalOpen(true)}
                     className="bg-[#18365A] hover:bg-blue-900 cursor-pointer text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4"  /> Ajouter un type de  Produit
                  </Button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        emptyText="Aucun type de produit trouvé."
        onRowClick={(row: ProductType) => {
          setSelectedId(row.id);
          setIsViewModalOpen(true);
        }}
        onBulkDelete={handleBulkDelete}
        striped
        hoverEffect
        initialPageSize={10}
        // globalFilterKey = "name"
      />

      {isAddModalOpen && (
        <AddProductTypeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {isEditModalOpen && selectedId !== null && (
        <EditProductTypeModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          productTypeId={selectedId}
        />
      )}

      {isViewModalOpen && selectedId !== null && (
        <ViewProductTypeModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          productTypeId={selectedId}
        />
      )}
      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Supprimer le produit"
        description="Cette action supprimera le  type de produit de façon permanente. Êtes-vous sûr ?"
      />
    </div>
  );
};

export default ProductTypesPage;

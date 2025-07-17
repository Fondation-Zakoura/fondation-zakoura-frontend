import { useState, useMemo, useCallback } from "react";
import {
  useGetProductTypesQuery,
  useDeleteProductTypeMutation,
  useDeleteProductTypesMutation,
} from "@/features/api/product_types";

import { DataTable } from "@/components/ui/data-table";
import AddProductTypeModal from "./AddProductTypeModal";
import EditProductTypeModal from "./EditProductTypeModal";
import ViewProductTypeModal from "./ViewProductTypeModal";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";

import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageHeaderLayout } from "@/layouts/MainLayout";
import InfoDialog from "@/components/ui/InfoDialog";

type ProductType = {
  id: number;
  name: string;
  created_at: string;
  deleted_at: string | null;
  status: "1" | "0";
};

const ProductTypesPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
 const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [infoDialogContent, setInfoDialogContent] = useState({ title: "", description: "" });


  const { data: productTypesData, isError, refetch } = useGetProductTypesQuery({
    page: 1,
    perPage: 100,
    withTrashed: true,
  });

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
    } catch (err:any) {
      console.error("Erreur suppression:", err);
      if (err.status === 409) {
        setInfoDialogContent({
          title: "Suppression impossible",
          description:
            "Impossible de supprimer ce type de produit car il est utilisé et ne peut pas supprimé car il est associé à d'autres enregistrements.",
        });
        setInfoDialogOpen(true);
        setDeleteId(null);
      }

    }
    
  };

  const rows: ProductType[] = useMemo(() => {
    return (
      productTypesData?.data?.map((type) => ({
        id: type.id,
        name: type.name,
        created_at: type.created_at,
        deleted_at: type.deleted_at,
        status: type.deleted_at === null ? "1" : "0",
      })) ?? []
    );
  }, [productTypesData]);

  const columns = useMemo(() => [
    { key: "id", header: "ID", sortable: true },
    { key: "name", header: "Nom", sortable: true },
    { key: "created_at", header: "Créé le", sortable: true },
    {
      key: "status",
      header: "Statut",
      sortable: true,
      render: (row: ProductType) => (
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
  ], [handleDeleteClick]);

  const columnFilters = useMemo(() => [
    {
      id: "status",
      label: "Statut",
      options: [
        { value: "1", label: "Actif" },
        { value: "0", label: "Inactif" },
      ],
    },
  ], []);

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
    <div className="p-6 bg-white ">
      <div className="flex justify-between items-center mb-4">
        <PageHeaderLayout
          title="Liste des types de produit"
          breadcrumbs={[{ label: "Type de Produits", active: true }]}
        />
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#18365A] hover:bg-blue-900 text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Ajouter un type de Produit
        </Button>
      </div>

      <DataTable<ProductType>
        columns={columns}
        data={rows}
        columnFilters={columnFilters}
        emptyText="Aucun type de produit trouvé."
        onRowClick={(row) => {
          setSelectedId(row.id);
          setIsViewModalOpen(true);
        }}
        onBulkDelete={handleBulkDelete}
        striped
        hoverEffect
        initialPageSize={10}
        globalFilterKey="name"
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
        title="Supprimer le type de produit"
        description="Cette action supprimera le type de produit de façon permanente. Êtes-vous sûr ?"
      />
     <InfoDialog
       isOpen={infoDialogOpen}
       onClose={() => setInfoDialogOpen(false)}
       title={infoDialogContent.title}
       description={infoDialogContent.description}
       duration={2500}
     />

    </div>
  );
};

export default ProductTypesPage;
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
import { useGetCategoriesQuery } from "@/features/api/categoriesApi"; // Import categories query
import { DataTable, type Column, type ColumnFilter } from "@/components/ui/data-table";
import { PageHeaderLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import type { Product, ProductQueryParams } from "@/types/products"; // Import correct types

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

export default function ProductsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // 1. Unified state for all API query parameters
  const [queryParams, setQueryParams] = useState<ProductQueryParams>({
    page: 1,
    perPage: 10,
    search: "",
    sort_by: null,
    sort_direction: null,
    withTrashed: false,
    filter: {},
  });

  // 2. Dynamic API calls
  const { data: productData, isLoading, isError, refetch } = useGetProductsQuery(queryParams);
  // Fetch categories to populate the filter dropdown
  const { data: categoriesData } = useGetCategoriesQuery({ page: 1, perPage: 1000 });

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

  const handleBulkDelete = async (ids: (string | number)[]) => {
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
      productData?.data?.map((prod: Product) => ({
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
    {
    key: "category_id",
    header: "Catégorie",
    sortable: true,
    render: (row) => row.category,
  },
  {
    key: "product_type_id",
    header: "Type Produit",
    sortable: true,
    render: (row) => row.type,
  },
    {
      key: "status",
      header: "Statut",
      sortable: true,
      render: (row) => (
        <span className={`px-2 py-1 text-xs rounded-full ${row.status === "1" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {row.status === "1" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button className="text-gray-600 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); handleView(row); }}>
            <FaEye />
          </button>
          <button className="text-gray-600 hover:text-green-600" onClick={(e) => { e.stopPropagation(); handleEdit(row); }}>
            <FaEdit />
          </button>
          <button className="text-gray-600 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteClick(row); }}>
            <FaTrash />
          </button>
        </div>
      ),
    },
  ], [handleEdit, handleView, handleDeleteClick]);

  // 4. Improved column filters
  const columnFilters: ColumnFilter[] = useMemo(() => {
  // Create the list of category options from your API data
  const categoryOptions = categoriesData?.data?.map(cat => ({
    value: cat.category_id,
    label: cat.name,
  })) ?? [];

  return [
    {
      id: "status",
      label: "Statut",
      options: [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
      ],
    },
    {
      id: "category_id",
      label: "Catégorie",
      options: [
        { value: "all", label: "Toutes les catégories" }, // ✅ Change "" to "all"
        ...categoryOptions
      ],
    },
  ];
}, [categoriesData]);

  // 5. Callback handlers for the DataTable
  const handlePaginationChange = (pagination: { pageIndex: number; pageSize: number }) => {
    setQueryParams(prev => ({ ...prev, page: pagination.pageIndex + 1, perPage: pagination.pageSize }));
  };

  const handleSearchChange = (value: string) => {
    setQueryParams(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleSortChange = (key: string | null, direction: 'asc' | 'desc' | null) => {
    setQueryParams(prev => ({ ...prev, sort_by: key, sort_direction: direction }));
  };

 const handleFilterChange = (filters: Record<string, string | string[]>) => {
  const { status, ...otherFilters } = filters;
  const withTrashed = status === "0";

 
  const backendFilters: Record<string, any> = {};

  
  for (const key in otherFilters) {
    const value = otherFilters[key];
    if (value && value !== 'all') { 
      backendFilters[key] = value;
    }
  }

  setQueryParams(prev => ({
    ...prev,
    page: 1,
    withTrashed,
    filter: backendFilters, 
  }));
};

  if (isError) return <p>Erreur lors du chargement des produits.</p>;

  return (
    <div className="p-8 min-h-screen">
      <div className="flex justify-between items-center mb-8">
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

      {/* 6. Fully configured DataTable */}
      <DataTable<TransformedProductRow>
        columns={columns}
        data={transformedData}
        columnFilters={columnFilters}
        striped
        hoverEffect
        emptyText="Aucun produit trouvé."
        onRowClick={handleView}
        onBulkDelete={handleBulkDelete}

        // --- Server-side Props ---
        serverPagination={true}
        isLoading={isLoading}
        
        // Controlled State Props
        pageIndex={productData?.pagination?.current_page ? productData.pagination.current_page - 1 : 0}
        pageCount={productData?.pagination?.total_pages || 0}
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
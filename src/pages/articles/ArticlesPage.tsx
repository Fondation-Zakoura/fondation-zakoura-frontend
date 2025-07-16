//src\pages\articles\ArticlesPage.tsx
import { useState, useMemo, useCallback } from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeaderLayout } from "@/layouts/MainLayout";
import { DataTable } from "@/components/ui/data-table";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import AddArticleModal from "./AddArticleModal";
 import EditArticleModal from "./EditArticleModal";
import ViewArticleModal from "./ViewArticleModal";

import {
  useGetArticlesQuery,
  useDeleteArticleMutation,
  useDeleteArticlesMutation,
} from "@/features/api/articles";

export default function ArticlesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: articleData, isLoading, isError, refetch } = useGetArticlesQuery({
    page: currentPage,
    perPage: rowsPerPage,
  });

  // Debug: Log the API response
  console.log('Articles API response:', articleData);
  console.log('Current page:', currentPage, 'Rows per page:', rowsPerPage);

  const [deleteArticle] = useDeleteArticleMutation();
  const [deleteArticles] = useDeleteArticlesMutation();

  const handleAddOpen = () => setIsAddModalOpen(true);

  const handleEdit = (row: any) => {
  
    setSelectedArticleId(row.id);
      console.log('selected id:',selectedArticleId)
    setIsEditModalOpen(true);
  };

  const handleView = (row: any) => {
    setSelectedArticleId(row.id);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = useCallback((row: any) => {
    setDeleteId(row.id);
  }, []);

  const handleCloseModal = () => {
    setDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteArticle(String(deleteId)).unwrap();
      refetch();
      setDeleteId(null);
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (ids.length === 0) return;
    try {
      await deleteArticles({ ids }).unwrap();
      refetch();
    } catch (err) {
      console.error("Erreur suppression multiple:", err);
    }
  };

  const handlePaginationChange = ({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
    setCurrentPage(pageIndex + 1); // Convert 0-based to 1-based
    setRowsPerPage(pageSize);
  };

  const transformedData = useMemo(
    () =>
      articleData?.data?.map((art: any) => ({
        id: art.article_id,
        article_id: art.article_id,
        product_name: art.product_name,
        name: art.name,
        specifications: art.specifications || "-",
        brand: art.brand || "-",
        reference_price: art.reference_price ?? "-",
        status: art.status,
      })) ?? [],
    [articleData]
  );

  const columns = [
    { key: "article_id", header: "ID Article", sortable: true },
    { key: "product_name", header: "Produit", sortable: true },
    { key: "name", header: "Nom", sortable: true },
    { key: "specifications", header: "Spécifications" },
    { key: "brand", header: "Marque" },
    { key: "reference_price", header: "Prix de référence" },
    {
      key: "status",
      header: "Statut",
      render: (row: any) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            row.status === 1
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.status === 1 ? "Actif" : "Inactif"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: any) => (
        <div className="flex gap-2">
          <button className="text-gray-600 hover:text-blue-600" onClick={(e) =>{
             e.stopPropagation();
            handleView(row)}}>
            <FaEye />
          </button>
          <button className="text-gray-600 hover:text-green-600" onClick={(e) =>{
             e.stopPropagation();
           
            handleEdit(row)}}>
            <FaEdit />
          </button>
          <button className="text-gray-600 hover:text-red-600" onClick={(e) =>{
             e.stopPropagation();
            handleDeleteClick(row)}}>
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const columnFilters = [
    {
      id: "status",
      label: "Statut",
      options: [
        { value: "1", label: "Actif" },
        { value: "0", label: "Inactif" },
      ],
    },
    {
      id: "product_name",
      label: "Produit",
      options: Array.from(new Set(transformedData.map((a) => a.product_name))).map((prod) => ({
        value: prod,
        label: prod,
      })),
    },
    {
      id: "brand",
      label: "Marque",
      options: Array.from(new Set(transformedData.map((a) => a.brand))).map((b) => ({
        value: b,
        label: b,
      })),
    },
    {
      id: "name",
      label: "Nom de l'article",
      options: Array.from(new Set(transformedData.map((a) => a.name))).map((n) => ({
        value: n,
        label: n,
      })),
    },
  ];

  if (isLoading) return <div className="text-center py-8 text-lg text-gray-500">Chargement des articles...</div>;
  if (isError) return <p>Erreur lors du chargement des articles.</p>;

  return (
    <div className="space-y-4 mx-4">
      <div className="flex justify-between items-center">
        <PageHeaderLayout
          title="Liste des articles"
          breadcrumbs={[{ label: "Achat", url: "#" }, { label: "Produits", url: "#" }, { label: "Articles", active: true }]}
        />
        <Button
          onClick={handleAddOpen}
          className="bg-[#18365A] hover:bg-blue-900 cursor-pointer text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Ajouter un Article
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={transformedData}
        columnFilters={columnFilters}
        globalFilterKey="name"
        emptyText="Aucun article trouvé."
        initialPageSize={10}
        striped
        hoverEffect
        onBulkDelete={handleBulkDelete}
        onRowClick={handleView}
        serverPagination={true}
        pageCount={Math.ceil((articleData?.pagination?.total || 0) / rowsPerPage)}
        pageIndex={currentPage - 1}
        onPaginationChange={handlePaginationChange}
      />

      {isAddModalOpen && (
       <AddArticleModal
    isOpen={isAddModalOpen}
    onClose={() => setIsAddModalOpen(false)}
    title="Ajouter un article"
  />
      )}
      {isEditModalOpen && selectedArticleId && (
        <EditArticleModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          articleId={selectedArticleId}
        />
      )}
      {isViewModalOpen && selectedArticleId && (
        <ViewArticleModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          articleId={selectedArticleId}
        />
      )}

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Supprimer l'article"
        description="Cette action supprimera l'article de façon permanente. Êtes-vous sûr ?"
      />
    </div>
  );
}

import { useState, useMemo, useCallback } from 'react';
import AddCategory from './AddCategory';
import EditCategoryModal from './EditCategoryModal';
import { Button } from '@/components/ui/button';
import {  ChevronDown, Settings, Plus, Trash, Pen } from 'lucide-react';
import ViewCategoryModal from './ShowCategory';
import { useGetProductsQuery } from '@/features/api/products';
import InfoDialog from "@/components/ui/InfoDialog";

import {
  useGetCategoriesQuery,
  useDeleteCategoriesMutation,
  useDeleteCategoryMutation,
} from '../../features/api/categories';
import { DataTable } from '@/components/ui/data-table';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { PageHeaderLayout } from '@/layouts/MainLayout';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';

const CategoriesPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
const [infoDialogContent, setInfoDialogContent] = useState({
  title: "",
  description: "",
});


  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: categoryData, isLoading, isError, refetch } = useGetCategoriesQuery({
    page: currentPage,
    perPage: rowsPerPage,
  });
  const { data: productsData, } = useGetProductsQuery();
 

  const [deleteCategories] = useDeleteCategoriesMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
   const [deleteId, setDeleteId] = useState(null);
     const handleDeleteClick = useCallback((row) => {
  setDeleteId(row.id);
}, []);
const handleConfirmDelete = async () => {
  if (!deleteId) return;

  const relatedProducts = productsData?.data?.filter(
    (prod) => String(prod.category_id) === String(deleteId)
  );

  if (relatedProducts && relatedProducts.length > 0) {
    setInfoDialogContent({
      title: "Suppression impossible",
      description:
        "Impossible de supprimer cette catégorie car des produits y sont associés.",
    });
     setDeleteId(null);
    setInfoDialogOpen(true);
  } else {
    try {
      await deleteCategory(deleteId).unwrap();
      refetch();
      setDeleteId(null);
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  }
};

const handleCloseModal = () => {
  setDeleteId(null);
};

  const transformedData = useMemo(() => {
    return categoryData?.data?.map((cat) => ({
      id: cat.category_id,
      code: cat.category_id,
      name: cat.name,
      status: cat.status,
      description: cat.description || '',
    })) || [];
  }, [categoryData]);

  const columns = useMemo(() => [
    {
      key: 'code',
      header: 'Code',
      sortable: true,
    },
    {
      key: 'name',
      header: 'Nom',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Statut',
      render: (row) => (
        <span
          className={`px-2 py-1 text-sm rounded-full ${
            row.status === 1
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {row.status === 1 ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-3">
          <button
            className="text-gray-600 hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click
              handleView(row);
            }}
          >
            <FaEye />
          </button>
          <button
            className="text-gray-600 hover:text-green-600"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click
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
  ]);

  const handleIsOpen = () => setIsOpen(!isOpen);

  const handleEdit = (row) => {
    setSelectedCode(row.id);
    setEditModalOpen(true);
  };

  const handleView = (row) => {
    setSelectedCategoryId(row.id);
    setViewModalOpen(true);
  };

  const handleBulkDelete = async (idsToDelete) => {
    try {
      await deleteCategories({ ids: idsToDelete }).unwrap();
      refetch();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePerPageChange = (perPage: number) => {
    setRowsPerPage(perPage);
    setCurrentPage(1);
  };

  if (isError) return <p>Erreur lors du chargement des catégories.</p>;

  return (
    <div className="p-6 bg-white rounded-2xl  mx-4  ">
     
      <div className="mb-4 flex justify-between">
         <PageHeaderLayout  title="Liste des categories"
            
            breadcrumbs={[
              { label: 'Categories', active: true }
            ]} />
        <Button
            onClick={() => setIsOpen(true)}
             className="bg-[#18365A] hover:bg-blue-900 cursor-pointer text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" onClick={()=>setIsOpen(true)} /> Ajouter une categorie
          </Button>
      </div>

      <DataTable
        columns={columns}
        data={transformedData}
        emptyText="Aucune catégorie trouvée."
        onRowClick={handleView}
        globalFilterKey="name"
        onBulkDelete={handleBulkDelete}
        pagination={{
          server: true,
          totalRows: categoryData?.pagination?.total ?? 0,
          currentPage,
          rowsPerPage,
          onPageChange: handlePageChange,
          onRowsPerPageChange: handlePerPageChange,
        }}
      />

      {isOpen && (
        <AddCategory
          isOpen={isOpen}
          onClose={handleIsOpen}
          title="Ajouter une catégorie"
        />
      )}
      {editModalOpen && selectedCode && (
        <EditCategoryModal
          key={selectedCode}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          categoryCode={selectedCode}
        />
      )}
      {viewModalOpen && (
        <ViewCategoryModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          categoryId={selectedCategoryId}
        />
      )}
       <DeleteConfirmationModal
  isOpen={!!deleteId}
  onClose={handleCloseModal}
  onConfirm={handleConfirmDelete}
  title="Supprimer le produit"
  description="Cette action supprimera La categorie de façon permanente. Êtes-vous sûr ?"
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

export default CategoriesPage;

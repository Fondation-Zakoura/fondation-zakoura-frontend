import DataTable from 'react-data-table-component';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useState, useMemo } from 'react';
import AddCategory from './AddCategory';
import EditCategoryModal from './EditCategoryModal';
import { useGetCategoriesQuery, useDeleteCategoriesMutation } from '../../features/api/categories';

const CategoriesPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [toggleCleared, setToggleCleared] = useState(false); // State to trigger clearing rows
  const [filterText, setFilterText] = useState('');

  const { data: categories, isLoading, isError, refetch } = useGetCategoriesQuery();
  const [deleteCategories] = useDeleteCategoriesMutation();

  const handleIsOpen = () => setIsOpen(!isOpen);

  const handleEdit = (row: any) => {
    setSelectedCode(row.code);
    setEditModalOpen(true);
  };

  const handleRowSelected = (state: any) => {
    setSelectedRows(state.selectedRows);
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return;

    try {
      const idsToDelete = selectedRows.map((r) => r.id);
      await deleteCategories({ ids: idsToDelete }).unwrap();
      
      // After successful deletion, toggle the state to clear the rows
      setToggleCleared(!toggleCleared); 
      refetch();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

 const transformedData = useMemo(() => {
  return categories?.data?.map((cat: any, index: number) => ({
   
    id: cat.category_id, 
    
    code: cat.category_id || `CAT-${String(index + 1).padStart(3, '0')}`,
    name: cat.name,
    status: 'Active',
    description: cat.description || '',
  })) || [];
}, [categories]);

  const filteredData = transformedData.filter((cat) =>
    cat.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = useMemo(() => [
    { name: 'Code', selector: (row: { code: any; }) => row.code, sortable: true },
    { name: 'Nom', selector: (row: { name: any; }) => row.name, sortable: true },
    {
      name: 'Statut',
      cell: (row: { status: string; }) => (
        <span className={`px-2 py-1 text-sm rounded-full ${row.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {row.status}
        </span>
      ),
    },
    { name: 'Description', selector: (row: { description: any; }) => row.description },
    {
      name: 'Actions',
      cell: (row: any) => (
        <div className="flex gap-2">
          <button className="text-blue-600 hover:underline" onClick={() => handleEdit(row)}><FaEdit /></button>
          <button className="text-red-600 hover:underline"><FaTrash /></button>
          <button className="text-gray-600 hover:underline"><FaEye /></button>
        </div>
      ),
    },
  ], [handleEdit]);

  if (isLoading) return <p>Chargement des catégories...</p>;
  if (isError) return <p>Erreur lors du chargement des catégories.</p>;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-1/3"
        />
        <button onClick={handleIsOpen} className="bg-[#18365A] hover:bg-cyan-900 text-white px-4 py-2 rounded-xl shadow">
          Ajouter une Catégorie
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        highlightOnHover
        selectableRows
        onSelectedRowsChange={handleRowSelected}
        clearSelectedRows={toggleCleared} // This is the crucial part
        noDataComponent="Aucune catégorie trouvée."
        className="rounded-xl overflow-hidden"
      />

      {/* Your original button is restored and will now work correctly */}
      <div className="mt-4 text-right">
        <button
          onClick={handleDeleteSelected}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
          disabled={selectedRows.length === 0}
        >
          Supprimer la sélection
        </button>
      </div>

      {isOpen && <AddCategory isOpen={isOpen} onClose={handleIsOpen} title="Ajouter une catégorie" />}
      {editModalOpen && selectedCode && <EditCategoryModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} categoryCode={selectedCode} />}
    </div>
  );
};

export default CategoriesPage;
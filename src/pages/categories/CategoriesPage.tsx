import DataTable from 'react-data-table-component';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useState } from 'react';
import AddCategory from './AddCategory';

const data = [
  {
    id: 1,
    code: 'CAT-001',
    name: 'category 1',
    status: 'Active',
    description: 'description example',
  },
  {
    id: 2,
    code: 'CAT-002',
    name: 'category 2',
    status: 'Inactive',
    description: 'description example 2',
  },
];

const columns = [
  {
    name: '',
    cell: row => <input type="checkbox" />,
    width: '50px',
  },
  {
    name: 'Code',
    selector: row => row.code,
    sortable: true,
  },
  {
    name: 'Nom',
    selector: row => row.name,
    sortable: true,
  },
  {
    name: 'Statut',
    cell: row => (
      <span
        className={`px-2 py-1 text-sm rounded-full ${
          row.status === 'Active'
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}
      >
        {row.status}
      </span>
    ),
  },
  {
    name: 'Description',
    selector: row => row.description,
  },
  {
    name: 'Actions',
    cell: row => (
      <div className="flex gap-2">
        <button className="text-blue-600 hover:underline">
          <FaEdit />
        </button>
        <button className="text-red-600 hover:underline">
          <FaTrash />
        </button>
      </div>
    ),
  },
];

const CategoriesPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleIsOpen = () => setIsOpen(!isOpen);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      {/* Filter + Add Button */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom..."
          className="border border-gray-300 rounded-lg px-4 py-2 w-1/3"
        />
        <button
          onClick={handleIsOpen}
          className="bg-[#18365A] hover:bg-cyan-900 text-white px-4 py-2 rounded-xl shadow"
        >
          Ajouter une Catégorie
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data}
        pagination
        highlightOnHover
        className="rounded-xl overflow-hidden"
      />

      {/* Batch delete (custom button) */}
      <div className="mt-4 text-right">
        <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
          Supprimer la sélection
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <AddCategory isOpen={isOpen} onClose={handleIsOpen} title="Ajouter une catégorie" />
      )}
    </div>
  );
};

export default CategoriesPage;

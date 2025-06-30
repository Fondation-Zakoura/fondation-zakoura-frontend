import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useAddCategoryMutation } from '../../features/api/categories';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

const AddCategory = ({ isOpen, onClose, title }: ModalProps) => {
  if (!isOpen) return null;

  // Local state for the category name and description
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Get the mutation hook
  const [addCategory, { isLoading, isError, error }] = useAddCategoryMutation();

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCategory({ name, description }).unwrap();
      setName('');
      setDescription('');
      onClose(); // Close modal on success
    } catch (err) {
      console.error('Failed to add category:', err);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[1000] flex justify-center">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-[1001] bg-white py-4 shadow-md w-[90%] h-auto my-7 max-w-lg font-nunito rounded-2xl">
        <div className="my-3 border-b border-neutral-300 px-4">
          <h1 className="text-2xl font-semibold py-2">{title}</h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col m-2 py-3 px-4 gap-6">
          <div className="flex gap-2.5 flex-col">
            <label htmlFor="category-name">Nom de la catégorie</label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded border-gray-300"
              required
            />
          </div>
          <div className="flex gap-2.5 flex-col">
            <label htmlFor="category-description">Description</label>
            <textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 rounded border-gray-300"
              rows={3}
              required
            />
          </div>

          {isError && (
            <p className="text-red-500">Une erreur est survenue.</p>
          )}

          <div className="flex justify-center gap-9 text-lg">
            <button
              type="submit"
              disabled={isLoading}
              className="border p-3 rounded-2xl bg-cyan-900 hover:bg-cyan-800 cursor-pointer text-white"
            >
              {isLoading ? 'En cours...' : 'Sauvegarder'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-red-500 cursor-pointer hover:border hover:rounded"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddCategory;

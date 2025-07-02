import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useUpdateCategoryMutation } from '../../features/api/categories';

type EditCategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categoryCode: string; // e.g., "CAT-001"
};

const EditCategoryModal = ({ isOpen, onClose, categoryCode }: EditCategoryModalProps) => {
  const [name, setName] = useState('');

  const [updateCategory, { isLoading, isError }] = useUpdateCategoryMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCategory({ id: categoryCode, name }).unwrap();
      setName('');
      onClose();
    } catch (err) {
      console.error('Failed to update category:', err);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[1000] flex justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative z-[1001] bg-white py-4 shadow-md w-[90%] h-auto my-7  max-w-lg font-nunito rounded-2xl">
       <div className="my-3 border-b border-neutral-300 px-4">
         <h2 className="text-xl font-bold mb-4">Modifier la catégorie ({categoryCode})</h2>
       </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-7">
          <div>
            <label htmlFor="name">Nouveau nom</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          {isError && <p className="text-red-500">Erreur lors de la mise à jour.</p>}
          <div className="flex justify-center gap-4 my-5">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-950 text-white px-4 py-3 rounded-lg"
            >
              {isLoading ? 'Mise à jour...' : 'Sauvegarder'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-red-500 hover:underline"
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

export default EditCategoryModal;

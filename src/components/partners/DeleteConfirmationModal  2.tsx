// src/components/DeleteConfirmationModal.tsx
import React from 'react';
import { X, Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemCount: number;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, itemCount }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all flex flex-col">
                <div className="flex justify-between items-center p-5 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Confirmation</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-gray-700">
                        {itemCount > 1
                            ? `Voulez-vous vraiment désactiver ces ${itemCount} partenaires ?`
                            : 'Voulez-vous vraiment désactiver ce partenaire ?'}
                    </p>
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">
                        Annuler
                    </button>
                    <button onClick={onConfirm} className="flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
                        <Trash2 size={16} className="mr-2" /> Confirmer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;

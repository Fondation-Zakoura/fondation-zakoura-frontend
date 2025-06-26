
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAddCategoryMutation } from "../../features/api/categoriesApi";

// Props definition for the modal component
interface ModalProps {
  isOpen: boolean; // Controls whether the modal is open
  onClose: () => void; // Function to close the modal
  title: string; // Title to display in the modal
}

// AddCategory component allows users to add a new category via a modal dialog
const AddCategory: React.FC<ModalProps> = ({ isOpen, onClose, title }) => {
  // State for category name input
  const [name, setName] = useState("");
  // State for category description input
  const [description, setDescription] = useState("");

  // RTK Query mutation hook for adding a category
  // Provides the mutation function and status flags
  const [addCategory, { isLoading, isError, error }] = useAddCategoryMutation();

  // Handles form submission to add a new category
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    try {
    
      await addCategory({ name, description }).unwrap();
      // Reset form fields on success
      setName("");
      setDescription("");
      // Close the modal
      onClose();
    } catch (err) {
    
      console.error("Failed to add category:", err);
    }
  };

  return (
    // Dialog component controls modal visibility
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          {/* Modal title */}
          <DialogTitle>{title}</DialogTitle>
          {/* Modal description */}
          <DialogDescription>
            Remplissez les informations pour ajouter une nouvelle catégorie.
          </DialogDescription>
        </DialogHeader>

        {/* Form for category creation */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category name input field */}
          <div className="space-y-2">
            <label htmlFor="category-name" className="block text-sm font-medium">
              Nom de la catégorie    <span className="text-red-500 text-right">*</span>
            </label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de la catégorie"
              required
              disabled={isLoading} // Disable input while loading
            />
          </div>

          {/* Category description input field */}
          <div className="space-y-2">
            <label htmlFor="category-description" className="block text-sm font-medium">
              Description
            </label>
            <Textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la catégorie"
              rows={3}
              disabled={isLoading} // Disable textarea while loading
            />
          </div>

          {/* Error message display if mutation fails */}
         {isError && (
  <p className="text-sm text-red-500">
    {('data' in error && error.data) ? (error.data as { message?: string }).message : 'An error occurred'}
  </p>
)}

          {/* Modal footer with action buttons */}
          <DialogFooter className="mt-4">
            {/* Submit button, shows loading state if submitting */}
            <Button type="submit" disabled={isLoading} className="bg-[#18365A] hover:bg-cyan-900">
              {isLoading ? "En cours..." : "Sauvegarder"}
            </Button>
            {/* Cancel button to close the modal */}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategory;

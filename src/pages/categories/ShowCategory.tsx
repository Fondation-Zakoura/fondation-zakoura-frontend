import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useShowCategoryQuery } from "../../features/api/categories";

const ViewCategoryModal = ({ categoryId, isOpen, onClose }) => {
  const { data, error, isLoading } = useShowCategoryQuery(categoryId, {
    skip: !categoryId,
  });

  if (!isOpen) return null;

  // Your original logic to handle nested or direct data
  const categoryDetails = data ? (data.data || data) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Détails de la catégorie</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        )}
        {error && (
          <p className="text-sm text-red-500">Erreur lors du chargement.</p>
        )}

        {!isLoading && !error && categoryDetails && (
          <div className="space-y-4 mt-4 text-sm">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Nom</span>
                <span className="text-gray-900">{categoryDetails.name || "—"}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium text-gray-700">ID</span>
                <span className="text-gray-900">{categoryDetails.category_id ?? "—"}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium text-gray-700">Description</span>
                <span className="text-gray-900">{categoryDetails.description || "—"}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium text-gray-700">Statut</span>
                <span
                  className={`font-semibold ${
                    categoryDetails.status === 1 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {categoryDetails.status === 1 ? "Actif" : "Inactif"}
                </span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium text-gray-700">Créé le</span>
                <span className="text-gray-900">
                  {categoryDetails.created_at
                    ? new Date(categoryDetails.created_at).toLocaleString()
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewCategoryModal;

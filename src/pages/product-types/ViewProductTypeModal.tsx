import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGetProductTypeByIdQuery } from "../../features/api/product_types";

type ViewProductTypeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productTypeId: number;
};

export default function ViewProductTypeModal({ isOpen, onClose, productTypeId }: ViewProductTypeModalProps) {
  const {
    data: productData,
    isLoading,
    isError,
  } = useGetProductTypeByIdQuery(productTypeId, { skip: !productTypeId });

  if (!productTypeId) return null;
  const details = Array.isArray(productData?.data) ? productData.data[0] : productData?.data;
 const statusColor =
    details?.deleted_at === null
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Détails du type de produit</DialogTitle>
        </DialogHeader>

        {isLoading && <p className="text-sm text-muted-foreground">Chargement...</p>}
        {isError && <p className="text-sm text-red-500">Erreur lors du chargement.</p>}

        {!isLoading && !isError && details && (
          <div className="space-y-4 mt-4 text-sm">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Nom</span>
                <span className="text-gray-900">{details.name || "—"}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium text-gray-700">ID</span>
                <span className="text-gray-900">{details.id ?? "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Statut</span>
                <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
                  {details.deleted_at === null ? "Actif" : "Inactif"}
                </span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium text-gray-700">Créé le</span>
                <span className="text-gray-900">{details.created_at || "—"}</span>
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
}

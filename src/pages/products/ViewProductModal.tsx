import { useShowProductQuery } from "@/features/api/products";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ViewProductModalProps={
  isOpen:boolean,
  onClose:()=>void,
  productId:number,
}

const ViewProductModal = ({ productId, isOpen, onClose }:ViewProductModalProps) => {
  const { data, error, isLoading } = useShowProductQuery(productId, {
    skip: !productId,
  });

  const productDetails = data ? (data.data || data) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Détails du produit</DialogTitle>
          <DialogDescription>
            Aperçu des informations du produit.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Chargement des détails...
          </p>
        )}

        {error && (
          <p className="text-sm text-red-500 py-8 text-center">
            Impossible de charger les détails du produit.
          </p>
        )}

        {productDetails && (
          <div className="space-y-3">
            <div className="rounded-md border p-3">
              <p className="text-xs font-medium text-gray-500">Nom</p>
              <p className="text-sm text-gray-900">
                {productDetails.name || "—"}
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs font-medium text-gray-500">Catégorie</p>
              <p className="text-sm text-gray-900">
                {productDetails.category_name || "—"}
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs font-medium text-gray-500">Type</p>
              <p className="text-sm text-gray-900">
                {productDetails.product_type_name || "—"}
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs font-medium text-gray-500">Description</p>
              <p className="text-sm text-gray-900">
                {productDetails.description || "—"}
              </p>
            </div>
            <div className="rounded-md border p-3 flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500">Statut</p>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  productDetails.status === 1
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {productDetails.status === 1 ? "Actif" : "Inactif"}
              </span>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs font-medium text-gray-500">Créé le</p>
              <p className="text-sm text-gray-900">
                {new Date(productDetails.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewProductModal;
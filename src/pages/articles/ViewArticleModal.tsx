import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useShowArticleQuery } from "@/features/api/articles";
import type { Article } from "@/types/articles";// ⬅️ Make sure this is correctly imported

type ViewArticleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  articleId: number;
};

const ViewArticleModal = ({ isOpen, onClose, articleId }: ViewArticleModalProps) => {
  const {
    data: articleData,
    isLoading,
    error,
  } = useShowArticleQuery(articleId);

  const details = (articleData?.data ?? articleData) as Article | null;

  const statusLabel = details?.deleted_at === null ? "Actif" : "Inactif";
  const statusColor =
    details?.deleted_at === null
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Détails de l'article</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        )}
        {error && (
          <p className="text-sm text-red-500">
            Erreur lors du chargement des données.
          </p>
        )}

        {!isLoading && !error && details && (
          <div className="space-y-4 mt-4 text-sm">
            <div className="border rounded-lg p-4 bg-gray-50 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Nom</span>
                <span className="text-gray-900">{details.name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Produit</span>
                <span className="text-gray-900">{details.product_name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Spécifications</span>
                <span className="text-gray-900">{details.specifications ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Marque</span>
                <span className="text-gray-900">{details.brand ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Prix de référence</span>
                <span className="text-gray-900">
                  {details.reference_price ?? "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Statut</span>
                <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
                  {statusLabel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Créé le</span>
                <span className="text-gray-900">
                  {details.created_at
                    ? new Date(details.created_at).toLocaleString()
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

export default ViewArticleModal;
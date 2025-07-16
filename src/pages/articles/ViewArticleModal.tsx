import { DialogTitle,DialogContent,DialogFooter,DialogHeader,Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button';
import { useShowArticleQuery } from '@/features/api/articles';
type viewArticleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  articleId: number;
};
const ViewArticleModal = ({isOpen,articleId,onClose}:viewArticleModalProps) => {
  const {data:articleData,isLoading,error}=useShowArticleQuery(articleId);

    const details=articleData?(articleData.data || articleData):null;
    
  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Détails de l'article</DialogTitle>
        </DialogHeader>
       {isLoading && (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        )}
        {error && (
          <p className="text-sm text-red-500">Erreur lors du chargement.</p>
        )}
          
           {articleData&&( <div className="space-y-4 mt-4 text-sm">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Nom</span>
                <span className="text-gray-900">{details.name || "—"}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium text-gray-700">produit</span>
                <span className="text-gray-900">{details.product_name ?? "—"}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium text-gray-700">Description</span>
                <span className="text-gray-900">{details.description || "—"}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium text-gray-700">Marque</span>
                <span className="text-gray-900">{details.brand || "—"}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium text-gray-700">Prix de référence</span>
                <span className="text-gray-900">{details.reference_price || "—"}</span>
              </div>
               <div className="flex items-center justify-between mt-2">
              <p className="font-medium text-gray-700">Statut</p>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  details.status === 1
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {details.status === 1 ? "Actif" : "Inactif"}
              </span>
            </div>
            
              <div className="flex justify-between mt-2">
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

      </DialogContent>
      <DialogFooter>
        <Button variant={'outline'} onClick={onClose} >Fermer</Button>
      </DialogFooter>
    </Dialog>
  )
}

export default ViewArticleModal
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Pack } from "@/types/packs";
type ViewPackArticlesModalProps={
  pack: Pack | null;
  onClose: () => void;
}
export default function ViewPackArticlesModal({ pack, onClose }: ViewPackArticlesModalProps) {
  const articles = pack?.articles ?? [];

  return (
    <Dialog open={!!pack} onOpenChange={onClose}>
      <DialogContent className="min-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Articles de <span className="text-primary">{pack?.name}</span>
          </DialogTitle>
        </DialogHeader>

        {articles.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            Aucun article associé à ce pack.
          </p>
        ) : (
          <>
            <Separator className="my-2" />

            <ScrollArea className="max-h-[400px]">
              <table className="min-w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Nom</th>
                    <th className="px-3 py-2 text-left font-medium">Produit</th>
                    <th className="px-3 py-2 text-left font-medium">Prix Réf.</th>
                    <th className="px-3 py-2 text-left font-medium">Marque</th>
                    <th className="px-3 py-2 text-left font-medium">Spécifications</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((a) => (
                    <tr key={a.article_id} className="border-b hover:bg-muted/50">
                      <td className="px-3 py-2 font-medium">{a.name}</td>
                      <td className="px-3 py-2">{a.product_name}</td>
                      <td className="px-3 py-2">
                        <Badge variant="secondary">
                          {parseFloat(a.reference_price).toFixed(2)} MAD
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        {a.brand ? (
                          <Badge variant="outline">{a.brand}</Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2">{a.specifications || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

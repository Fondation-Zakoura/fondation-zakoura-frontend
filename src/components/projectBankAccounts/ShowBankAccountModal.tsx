import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ShowBankAccountModalProps {
  open: boolean;
  onClose: () => void;
  selected: any;
}

export const ShowBankAccountModal: React.FC<ShowBankAccountModalProps> = ({
  open,
  onClose,
  selected,
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Détail du compte bancaire</DialogTitle>
      </DialogHeader>
      {selected && (
        <div className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="block text-xs text-gray-500">RIB / IBAN</span>
            <span className="font-semibold text-gray-800 text-sm">{selected.rib_iban}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Agence</span>
            <span className="font-semibold text-gray-800 text-sm">{selected.agency}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Banque</span>
            <span className="font-semibold text-gray-800 text-sm">{selected.bank}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Intitulé du compte</span>
            <span className="font-semibold text-gray-800 text-sm">{selected.account_title}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Nom du titulaire</span>
            <span className="font-semibold text-gray-800 text-sm">{selected.account_holder_name}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">BIC / SWIFT</span>
            <span className="font-semibold text-gray-800 text-sm">{selected.bic_swift}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Date d'ouverture</span>
            <span className="font-semibold text-gray-800 text-sm">{selected.opening_date}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Pays d'ouverture</span>
            <span className="font-semibold text-gray-800 text-sm">{selected.opening_country}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Devise</span>
            <span className="font-semibold text-gray-800 text-sm">{selected.currency}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Status</span>
            <span className="font-semibold text-gray-800 text-sm">{selected.status}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="block text-xs text-gray-500">Pièce justificative (Scan)</span>
            {selected.supporting_document ? (
              (() => {
                const url = `http://localhost:8000/storage/${selected.supporting_document}`;
                const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(selected.supporting_document);
                const isPDF = /\.pdf$/i.test(selected.supporting_document);
                if (isImage) {
                  return (
                    <Card className="w-fit max-w-sm shadow-lg rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold">Pièce justificative</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <img src={url} alt="Pièce justificative" className="rounded-xl border shadow-sm object-cover max-h-96 w-full" />
                      </CardContent>
                    </Card>
                  );
                }
                if (isPDF) {
                  return (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mt-2 block">Voir le document PDF</a>
                  );
                }
                return (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mt-2 block">Télécharger le fichier</a>
                );
              })()
            ) : (
              <span className="font-semibold text-gray-800 text-sm break-all">Aucun document</span>
            )}
          </div>
          <div className="sm:col-span-2">
            <span className="block text-xs text-gray-500">Commentaires / Remarques</span>
            <span className="font-semibold text-gray-800 text-sm break-all">{selected.comments}</span>
          </div>
        </div>
      )}
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="outline">Fermer</Button></DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
); 
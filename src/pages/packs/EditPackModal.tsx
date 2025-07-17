import React, { useEffect, useState } from "react";
import { useGetArticlesQuery } from "@/features/api/articles";
import { useShowPackQuery, useUpdatePackMutation } from "@/features/api/packs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  packId: number;
};

const EditPackModal: React.FC<ModalProps> = ({ isOpen, onClose, packId }) => {
  const { data: articlesData } = useGetArticlesQuery({ page: 1, perPage: 100 });
  const { data: packData, isLoading: isFetching } = useShowPackQuery(packId);
  const [updatePack, { isLoading: isSaving, isError }] = useUpdatePackMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status,setStatus]=useState("1");

  const [articleEntries, setArticleEntries] = useState<
    { articleId: string; quantity: string;  }[]
  >([{ articleId: "", quantity: "1" ,  }]);

  // 🟢 When data loads, pre-fill the form
  useEffect(() => {
  if (packData) {
    console.log(packData)
    const d = packData.data || packData;
    setName(d.name || "");
    setDescription(d.description || "");
    setStatus(d.deleted_at === null ? "1" : "0");

    if (Array.isArray(d.articles) && d.articles.length > 0) {
      setArticleEntries(
        d.articles.map((a) => ({
          articleId: String(a.article_id),
          quantity: "1", 
        }))
      );
    } else {
      setArticleEntries([{ articleId: "", quantity: "1" }]);
    }
  }
}, [packData]);

  const handleAddArticleRow = () => {
    setArticleEntries([...articleEntries, { articleId: "", quantity: "1" }]);
  };

  const handleRemoveArticleRow = (index: number) => {
    setArticleEntries(articleEntries.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      id: packId,
      name,
      description,
      deleted_at: status === "1" ? false : true,
      article_ids: articleEntries.map((entry) => ({
        article_id: Number(entry.articleId),
        quantity: Number(entry.quantity),
      })),
    };

    console.log("Submitting update payload:", payload);

    try {
      await updatePack(payload).unwrap();
      onClose();
    } catch (err) {
      console.error("Failed to update pack:", err);
    }
  };

  const handleClose = () => {
    if (isSaving) return;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modifier le Pack</DialogTitle>
        </DialogHeader>

        {isFetching ? (
          <p className="text-center py-6">Chargement...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              {/* Nom */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pack-name" className="text-right">
                  Nom<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pack-name"
                  className="col-span-3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  className="col-span-3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Articles */}
              <div className="space-y-4">
                <Label className="font-medium">Articles</Label>
                {articleEntries.map((entry, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <Select
                      value={entry.articleId}
                      onValueChange={(value) => {
                        const updated = [...articleEntries];
                        updated[index].articleId = value;
                        setArticleEntries(updated);
                      }}
                    >
                      <SelectTrigger className="col-span-6">
                        <SelectValue placeholder="Sélectionner un article" />
                      </SelectTrigger>
                      <SelectContent>
                        {articlesData?.data?.map((article) => (
                          <SelectItem
                            key={article.article_id}
                            value={String(article.article_id)}
                          >
                            {article.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      min="1"
                      value={entry.quantity}
                      onChange={(e) => {
                        const updated = [...articleEntries];
                        updated[index].quantity = e.target.value;
                        setArticleEntries(updated);
                      }}
                      className="col-span-3"
                      placeholder="Qté"
                    />

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveArticleRow(index)}
                      disabled={articleEntries.length === 1}
                    >
                      Supprimer
                    </Button>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={handleAddArticleRow}>
                  + Ajouter un article
                </Button>
              </div>
            </div>
             <div className="space-y-2">
                            <Label>Statut</Label>
                            <Select
                              value={status}
                              onValueChange={(v) =>
                                setStatus(v)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue>
                                  {status === "1" ? "Actif" : "Inactif"}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Actif</SelectItem>
                                <SelectItem value="0">Inactif</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
            {isError && (
              <p className="text-sm text-red-500 mt-2 text-center">
                Une erreur est survenue. Veuillez réessayer.
              </p>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditPackModal;

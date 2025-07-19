import React, { useState } from "react";
import { useCreatePackMutation } from "@/features/api/packs";
import { useGetArticlesQuery } from "@/features/api/articles";
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
};

const AddPackModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { data: articlesData } = useGetArticlesQuery({ page: 1, perPage: 100 });
  const [createPack, { isLoading, isError }] = useCreatePackMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // 🟢 This array holds the dynamic article entries
  const [articleEntries, setArticleEntries] = useState<
    { articleId: string; quantity: string }[]
  >([{ articleId: "", quantity: "1" }]);

  const handleAddArticleRow = () => {
    setArticleEntries([...articleEntries, { articleId: "", quantity: "1" }]);
  };

  const handleRemoveArticleRow = (index: number) => {
    setArticleEntries(articleEntries.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      description,
      created_by: 1, // adjust as needed (current user ID)
      article_ids: articleEntries.map((entry) => ({
        article_id: Number(entry.articleId),
        quantity: Number(entry.quantity),
      })),
    };

    console.log("Submitting:", payload);

    try {
      await createPack(payload).unwrap();
      onClose();
      // Optionally reset form
      setName("");
      setDescription("");
      setArticleEntries([{ articleId: "", quantity: "1" }]);
    } catch (error) {
      console.error("Failed to create pack:", error);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajouter un Pack</DialogTitle>
        </DialogHeader>

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

            {/* Dynamic Articles */}
            <div className="space-y-4">
              <Label className="font-medium">Articles</Label>
              {articleEntries.map((entry, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  {/* Select Article */}
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

                  {/* Quantity */}
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

                  {/* Remove Button */}
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

              {/* Add Row Button */}
              <Button type="button" variant="outline" onClick={handleAddArticleRow}>
                + Ajouter un article
              </Button>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
          {isError && (
            <p className="text-sm text-red-500 mt-2 text-center">
              Une erreur est survenue. Veuillez réessayer.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPackModal;


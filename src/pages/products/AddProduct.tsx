import React, { useState } from 'react';
import { useAddProductMutation } from '@/features/api/products';
import { useGetCategoriesQuery } from '@/features/api/categories';
import { useGetProductTypesQuery } from '@/features/api/product_types';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

const AddProductModal = ({ isOpen, onClose, title }: ModalProps) => {
  const { data: categoriesData } = useGetCategoriesQuery({ page: 1, perPage: 100 });
  const { data: product_typeData } = useGetProductTypesQuery();
  const [addProduct, { isLoading, isError }] = useAddProductMutation();

  // Local state for the form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // --- FIX 1: Manage category ID as a string ---
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedProductType, setSelectedProductType] = useState('');

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(selectedCategoryId)
    try {
      await addProduct({
        name,
        description,
       
        category_id: Number(selectedCategoryId),
        product_type_id: Number(selectedProductType),
      }).unwrap();

      // Reset fields and close modal on success
      setName('');
      setDescription('');
      setSelectedCategoryId('');
      setSelectedProductType('');
      onClose();
    } catch (err) {
      console.error('Failed to add product:', err);
    }
  };

  const handleClose = () => {
    if (isLoading) return; 
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product-name" className="">
                nom de produit<span className="text-red-500">*</span>
              </Label>
              <Input
                id="product-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-center">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
           
                value={selectedCategoryId}
      
                onValueChange={setSelectedCategoryId}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesData?.data?.map((category: { category_id: number; name: string; status: number }) =>
                    category.status === 1 && (
                      // --- FIX 4: Ensure the value is a string ---
                      <SelectItem key={category.category_id} value={String(category.category_id)}>
                        {category.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product-type" className="text-center">
                Type <span className="text-red-500 text-right">*</span>
              </Label>
              <Select
                value={selectedProductType}
                onValueChange={setSelectedProductType}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a product type" />
                </SelectTrigger>
                <SelectContent>
                  {product_typeData?.data?.map((product_type: { id: number; name: string }) => (
                    <SelectItem key={product_type.id} value={String(product_type.id)}>
                      {product_type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-left">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Product'}
            </Button>
            {isError && (
              <p className="text-sm text-red-500 col-span-4 text-center">
                An error occurred. Please try again.
              </p>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
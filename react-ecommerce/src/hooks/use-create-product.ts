import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adjustStock, createProduct } from '../lib/api';
import type { Product } from '../types/product';
import type { ProductForm } from '../types/products-page';

const initialForm: ProductForm = {
  title: '',
  description: '',
  price: '',
  initialStock: '',
};

export function useCreateProduct(
  onError: (message: string) => void,
): {
  form: ProductForm;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setPrice: (value: string) => void;
  setInitialStock: (value: string) => void;
  submitCreateProduct: () => Promise<void>;
  isCreating: boolean;
} {
  const [form, setForm] = useState<ProductForm>(initialForm);
  const queryClient = useQueryClient();

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (createdProduct) => {
      queryClient.setQueryData<Product[]>(['products'], (current: Product[] | undefined) => [
        createdProduct,
        ...(current ?? []),
      ]);
      setForm(initialForm);
    },
    onError: (error) => {
      onError(error instanceof Error ? error.message : 'Unknown error');
    },
  });

  async function submitCreateProduct(): Promise<void> {
    onError('');
    const initialStock = Math.max(0, Math.trunc(Number(form.initialStock) || 0));

    const createdProduct = await createProductMutation.mutateAsync({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
    });

    if (initialStock <= 0) {
      return;
    }

    queryClient.setQueryData<Product[]>(['products'], (current) =>
      (current ?? []).map((product) =>
        product.id === createdProduct.id
          ? { ...product, lastKnownStock: initialStock }
          : product,
      ),
    );

    try {
      await adjustStock(createdProduct.id, initialStock);
    } catch (error) {
      queryClient.setQueryData<Product[]>(['products'], (current) =>
        (current ?? []).map((product) =>
          product.id === createdProduct.id
            ? { ...product, lastKnownStock: 0 }
            : product,
        ),
      );
      onError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  return {
    form,
    setTitle: (value) => setForm((c) => ({ ...c, title: value })),
    setDescription: (value) => setForm((c) => ({ ...c, description: value })),
    setPrice: (value) => setForm((c) => ({ ...c, price: value })),
    setInitialStock: (value) => setForm((c) => ({ ...c, initialStock: value })),
    submitCreateProduct,
    isCreating: createProductMutation.isPending,
  };
}

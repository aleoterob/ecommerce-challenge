import { useMemo, useState } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { adjustStock, createProduct, getProducts } from '../lib/api';
import type {
  AdjustStockPayload,
  AdjustStockResponse,
  Product,
} from '../types/product';
import type { ProductForm, UseProductsPageResult } from '../types/products-page';

const initialForm: ProductForm = {
  title: '',
  description: '',
  price: '',
  initialStock: '',
};

const EMPTY_PRODUCTS: Product[] = [];
type StockMutationContext = {
  previousProducts?: Product[];
};

export function useProductsPage(): UseProductsPageResult {
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState<ProductForm>(initialForm);
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (createdProduct) => {
      queryClient.setQueryData<Product[]>(['products'], (current) => [
        createdProduct,
        ...(current ?? []),
      ]);
      setForm(initialForm);
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    },
  });

  const updateStockMutation = useMutation<
    AdjustStockResponse,
    Error,
    AdjustStockPayload,
    StockMutationContext
  >({
    mutationFn: async (payload: AdjustStockPayload) =>
      adjustStock(payload.productId, payload.delta),
    onMutate: async ({ productId, delta }) => {
      setErrorMessage('');
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProducts = queryClient.getQueryData<Product[]>(['products']);
      queryClient.setQueryData<Product[]>(['products'], (current) =>
        (current ?? []).map((product) =>
          product.id === productId
            ? {
                ...product,
                lastKnownStock: Math.max(product.lastKnownStock + delta, 0),
              }
            : product,
        ),
      );
      return { previousProducts };
    },
    onError: (error, _variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    },
    onSuccess: () => {
      // Keep optimistic value to avoid UI jumps caused by eventual consistency
      // between inventory service and catalog read model.
    },
  });

  const products = productsQuery.data ?? EMPTY_PRODUCTS;
  const isInitialLoading = productsQuery.isLoading && products.length === 0;
  const totalStock = useMemo(
    () => products.reduce((acc, product) => acc + product.lastKnownStock, 0),
    [products],
  );

  async function submitCreateProduct(): Promise<void> {
    setErrorMessage('');
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
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async function updateStock(productId: string, delta: number): Promise<void> {
    await updateStockMutation.mutateAsync({ productId, delta });
  }

  function setTitle(value: string): void {
    setForm((current) => ({ ...current, title: value }));
  }

  function setDescription(value: string): void {
    setForm((current) => ({ ...current, description: value }));
  }

  function setPrice(value: string): void {
    setForm((current) => ({ ...current, price: value }));
  }

  function setInitialStock(value: string): void {
    setForm((current) => ({ ...current, initialStock: value }));
  }

  return {
    products,
    form,
    errorMessage,
    totalStock,
    isInitialLoading,
    isCreatingProduct: createProductMutation.isPending,
    isUpdatingStock: updateStockMutation.isPending,
    setTitle,
    setDescription,
    setPrice,
    setInitialStock,
    submitCreateProduct,
    updateStock,
  };
}

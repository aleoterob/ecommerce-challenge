import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  adjustStock,
  deleteProduct,
  updateProduct,
} from '../lib/api';
import type { Product } from '../types/product';

type DialogMutationsParams = {
  product: Product | null;
  form: { title: string; description: string; price: string };
  closeDialog: () => void;
  setErrorMessage: (value: string) => void;
  setProduct: React.Dispatch<React.SetStateAction<Product | null>>;
};

export function useProductDialogMutations(params: DialogMutationsParams): {
  submitUpdate: () => Promise<void>;
  removeProduct: () => Promise<void>;
  updateStock: (delta: number) => Promise<void>;
  isUpdating: boolean;
  isDeleting: boolean;
  isUpdatingStock: boolean;
} {
  const {
    product,
    form,
    closeDialog,
    setErrorMessage,
    setProduct,
  } = params;
  const queryClient = useQueryClient();

  const updateProductMutation = useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: { title: string; description?: string; price: number } }) =>
      updateProduct(productId, payload),
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData<Product[]>(['products'], (current) =>
        (current ?? []).map((p) =>
          p.id === updatedProduct.id ? { ...updatedProduct, lastKnownStock: p.lastKnownStock } : p,
        ),
      );
      closeDialog();
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProducts = queryClient.getQueryData<Product[]>(['products']);
      queryClient.setQueryData<Product[]>(['products'], (current) =>
        (current ?? []).filter((p) => p.id !== productId),
      );
      return { previousProducts };
    },
    onSuccess: () => {
      closeDialog();
    },
    onError: (error, _productId, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ productId, delta }: { productId: string; delta: number }) =>
      adjustStock(productId, delta),
    onMutate: async ({ productId, delta }) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProducts = queryClient.getQueryData<Product[]>(['products']);
      queryClient.setQueryData<Product[]>(['products'], (current) =>
        (current ?? []).map((p) =>
          p.id === productId
            ? { ...p, lastKnownStock: Math.max(p.lastKnownStock + delta, 0) }
            : p,
        ),
      );
      setProduct((prev) =>
        prev && prev.id === productId
          ? { ...prev, lastKnownStock: Math.max(prev.lastKnownStock + delta, 0) }
          : prev,
      );
      return { previousProducts };
    },
    onError: (_error, { productId, delta }, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
      setProduct((prev) =>
        prev && prev.id === productId
          ? { ...prev, lastKnownStock: Math.max(prev.lastKnownStock - delta, 0) }
          : prev,
      );
      setErrorMessage('Error al actualizar stock');
    },
  });

  async function submitUpdate(): Promise<void> {
    if (!product) return;
    setErrorMessage('');
    await updateProductMutation.mutateAsync({
      productId: product.id,
      payload: {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
      },
    });
  }

  async function removeProductHandler(): Promise<void> {
    if (!product) return;
    setErrorMessage('');
    await deleteProductMutation.mutateAsync(product.id);
  }

  async function updateStockHandler(delta: number): Promise<void> {
    if (!product) return;
    setErrorMessage('');
    await updateStockMutation.mutateAsync({ productId: product.id, delta });
  }

  return {
    submitUpdate,
    removeProduct: removeProductHandler,
    updateStock: updateStockHandler,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
    isUpdatingStock: updateStockMutation.isPending,
  };
}

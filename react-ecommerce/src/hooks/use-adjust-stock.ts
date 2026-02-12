import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adjustStock } from '../lib/api';
import type {
  AdjustStockPayload,
  AdjustStockResponse,
  Product,
} from '../types/product';

type StockMutationContext = {
  previousProducts?: Product[];
};

export function useAdjustStock(
  onError: (message: string) => void,
): {
  updateStock: (productId: string, delta: number) => Promise<void>;
  isUpdating: boolean;
} {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    AdjustStockResponse,
    Error,
    AdjustStockPayload,
    StockMutationContext
  >({
    mutationFn: async (payload: AdjustStockPayload) =>
      adjustStock(payload.productId, payload.delta),
    onMutate: async ({ productId, delta }) => {
      onError('');
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
      onError(error instanceof Error ? error.message : 'Unknown error');
    },
  });

  async function updateStock(productId: string, delta: number): Promise<void> {
    await mutation.mutateAsync({ productId, delta });
  }

  return {
    updateStock,
    isUpdating: mutation.isPending,
  };
}

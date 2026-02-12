import { useState } from 'react';
import { useAdjustStock } from './use-adjust-stock';
import { useCreateProduct } from './use-create-product';
import { useProductsQuery } from './use-products-query';
import type { UseProductsPageResult } from '../types/products-page';

export function useProductsPage(): UseProductsPageResult {
  const [errorMessage, setErrorMessage] = useState('');

  const { products, isInitialLoading, totalStock } = useProductsQuery();
  const { updateStock, isUpdating: isUpdatingStock } =
    useAdjustStock(setErrorMessage);
  const {
    form,
    setTitle,
    setDescription,
    setPrice,
    setInitialStock,
    submitCreateProduct,
    isCreating: isCreatingProduct,
  } = useCreateProduct(setErrorMessage);

  return {
    products,
    form,
    errorMessage,
    totalStock,
    isInitialLoading,
    isCreatingProduct,
    isUpdatingStock,
    setTitle,
    setDescription,
    setPrice,
    setInitialStock,
    submitCreateProduct,
    updateStock,
  };
}

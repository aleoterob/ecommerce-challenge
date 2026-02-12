import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../lib/api';
import type { Product } from '../types/product';

const EMPTY_PRODUCTS: Product[] = [];

export function useProductsQuery(): {
  products: Product[];
  isInitialLoading: boolean;
  totalStock: number;
} {
  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  const products = productsQuery.data ?? EMPTY_PRODUCTS;
  const isInitialLoading =
    productsQuery.isLoading && products.length === 0;
  const totalStock = useMemo(
    () => products.reduce((acc, p) => acc + p.lastKnownStock, 0),
    [products],
  );

  return { products, isInitialLoading, totalStock };
}

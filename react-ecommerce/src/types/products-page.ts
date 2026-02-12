import type { Product } from './product';

export type ProductForm = {
  title: string;
  description: string;
  price: string;
  initialStock: string;
};

export type UseProductsPageResult = {
  products: Product[];
  form: ProductForm;
  errorMessage: string;
  totalStock: number;
  isInitialLoading: boolean;
  isCreatingProduct: boolean;
  isUpdatingStock: boolean;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setPrice: (value: string) => void;
  setInitialStock: (value: string) => void;
  submitCreateProduct: () => Promise<void>;
  updateStock: (productId: string, delta: number) => Promise<void>;
};

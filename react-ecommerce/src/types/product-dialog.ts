import type { Product } from './product';

export type ProductDialogForm = {
  title: string;
  description: string;
  price: string;
};

export type UseProductDialogResult = {
  open: boolean;
  product: Product | null;
  form: ProductDialogForm;
  errorMessage: string;
  isUpdating: boolean;
  isDeleting: boolean;
  isUpdatingStock: boolean;
  openDialog: (product: Product) => void;
  closeDialog: () => void;
  setFormTitle: (value: string) => void;
  setFormDescription: (value: string) => void;
  setFormPrice: (value: string) => void;
  submitUpdate: () => Promise<void>;
  removeProduct: () => Promise<void>;
  updateStock: (delta: number) => Promise<void>;
};

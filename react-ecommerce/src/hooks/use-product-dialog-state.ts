import { useState } from 'react';
import type { Product } from '../types/product';
import type { ProductDialogForm } from '../types/product-dialog';

const initialForm: ProductDialogForm = {
  title: '',
  description: '',
  price: '',
};

export function useProductDialogState(): {
  open: boolean;
  product: Product | null;
  form: ProductDialogForm;
  errorMessage: string;
  openDialog: (product: Product) => void;
  closeDialog: () => void;
  setFormTitle: (value: string) => void;
  setFormDescription: (value: string) => void;
  setFormPrice: (value: string) => void;
  setErrorMessage: (value: string) => void;
  setProduct: React.Dispatch<React.SetStateAction<Product | null>>;
} {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductDialogForm>(initialForm);
  const [errorMessage, setErrorMessage] = useState('');

  function openDialog(p: Product): void {
    setProduct(p);
    setForm({
      title: p.title,
      description: p.description ?? '',
      price: String(p.price),
    });
    setErrorMessage('');
    setOpen(true);
  }

  function closeDialog(): void {
    setOpen(false);
    setProduct(null);
    setForm(initialForm);
    setErrorMessage('');
  }

  return {
    open,
    product,
    form,
    errorMessage,
    openDialog,
    closeDialog,
    setFormTitle: (value) => setForm((f) => ({ ...f, title: value })),
    setFormDescription: (value) => setForm((f) => ({ ...f, description: value })),
    setFormPrice: (value) => setForm((f) => ({ ...f, price: value })),
    setErrorMessage,
    setProduct,
  };
}

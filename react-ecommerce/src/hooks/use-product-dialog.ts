import { useProductDialogMutations } from './use-product-dialog-mutations';
import { useProductDialogState } from './use-product-dialog-state';
import type { UseProductDialogResult } from '../types/product-dialog';

export function useProductDialog(): UseProductDialogResult {
  const state = useProductDialogState();
  const mutations = useProductDialogMutations({
    product: state.product,
    form: state.form,
    closeDialog: state.closeDialog,
    setErrorMessage: state.setErrorMessage,
    setProduct: state.setProduct,
  });

  return {
    open: state.open,
    product: state.product,
    form: state.form,
    errorMessage: state.errorMessage,
    isUpdating: mutations.isUpdating,
    isDeleting: mutations.isDeleting,
    isUpdatingStock: mutations.isUpdatingStock,
    openDialog: state.openDialog,
    closeDialog: state.closeDialog,
    setFormTitle: state.setFormTitle,
    setFormDescription: state.setFormDescription,
    setFormPrice: state.setFormPrice,
    submitUpdate: mutations.submitUpdate,
    removeProduct: mutations.removeProduct,
    updateStock: mutations.updateStock,
  };
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Trash2 } from 'lucide-react';
import type { UseProductDialogResult } from '../types/product-dialog';

const UPDATE_BUTTON_CLASS_NAME =
  'bg-[oklch(0.606_0.25_292.717)] text-[oklch(1_0_0)] hover:opacity-90 dark:bg-[oklch(0.606_0.25_292.717)] dark:text-[oklch(0.985_0_0)]';

type ProductDialogProps = UseProductDialogResult;

export function ProductDialog({
  open,
  product,
  form,
  errorMessage,
  isUpdating,
  isDeleting,
  isUpdatingStock,
  closeDialog,
  setFormTitle,
  setFormDescription,
  setFormPrice,
  submitUpdate,
  removeProduct,
  updateStock,
}: ProductDialogProps): React.ReactElement {
  if (!product) return <></>;

  async function onUpdate(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await submitUpdate();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar producto</DialogTitle>
          <DialogDescription>
            Modifica los datos del producto o ajusta el stock.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onUpdate}>
          <div className="space-y-2">
            <Input
              value={form.title}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Titulo"
              required
            />
            <Input
              value={form.description}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Descripcion"
            />
            <Input
              value={form.price}
              onChange={(e) => setFormPrice(e.target.value)}
              placeholder="Precio"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Stock: {product.lastKnownStock}</span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void updateStock(1)}
              disabled={isUpdatingStock}
            >
              +1 stock
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void updateStock(-1)}
              disabled={isUpdatingStock}
            >
              -1 stock
            </Button>
          </div>
          {errorMessage ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => void removeProduct()}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
            <div className="flex flex-1 justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className={UPDATE_BUTTON_CLASS_NAME}
                disabled={isUpdating}
              >
                {isUpdating ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

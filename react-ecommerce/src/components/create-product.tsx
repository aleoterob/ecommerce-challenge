import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { ProductForm } from '../types/products-page';

const CREATE_BUTTON_CLASS_NAME =
  'w-full bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90 dark:bg-[var(--accent)] dark:text-[var(--accent-foreground-dark)] dark:hover:opacity-90';

export type CreateProductProps = {
  form: ProductForm;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setPrice: (value: string) => void;
  setInitialStock: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isCreating: boolean;
};

export function CreateProduct({
  form,
  setTitle,
  setDescription,
  setPrice,
  setInitialStock,
  onSubmit,
  isCreating,
}: CreateProductProps): React.ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Producto</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input
            value={form.title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Titulo"
            required
          />
          <Input
            value={form.description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descripcion"
          />
          <Input
            value={form.price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="Precio"
            type="number"
            min="0"
            step="0.01"
            required
          />
          <Input
            value={form.initialStock}
            onChange={(event) => setInitialStock(event.target.value)}
            placeholder="Stock inicial"
            type="number"
            min="0"
            step="1"
            required
          />
          <Button
            className={CREATE_BUTTON_CLASS_NAME}
            disabled={isCreating}
            type="submit"
          >
            {isCreating ? 'Creando...' : 'Crear'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

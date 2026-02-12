import { PackageSearch, Pencil } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { Product } from '../types/product';

const ACTIVE_BADGE_CLASS_NAME =
  'border-[oklch(0.606_0.25_292.717/0.5)] bg-[oklch(0.606_0.25_292.717)] text-[oklch(1_0_0)] dark:border-[oklch(0.606_0.25_292.717/0.5)] dark:bg-[oklch(0.606_0.25_292.717)] dark:text-[oklch(0.985_0_0)]';

export type CatalogProps = {
  products: Product[];
  totalStock: number;
  onUpdateStock: (productId: string, delta: number) => void;
  onEditProduct: (product: Product) => void;
  isUpdatingStock: boolean;
};

export function Catalog({
  products,
  totalStock,
  onUpdateStock,
  onEditProduct,
  isUpdatingStock,
}: CatalogProps): React.ReactElement {
  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="shrink-0 flex flex-row items-center justify-between space-y-0">
        <CardTitle>Catálogo</CardTitle>
        <Badge variant="secondary">Stock total: {totalStock}</Badge>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto">
        {products.length === 0 ? (
          <div className="flex items-center gap-2 text-slate-500">
            <PackageSearch className="h-4 w-4" />
            Sin productos cargados.
          </div>
        ) : null}

        <div className="space-y-3">
          {products.map((product) => (
            <article
              className="rounded-md border border-slate-200 bg-slate-50 p-3"
              key={product.id}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{product.title}</h2>
                  {product.description ? (
                    <p className="text-sm text-slate-500">
                      {product.description}
                    </p>
                  ) : null}
                  <p className="text-sm text-slate-600">
                    ${product.price.toFixed(2)} - Stock:{' '}
                    {product.lastKnownStock}
                  </p>
                </div>
                {product.isActive ? (
                  <Badge className={ACTIVE_BADGE_CLASS_NAME}>Activo</Badge>
                ) : (
                  <Badge>Inactivo</Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => void onUpdateStock(product.id, 1)}
                  disabled={isUpdatingStock}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  +1 stock
                </Button>
                <Button
                  onClick={() => void onUpdateStock(product.id, -1)}
                  disabled={isUpdatingStock}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  -1 stock
                </Button>
                <Button
                  onClick={() => onEditProduct(product)}
                  disabled={isUpdatingStock}
                  size="sm"
                  type="button"
                  variant="outline"
                  className="ml-auto gap-2"
                  aria-label={`Editar ${product.title}`}
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

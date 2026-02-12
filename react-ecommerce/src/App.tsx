import { useProductsPage } from './hooks/use-products-page';
import { Loader2, PackageSearch } from 'lucide-react';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';

const ACTIVE_BADGE_CLASS_NAME =
  'border-[oklch(0.606_0.25_292.717/0.5)] bg-[oklch(0.606_0.25_292.717)] text-[oklch(1_0_0)] dark:border-[oklch(0.606_0.25_292.717/0.5)] dark:bg-[oklch(0.606_0.25_292.717)] dark:text-[oklch(0.985_0_0)]';
const CREATE_BUTTON_CLASS_NAME =
  'w-full bg-[oklch(0.606_0.25_292.717)] text-[oklch(1_0_0)] hover:bg-[oklch(0.606_0.25_292.717)] hover:opacity-90 dark:bg-[oklch(0.606_0.25_292.717)] dark:text-[oklch(0.985_0_0)] dark:hover:bg-[oklch(0.606_0.25_292.717)]';

function App(): React.ReactElement {
  const {
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
  } = useProductsPage();

  async function onCreateProduct(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    await submitCreateProduct();
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Challenge Sr Fullstack (Microservicios)
          </h1>
          <p className="text-sm text-slate-600">
            Validacion end-to-end de flujos asincronicos con eventos.
          </p>
        </div>
        <Badge variant="secondary">Stock total: {totalStock}</Badge>
      </header>

      <section className="grid gap-4 md:grid-cols-[320px,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Crear Producto</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onCreateProduct}>
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
                disabled={isCreatingProduct}
                type="submit"
              >
                {isCreatingProduct ? 'Creando...' : 'Crear'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Catalogo</CardTitle>
          </CardHeader>
          <CardContent>
            {isInitialLoading ? (
              <div className="flex items-center gap-2 text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando productos...
              </div>
            ) : null}

            {!isInitialLoading && products.length === 0 ? (
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
                  <div className="flex gap-2">
                    <Button
                      onClick={() => void updateStock(product.id, 1)}
                      disabled={isUpdatingStock}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      +1 stock
                    </Button>
                    <Button
                      onClick={() => void updateStock(product.id, -1)}
                      disabled={isUpdatingStock}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      -1 stock
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {errorMessage ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </main>
  );
}

export default App;

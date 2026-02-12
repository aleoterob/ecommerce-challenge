import { useProductsPage } from './hooks/use-products-page';
import { useProductDialog } from './hooks/use-product-dialog';
import { ShoppingCart } from 'lucide-react';
import { Spinner } from './components/ui/spinner';
import { CreateProduct } from './components/create-product';
import { Catalog } from './components/catalog';
import { ProductDialog } from './components/product-dialog';

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

  const productDialog = useProductDialog();

  async function onCreateProduct(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    await submitCreateProduct();
  }

  if (isInitialLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Spinner className="size-8 text-slate-600" />
      </div>
    );
  }

  return (
    <main className="mx-auto flex h-screen max-w-5xl flex-col overflow-hidden p-6">
      <header className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex flex-row items-center gap-3">
            <ShoppingCart className="h-7 w-7 text-slate-900" />
            <h1 className="text-3xl font-bold text-slate-900">
              Challenge Sr Fullstack (Microservicios)
            </h1>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Validacion end-to-end de flujos asincronicos con eventos.
          </p>
        </div>
      </header>

      <section className="grid min-h-0 flex-1 gap-4 md:grid-cols-[320px,1fr]">
        <CreateProduct
          form={form}
          setTitle={setTitle}
          setDescription={setDescription}
          setPrice={setPrice}
          setInitialStock={setInitialStock}
          onSubmit={onCreateProduct}
          isCreating={isCreatingProduct}
        />

        <div className="min-h-0">
          <Catalog
            products={products}
            totalStock={totalStock}
            onUpdateStock={updateStock}
            onEditProduct={(p) => productDialog.openDialog(p)}
            isUpdatingStock={isUpdatingStock}
          />
        </div>
      </section>

      {errorMessage ? (
        <p className="mt-2 shrink-0 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <ProductDialog {...productDialog} />
    </main>
  );
}

export default App;

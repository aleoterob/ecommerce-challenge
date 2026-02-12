import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProductDialogMutations } from './use-product-dialog-mutations';
import * as api from '../lib/api';

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api');
  return {
    ...actual,
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    adjustStock: vi.fn(),
  };
});

const mockProduct = {
  id: 'p-1',
  title: 'Test Product',
  description: 'Desc',
  price: 10,
  isActive: true,
  lastKnownStock: 5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function createWrapper(): React.FC<{ children: React.ReactNode }> {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData(['products'], [mockProduct]);
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useProductDialogMutations', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('calls updateProduct when submitUpdate is invoked', async () => {
    const closeDialog = vi.fn();
    const setErrorMessage = vi.fn();
    const setProduct = vi.fn();
    vi.mocked(api.updateProduct).mockResolvedValue({
      ...mockProduct,
      title: 'Updated',
      description: 'New desc',
      price: 20,
    });

    const { result } = renderHook(
      () =>
        useProductDialogMutations({
          product: mockProduct,
          form: { title: 'Updated', description: 'New desc', price: '20' },
          closeDialog,
          setErrorMessage,
          setProduct,
        }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.submitUpdate();
    });

    expect(api.updateProduct).toHaveBeenCalledWith(
      'p-1',
      expect.objectContaining({
        title: 'Updated',
        description: 'New desc',
        price: 20,
      }),
    );
    expect(closeDialog).toHaveBeenCalled();
  });

  it('calls deleteProduct when removeProduct is invoked', async () => {
    const closeDialog = vi.fn();
    const setErrorMessage = vi.fn();
    const setProduct = vi.fn();
    vi.mocked(api.deleteProduct).mockResolvedValue();

    const { result } = renderHook(
      () =>
        useProductDialogMutations({
          product: mockProduct,
          form: { title: 'Test', description: '', price: '10' },
          closeDialog,
          setErrorMessage,
          setProduct,
        }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.removeProduct();
    });

    expect(api.deleteProduct).toHaveBeenCalledWith('p-1', expect.anything());
    expect(closeDialog).toHaveBeenCalled();
  });

  it('calls adjustStock when updateStock is invoked', async () => {
    const closeDialog = vi.fn();
    const setErrorMessage = vi.fn();
    const setProduct = vi.fn();
    vi.mocked(api.adjustStock).mockResolvedValue({
      productId: 'p-1',
      quantity: 6,
    });

    const { result } = renderHook(
      () =>
        useProductDialogMutations({
          product: mockProduct,
          form: { title: 'Test', description: '', price: '10' },
          closeDialog,
          setErrorMessage,
          setProduct,
        }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.updateStock(1);
    });

    expect(api.adjustStock).toHaveBeenCalledWith('p-1', 1);
  });
});

import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCreateProduct } from './use-create-product';
import * as api from '../lib/api';

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api');
  return {
    ...actual,
    createProduct: vi.fn(),
    adjustStock: vi.fn(),
  };
});

function createWrapper(): React.FC<{ children: React.ReactNode }> {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useCreateProduct', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('updates form fields when setters are called', () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useCreateProduct(onError), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setTitle('New Title');
    });
    expect(result.current.form.title).toBe('New Title');

    act(() => {
      result.current.setPrice('99');
    });
    expect(result.current.form.price).toBe('99');
  });

  it('calls createProduct and clears error on submit with zero stock', async () => {
    const onError = vi.fn();
    vi.mocked(api.createProduct).mockResolvedValue({
      id: 'p-new',
      title: 'Created',
      description: '',
      price: 50,
      isActive: true,
      lastKnownStock: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useCreateProduct(onError), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setTitle('Created');
      result.current.setPrice('50');
      result.current.setInitialStock('0');
    });

    await act(async () => {
      await result.current.submitCreateProduct();
    });

    expect(api.createProduct).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Created', price: 50 }),
      expect.anything(),
    );
    expect(onError).toHaveBeenCalledWith('');
    expect(api.adjustStock).not.toHaveBeenCalled();
  });

  it('calls adjustStock when initial stock is provided', async () => {
    const onError = vi.fn();
    vi.mocked(api.createProduct).mockResolvedValue({
      id: 'p-stock',
      title: 'With Stock',
      description: '',
      price: 10,
      isActive: true,
      lastKnownStock: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    vi.mocked(api.adjustStock).mockResolvedValue({
      productId: 'p-stock',
      quantity: 5,
    });

    const { result } = renderHook(() => useCreateProduct(onError), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setTitle('With Stock');
      result.current.setPrice('10');
      result.current.setInitialStock('5');
    });

    await act(async () => {
      await result.current.submitCreateProduct();
    });

    expect(api.adjustStock).toHaveBeenCalledWith('p-stock', 5);
  });
});

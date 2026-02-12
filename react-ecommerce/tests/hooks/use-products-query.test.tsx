import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProductsQuery } from '@/hooks/use-products-query';
import * as api from '@/lib/api';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return { ...actual, getProducts: vi.fn() };
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

describe('useProductsQuery', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns empty products and zero totalStock when loading', () => {
    vi.mocked(api.getProducts).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useProductsQuery(), {
      wrapper: createWrapper(),
    });

    expect(result.current.products).toEqual([]);
    expect(result.current.totalStock).toBe(0);
    expect(result.current.isInitialLoading).toBe(true);
  });

  it('returns products and totalStock after successful fetch', async () => {
    vi.mocked(api.getProducts).mockResolvedValue([
      {
        id: 'p-1',
        title: 'Product A',
        description: '',
        price: 10,
        isActive: true,
        lastKnownStock: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'p-2',
        title: 'Product B',
        description: '',
        price: 20,
        isActive: true,
        lastKnownStock: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    const { result } = renderHook(() => useProductsQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false);
    });

    expect(result.current.products).toHaveLength(2);
    expect(result.current.totalStock).toBe(5);
  });
});

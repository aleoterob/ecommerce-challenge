import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAdjustStock } from '@/hooks/use-adjust-stock';
import * as api from '@/lib/api';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return { ...actual, adjustStock: vi.fn() };
});

describe('useAdjustStock', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('calls adjustStock and updates cache optimistically', async () => {
    const onError = vi.fn();
    const products = [
      {
        id: 'p-1',
        title: 'Test',
        description: '',
        price: 10,
        isActive: true,
        lastKnownStock: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    vi.mocked(api.adjustStock).mockResolvedValue({
      productId: 'p-1',
      quantity: 5,
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(['products'], products);

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useAdjustStock(onError), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.updateStock('p-1', 1);
    });

    expect(api.adjustStock).toHaveBeenCalledWith('p-1', 1);
    const cached = queryClient.getQueryData<{ lastKnownStock: number }[]>(['products']);
    expect(cached?.[0]?.lastKnownStock).toBe(5);
  });

  it('calls onError when adjustStock fails', async () => {
    const onError = vi.fn();
    const products = [
      {
        id: 'p-1',
        title: 'Test',
        description: '',
        price: 10,
        isActive: true,
        lastKnownStock: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    vi.mocked(api.adjustStock).mockRejectedValue(new Error('Network error'));

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(['products'], products);

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useAdjustStock(onError), {
      wrapper: Wrapper,
    });

    await act(async () => {
      try {
        await result.current.updateStock('p-1', 1);
      } catch {
        // expected
      }
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Network error');
    });
  });
});

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import * as api from './lib/api';

vi.mock('./lib/api', async () => {
  const actual = await vi.importActual<typeof import('./lib/api')>('./lib/api');
  return {
    ...actual,
    getProducts: vi.fn(),
    createProduct: vi.fn(),
    adjustStock: vi.fn(),
  };
});

describe('App', () => {
  function renderWithQueryClient(): void {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );
  }

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders product list from API', async () => {
    vi.mocked(api.getProducts).mockResolvedValue([
      {
        id: 'p-1',
        title: 'Test Product',
        description: 'Desc',
        price: 20,
        isActive: true,
        lastKnownStock: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });

  it('creates a product and refreshes list', async () => {
    vi.mocked(api.getProducts).mockResolvedValue([]);
    vi.mocked(api.createProduct).mockResolvedValue({
      id: 'p-2',
      title: 'Created Product',
      description: '',
      price: 45,
      isActive: true,
      lastKnownStock: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    renderWithQueryClient();

    fireEvent.change(screen.getByPlaceholderText('Titulo'), {
      target: { value: 'Created Product' },
    });
    fireEvent.change(screen.getByPlaceholderText('Precio'), {
      target: { value: '45' },
    });
    fireEvent.change(screen.getByPlaceholderText('Stock inicial'), {
      target: { value: '0' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));

    await waitFor(() => {
      expect(api.createProduct).toHaveBeenCalled();
      expect(vi.mocked(api.createProduct).mock.calls[0]?.[0]).toEqual(
        expect.objectContaining({
          title: 'Created Product',
          price: 45,
        }),
      );
    });
  });

  it('creates a product with initial stock when provided', async () => {
    vi.mocked(api.getProducts).mockResolvedValue([]);
    vi.mocked(api.createProduct).mockResolvedValue({
      id: 'p-6',
      title: 'Created With Stock',
      description: '',
      price: 99,
      isActive: true,
      lastKnownStock: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    vi.mocked(api.adjustStock).mockResolvedValue({
      productId: 'p-6',
      quantity: 5,
    });

    renderWithQueryClient();

    fireEvent.change(screen.getByPlaceholderText('Titulo'), {
      target: { value: 'Created With Stock' },
    });
    fireEvent.change(screen.getByPlaceholderText('Precio'), {
      target: { value: '99' },
    });
    fireEvent.change(screen.getByPlaceholderText('Stock inicial'), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));

    await waitFor(() => {
      expect(api.createProduct).toHaveBeenCalled();
      expect(api.adjustStock).toHaveBeenCalledWith('p-6', 5);
      expect(
        screen.getByText(/\$99\.00 - Stock:\s*5/),
      ).toBeInTheDocument();
    });
  });

  it('keeps stock updated from mutation result without stale rollback', async () => {
    vi.mocked(api.getProducts)
      .mockResolvedValueOnce([
        {
          id: 'p-3',
          title: 'Stock Product',
          description: 'Desc',
          price: 10,
          isActive: true,
          lastKnownStock: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'p-3',
          title: 'Stock Product',
          description: 'Desc',
          price: 10,
          isActive: true,
          lastKnownStock: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

    vi.mocked(api.adjustStock).mockResolvedValue({
      productId: 'p-3',
      quantity: 5,
    });

    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByText('Stock Product')).toBeInTheDocument();
      expect(screen.getByText(/\$10\.00 - Stock:\s*4/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '+1 stock' }));

    await waitFor(() => {
      expect(api.adjustStock).toHaveBeenCalledWith('p-3', 1);
      expect(screen.getByText(/\$10\.00 - Stock:\s*5/)).toBeInTheDocument();
    });

    expect(api.getProducts).toHaveBeenCalledTimes(1);
  });

  it('does not visually decrease stock after +1 when API returns lower quantity', async () => {
    vi.mocked(api.getProducts).mockResolvedValueOnce([
      {
        id: 'p-4',
        title: 'Monotonic Product',
        description: 'Desc',
        price: 12,
        isActive: true,
        lastKnownStock: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    vi.mocked(api.adjustStock).mockResolvedValue({
      productId: 'p-4',
      quantity: 3,
    });

    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByText('Monotonic Product')).toBeInTheDocument();
      expect(screen.getByText(/\$12\.00 - Stock:\s*4/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '+1 stock' }));

    await waitFor(() => {
      expect(api.adjustStock).toHaveBeenCalledWith('p-4', 1);
      expect(screen.getByText(/\$12\.00 - Stock:\s*5/)).toBeInTheDocument();
    });
  });

  it('decreases only by one on -1 even if API returns zero', async () => {
    vi.mocked(api.getProducts).mockResolvedValueOnce([
      {
        id: 'p-5',
        title: 'Minus Product',
        description: 'Desc',
        price: 20,
        isActive: true,
        lastKnownStock: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    vi.mocked(api.adjustStock).mockResolvedValue({
      productId: 'p-5',
      quantity: 0,
    });

    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByText('Minus Product')).toBeInTheDocument();
      expect(screen.getByText(/\$20\.00 - Stock:\s*5/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '-1 stock' }));

    await waitFor(() => {
      expect(api.adjustStock).toHaveBeenCalledWith('p-5', -1);
      expect(screen.getByText(/\$20\.00 - Stock:\s*4/)).toBeInTheDocument();
    });
  });
});

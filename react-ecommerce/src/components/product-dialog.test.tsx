import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductDialog } from './product-dialog';

const mockProduct = {
  id: 'p-1',
  title: 'Test Product',
  description: 'Test description',
  price: 10,
  isActive: true,
  lastKnownStock: 5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const defaultProps = {
  open: true,
  product: mockProduct,
  form: { title: 'Test Product', description: 'Test description', price: '10' },
  errorMessage: '',
  isUpdating: false,
  isDeleting: false,
  isUpdatingStock: false,
  closeDialog: vi.fn(),
  setFormTitle: vi.fn(),
  setFormDescription: vi.fn(),
  setFormPrice: vi.fn(),
  submitUpdate: vi.fn().mockResolvedValue(undefined),
  removeProduct: vi.fn().mockResolvedValue(undefined),
  updateStock: vi.fn().mockResolvedValue(undefined),
};

describe('ProductDialog', () => {
  it('returns nothing when product is null', () => {
    render(
      <ProductDialog {...defaultProps} product={null} open={false} />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog with form when product is set', () => {
    render(<ProductDialog {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Editar producto' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Titulo')).toHaveValue('Test Product');
    expect(screen.getByPlaceholderText('Descripcion')).toHaveValue('Test description');
    expect(screen.getByPlaceholderText('Precio')).toHaveValue(10);
    expect(screen.getByText('Stock: 5')).toBeInTheDocument();
  });

  it('calls setters when form fields change', () => {
    const setFormTitle = vi.fn();
    const setFormDescription = vi.fn();
    const setFormPrice = vi.fn();

    render(
      <ProductDialog
        {...defaultProps}
        setFormTitle={setFormTitle}
        setFormDescription={setFormDescription}
        setFormPrice={setFormPrice}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Titulo'), {
      target: { value: 'New Title' },
    });
    expect(setFormTitle).toHaveBeenCalledWith('New Title');

    fireEvent.change(screen.getByPlaceholderText('Descripcion'), {
      target: { value: 'New desc' },
    });
    expect(setFormDescription).toHaveBeenCalledWith('New desc');

    fireEvent.change(screen.getByPlaceholderText('Precio'), {
      target: { value: '99' },
    });
    expect(setFormPrice).toHaveBeenCalledWith('99');
  });

  it('calls submitUpdate when Guardar is clicked', async () => {
    const submitUpdate = vi.fn().mockResolvedValue(undefined);

    render(<ProductDialog {...defaultProps} submitUpdate={submitUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await vi.waitFor(() => {
      expect(submitUpdate).toHaveBeenCalled();
    });
  });

  it('calls removeProduct when Eliminar is clicked', async () => {
    const removeProduct = vi.fn().mockResolvedValue(undefined);

    render(<ProductDialog {...defaultProps} removeProduct={removeProduct} />);

    fireEvent.click(screen.getByRole('button', { name: /Eliminar/i }));

    await vi.waitFor(() => {
      expect(removeProduct).toHaveBeenCalled();
    });
  });

  it('calls updateStock when +1 stock is clicked', () => {
    const updateStock = vi.fn().mockResolvedValue(undefined);

    render(<ProductDialog {...defaultProps} updateStock={updateStock} />);

    fireEvent.click(screen.getByRole('button', { name: '+1 stock' }));
    expect(updateStock).toHaveBeenCalledWith(1);
  });

  it('calls updateStock when -1 stock is clicked', () => {
    const updateStock = vi.fn().mockResolvedValue(undefined);

    render(<ProductDialog {...defaultProps} updateStock={updateStock} />);

    fireEvent.click(screen.getByRole('button', { name: '-1 stock' }));
    expect(updateStock).toHaveBeenCalledWith(-1);
  });

  it('calls closeDialog when Cancelar is clicked', () => {
    const closeDialog = vi.fn();

    render(<ProductDialog {...defaultProps} closeDialog={closeDialog} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(closeDialog).toHaveBeenCalled();
  });

  it('shows error message when errorMessage is set', () => {
    render(<ProductDialog {...defaultProps} errorMessage="Something went wrong" />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows loading state when isUpdating', () => {
    render(<ProductDialog {...defaultProps} isUpdating={true} />);

    expect(screen.getByRole('button', { name: 'Guardando...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardando...' })).toBeDisabled();
  });

  it('disables Eliminar when isDeleting', () => {
    render(<ProductDialog {...defaultProps} isDeleting={true} />);

    expect(screen.getByRole('button', { name: /Eliminar/i })).toBeDisabled();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CreateProduct } from './create-product';

const defaultForm = {
  title: '',
  description: '',
  price: '',
  initialStock: '',
};

describe('CreateProduct', () => {
  it('renders form fields and submit button', () => {
    render(
      <CreateProduct
        form={defaultForm}
        setTitle={vi.fn()}
        setDescription={vi.fn()}
        setPrice={vi.fn()}
        setInitialStock={vi.fn()}
        onSubmit={vi.fn()}
        isCreating={false}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Crear Producto' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Titulo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Descripcion')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Precio')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Stock inicial')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument();
  });

  it('shows loading state when isCreating is true', () => {
    render(
      <CreateProduct
        form={defaultForm}
        setTitle={vi.fn()}
        setDescription={vi.fn()}
        setPrice={vi.fn()}
        setInitialStock={vi.fn()}
        onSubmit={vi.fn()}
        isCreating={true}
      />,
    );

    expect(screen.getByRole('button', { name: 'Creando...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Creando...' })).toBeDisabled();
  });

  it('calls setters when form fields change', () => {
    const setTitle = vi.fn();
    const setDescription = vi.fn();
    const setPrice = vi.fn();
    const setInitialStock = vi.fn();

    render(
      <CreateProduct
        form={defaultForm}
        setTitle={setTitle}
        setDescription={setDescription}
        setPrice={setPrice}
        setInitialStock={setInitialStock}
        onSubmit={vi.fn()}
        isCreating={false}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Titulo'), {
      target: { value: 'New Product' },
    });
    expect(setTitle).toHaveBeenCalledWith('New Product');

    fireEvent.change(screen.getByPlaceholderText('Descripcion'), {
      target: { value: 'Description' },
    });
    expect(setDescription).toHaveBeenCalledWith('Description');

    fireEvent.change(screen.getByPlaceholderText('Precio'), {
      target: { value: '99' },
    });
    expect(setPrice).toHaveBeenCalledWith('99');

    fireEvent.change(screen.getByPlaceholderText('Stock inicial'), {
      target: { value: '5' },
    });
    expect(setInitialStock).toHaveBeenCalledWith('5');
  });

  it('calls onSubmit when form is submitted', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <CreateProduct
        form={{ ...defaultForm, title: 'A', price: '10', initialStock: '0' }}
        setTitle={vi.fn()}
        setDescription={vi.fn()}
        setPrice={vi.fn()}
        setInitialStock={vi.fn()}
        onSubmit={onSubmit}
        isCreating={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));

    await vi.waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});

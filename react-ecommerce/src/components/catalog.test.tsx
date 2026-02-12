import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Catalog } from './catalog';
import type { Product } from '../types/product';

const mockProduct: Product = {
  id: 'p-1',
  title: 'Test Product',
  description: 'Test description',
  price: 19.99,
  isActive: true,
  lastKnownStock: 5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const inactiveProduct: Product = {
  ...mockProduct,
  id: 'p-2',
  title: 'Inactive Product',
  isActive: false,
};

describe('Catalog', () => {
  it('renders empty state when no products', () => {
    render(
      <Catalog
        products={[]}
        totalStock={0}
        onUpdateStock={vi.fn()}
        onEditProduct={vi.fn()}
        isUpdatingStock={false}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Catálogo' })).toBeInTheDocument();
    expect(screen.getByText('Sin productos cargados.')).toBeInTheDocument();
    expect(screen.getByText('Stock total: 0')).toBeInTheDocument();
  });

  it('renders product list with total stock badge', () => {
    render(
      <Catalog
        products={[mockProduct]}
        totalStock={5}
        onUpdateStock={vi.fn()}
        onEditProduct={vi.fn()}
        isUpdatingStock={false}
      />,
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText(/\$19\.99 - Stock: 5/)).toBeInTheDocument();
    expect(screen.getByText('Stock total: 5')).toBeInTheDocument();
  });

  it('shows Activo badge for active products and Inactivo for inactive', () => {
    render(
      <Catalog
        products={[mockProduct, inactiveProduct]}
        totalStock={5}
        onUpdateStock={vi.fn()}
        onEditProduct={vi.fn()}
        isUpdatingStock={false}
      />,
    );

    const badges = screen.getAllByText(/Activo|Inactivo/);
    expect(badges).toHaveLength(2);
    expect(badges[0]).toHaveTextContent('Activo');
    expect(badges[1]).toHaveTextContent('Inactivo');
  });

  it('calls onUpdateStock when +1 stock is clicked', () => {
    const onUpdateStock = vi.fn();

    render(
      <Catalog
        products={[mockProduct]}
        totalStock={5}
        onUpdateStock={onUpdateStock}
        onEditProduct={vi.fn()}
        isUpdatingStock={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '+1 stock' }));
    expect(onUpdateStock).toHaveBeenCalledWith('p-1', 1);
  });

  it('calls onUpdateStock when -1 stock is clicked', () => {
    const onUpdateStock = vi.fn();

    render(
      <Catalog
        products={[mockProduct]}
        totalStock={5}
        onUpdateStock={onUpdateStock}
        onEditProduct={vi.fn()}
        isUpdatingStock={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '-1 stock' }));
    expect(onUpdateStock).toHaveBeenCalledWith('p-1', -1);
  });

  it('calls onEditProduct when Editar button is clicked', () => {
    const onEditProduct = vi.fn();

    render(
      <Catalog
        products={[mockProduct]}
        totalStock={5}
        onUpdateStock={vi.fn()}
        onEditProduct={onEditProduct}
        isUpdatingStock={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Editar Test Product' }));
    expect(onEditProduct).toHaveBeenCalledWith(mockProduct);
  });

  it('disables stock buttons when isUpdatingStock is true', () => {
    render(
      <Catalog
        products={[mockProduct]}
        totalStock={5}
        onUpdateStock={vi.fn()}
        onEditProduct={vi.fn()}
        isUpdatingStock={true}
      />,
    );

    expect(screen.getByRole('button', { name: '+1 stock' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '-1 stock' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Editar Test Product' })).toBeDisabled();
  });
});

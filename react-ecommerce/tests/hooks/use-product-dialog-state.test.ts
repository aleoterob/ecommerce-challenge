import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useProductDialogState } from '@/hooks/use-product-dialog-state';

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

describe('useProductDialogState', () => {
  it('starts with closed state and null product', () => {
    const { result } = renderHook(() => useProductDialogState());

    expect(result.current.open).toBe(false);
    expect(result.current.product).toBeNull();
    expect(result.current.form.title).toBe('');
    expect(result.current.errorMessage).toBe('');
  });

  it('opens dialog and populates form when openDialog is called', () => {
    const { result } = renderHook(() => useProductDialogState());

    act(() => {
      result.current.openDialog(mockProduct);
    });

    expect(result.current.open).toBe(true);
    expect(result.current.product).toEqual(mockProduct);
    expect(result.current.form.title).toBe('Test Product');
    expect(result.current.form.description).toBe('Desc');
    expect(result.current.form.price).toBe('10');
  });

  it('resets state when closeDialog is called', () => {
    const { result } = renderHook(() => useProductDialogState());

    act(() => {
      result.current.openDialog(mockProduct);
    });
    act(() => {
      result.current.closeDialog();
    });

    expect(result.current.open).toBe(false);
    expect(result.current.product).toBeNull();
    expect(result.current.form.title).toBe('');
  });

  it('updates form fields when setters are called', () => {
    const { result } = renderHook(() => useProductDialogState());

    act(() => {
      result.current.openDialog(mockProduct);
      result.current.setFormTitle('New Title');
    });
    expect(result.current.form.title).toBe('New Title');

    act(() => {
      result.current.setFormPrice('99');
    });
    expect(result.current.form.price).toBe('99');
  });
});

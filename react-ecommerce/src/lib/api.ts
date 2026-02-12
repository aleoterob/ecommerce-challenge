import type {
  AdjustStockResponse,
  CreateProductPayload,
  Product,
  ProductApiResponse,
} from '../types/product';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function normalizeProduct(product: ProductApiResponse): Product {
  return {
    ...product,
    price: typeof product.price === 'string' ? Number(product.price) : product.price,
  };
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products`);
  const data = await parseJson<ProductApiResponse[]>(response);
  return data.map(normalizeProduct);
}

export async function createProduct(
  payload: CreateProductPayload,
): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseJson<ProductApiResponse>(response);
  return normalizeProduct(data);
}

export async function adjustStock(
  productId: string,
  delta: number,
): Promise<AdjustStockResponse> {
  const response = await fetch(`${API_BASE_URL}/inventory/adjust`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, delta }),
  });
  return parseJson<AdjustStockResponse>(response);
}

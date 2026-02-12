import type {
  AdjustStockResponse,
  CreateProductPayload,
  Product,
  ProductApiResponse,
  UpdateProductPayload,
} from '../types/product';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function parseErrorMessage(text: string): string {
  try {
    const json = JSON.parse(text) as { message?: string };
    return json.message ?? text;
  } catch {
    return text;
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(parseErrorMessage(text) || `Request failed: ${response.status}`);
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

export async function updateProduct(
  productId: string,
  payload: UpdateProductPayload,
): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseJson<ProductApiResponse>(response);
  return normalizeProduct(data);
}

export async function deleteProduct(productId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(parseErrorMessage(text) || `Request failed: ${response.status}`);
  }
}

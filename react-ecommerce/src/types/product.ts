export type Product = {
  id: string;
  title: string;
  description?: string;
  price: number;
  isActive: boolean;
  lastKnownStock: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductApiResponse = Omit<Product, 'price'> & {
  price: number | string;
};

export type CreateProductPayload = {
  title: string;
  description?: string;
  price: number;
  isActive?: boolean;
};

export type UpdateProductPayload = {
  title?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
};

export type AdjustStockPayload = {
  productId: string;
  delta: number;
};

export type AdjustStockResponse = {
  productId: string;
  quantity: number;
};

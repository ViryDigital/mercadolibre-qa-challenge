export type Product = {
  name: string;
  price: number;
};

export type NormalizedProduct = {
  originalName: string;
  normalizedName: string;
  price: number;
};

export function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizePrice(priceText: string): number {
  const cleanPrice = priceText
    .replace(/[^\d.]/g, '')
    .trim();

  return Number(cleanPrice);
}

export function normalizeProduct(product: Product): NormalizedProduct {
  return {
    originalName: product.name,
    normalizedName: normalizeProductName(product.name),
    price: product.price,
  };
}

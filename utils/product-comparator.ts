import { Product, normalizeProductName } from './product-normalizer';

export type ProductMatch = {
  uiProduct: Product;
  apiProduct?: Product;
  matched: boolean;
  reason?: string;
  nameSimilarityScore?: number;
  priceDifference?: number;
};

const STOP_WORDS = new Set([
  'con',
  'y',
  'de',
  'del',
  'la',
  'el',
  'los',
  'las',
  'para',
  'edition',
  'edicion',
  'libres',
]);

export function compareProducts(uiProducts: Product[], apiProducts: Product[]): ProductMatch[] {
  const usedApiIndexes = new Set<number>();

  return uiProducts.map((uiProduct) => {
    const candidates = apiProducts
      .map((apiProduct, index) => ({
        apiProduct,
        index,
        score: calculateNameSimilarity(uiProduct.name, apiProduct.name),
      }))
      .filter((candidate) => !usedApiIndexes.has(candidate.index))
      .filter((candidate) => candidate.score >= 3)
      .sort((a, b) => b.score - a.score);

    const bestCandidate = candidates[0];

    if (!bestCandidate) {
      return {
        uiProduct,
        matched: false,
        reason: 'Product name was not found in API results',
      };
    }

    usedApiIndexes.add(bestCandidate.index);

    const priceDifference = uiProduct.price - bestCandidate.apiProduct.price;

    return {
      uiProduct,
      apiProduct: bestCandidate.apiProduct,
      matched: true,
      nameSimilarityScore: bestCandidate.score,
      priceDifference,
      reason:
        priceDifference === 0
          ? undefined
          : `Price difference. UI: ${uiProduct.price}, API: ${bestCandidate.apiProduct.price}`,
    };
  });
}

export function countMatches(matches: ProductMatch[]): number {
  return matches.filter((match) => match.matched).length;
}

export function getDiscrepancies(matches: ProductMatch[]): ProductMatch[] {
  return matches.filter((match) => !match.matched || match.priceDifference !== 0);
}

function calculateNameSimilarity(uiName: string, apiName: string): number {
  const normalizedUiName = normalizeForComparison(uiName);
  const normalizedApiName = normalizeForComparison(apiName);

  if (
    normalizedApiName.includes(normalizedUiName) ||
    normalizedUiName.includes(normalizedApiName)
  ) {
    return 100;
  }

  const uiTokens = tokenize(normalizedUiName);
  const apiTokens = tokenize(normalizedApiName);

  const commonTokens = uiTokens.filter((token) => apiTokens.includes(token));
  const hasPlayStationMatch =
    (uiTokens.includes('ps5') && apiTokens.includes('ps5')) ||
    (uiTokens.includes('playstation') && apiTokens.includes('playstation'));

  return commonTokens.length + (hasPlayStationMatch ? 2 : 0);
}

function normalizeForComparison(name: string): string {
  return normalizeProductName(name)
    .replace(/\bplaystation\s+5\b/g, 'ps5')
    .replace(/\bastrobot\b/g, 'astro bot');
}

function tokenize(name: string): string[] {
  return name
    .split(' ')
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => token.length > 1)
    .filter((token) => !STOP_WORDS.has(token));
}

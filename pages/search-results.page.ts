import { expect, Locator, Page } from '@playwright/test';
import { Product, normalizePrice } from '../utils/product-normalizer';

export class SearchResultsPage {
  constructor(private readonly page: Page) {}

  private get productCards(): Locator {
    return this.page.locator(
      'li.ui-search-layout__item, .ui-search-result__wrapper, .poly-card'
    );
  }

  async waitForResults(): Promise<void> {
    await this.ensurePageIsNotBlocked();
    await expect(this.productCards.first()).toBeVisible();
  }

  async filterByCondition(condition: string): Promise<void> {
    await this.clickFirstAvailableFilterLink([condition]);
  }

  async filterByLocation(locationOptions: string[]): Promise<void> {
    const locationWasApplied = await this.tryNavigateToFirstAvailableFilterLink(locationOptions);

    if (!locationWasApplied) {
      console.warn(
        `El filtro de ubicación no estuvo disponible en los resultados actuales de MercadoLibre. Opciones esperadas: ${locationOptions.join(
          ', '
        )}`
      );
    }
  }

  async sortByLowestPrice(): Promise<void> {
    const sortCombobox = this.page
      .getByRole('combobox', { name: /Más relevantes|Relevancia/i })
      .first();

    await expect(sortCombobox).toBeVisible();
    await sortCombobox.click();

    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');

    await this.waitForResults();
  }

  async getFirstProducts(limit: number): Promise<Product[]> {
    await this.waitForResults();

    const totalCards = await this.productCards.count();
    const products: Product[] = [];

    for (let index = 0; index < totalCards && products.length < limit; index++) {
      const card = this.productCards.nth(index);

      const name = await this.getFirstAvailableText(card, [
        'a.poly-component__title',
        '.poly-component__title',
        '.ui-search-item__title',
        'h2',
        'h3',
        '[class*="title"]',
      ]);

      const priceText = await this.getFirstAvailableText(card, [
        '.andes-money-amount__fraction',
        '[class*="price"] .andes-money-amount__fraction',
        '[class*="money"]',
      ]);

      const price = normalizePrice(priceText);

      const productKey = `${name}-${price}`;

      const isDuplicated = products.some(
        (product) => `${product.name}-${product.price}` === productKey
      );

      if (name && price > 0 && !isDuplicated) {
        products.push({
          name,
          price,
        });
      }
    }

    expect(
      products.length,
      `Se esperaban al menos ${limit} products, but found ${products.length}`
    ).toBeGreaterThanOrEqual(limit);

    return products.slice(0, limit);
  }

  private async tryNavigateToFirstAvailableFilterLink(filterNames: string[]): Promise<boolean> {
    for (const filterName of filterNames) {
      const filterLink = this.page
        .getByRole('link', { name: new RegExp(filterName, 'i') })
        .first();

      if (await filterLink.count()) {
        const href = await filterLink.getAttribute('href');

        if (!href) {
          continue;
        }

        await this.page.goto(href, { waitUntil: 'domcontentloaded' });
        await this.waitForResults();

        return true;
      }
    }

    return false;
  }

  private async clickFirstAvailableFilterLink(filterNames: string[]): Promise<void> {
    const wasApplied = await this.tryNavigateToFirstAvailableFilterLink(filterNames);

    if (!wasApplied) {
      throw new Error(`No se encontró ninguna de las opciones de filtro: ${filterNames.join(', ')}`);
    }
  }

  private async getFirstAvailableText(parent: Locator, selectors: string[]): Promise<string> {
    for (const selector of selectors) {
      const locator = parent.locator(selector).first();

      if (await locator.count()) {
        const text = await locator.innerText();

        if (text.trim()) {
          return text.trim();
        }
      }
    }

    return '';
  }

  private async ensurePageIsNotBlocked(): Promise<void> {
    const currentUrl = this.page.url();

    if (currentUrl.includes('/account-verification')) {
      throw new Error(
        `MercadoLibre redirigió a verificación de cuenta. URL actual: ${currentUrl}`
      );
    }
  }
}
